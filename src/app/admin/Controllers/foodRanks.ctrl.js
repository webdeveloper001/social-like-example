(function () {
    'use strict';

    angular
        .module('app')
        .controller('foodRanks', foodRanks);

    foodRanks.$inject = ['$location', '$rootScope', '$state','catans','$http','answer','$timeout'];

    function foodRanks(location, $rootScope, $state, catans, $http, answer, $timeout) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'foodRanks';

        var foodanswersmap = [];
        
        vm.getRanks = getRanks;
               
       activate();

        function activate() {            

            console.log("foodRanks page Loaded!");
            
        }
        
        function getRanks(){
            console.log("getRanks");
            
            var str = '';
            var title = '';
            for (var i=0; i<$rootScope.content.length; i++){
                if ($rootScope.content[i].tags.indexOf('food') > -1){            //food
                        str = str + ':' + $rootScope.content[i].id;  
                    }
            }
            
            var fstr = str.substring(1);
            var catArr = fstr.split(':').map(Number);
            
            var catansrec = {};
            var answerid = 0;
            var idx = 0;
            var foodAnswers = [];
            var foodAnswersMap = [];
            var isDup = false;
            var strAns = '';
            for (var i=0; i<$rootScope.catansrecs.length; i++){
                catansrec = $rootScope.catansrecs[i];
                for (var j=0; j< catArr.length; j++){
                    if (catansrec.category == catArr[j]){
                      answerid = catansrec.answer;
                      //foodAnswersMap = [];
                      //if (foodAnswers.length > 0) {
                          //console.log("foodAnswers - ", foodAnswers.length);
                        //foodAnswersMap = foodAnswers.map(function(x) {return x.id;});
                        //console.log("foodAnswersMAp - ", foodAnswersMap.length);
                      //}
                      idx = $rootScope.answers.map(function(x) {return x.id; }).indexOf(answerid);
                      if (idx < 0) {
                          console.log("idx - ", answerid, "catansrec - ", catansrec.id, catansrec.answer, catansrec.category);
                          catans.deleteRec(catansrec.answer, catansrec.category);  
                      }
                      //only add if its not already added
                      isDup = false;
                      if (foodAnswers.length > 0 && idx > 0){
                        for (var n=0; n < foodAnswers.length; n++){
                            if (foodAnswers[n].id == $rootScope.answers[idx].id) {
                                isDup = true;
                                break;
                            }
                        }
                      }
                      if (!isDup) {
                          //console.log("$rootScope.answers[idx] - ", $rootScope.answers[idx]);
                          strAns = strAns + ':' + $rootScope.answers[idx].id;
                          foodAnswers.push($rootScope.answers[idx]);
                          //answer.updateAnswer($rootScope.answers[idx].id,['isfood'],[true]);
                          //console.log("add food answer");
                      }                         
                    }
                } 
            }
            foodanswersmap = foodAnswers.map(function(x) {return x.id;});
            setisfood(0);
            //console.log("foodAnswers - ", foodAnswers.length);
            //console.log("Food ranks: - ", fstr);
            //console.log("Food ranks length: - ", catArr.length);
            console.log("Answers Ids: - ", strAns.substring(1));
            console.log("Food answers length: - ", foodAnswers.length);
           
        }

        function setisfood(x){
            //if answer is food related
            if (foodanswersmap.indexOf($rootScope.answers[x].id) > -1) {
                answer.updateAnswer($rootScope.answers[x].id, ['isfood'], [true]);
                $timeout(function () {
                    x++;
                    console.log(x," ", $rootScope.answers[x].name, ", isfood is TRUE");
                    if (x < $rootScope.answers.length) setisfood(x);
                }, 100);
            }
            //if not food related, set to false
            else{
                answer.updateAnswer($rootScope.answers[x].id, ['isfood'], [false]);
                $timeout(function () {
                    x++;
                    console.log(x," ",$rootScope.answers[x].name, ", isfood is FALSE");
                    if (x < $rootScope.answers.length) setisfood(x);
                }, 100);
            }
        }
    }
})();
