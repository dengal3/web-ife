function init(){
    var btn = $("#button");
    $.click(btn, listener);
}

var startTime;
function listener(event) {
    clean();
    var dateArr = $("[name=date]")[0].value.split('-'),
    year = Number(dateArr[0]),
    month = Number(dateArr[1]),
    day = Number(dateArr[2]);
    startTime = (new Date(year, month-1, day) - new Date())/1000;  //startTime in seconds
    countDown(startTime)(); 
}

function countDown(leftTime) {
    return function() {
        leftTime--;
        show(leftTime);
        if (!leftTime) {
            alert("time is up");
            return; 
        }
        setTimeout(countDown(leftTime), 1000);
    }
}

function show(leftTime) {
    var days = Math.floor(leftTime/(24*3600)),
        hours = Math.floor((leftTime-days*24*3600)/3600),
        minutes = Math.floor((leftTime-days*24*3600-hours*3600)/60);
        seconds = Math.floor((leftTime-days*24*3600-hours*3600-minutes*60));
        console.log(days);
    $("#show-leftTime").innerHTML = days + "日"
                                 + hours + "时"
                                 + minutes + "分钟"
                                 + seconds + "秒";
}

function clean() {
    $("#show-leftTime").innerHTML = "";
}

// function filter(item) {
//     item = trim(item);
// } 

window.onload = init;