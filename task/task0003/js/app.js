/*
    file: app.js
    author: dengailin(im.dengail@gmail.com)
*/

/*    basic data model     */
var Model = function(catergories) {
    this._catergories = catergories || [];
    //this._selectedIndex = -1;
    //this._selectedSubIndex = -1;

    /*  catergory operation */
    this.catergoryAdded = new Event(this);
    this.catergoryRemoved = new Event(this);
    this.subCatergoryAdded = new Event(this);
    this.catergoryGot = new Event(this);

    /* task list operation */
    this.taskListGot = new Event(this);

    /*  task operation  */
    this.taskAdded = new Event(this);
    this.taskGot = new Event(this);

    /*  amount update operation */
    this.amountUpdated = new Event(this);
}

Model.prototype = function() {
    var constructor = Model;
    var amount = 0;
    // 数量更新
    var updateAmount = function() {
        amount = 0;
        each(this._catergories, function(catergory) {
            amount += catergory._amount;
        });
        console.log(amount);
        this.amountUpdated.notify();
    }
    // 返回所有分类
    var getCatergories = function() {
        return [].concat(this._catergories);
    }
    //增加分类目录
    var addCatergory = function(catergory) {
        this._catergories.push(catergory);
        updateAmount.call(this);
        this.catergoryAdded.notify(catergory);
    }
    // 增加子分类
    var addSubCatergory = function(subCatergory, mainIndex) {
        subCatergory._parent = this._catergories[mainIndex];
        this._catergories[mainIndex]._subCatergories.push( subCatergory );
        this._catergories[mainIndex].updateAmount();
        updateAmount.call(this);
        this.subCatergoryAdded.notify({ subCatergory: subCatergory, selectedIndex: mainIndex} );
    }
    // 删除主目录
    var removeCatergory = function(index) {
        this._catergories.splice(index, 1);
        this._catergories.updateAmount();
        this.catergoryRemoved.notify();
    }
    // 删除子目录
    var removeSubCatergory = function(parentIndex, targetIndex) {
        this._catergories[parentIndex]._subCatergories.splice(targetIndex, 1);
        this._catergories[parentIndex].updateAmount();
        updateAmount.call(this);
        this.catergoryRemoved.notify();
    }
    // 已得到选中的目录,通知观察者
    var getCatergory = function(mainIndex, subIndex) {
        var targetCatergoty = mainIndex == -1 ? (this._catergories.length > 0 ? this._catergories[0] : []) : (subIndex == -1 ? this._catergories[mainIndex] : this._catergories[mainIndex]._subCatergories[subIndex] );
        this.catergoryGot.notify( targetCatergoty );
    }

    // 已得到选中的任务列表，通知观察者
    var getTaskList = function(mainIndex, subIndex) {
        var targetTaskList = getTargetTaskList.call(this, mainIndex, subIndex);
        this.taskListGot.notify(targetTaskList);
    }

    // 已得到选中的任务详细内容，通知观察者
    var getTask = function(mainIndex, subIndex, id) {
        var task = getTargetTask.call(this, mainIndex, subIndex, id);
        this.taskGot.notify( task );
    }
    //增加任务到对应的目录下
    var addTask = function(title, date, content, mainIndex, subIndex) {
        var targetCatergory = getTargetCatergory.call(this, mainIndex, subIndex);
        var targetParCatergory = getTargetCatergory.call(this, mainIndex, -1);
        var newTask = new Task(title, new Date(date), content, false);

        targetCatergory._tasks.push( newTask );
        targetCatergory.updateAmount();
        targetParCatergory.updateAmount();
        updateAmount.call(this);
        this.getCatergory(mainIndex, subIndex);
        this.getTaskList(mainIndex, subIndex)
        this.getTask(mainIndex, subIndex, newTask._id);
    }
    //修改已有任务内容
    var editTask = function(id, title, date, content, state, mainIndex, subIndex) {
        //var targetCatergoty = getCatergory.call(this, mainIndex, subIndex);
        var task = getTargetTask.call(this, mainIndex, subIndex, id);

        task._title = title || task._title;
        task._date = date ? new Date(date) : task._date;
        task._content = content || task._content;
        task._state = state || task._state;

        this.getTaskList(mainIndex, subIndex);
        this.getTask(mainIndex, subIndex, id);
    }

    //get the target Catergory but not notify
    var getTargetCatergory = function(mainIndex, subIndex) {
         var targetCatergoty = mainIndex == -1 ? this._catergories[0] : (subIndex == -1 ? this._catergories[mainIndex] : this._catergories[mainIndex]._subCatergories[subIndex] );
         return targetCatergoty;
    }

    // get the target task list but not notify
    var getTargetTaskList = function(mainIndex, subIndex) {
        var targetTaskList = [];
        if (mainIndex == -1) {
            each(this._catergories, function(catergory) {
                targetTaskList = targetTaskList.concat(catergory._tasks);
                each(catergory._subCatergories, function(subCatergory) {
                    targetTaskList = targetTaskList.concat(subCatergory._tasks);
                })
            })
        } else if (subIndex == -1) {
            targetTaskList = targetTaskList.concat(this._catergories[mainIndex]._tasks);
            each(this._catergories[mainIndex]._subCatergories, function(subCatergory) {
                    targetTaskList = targetTaskList.concat(subCatergory._tasks);
            });
        } else {
            targetTaskList = targetTaskList.concat(this._catergories[mainIndex]._subCatergories[subIndex]._tasks);
        }
        return targetTaskList;
    };

    // get the target task
    var getTargetTask = function(mainIndex, subIndex, id) {
        var taskList = getTargetTaskList.call(this, mainIndex, subIndex);
        var _this = this;

        //find the chosen task
        for (var i = 0; i < taskList.length; i++)
            if (id == taskList[i]._id) {
                return taskList[i];
            }
        console.error('no such a task');
    }

    //返回所需的方法接口
    return {
        constructor: constructor,
        getCatergories: getCatergories,
        addCatergory: addCatergory,
        removeCatergory: removeCatergory,
        addSubCatergory: addSubCatergory,
        removeSubCatergory: removeSubCatergory,
        getCatergory: getCatergory,
        getTaskList: getTaskList,
        getTask: getTask,
        addTask: addTask,
        editTask: editTask
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
    // 当‘增加任务’被点击时
    this.addTaskBtnClicked = new Event(this);
    //当任务被点击时
    this.taskClicked = new Event(this);
    //当任务增加确认被点击时
    this.taskAddConfirmBtnClicked = new Event(this);
    //当任务修改模式下 修改确认键被按下时
    this.taskEditedConfirmBtnClicked = new Event(this);
    //当任务修改模式下 取消按钮被按下时
    this.taskEditedCancelBtnClicked = new Event(this);
    //当一般模式下 确认任务已完成按钮被按下时
    this.taskFinishBtnClicked = new Event(this);

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
    this._model.subCatergoryAdded.attach( function(sender, newCatergory) {
        _this.addSubCatergory(newCatergory);
    })
    //当获得目录内容时显示任务列表
    this._model.catergoryGot.attach( function(sender, targetCatergoty) {
        //_this.showTaskList(targetCatergoty);
    })
    // 当获得任务列表时显示任务列表
    this._model.taskListGot.attach(function(sender, targetTaskList) {
        _this.showTaskList(targetTaskList);
    })
    //当获得任务内容时显示任务详细内容
    this._model.taskGot.attach( function(sender, task) {
        _this.showTask(task);
    })
    // 当数量更新时
    this._model.amountUpdated.attach( function(sender) {
        _this.showCatergoryList();
    })

    /*  binding with adding catergory */
    $.click(this._elements.addCatergoryBtn, function() {
        _this.addCatergoryBtnClicked.notify({'mainIndex': _this.mainIndex});
    });
    /* binding with showing all task */
    $.click(this._elements.allTaskBtn, function() {
        _this.changeTaskListMode(this);
    });
    /* binding with showing the finished task */
    $.click(this._elements.finishedTaskBtn, function() {
        _this.changeTaskListMode(this);
    });
    /* binding with showing the unfinished task */
    $.click(this._elements.unfinishedTaskBtn, function() {
        _this.changeTaskListMode.call(_this, this);
    });
    /* bing with adding task confirm */
    $.click(this._elements.taskAddConfirmBtn, function() {
        _this.taskAddConfirmBtnClicked.notify({'mainIndex': _this.mainIndex, 'subIndex': _this.subIndex});
    });
    /*  binding with editing task confirm */
    $.click(this._elements.taskEditedConfirmBtn, function() {
        _this.taskEditedConfirmBtnClicked.notify({'mainIndex': _this.mainIndex, 'subIndex': _this.subIndex});
    })
    /*  binding with editing task cancel */
    $.click(this._elements.taskEditedCancelBtn, function() {
        _this.taskEditedCancelBtnClicked.notify({'mainIndex': _this.mainIndex, 'subIndex': _this.subIndex});
    });
    /*  binding with editing task state */
    $.click(this._elements.taskFinishBtn, function() {
        _this.taskFinishBtnClicked.notify({'mainIndex': _this.mainIndex, 'subIndex': _this.subIndex});
            });

    /*  binding with turning into an addTasking mode  */
    $.click(this._elements.addTaskBtn, function() {
        _this.taskAddMode();
    });
    /*  binding with turning into an editable model*/
    $.click(this._elements.taskEditBtn, function() {
        _this.taskEditMode();
    });
    $.click(this._elements.taskAddCancelBtn, function() {
        _this.taskAddMode();
    })
}

View.prototype = function() {
    var constructor = View;

    var _this = this;
    var targetTaskList = {};
    var mainIndex = -1, subIndex = -1;  // init
/*
    除目标外的兄弟元素全部移除该类

    @param {Object} target 目标节点
    @param {string} className 类名
    @return none
*/  
    var toggleClass = function(target, className) {
        if (target.parentNode == null) return;
        for (var i = 0; i < target.parentNode.childNodes.length; i++) {
                if (target.parentNode.childNodes[i] != target)
                    removeClass(target.parentNode.childNodes[i], className);
            }
        addClass(target, className);
    }
/*
    目标节点的父亲节点且父亲节点的兄弟节点全部移除该类

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
        if (target.parentNode == null) return;
        for (var i = 0; i < target.parentNode.childNodes.length; i++) {
            for (var j = 0; j < target.parentNode.childNodes[i].childNodes.length; j++) {
                    removeClass(target.parentNode.childNodes[i].childNodes[j], className);
            }
        }
    }
    //增加目录的视图处理
    var addCatergory = function(newCatergory) {
        this.showCatergoryList();
        this.catergoryClicked.notify({'mainIndex': this.mainIndex, 'subIndex': this.subIndex});
    }
    //增加子目录的视图处理
    var addSubCatergory = function(obj) {
        this.showCatergoryList();
        this.catergoryClicked.notify({'mainIndex': this.mainIndex, 'subIndex': this.subIndex});
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
            var icon = doc.createElement('span')

            amount.appendChild( doc.createTextNode( '(' + catergoryList[i]._amount + ')' ));

            addClass(removeBtn, 'fa fa-times removeCatergoryBtn');
            $.click(removeBtn, function(e) {
                e.stopPropagation();
                _this.mainIndex = -1;
                _this.subIndex = -1;
                _this.removeCatergoryBtnClicked.notify( this.parentNode.parentNode.id );
            });
            
            addClass(icon, 'fa');
            addClass(icon, 'fa-folder-open');

            catergoryTitle.appendChild(icon);
            catergoryTitle.appendChild( doc.createTextNode( catergoryList[i]._name ) );
            catergoryTitle.appendChild( amount );
            catergoryTitle.appendChild( removeBtn );

            addClass(catergory, 'catergory');
            catergory.setAttribute('id', catergoryList[i]._id);
            catergory.appendChild( catergoryTitle );
            if (_this.mainIndex != -1) {
                if (i == _this.mainIndex) {
                    addClass(catergory, 'chosen');
                }
            }
            (function(_index) {
                $.click(catergory, function(e) {
                    removeChildrenAllClass(this, 'sub-chosen');
                    toggleClass(this, 'chosen');
                    _this.mainIndex = _index;
                    _this.subIndex = -1;
                    //console.log("mainIndex: "+_this.mainIndex+" subIndex: " + _this.subIndex);
                    _this.catergoryClicked.notify({'targetCatergoryId': this.id, 'mainIndex': _this.mainIndex, 'subIndex': _this.subIndex} );
                });
            })(i);

            // createCatergory.call(this, document.createElement('dt'), catergoryList[i]);

            for (var j = 0; j < catergoryList[i]._subCatergories.length; j++) {
                var subCatergory = doc.createElement('dd');
                var subCatergoryTitle = doc.createTextNode( catergoryList[i]._subCatergories[j]._name );
                var subAmount = doc.createElement('span');
                var removeSubBtn = doc.createElement('span');
                var subIcon = doc.createElement('span');

                addClass(subIcon, 'fa');
                addClass(subIcon, 'fa-file-o');

                subAmount.appendChild( doc.createTextNode( '(' + catergoryList[i]._subCatergories[j]._amount + ')' ));

                removeSubBtn.setAttribute('class', 'fa fa-times removeCatergoryBtn');
                $.click(removeSubBtn, function(e) {
                    e.stopPropagation();
                    removeSubBtn.parentNode.parentNode.click();
                    //console.log("mainIndex: "+_this.mainIndex+" subIndex: " + _this.subIndex);
                    _this.removeSubCatergoryBtnClicked.notify( {'parentId': this.parentNode.parentNode.id, 'targetId': this.parentNode.id } );
                });

                subCatergory.setAttribute('id', catergoryList[i]._subCatergories[j]._id);
                addClass(subCatergory, 'sub-catergory');
                subCatergory.appendChild(subIcon);
                subCatergory.appendChild( subCatergoryTitle );
                subCatergory.appendChild( subAmount );
                subCatergory.appendChild( removeSubBtn );
                (function(_index) {
                    $.click(subCatergory, function(e) {
                        e.stopPropagation();
                        this.parentNode.click();
                        removeParentAllClass(this, 'chosen');
                        toggleClass(this, 'sub-chosen');
                        _this.subIndex = _index;
                        //console.log("mainIndex: "+_this.mainIndex+" subIndex: " + _this.subIndex);
                        _this.subCatergoryClicked.notify( {'parentId': this.parentNode.id, 'targetId': this.id, 'mainIndex': _this.mainIndex, 'subIndex': _this.subIndex} );
                    });
                })(j);

                catergory.appendChild( subCatergory );
                // subCatergory = createCatergory( document.createElement('dd'), catergoryList[i]._subCatergories[j] );
            }

            this._elements.catergoryList.appendChild(catergory);
        }
    }
    // 移除目录的视图处理
    var removeCatergory = function() {
        this.subIndex = -1;
        this.showCatergoryList();
        this.catergoryClicked.notify({'mainIndex': this.mainIndex, 'subIndex': this.subIndex});
    }
    // 重建分类目录的视图处理
    var rebuildCatergoryList = function() {
        this.subIndex = -1;
        this.showCatergoryList();
        this.catergoryClicked.notify({'mainIndex': this.mainIndex, 'subIndex': this.subIndex});
    }

    // 显示任务列表的视图处理
    var showTaskList = function(taskList) {
        //targetCatergoty = catergory = (catergory || targetCatergoty);    // store the target catergory
        targetTaskList = taskList || targetTaskList;  // store the task list
        var _this = this;
        var state = [undefined, true, false, undefined];
        var btns = [_this._elements.allTaskBtn, _this._elements.finishedTaskBtn, _this._elements.unfinishedTaskBtn];    // 0, 1, 2

        for (var i = 0; i < btns.length; i++) {
            if ($.hasClass(btns[i], 'chosen')) {
                break;
            }
        }
        state = state[i];

        //sort the taskList with task date
        targetTaskList.sort(function(a, b) {
            return a._date > b._date;
        });

        // 正式处理显示任务列表视图
        var doc = document;
        var taskDateLi, taskUl, taskLi, dateText, taskTitleText, taskDate;
        //清空原内容
        this._elements.taskList.innerHTML = "";
        taskDate = dateConvert(new Date(0));

        for (var i = 0; i < targetTaskList.length; i++) {
            var task = targetTaskList[i];
            if (state === undefined || state === task._state) {
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
                taskTitleText = doc.createTextNode( task._title );

                taskLi.appendChild( taskTitleText );
                taskLi.id = task._id;
                $.click(taskLi, function() {
                    _this.taskClicked.notify({'mainIndex': _this.mainIndex, 'subIndex': _this.subIndex, 'taskId': this.id} ); //notify  taskClicked with task's id
                });

                taskUl.appendChild(taskLi);
            }
        }

    };
    // 改变显示任务列表时的状态
    var changeTaskListMode = function(tab) {
        toggleClass(tab, 'chosen');
        showTaskList.call(this);
    };
    //显示任务的详细信息：标题，日期和任务具体内容
    var showTask = function(task) {
        //替换内容
        this._elements.taskTitle.innerHTML = task._title;
        this._elements.taskTitle['data-task-id'] = task._id;
        this._elements.taskDate.innerHTML = dateConvert(task._date);
        this._elements.taskContent.innerHTML = task._content;

        removeClass(this._elements.taskTool, 'unshown');
        addClass(this._elements.taskEditTool, 'unshown');
        addClass(this._elements.taskAddTool, 'unshown');
    }

    //使任务显示为可修改编辑状态
    var taskEditMode = function() {
        if ($('#task_title')['data-task-id'] == undefined) {
            alert('please choose a task first');
            return;
        }

        var title = this._elements.taskTitle,
            date = this._elements.taskDate,
            content = this._elements.taskContent,
            titleInput = document.createElement('input'),
            dateInput = document.createElement('input'),
            contentInput = document.createElement('textarea');
        
            titleInput.value = title.innerHTML;
            titleInput.size = '80';
            titleInput.maxlength = '30';

            dateInput.value = date.innerHTML;
            dateInput.size = '50';

            contentInput.value = content.innerHTML;
            contentInput.size = '300';
            contentInput.maxlength = '200';

            //clear before
            title.innerHTML = date.innerHTML = content.innerHTML = "";

            title.appendChild(titleInput);
            date.appendChild(dateInput);
            content.appendChild(contentInput);

            removeClass(this._elements.taskEditTool, 'unshown');
            addClass(this._elements.taskTool, 'unshown');
            addClass(this._elements.taskAddTool, 'unshown');

            titleInput.focus();
    }

    //使任务显示为增加任务状态
    var taskAddMode = function() {
        if (this.mainIndex == -1) {
            alert('please choose a catergory first');
            return;
        }

        var title = this._elements.taskTitle,
            date = this._elements.taskDate,
            content = this._elements.taskContent,
            titleInput = document.createElement('input'),
            dateInput = document.createElement('input'),
            contentInput = document.createElement('textarea');
        
            titleInput.placeholder = '限制输入超过80个字';
            titleInput.size = '80';
            titleInput.maxlength = '30';

            dateInput.placeholder = '限制输入超过50个字';
            dateInput.size = '50';

            contentInput.placeholder = '限制输入超过300个字';
            contentInput.size = '300';
            contentInput.maxlength = '200';

            //clear before
            title.innerHTML = date.innerHTML = content.innerHTML = "";

            title.appendChild(titleInput);
            date.appendChild(dateInput);
            content.appendChild(contentInput);

            removeClass(this._elements.taskAddTool, 'unshown');
            addClass(this._elements.taskTool, 'unshown');
            addClass(this._elements.taskEditTool, 'unshown');

            titleInput.focus();
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
        showTaskList: showTaskList,
        showTask: showTask,
        taskEditMode: taskEditMode,
        taskAddMode: taskAddMode,
        mainIndex: mainIndex,
        subIndex: subIndex,
        changeTaskListMode: changeTaskListMode
    }
}();

var Controller = function(model, view) {
    this._model = model;
    this._view = view;

    var _this = this;

    this._view.addCatergoryBtnClicked.attach( function(sender, infos) {
        _this.addCatergory(infos.mainIndex, infos.subIndex);
    });

    this._view.removeCatergoryBtnClicked.attach( function (sender, targetCatergoryId) {
        _this.removeCatergory(targetCatergoryId);
    });

    this._view.removeSubCatergoryBtnClicked.attach( function(sender, ids) {
        _this.removeSubCatergory(ids);
    });
    
    this._view.catergoryClicked.attach( function (sender, infos) {
        _this.selectCatergory(infos.targetCatergoryId, infos.mainIndex, infos.subIndex);
    });

    this._view.subCatergoryClicked.attach( function (sender, infos) {
        _this.selectSubCatergory(infos.targetId, infos.parentId, infos.mainIndex, infos.subIndex);
    });
    
    this._view.taskClicked.attach( function(sender, infos) {
        _this.selectTask(infos.mainIndex, infos.subIndex, infos.taskId);
    });

    this._view.taskAddConfirmBtnClicked.attach( function(sender, infos) {
        _this.addTask(infos.mainIndex, infos.subIndex);
    });

    this._view.taskEditedConfirmBtnClicked.attach( function(sender, infos) {
        _this.taskEditedConfirm(infos.mainIndex, infos.subIndex);
    });

    this._view.taskEditedCancelBtnClicked.attach( function(sender, infos) {
        _this.taskEditedCancel(infos.mainIndex, infos.subIndex);
    });

    this._view.taskFinishBtnClicked.attach( function(sender, infos) {
        _this.taskFinish(infos.mainIndex, infos.subIndex);
    })
}

Controller.prototype = {
    addCatergory: function(mainIndex, subIndex) {
        var name = window.prompt("Add catergory: ", "");
        if (name) {
            if (mainIndex == -1)
                this._model.addCatergory(new Catergory(name));
            else
                this._model.addSubCatergory(new SubCatergory( name, this._view._elements.catergorys[mainIndex].id ), mainIndex);
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
    
    selectCatergory: function (targetCatergoryId, mainIndex, subIndex) {
        this._model.getCatergory(mainIndex, subIndex);
        this._model.getTaskList(mainIndex, subIndex);
    },
    selectSubCatergory: function(parentId, targetId, mainIndex, subIndex) {
        var index, subIndex, catergories = $('.catergory');
        this._model.getCatergory(mainIndex, subIndex);
        this._model.getTaskList(mainIndex, subIndex);
    },

    selectTask: function(mainIndex, subIndex, id) {
        this._model.getTask(mainIndex, subIndex, id);
    },

    addTask: function(mainIndex, subIndex) {
        var title = $('#task_title input')[0].value,
            date = $('#task_date input')[0].value,
            content = $('#task_content textarea')[0].value;

        this._model.addTask(title, date, content, mainIndex, subIndex);
    },

    taskEditedConfirm: function(mainIndex, subIndex) {
        var confirm = window.confirm('Are you sure to modify the task?');
        var newTitle = $('#task_title input')[0].value,
            newDate = $('#task_date input')[0].value,
            newContent = $('#task_content textarea')[0].value,
            id = $('#task_title')['data-task-id'];

        if (confirm) {
            this._model.editTask(id, newTitle, newDate, newContent, undefined, mainIndex, subIndex);
        }
        return;
    },

    taskEditedCancel: function(mainIndex, subIndex) {
        var id = $('#task_title')['data-task-id'];
        this._model.getTask(mainIndex, subIndex, id);
    },

    taskFinish: function(mainIndex, subIndex) {
        var id = $('#task_title')['data-task-id'];
        this._model.editTask(id, null, null, null, true, mainIndex, subIndex);
    }
};

window.onload = function() {
    var model = new Model([new Catergory('tt'), new Catergory('bb')]),
        view = new View(model, {
            'catergoryList': $('#catergory_list'),
            'catergorys': $('.catergory'),
            'addCatergoryBtn': $('#add_catergory'),
            'addTaskBtn': $('#add_task'),
            'taskList': $('#task_list'),
            'allTaskBtn': $('#all_task'),
            'finishedTaskBtn': $('#finished_task'),
            'unfinishedTaskBtn': $('#unfinished_task'),
            'taskFinishBtn': $('#task_finish_btn'),
            'taskEditBtn': $('#task_edit_btn'),
            'taskEditedConfirmBtn': $('#task_edited_confirm'),
            'taskEditedCancelBtn': $('#task_edited_cancel'),
            'taskTitle': $('#task_title'),
            'taskDate': $('#task_date'),
            'taskContent': $('#task_content'),
            'taskEditTool': $('#task_edit_tool'),
            'taskAddTool': $('#task_add_tool'),
            'taskAddConfirmBtn': $('#task_add_confirm'),
            'taskAddCancelBtn': $('#task_add_cancel'),
            'taskTool': $('#task_tool')
        }),
        controller = new Controller(model, view);

        view.showCatergoryList();
}

var Catergory = function(name) {
    this._name = name;
    this._subCatergories = [];
    this._id = Math.guid();
    this._tasks = [new Task('111', new Date(), 'hello', true), new Task('222', new Date('2015-05-11'), 'hello', false), new Task('333', new Date(), 'hello', true)];
    this.updateAmount();
}

Catergory.prototype.updateAmount = function() {
    this._amount = this._tasks.length;
    for (var i = 0; i < this._subCatergories.length; i++) {
        this._amount += this._subCatergories[i]._tasks.length;
    }
}


var SubCatergory = function(name, parentId) {
    Catergory.call(this, name);
    this._parentId = parentId;
}

SubCatergory.prototype = Catergory.prototype;

var Task = function(title, date, content, state) {
    this._title = title;
    this._date = date;
    this._content = content;
    this._id = Math.guid();
    this._state = state; // not finished yet
}