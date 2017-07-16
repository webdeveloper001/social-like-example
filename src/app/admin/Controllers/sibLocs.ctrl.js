(function () {
    'use strict';

    angular
        .module('app')
        .controller('sibLocs', sibLocs);

    sibLocs.$inject = ['$location', '$rootScope', '$state','catans','$http','dialog','answer'];

    function sibLocs(location, $rootScope, $state, catans, $http, dialog, answer) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'sibLocs';

        vm.selAns = selAns;
        vm.addBrother = addBrother;
        vm.remAns = remAns;
        vm.confirm = confirm;
        
               
       activate();

        function activate() {

            loadData();            

            console.log("sibLocs page Loaded!");
            
        }

        function loadData(){
            console.log("query Answer");
            //find answer
            vm.ansOpts = [];
            var ansId = 0;
            for (var i=0; i < $rootScope.answers.length; i++){
                vm.ansOpts.push($rootScope.answers[i].name);
            }
            
        }

        function selAns(){
            for (var i=0; i < $rootScope.answers.length; i++){
                if (vm.answername == $rootScope.answers[i].name ){
                    vm.answer = $rootScope.answers[i];
                }
            }
            vm.answer.ansLocs = [];
            vm.locations =[];
            if (vm.answer){
                if (vm.answer.family){
                    vm.answer.ansLocs = vm.answer.family.split(':').map(Number);
                }
            }
            refreshLocations(vm.answer); 
        }

        function addBrother(){
            
            for (var i=0; i < $rootScope.answers.length; i++){
                if (vm.brothername == $rootScope.answers[i].name ){
                    
                    var isdup = false;
                     for (var n=0; n < vm.answer.ansLocs.length; n++){
                        if (vm.answer.ansLocs[n] == $rootScope.answers[i].id) {
                            isdup = true;
                            console.log("flag repeated");
                            break;
                        }
                     }
                     if ($rootScope.answers[i].id == vm.answer.id) {
                         console.log("flag2");
                         isdup = true;
                     }
                     if (!isdup) {
                         console.log("Added brother");
                         vm.answer.ansLocs.push($rootScope.answers[i].id);
                     }
                    //console.log("$rootScope.answers[i] ", $rootScope.answers[i]);
                }
                
                //console.log("vm.answer ", vm.answer);
            }
            
            console.log("@ addBrother ---> vm.answer.ansLocs",vm.answer.ansLocs);
            console.log("@ addBrother ---> vm.answer",vm.answer);
            refreshLocations();
            vm.brothername = '';
        }

        function refreshLocations(){

/*
           
  */          
            
            var idx = 0;
            if (vm.answer.ansLocs){
                vm.locations = [];
                for (var i=0; i< vm.answer.ansLocs.length; i++){
                     idx = $rootScope.answers.map(function(x) {return x.id; }).indexOf(vm.answer.ansLocs[i]);
                     //var isdup = false;
                     //for (var n=0; n < vm.locations.length; n++){
                     //   if (vm.locations[n].id == $rootScope.answers[idx].id) {
                     //       isdup = true;
                     //       break;
                     //   }
                    // }
                     //if (!isdup) {
                         vm.locations.push($rootScope.answers[idx]);
                     //}
                }
            }
        }

        function remAns(x){
            for (var i=0; i < vm.locations.length; i++){
                if (vm.locations[i].id == x.id){
                     vm.locations.splice(i,1);
                     vm.answer.ansLocs.splice(i,1);
                }
            }

            refreshLocations();

            console.log("vm.answer ", vm.answer);
        }

        function confirm(){
            dialog.confirmSiblings(vm.answer, execAdd);
        }
        
        function execAdd(){
            
            var bros = vm.answer.ansLocs;
            var idx = 0;
            var str = '';
            bros.push(vm.answer.id);

            console.log("bros - ", bros);

            for (var i=0; i < bros.length; i++){
                //idx = $rootScope.answers.map(function(x) {return x.id; }).indexOf(vm.answer.ansLocs[i]);
                str = '';
                for (var j=0; j < bros.length; j++){
                    if (i!=j) str = str + ':' + bros[j];                 
                }
                str = str.substring(1);
                answer.updateAnswer(bros[i],['family'],[str]);
                console.log("updated answer ", bros[i] ," brothers: ", str);
            }

            vm.answer = undefined;
            vm.locations = undefined;
            vm.brothername = '';
            vm.answername = '';
/*
            var str = '';
            for (var i=0; i < vm.answer.ansLocs.length ; i++){
                str = str + ':' + vm.answer.ansLocs[i];
            }
            vm.answer.family = str.substring(1);*/
        }
    }
})();
