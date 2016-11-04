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
        controller: ['$scope', 'query', '$http', 'answer', 'table', 'catans', '$timeout','vrows', 
        function contentCtrl($scope, query, $http, answer, table, catans, $timeout,vrows) {
            var vm = $scope;
            vm.title = 'mycontent';

            vm.results = [];
            
            //Methods
            vm.loadContent = loadContent;

            if (vm.modType == 'query') vm.maxRes = 4000;
            else vm.maxRes = 6;

            vm.btext = 'see more';
            var strlen_o = 0;

            if (!vm.isDynamic) {
                if (vm.modType == 'rankofweek') getRankofDay();
                else loadContent();
            }

            $rootScope.$on('refreshRanks', function (e) {
                vm.input = $rootScope.inputVal;
                if (vm.modType == 'query') getRanks();
            });

            $rootScope.$on('loadNh', function (e) {
                if (vm.modType == 'rankofweek') getRankofDay();
                else loadContent();
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
            
            function getRankofDay(){
                
                //Clear images:
                vm.image1 = "../../../assets/images/noimage.jpg";
                vm.image2 = "../../../assets/images/noimage.jpg";
                vm.image3 = "../../../assets/images/noimage.jpg";
                
                //load colors and headline
                for (var i = 0; i < $rootScope.headlines.length; i++) {
                    if ($rootScope.headlines[i].type == vm.modType) {
                        vm.bgc = $rootScope.headlines[i].bc;
                        vm.fc = $rootScope.headlines[i].fc;
                        vm.headline = $rootScope.headlines[i].title;
                        break;
                    }
                }
                
                console.log("rankofday - ", $rootScope.rankofday[0]);
                    
                    var searchVal = '';
                    
                    if ($rootScope.isCity) searchVal = $rootScope.rankofday[0].main;                  
                    if ($rootScope.isNh) searchVal = $rootScope.rankofday[0].nh + ' ' + $rootScope.cnh;
                    
                    vm.results = [];
                   
                        //vm.content = $rootScope.content;
                        var valTags = searchVal.split(" ");
                        for (var j = 0; j < $rootScope.content.length; j++) {
                            //for (var j = 50; j < 60; j++) {
                            var r = true;
                            //check that all tags exist
                            for (var k = 0; k < valTags.length; k++) {
                                var tagCapitalized = valTags[k].charAt(0).toUpperCase() + valTags[k].slice(1);
                                var tagFirstLowered = valTags[k].charAt(0).toLowerCase() + valTags[k].slice(1);
                                r = r && ($rootScope.content[j].title.includes(valTags[k]) ||
                                    $rootScope.content[j].title.includes(valTags[k].toUpperCase()) ||
                                    $rootScope.content[j].title.includes(tagCapitalized) ||
                                    $rootScope.content[j].title.includes(tagFirstLowered));
                            }
                            if (r) {
                                vm.results.push($rootScope.content[j]);
                                break;
                            }
                        }
           /*
                    //Check if photos exist for Rank of Week
                    if (vm.results.length > 0 && vm.results[0] != undefined) {
                        if (vm.results[0].image1url != undefined) vm.image1 = vm.results[0].image1url;
                        if (vm.results[0].image2url != undefined) vm.image2 = vm.results[0].image2url;
                        if (vm.results[0].image3url != undefined) vm.image3 = vm.results[0].image3url;
                    }
             */       
                    //resLT6 is used to hide the <<see more>> choice
                if (vm.results.length <= 6) vm.resLT6 = true;
                else vm.resLT6 = false;

                var resGT0 = (vm.results[0] != undefined);
                vm.updateView(resGT0);

                if (resGT0) vm.hideme = false;
                else vm.hideme = true;    
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
                        if ($rootScope.isNh && 
                        $rootScope.headlines[i].type != 'rxfeedback' && 
                        $rootScope.headlines[i].type != 'rxsuggestion' ) vm.headline = vm.headline + ' - ' + $rootScope.cnh;
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
                    else if ($rootScope.cblocks[i].scope == 'rx' && $rootScope.cblocks[i].type == vm.modType &&
                        $rootScope.cblocks[i].scopename == 'RankX') {
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
                
            }
            
            var applyRuleDone = false;
            var midx = 0;
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
        
        
                /* //  2. Use this to add/remove a tag from a rank 
                for (var i=0; i < vm.results.length; i++){
                    if (vm.results[i].title.includes("Grocery stores")){
                        //var tags = vm.results[i].tags + ' places services';
                        var tags = vm.results[i].tags.replace('isMP','');
                        //var newtype = 'Event';
                        table.update(vm.results[i].id, ['tags'],[tags]);    
                    }            
                } 
                */ //End of 2
        
                /*//  3.Use this to correct the title of a group of ranks
                for (var i=0; i < vm.results.length; i++){
                    if (vm.results[i].title.includes('Things about living in') && 
                    vm.results[i].title.includes('Worst things about living in')==false){
                        var titlex = vm.results[i].title.replace("Things","Favorite things");
                        //var tagsx = vm.resultsT[i].tags.replace("tea","coffee shops internet tea quiet");
                        //console.log("tags ", tags);
                        table.update(vm.results[i].id, ['title'],[titlex]);
                    }
                } 
                */  //End of 3
            
                /*//  4.Use this to add a neighborhood
                //var nhs = ["Columbia", "Core", "Cortez Hill", "East Village", "Gaslamp Quarter", "Horton Plaza", "Little Italy",
                  //      "Marina", "Seaport Village"];
                var nhs = ["Torrey Pines", "Carmel Valley", "Miramar",
                "Kearny Mesa","Bankers HIll","Rancho Penasquitos",
                        "Sorrento Valley","Tierra Santa","Logan Heights","Serra Mesa","Normal Heights","Talmadge",
                        "Bird Rock","South San Diego","North City","San Carlos","Del Cerro"];
                
                var logi = 1;
                var basetitle = '';
                if (applyRuleDone == false){
                //for (var i=0; i < vm.results.length; i++){
                    
                for (var i=0; i < $rootScope.content.length; i++){
                      
                      if ($rootScope.content[i].title.includes('in ' + nhs[midx])){
                          
                    //      basetitle = $rootScope.content[i].title;
                    //basetitle = vm.results[i].title;
                    //Copy object without reference
                    //var tablex = JSON.parse(JSON.stringify(vm.results[i]));
                    
                    var tablex = JSON.parse(JSON.stringify($rootScope.content[i]));
                    tablex.id = undefined;
                    tablex.views = 0;
                    tablex.answers = 0;
                    tablex.answertags = '';
                    tablex.image1url = '';
                    tablex.image2url = '';
                    tablex.image3url = '';
                    var newtitle = '';
                    
                    //if (tablex.title.includes("in Hillcrest")){
                        //for (var j=0; j<nhs.length; j++){
                            //newtitle = basetitle.replace("Hillcrest", nhs[midx]);
                            //tablex.title = newtitle;                            
                            //table.addTable(tablex);
                            //console.log(midx, " - ", $rootScope.content[i].title);
                            //console.log("log idx: ",logi++);
                            table.update($rootScope.content[i].id,['image1url','image2url','image3url'],
                            ['','','']);
                        //}
                    }
                }
                    
                $timeout(function () {
                    //$state.go('rankSummary', { index: $rootScope.content[midx].id });
                    //$state.go('rankSummary', { index: 74 });
                    midx++;
                    //console.log("midx - ", midx);
                    $rootScope.$emit('applyRule');
                }, 5000);
                if (midx >= nhs.length-1) applyRuleDone = true;
                //applyRuleDone = true;
                }
                else console.log("Rule already executed!!");
                */  //End 4
        
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
                *///End 5
      
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
         
         
                //console.log("1");
                /* //8. Generate Category Strings for non neighborhood ranks            
                   for (var i=0; i<vm.results.length; i++){
                       //console.log("2");
                       if (vm.results[i].title.includes("Hillcrest")){
                           //console.log("2");
                           var catstr = '';
                           var fcatstr = '';
                           var genRank = vm.results[i].title.replace("Hillcrest", "San Diego");
                           for (var j=0; j<$rootScope.content.length; j++){
                               if (genRank == $rootScope.content[j].title){
                                   if ($rootScope.content[j].catstr == null || //comment these 3
                                   $rootScope.content[j].catstr == undefined || //if want to redo everythign
                                   $rootScope.content[j].catstr.length == 0){  //categories
                                    console.log("Found gen rank --- ", $rootScope.content[j].title);
                                    var srchStr = $rootScope.content[j].title.replace("San Diego","");
                                       for (var k=0; k<$rootScope.content.length; k++){
                                           if ($rootScope.content[k].title.includes(srchStr) && k!=j ){
                                               console.log("Found sub rank --- ", $rootScope.content[k].title);
                                               catstr = catstr + ':' + $rootScope.content[k].id;
                                           }
                                       }
                                       fcatstr = catstr.substring(1); //remove leading ':'
                                       console.log("final catstr ---", fcatstr)
                                       table.update($rootScope.content[j].id, ['isatomic','catstr'],[false, fcatstr]);
                                   } //this is bracket
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
                */ //End of 9
                // "Columbia", "Core", "Cortez Hill", "East Village", "Gaslamp Quarter", "Horton Plaza", "Little Italy",
                //      "Marina", "Seaport Village"];
                /*// 10. downtwon districts - create catans
                if (applyRuleDone) return;
                var srank = '';
                var res = [];
                var item ={};
                var district = '';
                for (var m = 0; m < $rootScope.districts.length; m++) {
                    district = $rootScope.districts[m];
                    console.log('@ district : ', district);
                    for (var i = 0; i < $rootScope.answers.length; i++) {
                        if ($rootScope.answers[i].cityarea == district) {
                            //console.log("found answer - ", $rootScope.answers[i]);

                            for (var j = 0; j < $rootScope.catansrecs.length; j++) {
                                if ($rootScope.catansrecs[j].answer == $rootScope.answers[i].id) {
                                    //console.log("found catans - ", $rootScope.catansrecs[j]);
                                    for (var k = 0; k < $rootScope.content.length; k++) {
                                        if ($rootScope.content[k].id == $rootScope.catansrecs[j].category) {
                                            //console.log("found category - ",$rootScope.content[k]); 
                                            srank = $rootScope.content[k].title.replace('Downtown', district);
                                            //console.log("srank - ", srank); 
                                            //break; 
                                            for (var n = 0; n < $rootScope.content.length; n++) {
                                                if ($rootScope.content[n].title == srank) {
                                                    //console.log("Found rank - ", $rootScope.content[n]);
                                                    console.log("add ", $rootScope.answers[i].name, ' to ', $rootScope.content[n].title);
                                                    item = {};
                                                    item.answer = $rootScope.answers[i].id;
                                                    item.category = $rootScope.content[n].id;
                                                    res.push(item);
                                                    //catans.postRec2($rootScope.answers[i].id,$rootScope.content[n].id);
                                                }
                                            }
                                        }
                                    }
                                    //break;
                                }
                            }
                        }
                    }
                }
                //console.log("res -- ", res);
                for (var p=0; p<res.length; p++){
                    catans.postRec2(res[p].answer,res[p].category);
                }
                    applyRuleDone = true;
                //}
                *///
                /*//11. Open all contents to refresh number of answers
                $timeout(function () {
                    $state.go('rankSummary', { index: $rootScope.content[midx].id });
                    midx++;
                    $rootScope.$emit('applyRule');
                }, 500)
                */
                
                /*//12. Add 'pb' tag to all Pacific Beach
                var tagstr = '';
                for (var i=0; i<$rootScope.content.length; i++){
                    if ($rootScope.content[i].title.includes('Ocean Beach')){
                        if ($rootScope.content[i].tags.includes('ob') == false){
                            tagstr = $rootScope.content[i].tags + ' ob';
                            //console.log("tagstr - ", tagstr, $rootScope.content[i].title);
                            table.update($rootScope.content[i].id,['tags'],[tagstr]);
                        }
                    }
                }
                */ // End of 12
                /*//13. Open all contents to refresh number of answers, add vrows
                $timeout(function () {
                    $state.go('rankSummary', { index: $rootScope.content[midx].id });
                    //$state.go('rankSummary', { index: 74 });
                    midx++;
                    console.log("midx - ", midx);
                    $rootScope.$emit('applyRule');
                }, 1500);
                *///
                /*//14. Validate all catans entries, checking category and answer values are valid.
                var catans1 = {};
                var cat1 = {};
                var cidx1 = 0;
                var cidx2 = 0;
                for (var i=0; i<$rootScope.catansrecs.length; i++){
                    catans1 = $rootScope.catansrecs[i];
                        cidx1 = $rootScope.content.map(function(x) {return x.id; }).indexOf(catans1.category);
                        cidx2 = $rootScope.answers.map(function(x) {return x.id; }).indexOf(catans1.answer);
                        cat1 = $rootScope.content[cidx1];
                        cat2 = $rootScope.answers[cidx2];
                        if (cat1 == undefined) {
                            //console.log("undefined catgory- ", catans1.category);
                            catans.deletebyCategory(catans1.category);
                            
                        }
                        if (cat2 == undefined) {
                            //console.log("undefined answer - ", catans1.answer);
                            catans.deleteAnswer(catans1.answer);
                        }
                }    
                *///End 14
                 
                /*//15. Add isdup to catans for the ones in Downtown to avoid duplicates in rankings
                var catans1 = {};
                var catans2 = {};
                var cat1 = {};
                var cat2 = {};
                var cidx1 = 0;
                var cidx2 = 0;
                var str = '';
                var isDt1 = false;
                var isDt2 = false;
                for (var i=0; i<$rootScope.catansrecs.length; i++){
                    catans1 = $rootScope.catansrecs[i];
                      
                    for (var j=0; j<$rootScope.catansrecs.length; j++){
                        catans2 = $rootScope.catansrecs[j];
                            if(catans1.answer == catans2.answer && i!=j){
                                //console.log("catans - ",catans1,catans2);
                                cidx1 = $rootScope.content.map(function(x) {return x.id; }).indexOf(catans1.category); 
                                cidx2 = $rootScope.content.map(function(x) {return x.id; }).indexOf(catans2.category);
                                
                                cat1 = $rootScope.content[cidx1];
                                cat2 = $rootScope.content[cidx2];
                                
                                isDt1 = cat1.title.includes('Downtown');
                                isDt2 = cat2.title.includes('Downtown');
                             
                                if (isDt1 && isDt2) {
                                    break;
                                }
                                
                                if (isDt1) {
                                    str = cat1.title.replace('Downtown','');
                                    if (cat2.title.includes(str)){
                                        //console.log(cat1.title, "  -  ", cat2.title);
                                        //console.log(catans1.isdup, "  -  ", catans2.isdup);
                                        catans.updateRec(catans1.id,['isdup'],[true]);
                                        break;
                                    } 
                                }
                                if (isDt2) {
                                    str = cat2.title.replace('Downtown','');
                                    if (cat1.title.includes(str)){
                                        //console.log(cat1.title, "  -  ", cat2.title);
                                        //console.log(catans1.isdup, "  -  ", catans2.isdup);
                                        catans.updateRec(catans2.id,['isdup'],[true]);
                                        break;
                                    } 
                                }     
                            }
                     }
                }    
                *///End 15
                /*//16. Run through all answers if they dont have vrows
                var answer = {};
                var hasvr = false;
                for (var i=0; i<$rootScope.answers.length; i++){
                    answer = $rootScope.answers[i];
                    if (answer.type == 'Establishment' || answer.type =='PersonCust'){
                        hasvr = false;
                        for (var j=0; j<$rootScope.cvrows.length; j++){
                            if ($rootScope.cvrows[j].answer == answer.id){
                                hasvr = true;
                                break;
                            }
                        }
                        if (hasvr == false) {
                            //vrows.postVrows4Answer(answer);
                            console.log(answer.name);
                        }
                    }
                }
                *///End 16
                                                               
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