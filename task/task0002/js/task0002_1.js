function init(){
    var btn = $("#button");
    $.click(btn, listener);
}

function listener(event) {
    clean();
    var arr = $("[name=hobby]")[0].value.split(/(\r\n|\s|[\u3000]|\,|[\uff0c]|\;|[\uff64])+/g);
//    each(arr, filter);  //使空格项为空
    arr = uniqArray(arr); //去掉重复项

    show(arr);

}

function show(arr) {
    each(arr, function(item, i) {
        if(item.length > 0 && !/^\s+$/g.test(item)) {
            $("#show-hobby").innerHTML += "<span>" + item + "</span>" + "<br>"; 
        }
    })
}

function clean() {
    $("#show-hobby").innerHTML = "";
}

// function filter(item) {
//     item = trim(item);
// } 

window.onload = init;
