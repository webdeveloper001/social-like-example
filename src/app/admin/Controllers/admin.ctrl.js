(function () {
    'use strict';

    angular
        .module('app')
        .controller('admin', admin);

    admin.$inject = ['$location', '$rootScope', '$state','table','answer','categorycode','$q','vrows','catans','common'];

    function admin(location, $rootScope, $state, table, answer, categorycode, $q, vrows, catans, common) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'admin';

        vm.selKeywords = 'active';
        vm.selViews = '';
        vm.selFlags = '';
        vm.selRankings = '';
        vm.selPlan = '';
        vm.selCleanDB = '';

        vm.goBack = goBack;
        vm.keywords = keywords;
        vm.views = views;
        vm.flags = flags;
        vm.addRank = addRank;
        vm.dbMaint = dbMaint;
        vm.dbQuery = dbQuery;
        vm.update = update;
        vm.foodranks = foodranks;
        vm.sibLocs = sibLocs;
        vm.payment = payment;
        vm.plan = plan;
        vm.bizAdmin = bizAdmin;
        vm.applyRule = applyRule;
        vm.cleanDB = cleanDB;
        //vm.fbpost = fbpost;
        
        activate();

        function activate() {

            if (!$rootScope.isAdmin && !$rootScope.dataAdmin) $state.go('cwrapper');
            else{
            
            vm.isDET = $rootScope.isLoggedIn && ($rootScope.user.id == '10104518570729893' ||
                                          $rootScope.user.id == 30 ||
                                          $rootScope.user.id == 41 ||  
                                          $rootScope.user.id == 42 ||
                                          $rootScope.user.id == 30 ||
                                          $rootScope.user.id == 187959328383879 ||
                                          $rootScope.user.id == 194039991109146);
            
            vm.isAdmin = $rootScope.user.is_sys_admin || $rootScope.isAdmin;
            vm.dataAdmin = $rootScope.dataAdmin;
            console.log("admin page Loaded!");
            }
            
        }
        function keywords() {
            vm.selKeywords = 'active';
            vm.selViews = '';
            vm.selFlags = '';
            vm.selRankings = '';
            vm.selDbMaint = '';
            vm.selQuery = '';
            vm.selUpdate = '';
            vm.selFoodRanks = '';
            vm.selPayment = '';
            vm.selPlan = '';
            vm.selBizAdmin = '';
            vm.selSibLocks = '';
            vm.selCleanDB = '';

            $state.go('queries');

        }
        function views() {
            vm.selKeywords = '';
            vm.selViews = 'active';
            vm.selFlags = '';
            vm.selRankings = '';
            vm.selDbMaint = '';
            vm.selQuery = '';
            vm.selUpdate = '';
            vm.selFoodRanks = '';
            vm.selPayment = '';
            vm.selPlan = '';
            vm.selBizAdmin = '';
            vm.selSibLocks = '';
            vm.selCleanDB = '';


            $state.go('views');

        }
        function flags() {
            vm.selKeywords = '';
            vm.selViews = '';
            vm.selFlags = 'active';
            vm.selRankings = '';
            vm.selDbMaint = '';
            vm.selQuery = '';
            vm.selUpdate = '';
            vm.selFoodRanks = '';
            vm.selPayment = '';
            vm.selPlan = '';
            vm.selBizAdmin = '';
            vm.selSibLocks = '';
            vm.selCleanDB = '';


            $state.go('flags');

        }

        function addRank() {
            vm.selKeywords = '';
            vm.selViews = '';
            vm.selFlags = '';
            vm.selRankings = 'active';
            vm.selDbMaint = '';
            vm.selQuery = '';
            vm.selUpdate = '';
            vm.selFoodRanks = '';
            vm.selPayment = '';
            vm.selPlan = '';
            vm.selBizAdmin = '';
            vm.selSibLocks = '';
            vm.selCleanDB = '';


            $state.go('addRank');

        }

        function dbMaint() {
            vm.selKeywords = '';
            vm.selViews = '';
            vm.selFlags = '';
            vm.selRankings = '';
            vm.selDbMaint = 'active';
            vm.selQuery = '';
            vm.selUpdate = '';
            vm.selFoodRanks = '';
            vm.selPayment = '';
            vm.selPlan = '';
            vm.selBizAdmin = '';
            vm.selSibLocks = '';
            vm.selCleanDB = '';

            
            $state.go('dbMaint');
        }

        function dbQuery() {
            vm.selKeywords = '';
            vm.selViews = '';
            vm.selFlags = '';
            vm.selRankings = '';
            vm.selDbMaint = '';
            vm.selQuery = 'active';
            vm.selUpdate = '';
            vm.selFoodRanks = '';
            vm.selPayment = '';
            vm.selPlan = '';
            vm.selBizAdmin = '';
            vm.selSibLocks = '';
            vm.selCleanDB = '';

            
            $state.go('dbQuery');
        }
        
         function update() {
            vm.selKeywords = '';
            vm.selViews = '';
            vm.selFlags = '';
            vm.selRankings = '';
            vm.selDbMaint = '';
            vm.selQuery = '';
            vm.selUpdate = 'active';
            vm.selFoodRanks = '';
            vm.selPayment = '';
            vm.selPlan = '';
            vm.selBizAdmin = '';
            vm.selSibLocks = '';
            vm.selCleanDB = '';

            
            $state.go('updateHeaders');
        }
        
        function foodranks(){
            vm.selKeywords = '';
            vm.selViews = '';
            vm.selFlags = '';
            vm.selRankings = '';
            vm.selDbMaint = '';
            vm.selQuery = '';
            vm.selUpdate = '';
            vm.selFoodRanks = 'active';
            vm.selPayment = '';
            vm.selPlan = '';
            vm.selBizAdmin = '';
            vm.selSibLocks = '';
            vm.selCleanDB = '';

            
            $state.go('foodRanks');
            
        }

        function sibLocs(){
            vm.selKeywords = '';
            vm.selViews = '';
            vm.selFlags = '';
            vm.selRankings = '';
            vm.selDbMaint = '';
            vm.selQuery = '';
            vm.selUpdate = '';
            vm.selFoodRanks = '';
            vm.selSibLocks = 'active';
            vm.selPayment = '';
            vm.selPlan = '';
            vm.selBizAdmin = '';
            vm.selCleanDB = '';

            
            $state.go('sibLocs');
        }

        function payment() {
            vm.selKeywords = '';
            vm.selViews = '';
            vm.selFlags = '';
            vm.selRankings = '';
            vm.selDbMaint = '';
            vm.selQuery = '';
            vm.selUpdate = '';
            vm.selFoodRanks = '';
            vm.selPlan = '';
            vm.selPayment = 'active';
            vm.selBizAdmin = '';
            vm.selSibLocks = '';
            vm.selCleanDB = '';


            $state.go('payment');

        }

        function plan() {
            vm.selKeywords = '';
            vm.selViews = '';
            vm.selFlags = '';
            vm.selRankings = '';
            vm.selDbMaint = '';
            vm.selQuery = '';
            vm.selUpdate = '';
            vm.selFoodRanks = '';
            vm.selPlan = 'active';
            vm.selPayment = '';
            vm.selBizAdmin = '';
            vm.selSibLocks = '';
            vm.selCleanDB = '';


            $state.go('plan');

        }

        function bizAdmin() {
            vm.selKeywords = '';
            vm.selViews = '';
            vm.selFlags = '';
            vm.selRankings = '';
            vm.selDbMaint = '';
            vm.selQuery = '';
            vm.selUpdate = '';
            vm.selFoodRanks = '';
            vm.selPlan = '';
            vm.selPayment = '';
            vm.selBizAdmin = 'active';
            vm.selSibLocks = '';
            vm.selCleanDB = '';


            $state.go('bizadmin');

        }
        
        function cleanDB() {

            vm.selKeywords = '';
            vm.selViews = '';
            vm.selFlags = '';
            vm.selRankings = '';
            vm.selDbMaint = '';
            vm.selQuery = '';
            vm.selUpdate = '';
            vm.selFoodRanks = '';
            vm.selPlan = '';
            vm.selPayment = '';
            vm.selBizAdmin = '';
            vm.selSibLocks = '';
            vm.selCleanDB = 'active';


            $state.go('cleandb');
        }
        function goBack() {
            //if ($rootScope.cCategory.id == undefined) $state.go('rankSummary', { index: $rootScope.cCategory.id });
            //else $state.go('rankSummary', { index: 1 });
            $state.go('content');
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
                        if (vm.results[i].title.includes("Greek")){
                            var tags = vm.results[i].tags + ' gyros baklava';
                            //var tags = vm.results[i].tags.replace('lifestyle','');
                            //var newtype = 'Event';
                            table.update(vm.results[i].id, ['tags'],[tags]);    
                        }            
                    } 
                    *///End of 2
        
                    /*//  3.Use this to correct the title of a group of ranks
                    var exec = true;
                    for (var i=0; i < $rootScope.content.length; i++){
                        if ($rootScope.content[i].title.includes("Places to learn pole dancing")) {
                            var titlex = $rootScope.content[i].title.replace("Places to learn pole dancing","Places to Learn Pole Dancing");
                            //var tagsx = vm.resultsT[i].tags.replace("tea","coffee shops internet tea quiet");
                            console.log("titlex ", titlex);
                            if (exec) table.update($rootScope.content[i].id, ['title'],[titlex]);
                        }
                        if ($rootScope.content[i].title.includes("Restaurants with great views")) {
                            var titlex = $rootScope.content[i].title.replace("Restaurants with great views","Restaurants with Great Views in San Diego");
                            //var tagsx = vm.resultsT[i].tags.replace("tea","coffee shops internet tea quiet");
                            console.log("titlex ", titlex);
                            if (exec) table.update($rootScope.content[i].id, ['title'],[titlex]);
                        }
                        if ($rootScope.content[i].title.includes("Event planners")) {
                            var titlex = $rootScope.content[i].title.replace("Event planners","Event Planners");
                            //var tagsx = vm.resultsT[i].tags.replace("tea","coffee shops internet tea quiet");
                            console.log("titlex ", titlex);
                            if (exec) table.update($rootScope.content[i].id, ['title'],[titlex]);
                        }
                    } 
                    *///End of 3
            
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
                    for (var i=0; i < $rootScope.content.length; i++){
                        if ($rootScope.content[i].title.includes("International restaurants")){
                             for (var j=0; j<$rootScope.catansrecs.length; j++){
                                 if ($rootScope.catansrecs[j].category == $rootScope.content[i].id){
                                     console.log("Deleting catans");
                                     catans.deleteRec($rootScope.catansrecs[j].answer,$rootScope.catansrecs[j].category);
                                 }
                             }
                             console.log("Deleting table - ", $rootScope.content[i].title);
                             table.deleteTable($rootScope.content[i].id);      
                        }                   
                   }
                   *///End 5
      
                    /*//6. Use this to add a ranking to all neighborhoods 
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
                       for (var i=0; i<$rootScope.content.length; i++){
                           //console.log("2");
                           if ($rootScope.content[i].title.includes("Hillcrest")){
                               //console.log("2");
                               var catstr = '';
                               var fcatstr = '';
                               //DISTRICT var genRank = $rootScope.content[i].title.replace("Hillcrest", "Downtown");
                               // CITY
                               var genRank = $rootScope.content[i].title.replace("Hillcrest", "San Diego");
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
                                        //DISTRICT var srchStr = $rootScope.content[j].title.replace("Downtown","");
                                        //CITY 
                                        var srchStr = $rootScope.content[j].title.replace("San Diego","");
                                           for (var k=0; k<$rootScope.content.length; k++){

                                               if ($rootScope.content[k].title.includes(srchStr) && k!=j ){
                                                   //console.log("Found sub rank --- ", $rootScope.content[k].title);
                                                    
                                                    //DISTRICT
                                                    // 
                                                    //isDistrictRanking = false;
                                                    //for (var n=0; n<$rootScope.districts.length; n++){
                                                    //    if ($rootScope.content[k].title.includes($rootScope.districts[n])){
                                                    //        isDistrictRanking = true;
                                                    //    }     
                                                    // }
                                                    //if (isDistrictRanking) catstr = catstr + ':' + $rootScope.content[k].id;
                                                    
                                                    //End DISTRICT
                                                    //CITY
                                                    catstr = catstr + ':' + $rootScope.content[k].id;
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

                /* //  25.Change ranking type and its answers
                    var cat = 0;
                    var ans = 0;
                    var idx = 0;
                    var idx2 = 0;
                    for (var i=0; i < $rootScope.content.length; i++){
                        if ($rootScope.content[i].title.includes('Open places to play with your dog')) {
                            cat = $rootScope.content[i].id;
                            for (var j=0; j < $rootScope.catansrecs.length; j++){
                                if ($rootScope.catansrecs[j].category == cat){
                                    ans = $rootScope.catansrecs[j].answer;
                                    idx = $rootScope.answers.map(function(x) {return x.id; }).indexOf(ans);
                                    //console.log("change - ", $rootScope.answers[idx].name, " to Place");
                                    answer.updateAnswer(ans,['type'],['Place']);
                                }
                            }
                            idx2 = $rootScope.content.map(function(x) {return x.id; }).indexOf(cat);
                            //console.log("change - ", $rootScope.content[idx2].title, " to Place");
                            table.update(cat, ['type'],['Place']);
                        }
                    } 
                  */ //End of 25

                   /*//26. Apply fimage and bgbox format to atomic ranks from non-atomic
                   var str = '';
                   var fimage = '';
                   var bc = '';
                   var fc = '';
                   var shade = 0;
                   for (var i=0; i<$rootScope.content.length; i++){
                       //if rank not atomic, look into all its atoms and format them equal
                       if ($rootScope.content[i].isatomic == false){
                            str = $rootScope.content[i].title.replace('in San Diego','');
                            
                            fimage = $rootScope.content[i].fimage;
                            shade = $rootScope.content[i].shade;
                            bc = $rootScope.content[i].bc;
                            fc = $rootScope.content[i].fc;

                            if (fimage != null && fimage != undefined && fimage != ''){
                                for (var j = 0; j < $rootScope.content.length; j++) {
                                    if ($rootScope.content[j].title.indexOf(str) > -1) {
                                        //Found an atom
                                        console.log($rootScope.content[j].title, fimage, bc, fc, shade);
                                        table.update($rootScope.content[j].id,['fimage','bc','fc','shade'],[fimage,bc,fc,shade]);
                                    }
                                }
                            }
                       }
                   }
                   *///End of 26
                   /* //27. Use this to capitalize category code tags
                        var p0 = categorycode.get();
                        var catstr = '';
                        var tags = [];
                        vm.codes = [];
            
                        return $q.all([p0]).then(function (d) {
                            $rootScope.catcodes = d[0];
                
                            for (var m=0; m<$rootScope.catcodes.length; m++){
                                tags = $rootScope.catcodes[m].category.split(" ");
                                for (var n=0; n<tags.length; n++){
                                    if (tags[n] != 'to' && tags[n] != 'and' && tags[n] != 'from' && tags[n] != 'a')
                                        tags[n] = tags[n].charAt(0).toUpperCase() + tags[n].slice(1);
                                }
                                catstr = '';
                                for (var n=0; n < tags.length; n++){
                                    catstr = catstr + ' ' + tags[n];
                                }
                                catstr = catstr.slice(1);
                                //console.log("catstr - ", catstr);
                                categorycode.update($rootScope.catcodes[m].id,['category'],[catstr]);
                            }
                        });

                    *///End of 27.
                    /*//28. Delete all vrows
                    console.log("$rootScope.cvrows.length - ", $rootScope.cvrows.length);
                        for (var i=0; i<$rootScope.cvrows.length; i++){
                            vrows.deleteVrow($rootScope.cvrows[i].id);
                        }
                    *///end of 28
                    /*//29. Show answers that have no owner but ispremium and hasranks flags
                    var user = '';
                    for (var i=0; i< $rootScope.answers.length; i++){
                        if (!($rootScope.answers[i].owner == 0 || 
                            $rootScope.answers[i].owner == null || 
                            $rootScope.answers[i].owner == undefined )){
                                //if ($rootScope.answers[i].ispremium || 
                                //    $rootScope.answers[i].hasranks ||
                                //    ($rootScope.answers[i].ranksqty != undefined && $rootScope.answers[i].ranksqty != 0 )){
                                if ($rootScope.answers[i].owner == '1638806919478345') user = 'Roy';
                                else if ($rootScope.answers[i].owner == '10104518570729893') user = 'Andres';
                                else if ($rootScope.answers[i].owner == '194039991109146') user = 'Jash';
                                else if ($rootScope.answers[i].owner == '1395314397177816') user = 'Roy';
                                else if ($rootScope.answers[i].owner == '42') user = 'Andres';
                                else if ($rootScope.answers[i].owner == '31') user = 'Aaron';
                                else if ($rootScope.answers[i].owner == '48') user = 'Felipe';
                                else user = 'other';    
                                        console.log($rootScope.answers[i].name,
                                                $rootScope.answers[i].owner,
                                                $rootScope.answers[i].ispremium,
                                                $rootScope.answers[i].hasranks,
                                                $rootScope.answers[i].ranksqty,
                                                user);
                                        //answer.updateAnswer($rootScope.answers[i].id,
                                        //                ['ispremium','hasranks','ranksqty'],
                                        //                [false,false,0]);
                                 //   }
                            }
                    }
                }
                    */// End of 29.
                    /*
                    var hasNhOne = false;
                    var rankObj = {};
                    for (var i=0; i< $rootScope.categories.length; i++){
                        hasNhOne = false;
                        if ($rootScope.categories[i].category.indexOf('@Nh')>-1){
                            for (var j=0; j<$rootScope.content.length; j++){

                                if ($rootScope.content[j].cat == $rootScope.categories[i].id){
                                    if ($rootScope.content[j].nh == 64) hasNhOne = true;
                                }
                            }
                        
                        if (!hasNhOne) {
                            rankObj = {};
                            rankObj.cat = $rootScope.categories[i].id;
                            rankObj.nh = 64;
                            rankObj.views = 0;
                            rankObj.image1url = '';
                            rankObj.image2url = '';
                            rankObj.image3url = '';
                            rankObj.owner = 0;
                            rankObj.numcom = 0;
                            rankObj.answers = 0;
                            rankObj.ismp = false;
                            rankObj.isatomic = false;
                            console.log($rootScope.categories[i].category);
                            table.addTable(rankObj);
                        }
                        }
                    }*/
                    
                    /*
                    for (var i=0; i<$rootScope.content.length; i++){
                        if ($rootScope.content[i].nh == null || 
                        $rootScope.content[i].nh == undefined || 
                        $rootScope.content[i].nh == 0 ){
                            console.log($rootScope.content[i].title);
                            //table.update($rootScope.content[i].id,['nh'],[1]);
                        }
                    }*/
                    /*// 32.*****Populate catstr field **** 
                    var catstr = '';
                    var idx = -1;
                    var idx2 = -1;
                    var nhObj = {};
                    var nhArr = [];
                    var nhSub = [];
                    var nhSub2 = [];
                    var catArr = [];

                    for (var i=0; i < $rootScope.content.length; i++){
                    //for (var i=0; i < 100; i++){
                        nhArr = [];
                        common.getInclusiveAreas($rootScope.content[i].nh,nhArr);
                        
                        catArr = [];
                        for (var j=0; j < $rootScope.content.length; j++){
                            if ($rootScope.content[i].cat == $rootScope.content[j].cat){
                                for (var n=0; n < nhArr.length; n++){
                                    if (nhArr[n] == $rootScope.content[j].nh) {
                                        catArr.push($rootScope.content[j].id);
                                        //console.log($rootScope.content[j].slug);
                                    }
                                }
                            }
                        }
                        //console.log("length catArr ", catArr.length);
                        catstr = '';
                        for (var m=0; m < catArr.length; m++){
                            catstr = catstr + ':'+ catArr[m];
                        }
                        catstr = catstr.substring(1);
                        //console.log("catstr - ", catstr);
                        table.update($rootScope.content[i].id,['catstr'],[catstr]);
                        
                    }
                    /*
                    for (var i=0; i<$rootScope.content.length; i++){
                        if ($rootScope.content[i].cat == null) console.log($rootScope.content[i].slug);
                    }
                    *///End of 32 */
                    /*//33. Adjust db, create ranking of tables needed, move catans
                    var aidx = 0;
                    var nidx = 0;
                    var answer = {};
                    var nhObj = {};
                    var nh = '';
                    var foundRank = false;
                    for (var k = 0; k < $rootScope.categories.length; k++) {
                        if ($rootScope.categories[k].category.indexOf('@Nh') > -1) {
                            for (var i = 0; i < $rootScope.content.length; i++) {
                                if ($rootScope.content[i].cat == $rootScope.categories[k].id &&
                                    $rootScope.content[i].nh == 1) {
                                    for (var j = 0; j < $rootScope.catansrecs.length; j++) {
                                        if ($rootScope.catansrecs[j].category == $rootScope.content[i].id) {
                                            aidx = $rootScope.answers.map(function(x) {return x.id; }).indexOf($rootScope.catansrecs[j].answer);  
                                            answer = $rootScope.answers[aidx];
                                            nh = answer.cityarea;
                                            nidx = $rootScope.locations.map(function(x) {return x.nh_name; }).indexOf(nh);  
                                            if (nidx > -1){
                                            //console.log("nh, nidx,", nh, nidx);
                                            foundRank = false;
                                            nhObj = $rootScope.locations[nidx];
                                            for (var n=0; n <$rootScope.content.length; n++){
                                                if ($rootScope.content[n].cat == $rootScope.categories[k].id &&
                                                    $rootScope.content[n].nh == nhObj.id){ 
                                                        foundRank = true;
                                                        console.log("Found ", $rootScope.content[n].title, answer.name);
                                                        //catans.updateRec($rootScope.catansrecs[j].id,['category'],[$rootScope.content[n].id]);
                                                    }
                                            }
                                            if (!foundRank) {
                                                console.log("Not Found ", $rootScope.categories[k].category, nh, answer.name);
                                                var itemt = {};
                                                itemt.views = 0;
                                                itemt.answers = 0;
                                                itemt.numcom = 0;
                                                itemt.ismp = true;
                                                itemt.isatomic = true;
                                                itemt.cat = $rootScope.categories[k].id;
                                                itemt.nh = nhObj.id;
                                                //Create and update slug
                                                //Create table record
                                                //table.addTable(itemt);
                                            }
                                            //console.log("$rootScope.content[i].title - ", $rootScope.content[i].title);
                                        }
                                        else console.log("nh, ", nh);
                                        }
                                    }
                                }
                            }
                        }
                    }*/
            }
                 
    }
})();
