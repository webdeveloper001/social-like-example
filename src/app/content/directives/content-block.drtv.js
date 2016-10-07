angular.module('app').directive('contentBlock', ['$rootScope', '$state', function ($rootScope, $state) {
    'use strict';

    return {
        templateUrl: 'app/content/partials/content-block.html',
        transclude: true,
        scope: {
            modType: '@type',
            isDynamic: '=dynamic',
            isRoW: '=rankofweek',
            updateView: '&updateView'
        },
        controller: ['$scope', 'query', '$http', 'answer', 'table', 'catans', function contentCtrl($scope, query, $http, answer, table, catans) {
            var vm = $scope;
            vm.title = 'mycontent';

            vm.results = [];
            
            //Methods
            vm.loadContent = loadContent;

            if (vm.modType == 'query') vm.maxRes = 20;
            else vm.maxRes = 6;

            vm.btext = 'see more';
            var strlen_o = 0;

            if (!vm.isDynamic) {
                loadContent();
            }

            $rootScope.$on('refreshRanks', function (e) {
                vm.input = $rootScope.inputVal;
                if (vm.modType == 'query') getRanks();
            });

            $rootScope.$on('loadNh', function (e) {
                loadContent();
            });

            $rootScope.$on('applyRule', function (e) {
                applyRule();
            });

            //Filter content based on user input
            function getRanks() {
                vm.hideme = false;
                if ($rootScope.inputVal != undefined && vm.isDynamic) {
                    var userIsTyping = false;
                    var inputVal = $rootScope.inputVal;
                    
                    //check if search includes 'near me' or 'close to me' tags
                    if (inputVal.includes('near me') || inputVal.includes('near') ||
                        inputVal.includes('close') || inputVal.includes('close to') || inputVal.includes('close to me')) {
                        $rootScope.includeNearMe = true;
                        inputVal = inputVal.replace('near me', 'in San Diego');
                        inputVal = inputVal.replace('near', 'in San Diego');
                        inputVal = inputVal.replace('close to me', 'in San Diego');
                        inputVal = inputVal.replace('close to', 'in San Diego');
                        inputVal = inputVal.replace('close', 'in San Diego');
                    }
                    else {
                        $rootScope.includeNearMe = false;
                    }

                    if ($rootScope.isNh) inputVal = inputVal + ' ' + $rootScope.cnh;
                    //vm.showR = false;
                    //$rootScope.showR = false;
                    vm.results = [];
                    if (inputVal.length >= 3) {
                        //vm.content = $rootScope.content;
                        var valTags = inputVal.split(" ");
                        for (var j = 0; j < $rootScope.content.length; j++) {
                            //for (var j = 50; j < 60; j++) {
                            var r = true;
                            //check that all tags exist
                            for (var k = 0; k < valTags.length; k++) {
                                var tagCapitalized = valTags[k].charAt(0).toUpperCase() + valTags[k].slice(1);
                                var tagFirstLowered = valTags[k].charAt(0).toLowerCase() + valTags[k].slice(1);
                                r = r && ($rootScope.searchStr[j].includes(valTags[k]) ||
                                    $rootScope.searchStr[j].includes(valTags[k].toUpperCase()) ||
                                    $rootScope.searchStr[j].includes(tagCapitalized) ||
                                    $rootScope.searchStr[j].includes(tagFirstLowered));
                            }
                            if (r) {
                                //console.log("push to vm.results array");
                                if ($rootScope.includeNearMe) {
                                    var rankObj = JSON.parse(JSON.stringify($rootScope.content[j]));
                                    rankObj.title = rankObj.title.replace('in San Diego', 'close to me');
                                    //SPECIAL CASE
                                    if ($rootScope.content[j].title.includes('Rancho San Diego') == false) {

                                        vm.results.push(rankObj);
                                    }                                
                            }
                            else vm.results.push($rootScope.content[j]);
                        }
                    }
                        
                    //resLT6 is used to hide the <<see more>> choice
                    if (vm.results.length < 6) vm.resLT6 = true;
                    else vm.resLT6 = false;

                    if (inputVal.length >= strlen_o) userIsTyping = true;
                    else userIsTyping = false;
                    //if less than 5 results, write 'query record
                    if (vm.results.length <= 5 && (inputVal.length % 5 == 0) && userIsTyping) {
                        query.postQuery(inputVal, vm.results.length)
                        //console.log("query!")
                    }
                    strlen_o = inputVal.length;
                }
                else {
                    vm.results = [];
                }

            }
        }

            //load content based on mode
            function loadContent() {
                var catstr = '';
                var idxs = [];
                vm.results = [];
                var bFound = false;
                
                //load colors and headline
                for (var i = 0; i < $rootScope.headlines.length; i++) {
                    if ($rootScope.headlines[i].type == vm.modType) {
                        vm.bgc = $rootScope.headlines[i].bc;
                        vm.fc = $rootScope.headlines[i].fc;
                        vm.headline = $rootScope.headlines[i].title;
                        if ($rootScope.isNh) vm.headline = vm.headline + ' - ' + $rootScope.cnh;
                        break;
                    }
                }
                
                //load content 
                for (var i = 0; i < $rootScope.cblocks.length; i++) {
                    if (($rootScope.cblocks[i].scope == 'city' && $rootScope.isCity) &&
                        ($rootScope.cblocks[i].type == vm.modType)) {
                        catstr = $rootScope.cblocks[i].catstr;
                        idxs = catstr.split(':');
                        for (var j = 0; j < idxs.length; j++) {
                            vm.results.push($rootScope.content[idxs[j]]);
                        }
                        bFound = true;
                        break;
                    }

                    else if (($rootScope.cblocks[i].scope == 'nh' && $rootScope.isNh) &&
                        ($rootScope.cblocks[i].type == vm.modType) &&
                        ($rootScope.cblocks[i].scopename == $rootScope.cnh)) {
                        catstr = $rootScope.cblocks[i].catstr;
                        idxs = catstr.split(':');
                        for (var j = 0; j < idxs.length; j++) {
                            vm.results.push($rootScope.content[idxs[j]]);
                        }
                        bFound = true;
                        break;
                    }
                }
                
                //resLT6 is used to hide the <<see more>> choice
                if (vm.results.length <= 6) vm.resLT6 = true;
                else vm.resLT6 = false;

                var resGT0 = (vm.results[0] != undefined);
                vm.updateView(bFound && resGT0);

                if (bFound && resGT0) vm.hideme = false;
                else vm.hideme = true;
                
                //Check if photos exist for Rank of Week
                if ((vm.modType == 'rankofweek' || vm.modType == 'rankofweeknh') && vm.results.length > 0 && vm.results[0] != undefined) {
                    if (vm.results[0].image1url != undefined) vm.image1 = vm.results[0].image1url;
                    if (vm.results[0].image2url != undefined) vm.image2 = vm.results[0].image2url;
                    if (vm.results[0].image3url != undefined) vm.image3 = vm.results[0].image3url;
                }

            }
            var applyRuleDone = false;
        function applyRule() {
        console.log("apply Rule");
        // $rootScope.$emit('getLocation');   
            
        /*//  1.Use this code to get GPS location for alls answers starting at index $rootScope.answeridxgp
             
          var fa='';
          var lat=0;
          var lng=0;
          
          var API_KEY = 'AIzaSyC2gAzj80m1XpaagvunSDPgEvOCleNNe5A';
          var APP_API_KEY = '7e9a54a80a6ae850bc38ff768d75e143e75c273d1f7e2f265648020bf8c42a3b';
          var cAnswer = {};
          var url = '';
          var myLoc = '';
          
          delete $http.defaults.headers.common['X-Dreamfactory-API-Key'];
          
          cAnswer = $rootScope.answers[$rootScope.answeridxgps];
          
          //console.log("cAnswer",cAnswer);
          
          if (cAnswer.type == 'Establishment' && (cAnswer.location != undefined && cAnswer.location != "" && cAnswer.location != null)){
              //if ($rootScope.answers[i].id == 190){
                  //cAnswer = $rootScope.answers[i];
                  console.log("answer: ",$rootScope.answeridxgps, " location: ", cAnswer.location);
                  if (cAnswer.location.includes('San Diego') == false) {
                      myLoc = cAnswer.location + ' San Diego, CA';
                  }
                  else myLoc = cAnswer.location;
                  
                  url = 'https://maps.googleapis.com/maps/api/geocode/json?address='+ myLoc +'&key='+API_KEY;
                  
                  $http.get(url,{},{
                  headers: {
                      'Content-Type': 'multipart/form-data'
                      //'Access-Control-Allow-Headers': 'x-dreamfactory-api-key'
                   }
              }).then(function(result){
                  //console.log("google response:---", result);
                  fa = result.data.results[0].formatted_address;
                  lat = result.data.results[0].geometry.location.lat;
                  lng = result.data.results[0].geometry.location.lng;
                  console.log("fa - lat - lon", fa, lat, lng);
                  
                  $http.defaults.headers.common['X-Dreamfactory-API-Key'] = APP_API_KEY;
                  answer.updateAnswer(cAnswer.id,['lat','lng','location'],[lat,lng,fa]);
                  
                  if ($rootScope.answeridxgps < ($rootScope.answers.length-1)){
                          $rootScope.answeridxgps = $rootScope.answeridxgps + 1; 
                          $rootScope.$emit('applyRule');
                      }
                  
              });    
          }
          else{
              if ($rootScope.answeridxgps < ($rootScope.answers.length-2)){
                  $rootScope.answeridxgps = $rootScope.answeridxgps + 1; 
                  $rootScope.$emit('applyRule');
              }
          }    
          *///End of 1    
        
        
        /*//  2. Use this to add/remove a tag from a rank 
        for (var i=0; i < vm.resultsT.length; i++){
            if (vm.resultsT[i].title.includes("Public opinions of the Police")){
                var tags = vm.resultsT[i].tags + ' neighborhood';
                //var tags = vm.resultsT[i].tags.replace('italian','');
                table.update(vm.resultsT[i].id, ['tags'],[tags]);    
            }            
        } 
        *///End of 2
        
        /*//  3.Use this to correct the title of a group of ranks
        for (var i=0; i < vm.results.length; i++){
            var titlex = vm.results[i].title.replace("Gaslamp Quater","Gaslamp Quarter");
            //var tagsx = vm.resultsT[i].tags.replace("tea","coffee shops internet tea quiet");
            //console.log("tags ", tags);
            table.update(vm.results[i].id, ['title'],[titlex]);
        } 
         *///End of 3
            
        /*//  4.Use this to add a neighborhood
        var nhs = ["Columbia", "Core", "Cortez Hill", "East Village", "Gaslamp Quarter", "Horton Plaza", "Little Italy",
                "Marina", "Seaport Village"];
        var logi = 1;
        var basetitle = '';
        if (applyRuleDone == false){
        for (var i=0; i < vm.results.length; i++){
            
            basetitle = vm.results[i].title;
            //Copy object without reference
            var tablex = JSON.parse(JSON.stringify(vm.results[i]));
            tablex.id = undefined;
            tablex.views = 0;
            tablex.answers = 0;
            tablex.answertags = '';
            var newtitle = '';
            
            if (tablex.title.includes("in Hillcrest")){
                //for (var j=0; j<nhs.length; j++){
                    newtitle = basetitle.replace("Hillcrest", nhs[8]);
                    tablex.title = newtitle;                            
                    table.addTable(tablex);
                    //console.log(logi,tablex.id, tablex.title);
                    console.log("log idx: ",logi++);
                //}
            }
        }
        applyRuleDone = true;
        }
        else console.log("Rule already executed!!");
        *///End 4
        
        /*//  5.Use this for batch DELETE
        for (var i=0; i < vm.results.length; i++){
 //           if (vm.results[i].title.includes("in Core")){
                 //for (var j=0; j<$rootScope.catansrecs.length; j++){
                     //if ($rootScope.catansrecs[j].category == vm.resultsT[i].id){
                       //  catans.deleteRec($rootScope.catansrecs[j].answer,$rootScope.catansrecs[j].category);
                     //}
                 //}
                 table.deleteTable(vm.results[i].id);      
 //           }                   
       }
     */  //End 5
                        
               
        
        /*//6. Use this to add a ranking to all neighborhood 
         for (var i=0; i < vm.resultsT.length; i++){            
             //Copy object without reference
             var tablex = JSON.parse(JSON.stringify(vm.resultsT[i]));
             tablex.id = undefined;
             var newtitle = tablex.title.replace("Best steaks in", "Best art galleries in");
             tablex.title = newtitle;
             //var newtags = tablex.tags.replace("meat food", "beer pb bars");
             var newtags = "paintings culture";
             tablex.tags = newtags;
             tablex.answertags = '';
             //console.log("tags ", tags);
             table.addTable(tablex);
         }
         *///End 6
        
        /*//7. Add 'isMP' to all non-neighborhood ranks
                
                var isMain = true;
                for (var i=50; i<$rootScope.content.length; i++){
                    isMain = true;    
                    for (var j=0; j<$rootScope.neighborhoods.length; j++){
                        if ($rootScope.content[i].title.includes($rootScope.neighborhoods[j])){
                            isMain = false; break;
                        }
                    }
                    if (isMain){
                            var tags = $rootScope.content[i].tags + ' isMP';
                            table.update($rootScope.content[i].id, ['tags'],[tags]);                         
                    }
                } 
         *///End 7
         
         
                
        /*//8. Generate Category Strings for non neighborhood ranks            
           for (var i=0; i<vm.resultsT.length; i++){
               if (vm.resultsT[i].title.includes("Hillcrest")){
                   var catstr = '';
                   var fcatstr = '';
                   var genRank = vm.resultsT[i].title.replace("Hillcrest", "San Diego");
                   for (var j=0; j<$rootScope.content.length; j++){
                       if (genRank == $rootScope.content[j].title){
                           console.log("Found gen rank --- ", $rootScope.content[j].title);
                           var srchStr = $rootScope.content[j].title.replace("San Diego?","");
                               for (var k=0; k<$rootScope.content.length; k++){
                                   if ($rootScope.content[k].title.includes(srchStr) && k!=j ){
                                       console.log("Found sub rank --- ", $rootScope.content[k].title);
                                       catstr = catstr + ':' + $rootScope.content[k].id;
                                   }
                               }
                               fcatstr = catstr.substring(1);
                               console.log("final catstr ---", fcatstr)
                               table.update($rootScope.content[j].id, ['isatomic','catstr'],[false, fcatstr]);
                       break;
                       }
                   }                                              
               }
           }
          */ //End 8
               
        /*//  9. Clear answer string for all non-atomic ranks 
        for (var i=0; i < $rootScope.content.length; i++){
            if ($rootScope.content[i].isatomic == false){                
                var answertags = '';
                table.update($rootScope.content[i].id, ['answertags'],[answertags]);    
            }            
        } 
        *///End of 9                  
    }
}], //end controller
    link: function (scope) {
        scope.rankSel = function (x, index) {
            $rootScope.title = x.title;
            if ($rootScope.editMode) $state.go('editRanking', { index: x.id });
            else {
                $state.go('rankSummary', { index: x.id });
            }
        };
        scope.seeMore = function (maxRes, btext) {
            if (scope.maxRes == 6) {
                scope.btext = 'see less';
                scope.maxRes = 100;
            }
            else {
                scope.btext = 'see more';
                scope.maxRes = 6;
            }
            // scope.loadContent();
        }
        scope.updateView = function (bFound) {
            if (bFound) scope.hideme = false;
            else scope.hideme = true;
        }
    },
    }
}
    /*angular.module('app').directive('contentBlock', function() {
        */
]);