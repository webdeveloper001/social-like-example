(function () {
    'use strict';

    angular
        .module('app')
        .controller('rankSummary', rankSummary);

    rankSummary.$inject = ['dialog', '$stateParams', '$state', 'answers'
        , 'answer', 'mrecs', 'rank','catansrecs','$filter','table'
        , '$rootScope', '$modal', 'edits', 'editvote', 'votes', 'useractivities'];

    function rankSummary(dialog, $stateParams, $state, answers
        , answer, mrecs, rank, catansrecs, $filter, table
        , $rootScope, $modal, edits, editvote, votes, useractivities) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'rankSummary';
        vm.addAnswerDisabled = '';
        vm.ranking = $rootScope.title;
        
        // Methods
        vm.answerDetail = answerDetail;
        vm.addAnswer = addAnswer;
        vm.goRank = goRank;
        vm.closeRank = closeRank;
        vm.rankOverall = rankOverall;
        vm.rankPersonal = rankPersonal;
        vm.closeAddInfoMsg = closeAddInfoMsg;
        vm.whyNoDistance = whyNoDistance;

        vm.selOverall = 'active';
        vm.selPersonal = '';
        //var myParent = $rootScope.parentNum;

        var votetable = [];
        var editvotetable = [];
        $rootScope.cvotes = [];
        $rootScope.ceditvotes = [];
        $rootScope.cmrecs_user = [];
        $rootScope.catansrecs = catansrecs;
        
        var answersFull = false;

        $rootScope.userHasRank = false;
        $rootScope.userActRecId = 0;

        var canswers = [];
        if ($rootScope.addInfoMsgAck)  vm.addInfoMsgAck = $rootScope.addInfoMsgAck;
        else (vm.addInfoMsgAck = false);
        
        //TODO: Would like to add this abstract template, but dont know how         
        $rootScope.$on('$stateChangeSuccess', function (ev, to, toParams, from, fromParams) {
            $rootScope.previousState = from.name;
        });

        //Execute this view only if rankWindow is open
        //if ($rootScope.showR) 
        activate(); 
        
        function activate() {
            
            $rootScope.rankIsActive = true;
            $rootScope.objNumAct = $rootScope.objNum;

            loadData(); //load data and write to $rootScope
            //update number of views and answers
 //           table.update($rootScope.cCategory.id,['views','answers'],[$rootScope.cCategory.views+1, $rootScope.canswers.length]);
            
            getUserData(); //if user is logged in, get user data (vote record, etc)
            createAnswerStatus(); //enables/disables 'Create Answer' button
            
            vm.tableimage = $rootScope.cCategory.imagefile;
            rank.computeRanking($rootScope.canswers, $rootScope.cmrecs);

            //Sort by rank here (this is to grab images of top 3 results)
            vm.answers = $filter('orderBy')(vm.answers, '-Rank');
            
            //Check number of answers for this ranking
            if (vm.answers.length == 0){
                    vm.numAns = 0;
                    table.update($rootScope.cCategory.id,
                        ['views','answers'],
                        [$rootScope.cCategory.views+1, $rootScope.canswers.length]);
                        
            }
            if (vm.answers.length == 1){
                vm.numAns = 1;
                        if ($rootScope.cCategory.type == 'Short-Phrase'){
                            vm.isShortPhrase = true;
                            vm.title1 = vm.answers[0].name;
                            vm.addinfo1 = vm.answers[0].addinfo;
                            vm.image1 = vm.title1 + '##'+ vm.title1;    
                        }
                        else{
                            vm.isShortPhrase = false;
                            vm.image1 = vm.answers[0].imageurl;
                        }
                        
                    table.update($rootScope.cCategory.id,
                        ['views','answers','image1url'],
                        [$rootScope.cCategory.views+1, $rootScope.canswers.length,
                        vm.image1]);                        
            }
            if (vm.answers.length == 2){
                 vm.numAns = 2;
                    if ($rootScope.cCategory.type == 'Short-Phrase'){
                            vm.isShortPhrase = true;
                            vm.title1 = vm.answers[0].name;
                            vm.addinfo1 = vm.answers[0].addinfo;
                            vm.image1 = vm.title1 + '##'+ vm.title1;
                            vm.title2 = vm.answers[1].name;
                            vm.addinfo2 = vm.answers[1].addinfo;
                            vm.image2 = vm.title2 + '##'+ vm.title2;    
    
                        }
                        else {
                            vm.isShortPhrase = false;
                            vm.image1 = vm.answers[0].imageurl;
                            vm.image2 = vm.answers[1].imageurl;
                        }
                    table.update($rootScope.cCategory.id,
                        ['views','answers','image1url','image2url'],
                        [$rootScope.cCategory.views+1, $rootScope.canswers.length,
                        vm.image1, vm.image2]);
            }

            if (vm.answers.length > 2){
                vm.numAns = 3;
                 if ($rootScope.cCategory.type == 'Short-Phrase'){
                            vm.isShortPhrase = true;
                            vm.title1 = vm.answers[0].name;
                            vm.addinfo1 = vm.answers[0].addinfo;
                            vm.image1 = vm.title1 + '##'+ vm.title1;
                            vm.title2 = vm.answers[1].name;
                            vm.addinfo2 = vm.answers[1].addinfo;
                            vm.image2 = vm.title2 + '##'+ vm.title2;
                            vm.title3 = vm.answers[2].name;
                            vm.addinfo3 = vm.answers[2].addinfo;
                            vm.image3 = vm.title3 + '##'+ vm.title3;    
    
                        }
                        else {
                            vm.isShortPhrase = false;
                            vm.image1 = vm.answers[0].imageurl;
                            vm.image2 = vm.answers[1].imageurl;
                            vm.image3 = vm.answers[2].imageurl;
                        }

                    table.update($rootScope.cCategory.id,
                        ['views','answers','image1url','image2url','image3url'],
                        [$rootScope.cCategory.views+1, $rootScope.canswers.length,
                        vm.image1, vm.image2, vm.image3]);                        
            }
         
            //TODO update answers in DB
            console.log("Rank Summary Loaded!");
            //console.log("$rootScope.user", $rootScope.user);

        }

        function getUserData() {

            if ($rootScope.isLoggedIn) {
                votes.loadVotesTable().then(function (votetable) {
                    //Load votes for this category
                    for (var i = 0; i < votetable.length; i++) {
                        for (var j = 0; j < $rootScope.ccatans.length; j++) {
                            if (votetable[i].catans == $rootScope.ccatans[j].id) {
                                var voteitem = votetable[i];
                                //voteitem.vtidx = i;
                                $rootScope.cvotes.push(voteitem);
                            }
                        }
                    }
                });
                editvote.loadEditVotesTable().then(function (editvotes) {
                    //Load edit votes for answers in this category
                    for (var i = 0; i < editvotes.length; i++) {
                        if (editvotes[i].category == $rootScope.cCategory.id) {
                            var editvoteitem = editvotes[i];
                            $rootScope.ceditvotes.push(editvoteitem);
                        }
                    }
                });
                
                //All mrecs for this categroy from this user
                $rootScope.cmrecs_user = [];
                for (var i = 0; i < $rootScope.cmrecs.length; i++) {
                    if ($rootScope.cmrecs[i].user == $rootScope.user.id) {
                        $rootScope.cmrecs_user.push($rootScope.cmrecs[i]);
                    }
                }
                
                //Load UserActivity data
                $rootScope.cuseractivity_user = [];
                for (var i = 0; i < $rootScope.cuseractivity.length; i++) {
                    if ($rootScope.cuseractivity[i].user == $rootScope.user.id) {
                        $rootScope.userHasRank = true;
                        $rootScope.userActRecId = $rootScope.cuseractivity[i].id;
                        break;
                    }
                }

            }
            else return;
        }

        function getAnswers() {

            answer.getAnswers().then(success, fail);

            function success(results) {

                vm.answers = results;

            }

            function fail(error) {

                console.log("error", error);
            }
        }

        function answerDetail(index) {
            $state.go("answerDetail", { index: index });
        }

        function goRank() {
            if ($rootScope.canswers.length > 1) {
                $state.go("match");
            }
            else {
                dialog.getDialog('answersFew');
                return;
            }
        }

        function addAnswer() {
            if ($rootScope.isLoggedIn) {            
                if (answersFull) {
                    dialog.getDialog('answersFull');
                    return;
                }
                else {
                    $state.go("addAnswer");
                }
            }
            else {
                dialog.getDialog('notLoggedIn');
                return;
            }
        }

        function loadData() {
            
            //Load current category
            $rootScope.cCategory = {};
            for (var i = 0; i < $rootScope.content.length; i++) {
                if ($rootScope.content[i].id == $stateParams.index) {
                    $rootScope.cCategory = $rootScope.content[i];
                    break;
                }
            }
                        
            //vm.url = 'http://rankdev.azurewebsites.net/#/rankSummary/' + $rootScope.cCategory.id;
            //vm.header = "table" + $rootScope.cCategory.id + ".header";
            //vm.body = 'table' + $rootScope.cCategory.id + '.body';
            //Grab list of fields for the current table
            
            var fields = [];  
            
            var fidx = 0;
            switch($rootScope.cCategory.type){
                case "Place":       {fidx=0; break;}
                case "Person":      {fidx=1; break;}
                case "Event":       {fidx=2; break;}
                case "Organization":{fidx=3; break;}
                case "Short-Phrase":{fidx=4; break;}
                case "Activity":    {fidx=5; break;}
                case "Establishment":{fidx=6; break;}
            }
                 
            fields = $rootScope.typeSchema[fidx].fields;  
            $rootScope.fields = fields;
            vm.fields = $rootScope.fields;
            vm.type = $rootScope.cCategory.type;
            
            $rootScope.NhImplied = false;
            $rootScope.NhValue = '';
            if ($rootScope.cCategory.type == 'Establishment'){
            //Determine if title already contains neighboorhood            
            for (var i=0; i< $rootScope.neighborhoods.length; i++){
                if ($rootScope.cCategory.title.includes($rootScope.neighborhoods[i])){
                    $rootScope.NhImplied = true;
                    $rootScope.NhValue = $rootScope.neighborhoods[i];
                    break;                    
                }
            }
            }
            if ($rootScope.NhImplied){
                for (var i=0; i<vm.fields.length;i++){
                    if (vm.fields[i].name == 'cityarea') vm.fields[i].isrequired = false; 
                }
            }
            
            //Load current answers
            $rootScope.answers = answers;
            $rootScope.canswers = [];
            $rootScope.ccatans = [];
            $rootScope.B = [];
            
            for (var i = 0; i < catansrecs.length; i++) {
                if (catansrecs[i].category == $rootScope.cCategory.id) {
                    for (var k = 0; k < answers.length; k++){
                        if (catansrecs[i].answer == answers[k].id){
                            $rootScope.canswers.push(answers[k]);
                            $rootScope.ccatans.push(catansrecs[i]);
                            
                            //Collect array of 'current' catans records ids
                            $rootScope.B.push(catansrecs[i].id);
                            break;        
                        }
                    }                    
                }
            }    
            vm.answers = $rootScope.canswers;
            
            //Calculate distances to user
            var p = 0.017453292519943295;    // Math.PI / 180
            var c = Math.cos;
            var a = 0;
            var lat_o = $rootScope.currentUserLatitude;
            var lng_o = $rootScope.currentUserLongitude;
            var lat = 0;
            var lng = 0;
            var dist_mi = 0;
            for (var i=0; i < vm.answers.length; i++){
                lat = vm.answers[i].lat;
                lng = vm.answers[i].lng;
                a = 0.5 - c((lat - lat_o) * p)/2 + c(lat_o * p) * c(lat * p) * (1 - c((lng - lng_o) * p))/2;

                dist_mi =  ( 12742 * Math.asin(Math.sqrt(a)) ) / 1.609; // 2 * R; R = 6371 km
                vm.answers[i].dist = dist_mi.toPrecision(3);
                    
            }
            vm.haveLocation = true;
            if (vm.answers.length > 0){
                if (isNaN(vm.answers[0].dist)) {
                    vm.haveLocation = false;
                    }
                else vm.haveLocation = true;
            }
            
            
            //*****TEMP********
            //vm.answers.specials = [];
            /*
            for (var i = 0; i < vm.answers.length; i++) {
                if (i==1) {
                    vm.answers[i].specials = 'Its Happy Hour!';
                    vm.answers[i].style = 'happy';
                }
                else {
                    vm.answers[i].specials = '---';
                    vm.answers[i].style = '';
                }
                
            }
            */
            //**************************************88
            
           
            //Load current mrecs
            $rootScope.cmrecs = [];
            for (var i = 0; i < mrecs.length; i++) {
                if (mrecs[i].category == $rootScope.cCategory.id) {
                    $rootScope.cmrecs.push(mrecs[i]);
                }
            }
                        
            //Load edits for answers in this category
            $rootScope.cedits = [];
            for (var i = 0; i < edits.length; i++) {
                if (edits[i].category == $rootScope.cCategory.id) {
                    var edititem = edits[i];
                    $rootScope.cedits.push(edititem);
                }
            }
            
            //Load UserActivity data
            $rootScope.cuseractivity = [];
            for (var i = 0; i < useractivities.length; i++) {
                if (useractivities[i].category == $rootScope.cCategory.id) {
                    var activityitem = useractivities[i];
                    $rootScope.cuseractivity.push(activityitem);
                }
            }
            vm.numContributors = $rootScope.cuseractivity.length;
            
            
        }


        function createAnswerStatus() {
            if ($rootScope.canswers.length >= 20) {
                answersFull = true;
            }
            else {
                answersFull = false;
            }
        }

        function rankPersonal() {
            if ($rootScope.isLoggedIn) {
                if ($rootScope.cmrecs_user.length > 0) {
                    vm.selOverall = '';
                    vm.selPersonal = 'active';
                    vm.numContributors = 1;
                    rank.computeRanking($rootScope.canswers, $rootScope.cmrecs_user);
                }
                else dialog.getDialog('noPersonalRank');
            }
            else dialog.getDialog('notLoggedIn');
        }

        function rankOverall() {
            vm.selOverall = 'active';
            vm.selPersonal = '';
            vm.numContributors = $rootScope.cuseractivity.length;
            rank.computeRanking($rootScope.canswers, $rootScope.cmrecs);
        }
        
        function closeRank() {
               $state.go('cwrapper');                            
        }
        
        function closeAddInfoMsg(){
            $rootScope.addInfoMsgAck = true;
            vm.addInfoMsgAck =true;
        }
        
        function whyNoDistance(){
            dialog.getLocation(callGetLocation);
        }
        
        function callGetLocation(){
            $rootScope.$emit('getLocation');  
        }
        
    }
})();
