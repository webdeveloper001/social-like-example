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
            
        vm.addRanking = addRanking;
        
        vm.typeList = ["Person", "Establishment", "Place", "Activity", "Short-Phrase", "Organization", "Event"];

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
            item.views = 0;
            item.answers = 0;
            
            if (item.title == null || item.title == undefined || item.title.length < 10) rankTitleOk = false;
            if (!(item.type == 'Person' || item.type == 'Establishment' || item.type == 'Short-Phrase' || item.type == 'Event'
                || item.type == 'Organization' || item.type == 'Place' || item.type == 'Activity')) rankTypeOk = false;      
           
        }

        function addRanking(){
            validateData();
            
            if (rankTitleOk && rankTypeOk){
                table.addTable(item);
            }
            
            else{
                if (!rankTitleOk) dialog.getDialog('rankTitle');
                else dialog.getDialog('rankType');
            }            
        }
        
        function goBack(){
            $state.go('admin');
        }
                
    }
})();
