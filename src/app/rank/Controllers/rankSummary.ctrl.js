(function () {
    'use strict';

    angular
        .module('app')
        .controller('rankSummary', rankSummary);

    rankSummary.$inject = ['dialog', '$stateParams', '$state', 'answers'
        , 'answer', 'mrecs', 'rank','catansrecs'
        , '$rootScope', '$modal', 'edits', 'editvote', 'votes', 'useractivities'];

    function rankSummary(dialog, $stateParams, $state, answers
        , answer, mrecs, rank, catansrecs
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

        vm.selOverall = 'active';
        vm.selPersonal = '';

        var votetable = [];
        var editvotetable = [];
        $rootScope.cvotes = [];
        $rootScope.ceditvotes = [];
        $rootScope.cmrecs_user = [];
        $rootScope.catansrecs = catansrecs;

        var answersFull = false;

        $rootScope.userHasRank = false;
        $rootScope.userActRecId = 0;        
        
        //TODO: Would like to add this abstract template, but dont know how         
        $rootScope.$on('$stateChangeSuccess', function (ev, to, toParams, from, fromParams) {
            $rootScope.previousState = from.name;
        });

        //This code, keeps the controller from executing for all search results
        if ($rootScope.viewCtn == $rootScope.viewNum) {
            activate();
            $rootScope.viewCtn++;
        }
        else {
            $rootScope.viewCtn++;
        } 
        
        function activate() {

            loadData(); //load data and write to RAM
            getUserData(); //if user is logged in, get user data (vote record, etc)
            createAnswerStatus(); //enables/disables 'Create Answer' button
            
            vm.tableimage = $rootScope.cCategory.imagefile;
            rank.computeRanking($rootScope.canswers, $rootScope.cmrecs);
            
            //TODO update answers in DB
            console.log("Rank Summary Loaded!");
            //console.log("$rootScope.user", $rootScope.user);

        }

        function getUserData() {

            if ($rootScope.isLoggedIn) {
                votes.loadVotesTable().then(function (votetable) {
                    //Load votes for this category
                    for (var i = 0; i < votetable.length; i++) {
                        if (votetable[i].category == $rootScope.cCategory.id) {
                            var voteitem = votetable[i];
                            //voteitem.vtidx = i;
                            $rootScope.cvotes.push(voteitem);
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
            $rootScope.viewCtn=0;
            $state.go("answerDetail", { index: index });
        }

        function goRank() {
            if ($rootScope.canswers.length > 1) {
                $rootScope.viewCtn = 0;
                $state.go("match");
            }
            else {
                dialog.getDialog('answersFew');
                return;
            }
        }

        function addAnswer() {
            //if ($rootScope.isLoggedIn) {
            if (true) {    

                if (answersFull) {
                    dialog.getDialog('answersFull');
                    return;
                }
                else {
                    $rootScope.viewCtn = 0;
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
            
            //Load current answers
            $rootScope.canswers = [];
            
            for (var i = 0; i < catansrecs.length; i++) {
                if (catansrecs[i].category == $rootScope.cCategory.id) {
                    for (var k = 0; k < answers.length; k++){
                        if (catansrecs[i].answer == answers[k].id){
                            $rootScope.canswers.push(answers[k]);
                            break;        
                        }
                    }                    
                }
            }    
            vm.answers = $rootScope.canswers;
            console.log("vm.answers", vm.answers);
            
            
            //*****TEMP********
            //vm.answers.specials = [];
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
            
            //temp test to json to translate
            /*
            var JSON_en = [];
            var item = {};
            for (var i=0; i<$rootScope.countries_en.length; i++){
                item = [$rootScope.countries_en[i],$rootScope.countries_po[i]];
                JSON_en.push(item); 
            }
            console.log('JSON_en ----- ',JSON.stringify(JSON_en));
            */
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
                $rootScope.viewCtn = 0;
                $rootScope.$emit('closeRank');                            
        }

    }
})();
