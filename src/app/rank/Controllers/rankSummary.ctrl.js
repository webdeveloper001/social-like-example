(function () {
    'use strict';

    angular
        .module('app')
        .controller('rankSummary', rankSummary);

    rankSummary.$inject = ['dialog', '$stateParams', '$state', 'catans', 'datetime'
        , 'answer', 'rank', '$filter', 'table', 'vrowvotes', '$window', 'vrows'
        , '$rootScope', '$modal', 'editvote', 'votes', 'commentops'];

    function rankSummary(dialog, $stateParams, $state, catans, datetime
        , answer, rank, $filter, table, vrowvotes, $window, vrows
        , $rootScope, $modal, editvote, votes, commentops) {
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
        vm.sortByDate = sortByDate;
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
        //var edits = $rootScope.edits;
        var useractivities = $rootScope.alluseractivity;
        var mrecs = $rootScope.mrecs;

        var answersFull = false;
        var updateExec = false;
        var foodNearMe = false;
        vm.fnm = false;
        
        //Comments related variables
        var cObj = {};
        cObj.commLoaded = false;
        cObj.initials = '';
        cObj.bc = '';
        cObj.fc = '';
        cObj.comments = [];
        cObj.newComment = '';
        vm.cm = cObj;

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
        if ($window.innerWidth < 512) { vm.sm = true; vm.nsm = false; }
        else { vm.sm = false; vm.nsm = true; }

        //Blur main input field -- This was done to prevent keyboard from popping out constantly in
        //Safari browsers
        if (document.getElementById("SearchInput") != null && document.getElementById("SearchInput") != undefined) {
            document.getElementById("SearchInput").blur();
        }

        activate();

        function activate() {

            $window.scrollTo(0, 0);
            $rootScope.$emit('showLogo');

            $rootScope.rankIsActive = true;
            $rootScope.objNumAct = $rootScope.objNum;

            loadData(); //load data and write to $rootScope
            //update number of views and answers
            
            getUserData(); //if user is logged in, get user data (vote record, etc)
            createAnswerStatus(); //enables/disables 'Create Answer' button
            
            //Sort first by upV, then execute ranking algorithm
            sortByUpV();
            //rank.computeRanking($rootScope.canswers, $rootScope.cmrecs);
            
            //Sort by rank here (this is to grab images of top 3 results)
            vm.answers = $filter('orderBy')(vm.answers, '-Rank');
            
            //Instead of rank points just show index in array
            for (var i = 0; i < vm.answers.length; i++) {
                vm.answers[i].Rank = i + 1;
            }

            vm.answers = $filter('orderBy')(vm.answers, 'Rank');
            
            //Determine number of user comments
            if ($rootScope.cCategory.numcom == undefined) vm.numcom = 0;
            else vm.numcom = $rootScope.cCategory.numcom;
            
            //Check and update if necessary ranking and Num of items per rank, only for atomic ranks
            if ($rootScope.cCategory.isatomic == true && !foodNearMe) {
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
            if ($rootScope.cCategory.isatomic == true && !foodNearMe) {
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

                if (!foodNearMe) {
                    table.update($rootScope.cCategory.id,
                        ['views', 'answers'],
                        [$rootScope.cCategory.views + 1, $rootScope.canswers.length]);
                }
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
                    if (vm.answers[0].imageurl != undefined && vm.answers[0].imageurl != null) {
                        vm.image1 = vm.answers[0].imageurl;
                        vm.image1ok = true;
                    }
                    else vm.image1ok = false;
                }
                if (!foodNearMe) {
                    table.update($rootScope.cCategory.id,
                        ['views', 'answers', 'image1url'],
                        [$rootScope.cCategory.views + 1, $rootScope.canswers.length,
                            vm.image1]);
                }
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
                    if (vm.answers[0].imageurl != undefined && vm.answers[0].imageurl != null) {
                        vm.image1 = vm.answers[0].imageurl;
                        vm.image1ok = true;
                    }
                    else vm.image1ok = false;
                    if (vm.answers[1].imageurl != undefined && vm.answers[1].imageurl != null) {
                        vm.image2 = vm.answers[1].imageurl;
                        vm.image2ok = true;
                    }
                    else vm.image2ok = false;
                }
                if (!foodNearMe) {
                    table.update($rootScope.cCategory.id,
                        ['views', 'answers', 'image1url', 'image2url'],
                        [$rootScope.cCategory.views + 1, $rootScope.canswers.length,
                            vm.image1, vm.image2]);
                }
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
                    if (vm.answers[0].imageurl != undefined && vm.answers[0].imageurl != null) {
                        vm.image1 = vm.answers[0].imageurl;
                        vm.image1ok = true;
                    }
                    else vm.image1ok = false;
                    if (vm.answers[1].imageurl != undefined && vm.answers[1].imageurl != null) {
                        vm.image2 = vm.answers[1].imageurl;
                        vm.image2ok = true;
                    }
                    else vm.image2ok = false;
                    if (vm.answers[2].imageurl != undefined && vm.answers[2].imageurl != null) {
                        vm.image3 = vm.answers[2].imageurl;
                        vm.image3ok = true;
                    }
                    else vm.image3ok = false;
                }
                if (!foodNearMe) {
                    table.update($rootScope.cCategory.id,
                        ['views', 'answers', 'image1url', 'image2url', 'image3url'],
                        [$rootScope.cCategory.views + 1, $rootScope.canswers.length,
                            vm.image1, vm.image2, vm.image3]);
                }
            }
  
            //Sorting rules
            if (foodNearMe || $rootScope.includeNearMe) sortByDistance();
            if (vm.isE) sortByDate();
            if (!foodNearMe && !vm.isE) vm.showR = true || (!vm.sm);

            //TODO update answers in DB
            if ($rootScope.DEBUG_MODE) console.log("Rank Summary Loaded!");
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

        function answerDetail(x) {
            $state.go("answerDetail", { index: x.id });
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
                    if (vm.type == 'Event') $state.go("addEvent");
                    else $state.go("addAnswer");
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

            if ($rootScope.cCategory.id == 9521) {
                foodNearMe = true;
                vm.fnm = true;
                vm.showR = false;
            }               
                
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
                case "PersonCust": { fidx = 8; break; }
            }

            fields = $rootScope.typeSchema[fidx].fields;
            $rootScope.fields = fields;
            vm.fields = $rootScope.fields;
            vm.type = $rootScope.cCategory.type;

            if (vm.type == 'Event') vm.isE = true;
            else vm.isE = false;

            $rootScope.NhImplied = false;
            $rootScope.NhValue = '';
            if ($rootScope.cCategory.type == 'Establishment' || $rootScope.cCategory.type == 'Event') {
                //Determine if title already contains neighboorhood
                var nhs = $rootScope.neighborhoods.concat($rootScope.districts);
                for (var i = 0; i < nhs.length; i++) {
                    if ($rootScope.cCategory.title.indexOf(nhs[i]) > -1) {
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
                    if (vm.fields[i].name == 'email') {
                        vm.fields[i].isrequired = false;
                        //break;
                    }
                }
            }
            
            //Load current answers
            $rootScope.answers = answers;
            $rootScope.canswers = [];
            var fanswers = [];
            $rootScope.ccatans = [];
            $rootScope.B = [];
            var eventObj = {};
            var obj = {};
            var eventIsCurrent = true;
            
            //Rank is 'Food Near Me' - first time only
            if (foodNearMe && $rootScope.fanswers == undefined) {
                for (var i = 0; i < catansrecs.length; i++) {
                    var catansrec = catansrecs[i];
                    var answerid = 0;
                    var idx = 0;
                    var isDup = false;
                    var ansObj = {};
                    var nidx = 0;

                    var catArr2 = $rootScope.foodranks.cats.split(':').map(Number);

                    for (var j = 0; j < catArr2.length; j++) {
                        if (catansrec.category == catArr2[j]) {
                            answerid = catansrec.answer;
                            //foodAnswersMap = [];
                            //if (foodAnswers.length > 0) {
                            //foodAnswersMap = foodAnswers.map(function(x) {return x.id;});
                            //}
                            idx = $rootScope.answers.map(function (x) { return x.id; }).indexOf(answerid);
                            if (idx < 0) {
                                console.log("idx - ", answerid, "catansrec - ", catansrec.id, catansrec.answer, catansrec.category);
                                catans.deleteRec(catansrec.answer, catansrec.category);
                            }
                            //only add if its not already added
                            isDup = false;
                            if (fanswers.length > 0 && idx > 0) {
                                for (var n = 0; n < fanswers.length; n++) {
                                    if (fanswers[n].id == $rootScope.answers[idx].id) {
                                        isDup = true;
                                        nidx = n;
                                        break;
                                    }
                                }
                            }
                            //if not duplicated, add to answer array. upV is init to first catans record
                            if (!isDup) {
                                ansObj = $rootScope.answers[idx];
                                ansObj.upV = catansrec.upV;
                                fanswers.push(ansObj);
                            }
                            //if duplicated, add upV from new catan
                            if (isDup) {
                                fanswers[nidx].upV = fanswers[nidx].upV + catansrec.upV;
                            }
                        }
                    }
                }
                $rootScope.canswers = fanswers;
                $rootScope.fanswers = fanswers;
            }
            //all other ranks
            if (!foodNearMe) {
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

                                    if (vm.type == 'Event') {

                                        eventObj = JSON.parse(answers[k].eventstr);

                                        //Object.assign(answers[k], eventObj);
                                        mergeObject(answers[k], eventObj);
                                        obj.date = answers[k].sdate.slice(4);
                                        eventIsCurrent = datetime.dateIsCurrent(obj.date);

                                        if (eventIsCurrent) {
                                            $rootScope.canswers.push(obj);
                                            $rootScope.ccatans.push(catansrecs[i]);
                                
                                            //Collect array of 'current' catans records ids
                                            $rootScope.B.push(catansrecs[i].id);
                                            break;
                                        }
                                        else break;
                                    }
                                    else {

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
                    //if rank is not atomic
                    else {
                        //Puts numbers into array. Pretty sweet!
                        var catArr = $rootScope.cCategory.catstr.split(':').map(Number);
                        for (var n = 0; n < catArr.length; n++) {
                            if (catansrecs[i].category == catArr[n]) {
                                for (var k = 0; k < answers.length; k++) {
                                    if (catansrecs[i].answer == answers[k].id && catansrecs[i].isdup != true) {
                                        obj = {};
                                        obj = answers[k];
                                        obj.catans = catansrecs[i].id;
                                        obj.catansrank = catansrecs[i].rank;
                                        obj.upV = catansrecs[i].upV;

                                        if (vm.type == 'Event') {

                                            eventObj = JSON.parse(answers[k].eventstr);

                                            //Object.assign(answers[k], eventObj);
                                            mergeObject(answers[k], eventObj);
                                            obj.date = answers[k].sdate.slice(4);
                                            eventIsCurrent = datetime.dateIsCurrent(obj.date);

                                            if (eventIsCurrent) {
                                                $rootScope.canswers.push(obj);
                                                $rootScope.ccatans.push(catansrecs[i]);
                                
                                                //Collect array of 'current' catans records ids
                                                $rootScope.B.push(catansrecs[i].id);
                                                break;
                                            }
                                            else break;
                                        }
                                        else {

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

                }
            }
            //if already loaded all near by places
            if (foodNearMe && $rootScope.fanswers) {
                $rootScope.canswers = $rootScope.fanswers;
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
            /*            
            //Load edits for answers in this category
            $rootScope.cedits = [];
            for (var i = 0; i < edits.length; i++) {
                if (edits[i].category == $rootScope.cCategory.id) {
                    var edititem = edits[i];
                    $rootScope.cedits.push(edititem);
                }
            }
            */
            //Load UserActivity data
            $rootScope.cuseractivity = [];
            for (var i = 0; i < useractivities.length; i++) {
                if (useractivities[i].category == $rootScope.cCategory.id) {
                    $rootScope.cuseractivity.push(useractivities[i]);
                }
            }
            vm.numContributors = $rootScope.cuseractivity.length;
            
            //data loading completed
            vm.isLoading = false;
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
            getDisplayImages();

            $rootScope.canswers = vm.answers;
            //vm.answers = $filter('orderBy')(vm.answers, 'Rank');
            vm.selRank = 'active';
            vm.selDistance = '';
            vm.selUpV = '';
            vm.selDate = '';

            vm.showR = true || (!vm.sm);
        }

        function sortByDistance() {
            function compare(a, b) {
                return a.dist - b.dist;
            }

            if (vm.haveLocation) {
                vm.answers = vm.answers.sort(compare);
                getDisplayImages();
                $rootScope.canswers = vm.answers;
                //vm.answers = $filter('orderBy')(vm.answers, 'dist');
                vm.selRank = '';
                vm.selDistance = 'active';
                vm.selUpV = '';
                vm.selDate = '';

                if (foodNearMe) vm.answers = vm.answers.slice(0, 99);
            }
            else {
                dialog.askPermissionToLocate();
            }
        }

        function sortByUpV() {
            function compare(a, b) {
                return b.upV - a.upV;
            }
            vm.answers = vm.answers.sort(compare);
            getDisplayImages();

            $rootScope.canswers = vm.answers;
            //vm.answers = $filter('orderBy')(vm.answers, 'dist');
            vm.selRank = '';
            vm.selDistance = '';
            vm.selUpV = 'active';
            vm.selDate = '';

            if (!foodNearMe && !vm.isE) vm.showR = false || (!vm.sm);

        }

        function sortByDate() {
            function compare(a, b) {

               var d1 = datetime.date2number(a.date);
               var d2 = datetime.date2number(b.date);
             
               return d1 - d2;
            }

            vm.answers = vm.answers.sort(compare);
            getDisplayImages();

            $rootScope.canswers = vm.answers;
            //vm.answers = $filter('orderBy')(vm.answers, 'dist');
            vm.selRank = '';
            vm.selDistance = '';
            vm.selUpV = '';
            vm.selDate = 'active';

            //if (!vm.isE) vm.showR = false || (!vm.sm);
        }
        function loadComments() {
            commentops.loadComments('category', cObj);
        }
        function postComment() {
            commentops.postComment('category', cObj);
        }

        function getDisplayImages() {
            vm.image1 = "/assets/images/noimage.jpg";
            vm.image2 = "/assets/images/noimage.jpg";
            vm.image3 = "/assets/images/noimage.jpg";

            if (vm.answers[0]) vm.image1 = vm.answers[0].imageurl;
            if (vm.answers[1]) vm.image2 = vm.answers[1].imageurl;
            if (vm.answers[2]) vm.image3 = vm.answers[2].imageurl;
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

        function mergeObject(x, y) {
            x.bc = y.bc;
            x.fc = y.fc;
            x.freq = y.freq;
            x.edate = y.edate;
            x.sdate = y.sdate;
            x.etime = y.etime;
            x.etime2 = y.etime2;
            x.stime = y.stime;
            x.stime2 = y.stime2;
            x.mon = y.mon;
            x.tue = y.tue;
            x.wed = y.wed;
            x.thu = y.thu;
            x.fri = y.fri;
            x.sat = y.sat;
            x.sun = y.sun;
        }

    }
})();
