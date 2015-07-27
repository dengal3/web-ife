function init() {
    var dotBar = $(".dots")[0];
    $.delegateEvent(dotBar, 'li', 'click', listener);
}

function listener(target) {
        
}

function ScrollBox(order, cycle, speed) {
    this.order = order;
    this.cycle = cycle;
    this.speed = speed;
}

ScrollBox.prototype = function() {
    var constructor = ScrollBox;
    var flag = 1;   // flag是否在自动状态
    var currentScrollNum = 0;  //现在显示的页面number
    var run = function() {
        console.log("run begin");
        var order = this.order != undefined && this.order? false: true;
        var cycle = this.cycle != undefined && this.cycle? false: true;
        var speed = this.speed || 3000;
        
        console.log(order, cycle, speed);
        currentScrollNum = order? currentScrollNum+1: currentScrollNum-1;
        if (cycle) {
            if (currentScrollNum >= 5) currentScrollNum = 0;
            else if (currentScrollNum <= -1) currentScrollNum = 4;
        } else {
            if (currentScrollNum >= 5) currentScrollNum = 4;
            else if (currentScrollNum <= -1) currentScrollNum =0;
            flag = 0; //停止自动状态
        }

        scrollTool.scrollToTarget(currentScrollNum)();
        if (flag)
            setTimeout(run, speed);
        else
            return;
    };

    var setOrder = function(order) {
        this.order = order;
    };

    var setCycle = function(cycle) {
        this.cycle = cycle;
    };

    var setSpeed = function(speed) {
        this.speed = speed;
    }
    var scrollTool = function() {
        var scrollToTarget = function(targetNum) {
            return function() {
                var scrollBox = $("#scroll-box");
                var currentPos = scrollBox.scrollLeft;
                var endPos = targetNum * $(".pic")[0].clientWidth;

                currentPos += Math.floor((endPos-currentPos)/4) || (endPos-currentPos)%4;
                scrollBox.scrollLeft = currentPos;
                console.log(scrollBox.scrollLeft);

                if (currentPos != endPos) {
                    setTimeout(scrollToTarget(targetNum), 40);
                }
            }
        };

        return {
            scrollToTarget: scrollToTarget
        };
    }();

    return {
        constructor: constructor,
        run: run,
        setOrder: setOrder,
        setCycle: setCycle,
        setSpeed: setSpeed
    };
}();

    


window.onload = test;

function test() {
    var box = new ScrollBox();
    box.run();
}