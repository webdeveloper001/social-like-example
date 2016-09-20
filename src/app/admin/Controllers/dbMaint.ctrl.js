(function () {
    'use strict';

    angular
        .module('app')
        .controller('dbMaint', dbMaint);

    dbMaint.$inject = ['$location', '$rootScope', '$state','$stateParams', 'table','dialog','answer','catans'];

    function dbMaint(location, $rootScope, $state, $stateParams, table, dialog, answer, catans) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'dbMaint';
        
        vm.showUrefAns = showUrefAns;
        vm.deleteAnswers = deleteAnswers;
        vm.showDuplicated = showDuplicated;
        vm.syncToFirst = syncToFirst;
        vm.syncToSecond = syncToSecond;
        vm.showDuplicatedOnlyName = showDuplicatedOnlyName;
    
        activate();

        function activate() {
            //loadData();
            console.log("dbMaint page Loaded!");

        }
        
        function showUrefAns(){
        var cans = 0;
        var ansIsRef = false;
        var resObj = {};
        vm.unrefans = [];
        for (var i=0; i < $rootScope.answers.length; i++){
            cans = $rootScope.answers[i];
            ansIsRef = false;
            for (var j=0; j<$rootScope.catansrecs.length; j++){
                if ($rootScope.catansrecs[j].answer == cans.id){
                    ansIsRef = true;
                    break;
                }
            }
            if (ansIsRef == false){
                resObj.name = cans.name;
                resObj.id = cans.id
                vm.unrefans.push(resObj);
            }
        }
        if (vm.unrefans.length > 0) vm.showDelete = true;
        else vm.showDelete = false;
            
        }
        
        function deleteAnswers(){
            for (var i=0; i < vm.unrefans.length; i++){
                answer.deleteAnswer(vm.unrefans[i].id);
            }
        }
        
        function showDuplicated(){
          // Find answers that are duplicated
            
          var canswer = {};
          var obj = {};
          vm.dupAnswers = [];
          var idx = 0;
          for (var i=0; i<$rootScope.answers.length; i++){
              canswer = $rootScope.answers[i];
                for (var j=0; j < $rootScope.answers.length; j++){
                    if (canswer.name == $rootScope.answers[j].name && canswer.location == $rootScope.answers[j].location && i != j){
                        //console.log("Duplicated answer: ", canswer.name);
                        obj = {};
                        obj.id = idx;
                        obj.add1 = canswer.addinfo;
                        obj.nh1 = canswer.cityarea;
                        obj.loc1 = canswer.location; 
                        obj.name1 = canswer.name;
                        obj.image1 = canswer.imageurl;
                        obj.id1 = canswer.id;
                        obj.name2 = $rootScope.answers[j].name;
                        obj.idx1 = i;
                        obj.idx2 = j;
                        obj.loc2 = $rootScope.answers[j].location;
                        obj.nh2 = $rootScope.answers[j].cityarea;
                        obj.add2 = $rootScope.answers[j].addinfo;
                        obj.image2 = $rootScope.answers[j].imageurl;
                        obj.id2 = $rootScope.answers[j].id;
                        vm.dupAnswers.push(obj);
                        idx++;                        
                    }
                }
          }                 
        } 
        
        function syncToFirst(x){
            //Sync to first answer in obj
            //Update catans from ans2 to ans1
            for (var i=0; i<$rootScope.catansrecs.length; i++){
                if (x.id2 == $rootScope.catansrecs[i].answer){
                    catans.updateRec($rootScope.catansrecs[i].id,["answer"],[x.id1]);
                    break;
                }                
            }
            //delete answer 2
            answer.deleteAnswer(x.id2);
            showDuplicated();            
        }
        
        function syncToSecond(x){
            //Sync to second answer in obj
            //Update catans from ans1 to ans2
            for (var i=0; i<$rootScope.catansrecs.length; i++){
                if (x.id1 == $rootScope.catansrecs[i].answer){
                    catans.updateRec($rootScope.catansrecs[i].id,["answer"],[x.id2]);
                    break;
                }                
            }
            //delete answer 2
            answer.deleteAnswer(x.id1);
            showDuplicated();
        }    
         function showDuplicatedOnlyName(){
          // Find answers that are duplicated
            
          var canswer = {};
          var obj = {};
          vm.dupAnsNames = [];
          var idx = 0;
          for (var i=0; i<$rootScope.answers.length; i++){
              canswer = $rootScope.answers[i];
                for (var j=0; j < $rootScope.answers.length; j++){
                    if (canswer.name == $rootScope.answers[j].name && canswer.cityarea == $rootScope.answers[j].cityarea && i != j){
                        //console.log("Duplicated answer: ", canswer.name);
                        obj = {};
                        obj.id = idx;
                        obj.add1 = canswer.addinfo;
                        obj.nh1 = canswer.cityarea;
                        obj.loc1 = canswer.location; 
                        obj.name1 = canswer.name;
                        obj.image1 = canswer.imageurl;
                        obj.id1 = canswer.id;
                        obj.name2 = $rootScope.answers[j].name;
                        obj.idx1 = i;
                        obj.idx2 = j;
                        obj.loc2 = $rootScope.answers[j].location;
                        obj.nh2 = $rootScope.answers[j].cityarea;
                        obj.add2 = $rootScope.answers[j].addinfo;
                        obj.image2 = $rootScope.answers[j].imageurl;
                        obj.id2 = $rootScope.answers[j].id;
                        vm.dupAnsNames.push(obj);
                        idx++;                        
                    }
                }
          }                 
        }             
    }
})();
