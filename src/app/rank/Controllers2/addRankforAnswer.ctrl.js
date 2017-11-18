(function () {
    'use strict';

    angular
        .module('app')
        .controller('addRankforAnswer', addRankforAnswer);

    addRankforAnswer.$inject = ['$location', '$rootScope', '$state','$stateParams', 'table2','dialog','$window','answer'];

    function addRankforAnswer(location, $rootScope, $state, $stateParams, table2, dialog, $window, answer) {
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

            if ($rootScope.rankforAnswerMode == undefined) $state.go('cwrapper');

            if ($rootScope.rankforAnswerMode == 'edit'){
                ranks = JSON.parse($rootScope.canswer.ranks);
                idx = $rootScope.customranks.map(function(x) {return x.id; }).indexOf(ranks[$rootScope.rankIdx].id);
                vm.rankTitle = $rootScope.customranks[idx].title.replace(' @ '+$rootScope.canswer.name,'');
                vm.question = $rootScope.customranks[idx].question;
                vm.introtext = $rootScope.customranks[idx].introtext;
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
                vm.introtext = 'Tell us what your rank is about...';
            }
            //loadData();
            if ($rootScope.DEBUG_MODE) console.log("addRankforAnswer page Loaded!");
            
        }
        
        function validateData(){
            
            if (vm.rankTitle == 'Enter a title...' || vm.rankTitle == '' 
            || vm.rankTitle.length < 10) rankTitleOk = false;
            else rankTitleOk = true;
            if (vm.question == 'Enter a question...' || vm.question == ''
            || vm.question.length < 3 ) rankQuestionOk = false;
            else rankQuestionOk = true;
            
            item.title = vm.rankTitle +' @ ' + $rootScope.canswer.name;
            item.tags = '';
            item.keywords = '';
            item.type = 'Simple';
            item.question = vm.question;
            item.views = 0;
            item.answers = 0;
            item.introtext = vm.introtext;
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
                        table2.addTableforAnswer(item,colors,$rootScope.canswer.id).then(function(){
                            $state.go('answerRanksManager');
                        });
                    }
                    else{
                        if ($rootScope.customranks[idx].title != vm.rankTitle +' @ ' + $rootScope.canswer.name){
                            tfields.push('title');
                            tvals.push(vm.rankTitle +' @ ' + $rootScope.canswer.name);                            
                        }
                        if ($rootScope.customranks[idx].question != vm.question){
                            tfields.push('question');
                            tvals.push(vm.question);                            
                        }
                        if ($rootScope.customranks[idx].intro != vm.introtext){
                            tfields.push('introtext');
                            tvals.push(vm.introtext);                            
                        }
                        if (tfields.length > 0) {
                            table2.update($rootScope.customranks[idx].id, tfields, tvals).then(function(){
                            $state.go('answerRanksManager');
                        });
                        }
                        
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
