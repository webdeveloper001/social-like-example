(function () {
    'use strict';

    
    angular.module('app', [
        // Angular modules 
        'angulike',
        'color.picker',
        'ngFileUpload',
        'ngAnimate',
        'ngCookies',
        'ngResource',
        'ngRoute',
        'ngSanitize',
        'ngTouch',
        'ngMessages',
        
        'pascalprecht.translate',
        'tmh.dynamicLocale',
        
        // Custom modules 
        'login',

        // 3rd Party Modules
        'ui.router',                 // state provider
        'ui.bootstrap.modal',
        'mgcrea.ngStrap',
        
        '720kb.datepicker', //date picker for specials
        '720kb.socialshare',
        'ngFacebook',
    ]);
})();
(function () {
    'use strict';

    angular
        .module('app')
        .service('rank', rank);

    rank.$inject = ['$rootScope'];

    function rank($rootScope) {

        //Members
        $rootScope.A = [];
        var R = [];
        var GP = [];
        var A = [];
        
        var answersR = [];

        var service = {

            computeRanking: computeRanking
        };

        return service;

        function computeRanking(answers, mrecs) {

            var N = answers.length;
            var M = N*(N-1)/2;
            var L = mrecs.length;
            var ansHS = 0;
            var ansLS = 0;
            var GPtemp = 0;
            var mGP = 0; //mean of games played
                        
            //initialize 2d array
            for (var i = 0; i < N; i++) {
                R[i] = new Array(N); //Results Array
                GP[i] = new Array(N); //Games Played Array
                for (var j = 0; j < N; j++) {
                    R[i][j] = 0;
                    GP[i][j] = 0;
                }
                A[i] = answers[i].id;                
            }

            for (i = 0; i < L; i++) {

                ansHS = A.indexOf(mrecs[i].hs);
                ansLS = A.indexOf(mrecs[i].ls);
                if (ansHS >= 0 && ansLS >= 0) {
                    //console.log("HS, LS", ansHS, ansLS);
                    if (mrecs[i].sel == mrecs[i].hs) {
                        R[ansHS][ansLS]++;
                        //R[ansLS][ansHS]--;
                    }
                    else if (mrecs[i].sel == mrecs[i].ls) {
                        //R[ansHS][ansLS]--;
                        R[ansLS][ansHS]++;
                    }
                    GP[ansHS][ansLS]++;
                    GP[ansLS][ansHS]++;
                }
            }
            
            //Get average games played
            GPtemp = 0;
            for (i = 0; i < N; i++) {
                for (j = 0; j < N; j++) {
                    GPtemp = GPtemp + GP[i][j];
                }
            }
            mGP = GPtemp / (4*M); //get half of the mean of games played between each answer
            //console.log("@rank - mGP: ", mGP); 
   
            //Sum relV points for each answer
            for (i = 0; i < N; i++) {
                answers[i].Rank = 0;
                GPtemp = 0;
                for (j = 0; j < N; j++) {
                    //cummulative sum of relative vector points
                    answers[i].Rank = answers[i].Rank + R[i][j];
                    //Get total number of games played for this answer
                    GPtemp = GPtemp + GP[i][j];                                         
                }
                answers[i].Rank = answers[i].Rank / GPtemp;
                
                //if this answer has played fewer games than half the mean, multiply by reducing factor
                //TODO. Now using linear reducing factor. Later can revise for a better statistical curve.
                if (GPtemp < mGP) answers[i].Rank = answers[i].Rank * (GPtemp / mGP);                   
            }

            //Check one by one, compare rank and relative comparison
            for (var k = 0; k < N; k++) {
                for (j = 0; j < N; j++) {
                    if (k != j) {
                        if ((answers[j].Rank >= answers[k].Rank) && (R[k][j] > R[j][k]) && (GP[k][j] >= mGP)) {
                            answers[k].Rank = answers[j].Rank + 0.01;
                        }
                    }
                }
            }

            answersR = answers;

            $rootScope.answersR = answersR;
            $rootScope.R = R;
            $rootScope.GP = GP;
            $rootScope.A = A;

        }

    }
})();
(function () {
    'use strict';

    angular
        .module('app')
        .factory('matchrec', matchrec);

    matchrec.$inject = ['$http', '$q', '$rootScope'];

    function matchrec($http, $q, $rootScope) {

        // Members
        var _mrecs = [];
        var json_schema = [];
        var baseURI = '/api/v2/mysql/_table/matchtable';

        var service = {
            GetMatchTable: GetMatchTable,
            postRec: postRec,
            deleteRecordsbyAnswer: deleteRecordsbyAnswer,
            deleteRecordsbyCatans: deleteRecordsbyCatans
            //    addTable: addTable
        };

        return service;

        function postRec(data) {
           
            //form match record
            var obj = {};
            obj.resource = [];

            obj.resource.push(data);
            
            //update local copy
            // _mrecs.push(data);
            _mrecs.push.apply(_mrecs, data);
            //update local copy of mrecs by user
            //$rootScope.cmrecs_user.push(data);
            //$rootScope.cmrecs_user.push.apply($rootScope.cmrecs_user, data);  
            
            var url = baseURI;

            return $http.post(url, data, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                if ($rootScope.DEBUG_MODE) console.log("creating match record was succesful");
                return result.data;
            }
        }

        function GetMatchTable(forceRefresh) {

            if (_areMatchRecsLoaded() && !forceRefresh) {
                return $q.when(_mrecs);
            }
            
            //Get all match records
            var url = baseURI;

            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                return _mrecs = result.data.resource;
            }
        }

        function deleteRecordsbyAnswer(answer_id) {
           
            //Delete all match records that correspond to this answer
            
            //delete records from local copy
            for (var i=0; i<_mrecs.length;i++){
                if (_mrecs[i].ls == answer_id || _mrecs[i].hs == answer_id){
                    _mrecs.splice(i,1);
                } 
            }
            
           var url = baseURI + '?filter=(ls=' + answer_id+') OR (hs=' + answer_id+')'; 
           return $http.delete(url).then(querySuccess, _queryFailed);
           
           function querySuccess(result){
               if ($rootScope.DEBUG_MODE) console.log("deleting match records succesful");
               return;
           }
            
            //TODO: Unable to filter by both ls and hs in a single query. Now using two queries.
            /*
            var url = baseURI + '/_table/matchtable?filter=ls=' + answer_id;
            return $http.delete(url).then(deleteLSRecsSucceeded, _queryFailed);

            function deleteLSRecsSucceeded(result) {
                url = baseURI + '/_table/matchtable?filter=hs=' + answer_id;
                return $http.delete(url).then(deleteHSRecsSucceeded, _queryFailed);
                function deleteHSRecsSucceeded(result) {
                    console.log("deleting records succesful");
                    return;
                }
            }
            */
        }
        
        function deleteRecordsbyCatans(category_id, answer_id) {
           
            //Delete all match records that correspond to this answer
            
            //delete records from local copy
            for (var i=0; i<_mrecs.length;i++){
                if (_mrecs[i].ls == answer_id || _mrecs[i].hs == answer_id){
                    _mrecs.splice(i,1);
                } 
            }
            
           var url = baseURI + '?filter=(category=' + category_id+') AND (hs=' + answer_id+')'; 
           $http.delete(url).then(querySuccess1, _queryFailed);
           
           var url2 = baseURI + '?filter=(category=' + category_id+') AND (ls=' + answer_id+')'; 
           $http.delete(url2).then(querySuccess2, _queryFailed);
           
           return;
           
           function querySuccess1(result){
               console.log("deleting match records category-hs pair succesful");
               return;
           }
           function querySuccess2(result){
               if ($rootScope.DEBUG_MODE) console.log("deleting match records category-ls pair succesful");
               return;
           } 
        }
        

        function _queryFailed(error) {

            throw error;
        }

        function _areMatchRecsLoaded() {

            return _mrecs.length > 0;
        }

    }
})();
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

            //Set colors for title hideInfoBox
            var colors = color.defaultRankColor($rootScope.cCategory);
            //console.log("colors - ", colors);
            vm.bc = colors[0];
            vm.fc = colors[1];
            vm.bc2 = color.shadeColor(vm.bc, 0.4);

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
                if ($rootScope.content[i].id == $stateParams.index) {
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
                vm.linkurl = 'https://rank-x.com/#/rankSummary/' + $rootScope.cCategory.id; 
                vm.tweet = $rootScope.cCategory.title + ', endorse your favorite ones at: ';
                dialog.shareOptions(shareFunction, false);
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
                    case 'whatsapp':{
                        if ($rootScope.DEBUG_MODE) console.log(x);
                        Socialshare.share({
                            'provider': 'whatsapp',
                            'attrs': {
                                'socialshareUrl': vm.linkurl,
                                'socialshareText': 'Rank-X, '+ vm.ranking + ', '+ $rootScope.cCategory.question,
                             }
                        }); 
                        break;
                    }
                    case 'messenger':{
                        if ($rootScope.DEBUG_MODE) console.log(x);
                        Socialshare.share({
                            'provider': 'facebook-messenger',
                            'attrs': {
                                'socialshareUrl': vm.linkurl,
                             }
                        }); 
                        break;
                    }
                    case 'sms':{
                        if ($rootScope.DEBUG_MODE) console.log(x);
                        Socialshare.share({
                            'provider': 'sms',
                            'attrs': {
                                'socialshareUrl': vm.linkurl,
                                'socialshareText': 'Rank-X, '+ vm.ranking + ', '+ $rootScope.cCategory.question,
                             }
                        }); 
                        break;
                    }
                } 
            }
    }
})();

(function () {
    'use strict';

    angular
        .module('app')
        .controller('match', match);

    match.$inject = ['$state', 'dialog', '$location', 'answer', '$rootScope', 'matchrec', '$modal', 'useractivity','$window'];

    function match($state, dialog, $location, answer, $rootScope, matchrec, $modal, useractivity, $window) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'match';
        vm.header = "table" + $rootScope.cCategory.id + ".header";
        vm.body = 'table' + $rootScope.cCategory.id + '.body';
        vm.ranking = $rootScope.title;
        var HS = [];
        var LS = [];
        var answers = [];
        var N = 0;
        var M = 0;
        var r = [];
        var GPIdx = 0;
        var returningUser = $rootScope.cmrecs_user.length > 0;
        var mrecs_session = [];
        var rankInProgress = false;
        
        // Members
        vm.table = $rootScope.cCategory;
        vm.type = $rootScope.cCategory.type;
        vm.answer1;
        vm.answer2;

        // Methods
        vm.selectAnswer = selectAnswer;
        vm.rankSummary = rankSummary;
        vm.skipMatch = skipMatch;
        vm.answerDetail = answerDetail;
        vm.closeRank = closeRank;

        //Adjust picture size for very small displays
        if ($window.innerWidth < 512) { vm.sm = true; vm.nsm = false; }
        else { vm.sm = false; vm.nsm = true; }

        activate();

        function activate() {
            
            //TODO: Would like to add this abstract template, but dont know how               
            $rootScope.$on('$stateChangeSuccess', function (ev, to, toParams, from, fromParams) {
                $rootScope.previousState = from.name;
            });
            $rootScope.$on('$stateChangeStart',
                function (ev, to, toParams, from, fromParams) {
                    if (from.name == 'match') {
                        if (mrecs_session.length > 0) {
                            matchrec.postRec(mrecs_session);
                            //if ($rootScope.userHasRank) useractivity.patchRec($rootScope.userActRecId);
                            //else useractivity.postRec();
                            mrecs_session = [];
                        }
                    }
                });
            
            loadAnswers();
            getmatchIndexes();
            createRandomIndexArray();
            getAnswers();
            
        }

        function selectAnswer(number) {

            if ($rootScope.isLoggedIn) {

                var data = {};
                data.user = $rootScope.user.id;
                data.hs = vm.answer1.id;
                data.ls = vm.answer2.id;

                data.category = $rootScope.cCategory.id;
                data.timestmp = Date.now(); 
            
                //Update relative arrays for each of the answers
                if (number == 1) data.sel = vm.answer1.id;
                //matchrec.postRec($rootScope.cCategory.id, vm.answer1.id, vm.answer2.id, vm.answer1.id);
                if (number == 2) data.sel = vm.answer2.id;
                //matchrec.postRec($rootScope.cCategory.id, vm.answer1.id, vm.answer2.id, vm.answer2.id);
            
                mrecs_session.push(data);
                //$rootScope.cmrecs_user.push.apply($rootScope.cmrecs_user, data);
                $rootScope.cmrecs_user.push(data);

                GPIdx++;
                if (GPIdx >= M) GPIdx = 0;
                rankInProgress = true;
                getAnswers();
            }
            else {
                dialog.loginFacebook();
                //dialog.getDialog('notLoggedIn');
                return;
            }
        }

        function skipMatch() {
            GPIdx++;
            if (GPIdx >= M) GPIdx = 0;
            getAnswers();
        }
        
        function loadAnswers(){
            //console.log("$rootScope.cvotes - ", $rootScope.cvotes);
            //console.log("$rootScope.ccatans - ", $rootScope.ccatans);
            //console.log("$rootScope.canswers - ", $rootScope.canswers);
            //console.log("$rootScope.canswers4rank --- ", $rootScope.canswers4rank);
            answers = $rootScope.canswers4rank;
            N = answers.length;
            M = N * (N - 1) / 2;
            //console.log("$rootScope.canswers4rank --- ", $rootScope.canswers4rank, N, M);
            
        }
        
        function getAnswers() {         

            vm.GP = $rootScope.cmrecs_user.length;
            if ($rootScope.DEBUG_MODE) console.log("vm.GP - ", vm.GP);
            vm.Tot = M;            
            
            //if already played all matches
            if ($rootScope.cmrecs_user.length >= M) {
                if (rankInProgress) dialog.getDialog('goodJobRankComplete');
                else dialog.getDialog('rankComplete');
                rankSummary();
                return;
            }
            
            //Check if current user has not played this match.
            if (returningUser) {

                var hs = HS[r[GPIdx]];
                var ls = LS[r[GPIdx]];
                var matchPlayed = false;

                for (var i = 0; i < $rootScope.cmrecs_user.length; i++) {
                    if ($rootScope.cmrecs_user[i].hs == answers[hs].id) {
                        if ($rootScope.cmrecs_user[i].ls == answers[ls].id) {
                            //This match already exists
                            matchPlayed = true;
                            break;
                        }
                    }
                }
            }
            //console.log("matchPlayed", matchPlayed );
            if (matchPlayed) {
                skipMatch();
            }

            vm.answer1 = answers[HS[r[GPIdx]]];
            vm.answer2 = answers[LS[r[GPIdx]]];
            getHeaders();
        }
        function rankSummary() {
            //update records
            //if (mrecs_session.length > 0) matchrec.postRec(mrecs_session);
            $state.go("rankSummary", { index: vm.table.id });
        }

        function answerDetail(x) {

            if (x === 1) $state.go("answerDetail", { index: vm.answer1.id });
            else $state.go("answerDetail", { index: vm.answer2.id });

        }

        function getmatchIndexes() {
            HS = [];
            LS = [];
            for (var i = 0; i <= N - 1; i++) {
                for (var j = i + 1; j <= N - 1; j++) {
                    HS.push(i);
                    LS.push(j);
                }
            }

        }

        function createRandomIndexArray() {
            for (var i = 0; i < M; i++) { r[i] = i; }

            function shuffle(array) {
                var tmp, current, top = array.length;
                if (top) while (--top) {
                    current = Math.floor(Math.random() * (top + 1));
                    tmp = array[current];
                    array[current] = array[top];
                    array[top] = tmp;
                }
                return array;
            }
            r = shuffle(r);
        }

        function getHeaders() {

            vm.fields = $rootScope.fields;

        }

        function closeRank() {
               $state.go('rankSummary',{index: $rootScope.cCategory.id});                            
        }
    }
})();

(function () {
    'use strict';

    angular
        .module('app')
        .controller('editRanking', editRanking);

    editRanking.$inject = ['$location', '$rootScope', '$state','$stateParams', '$window', 
    'table','dialog','catans'];

    function editRanking(location, $rootScope, $state, $stateParams, $window, 
    table, dialog, catans) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'editRanking';

        vm.closeRank = closeRank;
        vm.goEdit = goEdit;
        vm.goDelete = goDelete;
        
        vm.typeList = ["Person", "Establishment", "Place", "Activity", "Short-Phrase", "Organization", "Event","Thing","PersonCust"];

        //Adjust picture size for very small displays
        if ($window.innerWidth < 512) { vm.sm = true; vm.nsm = false; }
        else { vm.sm = false; vm.nsm = true; }
        
        activate();

        function activate() {
            
            //Load current category
            $rootScope.cCategory = {};
            for (var i = 0; i < $rootScope.content.length; i++) {
                if ($rootScope.content[i].id == $stateParams.index) {
                    $rootScope.cCategory = $rootScope.content[i];
                    break;
                }
            }
            
            vm.ranking = $rootScope.cCategory.title;
            
            $rootScope.rankIsActive = true;
            $rootScope.objNumAct = $rootScope.objNum;
            
            loadData();
            if ($rootScope.DEBUG_MODE) console.log("editRanking page Loaded!");

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

            vm.rankTitle = $rootScope.cCategory.title;
            vm.tags = $rootScope.cCategory.tags;
            vm.keywords = $rootScope.cCategory.keywords;
            vm.type = $rootScope.cCategory.type;
            vm.question = $rootScope.cCategory.question;
            vm.answertags = $rootScope.cCategory.answertags;
            vm.isatomic = $rootScope.cCategory.isatomic;
            vm.catstr = $rootScope.cCategory.catstr;
            vm.ismp = $rootScope.cCategory.ismp;
  
        }
        
         function closeRank() {
               $state.go('cwrapper');                            
        }
        
        function goEdit(){
                        
            var item = JSON.parse(JSON.stringify($rootScope.cCategory));
            var fields = [];
            var vals = [];
            //if title change
            if (item.title != vm.rankTitle) {
                fields.push('title');
                vals.push(vm.rankTitle);
            }
            //if tags change
            if (item.tags != vm.tags) {
                fields.push('tags');
                vals.push(vm.tags);
            }
            //if keywords change
            if (item.keywords != vm.keywords) {
                fields.push('keywords');
                vals.push(vm.keywords);
            }
            //if type change
            if (item.type != vm.type) {
                fields.push('type');
                vals.push(vm.type);
            }
            //if type change
            if (item.question != vm.question) {
                fields.push('question');
                vals.push(vm.question);
            }
            //if type change
            if (item.answertags != vm.answertags) {
                fields.push('answertags');
                vals.push(vm.answertags);
            }
            //if isatomic changes
            if (item.isatomic != vm.isatomic) {
                fields.push('isatomic');
                vals.push(vm.isatomic);
            }
            //if category-string changes
            if (item.catstr != vm.catstr) {
                fields.push('catstr');
                vals.push(vm.catstr);
            }
            //if isatomic changes
            if (item.ismp != vm.ismp) {
                fields.push('ismp');
                vals.push(vm.ismp);
            }
            
            table.update(item.id, fields, vals);
            closeRank();
        }
        
        function goDelete(){            
            dialog.deleteRank($rootScope.cCategory, confirmDelete);           
        }
        
        function confirmDelete(){
            table.deleteTable($rootScope.cCategory.id);
            catans.deletebyCategory($rootScope.cCategory.id);
            $state.go('cwrapper');
        }      
    }
})();

(function () {
    'use strict';

    angular
        .module('app')
        .factory('promoter', promoter);

    promoter.$inject = ['$http', '$q', '$rootScope'];

    function promoter($http, $q, $rootScope) {

        //Members
        var _promoters = [];
        var _promoter = {};
        var baseURI = '/api/v2/mysql/_table/promoters';

        var service = {
            getall: getall,
            get: get,
            getbyUser: getbyUser,
            getbyCode: getbyCode,
            add: add,
            update: update,
            deletepromoter: deletepromoter,
            getbycode: getbycode,
        };

        return service;

        function getall(forceRefresh) {
            // console.log("getpromotes..._arepromotesLoaded()", _arepromotesLoaded());

            if (_arepromotersLoaded() && !forceRefresh) {

                return $q.when(_promoters);
            }
            
            //Get all promote records
            var url0 = baseURI + '?offset=' + 0 * 1000;
            
            var p0 = $http.get(url0);
            
            return $q.all([p0]).then(function (d){
                _promoters = d[0].data.resource;

                if ($rootScope.DEBUG_MODE) console.log("No. promoters: ", _promoters.length);
                return _promoters;            
            }, _queryFailed);  

        }

        function get(id) {

            var url = baseURI + '/' + id;

            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                return _promoter = result.data.resource;
            }
        }

        function getbyUser(user) {

            var url = baseURI + '/?filter=user=' + user;

            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                return _promoter = result.data.resource;
            }
        }

        function getbyCode(code) {

            var url = baseURI + '/?filter=code=' + code;

            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                return _promoter = result.data.resource;
            }
        }
        
        function add(promoter) {

            var url = baseURI;
            var resource = [];

            resource.push(promoter);
            
            return $http.post(url, resource, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: resource
            }).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                //update local copy
                var promoterx = promoter;
                promoterx.id = result.data.resource[0].id; 
                _promoters.push(promoterx);
                
                return result.data;
            }

        }
       
        function update(promoter_id, field, val) {
           
            //form match record
            var obj = {};
            obj.resource = [];

            var data = {};
            data.id = promoter_id;
            
            for (var i=0; i<field.length; i++){
                switch (field[i]){
                    case "firstname": data.firstname = val[i]; break;
                    case "lastname": data.lastname = val[i]; break;
                    case "email": data.email = val[i]; break;
                    case "address": data.address = val[i]; break;
                    case "phone": data.phone = val[i]; break;
                    case "code": data.code = val[i]; break;
                    case "stripeid": data.stripeid = val[i]; break;
                }
            }
            //console.log("data", data);
            obj.resource.push(data);

            var url = baseURI;
            
            //update local copy
            var idx = _promoter.map(function(x) {return x.id; }).indexOf(promoter_id);  
            for (var i=0; i<field.length; i++){
                switch (field[i]){
                    case "firstname": _promoter[idx].firstname = val[i]; break;
                    case "lastname": _promoter[idx].lastname = val[i]; break;
                    case "email": _promoter[idx].email = val[i]; break;
                    case "address": _promoter[idx].address = val[i]; break;
                    case "phone": _promoter[idx].phone = val[i]; break;
                    case "code": _promoter[idx].code = val[i]; break;
                    case "stripeid": _promoter[idx].stripeid = val[i]; break;
                }
            }                        
            
            return $http.patch(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {
                
                if ($rootScope.DEBUG_MODE) console.log("updating promoter succesful");
                return result.data;
            }
        }
        
        function deletepromoter(promoter_id) {
           
            //form match record
            var obj = {};
            obj.resource = [];

            var data = {};
            data.id = promote_id;

            obj.resource.push(data);

            var url = baseURI + '/' + promoter_id;
            
            //update (delete promote) local copy of promotes
            var i = _promoters.map(function(x) {return x.id; }).indexOf(promoter_id);
            if (i > -1) _promoters.splice(i,1);
            
            return $http.delete(url, data, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                if ($rootScope.DEBUG_MODE) console.log("Deleting promote was succesful");
                return result.data;
            }
        }

        function getbycode(code){

            var url = baseURI + '/?filter=code='+ code;

            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                return _promoter = result.data.resource;
            }

        }

        function _arepromotersLoaded() {

            return _promoters.length > 0;
        }

        function _queryFailed(error) {

            throw error;
        }

    }
})();
(function () {
    'use strict';

    angular
        .module('app')
        .controller('promotersignup', promotersignup);

    promotersignup.$inject = ['$location', '$rootScope', '$state','promoter','dialog'];

    function promotersignup(location, $rootScope, $state, promoter, dialog) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'promote';

        vm.getcode = getcode;
        vm.submit = submit;
        
        var dataOk = false;
        
        activate();

        function activate() {

            //initialize
            vm.promoter = {};
            vm.promoter.firstname = '';
            vm.promoter.lastname = '';
            vm.promoter.phone = '';
            vm.promoter.address = '';
            vm.promoter.code = '';
            vm.promoter.email = '';
            
            if ($rootScope.user) {
                vm.promoter.firstname = $rootScope.user.first_name;
                vm.promoter.lastname = $rootScope.user.last_name;
                vm.promoter.user = $rootScope.user.id;
            }
            else dialog.getDialog('nologinsignup');

            console.log("promote page Loaded!");
        }

        function submit() {

            vm.promoter.code = vm.code;
            
            checkInputData();
            //vm.promoter.user = $rootScope.user.id;
            if (dataOk) promoter.add(vm.promoter).then(function(){
                dialog.notificationWithCallback('Success','You have successfully registered as a Promoter.',gotoPromoterConsole);
            });
        }

        function gotoPromoterConsole(){
            $state.go('promoterconsole');
        }
        function checkInputData(){
            dataOk = true;

            if (vm.promoter.firstname.length < 1) {
                dialog.getDialog('firstnameisinvalid');
                dataOk = false;
            }
            else if (vm.promoter.lastname.length < 1) {
                dialog.getDialog('lastnameisinvalid');
                dataOk = false;
            }
            else if (vm.promoter.email.length < 1 || vm.promoter.email.indexOf('@')<0) {
                dialog.getDialog('emailisinvalid');
                dataOk = false;
            }
            else if (vm.promoter.address.length < 5) {
                dialog.getDialog('addressisinvalid');
                dataOk = false;
            }
            else if (vm.promoter.phone.length < 9) {
                dialog.getDialog('phoneisinvalid');
                dataOk = false;
            }
            else if (vm.promoter.code.length < 1) {
                dialog.getDialog('missingcode');
                dataOk = false;
            }
        }

        //Create random code
        function getcode() {

            var text = "";
            var nums = "";
            //var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            //var possible = "abcdefghijklmnopqrstuvwxyz0123456789";
            var possiblet = "abcdefghijklmnopqrstuvwxyz";
            var possiblen = "0123456789";
            for (var i = 0; i < 5; i++)
                text += possiblet.charAt(Math.floor(Math.random() * possiblet.length));

            for (var i = 0; i < 3; i++)
                nums += possiblen.charAt(Math.floor(Math.random() * possiblen.length));    

            vm.code = text+nums;
        }
        

    }

})();





(function () {
    'use strict';

    angular
        .module('app')
        .controller('promoterconsole', promoterconsole);

    promoterconsole.$inject = ['$location', '$rootScope', '$state', '$window', 'useraccnt', 'dialog', 'promoter'];

    function promoterconsole(location, $rootScope, $state, $window, useraccnt, dialog, promoter) {
        /* jshint validthis:true */
        var vm = this;

        var fields = [];
        var labels = [];
        var vals = [];

        vm.title = 'promoterconsole';

        vm.overview = true;

        //Methods
        vm.gotoanswer = gotoanswer;
        vm.gotomanage = gotomanage;
        vm.gotoPromotePage = gotoPromotePage;
        vm.goBack = goBack;
        vm.goEdit = goEdit;
        vm.goSignup = goSignup;
        vm.myaccnts = [];
        vm.noAns = false;

        vm.dataReady = false;
        var promoterdataok = false;

        retrieveData();

        function retrieveData() {
            promoter.getbyUser($rootScope.user.id).then(function (result) {
                 $rootScope.userpromoter = result;
                 activate();
            });
        }

        function activate() {

            //Check there is only one promoter accounts and that is for current useraccnt
            if ($rootScope.userpromoter) {
                if ($rootScope.userpromoter.length == 1 && $rootScope.userpromoter[0].user == $rootScope.user.id) {
                    promoterdataok = true;
                    vm.promoter = $rootScope.userpromoter[0];
                    vm.userIsPromoter = true;
                }
                else {
                    vm.userIsPromoter = false;
                    vm.dataReady = true;
                }
            }
            else {
                vm.userIsPromoter = false;
                vm.dataReady = true;
            }

            if (!vm.dataReady) {
                loadData();
            }
            console.log("Promoter console page Loaded!");
            console.log("vm.dataReady - ",vm.dataReady);

        }

        function loadData() {

            var answerid = 0;
            var idx = 0;
            var obj = {};


            if (!vm.dataReady && promoterdataok) {
                useraccnt.getaccntsbycode($rootScope.userpromoter[0].code).then(function (result) {
                    //vm.myaccnts = result;
                    console.log("resuls -", result);

                    for (var i = 0; i < result.length; i++) {
                        answerid = result[i].answer;
                        obj = {};
                        idx = $rootScope.answers.map(function (x) { return x.id; }).indexOf(answerid);
                        obj = result[i];
                        obj.name = $rootScope.answers[idx].name;
                        if (obj.status == 'Basic') obj.style = 'background-color:#bfbfbf';
                        if (obj.status == 'Premium-Free Trial') obj.style = 'background-color:#b3b300';
                        if (obj.status == 'Premium-Active') obj.style = 'background-color:#009900';
                        vm.myaccnts.push(obj);
                    }
                    if (vm.myaccnts.length > 0) vm.noAns = false;
                    else vm.noAns = true;

                    vm.dataReady = true;
                    activate();
                });
            }
        }



        function gotoanswer(x) {
            $state.go('answerDetail', { index: x.id });
        }

        function gotoPromotePage() {
            $state.go('promote');
        }

        function gotomanage(x) {
            //$state.go('mybiz');
            if (x.status == 'Basic') vm.isBasic = true;
            else vm.isBasic = false;
            vm.business = x;
            vm.overview = false;
        }

        function goBack() {
            if (vm.overview == false) {
                vm.overview = true;
                return;
            }

            if ($rootScope.previousState == 'rankSummary')
                $state.go('rankSummary', { index: $rootScope.cCategory.id });
            else if ($rootScope.previousState == 'answerDetail')
                $state.go('answerDetail', { index: $rootScope.canswer.id });
            else if ($rootScope.previousState == 'addAnswer')
                $state.go('addAnswer', { index: $rootScope.canswer.id });
            else if ($rootScope.previousState == 'editAnswer')
                $state.go('editAnswer', { index: $rootScope.canswer.id });
            else if ($rootScope.previousState == 'about')
                $state.go('about');
            else $state.go('cwrapper');
        }

        function goEdit() {
            fields = ['firstname', 'lastname', 'email', 'address', 'phone'];
            labels = ['First Name', 'Last Name', 'Email', 'Address', 'Phone'];
            vals = [vm.promoter.firstname, vm.promoter.lastname, vm.promoter.email, vm.promoter.address, vm.promoter.phone];

            dialog.editInfo(fields, labels, vals, execEdit);
        }

        function execEdit(newvals) {
            promoter.update(vm.promoter.id, fields, newvals).then(function () {
                loadData();
            });
        }

        function goSignup(){
            $state.go('promotersignup');
        }

    }
})();

(function () {
    'use strict';

    angular
        .module('app')
        .controller('promote', promote);

    promote.$inject = ['$location', '$rootScope', '$state','promoter'];

    function promote(location, $rootScope, $state, promoter) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'promote';

        vm.show = show;

        vm.showOne = false;
        vm.showTwo = false;
        vm.showThree = false;
        vm.showFour = false;
        vm.showFive = false;
        vm.showSix = false;
        
        activate();

        function activate() {

            console.log("promote page Loaded!");
        }

        function show(x) {

            if (x == 1 && vm.showOne) vm.showOne = false;
            else if (x == 2 && vm.showTwo) vm.showTwo = false;
            else if (x == 3 && vm.showThree) vm.showThree = false;
            else if (x == 4 && vm.showFour) vm.showFour = false;
            else if (x == 5 && vm.showFive) vm.showFive = false;
            else if (x == 6 && vm.showSix) vm.showSix = false;
            else {
                vm.showOne = false;
                vm.showTwo = false;
                vm.showThree = false;
                vm.showFour = false;
                vm.showFive = false;
                vm.showSix = false;

                if (x == 1 && !vm.showOne) vm.showOne = true;
                if (x == 2 && !vm.showTwo) vm.showTwo = true;
                if (x == 3 && !vm.showThree) vm.showThree = true;
                if (x == 4 && !vm.showFour) vm.showFour = true;
                if (x == 5 && !vm.showFive) vm.showFive = true;
                if (x == 6 && !vm.showSix) vm.showSix = true;
            }
            
        }

    }

})();

(function () {
    'use strict';

    angular
        .module('app')
        .service('userdata', userdata);

    userdata.$inject = ['$rootScope', 'votes', 'editvote', 'vrowvotes', 'useraccnt',
     'useractivity', '$q', 'promoter','categorycode', 'codeprice','$http'];

    function userdata($rootScope, votes, editvote, vrowvotes, useraccnt, 
    useractivity, $q, promoter, categorycode, codeprice, $http) {

        var service = {

            loadUserData: loadUserData,
            loadUserAccount: loadUserAccount,
        };

        return service;

        function loadUserData() {

            if ($rootScope.isLoggedIn) {
                if ($rootScope.DEBUG_MODE) console.log("user is logged in, loading data");
                //Promises
                var p0 = votes.loadVotesByUser();
                var p1 = editvote.loadEditVotesTable();
                var p2 = vrowvotes.loadVrowVotes();
                var p3 = useractivity.getActivitybyUser();
                var p4 = promoter.getbyUser($rootScope.user.id);
                var p5 = categorycode.get();
                var p6 = codeprice.get();
    
                return $q.all([p0, p1, p2, p3, p4, p5, p6]).then(function (d) {
                    $rootScope.cvotes = d[0];
                    $rootScope.editvotes = d[1];
                    $rootScope.cvrowvotes = d[2];
                    $rootScope.thisuseractivity = d[3];
                    $rootScope.userpromoter = d[4];
                    $rootScope.catcodes = d[5];
                    $rootScope.codeprices = d[6];
                    
                    if ($rootScope.DEBUG_MODE) console.log("user promoter - ",$rootScope.userpromoter);
                    $rootScope.userDataLoaded = true;
                    $rootScope.$emit('userDataLoaded');  
                });
            }
            else {
                if ($rootScope.DEBUG_MODE) console.log("user is not logged in, no need to load data");
                $rootScope.cvotes = [];
                $rootScope.editvotes = [];
                $rootScope.cvrowvotes = [];
                $rootScope.thisuseractivity = [];
                $rootScope.userpromoter = [];
                $rootScope.catcodes = [];
                $rootScope.codeprices = [];

                $rootScope.userDataLoaded = true;
                $rootScope.$emit('userDataLoaded');
            }
        }

        function loadUserAccount() {

            if ($rootScope.isLoggedIn) {
           
                //Check if user has business account    
                useraccnt.getuseraccnt().then(function (result) {
                    $rootScope.useraccnts = result;
                    $rootScope.showWarning = false;
                    if ($rootScope.useraccnts.length > 0) {
                        var missingEmail = true;
                        var url = '';
                        for (var i = 0; i < $rootScope.useraccnts.length; i++) {
                            
                            if ($rootScope.useraccnts[i].email != '') missingEmail = false;

                            //If user is customer, asynchronously ask server to get from Stripe latest invoice/subscription info
                            if ($rootScope.useraccnts[i].stripeid != undefined && $rootScope.useraccnts[i].stripeid != '' && 
                                $rootScope.useraccnts[i].stripeid != 0){
                                url = 'https://server.rank-x.com/dreamfactory-stripe-user/'+$rootScope.useraccnts[i].stripeid+'/'+$rootScope.useraccnts[i].id;
                                var req = {
                                    method: 'GET',
                                    url: url,
                                    headers: {
                                        'X-Dreamfactory-API-Key': undefined,
                                        'X-DreamFactory-Session-Token': undefined
                                    }
                                }

                                $http(req).then(function(result){
                                    console.log("Success updating Stripe Invoices - ", result);
                                },function(error){
                                    console.log("Error updating Stripe Invoices - ", error);
                                });
                                console.log("Retrieving latest invoice info from Stripe");
                            }
                        }
                        $rootScope.$emit('userAccountsLoaded');
                        if (missingEmail) {
                            $rootScope.showWarning = true;
                            $rootScope.$emit('showWarning');
                        }
                        else $rootScope.showWarning = false;
                    }
                });
            }
        }
    }
})();
(function () {
    'use strict';
    angular
        .module('app')
        .factory('useraccnt', useraccnt);
    useraccnt.$inject = ['$http','$q','$rootScope', 'login'];
    function useraccnt($http, $q, $rootScope, login) {
        var _useraccnts = [];
        var _promoteraccnts = [];
        var baseURI = '/api/v2/mysql/_table/useraccnts';

        var service = {
            getuseraccnt: getuseraccnt,
            getaccntsbycode: getaccntsbycode,
            getuseraccntans : getuseraccntans,
            adduseraccnt: adduseraccnt,
            updateuseraccnt: updateuseraccnt
    };
    return service;



      /*
       *
       * Function to get user detail from user_detail table for logged in user
       *
       */
      function getuseraccnt() {
        // console.log("useraccnt.srvc.js:getuseraccnt(forcerefresh): START");
          //if (_isuseraccntLoaded() && !forceRefresh) {

           //   return $q.when(_useraccnts);
          //}

          var url = baseURI + '' + '?filter=(user='+$rootScope.user.id+')';
          // console.log("useraccnt.srvc.js:getuseraccnt(forcerefresh): GET");
          return $http.get(url).then(querySucceeded, _queryFailed);

          function querySucceeded(result) {
            // console.log("useraccnt.srvc.js:getuseraccnt(forcerefresh): GET: SUCCESS");
            // console.log("result.data.resource: " + JSON.stringify(result.data.resource[0]));

              // return _useraccnts = result.data.resource[0];
              return _useraccnts = result.data.resource;
          }

      }

      function getuseraccntans(answer) {
        // console.log("useraccnt.srvc.js:getuseraccnt(forcerefresh): START");
          //if (_isuseraccntLoaded() && !forceRefresh) {

          //    return $q.when(_useraccnts);
          //}

          var url = baseURI + '' + '?filter=(user='+$rootScope.user.id+') AND (answer='+answer+')';

          // console.log("useraccnt.srvc.js:getuseraccnt(forcerefresh): GET");
          return $http.get(url).then(querySucceeded, _queryFailed);

          function querySucceeded(result) {
            // console.log("useraccnt.srvc.js:getuseraccnt(forcerefresh): GET: SUCCESS");
            // console.log("result.data.resource: " + JSON.stringify(result.data.resource[0]));

              // return _useraccnts = result.data.resource[0];
              return result.data.resource;
          }

      }

      function getaccntsbycode (code){

          var url = baseURI + '' + '?filter=(coupon='+code+')';
          // console.log("useraccnt.srvc.js:getuseraccnt(forcerefresh): GET");
          return $http.get(url).then(querySucceeded, _queryFailed);

          function querySucceeded(result) {
            // console.log("useraccnt.srvc.js:getuseraccnt(forcerefresh): GET: SUCCESS");
            // console.log("result.data.resource: " + JSON.stringify(result.data.resource[0]));

              // return _useraccnts = result.data.resource[0];
              return _promoteraccnts = result.data.resource;              
          }
      }

      /*
       *
       * Function to add user detail in user_detail table
       *
       */
      function adduseraccnt(answer) {
          /*
        console.log("START useraccnt.srvc.js:adduseraccnt:$rootScope.user.id: " + $rootScope.user.id)

        // check if the DF account already exists
        var url = baseURI + '' + '?filter=(user='+$rootScope.user.id+')';
        return $http.get(url).then(userSearchResult, _queryFailed);
        function userSearchResult(result) {
          var data = result.data.resource;
          var count = 0;
          if (data) {
            count = parseInt(JSON.stringify(data.length));
            // console.log("count: " + count);
            if (count > 0) {

              user = JSON.parse(localStorage.getItem("user"));
              user.dfUseraccntId = result.data.resource[0].id;
              user.stripeId = result.data.resource[0].stripeid
              window.localStorage.user = JSON.stringify(user);
              user = JSON.parse(localStorage.getItem("user"));

              console.log("YES found the DF account, user: " + JSON.stringify(user));

              return 0;
            } else {

              console.log("NO, did not find the DF account");

              var user = {};
              user = JSON.parse(localStorage.getItem("user"));

              console.log("app/login/services/useraccnt.srvc.js:userLocalStorage: " + JSON.stringify(user) );
*/
              //form match record
              var data = {};

              data.user = $rootScope.user.id;
              data.answer = answer.id;
              data.bizcat = getBizCat(answer.id);
              data.status = 'Basic';
              data.stripeid = '0';
              data.email = '';
              data.username = $rootScope.user.name;

              // MINIMUM NEEDED
              // "user":999,
              // "answer":0,
              // "bizcat":0,
              // "status":0

                var obj = {};
                obj.resource = [];
                obj.resource.push(data);

                //console.log("src/app/login/services/useraccnt.srvc.js:adduseraccnt():obj.resource = " + JSON.stringify(obj.resource) );
                // [{"answer":"","bizcat":"REB","status":"Non-paying","stripeid":"dskjflskdjflskjd","email":"10154674551822270+facebook@facebook.com"}]

                var url = baseURI;

                return $http.post(url, obj, {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    },
                    body: obj
                }).then(querySucceeded, _queryFailed);

                function querySucceeded(result) {
                    /*
                  console.log("useraccnt.srvc.js:querySucceeded:result:" + JSON.stringify(result));
                  console.log("the new useraccnt ID: " + result.data.resource[0].id);

                  user = JSON.parse(localStorage.getItem("user"));
                  user.dfUseraccntId = result.data.resource[0].id;
                  user.stripeId = result.data.resource[0].stripeid
                  window.localStorage.user = JSON.stringify(user);
                  user = JSON.parse(localStorage.getItem("user"));

                  console.log("useraccnt.srvc.js:user:" + JSON.stringify(user));
                  */

                  // window.localstorage.setItem("dfUseraccntId", result.data.resource[0].id);
                  // localStorage.user.dfUseraccntId = result.data.resource[0].id;
 //useraccnt.srvc.js:querySucceeded:result:{"data":{"resource":[{"id":112}]},"status":200,"config":{"method":"POST","transformRequest":[null],"transformResponse":[null],"headers":{"Content-Type":"multipart/form-data","Accept":"application/json, text/plain, */*","X-Dreamfactory-API-Key":"8b8174170d616f3adb571a0b28daf65a0cf07aa149aad9bf6554986856debdf4"},"body":{"resource":[{"user":37,"answer":0,"bizcat":"REB","status":"Non-paying","stripeid":"test","email":"sjurowski+facebook@ucsd.edu"}]},"url":"https://api.rank-x.com/api/v2/mysql/_table/useraccnts","data":{"resource":[{"user":37,"answer":0,"bizcat":"REB","status":"Non-paying","stripeid":"test","email":"sjurowski+facebook@ucsd.edu"}]}},"statusText":"OK"}

                  // console.log("useraccnt.srvc.js:localStorage.user:" + JSON.stringify(localStorage.user));
//useraccnt.srvc.js:localStorage.user:"{\"email\":\"sjurowski+facebook@ucsd.edu\",\"first_name\":\"Sandon\",\"host\":\"bitnami-dreamfactory-df88\",\"id\":37,\"is_sys_admin\":false,\"last_login_date\":\"2016-12-13 21:04:47\",\"last_name\":\"Jurowski\",\"name\":\"Sandon Jurowski\",\"role\":\"rank-user\",\"role_id\":1,\"session_id\":\"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjI5LCJ1c2VyX2lkIjoyOSwiZW1haWwiOiIxMDE1NDY3NDU1MTgyMjI3MCtmYWNlYm9va0BmYWNlYm9vay5jb20iLCJmb3JldmVyIjpmYWxzZSwiaXNzIjoiaHR0cHM6XC9cL2FwaS5yYW5rLXguY29tXC9hcGlcL3YyXC91c2VyXC9zZXNzaW9uIiwiaWF0IjoxNDgxNjYzMDg3LCJleHAiOjE0ODE2NjY2ODcsIm5iZiI6MTQ4MTY2MzA4NywianRpIjoiYWQ2M2Q0OTI1MDRmNTJiYjBkMWZiZjJkNzAxMjQzNDMifQ.T-3B-jnz4d2Q2Q5rfN1ePF7ujin982gzPYbRwhLo9Uc\",\"session_token\":\"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjI5LCJ1c2VyX2lkIjoyOSwiZW1haWwiOiIxMDE1NDY3NDU1MTgyMjI3MCtmYWNlYm9va0BmYWNlYm9vay5jb20iLCJmb3JldmVyIjpmYWxzZSwiaXNzIjoiaHR0cHM6XC9cL2FwaS5yYW5rLXguY29tXC9hcGlcL3YyXC91c2VyXC9zZXNzaW9uIiwiaWF0IjoxNDgxNjYzMDg3LCJleHAiOjE0ODE2NjY2ODcsIm5iZiI6MTQ4MTY2MzA4NywianRpIjoiYWQ2M2Q0OTI1MDRmNTJiYjBkMWZiZjJkNzAxMjQzNDMifQ.T-3B-jnz4d2Q2Q5rfN1ePF7ujin982gzPYbRwhLo9Uc\"}"

                  //update local copy
                  var datax = data;
                  datax.id = result.data.resource[0].id; 
                  _useraccnts.push(datax);

                  //return the ID of the new account row
                  return result.data.resource[0].id;
                }
            }
  /*        }
        }
      }
*/

      /*
      *
      * Function to update user detail in user_detail table
      *
      */
      function updateuseraccnt(recid, field, val) {

          //form match record
          var obj = {};
          obj.resource = [];

          var data = {};
          data.id = recid;
          //data.id = user;

          for (var i=0; i<field.length; i++){
              switch (field[i]){
                  case "bizcat": data.bizcat = val[i]; break;
                  case "email": data.email = val[i]; break;
                  case "status": data.status = val[i]; break;
                  case "stripeid": data.stripeid = val[i]; break;
                  case "ispremium": data.ispremium = val[i]; break;
                  case "hasranks": data.hasranks = val[i]; break;
                  case "ranksqty": data.ranksqty = val[i]; break;
                  case "name": data.name = val[i]; break;
              }
          }
          //console.log("data", data);
          obj.resource.push(data);
          //console.log("obj.resource - ", obj);

          var url = baseURI;

          //update local copy
          var idx = _useraccnts.map(function(x) {return x.id; }).indexOf(recid);
          for (var i=0; i<field.length; i++){
              switch (field[i]){
                  case "bizcat": _useraccnts[idx].bizcat = val[i]; break;
                  case "email": _useraccnts[idx].email = val[i]; break;
                  case "status": _useraccnts[idx].status = val[i]; break;
                  case "stripeid": _useraccnts[idx].stripeid = val[i]; break;
                  case "ispremium": _useraccnts[idx].ispremium = val[i]; break;
                  case "hasranks": _useraccnts[idx].hasranks = val[i]; break;
                  case "ranksqty": _useraccnts[idx].ranksqty = val[i]; break;
                  case "name": _useraccnts[idx].name = val[i]; break;
              }
          }

          return $http.patch(url, obj, {
              headers: {
                  "Content-Type": "multipart/form-data"
              },
              body: obj
          }).then(querySucceeded, _queryFailed);
          function querySucceeded(result) {

              // console.log("User account successfully updated.");
              $rootScope.$emit('clear-notification-warning');
              return result.data;
          }
      }

      //Find which business category this answer belongs to
      function getBizCat(answerid) {
          var category = 0;
          var rank = {};
          var bizcat = '';
          var scale_current = 0;
          var scale_this = 0;
          for (var j = 0; j < $rootScope.catansrecs.length; j++) {
              if ($rootScope.catansrecs[j].answer == answerid) {
                  category = $rootScope.catansrecs[j].category;
                  var idx = $rootScope.content.map(function (x) { return x.id; }).indexOf(category);
                  rank = $rootScope.content[idx];
                  for (var k = 0; k < $rootScope.catcodes.length; k++) {
                      if (rank.title.indexOf($rootScope.catcodes[k].category) > -1) {
                          if (bizcat == '') {
                              bizcat = $rootScope.catcodes[k].code;
                          }
                          else {
                              //find current value of answer bizcat
                              for (var l = 0; l < $rootScope.codeprices.length; l++) {
                                  if ($rootScope.codeprices[l].code == bizcat) {
                                      scale_current = $rootScope.codeprices[l].scale;
                                  }
                                  if ($rootScope.codeprices[l].code == $rootScope.catcodes[k].code) {
                                      scale_this = $rootScope.codeprices[l].scale;
                                  }
                              }
                              if (scale_this > scale_current) {
                                  bizcat = $rootScope.catcodes[k].code;
                              }
                          }
                      }
                  }
              }
          }
          return bizcat;
      }

      function _isuseraccntLoaded() {

          if (!_useraccnts) {
            return false
          } else {
            return _useraccnts.length > 0;
          }
      }

      function _queryFailed(error) {
        //
        // console.log("app/login/services/useraccnt.srvc.js:_queryFailed(error):result.data: " + JSON.stringify(result.data);

          throw error;
      }
    }
})();

(function() {
    'use strict';

    angular
        .module('app')
        .factory('login', login);

    login.$inject = ['$http', '$q', '$cookies', '$rootScope', 'INSTANCE_URL', '$state', '$location', '$window', '$facebook', 'fbusers'];

    function login($http, $q, $cookies, $rootScope, INSTANCE_URL, $state, $location, $window, $facebook, fbusers) {
        var service = {
            initiate: initiate,
            loginWithFacebook: loginWithFacebook,
            oauthWithFacebook: oauthWithFacebook,
            register: register,
            logout: logout,
            setFakeLocalUser: setFakeLocalUser,
            facebookSDKLogin: facebookSDKLogin
        };
        // getUserObjectFromLocalStorage: getUserObjectFromLocalStorage,

        return service;

        function facebookSDKLogin() {

            return service.loginWithFacebook()
            .then(function(res) {
                return $facebook.login('public_profile,email,user_friends')
                    .then(function(res) {
                        if (res.status === 'connected') {
                            return $facebook.api("/me?fields=id,name,picture,first_name,last_name,gender,age_range,locale");
                        }
                    })
                    .then(function(me) {
                        console.log('My info: ', me);

                        $rootScope.user = me;
                        return $facebook.api('me/friends?fields=first_name,gender,locale,last_name,email,picture');
                    })
                    .then(function(friends) {
                        console.log('Got friends: ', friends);

                        $rootScope.user.friends = friends;
                        $rootScope.isLoggedIn = true;

                        fbusers.addFBUser($rootScope.user);
                        try {
                            window.localStorage.user = JSON.stringify($rootScope.user);
                        } catch (e) {}

                        if ($rootScope.DEBUG_MODE) console.log("oauthWithFacebook succesful");
                        $rootScope.$emit('redirectAfterLogin');
                    })
                    .catch(function(err) {
                        console.log(err);
                    });
            });
        }

        function initiate(options) {
            console.log("login/services/login.svc.js:initiate");

            return $http.post('/api/v2/user/session', options).then(function(result) {
                $http.defaults.headers.common['X-DreamFactory-Session-Token'] = result.data.session_token;
                $cookies.session_token = result.data.session_token;

                $rootScope.user = result.data;

                try {
                    window.localStorage.user = JSON.stringify(result.data);
                } catch (e) {}
            });
        }

        function loginWithFacebook() {

            if ($rootScope.DEBUG_MODE) console.log("@loginWithFacebook");

            var statename = '';
            var statenum = 0;
            var ccategory = 0;

            //Store in cookies memory to redirect after login, ignore state:login
            if ($rootScope.stateName == undefined) statename = $state.current.name;
            else statename = $rootScope.stateName;

            if ($rootScope.stateName == undefined) {
                if (statename == 'rankSummary') statenum = $rootScope.cCategory.id;
                if (statename == 'answerDetail') statenum = $rootScope.canswer.id;
            } else statenum = $rootScope.stateNum;

            if ($rootScope.cCategory != undefined) ccategory = $rootScope.cCategory.id;
            else ccategory = undefined;

            $cookies.put('statename', statename);
            $cookies.put('statenum', statenum);
            $cookies.put('ccategory', ccategory);

            var deferred = $q.defer();

            var url = INSTANCE_URL + '/api/v2/user/session?service=facebook';
            deferred.resolve({
                url: url
            });

            return deferred.promise;
        }

        function oauthWithFacebook(queryString) {

            if ($rootScope.DEBUG_MODE) console.log("@oauthWithFacebook - ", queryString);

            return $http.post('/api/v2/user/session?oauth_callback=true&service=facebook&' + queryString).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {
                console.log("oauth results", result);
                $http.defaults.headers.common['X-DreamFactory-Session-Token'] = result.data.session_token;
                $cookies.session_token = result.data.session_token;

                $rootScope.user = result.data;
                $rootScope.isLoggedIn = true;

                try {
                    window.localStorage.user = JSON.stringify(result.data);
                    //$window.location.search = '';
                } catch (e) {}

                if ($rootScope.DEBUG_MODE) console.log("oauthWithFacebook succesful");
                $rootScope.$emit('redirectAfterLogin');
            }
        }

        function logout() {

            return $http.delete('/api/v2/user/session').then(function(result) {

                delete $http.defaults.headers.common['X-DreamFactory-Session-Token'];
                $cookies.remove('session_token');
                delete $rootScope.user;
                $rootScope.isLoggedIn = false;

                try {
                    window.localStorage.removeItem('user');
                } catch (e) {}

            });
        }

        function _queryFailed(error) {

            console.log("error", error);
            throw error;
        }

        function register(options) {


            console.log("options", options);
            return $http.post('/api/v2/user/register?login=true', options).then(function(result) {
                console.log("register result", result);

            }, function(error) {

                console.log("error", error);
            });
        }

        function setFakeLocalUser() {

            // On the production facebook login, the
            // localstorage data object is like:
            // --------------------------------------
            // key:user
            //value:{"session_token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjI5LCJ1c2VyX2lkIjoyOSwiZW1haWwiOiIxMDE1NDY3NDU1MTgyMjI3MCtmYWNlYm9va0BmYWNlYm9vay5jb20iLCJmb3JldmVyIjpmYWxzZSwiaXNzIjoiaHR0cHM6XC9cL2FwaS5yYW5rLXguY29tXC9hcGlcL3YyXC91c2VyXC9zZXNzaW9uIiwiaWF0IjoxNDgxNTgxNDEyLCJleHAiOjE0ODE1ODUwMTIsIm5iZiI6MTQ4MTU4MTQxMiwianRpIjoiYzNlOGI4ZDYxZThmNzEzMTdhNzAyNDM3ODk5OTA3MDEifQ.o4myV3Yb-3l-_xcEHI8fsRO4HCxuR7e4hUW--Jy94Vk","session_id":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjI5LCJ1c2VyX2lkIjoyOSwiZW1haWwiOiIxMDE1NDY3NDU1MTgyMjI3MCtmYWNlYm9va0BmYWNlYm9vay5jb20iLCJmb3JldmVyIjpmYWxzZSwiaXNzIjoiaHR0cHM6XC9cL2FwaS5yYW5rLXguY29tXC9hcGlcL3YyXC91c2VyXC9zZXNzaW9uIiwiaWF0IjoxNDgxNTgxNDEyLCJleHAiOjE0ODE1ODUwMTIsIm5iZiI6MTQ4MTU4MTQxMiwianRpIjoiYzNlOGI4ZDYxZThmNzEzMTdhNzAyNDM3ODk5OTA3MDEifQ.o4myV3Yb-3l-_xcEHI8fsRO4HCxuR7e4hUW--Jy94Vk","id":29,"name":"Sandon Jurowski","first_name":"Sandon","last_name":"Jurowski","email":"sjurowski+facebook@ucsd.edu","is_sys_admin":false,"last_login_date":"2016-12-12 22:23:32","host":"bitnami-dreamfactory-df88","role":"rank-user","role_id":1}

            // OLD value:{"session_token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjI5LCJ1c2VyX2lkIjoyOSwiZW1haWwiOiIxMDE1NDY3NDU1MTgyMjI3MCtmYWNlYm9va0BmYWNlYm9vay5jb20iLCJmb3JldmVyIjpmYWxzZSwiaXNzIjoiaHR0cHM6XC9cL2FwaS5yYW5rLXguY29tXC9hcGlcL3YyXC91c2VyXC9zZXNzaW9uIiwiaWF0IjoxNDgxNTgxNDEyLCJleHAiOjE0ODE1ODUwMTIsIm5iZiI6MTQ4MTU4MTQxMiwianRpIjoiYzNlOGI4ZDYxZThmNzEzMTdhNzAyNDM3ODk5OTA3MDEifQ.o4myV3Yb-3l-_xcEHI8fsRO4HCxuR7e4hUW--Jy94Vk","session_id":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjI5LCJ1c2VyX2lkIjoyOSwiZW1haWwiOiIxMDE1NDY3NDU1MTgyMjI3MCtmYWNlYm9va0BmYWNlYm9vay5jb20iLCJmb3JldmVyIjpmYWxzZSwiaXNzIjoiaHR0cHM6XC9cL2FwaS5yYW5rLXguY29tXC9hcGlcL3YyXC91c2VyXC9zZXNzaW9uIiwiaWF0IjoxNDgxNTgxNDEyLCJleHAiOjE0ODE1ODUwMTIsIm5iZiI6MTQ4MTU4MTQxMiwianRpIjoiYzNlOGI4ZDYxZThmNzEzMTdhNzAyNDM3ODk5OTA3MDEifQ.o4myV3Yb-3l-_xcEHI8fsRO4HCxuR7e4hUW--Jy94Vk","id":29,"name":"Sandon Jurowski","first_name":"Sandon","last_name":"Jurowski","email":"10154674551822270+facebook@facebook.com","is_sys_admin":false,"last_login_date":"2016-12-12 22:23:32","host":"bitnami-dreamfactory-df88","role":"rank-user","role_id":1}

            // on logout, the above object is deleted
            // --------------------------------------

            //  from the mysql db on dreamfactory 20161127
            //  "id": 34,
            //  "name": "Sandon Jurowski",
            //  "first_name": "Sandon",
            //  "last_name": "Jurowski",
            //  "last_login_date": null,
            //  "email": "sjurowski@ucsd.edu",

            //  login.initiate();

            //  $rootScope.isLoggedIn = true;
            //  $rootScope.user = {};
            //  $rootScope.answeridxgps = 1258; //starting indx for gps conversion
            //  $rootScope.user.id = 34;
            //  $rootScope.user.email = "sjurowski@ucsd.edu";
            //  $rootScope.user.name = "Sandon Jurowski";
            //  $rootScope.user.first_name = 'Sandon';
            //  $rootScope.isAdmin = true;
            //  vm.isAdmin = true;
            //
            //  // *** end sgj portal.works ***
            //
            //
            // vm.user = $rootScope.user;
            // vm.goBack = goBack;
            // vm.goPremium = goPremium;
            // --------------------------------------


            // taking the place of result.data below
            var fakeResult = new Object();
            fakeResult.age_range = { min: 21 };
            fakeResult.first_name = 'Test';
            fakeResult.friends = {
                data: [],
                summary: {}
            };
            fakeResult.gender = 'male';
            fakeResult.id = 187959328383879;
            fakeResult.last_name = 'User';
            fakeResult.locale = "us_EN";
            fakeResult.name = "Test User";
            fakeResult.picture = {
                data: {
                    url: "https://scontent.xx.fbcdn.net/v/t1.0-1/p50x50/18057110_194133167766495_4123816583005617544_n.jpg?oh=7dc367a88a4d28f4f84137f9007f847e&oe=59836C25"
    
                }
            }
            
            // fakeResult.email = "sjurowski+facebook@ucsd.edu";

            // // fakeResult.email = "10154674551822270+facebook@facebook.com";
            // fakeResult.first_name = "Sandon";
            // fakeResult.host = "bitnami-dreamfactory-df88";
            // fakeResult.id = 187959328383879;
            // // fakeResult.id = 29;
            // fakeResult.is_sys_admin = false;
            // fakeResult.last_login_date = "2016-12-13 21:04:47";
            // fakeResult.last_name = "Jurowski";
            // fakeResult.name = "Sandon Jurowski";
            // fakeResult.role = "rank-user";
            // fakeResult.role_id = 1;
            // fakeResult.session_id = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjI5LCJ1c2VyX2lkIjoyOSwiZW1haWwiOiIxMDE1NDY3NDU1MTgyMjI3MCtmYWNlYm9va0BmYWNlYm9vay5jb20iLCJmb3JldmVyIjpmYWxzZSwiaXNzIjoiaHR0cHM6XC9cL2FwaS5yYW5rLXguY29tXC9hcGlcL3YyXC91c2VyXC9zZXNzaW9uIiwiaWF0IjoxNDgxNjYzMDg3LCJleHAiOjE0ODE2NjY2ODcsIm5iZiI6MTQ4MTY2MzA4NywianRpIjoiYWQ2M2Q0OTI1MDRmNTJiYjBkMWZiZjJkNzAxMjQzNDMifQ.T-3B-jnz4d2Q2Q5rfN1ePF7ujin982gzPYbRwhLo9Uc";
            // fakeResult.session_token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjI5LCJ1c2VyX2lkIjoyOSwiZW1haWwiOiIxMDE1NDY3NDU1MTgyMjI3MCtmYWNlYm9va0BmYWNlYm9vay5jb20iLCJmb3JldmVyIjpmYWxzZSwiaXNzIjoiaHR0cHM6XC9cL2FwaS5yYW5rLXguY29tXC9hcGlcL3YyXC91c2VyXC9zZXNzaW9uIiwiaWF0IjoxNDgxNjYzMDg3LCJleHAiOjE0ODE2NjY2ODcsIm5iZiI6MTQ4MTY2MzA4NywianRpIjoiYWQ2M2Q0OTI1MDRmNTJiYjBkMWZiZjJkNzAxMjQzNDMifQ.T-3B-jnz4d2Q2Q5rfN1ePF7ujin982gzPYbRwhLo9Uc";

            // console.log("oauth fake setting", fakeResult);
            // $http.defaults.headers.common['X-DreamFactory-Session-Token'] = fakeResult.session_token;

            $cookies.session_token = fakeResult.session_token;

            $rootScope.user = fakeResult;

            try {
                window.localStorage.user = JSON.stringify(fakeResult);

                // returning just "fakeResult" doesn't preserve the details
                return {
                    email: fakeResult.email,
                    first_name: fakeResult.first_name,
                    host: fakeResult.host,
                    id: fakeResult.id,
                    is_sys_admin: fakeResult.is_sys_admin,
                    last_login_date: fakeResult.last_login_date,
                    last_name: fakeResult.last_name,
                    name: fakeResult.name,
                    role: fakeResult.role,
                    role_id: fakeResult.role_id,
                    session_id: fakeResult.session_id,
                    session_token: fakeResult.session_token
                };
            } catch (e) {}

        }
        // end sgj portal.works




    }
})();
(function () {
    'use strict';

    angular.module('login', [
        // Angular modules 
        'ngResource',
        'ngCookies',

        // Custom modules 

        // 3rd Party Modules
        'ui.router'
    ])

    .run(['$rootScope', function ($rootScope) {

        try {
            $rootScope.user = JSON.parse(window.localStorage.user);

            if ($rootScope.user) {
                $rootScope.isLoggedIn = true;
            }
        } catch (e) { };
    }])

    .config(function() {

        // Set your appId through the setAppId method or
        // use the shortcut in the initialize method directly
        //FacebookProvider.init('582752768556573');
    })
})();

(function () {
    'use strict';

    angular
        .module('login')
        .factory('httpInterceptor', httpInterceptor);

    httpInterceptor.$inject = ['$location', '$q', '$injector', 'INSTANCE_URL'];

    function httpInterceptor($location, $q, $injector, INSTANCE_URL) {
        var service = {
            request: request,
            responseError: responseError
        };

        return service;

        function request(config) {

            // Append instance url before every api call
            if (config.url.indexOf('/api/v2') > -1) {
                config.url = INSTANCE_URL + config.url;
            };

            // Append instance url before every api call
            if (config.url.indexOf('api.instagram.com') > -1) {
                config.headers.useXDomain = true;
                config.headers.common = 'Content-Type: application/json';
                delete config.headers.common['X-Requested-With'];
                delete config.headers['X-DreamFactory-Session-Token'];
                delete config.headers['X-Dreamfactory-API-Key'];

            };
            // delete x-dreamfactory-session-token header if login
            if (config.method.toLowerCase() === 'post' && config.url.indexOf('/api/v2/user/session') > -1) {
                delete config.headers['X-DreamFactory-Session-Token'];
            }

            return config;
        }

        function responseError(result) {
            
            console.log("result", result);

            // handle redirections for facebook login
            if (result.status == 302) {

                console.log("result", result);
                $location.path('/login');
                return $q.reject(result);
            }

            // If status is 401 or 403 with token blacklist error then redirect to login
            if (result.status === 401 || (result.status === 403 && result.data.error.message.indexOf('token') > -1)) {
                $location.path('/login');
            }

            return $q.reject(result);
        }
    }
})();
(function () {
    'use strict';

    angular
        .module('login')
        .controller('register', register);

    register.$inject = ['$location', '$rootScope', 'login']; 

    function register($location, $rootScope, login) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'register';

        // Members
        vm.username = '';
        vm.password = '';
        vm.confirm = '';
        vm.firstName = '';
        vm.lastName = '';
        vm.message = '';

        // Methods
        vm.register = register;
        vm.signIn = signIn;

        activate();

        function activate() {

            $rootScope.isLoggedIn = false;
        }

        function register() {

            console.log("register", register);
            login.register({
                email: vm.username,
                password: vm.password,
                first_name: vm.firstName || 'Address',
                last_name: vm.lastName || 'Book'
            }).then(function () {
                $location.path('/bizlogin');
            }, function (error) {

                vm.message = error.Message;
                console.log("Error: ", error);
            });
        }

        function signIn() {

            $location.path('/bizlogin');
        }
    }
})();

(function () {
    'use strict';

    angular
        .module('login')
        .controller('login', login);

    login.$inject = ['$location', '$window', '$rootScope', 'login', 'dialog', '$state', '$cookies','$http', '$facebook', 'fbusers', 'InstagramService'];

    function login($location, $window, $rootScope, login, dialog, $state, $cookies, $http, $facebook, fbusers, InstagramService) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'login';

        // Members
        vm.username = '';
        vm.password = '';
        vm.code = '';
        vm.isProgressing = false;

        // Methods
        vm.submit = submit;
        vm.register = register;
        vm.redirectForFacebook = redirectForFacebook;
        vm.whyFacebookDialog = whyFacebookDialog;
        vm.facebookLogin = facebookLogin;
        vm.goBack = goBack;

        function facebookLogin(){
            login.facebookSDKLogin();
        }

        $rootScope.$on('redirectAfterLogin', function () {
            redirectToState();
        });

        // Only use on localhost to fake a FB login
        if (window.location.hostname == "localhost") {
          console.log("server is: " + window.location.hostname)
          console.log("let's fake your user as an FB login")
          login.setFakeLocalUser();
        }

        if ($rootScope.isLoggedIn) $state.go('cwrapper');
        // else activate();

        function activate() {

            //vm.response = parseResults();
            var queryString = location.search;


            var idx = queryString.lastIndexOf("?");

            if (idx >= 0) {
                queryString = queryString.substr(idx + 1);
            }

            if (queryString) {
                //vm.code = vm.response.code;
                
                vm.isProgressing = true;
                
                login.oauthWithFacebook(queryString)
                    .then(function (result) {

                        var currentUserLatitude = $cookies.get('currentUserLatitude');
                        var currentUserLongitude = $cookies.get('currentUserLongitude');

                        if (currentUserLatitude && currentUserLongitude) {
                            $rootScope.currentUserLatitude = currentUserLatitude;
                            $rootScope.currentUserLongitude = currentUserLongitude;
                            $rootScope.coordsRdy = true;
                            $rootScope.$emit('coordsRdy');
                        }

                        if ($rootScope.isLoggedIn) redirectToState();
    
                    }, function () {
                        vm.isProgressing = false;
                    });
            }

            console.log("vm.code", vm.code);
            $rootScope.isLoggedIn = false;

        }

        function submit() {

            console.log("submit");
            login.initiate({
                email: vm.username,
                password: vm.password
            }).then(function () {
                $rootScope.isLoggedIn = true;

                console.log("isLoggedIn", $rootScope.isLoggedIn);
                $location.path('/');
            })
        }

        function redirectToState(){
            var statename = $cookies.get('statename');
            var statenum = $cookies.get('statenum');

            if (statename == 'rankSummary' || statename == 'answerDetail') {
                $state.go(statename, { index: statenum });
            }
            else {
                $state.go('cwrapper');
            }
        }

        function redirectForFacebook() {

            login.loginWithFacebook()
                .then(function (result) {
                    console.log("result @loginWithFacebook - ", result);
                    $window.location = result.url;
                });
        }

        function parseResults() {

            var queryString = location.search;

            console.log("queryString", queryString);
            var idx = queryString.lastIndexOf("?");

            if (idx >= 0) {
                queryString = queryString.substr(idx + 1);
            }

            var params = {},
                regex = /([^&=]+)=([^&]*)/g,
                m;

            var counter = 0;

            while (m = regex.exec(queryString)) {
                params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
                if (counter++ > 50) {

                    return {
                        error: "Response exceedded expected number of parameters"
                    }
                }
            }

            for (var proper in params) {
                return params;
            }
        }

        function register() {
            $location.path('/register');
        }

        function goBack() {
            $state.go('cwrapper');
        }

        function whyFacebookDialog() {
            dialog.getDialog('whyFacebook');
        }
    }
})();

(function () {
    'use strict';

    angular
        .module('login')
        .controller('bizlogin', bizlogin);

    bizlogin.$inject = ['$location', '$window', '$rootScope', 'login', 'dialog', 'userDetail','$state'];

    function bizlogin($location, $window, $rootScope, login, dialog, userDetail,$state) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'bizlogin';

        // Members
        vm.username = '';
        vm.password = '';
        vm.code = '';
        vm.isProgressing = false;

        // Methods
        vm.submit = submit;

        activate();

        function activate() {

            //vm.response = parseResults();
            var queryString = location.search;


            var idx = queryString.lastIndexOf("?");

            if (idx >= 0) {
                queryString = queryString.substr(idx + 1);
            }

            if (queryString) {
                //vm.code = vm.response.code;

                vm.isProgressing = true;
                login.oauthWithFacebook(queryString)
                    .then(function (result) {

                        $rootScope.isLoggedIn = true;

                        console.log("isLoggedIn", $rootScope.isLoggedIn);

                        //$location.path('/');
                        $state.go('cwrapper', {}, {location: 'replace'});

                    },function () {
                        vm.isProgressing = false;
                    });
            }

            console.log("vm.code bizlogin --", vm.code);
            $rootScope.isLoggedIn = false;

        }

        function submit() {

            console.log("bizlogin - submit");
            login.initiate({
                email: vm.username,
                password: vm.password
            }).then(function () {
                $rootScope.isLoggedIn = true;

                console.log("isLoggedIn", $rootScope.isLoggedIn);
                $state.go('cwrapper', {}, {location: 'replace'});
            })
        }

        function parseResults() {

            var queryString = location.search;

            console.log("queryString", queryString);
            var idx = queryString.lastIndexOf("?");

            if (idx >= 0) {
                queryString = queryString.substr(idx + 1);
            }

            var params = {},
                regex = /([^&=]+)=([^&]*)/g,
                m;

            var counter = 0;

            while (m = regex.exec(queryString)) {
                params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
                if (counter++ > 50) {

                    return {
                        error: "Response exceedded expected number of parameters"
                    }
                }
            }

            for (var proper in params) {
                return params;
            }
        }


   }
})();

angular.module('app').directive("userDetailModal",
    ["$rootScope", "userDetail", "dialog", function ($rootScope, userDetail, dialog) {
        'use strict';
        return {
            restrict: "E",
            templateUrl: "app/login/partials/add-user-detail.html",
            link: function ($scope, element, attrs, ngModel) {

                $scope.maxDate = moment().format('YYYY-MM-DD');

                $rootScope.openUserDetailModal = function () {

                    if ($rootScope.user) {
                        //select default options for gender as male
                        $rootScope.user.gender = "Male";
                        $rootScope.user.birth_date = '';
                    }
                    openModal("#addUserDetailModal");

                };

                /**
                 * Function to call service for adding user detail
                 * on success change local storage object for current user
                 */
                $rootScope.addUserDetail = function () {

                    userDetail.addUserDetail().then(function (result) {

                        userDetail.getUserDetail().then(function (result) {

                            if (Object.keys(result).length == 0) {

                                $rootScope.openUserDetailModal();

                            } else {
                                $rootScope.user.age = calculateAge(new Date(result[0].birth_date));
                                $rootScope.user.gender = result[0].gender;
                                $rootScope.user.birth_date = result[0].birth_date;

                                try {
                                    window.localStorage.user = JSON.stringify($rootScope.user);
                                } catch (e) {
                                }
                            }

                        });
                        closeModal("#addUserDetailModal");
                    });
                };

                // Dialog - Why this information is required
                $rootScope.whyThisInfoDialog = function () {

                    dialog.getDialog('whyUserData');

                };

                if ($rootScope.user) {
                    if (!$rootScope.user.birth_date || !$rootScope.user.gender)
                        $rootScope.openUserDetailModal();
                }
            }
        }
    }]);
(function () {
    'use strict';

    angular
        .module('app')
        .factory('color', color);

    color.$inject = ['$http', '$q', '$rootScope'];

    function color($http, $q, $rootScope) {

        var service = {
            shadeColor: shadeColor,
            hsl2rgb: hsl2rgb,
            hue2rgb: hue2rgb,
            defaultRankColor: defaultRankColor
        };

        return service;
        //Color must be on format '#AA00BB'
        function shadeColor(color, percent) {

            if (color.charAt(0) != '#'){
                if (color == 'red') color = '#ff0000';
                else if (color == 'black') color = '#000000';
                else if (color == 'grey' || color == 'gray') color = '#808080';
                else if (color == 'lightgrey' || color == 'lightgray') color = '#d3d3d3';
                else if (color == 'darkgrey' || color == 'darkgray') color = '#a9a9a9';
                else if (color == 'green') color = '#008000';
                else if (color == 'brown') color = '#a52a2a';
                else if (color == 'blue') color = '#0000ff';
                else if (color == 'white') color = '#ffffff';
                else console.log("Dont know what color is ", color);
            }

            var f = parseInt(color.slice(1), 16), t = percent < 0 ? 0 : 255, p = percent < 0 ? percent * -1 : percent, R = f >> 16, G = f >> 8 & 0x00FF, B = f & 0x0000FF;
            return "#" + (0x1000000 + (Math.round((t - R) * p) + R) * 0x10000 + (Math.round((t - G) * p) + G) * 0x100 + (Math.round((t - B) * p) + B)).toString(16).slice(1);
        }

        function hsl2rgb(hsl) {
            var a, b, g, h, l, p, q, r, ref, s;
            //if (isString(hsl)) {
                //if (!hsl.match(Color.HSL_REGEX)) {
                //    return;
                //}
                ref = hsl.match(/hsla?\((.+?)\)/)[1].split(',').map(function (value) {
                    value.trim();
                    return parseFloat(value);
                }), h = ref[0], s = ref[1], l = ref[2], a = ref[3];
            //} else if ((isObject(hsl)) && (hasKeys(hsl, ['h', 's', 'l']))) {
            //    h = hsl.h, s = hsl.s, l = hsl.l, a = hsl.a;
            //} else {
            //    return;
            //}
            h /= 360;
            s /= 100;
            l /= 100;
            if (s === 0) {
                r = g = b = l;
            } else {
                q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                p = 2 * l - q;
                r = hue2rgb(p, q, h + 1 / 3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1 / 3);
            }
            return '#' + Math.round(r * 255).toString(16) + Math.round(g * 255).toString(16) + Math.round(b * 255).toString(16);
        }

        function hue2rgb(p, q, t){
                if(t < 0) t += 1;
                if(t > 1) t -= 1;
                if(t < 1/6) return p + (q - p) * 6 * t;
                if(t < 1/2) return q;
                if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
        }

        function defaultRankColor(x){
             //Determine background color for rank of rankofday
             var bc = '';
             var fc = '';

                    if (x.tags.indexOf('food')>-1) {bc = 'brown'; fc = '#f8f8ff';}
                    else if (x.tags.indexOf('lifestyle')>-1) {bc = '#008080'; fc = '#f8f8ff';}
                    else if (x.tags.indexOf('social')>-1) {bc = '#4682b4'; fc = '#f8f8ff';}
                    else if (x.tags.indexOf('city')>-1) {bc = 'gray'; fc = '#f8f8ff';}
                    else if (x.tags.indexOf('neighborhood')>-1) {bc = 'gray'; fc = '#f8f8ff';}
                    else if (x.tags.indexOf('politics')>-1) {bc = '#595959'; fc = '#f8f8ff';}
                    else if (x.tags.indexOf('sports')>-1) {bc = '#e6e6e6'; fc = '#0033cc';} 
                    else if (x.tags.indexOf('beauty')>-1) {bc = '#a3297a'; fc = '#f8f8ff';}
                    else if (x.tags.indexOf('health')>-1) {bc = 'green'; fc = '#f8f8ff';}
                    else if (x.tags.indexOf('technology')>-1) {bc = 'gray'; fc = '#f8f8ff';}
                    else if (x.tags.indexOf('dating')>-1) {bc = '#b22222'; fc = '#f8f8ff';}
                    else if (x.tags.indexOf('personalities')>-1) {bc = '#e6b800'; fc = 'black';}
                    else {bc = 'gray'; fc = '#f8f8ff';}

                    return [bc, fc];
        }

    }
})();
(function () {
    'use strict';

    angular
        .module('app')
        .factory('city', city);

    city.$inject = ['$http', '$q', '$rootScope'];

    function city($http, $q, $rootScope) {

        // Members
        var _cities = [];
        var baseURI = '/api/v2/mysql/_table/cities';

        var service = {
            getCities: getCities
        };

        return service;

        function getCities(forceRefresh) {

            if (_areCitiesLoaded() && !forceRefresh) {

                return $q.when(_cities);
            }

            var url = baseURI;

            return $http.get(url).then(citySucceeded, _cityFailed);

            function citySucceeded(result) {

                return _cities = result.data.resource;
            }

        }

        function _areCitiesLoaded() {

            return _cities.length > 0;
        }

        function _cityFailed(error) {

            throw error;
        }
    }
})();
angular.module('app').directive("citySelectionModal",
        ["$rootScope", function ($rootScope) {
                'use strict';
            return {
                restrict: "E",
                templateUrl: "app/layout/Partials/city-selection.html",
                link: function ($scope, element, attrs, ngModel) {

                    $rootScope.selectedCity = JSON.parse(window.localStorage.selectedCity);

                }
            }
        }]);
(function () {
    'use strict';

    angular
        .module('app')
        .controller('privacypolicy', privacypolicy);

    privacypolicy.$inject = ['$state','$rootScope'];

    function privacypolicy($state, $rootScope) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'privacypolicy';

        vm.goBack = goBack;
        
        activate();

        function activate() {            

            console.log("privacypolicy page Loaded!");
            
        }

        function goBack() {
            if ($rootScope.previousState == 'rankSummary')
                    $state.go('rankSummary', {index: $rootScope.cCategory.id});
            else if ($rootScope.previousState == 'answerDetail')
                    $state.go('answerDetail', {index: $rootScope.canswer.id});
            else if ($rootScope.previousState == 'addAnswer')
                    $state.go('addAnswer', {index: $rootScope.canswer.id});
            else if ($rootScope.previousState == 'editAnswer')
                    $state.go('editAnswer', {index: $rootScope.canswer.id});                
            else if ($rootScope.previousState == 'about')
                    $state.go('about');
            else $state.go('cwrapper');                
        }

    }
})();

(function () {
    'use strict';

    angular
        .module('app')
        .controller('navbar', navbar);

    navbar.$inject = ['$location', '$translate', '$rootScope', 'login', '$state',
        'city', '$cookies', '$http', 'GOOGLE_API_KEY', 'dialog','getgps', 'useraccnt'];

    function navbar($location, $translate, $rootScope, login, $state,
        city, $cookies, $http, GOOGLE_API_KEY, dialog, getgps, useraccnt) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'navbar';

        // Members
        vm.user = $rootScope.user;
        vm.isLoggedIn = $rootScope.isLoggedIn ? $rootScope.isLoggedIn : false;

        // Methods
        vm.logout = logout;
        vm.goToLogin = goToLogin;
        vm.gotoAbout = gotoAbout;
        vm.gotomybusiness = gotomybusiness;
        vm.gotomyfavs = gotomyfavs;
        vm.gotoFeedback = gotoFeedback;
        vm.gotoTour = gotoTour;
        vm.gotoHome = gotoHome;
        vm.gotoAdmin = gotoAdmin;
        vm.goPromoterConsole = goPromoterConsole;
        vm.gotoFileUpload = gotoFileUpload;
        vm.gotoCustomer = gotoCustomer;
        vm.openCitySelection = openCitySelection;
        vm.goWarning = goWarning;
        vm.goCoords = goCoords;

        if ($rootScope.coordsRdy == undefined) $rootScope.coordsRdy = false;
        $rootScope.loadFbnWhenCoordsRdy = false;

        //Geolocation options
        var geoOptions = {};

        vm.warning = false;

        $rootScope.$on('getLocation', function (e) {
            autoDetectCity();
        });

        $rootScope.$on('coordsRdy', function (e) {
            showCoordsIcon();
        });

        $rootScope.$on('showWarning', function (e) {
            if ($rootScope.DEBUG_MODE) console.log("rx showWarning");
            showWarningsIcon();
        });

        $rootScope.$on('hideWarning', function (e) {
            if ($rootScope.DEBUG_MODE) console.log("rx clearWarning");
            hideWarningsIcon();
        });

        $rootScope.$on('useAddress', function (e, address) {
            var obj = {};
            obj.location = address.address;
            obj.lat = 0;
            obj.lng = 0;
            $rootScope.coordForUSer = true;
            getgps.getLocationGPS(obj);
        });

        $rootScope.$on('userDataLoaded', function (e) {
            //if ($rootScope.isLoggedIn && $rootScope.userpromoter.length > 0) {
             if ($rootScope.isLoggedIn) {   
                vm.isPromoter = true;
                $rootScope.isPromoter = true;
                if ($rootScope.DEBUG_MODE) console.log("User is promoter");
            }
            else {
                $rootScope.isPromoter = false;
                vm.isPromoter = false;
            }
        });

        $rootScope.$on('userAccountsLoaded', function (e) {
            if ($rootScope.isLoggedIn && $rootScope.useraccnts.length > 0) {
                vm.hasBusiness = true;
                $rootScope.hasBusiness = true;
                if ($rootScope.DEBUG_MODE) console.log("User has business");
            }
            else {
                $rootScope.hasBusiness = false;
                vm.hasBusiness = false;
            }
        });

        activate();

        function activate() {

            if ($rootScope.hasBusiness == undefined) vm.hasBusiness = false;
            else vm.hasBusiness = $rootScope.hasBusiness;

            if ($rootScope.isPromoter == undefined) vm.isPromoter = false;
            else vm.isPromoter = $rootScope.isPromoter;

            if ($rootScope.showWarning) showWarningsIcon();
            configGeolocation();

            vm.coordsRdy = $rootScope.coordsRdy;

            if ($rootScope.DEBUG_MODE) console.log("Navbar Loaded!");
            //console.log("isLoggedIn", !$rootScope.isLoggedIn)
            //console.log("user", $rootScope.user);
            //getCities();
            //detectLocation2();
        }

        function gotomybusiness() {
            //$stateProvider.state('app');
            // http://localhost:3006/#/mybiz
            // $state.go('mybiz');
/* 
            if (vm.isLoggedIn) {
              //double-check that a user account record exists
              var promise = useraccnt.adduseraccnt();
              promise.then(function(newId) {
                $state.go('mybiz');
              });

            } else {
              gotoHome();
            }
*/
            $state.go('mybusiness');            
        }

        function gotomyfavs() {
            //$stateProvider.state('app');
            $state.go('myfavs');
        }

        function goPromoterConsole(){
            $state.go('promoterconsole');
        }

        function gotoAbout() {
            //$stateProvider.state('app');
            $state.go('about');
        }

        function gotoFileUpload() {
            //$stateProvider.state('app');
            $state.go('fileuploadtest');
        }

        function gotoAdmin() {
            //$stateProvider.state('app');
            $state.go('admin');
        }

        function gotoFeedback() {
            $rootScope.fbmode = true;
            $state.go('cwrapper', {}, { reload: true });
        }

        function gotoTour() {
            dialog.tour();
        }

        function gotoHome() {
            $rootScope.fbmode = false;
            $rootScope.searchActive = false;
            $rootScope.hidelogo = false;
            $rootScope.inputVal = '';
            //$state.go('cwrapper', {}, { reload: true });
            if ($state.current.name != 'cwrapper') {
                $state.go('cwrapper',{main: true});
            }
            else $rootScope.$emit('mainView');
        }


        function gotoCustomer() {
            //$stateProvider.state('app');
            $state.go('customer');
        }

        function goToLogin() {

            //Store current state
            $rootScope.stateName = $state.current.name;
            if ($rootScope.stateName == 'rankSummary') $rootScope.stateNum = $rootScope.cCategory.id;
            else if ($rootScope.stateName == 'answerDetail') $rootScope.stateNum = $rootScope.canswer.id;
            else $rootScope.stateNum = undefined;

            $state.go('login');
        }

        function logout() {

            login.logout().then(function () {

                vm.user = '';
                vm.isLoggedIn = false;

                localStorage.clear();

                //$location.path('/');
                $state.go('cwrapper', {}, { location: 'replace' });
            });
        }

        /**
         * Open model for city selection
         */
        function openCitySelection() {
            openModal("#selectCityModal");
        }


        /**
         * This function get cities from API call only if cities is not already loaded
         */
        function getCities() {

            if (!$rootScope.cities) {
                city.getCities().then(function (response) {
                    $rootScope.cities = response;
                    autoDetectCity();
                });
            }

        }

        /**
         * Function to get current location of User based on navigator
         */
        $rootScope.getCurrentPositionOfUser = function () {


            geolocator.locate(geoOptions, function (err, location) {
                if (err) {
                    if ($rootScope.DEBUG_MODE) console.log('Error getting geolocation - ERROR(' + err.code + '): ' + err.message);
                    dialog.getDialog('errorGettingGeolocation');
                }
                else {
                    if ($rootScope.DEBUG_MODE) console.log(location);
                    setUserLatitudeLongitude(location);
                }
            });

            /*
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position){
                    setUserLatitudeLongitude(position);
                }, function(error){
                }, {maximumAge:60000, timeout:10000, enableHighAccuracy:true});
            }else{
                if ($rootScope.DEBUG_MODE) console.log('Geo location not supported.');
                dialog.getDialog('browserDoesntSupportGeolocation');
            }
            */
        };

        /**
         * Function to set latitude and longitude to $rootScope and Cookie
         * @param position
         */
        function setUserLatitudeLongitude(location) {

            if ($rootScope.DEBUG_MODE) console.log("position.coords.latitude - ", location.coords.latitude);
            if ($rootScope.DEBUG_MODE) console.log("position.coords.longitude - ", location.coords.longitude);
            /**
             * Set Latitude and Longitude from navigator to rootScope
             */
            $rootScope.currentUserLatitude = location.coords.latitude;
            $rootScope.currentUserLongitude = location.coords.longitude;

            /**
             * Set Latitude and Longitude to cookie
             */
            $cookies.put('currentUserLatitude', $rootScope.currentUserLatitude);
            $cookies.put('currentUserLongitude', $rootScope.currentUserLongitude);

            $rootScope.coordsRdy = true;
            showCoordsIcon();

            if ($rootScope.loadFbnWhenCoordsRdy) $state.go('rankSummary', { index: 9521 });

            /**
             * If user is logged in, then set latitude and longitude to user's object
             */
            if ($rootScope.isLoggedIn) {
                $rootScope.user.latitude = $rootScope.currentUserLatitude;
                $rootScope.user.longitude = $rootScope.currentUserLongitude;
                if ($rootScope.DEBUG_MODE) console.log("Geo Location is set for logged in user.");
            }

            if ($rootScope.DEBUG_MODE) console.log("Geo Location is set for user.");
            if ($state.current.name == 'rankSummary') {
                $state.reload();
            }
        }

        /**
         * This function detect City using geo location(lat,long)
         * Geo location works only on secure origins in Google Chrome
         */
        function autoDetectCity() {

            if ($rootScope.DEBUG_MODE) console.log("@autoDetectCity");

            geolocator.locate(geoOptions, function (err, location) {
                if (err) {
                    if ($rootScope.DEBUG_MODE) console.log('Error getting geolocation - ERROR(' + err.code + '): ' + err.message);
                    dialog.getDialog('errorGettingGeolocation');
                    }
                else {
                    if ($rootScope.DEBUG_MODE) console.log(location);
                    setUserLatitudeLongitude(location);
                }
            });

            /*
            geolocator.locate(options, setUserLatitudeLongitude(location),function (err) {
             console.log('Error getting geolocation - ERROR(' + err.code + '): ' + err.message);
             dialog.getDialog('errorGettingGeolocation');
            });

            /*
            var geocoder;
            geocoder = new google.maps.Geocoder();

            if (navigator.geolocation) {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(showPosition, function(err){
                        console.log('Error getting geolocation - ERROR(' + err.code + '): ' + err.message);
                        dialog.getDialog('errorGettingGeolocation');
                    });
                } else {
                    selectCity();
                }
            } else {
                selectCity();
            }

            function showPosition(position) {

                if ($rootScope.DEBUG_MODE) console.log("@showPosition - position -", position);

                var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

                setUserLatitudeLongitude(position);

                geocoder.geocode(
                    {'latLng': latlng},
                    function (results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            if (results[0]) {
                                var add = results[0].formatted_address;
                                var value = add.split(",");

                                var count = value.length;
                                var country = value[count - 1];
                                var state = value[count - 2];
                                city = value[count - 3];
                                selectCity(city);
                            }
                            else {
                                selectCity();
                            }
                        }
                        else {
                            selectCity();
                        }
                    }
                );
            }*/

        }

        /**
         * This function match detected to available cities
         * if match is found then it select city, otherwise give options to select city
         * @param detectedCity
         */
        function selectCity(detectedCity) {

            if ($rootScope.selectedCity) {

            } else {
                var isCityInList = false;
                var cityObject = {};

                angular.forEach($rootScope.cities, function (city) {

                    if (city.name == detectedCity.trim() && city.is_active) {
                        isCityInList = true;
                        cityObject = city;
                    }

                });

                if (isCityInList == false) {
                    openModal("#selectCityModal");
                } else {
                    $rootScope.selectedCity = cityObject;
                    window.localStorage.selectedCity = JSON.stringify($rootScope.selectedCity);
                    $rootScope.$digest();
                }
            }
        }

        function configGeolocation() {

            geolocator.config({
                language: "en",
                google: {
                    version: "3",
                    key: GOOGLE_API_KEY
                }
            });

            geoOptions = {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumWait: 10000,     // max wait time for desired accuracy
                maximumAge: 0,          // disable cache
                desiredAccuracy: 30,    // meters
                fallbackToIP: true,     // fallback to IP if Geolocation fails or rejected
            };
        }

        function detectLocation() {
            var url = 'https://ipinfo.io/json';
            return $http.get(url, {}, {
                headers: {}
            }).then(function (result) {
                if ($rootScope.DEBUG_MODE) console.log("Result from ipinfo - ", result);
                var loc = result.data.loc.split(",");
                if ($rootScope.DEBUG_MODE) console.log("loc - ", loc);
                $rootScope.currentUserLatitude = loc[0];
                $rootScope.currentUserLongitude = loc[1];
            });
        }

        function detectLocation2() {
            var geobody = {};

            geobody.homeMobileCountryCode = 310;
            geobody.homeMobileNetworkCode = 38;
            geobody.considerIp = false;

            var url = 'https://www.googleapis.com/geolocation/v1/geolocate?key=' + 'AIzaSyDtDvBsex9Ytz1aWl5uET8MwjlmvEMTF70';
            return $http.post(url, {}, {
                headers: {},
                body: geobody
            }).then(function (result) {
                if ($rootScope.DEBUG_MODE) console.log("Result from google geolocate - ", result);

                //var loc = result.data.loc.split(",");
                //console.log("loc - ", loc);
                $rootScope.currentUserLatitude = result.data.location.lat;
                $rootScope.currentUserLongitude = result.data.location.lng;
            });
        }

        function showWarningsIcon(){
            vm.warning = true;
        }
        function hideWarningsIcon(){
            vm.warning = false;
        }
        function showCoordsIcon(){
            vm.coordsRdy = true;
        }

        function goWarning(){
            /*
            var accntname = '';
            var answerid = 0;
            var idx = 0;
            for (var i=0; i < $rootScope.useraccnts.length; i++){
                if ($rootScope.useraccnts[i].email != '') {
                       answerid = $rootScope.useraccnts[i].answer
                       break;
                }
             }
            idx = $rootScope.answers.map(function(x) {return x.id; }).indexOf(answerid);
            console.log("$rootScope.useraccnts - ", $rootScope.useraccnts);
            console.log("idx - answerid - $rootScope.answers[idx].name -",idx,answerid);*/
           var idx = $rootScope.answers.map(function(x) {return x.id; }).indexOf($rootScope.useraccnts[0].answer);
           dialog.askEmail($rootScope.answers[idx].name);
        }

        function goCoords(){
           dialog.askPermissionToLocate();
        }
    }
})();

(function () {
    'use strict';

    angular
        .module('app')
        .controller('myfavs', myfavs);

    myfavs.$inject = ['$location', '$rootScope', '$state', '$window'];

    function myfavs(location, $rootScope, $state, $window) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'myfavs';

        vm.goBack = goBack;
        vm.answerDetail = answerDetail;
        vm.seeMore = seeMore;

        var cdate = new Date();
        var dayOfWeek = cdate.getDay();
        var isToday = false;
        vm.noAns = false;

        vm.maxRes1 = 5; vm.btext1 = 'See more';
        vm.maxRes2 = 5; vm.btext2 = 'See more';
        vm.maxRes3 = 5; vm.btext3 = 'See more';
        vm.maxRes4 = 5; vm.btext4 = 'See more';
        vm.maxRes5 = 5; vm.btext5 = 'See more';

        vm.cb1gt5 = false;
        vm.cb2gt5 = false;
        vm.cb3gt5 = false;
        vm.cb4gt5 = false;
        vm.cb5gt5 = false;

        activate();

        function activate() {
            
            $rootScope.inFavMode = true;

            formatTables();
            loadData();
            console.log("myfavs page Loaded!");

        }

        function formatTables() {

            for (var i = 0; i < $rootScope.headlines.length; i++) {
                if ($rootScope.headlines[i].type == 'food') {
                    vm.bgc1 = $rootScope.headlines[i].bc;
                    vm.fc1 = $rootScope.headlines[i].fc;
                    vm.headline1 = 'My ' + $rootScope.headlines[i].title;
                    break;
                }
            }

            for (var i = 0; i < $rootScope.headlines.length; i++) {
                if ($rootScope.headlines[i].type == 'lifestyle') {
                    vm.bgc2 = $rootScope.headlines[i].bc;
                    vm.fc2 = $rootScope.headlines[i].fc;
                    vm.headline2 = 'My ' + $rootScope.headlines[i].title; 
                    break;
                }
            }

            for (var i = 0; i < $rootScope.headlines.length; i++) {
                if ($rootScope.headlines[i].type == 'services') {
                    vm.bgc3 = $rootScope.headlines[i].bc;
                    vm.fc3 = $rootScope.headlines[i].fc;
                    vm.headline3 = 'My ' + $rootScope.headlines[i].title;
                    break;
                }
            }

            for (var i = 0; i < $rootScope.headlines.length; i++) {
                if ($rootScope.headlines[i].type == 'health') {
                    vm.bgc4 = $rootScope.headlines[i].bc;
                    vm.fc4 = $rootScope.headlines[i].fc;
                    vm.headline4 = 'My ' + $rootScope.headlines[i].title;
                    break;
                }
            }

            for (var i = 0; i < $rootScope.headlines.length; i++) {
                if ($rootScope.headlines[i].type == 'beauty') {
                    vm.bgc5 = $rootScope.headlines[i].bc;
                    vm.fc5 = $rootScope.headlines[i].fc;
                    vm.headline5 = 'My ' + $rootScope.headlines[i].title;
                    break;
                }
            }
        }

        function loadData() {
            var answer = {};
            var category = {};

            vm.myfoodans = [];
            vm.mylifestyleans = [];
            vm.myservicesans = [];
            vm.myhealthans = [];
            vm.mybeautyans = [];

            var tmap = [];


            for (var i = 0; i < $rootScope.cvotes.length; i++) {
                if ($rootScope.cvotes[i].vote == 1) {
                    var idx = $rootScope.answers.map(function (x) { return x.id; }).indexOf($rootScope.cvotes[i].answer);
                    answer = $rootScope.answers[idx];
                    //console.log("answer - ", answer.name);
                    if (answer.type == 'Establishment') {
                        
                        //look this answer in catans recs
                        for (var n = 0; n < $rootScope.catansrecs.length; n++) {

                            if ($rootScope.catansrecs[n].answer == answer.id) {

                                var idx2 = $rootScope.content.map(function (x) { return x.id; }).indexOf($rootScope.catansrecs[n].category);
                                category = $rootScope.content[idx2];

                                if (category.title.indexOf('food') > -1 || category.tags.indexOf('food') > -1) {
                                    tmap = vm.myfoodans.map(function (x) { return x.id; });
                                    if (tmap.indexOf(answer.id) < 0) {
                                        getSpecials(answer);
                                        vm.myfoodans.push(answer);
                                    }
                                }

                                if (category.title.indexOf('lifestyle') > -1 || category.tags.indexOf('lifestyle') > -1) {
                                    tmap = vm.mylifestyleans.map(function (x) { return x.id; });
                                    if (tmap.indexOf(answer.id) < 0) {
                                        getSpecials(answer);
                                        vm.mylifestyleans.push(answer);
                                    }
                                }

                                if (category.title.indexOf('services') > -1 || category.tags.indexOf('services') > -1) {
                                    tmap = vm.myservicesans.map(function (x) { return x.id; });
                                    if (tmap.indexOf(answer.id) < 0) {
                                        getSpecials(answer);
                                        vm.myservicesans.push(answer);
                                    }
                                }

                                if (category.title.indexOf('health') > -1 || category.tags.indexOf('health') > -1) {
                                    tmap = vm.myhealthans.map(function (x) { return x.id; });
                                    if (tmap.indexOf(answer.id) < 0) {
                                        getSpecials(answer);
                                        vm.myhealthans.push(answer);
                                    }
                                }

                                if (category.title.indexOf('beauty') > -1 || category.tags.indexOf('beauty') > -1) {
                                    tmap = vm.mybeautyans.map(function (x) { return x.id; });
                                    if (tmap.indexOf(answer.id) < 0) {
                                        getSpecials(answer);
                                        vm.mybeautyans.push(answer);
                                    }
                                }
                            }
                        }

                    }
                }
            }
            
            if (vm.myfoodans.length > 5) vm.cb1gt5 = true;
            if (vm.mylifestyleans.length > 5) vm.cb2gt5 = true;
            if (vm.myservicesans.length > 5) vm.cb3gt5 = true;
            if (vm.myhealthans.length > 5) vm.cb4gt5 = true;
            if (vm.mybeautyans.length > 5) vm.cb5gt5 = true;

            if (vm.myfoodans.length > 0) vm.answerExist1 = true;
            else vm.answerExist1 = false;

            if (vm.mylifestyleans.length > 0) vm.answerExist2 = true;
            else vm.answerExist2 = false;

            if (vm.myservicesans.length > 0) vm.answerExist3 = true;
            else vm.answerExist3 = false;

            if (vm.myhealthans.length > 0) vm.answerExist4 = true;
            else vm.answerExist4 = false;

            if (vm.mybeautyans.length > 0) vm.answerExist5 = true;
            else vm.answerExist5 = false;
            
            if (vm.myfoodans.length == 0 && vm.myservicesans.length == 0 && vm.mylifestyleans.length == 0 &&
            vm.myhealthans.length == 0 && vm.mybeautyans.length == 0){
                vm.noAns = true;
            }

        }

        function getSpecials(answer) {
            for (var i = 0; i < $rootScope.specials.length; i++) {
                if (answer.id == $rootScope.specials[i].answer) {
                    if ($rootScope.specials[i].freq == 'weekly') {
                        if (dayOfWeek == 0 && $rootScope.specials[i].sun) isToday = true;
                        if (dayOfWeek == 1 && $rootScope.specials[i].mon) isToday = true;
                        if (dayOfWeek == 2 && $rootScope.specials[i].tue) isToday = true;
                        if (dayOfWeek == 3 && $rootScope.specials[i].wed) isToday = true;
                        if (dayOfWeek == 4 && $rootScope.specials[i].thu) isToday = true;
                        if (dayOfWeek == 5 && $rootScope.specials[i].fri) isToday = true;
                        if (dayOfWeek == 6 && $rootScope.specials[i].sat) isToday = true;
                        if (isToday) {
                            answer.sp_bc = $rootScope.specials[i].bc;
                            answer.sp_fc = $rootScope.specials[i].fc;
                            answer.sp_title = $rootScope.specials[i].stitle;
                            break;
                        }
                    }
                }
            }
        }

        function answerDetail(cb,x) {
            
            $rootScope.myfavs = {};
            
            switch (cb){
                case 1: { $rootScope.canswers = vm.myfoodans; 
                          $rootScope.myfavs.title = 'My Food';  break; }
                case 2: { $rootScope.canswers = vm.mylifestyleans; 
                          $rootScope.myfavs.title = 'My Lifestyle';  break; }
                case 3: { $rootScope.canswers = vm.myservicesans;
                          $rootScope.myfavs.title = 'My Services';  break; }  
                case 4: { $rootScope.canswers = vm.myhealthans; 
                          $rootScope.myfavs.title = 'My Health';  break; }
                case 5: { $rootScope.canswers = vm.mybeautyans; 
                          $rootScope.myfavs.title = 'My Beauty';  break; }
            }
            $state.go("answerDetail", { index: x.id });
        }

        function seeMore(x) {
            if (x == 1) {
                if (vm.maxRes1 == 5) { vm.btext1 = 'See less'; vm.maxRes1 = 100; }
                else { vm.btext1 = 'See more'; vm.maxRes1 = 5; }
            }
            if (x == 2) {
                if (vm.maxRes2 == 5) { vm.btext2 = 'See less'; vm.maxRes2 = 100; }
                else { vm.btext2 = 'See more'; vm.maxRes2 = 5; }
            }
            if (x == 3) {
                if (vm.maxRes3 == 5) { vm.btext3 = 'See less'; vm.maxRes3 = 100; }
                else { vm.btext3 = 'See more'; vm.maxRes3 = 5; }
            }
            if (x == 4) {
                if (vm.maxRes4 == 5) { vm.btext4 = 'See less'; vm.maxRes4 = 100; }
                else { vm.btext4 = 'See more'; vm.maxRes4 = 5; }
            }
            if (x == 5) {
                if (vm.maxRes5 == 5) { vm.btext5 = 'See less'; vm.maxRes5 = 100; }
                else { vm.btext5 = 'See more'; vm.maxRes5 = 5; }
            }
        }

        function goBack() {
            
            if ($rootScope.previousState == 'rankSummary')  $state.go('rankSummary', { index: $rootScope.cCategory.id });
            else $state.go('cwrapper');
        }

    }
})();

(function () {
    'use strict';

    angular
        .module('app')
        .controller('mybusiness', mybusiness);

    mybusiness.$inject = ['$location', '$rootScope', '$state', '$window','useraccnt','dialog','answer','$http','promoter'];

    function mybusiness(location, $rootScope, $state, $window, useraccnt, dialog, answer, $http, promoter) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'mybusiness';

        vm.overview = true;
        vm.manageview = false;
        vm.codeOk = false;
        vm.getRanks = false;
        vm.getPremium = false;
        vm.dataReady = false;

        //Methods
        vm.gotoanswer = gotoanswer;
        vm.gotomanage = gotomanage;
        vm.goCheckout = goCheckout;
        vm.unbind = unbind;
        vm.goBack = goBack;
        vm.ranksQty = 1;
        vm.plusQty = plusQty;
        vm.minusQty = minusQty;
        vm.checkcode = checkcode;
        vm.cancelPremium = cancelPremium;
        vm.cancelAllRanks = cancelAllRanks;
        vm.editRanks = editRanks;
        vm.cancelAll = cancelAll;
        vm.editContact = editContact;
        
        vm.mybizs = [];
        activate();
        vm.noAns = false;

        var cancelAll = false;
        var cancelPremium = false;
        var cancelRanks = false;
        var cancelNumRanks = 0;
        var fields = [];
        var labels = [];
        var vals = [];

        function activate() {

            useraccnt.getuseraccnt().then(function(result){
                $rootScope.useraccnts = result;
                vm.dataReady = true;
                loadData();
            });

            //loadData();
            console.log("mybusiness page Loaded!");

        }

        function loadData(){
            vm.mybizs = [];
            var accntExists = false;
            var bizObj = {};
            for (var i=0; i<$rootScope.answers.length; i++){
                if ($rootScope.answers[i].owner == $rootScope.user.id){
                    accntExists = false;
                    bizObj = {};
                    bizObj = $rootScope.answers[i];

                    //Check that record exists also in user accounts, if not, it will get created
                    for (var j=0; j<$rootScope.useraccnts.length; j++){
                        if ($rootScope.useraccnts[j].answer == $rootScope.answers[i].id) { 
                            accntExists = true;
                            bizObj.status = $rootScope.useraccnts[j].status;
                            bizObj.bizcat = $rootScope.useraccnts[j].bizcat;
                            bizObj.email = $rootScope.useraccnts[j].email;
                            bizObj.accountid = $rootScope.useraccnts[j].id;
                            bizObj.stripeid = $rootScope.useraccnts[j].stripeid;
                            bizObj.lastPaymentMade = $rootScope.useraccnts[j].lastPaymentMade;
                            bizObj.nextPaymentDue = $rootScope.useraccnts[j].nextPaymentDue;
                            bizObj.monthlyCost = $rootScope.useraccnts[j].monthlyCost;
                            bizObj.isPremium = $rootScope.useraccnts[j].ispremium;
                            bizObj.hasRanks = $rootScope.useraccnts[j].hasranks;
                            bizObj.ranksQty = $rootScope.useraccnts[j].ranksqty;
                            bizObj.stripesub = $rootScope.useraccnts[j].stripesub;
                            bizObj.stripesipremium = $rootScope.useraccnts[j].stripesipremium;
                            bizObj.stripesiranks = $rootScope.useraccnts[j].stripesiranks;
                            bizObj.user = $rootScope.useraccnts[j].user;
                            bizObj.firstname = $rootScope.user.first_name;
                            bizObj.lastname = $rootScope.user.last_name;
                                
                                if (bizObj.isPremium) {
                                    bizObj.status = 'Premium'; bizObj.style = 'background-color:#009900';
                                }
                                else {bizObj.status = 'Basic'; bizObj.style = 'background-color:#bfbfbf';}

                                if (bizObj.hasRanks) {
                                    bizObj.status2 = bizObj.ranksQty + ' Custom Ranks';
                                     bizObj.style2 = 'background-color:#009900';
                                }
                                else {bizObj.status2 = 'No Custom Ranks'; bizObj.style2 = 'background-color:#bfbfbf';}

                            //get monthly price
                            for (var k=0; k<$rootScope.codeprices.length; k++){
                                //console.log($rootScope.codeprices[k].code, bizObj.bizcat);
                                if ($rootScope.codeprices[k].code == bizObj.bizcat){
                                    bizObj.price = $rootScope.codeprices[k].price;
                                    break;
                                }
                            }
                            break;
                        }                        
                    }
                    if (!accntExists) useraccnt.adduseraccnt($rootScope.answers[i]);
                    vm.mybizs.push(bizObj);               
                }
            }
  
            //console.log("vm.mybizs", vm.mybizs);
            if (vm.mybizs.length == 0) vm.noAns = true;           
        }

        function gotoanswer(x){
            $state.go('answerDetail', {index: x.id});
        }

        function gotomanage(x){
            vm.codeMsg = 'Enter a code and validate it using the \'Check code\' button';
            vm.promocode = '';
            //$state.go('mybiz');
            vm.business = x;
            vm.getRanks = false;
            vm.getPremium = false;
            vm.ranksQty = 1;
            vm.overview = false;
            vm.manageview = true;
            if (!x.isPremium || !x.hasRanks) vm.sell = true;
            else vm.sell = false;

            console.log("vm.business",x);
            
        }

        function goBack() {
            if (vm.manageview == true) {
                vm.overview = true;
                vm.manageview = false;
                vm.checkout = false;
                return;
            }
            if (vm.checkout == true) {
                vm.manageview = true;
                vm.checkout = false;
                vm.overview = false;
                return;
            }

            if ($rootScope.previousState == 'rankSummary')
                    $state.go('rankSummary', {index: $rootScope.cCategory.id});
            else if ($rootScope.previousState == 'answerDetail')
                    $state.go('answerDetail', {index: $rootScope.canswer.id});
            else if ($rootScope.previousState == 'addAnswer')
                    $state.go('addAnswer', {index: $rootScope.canswer.id});
            else if ($rootScope.previousState == 'editAnswer')
                    $state.go('editAnswer', {index: $rootScope.canswer.id});                
            else if ($rootScope.previousState == 'about')
                    $state.go('about');
            else $state.go('cwrapper');                
        }

        function unbind(id){
            dialog.unbindAccount(vm.business, exec_unbind);
        }

        function exec_unbind(){
            answer.updateAnswer(vm.business.id,['owner'],[0]);
            vm.mybizs = [];
            loadData();
            vm.overview = true;
        }

        function plusQty(){
            vm.ranksQty = vm.ranksQty + 1;
        }

        function minusQty(){
            vm.ranksQty = vm.ranksQty - 1;
            if (vm.ranksQty < 1) vm.ranksQty = 1;
        }

        function checkcode(){
            if (vm.promocode.length == 8){
                //TODO check code is valid
                vm.codeMsg = "Validating code ..."

                promoter.getbyCode(vm.promocode).then(function(result){
                    console.log("code exists - ", result.length, result);
                    if (result.length > 0){
                          vm.codeOk = true;
                          vm.codeMsg = 'This code gets you 60 days free on all your subscriptions!';  
                    }
                    else {
                        vm.codeOk = false;
                        vm.codeMsg = 'Sorry, this is not a valid code.';
                    }    
                });           
            }
            else {
                vm.codeOk = false;
                vm.codeMsg = 'Sorry, this is not a valid code.';
            }
        }

        function goCheckout(){
            vm.acceptTOS = false;
            if (vm.contactInfoOk == false) {
                dialog.getDialog('contactInfoIncomplete');
            }
            else if (vm.getRanks == false && vm.getPremium == false ) {
                dialog.getDialog('nothingSelectedForPurchase');
            }
            else {
                vm.total = vm.getRanks*vm.ranksQty*35 + vm.getPremium*vm.business.price;
                vm.manageview = false;
                vm.checkout = true;
                loopCheck('purchase');
                
            }
        }

        function cancelPremium(){
            //Check if there are other subscriptions other than Premium, if not delete entire subscription otherwise StripeServer
            //gives error
            if (vm.business.hasRanks){
                cancelAll = false;
                cancelPremium = true;
                cancelRanks = false;
                cancelNumRanks = 0;
                dialog.confirmCancel(vm.business, 'Premium',execCancel);
            }
            else{
                cancelAll = true;
                cancelPremium = false;
                cancelRanks = false;
                cancelNumRanks = 0;
                dialog.confirmCancel(vm.business, 'Premium',execCancel);
            }
        }

        function execCancel(){
            var url = 'https://server.rank-x.com/StripeServer/cancel';
            var req = {
                method: 'POST',
                url: url,
                headers: {
                    'X-Dreamfactory-API-Key': undefined,
                    'X-DreamFactory-Session-Token': undefined
                },
                data: {
                    'cancelAll': cancelAll,
                    'cancelPremium': cancelPremium,
                    'cancelRanks': cancelRanks,
                    'cancelNumRanks': cancelNumRanks,
                    'stripeId': vm.business.stripeid,
                    'useraccntId': vm.business.accountid,
                    'stripesub' : vm.business.stripesub,
                    'stripesipremium' : vm.business.stripesipremium,
                    'stripesiranks' : vm.business.stripesiranks,
                    
                }
            }

            $http(req).then(function (result) {
                console.log("Cancelling Premium Membership Success", result);
            }, function (error) {
                console.log("Error Cancelling Premium Membership - ", error);
            });
            loopCheck('cancel');        
        }
        function cancelAllRanks(){
            //Check if there are other subscriptions other than Premium, if not delete entire subscription otherwise StripeServer
            //gives error
            if (vm.business.isPremium){
                cancelAll = false;
                cancelPremium = false;
                cancelRanks = true;
                cancelNumRanks = 0;
                dialog.confirmCancel(vm.business, 'Ranks',execCancel);
            }
            else{
                cancelAll = true;
                cancelPremium = false;
                cancelRanks = false;
                cancelNumRanks = 0;
                dialog.confirmCancel(vm.business, 'Ranks',execCancel);
            }
        }
        
        function cancelAll(){
            cancelAll = true;
            cancelPremium = false;
            cancelRanks = false;
            cancelNumRanks = 0;
            dialog.confirmCancel(vm.business,'All',execCancel);
        }
        function editRanks(){
            dialog.editNumRanks(vm.business, execEditNumRanks);
        }
        function execEditNumRanks(action, N){
            //if deleting all ranks, call delete ranks subscription
            if (action == 'cancel' && N == vm.business.ranksQty){
                cancelAllRanks();
            }
            else {

                var updatedNumRanks = 0;
                if (action == 'purchase') updatedNumRanks = vm.business.ranksQty + N;
                if (action == 'cancel') updatedNumRanks = vm.business.ranksQty - N;
                var url = 'https://server.rank-x.com/StripeServer/edit';
                var req = {
                    method: 'POST',
                    url: url,
                    headers: {
                        'X-Dreamfactory-API-Key': undefined,
                        'X-DreamFactory-Session-Token': undefined
                    },
                    data: {
                        'action': action,
                        'numRanks': updatedNumRanks,
                        'stripeId': vm.business.stripeid,
                        'useraccntId': vm.business.accountid,
                        'stripesub': vm.business.stripesub,
                        'stripesiranks': vm.business.stripesiranks,
                    }
                }

                $http(req).then(function (result) {
                    console.log("Updating Quantity of Custom Ranks Success", result);
                }, function (error) {
                    console.log("Error Updating Quantity of Custom Ranks - ", error);
                });
                loopCheck('edit', updatedNumRanks);
            }
            console.log("Execute Edit Num Ranks");

        }

      // -------- **UPGRADE**  STRIPE LOOP CHECKERS
        function loopCheck(check, updatedNumRanks) {
            setTimeout(function () {
                //  call a 3s setTimeout when the loop is called
                //  your code here
                console.log('loopCheck -- ', check);


                useraccnt.getuseraccntans(vm.business.id).then(successGetuseraccnt, failGetuseraccnt);
                function failGetuseraccnt(err) {
                    console.log(JSON.stringify(err));
                    return err;
                }
                function successGetuseraccnt(result) {
                    // result[0] =
                    // {"user":37,"answer":0,"bizcat":"REB","email":"sjurowski+facebook@ucsd.edu","status":"1001:Rank-X Premium Business Plan:sub_9qe3oH617BKGWD","stripeid":"cus_9qe3Kburx73l2L","id":176}

                    var checkAgain = true;
                    console.log("i'm in, will check every 3 seconds for signup success");
                    console.log("full result:");
                    console.log(result);

                    var missionAccomplished = false;
                    try {

                        if (check == 'purchase') {

                            if ((vm.getPremium && result[0].ispremium && !vm.getRanks) ||      //if purchase only Premium
                                (!vm.getPremium && vm.getRanks && result[0].hasranks && vm.ranksQty == result[0].ranksqty) || //if purchase only ranks
                                (vm.getPremium && result[0].ispremium && vm.getRanks && result[0].hasranks && vm.ranksQty == result[0].ranksqty)) {

                                missionAccomplished = true;

                            }
                        }

                        if (check == 'cancel') {
                            if ((cancelPremium && !result[0].ispremium && result[0].stripesipremium == '') ||      //if Premium was cancellesd
                                (cancelRanks && !result[0].hasranks && result[0].stripesiranks == '') || //if Ranks were cancelled
                                (cancelAll && result[0].stripesub == '')) {
                                missionAccomplished = true;
                            }
                        }

                        if (check == 'edit') {
                            if (result[0].ranksqty == updatedNumRanks) missionAccomplished = true;
                        }

                        if (missionAccomplished) {
                            //update local copy
                            var idx = $rootScope.useraccnts.map(function (x) { return x.id; }).indexOf(result[0].id);
                            $rootScope.useraccnts[idx] = result[0];
                            loadData();
                            console.log(vm.mybiz);
                            vm.overview = true;
                            vm.manageview = false;
                            vm.checkout = false;
                            return true;

                        } else {
                            console.log("havent accomplished mission yet");
                            // return false;  <-- this will stop the looping
                        }
                    }
                    catch (err) {
                        console.log("error while looking up subscription info from DF: " + JSON.stringify(err));

                        checkAgain = false;

                        return err;
                    }

                    if (checkAgain == true && (vm.checkout || vm.manage)) {
                        //recursion ... find another way if possible
                        loopCheck(check);
                    } else {
                        return;
                    }
                    //  ..  setTimeout()
                }
            }, 3000);
        }

        function editContact(){
            fields = ['name','email'];
            labels = ['Name','Email'];
            vals = [vm.business.firstname + ' ' + vm.business.lastname, vm.business.email];
            dialog.editInfo(fields,labels,vals,execEditContact);
        }

        function execEditContact(newvals){
            useraccnt.updateuseraccnt(vm.business.accountid, fields, newvals).then(function(){
                loadData();
            })
        }        

    }
})();

(function () {
    'use strict';

    angular
        .module('app')
        .controller('mybiz', mybiz);


    mybiz.$inject = ['$location', '$state','$window', 'useraccnt', '$http'];

    function mybiz(location, $state, $window, useraccnt, $http) {

      /* jshint validthis:true */
      // Members
        var vm = this;
        vm.title = 'mybiz';

        // keep null until we load the stripe plan from useraccnt record
        vm.useraccntStatus = null;

        // show until we know what to show them
        vm.showSpinner = true;

        // hide until we know what to show them
        vm.showCurrentPlan = false;
        vm.showUpgrade = false;
        vm.showGoodbye = false;
        vm.showCancelOption = false;

        vm.showPricePerMonth = false;
        vm.showNextPaymentDue = false;
        vm.showLastPaymentMade = false;

        vm.monthlyCost = '0';
        vm.nextPaymentDue = '3000-01-01';
        vm.lastPaymentMade = '1900-01-01';

        // default plan for upgrade form
        vm.stripePlan = '1001';

        vm.user = JSON.parse(localStorage.getItem("user"));
        vm.dfUseraccntId = vm.user.dfUseraccntId;

        //stripe customer id, stored in DF as such
        vm.stripeid = vm.user.stripeid;

        vm.stripeSubscriptionId = '0';

        //  set loop check counter to 1
        var i = 1;
      // END Members
      // -----------------------------------------------------



      // -----------------------------------------------------
      // ------------------    START VIEW VARIABLES ----------
        vm.goBack = goBack;
        vm.refreshAccountInfo = refreshAccountInfo;

        vm.wasUpgradeSuccess = wasUpgradeSuccess;
        vm.wasDowngradeSuccess = wasDowngradeSuccess;

        vm.stripeServerLocal = false;
        //if (window.location.hostname == "localhost") {
          //vm.stripeServerLocal = true;
        //}

        // ------------------    END VIEW VARIABLES ------------
        // -----------------------------------------------------


        // -----------------------------------------------------
        // ------------------    SART RUNTIME        -----------

        // $http({
        //   method: 'GET',
        //   url: '/someUrl'
        // }).then(function successCallback(response) {
        //     // this callback will be called asynchronously
        //     // when the response is available
        //   }, function errorCallback(response) {
        //     // called asynchronously if an error occurs
        //     // or server returns response with an error status.
        //   });
        //

        console.log("--------------------------------------------------------");
        console.log("-----LOOK UP INVOICES AND SAVE THEM---------------------");
        if (vm.user.stripeid && vm.user.dfUseraccntId) {
          //pull the lastPaymentMade and nextPaymentDue from Stripe and save in db
          saveStripeInvoices(vm.user.stripeid, vm.user.dfUseraccntId);
        }
        console.log("-----END LOOK UP INVOICES AND SAVE THEM-----------------");
        console.log("--------------------------------------------------------");

        // call it once now, and re-call it from the UI as needed
        refreshAccountInfo();



        // ------------------    END RUNTIME        ------------
        // -----------------------------------------------------


        // -----------------------------------------------------
        // ------------------    START METHODS -----------------

        function saveStripeInvoices(stripeId, dfUseraccntId) {

          // var _stripeCustomerId = 'cus_A36js8CJzphovQ';
          // var _stripeCustomerId = 'cus_A36js8CJzphovQ';
          // http://localhost:3000/dreamfactory-stripe-user/cus_A36js8CJzphovQ/24
          var url = '';


          //<!-- // flip the server name if localhost -->
          if (vm.stripeServerLocal) {
            // url = 'http://localhost:3000/dreamfactory-stripe-user/' + _stripeCustomerId + '/' + vm.dfUseraccntId;
            url = 'http://localhost:3000/dreamfactory-stripe-user/' + stripeId + '/' + dfUseraccntId;

          } else {
            // url = 'https://rank-x.com:3000/dreamfactory-stripe-user/' + _stripeCustomerId + '/' + vm.dfUseraccntId;
            url = 'https://server.rank-x.com/StripeServer/' + dfUseraccntId + '/' + dfUseraccntId;

          }


          var req = {
           method: 'GET',
           url: url,
           headers: {
             'X-Dreamfactory-API-Key': undefined,
             'X-DreamFactory-Session-Token': undefined
           }
          }

          $http(req).then(stripeServerSaveInvoicesSucceeded, _queryFailed);

            function stripeServerSaveInvoicesSucceeded(result) {
                return result.data.resource;
            }

        }

      function refreshAccountInfo() {
        useraccnt.getuseraccnt(true).then(successGetuseraccnt, failGetuseraccnt);

        function successGetuseraccnt(result) {

          console.log("mybiz.ctrl.js:refreshAccountInfo():successGetuseraccnt:result[0]: " + JSON.stringify(result[0]));
          // PRODUCES:
          // refreshAccountInfo():successGetuseraccnt:result[0]: {"user":37,"answer":0,"bizcat":"REB","email":"sjurowski+facebook@ucsd.edu","status":"1001:Rank-X Premium Business Plan - Tier 1:sub_A36jXImdkPeOjy","stripeid":"cus_A36js8CJzphovQ","id":245,"COUPON":"NONE","monthlyCost":50,"lastPaymentMade":"2017-02-02","nextPaymentDue":"2017-03-04"}

          var hasSubscription = false;
          try {
            if (result[0].status.split(":")[0] && result[0].status.split(":")[0] == '1001') {

              hasSubscription = true;
              localStorage.setItem('hasSubscription', true);

              vm.useraccntStatus = result[0].status.split(":")[1];
              vm.stripeSubscriptionId = result[0].status.split(":")[2];

              vm.monthlyCost = result[0].monthlyCost;
              vm.nextPaymentDue = makeDatePretty(result[0].nextPaymentDue);
              vm.lastPaymentMade = makeDatePretty(result[0].lastPaymentMade);

              //since the person had a subscription when this
              //page was first loaded,
              //give them the cancel option
              //(if you give it to them immediately after they sign up.
              // it give header rewrite errors on the local stripe server)
              vm.showCancelOption = true;

            }
          }
          catch(err) {
              console.log("error while looking up subscription info from DF: " + JSON.stringify(err));
          }

          if (hasSubscription) {

            console.log("SHOW CURRENT PLAN");
            vm.showSpinner = false;

            vm.showUpgrade = false;

            vm.showCurrentPlan = true;


            vm.showPricePerMonth = true;
            vm.showNextPaymentDue = true;
            vm.showLastPaymentMade = true;


            console.log("start the downgrade success check loop");
            loopCheckDowngradeSuccess();

          } else {

            console.log("SHOW UPGRADE PANEL");

            localStorage.setItem('hasSubscription', false);

            vm.useraccntStatus = "You should upgrade. ";

            vm.showSpinner = false;

            vm.showUpgrade = true;
            vm.showCurrentPlan = false;

            console.log("start the upgrade success check loop");
            loopCheckUpgradeSuccess();

          }

        }
        function failGetuseraccnt(err) {
            console.log(JSON.stringify(err));
            return err;
        }
      }

      // ------------------------------------------------------------
      // ------------------------------------------------------------
      // -------- **UPGRADE**  STRIPE LOOP CHECKERS
      function loopCheckUpgradeSuccess() {
         setTimeout(function () {
           //  call a 3s setTimeout when the loop is called
            //  your code here
            console.log('loopCheckUpgradeSuccess --> wasUpgradeSuccess');


            useraccnt.getuseraccnt(true).then(successGetuseraccnt, failGetuseraccnt);
            function successGetuseraccnt(result) {
              // result[0] =
              // {"user":37,"answer":0,"bizcat":"REB","email":"sjurowski+facebook@ucsd.edu","status":"1001:Rank-X Premium Business Plan:sub_9qe3oH617BKGWD","stripeid":"cus_9qe3Kburx73l2L","id":176}

              var checkAgain = true;
              console.log("i'm in, will check every 3 seconds for signup success");
              console.log("full result:");
              console.log(result);

              var hasSubscription = false;
              try {
                if (result[0].status.split(":")[0] && result[0].status.split(":")[0] == '1001') {
                  console.log("i'm in2");


                  hasSubscription = true;
                  localStorage.setItem('hasSubscription', true);

                  vm.useraccntStatus = result[0].status.split(":")[1];

                  // reload goBack()
                  // (this should fix an issue if someone tries to
                  // cancel immediately, the local stripe server
                  // might otherwise complain of modifying headers twice)
                  // goBack();

                  vm.showUpgrade = false;
                  vm.showCurrentPlan = true;

                  return true;

                } else {
                  console.log("no subscription created yet");
                  // return false;  <-- this will stop the looping
                }
              }
              catch(err) {
                  console.log("error while looking up subscription info from DF: " + JSON.stringify(err));

                  checkAgain = false;

                  return err;
              }

            // if (loopCheckUpgradeSuccess() == true) {
            //
            //   this.vm.showSpinner = false;
            //   this.vm.showCurrentPlan = true;
            //   this.vm.showUpgrade = false;
            //
            //   return;
            // }


            i++;
            // if ( (i < 30) && (checkAgain == true) ) {
            if ( (1 < 2) && (checkAgain == true) ) {
              //recursion ... find another way if possible
              loopCheckUpgradeSuccess();
            } else {
              return;
            }
            //  ..  setTimeout()
          }
         }, 3000);
      }

      function makeDatePretty(d) {
        // console.log("-----------   welcome to makeDatePretty(d) -----------");
        // console.log("d:", d);

        // 2017-02-15
        // 0123456789

        var yr1   = parseInt(d.substring(0,4));
        var mon1  = parseInt(d.substring(5,7));
        var dt1   = parseInt(d.substring(8,10));

        // console.log("YYYY-MM-DD:" + yr1 + mon1-1 + dt1);

        var date = new Date(yr1, mon1, dt1);

        var monthNames = [
          "January", "February", "March",
          "April", "May", "June", "July",
          "August", "September", "October",
          "November", "December"
        ];

        var day = date.getDate();
        var monthIndex = date.getMonth();
        var year = date.getFullYear();

        // console.log("day: " + day);
        // console.log("monthIndex: " + monthIndex);
        // console.log("year: " + year);
        //
        // console.log(day, monthNames[monthIndex], year);
        var dateString = (monthNames[monthIndex] + ' ' + day + ', ' + year);
        return dateString;
      }
      // end makeDatePretty()

      function wasUpgradeSuccess() {

        useraccnt.getuseraccnt(true).then(successGetuseraccnt, failGetuseraccnt);
        function successGetuseraccnt(result) {
          // result[0] =
          // {"user":37,"answer":0,"bizcat":"REB","email":"sjurowski+facebook@ucsd.edu","status":"1001:Rank-X Premium Business Plan:sub_9qe3oH617BKGWD","stripeid":"cus_9qe3Kburx73l2L","id":176}

          var hasSubscription = false;
          try {
            if (result[0].status.split(":")[0] && result[0].status.split(":")[0] == '1001') {
              hasSubscription = true;
              vm.useraccntStatus = result[0].status.split(":")[1];

              // --- this may hang your loop checker b/c never returns
              saveStripeInvoices();

              // reload goBack()
              // (this should fix an issue if someone tries to
              // cancel immediately, the local stripe server
              // might otherwise complain of modifying headers twice)
              // goBack();

              //reload the page now ... otherwise eventually
              //the page will time out with a call to '/charge' and
              //an error saying that you can't use a token more than once
              // window.location.href= '/#/mybiz';
              $state.go('cwrapper');

              return true;

            } else {
              return false;
            }
          }
          catch(err) {
              console.log("error while looking up subscription info from DF: " + JSON.stringify(err));
              return err;
          }
          return false;
        }
      }
      // -------- end **UPGRADE**  STRIPE LOOP CHECKERS
      // ------------------------------------------------------------
      // ------------------------------------------------------------



      // ------------------------------------------------------------
      // ------------------------------------------------------------
      // -------- **DOWNGRADE**  STRIPE LOOP CHECKERS
      function loopCheckDowngradeSuccess() {
         setTimeout(function () {
           //  call a 3s setTimeout when the loop is called
            //  your code here
            console.log('loopCheckDowngradeSuccess --> wasDowngradeSuccess');


            useraccnt.getuseraccnt(true).then(successGetuseraccnt, failGetuseraccnt);
            function successGetuseraccnt(result) {
              // result[0] =
              // {"user":37,"answer":0,"bizcat":"REB","email":"sjurowski+facebook@ucsd.edu","status":"1001:Rank-X Premium Business Plan:sub_9qe3oH617BKGWD","stripeid":"cus_9qe3Kburx73l2L","id":176}

              var checkAgain = true;
              console.log("i'm in, will check every 3 seconds for downgrade success");
              console.log("full result:");
              console.log(result);

              var hasSubscription = true;
              try {
                if (result[0].status == 0) {
                  console.log("i'm in2");

                  hasSubscription = false;
                  vm.useraccntStatus = result[0].status;

                  // reload goBack()
                  // (this should fix an issue if someone tries to
                  // cancel immediately, the local stripe server
                  // might otherwise complain of modifying headers twice)
                  // goBack();

                  vm.showGoodbye = true;
                  vm.showCurrentPlan = false;
                  // vm.showUpgrade = true;

                  // setTimeout(function(){
                  //     //redirect to the homepage after a while
                  //     $state.go('cwrapper');
                  // }, 2000);


                  return true;
                } else {
                  console.log("no subscription cancellation yet");
                  // return false;  <-- this will stop the looping
                }
              }
              catch(err) {
                  console.log("error while looking up subscription info from DF: " + JSON.stringify(err));

                  checkAgain = false;

                  return err;
              }


            i++;
            // if ( (i < 30) && (checkAgain == true) ) {
            if ( (1 < 2) && (checkAgain == true) ) {
              //recursion ... find another way if possible
              loopCheckDowngradeSuccess();
            } else {
              return;
            }
            //  ..  setTimeout()
          }
         }, 3000);
      }


      function wasDowngradeSuccess() {

        useraccnt.getuseraccnt(true).then(successGetuseraccnt, failGetuseraccnt);
        function successGetuseraccnt(result) {
          // result[0] =
          // {"user":37,"answer":0,"bizcat":"REB","email":"sjurowski+facebook@ucsd.edu","status":"1001:Rank-X Premium Business Plan:sub_9qe3oH617BKGWD","stripeid":"cus_9qe3Kburx73l2L","id":176}

          var hasSubscription = true;
          try {
            if (result[0].status == 0) {
              hasSubscription = false;
              vm.useraccntStatus = result[0].status;

              // reload goBack()
              // (this should fix an issue if someone tries to
              // cancel immediately, the local stripe server
              // might otherwise complain of modifying headers twice)
              // goBack(); <-- the loop never stops

              return true;
            } else {
              return false;
            }
          }
          catch(err) {
              console.log("error while looking up subscription info from DF: " + JSON.stringify(err));
              return err;
          }
          return false;
        }
      }
      // -------- end **DOWNGRADE**  STRIPE LOOP CHECKERS
      // ------------------------------------------------------------
      // ------------------------------------------------------------


      function failGetuseraccnt(err) {
        return err;
      }
      function _queryFailed(error) {
        // console.log("app/login/services/useraccnt.srvc.js:_queryFailed(error):result.data: " + JSON.stringify(result.data);

          throw error;
      }

      function goBack() {
          $state.go('cwrapper');
      }


    }
})();

(function () {
    'use strict';

    angular
        .module('app')

    /*['ngAnimate',
     'ngCookies',
     'ngResource',
     'ngRoute',
     'ngSanitize',
     'ngTouch',
     'pascalprecht.translate',
     'tmh.dynamicLocale'])*/

        .controller('layout', layout);

    layout.$inject = ['$location', '$rootScope', '$window', '$q', '$http', 'pvisits', '$cookies', '$scope',
        'DEBUG_MODE', 'EMPTY_IMAGE', 'rankofday', 'answer', 'table', 'special', 'datetime', 'uaf', 'userdata', 'dialog',
        'matchrec', 'edit', 'useractivity', 'vrows', 'headline', 'cblock', 'catans', '$state','dataloader'];

    function layout($location, $rootScope, $window, $q, $http, pvisits, $cookies, $scope,
        DEBUG_MODE, EMPTY_IMAGE, rankofday, answer, table, special, datetime, uaf, userdata, dialog,
        matchrec, edit, useractivity, vrows, headline, cblock, catans, $state, dataloader) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'layout';
        vm.header = '';
        //vm.searchRank = searchRank;

        //if ($rootScope.answers) vm.isLoading = false;
        //else
        vm.veilMsg = 'Just a moment, loading the best information about San Diego';
        vm.hidelogo = false;
        vm.getResults = getResults;
        vm.hideSearch = hideSearch;
        vm.gotoHome = gotoHome;

        vm.goPrivacyPolicy = goPrivacyPolicy;
        vm.goRankofDayConsole = goRankofDayConsole;

        $rootScope.$on('refreshRanks', function () {
            if ($state.current.name == 'cwrapper') {
                vm.hidelogo = $rootScope.hidelogo;
            }
        });
        $rootScope.$on('showLogo', function () {
            if ($state.current.name == 'rankSummary' || $state.current.name == 'answerDetail') {
                //vm.hidelogo = false;
            }
        });
        $rootScope.$on('userDataLoaded', function () {
            loadingDone();
        });
        $rootScope.$on('homeDataLoaded', function () {
            loadingDone();
        });
        $rootScope.$on('rankDataLoaded', function () {
            loadingDone();
        });
        $rootScope.$on('answerDataLoaded', function () {
            loadingDone();
        });

        /*
        if ($window.innerWidth < 512) vm.logoimage = "../../../assets/images/rankxlogosd_sm.png";
        else vm.logoimage = "../../../assets/images/rankxlogosd.png";
        */
        if ($window.innerWidth < 512) {
            vm.logoimage = "/assets/images/rankxlogosd2_sm.png";
            $rootScope.sm = true;
            vm.sm = true;
        }
        else {
            vm.logoimage = "/assets/images/rankxlogosd2_sm.png";
            $rootScope.sm = false;
            vm.sm = false;
        }

        //TODO: Would like to add this abstract template, but dont know how
        $rootScope.$on('$stateChangeSuccess', function (ev, to, toParams, from, fromParams) {
            $rootScope.previousState = from.name;
        });

        var nidx = 0;

        var tourviewed = $cookies.get('tourviewed');
        if (tourviewed == undefined) tourviewed = false;

        // Members
        activate();

        function activate() {

            $rootScope.DEBUG_MODE = DEBUG_MODE;
            $rootScope.EMPTY_IMAGE = EMPTY_IMAGE;    

            $rootScope.facebookAppId = ''; //1102409523140826'';
            $rootScope.facebookUrl = 'https://www.facebook.com/Rank-X-San-Diego-582174448644554';
       
            //$timeout(loadingDone, 1000);
            if ($rootScope.dataIsLoaded == undefined) {
                vm.isLoading = true;
                //vm.nh = 'hang in there';
                loadData();
                //if (!tourviewed && !$rootScope.isLoggedIn) dialog.tour();
            }

            //Determine if user is using Facebook browser
            $rootScope.isFacebookApp = isFacebookApp();

            if ($rootScope.DEBUG_MODE) console.log("Layout Loaded!");

        }

        function loadData() {

            $rootScope.neighborhoods = [
                "Downtown", "La Jolla", "Pacific Beach", "Hillcrest", "University Heights", "Old Town", "Del Mar",
                "Ocean Beach", "North Park", "Mission Hills", "Barrio Logan", "City Heights", "Clairemont", "La Mesa", "Point Loma",
                "South Park", "Scripps Ranch", "Mission Beach", "Mission Valley", "Kensington", "Cardiff by the Sea", "Coronado",
                "Leucadia", "Oceanside", "National City", "Rancho Santa Fe", "Solana Beach", "Poway", "El Cajon",
                "Escondido", "Carlsbad", "San Ysidro", "Otay Mesa", "Linda Vista", "Chula Vista", "Encinitas", "Golden Hills",
                "Spring Valley", "Rancho San Diego", "Mira Mesa",
                "Torrey Pines", "Carmel Valley", "Miramar", "Kearny Mesa", "Rancho Penasquitos",
                "Sorrento Valley", "Tierra Santa", "Logan Heights", "Serra Mesa", "Normal Heights", "Talmadge",
                "Bird Rock", "South San Diego", "North City", "San Carlos", "Del Cerro", "Grantville"
            ];

            $rootScope.districts = [
                "Columbia", "Core", "Cortez Hill", "East Village", "Gaslamp Quarter", "Horton Plaza", "Little Italy",
                "Marina", "Bankers Hill"];
            
            $rootScope.allnh = $rootScope.neighborhoods.concat($rootScope.districts);

            $http.get('../../../assets/fields.json').then(function (response) {
                $rootScope.typeSchema = response.data;
            });

            $http.get('../../../assets/dialogs.json').then(function (response) {
                $rootScope.dialogs = response.data;
            });

            $http.get('../../../assets/foodranks.json').then(function (response) {
                $rootScope.foodranks = response.data;
            });
/*
            if (window.location.href.indexOf('rankSummary')>-1){
                var myRegexp = /rankSummary\/([0-9]+)/g;
                var match = myRegexp.exec(window.location.href);
                var category = match[1];
                dataloader.getthisrankdata(category);
                console.log("rank id: ",match[1]);
            }
*/

            dataloader.gethomedata();
            dataloader.getallranks();
            dataloader.getallcblocks();
            dataloader.getrankdata();
            dataloader.getanswerdata();
            dataloader.getpagevisitdata();
            //loadingDone();
      }

        function loadingDone() {
            if ($rootScope.pageDataLoaded == undefined) $rootScope.pageDataLoaded = false;
            if ($rootScope.userDataLoaded == undefined) $rootScope.userDataLoaded = false;

            if (window.location.href.indexOf('rankSummary')>-1)
            $rootScope.dataIsLoaded = $rootScope.rankSummaryDataLoaded && $rootScope.pageDataLoaded && $rootScope.userDataLoaded;

            else if (window.location.href.indexOf('answerDetail')>-1)
            $rootScope.dataIsLoaded = $rootScope.answerDetailLoaded && $rootScope.rankSummaryDataLoaded && 
                                    $rootScope.pageDataLoaded && $rootScope.userDataLoaded;
            
            else $rootScope.dataIsLoaded = $rootScope.pageDataLoaded && $rootScope.userDataLoaded;

            vm.isLoading = !$rootScope.dataIsLoaded;
            //vm.isLoading = false;
            //$rootScope.dataIsLoaded = true;
            if ($rootScope.DEBUG_MODE) console.log("@loadingDone - $rootScope.dataIsLoaded -", $rootScope.dataIsLoaded);
            if ($rootScope.DEBUG_MODE) console.log("@loadingDone - $rootScope.pageDataLoaded -", $rootScope.pageDataLoaded);
            if ($rootScope.DEBUG_MODE) console.log("@loadingDone - $rootScope.userDataLoaded -", $rootScope.userDataLoaded);

        }

        function isFacebookApp() {
            var ua = navigator.userAgent || navigator.vendor || window.opera;
            //console.log("@isFacebook - ua - ", ua);
            return (ua.indexOf("FBAN") > -1) || (ua.indexOf("FBAV") > -1);
        }

        function goPrivacyPolicy(){
            $state.go('privacypolicy');
        }

        function goRankofDayConsole(){
            $state.go('rodconsole');
        }

        function showNeighborhoods(){

            setTimeout(function () {
                if (vm.isLoading) {
                    nidx = nidx + 1;
                    if (nidx >= $rootScope.neighborhoods.length-1) nidx = 0;
                    vm.nh = $rootScope.neighborhoods[nidx];
                    showNeighborhoods();
                }
            }, 333);
        }

        function getResults() {
            $rootScope.inputVal = vm.val;
            if ($rootScope.inputVal.length > 0) {
                $rootScope.searchActive = true;
            }
            else {
                $rootScope.searchActive = false;
            }
            vm.searchActive = $rootScope.searchActive;
            $window.scroll(0,0);
            $rootScope.$emit('getResults');
            
        }

        function hideSearch(){
            vm.searchActive = false;
        }

         function gotoHome() {
            $rootScope.fbmode = false;
            $rootScope.searchActive = false;
            $rootScope.hidelogo = false;
            $rootScope.inputVal = '';
            vm.val = '';
            //$state.go('cwrapper', {}, { reload: true });
            if ($state.current.name != 'cwrapper') {
                $state.go('cwrapper',{main: true});
            }
            else $rootScope.$emit('mainView');
        }

        /*
        function searchRank() {
            $rootScope.sval = vm.val;
            $rootScope.$emit('searchRank');
        }
        */
        /**
         * Set selected city
         * Now you can use $rootScope.selectCity variable anywhere to load city specific data.
         * i.e if you want to load ranks from particular city having table rank-la.
         * so you will get la from $rootScope.selectCity.code
         * @param city
         */
        $rootScope.selectCity = function (city) {
            $rootScope.selectedCity = city;
            window.localStorage.selectedCity = JSON.stringify($rootScope.selectedCity);
            //closeModal("#selectCityModal");
        }
    }
})();

(function () {
    'use strict';

    angular
        .module('app')
        .controller('feedback', feedback);

    feedback.$inject = ['$location', '$rootScope', '$state'];

    function feedback(location, $rootScope, $state) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'feedback';
        

        vm.goBack = goBack;

       activate();

        function activate() {            

            console.log("feedback page Loaded!");
            
        }

        function goBack() {
            //if ($rootScope.cCategory.id == undefined) $state.go('rankSummary', { index: $rootScope.cCategory.id });
            //else $state.go('rankSummary', { index: 1 });
            $state.go('cwrapper');
        }

    }
})();

(function () {
    'use strict';

    angular
        .module('app')
        .controller('cwrapper', cwrapper);

    cwrapper.$inject = ['$rootScope', '$state', '$http', '$stateParams', '$scope',
        'query', 'table', 'dialog', 'uaf','$window','userdata','$location','color', 'fbusers', '$q'];

    function cwrapper($rootScope, $state, $http, $stateParams, $scope,
        query, table, dialog, uaf, $window, userdata, $location, color, fbusers, $q) {
        /* jshint validthis:true */
        var vm = this;
        //-----SEO tags ----
        $scope.$parent.$parent.$parent.seo = { 
        pageTitle : 'Rank-X', 
        metaDescription: 'Rank-X creates collective rankings on everything in your city.' 
        };
        
        //if ($location.absUrl().indexOf('code=')>-1) $window.location.search = '';
         
        vm.title = 'cwrapper';

        vm.switchScope = switchScope;
        
        if ($rootScope.hidelogo == undefined) vm.hidelogo = false;
        else vm.hidelogo = $rootScope.hidelogo;
        
        //Admin Functions
        vm.viewRank = viewRank;
        vm.editRank = editRank;
        vm.applyRule = applyRule;
          
        //Quick Links 
        vm.foodNearMe = foodNearMe;
        vm.events = events;
        vm.selfimprove = selfimprove;
        vm.refreshFeed = refreshFeed;
        
        //Methods
        vm.selnh = selnh;
        vm.goHome = goHome;
        vm.gotoAnswer = gotoAnswer;
        vm.gotoRank = gotoRank;
        vm.seeMoreFeed = seeMoreFeed;
        vm.fres = 4;
        vm.ftext = 'see more';
        
        //vm.isAdmin = true;
        $rootScope.editMode = false;
        //*****************************
        
        vm.content = [];
        vm.emptyspace = '';
        vm.fbm = $rootScope.fbmode ? true:false;
        
        //$rootScope.searchActive = $rootScope.searchActive ? $rootScope.searchActive: false;
        //vm.searchActive = $rootScope.searchActive;
        
        //Receive from navbar, if 'Home' go to Main View
        var mainViewListener = $rootScope.$on('mainView', function (event) {
            if ($state.current.name == 'cwrapper') {
                goHome();
            }
        });

        $scope.$on('$destroy',mainViewListener);

        //Receive from layout search bar
        var getResultsListener = $rootScope.$on('getResults', function (event) {
            vm.searchActive = $rootScope.searchActive;
        });

        $scope.$on('$destroy',getResultsListener);

        window.prerenderReady = false;

        if ($rootScope.cwrapperLoaded) activate();
        else init();

        function activate() {

            if ($state.params.main == true) goHome();
            
            $rootScope.inFavMode = false;
            
            getFeed();
            if ($rootScope.DEBUG_MODE) console.log("activate cwrapper!");
            vm.isNh = $rootScope.isNh;
            
            if (vm.isNh) vm.querybc = '#428bca';
            else vm.querybc = 'white'; //#f9f9f9
            
            vm.isNhRdy = $rootScope.isNhRdy;
            vm.cnh = $rootScope.cnh;
            
            if (vm.isNh) vm.searchScope = vm.isNhRdy ? $rootScope.cnh : 'Neighborhood';
            vm.isCity = $rootScope.isCity;
            
            if (vm.isCity) vm.searchScope = 'all San Diego';
            
            vm.nhs = $rootScope.neighborhoods.concat($rootScope.districts);
            vm.searchActive = $rootScope.searchActive ? $rootScope.searchActive: false;
            vm.isAdmin = $rootScope.isAdmin;

            vm.selEditRank = $rootScope.editMode ? 'active' : 'none';
            vm.selViewRank = $rootScope.editMode ? 'none' : 'active';
            
            //$rootScope.includeNearMe = false;
            $rootScope.cCategory = undefined;
            
            vm.val = $rootScope.inputVal; //remember user query
            
            var bgc = '#595959';
            var bgc2 = color.shadeColor(bgc, 0.5);
            vm.headerStyle = 'color:#f8f8ff;width:50%;border-style:none;'+
                       'background:'+bgc+';'+
  					   'background: -webkit-linear-gradient(left,'+bgc+','+bgc2+');'+
  					   'background: -o-linear-gradient(right,'+bgc+','+bgc2+');'+
  					   'background: -moz-linear-gradient(right,'+bgc+', '+bgc2+');'+
  					   'background: linear-gradient(to right,'+bgc+', '+bgc2+');';  

            window.prerenderReady = true;
                    
        }
        function init() {

            if ($rootScope.DEBUG_MODE) console.log("init cwrapper!");
                
            //****SUPER TEMP*****************
            $rootScope.isAdmin = false;
            vm.isAdmin = false;
               /*
            $rootScope.isLoggedIn = true;
            $rootScope.user = {};
            $rootScope.user.name = "Andres Moctezuma";
            $rootScope.user.first_name = 'Andres';
            $rootScope.user.last_name = 'Moctezuma';
            $rootScope.user.id = "10104518570729893";
            userdata.loadUserData();        //load user data (votes and activities)
            userdata.loadUserAccount();     //load user business account
            //$rootScope.answeridxgps = 1258; //starting indx for gps conversion
               /*        
            if ($rootScope.isLoggedIn && $rootScope.user.name == "Andres Moctezuma" && $rootScope.user.id == 12) {
                $rootScope.isAdmin = true;
                vm.isAdmin = true;
            }
            viewRank();
                */
            //******************************

            //Load current category
            //$rootScope.content = {};
            //vm.isBasic = $rootScope.isBasic;
            
            $rootScope.inputVal = '';
            
            switchScope(1); //Default view is basic query view
            vm.cnh = 'Select Neighborhood';
            $rootScope.cnh = vm.cnh;
            vm.isNhRdy = false;
            $rootScope.isNhRdy = false; 

            var bgc = '#595959';
            var bgc2 = color.shadeColor(bgc, 0.5);
            vm.headerStyle = 'color:#f8f8ff;width:50%;border-style:none;'+
                       'background:'+bgc+';'+
  					   'background: -webkit-linear-gradient(left,'+bgc+','+bgc2+');'+
  					   'background: -o-linear-gradient(right,'+bgc+','+bgc2+');'+
  					   'background: -moz-linear-gradient(right,'+bgc+', '+bgc2+');'+
  					   'background: linear-gradient(to right,'+bgc+', '+bgc2+');';   
            
            loadcontent();
            //getEstablishmentAnswers();
            //getFeed();

            //});
            $rootScope.cwrapperLoaded = true;
            $rootScope.cCategory = undefined;
            
            vm.searchActive = $rootScope.searchActive ? $rootScope.searchActive: false;
            
            if ($rootScope.isAdmin) prepareNewCatansOptions();
            
            //userdata.loadVotes();
            activate();

        }

        function loadcontent() {

            //vm.content=[];
            //vm.searchArray = [];
            ///vm.empty = [];
            //vm.cTags = {};
            
            $rootScope.cityranks = ['city', 'lifestyle', 'food', 'politics', 'services', 'social', 'beauty', 'sports', 'personalities', 'technology', 'dating', 'health'];
            $rootScope.nhranks = ['neighborhood', 'lifestyle', 'food', 'services', 'social', 'beauty', 'health'];

            vm.nhs = $rootScope.neighborhoods.concat($rootScope.districts);
           
        }

        function switchScope(x) {
            if (x == 1) {
                vm.isNh = false; //Neighborhood Scope
                vm.isCity = true; //City Scope
                $rootScope.isNh = false;
                $rootScope.isCity = true;
                //vm.val = '';
                //$rootScope.inputVal = '';
                //$rootScope.searchActive = false;
                $rootScope.$emit('loadNh');
                vm.searchScope = 'all San Diego';
                vm.ranks = $rootScope.cityranks;
                //vm.querybc = '#f9f9f9';
                vm.querybc = 'white';
            }
            if (x == 2) {
                vm.isNh = true; //Neighborhood View
                vm.isCity = false; //Classified View
                $rootScope.isNh = true;
                $rootScope.isCity = false;
                vm.val = '';
                $rootScope.inputVal = '';
                $rootScope.searchActive = false;
                if ($rootScope.isNhRdy) $rootScope.$emit('loadNh');
                vm.searchScope = 'Neighborhood';
                vm.ranks = $rootScope.nhranks;
                vm.querybc = '#428bca';
            }
            vm.searchActive = $rootScope.searchActive;
        }

        function selnh(x) {
            $rootScope.cnh = x;
            vm.cnh = x;
            vm.isNhRdy = true;
            $rootScope.isNhRdy = vm.isNhRdy;
            vm.inputVal = '';
            vm.searchActive = false;
            $rootScope.$emit('loadNh');
            vm.searchScope = x;
            vm.val = '';
            $rootScope.inputVal = '';
            //force close the dropdown neighborhood menu            
            $("#nhdropdown").dropdown("toggle");
        }
        
        //Quick Links
        function foodNearMe(){
            //console.log("$rootScope.coordsRdy - ", $rootScope.coordsRdy);
            if ($rootScope.coordsRdy) $state.go('rankSummary', { index: 9521 });
            else {
                $rootScope.loadFbnWhenCoordsRdy = true;
                dialog.askPermissionToLocate();
            }            
        }
        
        function selfimprove(){
            var introsRank = 0;
            var rankFound = false;
            var rn = 0; //random number
            var N = $rootScope.content.length-1;
            
            while(!rankFound){
             rn = Math.floor(Math.random() * (N - 0 + 1)) + 0;
                if ($rootScope.content[rn].tags.indexOf('isMP') > -1){
                    rankFound=true;
                }   
            }
            /*
            for (var i=0; i<$rootScope.content.length; i++){
                if ($rootScope.content[i].title.indexOf($rootScope.rankofday[0].intros) > -1){
                    introsRank = $rootScope.content[i].id;
                    break;
                }
            }*/
            $state.go('rankSummary', { index: $rootScope.content[rn].id });
        }
        
        function events(){
             $state.go('rankSummary', { index: 6949 });
        }
        //*****************Admin Functions************
        function editRank() {
            $rootScope.editMode = true;
            vm.selEditRank = 'active';
            vm.selViewRank = '';
            //console.log("mode -- ", editMode);

        }
        function viewRank() {
            $rootScope.editMode = false;
            vm.selEditRank = '';
            vm.selViewRank = 'active';
            //console.log("mode -- ", editMode);
        }
        function applyRule() {          
            $rootScope.$emit('applyRule');
        }
           
        function getFeed(){
            // vm.feeds = angular.copy($rootScope.uafs);
            vm.feeds = [];
            $q.all($rootScope.uafs.map(function(feed){ return fbusers.getFBUserById(feed.userid); }))
            .then(function (fbUsers){
                for (var i = 0; i < $rootScope.uafs.length; i++) {
                    var userWithPic = angular.copy($rootScope.uafs[i]);
                    userWithPic.picture = fbUsers[i] ? fbUsers[i].picture.data.url : null;
                    vm.feeds[i] = userWithPic;
                }
            });
            vm.fres = 4;
            vm.ftext = 'see more';
            //console.log("vm.feeds - ", vm.feeds);
        }
        
        function seeMoreFeed(){
            if (vm.fres == 4){
                vm.fres = 20;
                vm.ftext = 'see less';
                return;
            }
            if (vm.fres == 20){
                vm.fres = 4;
                vm.ftext = 'see more';
                return;
            }            
        }
        
        function refreshFeed(){
            console.log("refreshFeed");
            uaf.getactions().then(function(response){
                $rootScope.uafs = response;
                getFeed();
            });
        }
        function goHome(){
            //$rootScope.$emit('quitFeedbackMode');
            $rootScope.inputVal = '';
            vm.val = '';
            switchScope(1);
            $rootScope.fbmode = false;
            vm.fbm = $rootScope.fbmode;
        }
        function gotoAnswer(x){
            $state.go('answerDetail',{index: x.answer});
        }
        function gotoRank(x){
            $state.go('rankSummary',{index: x.category});
        }
        function prepareNewCatansOptions() {
            
            console.log("@prepareNewCatansOptions - $rootScope.content.length ", $rootScope.content.length);
            $rootScope.ctsOptions = [];
            var titlex = '';
            for (var i = 0; i < $rootScope.content.length; i++) {
                if ($rootScope.content[i].title.indexOf('in Hillcrest') > -1) {
                    titlex = $rootScope.content[i].title.replace('Hillcrest', '@neighborhood');
                    $rootScope.ctsOptions.push(titlex);
                }
                if ($rootScope.content[i].tags.indexOf('isMP') > -1) {
                    $rootScope.ctsOptions.push($rootScope.content[i].title);
                }
            }
        }
        
        //***********End Admin Functions********************
    }
})();







(function () {
    'use strict';

    angular
        .module('app')
        .controller('about', about);

    about.$inject = ['$location', '$rootScope', '$state','$window', '$scope'];

    function about(location, $rootScope, $state, $window, $scope) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'about';

        vm.goBack = goBack;
        
        if ($window.innerWidth < 512) {
            vm.logoimage = "/assets/images/rankxlogo_noheadline.png";
            vm.sm = true;
        }
        else {
            vm.logoimage = "/assets/images/rankxlogo_noheadline.png";
            vm.sm = false;
        }

        //-----SEO tags ----
        $scope.$parent.seo = { 
        pageTitle : 'About', 
        metaDescription: 'Rank-X creates collective rankings on everything in your city.' 
        };
      
        activate();

        function activate() {            

            console.log("About page Loaded!");
            
        }

        function goBack() {
            //if ($rootScope.cCategory.id == undefined) $state.go('rankSummary', { index: $rootScope.cCategory.id });
            //else $state.go('rankSummary', { index: 1 });
            $state.go('cwrapper');
        }

    }
})();

(function () {
    'use strict';

    angular
        .module('app')
        .factory('special', special);

    special.$inject = ['$http', '$q', '$rootScope'];

    function special($http, $q, $rootScope) {

        //Members
        var _specials = [];
        var _selectedspecial;
        var _specialsByAnswer = [];
        var baseURI = '/api/v2/mysql/_table/specials';

        var service = {
            getSpecials: getSpecials,
            getSpecial: getSpecial,
            addSpecial: addSpecial,
            updateSpecial: updateSpecial,
            deleteSpecial: deleteSpecial,
            getSpecialsbyAnswer: getSpecialsbyAnswer
        };

        return service;

        function getSpecials(forceRefresh) {
            // console.log("getspecials..._arespecialsLoaded()", _arespecialsLoaded());

            if (_arespecialsLoaded() && !forceRefresh) {

                return $q.when(_specials);
            }

            var url = baseURI;

            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                return _specials = result.data.resource;
            }

        }

        function getSpecial(id, forceRefresh) {

            if (_isSelectedspecialLoaded(id) && !forceRefresh) {

                return $q.when(_selectedspecial);
            }

            var url = baseURI + '/' + id;

            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                return _selectedspecial = result.data;
            }
        }

        function getSpecialsbyAnswer(answer_id, forceRefresh) {

            if (_areSpecialsByAnswerLoaded() && !forceRefresh) {
                return $q.when(_specialsByAnswer);
            }


            var url = baseURI + '/?filter=answer=' + answer_id;

            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                return _specialsByAnswer = result.data.resource;
            }
        }

        function addSpecial(special) {

            var url = baseURI;
            var resource = [];

            resource.push(special);

            return $http.post(url, resource, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: resource
            }).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                //update local copy
                var specialx = special;
                specialx.id = result.data.resource[0].id;
                if (_specials.length > 0) _specials.push(specialx);
                if (_specialsByAnswer.length > 0) _specialsByAnswer.push(specialx);                
                
                console.log("result", result);
                return result.data;
            }

        }

        function updateSpecial(special_id, field, val) {
           
            //form match record
            var obj = {};
            obj.resource = [];

            var data = {};
            data.id = special_id;
            
            for (var i=0; i<field.length; i++){
                switch (field[i]){
                    case "answer": data.answer = val[i]; break;
                    case "bc": data.bc = val[i]; break;
                    case "details": data.details = val[i]; break;
                    case "edate": data.edate = val[i]; break;
                    case "etime": data.etime = val[i]; break;
                    case "etime2": data.etime2 = val[i]; break;
                    case "fc": data.fc = val[i]; break;
                    case "freq": data.freq = val[i]; break;
                    case "mon": data.mon = val[i]; break;
                    case "tue": data.tue = val[i]; break;
                    case "wed": data.wed = val[i]; break;
                    case "thu": data.thu = val[i]; break;
                    case "fri": data.fri = val[i]; break;
                    case "sat": data.sat = val[i]; break;
                    case "sun": data.sun = val[i]; break;
                    case "name": data.name = val[i]; break;
                    case "image": data.image = val[i]; break;
                    case "sdate": data.sdate = val[i]; break;
                    case "stime": data.stime = val[i]; break;
                    case "stime2": data.stime2 = val[i]; break;
                    case "stitle": data.stitle = val[i]; break;
                }
            }
            //console.log("data", data);
            obj.resource.push(data);

            var url = baseURI;
            
            //update local copy
            //var idx = _answers.map(function(x) {return x.id; }).indexOf(answer_id);
            //var idx = $rootScope.A.indexOf(+answer_id);
            var idx = _specials.map(function(x) {return x.id; }).indexOf(special_id);  
            for (var i=0; i<field.length; i++){
                switch (field[i]){
                    case "answer": _specials[idx].answer = val[i]; break;
                    case "bc": _specials[idx].bc = val[i]; break;
                    case "details": _specials[idx].details = val[i]; break;
                    case "edate": _specials[idx].edate = val[i]; break;
                    case "etime": _specials[idx].etime = val[i]; break;
                    case "etime2": _specials[idx].etime2 = val[i]; break;
                    case "fc": _specials[idx].fc = val[i]; break;
                    case "freq": _specials[idx].freq = val[i]; break;
                    case "mon": _specials[idx].mon = val[i]; break;
                    case "tue": _specials[idx].tue = val[i]; break;
                    case "wed": _specials[idx].wed = val[i]; break;
                    case "thu": _specials[idx].thu = val[i]; break;
                    case "fri": _specials[idx].fri = val[i]; break;
                    case "sat": _specials[idx].sat = val[i]; break;
                    case "sun": _specials[idx].sun = val[i]; break;
                    case "name": _specials[idx].name = val[i]; break;
                    case "image": _specials[idx].image = val[i]; break;
                    case "sdate": _specials[idx].sdate = val[i]; break;
                    case "stime": _specials[idx].stime = val[i]; break;
                    case "stime2": _specials[idx].stime2 = val[i]; break;
                    case "stitle": _specials[idx].stitle = val[i]; break;
                }
            }

            //update _specialsByAnswer
            var idx2 = _specialsByAnswer.map(function(x) {return x.id; }).indexOf(special_id);  
            for (var i=0; i<field.length; i++){
                switch (field[i]){
                    case "answer": _specialsByAnswer[idx2].answer = val[i]; break;
                    case "bc": _specialsByAnswer[idx2].bc = val[i]; break;
                    case "details": _specialsByAnswer[idx2].details = val[i]; break;
                    case "edate": _specialsByAnswer[idx2].edate = val[i]; break;
                    case "etime": _specialsByAnswer[idx2].etime = val[i]; break;
                    case "etime2": _specialsByAnswer[idx2].etime2 = val[i]; break;
                    case "fc": _specialsByAnswer[idx2].fc = val[i]; break;
                    case "freq": _specialsByAnswer[idx2].freq = val[i]; break;
                    case "mon": _specialsByAnswer[idx2].mon = val[i]; break;
                    case "tue": _specialsByAnswer[idx2].tue = val[i]; break;
                    case "wed": _specialsByAnswer[idx2].wed = val[i]; break;
                    case "thu": _specialsByAnswer[idx2].thu = val[i]; break;
                    case "fri": _specialsByAnswer[idx2].fri = val[i]; break;
                    case "sat": _specialsByAnswer[idx2].sat = val[i]; break;
                    case "sun": _specialsByAnswer[idx2].sun = val[i]; break;
                    case "name": _specialsByAnswer[idx2].name = val[i]; break;
                    case "image": _specialsByAnswer[idx2].image = val[i]; break;
                    case "sdate": _specialsByAnswer[idx2].sdate = val[i]; break;
                    case "stime": _specialsByAnswer[idx2].stime = val[i]; break;
                    case "stime2": _specialsByAnswer[idx2].stime2 = val[i]; break;
                    case "stitle": _specialsByAnswer[idx2].stitle = val[i]; break;
                }
            }                                
            
            return $http.patch(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {
                
                if ($rootScope.DEBUG_MODE) console.log("updating special succesful");
                return result.data;
            }
        }
/*
        function updateSpecial(item) {
           
            
            
            //form match record
            var obj = {};
            obj.resource = [];


         
            //console.log("data", data);
            obj.resource.push(item);
            console.log("@special service - ", item);

            var url = baseURI;
            
            //TODO: update local copy
            if (_specials.length > 0){
                for (var i=0; i < _specials.length; i++){
                    if (_specials[i].id == item.id) _specials[i] = item; 
                }
            }
            
            if (_specialsByAnswer.length > 0){
                for (var i=0; i < _specialsByAnswer.length; i++){
                    if (_specialsByAnswer[i].id == item.id) _specialsByAnswer[i] = item; 
                }
            }
            
            return $http.patch(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                console.log("updating special succesful");
                return result.data;
            }
        }
*/
        function deleteSpecial(special_id) {
           
            //form match record
            var obj = {};
            obj.resource = [];

            var data = {};
            data.id = special_id;

            obj.resource.push(data);

            var url = baseURI + '/' + special_id;
            
            //update (delete special) local copy of specials
            if (_specials.length > 0) {
                var i = _specials.map(function (x) { return x.id; }).indexOf(special_id);
                if (i > -1) _specials.splice(i, 1);
            }
            
            //update (delete special) local copy of specials
            if (_specialsByAnswer.length > 0) {
                var i = _specialsByAnswer.map(function (x) { return x.id; }).indexOf(special_id);
                if (i > -1) _specialsByAnswer.splice(i, 1);
            }

            return $http.delete(url, data, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                console.log("Deleting special was succesful");
                return result.data;
            }
        }

        function _arespecialsLoaded() {

            return _specials.length > 0;
        }

        function _areSpecialsByAnswerLoaded() {
            return _specialsByAnswer.length > 0;
        }

        function _isSelectedspecialLoaded(id) {

            return _selectedspecial && _selectedspecial.id == id;
        }

        function _queryFailed(error) {

            throw error;
        }

    }
})();
(function () {
    'use strict';

    angular
        .module('app')
        .service('datetime', datetime);

    datetime.$inject = ['$rootScope'];

    //This function changes the format of the date as it comes from the db in DreamFactory
    //To the date, it adds the 3 character day of the week
    //To the time, it removes secs and makes it into 12h format
    function datetime($rootScope) {


        var service = {

            formatdatetime: formatdatetime,
            formatTime: formatTime,
            date2number: date2number,
            dateIsCurrent: dateIsCurrent,
            eventIsCurrent: eventIsCurrent
        };

        return service;

        function formatdatetime(sp) {

            if (sp.freq == 'onetime') {
                formatTime(sp, 'stime');
                formatTime(sp, 'etime');
            
                //Format dates
                var d = new Date(sp.sdate);
                var s = d.toString();
                sp.sdate = s.substring(0, 15);

                d = new Date(sp.edate);
                s = d.toString();
                sp.edate = s.substring(0, 15);
            }
            if (sp.freq == 'weekly') {
                formatTime(sp, 'stime2');
                formatTime(sp, 'etime2');
            }

        }

        function formatTime(sp, s) {
            var date = '';

            switch (s) {
                case "stime": date = sp.stime; break;
                case "etime": date = sp.etime; break;
                case "stime2": date = sp.stime2; break;
                case "etime2": date = sp.etime2; break;
            }
            
            //Format time, remove seconds
            if (date != null && date != undefined && (date.indexOf('00:00') > -1 || date.indexOf('30:00') > -1)) {
                date = date.replace('00:00', '00');
                date = date.replace('30:00', '30');
                var itsAM = parseInt(date.substring(0, 2)) < 12;
                if (itsAM) date = date + ' AM';
                else date = date + ' PM';
                //if PM put in 12h notation
                if (!itsAM) {
                    var hr = parseInt(date.substring(0, 2)) - 12;
                    var hrstr = '';
                    if (hr < 10) hrstr = '0' + hr.toString();
                    else hrstr = hr.toString();
                    date = date.replace(date.substring(0, 2), hrstr);
                }
            }

            switch (s) {
                case "stime": sp.stime = date; break;
                case "etime": sp.etime = date; break;
                case "stime2": sp.stime2 = date; break;
                case "etime2": sp.etime2 = date; break;
            }

        }
        
        //Get date in number from date in string
        function date2number(datestr){
             var d1 = new Date(datestr);
             var d1s = d1.getFullYear().toString() +
                (d1.getMonth() + 1 < 10 ? ('0' + (d1.getMonth() + 1).toString()) : (d1.getMonth() + 1).toString()) +
                (d1.getDate() < 10 ? ('0' + d1.getDate().toString()) : d1.getDate().toString());
             return Number(d1s);  
        }
        
        //return true if date is today or in the future
        function dateIsCurrent(datestr){
            var date = date2number(datestr);
            return date - $rootScope.dateTodayNum >= 0;
        }
        
        //return true if an event is current or in the future
        function eventIsCurrent(obj, answer){
            var edate = 0;
            var edateValid = false;
            var sdate = 0;
            var eIsCurrent = false;
            if (answer.edate != undefined && answer.edate != ''){
                edate = date2number(answer.edate.slice(4));
                edateValid = true;   
            }
            
            sdate =  date2number(answer.sdate.slice(4));
            
           // ----x------|----------------|------------
            if (edateValid){
                if (edate >= $rootScope.dateTodayNum) {
                    eIsCurrent = true;
                    if (sdate >= $rootScope.dateTodayNum) {
                        obj.date = answer.sdate.slice(4);
                    }
                    else {
                        //Format todays date
                        var d = new Date($rootScope.dateToday);
                        var s = d.toString();
                        obj.date = s.substring(0, 15).slice(4);
                    }
                }
                else {
                    eIsCurrent = false;
                    obj.date = answer.edate.slice(4);
                }
            }
            //-----------------|--------------------
            else {
                if (sdate >= $rootScope.dateTodayNum) {
                    eIsCurrent = true;
                    obj.date = answer.sdate.slice(4);
                }
                else {
                    eIsCurrent = false;
                    obj.date = answer.sdate.slice(4);
                }
            }
            
            return eIsCurrent;
        }

    }
})();
(function () {
    'use strict';

    angular
        .module('app')
        .controller('specials', specials);

    specials.$inject = ['$location', '$rootScope', '$state', 'dialog', 'special'];

    function specials(location, $rootScope, $state, dialog, special) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'specials';

        vm.addSpecial = addSpecial;
        vm.selSpecial = selSpecial;
        vm.deleteSpecial = deleteSpecial;
        vm.goBack = goBack;

        vm.specialsList = [];
        vm.dataReady = false;
        var selSpecial = {};

        //$rootScope.cust.specials = [];

        activate();

        function activate() {
           
            //Load specials for this answer
            special.getSpecialsbyAnswer($rootScope.canswer.id).then(function (response) {
                $rootScope.specials = response;
                vm.dataReady = true;
                displaySpecials();
            });

            console.log("Specials Page loaded!")

        }

        function displaySpecials() {
            vm.specialsList = [];
            var obj = {};
            for (var i=0; i<7; i++){
                obj = {};
                if (i < $rootScope.specials.length){
                    obj = $rootScope.specials[i];
                    obj.used = true;
                }
                else{
                    obj.stitle = 'Empty';
                    obj.used = false;
                }
                vm.specialsList.push(obj);
            }
        }

        function addSpecial() {
            $rootScope.specialmode = 'add'
            $state.go('editspecial');
        }

        function selSpecial(x) {

            $rootScope.cspecial = x;
            $rootScope.specialmode = 'edit'
            $state.go('editspecial');
        }

        function deleteSpecial(x){
            selSpecial = x;
            dialog.deleteRank(x,execDeleteSpecial,true);
        }

        function execDeleteSpecial(){
            special.deleteSpecial(selSpecial.id).then(function(){
                displaySpecials();
            });
        }
        
        function goBack() {
               $state.go("answerDetail", { index: $rootScope.canswer.id });                              
        }

    }
})();

(function () {
    'use strict';

    angular
        .module('app')
        .controller('photogallery', photogallery);

    photogallery.$inject = ['$location', '$rootScope', '$state'];

    function photogallery(location, $rootScope, $state) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'photogallery';
               
       activate();

        function activate() {            

            console.log("photogallery page Loaded!");
            
        }
    }
})();

(function () {
    'use strict';

    angular
        .module('app')
        .controller('mainphoto', mainphoto);

    mainphoto.$inject = ['$location', '$rootScope', '$state'];

    function mainphoto(location, $rootScope, $state) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'mainphoto';
               
       activate();

        function activate() {            

            console.log("mainphoto page Loaded!");
            
        }
    }
})();

(function () {
    'use strict';

    angular
        .module('app')
        .controller('editvrows', editvrows);

    editvrows.$inject = ['$location', '$rootScope', '$state', 'dialog', 'vrows','vrowvotes'];

    function editvrows(location, $rootScope, $state, dialog, vrows, vrowvotes) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'editvrows';

        var tidx = 99999;

        vm.header = 'Edit Vote Rows for ' + $rootScope.canswer.name;
        vm.editvrowsList = [];
        vm.vrows = [];
        
        //Methods
        vm.addVRowDiag = addVRowDiag;
        vm.addVRowGroupDiag = addVRowGroupDiag;
        vm.deleteVRowDiag = deleteVRowDiag;
        vm.editVRowGroupDiag = editVRowGroupDiag;
        vm.closeRank = closeRank;
        
        activate();

        function activate() {
            vm.vrows = $rootScope.cansvrows;
            displayVRows();
            console.log("editvrows Page loaded!");

        }

        function displayVRows() {

            vm.vrows = [];
            function compare(a, b) {
                return a.gnum - b.gnum;
            }
            if ($rootScope.cansvrows.length > 0) {
                vm.vrows = $rootScope.cansvrows.sort(compare);
                //console.log("length $rootScope.cansvrows--",$rootScope.cansvrows.length);
                vm.vrows[0].shdr = true;
                for (var i = 1; i < vm.vrows.length; i++) {
                    if (vm.vrows[i].gnum == vm.vrows[i - 1].gnum) vm.vrows[i].shdr = false;
                    else vm.vrows[i].shdr = true;
                }
                vm.vrows[vm.vrows.length - 1].saddr = true;
                for (var i = 0; i < vm.vrows.length - 1; i++) {
                    if (vm.vrows[i].gnum != vm.vrows[i + 1].gnum) vm.vrows[i].saddr = true;
                    else vm.vrows[i].saddr = false;
                }
            }
            
        }

        function closeRank() {
            $state.go("answerDetail", { index: $rootScope.canswer.id });
        }

        function getVRows(answerid) {
            $rootScope.cansvrows = [];
            //Load vrows for this answer           
            for (var i = 0; i < $rootScope.cvrows.length; i++) {
                if ($rootScope.cvrows[i].answer == answerid) {
                    $rootScope.cansvrows.push($rootScope.cvrows[i]);
                }
            }
            displayVRows();
        }

        function addVRowDiag(x) {
            dialog.addVRow(x, addVRow);
        }

        function addVRow(x, newname) {
            
            //if title is '-' is a row without title
            var isGroupFirst = false;
            if (x.title == '-') isGroupFirst = true;

            var vrowobj = JSON.parse(JSON.stringify(x));
            vrowobj.id = undefined;
            vrowobj.$$hashKey = undefined;
            vrowobj.upV = 0;
            vrowobj.downV = 0;
            vrowobj.title = newname;

            if (isGroupFirst) {
                var promise = vrows.updateRec(x.id, ['title'], [newname]);

                promise.then(function () {
                    getVRows($rootScope.canswer.id);
                    //displayVRows();
                });
            }
            else {
                var promise2 = vrows.postRec(vrowobj); 
                
                promise2.then(function () {
                    getVRows($rootScope.canswer.id);
                    //displayVRows();
                });

            }

        }

        function deleteVRowDiag(x) {
            dialog.deleteVRow(x, deleteVRow);
        }

        function deleteVRow(x) {
            var promise = vrows.deleteVrow(x.id);
            vrowvotes.deleteVrowVotesbyVrow(x.id);

            promise.then(function () {
                getVRows($rootScope.canswer.id);
                //displayVRows();
            });
        }

        function addVRowGroupDiag() {
           
                var x = vm.vrows[vm.vrows.length - 1];
                dialog.addVRowGroup(x, addVRowGroup);
           
        }

        function addVRowGroup(x, newname) {
            if (vm.vrows.length > 0){
            var vrowobj = JSON.parse(JSON.stringify(x));
            vrowobj.id = undefined;
            vrowobj.$$hashKey = undefined;
            vrowobj.upV = 0;
            vrowobj.downV = 0;
            vrowobj.title = '-';
            vrowobj.gnum = vm.vrows[vm.vrows.length - 1].gnum + 1;
            vrowobj.gtitle = newname;
            }
            else {
                vrowobj = {};
                vrowobj.answer = $rootScope.canswer.id;
                vrowobj.gnum = 0;
                vrowobj.gtitle = newname;
                vrowobj.title = '-';
                vrowobj.upV = 0;
                vrowobj.downV = 0;
            }
            
            var promise = vrows.postRec(vrowobj);

            promise.then(function () {
                getVRows($rootScope.canswer.id);
                //displayVRows();
            });
            // console.log(x);
        }
        
        function editVRowGroupDiag(x){
            dialog.editVRowGroup(x, editVRowGroup, deleteVRowGroupDiag);
        }
        
        function editVRowGroup(x, newgroupname) {

            var nameChanged = false;
            if (x.gtitle != newgroupname) nameChanged = true;

            if (nameChanged) {
                for (var i = 0; i < $rootScope.cansvrows.length; i++) {
                    if ($rootScope.cansvrows[i].gnum == x.gnum) {
                        $rootScope.cansvrows[i].gtitle = newgroupname;
                        vrows.updateRec($rootScope.cansvrows[i].id, ['gtitle'], [newgroupname]);
                    }
                }
                getVRows($rootScope.canswer.id);
            }
        }
        
        function deleteVRowGroupDiag(x){
            dialog.deleteVRowGroup(x, deleteVRowGroup);
        }
        
        function deleteVRowGroup(x){
            
            //delete votes for all vrow in group that is deleted
            /*No need for this, delete votes automatically deleted from call within vrow service
            for (var i=0; i < vm.vrows.length; i++){
                if (vm.vrows[i].gnum == x.gnum){
                    vrowvotes.deleteVrowVotesbyVrow(vm.vrows[i].id);
                }
            }*/
            
            //delete all vrows in that group
            var promise = vrows.deleteVrowByGroup(x.gnum, x.answer);

            promise.then(function () {
                console.log("$rootScope.cvrows - ", $rootScope.cvrows);
                getVRows($rootScope.canswer.id);
                //displayVRows();
            });
            
        }

    }
})();

(function () {
    'use strict';

    angular
        .module('app')
        .controller('editspecial', editspecial);

    editspecial.$inject = ['$location', '$rootScope', '$state', 'dialog', 'special','datetime'];

    function editspecial(location, $rootScope, $state, dialog, special,datetime) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'editspecial';
        vm.sp = {};
        var spx = {}; //special as loaded
        var item = {};
        
        //Methods
        vm.displayCharLength = displayCharLength;
        vm.frequencySel = frequencySel;
        vm.showPreview = showPreview;
        vm.deleteSpecial = deleteSpecial;
        vm.goBack = goBack;
        vm.closeRank = closeRank;
        vm.header = $rootScope.canswer.name;

        vm.isEdit = false;
        vm.userIsOwner = $rootScope.userIsOwner;
        
         var fileUploadedListener = $rootScope.$on('fileUploaded', function (event, data){            
            console.log("Received fileUploaded", data);
            console.log('$state.current.name - ',$state.current.name);
            if ($state.current.name == 'editspecial') {
                console.log("loaded date to vm.imageURL");
                vm.imageURL = data;
            }
        });

        $scope.$on('$destroy',fileUploadedListener);

        activate();

        function activate() {

            if ($rootScope.specialmode == 'edit') {
                
                //Copy object without reference
                vm.sp = JSON.parse(JSON.stringify($rootScope.cspecial));
                spx = JSON.parse(JSON.stringify($rootScope.cspecial));
                datetime.formatdatetime(vm.sp);
                
                vm.isEdit = true;
                if (vm.sp.freq == 'onetime') frequencySel(1);
                if (vm.sp.freq == 'weekly') frequencySel(2);
                vm.sp.bc = vm.sp.bc;
                vm.sp.fc = vm.sp.fc;
                if (vm.sp.image != undefined) vm.imageURL = vm.sp.image;
                else vm.imageURL = $rootScope.EMPTY_IMAGE; 
                
            }

            if ($rootScope.specialmode == 'add') {

                vm.char = 25;
                vm.sp.fc = "hsl(0, 100%, 0%)"; //black
                vm.sp.bc = "hsl(0, 0%, 100%)"; //white
                frequencySel(1);
                vm.imageURL = $rootScope.EMPTY_IMAGE;
            }

            createTimeDropdown();

            console.log("editspecial page Loaded!");

        }

        function displayCharLength() {
            vm.char = 25 - vm.sp.stitle.length;
        }

        function frequencySel(x) {
            if (x == 1) {
                vm.weekly = false;
                vm.onetime = true;
                vm.sp.freq = 'onetime';
            }
            if (x == 2) {
                vm.weekly = true;
                vm.onetime = false;
                vm.sp.freq = 'weekly';
            }
        }

        function showPreview() {
            item = vm.sp;
            item.name = $rootScope.canswer.name;
            item.answer = $rootScope.canswer.id;
            item.image = vm.imageURL;
            item.freq = (vm.onetime ? 'onetime' : 'weekly');

            dialog.createSpecialPreview(item, addSpecial);

        }

        function addSpecial() {
            if (vm.sp.freq == 'onetime') {
                item.stime2 = null;
                item.etime2 = null;
            }
            if (vm.sp.freq == 'weekly') {
                item.stime = null; item.sdate = null;
                item.etime = null; item.edate = null;
            }
            if (vm.isEdit == false) {
                special.addSpecial(item).then(function(){
                    $state.go('specials');
                });
            }
            else {
                //update special
                var fields = [];
                var vals = [];
                console.log("spx, vm.sp", spx, vm.sp);

                if (spx.bc != vm.sp.bc) { fields.push('bc'); vals.push(vm.sp.bc); }
                if (spx.fc != vm.sp.fc) { fields.push('fc'); vals.push(vm.sp.fc); }
                if (spx.edate != vm.sp.edate) { fields.push('edate'); vals.push(vm.sp.edate); }
                if (spx.etime != vm.sp.etime) { fields.push('etime'); vals.push(vm.sp.etime); }
                if (spx.etime2 != vm.sp.etime2) { fields.push('etime2'); vals.push(vm.sp.etime2); }
                if (spx.sdate != vm.sp.sdate) { fields.push('sdate'); vals.push(vm.sp.sdate); }
                if (spx.stime != vm.sp.stime) { fields.push('stime'); vals.push(vm.sp.stime); }
                if (spx.stime2 != vm.sp.stime2) { fields.push('stime2'); vals.push(vm.sp.stime2); }
                if (spx.stitle != vm.sp.stitle) { fields.push('stitle'); vals.push(vm.sp.stitle); }
                if (spx.image != vm.imageURL) { fields.push('image'); vals.push(vm.imageURL); }
                if (spx.name != vm.sp.name) { fields.push('name'); vals.push(vm.sp.name); }
                if (spx.details != vm.sp.details) { fields.push('details'); vals.push(vm.sp.details); }
                if (spx.freq != vm.sp.freq) { fields.push('freq'); vals.push(vm.sp.freq); }
                if (spx.mon != vm.sp.mon) { fields.push('mon'); vals.push(vm.sp.mon); }
                if (spx.tue != vm.sp.tue) { fields.push('tue'); vals.push(vm.sp.tue); }
                if (spx.wed != vm.sp.wed) { fields.push('wed'); vals.push(vm.sp.wed); }
                if (spx.thu != vm.sp.thu) { fields.push('thu'); vals.push(vm.sp.thu); }
                if (spx.fri != vm.sp.fri) { fields.push('fri'); vals.push(vm.sp.fri); }
                if (spx.sat != vm.sp.sat) { fields.push('sat'); vals.push(vm.sp.sat); }
                if (spx.sun != vm.sp.sun) { fields.push('sun'); vals.push(vm.sp.sun); }

                console.log("fields, vals", fields, vals);
                special.updateSpecial(item.id, fields, vals).then(function(){
                    $state.go('specials');
                });
            }
            
        }
        
       function deleteSpecial() {
            special.deleteSpecial(vm.sp.id);
            $state.go('specials');
        }

        function goBack() {
            $state.go('specials');
        }

        function createTimeDropdown() {

            vm.timeDD = ["7:00 AM", "7:30 AM", "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
                "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM",
                "8:00 PM", "8:30 PM", "9:00 PM", "9:30 PM", "10:00 PM", "10:30 PM", "11:00 PM", "11:30 PM", "12:00 AM", "12:30 AM", "1:00 AM", "1:30 AM",
                "2:00 AM", "2:30 AM", "3:00 AM", "3:30 AM", "4:00 AM", "4:30 AM", "5:00 AM", "5:30 AM", "6:00 AM", "6:30 AM"];
        }
        
        function closeRank() {
               $state.go("answerDetail", { index: $rootScope.canswer.id });                              
        }
    }
})();

(function () {
    'use strict';

    angular
        .module('app')
        .controller('customer', customer);

    customer.$inject = ['$location', '$rootScope', '$state','answer','dialog','special'];

    function customer(location, $rootScope, $state, answer, dialog, special) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'customer';
        
        vm.selMainPhoto = 'active';
        vm.selSpecials = '';
        vm.selPhotoGallery = '';

        vm.goBack = goBack;
        vm.loadMainPhoto = loadMainPhoto;
        vm.loadSpecials = loadSpecials;
        vm.loadPhotoGallery = loadPhotoGallery;
        vm.selAnswer = selAnswer;
        
        //****Temp, need to create customer object when customer logs in ****//
        $rootScope.cust = {};
        $rootScope.cust.id = 1;
        //**********************************************************************           

       activate();

        function activate() {            

            //Load answers for this customer
            answer.getAnswerbyCustomer($rootScope.cust.id).then(function(response){
                $rootScope.custans = response.resource;
                console.log("Customer-Answer records: ", $rootScope.custans)
                //loadSpecialsObjects();
                displayAnswers();
            });  
                      
            console.log("customer page Loaded!");
            
        }
        
        function displayAnswers(){
           vm.answers = $rootScope.custans;
            
        }
        
        function selAnswer(x){
            $rootScope.cust.canswer = x.id;
            console.log("current answer ", x.id, x.name);
        }
        
        function loadMainPhoto() {            
            
            if ($rootScope.cust.canswer == undefined ) dialog.getDialog('selectBusiness');
            else $state.go('mainphoto');
            
        }
        function loadSpecials() {            

            if ($rootScope.cust.canswer == undefined ) dialog.getDialog('selectBusiness');
            else $state.go('specials');
            
        }
        function loadPhotoGallery() {            
            
            if ($rootScope.cust.canswer == undefined ) dialog.getDialog('selectBusiness');
            else $state.go('photogallery');
            
        }

        function goBack() {
            //if ($rootScope.cCategory.id == undefined) $state.go('rankSummary', { index: $rootScope.cCategory.id });
            //else $state.go('rankSummary', { index: 1 });
            $state.go('content');
        }

    }
})();

(function () {
    'use strict';

    angular
        .module('app')
        .factory('table', table);

    table.$inject = ['$http', '$q', '$rootScope','answer','$state'];

    function table($http, $q, $rootScope, answer, $state) {

        // Members
        var _tables = [];
        var baseURI = '/api/v2/mysql/_table/ranking';

        var service = {
            getTables: getTables,
            getTablesMain: getTablesMain,
            getTablesNonMain: getTablesNonMain,
            //getSingleTable: getSingleTable,
            update: update,
            addTable: addTable,
            addTableforAnswer: addTableforAnswer,
            deleteTable: deleteTable
        };

        return service;

        function getTables(forceRefresh) {

            if (_areTablesLoaded() && !forceRefresh) {

                return $q.when(_tables);
            }

            //var url = baseURI;
            //Get all match records
            var url0 = baseURI + '?offset=' + 0 * 1000;
            var url1 = baseURI + '?offset=' + 1 * 1000;
            var url2 = baseURI + '?offset=' + 2 * 1000;
            var url3 = baseURI + '?offset=' + 3 * 1000;
            var url4 = baseURI + '?offset=' + 4 * 1000;
            var url5 = baseURI + '?offset=' + 5 * 1000;
            var url6 = baseURI + '?offset=' + 6 * 1000;
            var url7 = baseURI + '?offset=' + 7 * 1000;

            var p0 = $http.get(url0);
            var p1 = $http.get(url1);
            var p2 = $http.get(url2);
            var p3 = $http.get(url3);
            var p4 = $http.get(url4);
            var p5 = $http.get(url5);
            var p6 = $http.get(url6);
            var p7 = $http.get(url7);

            return $q.all([p0, p1, p2, p3, p4, p5, p6, p7]).then(function (d){
                _tables = d[0].data.resource.concat(d[1].data.resource, d[2].data.resource, d[3].data.resource,
                  d[4].data.resource,  d[5].data.resource, d[6].data.resource, d[7].data.resource);
                if ($rootScope.DEBUG_MODE) console.log("tables length: ", _tables.length);
                return _tables;            
            }, _queryFailed);  
            //return $http.get(url).then(querySucceeded, _queryFailed);
            
            //function querySucceeded(d) {

                
                //return _tables = result.data.resource;
            //}          
        }

        function getTablesMain() {

            var url0 = baseURI + '/?filter=ismp=true';

            var p0 = $http.get(url0);
            
            return $q.all([p0]).then(function (d){
                _tables = d[0].data.resource;
                if ($rootScope.DEBUG_MODE) console.log("tables_main length: ", _tables.length);
                return _tables;            
            }, _queryFailed);  
                      
        }

        function getTablesNonMain() {
            
            //Get all match records
            var url0 = baseURI + '/?filter=ismp=false'+'&offset=' + 0 * 1000;
            var url1 = baseURI + '/?filter=ismp=false'+'&offset=' + 1 * 1000;
            var url2 = baseURI + '/?filter=ismp=false'+'&offset=' + 2 * 1000;
            var url3 = baseURI + '/?filter=ismp=false'+'&offset=' + 3 * 1000;
            var url4 = baseURI + '/?filter=ismp=false'+'&offset=' + 4 * 1000;
            var url5 = baseURI + '/?filter=ismp=false'+'&offset=' + 5 * 1000;
            var url6 = baseURI + '/?filter=ismp=false'+'&offset=' + 6 * 1000;
            var url7 = baseURI + '/?filter=ismp=false'+'&offset=' + 7 * 1000;
            
            var p0 = $http.get(url0);
            var p1 = $http.get(url1);
            var p2 = $http.get(url2);
            var p3 = $http.get(url3);
            var p4 = $http.get(url4);
            var p5 = $http.get(url5);
            var p6 = $http.get(url6);
            var p7 = $http.get(url7);

            return $q.all([p0, p1, p2, p3, p4, p5, p6, p7]).then(function (d){
                _tables = _tables.concat(d[0].data.resource, d[1].data.resource, d[2].data.resource, d[3].data.resource,
                  d[4].data.resource,  d[5].data.resource, d[6].data.resource, d[7].data.resource);
                if ($rootScope.DEBUG_MODE) console.log("tables length: ", _tables.length);
                return _tables;            
            }, _queryFailed);
                      
        }
/*
        function getSingleTable(id) {

            var url0 = baseURI + '/?filter=id=' + id;

            var p0 = $http.get(url0);
            
            return $q.all([p0]).then(function (d){
                
                _tables = d[0].data.resource;
                console.log("single table ", _tables);
                if ($rootScope.DEBUG_MODE) console.log("single table loaded: ", _tables.length);
                return _tables;            
            }, _queryFailed);  
                      
        }
*/

        function addTable(table) {
            
            table.isatomic = true;

            var url = baseURI;
            var resource = [];

            resource.push(table);

            return $http.post(url, resource, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: resource
            }).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                //update local copy
                var tablex = table;
                tablex.id = result.data.resource[0].id;
                _tables.push(tablex);

                if ($rootScope.DEBUG_MODE) console.log("result", result);
                return result.data;
            }

        }

        function addTableforAnswer(table,colors,answerid){
            table.isatomic = true;

            var url = baseURI;
            var resource = [];

            resource.push(table);

            return $http.post(url, resource, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: resource
            }).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                //update local copy
                var tablex = table;
                tablex.id = result.data.resource[0].id;
                _tables.push(tablex);

                //update answer
                var obj = {};
                obj.id = result.data.resource[0].id;
                obj.bc = colors[0];
                obj.fc = colors[1];
                var rankExists = false;
                var ranksStr = '';
                var ranks = [];
                //if there is already a rank
                if ($rootScope.canswer.ranks != undefined && $rootScope.canswer.ranks != null &&
                    $rootScope.canswer.ranks != '') {
                        console.log("there is already a rank");
                        ranksStr = $rootScope.canswer.ranks;
                        console.log("this is the existing string - ", ranksStr);
                        ranks = JSON.parse(ranksStr);
                        console.log("ranks", ranks);
                        ranks.push(obj);
                        ranksStr = JSON.stringify(ranks);
                        console.log("this is the new string - ", ranksStr);
                        answer.updateAnswer(answerid, ['ranks'], [ranksStr]);
                }
                //if this is rank #1
                else{
                    ranksStr = '[' + JSON.stringify(obj) +']';
                    console.log("this is the new string - ", ranksStr);
                    answer.updateAnswer(answerid, ['ranks'], [ranksStr]);
                }
                //$state.go('answerDetail',{index: answerid});
                if ($rootScope.DEBUG_MODE) console.log("result", result);
                return result.data;
            }
        }

        function deleteTable(table_id) {
           
            //form match record
            var obj = {};
            obj.resource = [];

            var data = {};
            data.id = table_id;

            obj.resource.push(data);

            var url = baseURI + '/' + table_id;
            
            //update (delete answer) local copy of answers
            var i = _tables.map(function (x) { return x.id; }).indexOf(table_id);
            if (i > -1) _tables.splice(i, 1);

            return $http.delete(url, data, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                if ($rootScope.DEBUG_MODE) console.log("Deleting table was succesful");
                return result.data;
            }
        }


        function update(id, field, val) {
           
            //form match record
            var obj = {};
            obj.resource = [];

            var data = {};
            data.id = id;

            for (var i = 0; i < field.length; i++) {
                switch (field[i]) {
                    case "views": data.views = val[i]; break;
                    case "answers": data.answers = val[i]; break;
                    case "title": data.title = val[i]; break;
                    case "tags": data.tags = val[i]; break;
                    case "keywords": data.keywords = val[i]; break;
                    case "type": data.type = val[i]; break;
                    case "question": data.question = val[i]; break;
                    case "image1url": data.image1url = val[i]; break;
                    case "image2url": data.image2url = val[i]; break;
                    case "image3url": data.image3url = val[i]; break;
                    case "answertags": data.answertags = val[i]; break;
                    case "isatomic": data.isatomic = val[i]; break;
                    case "catstr": data.catstr = val[i]; break;
                    case "numcom": data.numcom = val[i]; break;
                    case "ismp": data.ismp = val[i]; break;
                    case "fimage": data.fimage = val[i]; break;
                    case "bc": data.bc = val[i]; break;
                    case "fc": data.fc = val[i]; break;
                    case "shade": data.shade = val[i]; break;                    
                }
            }
            //console.log("data", data);
            obj.resource.push(data);

            var url = baseURI;
            
            //update local copy
            var idx = 0;
            for (var i = 0; i < $rootScope.content.length; i++) {
                if ($rootScope.content[i].id == id) {
                    idx = i;
                    break;
                }
            }
            for (var i = 0; i < field.length; i++) {
                switch (field[i]) {
                    case "answers": $rootScope.content[idx].answers = val[i]; break;
                    case "views": $rootScope.content[idx].views = val[i]; break;
                    case "title": $rootScope.content[idx].title = val[i]; break;
                    case "tags": $rootScope.content[idx].tags = val[i]; break;
                    case "keywords": $rootScope.content[idx].keywords = val[i]; break;
                    case "type": $rootScope.content[idx].type = val[i]; break;
                    case "question": $rootScope.content[idx].question = val[i]; break;
                    case "image1url": $rootScope.content[idx].image1url = val[i]; break;
                    case "image2url": $rootScope.content[idx].image2url = val[i]; break;
                    case "image3url": $rootScope.content[idx].image3url = val[i]; break;
                    case "answertags": $rootScope.content[idx].answertags = val[i]; break;
                    case "isatomic": $rootScope.content[idx].isatomic = val[i]; break;
                    case "catstr": $rootScope.content[idx].catstr = val[i]; break;
                    case "numcom": $rootScope.content[idx].numcom = val[i]; break;
                    case "ismp": $rootScope.content[idx].ismp = val[i]; break;
                    case "fimage": $rootScope.content[idx].fimage = val[i]; break;
                    case "bc": $rootScope.content[idx].bc = val[i]; break;
                    case "fc": $rootScope.content[idx].fc = val[i]; break;
                    case "shade": $rootScope.content[idx].shade = val[i]; break;                   
                }
            }

            return $http.patch(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                if ($rootScope.DEBUG_MODE) console.log("updating ranking record succesful");
                return result.data;
            }
        }

        function _areTablesLoaded() {

            return _tables.length > 0;
        }

        function _queryFailed(error) {

            throw error;
        }
    }
})();
(function () {
    'use strict';

    angular
        .module('app')
        .service('search', search);

    search.$inject = ['$rootScope'];

    function search($rootScope) {

        //Members

        var service = {

            searchRanks: searchRanks,
            searchAnswers: searchAnswers,
        };

        return service;

        function searchRanks() {

            //initialize tool variables 
            var rt = '';   //rank title 
            var ss = '';   //search string
            var inm = false;
            var rank = {};
            var tagCapitalized = '';
            var tagFirstLowered = '';
            var rankObj = {};
            var short = ['pb', 'ob', 'dt', 'mb'];
            var corrnh = ['Pacific Beach', 'Ocean Beach', 'Downtown', 'Mission Beach'];

            var nme = false;  //near me
            var rte = false;
            var rt_nme = false;
            var nhe = false;
            var results = [];

            var input = $rootScope.inputVal;
            
            if (input) {

                if (input.length >= 3) {

                var userIsTyping = false;
                var inputVal = input;


                //Check if user typed 'near me' conditions
                if (inputVal.indexOf('near me') > -1 ||
                    inputVal.indexOf('near') > -1 ||
                    inputVal.indexOf('close') > -1 ||
                    inputVal.indexOf('close to') > -1 ||
                    inputVal.indexOf('close to me') > -1) {
                    inm = true; //input has near me context
                    inputVal = inputVal.replace('near me', 'in San Diego');
                    inputVal = inputVal.replace('near', 'in San Diego');
                    inputVal = inputVal.replace('close to me', 'in San Diego');
                    inputVal = inputVal.replace('close to', 'in San Diego');
                    inputVal = inputVal.replace('close', 'in San Diego');
                }
                else {
                    inm = false;
                }

                //ignore user typed words such as 'best', 'top'
                if (inputVal.indexOf('best') > -1) inputVal = inputVal.replace('best', '');
                if (inputVal.indexOf('Best') > -1) inputVal = inputVal.replace('Best', '');
                if (inputVal.indexOf('top') > -1) inputVal = inputVal.replace('top', '');
                if (inputVal.indexOf('Top') > -1) inputVal = inputVal.replace('Top', '');
                if (inputVal == 'Food') inputVal = inputVal.replace('Food', 'Food Near Me');
                if (inputVal == 'food') inputVal = inputVal.replace('food', 'Food Near Me');

                //Special Cases
                if (inputVal == 'pho' || inputVal == 'Pho') {
                    inputVal = 'vietnamese';
                }

                if ($rootScope.isNh) inputVal = inputVal + ' ' + $rootScope.cnh;

                var results_nm = [];
                var results_ss = [];
                var results_rt = [];
                var results_rt_nm = [];
                var results_nh = [];

                var m_ss = true; //match in search string
                var m_rt = true; //match in title
                var m_nh = false; //reference to neighborhood
                var nh = ''; //neighborhood reference
                var sc = false; //special case

                
                    //vm.content = $rootScope.content;
                    var valTags = inputVal.split(" ");
                    for (var j = 0; j < $rootScope.content.length; j++) {
                        if ($rootScope.content[j].ismp) {
                            //console.log("ismp is true");
                            ss = $rootScope.searchStr[j]; //Search string
                            rt = $rootScope.content[j].title; // title
                            rank = $rootScope.content[j];

                            m_ss = true;
                            m_rt = true;
                            
                            //check that all tags exist
                            for (var k = 0; k < valTags.length; k++) {

                                tagCapitalized = valTags[k].charAt(0).toUpperCase() + valTags[k].slice(1);
                                tagFirstLowered = valTags[k].charAt(0).toLowerCase() + valTags[k].slice(1);

                                //look for input in whole search string
                                m_ss = m_ss &&
                                    (ss.indexOf(valTags[k]) > -1 ||
                                        ss.indexOf(valTags[k].toUpperCase()) > -1 ||
                                        ss.indexOf(tagCapitalized) > -1 ||
                                        ss.indexOf(tagFirstLowered) > -1);

                                //look for input in rank title only        
                                m_rt = m_rt &&
                                    (rt.indexOf(valTags[k]) > -1 ||
                                        rt.indexOf(valTags[k].toUpperCase()) > -1 ||
                                        rt.indexOf(tagCapitalized) > -1 ||
                                        rt.indexOf(tagFirstLowered) > -1);

                                //look if input makes reference to specific neighborhood
                                if (valTags[k].length >= 3) {
                                    for (var q = 0; q < $rootScope.allnh.length; q++) {
                                        if ($rootScope.allnh[q].indexOf(valTags[k]) > -1 ||
                                            $rootScope.allnh[q].indexOf(valTags[k].toUpperCase()) > -1 ||
                                            $rootScope.allnh[q].indexOf(tagCapitalized) > -1 ||
                                            $rootScope.allnh[q].indexOf(tagFirstLowered) > -1) {
                                            //console.log("found neighborhood!", $rootScope.allnh[q]);
                                            nh = $rootScope.allnh[q];
                                            m_nh = true;
                                        }
                                    }
                                }
                                //Special cases for neighborhoods
                                for (var q=0; q < short.length; q++) {
                                    if (short[q].indexOf(valTags[k]) > -1 ||
                                        short[q].indexOf(valTags[k].toUpperCase()) > -1 ||
                                        short[q].indexOf(tagCapitalized) > -1 ||
                                        short[q].indexOf(tagFirstLowered) > -1) {
                                        nh = corrnh[q];
                                        m_nh = true;
                                    }
                                }

                            }

                            if (m_rt && rank.tags.indexOf('isMP') > -1) {
                                results_rt.push($rootScope.content[j]);
                                rte = true;
                            }

                            else if (m_ss) {
                                if (inm) {
                                    if (rank.title.indexOf('in San Diego') > -1) {
                                        results_ss.push($rootScope.content[j]);
                                    }
                                }
                                else results_ss.push($rootScope.content[j]);
                            }
                        }
                    }

                    //Execute only if input made reference to neighborhood
                    if (m_nh){
                        var m = false;
                        for (var j = 0; j < $rootScope.content.length; j++) {
                            ss = $rootScope.searchStr[j]; //Search string
                            //check that all tags exist
                            m = true;
                            for (var k = 0; k < valTags.length; k++) {

                                tagCapitalized = valTags[k].charAt(0).toUpperCase() + valTags[k].slice(1);
                                tagFirstLowered = valTags[k].charAt(0).toLowerCase() + valTags[k].slice(1);

                                //look for input in whole search string
                                m = m &&
                                    (ss.indexOf(valTags[k]) > -1 ||
                                        ss.indexOf(valTags[k].toUpperCase()) > -1 ||
                                        ss.indexOf(tagCapitalized) > -1 ||
                                        ss.indexOf(tagFirstLowered) > -1);
                            }

                            if (m) {
                                results_nh.push($rootScope.content[j]);
                                nhe = true;
                            }
                        }
                    }

                    //look in results that match title, if includes 'San Diego', make
                    //corresponding 'close to me'
                    for (var k = 0; k < results_rt.length; k++) {
                        rt = results_rt[k].title; //Rank title
                        if (rt.indexOf('in San Diego') > -1 && results_rt[k].isatomic == false) {
                            rankObj = {};
                            rankObj = JSON.parse(JSON.stringify(results_rt[k]));
                            rankObj.title = rankObj.title.replace('in San Diego', 'close to me');
                            results_rt_nm.push(rankObj);
                            rt_nme = true;
                        }
                    }

                    //look in results that match search string, in includes 'San Diego', make
                    //corresponding 'close to me'
                    for (var k = 0; k < results.length; k++) {
                        rt = results[k].title; //Rank title
                        if (rt.indexOf('in San Diego') > -1 && results[k].isatomic == false) {
                            rankObj = {};
                            rankObj = JSON.parse(JSON.stringify(results[k]));
                            rankObj.title = rankObj.title.replace('in San Diego', 'close to me');
                            results_nm.push(rankObj);
                            nme = true;
                        }
                    }

                    if (nhe) results = results.concat(results_nh);
                    if (rt_nme) results = results.concat(results_rt_nm);
                    if (rte) results = results.concat(results_rt);
                    if (nme) results = results.concat(results_nm);
                    results = results.concat(results_ss);

                    //sort results, give priority to city ones
                    //function compare(a, b) {
                    //    return b.title.indexOf('in San Diego') - a.title.indexOf('in San Diego');
                    //}
                    //vm.results = vm.results.sort(compare);
                }

                else {
                    results = [];
                }
            }

            return results;

        }

        function searchAnswers() {

            //initialize tool variables
            var tagCapitalized = '';
            var tagFirstLowered = '';
            var results_ans = [];
            var input = $rootScope.inputVal;
            var m = false;
            var an = '';   //answer name
            
            if (input) {

                if (input.length >= 3) {

                    var userIsTyping = false;
                    var inputVal = input;
                    var valTags = inputVal.split(" ");

                    for (var j = 0; j < $rootScope.answers.length; j++) {

                        an = $rootScope.answers[j].name; // title
                        m = true;
                        
                        //check that all tags exist
                        for (var k = 0; k < valTags.length; k++) {

                            tagCapitalized = valTags[k].charAt(0).toUpperCase() + valTags[k].slice(1);
                            tagFirstLowered = valTags[k].charAt(0).toLowerCase() + valTags[k].slice(1);

                            //look for input in answer names
                            m = m &&
                               (an.indexOf(valTags[k]) > -1 ||
                                an.indexOf(valTags[k].toUpperCase()) > -1 ||
                                an.indexOf(tagCapitalized) > -1 ||
                                an.indexOf(tagFirstLowered) > -1);

                        }

                        if (m) {

                             if ($rootScope.isNh) {
                                 if ($rootScope.answers[j].cityarea == $rootScope.cnh){
                                        results_ans.push($rootScope.answers[j]);
                                 }
                             }
                            else results_ans.push($rootScope.answers[j]);
                        }

                    }
                }
            }

            return results_ans;

        }

    }
})();
(function () {
    'use strict';

    angular
        .module('app')
        .factory('rankofday', rankofday);

    rankofday.$inject = ['$http', '$q','$rootScope'];

    function rankofday($http, $q, $rootScope) {

        // Members
        var _rankofday = [];
        var _allranks = [];
        var baseURI = '/api/v2/mysql/_table/rankofday';

        var service = {
            getrankofday: getrankofday,
            getall: getall,
            update: update
        };

        return service;

        function getrankofday(forceRefresh) {

            //if (_arerankofdayLoaded() && !forceRefresh) {

            //    return $q.when(_rankofday);
            //}
            
             //get todays date
            var datenow = new Date();
            var tz = datenow.getTimezoneOffset();
            datenow.setMinutes( datenow.getMinutes() - tz);
            //var dateStr = datenow.toLocaleDateString();
            //var dateobj = new Date();
            //function pad(n) {return n < 10 ? "0"+n : n;}
            function pad(n) {return n < 10 ? n : n;}
            var dateStr = pad(datenow.getMonth()+1)+"/"+pad(datenow.getDate())+"/"+datenow.getFullYear();
            
            
            var url = baseURI + '/?filter=date='+ dateStr;

            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                return _rankofday = result.data.resource;
            }
        }

        function getall(){
            var url = baseURI;
            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                return _allranks = result.data.resource;
            }
        }

        function update(id, field, val) {
           
            //form match record
            var obj = {};
            obj.resource = [];

            var data = {};
            data.id = id;
            
            for (var i=0; i<field.length; i++){
                switch (field[i]){
                    case "introtext": data.introtext = val[i]; break;                    
                }
            }
            //console.log("data", data);
            obj.resource.push(data);

            var url = baseURI;
            
            //update local copy
            var idx = _allranks.map(function(x) {return x.id; }).indexOf(id);  
            for (var i=0; i<field.length; i++){
                switch (field[i]){
                    case "name": _allranks[idx].introtext = val[i]; break;                    
                }
            }                        
            
            return $http.patch(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {
                
                console.log("updating rank of day succesful");
                return result.data;
            }
        }
        
        function _arerankofdayLoaded() {

            return _rankofday.length > 0;
        }

        function _queryFailed(error) {

            throw error;
        }
    }
})();
(function () {
    'use strict';

    angular
        .module('app')
        .factory('pvisits', pvisits);

    pvisits.$inject = ['$http', '$q','$rootScope'];

    function pvisits($http, $q, $rootScope) {

        // Members
        var _pvisits = [];
        var baseURI = '/api/v2/mysql/_table/pvisits';

        var service = {
            getpvisits: getpvisits,
            postRec: postRec,
            patchRec: patchRec,
            deleteRec: deleteRec,
            
        };

        return service;

        function getpvisits(forceRefresh) {

            if (_arepvisitsLoaded() && !forceRefresh) {

                return $q.when(_pvisits);
            }

            var url = baseURI;

            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                return _pvisits = result.data.resource;
            }

        }
        
        function postRec(date) {
           
            //form match record
            var data = {};
            data.date = date;
			data.nvisits = 1;
             
            var obj = {};
            obj.resource = [];

            obj.resource.push(data);
            
            //update local copy
            _pvisits.push(data);
            
            var url = baseURI;

            return $http.post(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {
                
                 //update local copies
                var id = result.data.resource[0].id; 
                _pvisits[_pvisits.length-1].id = id;

                if ($rootScope.DEBUG_MODE) console.log("creating pvisits record was succesful");
                return result.data;
            }
        }
       
       function patchRec(rec_id, visits) {
            
            //form match record
            var obj = {};
            obj.resource = [];
                      
            var data={};
            data.id = rec_id;
            data.nvisits = visits;
            
            obj.resource.push(data); 
            
            var url = baseURI; 
                        
            return $http.patch(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                if ($rootScope.DEBUG_MODE) console.log("Updating pvisits record was succesful");
                return result.data;
            }
        }
        
        function deleteRec(rec_id) {
            
            //delete records from local copy
            for (var i=0; i<_pvisits.length;i++){
                if (_pvisits[i].id == rec_id){
                    _pvisits.splice(i,1);
                } 
            }
            
           var url = baseURI + '/' + rec_id; 
            
            return $http.delete(url).then(querySucceeded, _queryFailed);
            
            function querySucceeded(result) {
                if ($rootScope.DEBUG_MODE) console.log("Deleting user activity record was succesful");
                return result.data;
            }
        }
     
        function _arepvisitsLoaded() {

            return _pvisits.length > 0;
        }

        function _queryFailed(error) {

            throw error;
        }
    }
})();
(function () {
    'use strict';

    angular
        .module('app')
        .factory('headline', headline);

    headline.$inject = ['$http', '$q', '$rootScope'];

    function headline($http, $q, $rootScope) {

        // Members
        var _headlines = [];
        var baseURI = '/api/v2/mysql/_table/headlines';

        var service = {
            getheadlines: getheadlines,
			addheadline: addheadline,
            update: update,
        };

        return service;

        function getheadlines(forceRefresh) {

            if (_areheadlinesLoaded() && !forceRefresh) {

                return $q.when(_headlines);
            }

            //var url = baseURI;
            //Get all match records
            var url0 = baseURI + '?offset=' + 0 * 1000;
           
            var p0 = $http.get(url0);
            
            return $q.all([p0]).then(function (d){
                _headlines = d[0].data.resource;
                return _headlines;            
            }, _queryFailed);  

        }

        function addheadline(headline) {
            
            var url = baseURI;
            var resource = [];

            resource.push(headline);

            return $http.post(url, resource, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: resource
            }).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                //update local copy
                var headlinex = headline;
                headlinex.id = result.data.resource[0].id;
                _headlines.push(headlinex);

                console.log("result", result);
                return result.data;
            }

        }

        
        function update(id, field, val) {
           
            //form match record
            var obj = {};
            obj.resource = [];

            var data = {};
            data.id = id;

            for (var i = 0; i < field.length; i++) {
                switch (field[i]) {
                    case "city": data.city = val[i]; break;
                    case "nh": data.nh = val[i]; break;
                    case "title": data.title = val[i]; break;
                    case "filter": data.filter = val[i]; break;
                    case "bc": data.bc = val[i]; break;
                    case "fc": data.fc = val[i]; break;                                          
                }
            }
            //console.log("data", data);
            obj.resource.push(data);

            var url = baseURI;
            
            //update local copy
            var idx = _headlines.map(function(x) {return x.id; }).indexOf(id);  
            for (var i = 0; i < field.length; i++) {
                switch (field[i]) {
                    case "city": $rootScope.content[idx].city = val[i]; break;
                    case "nh": $rootScope.content[idx].nh = val[i]; break;
                    case "title": $rootScope.content[idx].title = val[i]; break; 
                    case "filter": $rootScope.content[idx].filter = val[i]; break;
                    case "bc": $rootScope.content[idx].bc = val[i]; break;
                    case "fc": $rootScope.content[idx].fc = val[i]; break;                                       
                }
            }

            return $http.patch(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                console.log("updating headlines succesful");
                return result.data;
            }
        }

        function _areheadlinesLoaded() {

            return _headlines.length > 0;
        }

        function _queryFailed(error) {

            throw error;
        }
    }
})();
(function () {
    'use strict';

    angular
        .module('app')
        .factory('dataloader', dataloader);

    dataloader.$inject = ['$http', '$q','$rootScope','pvisits', 
        'rankofday', 'answer', 'table', 'special', 'datetime', 'uaf', 'userdata',
        'matchrec', 'edit', 'useractivity', 'vrows', 'headline', 'cblock', 'catans'];

    function dataloader($http, $q, $rootScope, pvisits, 
        rankofday, answer, table, special, datetime, uaf, userdata,
        matchrec, edit, useractivity, vrows, headline, cblock, catans) {

        // Members
        var service = {
            gethomedata: gethomedata,
            getallranks: getallranks,
            //getthisrankdata: getthisrankdata,
            getallcblocks: getallcblocks,
            getrankdata: getrankdata,
            getanswerdata: getanswerdata,
            getpagevisitdata: getpagevisitdata,
        };

        return service;

        function gethomedata() {

            var p0 = table.getTablesMain();
            var p1 = headline.getheadlines();
            var p2 = cblock.getcblocksmain();
            var p3 = rankofday.getrankofday();
            var p4 = uaf.getactions();

            userdata.loadUserData();        //load user data (votes and activities)
            userdata.loadUserAccount();     //load user business account

            //Minimum Data for Cwrapper
            return $q.all([p0, p1, p2, p3, p4]).then(function (d) {
            
                $rootScope.content = d[0];
                $rootScope.headlines = d[1];
                $rootScope.cblocks = d[2];
                $rootScope.rankofday = d[3];
                $rootScope.uafs = d[4];

                $rootScope.pageDataLoaded = true;
                //loadingDone();
                if ($rootScope.DEBUG_MODE) console.log("cwrapper data ready!");
                $rootScope.$emit('homeDataLoaded');

            });
        }

        function getallranks(){
            
            var p0 = table.getTablesNonMain();      //Get ranks that are non main page, load them on the background

            //Minimum Data for Cwrapper
            return $q.all([p0]).then(function (d) {
            
                $rootScope.content = d[0];
                $rootScope.allRanksLoaded = true;
                createSearchStrings();
                //loadingDone();
                if ($rootScope.DEBUG_MODE) console.log("all ranks data ready!");
                //$rootScope.$emit('homeDataLoaded');

            });
        }

        function getallcblocks(){
            
            var p0 = cblock.getcblocksall();      //Get ranks that are non main page, load them on the background

            //Minimum Data for Cwrapper
            return $q.all([p0]).then(function (d) {
            
                $rootScope.cblocks = d[0];
                $rootScope.allCblocksLoaded = true;
                
                if ($rootScope.DEBUG_MODE) console.log("all cblocks ready!");
                //$rootScope.$emit('homeDataLoaded');
            });
        }

        function getrankdata() {

            // Requirement for rankSummary
            var q0 = answer.getAnswers();
            var q1 = special.getSpecials();
            var q2 = matchrec.GetMatchTable();
            var q3 = useractivity.getAllUserActivity();
            var q4 = catans.getAllcatans();

            return $q.all([q0, q1, q2, q3, q4]).then(function (d) {
            
                $rootScope.answers = d[0];
                $rootScope.specials = d[1];
                $rootScope.mrecs = d[2];
                $rootScope.alluseractivity = d[3];
                $rootScope.catansrecs = d[4];
                
                $rootScope.rankSummaryDataLoaded = true;
                getEstablishmentAnswers();
                if ($rootScope.DEBUG_MODE) console.log("rankSummary data ready!");
                $rootScope.$emit('rankDataLoaded');

            });
        }

        function getanswerdata(){

            //Requirement for answerDetail
            var r0 = edit.getEdits();
            var r1 = vrows.getAllvrows();
            
            return $q.all([r0, r1]).then(function (d) {
                
                $rootScope.edits = d[0];
                $rootScope.cvrows = d[1];
                
                $rootScope.answerDetailLoaded = true;
                if ($rootScope.DEBUG_MODE) console.log("answerdetail data ready!");
                $rootScope.$emit('answerDataLoaded');

            });   
        }

        function getpagevisitdata(){

            //Not required for anything, just statistic, page visit counter
            var s0 = pvisits.getpvisits();
            return $q.all([s0]).then(function (d) {
                
                $rootScope.pvisits = d[0];
                updatePageVisits();
                if ($rootScope.DEBUG_MODE) console.log("page visits data ready!");
                
            });      
        }

        /*
        function getthisrankdata(category){
            var p0 = table.getSingleTable(category);
            return $q.all([p0]).then(function (d) {
                
                $rootScope.content = d[0];
                if ($rootScope.DEBUG_MODE) console.log("loaded single table!");

                var catansarr = [];
                if ($rootScope.content[0].isatomic == true){
                    catansarr = [category];
                }
                else catansarr = $rootScope.content[0].catstr.split(':').map(Number);
                console.log("catansarr - ",catansarr);
                var s0 = catans.getbyCategory(catansarr);
                
            });
        }*/

        function updatePageVisits() {
            //get todays date
            var datenow = new Date();
            var tz = datenow.getTimezoneOffset();

            datenow.setMinutes(datenow.getMinutes() - tz);

            //var dateStr = datenow.toLocaleDateString();
            function pad(n) { return n < 10 ? n : n; }
            var dateStr = pad(datenow.getMonth() + 1) + "/" + pad(datenow.getDate()) + "/" + datenow.getFullYear();

            //console.log('Date Str: ', dateStr);
            var newDate = true;
            var pvisitrec = {};
            for (var i = 0; i < $rootScope.pvisits.length; i++) {
                if ($rootScope.pvisits[i].date == dateStr) {
                    newDate = false;
                    pvisitrec = $rootScope.pvisits[i];
                    break;
                }
            }
            if (newDate) pvisits.postRec(dateStr);
            else pvisits.patchRec(pvisitrec.id, pvisitrec.nvisits + 1);

            $rootScope.dateToday = dateStr;
            $rootScope.dateTodayNum = datetime.date2number(dateStr);
        }

        function getEstablishmentAnswers() {
            $rootScope.estAnswers = [];
            $rootScope.estNames = [];
            $rootScope.pplAnswers = [];
            $rootScope.pplNames = [];
            $rootScope.plaAnswers = [];
            $rootScope.plaNames = [];
            for (var i = 0; i < $rootScope.answers.length; i++) {
                if ($rootScope.answers[i].type == 'Establishment') {
                    $rootScope.estNames.push($rootScope.answers[i].name);
                    $rootScope.estAnswers.push($rootScope.answers[i]);
                }
                if ($rootScope.answers[i].type == 'Person') {
                    $rootScope.pplNames.push($rootScope.answers[i].name);
                    $rootScope.pplAnswers.push($rootScope.answers[i]);
                }
                if ($rootScope.answers[i].type == 'Place') {
                    $rootScope.plaNames.push($rootScope.answers[i].name);
                    $rootScope.plaAnswers.push($rootScope.answers[i]);
                }
            }
        }

        function createSearchStrings(){
            $rootScope.searchStr = [];
            //Create seach strings combination of tags, title and answers            
            for (var i = 0; i < $rootScope.content.length; i++) {                
                //Create single string for search
                //$rootScope.searchStr[i] = $rootScope.content[i].tags + " " + $rootScope.content[i].title + " " + $rootScope.content[i].answertags;
                $rootScope.searchStr[i] = $rootScope.content[i].tags + " " + $rootScope.content[i].title;
            
            }
        }

    }
})();
(function () {
    'use strict';

    angular
        .module('app')
        .factory('cblock', cblock);

    cblock.$inject = ['$http', '$q', '$rootScope'];

    function cblock($http, $q, $rootScope) {

        // Members
        var _cblocks = [];
        var baseURI = '/api/v2/mysql/_table/cblocks';

        var service = {
            getcblocks: getcblocks,
            getcblocksmain: getcblocksmain,
			getcblocksall: getcblocksall,
            addcblock: addcblock,
            update: update,
            deleteRec: deleteRec
        };

        return service;

        function getcblocks(forceRefresh) {

            if (_arecblocksLoaded() && !forceRefresh) {

                return $q.when(_cblocks);
            }

            //var url = baseURI;
            //Get all match records
            var url0 = baseURI + '?offset=' + 0 * 1000;
           //var url0 = baseURI + '/?filter=scope=city';

            var p0 = $http.get(url0);
            
            return $q.all([p0]).then(function (d){
                _cblocks = d[0].data.resource;
                if ($rootScope.DEBUG_MODE) console.log("No. C-Blocks: ", _cblocks.length);
                return _cblocks;            
            }, _queryFailed);  

        }

        function getcblocksmain() {

            //Get all match records
            var url0 = baseURI + '/?filter=ismp=true';
           //var url0 = baseURI + '/?filter=scope=city';

            var p0 = $http.get(url0);
            
            return $q.all([p0]).then(function (d){
                _cblocks = d[0].data.resource;
                if ($rootScope.DEBUG_MODE) console.log("No. C-Blocks: ", _cblocks.length);
                return _cblocks;            
            }, _queryFailed);  

        }

        function getcblocksall() {

            //Get all match records
            var url0 = baseURI + '/?filter=ismp=false';
           //var url0 = baseURI + '/?filter=scope=city';

            var p0 = $http.get(url0);
            
            return $q.all([p0]).then(function (d){
                _cblocks = _cblocks.concat(d[0].data.resource);
                if ($rootScope.DEBUG_MODE) console.log("No. C-Blocks: ", _cblocks.length);
                return _cblocks;            
            }, _queryFailed);  

        }

        function addcblock(cblock) {
            
            var url = baseURI;
            var resource = [];

            resource.push(cblock);

            return $http.post(url, resource, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: resource
            }).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                //update local copy
                var cblockx = cblock;
                cblockx.id = result.data.resource[0].id;
                _cblocks.push(cblockx);

                console.log("adding cblock succesful", result);
                return result.data;
            }

        }

        
        function update(id, field, val) {
           
            //form match record
            var obj = {};
            obj.resource = [];

            var data = {};
            data.id = id;

            for (var i = 0; i < field.length; i++) {
                switch (field[i]) {
                    case "catstr": data.catstr = val[i]; break;
                    case "ismp": data.ismp = val[i]; break;                                          
                }
            }
            //console.log("data", data);
            obj.resource.push(data);

            var url = baseURI;
            
            //update local copy
            var idx = _cblocks.map(function(x) {return x.id; }).indexOf(id);  
            for (var i = 0; i < field.length; i++) {
                switch (field[i]) {
                    case "catstr": _cblocks[idx].catstr = val[i]; break;
                    case "ismp": _cblocks[idx].ismp = val[i]; break;                                    
                }
            }

            return $http.patch(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                console.log("updating cblocks succesful");
                return result.data;
            }
        }
        
        function deleteRec(block_id) {
           
            //form match record
            var obj = {};
            obj.resource = [];

            var data = {};
            data.id = block_id;

            obj.resource.push(data);

            var url = baseURI + '/' + block_id;
            
            //update (delete answer) local copy of answers
            var i = _cblocks.map(function (x) { return x.id; }).indexOf(block_id);
            if (i > -1) _cblocks.splice(i, 1);

            return $http.delete(url, data, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                console.log("Deleting cblock was succesful");
                return result.data;
            }
        }

        function _arecblocksLoaded() {

            return _cblocks.length > 0;
        }

        function _queryFailed(error) {

            throw error;
        }
    }
})();
angular.module('app').directive('searchBlock', ['$rootScope', '$state', 'search',function ($rootScope, $state, search) {
    'use strict';

    return {
        templateUrl: 'app/content/partials/search-block.html',
        transclude: true,
        scope: {},
        controller: ['$scope',
            
            function contentCtrl($scope) {
 
            }], //end controller
        link: function (scope) {
            scope.rankSel = function (x,nm) {
                if (nm) $rootScope.rankIsNearMe = true;
                else $rootScope.rankIsNearMe = false;
                if ($rootScope.editMode) $state.go('editRanking', { index: x.id });
                else {
                    $state.go('rankSummary', { index: x.id });
                }
            };
            scope.ansSel = function (x) {
                $rootScope.cCategory = undefined;
                $state.go('answerDetail', { index: x.id });                
            };

            scope.resRanks = [];
            scope.resAnswers = [];
            scope.maxRes = 4000;

            var searchListener = $rootScope.$on('getResults', function (e) {
                    scope.getResults();
            });

                //Filter content based on user input
                scope.getResults = function() {

                    scope.resRanks = [];
                    scope.resRanks = search.searchRanks();
                    scope.resAnswers = [];
                    scope.resAnswers = search.searchAnswers();
                    for (var i=0; i<scope.resAnswers.length; i++){
                        if (scope.resAnswers[i].type == 'Establishment') scope.resAnswers[i].icon = 'fa fa-building-o';
                        if (scope.resAnswers[i].type == 'Person' || scope.resAnswers[i].type == 'PersonCust') scope.resAnswers[i].icon = 'fa fa-male';
                        if (scope.resAnswers[i].type == 'Short-Phrase') scope.resAnswers[i].icon = 'fa fa-comment-o';
                        if (scope.resAnswers[i].type == 'Event') scope.resAnswers[i].icon = 'fa fa-calendar-o';
                        if (scope.resAnswers[i].type == 'Organization') scope.resAnswers[i].icon = 'fa fa-trademark'; 
                    }                   
                }

            scope.$on('$destroy', searchListener);            
        },
    }
}
    /*angular.module('app').directive('contentBlock', function() {
        */
]);
angular.module('app').directive('contentBlock', 
    ['$rootScope', '$state', 'answer', 'table', 'catans', '$timeout', 'vrows','$window','cblock','color','search',
    function ($rootScope, $state, answer, table, catans, $timeout, vrows, $window, cblock, color, search) {
    'use strict';

    return {
        templateUrl: 'app/content/partials/content-block.html',
        transclude: true,
        scope: {
            modType: '@type',
            isDynamic: '=dynamic',
            isRoW: '=rankofweek',
            updateView: '&updateView'
        },
        controller: ['$scope', 'query', '$http', 'answer', 'table', 'catans', '$timeout', 'vrows','$window','cblock','color','search',
            
            function contentCtrl($scope, query, $http, answer, table, catans, $timeout, vrows, $window, cblock, color, search) {
                var vm = $scope;
                vm.title = 'mycontent';

                vm.sm = $rootScope.sm;
                
                vm.maxRes = 4;

                vm.btext = 'see more';
                var strlen_o = 0;

                //Adjust picture size for very small displays
                if ($window.innerWidth < 768) vm.thumbheight = '80px';
                if ($window.innerWidth >= 768 && $window.innerWidth < 992) vm.thumbheight = '100px';
                if ($window.innerWidth >= 992 && $window.innerWidth < 1200) vm.thumbheight = '80px';
                if ($window.innerWidth > 1200) vm.thumbheight = '100px';
 
            }], //end controller
        link: function (scope) {

            if (scope.isDestroyed == undefined){
                    if (scope.modType == 'rankofweek') getRankofDay();
                    else loadContent();
            }
           
            var loadNhListener = $rootScope.$on('loadNh', function (e) {
                    if (scope.modType == 'rankofweek') getRankofDay();
                    else loadContent();
                });

             var applyRuleListener = $rootScope.$on('applyRule', function (e) {
                    applyRule();
                });
            
            function getRankofDay(){
                    //Clear images:
                    scope.image1 = "/assets/images/noimage.jpg";
                    scope.image2 = "/assets/images/noimage.jpg";
                    scope.image3 = "/assets/images/noimage.jpg";
                    scope.isShortPhrase = false;
                
                    //load colors and headline
                    for (var i = 0; i < $rootScope.headlines.length; i++) {
                        if ($rootScope.headlines[i].type == scope.modType) {
                            scope.bgc = $rootScope.headlines[i].bc;
                            scope.bgc2 = color.shadeColor(scope.bgc,0.5);
                            scope.fc = $rootScope.headlines[i].fc;
                            scope.headline = $rootScope.headlines[i].title;
                            break;
                        }
                    }

                    if ($rootScope.DEBUG_MODE) console.log("rankofday - ", $rootScope.rankofday[0]);

                    var searchVal = '';
                    var rt = '';
                    
                    //$rootScope.rankofday[0].main = 'Women\'s March';
                    if ($rootScope.isCity) searchVal = $rootScope.rankofday[0].main;
                    if ($rootScope.isNh) searchVal = $rootScope.rankofday[0].nh + ' ' + $rootScope.cnh;

                    scope.results = [];
                    //scope.content = $rootScope.content;
                    var valTags = searchVal.split(" ");

                    if ($rootScope.DEBUG_MODE) console.log("valTags _ ", valTags);

                    for (var j = 0; j < $rootScope.content.length; j++) {
                        //for (var j = 50; j < 60; j++) {
                        var r = true;
                        rt = $rootScope.content[j].title;
                        //check that all tags exist
                        for (var k = 0; k < valTags.length; k++) {
                            var tagCapitalized = valTags[k].charAt(0).toUpperCase() + valTags[k].slice(1);
                            var tagFirstLowered = valTags[k].charAt(0).toLowerCase() + valTags[k].slice(1);
                            /*
                            r = r && (rt.includes(valTags[k]) || rt.includes(valTags[k].toUpperCase()) || rt.includes(tagCapitalized) || rt.includes(tagFirstLowered));
                            */
                            r = r && ((rt.indexOf(valTags[k]) > -1) || (rt.indexOf(valTags[k].toUpperCase()) > -1) ||
                                (rt.indexOf(tagCapitalized) > -1) || (rt.indexOf(tagFirstLowered) > -1));

                        }
                        if (r) {
                            scope.results.push($rootScope.content[j]);
                            break;
                        }
                    }
                       
                    //Check if photos exist for Rank of Week
                    if (scope.results.length > 0 && scope.results[0] != undefined) {
                        if (scope.results[0].image1url != undefined) scope.image1 = scope.results[0].image1url;
                        if (scope.results[0].image2url != undefined) scope.image2 = scope.results[0].image2url;
                        if (scope.results[0].image3url != undefined) scope.image3 = scope.results[0].image3url;
                    }
                    
                    //Check if results is Short-Phrase
                    if (scope.results[0].type == 'Short-Phrase'){
                        
                        scope.isShortPhrase = true;
                        
                        var sPVals1 = scope.image1.split("##");
                        scope.title1=sPVals1[0];
                        scope.addinfo1 =sPVals1[1];
                        
                        var sPVals2 = scope.image2.split("##");
                        scope.title2=sPVals2[0];
                        scope.addinfo2=sPVals2[1];
                        
                        var sPVals3 = scope.image3.split("##");
                        scope.title3=sPVals3[0];
                        scope.addinfo3 =sPVals3[1];                        
                    }
                    
                    scope.rankOfDay = scope.results[0].title;

                    var colors = color.defaultRankColor(scope.results[0]);
                    scope.rdbc = colors[0];
                    scope.rdfc = colors[1];
                    
                    scope.rdbc2 = color.shadeColor(scope.rdbc,0.4);
                }

                //load content based on mode
                function loadContent() {

                    var catstr = '';
                    var idxs = [];
                    var nidx = 0;
                    var rankid = 0;
                    scope.results = [];
                    var bFound = false;

                    //load colors and headline
                    for (var i = 0; i < $rootScope.headlines.length; i++) {
                        if ($rootScope.headlines[i].type == scope.modType) {
                            scope.bgc = $rootScope.headlines[i].bc;
                            scope.bgc2 = color.shadeColor(scope.bgc,0.3);
                            scope.fc = $rootScope.headlines[i].fc;
                            scope.headline = $rootScope.headlines[i].title;
                            if ($rootScope.isNh &&
                                $rootScope.headlines[i].type != 'rxfeedback' &&
                                $rootScope.headlines[i].type != 'rxsuggestion') scope.headline = scope.headline + ' - ' + $rootScope.cnh;
                            break;
                        }
                    }
                
                    //load content 
                    for (var i = 0; i < $rootScope.cblocks.length; i++) {
                        if (($rootScope.cblocks[i].scope == 'city' && $rootScope.isCity) &&
                            ($rootScope.cblocks[i].type == scope.modType)) {
                            catstr = $rootScope.cblocks[i].catstr;
                            idxs = catstr.split(':');
                            shuffle(idxs);
                            for (var j = 0; j < idxs.length; j++) {
                                nidx = $rootScope.content.map(function(x) {return x.id; }).indexOf(Number(idxs[j]));
                                scope.results.push($rootScope.content[nidx]);
                            }
                            bFound = true;
                            break;
                        }

                        else if (($rootScope.cblocks[i].scope == 'nh' && $rootScope.isNh) &&
                            ($rootScope.cblocks[i].type == scope.modType) &&
                            ($rootScope.cblocks[i].scopename == $rootScope.cnh)) {
                            catstr = $rootScope.cblocks[i].catstr;
                            idxs = catstr.split(':');
                            shuffle(idxs);

                            for (var j = 0; j < idxs.length; j++) {
                                nidx = $rootScope.content.map(function(x) {return x.id; }).indexOf(Number(idxs[j])); 
                                scope.results.push($rootScope.content[nidx]);
                            }
                            bFound = true;
                            break;
                        }
                        else if ($rootScope.cblocks[i].scope == 'rx' && $rootScope.cblocks[i].type == scope.modType &&
                            $rootScope.cblocks[i].scopename == 'RankX') {
                            catstr = $rootScope.cblocks[i].catstr;
                            idxs = catstr.split(':');
                            for (var j = 0; j < idxs.length; j++) {
                                //scope.results.push($rootScope.content[idxs[j]]);
                                nidx = $rootScope.content.map(function(x) {return x.id; }).indexOf(Number(idxs[j])); 
                                scope.results.push($rootScope.content[nidx]);
                            }
                            bFound = true;
                            break;
                        }
                    }

                    //resLT6 is used to hide the <<see more>> choice
                    if (scope.results.length <= 6) scope.resLT6 = true;
                    else scope.resLT6 = false;

                    var resGT0 = (scope.results[0] != undefined);
                    scope.updateView(bFound && resGT0);

                    if (bFound && resGT0) scope.hideme = false;
                    else scope.hideme = true;
                    //
                    scope.resultsTop = [];
                    var resObj = {};
                    //var M = scope.results.length > 2 ? 3:scope.results.length;
                    var M = scope.results.length;
                    if (M > 0) {
                        for (var n = 0; n < M; n++) {
                            resObj = {};
                            resObj = JSON.parse(JSON.stringify(scope.results[n]));

                            //Set only ranks with good images on front-page
                            if (scope.results[n].image1url != $rootScope.EMPTY_IMAGE && 
                                scope.results[n].image1url != undefined &&
                                scope.results[n].image1url != ''){
                                editTitle(resObj);
                                parseShortAnswer(resObj);
                                scope.resultsTop.push(resObj);
                            }
                            else {
                                //shift up results, move rank with bad images to end of array
                                for (var m = n; m < M-1; m++){
                                    scope.results[m] = scope.results[m+1]; 
                                }
                                scope.results[M-1] = resObj;
                            }
                            if (scope.resultsTop.length > 2 || scope.resultsTop.length == M ) {
                                scope.results = scope.results.slice(scope.resultsTop.length+1);
                                break;
                            }
                        }
                        //scope.results = scope.results.slice(M+1);
                    }                    
                }

            function shuffle(array) {
                    var currentIndex = array.length, temporaryValue, randomIndex;

                    // While there remain elements to shuffle...
                    while (0 !== currentIndex) {

                        // Pick a remaining element...
                        randomIndex = Math.floor(Math.random() * currentIndex);
                        currentIndex -= 1;

                        // And swap it with the current element.
                        temporaryValue = array[currentIndex];
                        array[currentIndex] = array[randomIndex];
                        array[randomIndex] = temporaryValue;
                    }

                    return array;
                }

             function editTitle(x){
                    x.titlex = x.title.replace(' in San Diego','');
                    if (x.answers == 0 && x.type != 'Short-Phrase') x.image1url = "../../../assets/images/noimage.jpg";
                }

                function parseShortAnswer(x) {
                    //Check if results is Short-Phrase
                    if (x.type == 'Short-Phrase') {

                        x.isShortPhrase = true;
                        if (x.image1url != undefined) {
                            var sPVals1 = x.image1url.split("##");
                            x.title1 = sPVals1[0];
                            x.addinfo1 = sPVals1[1];
                        }
                        if (x.image2url != undefined) {
                            var sPVals2 = x.image2url.split("##");
                            x.title2 = sPVals2[0];
                            x.addinfo2 = sPVals2[1];
                        }
                        if (x.image3url != undefined) {
                            var sPVals3 = x.image3url.split("##");
                            x.title3 = sPVals3[0];
                            x.addinfo3 = sPVals3[1];
                        }
                    }
                }             

            scope.rankSel = function (x,nm) {
                if (nm) $rootScope.rankIsNearMe = true;
                else $rootScope.rankIsNearMe = false;
                if ($rootScope.editMode) $state.go('editRanking', { index: x.id });
                else {
                    $state.go('rankSummary', { index: x.id });
                }
            };
            scope.seeMore = function (maxRes, btext) {
                if (scope.maxRes == 4) {
                    scope.btext = 'see less';
                    scope.maxRes = 100;
                }
                else {
                    scope.btext = 'see more';
                    scope.maxRes = 4;
                }
                // scope.loadContent();
            }
            scope.updateView = function (bFound) {
                if (bFound) scope.hideme = false;
                else scope.hideme = true;
            }

            scope.$on('$destroy', loadNhListener); 
            scope.$on('$destroy', applyRuleListener);
            //scope.$on('$destroy', loadBlocksListener);
            scope.$on('$destroy',function(){
                scope.isDestroyed = true;
            });

            var applyRuleDone = false;
                var midx = 0;
                function applyRule() {
                    console.log("apply Rule");
                    // $rootScope.$emit('getLocation');   
            
                    /*//  1.Use this code to get GPS location for alls answers starting at index $rootScope.answeridxgp
                         
                      var fa='';
                      var lat=0;
                      var lng=0;
                      
                      var API_KEY = 'AIzaSyC2gAzj80m1XpaagvunSDPgEvOCleNNe5A';
                      var APP_API_KEY = '7e9a54a80a6ae850bc38ff768d75e143e75c273d1f7e2f265648020bf8c42a3b';
                      var cAnswer = {};
                      var url = '';
                      var myLoc = '';
                      
                      delete $http.defaults.headers.common['X-Dreamfactory-API-Key'];
                      
                      cAnswer = $rootScope.answers[$rootScope.answeridxgps];
                      
                      //console.log("cAnswer",cAnswer);
                      
                      if (cAnswer.type == 'Establishment' && (cAnswer.location != undefined && cAnswer.location != "" && cAnswer.location != null)){
                          //if ($rootScope.answers[i].id == 190){
                              //cAnswer = $rootScope.answers[i];
                              console.log("answer: ",$rootScope.answeridxgps, " location: ", cAnswer.location);
                              if (cAnswer.location.includes('San Diego') == false) {
                                  myLoc = cAnswer.location + ' San Diego, CA';
                              }
                              else myLoc = cAnswer.location;
                              
                              url = 'https://maps.googleapis.com/maps/api/geocode/json?address='+ myLoc +'&key='+API_KEY;
                              
                              $http.get(url,{},{
                              headers: {
                                  'Content-Type': 'multipart/form-data'
                                  //'Access-Control-Allow-Headers': 'x-dreamfactory-api-key'
                               }
                          }).then(function(result){
                              //console.log("google response:---", result);
                              fa = result.data.results[0].formatted_address;
                              lat = result.data.results[0].geometry.location.lat;
                              lng = result.data.results[0].geometry.location.lng;
                              console.log("fa - lat - lon", fa, lat, lng);
                              
                              $http.defaults.headers.common['X-Dreamfactory-API-Key'] = APP_API_KEY;
                              answer.updateAnswer(cAnswer.id,['lat','lng','location'],[lat,lng,fa]);
                              
                              if ($rootScope.answeridxgps < ($rootScope.answers.length-1)){
                                      $rootScope.answeridxgps = $rootScope.answeridxgps + 1; 
                                      $rootScope.$emit('applyRule');
                                  }
                              
                          });    
                      }
                      else{
                          if ($rootScope.answeridxgps < ($rootScope.answers.length-2)){
                              $rootScope.answeridxgps = $rootScope.answeridxgps + 1; 
                              $rootScope.$emit('applyRule');
                          }
                      }    
                      *///End of 1    
        
        
                    /*//  2. Use this to add/remove a tag from a rank 
                    for (var i=0; i < vm.results.length; i++){
                        if (vm.results[i].title.includes("Greek")){
                            var tags = vm.results[i].tags + ' gyros baklava';
                            //var tags = vm.results[i].tags.replace('lifestyle','');
                            //var newtype = 'Event';
                            table.update(vm.results[i].id, ['tags'],[tags]);    
                        }            
                    } 
                    *///End of 2
        
                    /*//  3.Use this to correct the title of a group of ranks
                    for (var i=0; i < vm.results.length; i++){
                        if (vm.results[i].title.includes('Dry cleaners')) {
                            var titlex = vm.results[i].title.replace("Dry cleaners","Dry cleaners and tailors");
                            //var tagsx = vm.resultsT[i].tags.replace("tea","coffee shops internet tea quiet");
                            //console.log("tags ", tags);
                            table.update(vm.results[i].id, ['title'],[titlex]);
                        }
                    } 
                    */ //End of 3
            
                    /*//  4.Use this to add a neighborhood
                    //var nhs = ["Columbia", "Core", "Cortez Hill", "East Village", "Gaslamp Quarter", "Horton Plaza", "Little Italy",
                      //      "Marina", "Seaport Village"];
                    //var nhs = ["Torrey Pines", "Carmel Valley", "Miramar",
                    //"Kearny Mesa","Bankers HIll","Rancho Penasquitos",
                    //        "Sorrento Valley","Tierra Santa","Logan Heights","Serra Mesa","Normal Heights","Talmadge",
                    //        "Bird Rock","South San Diego","North City","San Carlos","Del Cerro"];
                    var nhs = ["Mission Beach"];
                    
                    var logi = 1;
                    var basetitle = '';
                    if (applyRuleDone == false){
                    //for (var i=0; i < vm.results.length; i++){
                        
                    for (var i=0; i < $rootScope.content.length; i++){
                          
                          if ($rootScope.content[i].title.includes('Hillcrest')){
                              
                          basetitle = $rootScope.content[i].title;
                        //basetitle = vm.results[i].title;
                        //Copy object without reference
                        //var tablex = JSON.parse(JSON.stringify(vm.results[i]));
                        
                        var tablex = JSON.parse(JSON.stringify($rootScope.content[i]));
                        tablex.id = undefined;
                        tablex.views = 0;
                        tablex.answers = 0;
                        tablex.answertags = '';
                        tablex.image1url = '';
                        tablex.image2url = '';
                        tablex.image3url = '';
                        var newtitle = '';
                        
                        //if (tablex.title.includes("in Hillcrest")){
                            //for (var j=0; j<nhs.length; j++){
                                newtitle = basetitle.replace("Hillcrest", nhs[midx]);
                                tablex.title = newtitle;                            
                                table.addTable(tablex);
                                //console.log(midx, " - ", tablex.title);
                                //console.log("log idx: ",logi++);
                                //table.update($rootScope.content[i].id,['image1url','image2url','image3url'],
                                //['','','']);
                            }
                        //}
                    }
                        
                    $timeout(function () {
                        //$state.go('rankSummary', { index: $rootScope.content[midx].id });
                        //$state.go('rankSummary', { index: 74 });
                        midx++;
                        //console.log("midx - ", midx);
                        $rootScope.$emit('applyRule');
                    }, 5000);
                    if (midx >= nhs.length-1) applyRuleDone = true;
                    //applyRuleDone = true;
                    }
                    else console.log("Rule already executed!!");
                    */ //End 4
        
                    /*//  5.Use this for batch DELETE
                    for (var i=0; i < vm.results.length; i++){
             //           if (vm.results[i].title.includes("in Core")){
                             //for (var j=0; j<$rootScope.catansrecs.length; j++){
                                 //if ($rootScope.catansrecs[j].category == vm.resultsT[i].id){
                                   //  catans.deleteRec($rootScope.catansrecs[j].answer,$rootScope.catansrecs[j].category);
                                 //}
                             //}
                             table.deleteTable(vm.results[i].id);      
             //           }                   
                   }
                    *///End 5
      
                    /*//6. Use this to add a ranking to all neighborhood 
                     for (var i=0; i < vm.resultsT.length; i++){            
                         //Copy object without reference
                         var tablex = JSON.parse(JSON.stringify(vm.resultsT[i]));
                         tablex.id = undefined;
                         var newtitle = tablex.title.replace("Best steaks in", "Best art galleries in");
                         tablex.title = newtitle;
                         //var newtags = tablex.tags.replace("meat food", "beer pb bars");
                         var newtags = "paintings culture";
                         tablex.tags = newtags;
                         tablex.answertags = '';
                         //console.log("tags ", tags);
                         table.addTable(tablex);
                     }
                     *///End 6
        
                    /*//7. Add 'isMP' to all non-neighborhood ranks
                            
                            var isMain = true;
                            for (var i=50; i<$rootScope.content.length; i++){
                                isMain = true;    
                                for (var j=0; j<$rootScope.neighborhoods.length; j++){
                                    if ($rootScope.content[i].title.includes($rootScope.neighborhoods[j])){
                                        isMain = false; break;
                                    }
                                }
                                if (isMain){
                                        var tags = $rootScope.content[i].tags + ' isMP';
                                        table.update($rootScope.content[i].id, ['tags'],[tags]);                         
                                }
                            } 
                     *///End 7
         
         
                    //console.log("1");
                    /*//8. Generate Category Strings for non neighborhood ranks
                       var isDistrictRanking = false;             
                       for (var i=0; i<vm.results.length; i++){
                           //console.log("2");
                           if (vm.results[i].title.includes("Hillcrest")){
                               //console.log("2");
                               var catstr = '';
                               var fcatstr = '';
                               var genRank = vm.results[i].title.replace("Hillcrest", "Downtown");
                               for (var j=0; j<$rootScope.content.length; j++){
                                   if (genRank == $rootScope.content[j].title){
                                       if ($rootScope.content[j].catstr == null || //comment these 3
                                       $rootScope.content[j].catstr == undefined || //if want to redo everythign
                                       $rootScope.content[j].catstr.length == 0){  //categories
                                      // TODO ---- 6949 --- events need to add 6969
                                      // TODO ---- 473 -- law san diego --- ignore, isatomic=true, catstr='';
                                      
                                      //--- Prevent execution for specific ranks ---
                                      var cid = $rootScope.content[j].id;
                                      if (cid != 473 && cid != 3125 && cid !=6949 && cid != 7424 && cid != 7675 &&
                                          cid != 3124 && cid != 3163 && cid !=3202){
                                      
                                        console.log("Found gen rank --- ", $rootScope.content[j].title,' ',$rootScope.content[j].id);
                                        var srchStr = $rootScope.content[j].title.replace("Downtown","");
                                           for (var k=0; k<$rootScope.content.length; k++){

                                               if ($rootScope.content[k].title.includes(srchStr) && k!=j ){
                                                   //console.log("Found sub rank --- ", $rootScope.content[k].title);
                                                    isDistrictRanking = false;
                                                    for (var n=0; n<$rootScope.districts.length; n++){
                                                        if ($rootScope.content[k].title.includes($rootScope.districts[n])){
                                                            isDistrictRanking = true;
                                                        }     
                                                    }
                                                    if (isDistrictRanking) catstr = catstr + ':' + $rootScope.content[k].id;
                                               }

                                           }
                                           fcatstr = catstr.substring(1); //remove leading ':'
                                           console.log("final catstr ---", fcatstr)
                                        
                                           table.update($rootScope.content[j].id, ['isatomic','catstr'],[false, fcatstr]);
                                       }//this is specific rank braket
                                       } //this is bracket
                                   break;
                                   }
                               }                                              
                           }
                       }
                       //SPECIAL CASES //only when redoing everything
                       /*
                       for (var n=0; n<$rootScope.content.length; n++){
                           if ($rootScope.content[n].id == 473){
                               console.log("update(473)");
                               //table.update(473, ['isatomic','catstr'],[true, '']);
                           }
                           if ($rootScope.content[n].id == 3125){
                               console.log("update(3125)");
                               //table.update(3125, ['isatomic','catstr'],[true, '']);
                           }
                           if ($rootScope.content[n].id == 6949){
                               console.log("update(6949)");
                               //table.update(6949, ['isatomic','catstr'],[false, '6949:'+$rootScope.content[n].catstr]);
                           }
                           if ($rootScope.content[n].id == 7675){
                               console.log("update(7675)");
                               //table.update(7675, ['isatomic','catstr'],[false, '7675:'+$rootScope.content[n].catstr]);
                           }
                           if ($rootScope.content[n].id == 7424){
                               console.log("update(7424)");
                               //table.update(7424, ['isatomic','catstr'],[false, '7424:'+$rootScope.content[n].catstr]);
                           }
                       }
                       
                    *///End 8
               
                    /* //  9. Clear answer string for all non-atomic ranks 
                    for (var i=0; i < $rootScope.content.length; i++){
                        if ($rootScope.content[i].isatomic == false){                
                            var answertags = '';
                            table.update($rootScope.content[i].id, ['answertags'],[answertags]);    
                        }            
                    } 
                    */ //End of 9
                    // "Columbia", "Core", "Cortez Hill", "East Village", "Gaslamp Quarter", "Horton Plaza", "Little Italy",
                    //      "Marina", "Seaport Village"];
                    /*// 10. downtwon districts - create catans
                    if (applyRuleDone) return;
                    var srank = '';
                    var res = [];
                    var item ={};
                    var district = '';
                    for (var m = 0; m < $rootScope.districts.length; m++) {
                        district = $rootScope.districts[m];
                        console.log('@ district : ', district);
                        for (var i = 0; i < $rootScope.answers.length; i++) {
                            if ($rootScope.answers[i].cityarea == district) {
                                //console.log("found answer - ", $rootScope.answers[i]);
    
                                for (var j = 0; j < $rootScope.catansrecs.length; j++) {
                                    if ($rootScope.catansrecs[j].answer == $rootScope.answers[i].id) {
                                        //console.log("found catans - ", $rootScope.catansrecs[j]);
                                        for (var k = 0; k < $rootScope.content.length; k++) {
                                            if ($rootScope.content[k].id == $rootScope.catansrecs[j].category) {
                                                //console.log("found category - ",$rootScope.content[k]); 
                                                srank = $rootScope.content[k].title.replace('Downtown', district);
                                                //console.log("srank - ", srank); 
                                                //break; 
                                                for (var n = 0; n < $rootScope.content.length; n++) {
                                                    if ($rootScope.content[n].title == srank) {
                                                        //console.log("Found rank - ", $rootScope.content[n]);
                                                        console.log("add ", $rootScope.answers[i].name, ' to ', $rootScope.content[n].title);
                                                        item = {};
                                                        item.answer = $rootScope.answers[i].id;
                                                        item.category = $rootScope.content[n].id;
                                                        res.push(item);
                                                        //catans.postRec2($rootScope.answers[i].id,$rootScope.content[n].id);
                                                    }
                                                }
                                            }
                                        }
                                        //break;
                                    }
                                }
                            }
                        }
                    }
                    //console.log("res -- ", res);
                    for (var p=0; p<res.length; p++){
                        catans.postRec2(res[p].answer,res[p].category); //postRec2 changed verify!!!
                    }
                        applyRuleDone = true;
                    //}
                    *///end of 10
                    /* //11. Open all contents to refresh number of answers
                    $timeout(function () {
                        $state.go('rankSummary', { index: $rootScope.content[midx].id });
                        midx++;
                        $rootScope.$emit('applyRule');
                    }, 350)
                    */ //End 11.
                
                    /*//12. Add 'pb' tag to all Pacific Beach
                    var tagstr = '';
                    for (var i=0; i<$rootScope.content.length; i++){
                        if ($rootScope.content[i].title.includes('Ocean Beach')){
                            if ($rootScope.content[i].tags.includes('ob') == false){
                                //console.log($rootScope.content[i].title);
                                tagstr = $rootScope.content[i].tags + ' ob';
                                console.log("tagstr - ", tagstr, $rootScope.content[i].title);
                                table.update($rootScope.content[i].id,['tags'],[tagstr]);
                            }
                        }
                    }
                    */ // End of 12
                    /*//13. Open all contents to refresh number of answers, add vrows
                    var catstr = var catArr = catstr.split(':').map(Number);
                    $timeout(function () {

                        //$state.go('rankSummary', { index: $rootScope.content[midx].id });
                        $state.go('rankSummary', { index: catArr[midx] });
                        //$state.go('rankSummary', { index: 74 });
                        midx++;
                        //console.log("midx - ", midx);
                        $rootScope.$emit('applyRule');
                    }, 350);
                    */ //
                    /*//14. Validate all catans entries, checking category and answer values are valid.
                    var catans1 = {};
                    var cat1 = {};
                    var cidx1 = 0;
                    var cidx2 = 0;
                    for (var i=0; i<$rootScope.catansrecs.length; i++){
                        catans1 = $rootScope.catansrecs[i];
                            cidx1 = $rootScope.content.map(function(x) {return x.id; }).indexOf(catans1.category);
                            cidx2 = $rootScope.answers.map(function(x) {return x.id; }).indexOf(catans1.answer);
                            cat1 = $rootScope.content[cidx1];
                            cat2 = $rootScope.answers[cidx2];
                            if (cat1 == undefined) {
                                //console.log("undefined catgory- ", catans1.category);
                                catans.deletebyCategory(catans1.category);
                                
                            }
                            if (cat2 == undefined) {
                                //console.log("undefined answer - ", catans1.answer);
                                catans.deleteAnswer(catans1.answer);
                            }
                    }    
                    *///End 14
                 
                    /*//15. Add isdup to catans for the ones in Downtown to avoid duplicates in rankings
                    var catans1 = {};
                    var catans2 = {};
                    var cat1 = {};
                    var cat2 = {};
                    var cidx1 = 0;
                    var cidx2 = 0;
                    var str = '';
                    var isDt1 = false;
                    var isDt2 = false;
                    for (var i=0; i<$rootScope.catansrecs.length; i++){
                        catans1 = $rootScope.catansrecs[i];
                          
                        for (var j=0; j<$rootScope.catansrecs.length; j++){
                            catans2 = $rootScope.catansrecs[j];
                                if(catans1.answer == catans2.answer && i!=j){
                                    //console.log("catans - ",catans1,catans2);
                                    cidx1 = $rootScope.content.map(function(x) {return x.id; }).indexOf(catans1.category); 
                                    cidx2 = $rootScope.content.map(function(x) {return x.id; }).indexOf(catans2.category);
                                    
                                    cat1 = $rootScope.content[cidx1];
                                    cat2 = $rootScope.content[cidx2];
                                    
                                    isDt1 = cat1.title.includes('Downtown');
                                    isDt2 = cat2.title.includes('Downtown');
                                 
                                    if (isDt1 && isDt2) {
                                        break;
                                    }
                                    
                                    if (isDt1) {
                                        str = cat1.title.replace('Downtown','');
                                        if (cat2.title.includes(str)){
                                            //console.log(cat1.title, "  -  ", cat2.title);
                                            //console.log(catans1.isdup, "  -  ", catans2.isdup);
                                            catans.updateRec(catans1.id,['isdup'],[true]);
                                            break;
                                        } 
                                    }
                                    if (isDt2) {
                                        str = cat2.title.replace('Downtown','');
                                        if (cat1.title.includes(str)){
                                            //console.log(cat1.title, "  -  ", cat2.title);
                                            //console.log(catans1.isdup, "  -  ", catans2.isdup);
                                            catans.updateRec(catans2.id,['isdup'],[true]);
                                            break;
                                        } 
                                    }     
                                }
                         }
                    }    
                    */ //End 15
                    /*//16. Run through all answers if they dont have vrows
                    var answer = {};
                    var hasvr = false;
                    if (!applyRuleDone) {
                        applyRuleDone = true;
                        for (var i = 0; i < $rootScope.answers.length; i++) {
                            answer = $rootScope.answers[i];
                            if (answer.type == 'Establishment' || answer.type == 'PersonCust') {
                                hasvr = false;

                                for (var n = 0; n < $rootScope.catansrecs.length; n++) {
                                    if ($rootScope.catansrecs[n].answer == answer.id) {
                                        var idx = $rootScope.content.map(function (x) { return x.id; }).indexOf($rootScope.catansrecs[n].category);
                                        $rootScope.cCategory = $rootScope.content[idx];
                                        break;
                                    }
                                }

                                for (var j = 0; j < $rootScope.cvrows.length; j++) {
                                    if ($rootScope.cvrows[j].answer == answer.id) {
                                        hasvr = true;
                                        break;
                                    }
                                }
                                
                                if (hasvr == false) {
                                    vrows.postVrows4Answer(answer);
                                    console.log(answer.name);
                                    //console.log($rootScope.cCategory.title);
                                    //console.log(midx++);
                                }
                                //if (hasvr) vrows.deleteVrowByAnswer(answer.id);
                            }
                        }
                    }
                    *///End 16
                    /* //17. Remove all binds;
                    var answerx = {};
                    for (var i = 0; i < $rootScope.answers.length; i++) {
                            answerx = $rootScope.answers[i];
                            if (answerx.owner != undefined && answerx.owner != 0) {
                                //console.log("answer name - ", answer.name, answer.id);
                                answer.updateAnswer(answerx.id, ['owner'], [0]);
                            }
                        }
                      /*  
                        var special = {};
                    for (var k = 0; k < $rootScope.specials.length; k++) {
                            special = $rootScope.specials[k];
                            //if (answer.owner != undefined && answer.owner != 0) {
                                console.log("special - ", special.answer);
                                 var idx = $rootScope.answers.map(function(x) {return x.id; }).indexOf(special.answer);
                                 console.log("answer with special - ", $rootScope.answers[idx].name);  
                            //}
                        }
                        */    
                    //End 17
                    /* //18. Reset views
                     for (var i=0; i < $rootScope.answers.length; i++){
                         if ($rootScope.answers[i].numcom != 0){
                             answer.updateAnswer($rootScope.answers[i].id, ['numcom'], [0]); 
                         }
                     }
                    */ //End 18
                    
                    /*//19. Print all answers that do not have address, phone number or website
                    for (var i=0; i<$rootScope.answers.length; i++){
                        if ($rootScope.answers[i].cityarea == 'Downtown'){
                           // if ($rootScope.answers[i].cityarea == 'Downtown'){
                                console.log("Answer Id. ", $rootScope.answers[i].id, " Name: ", $rootScope.answers[i].name, " Neighborhood: ", $rootScope.answers[i].cityarea);
                           // }
                        }
                    } */ //End 19
                    /*//20.Delete all catans from Downtown
                    var catid = 0;
                    for (var i=0; i<$rootScope.content.length; i++){
                        if ($rootScope.content[i].title.includes('Downtown')){
                             catid = $rootScope.content[i].id;
                             catans.deletebyCategory(catid);
                        }
                    }
                    *///end 20
                    /*//21. 
                    var url1 = '';
                    var url2 = '';
                    var url3 = '';
                    var noimage = $rootScope.EMPTY_IMAGE;
                    console.log("exec rule-abx");
                    var cats = '';
                    for (var i=0; i<$rootScope.content.length; i++){
                        url1 = $rootScope.content[i].image1url;
                        url2 = $rootScope.content[i].image2url;
                        url3 = $rootScope.content[i].image3url;
                        if ($rootScope.content[i].type != 'Short-Phrase') {
                            if (url1 != undefined && url1 != '' && !url1.includes('https') && url1 != noimage ||
                                url2 != undefined && url2 != '' && !url2.includes('https') && url2 != noimage ||
                                url3 != undefined && url3 != '' && !url3.includes('https') && url3 != noimage) {
                                console.log(url1 != undefined && url1 != '' && !url1.includes('https'),
                                url2 != undefined && url2 != '' && !url2.includes('https'),
                                url3 != undefined && url3 != '' && !url3.includes('https'));
                                console.log($rootScope.content[i].title);
                                console.log($rootScope.content[i].image1url);
                                console.log($rootScope.content[i].image2url);
                                console.log($rootScope.content[i].image3url);
                                cats = cats + $rootScope.content[i].id + ':';
                            }
                        }
                    }
                    console.log("cats - ", cats);
                    */// End of 21
                    /*//22. Set ismp on all main page ranks
                    for (var i=0; i<$rootScope.content.length; i++){
                        if ($rootScope.content[i].ismp == undefined){
                            table.update($rootScope.content[i].id, ['ismp'], [false]); 
                        }
                        //else table.update($rootScope.content[i].id, ['ismp'], [false]);
                    }
                    */// End 22
                    /*//23. Set ismp on all main page ranks
                    for (var i=0; i<$rootScope.cblocks.length; i++){
                        if ($rootScope.cblocks[i].scope == 'city'){
                            cblock.update($rootScope.cblocks[i].id, ['ismp'], [true]); 
                        }
                        else cblock.update($rootScope.cblocks[i].id, ['ismp'], [false]);
                    }
                    */// End 23
                    //test stripe server
                    //var url = 'http://rank-x.com/stripeServer/';
                    //var url = 'http://rank-x.com/';
                    /*var url = 'http://rankxserver.azurewebsites.net/stripeServer/';
                    var req = {
                        method: 'GET',
                        url: url,
                        headers: {
                            'X-Dreamfactory-API-Key': undefined,
                            'X-DreamFactory-Session-Token': undefined
                        }
                    }

                    $http(req).then(success, fail);

            function success(result) {
                console.log("success -", results);
                return result.data.resource;
            }
            
            function fail() {
                console.log("failure -");
            }*/
                   //24. Print categories 
                   /*for (var i=0; i <  vm.results.length; i++){
                       if (vm.results[i].title.includes('in San Diego')){
                        console.log(vm.results[i].title.replace('Hillcrest',''));
                       }
                   }
                   *///End 24                                                                                              
                } 
             
        },
    }
}

]);

angular.module('app')
.factory("InstagramService", function ($rootScope, $location, $http, INSTAGRAM_CLIENT_ID) {
    var client_id = INSTAGRAM_CLIENT_ID;     
    var service = {         
    	_access_token: null,
	    access_token: function(newToken) {             
	    	if(angular.isDefined(newToken)) {                 
	    		this._access_token = newToken;             
            }             
	    	return this._access_token;         
	    },
    	login: function () {

	        var igPopup = window.open("https://api.instagram.com/oauth/authorize/?client_id=" + client_id +                 
	        "&redirect_uri=" + $location.absUrl().split('#')[0] +
	        "&response_type=token&scope=likes+relationships+public_content+follower_list",'Instagram Auth', 'width=400, height=600, centerscreen=true, chrome=yes');
        },
        getMyRecentImages: function() {
            return $http.jsonp('https://api.instagram.com/v1/users/self/media/recent?access_token=' + service.access_token()); 
        },
        getUserprofile: function() {
    		return $http.jsonp('https://api.instagram.com/v1/users/self/?access_token=' + service.access_token())
    		.then(function(data){
        		console.log(data);
        		return data;
        	})
        	.catch(function(err){
        		console.log(err);
        	});
        }
    };     
    $rootScope.$on("igAccessTokenObtained", function (evt, args) {
		service.access_token(args.access_token.replace('#', '').replace('!', ''));     
		$rootScope.$broadcast("instagramLoggedIn", { access_token: service._access_token });
	});
    return service; 
});
(function () {
    'use strict';

    angular
        .module('app')
        .factory('fbusers', fbusers);

    fbusers.$inject = ['$http', '$q', '$rootScope', '$facebook'];

    function fbusers($http, $q, $rootScope, $facebook) {

        // Members
        var fbUsers = [];

        var service = {
            findFBUserById: findFBUserById,
            getFBUserById: getFBUserById,
            addFBUser: addFBUser,

            loadProfilePicture: loadProfilePicture
        };

        return service;

        function addFBUser(user){
            fbUsers.push(user);
        }

        function getFBUserById(fbId){
            var user = findFBUserById(fbId);
            if(user)
                return $q.when(user);
            return $facebook.api('/'+fbId+'?fields=first_name,gender,locale,picture,last_name,email', 'GET').then(
            function(user){
                service.addFBUser(user);
                return user;
            },
            function(err){
                return null;
            });
        }

        function findFBUserById(fbId){
            return fbUsers.find(function(user){
                return user.id == fbId;
            });
        }

        function loadProfilePicture(users, fieldName){
            for (var i = 0; i < users.length; i++) {
                var userWithPic = angular.copy(user[i]);
                service.getFBUserById(userWithPic[fieldName])
                .then(function(fbUser){

                });
            }
            return users;
        }
        
    }
})();
(function () {
    'use strict';
    angular
        .module('app').filter('orderObjectBy', function () {
        return function (items, field, reverse) {
            var filtered = [];
            angular.forEach(items, function (item) {
                filtered.push(item);
            });
            filtered.sort(function (a, b) {
                return (a[field] > b[field] ? 1 : -1);
            });
            if (reverse) filtered.reverse();
            return filtered;
        };
    }).filter('objectLength', function () {
        return function (item) {
            if (!item) {
                return 0;
            }

            return Object.keys(item).length;
        }
    }).filter('searchObject', function () {
        return function (items, query, field) {
            if (!items)
                return null;

            var result = [];
            if (!query) {
                var obj = Object.keys(items);
                for (var i = 0, len = obj.length; i < len; i++) {
                    result.push(items[obj[i]]);
                }
                return result;
            }
            
            function compareStr(stra, strb) {
                stra = ("" + stra).toLowerCase();
                strb = ("" + strb).toLowerCase();
                return stra.indexOf(strb) !== -1;
            }
            
            angular.forEach(items, function (friend) {
                if (!field || field == '') {
                    var keys = Object.keys(friend);
                    for (var i = 0, len = keys.length; i < len; i++) {
                        if (compareStr(friend[keys[i]], query)) {
                            result.push(friend);
                            break;
                        }
                    }
                } else {
                    if (friend[field] && compareStr(friend[field], query)) {
                        result.push(friend);
                    }
                }
            });
            return result;
        }
    });
})();


(function () {
    'use strict';

    angular
        .module('app')
        .factory('vrowvotes', vrowvotes);

    vrowvotes.$inject = ['$http', '$q', '$rootScope','uaf'];

    function vrowvotes($http, $q, $rootScope, uaf) {

        // Members
        var _vrowvotes = [];
        var baseURI = '/api/v2/mysql/_table/vrowvotes';

        var service = {
            loadVrowVotes: loadVrowVotes,
            patchRec: patchRec,
			postRec: postRec,
            deleteVrowVotesbyVrow: deleteVrowVotesbyVrow			
        };

        return service;

        function loadVrowVotes(forceRefresh) {
      
             if (_areVrowVotesLoaded() && !forceRefresh) {

                return $q.when(_vrowvotes);
            }
            
           //Get all vote records for current user
            var url = baseURI + '?filter=user='+ $rootScope.user.id;
             
            return $http.get(url).then(querySucceeded, _queryFailed);
            
            function querySucceeded(result) {

                return _vrowvotes = result.data.resource;
            }
                 
        }
		
        function postRec(vrow_id, vote) {
            
            //form match record
            var obj = {};
            obj.resource = [];
                     
            var data={};
            data.user = $rootScope.user.id;
            data.answer = $rootScope.canswer.id;
            data.vrow = vrow_id;
            data.val = vote;
            data.timestmp = Date.now(); 
            
            obj.resource.push(data); 
            
            var url = baseURI; 
            
            return $http.post(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {
                
                //update local copies
                var datax = data;
                datax.id = result.data.resource[0].id; 
                _vrowvotes.push(datax);
                
                $rootScope.cvrowvotes.push(datax);
               
               //user activity feed 
               if (data.val == 1) uaf.post('upVotedVrow',['answer','vrow'],[data.answer, datax.vrow]); 
               if (data.val == -1) uaf.post('downVotedVrow',['answer','vrow'],[data.answer, datax.vrow]);  
                
                if ($rootScope.DEBUG_MODE) console.log("Creating new vrowvoting record was succesful");
                return result.data;
            }
        }
        
        function patchRec(rec_id,vote) {
            
            //form match record
            var obj = {};
            obj.resource = [];
            
           
            var data={};
            data.id = rec_id;
            data.val = vote;
            data.timestmp = Date.now(); 
            
            obj.resource.push(data); 
            
            var url = baseURI; 
            
             //update local record of vrowvotes
            var i = _vrowvotes.map(function(x) {return x.id; }).indexOf(rec_id);
            _vrowvotes[i].vote = vote;
            _vrowvotes[i].timestmp = data.timestmp;
            
            return $http.patch(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                if ($rootScope.DEBUG_MODE) console.log("Updating vrow vote record was succesful");
                return result.data;
            }
        }
        function deleteVrowVotesbyVrow(vrow_id) {
            
            //delete records from local copy
            for (var i=0; i<_vrowvotes.length;i++){
                if (_vrowvotes[i].vrow == vrow_id){
                    _vrowvotes.splice(i,1);
                } 
            }
            
           var url = baseURI + '?filter=vrow=' + vrow_id; 
            
            return $http.delete(url).then(querySucceeded, _queryFailed);
            
            function querySucceeded(result) {

                if ($rootScope.DEBUG_MODE) console.log("Deleting vrow votes records was succesful");
                return result.data;
            }
        }
        
        function _areVrowVotesLoaded(id) {

            return _vrowvotes.length > 0;
        }
        function _queryFailed(error) {

            throw error;
        }

    }
})();
(function () {
    'use strict';

    angular
        .module('app')
        .factory('vrows', vrows);

    vrows.$inject = ['$http', '$q', '$rootScope', 'vrowvotes'];

    function vrows($http, $q, $rootScope, vrowvotes) {

        // Members
        var _allvrows = [];
        var baseURI = '/api/v2/mysql/_table/vrows';

        var service = {
            getAllvrows: getAllvrows,
            postRec: postRec,
            postRec2: postRec2,
            deleteVrowByAnswer: deleteVrowByAnswer,
            deleteVrow: deleteVrow,
            updateRec: updateRec,
            deleteVrowByGroup: deleteVrowByGroup,
            postVrows4Answer: postVrows4Answer
        };

        return service;

        function getAllvrows(forceRefresh) {

            if (_areAllvrowsLoaded() && !forceRefresh) {

                return $q.when(_allvrows);
            }
            
            //Get all vrows records
            var url0 = baseURI + '?offset=' + 0 * 1000;
            var url1 = baseURI + '?offset=' + 1 * 1000;
            var url2 = baseURI + '?offset=' + 2 * 1000;
            var url3 = baseURI + '?offset=' + 3 * 1000;
            var url4 = baseURI + '?offset=' + 4 * 1000;
            var url5 = baseURI + '?offset=' + 5 * 1000;
            var url6 = baseURI + '?offset=' + 6 * 1000;
            var url7 = baseURI + '?offset=' + 7 * 1000;
            var url8 = baseURI + '?offset=' + 8 * 1000;
            var url9 = baseURI + '?offset=' + 9 * 1000;
            var url10 = baseURI + '?offset=' + 10 * 1000;
            var url11 = baseURI + '?offset=' + 11 * 1000;
            var url12 = baseURI + '?offset=' + 12 * 1000;
            var url13 = baseURI + '?offset=' + 13 * 1000;
            var url14 = baseURI + '?offset=' + 14 * 1000;
            var url15 = baseURI + '?offset=' + 15 * 1000;
            var url16 = baseURI + '?offset=' + 16 * 1000;
            var url17 = baseURI + '?offset=' + 17 * 1000;
            var url18 = baseURI + '?offset=' + 18 * 1000;
            var url19 = baseURI + '?offset=' + 19 * 1000;
            var url20 = baseURI + '?offset=' + 20 * 1000;
            var url21 = baseURI + '?offset=' + 21 * 1000;
            var url22 = baseURI + '?offset=' + 22 * 1000;
            var url23 = baseURI + '?offset=' + 23 * 1000;

            var p0 = $http.get(url0);
            var p1 = $http.get(url1);
            var p2 = $http.get(url2);
            var p3 = $http.get(url3);
            var p4 = $http.get(url4);
            var p5 = $http.get(url5);
            var p6 = $http.get(url6);
            var p7 = $http.get(url7);
            var p8 = $http.get(url8);
            var p9 = $http.get(url9);
            var p10 = $http.get(url10);
            var p11 = $http.get(url11);
            var p12 = $http.get(url12);
            var p13 = $http.get(url13);
            var p14 = $http.get(url14);
            var p15 = $http.get(url15);
            var p16 = $http.get(url16);
            var p17 = $http.get(url17);
            var p18 = $http.get(url18);
            var p19 = $http.get(url19);
            var p20 = $http.get(url20);
            var p21 = $http.get(url21);
            var p22 = $http.get(url22);
            var p23 = $http.get(url23);

            return $q.all([p0, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15, 
            p16, p17, p18, p19, p20, p21, p22, p23]).then(function (d) {
                _allvrows = d[0].data.resource.concat(d[1].data.resource, d[2].data.resource, d[3].data.resource,
                    d[4].data.resource, d[5].data.resource, d[6].data.resource, d[7].data.resource, d[8].data.resource,
                    d[9].data.resource, d[10].data.resource, d[11].data.resource, d[12].data.resource,
                    d[13].data.resource, d[14].data.resource, d[15].data.resource, d[16].data.resource, d[17].data.resource,
                    d[18].data.resource, d[19].data.resource, d[20].data.resource, d[21].data.resource,
                    d[22].data.resource, d[23].data.resource);
                if ($rootScope.DEBUG_MODE) console.log("No. Vrows: ", _allvrows.length);
                return _allvrows;
            }, _queryFailed);
        }

        function postVrows4Answer(answer) {
            var titles = [];
            var obj = {};
            var vrowsobjs = [];
            if ($rootScope.cCategory.tags.indexOf('food') > -1 || $rootScope.cCategory.tags.indexOf('services') > -1 ||
                $rootScope.cCategory.tags.indexOf('health') > -1 || $rootScope.cCategory.tags.indexOf('beauty') > -1 ||
                $rootScope.cCategory.tags.indexOf('food') > -1 || $rootScope.cCategory.title.indexOf('food') > -1 ||
                $rootScope.cCategory.title.indexOf('restaurants') > -1 ||
                $rootScope.cCategory.title.indexOf('Bars') > -1 || $rootScope.cCategory.title.indexOf('bars') > -1 ||
                $rootScope.cCategory.title.indexOf('pubs') > -1 ||
                $rootScope.cCategory.title.indexOf('Yoga') > -1 || $rootScope.cCategory.title.indexOf('Pilates') > -1 ||
                $rootScope.cCategory.title.indexOf('yoga') > -1 || $rootScope.cCategory.title.indexOf('pilates') > -1||
                $rootScope.cCategory.title.indexOf('schools') > -1 ||
                $rootScope.cCategory.title.indexOf('Gyms') > -1 || $rootScope.cCategory.title.indexOf('gyms') > -1 ||
                $rootScope.cCategory.title.indexOf('Nightclubs') > -1 || answer.type == 'PersonCust' ||
                answer.type == 'Establishment') {

                titles = ['Quality of Service', 'Friendliness of Staff', 'Promptness of Service', 'Value for the Money'];

                if ($rootScope.cCategory.tags.indexOf('food') > -1 || $rootScope.cCategory.title.indexOf('food') > -1 ||
                    $rootScope.cCategory.title.indexOf('restaurants') > -1 || $rootScope.cCategory.title.indexOf('offee') > -1) {
                    titles = ['Quality of Food and Drinks', 'Friendliness of Staff', 'Promptness of Service', 'Value for the Money'];
                }
                if ($rootScope.cCategory.title.indexOf('Bars') > -1 || $rootScope.cCategory.title.indexOf('bars') > -1 ||
                    $rootScope.cCategory.title.indexOf('pubs') > -1) {
                    titles = ['Quality of Drinks', 'Friendliness of Staff', 'Promptness of Service', 'Value for the Money'];
                }

                if ($rootScope.cCategory.title.indexOf('Gyms') > -1 || $rootScope.cCategory.title.indexOf('gyms') > -1) {
                    titles = ['Equipment & Facilities', 'Friendliness of Staff', 'Environment', 'Value for the Money'];
                }
                
                if ($rootScope.cCategory.title.indexOf('Yoga') > -1 || $rootScope.cCategory.title.indexOf('Pilates') > -1 ||
                    $rootScope.cCategory.title.indexOf('yoga') > -1 || $rootScope.cCategory.title.indexOf('pilates') > -1 ||
                    $rootScope.cCategory.title.indexOf('schools') > -1 || $rootScope.cCategory.title.indexOf('MMA') > -1) {
                    titles = ['Quality of Instructors', 'Friendliness of Staff', 'Class Environment', 'Value for the Money'];
                }
                
                if ($rootScope.cCategory.title.indexOf('Apartments') > -1 || $rootScope.cCategory.title.indexOf('apartments') > -1) {
                    titles = ['Location', 'Floor Layout', 'Facilities', 'Value for the Money'];
                }
                //ranks of categories that include 'shops' or 'stores' but not 'barbershops' or 'coffee shops or repair shops'
                if (($rootScope.cCategory.title.indexOf('shop') > -1 || $rootScope.cCategory.title.indexOf('store') > -1) 
                    && ($rootScope.cCategory.title.indexOf('arber') < 0 && $rootScope.cCategory.title.indexOf('offee') < 0 &&
                    $rootScope.cCategory.title.indexOf('repair') < 0)) {
                    titles = ['Assortment of Products', 'Friendliness of Staff','Value for the Money'];
                }
                if ($rootScope.cCategory.title.indexOf('Tattoo') > -1 || $rootScope.cCategory.title.indexOf('tattoo') > -1) {
                    titles = ['Quality of Service', 'Friendliness of Staff', 'Promptness of Service', 'Value for the Money'];
                }
                
                if ($rootScope.cCategory.title.indexOf('Nightclubs') > -1 || $rootScope.cCategory.title.indexOf('music') > -1 || 
                    $rootScope.cCategory.title.indexOf('dancing') > -1) {
                    titles = [' Quality of Music', 'Environment', 'Friendliness of Staff', 'Value for the Money'];
                }
                if (answer.type == 'PersonCust') {
                    titles = [' Quality of Service', 'Friendliness', 'Value for the Money'];
                }
                //else if ($rootScope.cCategory.tags.includes('services')){
                            
                //}
                for (var n = 0; n < titles.length; n++) {
                    obj = {};
                    obj.gnum = 1;
                    obj.gtitle = 'General';
                    obj.title = titles[n];
                    obj.upV = 0;
                    obj.downV = 0;
                    //obj.timestmp = Date.now();
                    obj.answer = answer.id;
                    vrowsobjs.push(obj);
                    //vrows.postRec(obj);                           
                }
                postRec2(vrowsobjs);
            }

        }

        function postRec(x) {
           
            //form match record
            var data = x;
            data.upV = 0;
            data.downV = 0;
            data.timestmp = Date.now();

            var obj = {};
            obj.resource = [];

            obj.resource.push(data);

            var url = baseURI;

            return $http.post(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {
                
                //update local copy
                var newVRow = data;
                newVRow.id = result.data.resource[0].id;
                _allvrows.push(newVRow);
                //$rootScope.cvrows.push(newVRow);

                return result.data;

            }
        }

        function postRec2(x) {

            var obj = {};
            obj.resource = [];

            obj.resource.push(x);
            
            //update local copy
            _allvrows.push.apply(_allvrows, x);

            var url = baseURI;

            return $http.post(url, x, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {
                
                //update local copy
                var eidx = _allvrows.length - 1;
                for (var n = result.data.resource.length - 1; n >= 0; n--) {
                    _allvrows[eidx].id = result.data.resource[n].id;
                    eidx--;
                }

                return result.data;

            }
        }
        function deleteVrowByAnswer(answer_id) {
            
            //delete records from local copy
            for (var i = 0; i < _allvrows.length; i++) {
                if (_allvrows[i].answer == answer_id) {
                    _allvrows.splice(i, 1);
                }
            }

            var url = baseURI + '?filter=answer=' + answer_id;

            return $http.delete(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {
                
                //Everytime a Vrow record is deleted, delete associated user votes with it
                for (var i = 0; i < result.data.resource.length; i++) {
                    vrowvotes.deleteVrowVotesbyVrow(result.data.resource[i].id);
                }

                if ($rootScope.DEBUG_MODE) console.log("Deleting vrows records for answer was succesful");
                return result.data;
            }
        }

        function deleteVrowByGroup(gnum,answer) {
            
            //delete records from local copy
            for (var i = _allvrows.length - 1; i >= 0; i--) {
                if (_allvrows[i].gnum == gnum) {
                    _allvrows.splice(i, 1);
                }
            }
            var url = baseURI + '?filter=(gnum=' + gnum+') AND (answer='+ answer+')';

            return $http.delete(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {
                
                //Everytime a Vrow record is deleted, delete associated user votes with it
                for (var i = 0; i < result.data.resource.length; i++) {
                    vrowvotes.deleteVrowVotesbyVrow(result.data.resource[i].id);
                }

                if ($rootScope.DEBUG_MODE) console.log("Deleting vrows records for group was succesful");
                return result.data;
            }
        }

        function deleteVrow(vrow_id) {
            
            //form match record
            var obj = {};
            obj.resource = [];

            var data = {};
            data.id = vrow_id;

            obj.resource.push(data);

            var url = baseURI + '/' + vrow_id;
            
            //update (delete answer) local copy of answers
            var i = _allvrows.map(function (x) { return x.id; }).indexOf(vrow_id);
            if (i > -1) _allvrows.splice(i, 1);

            return $http.delete(url, data, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {
                
                //Everytime a Vrow record is deleted, delete associated user votes with it
                for (var i = 0; i < result.data.resource.length; i++) {
                    vrowvotes.deleteVrowVotesbyVrow(result.data.resource[i].id);
                }

                if ($rootScope.DEBUG_MODE) console.log("Deleting vrow was succesful");
                return result.data;
            }
        }

        function updateRec(rec_id, field, val) {
             
            //form match record
            var obj = {};
            obj.resource = [];

            var data = {};
            data.id = rec_id;

            for (var i = 0; i < field.length; i++) {
                switch (field[i]) {
                    case "upV": data.upV = val[i]; break;
                    case "downV": data.downV = val[i]; break;
                    case "title": data.title = val[i]; break;
                    case "gnum": data.gnum = val[i]; break;
                    case "gtitle": data.gtitle = val[i]; break;
                }
            }
            //console.log("data", data);
            obj.resource.push(data);

            var url = baseURI;
            
            //update local copy
            var idx = _allvrows.map(function (x) { return x.id; }).indexOf(rec_id);
            for (var i = 0; i < field.length; i++) {
                switch (field[i]) {
                    case "upV": $rootScope.cvrows[idx].upV = val[i]; break;
                    case "downV": $rootScope.cvrows[idx].downV = val[i]; break;
                    case "title": $rootScope.cvrows[idx].title = val[i]; break;
                    case "gnum": $rootScope.cvrows[idx].gnum = val[i]; break;
                    case "gtitle": $rootScope.cvrows[idx].gtitle = val[i]; break;
                }
            }

            return $http.patch(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                if ($rootScope.DEBUG_MODE) console.log("updating vrows record succesful");
                return result.data;
            }
        }

        function _areAllvrowsLoaded() {

            return _allvrows.length > 0;
        }

        function _queryFailed(error) {

            throw error;
        }
    }
})();
(function () {
    'use strict';

    angular
        .module('app')
        .factory('votes', votes);

    votes.$inject = ['$http', '$q', '$rootScope','uaf'];

    function votes($http, $q, $rootScope, uaf) {

        // Members
        var _votes = [];
        var baseURI = '/api/v2/mysql/_table/votetable';

        var service = {
            loadVotesByUser: loadVotesByUser,
            loadAllVotes: loadAllVotes,
            patchRec: patchRec,
			postRec: postRec,
            deleteVotesbyCatans: deleteVotesbyCatans,
            deleteRec: deleteRec
			
            //    addTable: addTable
        };

        return service;


        function loadVotesByUser(forceRefresh) {
      
             if (_isVotesLoaded() && !forceRefresh) {

                return $q.when(_votes);
            }
            
           //Get all vote records for current user
            var url = baseURI + '/?filter=user='+ $rootScope.user.id;
             
            return $http.get(url).then(querySucceeded, _queryFailed);
            
            function querySucceeded(result) {

                return _votes = result.data.resource;
            }
                 
        }
        
        function loadAllVotes(forceRefresh) {
      
           //Get all vote records for current user
            var url = baseURI;
             
            return $http.get(url).then(querySucceeded, _queryFailed);
            
            function querySucceeded(result) {

                return _votes = result.data.resource;
            }
                 
        }
		
        function postRec(catans_id, answer_id, category_id, vote) {
            
            //form match record
            var obj = {};
            obj.resource = [];
                     
            var data={};
            data.user = $rootScope.user.id;
            data.catans = catans_id;
            data.answer = answer_id;
            data.vote = vote;
            data.timestmp = Date.now(); 
            
            obj.resource.push(data); 
            
            var url = baseURI; 
            
            return $http.post(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {
                
                //update local copies
                var datax = data;
                datax.id = result.data.resource[0].id; 
                _votes.push(datax);
                
               if (data.vote == 1) uaf.post('upVoted',['answer','category'],[answer_id, category_id]); //user activity feed
               if (data.vote == -1) uaf.post('downVoted',['answer','category'],[answer_id, category_id]); //user activity feed 
                //$rootScope.cvotes.push(datax);
                $rootScope.$emit('updateVoteTable');
                
                console.log("Creating new voting record was succesful");
                return result.data;
            }
        }
        
        function patchRec(rec_id,vote) {
            
            //form match record
            var obj = {};
            obj.resource = [];
            
           
            var data={};
            data.id = rec_id;
            data.vote = vote;
            data.timestmp = Date.now(); 
            
            obj.resource.push(data); 
            
            var url = baseURI; 
            
            //update local record of votes
            var i = _votes.map(function(x) {return x.id; }).indexOf(rec_id);
            _votes[i].vote = vote;
            _votes[i].timestmp = data.timestmp;
            
            return $http.patch(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                if ($rootScope.DEBUG_MODE) console.log("Updating vote record was succesful");
                return result.data;
            }
        }
        function deleteVotesbyCatans(catans_id) {
            
            //delete records from local copy
            for (var i=0; i<_votes.length;i++){
                if (_votes[i].catans == catans_id){
                    _votes.splice(i,1);
                } 
            }
            
           var url = baseURI + '/?filter=catans=' + catans_id; 
            
            return $http.delete(url).then(querySucceeded, _queryFailed);
            
            function querySucceeded(result) {
                
                if ($rootScope.DEBUG_MODE) console.log("Deleting vote records by Catans was succesful");
                return result.data;
            }
        }
        
        function deleteRec(rec_id) {
            
            //delete records from local copy
            for (var i=0; i<_votes.length;i++){
                if (_votes[i].id == rec_id){
                    _votes.splice(i,1);
                } 
            }
            
           var url = baseURI + '/' + rec_id; 
            
            return $http.delete(url).then(querySucceeded, _queryFailed);
            
            function querySucceeded(result) {
                if ($rootScope.DEBUG_MODE) console.log("Deleting vote record was succesful");
                return result.data;
            }
        }
        
        function _isVotesLoaded(id) {

            return _votes.length > 0;
        }
        function _queryFailed(error) {

            throw error;
        }

    }
})();
(function () {
    'use strict';

    angular
        .module('app')
        .factory('useractivity', useractivity);

    useractivity.$inject = ['$http', '$q','$rootScope'];

    function useractivity($http, $q, $rootScope) {

        // Members
        var _alluseractivity = [];
        var _useractivity = [];
        var baseURI = '/api/v2/mysql/_table/useractivity';

        var service = {
            getAllUserActivity: getAllUserActivity,
            getActivitybyUser: getActivitybyUser,
            postRec: postRec,
            patchRec: patchRec,
            deleteRec: deleteRec,
            //deletebyVote: deletebyVote
            
        };

        return service;

        function getAllUserActivity(forceRefresh) {

            if (_areAllUserActivityLoaded() && !forceRefresh) {

                return $q.when(_alluseractivity);
            }

            var url = baseURI;

            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                return _alluseractivity = result.data.resource;
            }

        }
        
        function getActivitybyUser(forceRefresh) {

            if (_userActivityLoaded() && !forceRefresh) {

                return $q.when(_userActivityLoaded);
            }

            var url = baseURI + '/?filter=user='+ $rootScope.user.id;;

            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                return _useractivity = result.data.resource;
            }

        }
        
        function postRec(category) {
           
            //form match record
            var data = {};
            data.user = $rootScope.user.id;
            data.category = category;
            data.votes = 1;
            data.timestmp = Date.now();
             
            var obj = {};
            obj.resource = [];

            obj.resource.push(data);
            
            //update local copy
            //_alluseractivity.push(data);
            
            var url = baseURI;

            return $http.post(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {
                
                //update local copy
                var datax = data;
                datax.id = result.data.resource[0].id; 
                _alluseractivity.push(datax);
                
                //update current user activity array
                $rootScope.thisuseractivity.push(datax);                

                if ($rootScope.DEBUG_MODE) console.log("creating useractivity record was succesful");
                return result.data;
            }
        }
       
       function patchRec(rec_id, votes) {
            
            //form match record
            var obj = {};
            obj.resource = [];
                      
            var data={};
            data.id = rec_id;
            data.user = $rootScope.user.id;
            data.votes = votes;
            data.timestmp = Date.now(); 
            
            obj.resource.push(data); 
            
            var url = baseURI;
            
            var idx = _alluseractivity.map(function(x) {return x.id; }).indexOf(rec_id);   
            _alluseractivity[idx].votes = votes;            
            
            return $http.patch(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                if ($rootScope.DEBUG_MODE) console.log("Updating useractivity record was succesful");
                return result.data;
            }
        }
        
        function deleteRec(rec_id) {
            
            //update (delete answer) local copy of alluseractivity
            var i = _alluseractivity.map(function(x) {return x.id; }).indexOf(rec_id);
            if (i > -1) _alluseractivity.splice(i,1);
            
           var url = baseURI + '/' + rec_id; 
            
            return $http.delete(url).then(querySucceeded, _queryFailed);
            
            function querySucceeded(result) {
                if ($rootScope.DEBUG_MODE) console.log("Deleting user activity record was succesful");
                return result.data;
            }
        }
        
        /*
        function deletebyVote(vote_id) {
            
            //delete records from local copy
            for (var i=0; i<_alluseractivity.length;i++){
                if (_alluseractivity[i].voterec == vote_id){
                    _alluseractivity.splice(i,1);
                } 
            }
            
           var url = baseURI + '/?filter=voterec=' + vote_id; 
            
            return $http.delete(url).then(querySucceeded, _queryFailed);
            
            function querySucceeded(result) {

                console.log("Deleting useractivity records by vote was succesful");
                return result.data;
            }
        }*/
     
        function _areAllUserActivityLoaded() {

            return _alluseractivity.length > 0;
        }
        
        function _userActivityLoaded() {

            return _useractivity.length > 0;
        }

        function _queryFailed(error) {

            throw error;
        }
    }
})();
(function () {
    'use strict';

    angular
        .module('app')
        .factory('uaf', uaf);

    uaf.$inject = ['$http', '$q', '$rootScope'];

    function uaf($http, $q, $rootScope) {

        //Members
        var _actions = [];
        var baseURI = '/api/v2/mysql/_table/useractivityfeed';

        var service = {
            getactions: getactions,
            post: post,
			deletebyId: deletebyId,
			           
        };

        return service;
        
        function getactions(forceRefresh) {
            // console.log("getuaf s..._areuaf sLoaded()", _areuaf sLoaded());
            /*
            if (_actionsLoaded() && !forceRefresh) {

                return $q.when(_actions);
            }
            */
            //Get all uaf  records
            var url0 = baseURI + '?limit=200&order=id%20DESC';
            //var url1 = baseURI + '?offset=' + 1 * 1000;

            var p0 = $http.get(url0);
            //var p1 = $http.get(url1);

            return $q.all([p0]).then(function (d){
                _actions = d[0].data.resource.concat();
                if ($rootScope.DEBUG_MODE) console.log("No. user actions: ", _actions.length);
                return _actions;            
            }, _queryFailed);  

        }

        function post(action,field,val) {

            var url = baseURI;
			var _colors = {};
            _colors.bc = '';
            _colors.fc = '';
			var data = {};
            var n = 0;
			data.userid = $rootScope.user.id;
			data.action = action;
            data.initials = $rootScope.user.name.replace(/[^A-Z]/g, '');
            getIconColors($rootScope.user.id, _colors);
            data.fc = _colors.fc;
            data.bc = _colors.bc;
            
			for (var i=0; i<field.length; i++){
                switch (field[i]){
                    case "answer": {
                        data.answer = val[i]; 
                        n = $rootScope.answers.map(function(x) {return x.id; }).indexOf(data.answer);
                        data.text1 = $rootScope.answers[n].name;  
                        break;
                    }
                    case "category": {
                        data.category = val[i]; 
                        n = $rootScope.content.map(function(x) {return x.id; }).indexOf(data.category);
                        data.text2 = $rootScope.content[n].title;  
                        break;
                    }
                    case "comment": data.comment = val[i]; break;
                    case "edit": {
                        data.edit = val[i];
                        n = $rootScope.edits.map(function(x) {return x.id; }).indexOf(data.edit);
                        data.text2 = $rootScope.edits[n].field;  
                        break;
                    }
                    case "vrow": {
                        data.vrow = val[i]; 
                        n = $rootScope.cvrows.map(function(x) {return x.id; }).indexOf(data.vrow);
                        data.text2 = $rootScope.cvrows[n].title;  
                        break;
                    }
                    case "text1": data.text1 = val[i]; break;
                    case "text2": data.text2 = val[i]; break;
                 }
            }
            //obj.resource.push(data);
			
            var resource = [];
			resource.push(data);
            
            return $http.post(url, resource, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: resource
            }).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {
                
                //update local copy
                var uafx = data;
                uafx.id = result.data.resource[0].id; 
                _actions.push(uafx);

                if ($rootScope.DEBUG_MODE) console.log("Posted user activity feed");
                return result.data;
            }

        }
 
        function deletebyId(id) {
           
            //form match record
            var obj = {};
            obj.resource = [];

            var data = {};
            data.id = id;

            obj.resource.push(data);

            var url = baseURI + '/' + id;
            
            //update (delete uaf ) local copy of uaf s
            var i = _actions.map(function(x) {return x.id; }).indexOf(id);
            if (i > -1) _actions.splice(i,1);
            
            return $http.delete(url, data, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                if ($rootScope.DEBUG_MODE) console.log("Deleting user activity feed was succesful");
                return result.data;
            }
        }
        
        function getIconColors(x, c) {
            switch (x % 10) {
                case 0: { c.bc = '#b3b3b3'; c.fc = 'black'; break; }
                case 1: { c.bc = '#666666'; c.fc = 'white'; break; }
                case 2: { c.bc = '#006bb3'; c.fc = 'white'; break; }
                case 3: { c.bc = '#009933'; c.fc = 'white'; break; }
                case 4: { c.bc = '#cc0000'; c.fc = 'white'; break; }
                case 5: { c.bc = '#538cc6'; c.fc = 'black'; break; }
                case 6: { c.bc = '#b36b00'; c.fc = 'white'; break; }
                case 7: { c.bc = '#999966'; c.fc = 'black'; break; }
                case 8: { c.bc = '#4d0099'; c.fc = 'white'; break; }
                case 9: { c.bc = '#009999'; c.fc = 'black'; break; }
            }
        }

        function _actionsLoaded() {

            return _actions.length > 0;
        }

        function _queryFailed(error) {

            throw error;
        }

    }
})();
(function () {
    'use strict';

    angular
        .module('app')
        .factory('tablefield', tablefield);

    tablefield.$inject = ['$http', '$q'];

    function tablefield($http, $q) {

        // Members
        var _alltablefields = [];
        var _selectedtablefields;
        var baseURI = '/api/v2/mysql/_table/tablefield';

        var service = {
            getAllTableFields: getAllTableFields,
            getTableFields: getTableFields
            
        };

        return service;

        function getAllTableFields(forceRefresh) {

            if (_areAllTableFieldsLoaded() && !forceRefresh) {

                return $q.when(_alltablefields);
            }

            var url = baseURI;

            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                return _alltablefields = result.data.resource;
            }

        }

        function getTableFields(id, forceRefresh) {

      //      if (_isSelectedTableLoaded(id) && !forceRefresh) {
      //              return $q.when(_selectedtablefields);
      //      }
            var url = baseURI + '/?fields=field&filter=tableid=' + id;

            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                return _selectedtablefields = result.data;
            }
        }

     
        function _areAllTableFieldsLoaded() {

            return _alltablefields.length > 0;
        }

        function _isSelectedTableLoaded(id) {

          return _selectedtablefields.length > 0;
          
        }

        function _queryFailed(error) {

            throw error;
        }
    }
})();
(function () {
    'use strict';

    angular
        .module('app')
        .factory('instagram', instagram);

    instagram.$inject = ['$http', '$rootScope'];

    function instagram($http, $rootScope) {

        var service = {
            getImages: getImages,
        };

        return service;
        

        function getImages() {
            
            var instagramAPIurl = 'https://api.instagram.com/v1';
			var instagramClientId = 'c46745e083b7451a99461240e01da20b';
            var instagramAccessToken = '4368719989.c46745e.407288e972a64c119093166b8ba280c0';
            var redirecturi = 'https://rank-x.com';
            
            $rootScope.igimages = [];
            
            var tags = $rootScope.canswer.name.replace(' ','');
            
            var url = instagramAPIurl + '/tags/'+ 'rankxdemo' +'/media/recent?access_token='+instagramAccessToken + '&callback=JSON_CALLBACK';
            //var url = instagramAPIurl + '/media/search?lat='+$rootScope.canswer.lat+'&lng='+$rootScope.canswer.lng+
            //'&access_token='+instagramAccessToken + '&callback=JSON_CALLBACK';
            
            //&scope=public_content
            //https://api.instagram.com/v1/tags/{tag-name}?access_token=ACCESS-TOKEN
            //var url = 'https://api.instagram.com/v1/media/search?lat=48.858844&lng=2.294351&access_token='+instagramAccessToken;
            
            //var url = 'https://api.instagram.com/oauth/authorize/?client_id='+ instagramClientId + 
            //'&redirect_uri='+ redirecturi +'&response_type=token&scope=public_content';
            
            //return $http.get(url);
            console.log(url);
            
            return $http.jsonp(url)
                .success(function(data){
                    var myObj = {};
                console.log(data);
                for (var i=0; i<data.data.length; i++){
                    myObj = {};
                    myObj.url = data.data[i].images.standard_resolution.url;
                    myObj.caption = data.data[i].caption ? data.data[i].caption.text : undefined;
                    myObj.from = data.data[i].user.username;
                    $rootScope.igimages.push(myObj);
                    //$rootScope.igimages[i].Name = data.data[i].images.standard_resolution.url;
                    console.log(data.data[i].images.standard_resolution.url);
                }
            });
            /*
            return $http.get(url, {
                crossDomain: true,
                dataType: 'jsonp',
            }).then(function(response){
                
            console.log("Instagram Response: ", response);
            
            });
            
            */
        }
    }
})();
(function () {
    'use strict';

    angular
        .module('app')
        .factory('imagelist', imagelist);

    imagelist.$inject = ['$http', '$rootScope'];

    function imagelist($http, $rootScope) {

        var service = {
            getImageList: getImageList,
            deleteBlob: deleteBlob
        };

        return service;

        function getImageList() {

            var storageurl = "https://rankx.blob.core.windows.net/sandiego?restype=container&comp=list" + "&prefix=" + $rootScope.canswer.id + "/" +
            "&sv=2015-04-05&ss=bfqt&srt=sco&sp=rwdlacup&se=2018-08-30T01:15:12Z&st=2016-08-29T17:15:12Z&spr=https,http&sig=PpyWE0X%2Fpz9SuRje5GtHh44WaWIii0GBU9PbIcDIka8%3D";
            return $http.get(storageurl).then(querySucceeded, queryFailed);
        
            //return imageQuery.then(querySucceeded, queryFailed);
            function querySucceeded(result) {
                
                //var parser = new DOMParser();
                //var xmlDoc = parser.parseFromString(result.data,"text/xml");
                var x2js = new X2JS();
                var myJSON = x2js.xml_str2json(result.data);
                var myObj = {};
                
                var resParse = myJSON.EnumerationResults.Blobs.Blob;

                if ((!!resParse) && (resParse.constructor === Array)){
                    for (var i=0; i < resParse.length; i++){
                        myObj = {};
                        myObj.url = 'https://rankx.blob.core.windows.net/sandiego/'+resParse[i].Name;
                        myObj.type = 'azure-uploaded';
                        $rootScope.blobs.push(myObj);
                    }
                } else if ((!!resParse) && (resParse.constructor === Object)) {
                    myObj = {};
                    myObj.url = 'https://rankx.blob.core.windows.net/sandiego/'+resParse.Name;
                    myObj.type = 'Uploaded';
                    $rootScope.blobs.push(myObj);
                }
                
                if ($rootScope.DEBUG_MODE) console.log('query succeded');

            }
            function queryFailed(result) {
                if ($rootScope.DEBUG_MODE) console.log('image query failed');
            }


        }
        
        function deleteBlob(blobName) {

            console.log("blobname, ", blobName);
            
            var url = blobName + 
            "?sv=2015-04-05&ss=bfqt&srt=sco&sp=rwdlacup&se=2018-08-30T01:15:12Z&st=2016-08-29T17:15:12Z&spr=https,http&sig=PpyWE0X%2Fpz9SuRje5GtHh44WaWIii0GBU9PbIcDIka8%3D";
            
            return $http.delete(url).then(querySucceeded, queryFailed);
        
            function querySucceeded(result) {
                $rootScope.$emit('refreshImages');
                if ($rootScope.DEBUG_MODE) console.log('Blob image deleted succesfully');

            }
            function queryFailed(result) {
                if ($rootScope.DEBUG_MODE) console.log('Blob image delete failed');
            }            
        }

        function XML2jsobj(node) {

            var data = {};

            // append a value
            function Add(name, value) {
                if (data[name]) {
                    if (data[name].constructor != Array) {
                        data[name] = [data[name]];
                    }
                    data[name][data[name].length] = value;
                }
                else {
                    data[name] = value;
                }
            };
	
            // element attributes
            var c, cn;
            for (c = 0; cn = node.attributes[c]; c++) {
                Add(cn.name, cn.value);
            }
	
            // child elements
            for (c = 0; cn = node.childNodes[c]; c++) {
                if (cn.nodeType == 1) {
                    if (cn.childNodes.length == 1 && cn.firstChild.nodeType == 3) {
                        // text value
                        Add(cn.nodeName, cn.firstChild.nodeValue);
                    }
                    else {
                        // sub-object
                        Add(cn.nodeName, XML2jsobj(cn));
                    }
                }
            }

            return data;
        }
    }
})();


(function () {
    'use strict';

    angular
        .module('app')
        .factory('image', image);

    image.$inject = ['$http', '$rootScope'];

    function image($http, $rootScope) {

        //Members
        var _searchResults = [];
        var numRes = 10; //This is max number of results from google search
        
        var service = {
            imageSearch: imageSearch,
            getImageLinks: getImageLinks,
            filterImageResults: filterImageResults
        };

        return service;
        
        function getImageLinks(fields, attNum, type) {
            var imageQuery = imageSearch(fields, attNum, type);            
            return imageQuery.then(querySucceeded, queryFailed);
            function querySucceeded(result) {
                if ($rootScope.DEBUG_MODE) console.log('query succeded');
                _searchResults = result; 
                return filterImageResults(_searchResults); 

            }
            function queryFailed(result) {

                if ($rootScope.DEBUG_MODE) console.log('image query failed');
            }
        }

        function imageSearch(fields, attNum, type) {

            var searchQuery = '';
            var googleAPIurl = 'https://www.googleapis.com/customsearch/v1?';
            var googleCSEid = '&cx=000139851817949790257%3Aqwkdgi2q2ew';
            var googleAPI_KEY = '&key=AIzaSyBr143lDEROCrUWdKvqPQmhQ5BoFo13oSE';
            var googleCSEconfig = '&num=10&searchType=image&fileType=jpg%2C+png%2C+bmp&imgType=photo&imgSize=large&filter=1';

            var f1 = '';
            var f2 = '';
            var f3 = '';
            var f4 = '';
            var f5 = '';
            var f6 = '';
            
            var keywords = '';
            if ($rootScope.cCategory) keywords = $rootScope.cCategory.keywords;
            //else keywords = $rootScope.cCategory.keywords;
            
            var data = [];
            
            //If used during add Answer use html input, if used during edit, use already stored value
            for (var i=0; i<fields.length; i++){
                if (type == 'edit') data[i] = fields[i].cval;
                else if (type == 'add') data[i] = fields[i].val;   
            }
            
            if (fields.length == 1){
                if (data[0]) f1 = data[0];
            }
            if (fields.length == 2){
                if (data[0]) f1 = data[0];
                if (data[1]) f2 = data[1];
            }
            if (fields.length == 3){
                if (data[0]) f1 = data[0];
                if (data[1]) f2 = data[1];
                if (data[2]) f3 = data[2];
            }
            if (fields.length > 3){
                if (data[0]) f1 = data[0];
                if (data[1]) f2 = data[1];
                if (data[2]) f3 = data[2];
                if (data[3]) f4 = data[3];
            }
            
            switch (attNum) {
                case 1: { searchQuery = 'q=' + f1 + ' ' + f2 + ' ' + keywords; break; }
                case 2: { searchQuery = 'q=' + f1 + ' ' + keywords; break; } 
                case 3: { searchQuery = 'q=' + f1 + ' ' + keywords; break; }
                case 4: { searchQuery = 'q=' + f1 + ' ' + f2 + ' ' + keywords; break; }
            }

            var url = googleAPIurl + searchQuery + googleCSEid + googleCSEconfig + googleAPI_KEY;

            //console.log('url', url);

            return $http.get(url);

        }

        function filterImageResults(_searchResults) {
            //Check results grab those with proper dimensions
            var _imageLinks = [];
            var sizeOk = false;
            var linkOk = false;
            var link_length = 0;
            var iheight = 0;
            var iwidth = 0;
            
            for (var i = 0; i < numRes; i++) {
                sizeOk = false;
                linkOk = false;
                iheight = _searchResults.data.items[i].image.height;
                iwidth = _searchResults.data.items[i].image.width;

                if (iwidth > iheight && (iwidth / iheight) < 1.8) sizeOk = true;

                link_length = _searchResults.data.items[i].link.length; 
                
                //check last character in result link is 'g' or 'p' (jpg, png or bmp)
                if (_searchResults.data.items[i].link[link_length - 1] == 'g' ||
                    _searchResults.data.items[i].link[link_length - 1] == 'p') linkOk = true;
                
                if (sizeOk && linkOk) {
                    var url = _searchResults.data.items[i].link;
                    //console.log('url result ', url);
                    _imageLinks.push(url);
                }
                //console.log('sizeok ', sizeOk, 'linkOk ', linkOk);
            }
            return _imageLinks;
        }
    }
})();
(function () {
    'use strict';

    angular
        .module('app')
        .service('htmlops', htmlops);

    htmlops.$inject = ['$rootScope'];

    function htmlops($rootScope) {

        var service = {

            specialHtml: specialHtml,
            eventHtml: eventHtml
        };

        return service;

        function specialHtml(x, sm) {
            var htmlmsg = '';
            var sch_str = '';
            if (x.freq == 'weekly') {
                var days_str = 'Every: ' +
                    (x.mon ? ' - Monday' : '') +
                    (x.tue ? ' - Tuesday' : '') +
                    (x.wed ? ' - Wednesday' : '') +
                    (x.thu ? ' - Thursday' : '') +
                    (x.fri ? ' - Friday' : '') +
                    (x.sat ? ' - Saturday' : '') +
                    (x.sun ? ' - Sunday' : '');
                sch_str = days_str + '<br>From: ' + x.stime2 + ' to ' + x.etime2;

                if (sm && days_str.length > 45) {

                    var lp = 0;
                    var newstr = '';
                    for (var n = 0; n < sch_str.length; n++) {
                        if (sch_str[n] == '-' && n < 45) lp = n;
                        if (sch_str[n] == '-' && n > 45) {
                            newstr = sch_str.substring(0, lp) + '<br>' + sch_str.substring(lp);
                            break;
                        }
                    }
                    sch_str = newstr;
                }
            }
            if (x.freq == 'onetime') {
                var sameday = (x.sdate == x.edate);
                if (sameday) {
                    sch_str = x.sdate + ' from ' + x.stime + ' to ' + x.etime;
                }
                else {
                    sch_str = 'Starts: ' + x.sdate + ' at ' + x.stime + '<br>Ends: ' + x.edate + ' at ' + x.etime;
                }
            }

            var cc = 0; //char count
            var newstr2 = '';
            if (x.details == undefined) x.details = '';
            if (sm && x.details.length > 45) {
                for (var n = 0; n < x.details.length; n++) {
                     if (cc > 42 && x.details[n] == ' ') {
                        newstr2 = newstr2 + '<br>';
                        cc = 0;
                     }
                        newstr2 = newstr2 + x.details[n];
                        cc++;
                }
            }
            else newstr2 = x.details;

            htmlmsg = '<div class="text-center">' + '<h3>' + x.stitle +
            '</h3><p>' + sch_str + '</p><p>' + newstr2 + '</p></div>';
            return htmlmsg;
        }
        
        function eventHtml(x, sm) {
            var htmlmessage = '';
            var sch_str = '';

            if (x.freq == 'weekly') {
                sch_str = 'Every: ' +
                (x.mon ? ' - Monday' : '') +
                (x.tue ? ' - Tuesday' : '') +
                (x.wed ? ' - Wednesday' : '') +
                (x.thu ? ' - Thursday' : '') +
                (x.fri ? ' - Friday' : '') +
                (x.sat ? ' - Saturday' : '') +
                (x.sun ? ' - Sunday' : '') +
                '<br>From: ' + x.stime2 + ' to ' + x.etime2;
            }
            if (x.freq == 'onetime') {
                var sameday = (x.sdate == x.edate);
                if (sameday) {
                    sch_str = x.sdate + ' from ' + x.stime + ' to ' + x.etime;
                }
                else {
                    sch_str = (x.edate == undefined ? '':'Starts: ') + x.sdate + ' at ' + x.stime +  
                              (x.edate == undefined ? '':('<br>Ends: ' + x.edate + ' at ' + x.etime)); 
                }
            }
            
            var cc = 0; //char count
            var newstr = '';
            if (x.addinfo == undefined) x.addinfo = '';
            if (sm && x.addinfo.length > 45) {
                for (var n = 0; n < x.addinfo.length; n++) {

                    if (cc > 42 && x.addinfo[n] == ' ') {
                        newstr = newstr + '<br>';
                        cc = 0;
                    }
                    newstr = newstr + x.addinfo[n];
                    cc++;
                }
            }
            

            htmlmessage = '<p><strong>' + x.name + '</strong></p>' + 
            '<p><strong>' + (x.location != undefined ? (' @ ' + x.location):('')) + '</strong></p>' + 
            (x.cityarea != undefined ? ('<p>in ' + x.cityarea+'</p>'):'') +
            '<p>' + sch_str + '</p>' + 
            (x.addinfo != undefined ? ('<p>' + newstr + '</p>'):(''))+
            (x.website != undefined ? ('<p>For more information: <a href="' + x.website + '">'+ x.website +'</a></p>'):(''))+
            '</div>';
            
            return htmlmessage;
        }

    }
})();
(function () {
    'use strict';

    angular
        .module('app')
        .service('getwiki', getwiki);

    getwiki.$inject = ['$rootScope', '$http', 'APP_API_KEY', 'GOOGLE_API_KEY','$cookies'];

    function getwiki($rootScope, $http, APP_API_KEY, GOOGLE_API_KEY, $cookies) {

        var service = {

            getWiki: getWiki
        };

        return service;

        function getWiki(answer) {

            delete $http.defaults.headers.common['X-Dreamfactory-API-Key'];
            delete $http.defaults.headers.common['X-DreamFactory-Session-Token'];
            
                var url = 'https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=extracts&list=&meta=&continue=&titles=' + answer;
                //console.log("url --- ", url);
                //return $http.get(url, {}, {
                return $http.post(url, {}, {   
                    headers: {
                        'Content-Type': 'multipart/form-data'
                        //'Access-Control-Allow-Headers': 'x-dreamfactory-api-key'
                    }
                }).then(function (result) {
                    //console.log("1. wiki results - ", result.query.pages[0].extract);
                    var wikiRaw = JSON.stringify(result.data.query.pages);
                    var wikiRes = wikiRaw.slice(wikiRaw.indexOf('<p><b>'),wikiRaw.indexOf('<h2>'));
                    wikiRes = wikiRes.replace(/<p>/g,'');
                    wikiRes = wikiRes.replace(/<\/p>/g,'');
                    wikiRes = wikiRes.replace(/<i>/g,'');
                    wikiRes = wikiRes.replace(/<\/i>/g,'');
                    wikiRes = wikiRes.replace(/<small>/g,'');
                    wikiRes = wikiRes.replace(/<\/small>/g,'');
                    wikiRes = wikiRes.replace(/<span title\=\\"Representation in the International Phonetic Alphabet \(IPA\)\\">/g,'');
                    wikiRes = wikiRes.replace(/<\/span>/g,'');
                    wikiRes = wikiRes.replace(/<b>/g,'');
                    wikiRes = wikiRes.replace(/<\/b>/g,'');
                    wikiRes = wikiRes.replace(/.\\n\\n/g,'.');
                    wikiRes = wikiRes.replace(/.\\n/g,'.');
                    wikiRes = wikiRes.replace(/<(?:.|\n)*?>/gm, '');

                    if ($rootScope.DEBUG_MODE) console.log("1. wiki results res - ", wikiRes);
                    //answer.location = result.data.results[0].formatted_address;
                    //answer.lat = result.data.results[0].geometry.location.lat;
                    //answer.lng = result.data.results[0].geometry.location.lng;

                    $http.defaults.headers.common['X-Dreamfactory-API-Key'] = APP_API_KEY;
                    $http.defaults.headers.common['X-DreamFactory-Session-Token'] = $cookies.session_token;
                    $rootScope.$emit('wikiReady', wikiRes);
                    //answer.updateAnswer(cAnswer.id,['lat','lng','location'],[lat,lng,fa]);
                });

            
        }
    }


})();
(function () {
    'use strict';

    angular
        .module('app')
        .service('getgps', getgps);

    getgps.$inject = ['$rootScope', '$http', 'APP_API_KEY', 'GOOGLE_API_KEY','$cookies','$state'];

    function getgps($rootScope, $http, APP_API_KEY, GOOGLE_API_KEY, $cookies, $state) {

        var service = {

            getLocationGPS: getLocationGPS
        };

        return service;

        function getLocationGPS(answer) {

            delete $http.defaults.headers.common['X-Dreamfactory-API-Key'];
            delete $http.defaults.headers.common['X-DreamFactory-Session-Token'];
            
            var myLoc = '';
                
                //Perform checks to make sure location is in recognizable format for google api
                var nhs = $rootScope.neighborhoods.concat($rootScope.districts);
                var locationHasNh = false; //location has neighborhood
                for (var i = 0; i < nhs.length; i++) {
                    if (answer.location.indexOf(nhs[i]) > -1) {
                        locationHasNh = true;
                        break;
                    }
                }    
                //if location does not contain any neighborhodd, add 'San Diego, CA'
                if (!locationHasNh && answer.location.indexOf('San Diego') < 0) {
                    myLoc = answer.location + ' San Diego, CA';
                }
                else myLoc = answer.location;
                //Remove '#' from address. This character causes error at google api
                myLoc = myLoc.replace('#','');

                //console.log("myLoc, GOOGLE_API_KEY --- ", myLoc, GOOGLE_API_KEY);
                var url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + myLoc + '&key=' + GOOGLE_API_KEY;
                //console.log("url --- ", url);
                return $http.get(url, {}, {   
                    headers: {
                        'Content-Type': 'multipart/form-data'
                        //'Access-Control-Allow-Headers': 'x-dreamfactory-api-key'
                    }
                }).then(function (result) {
                    answer.location = result.data.results[0].formatted_address;
                    answer.lat = result.data.results[0].geometry.location.lat;
                    answer.lng = result.data.results[0].geometry.location.lng;

                    $http.defaults.headers.common['X-Dreamfactory-API-Key'] = APP_API_KEY;
                    $http.defaults.headers.common['X-DreamFactory-Session-Token'] = $cookies.session_token;
                    
                    var isValid = (answer.location != undefined && answer.location != null &&
                        answer.lat != undefined && answer.lat != null &&
                        answer.lng != undefined && answer.lng != null);
                            
                    
                    if (isValid) {
                        if ($rootScope.coordForUSer){
                            $rootScope.currentUserLatitude = answer.lat;
                            $rootScope.currentUserLongitude = answer.lng;
                            $rootScope.coordForUSer = false;
                            $rootScope.coordsRdy = true;
                            $rootScope.$emit('coordsRdy');
                            if ($rootScope.loadFbnWhenCoordsRdy) $state.go('rankSummary', { index: 9521 });
                            if ($rootScope.loadRankWhenCoordsRdy) $state.reload();
                        }
                        else $rootScope.$emit('answerGPSready');
                    }
                    //answer.updateAnswer(cAnswer.id,['lat','lng','location'],[lat,lng,fa]);
                });

            
        }
    }


})();
(function () {
    'use strict';

    angular
        .module('app')
        .factory('flag', flag);

    flag.$inject = ['$http', '$q','$rootScope'];

    function flag($http, $q, $rootScope) {

        //Members
        var _flags = [];
        
        // Members
        var baseURI = '/api/v2/mysql/_table/flagtable';

        var service = {
            flagAnswer: flagAnswer,
            getFlags: getFlags
            
        };

        return service;
        
        function flagAnswer(type, id, flag) {
           
            //form match record
            var data = {};
            data.user = $rootScope.user.id;
            data.number = id;
            data.type = type;
			data.flag = flag;
			data.timestmp = Date.now();
             
            var obj = {};
            obj.resource = [];

            obj.resource.push(data);
            
            var url = baseURI;

            return $http.post(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                console.log("creating flag answer record was succesful");
                return result.data;
            }
        }
        
        function getFlags() {
            
            var url = baseURI;
            
            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                return _flags = result.data.resource;
            }
        }

        function _queryFailed(error) {

            throw error;
        }
    }
})();
(function () {
    'use strict';

    angular
        .module('app')
        .service('fileupload', fileupload);

    fileupload.$inject = ['$http', '$cookies', 'APP_API_KEY'];

    function fileupload($http, $cookies, APP_API_KEY) {
        this.uploadFileToUrl = function (file, uploadUrl) {
            //var fd = new FormData();
            //fd.append('file', file);
            
            delete $http.defaults.headers.common['X-Dreamfactory-API-Key'];
            delete $http.defaults.headers.common['X-DreamFactory-Session-Token'];
            delete $http.defaults.headers.common['Accept'];
            delete $http.defaults.headers.common['Accept-Language'];
            delete $http.defaults.headers.common['Accept-Encoding'];
            delete $http.defaults.headers.common['Referer'];
            delete $http.defaults.headers.common['origin'];
            delete $http.defaults.headers.common['Connection'];
            
            var STORAGE_ACCESS_KEY = 'XvsnVKjNv25OVh37Z6UviHjw0DCfo0V5XTXpxqktR9PxHBw==';
            var url = 'https://rankx.file.core.windows.net/sandiego/est/'+file.name;
            var now = new Date().toUTCString(); 
            console.log("date in UTC format --- ", now);
                         
            var canonicalizedHeader = "x-ms-date:"+ now + "\nx-ms-version:2015-02-21";
            var canonicalizedResource = "/sandiego/est/"+file.name;
            
            /*
            var StringToSign = "PUT"+"\n"+
            "gzip, deflate, br\n"+  //Content-Encoding
            "en-US,en;q=0.5\n"+  //Content-Language
            file.size+"\n"+ //Content-Length
            "\n"+ //Content-MD5
            "multipart/form-data\n"+ //Content-Type
            now+"\n"+  //Date
            "\n\n\n\n\n"+canonicalizedHeader+"\n"+canonicalizedResource;*/
            
            var StringToSign = "PUT" + "\n" +
               "\n" +
               "multipart/form-data\n" +
               "\n" +
               canonicalizedHeader + 
               canonicalizedResource;
            
            /*StringToSign = VERB + "\n" +
               Content-Encoding + "\n" +
               Content-Language + "\n" +
               Content-Length + "\n" +
               Content-MD5 + "\n" +
               Content-Type + "\n" +
               Date + "\n" +
               If-Modified-Since + "\n" +
               If-Match + "\n" +
               If-None-Match + "\n" +
               If-Unmodified-Since + "\n" +
               Range + "\n" +
               CanonicalizedHeaders + 
               CanonicalizedResource;*/         
               console.log("StringToSign",StringToSign);
               
               //Decode to UTF8- Storage Access Key 
               var keyWords = CryptoJS.enc.Base64.parse(STORAGE_ACCESS_KEY); //Parse Key on Base64
               var keyUTF8 = CryptoJS.enc.Utf8.stringify(keyWords.words); //Encode Key to UTF8
                
               var StringToSignUTF8 = CryptoJS.enc.Utf8.parse(StringToSign);
               var hash = CryptoJS.HmacSHA256(StringToSignUTF8.sigBytes, keyUTF8);
               var signature = CryptoJS.enc.Base64.stringify(hash);
               
               console.log("signature---",signature);
            
            return $http.put(url, file,{
                headers: { 
                    'Content-Type': "multipart/form-data",
                    //'Content-Type':"application/json;charset=utf-8",
                    'x-ms-date': now,
                    'x-ms-version': '2015-02-21',
                    Authorization: 'SharedKey rankx:'+signature,
                     }
                
            })
                .success(function (result) {
                    //console.log("result", result);
                      console.log("Uploading file was succesful");
                      //$http.defaults.headers.common['X-Dreamfactory-API-Key'] = APP_API_KEY;
                })
                .error(function (error) {
                    //console.log("error", error)
                    console.log("There was a problem uploading your file");
                    //$http.defaults.headers.common['X-Dreamfactory-API-Key'] = APP_API_KEY;
                });
        }                
    }
})();
(function () {
    'use strict';

    angular
        .module('app')
        .factory('file', file);

    file.$inject = ['$http', 'APP_API_KEY'];

    function file($http, APP_API_KEY) {

        // Members
        var baseUri = '/api/v2/files/images';

        var service = {
            uploadFile: uploadFile,
            getFile: getFile
        };

        return service;

        function uploadFile(myFile) {

            console.log("file", myFile);
            var url = baseUri + '/' + myFile.name;

            return $http.post(url, myFile, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            }).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                console.log("result", result);
                return result.data;
            }
        }

        function getFile(fileName) {
            var url = baseUri + '/' + encodeURIComponent(fileName);

            return $http.get(url, {
                params: {
                    "api_key": APP_API_KEY
                }
            }).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {
                
                return result.data;
            }
        }

        function _queryFailed(error) {

            console.log("Error: ", error)
            throw error;
        }
    }
})();
(function () {
    'use strict';

    angular
        .module('app')
        .factory('event', event);

    event.$inject = ['$http', '$q', '$rootScope','catans','vrows'];

    function event($http, $q, $rootScope,catans, vrows) {

        //Members
        var _events = [];
        var _selectedevent;
        var baseURI = '/api/v2/mysql/_table/events';

        var service = {
            getevents: getevents,
            getevent: getevent,
            addevent: addevent,
            update: update,
            deleteEvent: deleteEvent,
            flagEvent: flagEvent,                       
        };

        return service;
        

        function getevents(forceRefresh) {
            // console.log("getevents..._areeventsLoaded()", _areeventsLoaded());

            if (_areeventsLoaded() && !forceRefresh) {

                return $q.when(_events);
            }
            
            //Get all event records
            var url0 = baseURI + '?offset=' + 0 * 1000;
            var url1 = baseURI + '?offset=' + 1 * 1000;

            var p0 = $http.get(url0);
            var p1 = $http.get(url1);

            return $q.all([p0, p1]).then(function (d){
                _events = d[0].data.resource.concat(d[1].data.resource);
                if ($rootScope.DEBUG_MODE) console.log("No. events: ", _events.length);
                return _events;            
            }, _queryFailed);  

        }

        function getevent(id, forceRefresh) {

            if (_isSelectedeventLoaded(id) && !forceRefresh) {

                return $q.when(_selectedevent);
            }

            var url = baseURI + '/' + id;

            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                return _selectedevent = result.data;
            }
        }
        

        function addevent(event) {

            var url = baseURI;
            var resource = [];

            resource.push(event);

            return $http.post(url, resource, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: resource
            }).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                //update local copy
                var eventx = event;
                eventx.id = result.data.resource[0].id; 
                _events.push(eventx);
                                
               	return result.data;
            }

        }

        function update(event_id, field, val) {
           
            //form match record
            var obj = {};
            obj.resource = [];

            var data = {};
            data.id = event_id;
            
            for (var i=0; i<field.length; i++){
                switch (field[i]){
                    case "name": data.name = val[i]; break;
                    case "addinfo": data.addinfo = val[i]; break;
                    case "cityarea": data.cityarea = val[i]; break;
                    case "location": data.location = val[i]; break;
                    case "image": data.imageurl = val[i]; break;
                    case "views": data.views = val[i]; break;
                    case "owner": data.owner = val[i]; break;
                    case "website": data.website = val[i]; break;
                }
            }
            //console.log("data", data);
            obj.resource.push(data);

            var url = baseURI;
            
            //update local copy
            //var idx = _events.map(function(x) {return x.id; }).indexOf(event_id);
            //var idx = $rootScope.A.indexOf(+event_id);
            var idx = _events.map(function(x) {return x.id; }).indexOf(event_id);  
            for (var i=0; i<field.length; i++){
                switch (field[i]){
                    case "name": $rootScope.events[idx].name = val[i]; break;
                    case "addinfo": $rootScope.events[idx].addinfo = val[i]; break;
                    case "cityarea": $rootScope.events[idx].cityarea = val[i]; break;
                    case "location": $rootScope.events[idx].location = val[i]; break;
                    case "image": $rootScope.events[idx].imageurl = val[i]; break;
                    case "views": $rootScope.events[idx].views = val[i]; break;
                    case "lat": $rootScope.events[idx].lat = val[i]; break;
                    case "lng": $rootScope.events[idx].lng = val[i]; break;
                    case "owner": $rootScope.events[idx].owner = val[i]; break;
                    case "phone": $rootScope.events[idx].phone = val[i]; break;
                    case "website": $rootScope.events[idx].website = val[i]; break;
                    case "email": $rootScope.events[idx].email = val[i]; break;
                    case "strhours": $rootScope.events[idx].strhours = val[i]; break;
                }
            }                        
            
            return $http.patch(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                if ($rootScope.DEBUG_MODE) console.log("updating event succesful");
                return result.data;
            }
        }
        
        function flagEvent(event_id, flag) {
           
            //form match record
            var obj = {};
            obj.resource = [];

            var data = {};
            data.id = event_id;
            data.flag = flag

            //console.log("data", data);
            obj.resource.push(data);

            var url = baseURI;          
            
            return $http.patch(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                if ($rootScope.DEBUG_MODE) console.log(" event flagged succesful");
                return result.data;
            }
        }
        

        function deleteEvent(event_id) {
           
            //form match record
            var obj = {};
            obj.resource = [];

            var data = {};
            data.id = event_id;

            obj.resource.push(data);

            var url = baseURI + '/' + event_id;
            
            //update (delete event) local copy of events
            var i = _events.map(function(x) {return x.id; }).indexOf(event_id);
            if (i > -1) _events.splice(i,1);
            
            return $http.delete(url, data, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                if ($rootScope.DEBUG_MODE) console.log("Deleting event was succesful");
                return result.data;
            }
        }

        function _areeventsLoaded() {

            return _events.length > 0;
        }

        function _isSelectedeventLoaded(id) {

            return _selectedevent && _selectedevent.id == id;
        }

        function _queryFailed(error) {

            throw error;
        }

    }
})();
(function () {
    'use strict';

    angular
        .module('app')
        .factory('editvote', editvote);

    editvote.$inject = ['$http', '$q', '$rootScope','uaf'];

    function editvote($http, $q, $rootScope,uaf) {

        // Members
        var _editvotes = [];
        var baseURI = '/api/v2/mysql';

        var service = {
            loadEditVotesTable: loadEditVotesTable,
            patchEditVoteRec: patchEditVoteRec,
            postEditVoteRec: postEditVoteRec,
            deleteEditVotes: deleteEditVotes,
            deleteEditVotesbyAnswer: deleteEditVotesbyAnswer

        };

        return service;


        function loadEditVotesTable(forceRefresh) {

            if (_isEditVotesLoaded() && !forceRefresh) {

                return $q.when(_editvotes);
            }
            
            //Get all vote records for current user
            var url = baseURI + '/_table/editvotetable/?filter=user=' + $rootScope.user.id;

            return $http.get(url).then(querySucceeded, _queryFailed);
            
            function querySucceeded(result) {

                return _editvotes = result.data.resource;
            }

        }

        function postEditVoteRec(items) {
            
            //form match record
            var obj = {};
            obj.resource = [];

            obj.resource.push(items);

            var url = baseURI + '/_table/editvotetable';

            return $http.post(url, items, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: items
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {
                
                //update local copies
                var itemx = {};
                for (var i = 0; i < result.data.resource.length; i++) {
                    itemx = items[i];
                    itemx.id = result.data.resource[i].id;
                    _editvotes.push(itemx);

                    $rootScope.ceditvotes.push(itemx);
                    if (itemx.vote == 1) uaf.post('upVotedEdit',['answer', 'edit'],[itemx.answer, itemx.edit]); //user activity feed
                    if (itemx.vote == -1) uaf.post('downVotedEdit',['answer', 'edit'],[itemx.answer, itemx.edit]); //user activity feed
                }

                if ($rootScope.DEBUG_MODE) console.log("Creating new voting record for edit was succesful");
                return result.data;
            }
        }

        function patchEditVoteRec(rec_id, vote) {
            
            //form match record
            var obj = {};
            obj.resource = [];


            var data = {};
            data.id = rec_id;
            data.vote = vote;
            data.timestmp = Date.now();

            obj.resource.push(data);

            var url = baseURI + '/_table/editvotetable'; 
            
            //update local record of votes
            var i = _editvotes.map(function (x) { return x.id; }).indexOf(rec_id);
            _editvotes[i].vote = vote;
            _editvotes[i].timestmp = data.timestmp;

            return $http.patch(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                if ($rootScope.DEBUG_MODE) console.log("Updating vote record for edit was succesful");
                return result.data;
            }
        }
        function deleteEditVotesbyAnswer(answer_id) {
            
            //delete records from local copy
            for (var i = 0; i < _editvotes.length; i++) {
                if (_editvotes[i].answer == answer_id) {
                    _editvotes.splice(i, 1);
                }
            }

            var url = baseURI + '/_table/editvotetable?filter=answer=' + answer_id;

            return $http.delete(url).then(querySucceeded, _queryFailed);
            
            function querySucceeded(result) {

                if ($rootScope.DEBUG_MODE) console.log("Deleting edit vote records for answer was succesful");
                return result.data;
            }
        }

        function deleteEditVotes(edit_id) {
            
            //delete records from local copy
            for (var i = 0; i < _editvotes.length; i++) {
                if (_editvotes[i].edit == edit_id) {
                    _editvotes.splice(i, 1);
                }
            }

            var url = baseURI + '/_table/editvotetable?filter=edit=' + edit_id;

            return $http.delete(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                if ($rootScope.DEBUG_MODE) console.log("Deleting edit vote records for answer was succesful");
                return result.data;
            }
        }

        function _isEditVotesLoaded(id) {

            return _editvotes.length > 0;
        }
        function _queryFailed(error) {

            throw error;
        }

    }
})();
(function () {
    'use strict';

    angular
        .module('app')
        .factory('edit', edit);

    edit.$inject = ['$http', '$q', '$rootScope','uaf'];

    function edit($http, $q, $rootScope,uaf) {

        //Members
        var _edits = [];
        var baseURI = '/api/v2/mysql/_table/edittable';

        var service = {
            getEdits: getEdits,
            addEdit: addEdit,
            updateEdit: updateEdit,
            deleteEdit: deleteEdit,
            deleteEditbyAnswer: deleteEditbyAnswer
        };

        return service;

        function getEdits(forceRefresh) {
            // console.log("getAnswers..._areAnswersLoaded()", _areAnswersLoaded());

            if (_areEditsLoaded() && !forceRefresh) {

                 return $q.when(_edits);
            }

            var url = baseURI;

            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                return _edits = result.data.resource;
            }

        }

       function addEdit(newEdit) {

            var url = baseURI;
            var resource = [];

            resource.push(newEdit);

            return $http.post(url, resource, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: resource
            }).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                //update local copy
                var newEditx = newEdit;
                newEditx.id = result.data.resource[0].id; 
                _edits.push(newEditx);
                
                //$rootScope.edits.push(newEditx);
                uaf.post('editA',['answer', 'edit'],[newEditx.answer, newEditx.id]); //user activity feed 

                if ($rootScope.DEBUG_MODE) console.log("Adding new Edit succesful", result);
                return result.data;
            }

        }

        function updateEdit(edit_id, upV, downV) {
           
            //form match record
            var obj = {};
            obj.resource = [];

            var data = {};
            data.id = edit_id;
            data.upV = upV;
            data.downV = downV;

            obj.resource.push(data);

            var url = baseURI;

            return $http.patch(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                if ($rootScope.DEBUG_MODE) console.log("updating edit vote counts succesful");
                return result.data;
            }
        }

        function deleteEdit(edit_id) {
           
            //form match record
            var obj = {};
            obj.resource = [];

            var data = {};
            data.id = edit_id;

            obj.resource.push(data);

            var url = baseURI + '/' + edit_id;
            
            //update (delete answer) local copy of answers
            var i = _edits.map(function(x) {return x.id; }).indexOf(edit_id);
            if (i > -1) _edits.splice(i,1);
            
            
            return $http.delete(url, data, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                if ($rootScope.DEBUG_MODE) console.log("Deleting edit was succesful");
                return result.data;
            }
        }
        
        function deleteEditbyAnswer(answer_id) {
            
            //delete records from local copy
            for (var i = 0; i < _edits.length; i++) {
                if (_edits[i].answer == answer_id) {
                    _edits.splice(i, 1);
                }
            }

            var url = baseURI + '?filter=answer=' + answer_id;

            return $http.delete(url).then(querySucceeded, _queryFailed);
            
            function querySucceeded(result) {

                if ($rootScope.DEBUG_MODE) console.log("Deleting edits for answer was succesful");
                return result.data;
            }
        }
        

        function _areEditsLoaded() {

            return _edits.length > 0;
        }

        function _queryFailed(error) {

            throw error;
        }

    }
})();
(function () {
    'use strict';

    angular
        .module('app')
        .factory('dialog', dialog);

    dialog.$inject = ['$q', '$rootScope', 'useraccnt', 'imagelist', 'answer', 'login',
        '$window','$cookies', '$state']
    function dialog($q, $rootScope, useraccnt, imagelist, answer, login,
        $window, $cookies, $state) {

        var service = {
            editConfirm: editConfirm,
            getDialog: getDialog,
            showDialog: showDialog,
            howItWorks: howItWorks,
            addAnswer: addAnswer,
            showAddAnswer: showAddAnswer,
            editChangeEffective: editChangeEffective,
            checkSameAnswer: checkSameAnswer,
            showSameAnswer: showSameAnswer,
            deleteType: deleteType,
            deleteThisCatans: deleteThisCatans,
            deleteRank: deleteRank,
            getLocation: getLocation,
            url: url,
            createSpecialPreview: createSpecialPreview,
            bizRegistration: bizRegistration,
            bindAccount: bindAccount,
            addVRow: addVRow,
            deleteVRow: deleteVRow,
            addVRowGroup: addVRowGroup,
            editVRowGroup: editVRowGroup,
            deleteVRowGroup: deleteVRowGroup,
            showAddEvent: showAddEvent,
            createEventPreview: createEventPreview,
            askPermissionToLocate: askPermissionToLocate,
            askEmail: askEmail,
            seePhotos: seePhotos,
            loginFacebook: loginFacebook,
            shareOptions: shareOptions,
            tour: tour,
            unbindAccount: unbindAccount,
            confirmCancel: confirmCancel,
            editNumRanks: editNumRanks,
            editInfo: editInfo,
            notificationWithCallback: notificationWithCallback,
            enterPassword: enterPassword,
            chooseImgFromIgDlg: chooseImgFromIgDlg
        };

        return service;

        function showDialog(title, text) {
            BootstrapDialog.show({
                type: BootstrapDialog.TYPE_PRIMARY,
                title: title,
                message: text,
                buttons: [{
                    id: 'btn-ok',
                    label: 'OK',
                    cssClass: 'btn-primary',
                    autospin: false,
                    action: function (dialogRef) {
                        dialogRef.close();
                    }
                }]
            });
        }

        function getDialog(x) {

            var title = $rootScope.dialogs['dialog.' + x + '.title'];
            var text = $rootScope.dialogs['dialog.' + x + '.text'];

            showDialog(title, text);
        }


        function editConfirm(edit, type, callback) {

            var title = '';
            var message = '';
            var btnCancelLabel = '';
            var btnOkLabel = '';

            title = 'Please Confirm';
            btnCancelLabel = 'Cancel';
            btnOkLabel = 'Confirm';
            if (type == 'image') {
                message = 'You want to change the image of <strong><em>' + edit.name + '</em></strong> to this one: </br>' +
                '<img src=' + edit.imageURL + ' class="thumbnail" style="width:60%; max-height:150px">';
            }
            if (type == 'field' && edit.field != 'addinfo') {
                message = 'You want to change the <strong class="capitalize"><em>' + edit.field +
                '</em></strong> of <strong><em>' + edit.name + '</em></strong> to <strong><em>' + edit.nval + '</em></strong>.';
            }
            if (type == 'field' && edit.field == 'addinfo') {
                message = 'You want to change the information of ' +
                '<strong><em>' + edit.name + '</em></strong> to: <br><br>' + edit.nval + '</br>.';
            }

            BootstrapDialog.confirm({
                type: BootstrapDialog.TYPE_PRIMARY,
                title: title,
                message: message,
                closable: true, // <-- Default value is false
                draggable: true, // <-- Default value is false
                btnCancelLabel: btnCancelLabel,
                btnOKLabel: btnOkLabel,
                btnOKClass: 'btn-primary',
                btnCancelAction: function (dialogRef) {
                    dialogRef.close();
                },
                callback: function (result) {
                    if (result) callback(edit);
                }
            });

        }

        function addAnswer(answer, url, callback) {

            var answerhtml = '';
            var categoryhtml = '';
            var newline = '';
            var header = "table" + $rootScope.cCategory.id + ".header";

            for (var i = 0; i < $rootScope.fields.length; i++) {
                switch ($rootScope.fields[i].name) {
                    case "name": {
                        newline = '<strong class="capitalize">' + 'Name' + '</strong>: ' + answer.name + '</br>';
                        break;
                    }
                    case "location": {
                        if (answer.location) newline = '<strong class="capitalize">' + 'Location' + '</strong>: ' + answer.location + '</br>';
                        else newline = '<strong>' + 'Location' + '</strong>: ' + '' + '</br>';
                        break;
                    }
                    case "cityarea": {
                        //newline = '<strong class="capitalize">'+addinfo+'</strong>: ' + $rootScope.cCountries[answer.cnum] + '</br>';
                        newline = '<strong class="capitalize">' + 'City Area' + '</strong>: ' + answer.cityarea + '</br>';
                        break;
                    }
                    case "addinfo": {
                        if (answer.addinfo) newline = '<strong class="capitalize">' + 'Additional Info' + '</strong>: ' + answer.addinfo + '</br>';
                        else newline = '<strong>' + 'Additional Info' + '</strong>: ' + '' + '</br>';
                        break;
                    }
                    case "phone": {
                        if (answer.phone) newline = '<strong class="capitalize">' + 'Phone' + '</strong>: ' + answer.phone + '</br>';
                        else newline = '<strong>' + 'Phone' + '</strong>: ' + '' + '</br>';
                        break;
                    }
                    case "website": {
                        if (answer.website) newline = '<strong class="capitalize">' + 'Website' + '</strong>: ' + answer.website + '</br>';
                        else newline = '<strong>' + 'Website' + '</strong>: ' + '' + '</br>';
                        break;
                    }
                    case "email": {
                        if (answer.email) newline = '<strong class="capitalize">' + 'Email' + '</strong>: ' + answer.email + '</br>';
                        else newline = '<strong>' + 'Email' + '</strong>: ' + '' + '</br>';
                        break;
                    }
                }
                answerhtml = answerhtml + newline;
            }

            showAddAnswer(answer, categoryhtml, answerhtml, url, callback);
            //console.log("headline ", categoryhtml)
       
        }
        function showAddAnswer(answer, categoryhtml, answerhtml, imageurl, callback) {

            var title = '';
            var message = '';
            var btnCancelLabel = '';
            var btnOkLabel = '';

            title = 'Please Confirm';
            btnCancelLabel = 'Cancel';
            btnOkLabel = 'Confirm';
            message = 'You want to add the following answer to <strong>' + $rootScope.cCategory.title + '</strong>. </br></br>' +
            answerhtml + '</br>' +
            'With the following image:' +
            '<img src=' + imageurl + ' class="thumbnail" style="width:60%; max-height:150px">';

            BootstrapDialog.confirm({
                type: BootstrapDialog.TYPE_PRIMARY,
                title: title,
                message: message,
                closable: true, // <-- Default value is false
                draggable: true, // <-- Default value is false
                btnCancelLabel: btnCancelLabel,
                btnOKLabel: btnOkLabel,
                btnOKClass: 'btn-primary',
                btnCancelAction: function (dialogRef) {
                    dialogRef.close();
                },
                //callback: function (dialogRef, result) {
                callback: function (result) {
                    if (result) callback(answer);
                    //dialogRef.close();
                }
            });
        }

        function editChangeEffective(edit, index, type, callback) {

            var title = '';
            var message = '';

            if (type == 'approve' && edit.field != 'addinfo') {

                title = 'Changed Approved';
                message = 'Congrats! With your vote, the change of <strong>' + edit.field + '</strong> of <strong>' +
                edit.name + '</strong> to <strong>' + edit.nval + '</strong> gets approved.';

            }

            if (type == 'approve' && edit.field == 'addinfo') {

                title = 'Changed Approved';
                message = 'Congrats! With your vote, the information of <strong>' +
                edit.name + '</strong> to <br><br>' + edit.nval + '</br> gets approved.';

            }

            if (type == 'reject') {

                title = 'Changed Rejected';
                message = 'Congrats! With your vote, the change of <strong>' + edit.field + '</strong> of <strong>' +
                edit.name + '</strong> to <strong>' + edit.nval + '</strong> has been rejected.';

            }

            BootstrapDialog.show({
                type: BootstrapDialog.TYPE_PRIMARY,
                title: title,
                message: message,
                buttons: [{
                    id: 'btn-ok',
                    label: 'OK',
                    cssClass: 'btn-primary',
                    autospin: false,
                    action: function (dialogRef, result) {
                        callback(index, type);
                        dialogRef.close();
                    }
                }]
            });
        }

        function howItWorks(type) {
            var message = '';
            var title = '';

            if (type == 'editAnswer') {
                title = 'Information Edits';
                message = 'Use edits to correct, add or update information in a profile. ' +
                'All edits need to be accepted by other users before they are approved. </br></br>' +
                'An edit or change becomes approved when the number of people that agree exceeds the number of people that disagree by 3. ' +
                '</br></br>An edit or change gets rejected when the number of people that disagree exceeds those that agree by 3. ' +
                '</br></br> Only one edit per field at a time is allowed. Make sure you vote on the edits you agree or disagree.';
            }
            if (type == 'addAnswer') {
                title = 'Add a new answer';
                message = '1. Fill out the form. The fields marked with ** are required. All other fields are not required but recommended. <br/>' +
                '<br/>2. Click the \'Get Images\' button. <br/>' +
                '<br/>3. Use \'>>\' and \'<<\' buttons to browse through the images. You can \'Get More Images\' button to load more images.<br/>' +
                '<br/>4. When the image you want shows in the image box, click the button \'Add\' to add the new answer' +
                ' to the list.<br/>' +
                '<br/>NOTE: Not all images will correspond to your answer. Entering all fields will help with the image results.';
            }
            if (type == 'shortPhrase') {
                title = 'Add an Answer';
                message = 'Fill out the form. The fields marked with ** are required. <br/>' +
                '<br/> - The <strong>Title</strong> is the main idea of your answer. <br/>' +
                '<br/> - In the <strong>Details</strong> box, write additional details about your answer.' +
                ' You can also write arguments on why it should be included in this list.<br/>' +
                '<br/>For example: <br/>' +
                '<br/>In the rank <strong><em>Reasons why dogs are awesome</em></strong> you can add following answer: <br/>' +
                '<br/><strong>Title:</strong> They enjoy the simple things in life <br/>' +
                '<br/><strong>Details:</strong> Dogs dont need much to be happy, they are happy with simple things ' +
                'like a belly rub, a walk around the block, playing in the snow or going for a drive.';
            }

            BootstrapDialog.show({
                type: BootstrapDialog.TYPE_PRIMARY,
                title: title,
                message: message,
                buttons: [{
                    id: 'btn-ok',
                    label: 'OK',
                    cssClass: 'btn-primary',
                    autospin: false,
                    action: function (dialogRef) {
                        dialogRef.close();
                    }
                }]
            });
        }

        function url(link) {
            BootstrapDialog.show({
                type: BootstrapDialog.TYPE_PRIMARY,
                title: "Image URL",
                message: link,
                buttons: [{
                    id: 'btn-ok',
                    label: 'OK',
                    cssClass: 'btn-primary',
                    autospin: false,
                    action: function (dialogRef) {
                        dialogRef.close();
                    }
                }]
            });
        }

        function checkSameAnswer(answer1, answer2, callback1, callback2) {

            var answerhtml = '';
            var answerhtml2 = '';
            var newline = '';
            var newline2 = '';

            for (var i = 0; i < $rootScope.fields.length; i++) {
                switch ($rootScope.fields[i].name) {
                    case "name": {
                        newline = '<strong class="capitalize">' + 'Name' + '</strong>: ' + answer1.name + '</br>';
                        newline2 = '<strong class="capitalize">' + 'Name' + '</strong>: ' + answer2.name + '</br>';
                        break;
                    }
                    case "location": {
                        if (answer1.location) newline = '<strong class="capitalize">' + 'Location' + '</strong>: ' + answer1.location + '</br>';
                        else newline = '<strong>' + 'Location' + '</strong>: ' + '' + '</br>';
                        if (answer2.location) newline2 = '<strong class="capitalize">' + 'Location' + '</strong>: ' + answer2.location + '</br>';
                        else newline2 = '<strong>' + 'Location' + '</strong>: ' + '' + '</br>';
                        break;
                    }
                    case "cityarea": {
                        //newline = '<strong class="capitalize">'+addinfo+'</strong>: ' + $rootScope.cCountries[answer.cnum] + '</br>';
                        newline = '<strong class="capitalize">' + 'City Area' + '</strong>: ' + answer1.cityarea + '</br>';
                        newline2 = '<strong class="capitalize">' + 'City Area' + '</strong>: ' + answer2.cityarea + '</br>';
                        break;
                    }
                    case "addinfo": {
                        if (answer1.addinfo) newline = '<strong class="capitalize">' + 'Additional Info' + 'b</strong>: ' + answer1.addinfo + '</br>';
                        else newline = '<strong>' + 'Additional Info' + '</strong>: ' + '' + '</br>';
                        if (answer2.addinfo) newline2 = '<strong class="capitalize">' + 'Additional Info' + 'b</strong>: ' + answer2.addinfo + '</br>';
                        else newline2 = '<strong>' + 'Additional Info' + '</strong>: ' + '' + '</br>';
                        break;
                    }
                    case "phone": {
                        if (answer1.phone) newline = '<strong class="capitalize">' + 'Phone' + 'b</strong>: ' + answer1.phone + '</br>';
                        else newline = '<strong>' + 'Phone' + '</strong>: ' + '' + '</br>';
                        if (answer2.phone) newline2 = '<strong class="capitalize">' + 'Phone' + 'b</strong>: ' + answer2.phone + '</br>';
                        else newline2 = '<strong>' + 'Phone' + '</strong>: ' + '' + '</br>';
                        break;
                    }
                    case "website": {
                        if (answer1.website) newline = '<strong class="capitalize">' + 'Website' + 'b</strong>: ' + answer1.website + '</br>';
                        else newline = '<strong>' + 'Website' + '</strong>: ' + '' + '</br>';
                        if (answer2.website) newline2 = '<strong class="capitalize">' + 'Website' + 'b</strong>: ' + answer2.website + '</br>';
                        else newline2 = '<strong>' + 'Website' + '</strong>: ' + '' + '</br>';
                        break;
                    }
                    case "email": {
                        if (answer1.email) newline = '<strong class="capitalize">' + 'Email' + 'b</strong>: ' + answer1.email + '</br>';
                        else newline = '<strong>' + 'Email' + '</strong>: ' + '' + '</br>';
                        if (answer2.email) newline2 = '<strong class="capitalize">' + 'Email' + 'b</strong>: ' + answer2.email + '</br>';
                        else newline2 = '<strong>' + 'Email' + '</strong>: ' + '' + '</br>';
                        break;
                    }
                }
                answerhtml = answerhtml + newline;
                answerhtml2 = answerhtml2 + newline2;
            }

            showSameAnswer(answer1, answerhtml, answer2, answerhtml2, callback1, callback2);
            //console.log("headline ", categoryhtml)
       
        }
        function showSameAnswer(answer1, answerhtml, answer2, answerhtml2, callback1, callback2) {

            var title = '';
            var message = '';
            var btnCancelLabel = '';
            var btnOkLabel = '';

            title = 'Just checking';
            btnCancelLabel = 'No, they are different';
            btnOkLabel = 'Yeah, same';
            message = 'Are these the same ' + $rootScope.cCategory.type + '? </br></br><div class="row">' +
            '<div class="col-sm-6">' + answerhtml + '</br>' +
            '<img src=' + answer1.imageurl + ' class="thumbnail" style="width:60%; max-height:150px"></div>' +

            '<div class="col-sm-6">' + answerhtml2 + '</br>' +
            '<img src=' + answer2.imageurl + ' class="thumbnail" style="width:60%; max-height:150px"></div>' +
            '</div>';

            BootstrapDialog.confirm({
                type: BootstrapDialog.TYPE_PRIMARY,
                title: title,
                message: message,
                closable: true, // <-- Default value is false
                draggable: true, // <-- Default value is false
                btnCancelLabel: btnCancelLabel,
                btnOKLabel: btnOkLabel,
                btnOKClass: 'btn-primary',
                btnCancelAction: function (dialogRef) {
                    dialogRef.close();
                },
                //callback: function (dialogRef, result) {
                callback: function (result) {
                    if (result) callback2();
                    else callback1(answer1);

                }
            });
        }

        function deleteType(thisCatOnly, everywhere) {

            var title = '';
            var message = '';
            var btnCancelLabel = '';
            var btnOkLabel = '';

            title = 'Scope of Delete';
            btnCancelLabel = 'Just in the category: ' + $rootScope.cCategory.title;
            btnOkLabel = 'Everywhere';
            message = 'Choose scope to delete:';

            BootstrapDialog.confirm({
                type: BootstrapDialog.TYPE_DANGER,
                title: title,
                message: message,
                closable: true, // <-- Default value is false
                draggable: true, // <-- Default value is false
                btnCancelLabel: btnCancelLabel,
                btnOKLabel: btnOkLabel,
                btnOKClass: 'btn-primary',
                btnCancelAction: function (dialogRef) {
                    dialogRef.close();
                },
                //callback: function (dialogRef, result) {
                callback: function (result) {
                    if (result) everywhere();
                    else thisCatOnly();

                }
            });
        }

        function deleteThisCatans(answer, category, callback) {
            var title = '';
            var message = '';
            var btnCancelLabel = '';
            var btnOkLabel = '';

            title = 'Confirm Delete';
            btnCancelLabel = 'Cancel';
            btnOkLabel = 'Delete';
            message = 'This will delete the CatAns record for <strong>' + answer +
            '</strong> in the category of <strong>' + category + '</strong>.';

            BootstrapDialog.confirm({
                type: BootstrapDialog.TYPE_DANGER,
                title: title,
                message: message,
                closable: true, // <-- Default value is false
                draggable: true, // <-- Default value is false
                btnCancelLabel: btnCancelLabel,
                btnOKLabel: btnOkLabel,
                btnOKClass: 'btn-primary',
                btnCancelAction: function (dialogRef) {
                    dialogRef.close();
                },
                //callback: function (dialogRef, result) {
                callback: function (result) {
                    if (result) callback();
                }
            });
        }

        function createSpecialPreview(x, addSpecial) {
            var title = '';
            var message = '';
            var htmlmsg = '';
            var btnCancelLabel = '';
            var btnOkLabel = '';
            var sch_str = '';

            title = 'Special Preview';
            btnCancelLabel = 'Back';
            btnOkLabel = 'Save Special';
            if (x.freq == 'weekly') {
                sch_str = 'Every: ' +
                (x.mon ? ' - Monday' : '') +
                (x.tue ? ' - Tuesday' : '') +
                (x.wed ? ' - Wednesday' : '') +
                (x.thu ? ' - Thursday' : '') +
                (x.fri ? ' - Friday' : '') +
                (x.sat ? ' - Saturday' : '') +
                (x.sun ? ' - Sunday' : '') +
                '<br>From: ' + x.stime2 + ' to ' + x.etime2;
            }
            if (x.freq == 'onetime') {
                var sameday = (x.sdate == x.edate);
                if (sameday) {
                    sch_str = x.sdate + ' from ' + x.stime + ' to ' + x.etime;
                }
                else {
                    sch_str = 'Starts: ' + x.sdate + ' at ' + x.stime + '<br>Ends: ' + x.edate + ' at ' + x.etime;
                }
            }

            message = 'This is how this special will look: </br></br>In the ranking summary:<br>' +
            '<table class="table table-hover cursor ">' +
            '<thead><tr><th>Rank</th><th>Name</th><th>Distance</th><th>Specials</th>' +
            '</tr></thead><tbody><tr><td>1</td><td>' + x.name + '</td><td>1.5</td>' +
            '<td style="background-color:' + x.bc + ';color:' + x.fc + ';">' + x.stitle + '<td></tr></tbody></table><br>' +
            'Inside your business profile:<br><br><div style="background-color:' + x.bc + ';color:' + x.fc + ';">' +
            '<p><strong>' + x.stitle + ' @ ' + x.name + '</strong></p><p>' + sch_str + '</p><p>' + x.details + '</p></div>' +
            '</br>' +
            'With the following image:' +
            '<img src=' + x.image + ' class="thumbnail" style="width:70%; max-height:150px">';

            BootstrapDialog.confirm({
                type: BootstrapDialog.TYPE_PRIMARY,
                title: title,
                message: message,
                closable: true, // <-- Default value is false
                draggable: true, // <-- Default value is false
                btnCancelLabel: btnCancelLabel,
                btnOKLabel: btnOkLabel,
                btnOKClass: 'btn-primary',
                btnCancelAction: function (dialogRef) {
                    dialogRef.close();
                },
                //callback: function (dialogRef, result) {
                callback: function (result) {
                    if (result) addSpecial();
                    //else callback1(answer1);
                    
                }
            });
        }

        function deleteRank(x,callback,isSpecial) {

            var title = '';
            var message = '';
            var btnCancelLabel = '';
            var btnOkLabel = '';

            title = 'Yes, Delete';
            btnCancelLabel = 'Cancel';
            btnOkLabel = 'Delete';
            if (isSpecial)
            message = 'Just confirming, do you want to delete the special <strong>' + x.stitle +'</strong>?';
            else
            message = 'Just confirming, do you want to delete the ranking <strong>' + x.title +'</strong>?';
            
            BootstrapDialog.confirm({
                type: BootstrapDialog.TYPE_DANGER,
                title: title,
                message: message,
                closable: true, // <-- Default value is false
                draggable: true, // <-- Default value is false
                btnCancelLabel: btnCancelLabel,
                btnOKLabel: btnOkLabel,
                btnOKClass: 'btn-primary',
                btnCancelAction: function (dialogRef) {
                    dialogRef.close();
                },
                //callback: function (dialogRef, result) {
                callback: function (result) {
                    if (result) callback();
                }
            });
        }

        function getLocation(callback) {

            var title = '';
            var message = '';
            var btnCancelLabel = '';
            var btnOkLabel = '';

            title = 'Share Location';
            btnCancelLabel = 'Not Now';
            btnOkLabel = 'Ok';
            message = 'Please allow browser share location so we can calculate distance to the best places.';

            BootstrapDialog.confirm({
                type: BootstrapDialog.TYPE_PRIMARY,
                title: title,
                message: message,
                closable: true, // <-- Default value is false
                draggable: true, // <-- Default value is false
                btnCancelLabel: btnCancelLabel,
                btnOKLabel: btnOkLabel,
                btnOKClass: 'btn-primary',
                btnCancelAction: function (dialogRef) {
                    dialogRef.close();
                },
                callback: function (result) {
                    if (result) callback();
                }
            });


        }

        function bizRegistration(callback) {

            var title = '';
            var message = '';
            var btnCancelLabel = '';
            var btnOkLabel = '';

            title = 'Do you own this business?';
            btnCancelLabel = 'Cancel';
            btnOkLabel = 'Bind';
            message = 'If you own or represent this business, please bind to your account so only you can change or edit its information.' +
            '<br><br><strong>* Name of Business</strong>' +
            '<br><strong>* Address</strong>' +
            '<br><strong>* Phone Number</strong>' +
            '<br><strong>* Main Photo</strong>' +
            '<br><strong>* Hours</strong>' +
            '<br><br>Binding this business to your account is free.';

            BootstrapDialog.confirm({
                type: BootstrapDialog.TYPE_PRIMARY,
                title: title,
                message: message,
                closable: true, // <-- Default value is false
                draggable: true, // <-- Default value is false
                btnCancelLabel: btnCancelLabel,
                btnOKLabel: btnOkLabel,
                btnOKClass: 'btn-primary',
                btnCancelAction: function (dialogRef) {
                    dialogRef.close();
                },
                callback: function (result) {
                    if (result) callback();
                }
            });

        }

        function bindAccount(name, business, callback) {

            var title = '';
            var message = '';
            var btnCancelLabel = '';
            var btnOkLabel = '';

            title = 'Confirmation';
            btnCancelLabel = 'Cancel';
            btnOkLabel = 'Yes, bind this business to my account';
            message = '<br><strong>Note:</strong> Claiming to have false authority over a business is against the law.' +
            '<br><br>Please confirm:' +
            '<br><br>' +
            'You, <strong>' + name + '</strong>, have the authority to represent <strong>' + business + '</strong>.';

            BootstrapDialog.confirm({
                type: BootstrapDialog.TYPE_PRIMARY,
                title: title,
                message: message,
                closable: true, // <-- Default value is false
                draggable: true, // <-- Default value is false
                btnCancelLabel: btnCancelLabel,
                btnOKLabel: btnOkLabel,
                btnOKClass: 'btn-primary',
                btnCancelAction: function (dialogRef) {
                    dialogRef.close();
                },
                callback: function (result) {
                    if (result) callback();
                }
            });

        }

        function addVRow(x, callback) {

            var title = '';
            var message = '';
            var btnCancelLabel = '';
            var btnOkLabel = '';

            title = 'Enter Data';
            btnCancelLabel = 'Cancel';
            btnOkLabel = 'Add';
            message = '<br> Enter new vote row to be added in Group: <strong>' + x.gtitle + '</strong>' +
            '<br><br>Vote Row Name:' +
            '<input class="form-control" type="text" placeholder="Enter Vote Row Name">' +
            '<br><br>';
            BootstrapDialog.show({
                type: BootstrapDialog.TYPE_PRIMARY,
                title: title,
                message: message,
                closable: true, // <-- Default value is false
                draggable: true, // <-- Default value is false
                
                buttons: [{
                    label: 'Cancel',
                    action: function (dialogRef) {
                        //console.log("dialogRef2---", dialogRef);
                        dialogRef.close();
                    },
                },
                    {
                        label: 'OK',
                        action: function (dialogRef, result) {
                            //console.log("dialogRef---", dialogRef);
                            var vrowname = dialogRef.getModalBody().find('input').val();
                            if (result) callback(x, vrowname);
                            dialogRef.close();
                        },
                    }]
            });
        }

        function deleteVRow(x, callback) {

            var title = '';
            var message = '';
            var btnCancelLabel = '';
            var btnOkLabel = '';

            title = 'Please Confirm';
            btnCancelLabel = 'Cancel';
            btnOkLabel = 'Yes, Delete';
            message = '<br>Please confirm, you want to delete vote row <strong>' + x.title +
            '</strong> from <strong>' + x.gtitle + '</strong>.' +
            '<br><br><strong>Note:</strong> All vote records will be lost';

            BootstrapDialog.confirm({
                type: BootstrapDialog.TYPE_DANGER,
                title: title,
                message: message,
                closable: true, // <-- Default value is false
                draggable: true, // <-- Default value is false
                btnCancelLabel: btnCancelLabel,
                btnOKLabel: btnOkLabel,
                btnOKClass: 'btn-default',
                btnCancelAction: function (dialogRef) {
                    dialogRef.close();
                },
                callback: function (result) {
                    if (result) callback(x);
                }
            });
        }

        function addVRowGroup(x, callback) {

            var title = '';
            var message = '';
            var btnCancelLabel = '';
            var btnOkLabel = '';

            title = 'Enter Data';
            btnCancelLabel = 'Cancel';
            btnOkLabel = 'Add';
            message = '<br>Enter name of Vote Group you want to create: ' +
            '<br><br>Group Name:' +
            '<input class="form-control" type="text" placeholder="Enter Vote Row Group Name">' +
            '<br><br>';
            BootstrapDialog.show({
                type: BootstrapDialog.TYPE_PRIMARY,
                title: title,
                message: message,
                closable: true, // <-- Default value is false
                draggable: true, // <-- Default value is false
                
                buttons: [{
                    label: 'Cancel',
                    action: function (dialogRef) {
                        //console.log("dialogRef2---", dialogRef);
                        dialogRef.close();
                    },
                },
                    {
                        label: 'OK',
                        action: function (dialogRef, result) {
                            //console.log("dialogRef---", dialogRef);
                            var vrowgroupname = dialogRef.getModalBody().find('input').val();
                            if (result) callback(x, vrowgroupname);
                            dialogRef.close();
                        },
                    }]
            });
        }

        function editVRowGroup(x, callback, callback2) {

            var title = '';
            var message = '';
            var btnCancelLabel = '';
            var btnOkLabel = '';

            title = 'Enter Data';
            btnCancelLabel = 'Cancel';
            btnOkLabel = 'Edit';
            message = '<br>Enter new name of Vote Group: ' +
            '<br><br>Group Name:' +
            '<input class="form-control" type="text" placeholder="' + x.gtitle + '">' +
            '<br><br>';
            BootstrapDialog.show({
                type: BootstrapDialog.TYPE_PRIMARY,
                title: title,
                message: message,
                closable: true, // <-- Default value is false
                draggable: true, // <-- Default value is false
                
                buttons: [{
                    label: 'Cancel',
                    action: function (dialogRef) {
                        //console.log("dialogRef2---", dialogRef);
                        dialogRef.close();
                    },
                },
                    {
                        label: 'Edit',
                        action: function (dialogRef, result) {
                            //console.log("dialogRef---", dialogRef);
                            var vrowgroupname = dialogRef.getModalBody().find('input').val();
                            if (result) callback(x, vrowgroupname);
                            dialogRef.close();
                        },
                    },
                    {
                        label: 'Delete',
                        action: function (dialogRef, result) {
                            //console.log("dialogRef---", dialogRef);
                            if (result) callback2(x);
                            dialogRef.close();
                        },
                    }
                ]
            });
        }

        function deleteVRowGroup(x, callback) {

            var title = '';
            var message = '';
            var btnCancelLabel = '';
            var btnOkLabel = '';

            title = 'Please Confirm';
            btnCancelLabel = 'Cancel';
            btnOkLabel = 'Yes, Delete';
            message = '<br>Please confirm, you want to delete the vote group <strong>' + x.gtitle +
            '</strong> and all the items within it.' +
            '<br><br><strong>Note:</strong> All vote records for all items will be lost';

            BootstrapDialog.confirm({
                type: BootstrapDialog.TYPE_DANGER,
                title: title,
                message: message,
                closable: true, // <-- Default value is false
                draggable: true, // <-- Default value is false
                btnCancelLabel: btnCancelLabel,
                btnOKLabel: btnOkLabel,
                btnOKClass: 'btn-default',
                btnCancelAction: function (dialogRef) {
                    dialogRef.close();
                },
                callback: function (result) {
                    if (result) callback(x);
                }
            });
        }

        function createEventPreview(event, callback) {

            var answerhtml = '';
            var newline = '';
            //var header = "table" + $rootScope.cCategory.id + ".header";
            for (var i = 0; i < $rootScope.fields.length; i++) {
                switch ($rootScope.fields[i].name) {
                    case "name": {
                        newline = '<strong class="capitalize">' + 'Name' + '</strong>: ' + event.name + '</br>';
                        break;
                    }
                    case "location": {
                        if (event.location) newline = '<strong class="capitalize">' + 'Location' + '</strong>: ' + event.location + '</br>';
                        else newline = '<strong>' + 'Location' + '</strong>: ' + '' + '</br>';
                        break;
                    }
                    case "cityarea": {
                        newline = '<strong class="capitalize">' + 'City Area' + '</strong>: ' + event.cityarea + '</br>';
                        break;
                    }
                    case "addinfo": {
                        if (event.addinfo) newline = '<strong class="capitalize">' + 'Additional Info' + '</strong>: ' + event.addinfo + '</br>';
                        else newline = '<strong>' + 'Additional Info' + '</strong>: ' + '' + '</br>';
                        break;
                    }
                    case "website": {
                        if (event.website) newline = '<strong class="capitalize">' + 'Website' + '</strong>: ' + event.website + '</br>';
                        else newline = '<strong>' + 'Website' + '</strong>: ' + '' + '</br>';
                        break;
                    }
                    case "date": {
                        if (event.date) newline = '<strong class="capitalize">' + 'Date' + '</strong>: ' + event.sdate + '</br>';
                        else newline = '<strong>' + 'Date' + '</strong>: ' + '' + '</br>';
                        break;
                    }

                }
                answerhtml = answerhtml + newline;
            }

            var addinfomessage = '';
            var sch_str = '';

            if (event.freq == 'weekly') {
                sch_str = 'Every: ' +
                (event.mon ? ' - Monday' : '') +
                (event.tue ? ' - Tuesday' : '') +
                (event.wed ? ' - Wednesday' : '') +
                (event.thu ? ' - Thursday' : '') +
                (event.fri ? ' - Friday' : '') +
                (event.sat ? ' - Saturday' : '') +
                (event.sun ? ' - Sunday' : '') +
                '<br>From: ' + event.stime2 + ' to ' + event.etime2;
            }
            if (event.freq == 'onetime') {
                var sameday = (event.sdate == event.edate);
                if (sameday) {
                    sch_str = event.sdate + ' from ' + event.stime + ' to ' + event.etime;
                }
                else {
                    sch_str = (event.edate == undefined ? '' : 'Starts: ') + event.sdate + ' at ' + event.stime +
                    (event.edate == undefined ? '' : ('<br>Ends: ' + event.edate + ' at ' + event.etime));
                }
            }

            addinfomessage = '<div style="background-color:' + event.bc + ';color:' + event.fc + ';">' +
            '<p><strong>' + event.name +
            (event.location != undefined ? (' @ ' + event.location) : ('')) + '</strong></p>' +
            (event.cityarea != undefined ? ('<p>in ' + event.cityarea + '</p>') : '') +
            '<p>' + sch_str + '</p>' +
            (event.addinfo != undefined ? ('<p>' + event.addinfo + '</p>') : ('')) +
            (event.website != undefined ? ('<p>For more information: <a href="' + event.website + '">' + event.website + '</a></p>') : ('')) +
            '</div>';

            showAddEvent(event, answerhtml, addinfomessage, event.imageurl, callback);
            //console.log("headline ", categoryhtml)
       
        }
        function showAddEvent(event, answerhtml, addinfomessage, imageurl, callback) {

            var title = '';
            var message = '';
            var btnCancelLabel = '';
            var btnOkLabel = '';

            title = 'Please Confirm';
            btnCancelLabel = 'Cancel';
            btnOkLabel = 'Confirm';
            message = 'You want to add the following event to <strong>' + $rootScope.cCategory.title + '</strong>. </br><p></p>' +
            addinfomessage + '</br>' +
            'With the following image:' +
            '<img src=' + imageurl + ' class="thumbnail" style="width:60%; max-height:150px">';

            BootstrapDialog.confirm({
                type: BootstrapDialog.TYPE_PRIMARY,
                title: title,
                message: message,
                closable: true, // <-- Default value is false
                draggable: true, // <-- Default value is false
                btnCancelLabel: btnCancelLabel,
                btnOKLabel: btnOkLabel,
                btnOKClass: 'btn-primary',
                btnCancelAction: function (dialogRef) {
                    dialogRef.close();
                },
                //callback: function (dialogRef, result) {
                callback: function (result) {
                    if (result) callback(event);
                    //dialogRef.close();
                }
            });

        }
        /*
        function askPermissionToLocate() {

            var title = '';
            var message = ''
            var btnCancelLabel = 'No, I don\'t approve';
            var btnOkLabel = 'Yes, locate me';

            title = 'Please Confirm';
            message = 'Is it ok if we locate your position?';
            BootstrapDialog.confirm({
                type: BootstrapDialog.TYPE_PRIMARY,
                title: title,
                message: message,
                closable: true, // <-- Default value is false
                draggable: true, // <-- Default value is false
                btnCancelLabel: btnCancelLabel,
                btnOKLabel: btnOkLabel,
                btnOKClass: 'btn-success',
                btnCancelClass: 'btn-warning',
                btnCancelAction: function (dialogRef) {
                    dialogRef.close();
                },
                 callback: function (result) {
                    if (result) $rootScope.$emit('getLocation');                                     
                }                          
              });
        }*/

        function askPermissionToLocate() {

            var title = '';
            var messagehtml = ''
            var messageLoading = '';
            var btnCancelLabel = 'No, I don\'t approve';
            var btnOkLabel = 'Yes, locate me';

            title = 'Please Confirm';


            messagehtml = '<div class="text-left">Is it ok if we locate your position?</div>' +
            '<br>' +
            '<div class="row">' +
            //($rootScope.sm ? '<div class="container col-xs-12">':'<div class="container col-xs-6">') +
            '<div class="container col-xs-12">' +
            '<div class="text-left" style="color:blue">Option 1</div>' +
            '<div class="text-center" style="border:2px"><button class="btn btn-success" id="useGeo">Yes, locate me using geolocation</button></div><br>' +
            '<div class="text-left" style="color:blue">Option 2 <small>(recommended for accuracy)</small></div><br>' +
            '<p>Yes, use this address as my current location</p>' +
            '<div class="input-group">' +
            '<input id="address" type="text" class="form-control" placeholder="Enter address">' +
            '<span class="input-group-btn text-right">' +
            '<button class="btn btn-success" type="button" id="gobutton">Go</button>' +
            '</span>' +
            '</div><br><br>' +
            '</div>' +
            //($rootScope.sm ? '<div class="container col-xs-12">':'<div class="container col-xs-6">') +
            '<div class="container col-xs-12">' +
            '<div class="text-center" style="border:2px"><button class="btn btn-default" id="noapprove">No, I don\'t approve</button></div>' +
            '</div>' +
            '</div>';

            messageLoading = '<div class="loading-pulse"></div>' +
            '<p>Just a moment, finding your location...</p>';

            BootstrapDialog.show({
                type: BootstrapDialog.TYPE_PRIMARY,
                title: title,
                message: function (dialogRef) {
                    var $content = $(messagehtml);

                    $content.find('#useGeo').click({}, function () {

                        if ($rootScope.isFacebookApp) {
                            getDialog('FacebookAppNotSupported');
                        }
                        else {
                            var x = dialogRef;
                            $rootScope.$emit('getLocation');
                            x.enableButtons(false);
                            x.setClosable(false);
                            x.getModalBody().html(messageLoading);
                            x.setTitle('Please wait');
                            setTimeout(function () {
                                x.close();
                            }, 10000);
                        }
                        //x.close();
                    });
                    $content.find('#gobutton').click({}, function () {
                        var address = $content.find('input').val();
                        var x = dialogRef;
                        $rootScope.$emit('useAddress', { address: address });
                        x.close();
                    });
                    $content.find('#noapprove').click({}, function () {
                        var x = dialogRef;
                        x.close();
                    });

                    return $content;
                },
                closable: true, // <-- Default value is false
                draggable: true, // <-- Default value is false
                btnCancelLabel: btnCancelLabel,
                btnOKLabel: btnOkLabel,
                btnOKClass: 'btn-success',
                btnCancelClass: 'btn-warning',
                btnCancelAction: function (dialogRef) {
                    dialogRef.close();
                }
            });
        }

        function askEmail(accntname) {

            var title = '';
            var messagehtml = ''
            var btnCancelLabel = 'No, I don\'t approve';
            var btnOkLabel = 'Yes, locate me';

            title = 'Missing info';

            messagehtml = '<div class="text-left">Let\'s stay in touch.' +
            ' Please provide us an email address where we can ' +
            'keep you updated on everything related to the <strong>' + accntname + '</strong> account.</div>' +
            '<br>' +
            '<div class="input-group">' +
            '<input id="email" type="text" class="form-control" placeholder="Enter email address">' +
            '<span class="input-group-btn text-right">' +
            '<button class="btn btn-primary" type="button" id="gobutton">Submit</button>' +
            '</span>' +
            '</div><br>';

            BootstrapDialog.show({
                type: BootstrapDialog.TYPE_PRIMARY,
                title: title,
                message: function (dialogRef) {
                    var $content = $(messagehtml);

                    $content.find('#gobutton').click({}, function () {
                        var address = $content.find('input').val();
                        var x = dialogRef;
                        $rootScope.showWarning = false;
                        useraccnt.updateuseraccnt($rootScope.useraccnts[0].id, ['email'], [address]);
                        x.close();
                        $rootScope.$emit('hideWarning');
                    });

                    return $content;
                },
                closable: true, // <-- Default value is false
                draggable: true, // <-- Default value is false
                btnCancelLabel: btnCancelLabel,
                btnOKLabel: btnOkLabel,
                btnOKClass: 'btn-success',
                btnCancelClass: 'btn-warning',
                btnCancelAction: function (dialogRef) {
                    dialogRef.close();
                }
            });
        }

        function seePhotos(blobList, idx, answer, isOwner) {

            var title = '';
            var messagehtml = ''
            var btnCancelLabel = 'No, I don\'t approve';
            var btnOkLabel = 'Yes, locate me';
            var n = idx;
            var L = blobList.length;
            var img_style = '';

            if ($rootScope.sm) {
                img_style = 'width:100%;height:auto';
            }
            else {
                img_style = 'width:100%;height:auto';
            }

            title = 'Photos - ' + answer.name;

            var m1 = '';
            var m2 = '';
            var m3 = '';
            var m4 = '';
            var cap = '';
            
            if (isOwner) {
                m1 =
                '<div class="row">' +
                '<div class="text-left col-xs-3 col-md-4">' +
                '<button class="btn btn-default pull-left" id="prevbutton">&lt;&lt</button>' +
                '</div>' +
                '<div class="text-middle col-xs-5 col-md-4">' +
                '<button class="btn btn-default" id="makeprimary">Make Main Photo</button>' +
                '</div>' +
                '<div class="text-right col-xs-4 col-md-4">' +
                '<button class="btn btn-default pull-right" id="nextbutton">&gt;&gt</button>' +
                '</div>' +
                '</div>';
                m4 =
                '<div class="text-right">' +
                '<button type="button" class="btn btn-default pull-right" style="vertical-align:middle;" id="trashbutton">' +
                '<span class="glyphicon glyphicon-trash" style="padding-top:0px;padding-bottom:0px;" aria-hidden="true">' +
                '</span>' +
                '</button>' +
                '</div><br/>';

            }
            else {
                m1 = '<div class="row">' +
                '<div class="text-left col-xs-6">' +
                '<button class="btn btn-default pull-left" id="prevbutton">&lt;&lt</button>' +
                '</div>' +
                '<div class="text-right col-xs-6">' +
                '<button class="btn btn-default pull-right" id="nextbutton">&gt;&gt</button>' +
                '</div>' +
                '</div>';
                m4 = '<br/>';
            }
            m2 = '<br>' +
            '<div class="text-center">' +
            '<img id="image" class="displayed" src="' +
            //'https://rankx.blob.core.windows.net/sandiego/';
            '';
            m3 =
            '" style="' + img_style + '">' +
            '</div>' + 
            '<p>Photo from &nbsp<strong id="source">' + blobList[n].type + '</strong></p></br>' + 
            '<br/>';
            
            if (blobList[n].from != undefined){
                cap = '<p id="credit">Photo by:&nbsp<strong>@'+ blobList[n].from + '</strong></p></br><p id="caption">' + 
                (blobList[n].caption ? blobList[n].caption : '')  +'</p>';
            }
            else{
                cap = '<p id="credit"></p><p id="caption"></p>';
            }
            var m5 = '';
            messagehtml =  m1 + m2 + blobList[n].url + m3 + m4 + cap;
            
            BootstrapDialog.show({
                type: BootstrapDialog.TYPE_PRIMARY,
                title: title,
                message: function (dialogRef) {
                    var $content = $(messagehtml);
                    var x = dialogRef;
                    $content.find('#prevbutton').click({}, function () {
                        n = n - 1;
                        if (n < 0) n = L - 1;
                        $content.find('#image').attr('src', blobList[n].url);
                        $content.find('#source').html(blobList[n].type);
                        if (blobList[n].from != undefined) $('#credit').html('Photo by:&nbsp<strong>@'+ blobList[n].from + '</strong></br>');
                        else $('#credit').html('');
                        
                        if (blobList[n].caption != undefined) $('#caption').html(blobList[n].caption);
                        else $('#caption').html('');
                    });

                    $content.find('#nextbutton').click({}, function () {
                        n = n + 1;
                        if (n >= L) n = 0;
                        $content.find('#image').attr('src', blobList[n].url);
                        $content.find('#source').html(blobList[n].type);
                        if (blobList[n].from != undefined) $('#credit').html('Photo by:&nbsp<strong>@'+ blobList[n].from + '</strong></br>');
                        else $('#credit').html('');

                        if (blobList[n].caption != undefined) $('#caption').html(blobList[n].caption);
                        else $('#caption').html('');
                    });

                    $content.find('#trashbutton').click({}, function () {
                        confirmPhotoDelete(blobList, n, answer);
                        x.close();
                    });

                    $content.find('#makeprimary').click({}, function () {
                        confirmMakePrimary(blobList, n, answer);
                        x.close();
                    });
                    return $content;
                },
                closable: true, // <-- Default value is false
                draggable: true, // <-- Default value is false
                btnCancelLabel: btnCancelLabel,
                btnOKLabel: btnOkLabel,
                btnOKClass: 'btn-success',
                btnCancelClass: 'btn-warning',
                btnCancelAction: function (dialogRef) {
                    dialogRef.close();
                },

            });

        }

        function confirmPhotoDelete(blobList, n, current_answer) {

            var title = '';
            var message = '';
            var btnCancelLabel = '';
            var btnOkLabel = '';

            title = 'Please Confirm';
            btnCancelLabel = 'Cancel';
            btnOkLabel = 'Yes, Delete';
            message = '<br>Please confirm, you want to delete this photo: ' +
            '<br/><img id="image" class="displayed" src="' +
            blobList[n].url +
            '" style="width:100%;height:auto">' +
            '<br><br>';

            BootstrapDialog.confirm({
                type: BootstrapDialog.TYPE_DANGER,
                title: title,
                message: message,
                closable: true, // <-- Default value is false
                draggable: true, // <-- Default value is false
                btnCancelLabel: btnCancelLabel,
                btnOKLabel: btnOkLabel,
                btnOKClass: 'btn-default',
                btnCancelAction: function (dialogRef) {
                    dialogRef.close();
                },
                callback: function (result) {
                    if (result) {
                        console.log(blobList);
                        if( blobList[n].type == 'Instagram' ){
                            var itempos = current_answer.ig_image_urls.indexOf(blobList[n].url);
                            if( itempos != -1){
                                current_answer.ig_image_urls = current_answer.ig_image_urls.substr(0, itempos-1) + current_answer.ig_image_urls.substr(itempos + blobList[n].url.length);

                                setInstagramImageUrl(current_answer.id, current_answer.ig_image_urls)
                                .then(function(answer){
                                    $rootScope.$emit('refreshImages');
                                })
                            }
                            
                        } else {
                            imagelist.deleteBlob(blobList[n].url);
                        }
                    }
                }
            });
        }

        function confirmMakePrimary(blobList, n, myanswer) {

            var title = '';
            var message = '';
            var btnCancelLabel = '';
            var btnOkLabel = '';

            title = 'Please Confirm';
            btnCancelLabel = 'Cancel';
            btnOkLabel = 'Yes, make primary';
            message = '<br>Please confirm, you want to make this the primary photo: ' +
            '<br/><img id="image" class="displayed" src="' +
            blobList[n].url +
            '" style="width:100%;height:auto">' +
            '<br><br>';

            BootstrapDialog.confirm({
                type: BootstrapDialog.TYPE_PRIMARY,
                title: title,
                message: message,
                closable: true, // <-- Default value is false
                draggable: true, // <-- Default value is false
                btnCancelLabel: btnCancelLabel,
                btnOKLabel: btnOkLabel,
                btnOKClass: 'btn-default',
                btnCancelAction: function (dialogRef) {
                    dialogRef.close();
                },
                callback: function (result) {
                    if (result) {
                        var imageurl = blobList[n].url;
                        answer.updateAnswer(myanswer.id, ["image"], [imageurl]);
                    }
                }
            });
        }

        function loginFacebook() {
            var title = '';
            var message = '';
            var btnCancelLabel = '';
            var btnOkLabel = '';

            title = 'Login required';
            message = 'You must be logged in to add answers, endorse establishments and participate in the rankings.' +
            '</br></br>' +
            'Do you want to log in?';

            BootstrapDialog.show({
                title: title,
                message: message,
                buttons: [
                {
                    label: 'Not now',
                    action: function (dialogItself) {
                        dialogItself.close();
                    }
                },
                {
                    icon: 'fa fa-facebook',
                    label: 'Login',
                    cssClass: 'btn-primary',
                    action: function (dialogItself) {

                         //Store current state 
                        $rootScope.stateName = $state.current.name;
                        if ($rootScope.stateName == 'rankSummary') $rootScope.stateNum = $rootScope.cCategory.id;
                        else if ($rootScope.stateName == 'answerDetail') $rootScope.stateNum = $rootScope.canswer.id;
                        else $rootScope.stateNum = undefined;
                    
                        login.facebookSDKLogin()
                        .then(function(){
                            dialogItself.close();
                            $state.go($state.current, {}, {reload: true}); 
                        });
                        // login.loginWithFacebook()
                        //     .then(function (result) {
                        //         $window.location = result.url;
                        //     });
                    }
                }]
            });
        }

        function shareOptions(callback, isMobile) {
            var title = '';
            var messagehtml = '';
            var btnCancelLabel = '';
            var btnOkLabel = '';

            title = 'Share Options';
            messagehtml =
            '<div class="row">' +
            '<div class="col-xs-3 col-sm-3 col-md-2 col-lg-2 text-center">' +
            '<img src="/assets/images/1485385043_mail.png" id="email" style="width:50px;margin-bottom:20px">' +
            '</div>' +
            '<div class="col-xs-3 col-sm-3 col-md-2 col-lg-2 text-center">' +
            '<img src="/assets/images/1485384809_2_-_Facebook.png" id="facebook" style="width:50px;margin-bottom:20px">' +
            '</div>' +
            '<div class="col-xs-3 col-sm-3 col-md-2 col-lg-2 text-center">' +
            '<img src="/assets/images/1485384868_1_-_Twitter.png" id="twitter" style="width:50px;margin-bottom:20px">' +
            '</div>' +
            '<div class="col-xs-3 col-sm-3 col-md-2 col-lg-2 text-center">' +
            '<img src="/assets/images/1485384841_13_-_Pintrest.png" id="pinterest" style="width:50px;margin-bottom:20px">' +
            '</div>' +
            '<div class="col-xs-3 col-sm-3 col-md-2 col-lg-2 text-center">' +
            '<img src="/assets/images/1485384824_6_-_Google_Plus.png" id="gplus" style="width:50px;margin-bottom:20px">' +
            '</div>' +
            '<div class="col-xs-3 col-sm-3 col-md-2 col-lg-2 text-center">' +
            '<img src="/assets/images/1485384853_5_-_Tumbler.png" id="tumblr" style="width:50px;margin-bottom:20px">' +
            '</div>' +
            '<div class="col-xs-3 col-sm-3 col-md-2 col-lg-2 text-center">' +
            '<img src="/assets/images/1485425301_reddit.png" id="reddit" style="width:50px;margin-bottom:20px">' +
            '</div>' +
            '<div class="col-xs-3 col-sm-3 col-md-2 col-lg-2 text-center">' +
            '<img src="/assets/images/1485384832_16_-_Whatsapp.png" id="whatsapp"'+
            ' style="width:50px;margin-bottom:20px;display:'+ (isMobile ? 'inline':'none') + '">' +
            '</div>' +
            '<div class="col-xs-3 col-sm-3 col-md-2 col-lg-2 text-center">' +
            '<img src="/assets/images/1485385110_Facebook_Messenger.png" id="messenger"'+
            ' style="width:50px;margin-bottom:20px;display:'+ (isMobile ? 'inline':'none') + '">' +
            '</div>' +
            '<div class="col-xs-3 col-sm-3 col-md-2 col-lg-2 text-center">' +
            '<img src="/assets/images/1485385026_sms.png" id="sms"'+ 
            ' style="width:50px;margin-bottom:20px;display:'+ (isMobile ? 'inline':'none') + '">' +
            '</div>'
            '</div>';

            BootstrapDialog.show({
                title: title,
                message: function (dialogRef) {
                    var $content = $(messagehtml);
                    var x = dialogRef;
                    $content.find('#twitter').click({}, function () {
                        callback('twitter');
                        x.close();
                    });
                    $content.find('#facebook').click({}, function () {
                        callback('facebook');
                        x.close();
                    });
                    $content.find('#email').click({}, function () {
                        callback('email');
                        x.close();
                    });
                    $content.find('#pinterest').click({}, function () {
                        callback('pinterest');
                        x.close();
                    });
                    $content.find('#gplus').click({}, function () {
                        callback('gplus');
                        x.close();
                    });
                    $content.find('#reddit').click({}, function () {
                        callback('reddit');
                        x.close();
                    });
                    $content.find('#tumblr').click({}, function () {
                        callback('tumblr');
                        x.close();
                    });
                    $content.find('#whatsapp').click({}, function () {
                        callback('whatsapp');
                        x.close();
                    });
                    $content.find('#messenger').click({}, function () {
                        callback('messenger');
                        x.close();
                    });
                    $content.find('#sms').click({}, function () {
                        callback('sms');
                        x.close();
                    });
                    return $content;
                },
                buttons: [{
                    label: 'Cancel',
                    action: function (dialogItself) {
                        dialogItself.close();
                    }
                }]
            });
        }

         function tour() {

            var title = '';
            var messagehtml = ''
            var n = 1;
            var img_style = '';
            
            //if ($rootScope.sm) {
                img_style = 'width:100%;max-width:450px;height:auto;margin-left:auto;margin-right:auto;';
            //}
            //else {
            //    img_style = 'width:90%;height:auto';
            // }

            title = 'Rank-X Intro Tour';

            var m1 = '';
            var m2 = '';
            var m3 = '';
            var m4 = '';
            var cap = '';

           // <div class="container hidden-xs hidden-sm hidden-md col-lg-3" ng-if="isShortPhrase" style="background-color:lightgray;color:black;height:{{sm ? '150px':'200px'}};margin:0px;padding:0px;border:0px;position:relative;">
//  <div style="padding:3px; margin:0px; position:absolute; top:50%; left:50%; margin-right:-50%;transform: translate(-50%,-50%)">
        

            
            m1 =
            '<img id="image" class="displayed" src="' +
            '/assets/images/rxtour1.png'+'" style="' + img_style + '">';
            
            messagehtml =  m1;
            
            BootstrapDialog.show({
                type: BootstrapDialog.TYPE_PRIMARY,
                title: title,
                message: messagehtml,
                closable: true, // <-- Default value is false
                draggable: true, // <-- Default value is false
                buttons: [
                {
                id: 'btn1',
                label: 'No, thanks',
                action: function(dialog, messagehtml) {
                    var $button = this; // 'this' here is a jQuery object that wrapping the <button> DOM element.
                    //console.log("bt1-clicked,",n);
                    if (n==1) {
                        $cookies.put('tourviewed', true);
                        dialog.close();
                    }
                    else {
                        n = n - 1;
                        if (n==1){
                            $('#btn1').text('No, thanks');
                            $('#btn2').text('Yes, take tour');
                        }
                        else if (n == 12){
                            $('#btn1').text('Back');
                            $('#btn2').text('Close');
                            $cookies.put('tourviewed', true);
                        } 
                        else {
                            $('#btn1').text('Back');
                            $('#btn2').text('Next');
                        }
                        m1 = '<img id="image" class="displayed" src="' +
                            '/assets/images/rxtour'+n+'.png'+'" style="'+img_style+'">';
                        dialog.setMessage(m1);
                        
                        }
                    }
                },
                {
                id: 'btn2',
                label: 'Yes, take tour',
                action: function(dialog, messagehtml) {
                    var $button = this; // 'this' here is a jQuery object that wrapping the <button> DOM element.
                    //console.log("bt2-clicked,",n);
                    if (n==12) {
                        $cookies.put('tourviewed', true);
                        dialog.close();
                    }
                    else {
                        if (n == 12) dialog.getButton(this.id).label = 'Close';
                        else {
                            //$button.text = 'Next'; 
                            n = n + 1;
                            if (n == 1) {
                                $('#btn1').text('No, thanks');
                                $('#btn2').text('Yes, take tour');
                            }
                            else if (n == 12) {
                                $('#btn1').text('Back');
                                $('#btn2').text('Close');
                                $cookies.put('tourviewed', true);
                            }
                            else {
                                $('#btn1').text('Back');
                                $('#btn2').text('Next');
                            }
                        }
                        m1 = '<img id="image" class="displayed" src="' +
                            '/assets/images/rxtour' + n + '.png' + '" style="' + img_style + '">';
                        dialog.setMessage(m1);
                    }
                }
            }]

            });

        }

        function unbindAccount(x, callback) {

            var title = '';
            var message = '';
            var btnCancelLabel = '';
            var btnOkLabel = '';

            title = 'Confirm Unbind';
            btnCancelLabel = 'Cancel';
            btnOkLabel = 'Yes, Unbind';
            message = 'Just confirming, do you want to unbind <strong>' + x.name + '</strong> from your account?';

            BootstrapDialog.confirm({
                type: BootstrapDialog.TYPE_DANGER,
                title: title,
                message: message,
                closable: true, // <-- Default value is false
                draggable: true, // <-- Default value is false
                btnCancelLabel: btnCancelLabel,
                btnOKLabel: btnOkLabel,
                btnOKClass: 'btn-primary',
                btnCancelAction: function (dialogRef) {
                    dialogRef.close();
                },
                //callback: function (dialogRef, result) {
                callback: function (result) {
                    if (result) callback();
                }
            });
        }

        function confirmCancel(x, type, callback){
             var title = '';
            var message = '';
            var btnCancelLabel = '';
            var btnOkLabel = '';

            if (type == 'Premium'){
                btnOkLabel = 'Cancel Premium Membership';
                message = 'Do you want to cancel your Premium Membership for <strong>'+x.name+'</strong>?'
            }
            if (type == 'Ranks'){
                btnOkLabel = 'Cancel All Custom Ranks';
                message = 'Do you want to cancel all of your Custom Ranks for <strong>'+x.name+'</strong>?'
            }
            if (type == 'All'){
                btnOkLabel = 'Cancel All Subscriptions';
                message = 'Do you want to cancel all of your Subscriptions for <strong>'+x.name+'</strong>?'
            }

            title = 'Please confirm';
            btnCancelLabel = 'Back';
            
            BootstrapDialog.confirm({
                type: BootstrapDialog.TYPE_DANGER,
                title: title,
                message: message,
                closable: true, // <-- Default value is false
                draggable: true, // <-- Default value is false
                btnCancelLabel: btnCancelLabel,
                btnOKLabel: btnOkLabel,
                btnOKClass: 'default',
                btnCancelAction: function (dialogRef) {
                    dialogRef.close();
                },
                //callback: function (dialogRef, result) {
                callback: function (result) {
                    if (result) callback();
                }
            });
        }

        function editNumRanks(x,callback){
            var title = 'Buy or Cancel Custom Ranks';
            var message = '';
            var btnCancelLabel = 'Back';
            var btnOkLabel = 'Purchase';
            var m1 = '';
            var m2 = '';
            var n = 1;
            var N = x.ranksQty;
            var action = 'purchase';
            var msgpayment = '<br><br>If purchasing Custom Ranks you will be ask for your payment info after clicking the Purchase button.';
            var msgcancel = '<br><br>Your Custom Ranks will be active until the last day of your subscription.';

            var msg = 'You have selected to <strong>purchase ' + n + '</strong> Custom Ranks.' + msgpayment;
            
            //message = getMessageHtml(n,msg);
            //function getMessageHtml(n,msg){
            var message = 
            '<p>You are currently subscribed to <strong>' + N + '</strong> Custom Ranks.</p>'+
            '<br>'+
            '<p class="text-left">Select what you want to do.</p>'+
            '<br>'+
            '<div class="radio">'+
                '<label><input type="radio" value="0" checked name="radiogrp">PURCHASE CUSTOM RANKINGS</label>'+
            '</div>'+
            '<div class="radio">'+
               '<label><input type="radio" value="1" name="radiogrp">CANCEL CUSTOM RANKINGS</label>'+
            '</div>'+
            '<br>' +
            '<div class="row">'+
                '<div class="col-xs-7">'+
                    '<p class="text-right">Select quantity:</p>'+
                '</div>'+
                '<div class="col-xs-5">'+
                    '<div class="input-group">'+
                        '<span class="input-group-btn">'+
                            '<button class="btn btn-primary" id="btn_minus"><i class="fa fa-minus"></i></button>'+
                        '</span>'+
                        '<input style="text-align:center" id="numRanks" class="form-control" type="text" placeholder="'+ n +'">'+
                            '<span class="input-group-btn">'+
                                '<button class="btn btn-primary" id="btn_plus"><i class="fa fa-plus"></i></button>'+
                            '</span>'+
                    '</div>'+
                '</div>'+
            '</div>'+
            '<br><p class="text-left" id="mytext">'+msg+'</p>';
                //return msghtml;    
            
            title = 'Please confirm';
            btnCancelLabel = 'Back';
            
            BootstrapDialog.show({
                type: BootstrapDialog.TYPE_PRIMARY,
                title: title,
                message: function (dialogRef) {
                    var $content = $(message);
                    var x = dialogRef;
                    var msg = '';
                    var msgpayment = '<br><br>If purchasing Custom Ranks you will be ask for your payment info after clicking the Purchase button.';
                    var msgcancel = '<br><br>Your Custom Ranks will be active until last day of your subscription.';

                    $content.find('#btn_minus').click({}, function () {
                        n = n - 1;
                        if (n < 1) n = 1;
                        $content.find('#numRanks').val(n);
                        //console.log("n, N - ", n, N);
                        if (action == 'purchase'){
                            msg = 'You have selected to <strong>purchase ' + n + '</strong> Custom Ranks. ' + msgpayment;
                            $('#btn2').text('Purchase ' + n + ' Custom Rankings');
                        }
                        else {
                            msg = 'You have selected to <strong>cancel ' + n + '</strong> Custom Ranks. ' + msgcancel;
                            $('#btn2').text('Cancel ' + n + ' Custom Rankings');
                        }
                        //console.log("msg - ", msg);
                        $('#mytext').html(msg);                  
                    });
                    $content.find('#btn_plus').click({}, function () {
                        n = n + 1;
                        if (n > 10) n = 10;
                        if (action == 'cancel'){
                            if (n >= N) n = N;
                        }
                        $content.find('#numRanks').val(n);
                        //console.log("n, N - ", n, N);
                        if (action == 'purchase'){
                            msg = 'You have selected to <strong>purchase ' + n + '</strong> Custom Ranks. ' + msgpayment;
                            $('#btn2').text('Purchase ' + n + ' Custom Rankings');
                        }
                        else {
                            msg = 'You have selected to <strong>cancel ' + n + '</strong> Custom Ranks. ' + msgcancel;
                            $('#btn2').text('Cancel ' + n + ' Custom Rankings');
                        }
                        //console.log("msg - ", msg);
                        $('#mytext').html(msg);                       
                    });
                    $content.find('input[type=radio][name=radiogrp]').change(function() {
                        n = 1;
                        if (this.value == 0) {
                            action = 'purchase';
                            $('#btn2').text('Purchase ' + n + ' Custom Rankings');
                            msg = 'You have selected to <strong>purchase ' + n + '</strong> Custom Ranks. ' + msgpayment;                           
                        }
                        else if (this.value == 1) {
                            action = 'cancel';
                            $('#btn2').text('Cancel ' + n + ' Custom Rankings');
                            msg = 'You have selected to <strong>cancel ' + n + '</strong> Custom Ranks. ' + msgcancel;
                        }
                        $content.find('#numRanks').val(n);
                        $('#mytext').html(msg);
                    });
                    return $content;
                },
                closable: true, // <-- Default value is false
                draggable: true, // <-- Default value is false
                buttons: [
                {
                id: 'btn1',
                label: 'Back',
                action: function(dialog) {
                    dialog.close();
                    }
                },
                {
                id: 'btn2',
                label: 'Purchase ' + n + ' Custom Rankings',
                action: function(dialog, messagehtml) {
                   callback(action,n);
                   dialog.close();
                }
            }]
            });
        }

         function editInfo(fields,labels,vals,callback) {

            var title = '';
            var messagehtml = ''
            var btnCancelLabel = 'Cancel';
            var btnOkLabel = 'Save';

            title = 'Edit Information';

            messagehtml = '<p>Please verify the information is correct.</p>';

            for (var i=0; i<fields.length; i++){
                messagehtml = messagehtml + 
                
                '<div class="input-group">'+
                '<label class="input-group-addon">'+labels[i]+':</label>'+
                '<input type="text" class="form-control" id="'+fields[i]+'" value="'+ vals[i] +'">'+
                '</div>';
            }
            
            BootstrapDialog.show({
                type: BootstrapDialog.TYPE_PRIMARY,
                title: title,
                message: function (dialogRef) {
                    var $content = $(messagehtml);
                    return $content;
                },
                closable: true, // <-- Default value is false
                draggable: true, // <-- Default value is false
                btnCancelLabel: btnCancelLabel,
                btnOKLabel: btnOkLabel,
                btnOKClass: 'btn-success',
                btnCancelClass: 'btn-warning',
                btnCancelAction: function (dialogRef) {
                    dialogRef.close();
                },
                buttons: [
                    {
                        id: 'btn1',
                        label: 'Cancel',
                        action: function (dialog) {
                            dialog.close();
                        }
                    },
                    {
                        id: 'btn2',
                        label: 'Save',
                        action: function (dialog, messagehtml) {
                            var newvals = [];
                            var val = '';
                            for (var i = 0; i < fields.length; i++) {
                                val = dialog.getModalBody().find('#' + fields[i])[0].value;
                                //console.log(fields[i], " ", val);
                                newvals.push(val);
                            }
                            callback(newvals);
                            dialog.close();
                        }
                    }]
            });
         }

         function notificationWithCallback(title, message, callback) {

            var title = title;
            var message = message;
            
            BootstrapDialog.show({
                type: BootstrapDialog.TYPE_PRIMARY,
                title: title,
                message: message,
                buttons: [{
                    id: 'btn-ok',
                    label: 'OK',
                    cssClass: 'btn-primary',
                    autospin: false,
                    action: function (dialogRef) {
                        callback();
                        dialogRef.close();
                    }
                }]
            });

        }

        function enterPassword(ok_callback, nok_callback) {

            var title = '';
            var message = '';
            var btnCancelLabel = '';
            var btnOkLabel = '';

            title = 'Password Required';
            btnCancelLabel = 'Cancel';
            btnOkLabel = 'Add';
            message = '<br> Please enter access password:' +
            '<br><br>' +
            '<input class="form-control" type="text" placeholder="Enter password">' +
            '<br><br>';
            BootstrapDialog.show({
                type: BootstrapDialog.TYPE_PRIMARY,
                title: title,
                message: message,
                closable: false, // <-- Default value is false
                draggable: true, // <-- Default value is false
                
                buttons: [
                    {
                        id: 'btn1',
                        label: 'Cancel',
                        action: function (dialog) {
                            nok_callback();
                            dialog.close();
                        }
                    },
                    {
                        id: 'btn2',
                        label: 'Go',
                        action: function (dialog) {

                            var password = dialog.getModalBody().find('input').val();
                            if (password == 'S@nDieg0') {
                                ok_callback();
                            }
                            else {
                                nok_callback();
                                getDialog('wrongPassword');
                            }
                            dialog.close();
                        }
                    }]
            });
        }

        function setInstagramImageUrl(id, urls){
            return answer.updateAnswer(id, ['ig_image_urls'], [urls]);
        }
        function chooseImgFromIgDlg(blobList,  answer, isOwner) {

            var title = '';
            var messagehtml = ''
            var btnCancelLabel = 'No, I don\'t approve';
            var btnOkLabel = 'Yes, locate me';
            var L = blobList.length;
            var img_style = '';

            if ($rootScope.sm) {
                img_style = 'width:100%;height:auto';
            }
            else {
                img_style = 'width:100%;height:auto';
            }

            title = 'My Instagram Photos';

            var m1 = '';
            var m2 = '';
            var m3 = '';
            var m4 = '';
            var cap = '';
            
            m1 =
            '<div class="row">' +

            '</div>';
            m4 =
            '<div class="text-right">' +
            '</div><br/>';

            var imageListHtml = '';
            m2 = '<img id="image" class="displayed col-xs-3 thumbnail" src="';
            //'https://rankx.blob.core.windows.net/sandiego/';
            m3 ='" style="' + img_style + '">';
            imageListHtml = '<div class="row">';
            for (var i = 0; i < blobList.length; i++) {
                if(blobList[i].type == 'image'){
                    imageListHtml += '<div class="col-xs-6 col-md-4" style="position:relative">';
                    imageListHtml += m2 + blobList[i].images.low_resolution.url + m3;
                    var opacity = 0
                    if( answer.ig_image_urls.indexOf(blobList[i].images.low_resolution.url) != -1 ){
                        
                        opacity = 0.7;
                    }
                    imageListHtml += '<div id="add_photo" style="background-color: grey;opacity:' + opacity + ';position: absolute;left: 19px;right: 19px;top: 4px;bottom: 24px;border-radius: 5px;display: flex;align-items: center;">';
                    imageListHtml += '<i class="fa fa-check-circle-o" aria-hidden="true" style="color: #2d6c38;font-size: 100px;margin: auto" ></i>';
                    imageListHtml += '</div>';

                    // if( answer.ig_image_urls.indexOf(blobList[i].images.low_resolution.url) == -1 )
                    //     imageListHtml +=    '<div class="text-center">' +
                    //                         '<button class="btn btn-primary" style="margin-top:10px" id="add_photo">Add</button>' +
                    //                         '</div>';
                    // else
                    //     imageListHtml +=    '<div class="text-center">' +
                    //                         '<button class="btn btn-primary disabled" style="margin-top:10px" id="add_photo">Added</button>' +
                    //                         '</div>';

                    imageListHtml += '</div>';
                }
            }
            imageListHtml += '</div>';
            
            messagehtml =  m1 + imageListHtml + m4;
            
            BootstrapDialog.show({
                size: BootstrapDialog.SIZE_WIDE,
                type: BootstrapDialog.TYPE_PRIMARY,
                cssClass: 'instagram-image-dialog',
                title: title,
                message: function (dialogRef) {
                    var $content = $(messagehtml);
                    var x = dialogRef;
                    $content.find('#add_photo').click({}, function () {
                        console.log(answer.ig_image_urls);
                        var url = $(this).parent().children('#image').attr('src');

                        if(answer.ig_image_urls.indexOf(url) != -1){
                            // $(this).html('Added');
                            // $(this).css('opacity', 0.7);
                            var _this = this;
                            var itempos = answer.ig_image_urls.indexOf(url);
                            if( itempos != -1){
                                answer.ig_image_urls = answer.ig_image_urls.substr(0, itempos-1) + answer.ig_image_urls.substr(itempos +url.length);

                                setInstagramImageUrl(answer.id, answer.ig_image_urls)
                                .then(function(answer){
                                    $rootScope.$emit('refreshImages');
                                    $(_this).css('opacity', 0);
                                })
                            }
                        }
                        else{
                            var _this = this;
                            answer.ig_image_urls += ";" + url;
                            setInstagramImageUrl(answer.id, answer.ig_image_urls)
                            .then(function(answer){
                                $rootScope.$emit('refreshImages');
                                // $(_this).html('Added');
                                $(_this).css('opacity', 0.7);
                            })
                        }
                        
                    });
                    return $content;
                },

                buttons: [{
                    label: 'Close',
                    action: function (dialogRef) {
                        //console.log("dialogRef2---", dialogRef);
                        dialogRef.close();
                    },
                }],
                closable: true, // <-- Default value is false
                draggable: true, // <-- Default value is false
                btnCancelLabel: btnCancelLabel,
                btnOKLabel: btnOkLabel,
                btnOKClass: 'btn-success',
                btnCancelClass: 'btn-warning',
                btnCancelAction: function (dialogRef) {
                    dialogRef.close();
                },

            });

        }
    }
})();
(function () {
    'use strict';

    angular
        .module('app')
        .service('commentops', commentops);

    commentops.$inject = ['$rootScope', 'table', 'answer', 'comment', 'comment2'];

    function commentops($rootScope, table, answer, comment, comment2) {

        var service = {

            loadComments: loadComments,
            postComment: postComment,
            getIconColors: getIconColors
        };

        var _colors = {};
        _colors.bc = '';
        _colors.fc = '';

        return service;

        function loadComments(type, x) {
            if (!x.commLoaded) {
                x.commLoaded = true;
                if ($rootScope.isLoggedIn) {
                    x.initials = $rootScope.user.name.replace(/[^A-Z]/g, '');
                    getIconColors($rootScope.user.id, _colors);
                    x.bc = _colors.bc;
                    x.fc = _colors.fc;
                }
                //comments = [];
                if (type == 'answer') {
                    return comment2.getcomments().then(function (_comments) {
                        //console.log("_comments", _comments);
                        x.comments = _comments;
                        for (var i = 0; i < x.comments.length; i++) {
                            x.comments[i].initials = x.comments[i].username.replace(/[^A-Z]/g, '');

                            var datenow = new Date();
                            var tz = datenow.getTimezoneOffset();

                            //Explicitly format the date -- iPhone has issues otherwise
                            var t = x.comments[i].timestmp.split(/[- :]/);
                            var cdate = new Date(t[0], t[1]-1, t[2], t[3], t[4], t[5]);
                            
                            cdate.setMinutes(cdate.getMinutes() - tz);
                            function pad(n) {return n < 10 ? '0'+ n : n;}
                            
                            var dateStr = cdate.getMonth()+1+"/"+cdate.getDate()+"/"+cdate.getFullYear();
                            
                            var hrs = cdate.getHours();
                            var timeStr = hrs > 12 ? hrs%12 + ':'+ pad(cdate.getMinutes()) + ' '+'PM' :
                                                     hrs + ':'+ pad(cdate.getMinutes()) + ' '+'AM'; 
                                          
                            x.comments[i].date = dateStr + ' ' + timeStr;
                            getIconColors(x.comments[i].user, _colors);
                            x.comments[i].bc = _colors.bc;
                            x.comments[i].fc = _colors.fc;
                        }
                        //console.log("vm.commLoaded, vm.comments.length, vm.isLoggedIn, vm.commentAllowed ---", vm.commLoaded, vm.comments.length, vm.isLoggedIn, vm.commentAllowed);
                    });
                }
                if (type == 'category') {
                    return comment.getcomments().then(function (_comments) {
                        //console.log("_comments", _comments);
                        x.comments = _comments;
                        for (var i = 0; i < x.comments.length; i++) {
                            x.comments[i].initials = x.comments[i].username.replace(/[^A-Z]/g, '');

                            var datenow = new Date();
                            var tz = datenow.getTimezoneOffset();

                            //Explicitly format the date -- iPhone has issues otherwise
                            var t = x.comments[i].timestmp.split(/[- :]/);
                            var cdate = new Date(t[0], t[1]-1, t[2], t[3], t[4], t[5]);
                            
                            cdate.setMinutes(cdate.getMinutes() - tz);
                            function pad(n) {return n < 10 ? '0'+ n : n;}
                            
                            var dateStr = cdate.getMonth()+1+"/"+cdate.getDate()+"/"+cdate.getFullYear();
                            
                            var hrs = cdate.getHours();
                            var timeStr = hrs > 12 ? hrs%12 + ':'+ pad(cdate.getMinutes()) + ' '+'PM' :
                                                     hrs + ':'+ pad(cdate.getMinutes()) + ' '+'AM'; 
                                          
                            x.comments[i].date = dateStr + ' ' + timeStr;
                            getIconColors(x.comments[i].user, _colors);
                            x.comments[i].bc = _colors.bc;
                            x.comments[i].fc = _colors.fc;
                        }
                        //console.log("vm.commLoaded, vm.comments.length, vm.isLoggedIn, vm.commentAllowed ---", vm.commLoaded, vm.comments.length, vm.isLoggedIn, vm.commentAllowed);
                    });
                }
            }
        }

        function postComment(type, x) {
            var cobj = {};
            cobj.body = x.newComment;
            cobj.username = $rootScope.user.name;
            cobj.user = $rootScope.user.id;
            cobj.picture = $rootScope.user.picture.data.url;
            cobj.timestmp = Date.now();
            x.newComment = '';
            if (type == 'category') {
                cobj.category = $rootScope.cCategory.id;
                comment.addcomment(cobj).then(function () {
                    cobj.initials = $rootScope.user.name.replace(/[^A-Z]/g, '');
                    getIconColors($rootScope.user.id, _colors);
                    //datetime.formatdatetime(cobj);
                    cobj.fc = _colors.fc;
                    cobj.bc = _colors.bc;
                    cobj.date = 'Just now';
                    x.comments.push(cobj);
                    table.update($rootScope.cCategory.id, ['numcom'], [x.comments.length]);
                });
            }
            if (type == 'answer') {
                cobj.answer = $rootScope.canswer.id;
                comment2.addcomment(cobj).then(function () {
                    cobj.initials = $rootScope.user.name.replace(/[^A-Z]/g, '');
                    getIconColors($rootScope.user.id, _colors);
                    //datetime.formatdatetime(cobj);
                    cobj.fc = _colors.fc;
                    cobj.bc = _colors.bc;
                    cobj.date = 'Just now';
                    x.comments.push(cobj);
                    answer.updateAnswer($rootScope.canswer.id, ['numcom'], [x.comments.length]);
                    //console.log("vm.comments - ", vm.comments);                
                });
            }
        }

        function getIconColors(x, c) {
            switch (x % 10) {
                case 0: { c.bc = '#b3b3b3'; c.fc = 'black'; break; }
                case 1: { c.bc = '#666666'; c.fc = 'white'; break; }
                case 2: { c.bc = '#006bb3'; c.fc = 'white'; break; }
                case 3: { c.bc = '#009933'; c.fc = 'white'; break; }
                case 4: { c.bc = '#cc0000'; c.fc = 'white'; break; }
                case 5: { c.bc = '#538cc6'; c.fc = 'black'; break; }
                case 6: { c.bc = '#b36b00'; c.fc = 'white'; break; }
                case 7: { c.bc = '#999966'; c.fc = 'black'; break; }
                case 8: { c.bc = '#4d0099'; c.fc = 'white'; break; }
                case 9: { c.bc = '#009999'; c.fc = 'black'; break; }
            }
        }


    }
})();
(function () {
    'use strict';

    angular
        .module('app')
        .factory('comment2', comment2);

    comment2.$inject = ['$http', '$q', '$rootScope','uaf'];

    function comment2($http, $q, $rootScope, uaf) {

        //Members
        var _comments = [];
        var baseURI = '/api/v2/mysql/_table/comments2';

        var service = {
            getcomments: getcomments,
            addcomment: addcomment,
            updatecomment: updatecomment,
            deletecomment: deletecomment,
            deletecommentsbyuser: deletecommentsbyuser
        };

        return service;

        function getcomments(forceRefresh) {
            // console.log("getAnswers..._areAnswersLoaded()", _areAnswersLoaded());

            if (_arecommentsLoaded() && !forceRefresh) {

                 return $q.when(_comments);
            }

            var url = baseURI +'/?filter=answer='+ $rootScope.canswer.id;

            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                return _comments = result.data.resource;
            }

        }

       function addcomment(newcomment) {

            var url = baseURI;
            var resource = [];

            resource.push(newcomment);

            return $http.post(url, resource, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: resource
            }).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                //update local copy
                var newcommentx = newcomment;
                newcommentx.id = result.data.resource[0].id; 
                //_comments.push(newcommentx);
                
                uaf.post('commentA',['answer'],[newcomment.answer]); //user activity feed 
                //$rootScope.ccomments.push(newcommentx);

                if ($rootScope.DEBUG_MODE) console.log("Adding new comment succesful", result);
                return result.data;
            }

        }

        function updatecomment(comment_id, upV, downV) {
           
            //form match record
            var obj = {};
            obj.resource = [];

            var data = {};
            data.id = comment_id;
            data.upV = upV;
            data.downV = downV;

            obj.resource.push(data);

            var url = baseURI;

            return $http.patch(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                if ($rootScope.DEBUG_MODE) console.log("updating comment vote counts succesful");
                return result.data;
            }
        }

        function deletecomment(comment_id) {
           
            //form match record
            var obj = {};
            obj.resource = [];

            var data = {};
            data.id = comment_id;

            obj.resource.push(data);

            var url = baseURI + '/' + comment_id;
            
            //update (delete answer) local copy of answers
            var i = _comments.map(function(x) {return x.id; }).indexOf(comment_id);
            if (i > -1) _comments.splice(i,1);
            
            
            return $http.delete(url, data, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                if ($rootScope.DEBUG_MODE) console.log("Deleting comment was succesful");
                return result.data;
            }
        }
        
        function deletecommentsbyuser(user_id) {
            
            //delete records from local copy
            for (var i = 0; i < _comments.length; i++) {
                if (_comments[i].user == user_id) {
                    _comments.splice(i, 1);
                }
            }

            var url = baseURI + '?filter=user=' + user_id;

            return $http.delete(url).then(querySucceeded, _queryFailed);
            
            function querySucceeded(result) {

                if ($rootScope.DEBUG_MODE) console.log("Deleting comments for answer was succesful");
                return result.data;
            }
        }
        

        function _arecommentsLoaded() {

            //return _comments.length > 0;
            return false;
        }

        function _queryFailed(error) {

            throw error;
        }

    }
})();
(function () {
    'use strict';

    angular
        .module('app')
        .factory('comment', comment);

    comment.$inject = ['$http', '$q', '$rootScope','uaf'];

    function comment($http, $q, $rootScope,uaf) {

        //Members
        var _comments = [];
        var baseURI = '/api/v2/mysql/_table/comments';

        var service = {
            getcomments: getcomments,
            addcomment: addcomment,
            updatecomment: updatecomment,
            deletecomment: deletecomment,
            deletecommentsbyuser: deletecommentsbyuser
        };

        return service;

        function getcomments(forceRefresh) {
            // console.log("getAnswers..._areAnswersLoaded()", _areAnswersLoaded());

            if (_arecommentsLoaded() && !forceRefresh) {

                 return $q.when(_comments);
            }

            var url = baseURI +'/?filter=category='+ $rootScope.cCategory.id;

            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                return _comments = result.data.resource;
            }

        }

       function addcomment(newcomment) {

            var url = baseURI;
            var resource = [];

            resource.push(newcomment);

            return $http.post(url, resource, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: resource
            }).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                //update local copy
                var newcommentx = newcomment;
                newcommentx.id = result.data.resource[0].id; 
                //_comments.push(newcommentx);
                
                uaf.post('commentR',['category'],[newcomment.category]); //user activity feed 
                //$rootScope.ccomments.push(newcommentx);

                if ($rootScope.DEBUG_MODE) console.log("Adding new comment succesful", result);
                return result.data;
            }

        }

        function updatecomment(comment_id, upV, downV) {
           
            //form match record
            var obj = {};
            obj.resource = [];

            var data = {};
            data.id = comment_id;
            data.upV = upV;
            data.downV = downV;

            obj.resource.push(data);

            var url = baseURI;

            return $http.patch(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                if ($rootScope.DEBUG_MODE) console.log("updating comment vote counts succesful");
                return result.data;
            }
        }

        function deletecomment(comment_id) {
           
            //form match record
            var obj = {};
            obj.resource = [];

            var data = {};
            data.id = comment_id;

            obj.resource.push(data);

            var url = baseURI + '/' + comment_id;
            
            //update (delete answer) local copy of answers
            var i = _comments.map(function(x) {return x.id; }).indexOf(comment_id);
            if (i > -1) _comments.splice(i,1);
            
            
            return $http.delete(url, data, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                if ($rootScope.DEBUG_MODE) console.log("Deleting comment was succesful");
                return result.data;
            }
        }
        
        function deletecommentsbyuser(user_id) {
            
            //delete records from local copy
            for (var i = 0; i < _comments.length; i++) {
                if (_comments[i].user == user_id) {
                    _comments.splice(i, 1);
                }
            }

            var url = baseURI + '?filter=user=' + user_id;

            return $http.delete(url).then(querySucceeded, _queryFailed);
            
            function querySucceeded(result) {

                if ($rootScope.DEBUG_MODE) console.log("Deleting comments for answer was succesful");
                return result.data;
            }
        }
        

        function _arecommentsLoaded() {

            //return _comments.length > 0;
            return false;
        }

        function _queryFailed(error) {

            throw error;
        }

    }
})();
(function () {
    'use strict';

    angular
        .module('app')
        .factory('catans', catans);

    catans.$inject = ['$http', '$q','$rootScope','votes'];

    function catans($http, $q, $rootScope, votes) {

        // Members
        var _allcatans = [];
        var baseURI = '/api/v2/mysql/_table/catans';

        var service = {
            getAllcatans: getAllcatans,
            //getbyCategory: getbyCategory,
            postRec: postRec,
            postRec2: postRec2,
            deleteRec: deleteRec,
            deleteAnswer: deleteAnswer,
            updateRec: updateRec,
            deletebyCategory: deletebyCategory            
        };

        return service;

        function getAllcatans(forceRefresh) {

            if (_areAllcatansLoaded() && !forceRefresh) {

                return $q.when(_allcatans);
            }
            
            //Get all catans records
            var url0 = baseURI + '?offset=' + 0 * 1000;
            var url1 = baseURI + '?offset=' + 1 * 1000;
            var url2 = baseURI + '?offset=' + 2 * 1000;
            var url3 = baseURI + '?offset=' + 3 * 1000;
            var url4 = baseURI + '?offset=' + 4 * 1000;
            var url5 = baseURI + '?offset=' + 5 * 1000;
            var url6 = baseURI + '?offset=' + 6 * 1000;
            var url7 = baseURI + '?offset=' + 7 * 1000;

            var p0 = $http.get(url0);
            var p1 = $http.get(url1);
            var p2 = $http.get(url2);
            var p3 = $http.get(url3);
            var p4 = $http.get(url4);
            var p5 = $http.get(url5);
            var p6 = $http.get(url6);
            var p7 = $http.get(url7);

            return $q.all([p0, p1, p2, p3, p4, p5, p6, p7]).then(function (d){
                _allcatans = d[0].data.resource.concat(d[1].data.resource, d[2].data.resource, d[3].data.resource, d[4].data.resource,
                d[5].data.resource, d[6].data.resource, d[7].data.resource);
                if ($rootScope.DEBUG_MODE) console.log("No. Cat-Ans: ", _allcatans.length);
                return _allcatans;            
            }, _queryFailed);  
            
        }
/*
        function getbyCategory(catarr) {

            //Create filter string
            var filtstr = '';
            for (var i=0; i<catarr.length; i++){
                if (i == 0) filtstr = filtstr + '(answer=' + catarr[i] + ')';
                else filtstr = filtstr + ' OR (answer=' + catarr[i] + ')';  
            }

            var url0 = baseURI + '?filter=' + filtstr;

            //console.log('url0 - ', url0); 
            
            var p0 = $http.get(url0);
            
            return $q.all([p0]).then(function (d){
                _allcatans = d[0].data.resource;
                if ($rootScope.DEBUG_MODE) console.log("No. Cat-Ans by Category: ", _allcatans.length);
                return _allcatans;            
            }, _queryFailed);  
       }
       */
        
        function postRec(x) {
           
            //form match record
            var data = {};
            data.answer = x;
            data.category = $rootScope.cCategory.id;
            data.upV = 0;
            data.downV = 0;
            data.user = $rootScope.user.id;
            data.timestmp = Date.now();
             
            var obj = {};
            obj.resource = [];

            obj.resource.push(data);
            
            _allcatans.push(data);
            var url = baseURI;

            return $http.post(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {
                
                //update local copies
                var id = result.data.resource[0].id; 
                _allcatans[_allcatans.length-1].id = id;
                
                if ($rootScope.DEBUG_MODE) console.log("creating catans record was succesful");
                return result.data;
            }
        }
        
        function postRec2(answer,category,isdup) {
           
            //form match record
            var data = {};
            data.answer = answer;
            data.category = category;
            data.upV = 0;
            data.downV = 0;
            data.user = $rootScope.user.id;
            data.timestmp = Date.now();
            data.isdup = isdup;
             
            var obj = {};
            obj.resource = [];

            obj.resource.push(data);
            
            _allcatans.push(data);
            var url = baseURI;

            return $http.post(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {
                
                //update local copies
                var id = result.data.resource[0].id; 
                _allcatans[_allcatans.length-1].id = id;
                
                if ($rootScope.DEBUG_MODE) console.log("creating catans record was succesful");
                return result.data;
            }
        }
        
         function deleteAnswer(answer_id) {
            
            //delete records from local copy
            for (var i=0; i<_allcatans.length;i++){
                if (_allcatans[i].answer == answer_id){
                    _allcatans.splice(i,1);
                } 
            }
            
           var url = baseURI + '?filter=answer=' + answer_id; 
            
            return $http.delete(url).then(querySucceeded, _queryFailed);
            
            function querySucceeded(result) {
                
                //Everytime a CatAns record is deleted, delete associated user votes with it
                for (var i=0; i<result.data.resource.length; i++){
                    votes.deleteVotesbyCatans(result.data.resource[i].id);
                }
                if ($rootScope.DEBUG_MODE) console.log("Deleting catans records was succesful");
                return result.data;
            }
        }
        
        function deleteRec(answer_id, category_id) {
            
            //delete records from local copy
            for (var i=0; i<_allcatans.length;i++){
                if (_allcatans[i].answer == answer_id && _allcatans[i].category == category_id){
                    _allcatans.splice(i,1);
                } 
            }
            
           var url = baseURI + '?filter=(answer=' + answer_id+') AND (category='+category_id+')'; 
            
            return $http.delete(url).then(querySucceeded, _queryFailed);
            
            function querySucceeded(result) {
                
                //Everytime a CatAns record is deleted, delete associated user votes with it
                for (var i=0; i<result.data.resource.length; i++){
                    votes.deleteVotesbyCatans(result.data.resource[i].id);
                }
                
                if ($rootScope.DEBUG_MODE) console.log("Deleting catans records by answer and category was succesful");
                return result.data;
            }
        }
        
        function deletebyCategory(category_id) {
            
            //delete records from local copy
            for (var i=0; i<_allcatans.length;i++){
                if (_allcatans[i].category == category_id){
                    _allcatans.splice(i,1);
                } 
            }
            
           var url = baseURI + '?filter=category=' + category_id; 
            
            return $http.delete(url).then(querySucceeded, _queryFailed);
            
            function querySucceeded(result) {
                
                //Everytime a CatAns record is deleted, delete associated user votes with it
                for (var i=0; i<result.data.resource.length; i++){
                    votes.deleteVotesbyCatans(result.data.resource[i].id);
                }
                if ($rootScope.DEBUG_MODE) console.log("Deleting catans records by category was succesful");
                return result.data;
            }
        }
        
         function updateRec(rec_id, field, val) {
             
            //form match record
            var obj = {};
            obj.resource = [];

            var data = {};
            data.id = rec_id;
            
            for (var i=0; i<field.length; i++){
                switch (field[i]){
                    case "upV": data.upV = val[i]; break;
                    case "downV": data.downV = val[i]; break;
                    case "rank": data.rank = val[i]; break;
                    case "answer": data.answer = val[i];break;
                    case "isdup": data.isdup = val[i];break;
                    case "category": data.category = val[i];break;
                }
            }
            //console.log("data", data);
            obj.resource.push(data);

            var url = baseURI;
            
            //update local copy
            //var idx = $rootScope.B.indexOf(+rec_id);
            var idx = _allcatans.map(function(x) {return x.id; }).indexOf(rec_id);            
            for (var i=0; i<field.length; i++){
                switch (field[i]){
                    case "upV": $rootScope.catansrecs[idx].upV = val[i]; break;
                    case "downV": $rootScope.catansrecs[idx].downV = val[i]; break;
                    case "rank": $rootScope.catansrecs[idx].rank = val[i]; break;
                    case "answer": $rootScope.catansrecs[idx].answer = val[i]; break;
                    case "isdup": $rootScope.catansrecs[idx].isdup = val[i]; break;
                    case "category": $rootScope.catansrecs[idx].category = val[i]; break;
                }
            }                        
            
            return $http.patch(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                if ($rootScope.DEBUG_MODE) console.log("updating catans record succesful");
                return result.data;
            }
        }
     
        function _areAllcatansLoaded() {

            return _allcatans.length > 0;
        }

        function _queryFailed(error) {

            throw error;
        }
    }
})();
(function () {
    'use strict';

    angular
        .module('app')
        .factory('answer', answer);

    answer.$inject = ['$http', '$q', '$rootScope','catans','vrows','uaf'];

    function answer($http, $q, $rootScope,catans, vrows, uaf) {

        //Members
        var _answers = [];
        var _selectedAnswer;
        var baseURI = '/api/v2/mysql/_table/answers';

        var service = {
            getAnswers: getAnswers,
            getAnswer: getAnswer,
            addAnswer: addAnswer,
            addAnswer2: addAnswer2,
            updateAnswer: updateAnswer,
            deleteAnswer: deleteAnswer,
            flagAnswer: flagAnswer,
            getAnswerbyCustomer:  getAnswerbyCustomer           
        };

        return service;
        

        function getAnswers(forceRefresh) {
            // console.log("getAnswers..._areAnswersLoaded()", _areAnswersLoaded());

            if (_areAnswersLoaded() && !forceRefresh) {

                return $q.when(_answers);
            }
            
            //Get all answer records
            var url0 = baseURI + '?offset=' + 0 * 1000;
            var url1 = baseURI + '?offset=' + 1 * 1000;
            var url2 = baseURI + '?offset=' + 2 * 1000;
            var url3 = baseURI + '?offset=' + 3 * 1000;
            var url4 = baseURI + '?offset=' + 4 * 1000;
            var url5 = baseURI + '?offset=' + 5 * 1000;
            var url6 = baseURI + '?offset=' + 6 * 1000;


            var p0 = $http.get(url0);
            var p1 = $http.get(url1);
            var p2 = $http.get(url2);
            var p3 = $http.get(url3);
            var p4 = $http.get(url4);
            var p5 = $http.get(url5);
            var p6 = $http.get(url6);

            return $q.all([p0, p1, p2, p3, p4, p5, p6]).then(function (d){
                _answers = d[0].data.resource.concat(d[1].data.resource, d[2].data.resource, d[3].data.resource, 
                d[4].data.resource, d[5].data.resource, d[6].data.resource);
                if ($rootScope.DEBUG_MODE) console.log("No. Answers: ", _answers.length);
                return _answers;            
            }, _queryFailed);  

        }

        function getAnswer(id, forceRefresh) {

            if (_isSelectedAnswerLoaded(id) && !forceRefresh) {

                return $q.when(_selectedAnswer);
            }

            var url = baseURI + '/' + id;

            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                return _selectedAnswer = result.data;
            }
        }
        
        function getAnswerbyCustomer(customer_id) {
/*
            if (_isSelectedAnswerLoaded(id) && !forceRefresh) {

                return $q.when(_selectedAnswer);
            }
*/
            var url = baseURI + '/?filter=customer='+ customer_id;

            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                return result.data;
            }
        }

        function addAnswer(answer) {

            var url = baseURI;
            var resource = [];

            resource.push(answer);
            
            return $http.post(url, resource, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: resource
            }).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                //update local copy
                var answerx = answer;
                answerx.id = result.data.resource[0].id; 
                _answers.push(answerx);
                
                //Update current establishment and person names for typeahead
                if (answerx.type == 'Establishment') {
                    $rootScope.estNames.push(answerx.name);
                    $rootScope.estAnswers.push(answerx);
                }
                if (answerx.type == 'Person') {
                    $rootScope.pplNames.push(answerx.name);
                    $rootScope.pplAnswers.push(answerx);
                }
                if (answerx.type == 'Place') {
                    $rootScope.plaNames.push(answerx.name);
                    $rootScope.plaAnswers.push(answerx);
                }
                                
                catans.postRec(answerx.id);
                vrows.postVrows4Answer(answerx);
                
                uaf.post('addedAnswer',['answer','category'],[answerx.id, $rootScope.cCategory.id]); //user activity feed
                
                if ($rootScope.DEBUG_MODE) console.log("created catans for a new answer");
                if ($rootScope.DEBUG_MODE) console.log("result", result);
                return result.data;
            }

        }
        
        function addAnswer2(answer, category) {

            var url = baseURI;
            var resource = [];

            resource.push(answer);

            return $http.post(url, resource, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: resource
            }).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                //update local copy
                var answerx = answer;
                answerx.id = result.data.resource[0].id; 
                _answers.push(answerx);
                
                //Update current establishment and person names for typeahead
                if (answerx.type == 'Establishment') {
                    $rootScope.estNames.push(answerx.name);
                    $rootScope.estAnswers.push(answerx);
                }
                if (answerx.type == 'Person') {
                    $rootScope.pplNames.push(answerx.name);
                    $rootScope.pplAnswers.push(answerx);
                }
                if (answerx.type == 'Place') {
                    $rootScope.plaNames.push(answerx.name);
                    $rootScope.plaAnswers.push(answerx);
                }
                
                uaf.post('addedAnswer',['answer','category'],[answerx.id, category[0]]); //user activity feed
                                
                for (var n=0; n<category.length; n++){
                    if (n == 0) catans.postRec2(answerx.id, category[n], false);
                    else catans.postRec2(answerx.id, category[n], true);    
                }
                
                vrows.postVrows4Answer(answerx);
                
                if ($rootScope.DEBUG_MODE) console.log('created '+ category.length + 'catans records for the new answer');
                if ($rootScope.DEBUG_MODE) console.log("result", result);
                return result.data;
            }

        }

        function updateAnswer(answer_id, field, val) {
           
            //form match record
            var obj = {};
            obj.resource = [];

            var data = {};
            data.id = answer_id;
            
            for (var i=0; i<field.length; i++){
                switch (field[i]){
                    case "name": data.name = val[i]; break;
                    case "addinfo": data.addinfo = val[i]; break;
                    case "cityarea": data.cityarea = val[i]; break;
                    case "location": data.location = val[i]; break;
                    case "image": data.imageurl = val[i]; break;
                    case "views": data.views = val[i]; break;
                    case "lat": data.lat = val[i]; break;
                    case "lng": data.lng = val[i]; break;
                    case "owner": data.owner = val[i]; break;
                    case "phone": data.phone = val[i]; break;
                    case "website": data.website = val[i]; break;
                    case "email": data.email = val[i]; break;
                    case "strhours": data.strhours = val[i]; break;
                    case "eventstr": data.eventstr = val[i]; break;
                    case "numcom": data.numcom = val[i]; break;
                    case "ranks": data.ranks = val[i]; break;
                    case "ispremium": data.ispremium = val[i]; break;
                    case "hasranks": data.hasranks = val[i]; break;
                    case "ranksqty": data.ranksqty = val[i]; break;
                    case "ig_image_urls": data.ig_image_urls = val[i]; break;
                }
            }
            //console.log("data", data);
            obj.resource.push(data);

            var url = baseURI;
            
            //update local copy
            //var idx = _answers.map(function(x) {return x.id; }).indexOf(answer_id);
            //var idx = $rootScope.A.indexOf(+answer_id);
            var idx = _answers.map(function(x) {return x.id; }).indexOf(answer_id);  
            for (var i=0; i<field.length; i++){
                switch (field[i]){
                    case "name": $rootScope.answers[idx].name = val[i]; break;
                    case "addinfo": $rootScope.answers[idx].addinfo = val[i]; break;
                    case "cityarea": $rootScope.answers[idx].cityarea = val[i]; break;
                    case "location": $rootScope.answers[idx].location = val[i]; break;
                    case "image": $rootScope.answers[idx].imageurl = val[i]; break;
                    case "views": $rootScope.answers[idx].views = val[i]; break;
                    case "lat": $rootScope.answers[idx].lat = val[i]; break;
                    case "lng": $rootScope.answers[idx].lng = val[i]; break;
                    case "owner": $rootScope.answers[idx].owner = val[i]; break;
                    case "phone": $rootScope.answers[idx].phone = val[i]; break;
                    case "website": $rootScope.answers[idx].website = val[i]; break;
                    case "email": $rootScope.answers[idx].email = val[i]; break;
                    case "strhours": $rootScope.answers[idx].strhours = val[i]; break;
                    case "eventstr": $rootScope.answers[idx].eventstr = val[i]; break;
                    case "numcom": $rootScope.answers[idx].numcom = val[i]; break;
                    case "ranks": $rootScope.answers[idx].ranks = val[i]; break;
                    case "ispremium": $rootScope.answers[idx].ispremium = val[i]; break;
                    case "hasranks": $rootScope.answers[idx].hasranks = val[i]; break;
                    case "ranksqty": $rootScope.answers[idx].ranksqty = val[i]; break;
                }
            }                        
            
            return $http.patch(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {
                
                if (field[0] == 'owner') uaf.post('binded',['answer'],[answer_id]); //user activity feed 

                if ($rootScope.DEBUG_MODE) console.log("updating answer succesful");
                return result.data;
            }
        }
        
        function flagAnswer(answer_id, flag) {
           
            //form match record
            var obj = {};
            obj.resource = [];

            var data = {};
            data.id = answer_id;
            data.flag = flag

            //console.log("data", data);
            obj.resource.push(data);

            var url = baseURI;          
            
            return $http.patch(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                if ($rootScope.DEBUG_MODE) console.log(" answer flagged succesful");
                return result.data;
            }
        }
        

        function deleteAnswer(answer_id) {
           
            //form match record
            var obj = {};
            obj.resource = [];

            var data = {};
            data.id = answer_id;

            obj.resource.push(data);

            var url = baseURI + '/' + answer_id;
            
            //update (delete answer) local copy of answers
            var i = _answers.map(function(x) {return x.id; }).indexOf(answer_id);
            if (i > -1) _answers.splice(i,1);
            
            return $http.delete(url, data, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                if ($rootScope.DEBUG_MODE) console.log("Deleting answer was succesful");
                return result.data;
            }
        }

        function _areAnswersLoaded() {

            return _answers.length > 0;
        }

        function _isSelectedAnswerLoaded(id) {

            return _selectedAnswer && _selectedAnswer.id == id;
        }

        function _queryFailed(error) {

            throw error;
        }

    }
})();

angular.module('app') .directive('fileModel', ['$parse', function ($parse) { 
    'use strict';
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            
            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);
angular.module('app').directive('bgBox', ['color',function (color) {
    'use strict';

    return {
        templateUrl: 'app/common/partials/bgbox.html',
        transclude: true,
        scope: {
            bc: '@',
            bc2: '@',
            fc: '@',
            shade: '@',
            text: '@',
            dir: '@',
            w: '@',
            h: '@',
        },
        link: function (scope) {
           if (scope.dir == "horizontal"){
               scope.dirHor = true;
               scope.dirVer = false;
           }
           if (scope.dir == "vertical"){
               scope.dirHor = false;
               scope.dirVer = true;
           }
           if (scope.bc2 == undefined) scope.bc2 = color.shadeColor(scope.bc,scope.shade); 
        },
    }
}
]);
(function () {
    'use strict';

    angular
        .module('app')
        .controller('editAnswer', editAnswer);

    editAnswer.$inject = ['dialog', '$stateParams', '$state', '$rootScope', 'catans', 
    '$modal', 'edit', 'editvote', 'answer', 'image','getgps','$window','getwiki', '$http'];

    function editAnswer(dialog, $stateParams, $state, $rootScope, catans, 
    $modal, edit, editvote, answer, image, getgps, $window, getwiki, $http) {
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
        
        vm.ranking = $rootScope.title;
        vm.userIsOwner = $rootScope.userIsOwner;
        
        //var A = $rootScope.A;
        //if ($stateParams.index) vm.answer = $rootScope.canswers[A.indexOf(+$stateParams.index)];
        if ($stateParams.index) {
            var i =  $rootScope.answers.map(function(x) {return x.id; }).indexOf(+$stateParams.index);
            vm.answer = $rootScope.answers[i];
        }
        vm.type = vm.answer.type;
        vm.imageURL = vm.answer.imageurl;
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

        $rootScope.$on('fileUploaded', function (event, data){
                $rootScope.cmd1exe = $rootScope.cmd1exe ? $rootScope.cmd1exe : false;        
            if ($state.current.name == 'editAnswer' && !$rootScope.cmd1exe) {
                $rootScope.cmd1exe = true;
                $rootScope.blobimage = data;
                selectImage();                
            }
        });
        
        $rootScope.$on('answerGPSready', function () {
            if ($state.current.name == 'editAnswer' && !editAnswerGPSexec) editAnswerGPS();
        });
        
        $rootScope.$on('wikiReady', function (event,wikiRes) {
            if ($state.current.name == 'editAnswer') loadWiki(wikiRes);
        });
        
        //Adjust picture size for very small displays
        if ($window.innerWidth < 512) {vm.sm = true; vm.nsm=false;}
        else {vm.sm = false; vm.nsm = true;}
                    
        activate();

        function activate() {
            
            //country.loadCountries();
            //vm.countries = $rootScope.cCountries;
            loadAnswerData();
            if (vm.userIsOwner && vm.type == 'Establishment') loadHoursData();
            
            vm.access = vm.userIsOwner && vm.answer.isactive;
            
            
            getEdits(vm.answer.id);

            if ($rootScope.DEBUG_MODE) console.log("Edit Answer Activated!");
        }

        function loadAnswerData() {

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
            console.log("@editImate");
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
                dialog.loginFacebook();
                //dialog.getDialog('notLoggedIn');
                return;
            }
        }

        function selectImage() {
            if ($rootScope.DEBUG_MODE) console.log("@selectImage");
            var newEdit = {};
            newEdit.field = "image";
            newEdit.cval = vm.answer.imageurl;
            newEdit.nval = "";
            if ($rootScope.userIsOwner) newEdit.imageURL = $rootScope.blobimage;
            else newEdit.imageURL = vm.imageURL;
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
            console.log("$rootScope.userIsOwner - ", $rootScope.userIsOwner);
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
                if (!editIsLocation) answerDetail();
            }
            if (type == 'reject') {
                discardEdit(index);
            }
        }

        function approveEdit(index) {
            //update answer, delete edit record, and delete edit votes
            if ($rootScope.DEBUG_MODE) console.log("Edit has been approved");
            if (vm.edits[index].field == "image") {
                if ($rootScope.DEBUG_MODE) console.log("EA-3");
                answer.updateAnswer(vm.edits[index].answer, [vm.edits[index].field], [vm.edits[index].imageURL]);
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
                var rec2change = []; //store id of catans to change
                var change2cat = []; //store category to change to
                
                for (var i=0; i<$rootScope.catansrecs.length; i++){
                    if ($rootScope.catansrecs[i].answer == vm.answer.id){
                        cidx = $rootScope.content.map(function(x) {return x.id; }).indexOf($rootScope.catansrecs[i].category);
                        cObj = $rootScope.content[cidx];
                        //if category for catans includes old nh, see if category for new nh exists
                        if (cObj.title.indexOf(vm.answer.cityarea) > -1){
                            sTitle = cObj.title.replace(vm.answer.cityarea,vm.edits[index].nval);
                            for (var k=0; k<$rootScope.content.length; k++){
                                //if searched title is found, store catans rec and category
                                if ($rootScope.content[k].title == sTitle){
                                    //console.log($rootScope.content[k].title);
                                    rec2change.push($rootScope.catansrecs[i].id);
                                    change2cat.push($rootScope.content[k].id);
                                    break;
                                }
                            }
                        }
                    }
                }
                //console.log("rec2change - ", rec2change);
                //console.log("change2cat - ", change2cat);
                for (var i=0; i<rec2change.length; i++){
                    catans.updateRec(rec2change[i],['category'],[change2cat[i]]);
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
            if (x.field == "image") {
                if ($rootScope.DEBUG_MODE) console.log("R1");
                vm.imageURL = $rootScope.blobimage;
                //console.log("vm.imageURL - ", vm.imageURL);
                answer.updateAnswer(x.answer, ['image'], [x.imageURL]);
                //$state.go("editAnswer", { reload: true });
                $state.go('editAnswer', {}, { reload: true });
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
                selectImage();
            }
            else{
                vm.imageURL = imageLinks[vm.linkIdx];
            }
        }
        
    }
})();

(function () {
    'use strict';

    angular
        .module('app')
        .controller('answerRanksManager', answerRanksManager);

    answerRanksManager.$inject = ['dialog', '$stateParams', '$state', '$rootScope', 'catans', 
    '$modal', 'edit', 'editvote', 'answer', 'table','$window'];

    function answerRanksManager(dialog, $stateParams, $state, $rootScope, catans, 
    $modal, edit, editvote, answer, table, $window) {
        /* jshint validthis:true */
        var vm = this;

        vm.title = 'answerRanksManager';

        //Members
        vm.editRank = editRank;
        vm.addRank = addRank;
        vm.deleteRank = deleteRank;
        vm.goBack = goBack;

        var selRank = 0;
        
        activate();

        function activate() {

            vm.ranksqty = $rootScope.canswer.ranksqty; 

            if ($rootScope.canswer == undefined) $state.go('cwrapper');

            var n=0;
            vm.ranks = JSON.parse($rootScope.canswer.ranks);
            for (var i=0; i<vm.ranks.length; i++){
                n = $rootScope.content.map(function(x) {return x.id; }).indexOf(vm.ranks[i].id);
                vm.ranks[i].title = $rootScope.content[n].title.replace(' @ '+$rootScope.canswer.name,'');
                vm.ranks[i].used = true;
            }

            if (vm.ranks.length < $rootScope.canswer.ranksqty){
                for (var j=vm.ranks.length; j<$rootScope.canswer.ranksqty; j++){
                    var emptyObj = {}
                    emptyObj.title = 'Empty';
                    emptyObj.used = false;
                    vm.ranks.push(emptyObj);
                }
            }
            console.log("vm.ranks - ", vm.ranks);                     

            if ($rootScope.DEBUG_MODE) console.log("Answer rankings manager activated!");
        }

        function editRank(x){
            $rootScope.rankIdx = x;
            $rootScope.rankforAnswerMode = 'edit';
            $state.go('addRankforAnswer'); 
        }

        function addRank(){
            $rootScope.rankforAnswerMode = 'add';
            $state.go('addRankforAnswer');
        }

        function deleteRank(x){
            var idx = $rootScope.content.map(function(x) {return x.id; }).indexOf(vm.ranks[x].id);
            selRank = x;
            dialog.deleteRank($rootScope.content[idx],execDeleteRank);           
        }

        function execDeleteRank(){
            table.deleteTable(vm.ranks[selRank].id);
            vm.ranks.splice(selRank,1);
            //Clear title fields and scope variables
            var ranksArr = [];
            var rankObj = {};
            for (var i=0; i<vm.ranks.length; i++){
                if (vm.ranks[i].used){
                    rankObj = {};
                    rankObj.id = vm.ranks[i].id;
                    rankObj.bc = vm.ranks[i].bc;
                    rankObj.fc = vm.ranks[i].fc;
                    ranksArr.push(rankObj);
                }                
            }
            var ranksStr = JSON.stringify(ranksArr);
            answer.updateAnswer($rootScope.canswer.id,['ranks'],[ranksStr]);
            activate();
            
        }

        function goBack(){
            $state.go('answerDetail',{index: $rootScope.canswer.id});
        }

    }
})();

(function () {
    'use strict';

    angular
        .module('app')
        .controller('answerDetail', answerDetail);

    answerDetail.$inject = ['flag', '$stateParams', '$state', 'answer', 'dialog', '$rootScope','$window', 'useractivity','htmlops',

        'votes', 'matchrec', 'edit', 'editvote', 'catans', 'datetime','commentops', 'userdata','useraccnt',
        '$location', 'vrows', 'vrowvotes','imagelist','instagram', '$scope','$cookies', '$q', 'fbusers', 'InstagramService']; //AM:added user service

    function answerDetail(flag, $stateParams, $state, answer, dialog, $rootScope, $window, useractivity,htmlops,
        votes, matchrec, edit, editvote, catans, datetime, commentops, userdata,useraccnt,
        $location, vrows, vrowvotes, imagelist, instagram, $scope, $cookies, $q, fbusers, InstagramService) { //AM:added user service
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'answerDetail';
        //if ($location.absUrl().indexOf('code=')>-1)$window.location.search = '';

        var voteRecordExists = false;
        var dV = 0;
        var upVi = 0;  //upVotes initial value
        var downVi = 0; //downVotes initial value
        var answers = [];
        var recordsUpdated = false;
        vm.numEdits = 0;
        
        // Members
        vm.relativetable = [];
        vm.catans = [];
        vm.sm = $rootScope.sm;
        vm.votemode = false;
               
        // Methods
        vm.UpVote = UpVote;
        vm.DownVote = DownVote;
        vm.refresh = refresh;
        vm.goBack = goBack;
        vm.goPrev = goPrev;
        vm.goNext = goNext;
        vm.deleteAnswer = deleteAnswer;
        vm.flagAnswer = flagAnswer;
        vm.deleteButton = 'none';
        vm.showUrl = showUrl;
        vm.closeRank = closeRank;
        vm.closeAnswerDetail = closeAnswerDetail;
        vm.rankSel = rankSel;
        vm.bizRegDialog = bizRegDialog;
        vm.openSpecials = openSpecials;
        vm.editVRows = editVRows;
        vm.getImages = getImages;
        vm.showsimage = showsimage;
        vm.gotoRank = gotoRank;
        vm.vrowVoteUp = vrowVoteUp;
        vm.vrowVoteDown = vrowVoteDown;
        vm.loadComments = loadComments;
        vm.postComment = postComment;
        vm.selectPhoto = selectPhoto;
        vm.cmFlag = cmFlag;
        vm.deleteThisCatans = deleteThisCatans;
        vm.addRankforAnswer = addRankforAnswer;
        vm.votemodeON = votemodeON;
        vm.votemodeOFF = votemodeOFF;
        vm.user = $rootScope.user;
        vm.selectInstagramImages = selectInstagramImages;

        //Admin Function adding catans on spot
        vm.addCatans = addCatans;
        vm.addctsactive = false;
        vm.addcts = addcts;

       //Comments related variables
        var cObj = {};
        cObj.commLoaded = false;
        cObj.initials = '';
        cObj.bc = '';
        cObj.fc = '';
        cObj.comments = [];
        cObj.newComment = '';
        vm.cm = cObj;
        vm.commentAllowed = true;
  
        //TODO: Would like to add this abstract template, but dont know how                           
        $rootScope.$on('$stateChangeStart',
            function (ev, to, toParams, from, fromParams) {
                if (from.name == 'answerDetail' && to.name != 'answerDetail') {
                    if (!recordsUpdated && $rootScope.isLoggedIn) updateRecords();
                }
            });

        var refreshImagesListener = $rootScope.$on('refreshImages', function () {
            if ($state.current.name == 'answerDetail') getImages();
        });
        var fileUploadedListener = $rootScope.$on('fileUploaded', function () {
            if ($state.current.name == 'answerDetail') getImages();
        });

        var answerDataLoadedListener = $rootScope.$on('answerDataLoaded', function () {
            vm.dataReady = true;
            activate();
        });

        $scope.$on('$destroy',refreshImagesListener);
        $scope.$on('$destroy',fileUploadedListener);
        $scope.$on('$destroy',answerDataLoadedListener);
    
        if ($rootScope.answerDetailLoaded) { vm.dataReady = true; activate(); }
        else vm.dataReady = false;

        //activate();
        window.prerenderReady = false;

        function activate() {

            //Init variables
            vm.ranking = $rootScope.title;
            answers = $rootScope.canswers;
            vm.fields = $rootScope.fields;
            vm.isAdmin = $rootScope.isAdmin;
            $rootScope.isLoggedIn = $rootScope.isLoggedIn ? $rootScope.isLoggedIn : false;
            vm.isLoggedIn = $rootScope.isLoggedIn;

            //vm.userIsOwner = $rootScope.userIsOwner;
            if ($stateParams.index) {
                var i = $rootScope.answers.map(function (x) { return x.id; }).indexOf(+$stateParams.index);
                vm.answer = $rootScope.answers[i];
            }

            // ----- SEO tags ----
            $scope.$parent.$parent.$parent.seo = { 
                pageTitle : vm.answer.name, 
                metaDescription: vm.answer.addinfo 
            };

            $rootScope.canswer = vm.answer;
            vm.type = vm.answer.type;
            //vm.isShortPhrase = vm.type == 'Short-Phrase';
            
            //if there is no category, look for it in cookies
            if ($rootScope.cCategory == undefined) {
                var ccategoryid = $cookies.get('ccategory');
                if ($rootScope.DEBUG_MODE) console.log("@answerDetail - ccategory ", ccategoryid);
                var idx = $rootScope.content.map(function (x) { return x.id; }).indexOf(ccategoryid);
                if (idx > -1) $rootScope.cCategory = $rootScope.content[idx];
            }

            if ($rootScope.inFavMode) vm.ranking = $rootScope.myfavs.title;
            else if ($rootScope.cCategory) vm.ranking = $rootScope.cCategory.title;
            else vm.ranking = '';

            //if answers not loaded (state went straight to asnwerDetail, answers is just current answer)
            if (answers == undefined) answers = [vm.answer];

            vm.idx = answers.map(function (x) { return x.id; }).indexOf(vm.answer.id) + 1;
            if ($rootScope.cCategory == undefined) vm.idx = 0;

            //Temp for Instagram Demo
            if (vm.answer.id == 2225) vm.igdemo = true;
            else vm.igdemo = false;

            getFields();

            //Set Image Mode -- Map or Photo
            vm.modeIsImage = $rootScope.modeIsImage == undefined ? true : $rootScope.modeIsImage;
            if (vm.answer.location == undefined) vm.modeIsImage = true;

            if ($rootScope.previousState != 'answerDetail') $window.scrollTo(0, 0);

            vm.showImageGallery = false;
            $rootScope.$emit('showLogo');

            getHeader();
            //        getCatAnsId(vm.answer.id);
            getEdits(vm.answer.id);
            deleteButtonAccess();
            //if (vm.type == 'Establishment') getHours();
            if (vm.type != 'Establishment' && vm.type != 'Event' && false) makeRelativeTable(vm.answer.id);
            if (vm.type == 'Establishment') getSpecials(vm.answer.id);
            if (vm.type == 'Establishment' || vm.type == 'PersonCust') getVRows(vm.answer.id);
            getAnswerRanks();

            //custom ranks 
            if (vm.answer.hasranks) {
                var n = 0;
                vm.myranks = JSON.parse(vm.answer.ranks);
                if (vm.myranks != undefined && vm.myranks.length > 0){
                    for (var i=0; i<vm.myranks.length; i++){
                        n = $rootScope.content.map(function(x) {return x.id; }).indexOf(vm.myranks[i].id);
                        vm.myranks[i].title = $rootScope.content[n].title.replace(' @ '+vm.answer.name,'');
                        vm.myranks[i].image = $rootScope.content[n].image1url;
                        if (vm.myranks[i].image == undefined || vm.myranks[i].image == '')
                        vm.myranks[i].image = $rootScope.EMPTY_IMAGE;
                    }
                }
            }
            //if user votes are available - do my thing at getAnswerVotes
            //else fetch user votes
            if ($rootScope.cvotes) getAnswerVotes();
            else {
                $rootScope.cvotes = [];
                $rootScope.ceditvotes = [];
            }

            //Check if answer is event
            if (vm.type == 'Event') {
                var eventObj = JSON.parse(vm.answer.eventstr);
                //Object.assign(vm.answer, eventObj);
                mergeObject(vm.answer, eventObj);
                vm.ehtml = htmlops.eventHtml(vm.answer, vm.sm);
                vm.estyle = 'background-color:' + vm.answer.bc + ';color:' + vm.answer.fc + ';' + 'white-space:pre;';
            }

            vm.access = false; //use this variable to access editspecials
            if ($rootScope.isLoggedIn) {
                if ($rootScope.user.id == vm.answer.owner) {
                    vm.userIsOwner = true;
                    if (vm.answer.isactive) vm.access = true;
                }
                else vm.userIsOwner = false;
            }
            else vm.userIsOwner = false;

            $rootScope.userIsOwner = vm.userIsOwner;

            //Determine number of user comments
            if (vm.answer.numcom == undefined) vm.numcom = 0;
            else vm.numcom = vm.answer.numcom;

            //Determine if necessary to show navigation buttons
            if (vm.ranking) vm.showNextnPrev = true;
            else vm.showNextnPrev = false;

            //Update number of views
            var nViews = vm.answer.views + 1;
            answer.updateAnswer(vm.answer.id, ['views'], [nViews]);

            votemodeOFF();

            if ($rootScope.DEBUG_MODE) console.log("Answer details loaded");

            window.prerenderReady = true;
        }

        function getFields() {

            if ($rootScope.fields) return;
            else {
                var fidx = 0;
                switch (vm.answer.type) {
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
            }

        }

        function getHeader() {
            //vm.public = $rootScope.canswers.public;
            if (vm.answer.owner == undefined || vm.answer.owner == null || vm.answer.owner == 0) {
                vm.answer.hasOwner = false;
            }
            else vm.answer.hasOwner = true;

            vm.bindtxt = '';
            if (vm.type == 'Establishment') vm.bindtxt = 'I represent this business';
            if (vm.type == 'PersonCust') vm.bindtxt = 'I am this person';
            if (vm.type == 'Event') vm.bindtxt = 'I organize this event';

        }

        //AM: Create the relative table of this answer with respect to the other ones.
        function makeRelativeTable(id) {
            //rank.computeRanking(answers,mrecs);
            var PctF = 0;
            var PctC = 0;
            var vsName = "";
            vm.relativetable = [];
            var R = $rootScope.R;
            var GP = $rootScope.GP;
            var answersR = $rootScope.answersR;
            var x = A.indexOf(+id);
            var W = 0;
            var mainField = $rootScope.fields[0].name;
            var isC = false; //main field is country

            for (var n = 0; n < answersR.length; n++) {
                if (A[n] != id) {
                    //W = (GP[x][n] + R[x][n]) / 2;
                    W = R[x][n];

                    switch (mainField) {
                        case "name": { vsName = answersR[n].name; break; }
                        case "nickname": { vsName = answersR[n].nickname; break; }
                        case "country": { vsName = answersR[n].country; isC = true; break; }
                        case "club": { vsName = answersR[n].club; break; }
                    }

                    if (GP[x][n]) {
                        PctF = Math.round((W / GP[x][n]) * 100);
                        PctC = 100 - PctF;
                    }
                    else {
                        PctF = 0;
                        PctC = 0;
                    }
                    vm.relativetable.push({
                        id: answersR[n].id,
                        Rank: answersR[n].Rank,
                        PctF: PctF,
                        vsName: vsName,
                        PctC: PctC,
                        GP: GP[x][n],
                        isC: isC
                    })
                }
            }
        }
        
        //AM: Refresh display when new answer is selected from relative table
        function refresh(x) {
            //$window.scrollTo(0,0);
            updateRecords();
            recordsUpdated = false;
            voteRecordExists = false;


            vm.answer = answers[A.indexOf(+x)];
            $rootScope.canswer = vm.answer;
            getEdits(vm.answer.id);
            upVi = vm.catans.upV;
            downVi = vm.catans.downV;
            getHeader();
            getAnswerRanks();
            getAnswerVotes();
            makeRelativeTable(x);
            getSpecials(vm.answer.id);
            getVRows(vm.answer.id);
            getAnswerRanks();
        }
        
        //Update Records
        function updateRecords() {
            
            //update vote record if necessary
            if ($rootScope.DEBUG_MODE) console.log("UpdateRecords @answerDetail");
            
            //TODO Need to pass table id
            for (var i = 0; i < vm.answerRanks.length; i++) {

                var voteRecordExists = vm.answerRanks[i].voteRecordExists;
                var userHasRank = false;
                var useractivityrec = {};
                var idx = $rootScope.thisuseractivity.map(function (x) { return x.category; }).indexOf(vm.answerRanks[i].id);
                if (idx >= 0) {
                    userHasRank = true;
                    useractivityrec = $rootScope.thisuseractivity[idx];
                }
                else userHasRank = false;  
                //if vote is changed to non-zero
                if (voteRecordExists && vm.answerRanks[i].uservote.vote != vm.answerRanks[i].dV && vm.answerRanks[i].dV != 0) {
                    //update vote
                    if ($rootScope.DEBUG_MODE) console.log("UR-1");
                    votes.patchRec(vm.answerRanks[i].uservote.id, vm.answerRanks[i].dV);
                }
                //if vote is changed to zero
                if (voteRecordExists && vm.answerRanks[i].uservote.vote != vm.answerRanks[i].dV && vm.answerRanks[i].dV == 0) {
                    //Delete vote
                    if ($rootScope.DEBUG_MODE) console.log("UR-2");
                    votes.deleteRec(vm.answerRanks[i].uservote.id);
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
                if (!voteRecordExists && vm.answerRanks[i].dV != 0) {
                    //Post a new vote and create useractivity record
                    if ($rootScope.DEBUG_MODE) console.log("UR-5");
                    votes.postRec(vm.answerRanks[i].catans, vm.answer.id, vm.answerRanks[i].id, vm.answerRanks[i].dV);
                    if (userHasRank) {
                        if ($rootScope.DEBUG_MODE) console.log("UR-6");
                        useractivity.patchRec(useractivityrec.id, useractivityrec.votes + 1);
                        //$rootScope.userActRec.votes++;
                    }
                    else {
                        if ($rootScope.DEBUG_MODE) console.log("UR-7");
                        useractivity.postRec(vm.answerRanks[i].id);
                        //$rootScope.thisuseractivity.push();
                    }
                }
            
                //update answer record (vote count) if necessary
                //TODO Need to pass table id
                if ((vm.answerRanks[i].upV != vm.answerRanks[i].upVi) || (vm.answerRanks[i].downV != vm.answerRanks[i].downVi)) {
                    if ($rootScope.DEBUG_MODE) console.log("UR-8");
                    catans.updateRec(vm.answerRanks[i].catans, ["upV", "downV"], [vm.answerRanks[i].upV, vm.answerRanks[i].downV]);
                }
            }

            if (vm.type == 'Establishment' || vm.type == 'PersonCust') {
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
            recordsUpdated = true;
        }
        
        //AM:Refresh Thumb Up and Thumb down Vote Displays
        
        function getAnswerVotes() {
            //look for user vote for this catans
            for (var i = 0; i < vm.answerRanks.length; i++) {
                vm.answerRanks[i].voteRecordExists = false;

                for (var j = 0; j < $rootScope.cvotes.length; j++) {
                    if ($rootScope.cvotes[j].catans == vm.answerRanks[i].catans) {
                        vm.answerRanks[i].uservote = $rootScope.cvotes[j];
                        vm.answerRanks[i].uservote.ansvidx = i;
                        //ansvidx = i;
                        vm.answerRanks[i].voteRecordExists = true;
                        break;
                    }

                }
                if (vm.answerRanks[i].voteRecordExists) {
                    vm.answerRanks[i].dV = vm.answerRanks[i].uservote.vote;
                    //catansid = uservote.catans;
                }
                else {
                    vm.answerRanks[i].dV = 0;
                    //catansid = x;
                }
                displayVote(vm.answerRanks[i]);
            }

        }

        function getVRowVotes() {
            if ($rootScope.isLoggedIn) {
                for (var i = 0; i < $rootScope.cansvrows.length; i++) {
                    //check votes for display
                    for (var j = 0; j < $rootScope.cvrowvotes.length; j++) {

                        if ($rootScope.cvrowvotes[j].vrow == $rootScope.cansvrows[i].id) {
                            $rootScope.cansvrows[i].voteExists = true;
                            $rootScope.cansvrows[i].dVi = $rootScope.cvrowvotes[j].val;
                            $rootScope.cansvrows[i].dV = $rootScope.cvrowvotes[j].val;
                            $rootScope.cansvrows[i].voteid = $rootScope.cvrowvotes[j].id;
                            $rootScope.cansvrows[i].vidx = j;
                            setVRowVoteImage($rootScope.cansvrows[i], $rootScope.cvrowvotes[j].val);
                        }
                    }
                }
            }
            displayVRows();
        }

        function setVRowVoteImage(obj, val) {
            if (val == 1) {

                obj.upImage = 'thumbs_up_blue_table.png';
                obj.downImage = 'thumbs_down_gray_table.png';
            }
            if (val == 0) {
                obj.dVi = 0;
                obj.dV = 0;
                obj.upImage = 'thumbs_up_gray_table.png';
                obj.downImage = 'thumbs_down_gray_table.png';
            }
            if (val == -1) {
                obj.dVi = -1;
                obj.dV = -1;
                obj.upImage = 'thumbs_up_gray_table.png';
                obj.downImage = 'thumbs_down_blue_table.png';
            }
        }
        //See if there are edits for this answer
        function getEdits(id) {
            vm.numEdits = 0;
            for (var i = 0; i < $rootScope.edits.length; i++) {
                if ($rootScope.edits[i].answer == id) {
                    vm.numEdits++;
                }
            }
        }

        function displayVote(x) {

            if (x.dV == 1) {
                x.thumbUp = "thumbs_up_blue_table.png";//"thumbs_up_blue.png";//
                x.thumbDn = "thumbs_down_gray_table.png";//"thumbs_down_gray.png";
            }

            if (x.dV == 0) {
                x.thumbUp = "thumbs_up_gray_table.png";//"thumbs_up_gray.png";
                x.thumbDn = "thumbs_down_gray_table.png";//"thumbs_down_gray.png";
            }
            if (x.dV == -1) {
                x.thumbUp = "thumbs_up_gray_table.png";//"thumbs_up_gray.png";
                x.thumbDn = "thumbs_down_blue_table.png";//"thumbs_down_blue.png";
            }
        }
        
        //AM:UpVote
        function UpVote(x) {

            if ($rootScope.isLoggedIn) {

                switch (x.dV) {
                    case -1: { x.dV = 1; x.upV++; x.downV--; break; }
                    case 0: { x.dV = 1; x.upV++; break; }
                    case 1: { x.dV = 0; x.upV--; break; }
                }

                displayVote(x);
                if ($rootScope.DEBUG_MODE) console.log("UpVote");
            }
            else {
                dialog.loginFacebook();
                //dialog.getDialog('notLoggedIn');
                return;
            }

        }
        
        //AM:DownVote
        function DownVote(x) {

            if ($rootScope.isLoggedIn) {
                switch (x.dV) {
                    case -1: { x.dV = 0; x.downV--; break; }
                    case 0: { x.dV = -1; x.downV++; break; }
                    case 1: { x.dV = -1; x.upV--; x.downV++; break; }
                }

                displayVote(x);
                if ($rootScope.DEBUG_MODE) console.log("DownVote");
            }
            else {
                dialog.loginFacebook();
                //dialog.getDialog('notLoggedIn');
                return;
            }

        }

        function goBack() {

            if ($rootScope.DEBUG_MODE) console.log("goBack");       
            
            //update Up and Down votes, and counter
            //if (!recordsUpdated && $rootScope.isLoggedIn) updateRecords();
            
            if ($rootScope.previousState == 'match') {
                $state.go('match');
            }
            else if ($rootScope.inFavMode) {
                $state.go('myfavs');
            }
            else {
                //var nViews = vm.answer.views + 1;
                //answer.updateAnswer(vm.answer.id, ['views'], [nViews]);
                if ($rootScope.cCategory) $state.go('rankSummary', { index: $rootScope.cCategory.id });
                else $state.go('cwrapper');
            }
        }

        function rankSel(x) {
            //console.log(x);
            $rootScope.title = x.title;
            $state.go('rankSummary', { index: x.id });
        }

        function deleteAnswer() {

            console.log("Delete Answer");

            dialog.deleteType(function () {
                //delete catans for this answer
                matchrec.deleteRecordsbyCatans($rootScope.cCategory.id, vm.answer.id);
                catans.deleteRec(vm.answer.id, $rootScope.cCategory.id).then(function () {
                    $state.go("answerDetail", { index: vm.answer.id }, { reload: true });
                });

            }, function () {
                //delete answer 
                answer.deleteAnswer(vm.answer.id);
                //delete match records of that answer
                matchrec.deleteRecordsbyAnswer(vm.answer.id);
                //delete vote records from that answer
                //votes.deleteVotesbyCatans(vm.answer.id);
                //delete edits for this answer
                edit.deleteEditbyAnswer(vm.answer.id);
                //delete edit votes for this answer
                editvote.deleteEditVotesbyAnswer(vm.answer.id);
                //delete catans for this answer
                catans.deleteAnswer(vm.answer.id);
                //delete vrows for this answer
                vrows.deleteVrowByAnswer(vm.answer.id);
                $state.go("rankSummary", { index: $rootScope.cCategory.id });
            });

        }

        function deleteThisCatans(r) {

            var thisAnswer = vm.answer.name;
            var idx = $rootScope.content.map(function (x) { return x.id; }).indexOf(r.id);
            var thisCategory = $rootScope.content[idx].title;
            dialog.deleteThisCatans(thisAnswer, thisCategory, function () {
                //delete catans for this answer
                matchrec.deleteRecordsbyCatans(r.id, vm.answer.id);
                catans.deleteRec(vm.answer.id, r.id).then(function () {
                    $state.go("answerDetail", { index: vm.answer.id }, { reload: true });
                });
            });
        }



        function flagAnswer(x) {
            if ($rootScope.isLoggedIn) {
                if ($rootScope.DEBUG_MODE) console.log("Answer Flagged");
                flag.flagAnswer('answer', vm.answer.id, x);
                dialog.getDialog('answerFlagged');
                return;
            }
            else dialog.loginFacebook(); 
            //dialog.getDialog('notLoggedIn');
        }

        function cmFlag(x) {
            if ($rootScope.isLoggedIn) {
                if ($rootScope.DEBUG_MODE) console.log("Answer Comment Flagged");
                flag.flagAnswer('comment-answer', vm.answer.id, x);
                dialog.getDialog('commentFlagged');
                return;
            }
            else dialog.loginFacebook(); 
            //dialog.getDialog('notLoggedIn'); 
        }

        function getAnswerRanks() {

            vm.answerRanks = [];
            for (var i = 0; i < $rootScope.catansrecs.length; i++) {
                //if ($rootScope.catansrecs[i].answer == vm.answer.id && $rootScope.catansrecs[i].category != $rootScope.cCategory.id) {
                if ($rootScope.catansrecs[i].answer == vm.answer.id) {
                    for (var j = 0; j < $rootScope.content.length; j++) {
                        if ($rootScope.content[j].id == $rootScope.catansrecs[i].category) {
                            //to each rank object attach catans data
                            var rankObj = $rootScope.content[j];
                            rankObj.upV = $rootScope.catansrecs[i].upV;
                            rankObj.downV = $rootScope.catansrecs[i].downV;
                            rankObj.catans = $rootScope.catansrecs[i].id;
                            rankObj.rank = $rootScope.catansrecs[i].rank;
                            rankObj.uservote = {};
                            rankObj.upVi = $rootScope.catansrecs[i].upV;
                            rankObj.downVi = $rootScope.catansrecs[i].downV;

                            if (rankObj.rank == 1) rankObj.icon = "/assets/images/gold_.png";
                            else if (rankObj.rank == 2) rankObj.icon = "/assets/images/silver_.png";
                            else if (rankObj.rank == 3) rankObj.icon = "/assets/images/bronze_.png";
                            else if (rankObj.rank > 3 && rankObj.rank < 11) rankObj.icon = "/assets/images/top_10.png";
                            else if (rankObj.rank >= 11 && rankObj.rank < 21) rankObj.icon = "/assets/images/top_20.png";
                            else if (rankObj.rank >= 21 && rankObj.rank < 51) rankObj.icon = "/assets/images/top_50.png";
                            else if (rankObj.rank >= 51 && rankObj.rank < 101) rankObj.icon = "/assets/images/top_100.png";
                            else rankObj.icon = "/assets/images/blank.png";
   
                            //TODO insert rank position out of total list, will be in catans
                            vm.answerRanks.push(rankObj);
                        }
                    }
                }
            }
            //vm.otherRanksExist = vm.otherRanks.length > 0 ? true : false;
            vm.otherRanksExist = true;
        }

        function getSpecials(answerid) {
            vm.specialsList = [];
            for (var i = 0; i < $rootScope.specials.length; i++) {
                if ($rootScope.specials[i].answer == answerid) {
                    //format date, load name and html msg
                    datetime.formatdatetime($rootScope.specials[i]);
                    $rootScope.specials[i].name = vm.answer.name;

                    var htmlmsg = htmlops.specialHtml($rootScope.specials[i], vm.sm);
                    $rootScope.specials[i].html = htmlmsg;
                    //Separate style (not working with ng-bind-html)
                    var spStyle = 'background-color:' + $rootScope.specials[i].bc + ';color:' + $rootScope.specials[i].fc + ';' +
                        'white-space:pre;';
                    $rootScope.specials[i].style = spStyle;
                    if ($rootScope.specials[i].image != undefined &&
                        $rootScope.specials[i].image != $rootScope.EMPTY_IMAGE) {
                        $rootScope.specials[i].hasimage = true;
                    }
                    else $rootScope.specials[i].hasimage = false;
                    vm.specialsList.push($rootScope.specials[i]);
                }
            }
        }

        function showsimage(x) {
            if (!x.showimage) {
                x.showimage = true;
            }
            else x.showimage = false;
        }

        function getVRows(answerid) {
            $rootScope.cansvrows = [];
            //Load vrows for this answer           
            for (var i = 0; i < $rootScope.cvrows.length; i++) {
                if ($rootScope.cvrows[i].answer == answerid) {
                    var obj = $rootScope.cvrows[i];
                    obj.idx = i; //Store object but store index in main local copy
                    obj.voteExists = false;
                    obj.dV = 0;
                    obj.upVi = $rootScope.cvrows[i].upV;
                    obj.downVi = $rootScope.cvrows[i].downV;
                    obj.upImage = 'thumbs_up_gray_table.png';
                    obj.downImage = 'thumbs_down_gray_table.png';
                    $rootScope.cansvrows.push(obj);
                }
            }
            getVRowVotes();

        }

        function displayVRows() {

            vm.vrows = [];
            function compare(a, b) {
                return a.gnum - b.gnum;
            }
            if ($rootScope.cansvrows.length > 0) {
                vm.vrows = $rootScope.cansvrows.sort(compare);
                vm.vrows[0].shdr = true;
                for (var i = 1; i < vm.vrows.length; i++) {
                    if (vm.vrows[i].gnum == vm.vrows[i - 1].gnum) vm.vrows[i].shdr = false;
                    else vm.vrows[i].shdr = true;
                }
                vm.vrows[vm.vrows.length - 1].saddr = true;
                for (var i = 0; i < vm.vrows.length - 1; i++) {
                    if (vm.vrows[i].gnum != vm.vrows[i + 1].gnum) vm.vrows[i].saddr = true;
                    else vm.vrows[i].saddr = false;
                }

                vm.vrowgroups = [];
                var vrowgroup = [];
                var tgroup = vm.vrows[0].gnum;
                for (var i = 0; i < vm.vrows.length; i++) {

                    if (tgroup != vm.vrows[i].gnum) {
                        //console.log("vrowgroup --- ", vrowgroup);
                        vm.vrowgroups.push(vrowgroup);
                        vrowgroup = [];
                        vrowgroup.push(vm.vrows[i]);
                        tgroup = vm.vrows[i].gnum;

                    }
                    else {
                        vrowgroup.push(vm.vrows[i]);
                    }
                    //for last element
                    if (i == vm.vrows.length - 1) {
                        vm.vrowgroups.push(vrowgroup);
                    }
                }

            }
        }

        function deleteButtonAccess() {
            if ($rootScope.isAdmin) vm.deleteButton = 'inline';
            else vm.deleteButton = 'none';
        }

        function showUrl() {
            dialog.url(vm.answer.imageurl);
        }

        function closeRank() {
            $state.go('cwrapper');            
        }

        function closeAnswerDetail(){
            goBack();
        }

        function bizRegDialog() {
            dialog.bizRegistration(bizRegistration);
        }

        function bizRegistration() {
            if ($rootScope.isLoggedIn) {
                dialog.bindAccount($rootScope.user.name, vm.answer.name, bindAccount);
            }
            else {
                dialog.getDialog('notLoggedInBiz');
            }
            //$state.go('register');
        }

        function bindAccount() {
            if ($rootScope.DEBUG_MODE) console.log("Bind business to user account");
            answer.updateAnswer(vm.answer.id, ['owner'], [$rootScope.user.id]).then(reloadAnswer);
            var item = {};
            item = vm.answer;
            item.username = $rootScope.user.first_name + ' ' + $rootScope.user.last_name;  
            
            useraccnt.adduseraccnt(item).then(function () {
                //Check if user account has email - if not set warning in navbar
                var hasEmail = false;
                for (var i = 0; i < $rootScope.useraccnts.length; i++) {
                    if ($rootScope.useraccnts[i].email != '') hasEmail = true;
                }
                if (!hasEmail) $rootScope.$emit('showWarning');
            });
        }

        function reloadAnswer() {
            $state.go("answerDetail", { index: vm.answer.id }, { reload: true });
        }

        function openSpecials() {
            $state.go('specials');
        }

        function editVRows() {
            $state.go('editvrows');
        }

        function addRankforAnswer() {
            $state.go('answerRanksManager');
        }

        function getImages() {
            if (vm.igdemo) instagram.getImages().then(showImages);
            else {
                $rootScope.blobs = [];
                var urls = vm.answer.ig_image_urls.split(';');

                for (var i = 0; i < urls.length; i++) {
                    if(urls[i] != ''){
                        var myObj = {};
                        myObj.url = urls[i];
                        myObj.type = 'Instagram';
                        $rootScope.blobs.push(myObj);
                    }
                }
                imagelist.getImageList().then(showImages);
            }

            vm.showImageGallery = true;

        }
        function showImages() {
            if (vm.igdemo) vm.images = $rootScope.igimages;
            else vm.images = $rootScope.blobs;
            //console.log("@showImages - ", vm.images);
        }
        /*
        function showMap(){
          google.maps.event.addDomListener(window, "load", initMap);

        }
        var map = {};
        function initMap(){
            var latlng = new google.maps.LatLng(-34.397, 150.644);
            var myOptions = {
                zoom: 8,
                center: latlng,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            map = new google.maps.Map(document.getElementById("map-canvas"),myOptions);
        }*/

        function gotoRank(x) {
            //var nViews = vm.answer.views + 1;
            //answer.updateAnswer(vm.answer.id, ['views'], [nViews]);
            $state.go('rankSummary', { index: x.id });
        }

        function goPrev() {
            var L = answers.length;
            var i = answers.map(function (x) { return x.id; }).indexOf(vm.answer.id);
            var ni = i - 1; //next index
            if (ni < 0) ni = L - 1; //if less than zero wrap to last
            //var nViews = vm.answer.views + 1;
            //answer.updateAnswer(vm.answer.id, ['views'], [nViews]);
            if ($rootScope.isLoggedIn) updateRecords();
            $state.go('answerDetail', { index: answers[ni].id });
        }

        function goNext() {
            var L = answers.length;
            var i = answers.map(function (x) { return x.id; }).indexOf(vm.answer.id);
            var ni = i + 1; //next index
            if (ni > L - 1) ni = 0; //if less than zero wrap to last
            //var nViews = vm.answer.views + 1;
            //answer.updateAnswer(vm.answer.id, ['views'], [nViews]);
            if ($rootScope.isLoggedIn) updateRecords();
            $state.go('answerDetail', { index: answers[ni].id });
        }

        function vrowVoteUp(x) {

            if ($rootScope.isLoggedIn) {

                switch (x.dV) {
                    case -1: { x.dV = 1; x.upV++; x.downV--; break; }
                    case 0: { x.dV = 1; x.upV++; break; }
                    case 1: { x.dV = 0; x.upV--; break; }
                }

                displayVRowVote(x);
                if ($rootScope.DEBUG_MODE) console.log("VRow UpVote");
            }
            else {
                dialog.loginFacebook();
                //dialog.getDialog('notLoggedIn');
                return;
            }
            //console.log("vm.answerRanks ---", vm.answerRanks);
        }        
        //AM:DownVote
        function vrowVoteDown(x) {

            if ($rootScope.isLoggedIn) {
                switch (x.dV) {
                    case -1: { x.dV = 0; x.downV--; break; }
                    case 0: { x.dV = -1; x.downV++; break; }
                    case 1: { x.dV = -1; x.upV--; x.downV++; break; }
                }

                displayVRowVote(x);
                if ($rootScope.DEBUG_MODE) console.log("DownVote");
            }
            else {
                dialog.loginFacebook();
                //dialog.getDialog('notLoggedIn');
                return;
            }
            //console.log("vm.answerRanks ---", vm.answerRanks);
        }

        function displayVRowVote(x) {

            if (x.dV == 1) {
                x.upImage = "thumbs_up_blue_table.png";
                x.downImage = "thumbs_down_gray_table.png";
            }

            if (x.dV == 0) {
                x.upImage = "thumbs_up_gray_table.png";
                x.downImage = "thumbs_down_gray_table.png";
            }
            if (x.dV == -1) {
                x.upImage = "thumbs_up_gray_table.png";
                x.downImage = "thumbs_down_blue_table.png";
            }
        }

        function loadComments() {
            commentops.loadComments('answer', cObj)
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
            commentops.postComment('answer', cObj);
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

        function selectPhoto(x) {
            dialog.seePhotos(vm.images, x, vm.answer, vm.userIsOwner);
        }

        function addcts(x) {
            var title = '';
            var category = 0;
            var isDup = false;

            title = vm.addctsval;
            isDup = vm.catisdup == undefined ? false : vm.catisdup;

            for (var i = 0; i < $rootScope.content.length; i++) {
                if ($rootScope.content[i].title == title) {
                    category = $rootScope.content[i].id;
                    break;
                }
            }
            //console.log("postRec catans -",myAnswer.id,category,isDup);
            catans.postRec2(vm.answer.id, category, isDup);

            vm.addctsactive = false;

            setTimeout(function () {
                $state.go("answerDetail", { index: vm.answer.id }, { reload: true });
            }, 1000);
        }

        function addCatans(x) {
            vm.addctsopts = [];
            var opt = '';
            for (var i = 0; i < $rootScope.ctsOptions.length; i++) {
                if ($rootScope.ctsOptions[i].indexOf('@neighborhood') > -1) {
                    opt = $rootScope.ctsOptions[i].replace('@neighborhood', vm.answer.cityarea);
                    vm.addctsopts.push(opt);
                }
                else vm.addctsopts.push($rootScope.ctsOptions[i]);
            }
            vm.addctsactive = true;
        }

        function votemodeON(){
            vm.votemode = true;
            vm.voteonstyle = "background-color:#3277b3;color:#e6e6e6";
            vm.voteoffstyle = "background-color:#e6e6e6;color:black";
        }
        function votemodeOFF(){
            vm.votemode = false;
            vm.voteonstyle = "background-color:#e6e6e6;color:black";
            vm.voteoffstyle = "background-color:#3277b3;color:#e6e6e6";
        }

        function selectInstagramImages(){
            if(InstagramService.access_token() == null) {
                InstagramService.login();
            }
            else {
                InstagramService.getMyRecentImages()
                .then(function(response){
                    dialog.chooseImgFromIgDlg(response.data.data, vm.answer, vm.userIsOwner);
                })
                .catch(function(err){
                    console.log(err);
                });
            }
            $rootScope.$on("instagramLoggedIn", function (evt, args) {
                InstagramService.getMyRecentImages()
                .then(function(response){
                    console.log(response);
                    dialog.chooseImgFromIgDlg(response.data.data, vm.answer, vm.userIsOwner);
                }).catch(function(err){
                    console.log(err);
                });
            });
        }
    }
})();

(function () {
    'use strict';

    angular
        .module('app')
        .controller('addEvent', addEvent);

    addEvent.$inject = ['dialog', '$state', 'answer', '$rootScope', '$modal', 'datetime',
     'image', 'catans', 'getgps', '$timeout','getwiki','$window'];

    function addEvent(dialog, $state, answer, $rootScope, $modal, datetime,
    image, catans, getgps, $timeout, getwiki, $window) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'addEvent';
        vm.header = "table" + $rootScope.cCategory.id + ".header";
        vm.body = 'table' + $rootScope.cCategory.id + '.body';
        vm.searchDisabled = 'disabled';
        vm.modalEnable = true;
        vm.publicfields = [];
        vm.ranking = $rootScope.cCategory.title;
        var publicfield_obj = {};
        var loadImageDataOk = false;
        var addEventDataOk = false;
        var addEventExec = false;
        var events = $rootScope.events;
        
        //load public fields
        var fieldreq = [];
                
        //google search
        var imageLinks = [];
        vm.linkIdx = 0;
        vm.numLinks = 0;
        vm.imageCommand = 'Get images';
        vm.searchDisabled = '';
        var attNum = 1;
        vm.imagefunctions = 'none';
        vm.ev = {};
        var myEvent = {};

        //search for equivalent ranks
        var inDistrict = false;
        var inDistrictName = '';
        var inDowntown = false;
        var inCity = false;
        var eqRankIdx = 0;
        var eqFound = false;
        
        // Members
        var myAnswer = {};
        
        // Methods
        vm.calladdEvent = calladdEvent;
        vm.rankSummary = rankSummary;
        vm.callSearchImage = callSearchImage;
        vm.viewNext = viewNext;
        vm.viewPrev = viewPrev;
        vm.closeRank = closeRank;
        vm.onNoGoodImages = onNoGoodImages;
        vm.showHowItWorksDialog = showHowItWorksDialog;
        vm.displayCharLength = displayCharLength;
        vm.frequencySel = frequencySel;
        vm.showPreview = showPreview;
        vm.deleteSpecial = deleteSpecial;
        vm.goBack = goBack;
        
        vm.imageURL = $rootScope.EMPTY_IMAGE;
        vm.header = $rootScope.header;
        
        //TODO: Would like to add this abstract template, but dont know how         
        
		//Adjust picture size for very small displays
        if ($window.innerWidth < 512) {vm.sm = true; vm.nsm = false; }
        else {vm.sm = false; vm.nsm = true; }

        activate();

        function activate() {
            loadPublicFields();
            determineScope();
            //$rootScope.eventmode = 'add';
             if ($rootScope.eventmode == 'edit') {
                
                //Copy object without reference
                vm.ev = JSON.parse(JSON.stringify($rootScope.canswer));
                datetime.formatdatetime(vm.ev);
                
                vm.isEdit = true;
                if (vm.ev.freq == 'onetime') frequencySel(1);
                if (vm.ev.freq == 'weekly') frequencySel(2);
                //vm.ev.bc = vm.sp.bc;
                //vm.ev.fc = vm.sp.fc;
                console.log("vm.ev --- ", vm.ev);
                vm.imageURL = vm.ev.imageurl;

            }

            if ($rootScope.eventmode == 'add') {

                vm.char = 45;
                vm.ev.fc = "hsl(0, 100%, 0%)"; //black
                vm.ev.bc = "hsl(0, 0%, 100%)"; //white
                frequencySel(1);
            }

            createTimeDropdown();
            
            console.log("Add Event Activated!");

        }

        function determineScope() {
            if ($rootScope.cCategory.title.indexOf('San Diego') > -1) {
                inCity = true;
            }
            if ($rootScope.cCategory.title.indexOf('Downtown') > -1) {
                inDowntown = true;
            }
            for (var j = 0; j < $rootScope.districts.length; j++) {
                if ($rootScope.cCategory.title.indexOf($rootScope.districts[j]) > -1) {
                    inDistrict = true;
                    inDistrictName = $rootScope.districts[j];
                }
            }
        }

        function loadPublicFields() {
            vm.emptyarray = [];
            
            vm.neighborhoods = $rootScope.neighborhoods.concat($rootScope.districts);

            vm.fields = $rootScope.fields;
            vm.type = $rootScope.cCategory.type;
                       
            //Add extra info
            vm.fields.opts = [];
            vm.fields.val = [];
            vm.fields.textstyle = [];

            for (var i = 0; i < vm.fields.length; i++) {
                vm.fields[i].val = '';
                
                //Typeahead for neighborhoods
                if (vm.fields[i].name == "cityarea") vm.fields[i].opts = "c for c in vm.neighborhoods";
                else vm.fields[i].opts = "c for c in vm.emptyarray";
                
                //When neighborhood is implied put it in the input field right away
                if (vm.fields[i].name == "cityarea" && $rootScope.cCategory.type == 'Establishment' && $rootScope.NhImplied == true) {
                    vm.fields[i].val = $rootScope.NhValue;
                }

                if (vm.fields[i].name == "addinfo") vm.fields[i].textstyle = "textarea";
                else vm.fields[i].textstyle = "text";
                
                //console.log("name, opts -- ", vm.fields[i].name, vm.fields[i].opts);
            }

        }

        /*
        function addEvent() {

            if (!addEventExec) {
                myEvent.imageurl = vm.imageURL;
                
                myEvent.upV = 0;
                myEvent.downV = 0;
                myEvent.type = vm.type;
                myEvent.userid = $rootScope.user.id;
                myEvent.views = 0;

                dialog.addEvent(myEvent, vm.imageURL, addEventConfirmed);

                addEventExec = true;
                
                //This is to prevent double pulses and have two answers get submitted by hardware glitch
                $timeout(function () {
                    addEventExec = false;
                }, 1000)
            }
        }
        */
        
        function loadFormData() {
            //initialize form
            //for (var i = 0; i < vm.fields.length; i++) {
                //switch (vm.fields[i].name) {
                    myEvent.name = vm.ev.name;
                    myEvent.location = vm.ev.location;
                    myEvent.addinfo = vm.ev.addinfo;
                    myEvent.cityarea = vm.ev.cityarea;
                    myEvent.website = vm.ev.website;

              //  }
            //}
        }

        function validateData() {
            loadImageDataOk = true;
            //addEventDataOk = true;
            if (vm.ev.name.length < 3) {
                  loadImageDataOk = false;
            }
            
           //loadImageDataOk = loadImageDataOk && countryIsValid;
           addEventDataOk = (loadImageDataOk && (vm.numLinks > 0 || vm.ngi));
        }

        function rankSummary() {

            $state.go("rankSummary", { index: $rootScope.cCategory.id });
        }

        function callSearchImage() {

            var pFields = [];

            loadFormData();
            validateData();

            if (loadImageDataOk) {
                
                var obj = {};
                obj.field = "name";
                obj.val = vm.ev.name;
                obj.cval = vm.ev.name;
                
                pFields.push(obj);
                //pFields = JSON.parse(JSON.stringify(vm.ev));
                //pFields = [vm.ev.title];
                //pFields[cFld].val = $rootScope.countries_en[countryIdx];
                var q1 = image.getImageLinks(pFields, attNum, 'add');
                q1.then(processImageResults, imageQueryFailed)

            }
            else {
                dialog.getDialog('missingDataImage');
                return;
            }
        }

        function imageQueryFailed() {
            console.log('query failed, dont give up');
        }

        function calladdEvent() {
            loadFormData();
            validateData();
            
            if (addEventDataOk) {
                addEvent();
            }
            else {
                dialog.getDialog('missingDataAnswer');
                return;
            }
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
            
            //imageLinks = imageLinks.concat(results);
            vm.numLinks = imageLinks.length;
            attNum++;
            if (vm.numLinks > 10 || attNum >= 4) vm.searchDisabled = 'disabled';
            if (attNum > 1) vm.imageCommand = 'Get more images';
            vm.linkIdx = 0;

            vm.imageURL = imageLinks[vm.linkIdx];

            testImageUrl(imageLinks[vm.linkIdx], showImageNotOk);

            if (vm.numLinks > 0) vm.imagefunctions = 'inline';

        }


        function viewNext() {
            vm.linkIdx++;
            if (vm.linkIdx >= vm.numLinks) vm.linkIdx = 0;
            vm.imageURL = imageLinks[vm.linkIdx];
            testImageUrl(imageLinks[vm.linkIdx], showImageNotOk);
        }
        function viewPrev() {
            vm.linkIdx--;
            if (vm.linkIdx < 0) vm.linkIdx = vm.numLinks - 1;
            vm.imageURL = imageLinks[vm.linkIdx];
            testImageUrl(imageLinks[vm.linkIdx], showImageNotOk);
        }

        function addEventConfirmed(myEvent) {
            //Add new answer, also add new post to catans (inside addAnser)
            var eventObj = {};
            eventObj.bc = myEvent.bc;
            eventObj.fc = myEvent.fc;
            eventObj.freq = myEvent.freq;
            eventObj.edate = myEvent.edate;
            eventObj.sdate = myEvent.sdate;
            eventObj.etime = myEvent.etime;
            eventObj.etime2 = myEvent.etime2;
            eventObj.stime = myEvent.stime;
            eventObj.stime2 = myEvent.stime2;
            eventObj.mon = myEvent.mon;
            eventObj.tue = myEvent.tue;
            eventObj.wed = myEvent.wed;
            eventObj.thu = myEvent.thu;
            eventObj.fri = myEvent.fri;
            eventObj.sat = myEvent.sat;
            eventObj.sun = myEvent.sun;
            
            var eventstr = JSON.stringify(eventObj);
            
            var ansObj = {};
            ansObj.name = myEvent.name;
            ansObj.addinfo = myEvent.addinfo;
            ansObj.cityarea = myEvent.cityarea;
            ansObj.location = myEvent.location;
            ansObj.type = 'Event';
            ansObj.website = myEvent.website;
            ansObj.imageurl = myEvent.imageurl;
            ansObj.views = 0;
            ansObj.eventstr = eventstr;
            ansObj.userid = $rootScope.user.id
            if(vm.bind) ansObj.owner = $rootScope.user.id;
            
            eqRanks();
            if (eqFound && !inCity) answer.addAnswer2(ansObj, [$rootScope.cCategory.id, eqRankIdx]).then(rankSummary);
            else if (eqFound && inCity) answer.addAnswer2(ansObj, [eqRankIdx]).then(rankSummary);
            else answer.addAnswer(ansObj).then(rankSummary); 
            
            //answer.addAnswer(ansObj).then(rankSummary); 
            //console.log("adding myEvent", eventStr);
            //console.log("adding answer", ansObj);
        }
        
        function updateEventConfirmed(){
            
            var eventObj = {};
            eventObj.bc = myEvent.bc;
            eventObj.fc = myEvent.fc;
            eventObj.freq = myEvent.freq;
            eventObj.edate = myEvent.edate;
            eventObj.sdate = myEvent.sdate;
            eventObj.etime = myEvent.etime;
            eventObj.etime2 = myEvent.etime2;
            eventObj.stime = myEvent.stime;
            eventObj.stime2 = myEvent.stime2;
            eventObj.mon = myEvent.mon;
            eventObj.tue = myEvent.tue;
            eventObj.wed = myEvent.wed;
            eventObj.thu = myEvent.thu;
            eventObj.fri = myEvent.fri;
            eventObj.sat = myEvent.sat;
            eventObj.sun = myEvent.sun;
            
            var eventstrNew = JSON.stringify(eventObj);
            
            var fields = [];
            var vals = []; 
            
            if($rootScope.canswer.name != vm.ev.name) {fields.push('name'); vals.push(vm.ev.name);}
            if($rootScope.canswer.addinfo != vm.ev.addinfo) {fields.push('addinfo'); vals.push(vm.ev.addinfo);}
            if($rootScope.canswer.cityarea != vm.ev.cityarea) {fields.push('cityarea'); vals.push(vm.ev.cityarea);}
            if($rootScope.canswer.location != vm.ev.location) {fields.push('location'); vals.push(vm.ev.location);}
            if($rootScope.canswer.website != vm.ev.website) {fields.push('website'); vals.push(vm.ev.website);}
            if($rootScope.canswer.imageurl != vm.imageURL) {fields.push('imageurl'); vals.push(vm.imageURL);}
            if($rootScope.canswer.eventstr != eventstrNew) {fields.push('eventstr'); vals.push(eventstrNew);}
            if($rootScope.canswer.owner != vm.ev.owner) {fields.push('owner'); vals.push(vm.ev.owner);}
            
            console.log("fields - ", fields);
            console.log("vals - ", vals);
            
            answer.updateAnswer(vm.ev.id, fields, vals);
        }
        
        function showHowItWorksDialog() {
            dialog.howItWorks('addEvent');
        }

        function testImageUrl(url, callback, timeout) {
            timeout = timeout || 5000;
            var timedOut = false, timer;
            var img = new Image();
            img.onerror = img.onabort = function () {
                if (!timedOut) {
                    clearTimeout(timer);
                    callback(url, "error");
                }
            };
            img.onload = function () {
                if (!timedOut) {
                    clearTimeout(timer);
                    callback(url, "success");
                }
            };
            img.src = url;
            timer = setTimeout(function () {
                timedOut = true;
                callback(url, "timeout");
            }, timeout);
        }

        function showImageNotOk(url, result) {
            if (result == "error" || result == "timeout") {
                vm.imageURL = $rootScope.EMPTY_IMAGE;
            }
        }
        
        function onNoGoodImages(x){
            if (x){
                vm.imageURL = $rootScope.EMPTY_IMAGE;
            }
            else{
                vm.imageURL = imageLinks[vm.linkIdx];
            }
        }
        
        function displayCharLength() {
            vm.char = 45 - vm.ev.name.length;
        }

        function frequencySel(x) {
            if (x == 1) {
                vm.weekly = false;
                vm.onetime = true;
                vm.ev.freq = 'onetime';
            }
            if (x == 2) {
                vm.weekly = true;
                vm.onetime = false;
                vm.ev.freq = 'weekly';
            }
        }

        function showPreview() {
            myEvent = vm.ev;
            myEvent.imageurl = vm.imageURL;
            myEvent.date = myEvent.sdate;
            
            //myEvent.freq = (vm.onetime ? 'onetime' : 'weekly');
            if ($rootScope.eventmode == 'add') dialog.createEventPreview(myEvent, addEventConfirmed);
            else dialog.createEventPreview(myEvent, updateEventConfirmed);
        }
        
         function addSpecial() {
            if (vm.isEdit == false) {
                if (vm.sp.freq == 'onetime'){
                    myEvent.stime2 = null;
                    myEvent.etime2 = null;
                }
                if (vm.sp.freq == 'weekly'){
                    myEvent.stime = null; myEvent.sdate = null;
                    myEvent.etime = null; myEvent.edate = null;
                }
                event.addSpecial(myEvent).then();
                
            }
            else event.updateEvent(myEvent);
            $state.go('specials');
        }
        
        function eqRanks() {
            var lookRank = '';
            if (inDowntown || inDistrict || inCity) {
                if (inDowntown && myAnswer.cityarea != 'Downtown') {
                    lookRank = $rootScope.cCategory.title.replace('Downtown', vm.ev.cityarea);
                    for (var n = 0; n < $rootScope.content.length; n++) {
                        if ($rootScope.content[n].title == lookRank) {
                            eqFound = true;
                            eqRankIdx = $rootScope.content[n].id;
                        }
                    }
                }
                if (inDistrict) {
                    lookRank = $rootScope.cCategory.title.replace(inDistrictName, 'Downtown');
                    for (var n = 0; n < $rootScope.content.length; n++) {
                        if ($rootScope.content[n].title == lookRank) {
                            eqFound = true;
                            eqRankIdx = $rootScope.content[n].id;
                        }
                    }
                }               
                if (inCity){
                    lookRank = $rootScope.cCategory.title.replace('San Diego', vm.ev.cityarea);
                    for (var n = 0; n < $rootScope.content.length; n++) {
                        if ($rootScope.content[n].title == lookRank) {
                            eqFound = true;
                            eqRankIdx = $rootScope.content[n].id;
                        }
                    }
                }
            }
        }
        
       function deleteSpecial() {
            event.deleteEvent(myEvent.id);
            $state.go('specials');
        }

        function goBack() {
            //$state.go('specials');
            $state.go("rankSummary", { index: $rootScope.cCategory.id });
        }

        function createTimeDropdown() {

            vm.timeDD = ["7:00 AM", "7:30 AM", "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
                "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM",
                "8:00 PM", "8:30 PM", "9:00 PM", "9:30 PM", "10:00 PM", "10:30 PM", "11:00 PM", "11:30 PM", "12:00 AM", "12:30 AM", "1:00 AM", "1:30 AM",
                "2:00 AM", "2:30 AM", "3:00 AM", "3:30 AM", "4:00 AM", "4:30 AM", "5:00 AM", "5:30 AM", "6:00 AM", "6:30 AM"];
        }

        function closeRank() {
            $state.go('cwrapper');
        }

    }

})();

(function () {
    'use strict';

    angular
        .module('app')
        .controller('addAnswer', addAnswer);

    addAnswer.$inject = ['dialog', '$state', 'answer', '$rootScope', '$modal', 
    'image', 'catans', 'getgps', '$timeout','getwiki','$window'];

    function addAnswer(dialog, $state, answer, $rootScope, $modal,
    image, catans, getgps, $timeout, getwiki, $window) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'addAnswer';
        vm.header = "table" + $rootScope.cCategory.id + ".header";
        vm.body = 'table' + $rootScope.cCategory.id + '.body';
        vm.searchDisabled = 'disabled';
        vm.modalEnable = true;
        vm.publicfields = [];
        vm.ranking = $rootScope.cCategory.title;
        var publicfield_obj = {};
        var loadImageDataOk = false;
        var addAnswerDataOk = false;
        var addAnswerExec = false;
        var addAnswerGPSexec = false;
        var answers = $rootScope.answers;
        
        
        //load public fields
        var fieldreq = [];
                
        //google search
        var imageLinks = [];
        vm.linkIdx = 0;
        vm.numLinks = 0;
        vm.imageCommand = 'Get images';
        vm.searchDisabled = '';
        var attNum = 1;
        vm.imagefunctions = 'none';

        //var answerhtml = '';
        //var categoryhtml = '';
        //var countryIsValid = false;
        //var countryIdx = -1;
        //var cFld = -1;
        var duplicateExists = false;
        var duplicateSameCategory = false;
        
        //search for equivalent ranks
        var inDistrict = false;
        var inDistrictName = '';
        var inDowntown = false;
        var inCity = false;
        var eqRankIdx = 0;
        var eqFound = false;
        
        // Members
        var myAnswer = {};
        var extAnswer = {};

        // Methods
        vm.callAddAnswer = callAddAnswer;
        vm.rankSummary = rankSummary;
        vm.callSearchImage = callSearchImage;
        vm.viewNext = viewNext;
        vm.viewPrev = viewPrev;
        vm.closeRank = closeRank;
        vm.getWiki = getWiki;
        vm.onNoGoodImages = onNoGoodImages;
        vm.showHowItWorksDialog = showHowItWorksDialog;
        
        vm.imageURL = $rootScope.EMPTY_IMAGE;
        vm.header = $rootScope.header;
        
        //TODO: Would like to add this abstract template, but dont know how         
        $rootScope.$on('answerGPSready', function () {
            if ($state.current.name == 'addAnswer' && !addAnswerGPSexec) addAnswerGPS();
        });
        
        $rootScope.$on('wikiReady', function (event,wikiRes) {
            if ($state.current.name == 'addAnswer') loadWiki(wikiRes);
        });
        
        //Adjust picture size for very small displays
        if ($window.innerWidth < 512) {vm.sm = true; vm.nsm = false; }
        else {vm.sm = false; vm.nsm = true; }

        activate();

        function activate() {
            loadPublicFields();
            determineScope(); 
             if ($rootScope.DEBUG_MODE) console.log("Add Answer Activated!");

        }

        function determineScope() {
            if ($rootScope.cCategory.title.indexOf('San Diego') > -1) {
                inCity = true;
            }
            /*
            if ($rootScope.cCategory.title.indexOf('Downtown') > -1) {
                inDowntown = true;
            }
            for (var j = 0; j < $rootScope.districts.length; j++) {
                if ($rootScope.cCategory.title.indexOf($rootScope.districts[j]) > -1) {
                    inDistrict = true;
                    inDistrictName = $rootScope.districts[j];
                }
            }*/
        }

        function loadPublicFields() {
            vm.emptyarray = [];
            //if ($rootScope.isDowntown) vm.neighborhoods = $rootScope.districts; 
            //else vm.neighborhoods = $rootScope.neighborhoods.concat($rootScope.districts);
            
            vm.neighborhoods = $rootScope.neighborhoods.concat($rootScope.districts);

            vm.establishmentNames = $rootScope.estNames;
            vm.peopleNames = $rootScope.pplNames;
            vm.placesNames = $rootScope.plaNames;

            vm.fields = $rootScope.fields;
            vm.type = $rootScope.cCategory.type;
                       
            //Add extra info
            vm.fields.opts = [];
            vm.fields.val = [];
            vm.fields.textstyle = [];

            for (var i = 0; i < vm.fields.length; i++) {
                vm.fields[i].val = '';
                
                //Typeahead for neighborhoods
                if (vm.fields[i].name == "cityarea") vm.fields[i].opts = "c for c in vm.neighborhoods";
                else vm.fields[i].opts = "c for c in vm.emptyarray";
                
                //Typeahead check for current establishments
                if (vm.fields[i].name == "name" && $rootScope.cCategory.type == 'Establishment') {
                    vm.fields[i].opts = "c for c in vm.establishmentNames";
                }
                
                //Typeahead check for current Persons
                if (vm.fields[i].name == "name" && $rootScope.cCategory.type == 'Person') {
                    vm.fields[i].opts = "c for c in vm.peopleNames";
                }
                
                //Typeahead check for current Persons
                if (vm.fields[i].name == "name" && $rootScope.cCategory.type == 'Place') {
                    vm.fields[i].opts = "c for c in vm.placesNames";
                }
                
                //When neighborhood is implied put it in the input field right away
                if (vm.fields[i].name == "cityarea" && $rootScope.cCategory.type == 'Establishment' && $rootScope.NhImplied == true) {
                    if ($rootScope.NhValue != 'Downtown') vm.fields[i].val = $rootScope.NhValue;
                }

                if (vm.fields[i].name == "addinfo") vm.fields[i].textstyle = "textarea";
                else vm.fields[i].textstyle = "text";
                
                //console.log("name, opts -- ", vm.fields[i].name, vm.fields[i].opts);
            }

        }


        function addAnswer() {

            if (!addAnswerExec) {
                myAnswer.imageurl = vm.imageURL;
                if ($rootScope.cCategory.type == 'Short-Phrase') myAnswer.imageurl = 'none';

                myAnswer.upV = 0;
                myAnswer.downV = 0;
                myAnswer.type = vm.type;
                myAnswer.userid = $rootScope.user.id;
                myAnswer.views = 0;

                if (duplicateExists) dialog.checkSameAnswer(myAnswer, extAnswer, addAnswerConfirmed, answerIsSame);
                else dialog.addAnswer(myAnswer, vm.imageURL, addAnswerConfirmed);

                addAnswerExec = true;
                
                //This is to prevent double pulses and have two answers get submitted by hardware glitch
                $timeout(function () {
                    addAnswerExec = false;
                }, 1000)
            }
        }

        function loadFormData() {
            //initialize form
            for (var i = 0; i < vm.fields.length; i++) {
                switch (vm.fields[i].name) {

                    case "name": { myAnswer.name = vm.fields[i].val; break; }
                    case "location": { myAnswer.location = vm.fields[i].val; break; }
                    case "addinfo": { myAnswer.addinfo = vm.fields[i].val; break; }
                    case "cityarea": { myAnswer.cityarea = vm.fields[i].val; break; }
                    case "phone": { myAnswer.phone = vm.fields[i].val; break; }
                    case "website": { myAnswer.website = vm.fields[i].val; break; }
                    case "email": { myAnswer.email = vm.fields[i].val; break; }

                }
            }
        }

        function validateData() {
            loadImageDataOk = true;
            //addAnswerDataOk = true;
            for (var i = 0; i < vm.fields.length; i++) {
                if (vm.fields[i].isrequired && vm.fields[i].val.length < 3) {
                    loadImageDataOk = false;
                    break;
                }
            }
            
            //loadImageDataOk = loadImageDataOk && countryIsValid;
            if ($rootScope.cCategory.type == 'Short-Phrase' || $rootScope.cCategory.type == 'PersonCust' ) addAnswerDataOk = loadImageDataOk;
            else addAnswerDataOk = (loadImageDataOk && (vm.numLinks > 0 || vm.ngi));

        }

        function rankSummary() {

            $state.go("rankSummary", { index: $rootScope.cCategory.id });
        }

        function callSearchImage() {

            var pFields = [];

            loadFormData();
            validateData();

            if (loadImageDataOk) {
                pFields = JSON.parse(JSON.stringify(vm.fields));
                //console.log("pFields --", pFields);
                //pFields[cFld].val = $rootScope.countries_en[countryIdx];
                var q1 = image.getImageLinks(pFields, attNum, 'add');
                q1.then(processImageResults, imageQueryFailed)

            }
            else {
                dialog.getDialog('missingDataImage');
                return;
            }
        }

        function imageQueryFailed() {
            console.log('query failed, dont give up');
        }

        function callAddAnswer() {
            loadFormData();
            validateData();
            if (vm.type == 'Establishment' || vm.type == 'Person' || vm.type == 'Place') checkAnswerExists(myAnswer);

            if (addAnswerDataOk) {
                addAnswer();
            }
            else {
                dialog.getDialog('missingDataAnswer');
                return;
            }
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
            
            //imageLinks = imageLinks.concat(results);
            vm.numLinks = imageLinks.length;
            attNum++;
            if (vm.numLinks > 10 || attNum >= 4) vm.searchDisabled = 'disabled';
            if (attNum > 1) vm.imageCommand = 'Get more images';
            vm.linkIdx = 0;

            vm.imageURL = imageLinks[vm.linkIdx];

            testImageUrl(imageLinks[vm.linkIdx], showImageNotOk);

            if (vm.numLinks > 0) vm.imagefunctions = 'inline';

        }


        function viewNext() {
            vm.linkIdx++;
            if (vm.linkIdx >= vm.numLinks) vm.linkIdx = 0;
            vm.imageURL = imageLinks[vm.linkIdx];
            testImageUrl(imageLinks[vm.linkIdx], showImageNotOk);
        }
        function viewPrev() {
            vm.linkIdx--;
            if (vm.linkIdx < 0) vm.linkIdx = vm.numLinks - 1;
            vm.imageURL = imageLinks[vm.linkIdx];
            testImageUrl(imageLinks[vm.linkIdx], showImageNotOk);
        }

        function addAnswerConfirmed(myAnswer) {
            //Add new answer, also add new post to catans (inside addAnser)
            
             if ($rootScope.DEBUG_MODE) console.log("No, different! @addAnswerConfirmed");
            if (myAnswer.type == 'Establishment' && (myAnswer.location != undefined && myAnswer.location != "" && myAnswer.location != null)) {
                var promise = getgps.getLocationGPS(myAnswer);
                promise.then(function () {
                    //console.log("myAnswer --- ", myAnswer);
                    //answer.addAnswer(myAnswer).then(rankSummary);
                });
            }
            else {
                eqRanks();
                //create 2 catans records one for downtown and then district
                if (eqFound && !inCity) {
                    if ($rootScope.DEBUG_MODE) console.log("P1 - eqFound,inCity,eqRankIdx - ", eqFound, inCity, eqRankIdx,myAnswer);
                    answer.addAnswer2(myAnswer, [$rootScope.cCategory.id, eqRankIdx]).then(rankSummary);                    
                }
                else if (eqFound && inCity) {
                    if ($rootScope.DEBUG_MODE) console.log("P2 - eqFound,inCity,eqRankIdx - ", eqFound, inCity, eqRankIdx,myAnswer);
                    answer.addAnswer2(myAnswer, [eqRankIdx]).then(rankSummary);
                }
                else { 
                    if ($rootScope.DEBUG_MODE) console.log("P3 - ", myAnswer);
                    answer.addAnswer(myAnswer).then(rankSummary);
                }
                myAnswer = undefined; 
            }
        }

        function addAnswerGPS() {
            if (!addAnswerGPSexec) {
                 if ($rootScope.DEBUG_MODE) console.log("@exec-addAnswerGPS");
                addAnswerGPSexec = true;
                eqRanks();
                //create 2 catans records one for downtown and then district
                if (eqFound && !inCity) {
                    if ($rootScope.DEBUG_MODE) console.log("P4 - eqFound,inCity,eqRankIdx - ", eqFound, inCity, eqRankIdx, myAnswer);
                    if (myAnswer) answer.addAnswer2(myAnswer, [$rootScope.cCategory.id, eqRankIdx]).then(rankSummary);
                }
                else if (eqFound && inCity) {
                    if ($rootScope.DEBUG_MODE) console.log("P5 - eqFound,inCity,eqRankIdx - ", eqFound, inCity, eqRankIdx, myAnswer);
                    if (myAnswer) answer.addAnswer2(myAnswer, [eqRankIdx]).then(rankSummary);
                }
                else {
                    if ($rootScope.DEBUG_MODE) console.log("P6",myAnswer);
                    if (myAnswer) answer.addAnswer(myAnswer).then(rankSummary);
                }
                myAnswer = undefined;                                 
            }
        }
        
         function answerIsSame() {
             if ($rootScope.DEBUG_MODE) console.log("Yeah Same, @answerIsSame");
            //Answer already exist in this category, do not add
            if (duplicateSameCategory) dialog.getDialog('answerDuplicated');
            //Answer already exist, just post new category-answer record            
            else {
                eqRanks();
                //create 2 catans records one for downtown and then district
                if (eqFound && !inCity) {
                    if ($rootScope.DEBUG_MODE) console.log("P7 - eqFound,inCity,eqRankIdx - ", eqFound, inCity, eqRankIdx);
                    catans.postRec2(extAnswer.id, eqRankIdx, false);
                    catans.postRec2(extAnswer.id, $rootScope.cCategory.id, true).then(rankSummary);
                }
                else if (eqFound && inCity) {
                    if ($rootScope.DEBUG_MODE) console.log("P8 - eqFound,inCity,eqRankIdx - ", eqFound, inCity, eqRankIdx);
                    catans.postRec2(extAnswer.id, eqRankIdx, false).then(rankSummary);
                }
                else {
                    if ($rootScope.DEBUG_MODE) console.log("P9");
                    catans.postRec(extAnswer.id).then(rankSummary);
                }
                myAnswer = undefined;                
             }
         }

        function eqRanks() {
            var lookRank = '';
            if (inDowntown || inDistrict || inCity) {
                if (inDowntown && myAnswer.cityarea != 'Downtown') {
                    lookRank = $rootScope.cCategory.title.replace('Downtown', myAnswer.cityarea);
                    for (var n = 0; n < $rootScope.content.length; n++) {
                        if ($rootScope.content[n].title == lookRank) {
                            eqFound = true;
                            eqRankIdx = $rootScope.content[n].id;
                        }
                    }
                }
                if (inDistrict) {
                    lookRank = $rootScope.cCategory.title.replace(inDistrictName, 'Downtown');
                    for (var n = 0; n < $rootScope.content.length; n++) {
                        if ($rootScope.content[n].title == lookRank) {
                            eqFound = true;
                            eqRankIdx = $rootScope.content[n].id;
                        }
                    }
                }               
                if (inCity){
                    lookRank = $rootScope.cCategory.title.replace('San Diego', myAnswer.cityarea);
                    for (var n = 0; n < $rootScope.content.length; n++) {
                        if ($rootScope.content[n].title == lookRank) {
                            eqFound = true;
                            eqRankIdx = $rootScope.content[n].id;
                        }
                    }
                }
            }
        }

        function showHowItWorksDialog() {
            if ($rootScope.cCategory.type == 'Short-Phrase') dialog.howItWorks('shortPhrase');
            else dialog.howItWorks('addAnswer');
        }

        function testImageUrl(url, callback, timeout) {
            timeout = timeout || 5000;
            var timedOut = false, timer;
            var img = new Image();
            img.onerror = img.onabort = function () {
                if (!timedOut) {
                    clearTimeout(timer);
                    callback(url, "error");
                }
            };
            img.onload = function () {
                if (!timedOut) {
                    clearTimeout(timer);
                    callback(url, "success");
                }
            };
            img.src = url;
            timer = setTimeout(function () {
                timedOut = true;
                callback(url, "timeout");
            }, timeout);
        }

        function showImageNotOk(url, result) {
            if (result == "error" || result == "timeout") {
                vm.imageURL = $rootScope.EMPTY_IMAGE;
            }
        }

        function checkAnswerExists(answer) {
            //Check if answer about to be added exists already among establishments
            if (vm.type == 'Establishment') {
                for (var i = 0; i < $rootScope.estAnswers.length; i++) {
                    if (answer.name == $rootScope.estAnswers[i].name &&
                        answer.cityarea == $rootScope.estAnswers[i].cityarea) {

                        duplicateExists = true;
                        extAnswer = $rootScope.estAnswers[i];

                        for (var j = 0; j < $rootScope.catansrecs.length; j++) {
                            if ($rootScope.catansrecs[j].answer == $rootScope.estAnswers[i].id &&
                                $rootScope.catansrecs[j].category == $rootScope.cCategory.id) {
                                duplicateSameCategory = true;
                            }
                        }
                    }
                }
            }
            else if (vm.type == 'Person') {
                for (var i = 0; i < $rootScope.pplAnswers.length; i++) {
                    if (answer.name == $rootScope.pplAnswers[i].name) {

                        duplicateExists = true;
                        extAnswer = $rootScope.pplAnswers[i];

                        for (var j = 0; j < $rootScope.catansrecs.length; j++) {
                            if ($rootScope.catansrecs[j].answer == $rootScope.pplAnswers[i].id &&
                                $rootScope.catansrecs[j].category == $rootScope.cCategory.id) {
                                duplicateSameCategory = true;
                            }
                        }
                    }
                }
            }
            else if (vm.type == 'Place') {
                for (var i = 0; i < $rootScope.plaAnswers.length; i++) {
                    if (answer.name == $rootScope.plaAnswers[i].name) {

                        duplicateExists = true;
                        extAnswer = $rootScope.plaAnswers[i];

                        for (var j = 0; j < $rootScope.catansrecs.length; j++) {
                            if ($rootScope.catansrecs[j].answer == $rootScope.plaAnswers[i].id &&
                                $rootScope.catansrecs[j].category == $rootScope.cCategory.id) {
                                duplicateSameCategory = true;
                            }
                        }
                    }
                }
            }
            //console.log("duplicateExists: ", duplicateExists, " duplicateSameCategory: ", duplicateSameCategory);
        }
        
        function getWiki(){
            var wikiSearchStr = '';
            for (var n=0; n < vm.fields.length; n++){
                if (vm.fields[n].name == 'name') {
                    wikiSearchStr = vm.fields[n].val;
                    break;
                }
            }
            
            if (wikiSearchStr.length > 0){
                getwiki.getWiki(wikiSearchStr);
            }
            return;
        }
        
        function loadWiki(x){
            for (var n=0; n < vm.fields.length; n++){
                if (vm.fields[n].name == 'addinfo') {
                    vm.fields[n].val = x;
                    break;
                }
            }          
        }
        
        function onNoGoodImages(x){
            if (x){
                vm.imageURL = $rootScope.EMPTY_IMAGE;
            }
            else{
                vm.imageURL = imageLinks[vm.linkIdx];
            }
        }

        function closeRank() {
            $state.go('cwrapper');
        }        
        
    }

})();

angular.module('app').directive('catBar', ['color', '$window', '$rootScope','$state', 
function (color, $window, $rootScope, $state) {
    'use strict';

    return {
        templateUrl: 'app/answer/Partials/catbar.html',
        transclude: true,
        scope: {
            text: '@',
            leftFn: '&leftFn',
            rightFn: '&rightFn',
            closeRank: '&closeRank',
        },
        link: function (scope) {
            
            scope.bc = "#006dcc";
            scope.bc2 = color.shadeColor(scope.bc,-0.3);
            scope.fc = "white";
            if ($window.innerWidth < 769){
                scope.ht = 50;
                if (scope.text.length > 60) scope.ht = 90;            
            }
            else if ($window.innerWidth < 870){
                scope.ht = 50;
                if (scope.text.length > 60) scope.ht = 75;
            }
            else scope.ht = 50;

            scope.goPrev = function(){
                scope.leftFn();
            }

            scope.goNext = function(){
                scope.rightFn();
            }

            scope.selRank = function(){
                scope.closeRank();
            }           
        },
    }
}
]);
angular.module('app').directive('blobUpload', ['$rootScope', '$state', function ($rootScope, $state) {
    //angular.module('app').directive('contentBlock', ['$rootScope', '$state', function ($rootScope, $state) {
    'use strict';

    return {
        
        templateUrl: 'app/answer/Partials/blobupload.html',
        transclude: true,
        scope: {
            //   modeNum: '=mode',
            //   isDynamic: '=dynamic',
            //   isRoW: '=rankofweek'
        },
         controller: ['$scope', 'Upload', '$timeout', '$http', '$rootScope',
          function blobUploadCtrl($scope, Upload, $timeout, $http, $rootScope) {           
            //$scope.uploadfile = function($scope, Upload, $timeout, $http) {
            // jshint validthis:true 
            displayError("");
            //$scope.errFile = {};
            //$scope.errFile.name = '';
                
            $scope.uploadFiles = function (file, errFiles) {
                $scope.f = file;
                $scope.errFile = errFiles && errFiles[0];

                if (file == null) {
                    console.log("file is null");
                    if ($scope.errFile != undefined) {
                        var errorMgs = 'Uploading failed for ' + $scope.errFile.name + ', ' +
                            $scope.errFile.$error + ' exceeds ' + $scope.errFile.$errorParam;
                        //console.log("errormsg", errorMgs);
                        displayError(errorMgs);
                    }
                    else displayError("");
                }
               
                else {
                    
                    var storageurl = "https://rankx.blob.core.windows.net/sandiego/"+$rootScope.canswer.id+"/" + file.name + "?sv=2015-04-05&ss=bfqt&srt=sco&sp=rwdlacup&se=2018-08-30T01:15:12Z&st=2016-08-29T17:15:12Z&spr=https,http&sig=PpyWE0X%2Fpz9SuRje5GtHh44WaWIii0GBU9PbIcDIka8%3D";
                    var fileReader = new FileReader();
                    
                    fileReader.readAsArrayBuffer(file);
                    fileReader.onload = function (e) {
                        Upload.http({
                            //file.upload = Upload.upload({
                            url: storageurl,
                            method: "PUT",
                            headers: {
                                'x-ms-blob-type': 'BlockBlob',
                                'x-ms-blob-content-type': file.type
                             },
                            data: e.target.result 
                            //file: file
                        }).then(function (response) {
                            if (response.status > 0)
                                $scope.errorMsg = response.status + ': ' + response.data;
                                var imageurl = 'https://rankx.blob.core.windows.net/sandiego/'+$rootScope.canswer.id+'/' + file.name;
                                console.log('emitted fileUploaded!!');
                                $rootScope.$emit('fileUploaded', imageurl);
                        }, null, function (evt) {
                            file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
                        });
                    }
                }
            }
        
                function displayError(s) {
                    $scope.errorMsg = s;
                }

            }] 
    }
}
]);
angular.module('app').directive('answerHeader', ['color', '$window', '$rootScope','$state','dialog', 
function (color, $window, $rootScope, $state, dialog) {
    'use strict';

    return {
        templateUrl: 'app/answer/Partials/answerheader.html',
        transclude: true,
        scope: {
            ans: '@',
            idx: '@',
        },
        link: function (scope) {
            var vm = scope;
            scope.isMobile = false;
            // device detection
            if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
                || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4)))
                scope.isMobile = true;
            
            scope.answer = JSON.parse(scope.ans);
            
            //Type Flags
            if (scope.answer.type == 'Short-Phrase') scope.isShortPhrase = true;
            else scope.isShortPhrase = false;
            if (scope.answer.type == 'Event') scope.isEvent = true;
            else scope.isEvent = false;

            scope.modeIsImage = true; //Image Mode
            scope.imgmode = 'Show Map';
            scope.imgmodeicon = 'fa fa-globe';
            scope.hasMap = scope.answer.location != undefined && scope.answer.location != ''; 

            //Effective width vs $window.innerWidth
            var iWa = [0, 401, 474, 769, 971, 996, 1173, 1201, 1635, 1960, 3500];
            var eWa = [0.86, 0.86, 0.88, 0.96, 0.75, 0.96, 0.68, 0.96, 0.64, 0.6, 0.6];
            var iW = $window.innerWidth;
            var eW = 0; //effective width
            for (var n = 0; n < iWa.length - 1; n++) {
                if (iW > iWa[n] && iW < iWa[n + 1]) {
                    //equation of line y=mx+b (m is slope, b is y intersect)
                    var slp = (eWa[n + 1] - eWa[n]) / (iWa[n + 1] - iWa[n]);
                    var bpt = eWa[n] - iWa[n] * slp;
                    eW = iW * slp + bpt;
                }
            }
            
            //Adjust picture size for very small displays
            if ($window.innerWidth < 763) {
                scope.sp1 = 'width:5%;padding:0px;';
                scope.sp2 = 'width:25%;max-height:50px';
                scope.sp3 = 'width:20%';
                scope.sm = true; scope.nsm = false;
                scope.width = Math.round(iW * eW);
                scope.mxheight = Math.round((scope.width / 1.25));
                //clamp max height
                if (scope.mxheight > 300) scope.mxheight = 300;
                if ($rootScope.cCategory) {
                    var colors = color.defaultRankColor($rootScope.cCategory);
                    scope.bc = colors[0];
                    scope.fc = colors[1];
                }
                else {
                    scope.bc = 'gray';
                    scope.fc = 'black';
                }
                scope.bc2 = color.shadeColor(scope.bc, 0.4);
            }
            else {
                scope.mxheight = '300';
                scope.sp1 = 'width:15%';
                scope.sp2 = 'width:22.5%;max-height:50px;';
                scope.sp3 = 'width:20%';
                scope.sm = false; scope.nsm = true;
                scope.width = Math.round(iW * eW);
                scope.width2 = Math.round((iW * eW) / 2);
                scope.width3 = Math.round((iW * eW) / 3);
                if ($rootScope.cCategory) {
                    var colors = color.defaultRankColor($rootScope.cCategory);
                    scope.bc = colors[0];
                    scope.fc = colors[1];
                }
                else {
                    scope.bc = 'gray';
                    scope.fc = 'black';
                }
                scope.bc2 = '#d8d8d8';
            }

            // Answer additional info text slice
           if (scope.answer.addinfo != undefined) {
                scope.answer.addinfo_teaser = scope.answer.addinfo.slice(0, 300);
                scope.answer.addinfo_complete = scope.answer.addinfo.slice(300);
            }

            scope.moretext = ' more ';
            scope.completeinfo = false;

            getHours();

        //Directive Methods
        scope.toggleimgmode = function() {
            if (scope.modeIsImage) setMap();
            else setImage();
        }

        function setImage() {
            scope.imgmode = 'Show Map';
            scope.imgmodeicon = 'fa fa-globe';
            scope.modeIsImage = true;
            $rootScope.modeIsImage = true;
        }

        function setMap() {
            scope.imgmode = 'Show Image';
            scope.imgmodeicon = 'fa fa-picture-o';
            scope.modeIsImage = false;
            $rootScope.modeIsImage = false;
        }

        function getHours() {
            scope.hrset = false;
            if (scope.answer.strhours != undefined && scope.answer.strhours != null) {
                scope.hrset = true;
                var cdate = new Date();
                var dayOfWeek = cdate.getDay();
                var idx = dayOfWeek - 1;
                if (idx < 0) idx = 6;

                var openhours = JSON.parse(scope.answer.strhours);
                if (openhours[idx].opn == 'CLOSED') {
                    scope.hourstr = 'Closed today';
                }
                else {
                    scope.hourstr = 'Open today from: ' + openhours[idx].st + ' to ' + openhours[idx].ct;
                }
            }
        }

         scope.editAnswer = function() {
            if ($rootScope.isLoggedIn) {
                if (scope.answer.type == 'Event') {
                    $rootScope.eventmode = 'edit';
                    $state.go("addEvent", { index: scope.answer.id });
                }
                else $state.go("editAnswer", { index: scope.answer.id });
            }
            else dialog.loginFacebook(); 
            //dialog.getDialog('notLoggedIn');           
        }
 
          scope.showcomplete = function() {
            if (scope.moretext == ' more ') {
                scope.moretext = ' less ';
                scope.completeinfo = true;
                return;
            }
            if (scope.moretext == ' less ') {
                scope.moretext = ' more ';
                scope.completeinfo = false;
                return;
            }
        }


        },
    }
}
]);
(function () {
    'use strict';

    angular
        .module('app')
        .factory('query', query);

    query.$inject = ['$http', '$q', '$rootScope'];

    function query($http, $q, $rootScope) {

        // Members
        var _querys = [];
        var baseURI = '/api/v2/mysql/_table/queries';

        var service = {
            getQueries: getQueries,
            postQuery: postQuery,
            flushAll: flushAll,
            deleteRec: deleteRec
        };

        return service;

        function getQueries(forceRefresh) {
            
            if (_areQueriesLoaded() && !forceRefresh) {

                return $q.when(_querys);
            }

            var url = baseURI;

            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                return _querys = result.data.resource;
            }

        }
        
       function postQuery(query, results){
		     //form match record
           //form match record
            var obj = {};
            obj.resource = [];
                     
            var data={};
            data.query = query;
            data.results = results;
            data.timestmp = Date.now(); 
            
            obj.resource.push(data); 
            
            var url = baseURI; 
            
            return $http.post(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {                
             
                console.log("Creating new query record was succesful");
            }
	   }
       
       function flushAll(resource) {
           
            //form match record
            var obj = {};
            obj.resource = resource;

            //obj.resource.push(data);
            console.log("obj ---",  resource)
            
            var url = baseURI; 
            return $http.delete(url, resource , {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: resource
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                console.log("Flushing queries db was succesful");
            }
        }
        
        function deleteRec(id){
            
             //form match record
            var obj = {};
            obj.resource = [];

            var data = {};
            data.id = id;

            obj.resource.push(data);

            var url = baseURI + '/' + id;
            
            return $http.delete(url, data, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                console.log("Deleting record was succesful");
                return result.data;
            }
            
        }
	   
        
        function _areQueriesLoaded() {

            return _querys.length > 0;
        }

        function _queryFailed(error) {

            throw error;
        }
    }
})();
(function () {
    'use strict';

    angular
        .module('app')
        .factory('codeprice', codeprice);

    codeprice.$inject = ['$http', '$q', '$rootScope'];

    function codeprice($http, $q, $rootScope) {

        // Members
        var _codeprices = [];
        var baseURI = '/api/v2/mysql/_table/codeprice';

        var service = {
            get: get,
        };

        return service;

        function get(forceRefresh) {
            
            if (_areQueriesLoaded() && !forceRefresh) {

                return $q.when(_codeprices);
            }

            var url = baseURI;

            return $http.get(url).then(codepriceSucceeded, _codepriceFailed);

            function codepriceSucceeded(result) {

                return _codeprices = result.data.resource;
            }

        }
        
        
        function _areQueriesLoaded() {

            return _codeprices.length > 0;
        }

        function _codepriceFailed(error) {

            throw error;
        }
    }
})();
(function () {
    'use strict';

    angular
        .module('app')
        .factory('categorycode', categorycode);

    categorycode.$inject = ['$http', '$q', '$rootScope'];

    function categorycode($http, $q, $rootScope) {

        // Members
        var _categorycodes = [];
        var baseURI = '/api/v2/mysql/_table/categorycode';

        var service = {
            get: get,
        };

        return service;

        function get(forceRefresh) {
            
            if (_areQueriesLoaded() && !forceRefresh) {

                return $q.when(_categorycodes);
            }

            var url = baseURI;

            return $http.get(url).then(categorycodeSucceeded, _categorycodeFailed);

            function categorycodeSucceeded(result) {

                return _categorycodes = result.data.resource;
            }

        }
        
        
        function _areQueriesLoaded() {

            return _categorycodes.length > 0;
        }

        function _categorycodeFailed(error) {

            throw error;
        }
    }
})();
(function () {
    'use strict';

    angular
        .module('app')
        .controller('views', views);

    views.$inject = ['$location', '$rootScope', '$state'];

    function views(location, $rootScope, $state) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'views';
        vm.content = $rootScope.content;
               
       activate();

        function activate() {            

            console.log("views page Loaded!");
            
        }
    }
})();

(function () {
    'use strict';

    angular
        .module('app')
        .controller('updateHeaders', updateHeaders);

    updateHeaders.$inject = ['$location', '$rootScope', '$state', 'headline', 'cblock','table'];

    function updateHeaders(location, $rootScope, $state, headline, cblock, table) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'updateHeaders';

        vm.refresh = refresh;
        vm.createCBlocksRecsCity = createCBlocksRecsCity;
        vm.createCBlocksRecsNh = createCBlocksRecsNh;
        vm.createCBlocksRecsRankX = createCBlocksRecsRankX;
        vm.deleteCBlocks = deleteCBlocks;
        vm.catStrings = catStrings;

        vm.isAdmin = $rootScope.isAdmin;
        
        var execRefresh = false;

        activate();

        function activate() {
            //loadData();
            console.log("updateHeaders page Loaded!");
        }

        
        function refresh() {
            if (!execRefresh) {
                execRefresh = true;
                var tagstr = '';
                var valTags = [];
                var arrIdxs = [];
                vm.res = [];
                var obj = {};
                var r = true;
                var catstr = '';
                var fcatstr = '';

                for (var i = 0; i < $rootScope.cblocks.length; i++) {
                    catstr = '';
                    fcatstr = '';
                    r = true;
                    obj = {};
                    arrIdxs = [];
                    for (var n = 0; n < $rootScope.headlines.length; n++) {
                        if ($rootScope.cblocks[i].type == $rootScope.headlines[n].type) {
                            if ($rootScope.cblocks[i].scope == "city") {
                                //add 'isMP' tag to filter
                                tagstr = $rootScope.headlines[n].filter + ' isMP';
                            }
                            if ($rootScope.cblocks[i].scope == "rx") {
                                //add 'isMP' tag to filter
                                tagstr = $rootScope.headlines[n].filter;
                            }
                            if ($rootScope.cblocks[i].scope == "nh") {  
                                //add neighborhood to filter
                                tagstr = $rootScope.headlines[n].filter + ' ' + $rootScope.cblocks[i].scopename;
                            }
                            valTags = tagstr.split(" ");
                            break;
                        }
                    }
                    //console.log("valTags -- ", valTags);
                    var searchStr = '';
                    for (var j = 0; j < $rootScope.content.length; j++) {
                        searchStr = $rootScope.content[j].tags + " " + $rootScope.content[j].title;
                        r = true;
                        //check that all tags exist
                        for (var k = 0; k < valTags.length; k++) {
                            var tagCapitalized = valTags[k].charAt(0).toUpperCase() + valTags[k].slice(1);
                            var tagFirstLowered = valTags[k].charAt(0).toLowerCase() + valTags[k].slice(1);
                            r = r &&
                            (searchStr.indexOf(valTags[k]) > -1 ||
                                searchStr.indexOf(valTags[k].toUpperCase()) > -1 ||
                                searchStr.indexOf(tagCapitalized) > -1 ||
                                searchStr.indexOf(tagFirstLowered) > -1);
                            //AM: Changed searchStr to tags searchStr[j]
                        }
                        if (r) {
                            //arrIdxs.push(j);
                            arrIdxs.push($rootScope.content[j].id);
                            //catstr = catstr + ':' + j;
                        }
                    }
                    //console.log("arrIdxs -- ", arrIdxs);
                
                    shuffle(arrIdxs);
                    for (var m = 0; m < arrIdxs.length; m++) {
                        //create catstr string
                        catstr = catstr + ':' + arrIdxs[m];

                    }
                    fcatstr = catstr.substring(1);
                    //update database with new catstr
                    cblock.update($rootScope.cblocks[i].id, ['catstr'], [fcatstr]);
                }
            }
        }

        function catStrings() {
            //8. Generate Category Strings for non neighborhood ranks
            var isDistrictRanking = false;
            var results = [];

            //Grab template for results
            for (var n = 0; n < $rootScope.content.length; n++) {
                if ($rootScope.content[n].title.indexOf('in Hillcrest') > -1) {
                    results.push($rootScope.content[n]);
                }
            }

            for (var i = 0; i < results.length; i++) {
                var catstr = '';
                var fcatstr = '';
                //1. - Do cat strings for all San Diego first
                var genRank = results[i].title.replace("Hillcrest", "San Diego");
                for (var j = 0; j < $rootScope.content.length; j++) {
                    if (genRank == $rootScope.content[j].title) {
                        if ($rootScope.content[j].catstr == null || //comment these 3
                            $rootScope.content[j].catstr == undefined || //if want to redo everythign
                            $rootScope.content[j].catstr.length == 0) {  //categories
                            // TODO ---- 6949 --- events need to add 6969
                            // TODO ---- 473 -- law san diego --- ignore, isatomic=true, catstr='';

                            //--- Prevent execution for specific ranks ---
                            var cid = $rootScope.content[j].id;
                            if (cid != 473 && cid != 3125 && cid != 6949 && cid != 7424 && cid != 7675 &&
                                cid != 3124 && cid != 3163 && cid != 3202) {

                                console.log("Found gen rank --- ", $rootScope.content[j].title, ' ', $rootScope.content[j].id);
                                var srchStr = $rootScope.content[j].title.replace("San Diego", "");
                                for (var k = 0; k < $rootScope.content.length; k++) {

                                    if ($rootScope.content[k].title.indexOf(srchStr) > -1 && k != j) {
                                        //console.log("Found sub rank --- ", $rootScope.content[k].title);
                                        /*
                                        isDistrictRanking = false;
                                        for (var n = 0; n < $rootScope.districts.length; n++) {
                                            if ($rootScope.content[k].title.includes($rootScope.districts[n])) {
                                                isDistrictRanking = true;
                                            }
                                        }
                                        if (isDistrictRanking) catstr = catstr + ':' + $rootScope.content[k].id;
                                        */
                                        catstr = catstr + ':' + $rootScope.content[k].id;

                                    }

                                }
                                fcatstr = catstr.substring(1); //remove leading ':'
                                console.log("final catstr ---", fcatstr);

                                table.update($rootScope.content[j].id, ['isatomic', 'catstr'], [false, fcatstr]);
                            }//this is specific rank braket
                        } //this is bracket
                        break;
                    }
                }
                //2. - Do cat Strings for Downtown ranks
                catstr = '';
                fcatstr = '';
                genRank = results[i].title.replace("Hillcrest", "Downtown");
                
                for (var j = 0; j < $rootScope.content.length; j++) {
                    if (genRank == $rootScope.content[j].title) {
                        if ($rootScope.content[j].catstr == null || //comment these 3
                            $rootScope.content[j].catstr == undefined || //if want to redo everythign
                            $rootScope.content[j].catstr.length == 0) {  //categories
                            // TODO ---- 6949 --- events need to add 6969
                            // TODO ---- 473 -- law san diego --- ignore, isatomic=true, catstr='';

                            //--- Prevent execution for specific ranks ---
                            var cid = $rootScope.content[j].id;
                            if (cid != 473 && cid != 3125 && cid != 6949 && cid != 7424 && cid != 7675 &&
                                cid != 3124 && cid != 3163 && cid != 3202) {

                                console.log("Found gen rank --- ", $rootScope.content[j].title, ' ', $rootScope.content[j].id);
                                var srchStr = $rootScope.content[j].title.replace("Downtown", "");
                                for (var k = 0; k < $rootScope.content.length; k++) {

                                    if ($rootScope.content[k].title.indexOf(srchStr) > -1 && k != j) {
                                        //console.log("Found sub rank --- ", $rootScope.content[k].title);
                                        isDistrictRanking = false;
                                        for (var n = 0; n < $rootScope.districts.length; n++) {
                                            if ($rootScope.content[k].title.includes($rootScope.districts[n])) {
                                                isDistrictRanking = true;
                                            }
                                        }
                                        if (isDistrictRanking) catstr = catstr + ':' + $rootScope.content[k].id;
                                    }

                                }
                                fcatstr = catstr.substring(1); //remove leading ':'
                                console.log("final catstr ---", fcatstr);

                                table.update($rootScope.content[j].id, ['isatomic', 'catstr'], [false, fcatstr]);
                            }//this is specific rank braket
                        } //this is bracket
                        break;
                    }
                }
            }
            //SPECIAL CASES //only when redoing everything
            /*
            for (var n=0; n<$rootScope.content.length; n++){
                if ($rootScope.content[n].id == 473){
                    console.log("update(473)");
                    //table.update(473, ['isatomic','catstr'],[true, '']);
                }
                if ($rootScope.content[n].id == 3125){
                    console.log("update(3125)");
                    //table.update(3125, ['isatomic','catstr'],[true, '']);
                }
                if ($rootScope.content[n].id == 6949){
                    console.log("update(6949)");
                    //table.update(6949, ['isatomic','catstr'],[false, '6949:'+$rootScope.content[n].catstr]);
                }
                if ($rootScope.content[n].id == 7675){
                    console.log("update(7675)");
                    //table.update(7675, ['isatomic','catstr'],[false, '7675:'+$rootScope.content[n].catstr]);
                }
                if ($rootScope.content[n].id == 7424){
                    console.log("update(7424)");
                    //table.update(7424, ['isatomic','catstr'],[false, '7424:'+$rootScope.content[n].catstr]);
                }
            }*/
            //End 8
        }

        function shuffle(array) {
            var currentIndex = array.length, temporaryValue, randomIndex;

            // While there remain elements to shuffle...
            while (0 !== currentIndex) {

                // Pick a remaining element...
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1;

                // And swap it with the current element.
                temporaryValue = array[currentIndex];
                array[currentIndex] = array[randomIndex];
                array[randomIndex] = temporaryValue;
            }

            return array;
        }
        var exe1 = false;
        function createCBlocksRecsCity() {
            if (exe1) return;
            var cityArr = ['rankofweek', 'city', 'lifestyle', 'food', 'politics', 'services', 'social', 'beauty', 'sports', 'personalities', 'technology', 'dating', 'health'];
            var cbObj = {};
            for (var i = 0; i < cityArr.length; i++) {
                cbObj = {};
                cbObj.scope = 'city';
                cbObj.ismp = true;
                cbObj.scopename = 'San Diego';
                cbObj.catstr = '0';
                cbObj.type = cityArr[i];
                cblock.addcblock(cbObj);
            }
            exe1 = true;

        }
        var nhs = $rootScope.neighborhoods.concat($rootScope.districts);
        var exe2 = false;
        function createCBlocksRecsNh() {
            if (exe2) return;
            var nhArr = ['rankofweeknh', 'neighborhood', 'lifestyle', 'food', 'services', 'social', 'beauty', 'health'];
            var cbObj = {};
            for (var n = 0; n < nhs.length; n++) {
                for (var i = 0; i < nhArr.length; i++) {
                    cbObj = {};
                    cbObj.scope = 'nh';
                    cbObj.ismp = false;
                    cbObj.scopename = nhs[n];
                    cbObj.catstr = '0';
                    cbObj.type = nhArr[i];

                    cblock.addcblock(cbObj);
                }
            }
            exe2 = true;
            //console.log("nhArr",nhArr);
        }

        var exe3 = false;
        function createCBlocksRecsRankX() {
            if (exe3) return;
            var rxArr = ['rxfeedback', 'rxsuggestion'];
            var cbObj = {};
            for (var i = 0; i < rxArr.length; i++) {
                cbObj = {};
                cbObj.scope = 'rx';
                cbObj.scopename = 'RankX';
                cbObj.ismp = false;
                cbObj.catstr = '0';
                cbObj.type = rxArr[i];
                cblock.addcblock(cbObj);
            }
            exe3 = true;
            //console.log("nhArr",nhArr);
        }

        function deleteCBlocks() {
            for (var i = 0; i < $rootScope.cblocks.length; i++) {
                cblock.deleteRec($rootScope.cblocks[i].id);
            }
        }
    }
})();

(function () {
    'use strict';

    angular
        .module('app')
        .controller('rodconsole', rodconsole);

    rodconsole.$inject = ['$location', '$rootScope', '$state','rankofday','color',
    'datetime','dialog','$q','table'];

    function rodconsole(location, $rootScope, $state, rankofday, color,
     datetime, dialog, $q, table) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'rodconsole';

        //Methods
        vm.selRank = selRank;
        vm.goBack = goBack;
        vm.plusShade = plusShade;
        vm.minusShade = minusShade;
        vm.refreshImages = refreshImages;
        vm.filterData = filterData;
        vm.goSaveImage = goSaveImage;
        vm.goSaveText = goSaveText;

        vm.dataReady = false;
        var rods = [];
        var todaydatenum = 0;
        vm.overview = true;
        vm.detail = false;
        vm.rank = {};
        vm.sm = $rootScope.sm;
        vm.allIsSelected = true;
        vm.next20IsSelected = false;
        vm.loadText = "Loading data..."
        var fimageExists = false;

        $rootScope.canswer = {};
        $rootScope.canswer.id = 'featuredImages';
        vm.testimage = $rootScope.EMPTY_IMAGE;

        var hexcolor = '';

        $rootScope.$on('fileUploaded', function (event, data){
                $rootScope.cmd1exe = $rootScope.cmd1exe ? $rootScope.cmd1exe : false;
                if ($state.current.name == 'rodconsole' && !$rootScope.cmd1exe) {
                $rootScope.cmd1exe = true;
                $rootScope.blobimage = data;
                refreshImages();                
            }
        });

        dialog.enterPassword(activate,goHome);
        
        //activate();

        function activate() {

            //get todays date
            var datenow = new Date();
            var tz = datenow.getTimezoneOffset();
            datenow.setMinutes( datenow.getMinutes() - tz);
            function pad(n) {return n < 10 ? n : n;}
            var dateStr = pad(datenow.getMonth()+1)+"/"+pad(datenow.getDate())+"/"+datenow.getFullYear();
            todaydatenum = datetime.date2number(dateStr);

            loadData();
            if ($rootScope.DEBUG_MODE) console.log("rodconsole page Loaded!");
            
        }
    
        function loadData(){

            var res = [];
            rods = [];

            rankofday.getall().then(function(result){
                rods = result;
                for (var i=0; i< rods.length; i++){
                    res = searchRanking(rods[i].main);
                    if(res[0]){
                        rods[i].title = res[0].title;
                        rods[i].rankid = res[0].id;
                        rods[i].fimage = res[0].fimage;
                        rods[i].bc = res[0].bc;
                        rods[i].fc = res[0].fc;
                        rods[i].shade = res[0].shade;
                        rods[i].image1 = res[0].image1url;
                        rods[i].image2 = res[0].image2url;
                        rods[i].image3 = res[0].image3url;
                        rods[i].isatomic = res[0].isatomic;
                        rods[i].shade = res[0].shade;
                        rods[i].datenum = datetime.date2number(rods[i].date);
                        
                        if (rods[i].bc == undefined || rods[i].bc == ''){
                            var colors = color.defaultRankColor(res[0]);
                            rods[i].bc = colors[0];
                            rods[i].fc = colors[1];
                            rods[i].shade = 0;
                        }
                        if (rods[i].fimage != undefined && rods[i].fimage != undefined) {
                            rods[i].imageok = true;
                            fimageExists = true;
                        }
                        else {
                            rods[i].imageok = false;
                            fimageExists = false;
                        }
                        if (rods[i].introtext != undefined && rods[i].introtext != ''){
                            rods[i].textok = true;
                        }
                        else rods[i].textok = false;
                    }                                   
                }
                sortByDate();
                filterData();
                vm.dataReady = true;
            });

        }

        function filterData(x){
            if (x == "all"){
                vm.next20IsSelected = false;
                vm.allIsSelected = true;
            }
            if (x == "next20"){
                vm.next20IsSelected = true;
                vm.allIsSelected = false;
            } 
            
            vm.rods = [];
            if (vm.next20IsSelected){
                for (var i=0; i<rods.length; i++){
                    if (rods[i].datenum >= todaydatenum)
                        vm.rods.push(rods[i]);
                }
            }
            else vm.rods = rods;
        }

        function searchRanking(x) {

            var valTags = x.split(" ");
            var rt = '';
            var results = [];

            for (var j = 0; j < $rootScope.content.length; j++) {
                
                var r = true;
                rt = $rootScope.content[j].title;
                
                //check that all tags exist
                for (var k = 0; k < valTags.length; k++) {
                    
                    var tagCapitalized = valTags[k].charAt(0).toUpperCase() + valTags[k].slice(1);
                    var tagFirstLowered = valTags[k].charAt(0).toLowerCase() + valTags[k].slice(1);
                    
                    r = r && ((rt.indexOf(valTags[k]) > -1) || (rt.indexOf(valTags[k].toUpperCase()) > -1) ||
                        (rt.indexOf(tagCapitalized) > -1) || (rt.indexOf(tagFirstLowered) > -1));
                }
                if (r) {
                    results.push($rootScope.content[j]);
                    break;
                }
            }
            return results;
        }

        function selRank(x){
            vm.overview = false;
            vm.detail = true;
            vm.rank = x;
            if (vm.rank.fimage != undefined && vm.rank.fimage != ''){
                vm.rank.image3 = vm.rank.image2;
                vm.rank.image2 = vm.rank.image1;
                vm.rank.image1 = vm.rank.fimage;
            }
            hexcolor = color.hsl2rgb(vm.rank.bc);
            vm.rank.bc2 = color.shadeColor(hexcolor, vm.rank.shade/10);
            $rootScope.cmd1exe = false;
            console.log("selRank", vm.rank);

        }

        function goBack(){
            vm.overview = true;
            vm.detail = false;
        }

        function goHome(){
            $state.go('cwrapper');
        }

        function plusShade(){
            vm.rank.shade = vm.rank.shade + 1;
            if  (vm.rank.shade > 10 ) vm.rank.shade = 10;
            hexcolor = color.hsl2rgb(vm.rank.bc);
            vm.rank.bc2 = color.shadeColor(hexcolor, vm.rank.shade/10);
        }

        function minusShade(){
            vm.rank.shade = vm.rank.shade - 1;
            if  (vm.rank.shade < -10 ) vm.rank.shade = -10;
            hexcolor = color.hsl2rgb(vm.rank.bc);
            vm.rank.bc2 = color.shadeColor(hexcolor, vm.rank.shade/10);
        }

        function refreshImages(){
            if (fimageExists){
                vm.rank.fimage = $rootScope.blobimage;
                vm.rank.image1 = vm.rank.fimage;        
            }
            else {
                vm.rank.fimage = $rootScope.blobimage;
                vm.rank.image3 = vm.rank.image2;
                vm.rank.image2 = vm.rank.image1;
                vm.rank.image1 = vm.rank.fimage;
            }
            $rootScope.cmd1exe = false;
        }

         function sortByDate() {
            function compare(a, b) {

               var d1 = datetime.date2number(a.date);
               var d2 = datetime.date2number(b.date);
             
               return d1 - d2;
            }

            rods = rods.sort(compare);
        }

        function goSaveImage(){

            if (vm.rank.fimage != undefined && vm.rank.fimage != ''){
            var fields = ['fimage','bc','fc','shade'];
            var vals = [vm.rank.fimage, vm.rank.bc, vm.rank.fc, vm.rank.shade];
            var traw = '';  //raw title (no location)
            var promiseArray = [];
            
                if (!vm.rank.isatomic){
                    vm.dataReady = false;
                    vm.loadText = 'Saving data...';
                    traw = vm.rank.title.replace(' in San Diego','');
                        for (var i=0; i<$rootScope.content.length; i++){
                            if ($rootScope.content[i].title.indexOf(traw)>-1){
                                //console.log("rank:",$rootScope.content[i].title);
                                //table.update($rootScope.content[i].id,fields, vals);
                                promiseArray.push(table.update($rootScope.content[i].id,fields, vals));
                            }
                        }
                        
                        $q.all(promiseArray).then(function(){
                            vm.dataReady = true;
                            goBack();
                        });
                }
                else {
                    console.log("rank:",vm.rank.title);
                    //table.update(vm.rank.rankid,fields, vals);
                }
            }
            else dialog.getDialog('nouploadedimage');
        }

        function goSaveText(){
            rankofday.update(vm.rank.id,['introtext'],[vm.rank.introtext]).then(function(){
                dialog.getDialog('introTextSaved');
                loadData();
            });
        }                  
    }
})();

(function () {
    'use strict';

    angular
        .module('app')
        .controller('queries', queries);

    queries.$inject = ['$location', '$rootScope', '$state', 'query'];

    function queries(location, $rootScope, $state, query) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'queries';

        vm.clearDb = clearDb;
        vm.isAdmin = $rootScope.isAdmin;

        activate();

        function activate() {

            query.getQueries().then(function (response) {
                vm.queries = response;
                console.log("Queries Loaded!");

            });

        }

        function clearDb() {
                
            //var resource = [];
            for (var i = 0; i < vm.queries.length; i++) {
                //var item = {};
                //item.id = vm.queries[i].id;
                //resource.push(item);
                query.deleteRec(vm.queries[i].id);
            }

            //console.log("obj    ---- ", obj)
            //query.flushAll(resource);

        }
    }
})();

(function () {
    'use strict';

    angular
        .module('app')
        .controller('mergeAnswers', mergeAnswers);

    mergeAnswers.$inject = ['$location', '$rootScope', '$state', 'catans', '$http','answer','$stateParams'];

    function mergeAnswers(location, $rootScope, $state, catans, $http, answer, $stateParams) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'mergeAnswers';
        
        var idx = 0;
        //if ($stateParams.index) { idx =  $stateParams.index;}
        
        vm.goPrev = goPrev;
        vm.goNext = goNext;
        vm.delAnswer = delAnswer;
        vm.addCatans = addCatans;
        vm.addcts = addcts;
        vm.delCatans = delCatans;
        vm.editAnswer = editAnswer;
        
        vm.addcts1active=false;
        vm.addcts2active=false;
        
        var ctsOptions = [];

        activate();

        function activate() {

            vm.tot = $rootScope.dupAns.length-1;
            prepareData();
            getData();
        
        console.log("mergeAnswers page Loaded!");

    }
    
    function getData(){
        
        console.log("@getData");
        console.log("$rootScope.catansrecs.length ",$rootScope.catansrecs.length);
        
            vm.idx = idx;
            
            var catans1obj = {};
            var catans2obj = {};
            var ansId1 = 0;
            var ansId2 = 0;

            vm.ans1 = $rootScope.dupAns[idx].ans1;
            vm.ans2 = $rootScope.dupAns[idx].ans2;
            
            prepareData();
            
            //Get Catans for Answer 1
            vm.ans1.catans = [];
            ansId1 = vm.ans1.id
            for (var k = 0; k < $rootScope.catansrecs.length; k++) {
                if (ansId1 == $rootScope.catansrecs[k].answer) {
                    catans1obj = $rootScope.catansrecs[k];
                    for (var n = 0; n < $rootScope.content.length; n++) {
                        if ($rootScope.catansrecs[k].category == $rootScope.content[n].id) {
                            catans1obj.rank = $rootScope.content[n].title;
                        }
                    }
                    vm.ans1.catans.push(catans1obj);
                }
            }
            
            //Get Catans for Answer 2
            vm.ans2.catans = [];
            ansId2 = vm.ans2.id
            for (var k = 0; k < $rootScope.catansrecs.length; k++) {
                if (ansId2 == $rootScope.catansrecs[k].answer) {
                    catans2obj = $rootScope.catansrecs[k];
                    for (var n = 0; n < $rootScope.content.length; n++) {
                        if ($rootScope.catansrecs[k].category == $rootScope.content[n].id) {
                            catans2obj.rank = $rootScope.content[n].title;
                        }
                    }
                    vm.ans2.catans.push(catans2obj);
                }
            }
            
            console.log("vm.ans1.catans.length ",vm.ans1.catans.length);
            console.log("vm.ans2.catans.length ",vm.ans2.catans.length);
    }
    
    function goPrev(x){
        idx = idx - x;
        if (idx < 0) idx = 0;
        getData();
        
    }
    
    function goNext(x){
        idx = idx + x;
        if (idx >= vm.tot) idx = vm.tot;
        getData();
    }
    
    function delAnswer(x){
        if (x==1){
            answer.deleteAnswer($rootScope.dupAns[idx].ans1.id);
            catans.deleteAnswer($rootScope.dupAns[idx].ans1.id);
        }
        if (x==2){
            answer.deleteAnswer($rootScope.dupAns[idx].ans2.id);
            catans.deleteAnswer($rootScope.dupAns[idx].ans2.id);
        }
    }
    
    function addCatans(x){
        if (x==1){
            vm.addcts1opts = [];
            var opt = '';
            for (var i=0; i<ctsOptions.length; i++){
                    if (ctsOptions[i].indexOf('@neighborhood')>-1){
                        opt = ctsOptions[i].replace('@neighborhood',vm.ans1.cityarea);
                        vm.addcts1opts.push(opt);
                    }
                    else vm.addcts1opts.push(ctsOptions[i]);
            }
            vm.addcts1active=true;
        }
        if (x==2){
            vm.addcts2opts = [];
            var opt2 = '';
            for (var i=0; i<ctsOptions.length; i++){
                    if (ctsOptions[i].indexOf('@neighborhood')>-1){
                        opt2 = ctsOptions[i].replace('@neighborhood',vm.ans2.cityarea);
                        vm.addcts2opts.push(opt2);
                    }
                    else vm.addcts2opts.push(ctsOptions[i]);
            }
            vm.addcts2active=true;
        }
        
    }
    
    function prepareData(){
        ctsOptions = [];
        var titlex = '';
        for (var i=0; i<$rootScope.content.length; i++){
            if ($rootScope.content[i].title.indexOf('in Hillcrest')>-1){
                titlex = $rootScope.content[i].title.replace('Hillcrest', '@neighborhood');
                ctsOptions.push(titlex);
            }
            if ($rootScope.content[i].tags.indexOf('isMP')>-1){
                ctsOptions.push($rootScope.content[i].title);
            }
        }
    }
    
    function addcts(x){
        var title = '';
        var myAnswer = {};
        var category = 0;
        var isDup = false;
        if (x==1){
            title = vm.addcts1val;
            myAnswer = vm.ans1;
            isDup = vm.cat1isdup == undefined ? false:vm.cat1isdup;
            
        }
        if (x==2){
            title = vm.addcts2val;
            myAnswer = vm.ans2;
            isDup = vm.cat2isdup == undefined ? false:vm.cat2isdup;
        }
        
        for (var i=0; i<$rootScope.content.length; i++){
            if ($rootScope.content[i].title == title){
                category = $rootScope.content[i].id;
                break;
            }
        }
        //console.log("postRec catans -",myAnswer.id,category,isDup);
        catans.postRec2(myAnswer.id, category, isDup);
        
        if (x==1) vm.addcts1active=false;
        if (x==2) vm.addcts2active=false;
        
        setTimeout(function () {
             getData();
        }, 1000);  
    }
     function delCatans(y){
            catans.deleteRec(y.answer, y.category);
            setTimeout(function () {
              getData();
            }, 1000);
        }
        
        function editAnswer(x){
            if (x==1){
                $state.go('editAnswer',{index: vm.ans1.id});
            }
            if (x==2){
                $state.go('editAnswer',{index: vm.ans2.id});
            }
        }
}
})();

(function () {
    'use strict';

    angular
        .module('app')
        .controller('foodRanks', foodRanks);

    foodRanks.$inject = ['$location', '$rootScope', '$state','catans','$http'];

    function foodRanks(location, $rootScope, $state, catans, $http) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'foodRanks';
        
        vm.getRanks = getRanks;
               
       activate();

        function activate() {            

            console.log("foodRanks page Loaded!");
            
        }
        
        function getRanks(){
            console.log("getRanks");
            
            var str = '';
            for (var i=0; i<$rootScope.content.length; i++){
                if ($rootScope.content[i].title.indexOf('restaurant') > -1 ||  //restaurant
                    $rootScope.content[i].title.indexOf('food') > -1 ||
                    $rootScope.content[i].tags.indexOf('food') > -1){            //food
                        str = str + ':' + $rootScope.content[i].id;  
                    }
            }
            
            var fstr = str.substring(1);
            var catArr = fstr.split(':').map(Number);
            
            var catansrec = {};
            var answerid = 0;
            var idx = 0;
            var foodAnswers = [];
            var foodAnswersMap = [];
            var isDup = false;
            for (var i=0; i<$rootScope.catansrecs.length; i++){
                catansrec = $rootScope.catansrecs[i];
                for (var j=0; j< catArr.length; j++){
                    if (catansrec.category == catArr[j]){
                      answerid = catansrec.answer;
                      //foodAnswersMap = [];
                      //if (foodAnswers.length > 0) {
                          //console.log("foodAnswers - ", foodAnswers.length);
                        //foodAnswersMap = foodAnswers.map(function(x) {return x.id;});
                        //console.log("foodAnswersMAp - ", foodAnswersMap.length);
                      //}
                      idx = $rootScope.answers.map(function(x) {return x.id; }).indexOf(answerid);
                      if (idx < 0) {
                          console.log("idx - ", answerid, "catansrec - ", catansrec.id, catansrec.answer, catansrec.category);
                          catans.deleteRec(catansrec.answer, catansrec.category);  
                      }
                      //only add if its not already added
                      isDup = false;
                      if (foodAnswers.length > 0 && idx > 0){
                        for (var n=0; n < foodAnswers.length; n++){
                            if (foodAnswers[n].id == $rootScope.answers[idx].id) {
                                isDup = true;
                                break;
                            }
                        }
                      }
                      if (!isDup) foodAnswers.push($rootScope.answers[idx]);                         
                    }
                } 
            }
            
            //console.log("foodAnswers - ", foodAnswers.length);
            console.log("Food ranks: - ", fstr);
            console.log("Food ranks length: - ", catArr.length);
            //console.log("Food answers length: - ", foodAnswers.length);
           
        }
    }
})();

(function () {
    'use strict';

    angular
        .module('app')
        .controller('flags', flags);

    flags.$inject = ['$location', '$rootScope', '$state','flag'];

    function flags(location, $rootScope, $state, flag) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'flags';
        
        //Methods
        vm.getFlags = getFlags;
               
       activate();

        function activate() {            

            console.log("Flags page loaded!");           
        }
        
        function getFlags(){            
            flag.getFlags().then(function(result){
                vm.flags = result;
                for (var i=0; i<vm.flags.length; i++){
                    if (vm.flags[i].type == 'comment-rank' || vm.flags[i].type == 'comment-answer'){
                        switch (vm.flags[i].flag){
                            case 1: { vm.flags[i].desc = 'Off-Topic'; break; }
                            case 2: { vm.flags[i].desc = 'Offensive'; break; }
                            case 3: { vm.flags[i].desc = 'Spam'; break; }
                        }
                    }
                    if (vm.flags[i].type == 'answer'){
                        switch (vm.flags[i].flag){
                            case 1: { vm.flags[i].desc = 'Wrong Category'; break; }
                            case 2: { vm.flags[i].desc = 'No longer active'; break; }
                            case 3: { vm.flags[i].desc = 'Offensive'; break; }
                            case 4: { vm.flags[i].desc = 'Spam'; break; }
                        }
                    }
                }
            });          
        }
    }
})();

(function () {
    'use strict';

    angular
        .module('app')
        .controller('dbQuery', dbQuery);

    dbQuery.$inject = ['$location', '$rootScope', '$state','$stateParams', 'table','dialog','answer','catans'];

    function dbQuery(location, $rootScope, $state, $stateParams, table, dialog, answer, catans) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'dbQuery';
        
        vm.queryAnswer = queryAnswer;
        vm.delCatans = delCatans;
        vm.delAnswer = delAnswer;
    
        vm.isAdmin = $rootScope.isAdmin;
        
        activate();

        function activate() {
            
            vm.isDET = $rootScope.isLoggedIn && ($rootScope.user.id == 12 ||
                                          $rootScope.user.id == 30 ||
                                          $rootScope.user.id == 41 ||  
                                          $rootScope.user.id == 42 ||
                                          $rootScope.user.id == 30);
            
            //loadData();
            console.log("dbQuery page Loaded!");
        }
        
        function queryAnswer(){
            console.log("query Answer");
            //find answer
            vm.ansRes = [];
            var ansId = 0;
            var catansobj ={};
            for (var i=0; i < $rootScope.answers.length; i++){
                if ($rootScope.answers[i].name.indexOf(vm.val) > -1){
                    vm.ansRes.push($rootScope.answers[i]);
                }
            }
            for (var j=0; j < vm.ansRes.length; j++){
                vm.ansRes[j].catans = [];
                ansId = vm.ansRes[j].id
                for (var k=0; k < $rootScope.catansrecs.length; k++){
                    if (ansId == $rootScope.catansrecs[k].answer){
                        catansobj = $rootScope.catansrecs[k];
                            for (var n=0; n < $rootScope.content.length; n++){
                                if ($rootScope.catansrecs[k].category == $rootScope.content[n].id){
                                    catansobj.rank = $rootScope.content[n].title;
                                }
                            }
                    vm.ansRes[j].catans.push(catansobj);
                    }    
                }              
            }
        }
        
        function delCatans(y){
            catans.deleteRec(y.answer, y.category);
        }
        
        function delAnswer(x){
            answer.deleteAnswer(x.id);
        }
 
    }
})();

(function () {
    'use strict';

    angular
        .module('app')
        .controller('dbMaint', dbMaint);

    dbMaint.$inject = ['$location', '$rootScope', '$state', '$stateParams', 'Upload', '$q',
        'table', 'dialog', 'answer', 'catans', 'votes', '$http','categorycode','codeprice'];

    function dbMaint(location, $rootScope, $state, $stateParams, Upload, $q,
        table, dialog, answer, catans, votes, $http, categorycode, codeprice) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'dbMaint';

        vm.showUrefAns = showUrefAns;
        vm.deleteAnswers = deleteAnswers;
        vm.showPossibleDuplicated = showPossibleDuplicated;
        vm.syncToFirst = syncToFirst;
        vm.syncToSecond = syncToSecond;
        vm.showDuplicatedOnlyName = showDuplicatedOnlyName;
        vm.showDuplicatedByLocation = showDuplicatedByLocation;
        vm.findPhoneWebsite = findPhoneWebsite;
        vm.findDuplicatedRanks = findDuplicatedRanks;
        vm.clearAllCatansVotes = clearAllCatansVotes;
        vm.syncUserVotes = syncUserVotes;
        vm.getAnswerBizCode = getAnswerBizCode;
        vm.updatecatans = updatecatans;
        vm.estDistances = estDistances;
        vm.gotoAnswer = gotoAnswer;
        vm.createImagesJSON = createImagesJSON;
        vm.updateUrls = updateUrls;
        vm.goMerge = goMerge;

        vm.isAdmin = $rootScope.isAdmin;
        
        vm.dupAnsRdy = false;

        activate();

        function activate() {
            //loadData();
            console.log("dbMaint page Loaded!");

        }

        function showUrefAns() {
            var cans = 0;
            var ansIsRef = false;
            var resObj = {};
            vm.unrefans = [];
            for (var i = 0; i < $rootScope.answers.length; i++) {
                cans = $rootScope.answers[i];
                ansIsRef = false;
                for (var j = 0; j < $rootScope.catansrecs.length; j++) {
                    if ($rootScope.catansrecs[j].answer == cans.id) {
                        ansIsRef = true;
                        break;
                    }
                }
                if (ansIsRef == false) {
                    resObj.name = cans.name;
                    resObj.id = cans.id
                    vm.unrefans.push(resObj);
                }
            }
            if (vm.unrefans.length > 0) vm.showDelete = true;
            else vm.showDelete = false;

        }

        function deleteAnswers() {
            for (var i = 0; i < vm.unrefans.length; i++) {
                answer.deleteAnswer(vm.unrefans[i].id);
            }
        }

        function showPossibleDuplicated() {
            // Find answers that are duplicated
            console.log("@ Show Possible Duplicated")
            console.log("answers length", $rootScope.answers.length);
            var canswer = {};
            var obj = {};
            vm.dupAnswers = [];
            var idx = 0;
            var n75 = 0;
            var canswer75 = '';
            for (var i = 0; i < $rootScope.answers.length; i++) {
                n75 = $rootScope.answers[i].name.length * 0.75;
                canswer = $rootScope.answers[i];
                canswer75 = $rootScope.answers[i].name.slice(0, n75);

                if ($rootScope.answers[i].type == 'Establishment' && canswer75.length > 8) {

                    for (var j = 0; j < $rootScope.answers.length; j++) {
                        if ($rootScope.answers[j].name.indexOf(canswer75) > -1 && i != j) {
                            //console.log("Duplicated answer: ", canswer.name);
                            obj = {};
                            obj.id = idx;
                            obj.add1 = canswer.addinfo;
                            obj.nh1 = canswer.cityarea;
                            obj.loc1 = canswer.location;
                            obj.name1 = canswer.name;
                            obj.image1 = canswer.imageurl;
                            obj.id1 = canswer.id;
                            obj.name2 = $rootScope.answers[j].name;
                            obj.idx1 = i;
                            obj.idx2 = j;
                            obj.loc2 = $rootScope.answers[j].location;
                            obj.nh2 = $rootScope.answers[j].cityarea;
                            obj.add2 = $rootScope.answers[j].addinfo;
                            obj.image2 = $rootScope.answers[j].imageurl;
                            obj.id2 = $rootScope.answers[j].id;
                            vm.dupAnswers.push(obj);
                            idx++;
                        }
                    }
                }
            }
            console.log("finished")
        }

        function syncToFirst(x) {
            //Sync to first answer in obj
            //Update catans from ans2 to ans1
            for (var i = 0; i < $rootScope.catansrecs.length; i++) {
                if (x.id2 == $rootScope.catansrecs[i].answer) {
                    catans.updateRec($rootScope.catansrecs[i].id, ["answer"], [x.id1]);
                    break;
                }
            }
            //delete answer 2
            answer.deleteAnswer(x.id2);
            showPossibleDuplicated();
        }

        function syncToSecond(x) {
            //Sync to second answer in obj
            //Update catans from ans1 to ans2
            for (var i = 0; i < $rootScope.catansrecs.length; i++) {
                if (x.id1 == $rootScope.catansrecs[i].answer) {
                    catans.updateRec($rootScope.catansrecs[i].id, ["answer"], [x.id2]);
                    break;
                }
            }
            //delete answer 2
            answer.deleteAnswer(x.id1);
            showPossibleDuplicated();
        }
        function showDuplicatedOnlyName() {
            // Find answers that are duplicated
            
            var canswer = {};
            var obj = {};
            vm.dupAnsNames = [];
            var idx = 0;
            for (var i = 0; i < $rootScope.answers.length; i++) {
                canswer = $rootScope.answers[i];
                for (var j = 0; j < $rootScope.answers.length; j++) {
                    if (canswer.name == $rootScope.answers[j].name && canswer.cityarea == $rootScope.answers[j].cityarea && i != j) {
                        //console.log("Duplicated answer: ", canswer.name);
                        obj = {};
                        obj.id = idx;
                        obj.add1 = canswer.addinfo;
                        obj.nh1 = canswer.cityarea;
                        obj.loc1 = canswer.location;
                        obj.name1 = canswer.name;
                        obj.image1 = canswer.imageurl;
                        obj.id1 = canswer.id;
                        obj.name2 = $rootScope.answers[j].name;
                        obj.idx1 = i;
                        obj.idx2 = j;
                        obj.loc2 = $rootScope.answers[j].location;
                        obj.nh2 = $rootScope.answers[j].cityarea;
                        obj.add2 = $rootScope.answers[j].addinfo;
                        obj.image2 = $rootScope.answers[j].imageurl;
                        obj.id2 = $rootScope.answers[j].id;
                        vm.dupAnsNames.push(obj);
                        idx++;
                    }
                }
            }
        }

        function showDuplicatedByLocation() {
            // Find answers that are duplicated
            $rootScope.fields = $rootScope.typeSchema[6].fields;
            
            var canswer = {};
            var obj = {};
            var dupAnsLocation = [];
            var idx = 0;
            for (var i = 0; i < $rootScope.answers.length; i++) {
                canswer = $rootScope.answers[i];
                if (canswer.location != undefined && canswer.location != '') {
                    for (var j = 0; j < $rootScope.answers.length; j++) {
                        if ($rootScope.answers[j].location != undefined && $rootScope.answers[j].location != '') {
                            if (canswer.location == $rootScope.answers[j].location &&  i != j) {
                                //console.log("Duplicated answer: ", canswer.name);
                                obj = {};
                                obj.ans1 = canswer;
                                obj.ans2 = $rootScope.answers[j];
                                dupAnsLocation.push(obj);
                                idx++;
                            }
                        }
                    }
                }
            }
            $rootScope.dupAns = dupAnsLocation;
            console.log("@finished - showDuplicatedByLocation");
            vm.dupAnsRdy = true;
        }
        
        function goMerge(){
            $state.go('mergeAnswers');
        }

        function findPhoneWebsite() {
            
            //console.log("Executing findingPhones");
            //var regex_pn = /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/;
            //var regex_pn = /\(([0-9]{3})\)([ .-]?)([0-9]{3})\2([0-9]{4})|([0-9]{3})([ .-]?)([0-9]{3})\5([0-9]{4})/;
            //var regex_pn
            //var regex_pn = /^[\.-)( ]*([0-9]{3})[\.-)( ]*([0-9]{3})[\.-)( ]*([0-9]{4})$/;
            //var regex_pn = /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/;
            //var regex_pn = /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/
            var regex_pn = /(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})\s*$/
            //var regex_url = /(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/igm;
            var phoneNum = '';
            //var url = '';
            var idx = 1;
            var obj = {};
            var newaddinfo = '';
            /*
            for (var i = 0; i < $rootScope.answers.length; i++) {
                if ($rootScope.answers[i].addinfo != null && $rootScope.answers[i].addinfo != undefined) {
                    if ($rootScope.answers[i].addinfo.length > 0) {
                        if ($rootScope.answers[i].addinfo.includes('(') == true && $rootScope.answers[i].addinfo.includes(')') == false) {
                            //newaddinfo = $rootScope.answers[i].addinfo;
                            //newaddinfo
                            console.log("current, new - ", $rootScope.answers[i].addinfo, $rootScope.answers[i].addinfo.replace('(',''));
                            //answer.updateAnswer($rootScope.answers[i].id,['phone'],[newphone]);
                        }
                    }
                }
            }*/
            /*
             for (var i=0; i<$rootScope.answers.length; i++){
                 if ($rootScope.answers[i].addinfo.length > 0){
                     //console.log("$rootScope.answers[i].addinfo",$rootScope.answers[i].addinfo);
                     var regRes = regex_pn.exec($rootScope.answers[i].addinfo);
                     //var regRes_url = regex_url.exec($rootScope.answers[i].addinfo);
                     //
                     if (regRes != null) phoneNum = regRes[0];
                     else phoneNum = '';
                     
                     //if (regRes_url != null) url = regRes_url[0];
                     //else url = '';
                     
                     if (phoneNum.length > 0){
                         obj = JSON.parse(JSON.stringify($rootScope.answers[i]));
                         var addinfox = obj.addinfo.replace(phoneNum, '');
                         //answer.updateAnswer($rootScope.answers[i].id,['phone','addinfo'],[phoneNum, addinfox]);
                         //addinfox.
                         console.log("matched!!!!", idx++, $rootScope.answers[i].name, " Phone Num: ", phoneNum);
                         //console.log(idx++, $rootScope.answers[i].name, " url: ", url);
                         //console.log("add info: ", $rootScope.answers[i].addinfo, addinfox);
                         //console.log(regRes);
                     }
                 }
             }*/
        }

        function findDuplicatedRanks() {

            var resDupRanks = [];
            for (var i = 0; i < $rootScope.content.length; i++) {
                for (var j = i; j < $rootScope.content.length; j++) {
                    if ($rootScope.content[i].title == $rootScope.content[j].title && i != j) {
                        console.log("duplicated rank --- ", $rootScope.content[i].title);
                        resDupRanks.push($rootScope.content[i]);
                    }
                }
            }
        }

        function clearAllCatansVotes() {
            console.log("Clearing all catans vote sums to zero");
            for (var i = 0; i < $rootScope.catansrecs.length; i++) {
                if ($rootScope.catansrecs[i].upV != 0 || $rootScope.catansrecs[i].downV != 0) {
                    catans.updateRec($rootScope.catansrecs[i].id, ['upV', 'downV'], [0, 0]);
                }
            }
        }

        function syncUserVotes() {

            console.log("syncUSerVotes");

            votes.loadAllVotes().then(function (result) {
                $rootScope.allvotes = result;
                syncVotes();
            });

        }

        function syncVotes() {

            console.log("syncVotes");
            var ca = {};
            var v = {};
            var nUpV = [];
            var nDownV = [];
            var idx = 0;
            var idx2 = 0;
            vm.syncp = [];
            var obj = {};
            for (var i = 0; i < $rootScope.catansrecs.length; i++) {
                ca = $rootScope.catansrecs[i];
                nUpV = [];
                nDownV = [];
                v = {};
                for (var j = 0; j < $rootScope.allvotes.length; j++) {
                    v = $rootScope.allvotes[j];
                    if (v.catans == ca.id) {   //if vote correspond to current catans
                        //console.log("vote id - ", v.id);
                        if (v.vote == 1) {
                            //console.log("upV catans -", ca.id, v.id);
                            nUpV.push(v);
                        }
                        if (v.vote == -1) {
                            //console.log("downV catans -", ca.id, v.id);
                            nDownV.push(v);
                        }
                    }
                }
                if (nUpV.length != ca.upV || nDownV.length != ca.downV) {

                    obj = {};

                    idx = $rootScope.answers.map(function (x) { return x.id; }).indexOf(ca.answer);
                    idx2 = $rootScope.content.map(function (x) { return x.id; }).indexOf(ca.category);

                    obj.answername = $rootScope.answers[idx].name;
                    obj.categorytitle = $rootScope.content[idx2].title;
                    obj.answer = $rootScope.answers[idx].id;
                    obj.catans = ca.id;
                    obj.category = $rootScope.content[idx2].id;
                    obj.caUpV = ca.upV;
                    obj.caDownV = ca.downV;
                    obj.nUpVlen = nUpV.length;
                    obj.nDownVlen = nDownV.length;

                    vm.syncp.push(obj);
                    //console.log("syn problem upV @ catans - ", $rootScope.answers[idx].name, $rootScope.content[idx2].title, ca.upV, nUpV);
                }
            }
        }

        function updatecatans(x) {
            catans.updateRec(x.catans, ['upV', 'downV'], [x.nUpVlen, x.nDownVlen]);
        }

        function estDistances() {
            console.log("@estDistances, need to have GPS location stored-", $rootScope.answers.length);
            vm.answerdist = [];
            //Calculate distances to user
            var p = 0.017453292519943295;    // Math.PI / 180
            var c = Math.cos;
            var a = 0;
            var lat_o = $rootScope.currentUserLatitude;
            var lng_o = $rootScope.currentUserLongitude;
            var lat = 0;
            var lng = 0;
            var dist_mi = 0;
            var myObj = {};

            for (var i = 0; i < $rootScope.answers.length; i++) {
                if ($rootScope.answers[i].type == 'Establishment') {
                    if ($rootScope.answers[i].location != undefined &&
                        $rootScope.answers[i].location != '') {
                            
                        //console.log($rootScope.answers[i].name," - ",$rootScope.answers[i].location);

                        lat = $rootScope.answers[i].lat;
                        lng = $rootScope.answers[i].lng;
                        myObj = $rootScope.answers[i];
                        a = 0.5 - c((lat - lat_o) * p) / 2 + c(lat_o * p) * c(lat * p) * (1 - c((lng - lng_o) * p)) / 2;

                        dist_mi = (12742 * Math.asin(Math.sqrt(a))) / 1.609; // 2 * R; R = 6371 km
                        myObj.dist = dist_mi;
                        if (dist_mi > 100 || dist_mi == NaN) {
                            //console.log('Answer Id. ',myObj.id,' Name: ',myObj.name);
                            vm.answerdist.push(myObj);
                        }
                    }
                }
            }
        }

        function gotoAnswer(x) {
            $state.go("answerDetail", { index: x.id });
        }

        function createImagesJSON() {
            
            //creates json of images that are non-secure
            var images = [];
            var imgObj = {};
            var idx = 1256;
            for (var i = 0; i < $rootScope.answers.length; i++) {
                if ($rootScope.answers[i].imageurl.indexOf('http://') > -1) {
                    imgObj = {};
                    imgObj.id = idx++;
                    imgObj.answer = $rootScope.answers[i].id;
                    imgObj.url = $rootScope.answers[i].imageurl;
                    images.push(imgObj);
                }
            }
            console.log(JSON.stringify(images));
        }

        function updateUrls() {

            var images = [];
            var fext = '';
            $http.get('../../../assets/images.json').then(function (response) {
                images = response.data;
                //console.log("images length - ", images.length);
                for (var i = 0; i < images.length; i++) {

                    if (images[i].url.indexOf('jpg') > -1) fext = 'jpg';
                    if (images[i].url.indexOf('png') > -1) fext = 'png';
                    if (images[i].url.indexOf('jpeg') > -1) fext = 'jpeg';

                    answer.updateAnswer(images[i].answer, ['image'],
                        ['https://rankx.blob.core.windows.net/sandiego/' + images[i].answer + '/' + images[i].id + '.' + fext]);
                }
            });
        }

        function getAnswerBizCode() {
            var category = 0;
            var rank = {};
            var catcodes = [];
            var scale_current = 0;
            var scale_this = 0;

            var p0 = categorycode.get();
            var p1 = codeprice.get();

            return $q.all([p0, p1]).then(function (d) {
                $rootScope.catcodes = d[0];
                $rootScope.codeprices = d[1];

                console.log('Category-codes loaded...');
                for (var i = 0; i < $rootScope.answers.length; i++) {
                    if ($rootScope.answers[i].type == 'Establishment') {
                        for (var j = 0; j < $rootScope.catansrecs.length; j++) {
                            if ($rootScope.catansrecs[j].answer == $rootScope.answers[i].id) {
                                category = $rootScope.catansrecs[j].category;
                                var idx = $rootScope.content.map(function (x) { return x.id; }).indexOf(category);
                                rank = $rootScope.content[idx];
                                for (var k = 0; k < $rootScope.catcodes.length; k++) {
                                    if (rank.title.indexOf($rootScope.catcodes[k].category) > -1) {
                                        if ($rootScope.answers[i].bizcat == undefined) {
                                            //console.log($rootScope.answers[i].name, " is ", $rootScope.catcodes[k].code);
                                            console.log('---------- undefined!!------');
                                            //answer.updateAnswer($rootScope.answers[i].id,['bizcat'],[$rootScope.catcodes[k].code]);
                                        }
                                        else {
                                            //find current value of answer bizcat
                                            for (var l=0; l < $rootScope.codeprices.length; l++){
                                                if ($rootScope.codeprices[l].code == $rootScope.answers[i].bizcat){
                                                    scale_current = $rootScope.codeprices[l].scale;
                                                }
                                                if ($rootScope.codeprices[l].code == $rootScope.catcodes[k].code){
                                                    scale_this = $rootScope.codeprices[l].scale;
                                                }
                                            }
                                            if (scale_this > scale_current){
                                                //console.log($rootScope.answers[i].name, " is ", $rootScope.catcodes[k].code);
                                                answer.updateAnswer($rootScope.answers[i].id,['bizcat'],[$rootScope.catcodes[k].code]);
                                            } 
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if (i%100 == 0) console.log(i,' of ',$rootScope.answers.length);
                }

            });
        }
    }
})();

(function () {
    'use strict';

    angular
        .module('app')
        .controller('admin', admin);

    admin.$inject = ['$location', '$rootScope', '$state'];

    function admin(location, $rootScope, $state) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'admin';

        vm.selKeywords = 'active';
        vm.selViews = '';
        vm.selFlags = '';
        vm.selRankings = '';

        vm.goBack = goBack;
        vm.keywords = keywords;
        vm.views = views;
        vm.flags = flags;
        vm.addRank = addRank;
        vm.dbMaint = dbMaint;
        vm.dbQuery = dbQuery;
        vm.update = update;
        vm.foodranks = foodranks;
        //vm.fbpost = fbpost;
        
        activate();

        function activate() {
            
            vm.isDET = $rootScope.isLoggedIn && ($rootScope.user.id == 12 ||
                                          $rootScope.user.id == 30 ||
                                          $rootScope.user.id == 41 ||  
                                          $rootScope.user.id == 42 ||
                                          $rootScope.user.id == 30);
            
            vm.isAdmin = $rootScope.isAdmin;
            console.log("admin page Loaded!");
            
        }
        function keywords() {
            vm.selKeywords = 'active';
            vm.selViews = '';
            vm.selFlags = '';
            vm.selRankings = '';
            vm.selDbMaint = '';
            vm.selQuery = '';
            vm.selUpdate = '';
            vm.selFoodRanks = '';

            $state.go('queries');

        }
        function views() {
            vm.selKeywords = '';
            vm.selViews = 'active';
            vm.selFlags = '';
            vm.selRankings = '';
            vm.selDbMaint = '';
            vm.selQuery = '';
            vm.selUpdate = '';
            vm.selFoodRanks = '';

            $state.go('views');

        }
        function flags() {
            vm.selKeywords = '';
            vm.selViews = '';
            vm.selFlags = 'active';
            vm.selRankings = '';
            vm.selDbMaint = '';
            vm.selQuery = '';
            vm.selUpdate = '';
            vm.selFoodRanks = '';

            $state.go('flags');

        }

        function addRank() {
            vm.selKeywords = '';
            vm.selViews = '';
            vm.selFlags = '';
            vm.selRankings = 'active';
            vm.selDbMaint = '';
            vm.selQuery = '';
            vm.selUpdate = '';
            vm.selFoodRanks = '';

            $state.go('addRank');

        }

        function dbMaint() {
            vm.selKeywords = '';
            vm.selViews = '';
            vm.selFlags = '';
            vm.selRankings = '';
            vm.selDbMaint = 'active';
            vm.selQuery = '';
            vm.selUpdate = '';
            vm.selFoodRanks = '';
            
            $state.go('dbMaint');
        }

        function dbQuery() {
            vm.selKeywords = '';
            vm.selViews = '';
            vm.selFlags = '';
            vm.selRankings = '';
            vm.selDbMaint = '';
            vm.selQuery = 'active';
            vm.selUpdate = '';
            vm.selFoodRanks = '';
            
            $state.go('dbQuery');
        }
        
         function update() {
            vm.selKeywords = '';
            vm.selViews = '';
            vm.selFlags = '';
            vm.selRankings = '';
            vm.selDbMaint = '';
            vm.selQuery = '';
            vm.selUpdate = 'active';
            vm.selFoodRanks = '';
            
            $state.go('updateHeaders');
        }
        
        function foodranks(){
            vm.selKeywords = '';
            vm.selViews = '';
            vm.selFlags = '';
            vm.selRankings = '';
            vm.selDbMaint = '';
            vm.selQuery = '';
            vm.selUpdate = '';
            vm.selFoodRanks = 'active';
            
            $state.go('foodRanks');
            
        }


        function goBack() {
            //if ($rootScope.cCategory.id == undefined) $state.go('rankSummary', { index: $rootScope.cCategory.id });
            //else $state.go('rankSummary', { index: 1 });
            $state.go('content');
        }     
    }
})();

(function () {
    'use strict';

    angular
        .module('app')
        .controller('addRankforAnswer', addRankforAnswer);

    addRankforAnswer.$inject = ['$location', '$rootScope', '$state','$stateParams', 'table','dialog','$window','answer'];

    function addRankforAnswer(location, $rootScope, $state, $stateParams, table, dialog, $window, answer) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'addRankforAnswer';

        vm.goBack = goBack;
        
        var item = {};
        var rankTitleOk = true;
        var rankTypeOk = true;
        var rankQuestionOk = true;
            
        vm.addRankingforAnswer = addRankingforAnswer;
        
        vm.typeList = ["Person", "Establishment", "Place", "Activity", "Short-Phrase", "Organization", "Event", "Thing","PersonCust"];

        vm.isAdmin = $rootScope.isAdmin;
        var colors = [];
        var ranks = [];
        var idx = 0;

        //Adjust picture size for very small displays
        if ($window.innerWidth < 512) { vm.sm = true; vm.nsm = false; }
        else { vm.sm = false; vm.nsm = true; }
        
        activate();

        function activate() {

            console.log("@addRankforAnswer");
            console.log("$rootScope.rankIdx ", $rootScope.rankIdx);
            console.log("$rootScope.canswer.ranks ", $rootScope.canswer.ranks);

            if ($rootScope.rankforAnswerMode == undefined) $state.go('cwrapper');

            if ($rootScope.rankforAnswerMode == 'edit'){
                ranks = JSON.parse($rootScope.canswer.ranks);
                idx = $rootScope.content.map(function(x) {return x.id; }).indexOf(ranks[$rootScope.rankIdx].id);
                vm.rankTitle = $rootScope.content[idx].title.replace(' @ '+$rootScope.canswer.name,'');
                vm.question = $rootScope.content[idx].question;
                vm.bc = ranks[$rootScope.rankIdx].bc;
                vm.fc = ranks[$rootScope.rankIdx].fc;
                vm.buttonLabel = 'Edit';              
            }

            else {            
                vm.rankTitle = 'Enter a title...';
                vm.question = 'Enter a question...';
                vm.bc = 'gray';
                vm.fc = 'lightgray';
                vm.buttonLabel = 'Add';
            }
            //loadData();
            console.log("addRankforAnswer page Loaded!");
            console.log("$rootScope.canswer - ", $rootScope.canswer);

        }
        
        function validateData(){
            
            if (vm.rankTitle == 'Enter a title...' || vm.rankTitle == '' 
            || vm.rankTitle.length < 3) rankTitleOk = false;
            else rankTitleOk = true;
            if (vm.question == 'Enter a question...' || vm.question == ''
            || vm.question.length < 3 ) rankQuestionOk = false;
            else rankQuestionOk = true;
            
            item.title = vm.rankTitle +' @ ' + $rootScope.canswer.name;
            item.tags = '';
            item.keywords = '';
            item.type = 'Thing';
            item.question = vm.question;
            item.views = 0;
            item.answers = 0;
            item.ismp = false;
            item.owner = $rootScope.canswer.id;
            
            rankTypeOk = true;

            colors = [vm.bc, vm.fc];      
           
        }

        function addRankingforAnswer(){
            validateData();
                var tfields = [];
                var tvals = [];

                if (rankTitleOk && rankTypeOk && rankQuestionOk) {
                    if ($rootScope.rankforAnswerMode == 'add'){
                        table.addTableforAnswer(item,colors,$rootScope.canswer.id).then(function(){
                            $state.go('answerRanksManager');
                        });
                    }
                    else{
                        if ($rootScope.content[idx].title != vm.rankTitle +' @ ' + $rootScope.canswer.name){
                            tfields.push('title');
                            tvals.push(vm.rankTitle +' @ ' + $rootScope.canswer.name);                            
                        }
                        if ($rootScope.content[idx].question != vm.question){
                            tfields.push('question');
                            tvals.push(vm.question);                            
                        }
                        if (tfields.length > 0) 
                        table.update($rootScope.content[idx].id, tfields, tvals).then(function(){
                            $state.go('answerRanksManager');
                        });

                        if (vm.bc != ranks[$rootScope.rankIdx].bc || vm.fc != ranks[$rootScope.rankIdx].fc){
                            ranks[$rootScope.rankIdx].bc = vm.bc;
                            ranks[$rootScope.rankIdx].fc = vm.fc;
                            var ranksStr = JSON.stringify(ranks);
                            answer.updateAnswer($rootScope.canswer.id,['ranks'],[ranksStr]).then(function(){
                            $state.go('answerRanksManager');
                        });
                        }
                    }
                    
                    //clearFields();
                }
                else {
                    if (!rankTitleOk) dialog.getDialog('rankTitle');
                    else if (!rankQuestionOk) dialog.getDialog('rankQuestion');
                    else dialog.getDialog('rankType');
                }                  
        }
        
        function clearFields(){
            item = {};
            vm.rankTitle = '';
            vm.tags = '';
            vm.keywords = '';
            vm.type = '';
            vm.isatomic = true;
            vm.question = '';
            vm.image1url = '';
            vm.image2url = '';
            vm.image3url = '';
        }
        
        function goBack(){
            $state.go('answerRanksManager');
        }
                     
    }
})();

(function () {
    'use strict';

    angular
        .module('app')
        .controller('addRank', addRank);

    addRank.$inject = ['$location', '$rootScope', '$state','$stateParams', 'table','dialog'];

    function addRank(location, $rootScope, $state, $stateParams, table, dialog) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'addRank';
        
        var item = {};
        var rankTitleOk = true;
        var rankTypeOk = true;
        var rankQuestionOk = true;
            
        vm.addRanking = addRanking;
        
        vm.typeList = ["Person", "Establishment", "Place", "Activity", "Short-Phrase", "Organization", "Event", "Thing","PersonCust"];

        vm.isAdmin = $rootScope.isAdmin;
        
        activate();

        function activate() {
            //loadData();
            console.log("addRank page Loaded!");

        }
        
        function validateData(){
            
            item.title = vm.rankTitle;
            item.tags = vm.tags;
            item.keywords = vm.keywords;
            item.type = vm.type;
            item.question = vm.question;
            item.views = 0;
            item.answers = 0;
            
            if (item.title == null || item.title == undefined || item.title.length < 10) rankTitleOk = false;
            if (item.question == null || item.question == undefined || item.question.length < 10) rankQuestionOk = false;
            if (!(item.type == 'Person' || item.type == 'Establishment' || item.type == 'Short-Phrase' || item.type == 'Event'
                || item.type == 'Organization' || item.type == 'Place' || item.type == 'Activity' || item.type == 'Thing'
                || item.type == 'PersonCust')) rankTypeOk = false;      
           
        }

        function addRanking(){
            validateData();
            console.log("vm.allNh --- ", vm.allNh);
            
            if (vm.allNh == false || vm.allNh == undefined) {
                if (rankTitleOk && rankTypeOk && rankQuestionOk) {
                    table.addTable(item);
                    clearFields();
                }
                else {
                    if (!rankTitleOk) dialog.getDialog('rankTitle');
                    else if (!rankQuestionOk) dialog.getDialog('rankQuestion');
                    else dialog.getDialog('rankType');
                }
            }
            else {
                if (rankTitleOk && rankTypeOk && rankQuestionOk) {
                    for (var i = 0; i < $rootScope.content.length; i++) {
                        if ($rootScope.content[i].title.indexOf('Yoga studios in') > -1) {
                            //Copy object without reference
                            var tablex = JSON.parse(JSON.stringify($rootScope.content[i]));
                            tablex.id = undefined;
                            var newtitle = tablex.title.replace("Yoga studios in", vm.rankTitle);
                            tablex.title = newtitle;
                            //var newtags = tablex.tags.replace("meat food", "beer pb bars");
                            var newtags = vm.tags
                            tablex.tags = newtags;

                            //add checks for pb,ob and mb
                            if (newtitle.indexOf('Pacific Beach')>-1) tablex.tags = tablex.tags + ' pb';
                            if (newtitle.indexOf('Ocean Beach')>-1) tablex.tags = tablex.tags + ' ob';
                            if (newtitle.indexOf('Mission Beach')>-1) tablex.tags = tablex.tags + ' mb';

                            //set isatomic flag to false and add 'isMP' tag    
                            if (newtitle.indexOf('in San Diego')>-1) {
                                tablex.tags = tablex.tags + ' isMP';
                                tablex.isatomic = false;
                            }
                            if (newtitle.indexOf('in Downtown')>-1) tablex.isatomic = false; 

                            tablex.answers = 0;
                            tablex.views = 0;
                            tablex.answertags = '';
                            tablex.catstr = '';
                            //console.log("tags ", tags);
                            table.addTable(tablex);
                        }
                    }
                    clearFields();
                }
                else {
                    if (!rankTitleOk) dialog.getDialog('rankTitle');
                    else if (!rankQuestionOk) dialog.getDialog('rankQuestion');
                    else dialog.getDialog('rankType');
                }
            }
                
        }
        
        function clearFields(){
            item = {};
            vm.rankTitle = '';
            vm.tags = '';
            vm.keywords = '';
            vm.type = '';
            vm.isatomic = true;
            vm.question = '';
            vm.image1url = '';
            vm.image2url = '';
            vm.image3url = '';
        }
        
        function goBack(){
            $state.go('admin');
        }
       
                
    }
})();

(function () {
    'use strict';

    var app = angular.module('app');

    // Configure the states and state resolvers
    app.config(['$stateProvider', '$urlRouterProvider', stateConfigurator]);

    function stateConfigurator($stateProvider, $urlRouterProvider) {

        var states = [            
            {
                name: 'promote',
                url: '/promote',
                views: {
                    "@": {
                        templateUrl: 'app/promoters/Partials/promote.html',
                        controller: 'promote as vm'
                    },
                    "navbar@admin": {
                        templateUrl: 'app/layout/Partials/navbar.html',
                        controller: 'navbar as vm'
                    }
                }
            }
        ];

        $(states).each(function () {

            $stateProvider.state(this);
        });
    }
})();
(function () {
    'use strict';

    var app = angular.module('login');

    // Configure the states and state resolvers
    app.config(['$stateProvider', '$urlRouterProvider', stateConfigurator]);

    function stateConfigurator($stateProvider, $urlRouterProvider) {

        var states = [
            {
                name: 'login',
                url: '/login',
                templateUrl: 'app/login/partials/login.html',
                controller: 'login as vm'
            },
            {
                name: 'bizlogin',
                url: '/bizlogin',
                templateUrl: 'app/login/partials/bizlogin.html',
                controller: 'bizlogin as vm'
            },
            {
                name: 'register',
                url: '/register',
                templateUrl: 'app/login/partials/register.html',
                controller: 'register as  vm'
            }
        ];

        $(states).each(function () {

            $stateProvider.state(this);
        });
    }
})();
(function () {
    'use strict';

    var app = angular.module('app');

    // Configure the states and state resolvers
    app.config(['$stateProvider', '$urlRouterProvider', stateConfigurator]);

    function stateConfigurator($stateProvider, $urlRouterProvider) {

        var states = [            
            {
                name: 'customer',
                url: '/customer',
                views: {
                    "@": {
                        templateUrl: 'app/customer/Partials/customer.html',
                        controller: 'customer as vm'
                    },
                    "navbar@customer": {
                        templateUrl: 'app/layout/Partials/navbar.html',
                        controller: 'navbar as vm'
                    }
                },
                 resolve: {

                    answers: ['answer', function (answer) {
                        return answer.getAnswers().then(function (result) {

                            return result;
                        });
                    }]
                 }
            },
            {
                name: 'mainphoto',
                parent: 'customer',
                url: '/mainphoto',
                templateUrl: 'app/customer/Partials/mainphoto.html',
                controller: 'mainphoto as vm'               
            },
            {
                name: 'photogallery',
                parent: 'customer',
                url: '/photogallery',
                templateUrl: 'app/customer/Partials/photogallery.html',
                controller: 'photogallery as vm'               
            }
        ];

        $(states).each(function () {

            $stateProvider.state(this);
        });
    }
})();
(function () {
    'use strict';

    var app = angular.module('app');

    // Configure the states and state resolvers
    app.config(['$stateProvider', '$urlRouterProvider', stateConfigurator]);

    function stateConfigurator($stateProvider, $urlRouterProvider) {

        var states = [            
            {
                name: 'admin',
                url: '/admin',
                views: {
                    "@": {
                        templateUrl: 'app/admin/Partials/admin.html',
                        controller: 'admin as vm'
                    },
                    "navbar@admin": {
                        templateUrl: 'app/layout/Partials/navbar.html',
                        controller: 'navbar as vm'
                    }
                }
            },
            {
                name: 'queries',
                parent: 'admin',
                url: '/queries',
                templateUrl: 'app/admin/Partials/queries.html',
                controller: 'queries as vm'               
            },
            {
                name: 'views',
                parent: 'admin',
                url: '/views',
                templateUrl: 'app/admin/Partials/views.html',
                controller: 'views as vm'               
            },
            {
                name: 'flags',
                parent: 'admin',
                url: '/flags',
                templateUrl: 'app/admin/Partials/flags.html',
                controller: 'flags as vm'               
            },
            {
                name: 'addRank',
                parent: 'admin',
                url: '/addRank',
                templateUrl: 'app/admin/Partials/addRank.html',
                controller: 'addRank as vm'               
            },
            {
                name: 'dbMaint',
                parent: 'admin',
                url: '/dbMaint',
                templateUrl: 'app/admin/Partials/dbMaint.html',
                controller: 'dbMaint as vm'               
            },
            {
                name: 'mergeAnswers',
                parent: 'admin',
                url: '/mergeAnswers',
                templateUrl: 'app/admin/Partials/mergeAnswers.html',
                controller: 'mergeAnswers as vm'               
            },
             {
                name: 'dbQuery',
                parent: 'admin',
                url: '/dbQuery',
                templateUrl: 'app/admin/Partials/dbQuery.html',
                controller: 'dbQuery as vm'               
            },
             {
                name: 'updateHeaders',
                parent: 'admin',
                url: '/updateHeaders',
                templateUrl: 'app/admin/Partials/updateHeaders.html',
                controller: 'updateHeaders as vm'               
            },
             {
                name: 'foodRanks',
                parent: 'admin',
                url: '/foodRanks',
                templateUrl: 'app/admin/Partials/foodRanks.html',
                controller: 'foodRanks as vm'               
            },
            {
                name: 'rodconsole',
                url: '/rodconsole',
                views: {
                    "@": {
                        templateUrl: 'app/admin/Partials/rodconsole.html',
                        controller: 'rodconsole as vm'
                    },
                    "navbar@rodconsole": {
                        templateUrl: 'app/layout/Partials/navbar.html',
                        controller: 'navbar as vm'
                    }
                }
            }
        ];

        $(states).each(function () {

            $stateProvider.state(this);
        });
    }
})();
var openModal = function (modalSelector, options) {
    $(modalSelector).modal({
        'backdrop': options && (options.backdrop == true || options.backdrop == false ) ? options.backdrop : "static",
        "keyboard": options && options.keyboard ? options.keyboard : "false",
        "show": "true"
    });
};

var closeModal = function (modalSelector, callback) {
    $(modalSelector).modal('hide');
    if (callback) {
        callback();
    }
};

function calculateAge(birthday) { // birthday is a date
    var ageDifMs = Date.now() - birthday.getTime();
    var ageDate = new Date(ageDifMs); // miliseconds from epoch
    return Math.abs(ageDate.getUTCFullYear() - 1970);    
}
(function () {
    'user strict';

    angular
        .module('app')
        //.constant('INSTANCE_URL', 'http://bitnami-dreamfactory-df88.westus.cloudapp.azure.com')
        .constant('INSTANCE_URL', 'https://api.rank-x.com')
       // .constant('APP_API_KEY', '7e9a54a80a6ae850bc38ff768d75e143e75c273d1f7e2f265648020bf8c42a3b')
       // .constant('APP_API_KEY','8b8174170d616f3adb571a0b28daf65a0cf07aa149aad9bf6554986856debdf4')
        .constant('APP_API_KEY','da4f7e05b7afc5beffe8d9d416abec73cf98ef89e3703beeb5144f325be5decc')
        .constant('GOOGLE_API_KEY', 'AIzaSyC2gAzj80m1XpaagvunSDPgEvOCleNNe5A')
        .constant('DEBUG_MODE', false)
        .constant('EMPTY_IMAGE','../../../assets/images/noimage.jpg')
        .constant('INSTAGRAM_CLIENT_ID', "c46745e083b7451a99461240e01da20b")
})();

(function () {
    'use strict';

    var app = angular.module('app');

    // Configure the states and state resolvers
    app.config(['$stateProvider', '$urlRouterProvider','$locationProvider', stateConfigurator]);

    function stateConfigurator($stateProvider, $urlRouterProvider,$locationProvider) {

        // use the HTML5 History API
        //$locationProvider.html5Mode(true);

        // For any unmatched url
        $urlRouterProvider.otherwise('/home');

        var states = [
            {
                name: 'layout',
                abstract: true,
                url: '',
                views: {
                    "@": {
                        templateUrl: 'app/layout/Partials/layout.html',
                        controller: 'layout as vm'
                    },
                    "navbar@layout": {
                        templateUrl: 'app/layout/Partials/navbar.html',
                        controller: 'navbar as vm'
                    }
                }
            },
            {
                name: 'cwrapper',
                parent: 'layout',
                //abstract: true,
                url: '/home', ///cwrapper',
                views: {
                    "@layout": {
                        templateUrl: 'app/layout/Partials/cwrapper.html',
                        controller: 'cwrapper as vm'
                    }
                }
            },

            {
                name: 'rankSummary',
                parent: 'layout',
                url: '/rankSummary/:index',
                templateUrl: 'app/rank/Partials/RankSummary.html',
                controller: 'rankSummary as vm'
            },
            {
                name: 'editRanking',
                parent: 'layout',
                url: '/editRanking/:index',
                templateUrl: 'app/rank/Partials/editRanking.html',
                controller: 'editRanking as vm',
                resolve: {
                    rankings: ['table', function (table) {
                        return table.getTables().then(function (result) {

                            return result;
                        });
                    }]
                }
            },
            {
                name: 'addAnswer',
                parent: 'layout',
                url: '/addAnswer',
                templateUrl: 'app/answer/Partials/addAnswer.html',
                controller: 'addAnswer as vm'
            },
            {
                name: 'addEvent',
                parent: 'layout',
                url: '/addEvent',
                templateUrl: 'app/answer/Partials/addEvent.html',
                controller: 'addEvent as vm'
            },
            {
                name: 'editAnswer',
                parent: 'layout',
                url: '/editAnswer/:index',
                templateUrl: 'app/answer/Partials/editAnswer.html',
                controller: 'editAnswer as vm',

                resolve: {
                    answers: ['answer', function (answer) {
                        return answer.getAnswers().then(function (result) {
                            return result;
                        });
                    }],
                    edits: ['edit', function (edit) {

                        return edit.getEdits().then(function (result) {

                            return result;
                        });
                    }]
                }
            },
             {
                name: 'specials',
                parent: 'layout',
                url: '/specials',
                templateUrl: 'app/customer/Partials/specials.html',
                controller: 'specials as vm'
            },
            {
                name: 'editspecial',
                parent: 'layout',
                url: '/editspecial',
                templateUrl: 'app/customer/Partials/editspecial.html',
                controller: 'editspecial as vm'
            },
            {
                name: 'addRankforAnswer',
                parent: 'layout',
                url: '/addRankforAnswer',
                templateUrl: 'app/admin/Partials/addRankforAnswer.html',
                controller: 'addRankforAnswer as vm'               
            },
            {
                name: 'answerDetail',
                parent: 'layout',
                url: '/answerDetail/:index',
                templateUrl: 'app/answer/Partials/answerDetail.html',
                controller: 'answerDetail as vm',
            },
            {
                name: 'answerRanksManager',
                parent: 'layout',
                url: '/answerRanksManager',
                templateUrl: 'app/answer/Partials/answerRanksManager.html',
                controller: 'answerRanksManager as vm',
            },
            {
                name: 'editvrows',
                parent: 'layout',
                url: '/editvrows',
                templateUrl: 'app/customer/Partials/editvrows.html',
                controller: 'editvrows as vm'
            },
            {
                name: 'match',
                parent: 'layout',
                url: '/match',
                templateUrl: 'app/rank/Partials/match.html',
                controller: 'match as vm',
                resolve: {

                    answers: ['answer', function (answer) {
                        return answer.getAnswers().then(function (result) {

                            return result;
                        });
                    }]
                }
            },
            {
                name: 'about',
                url: '/about',
                views: {
                    "@": {
                        templateUrl: 'app/layout/Partials/about.html',
                        controller: 'about as vm'
                    },
                    "navbar@about": {
                        templateUrl: 'app/layout/Partials/navbar.html',
                        controller: 'navbar as vm'
                    }
                }
            },
            {
                name: 'privacypolicy',
                url: '/privacypolicy',
                views: {
                    "@": {
                        templateUrl: 'app/layout/Partials/privacypolicy.html',
                        controller: 'privacypolicy as vm'
                    },
                    "navbar@privacypolicy": {
                        templateUrl: 'app/layout/Partials/navbar.html',
                        controller: 'navbar as vm'
                    }
                }
            },
            {
              name: 'mybiz',
              url: '/mybiz',
              views: {
                "@": {
                  templateUrl: 'app/layout/Partials/mybiz.html',
                  controller: 'mybiz as vm'
                },
                "navbar@mybiz": {
                  templateUrl: 'app/layout/Partials/navbar.html',
                  controller: 'navbar as vm'
                }
            }
          },
          /*{
              name: 'mybusiness',
              parent: 'layout',
              url: '/mybusiness',
              templateUrl: 'app/layout/Partials/mybusiness.html',
              controller: 'mybusiness as vm'
          },*/
          {
                name: 'mybusiness',
                url: '/mybusiness',
                views: {
                    "@": {
                        templateUrl: 'app/layout/Partials/mybusiness.html',
                        controller: 'mybusiness as vm'
                    },
                    "navbar@mybusiness": {
                        templateUrl: 'app/layout/Partials/navbar.html',
                        controller: 'navbar as vm'
                    }
                }
            },
          {
                name: 'promoterconsole',
                url: '/promoterconsole',
                views: {
                    "@": {
                        templateUrl: 'app/promoters/Partials/promoterconsole.html',
                        controller: 'promoterconsole as vm'
                    },
                    "navbar@promoterconsole": {
                        templateUrl: 'app/layout/Partials/navbar.html',
                        controller: 'navbar as vm'
                    }
                }
            },
            {
                name: 'promotersignup',
                url: '/promotersignup',
                views: {
                    "@": {
                        templateUrl: 'app/promoters/Partials/promotersignup.html',
                        controller: 'promotersignup as vm'
                    },
                    "navbar@promotersignup": {
                        templateUrl: 'app/layout/Partials/navbar.html',
                        controller: 'navbar as vm'
                    }
                }
            },  
          {
                name: 'myfavs',
                parent: 'layout',
                url: '/myfavs',
                templateUrl: 'app/layout/Partials/myfavs.html',
                controller: 'myfavs as vm'
          }
        ];

        $(states).each(function () {

            $stateProvider.state(this);
        });

        $locationProvider.html5Mode(true);
        // $locationProvider.hashPrefix('!');
        
    }
})();

(function () {
    'use strict';
    var app = angular.module('app');

    app.config(configure);

    configure.$inject = ['$httpProvider','$locationProvider', '$facebookProvider', '$sceDelegateProvider'];

    function configure($httpProvider, $locationProvide, $facebookProvider, $sceDelegateProvider) {

        // http interceptor
        // My App ID: 1494723870571848
        $httpProvider.interceptors.push('httpInterceptor');
        $facebookProvider.setAppId('1102409523140826');
        
        //SCE 
        $sceDelegateProvider.resourceUrlWhitelist([
            // Allow same origin resource loads.
            'self',
            // Allow loading from our assets domain.  Notice the difference between * and **.
            'https://api.instagram.com/**'
        ]);
    }
})();

(function () {
    'use strict';

    angular.module('app')
        .run(configureHeaders);

    configureHeaders.$inject = ['$cookies', '$http', '$rootScope', 'APP_API_KEY', '$window'];

    function configureHeaders($cookies, $http, $rootScope, APP_API_KEY, $window) {

        // Configure API Headers
        $http.defaults.headers.common['X-Dreamfactory-API-Key'] = APP_API_KEY;
        $http.defaults.headers.common['X-DreamFactory-Session-Token'] = $cookies.session_token;
        
	    var access = $window.location.hash.replace('#access_token=', '').split("&")[0];

	    if ($window.location.hash.indexOf('access_token') != -1) {
	    	console.log("opener",  $window.opener);

		    var $parentScope = $window.opener.angular.element($window.opener.document).scope(); 
		       
	        $parentScope.$broadcast("igAccessTokenObtained", 
	            { access_token: access });
		    $window.close();
	    	
	    } 
    }
})();
angular.module("app").run(["$templateCache", function($templateCache) {$templateCache.put("app/admin/Partials/addRank.html","<br><div class=\"row\" ng-if=\"vm.isAdmin\"><div class=\"col-sm-1\"></div><div class=\"col-sm-10\"><h4>Add Ranking</h4><label class=\"checkbox-inline\"><input type=\"checkbox\" ng-model=\"vm.allNh\" value=\"\">All Neighborhoods</label><p>To add a ranking to all neighborhoods, type title without actual neighborhood name:</p><p>For instance, for \'Best pizza in ###? , simply type \'Best pizza in\' and select the checkbox</p><label><strong>Title:</strong></label> <input class=\"form-control\" ng-model=\"vm.rankTitle\" type=\"text\" placeholder=\"{{vm.rankTitle}}\"> <label><strong>Question:</strong></label> <input class=\"form-control\" ng-model=\"vm.question\" type=\"text\" placeholder=\"{{vm.question}}\"> <label><strong>Tags:</strong></label> <input class=\"form-control\" ng-model=\"vm.tags\" type=\"text\" placeholder=\"{{vm.tags}}\"> <label><strong>Keywords:</strong></label> <input class=\"form-control\" ng-model=\"vm.keywords\" type=\"text\" placeholder=\"{{vm.keywords}}\"> <label><strong>Type:</strong></label> <input class=\"form-control\" ng-model=\"vm.type\" bs-typeahead=\"\" type=\"text\" placeholder=\"{{vm.type}}\" bs-options=\"c for c in vm.typeList\"><br><div class=\"form-group text-right\"><button type=\"button\" class=\"btn btn-primary\" ng-click=\"vm.addRanking()\">Add</button></div></div><div class=\"col-sm-1\"></div></div>");
$templateCache.put("app/admin/Partials/addRankforAnswer.html","<br><h4>Add Ranking</h4><label><strong>Title:</strong></label> <input class=\"form-control\" ng-model=\"vm.rankTitle\" type=\"text\" placeholder=\"{{vm.rankTitle}}\"> <label><strong>Question:</strong></label> <input class=\"form-control\" ng-model=\"vm.question\" type=\"text\" placeholder=\"{{vm.question}}\"><div class=\"text-right\"><a href=\"\" ng-click=\"\">What is this?</a></div><br><div class=\"row\"><div class=\"hidden-xs col-sm-2 col-md-2 col-lg-2\"></div><div class=\"col-xs-6 col-sm-2 col-md-2 col-lg-2\"><p class=\"text-right\">Background Color</p></div><div class=\"col-xs-6 col-sm-2 col-md-2 col-lg-2\"><color-picker ng-model=\"vm.bc\" color-picker-swatch=\"true\" color-picker-swatch-pos=\"\'left\'\" color-picker-swatch-bootstrap=\"true\" color-picker-swatch-only=\"true\"></color-picker></div><div class=\"col-xs-6 col-sm-2 col-md-2 col-lg-2\"><p class=\"text-right\">Font Color</p></div><div class=\"col-xs-6 col-sm-2 col-md-2 col-lg-2\"><color-picker ng-model=\"vm.fc\" color-picker-swatch=\"true\" color-picker-swatch-pos=\"\'left\'\" color-picker-swatch-bootstrap=\"true\" color-picker-swatch-only=\"true\"></color-picker></div><div class=\"hidden-xs col-sm-2 col-md-2 col-lg-2\"></div></div><h4>Preview</h4><div class=\"container\" ng-if=\"true\"><div class=\"row\" ng-if=\"vm.type != \'Short-Phrase\'\"><div class=\"col-xs-12\"><div class=\"well-sm\" style=\"background-color:#666666;color:#f8f8ff;\"><h3 class=\"sub-header\">The Favorites</h3></div></div></div><div class=\"row\"><div class=\"container col-xs-6 col-sm-3 col-md-2 col-lg-2\" style=\"background-color:{{vm.bc}};color:{{vm.fc}};height:{{vm.sm ? \'120px\':\'150px\'}};margin:0px;padding:0px;border:0px;position:relative;\"><h2 class=\"hidden-xs text-center\" style=\"padding:3px; margin:0px; position:absolute; top:50%; left:50%; margin-right:-50%;transform: translate(-50%,-50%)\">{{vm.rankTitle}}</h2><h3 class=\"hidden-sm hidden-md hidden-lg hidden-xl text-center\" style=\"padding:3px; margin:0px; position:absolute; top:50%; left:50%; margin-right:-50%;transform: translate(-50%,-50%)\">{{vm.rankTitle}}</h3></div><div class=\"col-xs-6 col-sm-3 col-md-2 col-lg-2\" style=\"margin:0px;padding:0px;border:0px;\"><img src=\"../../../assets/images/noimage.jpg\" style=\"width:100%;height:{{vm.sm ? \'120px\':\'150px\'}};\"></div></div></div><br><div class=\"text-right\"><button type=\"button\" class=\"btn btn-default\" ng-click=\"vm.goBack()\">Cancel</button> <button type=\"button\" class=\"btn btn-primary\" ng-click=\"vm.addRankingforAnswer()\">{{vm.buttonLabel}}</button></div>");
$templateCache.put("app/admin/Partials/admin.html","<div ui-view=\"navbar\"></div><br><div class=\"text-center\" ng-if=\"vm.isAdmin\"><div class=\"btn-group col-sm-6 col-md-6\"><button class=\"btn btn-default {{vm.selKeywords}}\" ng-click=\"vm.keywords()\">Searched-Keyword</button> <button class=\"btn btn-default {{vm.selViews}}\" ng-click=\"vm.views()\">Ranking-Answers Views</button> <button class=\"btn btn-default {{vm.selFlags}}\" ng-click=\"vm.flags()\">Answer Flags</button> <button class=\"btn btn-default {{vm.selAddRanking}}\" ng-click=\"vm.addRank()\">Add Ranking</button> <button class=\"btn btn-default {{vm.selDbMaint}}\" ng-click=\"vm.dbMaint()\">dB Maint</button> <button class=\"btn btn-default {{vm.selQuery}}\" ng-click=\"vm.dbQuery()\">Query</button> <button class=\"btn btn-default {{vm.selUpdate}}\" ng-click=\"vm.update()\">Update Headlines</button> <button class=\"btn btn-default {{vm.selFoodRanks}}\" ng-click=\"vm.foodranks()\">Food Ranks</button></div></div><button class=\"btn btn-default {{vm.selQuery}}\" ng-click=\"vm.dbQuery()\" ng-if=\"vm.isDET\">Query</button><br><br><div ui-view=\"\"></div><br><br><footer class=\"footer\"><div class=\"container\"><p class=\"text-muted\">Rank-X is property of Rank-X LLC. San Diego, CA - 2016</p></div></footer>");
$templateCache.put("app/admin/Partials/dbMaint.html","<div class=\"container\" ng-if=\"vm.isAdmin\"><h1>Database Maintenance</h1><button class=\"btn btn-success\" ng-click=\"vm.showUrefAns()\">Unreferenced Answers</button><br><button class=\"btn btn-danger\" ng-click=\"vm.deleteAnswers()\">Delete Answers</button> <button class=\"btn btn-default\" ng-click=\"vm.showPossibleDuplicated()\">Show Possible Duplicated</button> <button class=\"btn btn-default\" ng-click=\"vm.showDuplicatedOnlyName()\">Show Duplicated Only Name</button> <button class=\"btn btn-default\" ng-click=\"vm.showDuplicatedByLocation()\">Show Duplicated By Location</button><br><button class=\"btn btn-default\" ng-click=\"vm.findPhoneWebsite()\">Phone Numbers & Website</button><br><button class=\"btn btn-default\" ng-click=\"vm.findDuplicatedRanks()\">Duplicated Ranks</button><br><button class=\"btn btn-default\" ng-click=\"vm.clearAllCatansVotes()\">Clear Catans Votes</button><br><button class=\"btn btn-default\" ng-click=\"vm.syncUserVotes()\">Sync User Votes</button><br><button class=\"btn btn-default\" ng-click=\"vm.estDistances()\">Establishment Distances</button><br><button class=\"btn btn-default\" ng-click=\"vm.createImagesJSON()\">createImagesJSON</button><br><button class=\"btn btn-default\" ng-click=\"vm.updateUrls()\">updateUrls</button><br><button class=\"btn btn-default\" ng-click=\"vm.getAnswerBizCode()\">getAnswerBizCode</button><br><br><p ng-repeat=\"x in vm.unrefans track by $index\">{{x.name}} --- {{x.id}}</p><div ng-repeat=\"x in vm.dupAnswers track by $index\"><img src=\"{{x.image1}}\" style=\"width:120px\"> <img src=\"{{x.image2}}\" style=\"width:120px\"><p>{{x.name1}} --- {{x.idx1}} --- {{x.loc1}} --- {{x.nh1}} --- {{x.add1}} --- {{x.id1}}</p><p>{{x.name2}} --- {{x.idx2}} --- {{x.loc2}} --- {{x.nh2}} --- {{x.add2}} --- {{x.id2}}</p><button class=\"btn btn-default\" ng-click=\"vm.syncToFirst(x)\">Sync 1st</button> <button class=\"btn btn-default\" ng-click=\"vm.syncToSecond(x)\">Sync 2nd</button><p>-------------------------------------------------------</p></div><div ng-repeat=\"x in vm.dupAnsNames track by $index\"><img src=\"{{x.image1}}\" style=\"width:120px\"> <img src=\"{{x.image2}}\" style=\"width:120px\"><p>{{x.name1}} --- {{x.idx1}} --- {{x.loc1}} --- {{x.nh1}} --- {{x.add1}} --- {{x.id1}}</p><p>{{x.name2}} --- {{x.idx2}} --- {{x.loc2}} --- {{x.nh2}} --- {{x.add2}} --- {{x.id2}}</p><button class=\"btn btn-default\" ng-click=\"vm.syncToFirst(x)\">Sync 1st</button> <button class=\"btn btn-default\" ng-click=\"vm.syncToSecond(x)\">Sync 2nd</button><p>-------------------------------------------------------</p></div><p ng-repeat=\"x in vm.resDupRanks track by $index\">{{x.title}} --- {{x.id}}</p><div ng-repeat=\"x in vm.syncp\">{{x.answername}} - {{x.categoryname}} - caUpV {{x.caUpV}} - nUpVotes {{x.nUpVlen}} - caDownV {{x.caDownV}} - nDownVotes {{x.nDownVlen}} <button class=\"btn btn-primary\" ng-click=\"vm.updatecatans(x)\">Fix</button></div><div ng-repeat=\"x in vm.answerdist\"><div class=\"row\">{{x.name}} - {{x.location}} - {{x.dist}} <button class=\"btn btn-default\" ng-click=\"vm.gotoAnswer(x)\">Go to Answer</button></div></div><button ng-if=\"vm.dupAnsRdy\" class=\"btn btn-primary\" ng-click=\"vm.goMerge()\">Go Merge Screen</button></div>");
$templateCache.put("app/admin/Partials/dbQuery.html","<div class=\"container\" ng-if=\"vm.isAdmin || vm.isDET\"><h1>Database Query</h1><input class=\"form-control\" ng-model=\"vm.val\" placeholder=\"Enter answer to search\"> <button class=\"btn btn-primary\" ng-click=\"vm.queryAnswer()\">Query</button><div ng-repeat=\"x in vm.ansRes\"><h4 class=\"text-left\">{{$index+1}}. {{x.name}}</h4><img src=\"{{x.imageurl}}\" style=\"width:120px\"><br>Id: {{x.id}} Added by User: {{x.userid}}<br>Neighborhood: {{x.cityarea}}<br>Address: {{x.location}}<br>Website: {{x.website}}<br>Phone: {{x.phone}}<br>Additional Info: {{x.addinfo}}<br><button class=\"btn btn-danger\" ng-click=\"vm.delAnswer(x)\">Delete Answer</button><br>Categories<br><div ng-repeat=\"y in x.catans\">{{y.rank}} --- {{y.id}} --- {{y.category}} --- {{y.answer}} <button class=\"btn btn-warning\" ng-click=\"vm.delCatans(y)\">Delete Catans</button><br></div></div></div>");
$templateCache.put("app/admin/Partials/flags.html","<h1>Flags</h1><br><button class=\"btn btn-danger\" ng-click=\"vm.getFlags()\">Get Flags</button><table class=\"table table-hover cursor\"><tbody><thead><tr><th>Type</th><th>Flag</th><th>Go To</th></tr></thead><tbody><tr ng-repeat=\"x in vm.flags\"><td>{{x.type}}</td><td>{{x.desc}}</td><td>{{x.number}}</td></tr></tbody></tbody></table>");
$templateCache.put("app/admin/Partials/foodRanks.html","<br><br><h1>Get Food Ranks</h1><br><br><button class=\"btn btn-primary\" ng-click=\"vm.getRanks()\">Get Food Ranks</button>");
$templateCache.put("app/admin/Partials/mergeAnswers.html","<h1>Merge Answers</h1><br><h3>Pair {{vm.idx}} of {{vm.tot}}</h3><div class=\"row\"><div class=\"text-left col-xs-6\"><button class=\"btn-success\" ng-click=\"vm.goPrev(50)\">&lt;&lt;&lt</button> <button class=\"btn-success\" ng-click=\"vm.goPrev(10)\">&lt;&lt</button> <button class=\"btn-success\" ng-click=\"vm.goPrev(1)\">&lt</button></div><div class=\"text-right col-xs-6\"><button class=\"btn-success\" ng-click=\"vm.goNext(1)\">&gt</button> <button class=\"btn-success\" ng-click=\"vm.goNext(10)\">&gt;&gt</button> <button class=\"btn-success\" ng-click=\"vm.goNext(50)\">&gt;&gt;&gt</button></div></div><br><div class=\"container\"><div class=\"row\"><div class=\"col-xs-6 col-sm-6 col-lg-6\"><h4 class=\"radio\"><input type=\"radio\" ng-model=\"vm.ans1_NameSel\" name=\"nameOption\">{{vm.ans1.name}}</h4><div class=\"text-left btn-group\"><button class=\"btn btn-danger\" ng-click=\"vm.delAnswer(1)\">Delete Answer</button> <button class=\"btn btn-primary\" ng-click=\"vm.editAnswer(1)\">Edit Answer</button></div><br><input type=\"radio\" class=\"radio-inline\" ng-model=\"vm.ans1_ImageSel\" name=\"imageOption\"> <img src=\"{{vm.ans1.imageurl}}\" style=\"width:40%;height:100px\"><p class=\"text-left\"><input type=\"radio\" ng-model=\"vm.ans1_AddressSel\" name=\"addressOption\">&nbsp{{vm.ans1.location}}</p><p class=\"text-left\"><input type=\"radio\" ng-model=\"vm.ans1_NhSel\" name=\"nhOption\">&nbsp{{vm.ans1.cityarea}}</p><p class=\"text-left\"><input type=\"radio\" ng-model=\"vm.ans1_PhoneSel\" name=\"phoneOption\">&nbsp{{vm.ans1.phone}}</p><p class=\"text-left\"><input type=\"radio\" ng-model=\"vm.ans1_WebsiteSel\" name=\"websiteOption\">&nbsp{{vm.ans1.website}}</p><p class=\"text-left\"><input type=\"radio\" ng-model=\"vm.ans1_AddinfoSel\" name=\"addinfoOption\">&nbsp{{vm.ans1.addinfo}}</p><div ng-repeat=\"y in vm.ans1.catans track by $index\">{{y.rank}} --- {{y.id}} --- {{y.category}} --- {{y.answer}} <button class=\"btn btn-warning\" ng-click=\"vm.delCatans(y)\">Delete Catans</button><br></div><div class=\"text-left\"><button class=\"btn btn-primary\" ng-click=\"vm.addCatans(1)\">Add Catans</button></div><div class=\"input-group\" ng-if=\"vm.addcts1active\"><input type=\"text\" class=\"form-control\" ng-model=\"vm.addcts1val\" bs-options=\"c for c in vm.addcts1opts\" bs-typeahead=\"\"> <span class=\"input-group-btn text-right\"><button class=\"btn btn-success\" type=\"button\" ng-click=\"vm.addcts(1)\">Add</button></span></div><label class=\"checkbox-inline\" ng-if=\"vm.addcts1active\"><input type=\"checkbox\" ng-model=\"vm.cat1isdup\">Is Dup</label></div><div class=\"col-xs-6 col-sm-6 col-lg-6\"><h4 class=\"radio\"><input type=\"radio\" ng-model=\"vm.ans2_NameSel\" name=\"nameOption\">{{vm.ans2.name}}</h4><div class=\"text-left btn-group\"><button class=\"btn btn-danger\" ng-click=\"vm.delAnswer(2)\">Delete Answer</button> <button class=\"btn btn-primary\" ng-click=\"vm.editAnswer(2)\">Edit Answer</button></div><br><input type=\"radio\" class=\"radio-inline\" ng-model=\"vm.ans2_ImageSel\" name=\"imageOption\"> <img src=\"{{vm.ans2.imageurl}}\" style=\"width:40%;height:100px\"><p class=\"text-left\"><input type=\"radio\" ng-model=\"vm.ans2_AddressSel\" name=\"addressOption\">&nbsp{{vm.ans2.location}}</p><p class=\"text-left\"><input type=\"radio\" ng-model=\"vm.ans2_NhSel\" name=\"nhOption\">&nbsp{{vm.ans2.cityarea}}</p><p class=\"text-left\"><input type=\"radio\" ng-model=\"vm.ans2_PhoneSel\" name=\"phoneOption\">&nbsp{{vm.ans2.phone}}</p><p class=\"text-left\"><input type=\"radio\" ng-model=\"vm.ans2_WebsiteSel\" name=\"websiteOption\">&nbsp{{vm.ans2.website}}</p><p class=\"text-left\"><input type=\"radio\" ng-model=\"vm.ans2_AddinfoSel\" name=\"addinfoOption\">&nbsp{{vm.ans2.addinfo}}</p><div ng-repeat=\"x in vm.ans2.catans track by $index\">{{x.rank}} --- {{x.id}} --- {{x.category}} --- {{x.answer}} <button class=\"btn btn-warning\" ng-click=\"vm.delCatans(x)\">Delete Catans</button><br></div><div class=\"text-left\"><button class=\"btn btn-primary\" ng-click=\"vm.addCatans(2)\">Add Catans</button></div><div class=\"input-group\" ng-if=\"vm.addcts2active\"><input type=\"text\" class=\"form-control\" ng-model=\"vm.addcts2val\" bs-options=\"c for c in vm.addcts2opts\" bs-typeahead=\"\"> <span class=\"input-group-btn text-right\"><button class=\"btn btn-success\" type=\"button\" ng-click=\"vm.addcts(2)\">Add</button></span></div><label class=\"checkbox-inline\" ng-if=\"vm.addcts2active\"><input type=\"checkbox\" ng-model=\"vm.cat2isdup\">Is Dup</label></div></div></div>");
$templateCache.put("app/admin/Partials/queries.html","<div class=\"container\" ng-if=\"vm.isAdmin\"><h1>Queries</h1><br><a ng-click=\"vm.clearDb()\" class=\"btn btn-danger\">Clear Database</a><br><div class=\"row\"><div class=\"col-sm-2\"></div><div class=\"col-sm-8\"><table class=\"table table-hover cursor\"><tbody><thead><tr><th>User Input</th><th>Num. Results</th></tr></thead><tbody><tr ng-repeat=\"x in vm.queries | orderBy: \'-results\'\"><td>{{x.query}}</td><td>{{x.results}}</td></tr></tbody></tbody></table></div><div class=\"col-sm-2\"></div></div></div>");
$templateCache.put("app/admin/Partials/rodconsole.html","<div ui-view=\"navbar\"></div><div id=\"veil\" ng-hide=\"vm.dataReady\"></div><div id=\"feedLoading\" ng-hide=\"vm.dataReady\"><div style=\"text-align: center\" ng-if=\"!vm.dataReady\"><div class=\"loading-pulse\"></div><p style=\"font-size:large\">{{vm.loadText}}</p></div></div><div ng-if=\"vm.dataReady\"><div class=\"container\"><div ng-if=\"vm.overview\"><h2>Ranking of the Day Admin Console</h2><div class=\"row\"><div class=\"col-xs-6\"><label class=\"checkbox-inline\"><input type=\"checkbox\" ng-change=\'vm.filterData(\"all\")\' ng-model=\"vm.allIsSelected\" ng-checked=\"vm.allIsSelected\">&nbspAll</label></div><div class=\"col-xs-6\"><label class=\"checkbox-inline\"><input type=\"checkbox\" ng-change=\'vm.filterData(\"next20\")\' ng-model=\"vm.next20IsSelected\" ng-checked=\"vm.next20IsSelected\">&nbspNext 20</label></div></div><br><table class=\"table\"><tbody><thead style=\"border-style:none;\"><tr><th>Date</th><th>Title</th><th>Image</th><th>Text</th></tr></thead><tr ng-repeat=\"x in vm.rods\" style=\"cursor:pointer;\" ng-click=\"vm.selRank(x)\"><td align=\"middle\">{{x.datenum}}</td><td align=\"middle\">{{x.title}}</td><td align=\"middle\" style=\"background-color:{{x.imageok ? \'palegreen\':\'grey\'}}\">{{x.imageok ? \'Ready\':\'None\'}}</td><td align=\"middle\" style=\"background-color:{{x.textok ? \'palegreen\':\'grey\'}}\">{{x.textok ? \'Ready\':\'None\'}}</td></tr></tbody></table></div><div ng-if=\"vm.detail\"><h2>{{vm.rank.title}}</h2><br><p class=\"text-left\"><strong>Date:</strong>{{vm.rank.date}}</p><br><div class=\"row\"><div class=\"text-right col-xs-6\"><label>Background Color:</label></div><div class=\"col-xs-6\"><color-picker ng-model=\"vm.rank.bc\" color-picker-swatch=\"true\" color-picker-swatch-pos=\"\'left\'\" color-picker-swatch-bootstrap=\"true\" color-picker-swatch-only=\"true\"></color-picker></div></div><br><div class=\"row\"><div class=\"text-right col-xs-6\"><label>Font Color:</label></div><div class=\"col-xs-6\"><color-picker ng-model=\"vm.rank.fc\" color-picker-swatch=\"true\" color-picker-swatch-pos=\"\'left\'\" color-picker-swatch-bootstrap=\"true\" color-picker-swatch-only=\"true\"></color-picker></div></div><br><div class=\"row\"><div class=\"text-right col-xs-6\"><label>Shade Factor:</label></div><div class=\"col-xs-5 sm-4 md-2 lg-2\"><div class=\"input-group\"><span class=\"input-group-btn\"><button class=\"btn btn-primary\" ng-click=\"vm.minusShade()\"><i class=\"fa fa-minus\"></i></button></span> <input style=\"text-align:center\" class=\"form-control\" ng-model=\"vm.rank.shade\" type=\"text\" placeholder=\"vm.rank.shade\"> <span class=\"input-group-btn\"><button class=\"btn btn-primary\" ng-click=\"vm.plusShade()\"><i class=\"fa fa-plus\"></i></button></span></div></div></div><br><div class=\"row\"><div class=\"container col-xs-6 col-sm-6 col-md-4 col-lg-3\" style=\"color:{{vm.rank.fc}};height:{{vm.sm ? \'150px\':\'200px\'}};margin:0px;padding:0px;border:0px;position:relative; background: {{vm.rank.bc}}; background: -webkit-linear-gradient(left, {{vm.rank.bc}}, {{vm.rank.bc2}}); background: -o-linear-gradient(right, {{vm.rank.bc}}, {{vm.rank.bc2}}); background: -moz-linear-gradient(right, {{vm.rank.bc}}, {{vm.rank.bc2}}); background: linear-gradient(to right, {{vm.rank.bc}}, {{vm.rank.bc2}});\"><h2 class=\"hidden-xs text-center\" style=\"padding:3px; margin:0px; position:absolute; top:50%; left:50%; margin-right:-50%;transform: translate(-50%,-50%)\">{{vm.rank.title}}</h2><h3 class=\"hidden-sm hidden-md hidden-lg hidden-xl text-center\" style=\"padding:3px; margin:0px; position:absolute; top:50%; left:50%; margin-right:-50%;transform: translate(-50%,-50%)\">{{vm.rank.title}}</h3></div><div class=\"col-xs-6 col-sm-6 col-md-4 col-lg-3\" style=\"margin:0px;padding:0px;border:0px;\" ng-if=\"!vm.isShortPhrase\"><img src=\"{{vm.rank.image1}}\" style=\"display:{{vm.rank.image1 != undefined ? \'inline\':\'none\'}};width:100%;height:{{vm.sm ? \'150px\':\'200px\'}};\"></div><div class=\"hidden-xs hidden-sm col-md-4 col-lg-3\" style=\"margin:0px;padding:0px;border:0px;\" ng-if=\"!vm.isShortPhrase\"><img src=\"{{vm.rank.image2}}\" style=\"display:{{vm.rank.image1 != undefined ? \'inline\':\'none\'}};width:100%;height:{{vm.sm ? \'150px\':\'200px\'}};\"></div><div class=\"hidden-xs hidden-sm hidden-md col-lg-3\" style=\"margin:0px;padding:0px;border:0px;\" ng-if=\"!vm.isShortPhrase\"><img src=\"{{vm.rank.image3}}\" style=\"display:{{vm.rank.image1 != undefined ? \'inline\':\'none\'}};width:100%;height:{{vm.sm ? \'150px\':\'200px\'}};\"></div><div class=\"container col-xs-6 col-sm-6 col-md-4 col-lg-3\" ng-if=\"vm.isShortPhrase\" style=\"background-color:lightgray;color:black;height:{{vm.sm ? \'150px\':\'200px\'}};margin:0px;padding:0px;border:0px;position:relative;\"><div style=\"padding:3px; margin:0px; position:absolute; top:50%; left:50%; margin-right:-50%;transform: translate(-50%,-50%)\"><h2 class=\"hidden-xs text-center\">{{vm.rank.title1}}</h2><h3 class=\"hidden-sm hidden-md hidden-lg hidden-xl text-center\">{{vm.rank.title1}}</h3></div></div><div class=\"container hidden-xs hidden-sm col-md-4 col-lg-3\" ng-if=\"vm.isShortPhrase\" style=\"background-color:lightgray;color:black;height:{{vm.sm ? \'150px\':\'200px\'}};margin:0px;padding:0px;border:0px;position:relative;\"><div style=\"padding:3px; margin:0px; position:absolute; top:50%; left:50%; margin-right:-50%;transform: translate(-50%,-50%)\"><h2 class=\"hidden-xs text-center\">{{vm.rank.title2}}</h2><h3 class=\"hidden-sm hidden-md hidden-lg hidden-xl text-center\">{{vm.rank.title2}}</h3></div></div><div class=\"container hidden-xs hidden-sm hidden-md col-lg-3\" ng-if=\"vm.isShortPhrase\" style=\"background-color:lightgray;color:black;height:{{vm.sm ? \'150px\':\'200px\'}};margin:0px;padding:0px;border:0px;position:relative;\"><div style=\"padding:3px; margin:0px; position:absolute; top:50%; left:50%; margin-right:-50%;transform: translate(-50%,-50%)\"><h2 class=\"hidden-xs text-center\">{{vm.rank.title3}}</h2><h3 class=\"hidden-sm hidden-md hidden-lg hidden-xl text-center\">{{vm.rank.title3}}</h3></div></div></div><br><div class=\"row\"><div class=\"text-left col-xs-6\"><blob-upload></blob-upload></div><div class=\"text-right col-xs-6\"><button class=\"btn btn-success\" ng-click=\"vm.goSaveImage()\">Save Image & Design</button></div></div><label class=\"control-label capitalize\">Intro Text:</label> <textarea id=\"textarea1\" class=\"form-control\" ng-model=\"vm.rank.introtext\" rows=\"6\">\n        </textarea><br><div class=\"text-right\"><button class=\"btn btn-success\" ng-click=\"vm.goSaveText()\">Save Intro Text</button></div><br><div class=\"text-right\"><button class=\"btn btn-default\" ng-click=\"vm.goBack()\">Back</button></div></div></div></div>");
$templateCache.put("app/admin/Partials/updateHeaders.html","<div class=\"container\" ng-if=\"vm.isAdmin\"><br><br><h1>Refresh Headlines</h1><br><div class=\"text-center\"><button ng-click=\"vm.catStrings()\" class=\"btn btn-primary\">Check for Empty Category Strings</button><br><br><button ng-click=\"vm.refresh()\" class=\"btn btn-success\">Shuffle Headers</button><br><br><button ng-click=\"vm.createCBlocksRecsCity()\" class=\"btn btn-success\">Create C-Blocks City</button><br><br><button ng-click=\"vm.createCBlocksRecsNh()\" class=\"btn btn-success\">Create C-Blocks Neighborhood</button><br><br><button ng-click=\"vm.createCBlocksRecsRankX()\" class=\"btn btn-success\">Create C-Blocks RankX</button><br><br><button ng-click=\"vm.deleteCBlocks()\" class=\"btn btn-warning\">Delete ALL C-Blocks</button></div><div ng-repeat=\"x in vm.res track by $index\">{{x.modeNum}} - {{x.htitle}} - {{x.scope}} - {{x.title}}</div></div>");
$templateCache.put("app/admin/Partials/views.html","<h1>Views</h1><div class=\"row\"><div class=\"col-sm-2\"></div><div class=\"col-sm-8\"><table class=\"table table-hover cursor\"><tbody><thead><tr><th>Ranking</th><th>Views</th></tr></thead><tbody><tr ng-repeat=\"x in vm.content | orderBy: \'-views\'\"><td>{{x.title}}</td><td>{{x.views}}</td></tr></tbody></tbody></table></div><div class=\"col-sm-2\"></div></div>");
$templateCache.put("app/answer/Partials/addAnswer.html","<div class=\"well-rank\" ng-if=\"vm.nsm\" style=\"margin:0px;\"><h2 class=\"sub-header\">{{vm.ranking}} <span class=\"nomargin\"><button type=\"button\" class=\"glyphicon glyphicon-remove pull-right\" style=\"margin:0px;padding:0px;border:0px;background-color:#006dcc;color:#002699;font-size:medium;\" ng-click=\"vm.closeRank()\"></button></span></h2></div><div class=\"well-rank\" ng-if=\"vm.sm\" style=\"margin:0px;\"><h3 class=\"sub-header\">{{vm.ranking}} <span class=\"nomargin\"><button type=\"button\" class=\"glyphicon glyphicon-remove pull-right\" style=\"margin:0px;padding:0px;border:0px;background-color:#006dcc;color:#002699;font-size:medium;\" ng-click=\"vm.closeRank()\"></button></span></h3></div><div class=\"row\" style=\"margin:0px;\"><h4>&nbsp&nbspAdd a new <span ng-if=\"vm.type == \'Establishment\'\"><em>Establishment</em> to this list.</span> <span ng-if=\"vm.type == \'Organization\'\"><em>Organization or Company</em> to this list.</span> <span ng-if=\"vm.type == \'Person\'\"><em>Person</em> to this list.</span> <span ng-if=\"vm.type == \'PersonCust\'\"><em>Professional</em> to this list.</span> <span ng-if=\"vm.type == \'Place\'\"><em>Place</em> to this list.</span> <span ng-if=\"vm.type == \'Short-Phrase\'\"><em>Answer</em> to this list.</span> <span ng-if=\"vm.type == \'Thing\'\"><em>Item</em> to this list.</span> <span ng-if=\"vm.type == \'Event\'\"><em>Event</em> to this list.</span></h4></div><div class=\"text-right\"><p class=\"hiw\" ng-click=\"vm.showHowItWorksDialog()\"><u>How it works?</u></p></div><br><div class=\"row\" style=\"margin:0px;\"><div class=\"col-sm-12 col-md-5\"><div class=\"\" ng-show=\"{{vm.type != \'Short-Phrase\'}}\"><img src=\"{{vm.imageURL}}\" alt=\"{{image.errorLoading}}\" style=\"width:100%; max-height:300px\"> <img src=\"../../../assets/images/powered_by_google_on_white.png\" ng-if=\"vm.type!=\'PersonCust\'\"></div><div class=\"\" ng-show=\"{{vm.type == \'Short-Phrase\'}}\"><div class=\"container-answer\" style=\"width:100%;height:auto\" ng-if=\"vm.type == \'Short-Phrase\'\"><br><h2 style=\"text-align:center\"><strong>{{vm.fields[0].val}}</strong></h2><br><h4 style=\"text-align:center\">{{vm.fields[1].val}}</h4></div></div><div ng-if=\"vm.type != \'PersonCust\'\"><div class=\"form-group text-right\"><button type=\"submit\" class=\"btn btn-primary {{vm.searchDisabled}}\" ng-click=\"vm.callSearchImage()\" ng-show=\"{{vm.type != \'Short-Phrase\'}}\">{{vm.imageCommand}}</button> <button type=\"submit\" class=\"btn btn-primary\" ng-click=\"vm.viewPrev()\" ng-disabled=\"vm.numLinks === 0\" style=\"display:{{vm.imagefunctions}}\">&laquo</button> <button type=\"submit\" class=\"btn btn-primary\" ng-click=\"vm.viewNext()\" ng-disabled=\"vm.numLinks === 0\" style=\"display:{{vm.imagefunctions}}\">&raquo</button> <a style=\"display:{{vm.imagefunctions}}\">{{vm.linkIdx+1}} of {{vm.numLinks}}</a></div><label class=\"checkbox-inline\" ng-show=\"{{vm.type != \'Short-Phrase\'}}\"><input type=\"checkbox\" ng-change=\"vm.onNoGoodImages(vm.ngi)\" ng-model=\"vm.ngi\">No good images were found</label></div></div><br ng-if=\"vm.sm\"><form class=\"form-horizontal col-sm-12 col-md-7\" role=\"form\" name=\"answerForm\"><div class=\"form-group\" ng-repeat=\"x in vm.fields\"><label class=\"control-label capitalize\" ng-if=\"!x.onlybyowner\" style=\"padding-left:10px\">{{x.isrequired ? \'**\':\'\'}}{{x.label}}:</label> <input class=\"form-control\" ng-model=\"x.val\" bs-options=\"{{x.opts}}\" bs-typeahead=\"\" type=\"{{x.textstyle}}\" bs-typeahead-on-select=\"vm.onSelect(x.val)\" placeholder=\"{{x.label}}\" ng-hide=\"{{x.name==\'addinfo\'}}\" ng-if=\"!x.onlybyowner\" style=\"width:94%;margin-left:10px;margin-right:10px;\"> <textarea class=\"form-control\" ng-model=\"x.val\" placeholder=\"{{x.label}}\" ng-model-options=\"{debounce: 2500}\" ng-show=\"{{x.name==\'addinfo\'}}\" rows=\"3\" ng-if=\"!x.onlybyowner\" id=\"textarea2\" style=\"width:94%;margin-left:10px;margin-right:10px;\"></textarea></div><div class=\"text-right\" ng-if=\"vm.type == \'Person\'\"><button ng-click=\"vm.getWiki()\" class=\"btn btn-primary\" style=\"background-color:#595959;border-color:black\">Get from Wikipedia</button></div></form></div><div class=\"row form-group\" style=\"margin:0px;\"><div class=\"text-center\"><button ng-click=\"vm.rankSummary()\" class=\"btn btn-danger\">Cancel</button><button type=\"submit\" class=\"btn btn-success\" ng-click=\"vm.callAddAnswer()\">Add Answer</button></div></div>");
$templateCache.put("app/answer/Partials/addEvent.html","<div class=\"well-rank\" ng-if=\"vm.nsm\" style=\"margin:0px;\"><h2 class=\"sub-header\">{{vm.ranking}} <span class=\"nomargin\"><button type=\"button\" class=\"glyphicon glyphicon-remove pull-right\" style=\"margin:0px;padding:0px;border:0px;background-color:#006dcc;color:#002699;font-size:medium;\" ng-click=\"vm.closeRank()\"></button></span></h2></div><div class=\"well-rank\" ng-if=\"vm.sm\" style=\"margin:0px;\"><h3 class=\"sub-header\">{{vm.ranking}} <span class=\"nomargin\"><button type=\"button\" class=\"glyphicon glyphicon-remove pull-right\" style=\"margin:0px;padding:0px;border:0px;background-color:#006dcc;color:#002699;font-size:medium;\" ng-click=\"vm.closeRank()\"></button></span></h3></div><div class=\"row\" style=\"margin:0px;\"><h4>{{ vm.isEdit ? \'Edit Event\':\'Add Event\'}}</h4></div><div class=\"text-right\"><p class=\"hiw\" ng-click=\"vm.showHowItWorksDialog()\"><u>How it works?</u></p></div><br><div class=\"row\" style=\"margin:0px;\"><div class=\"col-xs-6 col-sm-4 col-md-4\"><p class=\"text-right\">** Event Title:</p></div><div class=\"col-xs-12 col-sm-4 col-md-4\"><input class=\"form-control\" ng-model=\"vm.ev.name\" type=\"text\" placeholder=\"Event Title\" ng-change=\"vm.displayCharLength()\" maxlength=\"45\" style=\"background-color:{{vm.ev.bc}};color:{{vm.ev.fc}}\"></div><div class=\"col-xs-8 hidden-sm hidden-md hidden-lg hidden-xl\"></div><div class=\"col-xs-6 col-sm-4 col-md-4\"><p class=\"text-left\">{{vm.char}} chars left</p></div></div><br ng-if=\"!vm.sm\"><div ng-if=\"!vm.sm\"><div class=\"row\" style=\"margin:0px;\"><div class=\"hidden-xs col-sm-2 col-md-2 col-lg-2\"></div><div class=\"col-xs-6 col-sm-2 col-md-2 col-lg-2\"><p class=\"text-right\">Background Color</p></div><div class=\"col-xs-6 col-sm-2 col-md-2 col-lg-2\"><color-picker ng-model=\"vm.ev.bc\" color-picker-swatch=\"true\" color-picker-swatch-pos=\"\'left\'\" color-picker-swatch-bootstrap=\"true\" color-picker-swatch-only=\"true\"></color-picker></div><div class=\"col-xs-6 col-sm-2 col-md-2 col-lg-2\"><p class=\"text-right\">Font Color</p></div><div class=\"col-xs-6 col-sm-2 col-md-2 col-lg-2\"><color-picker ng-model=\"vm.ev.fc\" color-picker-swatch=\"true\" color-picker-swatch-pos=\"\'left\'\" color-picker-swatch-bootstrap=\"true\" color-picker-swatch-only=\"true\"></color-picker></div><div class=\"hidden-xs col-sm-2 col-md-2 col-lg-2\"></div></div></div><br ng-if=\"!vm.sm\"><br><p class=\"text-left\">Frequency</p><div class=\"btn-group col-sm-6 col-md-6\"><button class=\"btn btn-primary {{vm.ev.freq == \'onetime\'? \'active\':\'\'}}\" ng-click=\"vm.frequencySel(1)\">One-Time</button> <button class=\"btn btn-primary {{vm.ev.freq == \'weekly\'? \'active\':\'\'}}\" ng-click=\"vm.frequencySel(2)\">Weekly</button></div><br><br><div class=\"row\" ng-if=\"vm.onetime\" style=\"margin:0px;\"><div class=\"col-xs-12 col-sm-3 col-md-3 col-lg-3\"><div style=\"display:{{vm.onetime ? \'inline\':\'none\'}}\"><p class=\"{{vm.sm ? \'text-left\':\'text-right\'}}\">Start date:</p></div></div><div class=\"col-xs-12 col-sm-3 col-md-3 col-lg-3\"><div style=\"display:{{vm.onetime ? \'inline\':\'none\'}}\"><datepicker date-format=\"EEE MMM d y\" date-year-title=\"selected title------\"><input ng-model=\"vm.ev.sdate\" type=\"text\"></datepicker></div></div></div><div class=\"row\" ng-if=\"vm.onetime\"><div class=\"col-xs-12 col-sm-3 col-md-3 col-lg-3\"><div style=\"display:{{vm.onetime ? \'inline\':\'none\'}}\"><p class=\"{{vm.sm ? \'text-left\':\'text-right\'}}\">Start time:</p></div></div><div class=\"col-xs-12 col-sm-3 col-md-3 col-lg-3\"><div style=\"display:{{vm.onetime ? \'inline\':\'none\'}}\"><select ng-model=\"vm.ev.stime\" ng-options=\"x for x in vm.timeDD\"><option value=\"\">{{vm.sp.stime}}</option></select></div></div></div><div class=\"row\" ng-if=\"vm.onetime\" style=\"margin:0px;\"><div class=\"col-xs-12 col-sm-3 col-md-3 col-lg-3\"><div style=\"display:{{vm.onetime ? \'inline\':\'none\'}}\"><p class=\"{{vm.sm ? \'text-left\':\'text-right\'}}\">End date:</p></div></div><div class=\"col-xs-12 col-sm-3 col-md-3 col-lg-3\" style=\"display:{{vm.onetime ? \'inline\':\'none\'}}\"><datepicker date-format=\"EEE MMM d y\" date-year-title=\"selected title------\"><input ng-model=\"vm.ev.edate\" type=\"text\"></datepicker></div></div><div class=\"row\" ng-if=\"vm.onetime\" style=\"margin:0px;\"><div class=\"col-xs-12 col-sm-3 col-md-3 col-lg-3\" style=\"display:{{vm.onetime ? \'inline\':\'none\'}}\"><p class=\"{{vm.sm ? \'text-left\':\'text-right\'}}\">End time:</p></div><div class=\"col-xs-12 col-sm-3 col-md-3 col-lg-3\" style=\"display:{{vm.onetime ? \'inline\':\'none\'}}\"><select ng-model=\"vm.ev.etime\" ng-options=\"x for x in vm.timeDD\"><option value=\"\">{{vm.sp.etime}}</option></select></div></div><div class=\"row\" ng-if=\"vm.weekly\" style=\"margin:0px;\"><div class=\"text-center\"><div class=\"col-xs-12 col-sm-12 col-md-12\" style=\"display:{{vm.weekly ? \'inline\':\'none\'}}\"><label class=\"checkbox-inline\"><input type=\"checkbox\" ng-model=\"vm.ev.mon\" value=\"\">Mon</label> <label class=\"checkbox-inline\"><input type=\"checkbox\" ng-model=\"vm.ev.tue\" value=\"\">Tue</label> <label class=\"checkbox-inline\"><input type=\"checkbox\" ng-model=\"vm.ev.wed\" value=\"\">Wed</label> <label class=\"checkbox-inline\"><input type=\"checkbox\" ng-model=\"vm.ev.thu\" value=\"\">Thu</label> <label class=\"checkbox-inline\"><input type=\"checkbox\" ng-model=\"vm.ev.fri\" value=\"\">Fri</label> <label class=\"checkbox-inline\"><input type=\"checkbox\" ng-model=\"vm.ev.sat\" value=\"\">Sat</label> <label class=\"checkbox-inline\"><input type=\"checkbox\" ng-model=\"vm.ev.sun\" value=\"\">Sun</label></div></div></div><br><div class=\"row\" ng-if=\"vm.weekly\" style=\"margin:0px;\"><div class=\"col-xs-6 col-sm-6 col-md-6 col-lg-6\"><div style=\"display:{{vm.weekly ? \'inline\':\'none\'}}\"><p class=\"text-right\">Start time:</p></div></div><div class=\"col-xs-6 col-sm-6 col-md-6 col-lg-6\"><div style=\"display:{{vm.weekly ? \'inline\':\'none\'}}\"><select ng-model=\"vm.ev.stime2\" ng-options=\"x for x in vm.timeDD\"><option value=\"\">{{vm.ev.stime2}}</option></select></div></div></div><div class=\"row\" ng-if=\"vm.weekly\" style=\"margin:0px;\"><div class=\"col-xs-6 col-sm-6 col-md-6 col-lg-6\"><div style=\"display:{{vm.weekly ? \'inline\':\'none\'}}\"><p class=\"text-right\">End time:</p></div></div><div class=\"col-xs-6 col-sm-6 col-md-6 col-lg-6\"><div style=\"display:{{vm.weekly ? \'inline\':\'none\'}}\"><select ng-model=\"vm.ev.etime2\" ng-options=\"x for x in vm.timeDD\"><option value=\"\">{{vm.ev.etime2}}</option></select></div></div></div><div class=\"row\" style=\"margin:0px;\"><form class=\"form-horizontal col-xs-12 col-sm-12 col-md-6\" role=\"form\" name=\"answerForm\"><div class=\"form-group\" style=\"padding:10px\"><label class=\"control-label\">Neighborhood:</label> <input class=\"form-control\" ng-model=\"vm.ev.cityarea\" bs-typeahead=\"\" bs-options=\"c for c in vm.neighborhoods\" type=\"text\" placeholder=\"{{vm.ev.cityarea}}\"></div><div class=\"form-group\" style=\"padding:10px\"><label class=\"control-label\">Location:</label> <input class=\"form-control\" ng-model=\"vm.ev.location\" type=\"text\" placeholder=\"{{vm.ev.location}}\"></div><div class=\"form-group\" style=\"padding:10px\"><label class=\"control-label\">Website:</label> <input class=\"form-control\" ng-model=\"vm.ev.website\" type=\"text\" placeholder=\"{{vm.ev.website}}\"></div><div class=\"form-group\" style=\"padding:10px\"><label class=\"control-label\">Additional Info:</label> <textarea class=\"form-control\" ng-model=\"vm.ev.addinfo\" placeholder=\"{{vm.ev.addinfo}}\" rows=\"4\" style=\"background-color:{{vm.ev.bc}};color:{{vm.ev.fc}};width:100%\"></textarea></div></form><div class=\"col-xs-12 col-sm-12 col-md-6\"><div class=\"\" ng-show=\"{{vm.type != \'Short-Phrase\'}}\"><img src=\"{{vm.imageURL}}\" alt=\"{{image.errorLoading}}\" style=\"width:100%; max-height:300px\"> <img src=\"../../../assets/images/powered_by_google_on_white.png\"></div><div class=\"form-group text-right\"><button type=\"submit\" class=\"btn btn-primary {{vm.searchDisabled}}\" ng-click=\"vm.callSearchImage()\" ng-show=\"{{vm.type != \'Short-Phrase\'}}\">{{vm.imageCommand}}</button> <button type=\"submit\" class=\"btn btn-primary\" ng-click=\"vm.viewPrev()\" ng-disabled=\"vm.numLinks === 0\" style=\"display:{{vm.imagefunctions}}\">&laquo</button> <button type=\"submit\" class=\"btn btn-primary\" ng-click=\"vm.viewNext()\" ng-disabled=\"vm.numLinks === 0\" style=\"display:{{vm.imagefunctions}}\">&raquo</button> <a style=\"display:{{vm.imagefunctions}}\">{{vm.linkIdx+1}} of {{vm.numLinks}}</a></div><label class=\"checkbox-inline\"><input type=\"checkbox\" ng-change=\"vm.onNoGoodImages(vm.ngi)\" ng-model=\"vm.ngi\" ng-show=\"{{vm.type != \'Short-Phrase\'}}\">No good images were found</label></div></div><br><div class=\"radio\"><label><input type=\"radio\" ng-model=\"vm.nobind\" name=\"optradio\" checked=\"true\">Do not bind event to my account, let anyone make changes.</label></div><div class=\"radio\"><label><input type=\"radio\" ng-model=\"vm.bind\" name=\"optradio\">Bind this event to my account, only I can make changes.</label></div><br><div class=\"row\" style=\"margin:0px;\"><div class=\"form-group text-center\"><button type=\"button\" class=\"btn btn-success\" ng-click=\"vm.goBack()\">Back</button> <button type=\"button\" class=\"btn btn-primary\" ng-click=\"vm.showPreview()\">Preview</button> <button type=\"button\" class=\"btn btn-danger\" ng-click=\"vm.deleteSpecial()\" style=\"display:{{vm.isEdit ? \'inline\':\'none\'}}\">Delete</button></div></div>");
$templateCache.put("app/answer/Partials/answerDetail.html","<div id=\"veil\" ng-hide=\"vm.dataReady\"></div><div id=\"feedLoading\" ng-hide=\"vm.dataReady\"><div style=\"text-align: center\" ng-if=\"!vm.dataReady\"><div class=\"loading-pulse\"></div><p style=\"font-size:large\">loading details...</p></div></div><div ng-if=\"vm.dataReady\"><cat-bar ng-if=\"vm.ranking\" text=\"{{vm.ranking}}\" left-fn=\"vm.goPrev()\" right-fn=\"vm.goNext()\" close-rank=\"vm.closeAnswerDetail()\"></cat-bar><div class=\"row\" style=\"margin:5px;\"><div class=\"col-xs-6 col-sm-3 col-md-2\"><div class=\"text-left\"><small class=\"text-muted\">&nbsp;&nbsp;&nbsp{{vm.answer.views}}&nbspviews</small></div></div><div class=\"col-xs-6 col-sm-9 col-md-10\"><div ng-show=\"{{vm.type == \'Establishment\' || vm.type == \'PersonCust\' || vm.type == \'Event\' }}\" class=\"text-right\"><p style=\"display:{{vm.answer.hasOwner ? \'none\':\'inline\'}};\" class=\"hiw\" ng-click=\"vm.bizRegDialog()\"><u>{{vm.bindtxt}}</u></p><span class=\"glyphicon glyphicon-lock\" style=\"display:{{vm.answer.hasOwner ? \'inline\':\'none\'}}\"></span></div></div></div><answer-header ans=\"{{vm.answer}}\" idx=\"{{vm.idx}}\"></answer-header><div ng-if=\"vm.type == \'Event\'\"><br><div ng-bind-html=\"vm.ehtml\" style=\"{{vm.estyle}}\"><br></div></div><div class=\"col-xs-12\"><div class=\"well-sm\" style=\"background-color:#666666;color:#f8f8ff\"><h3 class=\"sub-header\">Endorsements</h3></div><div class=\"text-right\" style=\"padding-bottom:5px\">Vote:&nbsp<div class=\"btn-group btn-toggle\"><button class=\"btn btn-sm btn-default\" style=\"{{vm.voteonstyle}}\" ng-click=\"vm.votemodeON()\">ON</button> <button class=\"btn btn-sm btn-default\" style=\"{{vm.voteoffstyle}}\" ng-click=\"vm.votemodeOFF()\">OFF</button></div></div><p class=\"text-left\" ng-if=\"vm.type != \'Short-Phrase\'\"><strong>{{vm.answer.name}}</strong> is featured in the following ranks:</p><p style=\"border:2px solid red;padding:5px\" ng-if=\"vm.votemode\"><strong>Endorse!</strong> For each ranking, give a <strong>thumb up</strong> if you <strong>endorse</strong>; a <strong>thumb down</strong> if you <strong>do not recommend</strong>.</p><div class=\"well well-light-ranks col-xs-12 col-sm-6 col-md-4 col-lg-4\" ng-repeat=\"r in vm.answerRanks | orderBy:\'rank\'\"><div class=\"well-sm\" style=\"background-color:#666666;color:#f8f8ff\"><h4 class=\"sub-header\">{{(vm.type == \'Short-Phrase\') ? vm.answer.name : r.title}}</h4></div><p class=\"text-center\" ng-if=\"vm.type == \'Short-Phrase\'\">on {{r.title}}</p><div class=\"row\" ng-if=\"!vm.votemode\"><img style=\"height:50px;width:auto\" class=\"col-xs-3 col-md-1 col-lg-1\" ng-src=\"{{r.icon}}\"><div class=\"col-xs-6\"><p style=\"padding-top:5px\">Ranked <strong>#{{r.rank}}</strong> out of <strong>{{r.answers}}</strong></p></div><a href=\"\" class=\"text-center col-xs-3\" ng-click=\"vm.gotoRank(r)\">Full ranking</a></div><div class=\"row\" ng-if=\"vm.votemode\" style=\"padding-bottom:5px\"><div class=\"col-xs-1 hidden-sm col-md-1 col-lg-1\" style=\"{{vm.sp1}}\"></div><img style=\"height:30px;width:auto\" class=\"col-xs-1 col-md-1 col-lg-1 cursor\" ng-src=\"../../../assets/images/{{r.thumbUp}}\" ng-click=\"vm.UpVote(r)\"> <label style=\"{{vm.sp3}}\" class=\"col-xs-1 col-md-1 col-lg-1\"><font size=\"4\">{{r.upV}}</font></label> <img style=\"height:30px;width:auto\" class=\"col-xs-1 col-md-1 col-lg-1 cursor\" ng-src=\"../../../assets/images/{{r.thumbDn}}\" ng-click=\"vm.DownVote(r)\"> <label style=\"{{vm.sp3}}\" class=\"col-xs-1 col-md-1 col-lg-1\"><font size=\"4\">{{r.downV}}</font></label></div><p style=\"display:{{vm.deleteButton}};color:red\" ng-click=\"vm.deleteThisCatans(r)\">&lt;&lt;Delete&gt;&gt;</p></div><div ng-if=\"vm.isAdmin\"><div class=\"text-left\"><button class=\"btn btn-primary\" ng-click=\"vm.addCatans()\">Add Catans</button></div><div class=\"input-group\" ng-if=\"vm.addctsactive\"><input type=\"text\" class=\"form-control\" ng-model=\"vm.addctsval\" bs-options=\"c for c in vm.addctsopts\" bs-typeahead=\"\"> <span class=\"input-group-btn text-right\"><button class=\"btn btn-success\" type=\"button\" ng-click=\"vm.addcts()\">Add</button></span></div><label class=\"checkbox-inline\" ng-if=\"vm.addctsactive\"><input type=\"checkbox\" ng-model=\"vm.catisdup\">Is Dup</label></div></div><div class=\"container col-xs-12\" ng-if=\"vm.answer.hasranks\"><div class=\"row\" ng-if=\"vm.type != \'Short-Phrase\'\"><div class=\"col-xs-12\"><div class=\"well-sm\" style=\"background-color:#666666;color:#f8f8ff;\"><h3 class=\"sub-header\">The Favorites</h3></div></div></div><div class=\"row\" style=\"padding:0px;margin:0px;border:0px\"><div ng-repeat=\"n in vm.myranks\"><div class=\"container col-xs-3 col-sm-2 col-md-2 col-lg-2\" ng-click=\"vm.gotoRank(n)\" style=\"border-top:3px solid white;border-bottom:3px solid white;background-color:{{n.bc}};color:{{n.fc}};height:{{vm.sm ? \'90px\':\'120px\'}};margin:0px;padding:0px;position:relative\"><h3 class=\"hidden-xs text-center\" style=\"padding:3px; margin:0px; position:absolute; top:50%; left:50%; margin-right:-50%;transform: translate(-50%,-50%)\">{{n.title}}<h4 class=\"hidden-sm hidden-md hidden-lg hidden-xl text-center\" style=\"padding:3px; margin:0px; position:absolute; top:50%; left:50%; margin-right:-50%;transform: translate(-50%,-50%)\">{{n.title}}</h4></h3></div><div class=\"col-xs-3 col-sm-2 col-md-2 col-lg-2\" ng-click=\"vm.gotoRank(n)\" style=\"margin:0px;padding:0px;\"><img ng-src=\"{{n.image}}\" style=\"border-top:3px solid white;border-bottom:3px solid white;width:95%;height:{{vm.sm ? \'90px\':\'120px\'}}\"></div></div></div><div class=\"text-right\"><a href=\"\" ng-if=\"vm.userIsOwner\" ng-click=\"vm.addRankforAnswer()\">Edit Ranking/List</a></div></div><div class=\"col-xs-12\" ng-if=\"true\"><div class=\"row\" ng-if=\"vm.type != \'Short-Phrase\'\"><div class=\"col-xs-12\"><div class=\"well-sm\" style=\"background-color:#666666;color:#f8f8ff;\"><h3 class=\"sub-header\">Photo Gallery</h3></div></div></div><div class=\"text-right\" ng-if=\"vm.type != \'Short-Phrase\'\"><a ng-if=\"!vm.igdemo\" type=\"button\" class=\"btn btn-success btn-block\" ng-click=\"vm.getImages()\" style=\"display:{{vm.showImageGallery == false ? \'inline\':\'none\'}}\">Show Images</a> <a ng-if=\"vm.igdemo\" type=\"button\" class=\"btn btn-default btn-block\" ng-click=\"vm.getImages()\" style=\"background-color:#cc0099;color:#e6e6e6;display:{{vm.showImageGallery == false ? \'inline\':\'none\'}}\">Instagram&nbsp&nbsp <img ng-src=\"/assets/images/1485384923_9_-_Instagram.png\" style=\"width:50px\"></a></div><div style=\"display:{{vm.showImageGallery == true ? \'inline\':\'none\'}}\"><div class=\"col-xs-6 col-sm-4 col-md-3 col-lg-2\" ng-repeat=\"x in vm.images\" style=\"margin:0px;padding:0px;\"><a ng-click=\"vm.selectPhoto($index)\" class=\"thumbnail\"><img ng-src=\"{{x.url}}\" style=\"width:100%;height:120px\"></a></div><div ng-if=\"vm.images.length == 0\">No images in Photo Gallery.</div></div><div class=\"text-right\" ng-if=\"vm.type != \'Short-Phrase\'\"><div ng-if=\"vm.showImageGallery && vm.isLoggedIn && vm.userIsOwner\" style=\"display:{{vm.isLoggedIn ? \'inline\':\'none\'}}\"><blob-upload></blob-upload></div><a ng-if=\"vm.showImageGallery && vm.isLoggedIn && vm.userIsOwner\" type=\"button\" class=\"btn btn-primary pull-right\" ng-click=\"vm.selectInstagramImages()\" style=\"display:{{vm.isLoggedIn ? \'inline\':\'none\'}}\">Select from Instagram Images</a></div></div><div class=\"col-xs-12\" ng-if=\"vm.answer.ispremium\"><div ng-show=\"{{vm.type == \'Establishment\' || vm.type == \'PersonCust\' }}\"><div class=\"well-sm\" style=\"background-color:#666666;color:#f8f8ff\"><h3 class=\"sub-header\">Specials</h3></div><div ng-repeat=\"x in vm.specialsList\"><div ng-bind-html=\"x.html\" style=\"{{x.style}}\"><br></div><p ng-if=\"x.hasimage\" style=\"background-color:lightgray;cursor:pointer\" ng-click=\"vm.showsimage(x)\">{{x.showimage ? \'Hide Flyer\':\'Show Flyer\'}}</p><div class=\"text-middle\" ng-if=\"x.showimage\"><img class=\"displayed\" ng-src=\"{{x.image}}\" style=\"height:{{vm.mxheight}};width:auto;max-width:96%;margin-left:auto;margin-right:auto;\"><br></div></div><div class=\"text-right\"><a href=\"\" ng-if=\"vm.userIsOwner\" ng-click=\"vm.openSpecials()\">Edit Specials</a></div></div></div><div class=\"col-xs-12\"><div ng-show=\"{{vm.type == \'Establishment\' || vm.type == \'PersonCust\' }}\"><div class=\"well-sm\" style=\"background-color:#666666;color:#f8f8ff\"><h3 class=\"sub-header\">How do we do?</h3></div><table class=\"table table-hover cursor\" ng-repeat=\"x in vm.vrowgroups track by $index\"><thead class=\"thead-inverse\"><tr><th colspan=\"5\" class=\"text-center\" style=\"background-color:#d9d9d9;width:100%\">{{x[0].gtitle}}</th></tr></thead><tbody><tr ng-repeat=\"item in x\"><td align=\"middle\" style=\"width:10%\"><img ng-src=\"../../../assets/images/{{item.upImage}}\" style=\"max-height:30px;margin:0px;\" ng-click=\"vm.vrowVoteUp(item)\"></td><td align=\"left\" style=\"width:10%\">{{item.upV}}</td><td align=\"middle\" style=\"width:60%\">{{item.title}}</td><td align=\"right\" style=\"width:10%\">{{item.downV}}</td><td align=\"middle\" style=\"width:10%\"><img ng-src=\"../../../assets/images/{{item.downImage}}\" style=\"max-height:30px;margin:0px;\" ng-click=\"vm.vrowVoteDown(item)\"></td></tr></tbody></table><div class=\"text-right\"><a href=\"\" ng-if=\"vm.userIsOwner&&false\" ng-click=\"vm.editVRows()\">Edit VoteRows</a></div></div></div><div class=\"col-xs-12\" ng-if=\"false\"><div ng-show=\"{{vm.type != \'Establishment\' && vm.type != \'PersonCust\' && vm.type != \'Event\' }}\"><div class=\"well-sm\" style=\"background-color:#666666;color:#f8f8ff\"><h3 class=\"sub-header\">Versus Table</h3></div><table class=\"table table-hover cursor\"><tbody><thead><tr><th align=\"middle\" style=\"width:15%\">Pct (%)</th><th align=\"middle\" style=\"width:60%\">vs. Opponent</th><th align=\"middle\" style=\"width:15%\">Pct (%)</th><th align=\"middle\" style=\"width:10%\">GP</th></tr></thead><tbody><tr ng-repeat=\"x in vm.relativetable | orderBy: \'-Rank\'\"><td align=\"middle\" style=\"width:15%\">{{x.PctF}}</td><td align=\"middle\" style=\"width:60%\">{{x.vsName}}</td><td align=\"middle\" style=\"width:15%\">{{x.PctC}}</td><td align=\"middle\" style=\"width:10%\">{{x.GP}}</td></tr></tbody></tbody></table></div></div><br><div class=\"text-center\"><button ng-click=\"vm.loadComments()\" class=\"btn btn-default\" ng-class=\"vm.cm.commLoaded ? \'disabled\' : \'\'\" style=\"background-color:#e6e6e6;width:100%\">COMMENTS ({{vm.numcom}})</button></div><br><div style=\"display:{{vm.cm.commLoaded ? \'inline\':\'none\'}}\"><div ng-repeat=\"x in vm.cm.comments\"><div class=\"row\"><div class=\"col-xs-12 media\"><div ng-if=\"!x.picture\" class=\"profile-avatar-wrapper media-left\"><div class=\"empty-profile-avatar-wrapper\" style=\"background-color:{{x.bc}};color:{{x.fc}};\">{{x.initials}}</div></div><div ng-if=\"x.picture\" class=\"profile-avatar-wrapper media-left\" align=\"middle\"><img ng-src=\"{{x.picture}}\" class=\"img-responsive img-circle profile-avatar\"></div><div class=\"media-body\">{{x.body}}<br><small style=\"color:#bfbfbf\">{{x.username}} - {{x.date}}&nbsp&nbsp <span class=\"dropdown\"><i type=\"button\" class=\"fa fa-flag dropdown-toggle\" data-toggle=\"dropdown\"></i><ul class=\"dropdown-menu dropdown-menu-right\"><li><a ng-click=\"vm.cmFlag(1)\">Off-Topic</a></li><li><a ng-click=\"vm.cmFlag(2)\">Offensive</a></li><li><a ng-click=\"vm.cmFlag(3)\">Spam</a></li></ul></span></small></div></div></div><br></div><div style=\"display:{{(vm.cm.commLoaded && vm.cm.comments.length == 0 && !vm.isLoggedIn) ? \'inline\':\'none\'}}\"><br><p><small>Nobody has commented yet. Be the first. Log in and leave a comment.</small></p></div><div style=\"display:{{(vm.cm.commLoaded && vm.cm.comments.length > 0 && !vm.isLoggedIn) ? \'inline\':\'none\'}}\"><br><p><small>You must log in to leave a comment.</small></p></div><div style=\"display:{{(vm.cm.commLoaded && vm.isLoggedIn && !vm.commentAllowed) ? \'inline\':\'none\'}}\"><br><p><small>Endorse one or more answers to leave a comment.</small></p></div><div style=\"display:{{(vm.isLoggedIn && vm.commentAllowed) ? \'inline\':\'none\'}}\"><div class=\"media\"><div ng-if=\"!user.picture.data.url\" class=\"profile-avatar-wrapper media-left\"><div class=\"empty-profile-avatar-wrapper\" style=\"background-color:{{x.bc}};color:{{x.fc}};\">{{x.initials}}</div></div><div ng-if=\"user.picture.data.url\" class=\"profile-avatar-wrapper media-left\" align=\"middle\"><img ng-src=\"{{user.picture.data.url}}\" class=\"img-responsive img-circle profile-avatar\"></div><div class=\"media-body\"><textarea class=\"form-control\" ng-model=\"vm.cm.newComment\" placeholder=\"Leave a comment\" style=\"margin-left:0px;margin-right:0px;\"></textarea></div></div><br><div class=\"text-right\"><button ng-click=\"vm.postComment()\" class=\"btn btn-primary\">Post</button></div></div></div><br><div class=\"btn-group\" role=\"group\"><button type=\"button\" ng-click=\"vm.goBack()\" class=\"btn btn-default\">Back</button><div class=\"btn-group\" role=\"group\"><button type=\"button\" class=\"btn btn-default dropdown-toggle\" data-toggle=\"dropdown\">Flag</button><ul class=\"dropdown-menu dropdown-menu-left\" role=\"menu\"><li><a ng-click=\"vm.flagAnswer(1)\">Wrong Category</a></li><li><a ng-click=\"vm.flagAnswer(2)\">No longer active</a></li><li><a ng-click=\"vm.flagAnswer(3)\">Offensive</a></li><li><a ng-click=\"vm.flagAnswer(4)\">Spam</a></li></ul></div><button type=\"button\" ng-click=\"vm.deleteAnswer()\" class=\"btn btn-danger\" style=\"display:{{vm.deleteButton}}\">Delete</button></div><br><br></div>");
$templateCache.put("app/answer/Partials/answerRanksManager.html","<h2>Custom Ranking Manager</h2><br><p class=\"text-left\">You have purchased <strong>{{vm.ranksqty}}</strong> ranks that are currently active.</p><table class=\"table\"><tbody><thead style=\"border-style:none;\"><tr><th>Name</th><th></th><th></th></tr></thead><tr ng-repeat=\"x in vm.ranks\" style=\"cursor:pointer;\"><td ng-if=\"x.used\" style=\"width:80%\">{{x.title}}</td><td ng-if=\"!x.used\" style=\"width:80%;color:#808080\"><i>Empty</i></td><td ng-if=\"x.used\" style=\"width:10%\"><button class=\"btn btn-primary\" ng-click=\"vm.editRank($index)\">Edit</button></td><td ng-if=\"x.used\" style=\"width:10%\"><button class=\"btn btn-danger\" ng-click=\"vm.deleteRank($index)\">Delete</button></td><td ng-if=\"!x.used\" style=\"width:10%\"><button class=\"btn btn-success\" ng-click=\"vm.addRank()\">Add</button></td></tr></tbody></table><p class=\"text-left\">Custom ranks are a great way to engage your audience with your products and services.</p><div class=\"text-center\"><button class=\"btn btn-success\">Purchase additional Ranks</button><div class=\"text-right\"><button class=\"btn btn-default\" ng-click=\"vm.goBack()\">Back</button></div></div>");
$templateCache.put("app/answer/Partials/answerheader.html","<div class=\"container hidden-xs\" ng-if=\"!isShortPhrase\"><div class=\"row\"><div class=\"container col-sm-6 col-md-4 col-lg-4\" style=\"height:{{mxheight}}px;margin:0px;padding:0px;border:0px;\"><div class=\"container-bgbox\"><bg-box bc=\"{{bc}}\" bc2=\"{{bc2}}\" fc=\"{{fc}}\" text=\"{{idx > 0 ? idx + \'. \' + answer.name:answer.name}}\" dir=\"vertical\" w=\"100%\" h=\"120px\"></bg-box></div><div class=\"container\" style=\"width:100%; height:{{mxheight-120}}px;background-color:#d8d8d8;\"><br ng-if=\"!sm\"><strong ng-if=\"answer.location\">Address:</strong> <a ng-if=\"answer.location\" href=\"http://maps.apple.com/maps?q={{answer.location}}\" target=\"_blank\">{{answer.location}}</a><br ng-if=\"answer.location\"><strong ng-if=\"answer.cityarea\">{{(answer.cityarea) ? \'Neighboorhood:\' : \"\"}}</strong> {{(answer.cityarea) ? answer.cityarea : \"\"}}<br style=\"display:{{(answer.cityarea) ? \'inline\' : \'none\'}}\"><strong ng-if=\"answer.phone\">Phone:</strong> <a ng-if=\"answer.phone\" href=\"tel:{{answer.phone}}\">{{answer.phone}}</a><br style=\"display:{{(answer.phone) ? \'inline\' : \'none\'}}\"><strong ng-if=\"answer.website\">Website:</strong> <a ng-if=\"answer.website.indexOf(\'http\') >=0\" href=\"{{answer.website}}\" target=\"_blank\">{{answer.website}}</a> <a ng-if=\"answer.website.indexOf(\'http\') == -1\" href=\"http://{{answer.website}}\" target=\"_blank\">{{answer.website}}</a><br ng-if=\"answer.website\"><strong ng-if=\"answer.email\">{{(answer.email) ? \'Email:\' : \"\"}}</strong> {{(answer.email) ? answer.email : \"\"}}<br style=\"display:{{(answer.email) ? \'inline\' : \'none\'}}\"><i style=\"display:{{hrset ? \'inline\':\'none\'}}\">{{hourstr}}</i><div class=\"text-center answer_info_buttons\"><br><a type=\"button\" class=\"btn btn-default\" style=\"vertical-align:middle;color:#0059b3;border-color:#0059b3;\" ng-if=\"!answer.hasOwner || userIsOwner\" ng-click=\"editAnswer()\" target=\"_blank\">Edit&nbsp&nbsp<span class=\"fa fa-pencil\"></span></a><a type=\"button\" class=\"btn btn-default\" style=\"vertical-align:middle;color:#0059b3;border-color:#0059b3;\" ng-if=\"isMobile && answer.phone\" href=\"tel:{{answer.phone}}\" target=\"_blank\">Call&nbsp&nbsp<span class=\"fa fa-phone\"></span></a> <a type=\"button\" class=\"btn btn-default\" style=\"vertical-align:middle;color:#0059b3;border-color:#0059b3;\" ng-if=\"answer.lat && answer.lng\" href=\"http://maps.apple.com/maps?q={{answer.lat}}, {{answer.lng}}\" target=\"_blank\">Directions&nbsp&nbsp<span class=\"fa fa-map-marker\"></span></a> <a type=\"button\" class=\"btn btn-default hidden-md hidden-lg hidden-xl\" style=\"vertical-align:middle;color:#0059b3;border-color:#0059b3;\" ng-if=\"answer.lat && answer.lng\" ng-click=\"toggleimgmode()\">{{imgmode}}&nbsp&nbsp<span class=\"{{imgmodeicon}}\"></span></a></div></div></div><div class=\"col-sm-6 col-md-4 col-lg-4\" style=\"margin:0px;padding:0px;border:0px;\"><img class=\"displayed\" ng-src=\"{{answer.imageurl}}\" alt=\"Moustiers Sainte Marie\" style=\"height:{{mxheight}}px;width:100%;margin-left:auto;margin-right:auto;\" ng-click=\"showUrl()\" ng-if=\"modeIsImage\"> <img class=\"displayed\" ng-src=\"https://maps.googleapis.com/maps/api/staticmap?center={{answer.location}}&zoom=13&size={{width2}}x{{mxheight}}&maptype=roadmap &markers=color:red%7Clabel:%7C{{answer.lat}},{{answer.lng}}&key=AIzaSyDKXsql-P8czb4nAQMXjkFpm_I5HqKsQpo\" ng-if=\"!modeIsImage\"></div><div class=\"hidden-sm col-md-4 col-lg-4\" style=\"margin:0px;padding:0px;border:0px;\"><img class=\"displayed\" ng-src=\"https://maps.googleapis.com/maps/api/staticmap?center={{answer.location}}&zoom=13&size={{width3}}x{{mxheight}}&maptype=roadmap &markers=color:red%7Clabel:%7C{{answer.lat}},{{answer.lng}}&key=AIzaSyDKXsql-P8czb4nAQMXjkFpm_I5HqKsQpo\" ng-if=\"hasMap\"><div class=\"container\" style=\"background-color:#d8d8d8;width:{{width3}}px;height:{{mxheight}}px;margin-left:auto;margin-right:auto;\" ng-if=\"!hasMap\"></div></div></div></div><div class=\"container hidden-sm hidden-md hidden-lg hidden-xl\" ng-if=\"!isShortPhrase\"><div class=\"container-bgbox\"><bg-box bc=\"{{bc}}\" bc2=\"{{bc2}}\" fc=\"{{fc}}\" text=\"{{idx > 0 ? idx + \'. \' + answer.name:answer.name}}\" dir=\"vertical\" w=\"100%\" h=\"75px\"></bg-box></div><div class=\"container\" style=\"margin:0px;padding:0px;border:0px;\"><img class=\"displayed\" ng-src=\"{{answer.imageurl}}\" alt=\"Moustiers Sainte Marie\" style=\"height:auto;width:100%;\" ng-click=\"showUrl()\" ng-if=\"modeIsImage\"> <img class=\"displayed\" ng-src=\"https://maps.googleapis.com/maps/api/staticmap?center={{answer.location}}&zoom=13&size={{width}}x{{mxheight}}&maptype=roadmap &markers=color:red%7Clabel:%7C{{answer.lat}},{{answer.lng}}&key=AIzaSyDKXsql-P8czb4nAQMXjkFpm_I5HqKsQpo\" ng-if=\"!modeIsImage\"></div></div><div class=\"container-answer\" style=\"width:100%;height:auto\" ng-if=\"isShortPhrase\"><br><h2 style=\"text-align:center\"><strong>{{answer.name}}</strong></h2><br><h4 style=\"text-align:center\">{{answer.addinfo}}</h4></div><div class=\"answer_info row\" ng-if=\"!isShortPhrase&&!isEvent\" style=\"padding:0px;margin:0px;border:0px;\"><div class=\"container hidden-sm hidden-md hidden-lg hidden-xl\"><br ng-if=\"answer.location\"><strong ng-if=\"answer.location\">Address:</strong> <a ng-if=\"answer.location\" href=\"http://maps.apple.com/maps?q={{answer.location}}\" target=\"_blank\">{{answer.location}}</a><br ng-if=\"answer.location\"><div class=\"row\"><div class=\"col-xs-9\"><strong ng-if=\"answer.cityarea\">{{(answer.cityarea) ? \'Neighboorhood:\' : \"\"}}</strong> {{(answer.cityarea) ? answer.cityarea : \"\"}}<br style=\"display:{{(answer.cityarea) ? \'inline\' : \'none\'}}\"><strong ng-if=\"answer.phone\">Phone:</strong> <a ng-if=\"answer.phone\" href=\"tel:{{answer.phone}}\">{{answer.phone}}</a><br style=\"display:{{(answer.phone) ? \'inline\' : \'none\'}}\"><strong ng-if=\"answer.website\">Website:</strong> <a ng-if=\"answer.website.indexOf(\'http\') >=0\" href=\"{{answer.website}}\" target=\"_blank\">{{answer.website}}</a> <a ng-if=\"answer.website.indexOf(\'http\') == -1\" href=\"http://{{answer.website}}\" target=\"_blank\">{{answer.website}}</a><br ng-if=\"answer.website\"><strong ng-if=\"answer.email\">{{(answer.email) ? \'Email:\' : \"\"}}</strong> {{(answer.email) ? answer.email : \"\"}}<br style=\"display:{{(answer.email) ? \'inline\' : \'none\'}}\"></div><div class=\"col-xs-3 text-left\"><a type=\"button\" class=\"btn btn-default\" style=\"vertical-align:middle;color:#0059b3;border-color:#0059b3;margin-top:15px;\" ng-if=\"!answer.hasOwner || userIsOwner\" ng-click=\"editAnswer()\" target=\"_blank\">&nbsp&nbsp<span class=\"fa fa-pencil\"></span></a></div></div><i style=\"display:{{hrset ? \'inline\':\'none\'}}\">{{hourstr}}</i></div><div class=\"hidden-sm hidden-md hidden-lg hidden-xl text-center answer_info_buttons\" style=\"padding-top:10px;\"><a type=\"button\" class=\"btn btn-default\" style=\"vertical-align:middle;color:#0059b3;border-color:#0059b3;\" ng-if=\"isMobile && answer.phone\" href=\"tel:{{answer.phone}}\" target=\"_blank\">Call&nbsp&nbsp<span class=\"fa fa-phone\"></span></a> <a type=\"button\" class=\"btn btn-default\" style=\"vertical-align:middle;color:#0059b3;border-color:#0059b3;\" ng-if=\"answer.lat && answer.lng\" href=\"http://maps.apple.com/maps?q={{answer.lat}}, {{answer.lng}}\" target=\"_blank\">Directions&nbsp&nbsp<span class=\"fa fa-map-marker\"></span></a> <a type=\"button\" class=\"btn btn-default\" style=\"vertical-align:middle;color:#0059b3;border-color:#0059b3;\" ng-if=\"answer.lat && answer.lng\" ng-click=\"toggleimgmode()\">{{imgmode}}&nbsp&nbsp<span class=\"{{imgmodeicon}}\"></span></a></div></div><div style=\"padding:5px\"></div><div ng-if=\"!isShortPhrase && !isEvent\" style=\"display:{{answer.addinfo ? \'inline\':\'none\'}};\"><span>{{answer.addinfo_teaser}}</span> <span ng-show=\"completeinfo\">{{answer.addinfo_complete}}</span> <span ng-if=\"answer.addinfo.length > 0\" ng-click=\"showcomplete()\" style=\"background-color:lightgray;cursor:pointer\">{{moretext}}</span><br style=\"display:{{answer.addinfo ? \'inline\':\'none\'}}\"></div>");
$templateCache.put("app/answer/Partials/blobupload.html","<button type=\"file\" ngf-select=\"uploadFiles($file, $invalidFiles)\" accept=\"image/*\" ngf-max-size=\"3MB\" class=\"btn btn-primary text-center\" ngf-resize=\"{width: 100, height: 100, quality: .1, type: \'image/jpeg\', ratio: \'19:11\', centerCrop: true, pattern=\'.jpg\', restoreExif: false}\" role=\"button\" ngf-validate-after-resize=\"boolean\" ngf-model-invalid=\"invalidFiles\">Upload New Image</button><br><br><div style=\"font:smaller\">{{errFile.name}} {{errorMsg}}</div><div style=\"font:smaller\"><span class=\"progress\" ng-show=\"f.progress >= 0\"><div style=\"width:{{f.progress}}%\" ng-bind=\"f.progress + \'%\'\"></div></span></div><br>");
$templateCache.put("app/answer/Partials/catbar.html","<div class=\"container\"><div class=\"row\"><div class=\"container-bgbox col-xs-1\"><bg-box bc=\"{{bc}}\" bc2=\"{{bc}}\" fc=\"{{fc}}\" text=\"<\" dir=\"horizontal\" w=\"100%\" h=\"{{ht}}px\" ng-click=\"goPrev()\"></bg-box></div><div class=\"container-bgbox col-xs-10\"><bg-box bc=\"{{bc}}\" bc2=\"{{bc2}}\" fc=\"{{fc}}\" text=\"{{text}}\" dir=\"horizontal\" w=\"100%\" h=\"{{ht}}px\" ng-click=\"selRank()\"></bg-box></div><div class=\"container-bgbox col-xs-1\"><bg-box bc=\"{{bc2}}\" bc2=\"{{bc2}}\" fc=\"{{fc}}\" text=\">\" dir=\"horizontal\" w=\"100%\" h=\"{{ht}}px\" ng-click=\"goNext()\"></bg-box></div></div></div>");
$templateCache.put("app/answer/Partials/editAnswer.html","<div class=\"well-answer\" ng-if=\"vm.nsm\"><h2 class=\"sub-header\">{{vm.answer.name}} <span class=\"nomargin\"><button type=\"button\" class=\"glyphicon glyphicon-remove pull-right\" style=\"margin:0px;padding:0px;border:0px;background-color:#b3b3b3;color:#4d4d4d;font-size:medium;\" ng-click=\"vm.closeRank()\"></button></span></h2></div><div class=\"well-answer\" ng-if=\"vm.sm\"><h3 class=\"sub-header\">{{vm.answer.name}} <span class=\"nomargin\"><button type=\"button\" class=\"glyphicon glyphicon-remove pull-right\" style=\"margin:0px;padding:0px;border:0px;background-color:#b3b3b3;color:#4d4d4d;font-size:medium;\" ng-click=\"vm.closeRank()\"></button></span></h3></div><div class=\"row\" style=\"margin:0px\"><div class=\"col-sm-6\"><h3>Edit Answer Profile</h3></div><div class=\"col-sm-6 text-right\"><p class=\"hiw\" ng-click=\"vm.showHowItWorksDialog()\"><u>How it Works</u></p></div></div><br><div class=\"row\" style=\"margin:0px\"><div class=\"col-sm-12 col-md-6\"><div class=\"\" ng-show=\"{{vm.type != \'Short-Phrase\'}}\"><img class=\"displayed-uc\" src=\"{{vm.imageURL}}\" alt=\"{{image.errorLoading}}\" style=\"width:100%; max-height:300px\" ng-show=\"{{vm.type != \'Short-Phrase\'}}\"> <img src=\"../../../assets/images/powered_by_google_on_white.png\" ng-if=\"vm.type!=\'PersonCust\' && !vm.userIsOwner\"></div><div class=\"container-answer\" style=\"width:100%; max-height:300px;\" ng-show=\"{{vm.type == \'Short-Phrase\'}}\"><br><h2 style=\"text-align:center\"><strong>{{vm.answer.name}}</strong></h2><br><h4 style=\"text-align:center\">{{vm.answer.addinfo}}</h4></div><br><div ng-if=\"vm.userIsOwner\" style=\"display:{{vm.userIsOwner ? \'inline\':\'none\'}}\"><blob-upload></blob-upload></div><div style=\"display:{{vm.userIsOwner ? \'none\':\'inline\'}}\" ng-if=\"vm.type!=\'PersonCust\'\"><button type=\"submit\" class=\"btn btn-primary\" ng-click=\"vm.editImage()\">{{vm.imageCommand}}</button> <button type=\"submit\" class=\"btn btn-primary\" ng-click=\"vm.viewPrev()\" style=\"display:{{vm.imagefunctions}}\">&laquo</button> <button type=\"submit\" class=\"btn btn-primary\" ng-click=\"vm.viewNext()\" style=\"display:{{vm.imagefunctions}}\">&raquo</button> <a style=\"display:{{vm.imagefunctions}}\">{{vm.linkIdx+1}} of {{vm.numLinks}}</a> <button type=\"submit\" class=\"btn btn-success\" ng-click=\"vm.selectImage()\" style=\"display:{{vm.imagefunctions}}\">Select</button></div><br><label class=\"checkbox-inline\" ng-show=\"{{vm.type != \'Short-Phrase\'}}\"><input type=\"checkbox\" ng-change=\"vm.onNoGoodImages(vm.ngi)\" ng-model=\"vm.ngi\">No good images were found</label></div><form class=\"form-horizontal col-sm-12 col-md-6\" role=\"form\" name=\"answerForm\" ng-repeat=\"x in vm.fields\"><div style=\"display:{{x.field!=\'addinfo\' ? \'inline\':\'none\'}}\" ng-hide=\"{{x.onlybyowner && !vm.userIsOwner}}\"><label class=\"control-label capitalize\">{{x.label}}:</label><div class=\"input-group\"><input type=\"text\" class=\"form-control\" ng-model=\"x.val\" bs-options=\"{{x.opts}}\" bs-typeahead=\"\" placeholder=\"{{x.cval}}\"> <span class=\"input-group-btn text-right\"><button class=\"btn btn-primary\" type=\"button\" ng-click=\"vm.editField(x)\">Edit</button></span></div></div><div class=\"input-group\" style=\"display:{{x.field==\'addinfo\' ? \'inline\':\'none\'}}\" ng-hide=\"{{!vm.access && (vm.type == \'PersonCust\')}}\"><label class=\"control-label capitalize\">{{x.label}}:</label> <textarea id=\"textarea1\" class=\"form-control\" ng-model=\"x.val\" placeholder=\"{{x.cval}}\" rows=\"5\" ng-model-options=\"{debounce: 2500}\">\n            </textarea><br><br><span class=\"input-group-btn text-right\"><button ng-click=\"vm.getWiki()\" class=\"btn btn-primary\" style=\"background-color:#595959;border-color:gray;margin-right:10px\" ng-if=\"vm.type == \'Person\'\">Get from Wikipedia</button> <button class=\"btn btn-primary\" type=\"button\" ng-click=\"vm.editField(x)\">Edit</button></span></div></form></div><br><div class=\"well well-light-edit\" ng-repeat=\"x in vm.edits\"><div ng-if=\"x.field != \'addinfo\'\"><p><strong>{{x.username}}</strong> has edited the <strong class=\"capitalize\"><em>{{x.field}}</em></strong> of <strong><em>{{x.name}}</em></strong> to <strong><em>{{x.nval}}</em></strong>.</p></div><div ng-if=\"x.field == \'addinfo\'\"><p><strong>{{x.username}}</strong> has edited the information of <strong><em>{{x.name}}</em></strong> to:<br><br>{{x.nval}}.</p></div><img src=\"{{x.imageURL}}\" class=\"displayed\" style=\"height:150px;display:{{x.display}}\"><div class=\"row form-group\"><div class=\"text-center\"><label>{{x.upV}}</label> <label></label> <button class=\"btn btn-primary {{x.agree}}\" ng-click=\"vm.editAgree(x, $index)\">Agree</button> <button type=\"submit\" class=\"btn btn-primary {{x.disagree}}\" ng-click=\"vm.editDisagree(x, $index)\">Disagree</button> <label></label> <label>{{x.downV}}</label></div></div></div><div ng-if=\"vm.sm && vm.userIsOwner && vm.type == \'Establishment\'\"><div class=\"text-center\"><label>Service Hours</label></div><br><div ng-repeat=\"x in vm.openhours\"><div class=\"container-hours\"><div class=\"row\"><div class=\"col-xs-6 col-sm-6 col-md-2\"><p>{{x.day}}:</p></div><div class=\"col-xs-6 col-sm-6 col-md-2\"><select ng-model=\"x.opn\" ng-change=\"vm.hoursChanged()\" ng-options=\"n for n in vm.openOptions\"></select></div></div><div class=\"row\"><div class=\"col-xs-2 col-sm-2 col-md-2\" style=\"display:{{x.opn==\'OPEN\' ? \'inline\': \'none\'}}\"><p class=\"text-right\">From:</p></div><div class=\"col-xs-4 col-sm-4 col-md-2\" style=\"display:{{x.opn==\'OPEN\' ? \'inline\': \'none\'}}\"><select ng-model=\"x.st\" ng-change=\"vm.hoursChanged()\" ng-options=\"t for t in vm.timeDD\"></select></div><div class=\"col-xs-2 col-sm-2 col-md-2\" style=\"display:{{x.opn==\'OPEN\' ? \'inline\': \'none\'}}\"><p class=\"text-right\">To:</p></div><div class=\"col-xs-4 col-sm-4 col-md-2\" style=\"display:{{x.opn==\'OPEN\' ? \'inline\': \'none\'}}\"><select ng-model=\"x.ct\" ng-change=\"vm.hoursChanged()\" ng-options=\"t for t in vm.timeDD\"></select></div></div></div><br></div></div><div ng-if=\"vm.nsm && vm.userIsOwner && vm.type == \'Establishment\'\"><div class=\"container\" style=\"background-color:#e6e6e6;padding-right:50px;padding-left:10px;padding-top:10px;padding-bottom:0px;\"><div class=\"text-center\"><label>Service Hours</label></div><br><div class=\"container\" ng-repeat=\"x in vm.openhours\"><div class=\"row\"><div class=\"col-xs-2 col-sm-2 col-md-2\"><p>{{x.day}}:</p></div><div class=\"col-xs-2 col-sm-2 col-md-2\"><select ng-model=\"x.opn\" ng-change=\"vm.hoursChanged()\" ng-options=\"n for n in vm.openOptions\"></select></div><div class=\"col-xs-2 col-sm-2 col-md-2\" style=\"display:{{x.opn==\'OPEN\' ? \'inline\': \'none\'}}\"><p class=\"text-right\">From:</p></div><div class=\"col-xs-2 col-sm-2 col-md-2\" style=\"display:{{x.opn==\'OPEN\' ? \'inline\': \'none\'}}\"><select ng-model=\"x.st\" ng-change=\"vm.hoursChanged()\" ng-options=\"t for t in vm.timeDD\"></select></div><div class=\"col-xs-2 col-sm-2 col-md-2\" style=\"display:{{x.opn==\'OPEN\' ? \'inline\': \'none\'}}\"><p class=\"text-right\">To:</p></div><div class=\"col-xs-2 col-sm-2 col-md-2\" style=\"display:{{x.opn==\'OPEN\' ? \'inline\': \'none\'}}\"><select ng-model=\"x.ct\" ng-change=\"vm.hoursChanged()\" ng-options=\"t for t in vm.timeDD\"></select></div></div><br></div></div></div><div class=\"text-right\" ng-if=\"vm.userIsOwner && vm.type == \'Establishment\'\"><a ng-click=\"vm.updateHours()\" class=\"btn btn-primary {{vm.updateHoursEn}}\">Update Hours</a></div><br><div class=\"text-center\"><a ng-click=\"vm.answerDetail()\" class=\"btn btn-success\">Back</a></div><br>");
$templateCache.put("app/common/partials/bgbox.html","<div ng-if=\"dirHor\"><div class=\"container\" style=\"color:{{fc}};margin:0px;padding:0px;border:0px;position:relative;width:{{w}};height:{{h}}; background: {{bc}}; background: -webkit-linear-gradient(left, {{bc}}, {{bc2}}); background: -o-linear-gradient(right, {{bc}}, {{bc2}}); background: -moz-linear-gradient(right, {{bc}}, {{bc2}}); background: linear-gradient(to right, {{bc}}, {{bc2}});\"><h2 class=\"hidden-xs text-center\" style=\"padding:3px; margin:0px; position:absolute; top:50%; left:50%; margin-right:-50%;transform: translate(-50%,-50%)\">{{text}}</h2><h3 class=\"hidden-sm hidden-md hidden-lg hidden-xl text-center\" style=\"padding:3px; margin:0px; position:absolute; top:50%; left:50%; margin-right:-50%;transform: translate(-50%,-50%)\">{{text}}</h3></div></div><div ng-if=\"dirVer\"><div class=\"container\" style=\"color:{{fc}};margin:0px;padding:0px;border:0px;position:relative;width:{{w}};height:{{h}}; background: {{bc}}; background: -webkit-linear-gradient({{bc}}, {{bc2}}); background: -o-linear-gradient({{bc}}, {{bc2}}); background: -moz-linear-gradient({{bc}}, {{bc2}}); background: linear-gradient({{bc}}, {{bc2}});\"><h2 class=\"hidden-xs text-center\" style=\"padding:3px; margin:0px; position:absolute; top:50%; left:50%; margin-right:-50%;transform: translate(-50%,-50%)\">{{text}}</h2><h3 class=\"hidden-sm hidden-md hidden-lg hidden-xl text-center\" style=\"padding:3px; margin:0px; position:absolute; top:50%; left:50%; margin-right:-50%;transform: translate(-50%,-50%)\">{{text}}</h3></div></div>");
$templateCache.put("app/customer/Partials/customer.html","<div ui-view=\"navbar\"></div><br><h2>Select business you wish to manage</h2><div ng-repeat=\"x in vm.answers\"><label><input type=\"radio\" name=\"businessradio\" ng-click=\"vm.selAnswer(x)\">&nbsp;&nbsp;{{x.name}}, {{x.location}}, {{x.cityarea}}</label></div><br><div class=\"text-center\"><div class=\"btn-group col-sm-6 col-md-6\"><button class=\"btn btn-success {{vm.loadMainPhoto}}\" ng-click=\"vm.loadMainPhoto()\">Main Photo</button> <button class=\"btn btn-primary {{vm.loadSpecials}}\" ng-click=\"vm.loadSpecials()\">Specials</button> <button class=\"btn btn-danger {{vm.loadPhotoGallery}}\" ng-click=\"vm.loadPhotoGallery()\">Photo Gallery</button></div></div><br><br><div ui-view=\"\"></div><br><br><footer class=\"footer\"><div class=\"container\"><p class=\"text-muted\">Rank-X is property of Rank-X LLC. San Diego, CA - 2016</p></div></footer>");
$templateCache.put("app/customer/Partials/editspecial.html","<div class=\"container\"><div class=\"well-sm\"><h3 class=\"sub-header\">{{vm.header}} <span class=\"nomargin\"><button type=\"button\" class=\"btn btn-default pull-right\" style=\"vertical-align:middle;\" ng-click=\"vm.closeRank()\"><span class=\"glyphicon glyphicon-remove\" style=\"padding-top:0px;padding-bottom:0px;\" aria-hidden=\"true\"></span></button></span></h3></div></div><h3>{{ vm.isEdit ? \'Edit Special\':\'Add Special\'}}</h3><br><div class=\"well\"><div class=\"row\"><div class=\"col-xs-6 col-sm-4 col-md-4\"><p class=\"text-right\">Specials Title:</p></div><div class=\"col-xs-12 col-sm-4 col-md-4\"><input class=\"form-control\" ng-model=\"vm.sp.stitle\" type=\"text\" placeholder=\"Special Banner\" ng-change=\"vm.displayCharLength()\" maxlength=\"25\" style=\"background-color:{{vm.sp.bc}};color:{{vm.sp.fc}}\"></div><div class=\"col-xs-8 hidden-sm hidden-md hidden-lg hidden-xl\"></div><div class=\"col-xs-6 col-sm-4 col-md-4\"><p class=\"text-left\">{{vm.char}} chars left</p></div></div><br><div class=\"row\"><div class=\"hidden-xs col-sm-2 col-md-2 col-lg-2\"></div><div class=\"col-xs-6 col-sm-2 col-md-2 col-lg-2\"><p class=\"text-right\">Background Color</p></div><div class=\"col-xs-6 col-sm-2 col-md-2 col-lg-2\"><color-picker ng-model=\"vm.sp.bc\" color-picker-swatch=\"true\" color-picker-swatch-pos=\"\'left\'\" color-picker-swatch-bootstrap=\"true\" color-picker-swatch-only=\"true\"></color-picker></div><div class=\"col-xs-6 col-sm-2 col-md-2 col-lg-2\"><p class=\"text-right\">Font Color</p></div><div class=\"col-xs-6 col-sm-2 col-md-2 col-lg-2\"><color-picker ng-model=\"vm.sp.fc\" color-picker-swatch=\"true\" color-picker-swatch-pos=\"\'left\'\" color-picker-swatch-bootstrap=\"true\" color-picker-swatch-only=\"true\"></color-picker></div><div class=\"hidden-xs col-sm-2 col-md-2 col-lg-2\"></div></div><p class=\"text-left\">Frequency</p><div class=\"btn-group col-sm-6 col-md-6\"><button class=\"btn btn-primary {{vm.sp.freq == \'onetime\'? \'active\':\'\'}}\" ng-click=\"vm.frequencySel(1)\">One-Time</button> <button class=\"btn btn-primary {{vm.sp.freq == \'weekly\'? \'active\':\'\'}}\" ng-click=\"vm.frequencySel(2)\">Weekly</button></div><br><br><br><div class=\"row\"><div class=\"col-xs-6 col-sm-3 col-md-3 col-lg-3\"><div ng-if=\"vm.onetime\"><p class=\"text-right\">Start date:</p></div></div><div class=\"col-xs-6 col-sm-3 col-md-3 col-lg-3\"><div ng-if=\"vm.onetime\"><datepicker date-format=\"EEE MMM d y\" date-year-title=\"selected title------\"><input ng-model=\"vm.sp.sdate\" type=\"text\"></datepicker></div></div></div><div class=\"row\"><div class=\"col-xs-6 col-sm-3 col-md-3 col-lg-3\"><div ng-if=\"vm.onetime\"><p class=\"text-right\">Start time:</p></div></div><div class=\"col-xs-6 col-sm-3 col-md-3 col-lg-3\"><div ng-if=\"vm.onetime\"><select ng-model=\"vm.sp.stime\" ng-options=\"x for x in vm.timeDD\"><option value=\"\">{{vm.sp.stime}}</option></select></div></div></div><div class=\"row\"><div class=\"col-xs-6 col-sm-3 col-md-3 col-lg-3\"><div ng-if=\"vm.onetime\"><p class=\"text-right\">End date:</p></div></div><div class=\"col-xs-4 col-sm-3 col-md-3 col-lg-3\" ng-if=\"vm.onetime\"><datepicker date-format=\"EEE MMM d y\" date-year-title=\"selected title------\"><input ng-model=\"vm.sp.edate\" type=\"text\"></datepicker></div></div><div class=\"row\"><div class=\"col-xs-6 col-sm-3 col-md-3 col-lg-3\" ng-if=\"vm.onetime\"><p class=\"text-right\">End time:</p></div><div class=\"col-xs-6 col-sm-3 col-md-3 col-lg-3\" ng-if=\"vm.onetime\"><select ng-model=\"vm.sp.etime\" ng-options=\"x for x in vm.timeDD\"><option value=\"\">{{vm.sp.etime}}</option></select></div></div><div class=\"row\"><div class=\"text-center\"><div class=\"col-xs-12 col-sm-12 col-md-12\" ng-if=\"vm.weekly\"><label class=\"checkbox-inline\"><input type=\"checkbox\" ng-model=\"vm.sp.mon\" value=\"\">Mon</label> <label class=\"checkbox-inline\"><input type=\"checkbox\" ng-model=\"vm.sp.tue\" value=\"\">Tue</label> <label class=\"checkbox-inline\"><input type=\"checkbox\" ng-model=\"vm.sp.wed\" value=\"\">Wed</label> <label class=\"checkbox-inline\"><input type=\"checkbox\" ng-model=\"vm.sp.thu\" value=\"\">Thu</label> <label class=\"checkbox-inline\"><input type=\"checkbox\" ng-model=\"vm.sp.fri\" value=\"\">Fri</label> <label class=\"checkbox-inline\"><input type=\"checkbox\" ng-model=\"vm.sp.sat\" value=\"\">Sat</label> <label class=\"checkbox-inline\"><input type=\"checkbox\" ng-model=\"vm.sp.sun\" value=\"\">Sun</label></div></div></div><br><div class=\"row\"><div class=\"col-xs-6 col-sm-6 col-md-6 col-lg-6\"><div ng-if=\"vm.weekly\"><p class=\"text-right\">Start time:</p></div></div><div class=\"col-xs-6 col-sm-6 col-md-6 col-lg-6\"><div ng-if=\"vm.weekly\"><select ng-model=\"vm.sp.stime2\" ng-options=\"x for x in vm.timeDD\"><option value=\"\">{{vm.sp.stime2}}</option></select></div></div></div><div class=\"row\"><div class=\"col-xs-6 col-sm-6 col-md-6 col-lg-6\"><div ng-if=\"vm.weekly\"><p class=\"text-right\">End time:</p></div></div><div class=\"col-xs-6 col-sm-6 col-md-6 col-lg-6\"><div ng-if=\"vm.weekly\"><select ng-model=\"vm.sp.etime2\" ng-options=\"x for x in vm.timeDD\"><option value=\"\">{{vm.sp.etime2}}</option></select></div></div></div><br><div class=\"row\"><div class=\"col-sm-0 col-md-3 col-lg-3\"></div><div class=\"container col-sm-12 col-md-6 col-lg-6\"><p>Event Details</p><textarea class=\"form-control\" ng-model=\"vm.sp.details\" placeholder=\"{{x.label}}\" rows=\"4\" style=\"background-color:{{vm.sp.bc}};color:{{vm.sp.fc}};width:100%\"></textarea></div><div class=\"col-sm-0 col-md-3 col-lg-3\"></div><br></div><div class=\"row\"><div class=\"col-sm-0 col-md-3 col-lg-3\"></div><div class=\"container col-sm-12 col-md-6 col-lg-6\"><div class=\"\"><p>Event Image</p><img src=\"{{vm.imageURL}}\" alt=\"{{image.errorLoading}}\" style=\"width:100%; max-height:300px\"><div ng-if=\"vm.userIsOwner\"><blob-upload></blob-upload></div></div></div><div class=\"col-sm-0 col-md-3 col-lg-3\"></div><br></div><br><div class=\"form-group text-center\"><button type=\"button\" class=\"btn btn-success\" ng-click=\"vm.goBack()\">Back</button> <button type=\"button\" class=\"btn btn-primary\" ng-click=\"vm.showPreview()\">Preview</button> <button type=\"button\" class=\"btn btn-danger\" ng-click=\"vm.deleteSpecial()\" style=\"display:{{vm.isEdit ? \'inline\':\'none\'}}\">Delete</button></div></div>");
$templateCache.put("app/customer/Partials/editvrows.html","<div class=\"container\"><div class=\"well-sm\"><h3 class=\"sub-header\">{{vm.header}} <span class=\"nomargin\"><button type=\"button\" class=\"btn btn-default pull-right\" style=\"vertical-align:middle;\" ng-click=\"vm.closeRank()\"><span class=\"glyphicon glyphicon-remove\" style=\"padding-top:0px;padding-bottom:0px;\" aria-hidden=\"true\"></span></button></span></h3></div></div><div ng-repeat=\"x in vm.vrows track by $index\"><div style=\"display:{{x.shdr ? \'inline\':\'none\'}}\"><br></div><div class=\"row\"><div style=\"display:{{x.shdr ? \'inline\':\'none\'}}\"><div class=\"col-xs-10\" style=\"background-color:gray;color:white;\"><p>{{x.gtitle}}</p></div><div class=\"col-xs-2\"><button type=\"button\" class=\"btn btn-default\" ng-click=\"vm.editVRowGroupDiag(x)\"><span class=\"glyphicon glyphicon-pencil\" aria-hidden=\"true\"></span></button></div></div></div><div style=\"display:{{x.title != \'-\' ? \'inline\':\'none\'}}\"><div class=\"row\"><div class=\"col-xs-10\" style=\"background-color:#d9d9d9;padding-top:2px;padding-bottom:2px;\">{{x.title}}</div><div class=\"col-xs-2\"><div class=\"btn-group\"><button type=\"button\" class=\"btn btn-default\" ng-click=\"vm.deleteVRowDiag(x)\"><span class=\"glyphicon glyphicon-remove\" aria-hidden=\"true\"></span></button></div></div></div></div><div style=\"display:{{x.saddr ? \'inline\':\'none\'}}\"><div class=\"row\"><div class=\"col-xs-10\"><div class=\"text-right\"><button type=\"button\" class=\"btn btn-default\" ng-click=\"vm.addVRowDiag(x)\">Add Vote Row</button></div></div><div class=\"col-xs-2\"></div></div></div></div><br><div class=\"text-left\"><button type=\"button\" class=\"btn btn-default\" ng-click=\"vm.addVRowGroupDiag()\">Add Group</button></div><div class=\"text-right\"><button type=\"button\" class=\"btn btn-success\" ng-click=\"vm.closeRank()\">Go Back</button></div>");
$templateCache.put("app/customer/Partials/mainphoto.html","<h1>Main Photo</h1>");
$templateCache.put("app/customer/Partials/photogallery.html","<h1>Photo Gallery</h1>");
$templateCache.put("app/customer/Partials/specials.html","<div id=\"veil\" ng-hide=\"vm.dataReady\"></div><div id=\"feedLoading\" ng-hide=\"vm.dataReady\"><div style=\"text-align: center\" ng-if=\"!vm.dataReady\"><div class=\"loading-pulse\"></div><p style=\"font-size:large\">loading specials...</p></div></div><div ng-if=\"vm.dataReady\"><h2>Specials Manager</h2><br><p class=\"text-left\">You have purchased premium membership for this Establishment. You can add up to 7 specials and promotions.</p><table class=\"table\"><tbody><thead style=\"border-style:none;\"><tr><th>Special</th><th></th><th></th></tr></thead><tr ng-repeat=\"x in vm.specialsList\" style=\"cursor:pointer;\"><td ng-if=\"x.used\" style=\"width:80%\">{{x.stitle}}</td><td ng-if=\"!x.used\" style=\"width:80%;color:#808080\"><i>Empty</i></td><td ng-if=\"x.used\" style=\"width:10%\"><button class=\"btn btn-primary\" ng-click=\"vm.selSpecial(x)\">Edit</button></td><td ng-if=\"x.used\" style=\"width:10%\"><button class=\"btn btn-danger\" ng-click=\"vm.deleteSpecial(x)\">Delete</button></td><td ng-if=\"!x.used\" style=\"width:10%\"><button class=\"btn btn-success\" ng-click=\"vm.addSpecial()\">Add</button></td></tr></tbody></table><p class=\"text-left\">Specials are a great way to let people know all the great offers you have at any time.</p><div class=\"text-right\"><button class=\"btn btn-default\" ng-click=\"vm.goBack()\">Back</button></div></div>");
$templateCache.put("app/content/partials/content-block.html","<div style=\"display:{{hideme ? \'none\':\'inline\'}}\"><table class=\"table\" style=\"border-style:none;\" ng-if=\"isRoW\"><tbody><thead><tr><th style=\"color:{{fc}};width:50%;border-style:none; background: {{bgc}}; background: -webkit-linear-gradient(left, {{bgc}}, {{bgc2}}); background: -o-linear-gradient(right, {{bgc}}, {{bgc2}}); background: -moz-linear-gradient(right, {{bgc}}, {{bgc2}}); background: linear-gradient(to right, {{bgc}}, {{bgc2}});\">{{headline}}</th></tr></thead></tbody></table><div class=\"container\" ng-if=\"isRoW\"><div class=\"row\" ng-if=\"isRoW\" ng-click=\"rankSel(results[0],false)\"><div class=\"container-bgbox col-xs-6 col-sm-6 col-md-4 col-lg-3\"><bg-box bc=\"{{rdbc}}\" bc2=\"{{rdbc2}}\" fc=\"{{rdfc}}\" text=\"{{rankOfDay}}\" dir=\"horizontal\" w=\"100%\" h=\"{{sm ? \'150px\':\'200px\'}}\"></bg-box></div><div class=\"col-xs-6 col-sm-6 col-md-4 col-lg-3\" style=\"margin:0px;padding:0px;border:0px;\" ng-if=\"!isShortPhrase\"><img ng-src=\"{{image1}}\" style=\"display:{{image1 != undefined ? \'inline\':\'none\'}};width:100%;height:{{sm ? \'150px\':\'200px\'}};\"></div><div class=\"hidden-xs hidden-sm col-md-4 col-lg-3\" style=\"margin:0px;padding:0px;border:0px;\" ng-if=\"!isShortPhrase\"><img ng-src=\"{{image2}}\" style=\"display:{{image1 != undefined ? \'inline\':\'none\'}};width:100%;height:{{sm ? \'150px\':\'200px\'}};\"></div><div class=\"hidden-xs hidden-sm hidden-md col-lg-3\" style=\"margin:0px;padding:0px;border:0px;\" ng-if=\"!isShortPhrase\"><img ng-src=\"{{image3}}\" style=\"display:{{image1 != undefined ? \'inline\':\'none\'}};width:100%;height:{{sm ? \'150px\':\'200px\'}};\"></div><div class=\"container col-xs-6 col-sm-6 col-md-4 col-lg-3\" ng-if=\"isShortPhrase\" style=\"background-color:lightgray;color:black;height:{{sm ? \'150px\':\'200px\'}};margin:0px;padding:0px;border:0px;position:relative;\"><div style=\"padding:3px; margin:0px; position:absolute; top:50%; left:50%; margin-right:-50%;transform: translate(-50%,-50%)\"><h2 class=\"hidden-xs text-center\">{{title1}}</h2><h3 class=\"hidden-sm hidden-md hidden-lg hidden-xl text-center\">{{title1}}</h3></div></div><div class=\"container hidden-xs hidden-sm col-md-4 col-lg-3\" ng-if=\"isShortPhrase\" style=\"background-color:lightgray;color:black;height:{{sm ? \'150px\':\'200px\'}};margin:0px;padding:0px;border:0px;position:relative;\"><div style=\"padding:3px; margin:0px; position:absolute; top:50%; left:50%; margin-right:-50%;transform: translate(-50%,-50%)\"><h2 class=\"hidden-xs text-center\">{{title2}}</h2><h3 class=\"hidden-sm hidden-md hidden-lg hidden-xl text-center\">{{title2}}</h3></div></div><div class=\"container hidden-xs hidden-sm hidden-md col-lg-3\" ng-if=\"isShortPhrase\" style=\"background-color:lightgray;color:black;height:{{sm ? \'150px\':\'200px\'}};margin:0px;padding:0px;border:0px;position:relative;\"><div style=\"padding:3px; margin:0px; position:absolute; top:50%; left:50%; margin-right:-50%;transform: translate(-50%,-50%)\"><h2 class=\"hidden-xs text-center\">{{title3}}</h2><h3 class=\"hidden-sm hidden-md hidden-lg hidden-xl text-center\">{{title3}}</h3></div></div></div></div><table class=\"table\" style=\"border-style:none;\" ng-if=\"!isRoW\"><tbody><thead ng-if=\"!isRoW\" style=\"border-style:none;\"><tr><th style=\"background-color:{{bgc}};color:{{fc}};width:50%; background: {{bgc}}; background: -webkit-linear-gradient(left, {{bgc}}, {{bgc2}}); background: -o-linear-gradient(right, {{bgc}}, {{bgc2}}); background: -moz-linear-gradient(right, {{bgc}}, {{bgc2}}); background: linear-gradient(to right, {{bgc}}, {{bgc2}});\">{{headline}}</th></tr></thead><tr><td><div class=\"row\" style=\"width:100%;border:0px;padding:0px;margin:0px;\"><div ng-repeat=\"x in resultsTop\" style=\"border:0px;padding:0px;margin:0px;\"><div class=\"clearfix\" ng-if=\"$index % 3 == 0\" style=\"border:0px;padding:0px;margin:0px;\"></div><div class=\"col-xs-4\" ng-click=\"rankSel(x,false)\" style=\"cursor:pointer;border:0px;padding:0px;margin:0px;\"><img ng-src=\"{{x.image1url}}\" style=\"width:100%;height:{{thumbheight}};\" ng-if=\"!x.isShortPhrase\"><div style=\"width:100%;height:{{thumbheight}};background-color:darkgrey;color:black;position:relative;\" ng-if=\"x.isShortPhrase\"><br><p style=\"text-align:center;position:absolute; top:50%; left:50%; margin-right:-50%;transform: translate(-50%,-50%)\"><strong>{{x.title1}}</strong></p></div><p style=\"font-size:small;padding:0px;border:0px;margin:0px;\">{{x.titlex}}</p></div></div></div></td></tr><tr ng-repeat=\"x in results | limitTo:maxRes\" ng-click=\"rankSel(x,false)\" style=\"cursor:pointer;\"><td style=\"width:50%;\">{{x.title}} <small class=\"text-muted\">&nbsp;&nbsp;&nbsp;&nbsp;{{x.answers}}&nbspanswers-{{x.views}}&nbspviews</small></td></tr></tbody></table><p class=\"text-right\" style=\"color:blue;\" ng-click=\"seeMore(maxRes, btext)\" ng-if=\"!resLT6 && modType!=\'rankofweek\'\">&lt;&lt;{{btext}}&gt;&gt;</p></div>");
$templateCache.put("app/content/partials/search-block.html","<table class=\"table\" style=\"border-style:none;\"><tbody><tr ng-repeat=\"x in resRanks track by $index | limitTo:maxRes\" ng-click=\"rankSel(x,false)\" style=\"cursor:pointer;\"><td style=\"width:50%;\"><i class=\"fa fa-list-ol\" aria-hidden=\"true\"></i> - {{x.title}} <small class=\"text-muted\">&nbsp;&nbsp;&nbsp;&nbsp;{{x.answers}}&nbspanswers-{{x.views}}&nbspviews</small></td></tr><tr ng-repeat=\"x in resAnswers track by $index | limitTo:maxRes\" ng-click=\"ansSel(x,false)\" style=\"cursor:pointer;\"><td style=\"width:50%;\"><i class=\"{{x.icon}}\" aria-hidden=\"true\"></i> - {{x.name}}, {{x.cityarea}} <small class=\"text-muted\">&nbsp;&nbsp;&nbsp;&nbsp;{{x.views}}&nbspviews</small></td></tr></tbody></table>");
$templateCache.put("app/layout/Partials/about.html","<div ui-view=\"navbar\"></div><div class=\"container\"><div class=\"jumbotron\"><br><div class=\"row\"><div class=\"col-sm-0 col-md-2 col-lg-3\"></div><div class=\"col-sm-12 col-md-8 col-lg-6\"><img src=\"{{vm.logoimage}}\" class=\"displayed-uc\" alt=\"Cinque Terre\" style=\"width:100%;height:{{vm.sm ? \'100px\':\'200px\'}}\"></div><div class=\"col-sm-0 col-md-2 col-lg-3\"></div></div><br><br><p>Rank-X collects users preferences to generate truly collective rankings on all things that are important to you.</p><br></div><div class=\"well\"><div class=\"form-group text-left\"><p>San Diego, CA - 2016</p><p>Contact: contact@rank-x.com</p></div></div><br><div class=\"form-group text-center\"><button type=\"button\" class=\"btn btn-primary\" ng-click=\"vm.goBack()\">Back</button></div></div><footer class=\"footer\"><div class=\"container\"><p class=\"text-muted\">Rank-X is property of Rank-X LLC. San Diego, CA - 2016</p></div></footer>");
$templateCache.put("app/layout/Partials/city-selection.html","<div class=\"modal fade\" id=\"selectCityModal\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"selectCityModalLabel\"><div class=\"modal-dialog\" role=\"document\"><div class=\"modal-content\"><div class=\"modal-header\"><button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button><h4 class=\"modal-title\" id=\"selectCityModalLabel\">Select City</h4></div><div class=\"modal-body\" style=\"height: 250px\"><div class=\"col-md-12\" style=\"height: 250px\"><div class=\"col-md-6\"><input placeholder=\"Search City\" class=\"form-control\" ng-model=\"searchCity\"></div><div class=\"clearfix\" style=\"margin-bottom: 24px\"></div><div class=\"col-md-3\" ng-repeat=\"city in cities | searchObject : searchCity : \'name\' | orderObjectBy : \'name\'\"><a href=\"#\" ng-click=\"selectCity(city)\" ng-if=\"city.is_active\">{{city.name}}</a></div><div class=\"col-md-12 text-center\" style=\"height: 150px;padding-top: 50px\" ng-if=\"(cities | searchObject : searchCity : \'name\' | objectLength) == 0\"><span class=\"text-muted\">City not found.</span></div></div></div></div></div></div>");
$templateCache.put("app/layout/Partials/cwrapper.html","<div class=\"input-group\" style=\"width:100%\" ng-if=\"vm.isAdmin\"><div class=\"text-center\" style=\"display:{{vm.isAdmin ? \'inline\':\'none\'}}\"><div class=\"btn-group col-sm-6 col-md-6\"><button class=\"btn btn-primary {{vm.selEditRank}}\" ng-click=\"vm.editRank()\">Edit Mode</button> <button class=\"btn btn-primary {{vm.selViewRank}}\" ng-click=\"vm.viewRank()\">View Mode</button></div><button class=\"btn btn-danger\" ng-click=\"vm.applyRule()\">apply Rule</button></div><br style=\"display:{{vm.isAdmin ? \'inline\':\'none\'}}\"><br style=\"display:{{vm.isAdmin ? \'inline\':\'none\'}}\"><br style=\"display:{{vm.isAdmin ? \'inline\':\'none\'}}\"></div><div style=\"display:{{vm.isNh ? \'inline\':\'none\'}}\" ng-if=\"!vm.fbm\"><br ng-if=\"!vm.hidelogo\"><div class=\"dropdown\"><button type=\"button\" class=\"btn btn-primary dropdown-toggle\" data-toggle=\"dropdown\" id=\"nhdropdown\" style=\"width:200px\">{{vm.cnh}} <span class=\"caret\"></span></button><ul class=\"dropdown-menu dropdown-menu-middle\"><li ng-repeat=\"x in vm.nhs | orderBy: x\" ng-click=\"vm.selnh(x)\"><a>{{x}}</a></li></ul></div></div><br ng-if=\"vm.isNh\"><div style=\"display:{{((vm.isNhRdy || vm.isCity) && (vm.searchActive == false)) ? \'inline\':\'none\'}}\" ng-if=\"!vm.fbm\"><content-block type=\"rankofweek\" dynamic=\"false\" rankofweek=\"true\"></content-block><br ng-if=\"vm.isCity\"><table class=\"table\" style=\"border-style:none;\" ng-if=\"vm.isCity\"><tbody><thead><tr><th style=\"{{vm.headerStyle}}\">Feed <span class=\"nomargin\"><button type=\"button\" class=\"btn btn-default pull-right\" style=\"vertical-align:middle;\" ng-click=\"vm.refreshFeed()\"><span class=\"glyphicon glyphicon-refresh\" style=\"padding-top:0px;padding-bottom:0px;\" aria-hidden=\"true\"></span></button></span></th></tr></thead></tbody></table><div ng-repeat=\"x in vm.feeds | orderBy:\'-id\' | limitTo:vm.fres\" ng-if=\"vm.isCity\" style=\"padding:0px;border:0px;margin-top:10px;\"><div class=\"row\" style=\"margin:4px\"><div class=\"col-xs-12 media\"><div ng-if=\"!x.picture\" class=\"profile-avatar-wrapper media-left\"><div class=\"empty-profile-avatar-wrapper\" style=\"background-color:{{x.bc}};color:{{x.fc}};\">{{x.initials}}</div></div><div ng-if=\"x.picture\" class=\"profile-avatar-wrapper media-left\" align=\"middle\"><img ng-src=\"{{x.picture}}\" class=\"img-responsive img-circle profile-avatar\"></div><div ng-if=\"x.action == \'addedAnswer\'\" class=\"media-body\" style=\"vertical-align: middle;\">added <a ng-click=\"vm.gotoAnswer(x)\">{{x.text1}}</a> to <a ng-click=\"vm.gotoRank(x)\">{{x.text2}}</a>.</div><div ng-if=\"x.action == \'upVoted\'\" class=\"media-body\" style=\"vertical-align: middle;\">endorsed <a ng-click=\"vm.gotoAnswer(x)\">{{x.text1}}</a> in <a ng-click=\"vm.gotoRank(x)\">{{x.text2}}</a>.</div><div ng-if=\"x.action == \'downVoted\'\" class=\"media-body\" style=\"vertical-align: middle;\">voted down <a ng-click=\"vm.gotoAnswer(x)\">{{x.text1}}</a> in <a ng-click=\"vm.gotoRank(x)\">{{x.text2}}</a>.</div><div ng-if=\"x.action == \'commentR\'\" class=\"media-body\" style=\"vertical-align: middle;\">posted a comment in <a ng-click=\"vm.gotoRank(x)\">{{x.text2}}</a>.</div><div ng-if=\"x.action == \'commentA\'\" class=\"media-body\" style=\"vertical-align: middle;\">posted a comment for <a ng-click=\"vm.gotoAnswer(x)\">{{x.text1}}</a>.</div><div ng-if=\"x.action == \'editA\'\" class=\"media-body\" style=\"vertical-align: middle;\">edited the information of <a ng-click=\"vm.gotoAnswer(x)\">{{x.text1}}</a>.</div><div ng-if=\"x.action == \'upVotedVrow\'\" class=\"media-body\" style=\"vertical-align: middle;\">endorsed the <em>{{x.text2}}</em> of <a ng-click=\"vm.gotoAnswer(x)\">{{x.text1}}</a>.</div><div ng-if=\"x.action == \'downVotedVrow\'\" class=\"media-body\" style=\"vertical-align: middle;\">voted down the <em>{{x.text2}}</em> of <a ng-click=\"vm.gotoAnswer(x)\">{{x.text1}}</a>.</div><div ng-if=\"x.action == \'binded\'\" class=\"media-body\" style=\"vertical-align: middle;\">bound account to <a ng-click=\"vm.gotoAnswer(x)\">{{x.text1}}</a>.</div></div></div></div><p class=\"text-right\" style=\"color:blue;\" ng-click=\"vm.seeMoreFeed()\" ng-if=\"vm.isCity\">&lt;&lt;{{vm.ftext}}&gt;&gt;</p><br ng-if=\"vm.sm\"><div class=\"row\" style=\"border:0px;padding:0px;margin:0px;\"><div class=\"col-md-6\" style=\"border:0px;padding:3px;margin:0px;\"><content-block type=\"lifestyle\" dynamic=\"false\"></content-block></div><div class=\"col-md-6\" style=\"border:0px;padding:3px;margin:0px;\"><content-block type=\"social\" dynamic=\"false\"></content-block></div></div><div class=\"row\" style=\"border:0px;padding:0px;margin:0px;\"><div class=\"col-md-6\" style=\"border:0px;padding:3px;margin:0px;\"><content-block type=\"food\" dynamic=\"false\"></content-block></div><div class=\"col-md-6\" style=\"border:0px;padding:3px;margin:0px;\"><content-block type=\"health\" dynamic=\"false\"></content-block></div></div><div class=\"row\" style=\"border:0px;padding:0px;margin:0px;\"><div class=\"col-md-6\" style=\"border:0px;padding:3px;margin:0px;\"><content-block type=\"beauty\" dynamic=\"false\"></content-block></div><div class=\"col-md-6\" style=\"border:0px;padding:3px;margin:0px;\"><content-block type=\"services\" dynamic=\"false\"></content-block></div></div></div><div ng-if=\"vm.fbm\"><div class=\"well-small\" style=\"background-color:#d9d9d9;color:#24478f; padding:5px;\"><p>Thanks for visiting Rank-X. You can use the ranks below to give us feedback and suggestions or you can also reach us by email at:<br><strong>contact@rank-x.com</strong></p></div><br><div class=\"row\" style=\"border:0px;padding:0px;margin:0px;\"><div class=\"col-md-6\" style=\"border:0px;padding:3px;margin:0px;\"><content-block type=\"rxfeedback\" dynamic=\"false\"></content-block></div><div class=\"col-md-6\" style=\"border:0px;padding:3px;margin:0px;\"><content-block type=\"rxsuggestion\" dynamic=\"false\"></content-block></div></div><div class=\"text-right\"><button class=\"btn btn-default\" ng-click=\"vm.goHome()\">Home</button></div></div>");
$templateCache.put("app/layout/Partials/feedback.html","<div class=\"row\"><div class=\"col-lg-6\"><content-block type=\"rxfeedback\" dynamic=\"false\"></content-block></div><div class=\"col-lg-6\"><content-block type=\"rxsuggestion\" dynamic=\"false\"></content-block></div></div>");
$templateCache.put("app/layout/Partials/layout.html","<div ui-view=\"navbar\"></div><div class=\"container\" style=\"padding-left:5px;padding-right:5px;\"><div id=\"veil\" ng-show=\"vm.isLoading\"></div><div id=\"feedLoading\" ng-show=\"vm.isLoading\"><div style=\"text-align: center\" ng-if=\"vm.isLoading\"><div class=\"loading-pulse\"></div><p style=\"font-size:large\">{{vm.veilMsg}}</p></div></div><div ng-hide=\"vm.isLoading\"><div class=\"row\" style=\"padding:0px;margin:0px;border:0px\"><div class=\"col-xs-9 col-sm-10 col-md-10 col-lg-11\"><div class=\"input-group\" style=\"padding-left:0px;padding-right:5px;padding-bottom:10px;\"><input type=\"text\" class=\"form-control\" placeholder=\"Search in {{vm.searchScope}}\" ng-model=\"vm.val\" ng-change=\"vm.getResults()\" id=\"SearchInput\"><div class=\"input-group-btn\"><button class=\"btn btn-default\" type=\"submit\"><i class=\"glyphicon glyphicon-search\"></i></button></div></div></div><div class=\"col-xs-3 col-sm-2 col-md-2 col-lg-1\"><div class=\"input-group-btn pull-left\"><button class=\"btn btn-default\" ng-click=\"vm.gotoHome()\"><i class=\"glyphicon glyphicon-home\"></i></button> <button class=\"btn btn-default\" type=\"submit\"><i class=\"glyphicon glyphicon-tasks\"></i></button></div></div></div><div ng-show=\"vm.searchActive\"><search-block ng-click=\"vm.hideSearch()\"></search-block></div><div ui-view=\"\" ng-if=\"!vm.isLoading&&!vm.searchActive\"></div></div></div><br><br><footer class=\"footer\"><div class=\"container\"><p class=\"text-muted\">Rank-X is a registered trademark property of Rank-X LLC. San Diego, CA - 2017 <span><a ng-click=\"vm.goPrivacyPolicy()\">Privacy Policy</a></span> <span><a ng-click=\"vm.goRankofDayConsole()\">RoD</a></span></p></div></footer>");
$templateCache.put("app/layout/Partials/mybusiness.html","<div ui-view=\"navbar\"></div><div id=\"veil\" ng-hide=\"vm.dataReady\"></div><div id=\"feedLoading\" ng-hide=\"vm.dataReady\"><div style=\"text-align: center\" ng-if=\"!vm.dataReady\"><div class=\"loading-pulse\"></div><p style=\"font-size:large\">loading your business accounts...</p></div></div><div ng-if=\"vm.dataReady\"><div class=\"container\"><div class=\"container\" ng-if=\"!vm.noAns&&vm.overview\"><h3>My Business</h3><table class=\"table\"><tbody><thead style=\"border-style:none;\"><tr><th>Name</th><th colspan=\"2\" text-align=\"center\">Memberships</th></tr></thead><tr ng-repeat=\"x in vm.mybizs\" style=\"cursor:pointer;\"><td ng-click=\"vm.gotoanswer(x)\">{{x.name}}</td><td align=\"center\" style=\"{{x.style}}\" ng-click=\"vm.gotomanage(x)\">{{x.status}}</td><td align=\"center\" style=\"{{x.style2}}\" ng-click=\"vm.gotomanage(x)\">{{x.status2}}</td></tr></tbody></table><div ng-if=\"vm.noAns\"><br><p>You have not bound your account to any business. If you own or represent a business in this city, bound your account so you can manage its account.</p></div></div><div class=\"container\" ng-if=\"vm.manageview\"><h3>{{vm.business.name}}</h3><h4 align=\"center\" style=\"background-color:#b3b3b3;padding:5px\">Contact Info</h4><div><p class=\"text-left\"><strong>Name:</strong>&nbsp{{vm.business.firstname}} {{vm.business.lastname}}</p><p class=\"text-left\"><strong>Email:</strong>&nbsp{{vm.business.email}}</p></div><div class=\"text-right\" role=\"group\"><button type=\"button\" ng-click=\"vm.editContact()\" class=\"btn btn-default\">Edit</button></div><h4 align=\"center\" style=\"background-color:#b3b3b3;padding:5px\">Business Info</h4><div><p class=\"text-left\"><strong>Business Name:</strong>&nbsp{{vm.business.name}}</p><p class=\"text-left\"><strong>Address:</strong>&nbsp{{vm.business.location}}</p><p class=\"text-left\"><strong>Phone:</strong>&nbsp{{vm.business.phone}}</p><p class=\"text-left\"><strong>Membership:</strong>&nbsp{{vm.business.status}}</p></div><div class=\"text-right\"><a href=\"\" ng-click=\"vm.unbind(vm.business.id)\">Unbind this business from my account</a></div><h4 align=\"center\" style=\"background-color:#b3b3b3;padding:5px\" ng-if=\"vm.business.isPremium||vm.business.hasRanks\">Subscriptions</h4><div class=\"text-right\"><div class=\"btn-group\" ng-if=\"vm.business.isPremium||vm.business.hasRanks\" style=\"padding-bottom:5px\"><button type=\"button\" class=\"btn btn-default\">Edit Payment Info</button> <button type=\"button\" class=\"btn btn-default\">Invoices</button></div></div><div ng-if=\"vm.business.isPremium||vm.business.hasRanks\"><table class=\"table\"><tbody><thead style=\"border-style:none;\"><tr><th style=\"width:45%\" text-align=\"center\">Subscription</th><th style=\"width:15%\" text-align=\"center\">Monthly Cost</th><th style=\"width:20%\"></th><th style=\"width:20%\"></th></tr></thead><tr ng-if=\"vm.business.isPremium\" style=\"cursor:pointer;\"><td style=\"width:45%\">Premium Membership</td><td style=\"width:15%\">${{vm.business.price}}</td><td style=\"width:20%\"></td><td style=\"width:20%\"><button class=\"btn btn-default\" style=\"width:100%\" ng-click=\"vm.cancelPremium()\">Cancel</button></td></tr><tr ng-if=\"vm.business.hasRanks\" style=\"cursor:pointer;\"><td style=\"width:45%\">{{vm.business.ranksQty}} Custom Ranks</td><td style=\"width:15%\">${{vm.business.ranksQty*35}}</td><td style=\"width:20%\"><button class=\"btn btn-default\" style=\"width:100%\" ng-click=\"vm.editRanks()\">Edit</button></td><td style=\"width:20%\"><button class=\"btn btn-default\" style=\"width:100%\" ng-click=\"vm.cancelAllRanks()\">Cancel</button></td></tr><tr style=\"cursor:pointer;\"><td style=\"width:45%\"></td><td style=\"width:15%\"></td><td style=\"width:20%\"></td><td style=\"width:20%\"><button class=\"btn btn-default\" style=\"width:100%\" ng-click=\"vm.cancelAll()\" ng-if=\"vm.business.hasranks&&vm.business.ispremium\">Cancel All</button></td></tr></tbody></table></div><div class=\"well\" ng-if=\"!vm.business.isPremium\"><h2 class=\"text-center\">Upgrade to Premium</h2><h3 class=\"text-center\">${{vm.business.price}} / month</h3><i class=\"fa fa-check\"></i><strong>&nbspGet more exposure</strong> within San Diego<br><i class=\"fa fa-check\"></i>&nbspLet people know all your <strong>specials, promotions and special events</strong><br><i class=\"fa fa-check\"></i><strong>&nbspDrive more traffic</strong> to your business<br><i class=\"fa fa-check\"></i><strong>&nbspBe the best</strong> at what you do.<br><div class=\"text-center\"><a href=\"\" ng-click=\"\">Learn More</a></div><label class=\"checkbox-inline\"><input type=\"checkbox\" ng-model=\"vm.getPremium\" value=\"\">Get Premium Membership</label></div><div class=\"well\" ng-if=\"!vm.business.hasRanks\"><h2 class=\"text-center\">Purchase Rankings</h2><h3 class=\"text-center\">$35 / month each</h3><i class=\"fa fa-check\"></i>&nbspCreate <strong>unique rankings and lists</strong> for your own products and services<br><i class=\"fa fa-check\"></i>&nbsp<strong>Focus</strong> on each of your products<br><i class=\"fa fa-check\"></i><strong>&nbspEngage</strong> your audience<br><i class=\"fa fa-check\"></i><strong>&nbspGet feedback</strong> from your customers.<br><div class=\"text-center\"><a href=\"\" ng-click=\"\">Learn More</a></div><div class=\"row\"><div class=\"col-xs-7 col-sm-9 col-md-10 col-lg-10\"><label class=\"checkbox-inline\"><input type=\"checkbox\" ng-model=\"vm.getRanks\" value=\"\">Purchase Ranks</label></div><div class=\"col-xs-5 col-sm-3 col-md-2 col-lg-2\"><div class=\"input-group\" ng-if=\"vm.getRanks\"><span class=\"input-group-btn\"><button class=\"btn btn-primary\" ng-click=\"vm.minusQty()\"><i class=\"fa fa-minus\"></i></button></span> <input style=\"text-align:center\" class=\"form-control\" ng-model=\"vm.ranksQty\" type=\"text\" placeholder=\"vm.ranksQty\"> <span class=\"input-group-btn\"><button class=\"btn btn-primary\" ng-click=\"vm.plusQty()\"><i class=\"fa fa-plus\"></i></button></span></div></div></div></div><div class=\"row\" ng-if=\"vm.sell\"><br><div class=\"col-xs-12\"><div class=\"input-group\"><span class=\"input-group-addon\" style=\"color:red\">Promo Code:</span> <input class=\"form-control\" style=\"color:red;\" ng-model=\"vm.promocode\" type=\"text\" placeholder=\"Enter code...\"> <span class=\"input-group-btn\"><button class=\"btn btn-default\" ng-click=\"vm.checkcode()\">Check Code</button></span></div></div></div><div class=\"text-center\" ng-if=\"vm.sell\"><br><p><i>{{vm.codeMsg}}</i></p></div><div class=\"text-center\" ng-if=\"vm.sell\"><br><button class=\"btn btn-success\" ng-click=\"vm.goCheckout()\">Checkout</button></div></div><div class=\"container\" ng-if=\"vm.checkout\"><h3>Checkout</h3><br><p style=\"text-align:center\">You are purchasing the following subscriptions for the business <strong>{{vm.business.name}}</strong>:</p><br><table class=\"table\"><tbody><thead style=\"border-style:none;\"><tr><th>Name</th><th>Quantity</th><th>Total</th><th></th></tr></thead><tr ng-if=\"vm.getPremium\"><td style=\"width:70%\">Premium Membership</td><td style=\"width:15%\" align=\"center\">1</td><td style=\"width:15%\" align=\"center\">${{vm.business.price}}</td></tr><tr ng-if=\"vm.getRanks\"><td style=\"width:70%\">Custom Rankings</td><td style=\"width:15%\" align=\"center\">{{vm.ranksQty}}</td><td style=\"width:15%\" align=\"center\">${{vm.ranksQty*35}}</td></tr><tr><td style=\"width:85%\" colspan=\"2\">Total</td><td style=\"width:15%\" align=\"center\">${{vm.total}}</td></tr></tbody></table><p>You have a valid code to try the above subscriptions free for 60 days. You will not be charged until the 60 day trial period expires. Afterwards your card will be charged <strong>${{vm.total}}</strong> monthly.</p><p>You can log in and cancel or make modifications to your account at any time.</p><label class=\"checkbox-inline\"><input type=\"checkbox\" ng-model=\"vm.acceptTOS\" value=\"\">I have read and understood the <a href=\"\">Terms of Service</a></label><div class=\"text-center\"><br><button id=\"checkoutButton\" name=\"checkoutButton\" class=\"btn btn-success\" onclick=\"clickStripeButton()\">Pay with Card</button><br><div ng-show=\"!vm.showCurrentPlan\"><form action=\"https://server.rank-x.com/StripeServer/charge\" method=\"POST\"><div style=\"display:none\"><script src=\"https://checkout.stripe.com/checkout.js\" class=\"stripe-button\" data-key=\"pk_test_q9kbYzvzE6uMwZH9ZUjfK6Xq\" data-email=\"{{vm.business.email}}\" data-label=\"Pay with Card\" data-name=\"Rank-X\" data-description=\"Premium Membership Subscription\" data-panel-label=\"Subscribe\" data-image=\"/assets/images/rankx-logo-small-2-square.png\" data-locale=\"auto\" data-zip-code=\"true\">\n            </script></div><input type=\"hidden\" id=\"userEmail\" name=\"userEmail\" value=\"{{vm.business.email}}\"> <input type=\"hidden\" id=\"userId\" name=\"userId\" value=\"{{vm.business.user}}\"> <input type=\"hidden\" id=\"useraccntId\" name=\"useraccntId\" value=\"{{vm.business.accountid}}\"> <input type=\"hidden\" id=\"stripeId\" name=\"stripeId\" value=\"{{vm.business.stripeid}}\"> <input type=\"hidden\" id=\"getPremiumPlan\" name=\"getPremiumPlan\" value=\"{{vm.getPremium}}\"> <input type=\"hidden\" id=\"getCustomRanks\" name=\"getCustomRanks\" value=\"{{vm.getRanks}}\"> <input type=\"hidden\" id=\"ranksQuantity\" name=\"ranksQuantity\" value=\"{{vm.ranksQty}}\"> <input type=\"hidden\" id=\"couponValid\" name=\"couponValid\" value=\"{{vm.codeOk}}\"></form></div></div></div><div class=\"text-right\" role=\"group\"><button type=\"button\" ng-click=\"vm.goBack()\" class=\"btn btn-default\">Back</button></div><br><br></div></div><script>\n        function eventFire(el, etype){\n          if (el.fireEvent) {\n            el.fireEvent(\'on\' + etype);\n          } else {\n            var evObj = document.createEvent(\'Events\');\n            evObj.initEvent(etype, true, false);\n            el.dispatchEvent(evObj);\n          }\n        }\n        function clickCancelPlanButton() {\n          showLoaderBriefDouble();\n          console.log(\"about to fire click event\");\n          var resultOfEventFire = eventFire(document.getElementById(\'confirmCancelPlan\'), \'click\');\n          console.log(\"done firing click event, resultOfEventFire: \" + resultOfEventFire);\n        }\n        function clickStripeButton() {\n          console.log(\"about to fire click event\");\n          var resultOfEventFire = eventFire(document.getElementsByClassName(\'stripe-button-el\')[0], \'click\');\n\n          console.log(\"done firing click event, resultOfEventFire: \" + resultOfEventFire);\n        }\n        </script>");
$templateCache.put("app/layout/Partials/myfavs.html","<h3>My Favorites</h3><table class=\"table\" ng-if=\"vm.answerExist2\"><tbody><thead style=\"border-style:none;\"><tr><th style=\"background-color:{{vm.bgc2}};color:{{vm.fc2}};width:50%;\">{{vm.headline2}}</th><th style=\"background-color:{{vm.bgc2}};color:{{vm.fc2}};width:50%;\"></th></tr></thead><tr ng-repeat=\"x in vm.mylifestyleans | limitTo:vm.maxRes2\" ng-click=\"vm.answerDetail(2,x)\" style=\"cursor:pointer;\"><td style=\"width:50%;\">{{x.name}}</td><td style=\"background-color:{{x.sp_bc}};color:{{x.sp_fc}}\">{{x.sp_title}}</td></tr></tbody></table><p class=\"text-right\" style=\"color:blue;\" ng-click=\"vm.seeMore(2)\" ng-if=\"vm.cb2gt5\">&lt;&lt;{{vm.btext2}}&gt;&gt;</p><table class=\"table\" ng-if=\"vm.answerExist1\"><tbody><thead style=\"border-style:none;\"><tr><th style=\"background-color:{{vm.bgc1}};color:{{vm.fc1}};width:50%;\">{{vm.headline1}}</th><th style=\"background-color:{{vm.bgc1}};color:{{vm.fc1}};width:50%;\"></th></tr></thead><tr ng-repeat=\"x in vm.myfoodans | limitTo:vm.maxRes1\" ng-click=\"vm.answerDetail(1,x)\" style=\"cursor:pointer;\"><td style=\"width:50%;\">{{x.name}}</td><td style=\"background-color:{{x.sp_bc}};color:{{x.sp_fc}}\">{{x.sp_title}}</td></tr></tbody></table><p class=\"text-right\" style=\"color:blue;\" ng-click=\"vm.seeMore(1)\" ng-if=\"vm.cb1gt5\">&lt;&lt;{{vm.btext1}}&gt;&gt;</p><table class=\"table\" ng-if=\"vm.answerExist3\"><tbody><thead style=\"border-style:none;\"><tr><th style=\"background-color:{{vm.bgc3}};color:{{vm.fc3}};width:50%;\">{{vm.headline3}}</th><th style=\"background-color:{{vm.bgc3}};color:{{vm.fc3}};width:50%;\"></th></tr></thead><tr ng-repeat=\"x in vm.myservicesans | limitTo:vm.maxRes3\" ng-click=\"vm.answerDetail(3,x)\" style=\"cursor:pointer;\"><td style=\"width:50%;\">{{x.name}}</td><td style=\"background-color:{{x.sp_bc}};color:{{x.sp_fc}}\">{{x.sp_title}}</td></tr></tbody></table><p class=\"text-right\" style=\"color:blue;\" ng-click=\"vm.seeMore(3)\" ng-if=\"vm.cb3gt5\">&lt;&lt;{{vm.btext3}}&gt;&gt;</p><table class=\"table\" ng-if=\"vm.answerExist4\"><tbody><thead style=\"border-style:none;\"><tr><th style=\"background-color:{{vm.bgc4}};color:{{vm.fc4}};width:50%;\">{{vm.headline4}}</th><th style=\"background-color:{{vm.bgc4}};color:{{vm.fc4}};width:50%;\"></th></tr></thead><tr ng-repeat=\"x in vm.myhealthans | limitTo:vm.maxRes4\" ng-click=\"vm.answerDetail(4,x)\" style=\"cursor:pointer;\"><td style=\"width:50%;\">{{x.name}}</td><td style=\"background-color:{{x.sp_bc}};color:{{x.sp_fc}}\">{{x.sp_title}}</td></tr></tbody></table><p class=\"text-right\" style=\"color:blue;\" ng-click=\"vm.seeMore(4)\" ng-if=\"vm.cb4gt5\">&lt;&lt;{{vm.btext4}}&gt;&gt;</p><table class=\"table\" ng-if=\"vm.answerExist5\"><tbody><thead style=\"border-style:none;\"><tr><th style=\"background-color:{{vm.bgc5}};color:{{vm.fc5}};width:50%;\">{{vm.headline5}}</th><th style=\"background-color:{{vm.bgc5}};color:{{vm.fc5}};width:50%;\"></th></tr></thead><tr ng-repeat=\"x in vm.mybeautyans | limitTo:vm.maxRes5\" ng-click=\"vm.answerDetail(5,x)\" style=\"cursor:pointer;\"><td style=\"width:50%;\">{{x.name}}</td><td style=\"background-color:{{x.sp_bc}};color:{{x.sp_fc}}\">{{x.sp_title}}</td></tr></tbody></table><p class=\"text-right\" style=\"color:blue;\" ng-click=\"vm.seeMore(5)\" ng-if=\"vm.cb5gt5\">&lt;&lt;{{vm.btext5}}&gt;&gt;</p><div ng-if=\"vm.noAns\"><br><p>You have not endorsed any Establishments yet. Places that you endorse will show up here so you can have quick access to all their specials and promotions.</p></div><div class=\"text-right\" role=\"group\"><button type=\"button\" ng-click=\"vm.goBack()\" class=\"btn btn-default\">Back</button></div>");
$templateCache.put("app/layout/Partials/navbar.html","<nav class=\"navbar navbar-inverse\"><div class=\"container\"><div class=\"navbar-header\"><button type=\"button\" class=\"navbar-toggle collapsed\" data-toggle=\"collapse\" data-target=\"#navbar\" aria-expanded=\"false\" aria-controls=\"navbar\"><span class=\"sr-only\">Toggle navigation</span> <span class=\"icon-bar\"></span> <span class=\"icon-bar\"></span> <span class=\"icon-bar\"></span></button> <a class=\"navbar-brand\" ng-click=\"vm.gotoHome()\" style=\"cursor:pointer;padding:0px;border:0px;margin:0px;\"><img src=\"/assets/images/logosqwborder.jpg\" style=\"width:60px;\"></a> <a class=\"navbar-brand home-link\" ng-click=\"vm.gotoHome()\">Home</a> <a class=\"navbar-brand navbar-profile-picture-wrapper\" ng-show=\"vm.user\" ng-click=\"vm.gotomyfavs()\"><img class=\"img-responsive img-circle navbar-profile-picture\" ng-src=\"{{vm.user.picture.data.url}}\"> <span>{{vm.user.first_name}}</span></a> <a class=\"navbar-brand\" ng-if=\"vm.warning\" style=\"background-color:#33cccc;color:black;margin:2px\" ng-click=\"vm.goWarning()\"><i class=\"fa fa-warning\"></i></a> <a class=\"navbar-brand\" ng-if=\"vm.coordsRdy\" ng-click=\"vm.goCoords()\" style=\"margin:0px;\"><i class=\"fa fa-location-arrow\"></i></a></div><div id=\"navbar\" class=\"navbar-collapse collapse\"><ul class=\"nav navbar-nav navbar-right\"><li><a href=\"\" ng-click=\"vm.gotoAbout()\">About</a></li><li><a href=\"\" ng-click=\"vm.gotoTour()\">Tour</a></li><li><a href=\"\" ng-click=\"vm.gotoFeedback()\">Feedback</a></li><li ng-if=\"!vm.isLoggedIn\"><a href=\"\" ng-click=\"vm.goToLogin()\">Login</a></li><li ng-if=\"vm.isLoggedIn\"><a href=\"\" ng-click=\"vm.logout()\" class=\"\">Logout</a></li></ul></div></div></nav>");
$templateCache.put("app/layout/Partials/privacypolicy.html","<div ui-view=\"navbar\"></div><style>\n    #ppBody {\n        font-size: 11pt;\n        width: 100%;\n        margin: 0 auto;\n        text-align: justify;\n    }\n    \n    #ppHeader {\n        font-family: verdana;\n        font-size: 21pt;\n        width: 100%;\n        margin: 0 auto;\n    }\n    \n    .ppConsistencies {\n        display: none;\n    }\n</style><div class=\"container\"><br><div class=\"text-right\"><button class=\"btn btn-default\" ng-click=\"vm.goBack()\">Back</button></div><div id=\"ppHeader\"><span><img src=\"/assets/images/logo_sq.png\" style=\"width:80px\"></span> Rank-X Privacy Policy</div><div id=\"ppBody\"><div class=\"ppConsistencies\"><div class=\"col-2\"><div class=\"quick-links text-center\">Information Collection</div></div><div class=\"col-2\"><div class=\"quick-links text-center\">Information Usage</div></div><div class=\"col-2\"><div class=\"quick-links text-center\">Information Protection</div></div><div class=\"col-2\"><div class=\"quick-links text-center\">Cookie Usage</div></div><div class=\"col-2\"><div class=\"quick-links text-center\">3rd Party Disclosure</div></div><div class=\"col-2\"><div class=\"quick-links text-center\">3rd Party Links</div></div><div class=\"col-2\"></div></div><div style=\"clear:both;height:10px;\"></div><div class=\"ppConsistencies\"><div class=\"col-2\"><div class=\"col-12 quick-links2 gen-text-center\">Google AdSense</div></div><div class=\"col-2\"><div class=\"col-12 quick-links2 gen-text-center\">Fair Information Practices<div class=\"col-8 gen-text-left gen-xs-text-center\" style=\"font-size:12px;position:relative;left:20px;\">Fair information<br>Practices</div></div></div><div class=\"col-2\"><div class=\"col-12 quick-links2 gen-text-center coppa-pad\">COPPA</div></div><div class=\"col-2\"><div class=\"col-12 quick-links2 quick4 gen-text-center caloppa-pad\">CalOPPA</div></div><div class=\"col-2\"><div class=\"quick-links2 gen-text-center\">Our Contact Information<br></div></div></div><div style=\"clear:both;height:10px;\"></div><div class=\"innerText\">This privacy policy has been compiled to better serve those who are concerned with how their \'Personally Identifiable Information\' (PII) is being used online. PII, as described in US privacy law and information security, is information that can be used on its own or with other information to identify, contact, or locate a single person, or to identify an individual in context. Please read our privacy policy carefully to get a clear understanding of how we collect, use, protect or otherwise handle your Personally Identifiable Information in accordance with our website.<br></div><span id=\"infoCo\"></span><br><div class=\"grayText\"><strong>What personal information do we collect from the people that visit our website?</strong></div><br><div class=\"innerText\">We do not collect information from visitors of our site.</div>or other details to help you with your experience.</div><br><div class=\"grayText\"><strong>When do we collect information?</strong></div><br><div class=\"innerText\">We collect information from users when:<br><br><strong>1.</strong>When users log in via Facebook we obtain basic information such as first and last name. A record for each user is created to keep track of votes and activities on the site.<strong>We do not have access, nor store Facebook login credentials.</strong><br><br><strong>2.</strong> When users add answers to the rankings, and endorse, comment or edit. This information is stored to keep track of the user preferences (shown in Favorites) and to keep track of singularity of votes in the rankings.<br></div><span id=\"infoUs\"></span><br><div class=\"grayText\"><strong>How do we use your information?</strong></div><br><div class=\"innerText\">We may use the information we collect from you when you register, make a purchase, sign up for our newsletter, respond to a survey or marketing communication, surf the website, or use certain other site features in the following ways:<br><br></div><div class=\"innerText\">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <strong>&bull;</strong> To ask for ratings and reviews of services or products</div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <strong>&bull;</strong> To comment and review services<br><span id=\"infoPro\"></span><br><div class=\"grayText\"><strong>How do we protect your information?</strong></div><br><div class=\"innerText\">Our website is scanned on a regular basis for security holes and known vulnerabilities in order to make your visit to our site as safe as possible.<br><br></div><div class=\"innerText\">We use regular Malware Scanning.<br><br></div><div class=\"innerText\">Your personal information is contained behind secured networks and is only accessible by a limited number of persons who have special access rights to such systems, and are required to keep the information confidential. In addition, all sensitive/credit information you supply is encrypted via Secure Socket Layer (SSL) technology.</div><br><div class=\"innerText\">We implement a variety of security measures when a user enters, submits, or accesses their information to maintain the safety of your personal information.</div><br><div class=\"innerText\">All transactions are processed through a gateway provider and are not stored or processed on our servers.</div><span id=\"coUs\"></span><br><div class=\"grayText\"><strong>Do we use \'cookies\'?</strong></div><br><div class=\"innerText\">Yes. Cookies are small files that a site or its service provider transfers to your computer\'s hard drive through your Web browser (if you allow) that enables the site\'s or service provider\'s systems to recognize your browser and capture and remember certain information. For instance, we use cookies to help us remember you and keep you from needing to log in everytime you visit the website. They are also used to help us understand your preferences based on previous or current site activity, which enables us to provide you with improved services. We also use cookies to help us compile aggregate data about site traffic and site interaction so that we can offer better site experiences and tools in the future.</div><div class=\"innerText\"><br><strong>We use cookies to:</strong></div><div class=\"innerText\">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <strong>&bull;</strong> Understand and save user\'s preferences for future visits.</div><div class=\"innerText\"><br>You can choose to have your computer warn you each time a cookie is being sent, or you can choose to turn off all cookies. You do this through your browser settings. Since browser is a little different, look at your browser\'s Help Menu to learn the correct way to modify your cookies.<br></div><br><div class=\"innerText\">If you turn cookies off, some features will be disabled. It won\'t affect the user\'s experience that make your site experience more efficient and may not function properly.</div><br><div class=\"innerText\">However, you will still be able to navigate through the website.</div><br><span id=\"trDi\"></span><br><div class=\"grayText\"><strong>Third-party disclosure</strong></div><br><div class=\"innerText\">We do not sell, trade, or otherwise transfer to outside parties your Personally Identifiable Information.</div><span id=\"trLi\"></span><br><div class=\"grayText\"><strong>Third-party links</strong></div><br><div class=\"innerText\">We do not include or offer third-party products or services on our website.</div><span id=\"gooAd\"></span><br><div class=\"blueText\"><strong>Google</strong></div><br><div class=\"innerText\">Google\'s advertising requirements can be summed up by Google\'s Advertising Principles. They are put in place to provide a positive experience for users. https://support.google.com/adwordspolicy/answer/1316548?hl=en<br><br></div><div class=\"innerText\">We use Google AdSense Advertising on our website.</div><div class=\"innerText\"><br>Google, as a third-party vendor, uses cookies to serve ads on our site. Google\'s use of the DART cookie enables it to serve ads to our users based on previous visits to our site and other sites on the Internet. Users may opt-out of the use of the DART cookie by visiting the Google Ad and Content Network privacy policy.<br></div><div class=\"innerText\"><br><strong>We have implemented the following:</strong></div><div class=\"innerText\">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <strong>&bull;</strong> Demographics and Interests Reporting</div><br><div class=\"innerText\">We, along with third-party vendors such as Google use first-party cookies (such as the Google Analytics cookies) and third-party cookies (such as the DoubleClick cookie) or other third-party identifiers together to compile data regarding user interactions with ad impressions and other ad service functions as they relate to our website.</div><div class=\"innerText\"><br><strong>Opting out:</strong><br>Users can set preferences for how Google advertises to you using the Google Ad Settings page. Alternatively, you can opt out by visiting the Network Advertising Initiative Opt Out page or by using the Google Analytics Opt Out Browser add on.</div><span id=\"calOppa\"></span><br><div class=\"blueText\"><strong>California Online Privacy Protection Act</strong></div><br><div class=\"innerText\">CalOPPA is the first state law in the nation to require commercial websites and online services to post a privacy policy. The law\'s reach stretches well beyond California to require any person or company in the United States (and conceivably the world) that operates websites collecting Personally Identifiable Information from California consumers to post a conspicuous privacy policy on its website stating exactly the information being collected and those individuals or companies with whom it is being shared. - See more at: http://consumercal.org/california-online-privacy-protection-act-caloppa/#sthash.0FdRbT51.dpuf<br></div><div class=\"innerText\"><br><strong>According to CalOPPA, we agree to the following:</strong><br></div><div class=\"innerText\">Users can visit our site anonymously.</div><div class=\"innerText\">Once this privacy policy is created, we will add a link to it on our home page or as a minimum, on the first significant page after entering our website.<br></div><div class=\"innerText\">Our Privacy Policy link includes the word \'Privacy\' and can easily be found on the page specified above.</div><div class=\"innerText\"><br>You will be notified of any Privacy Policy changes:</div><div class=\"innerText\">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <strong>&bull;</strong> Others</div><div class=\"innerText\">when visiting page</div><div class=\"innerText\">Can change your personal information:</div><div class=\"innerText\">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <strong>&bull;</strong> By logging in to your account</div><div class=\"innerText\"><br><strong>How does our site handle Do Not Track signals?</strong><br></div><div class=\"innerText\">We honor Do Not Track signals and Do Not Track, plant cookies, or use advertising when a Do Not Track (DNT) browser mechanism is in place.</div><div class=\"innerText\"><br><strong>Does our site allow third-party behavioral tracking?</strong><br></div><div class=\"innerText\">It\'s also important to note that we do not allow third-party behavioral tracking</div><span id=\"coppAct\"></span><br><div class=\"blueText\"><strong>COPPA (Children Online Privacy Protection Act)</strong></div><br><div class=\"innerText\">When it comes to the collection of personal information from children under the age of 13 years old, the Children\'s Online Privacy Protection Act (COPPA) puts parents in control. The Federal Trade Commission, United States\' consumer protection agency, enforces the COPPA Rule, which spells out what operators of websites and online services must do to protect children\'s privacy and safety online.<br><br></div><div class=\"innerText\">We do not specifically market to children under the age of 13 years old.</div><span id=\"ftcFip\"></span><br><div class=\"blueText\"><strong>Fair Information Practices</strong></div><br><div class=\"innerText\">The Fair Information Practices Principles form the backbone of privacy law in the United States and the concepts they include have played a significant role in the development of data protection laws around the globe. Understanding the Fair Information Practice Principles and how they should be implemented is critical to comply with the various privacy laws that protect personal information.<br><br></div><div class=\"innerText\"><strong>In order to be in line with Fair Information Practices we will take the following responsive action, should a data breach occur:</strong></div><div class=\"innerText\">We will notify the users via in-site notification</div><div class=\"innerText\">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <strong>&bull;</strong> Within 7 business days</div><div class=\"innerText\"><br>We also agree to the Individual Redress Principle which requires that individuals have the right to legally pursue enforceable rights against data collectors and processors who fail to adhere to the law. This principle requires not only that individuals have enforceable rights against data users, but also that individuals have recourse to courts or government agencies to investigate and/or prosecute non-compliance by data processors.</div><span id=\"canSpam\"></span><br><div class=\"blueText\"><strong>CAN SPAM Act</strong></div><br><div class=\"innerText\">The CAN-SPAM Act is a law that sets the rules for commercial email, establishes requirements for commercial messages, gives recipients the right to have emails stopped from being sent to them, and spells out tough penalties for violations.<br><br></div><div class=\"innerText\"><strong>We collect your email address in order to:</strong></div><div class=\"innerText\"><br><strong>To be in accordance with CANSPAM, we agree to the following:</strong></div><div class=\"innerText\"><br>If at any time you would like to unsubscribe from receiving future emails, you can email us at <strong>contact@rank-x.com</strong> and we will promptly remove you from <strong>ALL</strong> correspondence.<br><span id=\"ourCon\"></span><br><div class=\"blueText\"><strong>Contacting Us</strong></div><br><div class=\"innerText\">If there are any questions regarding this privacy policy, you may contact us using the information below.<br><br></div><div class=\"innerText\">Rank-X, LLC</div>San Diego, California<div class=\"innerText\">USA</div><div class=\"innerText\">contact@rank-x.com</div><div class=\"innerText\"><br>Last Edited on 2017-01-30</div></div><div class=\"text-right\"><button class=\"btn btn-default\" ng-click=\"vm.goBack()\">Back</button></div><br></div>");
$templateCache.put("app/layout/Partials/searchresults.html","<div ng-show=\"vm.searchActive\"><search-block></search-block></div>");
$templateCache.put("app/login/partials/add-user-detail.html","<div class=\"modal fade\" id=\"addUserDetailModal\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"addUserDetailModalLabel\"><div class=\"modal-dialog\" role=\"document\"><div class=\"modal-content\"><div class=\"modal-header\"><h4 class=\"modal-title\" id=\"addUserDetailModalLabel\">Add User Detail</h4></div><div class=\"modal-body\" style=\"height: 214px\"><div class=\"col-md-12\"><form class=\"form-horizontal\" role=\"form\" name=\"answerForm\"><div class=\"col-md-12\"><div class=\"form-group\"><label for=\"birthdate\">Birth Date:</label><datepicker date-year-title=\"selected year\" date-max-limit=\"{{maxDate}}\" date-format=\"yyyy/MM/dd\" date-month-title=\"selected year\"><input id=\"birthdate\" ng-model=\"user.birth_date\" class=\"form-control\"></datepicker></div><div class=\"form-group\"><label>Gender:</label><div class=\"clearfix\"></div><label class=\"radio-inline\"><input name=\"gender\" type=\"radio\" value=\"Male\" ng-model=\"user.gender\">Male</label> <label class=\"radio-inline\"><input name=\"gender\" type=\"radio\" value=\"Female\" ng-model=\"user.gender\">Female</label> <label class=\"radio-inline\"><input name=\"gender\" type=\"radio\" value=\"Other\" ng-model=\"user.gender\">Other</label></div><div class=\"row form-group\"><button type=\"submit\" class=\"btn btn-success\" ng-click=\"addUserDetail()\">Add Detail</button><p class=\"hiw\" ng-click=\"whyThisInfoDialog()\"><u>why you need this?</u></p></div></div></form></div></div></div></div></div>");
$templateCache.put("app/login/partials/bizlogin.html","<div class=\"panel panel-primary signin-card\"><div class=\"panel-heading\"><h1 class=\"text-center\">Rank-X</h1><h1 class=\"text-center\">Business Registration</h1></div><div class=\"panel-body\"><form ng-submit=\"vm.submit()\" ng-if=\"!vm.isProgressing\"><div class=\"form-group\"><label>Email</label> <input type=\"email\" class=\"form-control\" ng-model=\"vm.username\"></div><div class=\"form-group\"><label>Password</label> <input type=\"password\" class=\"form-control\" ng-model=\"vm.password\"></div><div class=\"form-group text-right\"><button type=\"submit\" class=\"btn btn-primary\">Sign In</button></div></form><div style=\"text-align: center\" ng-if=\"vm.isProgressing\"><div class=\"loading-pulse\"></div><p class=\"text-muted\">Loading...</p></div></div></div>");
$templateCache.put("app/login/partials/login.html","<div class=\"panel panel-primary signin-card\"><div class=\"panel-heading\" style=\"background-color:lightgray;\"><img src=\"/assets/images/rankxlogo_noheadline.png\" style=\"width:100%; padding:10px;\"></div><div class=\"panel-body\"><form ng-submit=\"vm.submit()\" ng-if=\"!vm.isProgressing\"><div class=\"form-group text-center\"><button type=\"button\" class=\"btn btn-primary form-control\" ng-click=\"vm.facebookLogin()\"><i class=\"fa fa-facebook\"></i> Login</button><br><br><button type=\"button\" class=\"btn btn-default form-control\" style=\"vertical-align:middle;\" ng-click=\"vm.goBack()\">Cancel</button></div><br><p class=\"hiw\" ng-click=\"vm.whyFacebookDialog()\"><u>why Facebook?</u></p></form><div style=\"text-align: center\" ng-if=\"vm.isProgressing\"><div class=\"loading-pulse\"></div><p class=\"text-muted\">Loading...</p></div></div></div>");
$templateCache.put("app/login/partials/register.html","<div class=\"panel panel-primary signin-card\"><div class=\"panel-heading\"><h1 class=\"text-center\">Register</h1></div><div class=\"panel-body\"><form name=\"registerForm\"><div class=\"form-group\"><label>First Name</label> <input type=\"text\" name=\"firstName\" class=\"form-control\" ng-model=\"vm.firstName\"></div><div class=\"form-group\"><label>Last Name</label> <input type=\"text\" name=\"lastName\" class=\"form-control\" ng-model=\"vm.lastName\"></div><div class=\"form-group\"><label>Email</label> <input type=\"email\" class=\"form-control\" ng-model=\"vm.username\"></div><div class=\"form-group\"><label>Password</label> <input type=\"password\" name=\"password\" class=\"form-control\" ng-model=\"vm.password\"></div><div class=\"form-group\"><label>Confirm Password</label> <input type=\"password\" name=\"confirm\" class=\"form-control\" ng-model=\"vm.confirm\"></div><div class=\"form-group text-right\"><button type=\"submit\" class=\"btn btn-primary\" ng-click=\"vm.signIn()\">Sign In</button> <button type=\"button\" class=\"btn btn-primary\" ng-click=\"vm.register()\">Register</button></div></form></div></div>");
$templateCache.put("app/promoters/Partials/promote.html","<div ui-view=\"navbar\"></div><br><div class=\"container\"><h2>Become a Rank-X Promoter</h2><br><p class=\"text-left\">Thank you for your interest in becoming a Rank-X promotor. Please read carefully the information below.</p><div class=\"accordion\" role=\"tablist\" aria-multiselectable=\"true\"><div class-=\"\" \"card\"=\"\"><div class=\"card-header\" role=\"tab\" id=\"headingOne\" ng-click=\"vm.show(1)\"><h3 class=\"mb-0\" style=\"background-color:#b3b3b3;padding:5px\"><a data-toggle=\"collapse\" data-parent=\"#accordion\" aria-expanded=\"true\" aria-controls=\"collapseOne\">What is Rank-X?</a></h3></div><div id=\"collapseOne\" class=\"collapse show\" role=\"tabpanel\" aria-labelledby=\"headingOne\" ng-show=\"vm.showOne\"><div class=\"card-block\"><p class=\"text-left\">Rank-X is a San Diego based company with a web application designed to create interactive content in the forms of rankings, lists and opinions. We like to focus on things on our city but also cover general topics. Our goal is to be the best source of information for the best services, food, events and things happening around our city in a clean and elegant way. In addition to best deals and specials that different businesses offer. If you have not already done so, please take a time to look at the website. <span><a href=\"/#!/home\">Click here</a></span></p></div></div></div><div class-=\"\" \"card\"=\"\"><div class=\"card-header\" role=\"tab\" id=\"headingTwo\" ng-click=\"vm.show(2)\"><h3 class=\"mb-0\" style=\"background-color:#b3b3b3;padding:5px\"><a data-toggle=\"collapse\" data-parent=\"#accordion\" aria-expanded=\"true\" aria-controls=\"collapseTwo\">What does Rank-X sells?</a></h3></div><div id=\"collapseTwo\" class=\"collapse show\" role=\"tabpanel\" aria-labelledby=\"headingTwo\" ng-show=\"vm.showTwo\"><div class=\"card-block\"><p class=\"text-left\">Rank-X sells premium memberships to businesses and brands that wish to stand out from others, and to those that wish to promote their specials and promotions with users.</p><div class=\"row\"><div class=\"col-xs-12 col-sm-6 col-md-3 col-lg-3\"><img src=\"/assets/images/promote_img1.jpg\" style=\"width:100%; height:auto; border-style:solid;border-width:3px; border-color:lightgray\"><p style=\"margin-top:5px\">All of the content is generated by lists.</p></div><div class=\"col-xs-12 col-sm-6 col-md-3 col-lg-3\"><img src=\"/assets/images/promote_img2.jpg\" style=\"width:100%; height:auto; border-style:solid;border-width:3px; border-color:lightgray\"><p style=\"margin-top:5px\">When content is presented, a far right column is saved for specials. <i>Premium Business</i> (Demo Restaurant 1) gets highlighted with a short description of the current special.</p></div><div class=\"col-xs-12 col-sm-6 col-md-3 col-lg-3\"><img src=\"/assets/images/promote_img3.jpg\" style=\"width:100%; height:auto; border-style:solid;border-width:3px; border-color:lightgray\"><p style=\"margin-top:5px\">Inside an Establishment detail, a <i>Premium Business</i> can create detail boxes to advertise their specials.</p></div><div class=\"col-xs-12 col-sm-6 col-md-3 col-lg-3\"><img src=\"/assets/images/promote_img4.jpg\" style=\"width:100%; height:auto; border-style:solid;border-width:3px; border-color:lightgray\"><p style=\"margin-top:5px\">Each special can contain an image that can be displayed. Images can contain <strong>coupons</strong>, <strong>flyers</strong>, <strong>bar codes</strong>, etc. It is up to the business the content of the image to be displayed.</p></div></div><p class=\"text-left\"><i>Premium Business</i> can edit and control real-time the specials and promotions that are shown.</p></div></div></div><div class-=\"\" \"card\"=\"\"><div class=\"card-header\" role=\"tab\" id=\"headingThree\" ng-click=\"vm.show(3)\"><h3 class=\"mb-0\" style=\"background-color:#b3b3b3;padding:5px\"><a data-toggle=\"collapse\" data-parent=\"#accordion\" aria-expanded=\"true\" aria-controls=\"collapseOne\">How much do businesses pay for Premium Membership?</a></h3></div><div id=\"collapseThree\" class=\"collapse show\" role=\"tabpanel\" aria-labelledby=\"headingThree\" ng-show=\"vm.showThree\"><div class=\"card-block\"><p class=\"text-left\">Premium memberships for Rank-X cost $99 per month. When using a promo code businneses get 60 days free trial.</p></div></div></div><div class-=\"\" \"card\"=\"\"><div class=\"card-header\" role=\"tab\" id=\"headingFour\" ng-click=\"vm.show(4)\"><h3 class=\"mb-0\" style=\"background-color:#b3b3b3;padding:5px\"><a data-toggle=\"collapse\" data-parent=\"#accordion\" aria-expanded=\"true\" aria-controls=\"collapseFour\">What does it mean to be a Rank-X Promotor?</a></h3></div><div id=\"collapseFour\" class=\"collapse show\" role=\"tabpanel\" aria-labelledby=\"headingFour\" ng-show=\"vm.showFour\"><div class=\"card-block\"><p class=\"text-left\">Rank-X promotors are people working as independent contractors that help us promote, advertise and give feedback about the application. The success of Rank-X will depend strongly on its ability to spread the word out about its exsitance to businesses and to get business to subscribe to Rank-X to advertise their specials and promotions. Thus, Rank-X promotors have three basic responsibilities.</p><p class=\"text-left\"><strong>1. Become familiar with the app.</strong> Rank-X Promotors are expected to understand the working of the application, to participate regularly in the rankings, add content and do their best so the content of the application is always engaging, accurate and useful.</p><p class=\"text-left\"><strong>2. Market the application.</strong> Rank-X Promotors are expected to connect with business owners in their area show the value that Rank-X can have in their bussiness. The amount of money earned by a Rank-X promoter will be directly proportional to the amount of businesses they get to sign up.</p><p class=\"text-left\"><strong>3. Provide constant Feedback.</strong> Rank-X Promotors are expected to provide feedback of the workings of the app so it can be continually improved. By keeping the application running smoothly, with help customer retention and</p></div></div></div><div class-=\"\" \"card\"=\"\"><div class=\"card-header\" role=\"tab\" id=\"headingFive\" ng-click=\"vm.show(5)\"><h3 class=\"mb-0\" style=\"background-color:#b3b3b3;padding:5px\"><a data-toggle=\"collapse\" data-parent=\"#accordion\" aria-expanded=\"true\" aria-controls=\"collapseFive\">What are the benefits of becoming a Rank-X Promotor?</a></h3></div><div id=\"collapseFive\" class=\"collapse show\" role=\"tabpanel\" aria-labelledby=\"headingFive\" ng-show=\"vm.showFive\"><div class=\"card-block\"><p class=\"text-left\">All payments to promotors are strictly based on commissions. Rank-X offers lasting commissions on all accounts that a Rank-X promotor closes. As long as the account that the promoter closed are active, the Promotor will continue receiving commission. There is no limit on how much money a promotor can make.</p><p class=\"text-left\">Consider the example of a Rank-X promoter that closes one business per month and receives $30 commission per business (actual commission might vary). Promoter sign ups come with a 60 days free trial for that business. After free trial expires, and business start paying subscription, Rank-X promoter will get paid commission for that account as shown in the table below.</p><table class=\"table table-hover cursor\"><thead><tr><th align=\"middle\">Month</th><th align=\"middle\">Accnt 1</th><th align=\"middle\">Accnt 2</th><th align=\"middle\">Accnt 3</th><th align=\"middle\">Commission</th></tr></thead><tbody align=\"middle\"><tr><td>1st</td><td>On trial</td><td>-</td><td>-</td><td>$0.00</td></tr><tr><td>2nd</td><td>On trial</td><td>On trial</td><td>-</td><td>$0.00</td></tr><tr><td>3rd</td><td>Active</td><td>On trial</td><td>On trial</td><td>$30.00</td></tr><tr><td>4th</td><td>Active</td><td>Active</td><td>On trial</td><td>$60.00</td></tr><tr><td>5th</td><td>Active</td><td>Active</td><td>Active</td><td>$90.00</td></tr></tbody></table></div></div></div><div class-=\"\" \"card\"=\"\"><div class=\"card-header\" role=\"tab\" id=\"headingSix\" ng-click=\"vm.show(6)\"><h3 class=\"mb-0\" style=\"background-color:#b3b3b3;padding:5px\"><a data-toggle=\"collapse\" data-parent=\"#accordion\" aria-expanded=\"true\" aria-controls=\"collapseOne\">How do I become a Rank-X promoter?</a></h3></div><div id=\"collapseSix\" class=\"collapse show\" role=\"tabpanel\" aria-labelledby=\"headingSix\" ng-show=\"vm.showSix\"><div class=\"card-block\"><p class=\"text-left\">Becoming a Rank-X promoter is very simple. Only requirement is that you must have an active Facebook account. There is no cost to becoming a promoter, its completely free. To begin, login to Rank-X using your Facebook account. Once you are logged in, click the \'Promote\' link at the bottom of the page. It will redirect you to the Promoter Console, where you will be asked to fill in a form and you will get your Promoter Code right away.</p></div></div></div><footer class=\"footer\"><div class=\"container\"><p class=\"text-muted\">Rank-X is property of Rank-X LLC. San Diego, CA - 2016</p></div></footer></div></div>");
$templateCache.put("app/promoters/Partials/promoterconsole.html","<div ui-view=\"navbar\"></div><div id=\"veil\" ng-hide=\"vm.dataReady\"></div><div id=\"feedLoading\" ng-hide=\"vm.dataReady\"><div style=\"text-align: center\" ng-if=\"!vm.dataReady\"><div class=\"loading-pulse\"></div><p style=\"font-size:large\">loading your accounts...</p></div></div><div ng-if=\"vm.dataReady\"><div class=\"container\"><h3>Promoter Console</h3><div ng-if=\"vm.userIsPromoter\"><h4 align=\"center\" style=\"background-color:#b3b3b3;padding:5px\">Account Information</h4><p class=\"text-left\"><strong>First Name:</strong>&nbsp{{vm.promoter.firstname}}</p><p class=\"text-left\"><strong>Last Name:</strong>&nbsp{{vm.promoter.lastname}}</p><p class=\"text-left\"><strong>Email:</strong>&nbsp{{vm.promoter.email}}</p><p class=\"text-left\"><strong>Address:</strong>&nbsp{{vm.promoter.address}}</p><p class=\"text-left\"><strong>Phone Number:</strong>&nbsp{{vm.promoter.phone}}</p><p class=\"text-left\"><strong>Promoter Code:</strong>&nbsp{{vm.promoter.code}}</p><div class=\"text-right\" role=\"group\"><button type=\"button\" ng-click=\"vm.goEdit()\" class=\"btn btn-default\">Edit</button></div><h4 align=\"center\" style=\"background-color:#b3b3b3;padding:5px\">Accounts</h4><table class=\"table\" ng-if=\"!vm.noAns&&vm.overview\"><tbody><thead style=\"border-style:none;\"><tr><th>Business</th><th>Status</th></tr></thead><tr ng-repeat=\"x in vm.myaccnts\" style=\"cursor:pointer;\"><td ng-click=\"vm.gotoanswer(x)\">{{x.name}}</td><td align=\"middle\" style=\"{{x.style}}\" ng-click=\"vm.gotomanage(x)\">{{x.status}}</td></tr></tbody></table><div ng-if=\"vm.noAns\"><br><p>No businesses have signed up using your promoter code. For tips and suggestions on how to get businesses to sign up using your promoter code <a href=\"\" ng-click=\"vm.gotoPromotePage()\">click here</a>.</p></div></div><div ng-if=\"!vm.userIsPromoter\"><p>You are currently not registered to be a Promoter. Rank-X promoters help spread the word out about the app to local businesses, as well as monitoring the accuracy of content of the application. In exchange, promoters get paid monthly commissions on all businesses accounts they bring to Rank-X.</p><div class=\"text-center\"><button type=\"button\" ng-click=\"vm.goSignup()\" class=\"btn btn-success\">Sign Up</button> <button type=\"button\" ng-click=\"vm.gotoPromotePage()\" class=\"btn btn-primary\">Learn More</button></div></div><div class=\"text-right\" role=\"group\"><button type=\"button\" ng-click=\"vm.goBack()\" class=\"btn btn-default\">Back</button></div></div></div>");
$templateCache.put("app/promoters/Partials/promotersignup.html","<div ui-view=\"navbar\"></div><div class=\"container\"><h3>Promoter Sign Up</h3><br><form class=\"form-horizontal\" role=\"form\" name=\"answerForm\"><div class=\"form-group\"><label class=\"control-label capitalize\" style=\"padding-left:10px\">First Name:</label> <input class=\"form-control\" ng-model=\"vm.promoter.firstname\" placeholder=\"{{vm.promoter.firstname}}\" style=\"width:94%;margin-left:10px;margin-right:10px;\"> <label class=\"control-label capitalize\" style=\"padding-left:10px\">Last Name:</label> <input class=\"form-control\" ng-model=\"vm.promoter.lastname\" placeholder=\"{{vm.promoter.lastname}}\" style=\"width:94%;margin-left:10px;margin-right:10px;\"> <label class=\"control-label capitalize\" style=\"padding-left:10px\">Email:</label> <input class=\"form-control\" ng-model=\"vm.promoter.email\" placeholder=\"Your email address\" style=\"width:94%;margin-left:10px;margin-right:10px;\"> <label class=\"control-label capitalize\" style=\"padding-left:10px\">Phone:</label> <input class=\"form-control\" ng-model=\"vm.promoter.phone\" placeholder=\"123-123-1234\" style=\"width:94%;margin-left:10px;margin-right:10px;\"> <label class=\"control-label capitalize\" style=\"padding-left:10px\">Address:</label> <input class=\"form-control\" ng-model=\"vm.promoter.address\" placeholder=\"Your address\" style=\"width:94%;margin-left:10px;margin-right:10px;\"></div></form><br><div class=\"row\"><div class=\"col-xs-3 col-sm-3 col-md-2\"><div class=\"text-right\"><button class=\"btn btn-primary\" ng-click=\"vm.getcode()\">Get Code</button></div></div><div class=\"col-xs-9 col-sm-9 col-md-10\"><h3 style=\"color:blue; margin:2px\">{{vm.code}}</h3></div></div><br><div class=\"text-center\"><button class=\"btn btn-success\" ng-click=\"vm.submit()\">Submit</button></div><br></div>");
$templateCache.put("app/rank/Partials/RankChat.html","<div class=\"container\"><div class=\"row\"><div class=\"col-md-6\"><h1 class=\"page-heading\">This is a test</h1></div></div></div>");
$templateCache.put("app/rank/Partials/RankSummary.html","<div id=\"veil\" ng-hide=\"vm.dataReady\"></div><div id=\"feedLoading\" ng-hide=\"vm.dataReady\"><div style=\"text-align: center\" ng-if=\"!vm.dataReady\"><div class=\"loading-pulse\"></div><p style=\"font-size:large\">loading rank...</p></div></div><div ng-if=\"vm.dataReady\"><div class=\"container\"><div class=\"row\"><div class=\"container-bgbox col-xs-6 col-sm-6 col-md-4 col-lg-3\"><bg-box bc=\"{{vm.bc}}\" bc2=\"{{vm.bc2}}\" fc=\"{{vm.fc}}\" text=\"{{vm.ranking}}\" dir=\"horizontal\" w=\"100%\" h=\"{{vm.sm ? \'150px\':\'200px\'}}\"></bg-box></div><div class=\"col-xs-6 col-sm-6 col-md-4 col-lg-3\" style=\"margin:0px;padding:0px;border:0px;\" ng-if=\"!vm.isShortPhrase\"><img ng-src=\"{{vm.image1}}\" style=\"display:{{vm.image1 != undefined ? \'inline\':\'none\'}};width:100%;height:{{vm.sm ? \'150px\':\'200px\'}};\"></div><div class=\"hidden-xs hidden-sm col-md-4 col-lg-3\" style=\"margin:0px;padding:0px;border:0px;\" ng-if=\"!vm.isShortPhrase\"><img ng-src=\"{{vm.image2}}\" style=\"display:{{vm.image2 != undefined ? \'inline\':\'none\'}};width:100%;height:{{vm.sm ? \'150px\':\'200px\'}};\"></div><div class=\"hidden-xs hidden-sm hidden-md col-lg-3\" style=\"margin:0px;padding:0px;border:0px;\" ng-if=\"!vm.isShortPhrase\"><img ng-src=\"{{vm.image3}}\" style=\"display:{{vm.image3 != undefined ? \'inline\':\'none\'}};width:100%;height:{{vm.sm ? \'150px\':\'200px\'}};\"></div><div class=\"container col-xs-6 col-sm-6 col-md-4 col-lg-3\" ng-if=\"vm.isShortPhrase\" style=\"background-color:lightgray;color:black;height:{{sm ? \'150px\':\'200px\'}};margin:0px;padding:0px;border:0px;position:relative;\"><div style=\"padding:3px; margin:0px; position:absolute; top:50%; left:50%; margin-right:-50%;transform: translate(-50%,-50%)\"><h2 class=\"hidden-xs text-center\">{{vm.title1}}</h2><h3 class=\"hidden-sm hidden-md hidden-lg hidden-xl text-center\">{{vm.title1}}</h3></div></div><div class=\"container hidden-xs hidden-sm col-md-4 col-lg-3\" ng-if=\"vm.isShortPhrase\" style=\"background-color:lightgray;color:black;height:{{sm ? \'150px\':\'200px\'}};margin:0px;padding:0px;border:0px;position:relative;\"><div style=\"padding:3px; margin:0px; position:absolute; top:50%; left:50%; margin-right:-50%;transform: translate(-50%,-50%)\"><h2 class=\"hidden-xs text-center\">{{vm.title2}}</h2><h3 class=\"hidden-sm hidden-md hidden-lg hidden-xl text-center\">{{vm.title2}}</h3></div></div><div class=\"container hidden-xs hidden-sm hidden-md col-lg-3\" ng-if=\"vm.isShortPhrase\" style=\"background-color:lightgray;color:black;height:{{sm ? \'150px\':\'200px\'}};margin:0px;padding:0px;border:0px;position:relative;\"><div style=\"padding:3px; margin:0px; position:absolute; top:50%; left:50%; margin-right:-50%;transform: translate(-50%,-50%)\"><h2 class=\"hidden-xs text-center\">{{vm.title3}}</h2><h3 class=\"hidden-sm hidden-md hidden-lg hidden-xl text-center\">{{vm.title3}}</h3></div></div></div></div><br><p class=\"text-left\" ng-if=\"vm.sm\">&nbsp&nbspSort by:</p><div class=\"row\" style=\"margin:0px;padding:0px;\"><div class=\"col-xs-9 col-sm-10 col-md-10 col-lg-10\"><div class=\"btn-group text-left\"><p>{{vm.sm ? \'\':\'Sort by:\'}}<span><button class=\"btn btn-default {{vm.selRank}}\" ng-click=\"vm.sortByRank()\" ng-if=\"vm.type != \'Event\' && !vm.fnm\">Rank</button> <button class=\"btn btn-default {{vm.selUpV}}\" ng-click=\"vm.sortByUpV()\">Popular</button> <button class=\"btn btn-default {{vm.selDistance}}\" ng-click=\"vm.sortByDistance()\" ng-show=\"{{vm.type == \'Establishment\'}}\">Distance</button> <button class=\"btn btn-default {{vm.selDate}}\" ng-click=\"vm.sortByDate()\" ng-show=\"{{vm.type == \'Event\'}}\">Date</button></span></p></div></div><div class=\"col-xs-3 col-sm-2 col-md-2 col-lg-2 btn-group text-right\"><button class=\"btn btn-default\" ng-click=\"vm.share()\" style=\"padding-right:5px\">Share&nbsp&nbsp<span class=\"glyphicon glyphicon-share\"></span></button></div></div><div class=\"row\" style=\"margin:0px;\"><div class=\"col-xs-6 text-right\"><button ng-click=\"vm.goRank()\" class=\"btn btn-success {{vm.rankDisabled}}\">Rank</button></div><div class=\"col-xs-6 btn-group text-right\"><h4>Contributors: <b style=\"color:blue;\"><i>{{vm.numContributors}}&nbsp&nbsp</i></b></h4></div></div><br><table class=\"table table-hover cursor\"><tbody><thead><tr><th>{{vm.showR ? \'Rank\' : \'Votes\'}}</th><th ng-show=\"{{!vm.sm && !vm.fnm && !vm.isE}}\">Votes</th><th class=\"capitalize\" ng-repeat=\"h in vm.fields | filter:{isrequired:true}\">{{h.label}}</th><th ng-show=\"{{vm.type == \'Establishment\' && vm.haveLocation}}\">Distance (mi)</th><th ng-show=\"{{vm.type == \'Event\'}}\">Date</th><th ng-show=\"{{vm.type == \'Establishment\'}}\">Specials</th></tr></thead><tbody><tr ng-repeat=\"x in vm.answers track by $index\" ng-click=\"vm.answerDetail(x)\"><td>{{vm.showR ? x.Rank : x.upV}}</td><td ng-show=\"{{!vm.sm && !vm.fnm && !vm.isE}}\">{{x.upV}}</td><td ng-repeat=\"h in vm.fields | filter:{isrequired:true}\">{{ x[h.name]}}</td><td ng-show=\"{{vm.type == \'Establishment\' && vm.haveLocation}}\">{{x.dist}}</td><td ng-show=\"{{vm.type == \'Event\'}}\">{{x.date}}</td><td ng-show=\"{{vm.type == \'Establishment\'}}\" style=\"background-color:{{x.sp_bc}};color:{{x.sp_fc}}\">{{x.sp_title}}</td></tr></tbody></tbody></table><div class=\"row\" style=\"margin:0px;\"><div class=\"col-xs-2\" style=\"padding:0px\"><a class=\"btn btn-primary\" ng-click=\"vm.addAnswer()\">+</a></div><div class=\"col-xs-10\" style=\"display:{{vm.hideInfoBox ? \'none\':\'inline\'}};padding:0px;\" ng-if=\"!vm.addInfoMsgAck || vm.noAnswers\"><div class=\"alert alert-warning\" style=\"padding-top: 5px;padding-bottom: 5px;\"><a class=\"close\" data-dismiss=\"alert\" aria-label=\"close\" ng-click=\"vm.closeAddInfoMsg()\">&times;</a> <span class=\"glyphicon glyphicon-arrow-left\"></span><strong>&nbsp;&nbsp; {{vm.noAnswers ? \'Oops, we have nothing on this list.\':\'Are we missing one?\'}}</strong>&nbsp;&nbsp;Use the \'+\' button to add a new <span ng-if=\"vm.type == \'Establishment\'\">Establishment.</span> <span ng-if=\"vm.type == \'Organization\'\">Organization or Company.</span> <span ng-if=\"vm.type == \'Person\'\">Person.</span> <span ng-if=\"vm.type == \'PersonCust\'\">Professional.</span> <span ng-if=\"vm.type == \'Place\'\">Place.</span> <span ng-if=\"vm.type == \'Short-Phrase\'\">Answer.</span> <span ng-if=\"vm.type == \'Thing\'\">Item.</span> <span ng-if=\"vm.type == \'Event\'\">Event.</span></div></div></div><br><br ng-if=\"!vm.sm\"><div class=\"text-center\"><button ng-click=\"vm.loadComments()\" class=\"btn btn-default\" ng-class=\"vm.cm.commLoaded ? \'disabled\' : \'\'\" style=\"background-color:#e6e6e6;width:100%\">COMMENTS ({{vm.numcom}})</button></div><br ng-if=\"!vm.sm\"><div style=\"display:{{vm.cm.commLoaded ? \'inline\':\'none\'}}\"><div ng-repeat=\"x in vm.cm.comments\"><div class=\"col-xs-12 media\"><div ng-if=\"!x.picture\" class=\"profile-avatar-wrapper media-left\"><div class=\"empty-profile-avatar-wrapper\" style=\"background-color:{{x.bc}};color:{{x.fc}};\">{{x.initials}}</div></div><div ng-if=\"x.picture\" class=\"profile-avatar-wrapper media-left\" align=\"middle\"><img ng-src=\"{{x.picture}}\" class=\"img-responsive img-circle profile-avatar\"></div><div class=\"media-body\">{{x.body}}<br><small style=\"color:#bfbfbf\">{{x.username}} - {{x.date}}&nbsp&nbsp <span class=\"dropdown\"><i type=\"button\" class=\"fa fa-flag dropdown-toggle\" data-toggle=\"dropdown\"></i><ul class=\"dropdown-menu dropdown-menu-right\"><li><a ng-click=\"vm.cmFlag(1)\">Off-Topic</a></li><li><a ng-click=\"vm.cmFlag(2)\">Offensive</a></li><li><a ng-click=\"vm.cmFlag(3)\">Spam</a></li></ul></span></small></div></div><br></div><div style=\"display:{{(vm.cm.commLoaded && vm.cm.comments.length == 0 && !vm.isLoggedIn) ? \'inline\':\'none\'}}\"><br><p><small>Nobody has commented yet. Be the first. Log in, endorse answers and leave a comment.</small></p></div><div style=\"display:{{(vm.cm.commLoaded && vm.cm.comments.length > 0 && !vm.isLoggedIn) ? \'inline\':\'none\'}}\"><br><p><small>You must log in and endorse one or more answers to leave a comment.</small></p></div><div style=\"display:{{(vm.cm.commLoaded && vm.isLoggedIn && !vm.commentAllowed) ? \'inline\':\'none\'}}\"><br><p><small>Endorse one or more answers to leave a comment.</small></p></div><div style=\"display:{{(vm.isLoggedIn && vm.commentAllowed) ? \'inline\':\'none\'}}\"><div class=\"media\"><div ng-if=\"!user.picture.data.url\" class=\"profile-avatar-wrapper media-left\"><div class=\"empty-profile-avatar-wrapper\" style=\"background-color:{{x.bc}};color:{{x.fc}};\">{{x.initials}}</div></div><div ng-if=\"user.picture.data.url\" class=\"profile-avatar-wrapper media-left\" align=\"middle\"><img ng-src=\"{{user.picture.data.url}}\" class=\"img-responsive img-circle profile-avatar\"></div><div class=\"media-body\"><textarea class=\"form-control\" ng-model=\"vm.cm.newComment\" placeholder=\"Leave a comment\" style=\"margin-left:0px;margin-right:0px;\"></textarea></div></div><div class=\"text-right\"><button ng-click=\"vm.postComment()\" class=\"btn btn-primary\">Post</button></div></div></div></div>");
$templateCache.put("app/rank/Partials/editRanking.html","<div class=\"container\"><div class=\"well-rank\" ng-if=\"vm.nsm\"><h2 class=\"sub-header\">{{vm.ranking}} <span class=\"nomargin\"><button type=\"button\" class=\"btn btn-default pull-right\" style=\"vertical-align:middle;\" ng-click=\"vm.closeRank()\"><span class=\"glyphicon glyphicon-remove\" style=\"padding-top:0px;padding-bottom:0px;\" aria-hidden=\"true\"></span></button></span></h2></div><div class=\"well-rank\" ng-if=\"vm.sm\"><h3 class=\"sub-header\">{{vm.ranking}} <span class=\"nomargin\"><button type=\"button\" class=\"btn btn-default pull-right\" style=\"vertical-align:middle;\" ng-click=\"vm.closeRank()\"><span class=\"glyphicon glyphicon-remove\" style=\"padding-top:0px;padding-bottom:0px;\" aria-hidden=\"true\"></span></button></span></h3></div></div><h4>Edit Ranking</h4><br><label><strong>Title:</strong></label> <input class=\"form-control\" ng-model=\"vm.rankTitle\" type=\"text\" placeholder=\"{{vm.rankTitle}}\"> <label><strong>Question:</strong></label> <input class=\"form-control\" ng-model=\"vm.question\" type=\"text\" placeholder=\"{{vm.question}}\"> <label><strong>Tags:</strong></label> <input class=\"form-control\" ng-model=\"vm.tags\" type=\"text\" placeholder=\"{{vm.tags}}\"> <label><strong>Keywords:</strong></label> <input class=\"form-control\" ng-model=\"vm.keywords\" type=\"text\" placeholder=\"{{vm.keywords}}\"> <label><strong>AnswerTags:</strong></label> <input class=\"form-control\" ng-model=\"vm.answertags\" type=\"text\" placeholder=\"{{vm.answertags}}\"> <label><strong>IsAtomic:</strong></label> <input class=\"form-control\" ng-model=\"vm.isatomic\" type=\"text\" placeholder=\"{{vm.isatomic}}\"> <label><strong>Category-Strings:</strong></label> <input class=\"form-control\" ng-model=\"vm.catstr\" type=\"text\" placeholder=\"{{vm.catstr}}\"> <label><strong>Type:</strong></label> <input class=\"form-control\" ng-model=\"vm.type\" bs-typeahead=\"\" type=\"text\" placeholder=\"{{vm.type}}\" bs-options=\"c for c in vm.typeList\"> <label><strong>isMP Flag:</strong></label> <input class=\"form-control\" ng-model=\"vm.ismp\" type=\"text\" placeholder=\"{{vm.ismp}}\"><br><div class=\"form-group text-right\"><button type=\"button\" class=\"btn btn-primary\" ng-click=\"vm.goEdit()\">Edit</button> <button type=\"button\" class=\"btn btn-danger\" ng-click=\"vm.goDelete()\">Delete</button></div><br>");
$templateCache.put("app/rank/Partials/match.html","<div class=\"well-rank\" ng-if=\"vm.nsm\" style=\"margin:0px;\"><h2 class=\"sub-header\">{{vm.table.title}} <span class=\"nomargin\"><button type=\"button\" class=\"glyphicon glyphicon-remove pull-right\" style=\"margin:0px;padding:0px;border:0px;background-color:#006dcc;color:#002699;font-size:medium;\" ng-click=\"vm.closeRank()\"></button></span></h2></div><div class=\"well-rank\" ng-if=\"vm.sm\" style=\"margin:0px;\"><h3 class=\"sub-header\">{{vm.table.title}} <span class=\"nomargin\"><button type=\"button\" class=\"glyphicon glyphicon-remove pull-right\" style=\"margin:0px;padding:0px;border:0px;background-color:#006dcc;color:#002699;font-size:medium;\" ng-click=\"vm.closeRank()\"></button></span></h3></div><h3>{{vm.table.question}}</h3><div class=\"form-group text-center\"><div class=\"well well-dark\">Rank match <strong>{{vm.GP}}</strong> of <strong>{{vm.Tot}}</strong></div></div><div class=\"row\"><div class=\"col-xs-6 col-md-6 col-lg-6\"><div class=\"well well-light\" ng-click=\"vm.selectAnswer(1)\" ng-show=\"{{vm.type != \'Short-Phrase\'}}\"><span ng-repeat=\"f in vm.fields | filter:(f.isrequired=true)\">{{(f.name == \"name\" && vm.answer1.name) ? vm.answer1.name : \"\"}} {{(f.name == \"cityarea\" && vm.answer1.cityarea) ? \" - \"+ vm.answer1.cityarea : \"\"}}</span></div><img class=\"displayed\" src=\"{{vm.answer1.imageurl}}\" ng-click=\"vm.selectAnswer(1)\" style=\"width:100%;max-height:300px\" ng-show=\"{{vm.type != \'Short-Phrase\'}}\"><div class=\"container-answer\" style=\"width:100%; height:auto;\" ng-click=\"vm.selectAnswer(1)\" ng-show=\"{{vm.type == \'Short-Phrase\'}}\"><br><h2 style=\"text-align:center\"><strong>{{vm.answer1.name}}</strong></h2><br><h4 style=\"text-align:center\">{{vm.answer1.addinfo}}</h4></div></div><div class=\"col-xs-6 col-md-6 col-lg-6\"><div class=\"well well-light\" ng-click=\"vm.selectAnswer(2)\" ng-show=\"{{vm.type != \'Short-Phrase\'}}\"><span ng-repeat=\"f in vm.fields | filter:(f.isrequired=true)\">{{(f.name == \"name\" && vm.answer2.name) ? vm.answer2.name : \"\"}} {{(f.name == \"cityarea\" && vm.answer2.cityarea) ? \" - \"+ vm.answer2.cityarea : \"\"}}</span></div><img class=\"displayed\" src=\"{{vm.answer2.imageurl}}\" ng-click=\"vm.selectAnswer(2)\" style=\"width:100%;max-height:300px\" ng-show=\"{{vm.type != \'Short-Phrase\'}}\"><div class=\"container-answer\" style=\"width:100%; height:auto;\" ng-click=\"vm.selectAnswer(2)\" ng-show=\"{{vm.type == \'Short-Phrase\'}}\"><br><h2 style=\"text-align:center\"><strong>{{vm.answer2.name}}</strong></h2><br><h4 style=\"text-align:center\">{{vm.answer2.addinfo}}</h4></div></div></div><br><div class=\"row\"><div class=\"form-group text-left col-xs-6 col-md-6 col-lg-6\"><button ng-click=\"vm.answerDetail(1)\" type=\"button\" class=\"btn btn-success\">Details</button></div><div class=\"form-group text-right col-xs-6 col-md-6 col-lg-6\"><button ng-click=\"vm.answerDetail(2)\" type=\"button\" class=\"btn btn-success\">Details</button></div></div><div class=\"form-group text-center\"><button ng-click=\"vm.skipMatch()\" type=\"button\" class=\"btn btn-default\">I don\'t know, Skip</button> <button ng-click=\"vm.rankSummary()\" type=\"button\" class=\"btn btn-danger\">Stop</button></div><br>");}]);