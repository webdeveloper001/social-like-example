(function () {
    'use strict';

    angular
        .module('app')
        .controller('editRanking', editRanking);

    editRanking.$inject = ['$location', '$rootScope', '$state','$stateParams', 'table','dialog'];

    function editRanking(location, $rootScope, $state, $stateParams, table, dialog) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'editRanking';

        vm.ranking = $rootScope.title;
        vm.closeRank = closeRank;
        vm.goEdit = goEdit;
        vm.goDelete = goDelete;
        
        vm.typeList = ["Person", "Establishment", "Place", "Activity", "Short-Phrase", "Organization", "Event","Thing"];

        activate();

        function activate() {
            
            $rootScope.rankIsActive = true;
            $rootScope.objNumAct = $rootScope.objNum;
            
            loadData();
            console.log("editRanking page Loaded!");

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
            
            table.update(item.id, fields, vals);
        }
        
        function goDelete(){            
            dialog.deleteRank(confirmDelete);           
        }
        
        function confirmDelete(){
            table.deleteTable($rootScope.cCategory.id);
        }      
    }
})();
