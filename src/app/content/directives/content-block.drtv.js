angular.module('app').directive('contentBlock', ['$rootScope', '$state', function ($rootScope, $state) {
    'use strict';

    return {
        templateUrl: 'app/content/partials/content-block.html',
        transclude: true,
        scope: {
            modeNum: '=mode',
            isDynamic: '=dynamic',
            isRoW: '=rankofweek'
        },
        controller: ['$scope','query','$filter','$http','answer', function contentCtrl($scope, query, $filter, $http, answer) {
            var vm = $scope;
            vm.title = 'mycontent';

            vm.resultsT = [];
            vm.resultsB = [];
            vm.maxRes = 6;
            vm.btext = 'see more';
            var strlen_o = 0;

            if (!vm.isDynamic) loadContent();

            $rootScope.$on('refreshRanks', function (e) {
                vm.input = $rootScope.inputVal;
                //console.log("refresh Ranks from directive!!!", vm.input);
                getRanks();
            });

            $rootScope.$on('loadNh', function (e) {
                //console.log("loadNh!!!");         
                loadContent();
            });

            $rootScope.$on('applyRule', function (e) {
                //console.log("loadNh!!!");         
                applyRule();
            });

            //Filter content based on user input
            function getRanks() {
                //console.log("getRanks!!!", $rootScope.inputVal);
                if ($rootScope.inputVal != undefined && vm.isDynamic) {
                    var userIsTyping = false;
                    var inputVal = $rootScope.inputVal;
                    if ($rootScope.isNh) inputVal = inputVal + ' ' + $rootScope.cnh;
                    //vm.showR = false;
                    //$rootScope.showR = false;
                    vm.resultsT = [];
                    vm.resultsB = [];
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
                                vm.resultsT.push($rootScope.content[j]);

                            }
                        }
                        if (inputVal.length >= strlen_o) userIsTyping = true;
                        else userIsTyping = false;
                        //if less than 5 results, write 'query record
                        if (vm.resultsT.length <= 5 && (inputVal.length % 3 == 0) && userIsTyping) {
                            query.postQuery(inputVal, vm.resultsT.length)
                            //console.log("query!")
                        }
                        strlen_o = inputVal.length;
                    }
                    else {
                        vm.resultsT = [];
                        vm.resultsB = [];
                    }

                }
            }

            //load content based on mode
            function loadContent() {

                var filters = [];
                var headlines = [];
                var filter = '';
                var headline = '';
                var temparr = [];
                if (vm.modeNum < 9) {

                    vm.resultsT = [];
                    vm.resultsB = [];

                    switch (vm.modeNum) {
                        case 1: {
                            filters = ["rankOfWeek", "best mexican restaurant"];
                            headlines = ['Ranking of the Week', 'Ranking of Week']
                            vm.fc = '#f8f8ff';
                            vm.bgc = 'black';
                            break;
                        }
                        case 2: {
                            filters = [" ", " "];
                            headlines = ['Most Popular', 'Most Popular'];
                            vm.fc = '#f8f8ff';
                            vm.bgc = '#4682b4';
                            break;
                        }
                        case 3: {
                            filters = ["food", "food"];
                            headlines = ['Food', 'Food'];
                            vm.fc = '#f8f8ff';
                            vm.bgc = 'brown';
                            break;
                        }
                        case 4: {
                            filters = ["lifestyle", "fitness"];
                            headlines = ['LifeStyle', 'Fitness'];
                            vm.fc = '#f8f8ff';
                            vm.bgc = 'green';
                            break;
                        }
                        case 5: {
                            filters = ["politics", "neighborhood"];
                            headlines = ['City and Politics', 'Neighboorhood Topics'];
                            vm.fc = '#f8f8ff';
                            vm.bgc = 'gray';
                            break;
                        }
                        case 6: {
                            filters = ["sports", "services"];
                            headlines = ['Sports', 'Services'];
                            vm.fc = '#f8f8ff';
                            vm.bgc = 'blue';
                            break;
                        }
                        case 7: {
                            filters = ["dating", "beauty"];
                            headlines = ['Dating and Relationships', 'Beauty']
                            vm.fc = '#f8f8ff';
                            vm.bgc = '#b22222';
                            break;
                        }
                        case 8: {
                            filters = ["technology", "health"];
                            headlines = ['Technology', 'Health']
                            vm.fc = '#f8f8ff';
                            vm.bgc = 'gray';
                            break;
                        }

                    }
                    if ($rootScope.isNh) {
                        filter = filters[1] + ' ' + $rootScope.cnh;
                        vm.headline = headlines[1] + ' - ' + $rootScope.cnh;
                    }
                    else {
                        filter = filters[0];
                        vm.headline = headlines[0];
                    }
                    //console.log("filter---", filter);
                    var valTags = filter.split(" ");
                    for (var j = 0; j < $rootScope.content.length; j++) {
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
                            temparr.push($rootScope.content[j]);
                        }

                    }

                    //vm.resutsT = orderBy(vm.resultsT,'views')
                    temparr = $filter('orderBy')(temparr, '-views');
                    //vm.resultsT = temparr.slice(0, vm.maxRes);
                    vm.resultsT = temparr;
                    //Check if photos exist   
                    if (vm.isRoW && vm.resultsT.length > 0) {
                        vm.image1 = vm.resultsT[0].image1url;
                        vm.image2 = vm.resultsT[0].image2url;
                        vm.image3 = vm.resultsT[0].image3url;

                    }
                }
            }

             function applyRule() {
        console.log("apply Rule");
            
            /*
        //var lat_o = 32.7625548; 
        //var lng_o = -117.1476841;   
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
                
                /*
                var p = 0.017453292519943295;    // Math.PI / 180
                var c = Math.cos;
                var a = 0.5 - c((lat - lat_o) * p)/2 + 
                c(lat_o * p) * c(lat * p) * 
                (1 - c((lng - lng_o) * p))/2;

                var dist_km =  12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
                console.log("Distance (mi)---", dist_km/1.609);
                */
        /*        
            });    
        }
        else{
            if ($rootScope.answeridxgps < ($rootScope.answers.length-2)){
                $rootScope.answeridxgps = $rootScope.answeridxgps + 1; 
                $rootScope.$emit('applyRule');
            }
        }    
            //}
        
        /*
            $http.get(url,{},{
                headers: {
                    'Content-Type': 'multipart/form-data'
                    //'Access-Control-Allow-Headers': 'x-dreamfactory-api-key'
                 }
            }).then(function(result){
                console.log("google response:---", result);
                fa = result.data.results[0].formatted_address;
                lat = result.data.results[0].geometry.location.lat;
                lng = result.data.results[0].geometry.location.lng;
                console.log("fa - lat - lon", fa, lat, lng);
                var p = 0.017453292519943295;    // Math.PI / 180
                var c = Math.cos;
                var a = 0.5 - c((lat - lat_o) * p)/2 + 
                c(lat_o * p) * c(lat * p) * 
                (1 - c((lng - lng_o) * p))/2;

                var dist_km =  12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
                console.log("Distance (mi)---", dist_km/1.609);
                
                $http.defaults.headers.common['X-Dreamfactory-API-Key'] = APP_API_KEY;
            });    
        */
        /*
        //Use this to add a tag
        for (var i=0; i < vm.resultsT.length; i++){
            var tags = vm.resultsT[i].tags + ' services';
            table.update(vm.resultsT[i].id, ['tags'],[tags]);
        } 
        */
        /*
        //Use this to remove a tag
        for (var i=0; i < vm.resultsT.length; i++){
            var titlex = vm.resultsT[i].title.replace("best fine dining restaurants in","best fine dining restaurants in ");
            //var tagsx = vm.resultsT[i].tags.replace("tea","coffee shops internet tea quiet");
            //console.log("tags ", tags);
            table.update(vm.resultsT[i].id, ['title'],[titlex]);
        } 
        */
            
        //Use this to add a neighborhood
        /*
        for (var i=0; i < vm.resultsT.length; i++){
            
            //Copy object without reference
            var tablex = JSON.parse(JSON.stringify(vm.resultsT[i]));
            tablex.id = undefined;
            tablex.views = 0;
            tablex.answers = 0;
            var title_original = tablex.title;
            //var nhs = ["Leucadia","Carlsbad","Oceanside","Chula Vista","National City","Rancho Santa Fe","Poway","La Mesa","El Cajon","Escondido","Clairemont"]
           // var nhs = ["Leucadia","Carlsbad"];
            
            //for (var j=0; j<nhs.length; j++){
                var newtitle = tablex.title.replace("Hillcrest", "South Park");
                tablex.title = newtitle;
                //console.log("tags ", tags);
                table.addTable(tablex);
            //}
        }
          */
        /*
        //Use this for batch DELETE
       for (var i=0; i < vm.resultsT.length; i++){          
         table.deleteTable(vm.resultsT[i].id);
      }
       */
                        
        /*       
        //Use this to add a ranking to all neighborhood
        
        for (var i=0; i < vm.resultsT.length; i++){
            
            //Copy object without reference
            var tablex = JSON.parse(JSON.stringify(vm.resultsT[i]));
            tablex.id = undefined;
            var newtitle = tablex.title.replace("What are the best fine dining restaurants in", "What are the best sports bars in");
            tablex.title = newtitle;
            var newtags = tablex.tags.replace("fine dining fancy elegant", "food dining pubs beer");
            tablex.tags = newtags;
            //console.log("tags ", tags);
            table.addTable(tablex);
        }*/
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
                    //console.log("inc to 30!--now:",maxRes);
                    //scope.$apply(function(){
                    scope.btext = 'see less';
                    scope.maxRes = 60;
                    //});                
                }
                else {
                    //console.log("dec to 6!--now:",maxRes);
                    //scope.$apply(function(){
                    scope.btext = 'see more';
                    scope.maxRes = 6;
                    //});

                }
                // scope.loadContent();
            }
        }
    }
}
    /*angular.module('app').directive('contentBlock', function() {
        */
]);