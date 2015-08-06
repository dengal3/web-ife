/*
    file: data.js
    author: dengailin(im.dengal@gmail.com)
*/

/*    basic data model     */
var CatergoryListModel = function(catergories) {
    this._catergories = catergories || [];
    this._amount = 0;
    this._selectedIndex = -1;

    this.catergoryAdded = new Event(this);
    this.catergoryRemoved = new Event(this);
    this.subCatergoryAdded = new Event(this);

}

CatergoryListModel.prototype = function() {
    var constructor = CatergoryListModel;

    var getCatergories = function() {
        return [].concat(this._catergories);
    }

    var addCatergory = function(catergory) {
        this._catergories.push(catergory);
        this.catergoryAdded.notify(catergory);
    }

    var addSubCatergory = function(subCatergory) {
        subCatergory._parent = this._catergories[this._selectedIndex];
        this._catergories[this._selectedIndex]._subCatergories.push( subCatergory );
        this.subCatergoryAdded.notify({ subCatergory: subCatergory, selectedIndex: this._selectedIndex} );
    }

    var removeCatergory = function(index) {
        this._catergories.splice(index, 1);
        this._selectedIndex = -1;
        this.catergoryRemoved.notify();
    }

    return {
        constructor: constructor,
        getCatergories: getCatergories,
        addCatergory: addCatergory,
        removeCatergory: removeCatergory,
        addSubCatergory: addSubCatergory
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


var CatergoryListView = function(model, elements) {
    this._model = model;
    this._elements = elements;

    this.addCatergoryBtnClicked = new Event(this);
    this.removeCatergoryBtnClicked = new Event(this);
    this.catergoryClicked = new Event(this);

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

CatergoryListView.prototype = function() {
    var constructor = constructor;

    var _this = this;

    var toggleClass = function(target, className) {
        for (var i = 0; i < target.parentNode.childNodes.length; i++) {
                if (target.parentNode.childNodes[i] != target)
                    removeClass(target.parentNode.childNodes[i], className);
            }
        addClass(target, className);
    }

    var createCatergory = function(catergory, newCatergory) {
        var removeCatergoryBtn;
        var doc = document;

        var _this = this;

        addClass(catergory, 'catergory');
        catergory.appendChild( doc.createTextNode( newCatergory._name + '('+ newCatergory._amount + ')') );
        removeCatergoryBtn = doc.createElement( 'span' )
        removeCatergoryBtn.setAttribute('class', 'fa fa-times removeCatergoryBtn');
        $.click(removeCatergoryBtn, function(e) {
            _this.removeCatergoryBtnClicked.notify(e.target.parentNode);
            e.stopPropagation();
        });
        $.click( catergory, function(e) {
            toggleClass(e.target, 'chosen');
            _this.catergoryClicked.notify(e.target);
        });
        catergory.appendChild(removeCatergoryBtn);

        return catergory;
    }

    var addCatergory = function(newCatergory) {
        var catergory = createCatergory.call(this, document.createElement('dt'), newCatergory );

        this._elements.catergoryList.appendChild(catergory);
    }

    var addSubCatergory = function(obj) {
        var catergory = createCatergory.call(this, document.createElement('dd'), obj.subCatergory);
        var targetCatergory = this._elements.catergoryList.childNodes[obj.selectedIndex];

        addClass(catergory, 'sub-catergory');
        insertAfter(targetCatergory, catergory);
    }

    var showCatergoryList = function() {
        var i, catergory, catergoryList, subCatergory;

        catergoryList = this._model._catergories;

        this._elements.catergoryList.innerHTML = "";

        for (i = 0; i < catergoryList.length; i++) {
            catergory = createCatergory.call(this, document.createElement('dt'), catergoryList[i]);

            if ( catergoryList[i]._subCatergories.length > 0) {

                for (var j = 0; j < catergoryList[i]._subCatergories.length; j++) {
                    subCatergory = createCatergory( document.createElement('dd'), catergoryList[i]._subCatergories[j] );

                }

            }
            this._elements.catergoryList.appendChild(catergory);
        }
    }

    var removeCatergory = function() {
        _this.showCatergoryList();
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

var CatergoryListController = function(model, view) {
    this._model = model;
    this._view = view;

    var _this = this;

    this._view.addCatergoryBtnClicked.attach( function() {
        _this.addCatergory();
    });

    this._view.removeCatergoryBtnClicked.attach( function (sender, removingCatergory) {
        _this.removeCatergory(removingCatergory);
    });

    this._view.catergoryClicked.attach( function (sender, targetCatergory) {
        _this.selectCatergory( targetCatergory )
    })
}

CatergoryListController.prototype = function() {
    var addCatergory = function() {
        var name = window.prompt("Add catergory: ", "");
        if (name) {
            if (this._model._selectedIndex == -1)
                this._model.addCatergory(new Catergory(name));
            else if (this._model._selectedIndex >= 0)
                this._model.addSubCatergory(new Catergory(name));
        }
    }

    var removeCatergory = function(removeCatergory) {
        var confirm = window.confirm('Are you sure to cancel the catergory?');

        if (confirm) {
            var index, catergories = $('.catergory'); 

            for (index = 0; index < catergories.length; index++)
                if (catergories[index] === removeCatergory)
                    break;

            this._model.removeCatergory(index);
        }
    }

    var selectCatergory = function (targetCatergory) {
        var index, catergories = $('.catergory'); 

            for (index = 0; index < catergories.length; index++)
                if (catergories[index] === targetCatergory) {
                    this._model._selectedIndex = index;
                    return;
                }
            this._model._selectedIndex = -1;
    }

    return {
        addCatergory: addCatergory,
        removeCatergory: removeCatergory,
        selectCatergory: selectCatergory
    }
}();

window.onload = function() {
    var model = new CatergoryListModel([new Catergory('tt'), new Catergory('bb')]),
        view = new CatergoryListView(model, {
            'catergoryList': $('#catergory_list'),
            'addCatergoryBtn': $('#add_catergory')
        }),
        controller = new CatergoryListController(model, view);

        view.showCatergoryList();
}

var Catergory = function(name) {
    this._parent = null;
    this._name = name;
    this._amount = 0;
    this._subCatergories = [];
}