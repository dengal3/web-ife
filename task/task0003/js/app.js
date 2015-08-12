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

    this.catergoryAdded = new Event(this);
    this.catergoryRemoved = new Event(this);
    this.subCatergoryAdded = new Event(this);

}

Model.prototype = function() {
    var constructor = Model;

    var getCatergories = function() {
        return [].concat(this._catergories);
    }

    var addCatergory = function(catergory) {
        this._catergories.push(catergory);
        this.catergoryAdded.notify(catergory);
        this._selectedIndex = -1;
    }

    var addSubCatergory = function(subCatergory) {
        subCatergory._parent = this._catergories[this._selectedIndex];
        this._catergories[this._selectedIndex]._subCatergories.push( subCatergory );
        this.subCatergoryAdded.notify({ subCatergory: subCatergory, selectedIndex: this._selectedIndex} );
        this._selectedIndex = -1;
    }

    var removeCatergory = function(index) {
        this._catergories.splice(index, 1);
        this._selectedIndex = -1;
        this.catergoryRemoved.notify();
    }

    var removeSubCatergory = function(parentIndex, targetIndex) {
        this._catergories[parentIndex]._subCatergories.splice(targetIndex, 1);
        this._selectedIndex = -1;
        this.catergoryRemoved.notify();
    }

    return {
        constructor: constructor,
        getCatergories: getCatergories,
        addCatergory: addCatergory,
        removeCatergory: removeCatergory,
        addSubCatergory: addSubCatergory,
        removeSubCatergory: removeSubCatergory
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


var View = function(model, elements) {
    this._model = model;
    this._elements = elements;

    this.addCatergoryBtnClicked = new Event(this);
    this.removeCatergoryBtnClicked = new Event(this);
    this.removeSubCatergoryBtnClicked = new Event(this);
    this.catergoryClicked = new Event(this);
    this.subCatergoryClicked = new Event(this);

    var _this = this;

    this._model.catergoryAdded.attach(function(sender, newCatergory) {
        _this.addCatergory(newCatergory);
    })

    this._model.catergoryRemoved.attach(function() {
        _this.rebuildCatergoryList();
    })

    this._model.subCatergoryAdded.attach( function (sender, newCatergory) {
        _this.addSubCatergory(newCatergory);
    })

    $.click(this._elements.addCatergoryBtn, function() {
        _this.addCatergoryBtnClicked.notify();
    });

}

View.prototype = function() {
    var constructor = View;

    var _this = this;

    var toggleClass = function(target, className) {
        for (var i = 0; i < target.parentNode.childNodes.length; i++) {
                if (target.parentNode.childNodes[i] != target)
                    removeClass(target.parentNode.childNodes[i], className);
            }
        addClass(target, className);
    }

    var removeParentAllClass = function(target, className) {
        for (var i = 0; i < target.parentNode.parentNode.childNodes.length; i++) {
                    removeClass(target.parentNode.parentNode.childNodes[i], className);
            }
    }

    var removeChildrenAllClass = function(target, className) {
        for (var i = 0; i < target.parentNode.childNodes.length; i++) {
            for (var j = 0; j < target.parentNode.childNodes[i].childNodes.length; j++) {
                    removeClass(target.parentNode.childNodes[i].childNodes[j], className);
            }
        }
    }

    var addCatergory = function(newCatergory) {
        this.showCatergoryList();
    }

    var addSubCatergory = function(obj) {
        this.showCatergoryList();
    }

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

    var removeCatergory = function() {
        this.showCatergoryList();
    }

    var rebuildCatergoryList = function() {
        this.showCatergoryList();
    }

    return {
        constructor: constructor,
        addCatergory: addCatergory,
        showCatergoryList: showCatergoryList,
        removeCatergory: removeCatergory,
        rebuildCatergoryList: rebuildCatergoryList,
        addSubCatergory: addSubCatergory
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
                    this._model._selectedIndex = index;
                    return;
                }
            this._model._selectedIndex = -1;
            this._model._selectedSubIndex = -1;
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
                    this._model._selectedIndex = index;
                    this._model._selectedSubIndex = subIndex-1;
                    // this._model.removeSubCatergory(index, subIndex-1);
                }
    }
};

window.onload = function() {
    var model = new Model([new Catergory('tt'), new Catergory('bb')]),
        view = new View(model, {
            'catergoryList': $('#catergory_list'),
            'catergorys': $('.catergory'),
            'addCatergoryBtn': $('#add_catergory')
        }),
        controller = new Controller(model, view);

        view.showCatergoryList();
}

var Catergory = function(name) {
    this._name = name;
    this._amount = 0;
    this._subCatergories = [];
    this._id = Math.guid();
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