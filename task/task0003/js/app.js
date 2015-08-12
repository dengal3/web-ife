/*
    file: data.js
    author: dengailin(im.dengal@gmail.com)
*/

/*    basic data model     */
var Model = function(catergories) {
    this._catergories = catergories || [];
    this._amount = 0;
    this._selectedIndex = -1;
    this._selectedSubIndex = -1;

    /*  catergory operation */
    this.catergoryAdded = new Event(this);
    this.catergoryRemoved = new Event(this);
    this.subCatergoryAdded = new Event(this);
    this.catergoryGot = new Event(this);

    /*  task operation  */
    this.taskAdded = new Event(this);

}

Model.prototype = function() {
    var constructor = Model;
    // 返回所有分类
    var getCatergories = function() {
        return [].concat(this._catergories);
    }
    //增加分类目录
    var addCatergory = function(catergory) {
        this._catergories.push(catergory);
        this.catergoryAdded.notify(catergory);
        this._selectedIndex = -1;
    }
    // 增加子分类
    var addSubCatergory = function(subCatergory) {
        subCatergory._parent = this._catergories[this._selectedIndex];
        this._catergories[this._selectedIndex]._subCatergories.push( subCatergory );
        this.subCatergoryAdded.notify({ subCatergory: subCatergory, selectedIndex: this._selectedIndex} );
        this._selectedIndex = -1;
    }
    // 删除主目录
    var removeCatergory = function(index) {
        this._catergories.splice(index, 1);
        this._selectedIndex = -1;
        this.catergoryRemoved.notify();
    }
    // 删除子目录
    var removeSubCatergory = function(parentIndex, targetIndex) {
        this._catergories[parentIndex]._subCatergories.splice(targetIndex, 1);
        this._selectedIndex = -1;
        this.catergoryRemoved.notify();
    }
    //设置选择的主目录下标和子目录下标
    var setIndex = function(mainIndex, subIndex) {
        this._selectedIndex = mainIndex;
        this._selectedSubIndex = subIndex;
        this.getCatergory();
    }
    // 返回选中的目录
    var getCatergory = function() {
        var targetCatergoty = this._selectedIndex == -1 ? this._catergories[0] : (this._selectedSubIndex == -1 ? this._catergories[this._selectedIndex] : this._catergories[this._selectedIndex]._subCatergories[this._selectedSubIndex] );
        this.catergoryGot.notify( targetCatergoty );
    }
    //返回所需的方法接口
    return {
        constructor: constructor,
        getCatergories: getCatergories,
        addCatergory: addCatergory,
        removeCatergory: removeCatergory,
        addSubCatergory: addSubCatergory,
        removeSubCatergory: removeSubCatergory,
        setIndex: setIndex,
        getCatergory: getCatergory
    }
}();

/*      Event(watcher mode)       */
var Event = function(sender, listeners) {
    this._sender = sender;
    this._listeners = listeners || [];
}

Event.prototype = {
    attach: function(listener) {
        this._listeners.push(listener);
    },
    notify: function(args) {
        var i;
        for (i = 0; i < this._listeners.length; i++)
            this._listeners[i](this._sender, args);
    }
}

/*
    视图

    @param {Object} model 联系的数据模型
    @param {Object} elements 输入的页面元素
    @return none
*/
var View = function(model, elements) {
    this._model = model;
    this._elements = elements;

    //‘添加分类’按钮被点击时
    this.addCatergoryBtnClicked = new Event(this);
    //当’删除目录‘按钮点击时
    this.removeCatergoryBtnClicked = new Event(this);
    //当’删除子目录‘按钮点击时
    this.removeSubCatergoryBtnClicked = new Event(this);
    //当’目录‘被点击时
    this.catergoryClicked = new Event(this);
    //当子目录被点击时
    this.subCatergoryClicked = new Event(this);

    var _this = this;

    //当model的目录添加完毕时
    this._model.catergoryAdded.attach(function(sender, newCatergory) {
        _this.addCatergory(newCatergory);
    })
    //当model的目录被删除后时
    this._model.catergoryRemoved.attach(function() {
        _this.rebuildCatergoryList();
    })
    //当model的子目录被删除后时
    this._model.subCatergoryAdded.attach( function (sender, newCatergory) {
        _this.addSubCatergory(newCatergory);
    })
    //当获得目录内容时显示任务列表
    this._model.catergoryGot.attach( function(sender, targetCatergoty) {
        _this.showTaskList(targetCatergoty);
    })

    /*  binding with adding catergory */
    $.click(this._elements.addCatergoryBtn, function() {
        _this.addCatergoryBtnClicked.notify();
    });
    /*  binding with adding taskAdded*/
    $.click(this._elements.addTaskBtn, function() {

    });

}

View.prototype = function() {
    var constructor = View;

    var _this = this;
/*
    除目标外的兄弟元素全部移除该类

    @param {Object} target 目标节点
    @param {string} className 类名
    @return none
*/  
    var toggleClass = function(target, className) {
        for (var i = 0; i < target.parentNode.childNodes.length; i++) {
                if (target.parentNode.childNodes[i] != target)
                    removeClass(target.parentNode.childNodes[i], className);
            }
        addClass(target, className);
    }
/*
    目标饥点的父亲节点且父亲节点的兄弟节点全部移除该类

    @param {Object} target 目标节点
    @param {string} className 类名
    @return none
*/  
    var removeParentAllClass = function(target, className) {
        for (var i = 0; i < target.parentNode.parentNode.childNodes.length; i++) {
                    removeClass(target.parentNode.parentNode.childNodes[i], className);
            }
    }
/*
    目标节点和目标节点的兄弟节点下的子节点全部移除该类

    @param {Object} target 目标节点
    @param {string} className 类名
    @return none
*/  
    var removeChildrenAllClass = function(target, className) {
        for (var i = 0; i < target.parentNode.childNodes.length; i++) {
            for (var j = 0; j < target.parentNode.childNodes[i].childNodes.length; j++) {
                    removeClass(target.parentNode.childNodes[i].childNodes[j], className);
            }
        }
    }
    //增加目录的视图处理
    var addCatergory = function(newCatergory) {
        this.showCatergoryList();
    }
    //增加子目录的视图处理
    var addSubCatergory = function(obj) {
        this.showCatergoryList();
    }
    // 显示分类目录的视图处理
    var showCatergoryList = function() {
        var i, catergoryList, subCatergory;
        var doc = document;
        var _this = this;

        catergoryList = this._model._catergories;

        // 清空原本内容
        this._elements.catergoryList.innerHTML = "";
        for (i = 0; i < catergoryList.length; i++) {
            var catergory = doc.createElement('div');
            var catergoryTitle = doc.createElement('dt');
            var amount = doc.createElement('span');
            var removeBtn = doc.createElement('span');

            amount.appendChild( doc.createTextNode( '(' + catergoryList[i]._amount + ')' ));

            addClass(removeBtn, 'fa fa-times removeCatergoryBtn');
            $.click(removeBtn, function(e) {
                _this.removeCatergoryBtnClicked.notify( this.parentNode.parentNode.id );
            });
            
            catergoryTitle.appendChild( doc.createTextNode( catergoryList[i]._name ) );
            catergoryTitle.appendChild( amount );
            catergoryTitle.appendChild( removeBtn );

            addClass(catergory, 'catergory');
            catergory.setAttribute('id', catergoryList[i]._id);
            catergory.appendChild( catergoryTitle );
            $.click(catergory, function(e) {
                removeChildrenAllClass(this, 'sub-chosen');
                toggleClass(this, 'chosen');
                _this.catergoryClicked.notify(this.id);
            });

            // createCatergory.call(this, document.createElement('dt'), catergoryList[i]);

            for (var j = 0; j < catergoryList[i]._subCatergories.length; j++) {
                var subCatergory = doc.createElement('dd');
                var subCatergoryTitle = doc.createTextNode( catergoryList[i]._subCatergories[j]._name );
                var subAmount = doc.createElement('span');
                var removeSubBtn = doc.createElement('span');

                subAmount.appendChild( doc.createTextNode( '(' + catergoryList[i]._subCatergories[j]._amount + ')' ));

                removeSubBtn.setAttribute('class', 'fa fa-times removeCatergoryBtn');
                $.click(removeSubBtn, function(e) {
                    e.stopPropagation();
                    _this.removeSubCatergoryBtnClicked.notify( {'parentId': this.parentNode.parentNode.id, 'targetId': this.parentNode.id } );
                });

                subCatergory.setAttribute('id', catergoryList[i]._subCatergories[j]._id);
                subCatergory.appendChild( subCatergoryTitle );
                subCatergory.appendChild( subAmount );
                subCatergory.appendChild( removeSubBtn );
                $.click(subCatergory, function(e) {
                    e.stopPropagation();
                    removeParentAllClass(this, 'chosen');
                    toggleClass(this, 'sub-chosen');
                    _this.subCatergoryClicked.notify( {'parentId': this.parentNode.id, 'targetId': this.id} );
                });

                catergory.appendChild( subCatergory );
                // subCatergory = createCatergory( document.createElement('dd'), catergoryList[i]._subCatergories[j] );
            }

            this._elements.catergoryList.appendChild(catergory);
        }
    }
    // 移除目录的视图处理
    var removeCatergory = function() {
        this.showCatergoryList();
    }
    // 重建分类目录的视图处理
    var rebuildCatergoryList = function() {
        this.showCatergoryList();
    }

    // 显示任务列表的视图处理
    var showTaskList = function(catergory) {
        var taskList = catergory._tasks,
            subCatergories = catergory._subCatergories,
            newTaskList = [];
        //get the tasks in the subCatergories
        for (var i = 0; i < subCatergories.length; i++)
            taskList = taskList.concat( subCatergories[i]._tasks);

        //sort the taskList with task date
        taskList.sort(function(a, b) {
            return a._date > b._date;
        });

        console.log(taskList); //testing

        // 正式处理显示任务列表视图
        var doc = document;
        var taskDateLi, taskUl, taskLi, dateText, taskTitleText, taskDate;
        //清空原内容
        this._elements.taskList.innerHTML = "";
        taskDate = dateConvert(new Date(0));

        for (var i = 0; i < taskList.length; i++) {
            var task = taskList[i];
            if (dateConvert(task._date) != taskDate) {
                taskDate = dateConvert(task._date);

                taskDateLi = doc.createElement('li');
                taskUl = doc.createElement('ul');
                dateText = doc.createTextNode( taskDate );

                addClass(taskDateLi, 'task-date-list');
                taskDateLi.appendChild(dateText);
                taskDateLi.appendChild(taskUl);

                this._elements.taskList.appendChild(taskDateLi);
            }
            taskLi = doc.createElement('li');
            taskTitleText = doc.createTextNode( task._name );

            taskLi.appendChild( taskTitleText );
            taskLi.id = task._id;

            taskUl.appendChild(taskLi);
        }

    }

    //日期处理函数
    var dateConvert = function(date) {
        return [date.getUTCFullYear(), ('0'+(Number(date.getUTCMonth())+1)).slice(-2), ('0'+date.getUTCDate()).slice(-2)].join('-'); 
    }
    return {
        constructor: constructor,
        addCatergory: addCatergory,
        showCatergoryList: showCatergoryList,
        removeCatergory: removeCatergory,
        rebuildCatergoryList: rebuildCatergoryList,
        addSubCatergory: addSubCatergory,
        showTaskList: showTaskList
    }
}();

var Controller = function(model, view) {
    this._model = model;
    this._view = view;

    var _this = this;

    this._view.addCatergoryBtnClicked.attach( function() {
        _this.addCatergory();
    });

    this._view.removeCatergoryBtnClicked.attach( function (sender, targetCatergoryId) {
        _this.removeCatergory(targetCatergoryId);
    });

    this._view.removeSubCatergoryBtnClicked.attach( function(sender, ids) {
        _this.removeSubCatergory(ids);
    });

    this._view.catergoryClicked.attach( function (sender, targetCatergoryId) {
        _this.selectCatergory( targetCatergoryId );
    });

    this._view.subCatergoryClicked.attach( function (sender, ids) {
        _this.selectSubCatergory( ids );
    })
}

Controller.prototype = {
    addCatergory: function() {
        var name = window.prompt("Add catergory: ", "");
        if (name) {
            if (this._model._selectedIndex == -1)
                this._model.addCatergory(new Catergory(name));
            else if (this._model._selectedIndex >= 0)
                this._model.addSubCatergory(new SubCatergory( name, this._view._elements.catergorys[this._model._selectedIndex].id ));
        }
    },

    removeSubCatergory: function(ids) {
        var confirm = window.confirm('Are you sure to cancel the catergory?');
        var parentId = ids.parentId;
        var targetId = ids.targetId;

        if (confirm) {
            var index, subIndex, catergories = $('.catergory'); 

            //得到父分类的索引
            for (index = 0; index < catergories.length; index++)
                if (catergories[index].id === parentId)
                    break;
            //得到子分类的索引
            for (subIndex = 0; subIndex < catergories[index].childNodes.length; subIndex++)
                if ( catergories[index].childNodes[subIndex].id === targetId)
                    this._model.removeSubCatergory(index, subIndex-1);

        }
    },

    removeCatergory: function(targetCatergoryId) {
        var confirm = window.confirm('Are you sure to cancel the catergory?');

        if (confirm) {
            var index, catergories = $('.catergory'); 

            for (index = 0; index < catergories.length; index++)
                if (catergories[index].id === targetCatergoryId)
                    this._model.removeCatergory(index);
        }
    },

    selectCatergory: function (targetCatergoryId) {
        var index, catergories = $('.catergory'); 

            for (index = 0; index < catergories.length; index++)
                if (catergories[index].id === targetCatergoryId) {
                    this._model.setIndex(index, -1);
                    return;
                }
            this._model.setIndex(-1, -1);
    },

    selectSubCatergory: function(ids) {
        var index, subIndex, catergories = $('.catergory');
        var parentId = ids.parentId;
        var targetId = ids.targetId;

            //得到父分类的索引
            for (index = 0; index < catergories.length; index++)
                if (catergories[index].id === parentId)
                    break;
            //得到子分类的索引
            for (subIndex = 0; subIndex < catergories[index].childNodes.length; subIndex++)
                if ( catergories[index].childNodes[subIndex].id === targetId) {
                    this._model.setIndex(index, subIndex-1);
                }
    }
};

window.onload = function() {
    var model = new Model([new Catergory('tt'), new Catergory('bb')]),
        view = new View(model, {
            'catergoryList': $('#catergory_list'),
            'catergorys': $('.catergory'),
            'addCatergoryBtn': $('#add_catergory'),
            'addTaskBtn': $('#add_task'),
            'taskList': $('#task_list')
        }),
        controller = new Controller(model, view);

        view.showCatergoryList();
}

var Catergory = function(name) {
    this._name = name;
    this._amount = 0;
    this._subCatergories = [];
    this._id = Math.guid();
    this._tasks = [new Task('111', new Date(), 'hello'), new Task('222', new Date('2015-05-11'), 'hello')];
}

var SubCatergory = function(name, parentId) {
    Catergory.call(this, name);
    this._parentId = parentId;
}

var Task = function(name, date, content) {
    this._name = name;
    this._date = date;
    this._content = content;
    this._id = Math.guid();
}