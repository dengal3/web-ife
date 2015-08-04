var Catergory = function(name) {
    this.name = name;
    this.subcatergory = [];
    this.amount = 0;
}

var SubCatergory = function(name) {
    Catergory.call(this, name);
    this.taskList = [];
}

var task = function(title, date, content) {
    this.title = title;
    this.date = new Date(date);
    this.content = content;
    this.state = 'uncompleted';
}

