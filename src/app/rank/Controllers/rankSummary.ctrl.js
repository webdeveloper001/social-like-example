(function () {
    'use strict';

    angular
        .module('app')
        .controller('rankSummary', rankSummary);

    rankSummary.$inject = ['dialog', '$stateParams', '$state', 'catans', 'datetime', 'color'
        , 'answer', 'rank', '$filter', 'table', 'vrowvotes', '$window', 'vrows', '$scope'
        , '$rootScope', '$modal', 'editvote', 'votes', 'commentops','flag','Socialshare', '$location', '$q', 'fbusers'];

    function rankSummary(dialog, $stateParams, $state, catans, datetime, color
        , answer, rank, $filter, table, vrowvotes, $window, vrows, $scope
        , $rootScope, $modal, editvote, votes, commentops, flag, Socialshare, $location, $q, fbusers) {
        /* jshint validthis:true */

        var vm = this;
        vm.title = 'rankSummary';
        vm.addAnswerDisabled = '';
        
        //if ($location.absUrl().indexOf('code=')>-1)$window.location.search = '';
        
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
        vm.cmFlag = cmFlag;
        vm.share = share;
        
        vm.selOverall = 'active';
        vm.selPersonal = '';
        vm.selRank = 'active';
        vm.selDistance = '';
        vm.commLoaded = false;
        vm.user = $rootScope.user;
        //var myParent = $rootScope.parentNum;

        var votetable = [];
        var editvotetable = [];
        $rootScope.cvotes = [];
        $rootScope.ceditvotes = [];
        $rootScope.cmrecs_user = [];
        
        //For readability
        var answers = [];
        var catansrecs = [];
        var useractivities = [];
        var mrecs = [];

        var answersFull = false;
        var updateExec = false;
        var foodNearMe = false;
        var rankIsNearMe = false;
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
        vm.hideInfoBox = false;
        if ($rootScope.addInfoMsgAck) vm.addInfoMsgAck = $rootScope.addInfoMsgAck;
        else (vm.addInfoMsgAck = false);
        
        var updateVoteTableListener = $rootScope.$on('updateVoteTable', function () {
            if (!updateExec) updateVoteTable();
            updateExec = true;
        });
        var rankDataLoadedListener = $rootScope.$on('rankDataLoaded', function () {
            vm.dataReady = true;
            activate();
        });

        $scope.$on('$destroy',updateVoteTableListener);
        $scope.$on('$destroy',rankDataLoadedListener);
        
        vm.isMobile = false; 
        // device detection
        if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
            || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) 
            vm.isMobile = true;
        
        //Adjust picture size for very small displays
        if ($window.innerWidth < 512) { vm.sm = true; vm.nsm = false; }
        else { vm.sm = false; vm.nsm = true; }

        //Blur main input field -- This was done to prevent keyboard from popping out constantly in
        //Safari browsers
        if (document.getElementById("SearchInput") != null && document.getElementById("SearchInput") != undefined) {
            document.getElementById("SearchInput").blur();
        }
        
        window.prerenderReady = false;
        
        if ($rootScope.rankSummaryDataLoaded) { vm.dataReady = true; activate(); }
        else vm.dataReady = false;

        function activate() {

            answers = $rootScope.answers;
            catansrecs = $rootScope.catansrecs;
            useractivities = $rootScope.alluseractivity;
            mrecs = $rootScope.mrecs;

            $rootScope.inFavMode = false;
            if ($rootScope.rankIsNearMe == undefined) rankIsNearMe = false;
            else rankIsNearMe = $rootScope.rankIsNearMe;
            
            $window.scrollTo(0, 0);
            $rootScope.$emit('showLogo');

            $rootScope.rankIsActive = true;
            $rootScope.objNumAct = $rootScope.objNum;

            loadData(); //load data and write to $rootScope

            //-----SEO tags ----
            $scope.$parent.$parent.$parent.seo = { 
                pageTitle : $rootScope.cCategory.title, 
                metaDescription: $rootScope.cCategory.question,
            };
            
            //Check if there are no answers
            if (vm.answers.length == 0) vm.noAnswers = true;
            else vm.noAnswers = false;

            getUserData(); //if user is logged in, get user data (vote record, etc)
            createAnswerStatus(); //enables/disables 'Create Answer' button
            
            //Sort first by upV, then execute ranking algorithm
            sortByUpV();
            rank.computeRanking($rootScope.canswers, $rootScope.cmrecs);
            
            //Sort by rank here (this is to grab images of top 3 results)
            //vm.answers = $filter('orderBy')(vm.answers, '-Rank');
            
            //Instead of rank points just show index in array
            for (var i = 0; i < vm.answers.length; i++) {
                vm.answers[i].Rank = i + 1;
            }

            //vm.answers = $filter('orderBy')(vm.answers, 'Rank');
            sortByRank();
            
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
                            if ($rootScope.DEBUG_MODE) console.log("RS-1");
                            catans.updateRec(vm.answers[i].catans, ['rank'], [vm.answers[i].Rank]);
                        }
                    }
                }
            }                        
            
            //Check number of answers for this ranking
            if (vm.answers.length == 0) {
                vm.numAns = 0;

                if (!foodNearMe) {
                    table.update($rootScope.cCategory.id,
                        ['views', 'answers','image1url', 'image2url', 'image3url'],
                        [$rootScope.cCategory.views + 1, $rootScope.canswers.length,'','','']);
                }
            }
            if (vm.answers.length == 1) {
                vm.numAns = 1;
                if ($rootScope.cCategory.type == 'Short-Phrase') {
                    vm.isShortPhrase = true;
                    vm.title1 = vm.answers[0].name;
                    vm.addinfo1 = vm.answers[0].addinfo;
                    vm.image1 = vm.title1 + '##' + vm.addinfo1;
                }
                else {
                    vm.isShortPhrase = false;
                    if (vm.answers[0].imageurl != undefined && vm.answers[0].imageurl != null && vm.answers[0].imageurl != '') {
                        vm.image1 = vm.answers[0].imageurl;
                        vm.image1ok = true;
                    }
                    else vm.image1ok = false;
                }
                if (!foodNearMe) {
                    table.update($rootScope.cCategory.id,
                        ['views', 'answers', 'image1url','image2url', 'image3url'],
                        [$rootScope.cCategory.views + 1, $rootScope.canswers.length,
                            vm.image1,'','']);
                }
            }
            if (vm.answers.length == 2) {
                vm.numAns = 2;
                if ($rootScope.cCategory.type == 'Short-Phrase') {
                    vm.isShortPhrase = true;
                    vm.title1 = vm.answers[0].name;
                    vm.addinfo1 = vm.answers[0].addinfo;
                    vm.image1 = vm.title1 + '##' + vm.addinfo1;
                    vm.title2 = vm.answers[1].name;
                    vm.addinfo2 = vm.answers[1].addinfo;
                    vm.image2 = vm.title2 + '##' + vm.addinfo2;

                }
                else {
                    vm.isShortPhrase = false;
                    if (vm.answers[0].imageurl != undefined && vm.answers[0].imageurl != null && vm.answers[0].imageurl != '') {
                        vm.image1 = vm.answers[0].imageurl;
                        vm.image1ok = true;
                    }
                    else vm.image1ok = false;
                    if (vm.answers[1].imageurl != undefined && vm.answers[1].imageurl != null && vm.answers[1].imageurl != '') {
                        vm.image2 = vm.answers[1].imageurl;
                        vm.image2ok = true;
                    }
                    else vm.image2ok = false;
                }
                if (!foodNearMe) {
                    table.update($rootScope.cCategory.id,
                        ['views', 'answers', 'image1url', 'image2url', 'image3url'],
                        [$rootScope.cCategory.views + 1, $rootScope.canswers.length,
                            vm.image1, vm.image2,'']);
                }
            }

            if (vm.answers.length > 2) {
                vm.numAns = 3;
                if ($rootScope.cCategory.type == 'Short-Phrase') {
                    vm.isShortPhrase = true;
                    vm.title1 = vm.answers[0].name;
                    vm.addinfo1 = vm.answers[0].addinfo;
                    vm.image1 = vm.title1 + '##' + vm.addinfo1;
                    vm.title2 = vm.answers[1].name;
                    vm.addinfo2 = vm.answers[1].addinfo;
                    vm.image2 = vm.title2 + '##' + vm.addinfo2;
                    vm.title3 = vm.answers[2].name;
                    vm.addinfo3 = vm.answers[2].addinfo;
                    vm.image3 = vm.title3 + '##' + vm.addinfo3;
                    
                }
                else {
                    vm.isShortPhrase = false;
                    //Set Images, initialize values
                    vm.image1 = $rootScope.EMPTY_IMAGE;
                    vm.image2 = $rootScope.EMPTY_IMAGE;
                    vm.image3 = $rootScope.EMPTY_IMAGE;
                    vm.image1ok = true;
                    vm.image2ok = true;
                    vm.image3ok = true;
                    //Load rank images with top 3 results with good images
                    var img = 1;
                    for (var n=0; n < vm.answers.length; n++){

                        if (vm.answers[n].imageurl != undefined && vm.answers[n].imageurl != null 
                            && vm.answers[n].imageurl != '' && vm.answers[n].imageurl != $rootScope.EMPTY_IMAGE) {
                            
                            if (img == 3) { vm.image3 = vm.answers[n].imageurl; break; }
                            if (img == 2) { vm.image2 = vm.answers[n].imageurl; img++ }
                            if (img == 1) { vm.image1 = vm.answers[n].imageurl; img++ }                         
                        
                        //vm.image1ok = true;
                        }
                    }                    
                }
                if (!foodNearMe) {
                    table.update($rootScope.cCategory.id,
                        ['views', 'answers', 'image1url', 'image2url', 'image3url'],
                        [$rootScope.cCategory.views + 1, $rootScope.canswers.length,
                            vm.image1, vm.image2, vm.image3]);
                }
            }

            //Set Feautured Image && box color
            if ($rootScope.cCategory.fimage != undefined && $rootScope.cCategory.fimage != ''){
                vm.image3 = vm.image2;
                vm.image2 = vm.image1;
                vm.image1 = $rootScope.cCategory.fimage;
                vm.bc = $rootScope.cCategory.bc;
                vm.fc = $rootScope.cCategory.fc;
                vm.shade = $rootScope.cCategory.shade;              
            }
            else{
                //Set colors for title hideInfoBox
                var colors = color.defaultRankColor($rootScope.cCategory);
                //console.log("colors - ", colors);
                vm.bc = colors[0];
                vm.fc = colors[1];
                vm.shade = -4;
            } 
            
            //Sorting rules
            if ($rootScope.DEBUG_MODE) console.log("foodNearMe, ",foodNearMe);
            if ($rootScope.DEBUG_MODE) console.log("rankIsNearMe, ",rankIsNearMe);

            if (foodNearMe || rankIsNearMe) sortByDistance();
            if (vm.isE) sortByDate();
            if (foodNearMe) vm.showR = false;
            if (!foodNearMe && !vm.isE) vm.showR = true || (!vm.sm);

            //TODO update answers in DB
            $rootScope.modeIsImage = true;
            
            if ($rootScope.DEBUG_MODE) console.log("Rank Summary Loaded!");
            
            window.prerenderReady = true; 
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
                                //Check vote correspond to this category
                                var idx = $rootScope.catansrecs.map(function(x) {return x.id; }).indexOf($rootScope.cvotes[i].catans);
                                if ($rootScope.catansrecs[idx].category == $rootScope.cCategory.id){  
                                    $rootScope.canswers4rank.push($rootScope.canswers[k]);
                                }
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
            votes.loadVotesByUser().then(function (votetable) {
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
            }
            else return;
        }

        function answerDetail(x) {
            $state.go("answerDetail", { index: x.slug });
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
                    if (vm.type == 'Event') {
                        $rootScope.eventmode = 'add';
                        $state.go("addEvent");
                    }
                    else $state.go("addAnswer");
                }
            }
            else {
                //dialog.getDialog('notLoggedIn');
                dialog.loginFacebook();
                return;
            }
        }

        function loadData() {
            
            //Load current category
            $rootScope.cCategory = {};
            for (var i = 0; i < $rootScope.content.length; i++) {
                if (($rootScope.content[i].id == $stateParams.index) || ($rootScope.content[i].slug == $stateParams.index)){
                    $rootScope.cCategory = $rootScope.content[i];
                    break;
                }
            }

            vm.ranking = $rootScope.cCategory.title;
            if ($rootScope.rankIsNearMe) vm.ranking = vm.ranking.replace('in San Diego','close to me');

            if ($rootScope.cCategory.id == 9521) {
                foodNearMe = true;
                vm.fnm = true;
                vm.showR = false;
            }               
                
            //vm.url = 'http://rankdev.azurewebsites.net/#/rankSummary/' + $rootScope.cCategory.id;
            //vm.header = "table" + $rootScope.cCategory.id + ".header";
            //vm.body = 'table' + $rootScope.cCategory.id + '.body';
            //Grab list of fields for the current table
            
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

            var fields = $rootScope.typeSchema[fidx].fields;
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
                                        
                                        //To determine if event is current look at end date if exist if not use start date
                                        //if (eventObj.edate != undefined && eventObj.edate != '') obj.date = answers[k].edate.slice(4);
                                        //else obj.date = answers[k].sdate.slice(4);
                                        eventIsCurrent = datetime.eventIsCurrent(obj, answers[k]);
                                        
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
                                            
                                            //To determine if event is current look at end date if exist if not use start date
                                            //if (eventObj.edate != undefined && eventObj.edate != '') obj.date = answers[k].edate.slice(4);
                                            //else obj.date = answers[k].sdate.slice(4);
                                            eventIsCurrent = datetime.eventIsCurrent(obj, answers[k]);

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
            //compute number of contributions
            $rootScope.cuseractivity = [];
            //if rank is atomic
            if ($rootScope.cCategory.isatomic == true) {
                for (var i = 0; i < useractivities.length; i++) {
                    if (useractivities[i].category == $rootScope.cCategory.id) {
                        $rootScope.cuseractivity.push(useractivities[i]);

                    }
                }
            }
            //else if rank is not atomic ('near me', 'San Diego', etc)
            else {
                var catArr2 = $rootScope.cCategory.catstr.split(':').map(Number);
                for (var i = 0; i < useractivities.length; i++) {
                    for (var j = 0; j < catArr2.length; j++) {
                        if (useractivities[i].category == catArr2[j]) {
                            $rootScope.cuseractivity.push(useractivities[i]);
                            break;
                        }
                    }
                }
            }
            
            vm.numContributors = $rootScope.cuseractivity.length;
            
            //data loading completed
            vm.isLoading = false;
        }


        function createAnswerStatus() {
            /*
            if ($rootScope.canswers.length >= 30) {
                answersFull = true;
            }
            else {
                answersFull = false;
            }*/
            answersFull = false;
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
                $rootScope.loadRankWhenCoordsRdy = true;
                $rootScope.rankIsNearMe = true;
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
            commentops.loadComments('category', cObj)
            .then(function(){

                $q.all(cObj.comments.map(function(comment){ return fbusers.getFBUserById(comment.user); }))
                .then(function (fbUsers){
                    for (var i = 0; i < cObj.comments.length; i++) {
                        cObj.comments[i].picture = fbUsers[i] ? fbUsers[i].picture.data.url : null;
                    }
                });
                
            })
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
            //if ranking is one from answers, return to answer profile
            if ($rootScope.cCategory.title.indexOf('@')>-1){
                $state.go('answerDetail',{index: $rootScope.cCategory.owner});
            }
            else $state.go('cwrapper');
        }

        function closeAddInfoMsg() {
            $rootScope.addInfoMsgAck = true;
            vm.hideInfoBox = true;
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
        
        function cmFlag(x){
            if ($rootScope.isLoggedIn) {
                if ($rootScope.DEBUG_MODE) console.log("Comment Flagged");
                flag.flagAnswer('comment-rank',$rootScope.cCategory.id, x);
                dialog.getDialog('commentFlagged');
                return;
            }
            else dialog.loginFacebook(); 
            //dialog.getDialog('notLoggedIn'); 
        }
            
            function share(){
                vm.linkurl = 'https://rank-x.com/rankSummary/' + $rootScope.cCategory.slug; 
                vm.tweet = $rootScope.cCategory.title + ', endorse your favorite ones at: ';

                var imageurl = "https://rank-x.com/" + $rootScope.cCategory.image1url;
                if ($rootScope.cCategory.type == 'Short-Phrase')
                    imageurl = 'https://rank-x.com/assets/images/rankxlogosd2_sm.png';

                dialog.shareOptions(shareFunction, vm.isMobile, vm.linkurl, 'Rank-X, '+ vm.ranking + ', '+ $rootScope.cCategory.question + '\n' + imageurl, $scope);
            }
            
            function shareFunction(x){
                
                var imageurl = $rootScope.cCategory.image1url;
                if ($rootScope.cCategory.type == 'Short-Phrase')
                    imageurl = 'https://rank-x.com/assets/images/rankxlogosd2_sm.png';
 
                 switch(x){
                    case 'twitter':{
                        if ($rootScope.DEBUG_MODE) console.log(x);
                        Socialshare.share({
                            'provider': 'twitter',
                            'attrs': {
                                'socialshareUrl': vm.linkurl,
                                'socialshareText': vm.tweet,
                                'socialshareHashtags': 'rankxsandiego'
                            }
                        }); 
                        break;
                    }
                    case 'facebook':{
                        if ($rootScope.DEBUG_MODE) console.log(x);
                        FB.ui(
                        {
                            method: 'feed',
                            name: $rootScope.cCategory.title,
                            link: vm.linkurl,
                            picture: imageurl,
                            caption: 'Rank-X San Diego',
                            description: $rootScope.cCategory.question,
                            message: ''
                        }); 
                        break;
                    }  
                    case 'email':{
                        if ($rootScope.DEBUG_MODE) console.log(x);
                        Socialshare.share({
                            'provider': 'email',
                            'attrs': {
                                'socialshareSubject': 'Rank-X, '+vm.ranking,
                                'socialshareBody': vm.linkurl
                            }
                        }); 
                        break;
                    }
                    case 'gplus':{
                        if ($rootScope.DEBUG_MODE) console.log(x);
                        Socialshare.share({
                            'provider': 'google',
                            'attrs': {
                                'socialshareUrl': vm.linkurl,
                                'socialshareText': vm.ranking + ', '+ $rootScope.cCategory.question,
                                'socialshareMedia': imageurl                                
                            }
                        }); 
                        break;
                    }
                    case 'pinterest':{
                        if ($rootScope.DEBUG_MODE) console.log(x);
                        Socialshare.share({
                            'provider': 'pinterest',
                            'attrs': {
                                'socialshareUrl': vm.linkurl,
                                'socialshareText': 'Rank-X, '+ vm.ranking + ', '+ $rootScope.cCategory.question,
                                'socialshareMedia': imageurl                                
                            }
                        }); 
                        break;
                    }
                                     
                    case 'tumblr':{
                        if ($rootScope.DEBUG_MODE) console.log(x);
                        Socialshare.share({
                            'provider': 'tumblr',
                            'attrs': {
                                'socialshareUrl': vm.linkurl,
                                'socialshareText': 'Rank-X, '+ vm.ranking + ', '+ $rootScope.cCategory.question,
                                'socialshareMedia': imageurl                                
                            }
                        }); 
                        break;
                    }
                    case 'reddit':{
                        if ($rootScope.DEBUG_MODE) console.log(x);
                        Socialshare.share({
                            'provider': 'reddit',
                            'attrs': {
                                'socialshareUrl': vm.linkurl,
                                'socialshareText': 'Rank-X, '+ vm.ranking,
                                'socialshareSubreddit': $rootScope.cCategory.question                                
                            }
                        }); 
                        break;
                    }
                    // case 'whatsapp':{
                    //     if ($rootScope.DEBUG_MODE) console.log(x);
                    //     Socialshare.share({
                    //         'provider': 'whatsapp',
                    //         'attrs': {
                    //             'socialshareUrl': vm.linkurl,
                    //             'socialshareText': 'Rank-X, '+ vm.ranking + ', '+ $rootScope.cCategory.question,
                    //          }
                    //     }); 
                    //     break;
                    // }
                    // case 'messenger':{
                    //     if ($rootScope.DEBUG_MODE) console.log(x);
                    //     Socialshare.share({
                    //         'provider': 'facebook-messenger',
                    //         'attrs': {
                    //             'socialshareUrl': vm.linkurl,
                    //          }
                    //     }); 
                    //     break;
                    // }
                    // case 'sms':{
                    //     if ($rootScope.DEBUG_MODE) console.log(x);
                    //     Socialshare.share({
                    //         'provider': 'sms',
                    //         'attrs': {
                    //             'socialshareUrl': vm.linkurl,
                    //             'socialshareText': 'Rank-X, '+ vm.ranking + ', '+ $rootScope.cCategory.question,
                    //          }
                    //     }); 
                    //     break;
                    // }
                } 
            }
    }
})();
