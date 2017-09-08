(function () {
    'use strict';

    angular
        .module('app')
        .controller('editAnswer', editAnswer);

    editAnswer.$inject = ['dialog', '$stateParams', '$state', '$rootScope', 'catans', '$scope',
    '$modal', 'edit', 'editvote', 'answer', 'image','getgps', 'table',
    '$window','getwiki', '$http'];

    function editAnswer(dialog, $stateParams, $state, $rootScope, catans, $scope, 
    $modal, edit, editvote, answer, image, getgps, table, 
    $window, getwiki, $http) {
        /* jshint validthis:true */
        var vm = this;

        vm.title = 'editAnswer';
        //vm.header = "table" + $rootScope.cCategory.id + ".header";
        //vm.body = 'table' + $rootScope.cCategory.id + '.body';
        
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
        vm.hoursChanged = hoursChanged;
        vm.updateHours = updateHours;
        vm.onNoGoodImages = onNoGoodImages;
        vm.getWiki = getWiki;
        vm.remRank = remRank;
        vm.addCatans = addCatans;
        vm.addcts = addcts;
        
        vm.ranking = $rootScope.title;
        vm.userIsOwner = $rootScope.userIsOwner;
        
        //var A = $rootScope.A;
        //if ($stateParams.index) vm.answer = $rootScope.canswers[A.indexOf(+$stateParams.index)];
        if ($stateParams.index) {
            var isnum = /^\d+$/.test($stateParams.index);
            if(isnum){
                var i = $rootScope.answers.map(function (x) { return x.id; }).indexOf(+$stateParams.index);
                vm.answer = $rootScope.answers[i];
            } else {
                var i = $rootScope.answers.map(function (x) { return x.slug; }).indexOf($stateParams.index);
                vm.answer = $rootScope.answers[i];
            }
        }
        vm.type = vm.answer.type;
        vm.fields = [];
        var publicfield_obj = {};

        vm.edits = [];
        var upVi = [];
        var downVi = [];
        var editvotes = [];
        var recordsUpdated = false;
        var numVotes2accept = 1;
        var numVotes2discard = 1;
        var needEditDelete = false;
        var editDeleteIndex = 0;
        var editIsLocation = false;
        var editAnswerGPSexec = false;
        var requestOnFlight = false;
        
        // Methods
     
        //google search
        var imageLinks = [];
        vm.linkIdx = 0;
        vm.numLinks = 0;
        vm.imageCommand = 'Change Image';
        var attNum = 3;
        vm.imagefunctions = 'none';
        vm.emptyarray=[];
        vm.updateHoursEn = 'disabled'
                
        vm.neighborhoods = $rootScope.neighborhoods.concat($rootScope.districts);
                
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

        var fileUploadedListener = $rootScope.$on('fileUploaded', function (event, data){
                $rootScope.cmd1exe = $rootScope.cmd1exe ? $rootScope.cmd1exe : false;        
            if ($state.current.name == 'editAnswer' && !$rootScope.cmd1exe) {
                $rootScope.cmd1exe = true;
                $rootScope.blobimage = data;
                vm.imageURL = $rootScope.blobimage;
                selectImage();                
            }
        });
        
        var answerGPSreadyListener = $rootScope.$on('answerGPSready', function () {
            if ($state.current.name == 'editAnswer' && !editAnswerGPSexec) editAnswerGPS();
        });
        
        var wikiReadyListener = $rootScope.$on('wikiReady', function (event,wikiRes) {
            if ($state.current.name == 'editAnswer') loadWiki(wikiRes);
        });

        $scope.$on('$destroy',fileUploadedListener);
        $scope.$on('$destroy', answerGPSreadyListener);
        $scope.$on('$destroy',wikiReadyListener);
        
        //Adjust picture size for very small displays
        if ($window.innerWidth < 512) {vm.sm = true; vm.nsm=false;}
        else {vm.sm = false; vm.nsm = true;}
                    
        activate();

        function activate() {

            //Set custom rank flag
            if ($rootScope.cCategory != undefined){
                if ($rootScope.cCategory.owner != undefined && $rootScope.cCategory.owner != 0 ) $rootScope.isCustomRank = true;
                else $rootScope.isCustomRank = false;
            }

            $window.scrollTo(0, 0);
            
            //country.loadCountries();
            //vm.countries = $rootScope.cCountries;
            loadAnswerData();
            loadAnswerRanks();
            prepareCatansOptions();
            if (vm.userIsOwner && vm.type == 'Establishment') loadHoursData();
            
            vm.access = vm.userIsOwner && vm.answer.isactive;
            
            
            getEdits(vm.answer.id);

            if ($rootScope.DEBUG_MODE) console.log("Edit Answer Activated!");
        }

        function loadAnswerData() {

            vm.imageURL = vm.answer.imageurl;

            for (var i = 0; i < $rootScope.fields.length; i++) {
                publicfield_obj = {};
                publicfield_obj.field = $rootScope.fields[i].name;
                publicfield_obj.onlybyowner = $rootScope.fields[i].onlybyowner;
                switch ($rootScope.fields[i].name) {
                    case "name": { publicfield_obj.cval = vm.answer.name; break; }
                    case "cityarea": { publicfield_obj.cval = vm.answer.cityarea; break; }
                    case "location": { publicfield_obj.cval = vm.answer.location; break; }
                    case "addinfo": { publicfield_obj.cval = vm.answer.addinfo; break; }
                    case "phone": { publicfield_obj.cval = vm.answer.phone; break; }
                    case "website": { publicfield_obj.cval = vm.answer.website; break; }
                    case "email": { publicfield_obj.cval = vm.answer.email; break; }
                }
                publicfield_obj.val = '';
                publicfield_obj.label = $rootScope.fields[i].label;
                
                if (publicfield_obj.field == "cityarea") publicfield_obj.opts ="c for c in vm.neighborhoods";
                else publicfield_obj.opts = "c for c in vm.emptyarray";
                
                vm.fields.push(publicfield_obj);
            }
            
            for (var i = 0; i < vm.fields.length; i++){
                vm.fields[i].val = vm.fields[i].cval; 
            }
            
        }

        function loadAnswerRanks(){
            //Create arrays one for initial value, other one that will be used for comparison 
            vm.answerRanks = [];
            var idx = 0;
            for (var i=0; i < $rootScope.catansrecs.length; i++){
                if ($rootScope.catansrecs[i].answer == vm.answer.id){
                    idx = $rootScope.content.map(function(x) {return x.id; }).indexOf($rootScope.catansrecs[i].category);
                    vm.answerRanks.push($rootScope.content[idx]);
                }
            }
        }

        function prepareCatansOptions(){

            if ($rootScope.DEBUG_MODE) console.log("prepareCatansOptions");

            //search.sibblingRanks($rootScope.cCategory.id);
            vm.addctsopts = [];
            var opt = '';
            //if (answerNeighborhood == undefined || answerNeighborhood == '') answerNeighborhood = 'San Diego';
            for (var i = 0; i < $rootScope.ctsOptions.length; i++) {
                if ($rootScope.ctsOptions[i].indexOf('@neighborhood') > -1) {
                    if (vm.answer.cityarea){
                        opt = $rootScope.ctsOptions[i].replace('@neighborhood', vm.answer.cityarea);
                        vm.addctsopts.push(opt);
                    }
                }
                else vm.addctsopts.push($rootScope.ctsOptions[i]);
            }
        }

        function addCatans(){            
            vm.addctsactive = true;
        }

        function addcts(){
            var typemismatch = false;
            var rankObj = {};
            var idx = $rootScope.content.map(function(x) {return x.title; }).indexOf(vm.addctsval);  
            //Check types match
            if (vm.answer.type == 'Person' && 
                $rootScope.content[idx].type != 'Person') typemismatch = true;
            if (vm.answer.type == 'Event' && 
                $rootScope.content[idx].type != 'Event') typemismatch = true;
            if (vm.answer.type == 'Thing' && 
                $rootScope.content[idx].type != 'Thing') typemismatch = true;
            if (vm.answer.type == 'PersonCust' && 
                $rootScope.content[idx].type != 'PersonCust') typemismatch = true;        
            if ((vm.answer.type == 'Place' || 
                vm.answer.type == 'Establishment' || 
                vm.answer.type == 'Organization') &&  
                ($rootScope.content[idx].type != 'Place' &&
                $rootScope.content[idx].type != 'Establishment' &&
                $rootScope.content[idx].type != 'Organization')) typemismatch = true;
            
            if (typemismatch) dialog.typemismatch($rootScope.content[idx].type,vm.answer.type);
            else  dialog.confirmAddRank($rootScope.content[idx],vm.answer,addRank);     

        }

        function addRank(category,answer){
            catans.postRec2(answer.id, category.id).then(loadAnswerRanks);
            vm.addctsval = '';
            vm.addctsactive = false;
        }

        function remRank(x){
            dialog.confirmRemoveRank(x, vm.answer, remRankConfirmed);    
        }

        function remRankConfirmed(category,answer){
            for (var i=0; i<$rootScope.catansrecs.length; i++){
                if ($rootScope.catansrecs[i].answer == answer.id && 
                    $rootScope.catansrecs[i].category == category.id){
                        catans.deleteRec(answer.id, category.id).then(loadAnswerRanks);
                    }
            }
        }

        function getEdits(answer_id) {
            vm.edits = [];
            upVi = [];
            downVi = [];
            var edit_obj = {}
            for (var i = 0; i < $rootScope.edits.length; i++) {
                if ($rootScope.edits[i].answer == answer_id) {
                    edit_obj = $rootScope.edits[i];
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
                    upVi.push($rootScope.edits[i].upV);
                    downVi.push($rootScope.edits[i].downV);

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
                newEdit.nval = x.val;
                if (!newEdit.cval) newEdit.cval = ''; //So it doesnt display 'undefined'
                newEdit.answer = vm.answer.id;
                newEdit.upV = 0;
                newEdit.downV = 0;
                newEdit.imageURL = '';
                newEdit.display = 'none';
                switch ($rootScope.fields[0].name) {
                    case "name": { newEdit.name = vm.answer.name; break; }
                    //case "country": { newEdit.name = vm.answer.country; break; }
                    //case "club": { newEdit.name = vm.answer.club; break; }
                }
                newEdit.user = $rootScope.user.id;
                newEdit.username = $rootScope.user.name;
                newEdit.timestmp = Date.now();
                //if user is owner - execute userIsOwnerEditDirectly function
                if ($rootScope.userIsOwner) dialog.editConfirm(newEdit, 'field', userIsOwnerEditDirectly);
                //else create edit for image
                else dialog.editConfirm(newEdit, 'field', createEdit);
            }
            else {
                dialog.loginFacebook();
                //dialog.getDialog('notLoggedIn');
                return;
            }

        }

        function editImage() {
            console.log("@editImage");
            if ($rootScope.isLoggedIn) {
                //check that there isnt an edit for that field already
                var editExists = false;
                for (var i = 0; i < vm.edits.length; i++) {
                    if (vm.edits[i].field == "imageurl") {
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
                dialog.loginFacebook();
                //dialog.getDialog('notLoggedIn');
                return;
            }
        }

        function selectImage() {
            if ($rootScope.DEBUG_MODE) console.log("@selectImage");
            var newEdit = {};
            newEdit.field = "imageurl";
            //newEdit.cval = vm.answer.imageurl;
            newEdit.cval = vm.imageURL;
            newEdit.nval = "";
            
            if ($rootScope.userIsOwner) newEdit.imageURL = $rootScope.blobimage;
            //else newEdit.imageURL = vm.imageURL;
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
            //newEdit.category = $rootScope.cCategory.id;
            newEdit.timestmp = Date.now();
            //if user is owner - execute userIsOwnerEditDirectly function
            if ($rootScope.userIsOwner) dialog.editConfirm(newEdit, 'image', userIsOwnerEditDirectly); 
            //else create edit for image
            else dialog.editConfirm(newEdit, 'image', createImageEdit);
            //console.log("$rootScope.userIsOwner - ", $rootScope.userIsOwner);
        }

        //Get the votes for the edits in this answer
        function getEditsVote(x) {

            var editvote_obj = {};

            for (var i = 0; i < $rootScope.editvotes.length; i++) {
                if ($rootScope.editvotes[i].answer == x) {
                    editvote_obj = $rootScope.editvotes[i];
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
                dialog.loginFacebook();
                //dialog.getDialog('notLoggedIn');
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
                dialog.loginFacebook();
                //dialog.getDialog('notLoggedIn');
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

            if ($rootScope.DEBUG_MODE) console.log('updateRecords @ editAnswer');
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
                if (!editIsLocation && !requestOnFlight) answerDetail();
            }
            if (type == 'reject') {
                discardEdit(index);
            }
        }

        function approveEdit(index) {
            //update answer, delete edit record, and delete edit votes
            if ($rootScope.DEBUG_MODE) console.log("Edit has been approved");
            if (vm.edits[index].field == "imageurl") {
                if ($rootScope.DEBUG_MODE) console.log("EA-3");
                answer.updateAnswer(vm.edits[index].answer, [vm.edits[index].field], [vm.edits[index].imageURL]).then(function(){
                    console.log("vm.answer - ", vm.answer);
                    loadAnswerData();

                });
            }
            else if (vm.edits[index].field == "location"){
                     if (vm.edits[index].nval != undefined && vm.edits[index].nval != "" && vm.edits[index].nval != null) {
                         //var idx = $rootScope.answers.map(function(x) {return x.id; }).indexOf(vm.edits[index].answer);
                        editIsLocation = true;
                        vm.answer.location = vm.edits[index].nval;
                        var promise = getgps.getLocationGPS(vm.answer);
                        promise.then(function () {
                        //console.log("myAnswer --- ", myAnswer);
                        //answer.addAnswer(myAnswer).then(rankSummary);
                        });
                     }
            }
            else if (vm.edits[index].field == "cityarea"){
                //if change neighborhood, modify catans as well
                //---Search catans with this answer
                var cidx = 0;
                var cObj = {};
                var sTitle = ''; //searched title
                var rec2change = 0; // id of catans to change
                var change2cat = 0; //category to change to
                var rFound = false;
                for (var i=0; i<$rootScope.catansrecs.length; i++){
                    if ($rootScope.catansrecs[i].answer == vm.answer.id){
                        rFound = false;
                        cidx = $rootScope.content.map(function(x) {return x.id; }).indexOf($rootScope.catansrecs[i].category);
                        cObj = $rootScope.content[cidx];
                        console.log("change nh- ", cidx, cObj);
                        //if category for catans includes old nh, see if category for new nh exists
                        if (cObj.title.indexOf(vm.answer.cityarea) > -1){
                            sTitle = cObj.title.replace(vm.answer.cityarea,vm.edits[index].nval);
                            for (var k=0; k<$rootScope.content.length; k++){
                                //if searched title is found, store catans rec and category
                                if ($rootScope.content[k].title == sTitle){
                                    //console.log($rootScope.content[k].title);
                                    rec2change = $rootScope.catansrecs[i].id;
                                    change2cat = $rootScope.content[k].id;
                                    rFound = true;
                                    break;
                                }
                            }
                            if (rFound){
                                console.log("Changed catans");
                                catans.updateRec(rec2change,['category'],[change2cat]);
                            }
                            else {
                            console.log('dang, have to create table');
                            //if nh not found, create rank from ghost
                            var gidx = $rootScope.categories.map(function(x) {return x.id; }).indexOf(cObj.cat);
                            var nidx = $rootScope.locations.map(function(x) {return x.nh_name; }).indexOf(vm.edits[index].nval);

                            var rObj = {}
                            rObj.cat = $rootScope.categories[gidx].id;
                            rObj.nh = $rootScope.locations[nidx].id;
                            rObj.isatomic = true;
                            rObj.scope = $rootScope.SCOPE;
                            requestOnFlight = true;
                            table.addTable(rObj).then(function(result){
                                console.log('Had to create table, the id is: ', result);
                                catans.updateRec(rec2change,['category'],[result]);
                                answerDetail();
                            });
                            }                         
                        }
                    }
                }
                
                if ($rootScope.DEBUG_MODE) console.log("EA-4");
                answer.updateAnswer(vm.edits[index].answer, [vm.edits[index].field], [vm.edits[index].nval]);
                
            }
            else {
                if ($rootScope.DEBUG_MODE) console.log("EA-2");
                answer.updateAnswer(vm.edits[index].answer, [vm.edits[index].field], [vm.edits[index].nval]);
            }
            /*
            edit.deleteEdit(vm.edits[index].id);
            editvote.deleteEditVotes(vm.edits[index].id);
            //remove from current edits
            $rootScope.edits.splice(vm.edits[index].idx, 1);
            vm.edits.splice(index, 1);
            */
            needEditDelete = true;
            editDeleteIndex = index;
        }
        
        function editAnswerGPS(){
            if (!editAnswerGPSexec) {
                editAnswerGPSexec = true;
                if ($rootScope.DEBUG_MODE) console.log("EA-1"); 
                answer.updateAnswer(vm.answer.id,['location','lat','lng'],[vm.answer.location, vm.answer.lat, vm.answer.lng]).then(answerDetail);
            }
        }

        function discardEdit(index) {
            if ($rootScope.DEBUG_MODE) console.log("Edit has been discarded");
            edit.deleteEdit(vm.edits[index].id);
            editvote.deleteEditVotes(vm.edits[index].id);
            //remove from current edits
            $rootScope.edits.splice(vm.edits[index].idx, 1);
            vm.edits.splice(index, 1);

        }
        function showHowItWorksDialog() {
            dialog.howItWorks('editAnswer');
        }

        function createEdit(newEdit) {
            updateRecords();
            recordsUpdated = false;
            var promise = edit.addEdit(newEdit);
            if ($rootScope.DEBUG_MODE) console.log("creating edit");

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
            
            if (needEditDelete){
                edit.deleteEdit(vm.edits[editDeleteIndex].id);
                editvote.deleteEditVotes(vm.edits[editDeleteIndex].id);
                //remove from current edits
                $rootScope.edits.splice(vm.edits[editDeleteIndex].idx, 1);
                vm.edits.splice(editDeleteIndex, 1);
            }
            
            $state.go("answerDetail", { index: vm.answer.id });
        }


        function processImageResults(results) {

            var n;
            var linkExists = false;
            //Check link results are not repeated.
            for (var j = 0; j < results.length; j++) {
                for (var i = 0; i < imageLinks.length; i++) {
                    n = results[j].localeCompare(imageLinks[i]);
                    if (n == 0) {
                        linkExists = true;
                        break;
                    }
                }
                if (!linkExists) imageLinks.push(results[j]);
            }     
             
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
            if ($rootScope.DEBUG_MODE) console.log('query failed, dont give up');
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
               // $rootScope.$emit('closeRank');
               answerDetail();                              
        }
        
        function loadHoursData(){
            vm.timeDD = ["7:00 AM", "7:30 AM", "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
                "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM",
                "8:00 PM", "8:30 PM", "9:00 PM", "9:30 PM", "10:00 PM", "10:30 PM", "11:00 PM", "11:30 PM", "12:00 AM", "12:30 AM", "1:00 AM", "1:30 AM",
                "2:00 AM", "2:30 AM", "3:00 AM", "3:30 AM", "4:00 AM", "4:30 AM", "5:00 AM", "5:30 AM", "6:00 AM", "6:30 AM"];
                
            vm.openOptions = ["OPEN", "CLOSED"];
            
            if (vm.answer.strhours == undefined || vm.answer.strhours == null || vm.answer.strhours.length == 0){
            var myStr = '[{"day":"MON","opn":"OPEN","st":"8:00 AM","ct":"5:00 PM"},{"day":"TUE","opn":"OPEN","st":"8:00 AM","ct":"5:00 PM"},'+
            '{"day":"WED","opn":"OPEN","st":"8:00 AM","ct":"5:00 PM"},{"day":"THU","opn":"OPEN","st":"8:00 AM","ct":"5:00 PM"},'+
            '{"day":"FRI","opn":"OPEN","st":"8:00 AM","ct":"5:00 PM"},{"day":"SAT","opn":"OPEN","st":"8:00 AM","ct":"5:00 PM"},'+
            '{"day":"SUN","opn":"OPEN","st":"8:00 AM","ct":"5:00 PM"}]';
             vm.openhours = JSON.parse(myStr);
            }
            else {
              vm.openhours = JSON.parse(vm.answer.strhours);  
            }
             
        }
        
        function hoursChanged(){
            vm.updateHoursEn = '';
        }
        
        function updateHours(){
            
            var openhoursx = [];
            var obj = {};
            for (var i=0; i<vm.openhours.length; i++){
                obj = {};
                obj.day = vm.openhours[i].day;
                obj.opn = vm.openhours[i].opn;
                obj.st = vm.openhours[i].st;
                obj.ct = vm.openhours[i].ct;
                openhoursx.push(obj);
            }
            
            var strhours = JSON.stringify(openhoursx);
            
            //delete strhours.$$hashKey;
            //console.log('@updateHours - ', strhours);
            if ($rootScope.DEBUG_MODE) console.log("EA-4");
            answer.updateAnswer(vm.answer.id, ['strhours'], [strhours]);
            vm.updateHoursEn = 'disabled';
        }
        
        function getWiki(){
            var wikiSearchStr = '';
            for (var n=0; n<vm.fields.length; n++){
                if (vm.fields[n].field == 'name'){
                    wikiSearchStr = vm.fields[n].val;
                }
            }
            
            if (wikiSearchStr.length > 0){
                getwiki.getWiki(wikiSearchStr);
            }
            return;
        }
        
        function loadWiki(x){
            console.log("Load Wiki!!", x);
            for (var n=0; n<vm.fields.length; n++){
                if (vm.fields[n].field == 'addinfo'){
                    vm.fields[n].val = x;
                }
            }
            //vm.answer.addinfo = x;       
        }
    
        function userIsOwnerEditDirectly(x){
            if ($rootScope.DEBUG_MODE) console.log("Direct Edit Executed");
            if ($rootScope.DEBUG_MODE) console.log("edit - ", x);
            if (x.field == "imageurl") {
                if ($rootScope.DEBUG_MODE) console.log("R1");
                answer.updateAnswer(x.answer, ['imageurl'], [x.imageURL]);
                //$state.go("editAnswer", { reload: true });
                //$state.go('editAnswer',{index: vm.answer.slug});
                //refreshImage();                
            }
            else if (x.field == "location"){
                     if ($rootScope.DEBUG_MODE) console.log("R2");
                     if (x.nval != undefined && x.nval != "" && x.nval != null) {
                         //var idx = $rootScope.answers.map(function(x) {return x.id; }).indexOf(vm.edits[index].answer);
                        vm.answer.location = x.nval;
                        var promise = getgps.getLocationGPS(vm.answer);
                        promise.then(function () {
                        //console.log("myAnswer --- ", myAnswer);
                        //answer.addAnswer(myAnswer).then(rankSummary);
                        });
                     }
            }
            else {
                if ($rootScope.DEBUG_MODE) console.log("R3");
                answer.updateAnswer(x.answer, [x.field], [x.nval]);
            }
            
            $rootScope.cmd1exe = false;
        }
        
        function onNoGoodImages(x){
            if (x){
                vm.imageURL = $rootScope.EMPTY_IMAGE;
                console.log("vm.imageURL - ", vm.imageURL);
                selectImage();
            }
            else{
                vm.imageURL = imageLinks[vm.linkIdx];
            }
        }
        
    }
})();
