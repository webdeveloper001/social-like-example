(function () {
    'use strict';

    angular
        .module('app')
        .controller('rankSummary', rankSummary);

    rankSummary.$inject = ['dialog', '$stateParams', '$state', 'answers', 'datetime'
        , 'answer', 'mrecs', 'rank','catansrecs','$filter','table','vrowvotes', '$window'
        , '$rootScope', '$modal', 'edits', 'editvote', 'votes', 'useractivities','catans'];

    function rankSummary(dialog, $stateParams, $state, answers, datetime
        , answer, mrecs, rank, catansrecs, $filter, table, vrowvotes, $window
        , $rootScope, $modal, edits, editvote, votes, useractivities, catans) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'rankSummary';
        vm.addAnswerDisabled = '';
        
        
        // Methods
        vm.answerDetail = answerDetail;
        vm.addAnswer = addAnswer;
        vm.goRank = goRank;
        vm.closeRank = closeRank;
        vm.rankOverall = rankOverall;
        vm.rankPersonal = rankPersonal;
        vm.closeAddInfoMsg = closeAddInfoMsg;
        vm.whyNoDistance = whyNoDistance;
        vm.sortByRank = sortByRank;
        vm.sortByDistance = sortByDistance;

        vm.selOverall = 'active';
        vm.selPersonal = '';
        vm.selRank = 'active';
        vm.selDistance = '';
        //var myParent = $rootScope.parentNum;

        var votetable = [];
        var editvotetable = [];
        $rootScope.cvotes = [];
        $rootScope.ceditvotes = [];
        $rootScope.cmrecs_user = [];        
        
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
        
        //Adjust picture size for very small displays
        if ($window.innerWidth < 512) vm.sm = true;
        else vm.sm = false;

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
            
            rank.computeRanking($rootScope.canswers, $rootScope.cmrecs);

            //Sort by rank here (this is to grab images of top 3 results)
            vm.answers = $filter('orderBy')(vm.answers, '-Rank');
            
            //Instead of rank point just show index in array
            for (var i=0; i< vm.answers.length; i++){
                vm.answers[i].Rank = i+1;
            }
            vm.answers = $filter('orderBy')(vm.answers, 'Rank');
            
            
            //Check and update if necessary ranking and Num of items per rank, only for atomic ranks
            if ($rootScope.cCategory.isatomic == true){
                for (var i = 0; i < vm.answers.length; i++) {
                    if (vm.answers[i].Rank != vm.answers[i].catansrank) {
                        //console.log("Updated Catans Rank", vm.answers[i].catans);
                        catans.updateRec(vm.answers[i].catans, ['rank'], [vm.answers[i].Rank]);
                    }
                }
            }
                        
            //check that number of answer is same as store in content object
            //if different, compute answertags and update table - only if rank is atomic
            if ($rootScope.cCategory.isatomic == true){
                if (vm.answers.length != $rootScope.cCategory.answers && vm.answers.length > 0) {
                    console.log("Updating Answer Tags");
                    var answertags = vm.answers[0].name;
                    for (var n = 1; n < vm.answers.length; n++) {
                        answertags = answertags + ' ' + vm.answers[n].name;
                    }
                    table.update($rootScope.cCategory.id, ['answertags'], [answertags]);
                }
            }
            
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
                           // if (votetable[i].catans == $rootScope.ccatans[j].id) {
                                var voteitem = votetable[i];
                                //voteitem.vtidx = i;
                                $rootScope.cvotes.push(voteitem);
                           // }
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
                
                //Vrow Votes for this user
                vrowvotes.loadVrowVotes().then(function (vrowvotes) {
                   $rootScope.cvrowvotes = vrowvotes;
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
            
            vm.ranking = $rootScope.cCategory.title;
                        
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
                case "Thing":{fidx=7; break;}
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
            //if neighborhood is implied or screen is small dont show column
            //if ($rootScope.NhImplied || vm.sm){
            if ($rootScope.NhImplied || vm.sm){    
                for (var i=0; i<vm.fields.length;i++){
                    if (vm.fields[i].name == 'cityarea' ) {
                        vm.fields[i].isrequired = false;
                        break;
                    } 
                }
            }
            
            //Load current answers
            $rootScope.answers = answers;
            $rootScope.canswers = [];
            $rootScope.ccatans = [];
            $rootScope.B = [];
            
            var obj = {};
            for (var i = 0; i < catansrecs.length; i++) {
                //if rank is atomic 
                if ($rootScope.cCategory.isatomic) {
                    if (catansrecs[i].category == $rootScope.cCategory.id) {
                        for (var k = 0; k < answers.length; k++) {
                            if (catansrecs[i].answer == answers[k].id) {
                                obj = {};
                                obj = answers[k]; 
                                obj.catans = catansrecs[i].id;
                                obj.catansrank = catansrecs[i].rank;
                                $rootScope.canswers.push(obj);
                                $rootScope.ccatans.push(catansrecs[i]);
                            
                                //Collect array of 'current' catans records ids
                                $rootScope.B.push(catansrecs[i].id);
                                break;
                            }
                        }
                    }
                }
                //if not atomic
                else {
                    //Puts numbers into array. Pretty sweet!
                    var catArr = $rootScope.cCategory.catstr.split(':').map(Number);
                    for (var n = 0; n < catArr.length; n++) {
                        if (catansrecs[i].category == catArr[n]) {
                            for (var k = 0; k < answers.length; k++) {
                                if (catansrecs[i].answer == answers[k].id) {
                                    obj = {};
                                    obj = answers[k];
                                    obj.catans = catansrecs[i].id;
                                    obj.catansrank = catansrecs[i].rank;
                                    $rootScope.canswers.push(obj);
                                    $rootScope.ccatans.push(catansrecs[i]);
                            
                                    //Collect array of 'current' catans records ids
                                    $rootScope.B.push(catansrecs[i].id);
                                    break;
                                }
                            }
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
           var cdate = new Date();
           var dayOfWeek = cdate.getDay();
           var isToday = false;
            
           for (var j=0; j<vm.answers.length; j++){
               isToday = false;
               for (var i=0; i< $rootScope.specials.length; i++){
                   if (vm.answers[j].id == $rootScope.specials[i].answer){
                       if ($rootScope.specials[i].freq == 'weekly'){
                           if (dayOfWeek == 0 && $rootScope.specials[i].sun) isToday = true;
                           if (dayOfWeek == 1 && $rootScope.specials[i].mon) isToday = true;
                           if (dayOfWeek == 2 && $rootScope.specials[i].tue) isToday = true;
                           if (dayOfWeek == 3 && $rootScope.specials[i].wed) isToday = true;
                           if (dayOfWeek == 4 && $rootScope.specials[i].thu) isToday = true;
                           if (dayOfWeek == 5 && $rootScope.specials[i].fri) isToday = true;
                           if (dayOfWeek == 6 && $rootScope.specials[i].sat) isToday = true;
                           if (isToday){
                                vm.answers[j].sp_bc = $rootScope.specials[i].bc;
                                vm.answers[j].sp_fc = $rootScope.specials[i].fc;
                                vm.answers[j].sp_title = $rootScope.specials[i].stitle;
                                break;
                           }
                       }
                       
                   }
               }
               /*
               if (!isToday){
                   vm.answers.sp_bc = 'auto';
                   vm.answers.sp_fc = 'auto';
                   vm.answers.sp_title = '';
               }
               */
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
            if ($rootScope.canswers.length >= 30) {
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
        
        function sortByRank(){
            function compare(a, b) {
                return a.Rank - b.Rank;
            }
            vm.answers = vm.answers.sort(compare);
            //vm.answers = $filter('orderBy')(vm.answers, 'Rank');
            vm.selRank = 'active';
            vm.selDistance = '';
        }
        
        function sortByDistance(){
            function compare(a, b) {
                return a.dist - b.dist;
            }
            vm.answers = vm.answers.sort(compare);
            //vm.answers = $filter('orderBy')(vm.answers, 'dist');
            vm.selRank = '';
            vm.selDistance = 'active';
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
