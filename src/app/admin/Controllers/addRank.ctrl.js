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
