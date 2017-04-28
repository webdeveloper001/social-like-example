angular.module('app').directive('contentBlock', 
    ['$rootScope', '$state', 'answer', 'table', 'catans', '$timeout', 'vrows','$window','cblock','color','search',
    function ($rootScope, $state, answer, table, catans, $timeout, vrows, $window, cblock, color, search) {
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
        controller: ['$scope', 'query', '$http', 'answer', 'table', 'catans', '$timeout', 'vrows','$window','cblock','color','search',
            
            function contentCtrl($scope, query, $http, answer, table, catans, $timeout, vrows, $window, cblock, color, search) {
                var vm = $scope;
                vm.title = 'mycontent';

                vm.sm = $rootScope.sm;
                
                vm.maxRes = 4;

                vm.btext = 'see more';
                var strlen_o = 0;

                //Adjust picture size for very small displays
                if ($window.innerWidth < 768) vm.thumbheight = '80px';
                if ($window.innerWidth >= 768 && $window.innerWidth < 992) vm.thumbheight = '100px';
                if ($window.innerWidth >= 992 && $window.innerWidth < 1200) vm.thumbheight = '80px';
                if ($window.innerWidth > 1200) vm.thumbheight = '100px';
 
            }], //end controller
        link: function (scope) {

            if (scope.isDestroyed == undefined){
                    if (scope.modType == 'rankofweek') getRankofDay();
                    else loadContent();
            }
           
            var loadNhListener = $rootScope.$on('loadNh', function (e) {
                    if (scope.modType == 'rankofweek') getRankofDay();
                    else loadContent();
                });

             var applyRuleListener = $rootScope.$on('applyRule', function (e) {
                    applyRule();
                });
            
            function getRankofDay(){
                    //Clear images:
                    scope.image1 = "/assets/images/noimage.jpg";
                    scope.image2 = "/assets/images/noimage.jpg";
                    scope.image3 = "/assets/images/noimage.jpg";
                    scope.isShortPhrase = false;
                
                    //load colors and headline
                    for (var i = 0; i < $rootScope.headlines.length; i++) {
                        if ($rootScope.headlines[i].type == scope.modType) {
                            scope.bgc = $rootScope.headlines[i].bc;
                            scope.bgc2 = color.shadeColor(scope.bgc,0.5);
                            scope.fc = $rootScope.headlines[i].fc;
                            scope.headline = $rootScope.headlines[i].title;
                            break;
                        }
                    }

                    if ($rootScope.DEBUG_MODE) console.log("rankofday - ", $rootScope.rankofday[0]);

                    var searchVal = '';
                    var rt = '';
                    
                    //$rootScope.rankofday[0].main = 'Women\'s March';
                    if ($rootScope.isCity) searchVal = $rootScope.rankofday[0].main;
                    if ($rootScope.isNh) searchVal = $rootScope.rankofday[0].nh + ' ' + $rootScope.cnh;

                    scope.results = [];
                    //scope.content = $rootScope.content;
                    var valTags = searchVal.split(" ");

                    if ($rootScope.DEBUG_MODE) console.log("valTags _ ", valTags);

                    for (var j = 0; j < $rootScope.content.length; j++) {
                        //for (var j = 50; j < 60; j++) {
                        var r = true;
                        rt = $rootScope.content[j].title;
                        //check that all tags exist
                        for (var k = 0; k < valTags.length; k++) {
                            var tagCapitalized = valTags[k].charAt(0).toUpperCase() + valTags[k].slice(1);
                            var tagFirstLowered = valTags[k].charAt(0).toLowerCase() + valTags[k].slice(1);
                            /*
                            r = r && (rt.includes(valTags[k]) || rt.includes(valTags[k].toUpperCase()) || rt.includes(tagCapitalized) || rt.includes(tagFirstLowered));
                            */
                            r = r && ((rt.indexOf(valTags[k]) > -1) || (rt.indexOf(valTags[k].toUpperCase()) > -1) ||
                                (rt.indexOf(tagCapitalized) > -1) || (rt.indexOf(tagFirstLowered) > -1));

                        }
                        if (r) {
                            scope.results.push($rootScope.content[j]);
                            break;
                        }
                    }
                       
                    //Check if photos exist for Rank of Week
                    if (scope.results.length > 0 && scope.results[0] != undefined) {
                        if (scope.results[0].image1url != undefined) scope.image1 = scope.results[0].image1url;
                        if (scope.results[0].image2url != undefined) scope.image2 = scope.results[0].image2url;
                        if (scope.results[0].image3url != undefined) scope.image3 = scope.results[0].image3url;
                    }
                    
                    //Check if results is Short-Phrase
                    if (scope.results[0].type == 'Short-Phrase'){
                        
                        scope.isShortPhrase = true;
                        
                        var sPVals1 = scope.image1.split("##");
                        scope.title1=sPVals1[0];
                        scope.addinfo1 =sPVals1[1];
                        
                        var sPVals2 = scope.image2.split("##");
                        scope.title2=sPVals2[0];
                        scope.addinfo2=sPVals2[1];
                        
                        var sPVals3 = scope.image3.split("##");
                        scope.title3=sPVals3[0];
                        scope.addinfo3 =sPVals3[1];                        
                    }
                    
                    scope.rankOfDay = scope.results[0].title;

                    var colors = color.defaultRankColor(scope.results[0]);
                    scope.rdbc = colors[0];
                    scope.rdfc = colors[1];
                    
                    scope.rdbc2 = color.shadeColor(scope.rdbc,0.4);
                }

                //load content based on mode
                function loadContent() {

                    var catstr = '';
                    var idxs = [];
                    var nidx = 0;
                    var rankid = 0;
                    scope.results = [];
                    var bFound = false;

                    //load colors and headline
                    for (var i = 0; i < $rootScope.headlines.length; i++) {
                        if ($rootScope.headlines[i].type == scope.modType) {
                            scope.bgc = $rootScope.headlines[i].bc;
                            scope.bgc2 = color.shadeColor(scope.bgc,0.3);
                            scope.fc = $rootScope.headlines[i].fc;
                            scope.headline = $rootScope.headlines[i].title;
                            if ($rootScope.isNh &&
                                $rootScope.headlines[i].type != 'rxfeedback' &&
                                $rootScope.headlines[i].type != 'rxsuggestion') scope.headline = scope.headline + ' - ' + $rootScope.cnh;
                            break;
                        }
                    }
                
                    //load content 
                    for (var i = 0; i < $rootScope.cblocks.length; i++) {
                        if (($rootScope.cblocks[i].scope == 'city' && $rootScope.isCity) &&
                            ($rootScope.cblocks[i].type == scope.modType)) {
                            catstr = $rootScope.cblocks[i].catstr;
                            idxs = catstr.split(':');
                            shuffle(idxs);
                            for (var j = 0; j < idxs.length; j++) {
                                nidx = $rootScope.content.map(function(x) {return x.id; }).indexOf(Number(idxs[j]));
                                scope.results.push($rootScope.content[nidx]);
                            }
                            bFound = true;
                            break;
                        }

                        else if (($rootScope.cblocks[i].scope == 'nh' && $rootScope.isNh) &&
                            ($rootScope.cblocks[i].type == scope.modType) &&
                            ($rootScope.cblocks[i].scopename == $rootScope.cnh)) {
                            catstr = $rootScope.cblocks[i].catstr;
                            idxs = catstr.split(':');
                            shuffle(idxs);

                            for (var j = 0; j < idxs.length; j++) {
                                nidx = $rootScope.content.map(function(x) {return x.id; }).indexOf(Number(idxs[j])); 
                                scope.results.push($rootScope.content[nidx]);
                            }
                            bFound = true;
                            break;
                        }
                        else if ($rootScope.cblocks[i].scope == 'rx' && $rootScope.cblocks[i].type == scope.modType &&
                            $rootScope.cblocks[i].scopename == 'RankX') {
                            catstr = $rootScope.cblocks[i].catstr;
                            idxs = catstr.split(':');
                            for (var j = 0; j < idxs.length; j++) {
                                //scope.results.push($rootScope.content[idxs[j]]);
                                nidx = $rootScope.content.map(function(x) {return x.id; }).indexOf(Number(idxs[j])); 
                                scope.results.push($rootScope.content[nidx]);
                            }
                            bFound = true;
                            break;
                        }
                    }

                    //resLT6 is used to hide the <<see more>> choice
                    if (scope.results.length <= 6) scope.resLT6 = true;
                    else scope.resLT6 = false;

                    var resGT0 = (scope.results[0] != undefined);
                    scope.updateView(bFound && resGT0);

                    if (bFound && resGT0) scope.hideme = false;
                    else scope.hideme = true;
                    //
                    scope.resultsTop = [];
                    var resObj = {};
                    //var M = scope.results.length > 2 ? 3:scope.results.length;
                    var M = scope.results.length;
                    if (M > 0) {
                        for (var n = 0; n < M; n++) {
                            resObj = {};
                            resObj = JSON.parse(JSON.stringify(scope.results[n]));

                            //Set only ranks with good images on front-page
                            if (scope.results[n].image1url != $rootScope.EMPTY_IMAGE && 
                                scope.results[n].image1url != undefined &&
                                scope.results[n].image1url != ''){
                                editTitle(resObj);
                                parseShortAnswer(resObj);
                                scope.resultsTop.push(resObj);
                            }
                            else {
                                //shift up results, move rank with bad images to end of array
                                for (var m = n; m < M-1; m++){
                                    scope.results[m] = scope.results[m+1]; 
                                }
                                scope.results[M-1] = resObj;
                            }
                            if (scope.resultsTop.length > 2 || scope.resultsTop.length == M ) {
                                scope.results = scope.results.slice(scope.resultsTop.length+1);
                                break;
                            }
                        }
                        //scope.results = scope.results.slice(M+1);
                    }                    
                }

            function shuffle(array) {
                    var currentIndex = array.length, temporaryValue, randomIndex;

                    // While there remain elements to shuffle...
                    while (0 !== currentIndex) {

                        // Pick a remaining element...
                        randomIndex = Math.floor(Math.random() * currentIndex);
                        currentIndex -= 1;

                        // And swap it with the current element.
                        temporaryValue = array[currentIndex];
                        array[currentIndex] = array[randomIndex];
                        array[randomIndex] = temporaryValue;
                    }

                    return array;
                }

             function editTitle(x){
                    x.titlex = x.title.replace(' in San Diego','');
                    if (x.answers == 0 && x.type != 'Short-Phrase') x.image1url = "../../../assets/images/noimage.jpg";
                }

                function parseShortAnswer(x) {
                    //Check if results is Short-Phrase
                    if (x.type == 'Short-Phrase') {

                        x.isShortPhrase = true;
                        if (x.image1url != undefined) {
                            var sPVals1 = x.image1url.split("##");
                            x.title1 = sPVals1[0];
                            x.addinfo1 = sPVals1[1];
                        }
                        if (x.image2url != undefined) {
                            var sPVals2 = x.image2url.split("##");
                            x.title2 = sPVals2[0];
                            x.addinfo2 = sPVals2[1];
                        }
                        if (x.image3url != undefined) {
                            var sPVals3 = x.image3url.split("##");
                            x.title3 = sPVals3[0];
                            x.addinfo3 = sPVals3[1];
                        }
                    }
                }             

            scope.rankSel = function (x,nm) {
                if (nm) $rootScope.rankIsNearMe = true;
                else $rootScope.rankIsNearMe = false;
                if ($rootScope.editMode) $state.go('editRanking', { index: x.id });
                else {
                    $state.go('rankSummary', { index: x.id });
                }
            };
            scope.seeMore = function (maxRes, btext) {
                if (scope.maxRes == 4) {
                    scope.btext = 'see less';
                    scope.maxRes = 100;
                }
                else {
                    scope.btext = 'see more';
                    scope.maxRes = 4;
                }
                // scope.loadContent();
            }
            scope.updateView = function (bFound) {
                if (bFound) scope.hideme = false;
                else scope.hideme = true;
            }

            scope.$on('$destroy', loadNhListener); 
            scope.$on('$destroy', applyRuleListener);
            //scope.$on('$destroy', loadBlocksListener);
            scope.$on('$destroy',function(){
                scope.isDestroyed = true;
            });

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
        
        
                    /*//  2. Use this to add/remove a tag from a rank 
                    for (var i=0; i < vm.results.length; i++){
                        if (vm.results[i].title.includes("Greek")){
                            var tags = vm.results[i].tags + ' gyros baklava';
                            //var tags = vm.results[i].tags.replace('lifestyle','');
                            //var newtype = 'Event';
                            table.update(vm.results[i].id, ['tags'],[tags]);    
                        }            
                    } 
                    *///End of 2
        
                    /*//  3.Use this to correct the title of a group of ranks
                    for (var i=0; i < vm.results.length; i++){
                        if (vm.results[i].title.includes('Dry cleaners')) {
                            var titlex = vm.results[i].title.replace("Dry cleaners","Dry cleaners and tailors");
                            //var tagsx = vm.resultsT[i].tags.replace("tea","coffee shops internet tea quiet");
                            //console.log("tags ", tags);
                            table.update(vm.results[i].id, ['title'],[titlex]);
                        }
                    } 
                    */ //End of 3
            
                    /*//  4.Use this to add a neighborhood
                    //var nhs = ["Columbia", "Core", "Cortez Hill", "East Village", "Gaslamp Quarter", "Horton Plaza", "Little Italy",
                      //      "Marina", "Seaport Village"];
                    //var nhs = ["Torrey Pines", "Carmel Valley", "Miramar",
                    //"Kearny Mesa","Bankers HIll","Rancho Penasquitos",
                    //        "Sorrento Valley","Tierra Santa","Logan Heights","Serra Mesa","Normal Heights","Talmadge",
                    //        "Bird Rock","South San Diego","North City","San Carlos","Del Cerro"];
                    var nhs = ["Mission Beach"];
                    
                    var logi = 1;
                    var basetitle = '';
                    if (applyRuleDone == false){
                    //for (var i=0; i < vm.results.length; i++){
                        
                    for (var i=0; i < $rootScope.content.length; i++){
                          
                          if ($rootScope.content[i].title.includes('Hillcrest')){
                              
                          basetitle = $rootScope.content[i].title;
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
                                newtitle = basetitle.replace("Hillcrest", nhs[midx]);
                                tablex.title = newtitle;                            
                                table.addTable(tablex);
                                //console.log(midx, " - ", tablex.title);
                                //console.log("log idx: ",logi++);
                                //table.update($rootScope.content[i].id,['image1url','image2url','image3url'],
                                //['','','']);
                            }
                        //}
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
                    */ //End 4
        
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
                    /*//8. Generate Category Strings for non neighborhood ranks
                       var isDistrictRanking = false;             
                       for (var i=0; i<vm.results.length; i++){
                           //console.log("2");
                           if (vm.results[i].title.includes("Hillcrest")){
                               //console.log("2");
                               var catstr = '';
                               var fcatstr = '';
                               var genRank = vm.results[i].title.replace("Hillcrest", "Downtown");
                               for (var j=0; j<$rootScope.content.length; j++){
                                   if (genRank == $rootScope.content[j].title){
                                       if ($rootScope.content[j].catstr == null || //comment these 3
                                       $rootScope.content[j].catstr == undefined || //if want to redo everythign
                                       $rootScope.content[j].catstr.length == 0){  //categories
                                      // TODO ---- 6949 --- events need to add 6969
                                      // TODO ---- 473 -- law san diego --- ignore, isatomic=true, catstr='';
                                      
                                      //--- Prevent execution for specific ranks ---
                                      var cid = $rootScope.content[j].id;
                                      if (cid != 473 && cid != 3125 && cid !=6949 && cid != 7424 && cid != 7675 &&
                                          cid != 3124 && cid != 3163 && cid !=3202){
                                      
                                        console.log("Found gen rank --- ", $rootScope.content[j].title,' ',$rootScope.content[j].id);
                                        var srchStr = $rootScope.content[j].title.replace("Downtown","");
                                           for (var k=0; k<$rootScope.content.length; k++){

                                               if ($rootScope.content[k].title.includes(srchStr) && k!=j ){
                                                   //console.log("Found sub rank --- ", $rootScope.content[k].title);
                                                    isDistrictRanking = false;
                                                    for (var n=0; n<$rootScope.districts.length; n++){
                                                        if ($rootScope.content[k].title.includes($rootScope.districts[n])){
                                                            isDistrictRanking = true;
                                                        }     
                                                    }
                                                    if (isDistrictRanking) catstr = catstr + ':' + $rootScope.content[k].id;
                                               }

                                           }
                                           fcatstr = catstr.substring(1); //remove leading ':'
                                           console.log("final catstr ---", fcatstr)
                                        
                                           table.update($rootScope.content[j].id, ['isatomic','catstr'],[false, fcatstr]);
                                       }//this is specific rank braket
                                       } //this is bracket
                                   break;
                                   }
                               }                                              
                           }
                       }
                       //SPECIAL CASES //only when redoing everything
                       /*
                       for (var n=0; n<$rootScope.content.length; n++){
                           if ($rootScope.content[n].id == 473){
                               console.log("update(473)");
                               //table.update(473, ['isatomic','catstr'],[true, '']);
                           }
                           if ($rootScope.content[n].id == 3125){
                               console.log("update(3125)");
                               //table.update(3125, ['isatomic','catstr'],[true, '']);
                           }
                           if ($rootScope.content[n].id == 6949){
                               console.log("update(6949)");
                               //table.update(6949, ['isatomic','catstr'],[false, '6949:'+$rootScope.content[n].catstr]);
                           }
                           if ($rootScope.content[n].id == 7675){
                               console.log("update(7675)");
                               //table.update(7675, ['isatomic','catstr'],[false, '7675:'+$rootScope.content[n].catstr]);
                           }
                           if ($rootScope.content[n].id == 7424){
                               console.log("update(7424)");
                               //table.update(7424, ['isatomic','catstr'],[false, '7424:'+$rootScope.content[n].catstr]);
                           }
                       }
                       
                    *///End 8
               
                    /* //  9. Clear answer string for all non-atomic ranks 
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
                        catans.postRec2(res[p].answer,res[p].category); //postRec2 changed verify!!!
                    }
                        applyRuleDone = true;
                    //}
                    *///end of 10
                    /* //11. Open all contents to refresh number of answers
                    $timeout(function () {
                        $state.go('rankSummary', { index: $rootScope.content[midx].id });
                        midx++;
                        $rootScope.$emit('applyRule');
                    }, 350)
                    */ //End 11.
                
                    /*//12. Add 'pb' tag to all Pacific Beach
                    var tagstr = '';
                    for (var i=0; i<$rootScope.content.length; i++){
                        if ($rootScope.content[i].title.includes('Ocean Beach')){
                            if ($rootScope.content[i].tags.includes('ob') == false){
                                //console.log($rootScope.content[i].title);
                                tagstr = $rootScope.content[i].tags + ' ob';
                                console.log("tagstr - ", tagstr, $rootScope.content[i].title);
                                table.update($rootScope.content[i].id,['tags'],[tagstr]);
                            }
                        }
                    }
                    */ // End of 12
                    /*//13. Open all contents to refresh number of answers, add vrows
                    var catstr = var catArr = catstr.split(':').map(Number);
                    $timeout(function () {

                        //$state.go('rankSummary', { index: $rootScope.content[midx].id });
                        $state.go('rankSummary', { index: catArr[midx] });
                        //$state.go('rankSummary', { index: 74 });
                        midx++;
                        //console.log("midx - ", midx);
                        $rootScope.$emit('applyRule');
                    }, 350);
                    */ //
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
                    */ //End 15
                    /*//16. Run through all answers if they dont have vrows
                    var answer = {};
                    var hasvr = false;
                    if (!applyRuleDone) {
                        applyRuleDone = true;
                        for (var i = 0; i < $rootScope.answers.length; i++) {
                            answer = $rootScope.answers[i];
                            if (answer.type == 'Establishment' || answer.type == 'PersonCust') {
                                hasvr = false;

                                for (var n = 0; n < $rootScope.catansrecs.length; n++) {
                                    if ($rootScope.catansrecs[n].answer == answer.id) {
                                        var idx = $rootScope.content.map(function (x) { return x.id; }).indexOf($rootScope.catansrecs[n].category);
                                        $rootScope.cCategory = $rootScope.content[idx];
                                        break;
                                    }
                                }

                                for (var j = 0; j < $rootScope.cvrows.length; j++) {
                                    if ($rootScope.cvrows[j].answer == answer.id) {
                                        hasvr = true;
                                        break;
                                    }
                                }
                                
                                if (hasvr == false) {
                                    vrows.postVrows4Answer(answer);
                                    console.log(answer.name);
                                    //console.log($rootScope.cCategory.title);
                                    //console.log(midx++);
                                }
                                //if (hasvr) vrows.deleteVrowByAnswer(answer.id);
                            }
                        }
                    }
                    *///End 16
                    /* //17. Remove all binds;
                    var answerx = {};
                    for (var i = 0; i < $rootScope.answers.length; i++) {
                            answerx = $rootScope.answers[i];
                            if (answerx.owner != undefined && answerx.owner != 0) {
                                //console.log("answer name - ", answer.name, answer.id);
                                answer.updateAnswer(answerx.id, ['owner'], [0]);
                            }
                        }
                      /*  
                        var special = {};
                    for (var k = 0; k < $rootScope.specials.length; k++) {
                            special = $rootScope.specials[k];
                            //if (answer.owner != undefined && answer.owner != 0) {
                                console.log("special - ", special.answer);
                                 var idx = $rootScope.answers.map(function(x) {return x.id; }).indexOf(special.answer);
                                 console.log("answer with special - ", $rootScope.answers[idx].name);  
                            //}
                        }
                        */    
                    //End 17
                    /* //18. Reset views
                     for (var i=0; i < $rootScope.answers.length; i++){
                         if ($rootScope.answers[i].numcom != 0){
                             answer.updateAnswer($rootScope.answers[i].id, ['numcom'], [0]); 
                         }
                     }
                    */ //End 18
                    
                    /*//19. Print all answers that do not have address, phone number or website
                    for (var i=0; i<$rootScope.answers.length; i++){
                        if ($rootScope.answers[i].cityarea == 'Downtown'){
                           // if ($rootScope.answers[i].cityarea == 'Downtown'){
                                console.log("Answer Id. ", $rootScope.answers[i].id, " Name: ", $rootScope.answers[i].name, " Neighborhood: ", $rootScope.answers[i].cityarea);
                           // }
                        }
                    } */ //End 19
                    /*//20.Delete all catans from Downtown
                    var catid = 0;
                    for (var i=0; i<$rootScope.content.length; i++){
                        if ($rootScope.content[i].title.includes('Downtown')){
                             catid = $rootScope.content[i].id;
                             catans.deletebyCategory(catid);
                        }
                    }
                    *///end 20
                    /*//21. 
                    var url1 = '';
                    var url2 = '';
                    var url3 = '';
                    var noimage = $rootScope.EMPTY_IMAGE;
                    console.log("exec rule-abx");
                    var cats = '';
                    for (var i=0; i<$rootScope.content.length; i++){
                        url1 = $rootScope.content[i].image1url;
                        url2 = $rootScope.content[i].image2url;
                        url3 = $rootScope.content[i].image3url;
                        if ($rootScope.content[i].type != 'Short-Phrase') {
                            if (url1 != undefined && url1 != '' && !url1.includes('https') && url1 != noimage ||
                                url2 != undefined && url2 != '' && !url2.includes('https') && url2 != noimage ||
                                url3 != undefined && url3 != '' && !url3.includes('https') && url3 != noimage) {
                                console.log(url1 != undefined && url1 != '' && !url1.includes('https'),
                                url2 != undefined && url2 != '' && !url2.includes('https'),
                                url3 != undefined && url3 != '' && !url3.includes('https'));
                                console.log($rootScope.content[i].title);
                                console.log($rootScope.content[i].image1url);
                                console.log($rootScope.content[i].image2url);
                                console.log($rootScope.content[i].image3url);
                                cats = cats + $rootScope.content[i].id + ':';
                            }
                        }
                    }
                    console.log("cats - ", cats);
                    */// End of 21
                    /*//22. Set ismp on all main page ranks
                    for (var i=0; i<$rootScope.content.length; i++){
                        if ($rootScope.content[i].ismp == undefined){
                            table.update($rootScope.content[i].id, ['ismp'], [false]); 
                        }
                        //else table.update($rootScope.content[i].id, ['ismp'], [false]);
                    }
                    */// End 22
                    /*//23. Set ismp on all main page ranks
                    for (var i=0; i<$rootScope.cblocks.length; i++){
                        if ($rootScope.cblocks[i].scope == 'city'){
                            cblock.update($rootScope.cblocks[i].id, ['ismp'], [true]); 
                        }
                        else cblock.update($rootScope.cblocks[i].id, ['ismp'], [false]);
                    }
                    */// End 23
                    //test stripe server
                    //var url = 'http://rank-x.com/stripeServer/';
                    //var url = 'http://rank-x.com/';
                    /*var url = 'http://rankxserver.azurewebsites.net/stripeServer/';
                    var req = {
                        method: 'GET',
                        url: url,
                        headers: {
                            'X-Dreamfactory-API-Key': undefined,
                            'X-DreamFactory-Session-Token': undefined
                        }
                    }

                    $http(req).then(success, fail);

            function success(result) {
                console.log("success -", results);
                return result.data.resource;
            }
            
            function fail() {
                console.log("failure -");
            }*/
                   //24. Print categories 
                   /*for (var i=0; i <  vm.results.length; i++){
                       if (vm.results[i].title.includes('in San Diego')){
                        console.log(vm.results[i].title.replace('Hillcrest',''));
                       }
                   }
                   *///End 24                                                                                              
                } 
             
        },
    }
}

]);