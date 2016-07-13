(function () {
    'use strict';

    angular
        .module('app')
        .controller('editAnswer', editAnswer);

    editAnswer.$inject = ['dialog', '$stateParams', '$state', 'answers', '$rootScope', 
    '$modal', 'edit', 'editvote', 'answer', 'image'];

    function editAnswer(dialog, $stateParams, $state, answers, $rootScope, 
    $modal, edit, editvote, answer, image) {
        /* jshint validthis:true */
        var vm = this;

        vm.title = 'editAnswer';
        vm.header = "table" + $rootScope.cCategory.id + ".header";
        vm.body = 'table' + $rootScope.cCategory.id + '.body';
        
        // Members
        vm.answer = {};

        vm.showHowItWorksDialog = showHowItWorksDialog;
        vm.editField = editField;
        vm.editAgree = editAgree;
        vm.editImage = editImage;
        vm.selectImage = selectImage;
        vm.viewPrev = viewPrev;
        vm.viewNext = viewNext;
        vm.closeRank = closeRank;
        vm.editDisagree = editDisagree;
        vm.answerDetail = answerDetail;
        vm.ranking = $rootScope.title;

        var A = $rootScope.A;
        if ($stateParams.index) vm.answer = $rootScope.canswers[A.indexOf(+$stateParams.index)];
        vm.imageURL = vm.answer.imageurl;
        vm.fields = [];
        var publicfield_obj = {};

        vm.edits = [];
        var upVi = [];
        var downVi = [];
        var editvotes = [];
        var recordsUpdated = false;
        var numVotes2accept = 5;
        var numVotes2discard = 5;
        // Methods
     
        //google search
        var imageLinks = [];
        vm.linkIdx = 0;
        vm.numLinks = 0;
        vm.imageCommand = 'Change Image';
        var attNum = 1;
        vm.imagefunctions = 'none';
        vm.emptyarray=[];
                
        //TODO: Would like to add this abstract template, but dont know how               
        $rootScope.$on('$stateChangeSuccess', function (ev, to, toParams, from, fromParams) {
            $rootScope.previousState = from.name;
        });
        $rootScope.$on('$stateChangeStart',
            function (ev, to, toParams, from, fromParams) {
                if (from.name == 'editAnswer') {
                    if (!recordsUpdated) updateRecords();
                }
            });

        //Execute this view only if rankWindow is open
        if ($rootScope.showR) activate();

        function activate() {
            
            //country.loadCountries();
            //vm.countries = $rootScope.cCountries;
            loadAnswerData();
            getEdits(vm.answer.id);

            console.log("Edit Answer Activated!");
        }

        function loadAnswerData() {

            for (var i = 0; i < $rootScope.fields.length; i++) {
                publicfield_obj = {};
                publicfield_obj.field = $rootScope.fields[i].name;
                switch ($rootScope.fields[i].name) {
                    case "name": { publicfield_obj.cval = vm.answer.name; break; }
                    case "cityarea": { publicfield_obj.cval = vm.answer.cityarea; break; }
                    case "location": { publicfield_obj.cval = vm.answer.location; break; }
                    case "addinfo": { publicfield_obj.cval = vm.answer.addinfo; break; }
                }
                publicfield_obj.val = '';
                publicfield_obj.label = $rootScope.fields[i].label;
                
                if (publicfield_obj.field == "country") publicfield_obj.opts ="c for c in vm.countries";
                else publicfield_obj.opts = "c for c in vm.emptyarray";
                
                vm.fields.push(publicfield_obj);
            }
            
            for (var i = 0; i < vm.fields.length; i++){
                vm.fields[i].val = vm.fields[i].cval; 
            }
            
            console.log("fields  ",vm.fields);
            
        }

        function getEdits(answer_id) {
            vm.edits = [];
            upVi = [];
            downVi = [];
            var edit_obj = {}
            for (var i = 0; i < $rootScope.cedits.length; i++) {
                if ($rootScope.cedits[i].answer == answer_id) {
                    edit_obj = $rootScope.cedits[i];
                    edit_obj.vote = 0;
                    edit_obj.idx = i;  //this is index within cedits
                    edit_obj.agree = '';
                    edit_obj.disagree = '';
                    switch ($rootScope.fields[0].name) {
                        case "name": { edit_obj.name = vm.answer.name; break; }
                        //case "country": { edit_obj.name = vm.answer.country; break; }
                        //case "club": { edit_obj.name = vm.answer.club; break; }
                    }
                    //edit_obj.name = vm.answer.name;

                    vm.edits.push(edit_obj);
                    
                    //store initial counters 
                    upVi.push($rootScope.cedits[i].upV);
                    downVi.push($rootScope.cedits[i].downV);

                }
            }
            getEditsVote(vm.answer.id);
        }

        function editField(x) {
            if ($rootScope.isLoggedIn) {
                //check that there isnt an edit for that field already
                var editExists = false;
                for (var i = 0; i < vm.edits.length; i++) {
                    if (vm.edits[i].field == x.field) {
                        editExists = true;
                        break;
                    }
                }

                if (editExists) {
                    dialog.getDialog('editFieldExists');
                    return;
                }

                var newEdit = {};
                newEdit.field = x.field;
                switch (x.field) {
                    case "name": {
                        newEdit.cval = vm.answer.name;
                        break;
                    }
                    case "nickname": {
                        newEdit.cval = vm.answer.nickname;
                        break;
                    }
                    case "club": {
                        newEdit.cval = vm.answer.club;
                        break;
                    }
                    case "country": {
                        newEdit.cval = vm.answer.country;
                        break;
                    }
                }
                newEdit.nval = x.val;
                if (!newEdit.cval) newEdit.cval = ''; //So it doesnt display 'undefined'
                newEdit.answer = vm.answer.id;
                newEdit.upV = 0;
                newEdit.downV = 0;
                newEdit.imageURL = '';
                newEdit.display = 'none'
                switch ($rootScope.fields[0].name) {
                    case "name": { newEdit.name = vm.answer.name; break; }
                    //case "country": { newEdit.name = vm.answer.country; break; }
                    //case "club": { newEdit.name = vm.answer.club; break; }
                }
                newEdit.user = $rootScope.user.id;
                newEdit.username = $rootScope.user.name;
                newEdit.category = $rootScope.cCategory.id;
                newEdit.timestmp = Date.now();

                dialog.editConfirm(newEdit, 'field', createEdit);
            }
            else {
                dialog.getDialog('notLoggedIn');
                return;
            }

        }

        function editImage() {

            if ($rootScope.isLoggedIn) {
                //check that there isnt an edit for that field already
                var editExists = false;
                for (var i = 0; i < vm.edits.length; i++) {
                    if (vm.edits[i].field == "image") {
                        editExists = true;
                        break;
                    }
                }

                if (editExists) {
                    dialog.getDialog('editFieldExists');
                    return;
                }

                var q1 = image.getImageLinks(vm.fields, attNum, 'edit');
                q1.then(processImageResults, imageQueryFailed)
            }
            else {
                dialog.getDialog('notLoggedIn');
                return;
            }
        }

        function selectImage() {
            var newEdit = {};
            newEdit.field = "image";
            newEdit.cval = vm.answer.imageurl;
            newEdit.nval = "";
            newEdit.imageURL = vm.imageURL;
            newEdit.display = 'inline'
            newEdit.answer = vm.answer.id;
            newEdit.upV = 0;
            newEdit.downV = 0;
            switch ($rootScope.fields[0].name) {
                case "name": { newEdit.name = vm.answer.name; break; }
                //case "country": { newEdit.name = vm.answer.country; break; }
                //case "club": { newEdit.name = vm.answer.club; break; }
            }

            newEdit.user = $rootScope.user.id;
            newEdit.username = $rootScope.user.name;
            newEdit.category = $rootScope.cCategory.id;
            newEdit.timestmp = Date.now();

            dialog.editConfirm(newEdit, 'image', createImageEdit);
        }

        //Get the votes for the edits in this answer
        function getEditsVote(x) {

            var editvote_obj = {};

            for (var i = 0; i < $rootScope.ceditvotes.length; i++) {
                if ($rootScope.ceditvotes[i].answer == x) {
                    editvote_obj = $rootScope.ceditvotes[i];
                    editvotes.push(editvote_obj);
                }
            }

            for (i = 0; i < vm.edits.length; i++) {
                for (var j = 0; j < editvotes.length; j++) {
                    if (vm.edits[i].id == editvotes[j].edit) {
                        vm.edits[i].vote = editvotes[j].vote;
                    }
                }
            }
            displayActiveVotes();
        }

        function editAgree(x, index) {
            if ($rootScope.isAdmin){
                dialog.editChangeEffective(vm.edits[index], index, 'approve', editEffective);
                return;
            }
            if ($rootScope.isLoggedIn) {

                switch (x.vote) {
                    case 1: {
                        vm.edits[index].vote = 0;
                        vm.edits[index].upV--;
                        break;
                    }
                    case 0: {
                        vm.edits[index].vote = 1;
                        vm.edits[index].upV++;
                        break;
                    }
                    case -1: {
                        vm.edits[index].vote = 1;
                        vm.edits[index].upV++;
                        vm.edits[index].downV--;
                        break;
                    }
                }
                //console.log("vote, upV, downV",vm.edits[index].vote, vm.edits[index].upV, vm.edits[index].downV );
                checkEditStatus(index);
                displayActiveVotes();
            }
            else {
                dialog.getDialog('notLoggedIn');
                return;
            }
        }

        function editDisagree(x, index) {
            if ($rootScope.isAdmin){
                dialog.editChangeEffective(vm.edits[index], index, 'reject', editEffective);
                return;
            }
            if ($rootScope.isLoggedIn) {
                switch (x.vote) {
                    case 1: {
                        vm.edits[index].vote = -1;
                        vm.edits[index].upV--;
                        vm.edits[index].downV++;
                        break;
                    }
                    case 0: {
                        vm.edits[index].vote = -1;
                        vm.edits[index].downV++;
                        break;
                    }
                    case -1: {
                        vm.edits[index].vote = 0;
                        vm.edits[index].downV--;
                        break;
                    }
                }
                checkEditStatus(index);
                displayActiveVotes();
            }
            else {
                dialog.getDialog('notLoggedIn');
                return;
            }
        }


        function displayActiveVotes() {
            for (var i = 0; i < vm.edits.length; i++) {
                switch (vm.edits[i].vote) {
                    case 1: {
                        vm.edits[i].agree = 'active';
                        vm.edits[i].disagree = '';
                        break;
                    }
                    case 0: {
                        vm.edits[i].agree = '';
                        vm.edits[i].disagree = '';
                        break;
                    }
                    case -1: {
                        vm.edits[i].agree = '';
                        vm.edits[i].disagree = 'active';
                        break;
                    }
                }
            }
        }

        function checkEditStatus(index) {
            //check the new number of agree and disagress, discard edit req, or modify answer if applicable
       
            if (vm.edits[index].upV > vm.edits[index].downV) {
                if ((vm.edits[index].upV - vm.edits[index].downV >= numVotes2accept)) {
                    dialog.editChangeEffective(vm.edits[index], index, 'approve', editEffective);
                    return;
                }
                /*
                if (vm.edits[index].downV > 0 && (vm.edits[index].upV / vm.edits[index].downV) >= 4) {
                    dialog.editChangeEffective(vm.edits[index], index, 'approve', editEffective);
                    return;
                }
                */
            }
            else if (vm.edits[index].downV > vm.edits[index].upV) {
                if ((vm.edits[index].downV - vm.edits[index].upV >= numVotes2discard)) {
                    dialog.editChangeEffective(vm.edits[index], index, 'reject', editEffective);
                    return;
                }
                /*
                if (vm.edits[index].upV > 0 && (vm.edits[index].downV / vm.edits[index].upV) >= 3) {
                    dialog.editChangeEffective(vm.edits[index], index, 'approve', editEffective);
                    return;
                }
                */
            }
            return;
        }

        function updateRecords() {

            console.log('updateRecords @ editAnswer');
            var voterecexists = false;
            var session_votes = [];
            var item = {};
            for (var i = 0; i < vm.edits.length; i++) {

                voterecexists = false;
                for (var j = 0; j < editvotes.length; j++) {
                    if (vm.edits[i].id == editvotes[j].edit) {
                        voterecexists = true;
                        break;
                    }
                }
                if (voterecexists) { //record already exist, patch existing record
                    editvote.patchEditVoteRec(editvotes[j].id, vm.edits[i].vote);
                }
                else if (vm.edits[i].vote != 0) { //if there is a vote on this edit
                    
                    item = {};
                    item.edit = vm.edits[i].id;
                    item.user = $rootScope.user.id;
                    item.category = $rootScope.cCategory.id;
                    item.answer = vm.edits[i].answer;
                    item.vote = vm.edits[i].vote;
                    item.timestmp = Date.now();

                    session_votes.push(item);

                }
                //if number of votes changed
                if (vm.edits[i].upV != upVi[i] || vm.edits[i].downV != downVi[i]) {
                    //patch edit item
                    edit.updateEdit(vm.edits[i].id, vm.edits[i].upV, vm.edits[i].downV)
                }

            }

            if (session_votes.length > 0) {
                editvote.postEditVoteRec(session_votes);
                session_votes = [];
            }
            recordsUpdated = true;
        }

        function editEffective(index, type) {
            if (type == 'approve') {
                approveEdit(index);
                answerDetail();
            }
            if (type == 'reject') {
                discardEdit(index);
            }
        }

        function approveEdit(index) {
            //update answer, delete edit record, and delete edit votes
            console.log("Edit has been approved");
            if (vm.edits[index].field == "image") {
                answer.updateAnswer(vm.edits[index].answer, [vm.edits[index].field], [vm.edits[index].imageURL]);
            }
            else {
                answer.updateAnswer(vm.edits[index].answer, [vm.edits[index].field], [vm.edits[index].nval]);
            }
            edit.deleteEdit(vm.edits[index].id);
            editvote.deleteEditVotes(vm.edits[index].id);
            //remove from current edits
            $rootScope.cedits.splice(vm.edits[index].idx, 1);
            vm.edits.splice(index, 1);

        }

        function discardEdit(index) {
            console.log("Edit has been discarded");
            edit.deleteEdit(vm.edits[index].id);
            editvote.deleteEditVotes(vm.edits[index].id);
            //remove from current edits
            $rootScope.cedits.splice(vm.edits[index].idx, 1);
            vm.edits.splice(index, 1);

        }
        function showHowItWorksDialog() {
            dialog.howItWorks('editAnswer');
        }

        function createEdit(newEdit) {
            updateRecords();
            recordsUpdated = false;
            var promise = edit.addEdit(newEdit);
            console.log("creating edit");

            promise.then(function () {
                getEdits(vm.answer.id);
            });
        }

        function createImageEdit(newEdit) {
            updateRecords();
            recordsUpdated = false;
            var promise = edit.addEdit(newEdit);

            promise.then(function () {
                getEdits(vm.answer.id);
                vm.imageURL = vm.answer.imageurl;
                vm.imagefunctions = 'none';
            });
        }

        function answerDetail() {
            $state.go("answerDetail", { index: vm.answer.id });
        }


        function processImageResults(results) {

            imageLinks = imageLinks.concat(results);
            vm.numLinks = imageLinks.length;
            attNum++;
            if (vm.numLinks > 10 || attNum > 4) vm.searchDisabled = 'disabled';
            if (attNum > 1) vm.imageCommand = 'Load More Images'; 
                
            vm.linkIdx = 0;

            vm.imageURL = imageLinks[vm.linkIdx];
            //testImageUrl(imageLinks[vm.linkIdx], showImageNotOk);

            if (vm.numLinks > 0) vm.imagefunctions = 'inline';

        }

        function imageQueryFailed() {
            console.log('query failed, dont give up');
        }

        function viewNext() {
            vm.linkIdx++;
            if (vm.linkIdx >= vm.numLinks) vm.linkIdx = 0;
            vm.imageURL = imageLinks[vm.linkIdx];
        }
        function viewPrev() {
            vm.linkIdx--;
            if (vm.linkIdx < 0) vm.linkIdx = vm.numLinks - 1;
            vm.imageURL = imageLinks[vm.linkIdx];
        }
          function closeRank() {
                $rootScope.$emit('closeRank');                            
        }

    }
})();
