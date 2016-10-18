(function () {
    'use strict';

    angular
        .module('app')
        .controller('rankSummary', rankSummary);

    rankSummary.$inject = ['dialog', '$stateParams', '$state', 'datetime', 'catans'
        , 'answer', 'rank', '$filter', 'table', 'vrowvotes', '$window', 'vrows'
        , '$rootScope', '$modal', 'editvote', 'votes', 'comment'];

    function rankSummary(dialog, $stateParams, $state, datetime, catans
        , answer, rank, $filter, table, vrowvotes, $window, vrows
        , $rootScope, $modal, editvote, votes, comment) {
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
        vm.sortByUpV = sortByUpV;
        vm.loadComments = loadComments;
        vm.postComment = postComment;

        vm.selOverall = 'active';
        vm.selPersonal = '';
        vm.selRank = 'active';
        vm.selDistance = '';
        vm.commLoaded = false;
        //var myParent = $rootScope.parentNum;

        var votetable = [];
        var editvotetable = [];
        $rootScope.cvotes = [];
        $rootScope.ceditvotes = [];
        $rootScope.cmrecs_user = [];
        
        //For readability
        var answers = $rootScope.answers;
        var catansrecs = $rootScope.catansrecs;
        var edits = $rootScope.edits;
        var useractivities = $rootScope.alluseractivity;
        var mrecs = $rootScope.mrecs;

        var answersFull = false;
        var updateExec = false;
        
        //Comments related variables
        var bc = 0;
        var fc = 0;
        var cobj = {};
        vm.isLoggedIn = $rootScope.isLoggedIn == undefined ? false : $rootScope.isLoggedIn;
        
        $rootScope.userHasRank = false;
        $rootScope.userActRecId = 0;

        var canswers = [];
        if ($rootScope.addInfoMsgAck) vm.addInfoMsgAck = $rootScope.addInfoMsgAck;
        else (vm.addInfoMsgAck = false);
        
        //TODO: Would like to add this abstract template, but dont know how         
        $rootScope.$on('$stateChangeSuccess', function (ev, to, toParams, from, fromParams) {
            $rootScope.previousState = from.name;
        });

        $rootScope.$on('updateVoteTable', function () {
            if (!updateExec) updateVoteTable();
            updateExec = true;
        });
        
        //Adjust picture size for very small displays
        if ($window.innerWidth < 512) {vm.sm = true; vm.nsm = false; }
        else {vm.sm = false; vm.nsm = true; }

        //Execute this view only if rankWindow is open
        //if ($rootScope.showR) 
        activate();

        function activate() {

            $rootScope.rankIsActive = true;
            $rootScope.objNumAct = $rootScope.objNum;

            loadData(); //load data and write to $rootScope
            //update number of views and answers
            
            getUserData(); //if user is logged in, get user data (vote record, etc)
            createAnswerStatus(); //enables/disables 'Create Answer' button
            
            //Sort first by upV
            sortByUpV();

            rank.computeRanking($rootScope.canswers, $rootScope.cmrecs);

            //Sort by rank here (this is to grab images of top 3 results)
            vm.answers = $filter('orderBy')(vm.answers, '-Rank');
            
            //Instead of rank points just show index in array
            for (var i = 0; i < vm.answers.length; i++) {
                vm.answers[i].Rank = i + 1;
            }
            vm.answers = $filter('orderBy')(vm.answers, 'Rank');
            vm.showR = true || (!vm.sm);

            if ($rootScope.includeNearMe) {
                sortByDistance();
            }
            
            //Determine number of user comments
            if ($rootScope.cCategory.numcom == undefined) vm.numcom = 0;
            else vm.numcom = $rootScope.cCategory.numcom;
            
            //Check and update if necessary ranking and Num of items per rank, only for atomic ranks
            if ($rootScope.cCategory.isatomic == true) {
                for (var i = 0; i < vm.answers.length; i++) {
                    //console.log("vm.answers[i].Rank, vm.answers[i].catansrank -", vm.answers[i].Rank, vm.answers[i].catansrank);
                    if (vm.answers[i].Rank != vm.answers[i].catansrank) {
                        //console.log("Updated Catans Rank", vm.answers[i].catans);
                        if (vm.answers[i].catans != undefined) {
                            catans.updateRec(vm.answers[i].catans, ['rank'], [vm.answers[i].Rank]);
                        }
                    }
                }
            }
                        
            //check that number of answer is same as store in content object
            //if different, compute answertags and update table - only if rank is atomic
            if ($rootScope.cCategory.isatomic == true) {
                if (vm.answers.length != $rootScope.cCategory.answers && vm.answers.length > 0) {
                    var answertags = vm.answers[0].name;
                    for (var n = 1; n < vm.answers.length; n++) {
                        answertags = answertags + ' ' + vm.answers[n].name;
                    }
                    table.update($rootScope.cCategory.id, ['answertags'], [answertags]);
                }
            }
            
            //Check number of answers for this ranking
            if (vm.answers.length == 0) {
                vm.numAns = 0;
                table.update($rootScope.cCategory.id,
                    ['views', 'answers'],
                    [$rootScope.cCategory.views + 1, $rootScope.canswers.length]);

            }
            if (vm.answers.length == 1) {
                vm.numAns = 1;
                if ($rootScope.cCategory.type == 'Short-Phrase') {
                    vm.isShortPhrase = true;
                    vm.title1 = vm.answers[0].name;
                    vm.addinfo1 = vm.answers[0].addinfo;
                    vm.image1 = vm.title1 + '##' + vm.title1;
                }
                else {
                    vm.isShortPhrase = false;
                    vm.image1 = vm.answers[0].imageurl;
                }

                table.update($rootScope.cCategory.id,
                    ['views', 'answers', 'image1url'],
                    [$rootScope.cCategory.views + 1, $rootScope.canswers.length,
                        vm.image1]);
            }
            if (vm.answers.length == 2) {
                vm.numAns = 2;
                if ($rootScope.cCategory.type == 'Short-Phrase') {
                    vm.isShortPhrase = true;
                    vm.title1 = vm.answers[0].name;
                    vm.addinfo1 = vm.answers[0].addinfo;
                    vm.image1 = vm.title1 + '##' + vm.title1;
                    vm.title2 = vm.answers[1].name;
                    vm.addinfo2 = vm.answers[1].addinfo;
                    vm.image2 = vm.title2 + '##' + vm.title2;

                }
                else {
                    vm.isShortPhrase = false;
                    vm.image1 = vm.answers[0].imageurl;
                    vm.image2 = vm.answers[1].imageurl;
                }
                table.update($rootScope.cCategory.id,
                    ['views', 'answers', 'image1url', 'image2url'],
                    [$rootScope.cCategory.views + 1, $rootScope.canswers.length,
                        vm.image1, vm.image2]);
            }

            if (vm.answers.length > 2) {
                vm.numAns = 3;
                if ($rootScope.cCategory.type == 'Short-Phrase') {
                    vm.isShortPhrase = true;
                    vm.title1 = vm.answers[0].name;
                    vm.addinfo1 = vm.answers[0].addinfo;
                    vm.image1 = vm.title1 + '##' + vm.title1;
                    vm.title2 = vm.answers[1].name;
                    vm.addinfo2 = vm.answers[1].addinfo;
                    vm.image2 = vm.title2 + '##' + vm.title2;
                    vm.title3 = vm.answers[2].name;
                    vm.addinfo3 = vm.answers[2].addinfo;
                    vm.image3 = vm.title3 + '##' + vm.title3;

                }
                else {
                    vm.isShortPhrase = false;
                    vm.image1 = vm.answers[0].imageurl;
                    vm.image2 = vm.answers[1].imageurl;
                    vm.image3 = vm.answers[2].imageurl;
                }

                table.update($rootScope.cCategory.id,
                    ['views', 'answers', 'image1url', 'image2url', 'image3url'],
                    [$rootScope.cCategory.views + 1, $rootScope.canswers.length,
                        vm.image1, vm.image2, vm.image3]);
            }
         
            //TODO update answers in DB
            console.log("Rank Summary Loaded!");
            //console.log("$rootScope.user", $rootScope.user);
            //createVrows();

        }

        function getRankAnswers() {
            $rootScope.canswers4rank = [];
            //get answers that current user has voted Up
            //if ($rootScope.cCategory == 'Establishment') {
            if (true) {    
                for (var i = 0; i < $rootScope.cvotes.length; i++) {
                    if ($rootScope.cvotes[i].vote == 1) {
                        for (var k = 0; k < $rootScope.canswers.length; k++) {
                                    if ($rootScope.cvotes[i].answer == $rootScope.canswers[k].id) {
                                        $rootScope.canswers4rank.push($rootScope.canswers[k]);
                                        //break;
                                    }
                                }
                            }
                        }
            }
                
            
            else {
                $rootScope.canswers4rank = $rootScope.canswers;
            }

            if ($rootScope.canswers4rank.length > 1) vm.rankDisabled = '';
            else vm.rankDisabled = 'disabled';
            
            if ($rootScope.canswers4rank.length > 0) vm.commentAllowed = true;
            else vm.commentAllowed = false;
            
            //console.log("$rootScope.canswers4rank - ", $rootScope.canswers4rank);
        }

        function updateVoteTable() {
            //load content of vote table filtered by user
            votes.loadVotesTable().then(function (votetable) {
                $rootScope.cvotes = votetable;
                getRankAnswers();
            });
        }

        function getUserData() {

            $rootScope.canswers4rank = [];

            if ($rootScope.isLoggedIn) {

                updateVoteTable();                
                
                //Load edit votes for answers in this category
                for (var i = 0; i < $rootScope.editvotes.length; i++) {
                    if ($rootScope.editvotes[i].category == $rootScope.cCategory.id) {
                        var editvoteitem = $rootScope.editvotes[i];
                        $rootScope.ceditvotes.push(editvoteitem);
                    }
                }
                
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
                        $rootScope.userActRec = $rootScope.cuseractivity[i];
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
            if ($rootScope.isLoggedIn) {
                if ($rootScope.canswers4rank.length > 1) {
                    $state.go("match");
                }
                else {
                    dialog.getDialog('answersFew');
                    return;
                }
            }
            else {
                dialog.getDialog('notLoggedIn');
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
            switch ($rootScope.cCategory.type) {
                case "Place": { fidx = 0; break; }
                case "Person": { fidx = 1; break; }
                case "Event": { fidx = 2; break; }
                case "Organization": { fidx = 3; break; }
                case "Short-Phrase": { fidx = 4; break; }
                case "Activity": { fidx = 5; break; }
                case "Establishment": { fidx = 6; break; }
                case "Thing": { fidx = 7; break; }
            }

            fields = $rootScope.typeSchema[fidx].fields;
            $rootScope.fields = fields;
            vm.fields = $rootScope.fields;
            vm.type = $rootScope.cCategory.type;

            $rootScope.NhImplied = false;
            $rootScope.NhValue = '';
            if ($rootScope.cCategory.type == 'Establishment') {
                //Determine if title already contains neighboorhood
                var nhs = $rootScope.neighborhoods.concat($rootScope.districts);            
                for (var i = 0; i < nhs.length; i++) {
                    if ($rootScope.cCategory.title.includes(nhs[i])) {
                        $rootScope.NhImplied = true;
                        $rootScope.NhValue = nhs[i];
                        break;
                    }
                }
            }
            //if neighborhood is implied or screen is small dont show column
            //if ($rootScope.NhImplied || vm.sm){
            if (vm.sm) {
                for (var i = 0; i < vm.fields.length; i++) {
                    if (vm.fields[i].name == 'cityarea') {
                        vm.fields[i].isrequired = false;
                        //break;
                    }
                    if (vm.fields[i].name == 'upV') {
                        vm.fields[i].isrequired = false;
                        //break;
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
                                obj.upV = catansrecs[i].upV;
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
                                    obj.upV = catansrecs[i].upV;
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
            for (var i = 0; i < vm.answers.length; i++) {
                lat = vm.answers[i].lat;
                lng = vm.answers[i].lng;
                a = 0.5 - c((lat - lat_o) * p) / 2 + c(lat_o * p) * c(lat * p) * (1 - c((lng - lng_o) * p)) / 2;

                dist_mi = (12742 * Math.asin(Math.sqrt(a))) / 1.609; // 2 * R; R = 6371 km
                
                if (dist_mi < 1) vm.answers[i].dist = dist_mi.toPrecision(2);
                else vm.answers[i].dist = dist_mi.toPrecision(3);

            }
            vm.haveLocation = true;
            if (vm.answers.length > 0) {
                if (isNaN(vm.answers[0].dist)) {
                    vm.haveLocation = false;
                }
                else vm.haveLocation = true;
            }
            var cdate = new Date();
            var dayOfWeek = cdate.getDay();
            var isToday = false;

            for (var j = 0; j < vm.answers.length; j++) {
                isToday = false;
                for (var i = 0; i < $rootScope.specials.length; i++) {
                    if (vm.answers[j].id == $rootScope.specials[i].answer) {
                        if ($rootScope.specials[i].freq == 'weekly') {
                            if (dayOfWeek == 0 && $rootScope.specials[i].sun) isToday = true;
                            if (dayOfWeek == 1 && $rootScope.specials[i].mon) isToday = true;
                            if (dayOfWeek == 2 && $rootScope.specials[i].tue) isToday = true;
                            if (dayOfWeek == 3 && $rootScope.specials[i].wed) isToday = true;
                            if (dayOfWeek == 4 && $rootScope.specials[i].thu) isToday = true;
                            if (dayOfWeek == 5 && $rootScope.specials[i].fri) isToday = true;
                            if (dayOfWeek == 6 && $rootScope.specials[i].sat) isToday = true;
                            if (isToday) {
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
                    $rootScope.cuseractivity.push(useractivities[i]);
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

        function sortByRank() {
            function compare(a, b) {
                return a.Rank - b.Rank;
            }
            vm.answers = vm.answers.sort(compare);
            //vm.answers = $filter('orderBy')(vm.answers, 'Rank');
            vm.selRank = 'active';
            vm.selDistance = '';
            vm.selUpV = '';

            vm.showR = true || (!vm.sm);
        }

        function sortByDistance() {
            function compare(a, b) {
                return a.dist - b.dist;
            }
            vm.answers = vm.answers.sort(compare);
            //vm.answers = $filter('orderBy')(vm.answers, 'dist');
            vm.selRank = '';
            vm.selDistance = 'active';
            vm.selUpV = '';
        }

        function sortByUpV() {
            function compare(a, b) {
                return b.upV - a.upV;
            }
            vm.answers = vm.answers.sort(compare);
            //vm.answers = $filter('orderBy')(vm.answers, 'dist');
            vm.selRank = '';
            vm.selDistance = '';
            vm.selUpV = 'active';

            vm.showR = false || (!vm.sm);

        }

        function loadComments() {
            
            if (!vm.commLoaded) {
                vm.commLoaded = true;
                if ($rootScope.isLoggedIn){
                    vm.initials = $rootScope.user.name.replace(/[^A-Z]/g, '');
                    getIconColors($rootScope.user.id);
                    vm.bc = bc;
                    vm.fc = fc;
                }
                $rootScope.comments = [];
                
                comment.getcomments().then(function (comments) {
                    vm.comments = comments;
                    for (var i = 0; i < vm.comments.length; i++) {
                        vm.comments[i].initials = vm.comments[i].username.replace(/[^A-Z]/g, '');
                        
                        var datenow = new Date();
                        var tz = datenow.getTimezoneOffset();
                        
                        var cdate = new Date(vm.comments[i].timestmp);
                        cdate.setMinutes( cdate.getMinutes() - tz);
                        
                        vm.comments[i].date = cdate.toLocaleDateString() + ' '+ cdate.toLocaleTimeString(); 
                        getIconColors(vm.comments[i].user);
                        vm.comments[i].bc = bc;
                        vm.comments[i].fc = fc;
                    }
                    //console.log("vm.commLoaded, vm.comments.length, vm.isLoggedIn, vm.commentAllowed ---", vm.commLoaded, vm.comments.length, vm.isLoggedIn, vm.commentAllowed);
                });
            }
        }
        function postComment() {
            
            cobj = {};
            cobj.category = $rootScope.cCategory.id;
            cobj.body = vm.comment;
            cobj.username = $rootScope.user.name;
            cobj.user = $rootScope.user.id;
            cobj.timestmp = Date.now();
            vm.comment = '';
            
            comment.addcomment(cobj).then (function (){
                cobj.initials = $rootScope.user.name.replace(/[^A-Z]/g, '');
                getIconColors($rootScope.user.id);
                //datetime.formatdatetime(cobj);
                cobj.fc = fc;
                cobj.bc = bc;
                cobj.date = 'Just now';
                vm.comments.push(cobj);
                table.update($rootScope.cCategory.id,['numcom'],[vm.comments.length]);
                console.log("vm.comments - ",vm.comments);
            });
        }
        
        function getIconColors(x){
               switch (x % 10) {
                   case 0: {bc = '#b3b3b3'; fc = 'black'; break; }
                   case 1: {bc = '#666666'; fc = 'white'; break; }
                   case 2: {bc = '#006bb3'; fc = 'white'; break; }
                   case 3: {bc = '#009933'; fc = 'white'; break; }
                   case 4: {bc = '#cc0000'; fc = 'white'; break; }
                   case 5: {bc = '#538cc6'; fc = 'black'; break; }
                   case 6: {bc = '#b36b00'; fc = 'white'; break; }
                   case 7: {bc = '#999966'; fc = 'black'; break; }
                   case 8: {bc = '#4d0099'; fc = 'white'; break; }
                   case 9: {bc = '#009999'; fc = 'black'; break; }
               } 
        }

        function closeRank() {
            $state.go('cwrapper');
        }

        function closeAddInfoMsg() {
            $rootScope.addInfoMsgAck = true;
            vm.addInfoMsgAck = true;
        }

        function whyNoDistance() {
            dialog.getLocation(callGetLocation);
        }

        function callGetLocation() {
            $rootScope.$emit('getLocation');
        }
        
        //TODO: Remove!!!! - TEMP function to create vrows for all answers
        function createVrows(){
            var evrows = [];
            var titles = [];
            var obj = {};
            var vrowsobjs = [];
            if ($rootScope.cCategory.tags.includes('food') || $rootScope.cCategory.tags.includes('services') ||
                $rootScope.cCategory.tags.includes('health') || $rootScope.cCategory.tags.includes('beauty') ||
                $rootScope.cCategory.tags.includes('food') || $rootScope.cCategory.title.includes('food') ||
                $rootScope.cCategory.title.includes('restaurants') ||
                $rootScope.cCategory.title.includes('Bars') || $rootScope.cCategory.title.includes('bars') ||
                $rootScope.cCategory.title.includes('pubs') ||
                $rootScope.cCategory.title.includes('Yoga') || $rootScope.cCategory.title.includes('Pilates') ||
                $rootScope.cCategory.title.includes('yoga') || $rootScope.cCategory.title.includes('pilates') ||
                $rootScope.cCategory.title.includes('schools') ||
                $rootScope.cCategory.title.includes('Gyms') || $rootScope.cCategory.title.includes('gyms') ||
                $rootScope.cCategory.title.includes('Nightclubs')){
                for (var i=0; i<$rootScope.canswers.length; i++){
                    //Check that there are no vrows already
                    evrows = [];
                    vrowsobjs = [];
                    for (var k=0; k<$rootScope.cvrows.length; k++){
                        if ($rootScope.cvrows[k].answer == $rootScope.canswers[i].id){
                            evrows.push($rootScope.cvrows[k]);
                        }
                    }
                    
                    //if there are no vrows
                    if (evrows.length == 0){
                        
                        titles = ['Quality of Service','Friendliness of Staff','Promptness of Service','Value for the Money'];
                        
                        if ($rootScope.cCategory.tags.includes('food') || $rootScope.cCategory.title.includes('food') ||
                            $rootScope.cCategory.title.includes('restaurants')){
                            titles = ['Quality of Food and Drinks','Friendliness of Staff','Promptness of Service','Value for the Money'];
                        }
                        if ($rootScope.cCategory.title.includes('Bars') || $rootScope.cCategory.title.includes('bars') ||
                            $rootScope.cCategory.title.includes('pubs')){
                            titles = ['Quality of Drinks','Friendliness of Staff','Promptness of Service','Value for the Money'];
                        }
                        
                        if ($rootScope.cCategory.title.includes('Yoga') || $rootScope.cCategory.title.includes('Pilates') ||
                            $rootScope.cCategory.title.includes('yoga') || $rootScope.cCategory.title.includes('pilates') ||  
                            $rootScope.cCategory.title.includes('schools')) {
                            titles = ['Quality of Instructors','Friendliness of Staff','Class Environment','Value for the Money'];
                        }
                        if ($rootScope.cCategory.title.includes('Gyms') || $rootScope.cCategory.title.includes('gyms') ){
                            titles = ['Equipment & Facilities','Friendliness of Staff','Environment','Value for the Money'];
                        }
                        if ($rootScope.cCategory.title.includes('Nightclubs')){
                            titles = [' Quality of Music','Environment','Friendliness of Staff','Value for the Money'];
                        }
                        //else if ($rootScope.cCategory.tags.includes('services')){
                            
                        //}
                        for (var n=0; n<titles.length; n++){
                            obj = {};
                            obj.gnum = 1;
                            obj.gtitle = 'General';
                            obj.title = titles[n];
                            obj.upV = 0;
                            obj.downV = 0;
                            obj.timestmp = Date.now();
                            obj.answer = $rootScope.canswers[i].id;
                            vrowsobjs.push(obj);
                            //vrows.postRec(obj);                           
                        }
                        vrows.postRec2(vrowsobjs);
                    }
                }
            }
        }
    }
})();
