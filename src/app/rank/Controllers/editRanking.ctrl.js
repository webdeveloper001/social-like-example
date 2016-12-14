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
            
            table.update(item.id, fields, vals);
            closeRank();
        }
        
        function goDelete(){            
            dialog.deleteRank(confirmDelete);           
        }
        
        function confirmDelete(){
            table.deleteTable($rootScope.cCategory.id);
            catans.deletebyCategory($rootScope.cCategory.id);
        }      
    }
})();
