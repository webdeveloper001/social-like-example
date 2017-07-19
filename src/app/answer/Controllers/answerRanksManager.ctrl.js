(function () {
    'use strict';

    angular
        .module('app')
        .controller('answerRanksManager', answerRanksManager);

    answerRanksManager.$inject = ['dialog', '$stateParams', '$state', '$rootScope', 'catans', 
    '$modal', 'edit', 'editvote', 'answer', 'table2','$window'];

    function answerRanksManager(dialog, $stateParams, $state, $rootScope, catans, 
    $modal, edit, editvote, answer, table2, $window) {
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
            if (vm.ranks == undefined) vm.ranks = [];
            for (var i=0; i<vm.ranks.length; i++){
                n = $rootScope.customranks.map(function(x) {return x.id; }).indexOf(vm.ranks[i].id);
                vm.ranks[i].title = $rootScope.customranks[n].title.replace(' @ '+$rootScope.canswer.name,'');
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
            if ($rootScope.DEBUG_MODE) console.log("vm.ranks - ", vm.ranks);                     
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
            var idx = $rootScope.customranks.map(function(x) {return x.id; }).indexOf(vm.ranks[x].id);
            selRank = x;
            dialog.deleteRank($rootScope.customranks[idx],execDeleteRank);           
        }

        function execDeleteRank(){
            table2.deleteTable(vm.ranks[selRank].id);
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
