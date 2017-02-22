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
