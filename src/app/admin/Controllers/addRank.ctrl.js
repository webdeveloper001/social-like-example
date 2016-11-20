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
                            tablex.answers = 0;
                            tablex.views = 0;
                            tablex.answertags = '';
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
            vm.question = '';
        }
        
        function goBack(){
            $state.go('admin');
        }
       
                
    }
})();
