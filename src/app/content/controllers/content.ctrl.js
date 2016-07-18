(function () {
    'use strict';

    angular
        .module('app')
        .controller('content', content);

    content.$inject = ['$rootScope', '$state', '$http', '$stateParams', '$scope', 'answers',
        'rankings', 'query', 'table', 'specials', 'mode', '$filter'];

    function content($rootScope, $state, $http, $stateParams, $scope, answers,
        rankings, query, table, specials, mode, $filter) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'content';

        vm.goBack = goBack;
        vm.rankSelT = rankSelT;
        vm.rankSelB = rankSelB;
        vm.switchArray = switchArray;
        
        vm.content = [];
        vm.emptyspace = '';
        
        $rootScope.$on('closeRank', function (e, objNum) {
            closeRank();
        });
        $rootScope.$on('refreshRanks', function (e) {
            switchArray();
        });

        $rootScope.$on('numRes5', function (e, objNum) {
            if (mode.mode == objNum) {
                numRes5();

            }
        });
        $rootScope.$on('numRes30', function (e, objNum) {
            if (mode.mode == objNum) {
                numRes30();

            }
        });
        
         $rootScope.$on('numObjChanged', function (e) {
            refreshActiveObj();
        });
        
        $rootScope.$on('applyRule', function (e) {
            applyRule();
        });
        
       
        //$rootScope.activeMode = mode.mode;

        var strlen_o = 0;
        var myMode = mode.mode;
        
        $rootScope.parentNum = myMode;
       
        activate();

        function activate() {
            
            vm.resultsT = [];
            vm.resultsB = [];

            if (mode.mode == 1) numRes30();
            if (mode.mode > 1 && mode.mode < 8) numRes5();

            loadContent();
            //$state.go('rankSummary', { index: 1 });

        }

        function loadContent() {

            var filter = [];
            var temparr = [];
            if (mode.mode > 1) {

                vm.resultsT = [];
                vm.resultsB = [];

                switch (mode.mode) {
                    case 2: filter = [" "]; break;
                    case 3: filter = ["politics"]; break;
                    case 4: filter = ["lifestyle"]; break;
                    case 5: filter = ["food"]; break;
                    case 6: filter = ["sports"]; break;
                    case 7: filter = ["dating"]; break;
                }
                for (var j = 0; j < $rootScope.content.length; j++) {
                
                    //filter rankings
                    for (var k = 0; k < filter.length; k++) {
                        var tagCapitalized = filter[k].charAt(0).toUpperCase() + filter[k].slice(1);
                        var tagFirstLowered = filter[k].charAt(0).toLowerCase() + filter[k].slice(1);
                        var r = ($rootScope.searchStr[j].includes(filter[k]) ||
                            $rootScope.searchStr[j].includes(filter[k].toUpperCase()) ||
                            $rootScope.searchStr[j].includes(tagCapitalized) ||
                            $rootScope.searchStr[j].includes(tagFirstLowered));

                        if (r) {
                            temparr.push($rootScope.content[j]);
                        }
                    }

                }
                //vm.resutsT = orderBy(vm.resultsT,'views')
                temparr = $filter('orderBy')(temparr, '-views');
                vm.resultsT = temparr.slice(0, vm.maxRes);

            }

        }

        function goBack() {

            $state.go('rankSummary', { index: $rootScope.cCategory.id });

        }

        //Miscellaneous functions, grab header
        function getRankData(x) {
            $rootScope.title = x.title;

            $rootScope.isDowntown = x.title.includes("downtown");
            //Delete the first 3 words, to show ranking theme, not ideal, need to make better
            var n = x.title.length;
            var ctr = 0;
            var si = 0;
            for (var i = 0; i < n; i++) {
                if (x.title[i] == ' ') ctr++;
                if (ctr == 3) {
                    si = i;
                    break;
                }
            }
            $rootScope.header = x.title.substring(si, n - 1);
        }

        function rankSelT(x, index) {

            console.log("rankSetT executed");

            getRankData(x);

            var arraytemp = [];
            for (var i = 0; i < vm.resultsT.length; i++) {
                if (i < index) arraytemp[i] = vm.resultsT[i];
                if (i > index) vm.resultsB.push(vm.resultsT[i]);
            }
            vm.resultsT = arraytemp;

            vm.showR = true;
            $rootScope.showR = true;
           
            $rootScope.parentNum = myMode;
            
                if ($rootScope.editMode) $state.go('editRanking', { index: x.id });
                else {$rootScope.rankCnt = 0; $state.go('rankSummary', { index: x.id });}
            
        }

        function rankSelB(x, index) {
            //overall index
            var n = vm.resultsT.length + 1 + index;
            closeRank();
            rankSelT(vm.resultsT[n], n);

        }

        function switchArray() {

            if (mode.mode == 1 && $rootScope.inputVal!= undefined) {
                var userIsTyping = false;
                var inputVal = $rootScope.inputVal;
                vm.showR = false;
                $rootScope.showR = false;
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
                    if (vm.resultsT.length <= 5 && (inputVal.length % 3 == 0) && userIsTyping && mode == 1) {
                        query.postQuery(inputVal, vm.resultsT.length)
                    }
                    strlen_o = inputVal.length;
                }
                else {
                    vm.resultsT = [];
                    vm.resultsB = [];
                }
                $rootScope.viewNum = 999;
            }
        }


        function closeRank() {
            vm.showR = false;
            $rootScope.showR = false;
            $rootScope.rankIsActive = false;
            if (mode.mode == 1) switchArray();
            else loadContent();
        }

        function numRes5() {
            vm.maxRes = 5;
            //loadContent();
        }

        function numRes30() {
            vm.maxRes = 30;
            loadContent();
        }
        
        function refreshActiveObj(){
            vm.active = ($rootScope.objNum == myMode);
        }

        function applyRule() {
            console.log("apply Rule");
            
            /*
            //Use this to add a tag
            for (var i=0; i < vm.resultsT.length; i++){
                var tags = vm.resultsT[i].tags + ' lifestyle';
                table.update(vm.resultsT[i].id, ['tags'],[tags]);
            } 
            */
            /*
            //Use this to remove a tag
            for (var i=0; i < vm.resultsT.length; i++){
                var titlex = vm.resultsT[i].title.replace("places for coffee and studying/working","places with WiFi good for working or studying");
                var tagsx = vm.resultsT[i].tags.replace("tea","coffee shops internet tea quiet");
                //console.log("tags ", tags);
                table.update(vm.resultsT[i].id, ['title','tags'],[titlex, tagsx]);
            } 
            */
            /*
            //Use this to add a neighborhood
            for (var i=0; i < vm.resultsT.length; i++){
                
                //Copy object without reference
                var tablex = JSON.parse(JSON.stringify(vm.resultsT[i]));
                tablex.id = undefined;
                var newtitle = tablex.title.replace("Hillcrest", "Point Loma");
                tablex.title = newtitle;
                //console.log("tags ", tags);
                table.addTable(tablex);
            }
              */
               
            //Use this to add a ranking to all neighborhood
            /*
            for (var i=0; i < vm.resultsT.length; i++){
                
                //Copy object without reference
                var tablex = JSON.parse(JSON.stringify(vm.resultsT[i]));
                tablex.id = undefined;
                var newtitle = tablex.title.replace("for coffee and studying/working", "to have breakfast or brunch");
                tablex.title = newtitle;
                var newtags = tablex.tags.replace("tea", "food pancakes");
                tablex.tags = newtags;
                //console.log("tags ", tags);
                table.addTable(tablex);
            }
                */     
            //Master change
            /*
            
            var question = '';
            for (var i = 0; i < $rootScope.content.length; i++) {
    
                switch ($rootScope.content[i].type) {
                    case 'Person': { question = 'Who ranks higher?'; break; }
                    case 'Establishment': { question = 'Which one you recommend?'; break; }
                    case 'Place': { question = 'Where would you go?'; break; }
                    case 'Activity': { question = 'What would you rather do?'; break; }
                    case 'Short-Phrase': { question = 'What is more accurate?'; break; }
                    case 'Organization': { question = 'Which one you recommend?'; break; }
                    case 'Event': { question = 'What would you rather do?'; break; }
                }
                table.update($rootScope.content[i].id,['question'],[question]);
            }
            */
        }

    }
})();






