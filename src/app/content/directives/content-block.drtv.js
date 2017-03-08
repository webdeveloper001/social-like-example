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
        controller: ['$scope', 'query', '$http', 'answer', 'table', 'catans', '$timeout', 'vrows','$window','cblock',
            
            function contentCtrl($scope, query, $http, answer, table, catans, $timeout, vrows, $window, cblock) {
                var vm = $scope;
                vm.title = 'mycontent';

                vm.results = [];
                vm.results_nm = [];
                vm.sm = $rootScope.sm;
                
                //Methods
                vm.loadContent = loadContent;

                if (vm.modType == 'query') vm.maxRes = 4000;
                else vm.maxRes = 4;

                vm.btext = 'see more';
                var strlen_o = 0;

                //Adjust picture size for very small displays
                if ($window.innerWidth < 768) vm.thumbheight = '80px';
                if ($window.innerWidth >= 768 && $window.innerWidth < 992) vm.thumbheight = '100px';
                if ($window.innerWidth >= 992 && $window.innerWidth < 1200) vm.thumbheight = '80px';
                if ($window.innerWidth > 1200) vm.thumbheight = '100px';

                //if (!vm.isDynamic) {
                //  console.log("this is the spot");
                if (vm.modType == 'rankofweek') getRankofDay();
                else if (vm.modType == 'query') getRanks();
                else loadContent();
                //}
                
                //console.log("I am directive instance! ",vm.modType,vm.isDynamic,vm.isRoW);

                $rootScope.$on('refreshRanks', function (e) {
                    //vm.input = $rootScope.inputVal;
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
                    var rt = '';
                    var ss = '';
                    var inm = false;

                    vm.nm = false;
                    vm.rt = false;
                    vm.rt_nm = false;

                    var rank = {};
                    var tagCapitalized = '';
                    var tagFirstLowered = '';
                    var rankObj = {};
                    /*
                    function compare(a, b) {
                        return a.isatomic - b.isatomic;
                    }
                    */

                    if ($rootScope.inputVal != undefined && vm.isDynamic) {
                        var userIsTyping = false;
                        var inputVal = $rootScope.inputVal;
                        //Check if user typed 'near me' conditions
                        if (inputVal.indexOf('near me') > -1 ||
                            inputVal.indexOf('near') > -1 ||
                            inputVal.indexOf('close') > -1 ||
                            inputVal.indexOf('close to') > -1 ||
                            inputVal.indexOf('close to me') > -1) {
                            inm = true;
                            inputVal = inputVal.replace('near me', 'in San Diego');
                            inputVal = inputVal.replace('near', 'in San Diego');
                            inputVal = inputVal.replace('close to me', 'in San Diego');
                            inputVal = inputVal.replace('close to', 'in San Diego');
                            inputVal = inputVal.replace('close', 'in San Diego');
                        }
                        else {
                            inm = false;
                        }
                        
                        //ignore user typed words such as 'best', 'top'
                        if (inputVal.indexOf('best ') > -1 ) inputVal = inputVal.replace('best ', '');
                        if (inputVal.indexOf('Best ') > -1 ) inputVal = inputVal.replace('Best ', '');
                        if (inputVal.indexOf('top ') > -1 ) inputVal = inputVal.replace('top ', '');
                        if (inputVal.indexOf('Top ') > -1 ) inputVal = inputVal.replace('Top ', '');
                        if (inputVal == 'Food ') inputVal = inputVal.replace('Food ', 'Food Near Me');
                        if (inputVal == 'food ') inputVal = inputVal.replace('food ', 'Food Near Me');
                        
                        //Special Cases
                        if (inputVal == 'pho' || inputVal == 'Pho'){
                            inputVal = 'vietnamese';
                        }

                        if ($rootScope.isNh) inputVal = inputVal + ' ' + $rootScope.cnh;
                        //vm.showR = false;
                        //$rootScope.showR = false;
                        vm.results = [];
                        vm.results_nm = [];
                        vm.results_rt = [];
                        vm.results_rt_nm = [];

                        if (inputVal.length >= 3) {
                            //vm.content = $rootScope.content;
                            var valTags = inputVal.split(" ");
                            for (var j = 0; j < $rootScope.content.length; j++) {
                                ss = $rootScope.searchStr[j]; //Search string
                                rt = $rootScope.content[j].title; // title
                                rank = $rootScope.content[j];

                                var r_ss = true; //match in search string
                                var r_rt = true; //match in title
                                var sc = false; //special case
                                
                                //check that all tags exist
                                for (var k = 0; k < valTags.length; k++) {
                                    tagCapitalized = valTags[k].charAt(0).toUpperCase() + valTags[k].slice(1);
                                    tagFirstLowered = valTags[k].charAt(0).toLowerCase() + valTags[k].slice(1);

                                    r_ss = r_ss &&
                                    (ss.indexOf(valTags[k]) > -1 ||
                                        ss.indexOf(valTags[k].toUpperCase()) > -1 ||
                                        ss.indexOf(tagCapitalized) > -1 ||
                                        ss.indexOf(tagFirstLowered) > -1);

                                    r_rt = r_rt &&
                                    (rt.indexOf(valTags[k]) > -1 ||
                                        rt.indexOf(valTags[k].toUpperCase()) > -1 ||
                                        rt.indexOf(tagCapitalized) > -1 ||
                                        rt.indexOf(tagFirstLowered) > -1);
                                }

                                if (r_rt && rank.tags.indexOf('isMP') > -1) {
                                    vm.results_rt.push($rootScope.content[j]);
                                    vm.rt = true;
                                }

                                else if (r_ss) {
                                    if (inm) {
                                        if (rank.title.indexOf('in San Diego') > -1) {
                                            vm.results.push($rootScope.content[j]);
                                        }
                                    }
                                    else vm.results.push($rootScope.content[j]);
                                }
                            }
                            //show first non-atomic ranks -- for better user experience
                            //vm.answers = vm.results.sort(compare);
                            /*
                            if (inm) {
                                for (var k = 0; k < vm.results.length; k++) {
                                    console.log("results- ",vm.results[k].title);
                                    if (vm.results[k].title.indexOf('in San Diego') > -1) {
                                        rt = vm.results[k].title.replace('in San Diego', 'close to me');
                                        vm.results[k].title = rt;
                                        //break;
                                    }
                                }
                                //if a result includes San Diego, also add a results as 'Near Me'
                            }
                            else {*/
                            /*
                            for (var k = 0; k < vm.results_rt.length; k++) {
                                rt = vm.results_rt[k].title; //Rank title
                                if (rt.indexOf('in San Diego') > -1 && vm.results_rt[k].isatomic == false) {
                                    rankObj = {};
                                    rankObj = JSON.parse(JSON.stringify(vm.results_rt[k]));
                                    rankObj.title = rankObj.title.replace('in San Diego', 'close to me');
                                    vm.results_nm.push(rankObj);
                                    vm.nm = true;
                                }
                            }*/

                            for (var k = 0; k < vm.results.length; k++) {
                                rt = vm.results[k].title; //Rank title
                                if (rt.indexOf('in San Diego') > -1 && vm.results[k].isatomic == false) {
                                    rankObj = {};
                                    rankObj = JSON.parse(JSON.stringify(vm.results[k]));
                                    rankObj.title = rankObj.title.replace('in San Diego', 'close to me');
                                    vm.results_nm.push(rankObj);
                                    vm.nm = true;
                                }
                            }
                            for (var k = 0; k < vm.results_rt.length; k++) {
                                rt = vm.results_rt[k].title; //Rank title
                                if (rt.indexOf('in San Diego') > -1 && vm.results_rt[k].isatomic == false) {
                                    rankObj = {};
                                    rankObj = JSON.parse(JSON.stringify(vm.results_rt[k]));
                                    rankObj.title = rankObj.title.replace('in San Diego', 'close to me');
                                    vm.results_rt_nm.push(rankObj);
                                    vm.rt_nm = true;
                                }
                            }
                            //console.log("vm.results_nm - ", vm.results_nm);
                            //}
                            
                            //resLT6 is used to hide the <<see more>> choice
                            if (vm.results.length < 6) vm.resLT6 = true;
                            else vm.resLT6 = false;

                            if (inputVal.length >= strlen_o) userIsTyping = true;
                            else userIsTyping = false;
                            //if less than 5 results, write 'query record
                            /*
                            if (vm.results.length <= 5 && (inputVal.length % 5 == 0) && userIsTyping) {
                                query.postQuery(inputVal, vm.results.length)
                                //console.log("query!")
                            }*/
                            strlen_o = inputVal.length;
                            //sort results, give priority to city ones
                            function compare(a, b) {
                                return b.title.indexOf('in San Diego') - a.title.indexOf('in San Diego');
                            }
                            vm.results = vm.results.sort(compare);    
                        }
                
                      else {
                            vm.results = [];
                        }
                    }
                }

                function getRankofDay() {
                
                    //Clear images:
                    /*
                    vm.image1 = "../../../assets/images/noimage.jpg";
                    vm.image2 = "../../../assets/images/noimage.jpg";
                    vm.image3 = "../../../assets/images/noimage.jpg";
                    */
                    vm.image1 = "/assets/images/noimage.jpg";
                    vm.image2 = "/assets/images/noimage.jpg";
                    vm.image3 = "/assets/images/noimage.jpg";
                    vm.isShortPhrase = false;
                
                    //load colors and headline
                    for (var i = 0; i < $rootScope.headlines.length; i++) {
                        if ($rootScope.headlines[i].type == vm.modType) {
                            vm.bgc = $rootScope.headlines[i].bc;
                            vm.fc = $rootScope.headlines[i].fc;
                            vm.headline = $rootScope.headlines[i].title;
                            break;
                        }
                    }

                    if ($rootScope.DEBUG_MODE) console.log("rankofday - ", $rootScope.rankofday[0]);

                    var searchVal = '';
                    var rt = '';
                    
                    //$rootScope.rankofday[0].main = 'Women\'s March';
                    if ($rootScope.isCity) searchVal = $rootScope.rankofday[0].main;
                    if ($rootScope.isNh) searchVal = $rootScope.rankofday[0].nh + ' ' + $rootScope.cnh;

                    vm.results = [];
                        
                    //vm.content = $rootScope.content;
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
                            vm.results.push($rootScope.content[j]);
                            break;
                        }
                    }
                       
                    //Check if photos exist for Rank of Week
                    if (vm.results.length > 0 && vm.results[0] != undefined) {
                        if (vm.results[0].image1url != undefined) vm.image1 = vm.results[0].image1url;
                        if (vm.results[0].image2url != undefined) vm.image2 = vm.results[0].image2url;
                        if (vm.results[0].image3url != undefined) vm.image3 = vm.results[0].image3url;
                    }
                    
                    //Check if results is Short-Phrase
                    if (vm.results[0].type == 'Short-Phrase'){
                        
                        vm.isShortPhrase = true;
                        
                        var sPVals1 = vm.image1.split("##");
                        vm.title1=sPVals1[0];
                        vm.addinfo1 =sPVals1[1];
                        
                        var sPVals2 = vm.image2.split("##");
                        vm.title2=sPVals2[0];
                        vm.addinfo2=sPVals2[1];
                        
                        var sPVals3 = vm.image3.split("##");
                        vm.title3=sPVals3[0];
                        vm.addinfo3 =sPVals3[1];                        
                    }
                    
                    vm.rankOfDay = vm.results[0].title;
                    
                    //Determine background color for rank of rankofday
                    if (vm.results[0].tags.indexOf('food')>-1) {vm.rdbc = 'brown'; vm.rdfc = '#f8f8ff';}
                    else if (vm.results[0].tags.indexOf('lifestyle')>-1) {vm.rdbc = '#008080'; vm.rdfc = '#f8f8ff';}
                    else if (vm.results[0].tags.indexOf('social')>-1) {vm.rdbc = '#4682b4'; vm.rdfc = '#f8f8ff';}
                    else if (vm.results[0].tags.indexOf('city')>-1) {vm.rdbc = 'gray'; vm.rdfc = '#f8f8ff';}
                    else if (vm.results[0].tags.indexOf('neighborhood')>-1) {vm.rdbc = 'gray'; vm.rdfc = '#f8f8ff';}
                    else if (vm.results[0].tags.indexOf('politics')>-1) {vm.rdbc = '#595959'; vm.rdfc = '#f8f8ff';}
                    else if (vm.results[0].tags.indexOf('sports')>-1) {vm.rdbc = '#e6e6e6'; vm.rdfc = '#0033cc';} 
                    else if (vm.results[0].tags.indexOf('beauty')>-1) {vm.rdbc = '#a3297a'; vm.rdfc = '#f8f8ff';}
                    else if (vm.results[0].tags.indexOf('health')>-1) {vm.rdbc = 'green'; vm.rdfc = '#f8f8ff';}
                    else if (vm.results[0].tags.indexOf('technology')>-1) {vm.rdbc = 'gray'; vm.rdfc = '#f8f8ff';}
                    else if (vm.results[0].tags.indexOf('dating')>-1) {vm.rdbc = '#b22222'; vm.rdfc = '#f8f8ff';}
                    else if (vm.results[0].tags.indexOf('personalities')>-1) {vm.rdbc = '#e6b800'; vm.rdfc = 'black';}
                    else {vm.rdbc = 'gray'; vm.rdfc = '#f8f8ff';} 

                    //resLT6 is used to hide the <<see more>> choice
                    /*
                    if (vm.results.length <= 6) vm.resLT6 = true;
                    else vm.resLT6 = false;

                    var resGT0 = (vm.results[0] != undefined);
                    vm.updateView(resGT0);

                    if (resGT0) vm.hideme = false;
                    else vm.hideme = true;
                    */
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
                                $rootScope.headlines[i].type != 'rxsuggestion') vm.headline = vm.headline + ' - ' + $rootScope.cnh;
                            break;
                        }
                    }
                
                    //load content 
                    for (var i = 0; i < $rootScope.cblocks.length; i++) {
                        if (($rootScope.cblocks[i].scope == 'city' && $rootScope.isCity) &&
                            ($rootScope.cblocks[i].type == vm.modType)) {
                            catstr = $rootScope.cblocks[i].catstr;
                            idxs = catstr.split(':');
                            shuffle(idxs);
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
                            shuffle(idxs);
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

                    //
                    vm.resultsTop = [];
                    var resObj = {};
                    var M = vm.results.length > 2 ? 3:vm.results.length;
                    if (vm.results.length > 0) {
                        for (var n = 0; n < M; n++) {
                            resObj = {};
                            resObj = vm.results[n];
                            editTitle(resObj);
                            parseShortAnswer(resObj);
                            vm.resultsTop.push(resObj);
                        }
                        vm.results = vm.results.slice(M+1);
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
                        if (vm.results[i].title.includes("Middle Eastern food")){
                            var tags = vm.results[i].tags + ' iranian kebabs lebanese kabob falafel hummus';
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
                    var noimage = '../../../assets/images/noimage.jpg';
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
                }
            }], //end controller
        link: function (scope) {
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
        },
    }
}
    /*angular.module('app').directive('contentBlock', function() {
        */
]);