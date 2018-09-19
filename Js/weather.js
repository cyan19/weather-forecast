//用百度地图API获得当前所在城市
var map = new BMap.Map('container');
var cityName;  //存储城市信息
var time;      //存储网页刷新时间
var week =[];  //存储接下来一周的温度
var Label = [];//存储接下来一周的名称（周一、周二）
var High = []; //存储最高气温
var Low = [];  //存储最低气温
var collection=[
    "晴",
    "多云",
    "阴",
    "阵雨",
    "雷阵雨",
    "雷阵雨伴冰雹",
    "雨夹雪",
    "小雨",
    "中雨",
    "大雨",
    "暴雨",
    "大暴雨",
    "特大暴雨",
    "阵雪",
    "小雪",
    "中雪",
    "大雪",
    "暴雪",
    "雾",
    "冻雨",
    "沙尘暴",
    "小雨转中雨",
    "中雨转大雨",
    "大雨转暴雨",
    "暴雨转大暴雨",
    "大暴雨转特大暴雨",
    "小雪转中雪",
    "中雪转大雪",
    "大雪转暴雪",
    "浮尘",
    "扬沙",
    "强沙尘暴",
    "霾"
];
map.centerAndZoom(new BMap.Point(120.19, 30.26), 10);  // 初始化地图,设置中心点坐标和地图级别
var myCity = new BMap.LocalCity();
function myFun(result){
    if(result){
        cityName = result.name.replace('市', '');
        map.setCenter(cityName);
        map.setCurrentCity(cityName);          // 设置地图显示的城市 此项是必须设置的
        map.clearOverlays();
        alert("城市定位在 "+cityName)
    }else{
        alert("获取城市失败")
    }


}
myCity.get(myFun);
map.addControl(new BMap.MapTypeControl());   //添加地图类型控件
map.enableScrollWheelZoom(true);     //开启鼠标滚轮缩放

//获取当前时间，并格式化输出
function getNowFormatDate() {
    var date = new Date();
    var seperator1 = "-";
    var seperator2 = ":";
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    return date.getFullYear() + seperator1 + month + seperator1 + strDate
        + " " + date.getHours() + seperator2 + date.getMinutes()
        + seperator2 + date.getSeconds();
}
//动态创建script标签
function get_data(url){
	var script = document.createElement('script');
	script.src = url;
	document.body.append(script);
	document.body.removeChild(script);
}
time = getNowFormatDate();
document.querySelector('.update_time').innerHTML = time;
//设置延时，因为获得当前城市所在地是异步的
setTimeout(function(){
	var urls = [];
	//获取当天天气信息
	urls[0] = 'https://sapi.k780.com/?app=weather.today&appkey=36625&sign=578fdc28db2c32a1d6f048492715b470&format=json&jsoncallback=getTodayWeather&weaid=' + encodeURI(cityName);
    //获取当天生活指数
    urls[1] = 'https://sapi.k780.com/?app=weather.lifeindex&appkey=36625&sign=578fdc28db2c32a1d6f048492715b470&format=json&jsoncallback=getTodayLifeIndex&weaid=' + encodeURI(cityName);
	//获取七天天气信息
	urls[2] = 'https://sapi.k780.com/?app=weather.future&appkey=36625&sign=578fdc28db2c32a1d6f048492715b470&format=json&jsoncallback=getWeather_week&weaid=' + encodeURI(cityName);
    get_data(urls[0]);  //jsonp跨域请求
    get_data(urls[1]);  //jsonp跨域请求
    get_data(urls[2]);  //jsonp跨域请求

}, 1000);


//从json文件中获取的图标信息提取图片索引
function findbetween(Label,s){
    var index =10000;
    for(var i=s.length -1;i>=0;i--){
        if(s[i] === Label){
            index = i + 1;
            break;
        }
    }
    return s.slice(index , s.length -4);
}
//获得今天的天气， 解析json数据，写入DOM
function getTodayWeather(response){
    var doc = document;
    doc.querySelector('.place').innerHTML = response.result.citynm;
    var today = response.result;
    var daypic = doc.getElementById('day-pic');
    var weatherspan = doc.querySelector('.weather-mess');
    var span = weatherspan.getElementsByTagName('span');
    var temp = findbetween('/',today.weather_icon);
    daypic.src = "images/"+collection[temp]+".svg";
    span[0].innerHTML = today.weather;
    span[1].innerHTML = today.wind;
    span[2].innerHTML = today.temperature;
    span[3].innerHTML = "PM 2.5指数："+today.aqi;
    map.centerAndZoom(cityName,10);      // 用城市名设置地图中心点
    map.clearOverlays();

}

//获得今天生活指数
function getTodayLifeIndex(response){
    var doc = document;
    var p = doc.getElementsByTagName('code');
    var warmtips = response.result[0];
    var p0 = warmtips.lifeindex_uv_attr + " " +  warmtips.lifeindex_uv_dese;
    var p1 = warmtips.lifeindex_ct_attr + " " +  warmtips.lifeindex_ct_dese;
    var p2 = warmtips.lifeindex_xc_attr + " " +  warmtips.lifeindex_xc_dese;
    if(p0 !== " ")
        p[0].innerHTML = p0;
    else
        p[0].innerHTML = "暂无数据";
    if(p1 !== " ")
        p[1].innerHTML = p1;
    else
        p[1].innerHTML = "暂无数据";
    if(p2 !== " ")
        p[2].innerHTML = p2;
    else
        p[2].innerHTML = "暂无数据";

}

//获得这一周的天气， 解析json
function getWeather_week(response) {
    var result = response.result;
    var doc = document;
    var item = doc.querySelectorAll('.item');
    var i = 0;
    for (var index in result){
        var temp = findbetween('/',result[index].weather_icon);
        item[i].getElementsByTagName('img')[0].src = "images/"+collection[temp]+".svg";
        var mess = item[i].querySelector('.item-mess').getElementsByTagName('div');
        mess[0].innerHTML = result[index].weather;
        mess[1].innerHTML = result[index].temperature;
        week[i] = result[index].temperature;
        mess[2].innerHTML = result[index].winp;
        var span = mess[3].getElementsByTagName('span');
        span[0].innerHTML = result[index].days;
        Label[i] = result[index].week;
        span[1].innerHTML = result[index].week;
        High[i] = result[index].temp_high;
        Low[i] = result[index].temp_low;
        i++;
    }

    //表格
    var ctx = document.getElementById("myChart").getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'line',
        data: {

            labels: Label,
            datasets: [{
                label: '最低温度',
                data: Low ,
                backgroundColor: 'rgba(54, 162, 235, 1)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 3,
                fill:false
            }, {
                label: '最高温度',
                data: High,
                backgroundColor: 'rgba(255,99,132,1)',
                borderColor: 'rgba(255,99,132,1)',

                borderWidth: 3,
                fill:false
            }]
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: '温度变化曲线',
                fontSize: 20
            },
            animation: {
                duration: 0, // general animation time
            },
            hover: {
                animationDuration: 0, // duration of animations when hovering an item
            },
            scales: {
                xAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Weekdays'
                    }

                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Temperature(℃)'
                    },
                    ticks: {
                        beginAtZero:true
                    }
                }]
            }
        }
    });


}
//添加事件，查询天气
document.getElementById('search').addEventListener('click', function (){
    var newcityName = document.getElementById('input-weather').value;
    if (newcityName != ''){
        cityName = newcityName;
        var urls = [];
        //获取当天天气信息
        urls[0] = 'https://sapi.k780.com/?app=weather.today&appkey=36625&sign=578fdc28db2c32a1d6f048492715b470&format=json&jsoncallback=getTodayWeather&weaid=' + encodeURI(cityName);
        //获取当天生活指数
        urls[1] = 'https://sapi.k780.com/?app=weather.lifeindex&appkey=36625&sign=578fdc28db2c32a1d6f048492715b470&format=json&jsoncallback=getTodayLifeIndex&weaid=' + encodeURI(cityName);
        //获取七天天气信息
        urls[2] = 'https://sapi.k780.com/?app=weather.future&appkey=36625&sign=578fdc28db2c32a1d6f048492715b470&format=json&jsoncallback=getWeather_week&weaid=' + encodeURI(cityName);
        get_data(urls[0]);  //jsonp跨域请求
        get_data(urls[1]);  //jsonp跨域请求
        get_data(urls[2]);  //jsonp跨域请求
    }
    }, true);

document.getElementById('refreshes').addEventListener('click', function (){
    var urls = [];
    //获取当天天气信息
    urls[0] = 'https://sapi.k780.com/?app=weather.today&appkey=36625&sign=578fdc28db2c32a1d6f048492715b470&format=json&jsoncallback=getTodayWeather&weaid=' + encodeURI(cityName);
    //获取当天生活指数
    urls[1] = 'https://sapi.k780.com/?app=weather.lifeindex&appkey=36625&sign=578fdc28db2c32a1d6f048492715b470&format=json&jsoncallback=getTodayLifeIndex&weaid=' + encodeURI(cityName);
    //获取七天天气信息
    urls[2] = 'https://sapi.k780.com/?app=weather.future&appkey=36625&sign=578fdc28db2c32a1d6f048492715b470&format=json&jsoncallback=getWeather_week&weaid=' + encodeURI(cityName);
    get_data(urls[0]);  //jsonp跨域请求
    get_data(urls[1]);  //jsonp跨域请求
    get_data(urls[2]);  //jsonp跨域请求
    time = getNowFormatDate();
    document.querySelector('.update_time').innerHTML = time;
}, true);
