// Author: dengailin
// Date: 2015/7/20
// Description: basic javascript implement



// 判断arr是否为一个数组，返回一个bool值
function isArray(arr) {
    return arr.constructor === Array;
}


// 判断fn是否为一个函数，返回一个bool值
function isFuncation(func) {
    return func.constructor === Function;
}


// 使用递归来实现一个深度克隆，可以复制一个目标对象，返回一个完整拷贝
// 被复制的对象类型会被限制为数字、字符串、布尔、日期、数组、Object对象。不会包含函数、正则对象
function cloneObject(src) {
    var result = {};

    if(isArray(src)) {
        result = src.slice(0);
    } else if (typeof src === "object") {
        for(var key in src) {
            result[key] = typeof src[key] === "object"? cloneObject(src[key]): src[key];
        }
    } else {
        result = src;
    }

    return result;
}

// 对数组进行去重操作，只考虑数组中元素为数字或字符串，返回一个去重后的数组
function uniqArray(arr) {
    var result = [];

    //效率低
    // for(var i = 0; i < arr.length; i++) {
    //     var flag = 1;
    //     for(var j = 0 ; j < result.length; j++) {
    //         if(arr[i] == result[j]) 
    //             flag = 0;
    //     }

    //     if(flag)
    //         result.push(arr[i]);
    // }

    //推荐方法
    var hash = {};

    for(var i = 0; i < arr.length; i++) {
        var item = arr[i];

        if(!hash[item]) {
            result.push(item);
            hash[item] = 1;
        }
    }

    return result;
}

// 对字符串头尾进行空格字符的去除、包括全角半角空格、Tab等，返回一个字符串
// 尝试使用一行简洁的正则表达式完成该题目
function trim(str) {
    return str.replace(/^\s+|\s+$/g, '');
}

// 实现一个遍历数组的方法，针对数组中每一个元素执行fn函数，并将数组索引和元素作为参数传递
function each(arr, fn) {
    for(var i = 0; i < arr.length; i++) {
        fn(arr[i], i);
    }
}

// 获取一个对象里面第一层元素的数量，返回一个整数
function getObjectLength(obj) {
    var count = 0;
    for(var key in obj) {
        count++;
    }

    return count;
}

// 判断是否为邮箱地址
function isEmail(emailStr) {
    return /^(\w|\d)*@(\w|\d)+.(\w)*$/g.test(emailStr);
}

// 判断是否为手机号
function isMobilePhone(phone) {
    return /^\d{11}$/g.test(phone);
}

// 为element增加一个样式名为newClassName的新样式
function addClass(elem, newClassName) {
    var className = elem.className;
    console.log(className);
    if (className.indexOf(newClassName) == -1) {
        className += className === ""? newClassName: " "+newClassName;
    }

    elem.className = className;
}

// 移除element中的样式oldClassName
function removeClass(elem, oldClassName) {
    var className = elem.className;

    if (className.indexOf(oldClassName) != -1) {
        className = className.replace(" "+oldClassName, "").replace(oldClassName, "");
    }

    elem.className = className;
}

// 判断siblingNode和element是否为同一个父元素下的同一级的元素，返回bool值
function isSiblingNode(element, siblingNode) {
    var siblings = element.parentNode.childNodes;

    for(var i = 0; i < siblings.length; i++) {
        if (siblings[i] === siblingNode)
            return true;
    }

    return false;
}

// 获取element相对于浏览器窗口的位置，返回一个对象{x, y}
function getPosition(element) {
    var x = 0, y = 0;
    var current = element;

    while(current != null) {
        x += current.offsetLeft;
        y += current.offsetTop;
        current = current.offsetParent;
    }

    return {x: x, y: y};
}