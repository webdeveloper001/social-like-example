(function () {
    'use strict';

    angular
        .module('app')
        .controller('rankSummary', rankSummary);

    rankSummary.$inject = ['dialog', '$stateParams', '$state', 'catans', 'datetime', 'color'
        , 'answer', 'rank', '$filter', 'table', 'vrowvotes', '$window', 'vrows', '$scope','$http'
        , '$rootScope', '$modal', 'editvote', 'votes', 'commentops','flag','Socialshare', 'SERVER_URL',
        '$location', '$q', 'fbusers', 'useractivity', '$timeout','table2','categories','dataloader'];

    function rankSummary(dialog, $stateParams, $state, catans, datetime, color
        , answer, rank, $filter, table, vrowvotes, $window, vrows, $scope, $http
        , $rootScope, $modal, editvote, votes, commentops, flag, Socialshare, SERVER_URL, 
        $location, $q, fbusers, useractivity, $timeout, table2, categories, dataloader) {
        /* jshint validthis:true */

        var vm = this;
        vm.title = 'rankSummary';
        vm.addAnswerDisabled = '';
        vm.mode = "specials";
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
        vm.sortByTrending = sortByTrending;
        vm.loadComments = loadComments;
        vm.postComment = postComment;
        vm.cmFlag = cmFlag;
        vm.share = share;
        vm.changeMode =  changeMode;
        vm.UpVote = UpVote;
        vm.DownVote = DownVote;
        vm.sortbyHelpDialog = sortbyHelpDialog;
        vm.backToResults = backToResults;
        vm.seeMore = seeMore;
        vm.showAllFriendsList = showAllFriendsList;
        
        vm.gotoParentRank = gotoParentRank;
        
        vm.selOverall = 'active';
        vm.selPersonal = '';
        vm.selRank = 'active';
        vm.selDistance = '';
        vm.commLoaded = false;
        vm.userIsOwner = false;
        vm.hasAnswerParent = false;
        vm.isCustomRank = false;
        vm.user = $rootScope.user;
        vm.loadingAnswers = false;
        vm.sortByName = '';
        vm.searchActive = $rootScope.searchActive;
        vm.limit = 20;
        //var myParent = $rootScope.parentNum;

        // var votetable = [];
        // var editvotetable = [];
        // $rootScope.cvotes = [];
        // $rootScope.ceditvotes = [];
        // $rootScope.cmrecs_user = [];
        
        //For readability
        var answers = [];
        var catansrecs = [];
        var useractivities = [];
        var mrecs = [];
        var catArr = [];
        var nhObj = {};

        var answersFull = false;
        var updateExec = false;
        vm.foodNearMe = false;
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
            prepareRankSummary();
        });
        var coordsRdyRankListener = $rootScope.$on('coordsRdy', function () {
            if ($rootScope.DEBUG_MODE) console.log("received coordsreadyrank");
            //loadData();
            //$scope.$apply(function(){
                vm.haveLocation = true;
                getDistances();
                sortByDistance();
                //console.log('scope.$digest() - ', $scope.$digest());
                //if (!scope.$digest()) 
                $timeout(function(){
                    $scope.$apply();
                });
                    
            //});
        });
                               
        var stateChangeListener = $rootScope.$on('$stateChangeStart',
            function (ev, to, toParams, from, fromParams) {
                if (from.name == 'rankSummary' && to.name != 'rankSummary') {
                     if ($rootScope.isLoggedIn) updateRecords();
                }
            });
        
        $scope.$on('$destroy', stateChangeListener);
        $scope.$on('$destroy',updateVoteTableListener);
        $scope.$on('$destroy',rankDataLoadedListener);
        $scope.$on('$destroy',coordsRdyRankListener);

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
        if ($rootScope.DEBUG_MODE) console.log("$rootScope.rankSummaryDataLoaded - ", $rootScope.rankSummaryDataLoaded);
        if ($rootScope.rankSummaryDataLoaded) {
            prepareRankSummary();
        }
        else vm.dataReady = false;

        function prepareRankSummary(){
            vm.dataReady = true;    
            if ($rootScope.DEBUG_MODE) console.log("$rootScope.isCustomRank - ", $rootScope.isCustomRank);
            //Load current category
            $rootScope.cCategory = null;
            if ($rootScope.isCustomRank){
                for (var i = 0; i < $rootScope.customranks.length; i++) {
                    if (($rootScope.customranks[i].id == $stateParams.index) || ($rootScope.customranks[i].slug == $stateParams.index)){
                        $rootScope.cCategory = $rootScope.customranks[i];
                        break;
                    }
                }
            }
            else{
                if ($rootScope.DEBUG_MODE) console.log("$stateParams.index - ", $stateParams.index);
                for (var i = 0; i < $rootScope.content.length; i++) {
                    if (($rootScope.content[i].id == $stateParams.index) || ($rootScope.content[i].slug == $stateParams.index)){
                        $rootScope.cCategory = $rootScope.content[i];
                        break;
                    }
                }
            }
            //console.log("$rootScope.content.length - ", $rootScope.content.length);
            if ($rootScope.DEBUG_MODE) console.log("$rootScope.cCategory - ", $rootScope.cCategory.id, $rootScope.cCategory.cat);
            if(!$rootScope.cCategory) {
                //console.log("$rootScope.cCategory - ", $rootScope.cCategory);
                //console.log("$stateParams.index - ", $stateParams.index);
                //dialog.notificationWithCallback(
                //'Oops','Couldnt find this ranking. This ranking probably was deleted and its no longer in the database.',
                //backToResults);
            }
            else {
                vm.ranking = $rootScope.cCategory.title;
                if ($rootScope.rankIsNearMe) vm.ranking = vm.ranking.replace('in San Diego', 'close to me');

                if ($rootScope.cCategory.id == 11942) {
                    vm.foodNearMe = true;
                    foodNearMe = true;
                    vm.fnm = true;
                    vm.showR = false;
                    if ($rootScope.coordsRdy == undefined || $rootScope.coordsRdy == false) {
                        sortByDistance();
                    }
                }

                vm.loadingAnswers = true;
                $timeout(function () {
                    if (!foodNearMe) activate();
                    else if ($rootScope.coordsRdy) activate();
                    vm.loadingAnswers = false;
                });
            }
        }

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
            if (!foodNearMe){
                loadTrendVotes(0);
                if ($rootScope.isLoggedIn && $rootScope.friends_votes) loadFriendsEndorsements(0);
            }

            checkUserCredentials();

            //-----SEO tags ----
            $scope.$parent.$parent.$parent.seo = { 
                pageTitle : $rootScope.cCategory.title, 
                metaDescription: $rootScope.cCategory.question,
            };
            
            //Check if there are no answers
            if (vm.answers.length == 0) vm.noAnswers = true;
            else vm.noAnswers = false;

            getUserData(); //if user is logged in, get user data (vote record, etc)

            if ($rootScope.cvotes) getAnswerVotes();
            else {
                $rootScope.cvotes = [];
                $rootScope.ceditvotes = [];
            }
            createAnswerStatus(); //enables/disables 'Create Answer' button
            
            //Sort first by upV, then execute ranking algorithm
            sortByUpV();
            rank.computeRanking($rootScope.canswers, $rootScope.cmrecs);
            
            //Sort by rank here (this is to grab images of top 3 results)
            sortByRank();
                       
            //Instead of rank points just show index in array
            for (var i = 0; i < vm.answers.length; i++) {
                vm.answers[i].Rank = i + 1;
            }
            
            //Determine number of user comments
            if ($rootScope.cCategory.numcom == undefined) vm.numcom = 0;
            else vm.numcom = $rootScope.cCategory.numcom;
            
            //Check and update if necessary ranking and Num of items per rank, only for atomic ranks
            //if ($rootScope.cCategory.isatomic == true && !foodNearMe) {
            if (!foodNearMe) {    
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

                if (!foodNearMe && !$rootScope.cCategory.isGhost) {
                    if (!$rootScope.isCustomRank)
                    table.update($rootScope.cCategory.id,
                        ['answers','image1url', 'image2url', 'image3url'],
                        [$rootScope.canswers.length,'','','']);
                    else
                    table2.update($rootScope.cCategory.id,
                        ['answers','image1url', 'image2url', 'image3url'],
                        [$rootScope.canswers.length,'','','']);
                }
            }
            if (vm.answers.length == 1) {
                vm.numAns = 1;
                if ($rootScope.cCategory.type == 'Short-Phrase') {
                    vm.isShortPhrase = true;
                    vm.title1 = vm.answers[0].name;
                    vm.addinfo1 = vm.answers[0].addinfo;
                    vm.image1 = vm.title1 + '##' + vm.addinfo1;
                    if ($rootScope.cCategory.fimage != null && $rootScope.cCategory.fimage != undefined 
                     && $rootScope.cCategory.fimage != ''){
                         vm.hasfimage = true;
                         vm.fimage = $rootScope.cCategory.fimage;
                     }
                     else vm.hasfimage = false;
                }
                else {
                    vm.isShortPhrase = false;
                    if (vm.answers[0].imageurl != undefined && vm.answers[0].imageurl != null && vm.answers[0].imageurl != '') {
                        vm.image1 = vm.answers[0].imageurl;
                        vm.image1ok = true;
                    }
                    else vm.image1ok = false;
                }
                if (!foodNearMe && !$rootScope.cCategory.isGhost) {
                    if (!$rootScope.isCustomRank)
                    table.update($rootScope.cCategory.id,
                        ['answers', 'image1url','image2url', 'image3url'],
                        [$rootScope.canswers.length,
                            vm.image1,'','']);
                    else
                    table2.update($rootScope.cCategory.id,
                        ['answers', 'image1url','image2url', 'image3url'],
                        [$rootScope.canswers.length,
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
                    if ($rootScope.cCategory.fimage != null && $rootScope.cCategory.fimage != undefined 
                     && $rootScope.cCategory.fimage != ''){
                         vm.hasfimage = true;
                         vm.fimage = $rootScope.cCategory.fimage;
                     }
                     else vm.hasfimage = false;

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
                if (!foodNearMe && !$rootScope.cCategory.isGhost) {
                    if (!$rootScope.isCustomRank)
                    table.update($rootScope.cCategory.id,
                        ['answers', 'image1url', 'image2url', 'image3url'],
                        [$rootScope.canswers.length,
                            vm.image1, vm.image2,'']);
                    else
                    table2.update($rootScope.cCategory.id,
                        ['answers', 'image1url', 'image2url', 'image3url'],
                        [$rootScope.canswers.length,
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
                    if ($rootScope.cCategory.fimage != null && $rootScope.cCategory.fimage != undefined 
                     && $rootScope.cCategory.fimage != ''){
                         vm.hasfimage = true;
                         vm.fimage = $rootScope.cCategory.fimage;
                     }
                     else vm.hasfimage = false;
                    
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
                if (!foodNearMe && !$rootScope.cCategory.isGhost) {
                    if (!$rootScope.isCustomRank)
                    table.update($rootScope.cCategory.id,
                        ['answers', 'image1url', 'image2url', 'image3url'],
                        [$rootScope.canswers.length,
                            vm.image1, vm.image2, vm.image3]);
                    else
                    table2.update($rootScope.cCategory.id,
                        ['answers', 'image1url', 'image2url', 'image3url'],
                        [$rootScope.canswers.length,
                            vm.image1, vm.image2,'']);
                }
            }

            //Set Feautured Image
            if ($rootScope.cCategory.fimage != undefined && $rootScope.cCategory.fimage != ''){
                if ($rootScope.cCategory.fimage != vm.image1){
                    vm.image3 = vm.image2;
                    vm.image2 = vm.image1;
                    vm.image1 = $rootScope.cCategory.fimage;
                }
            }
            /*//if category doesnt have image set, set to image1;
            if ($rootScope.cCategory.fimage == undefined || $rootScope.cCategory.fimage == ''){
                if ($rootScope.cCategory.type != 'Short-Phrase'){
                    categories.update($rootScope.cCategory.cat,['fimage'],[vm.image1]);
                }
            }*/

            //Set bgbox color specs
            if ($rootScope.cCategory.bc != undefined && $rootScope.cCategory.bc != ''){
                vm.bc = $rootScope.cCategory.bc;
                vm.fc = $rootScope.cCategory.fc;
                vm.shade = $rootScope.cCategory.shade;              
            }
            else{
                //Set colors for title hideInfoBox
                var colors = color.defaultRankColor($rootScope.cCategory);
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
            
            incViews(); //increment number of views

            if ($rootScope.DEBUG_MODE) console.log("Rank Summary Loaded!");
            
            window.prerenderReady = true;
            $rootScope.isCustomRank = false; 
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
                                if (idx > -1) {
                                    if ($rootScope.catansrecs[idx].category == $rootScope.cCategory.id) {
                                        $rootScope.canswers4rank.push($rootScope.canswers[k]);
                                    }
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

            if ($rootScope.canswers4rank.length > 0) vm.commentAllowed = true;
            else vm.commentAllowed = false;

            updateStatusRankButton();
            
            //console.log("$rootScope.canswers4rank - ", $rootScope.canswers4rank);
        }

        function updateStatusRankButton(){
            if ($rootScope.canswers4rank.length > 1) vm.rankDisabled = '';
            else vm.rankDisabled = 'disabled';
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
            //if rank is Custom Rank and has Owner, clear $rootScope.cCategory
            //to avoid showing wrong navigation bar
            if (vm.rankOwner){
                if (x.slug == vm.rankOwner.slug) $rootScope.cCategory = $rootScope.oCategory;
            }
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
            if ($rootScope.isLoggedIn && $rootScope.cCategory != undefined) {
                if (answersFull) {
                    dialog.getDialog('answersFull');
                    return;
                }
                else {

                    if($rootScope.cCategory.isGhost) {

                        var item = {
                            title: $rootScope.cCategory.title,
                            type: $rootScope.cCategory.type,
                            tags: $rootScope.cCategory.tags,
                            keywords: $rootScope.cCategory.keywords,
                            question: $rootScope.cCategory.question,
                            fimage: $rootScope.cCategory.fimage,
                            bc: $rootScope.cCategory.bc,
                            fc: $rootScope.cCategory.fc,
                            shade: $rootScope.cCategory.shade,
                            introtext: $rootScope.cCategory.introtext,
                            user: $rootScope.cCategory.user ,

                            views: 0,
                            answers: 0,
                            image1url: $rootScope.EMPTY_IMAGE,
                            image2url: $rootScope.EMPTY_IMAGE,
                            image3url: $rootScope.EMPTY_IMAGE,
                            answertags: '',
                            isatomic: 1, //TODO decide isatomic, numcom, ismp, owner, 
                            timestmp: new Date(),
                            cat: $rootScope.cCategory.cat,
                            nh: $rootScope.cCategory.nh,
                        };
                        table.addTable(item).then(function(result){
                            if ($rootScope.DEBUG_MODE) console.log("table added --- ", result);
                            var rankid = result.resource[0].id;
                            //Create and update slug
                            var slug = item.title.toLowerCase();; 
                            slug = slug.replace(/ /g,'-');
                            slug = slug.replace('/','at');
                            slug = slug + '-' + rankid;
                            table.update(rankid,['slug'],[slug]);

                            
                            if (vm.type == 'Event') {
                                $rootScope.eventmode = 'add';
                                $state.go("addEvent");
                            }
                            else $state.go("addAnswer");
                        });
                    }
                    else{
                        if (vm.type == 'Event') {
                            $rootScope.eventmode = 'add';
                            $state.go("addEvent");
                        }
                        else $state.go("addAnswer");
                    }
                }
            }
            else {
                //dialog.getDialog('notLoggedIn');
                dialog.loginFacebook();
                return;
            }
        }

        function loadData() {

            //If introtext exist load it, if not, create custom intro text
            if ($rootScope.cCategory.introtext) {
                var start = $rootScope.cCategory.introtext.indexOf('++');
                var end = $rootScope.cCategory.introtext.indexOf('--');
                if (start > -1 && end > -1) vm.introtext = $rootScope.cCategory.introtext.substring(start+2,end);
                else vm.introtext = $rootScope.cCategory.introtext;
            }
            else vm.introtext = 'This is the rank for ' + $rootScope.cCategory.title + '. '+
            ' Help shape the ranking by endorsing your favorites!.';
              
            if ($rootScope.cCategory.owner != 0 && $rootScope.cCategory.owner != undefined){
                vm.isCustomRank = true;
                //if custom rank is demo go to original answer, else get refernce from owner
                if ($rootScope.cCategory.id == 11091 || 
                    $rootScope.cCategory.id == 11092 ||
                    $rootScope.cCategory.id == 11093) vm.rankOwner = $rootScope.oAnswer;
                else{
                    var idx = $rootScope.answers.map(function(x) {return x.id; }).indexOf(Number($rootScope.cCategory.owner));
                    vm.rankOwner = $rootScope.answers[idx];
                } 
            }
            
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
                case "Simple": { fidx = 9; break; }
            }

            var fields = $rootScope.typeSchema[fidx].fields;
            $rootScope.fields = fields;
            vm.fields = $rootScope.fields;
            vm.type = $rootScope.cCategory.type;

            if (vm.type == 'Event') vm.isE = true;
            else vm.isE = false;

            $rootScope.NhImplied = false;
            $rootScope.NhValue = '';
            if ($rootScope.cCategory.type == 'Establishment' ||
            $rootScope.cCategory.type == 'Place' ||
            $rootScope.cCategory.type == 'Event') {
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

            //Create button to link to parent rank if rank is atomic for better navigation
            if ($rootScope.cCategory.isatomic && $rootScope.NhImplied){
                var ss = $rootScope.cCategory.title.replace($rootScope.NhValue,'San Diego');
                for (var n=0; n<$rootScope.content.length; n++){
                    if ($rootScope.content[n].title == ss){
                        vm.hasParent = true;
                        vm.parentRank = $rootScope.content[n];
                        dataloader.pulldata('ranks',[vm.parentRank]);
                    }
                }
            }
            
            //Load current answers
            //$rootScope.answers = answers;
            $rootScope.canswers = [];
            var fanswers = [];
            $rootScope.ccatans = [];
            $rootScope.B = [];
            var eventObj = {};
            var obj = {};
            var eventIsCurrent = true;
            
            //Rank is 'Food Near Me' - first time only
            if (foodNearMe && $rootScope.fanswers == undefined) {
                    var answerid = 0;
                    var idx = 0;
                    var isDup = false;
                    var ansObj = {};
                    
                    var ansArr = $rootScope.foodans.cats.split(':').map(Number);

                    for (var j = 0; j < ansArr.length; j++) {
                        idx = $rootScope.answers.map(function (x) { return x.id; }).indexOf(ansArr[j]);
                        if ($rootScope.answers[idx]) {
                            //only add if its not already added
                            isDup = false;
                            if (fanswers.length > 0 && idx > 0) {
                                for (var n = 0; n < fanswers.length; n++) {
                                    if (fanswers[n].id == $rootScope.answers[idx].id) {
                                        isDup = true;
                                        //nidx = n;
                                        break;
                                    }
                                }
                            }
                            //if not duplicated, add to answer array. upV is init to first catans record
                            if (!isDup) {
                                ansObj = $rootScope.answers[idx];
                                //We have user coordinates, so we check that both lat and lng are within approx a mile
                                //1 degree ~ 69 miles, so 1 miles ~ 0.0145 degrees
                                if (Math.abs($rootScope.currentUserLatitude - $rootScope.answers[idx].lat) < 0.0145 &&
                                    Math.abs($rootScope.currentUserLongitude - $rootScope.answers[idx].lng) < 0.0145)
                                    fanswers.push(ansObj);
                            }
                        }
                    }
                
                $rootScope.canswers = fanswers;
                $rootScope.fanswers = fanswers;
            }
            //all other ranks
            if (!foodNearMe) {
                
                for (var i = 0; i < catansrecs.length; i++) {
                           //Puts numbers into array. Pretty sweet!
                        if ($rootScope.cCategory.catstr) catArr = $rootScope.cCategory.catstr.split(':').map(Number);
                        else catArr = [$rootScope.cCategory.id];

                        for (var n = 0; n < catArr.length; n++) {
                            if (catansrecs[i].category == catArr[n]) {
                                for (var k = 0; k < answers.length; k++) {
                                    if (catansrecs[i].answer == answers[k].id && catansrecs[i].isdup != true) {
                                        obj = {};
                                        obj = answers[k];
                                        obj.catans = catansrecs[i].id;
                                        obj.catansrank = catansrecs[i].rank;
                                        obj.upV = catansrecs[i].upV;

                                        obj.upV = catansrecs[i].upV;
                                        obj.downV = catansrecs[i].downV;
                                        obj.catans = catansrecs[i].id;
                                        obj.rank = catansrecs[i].rank;
                                        obj.uservote = {};
                                        obj.upVi = catansrecs[i].upV;
                                        obj.downVi = catansrecs[i].downV;

                                        displayVote(obj);

                                        if (vm.type == 'Event') {

                                            eventObj = JSON.parse(answers[k].eventstr);
                                            if (eventObj) {
                                                mergeObject(answers[k], eventObj);

                                                //To determine if event is current look at end date if exist if not use start date
                                                //if (eventObj.edate != undefined && eventObj.edate != '') obj.date = answers[k].edate.slice(4);
                                                //else obj.date = answers[k].sdate.slice(4);
                                                eventIsCurrent = datetime.eventIsCurrent(obj, answers[k]);

                                                if (eventIsCurrent) {
                                                    $rootScope.canswers.push(obj);
                                                    $rootScope.ccatans.push(catansrecs[i]);
                                                    break;
                                                }
                                                else break;
                                            }
                                        }
                                        else {
                                            if (($rootScope.isCustomRank && obj.isprivate) ||
                                                (!$rootScope.isCustomRank && !obj.isprivate )) {
                                                $rootScope.canswers.push(obj);
                                                $rootScope.ccatans.push(catansrecs[i]);
                                                break;
                                            }
                                        }

                                    }
                                }
                            }
                      //  }                                     
                    }

                }
            }
            //if already loaded all near by places
            if (foodNearMe && $rootScope.fanswers) {
                $rootScope.canswers = $rootScope.fanswers;
            }
            vm.answers = $rootScope.canswers;
            
            if (vm.answers.length > vm.limit) vm.thereIsMore = true;
            else vm.thereIsMore = false;
            dataloader.pulldata('answers',$rootScope.canswers);
            
            if ($rootScope.currentUserLatitude && $rootScope.currentUserLongitude) {
                vm.haveLocation = true;
                getDistances();
            }
            else vm.haveLocation = false;
            
            //Specials
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
                        if ($rootScope.specials[i].freq == 'onetime') {
                            if(moment().isBetween(moment($rootScope.specials[i].sdate), moment($rootScope.specials[i].edate), 'day', '[]')) {
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
            /*
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
                //var catArr2 = $rootScope.cCategory.catstr.split(':').map(Number);
                for (var i = 0; i < useractivities.length; i++) {
                    for (var j = 0; j < catArr.length; j++) {
                        if (useractivities[i].category == catArr[j]) {
                            $rootScope.cuseractivity.push(useractivities[i]);
                            break;
                        }
                    }
                }
            }
            
            vm.numContributors = $rootScope.cuseractivity.length;
            */
            //data loading completed
            vm.isLoading = false;
        }

        function getDistances(){
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
            //vm.answers = [];
            /*
            vm.haveLocation = true;
            if (vm.answers.length > 0) {
                if (isNaN(vm.answers[0].dist)) {
                    vm.haveLocation = false;
                }
                else vm.haveLocation = true;
            }*/

            //$scope.$apply(function(){
                
            //});
            //console.log("vm.answers - ", vm.answers);

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
                if (a.Rank < 1 || b.Rank < 1 ) return b.Rank - a.Rank;
                else return a.Rank - b.Rank;             
            }
            vm.answers = vm.answers.sort(compare);
            
            getDisplayImages();

            $rootScope.canswers = vm.answers;
            //vm.answers = $filter('orderBy')(vm.answers, 'Rank');
            vm.selRank = 'active';
            vm.selDistance = '';
            vm.selUpV = '';
            vm.selDate = '';
            vm.selTrending = '';
            vm.sortByName = 'Rank';

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
                vm.selTrending = '';

                if (foodNearMe) vm.answers = vm.answers.slice(0, 99);
                vm.sortByName = 'Distance';
            }
            else {
                $rootScope.loadRankWhenCoordsRdy = true;
                $rootScope.rankIsNearMe = true;
                dialog.askPermissionToLocate();
                vm.sortByName = 'Distance';
            }
        }

        function sortByUpV() {
            function compare(a, b) {
                return (b.upV-b.downV) - (a.upV-a.downV);
            }
            vm.answers = vm.answers.sort(compare);
            getDisplayImages();

            $rootScope.canswers = vm.answers;
            //vm.answers = $filter('orderBy')(vm.answers, 'dist');
            vm.selRank = '';
            vm.selDistance = '';
            vm.selUpV = 'active';
            vm.selDate = '';
            vm.selTrending = '';
            vm.sortByName = 'Popular';

            if (!foodNearMe && !vm.isE) vm.showR = false || (!vm.sm);

        }


        function sortByTrending() {
            function compare(a, b) {
                
                if((a.trendUpV == 0) && (b.trendUpV == 0))
                    return b.upV - a.upV;
                else
                    return b.trendUpV - a.trendUpV;

            }
            
            vm.answers = vm.answers.sort(compare);
            getDisplayImages();

            $rootScope.canswers = vm.answers;
            //vm.answers = $filter('orderBy')(vm.answers, 'dist');
            vm.selRank = '';
            vm.selDistance = '';
            vm.selUpV = '';
            vm.selDate = '';
            vm.selTrending = 'active';
            vm.sortByName = 'Trending';

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
            vm.selTrending = '';
            vm.sortByName = 'Date';

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
            vm.image1 = $rootScope.EMPTY_IMAGE;
            vm.image2 = $rootScope.EMPTY_IMAGE;
            vm.image3 = $rootScope.EMPTY_IMAGE;

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

        function gotoParentRank(){
            updateRecords();
            $state.go('rankSummary',{index: vm.parentRank.id});
        }

        function callGetLocation() {
            console.log("emitGetLocation");
            $rootScope.$emit('getLocation');
        }

        function checkUserCredentials() {
            if ($rootScope.cCategory.owner != 0 && $rootScope.cCategory.owner != undefined)
                    vm.hasAnswerParent = true;
            if ($rootScope.isLoggedIn) {
                if (vm.hasAnswerParent) {
                    var idx = $rootScope.answers.map(function (x) { return x.id; }).indexOf(Number($rootScope.cCategory.owner));
                    var owner = $rootScope.answers[idx].owner;
                    if ($rootScope.user.id == owner) vm.userIsOwner = true;
                }
            }
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
                //vm.linkurl = 'https://rank-x.com/rankSummary/' + $rootScope.cCategory.slug; 
                vm.linkurl = SERVER_URL + 'rank' + $rootScope.cCategory.id + '.html';
                vm.tweet = $rootScope.cCategory.title + ', endorse your favorite ones at: ';

                var imageurl = $rootScope.cCategory.image1url;
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
                            link: vm.linkurl,
                            caption: 'Rank-X San Diego',
                        }, function(response){}); 
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
                } 
            }
        function changeMode(mode){
            vm.mode = mode;
        }

        function displayVote(x) {

            if (x.dV == 1) {
                x.thumbUp = "#0070c0";//"thumbs_up_blue.png";//
                x.thumbDn = "#bfbfbf";//"thumbs_down_gray.png";
            }

            if (x.dV == 0) {
                x.thumbUp = "#bfbfbf";//"thumbs_up_gray.png";
                x.thumbDn = "#bfbfbf";//"thumbs_down_gray.png";
            }
            if (x.dV == -1) {
                x.thumbUp = "#bfbfbf";//"thumbs_up_gray.png";
                x.thumbDn = "#0070c0";//"thumbs_down_blue.png";
            }
        }
        
        function UpVote(x, event) {
            if ($rootScope.isLoggedIn) {

                switch (x.dV) {
                    case -1: { x.dV = 1; x.upV++; x.downV--; break; }
                    case 0: { x.dV = 1; x.upV++; break; }
                    case 1: { x.dV = 0; x.upV--; break; }
                }
                
                if (x.dV == 1) addAnswer4Rank(x);
                if (x.dV == -1 || x.dV == 0 ) removeAnswer4Rank(x);

                displayVote(x);
                if ($rootScope.DEBUG_MODE) console.log("UpVote");
            }
            else {
                dialog.loginFacebook();
                //dialog.getDialog('notLoggedIn');
                return;
            }
        }

        function addAnswer4Rank(x){
            $rootScope.canswers4rank.push(x);
            updateStatusRankButton();
        }

        function removeAnswer4Rank(x){
            var i = $rootScope.canswers4rank.map(function(x) {return x.id; }).indexOf(x.id);
            if (i > -1) $rootScope.canswers4rank.splice(i,1);
            updateStatusRankButton();
        }
        
        function DownVote(x,event) {
            if ($rootScope.isLoggedIn) {
                switch (x.dV) {
                    case -1: { x.dV = 0; x.downV--; break; }
                    case 0: { x.dV = -1; x.downV++; break; }
                    case 1: { x.dV = -1; x.upV--; x.downV++; break; }
                }

                if (x.dV == -1 || x.dV == 0 ) removeAnswer4Rank(x);

                displayVote(x);
                if ($rootScope.DEBUG_MODE) console.log("DownVote");
            }
            else {
                dialog.loginFacebook();
                //dialog.getDialog('notLoggedIn');
                return;
            }

        }


        function getAnswerVotes() {
            //look for user vote for this catans
            for (var i = 0; i < vm.answers.length; i++) {
                vm.answers[i].voteRecordExists = false;
                
                for (var j = 0; j < $rootScope.cvotes.length; j++) {
                    if ($rootScope.cvotes[j].catans == vm.answers[i].catans) {
                        vm.answers[i].uservote = $rootScope.cvotes[j];
                        vm.answers[i].uservote.ansvidx = i;
                        //ansvidx = i;
                        vm.answers[i].voteRecordExists = true;
                        break;
                    }

                }
                if (vm.answers[i].voteRecordExists) {
                    vm.answers[i].dV = vm.answers[i].uservote.vote;
                    //catansid = uservote.catans;
                }
                else {
                    vm.answers[i].dV = 0;
                    //catansid = x;
                }
                displayVote(vm.answers[i]);
            }

        }

        //Update Records
        function updateRecords() {
            
            //update vote record if necessary
            if ($rootScope.DEBUG_MODE) console.log("UpdateRecords @answerDetail");
            
            //TODO Need to pass table id
            if (vm.answers && $rootScope.cCategory != undefined) {
                for (var i = 0; i < vm.answers.length; i++) {

                    var voteRecordExists = vm.answers[i].voteRecordExists;
                    var userHasRank = false;
                    var useractivityrec = {};
                    //console.log("$rootScope.thisuseractivity - ", $rootScope.thisuseractivity);
                    try {
                        var idx = $rootScope.thisuseractivity.map(function (x) { return x.category; }).indexOf($rootScope.cCategory.id);
                    }
                    catch (err) {
                        console.log("Error: ", err);
                        console.log("$rootScope.cCategory - ", $rootScope.cCategory);
                        var idx = -1;
                    }
                    if (idx >= 0) {
                        userHasRank = true;
                        useractivityrec = $rootScope.thisuseractivity[idx];
                    }
                    else userHasRank = false;
                    //if vote is changed to non-zero
                    if (voteRecordExists && vm.answers[i].uservote.vote != vm.answers[i].dV && vm.answers[i].dV != 0) {
                        //update vote
                        if ($rootScope.DEBUG_MODE) console.log("UR-1");
                        votes.patchRec(vm.answers[i].uservote.id, vm.answers[i].dV);
                    }
                    //if vote is changed to zero
                    if (voteRecordExists && vm.answers[i].uservote.vote != vm.answers[i].dV && vm.answers[i].dV == 0) {
                        //Delete vote
                        if ($rootScope.DEBUG_MODE) console.log("UR-2");
                        votes.deleteRec(vm.answers[i].uservote.id);
                        //Decrease vote counter from user activity. If counter is 1, also delete user activiy record (since there is no more votes
                        //from this user)
                        if (useractivityrec.votes < 2) {
                            if ($rootScope.DEBUG_MODE) console.log("UR-3");
                            useractivity.deleteRec(useractivityrec.id);
                        }
                        else {
                            if ($rootScope.DEBUG_MODE) console.log("UR-4");
                            useractivity.patchRec(useractivityrec.id, useractivityrec.votes - 1);
                            //$rootScope.userActRec.votes--;
                        }
                    }
                    if (!voteRecordExists && vm.answers[i].dV != 0) {
                        //Post a new vote and create useractivity record
                        if ($rootScope.DEBUG_MODE) console.log("UR-5");
                        votes.postRec(vm.answers[i].catans, vm.answers[i].id, $rootScope.cCategory.id, vm.answers[i].dV);
                        if (userHasRank) {
                            if ($rootScope.DEBUG_MODE) console.log("UR-6");
                            useractivity.patchRec(useractivityrec.id, useractivityrec.votes + 1);
                            //$rootScope.userActRec.votes++;
                        }
                        else {
                            if ($rootScope.DEBUG_MODE) console.log("UR-7");
                            useractivity.postRec($rootScope.cCategory.id);
                            //$rootScope.thisuseractivity.push();
                        }
                    }

                    //update answer record (vote count) if necessary
                    //TODO Need to pass table id
                    if ((vm.answers[i].upV != vm.answers[i].upVi) || (vm.answers[i].downV != vm.answers[i].downVi)) {
                        if ($rootScope.DEBUG_MODE) console.log("UR-8");
                        //console.log("vm.answerRanks[i] - ",vm.answerRanks[i]);
                        //catans.getCatan(vm.answers[i].catans).then(function(catan){
                        //   var updV = vm.answerRanks[i].upV + vm.answerRanks[i].upVi;
                        //   var downdV = vm.answerRanks[i].downV + vm.answerRanks[i].downVi;

                        catans.updateRec(vm.answers[i].catans, ["upV", "downV"], [vm.answers[i].upV, vm.answers[i].downV]);
                        //});
                    }
                }
            }

            if (vm.vrows) {
                for (var i = 0; i < vm.vrows.length; i++) {
                    var voteRecExists = vm.vrows[i].voteExists;
                    if (voteRecExists && vm.vrows[i].dVi != vm.vrows[i].dV) {
                        if ($rootScope.DEBUG_MODE) console.log("UR-9");
                        $rootScope.cvrowvotes[vm.vrows[i].vidx].val = vm.vrows[i].dV;
                        vrowvotes.patchRec(vm.vrows[i].voteid, vm.vrows[i].dV);
                    }
                    if (!voteRecExists && vm.vrows[i].dV != 0) {
                        if ($rootScope.DEBUG_MODE) console.log("UR-10");
                        vrowvotes.postRec(vm.vrows[i].id, vm.vrows[i].dV);
                    }

                    if ((vm.vrows[i].upV != vm.vrows[i].upVi) || (vm.vrows[i].downV != vm.vrows[i].downVi)) {
                        if ($rootScope.DEBUG_MODE) console.log("UR-11");
                        vrows.updateRec(vm.vrows[i].id, ["upV", "downV"], [vm.vrows[i].upV, vm.vrows[i].downV]);
                    }
                }
            }
        }
        function sortbyHelpDialog() {
            dialog.sortbyHelpDialog();
        }

        function backToResults(){
            //updateRecords();
            if ($rootScope.previousState == 'trends') $state.go('trends');
            else $rootScope.$emit('backToResults');
            //$rootScope.$emit('backToResults');
        }

        function seeMore(){
            vm.limit = vm.limit+20;
            loadTrendVotes(vm.limit-20);
            //loadFriendsEndorsements(vm.limit-20);
            if (vm.answers.length > vm.limit) vm.thereIsMore = true;
            else vm.thereIsMore = false;
        }

        function loadTrendVotes(x){
            var answerIDs = vm.answers.map(function (answer) { return answer.id; });
                if (answerIDs.length > 0) {
                    votes.loadLastMonthVoting(answerIDs.slice(x,x+20))
                        .then(function (resp) {
                            resp.forEach(function (vote) {
                                var idx = answerIDs.indexOf(vote.answer);
                                vm.answers[idx].trendUpV++;
                            });
                            //console.log(vm.answers);
                        });
                }
        }

        function loadFriendsEndorsements(x){
            //console.log("load friends endorsements - ",$rootScope.friends_votes.length,$rootScope.user.friends.data.length);
            //Check friends endorsements for this answers
            //var ansIds = vm.answers.slice(x,x+20);
            var ansIds = vm.answers;
            var idx = 0;
            var cidx = 0;
            var ridx = 0;
            ansIds.forEach(function(answer){
                answer.userObjs = [];
                for (var i=0; i< $rootScope.friends_votes.length; i++){
                    if ($rootScope.friends_votes[i].answer == answer.id) {
                        var friend = getUser($rootScope.friends_votes[i]);
                        //console.log("friend - ", friend);
                        cidx = $rootScope.catansrecs.map(function(x) {return x.id; }).indexOf($rootScope.friends_votes[i].catans);
                        ridx = $rootScope.content.map(function(x) {return x.id; }).indexOf($rootScope.catansrecs[cidx].category); 

                        idx = answer.userObjs.map(function(x) {return x.id; }).indexOf(friend.id); 
                        if (idx < 0) {
                            //console.log("$rootScope.friends_votes[i] ", $rootScope.friends_votes[i]);
                            friend.endorsements = [];
                            friend.endorsements.push($rootScope.content[ridx].title);
                            answer.userObjs.push(friend);
                        }
                        else {
                            //console.log("answer - ", answer);
                            answer.userObjs[idx].endorsements.push($rootScope.content[ridx].title);
                        }
                    }
                }

            });
            //console.log("ansIds - ", ansIds);
        }

        function getUser(voterec) {
            for (var i = 0; i < $rootScope.user.friends.data.length; i++) {
                if (voterec.user == $rootScope.user.friends.data[i].id) {
                    return $rootScope.user.friends.data[i];
                }
            }
        }

        function showAllFriendsList(userObjs, answername){
            dialog.showAllFriendsListDlg(userObjs, answername);
        }

        function incViews() {
            $rootScope.cCategory.views++;
            //update number of views (Request to increment to server)
            var url = SERVER_URL + 'databaseOps/incViews/rank/' + $rootScope.cCategory.id;
            var req = {
                method: 'POST',
                url: url,
                headers: {
                    'X-Dreamfactory-API-Key': undefined,
                    'X-DreamFactory-Session-Token': undefined
                }
            }
            $http(req);
        }
    }
})();
