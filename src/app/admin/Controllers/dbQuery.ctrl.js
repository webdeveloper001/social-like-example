(function () {
    'use strict';

    angular
        .module('app')
        .controller('dbQuery', dbQuery);

    dbQuery.$inject = ['$location', '$rootScope', '$state','$stateParams', 'table','dialog','answer','catans'];

    function dbQuery(location, $rootScope, $state, $stateParams, table, dialog, answer, catans) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'dbQuery';
        
        vm.queryAnswer = queryAnswer;
        vm.delCatans = delCatans;
        vm.delAnswer = delAnswer;
    
        vm.isAdmin = $rootScope.isAdmin;
        
        activate();

        function activate() {
            //loadData();
            console.log("dbQuery page Loaded!");
        }
        
        function queryAnswer(){
            console.log("query Answer");
            //find answer
            vm.ansRes = [];
            var ansId = 0;
            var catansobj ={};
            for (var i=0; i < $rootScope.answers.length; i++){
                if ($rootScope.answers[i].name.indexOf(vm.val) > -1){
                    vm.ansRes.push($rootScope.answers[i]);
                }
            }
            for (var j=0; j < vm.ansRes.length; j++){
                vm.ansRes[j].catans = [];
                ansId = vm.ansRes[j].id
                for (var k=0; k < $rootScope.catansrecs.length; k++){
                    if (ansId == $rootScope.catansrecs[k].answer){
                        catansobj = $rootScope.catansrecs[k];
                            for (var n=0; n < $rootScope.content.length; n++){
                                if ($rootScope.catansrecs[k].category == $rootScope.content[n].id){
                                    catansobj.rank = $rootScope.content[n].title;
                                }
                            }
                    vm.ansRes[j].catans.push(catansobj);
                    }    
                }              
            }
        }
        
        function delCatans(y){
            catans.deleteRec(y.answer, y.category);
        }
        
        function delAnswer(x){
            answer.deleteAnswer(x.id);
        }
 
    }
})();
