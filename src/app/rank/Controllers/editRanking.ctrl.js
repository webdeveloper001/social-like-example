(function () {
    'use strict';

    angular
        .module('app')
        .controller('editRanking', editRanking);

    editRanking.$inject = ['$location', '$rootScope', '$state','$stateParams', 'table'];

    function editRanking(location, $rootScope, $state, $stateParams, table) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'editRanking';

        vm.ranking = $rootScope.title;
        vm.closeRank = closeRank;
        vm.goEdit = goEdit;
        
        vm.typeList = ["Person", "Establishment", "Place", "Activity", "Short-Phrase", "Organization", "Event"];

        activate();

        function activate() {
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
  
        }
        
         function closeRank() {
                $rootScope.$emit('closeRank');                            
        }
        
        function goEdit(){
            
            var item = $rootScope.cCategory;
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
            console.log("fields  ", fields);
            console.log("vals  ", vals);
            table.update(item.id, fields, vals);
        }
    }
})();
