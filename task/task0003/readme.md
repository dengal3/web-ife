### The structure
#### Model
        handle the staff about the data, like the modify, add and delete data
        Also, it will notify the View after finshing the handling metioned above

##### handle methods(prototype):
        getCatergories
        addCatergory
        addSubCatergory
        removeCatergory
        removeSubCatergory
        setIndex
        getCatergory
        getTask
        addTask
        editTask
        getTargetCatergory
        getTargetTask

##### notify methods
        catergoryAdded
        catergoryRemoved
        subCatergoryAdded
        catergoryGot
        taskAdded
        taskGot

#### View
        control the view( good looking :) ) on the page,eg insert, remove or modify the dom in the page after clicking something or doing something else on page
        Also, it will action after being notified by Model notify methods
        Also, it will notify Controller after some buttons have been clicked.(Controller will perform some operations on the data)

        I think View is the most complicated part in this MVC app.The specfic changing on the page(operate on the doms) should be taken out as a method rather than binding directly with the onclick function, because the method will also be used after the data has changed in the Model.We aim to make the code not duplicated.Also in some case, the view changing will not affect the data but sometimes will, so we need to bind some notify method on some clicking action

##### dom perform methods
        showCatergoryList
        removeCatergory
        showTaskList
        showTask
        taskEditMode
        taskAddMode
        addCatergory
        removeCatergoryrebuildCatergoryList

##### notify methods
        addCatergoryBtnClicked
        taskAddConfirmBtnClicked
        taskEditedCancelBtnClicked
        taskFinishBtnClicked

##### being notified methods

#### Controller
        Being notifed by View and use the methods in Model to finish the job.

##### methods
        addCatergory
        removeSubCatergory
        removeCatergory
        selectCatergory
        selectSubCatergory
        selectTask
        addTaskt 
        taskEditedConfirm
        taskEditedCancel
        taskFinish