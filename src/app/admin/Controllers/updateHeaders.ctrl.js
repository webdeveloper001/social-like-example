(function () {
    'use strict';

    angular
        .module('app')
        .controller('updateHeaders', updateHeaders);

    updateHeaders.$inject = ['$location', '$rootScope', '$state', 'headline','cblock'];

    function updateHeaders(location, $rootScope, $state, headline, cblock) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'updateHeaders';

        vm.refresh = refresh;
        vm.createCBlocksRecsCity = createCBlocksRecsCity;
        vm.createCBlocksRecsNh = createCBlocksRecsNh;
        vm.createCBlocksRecsRankX = createCBlocksRecsRankX;
        vm.deleteCBlocks = deleteCBlocks;
        
        vm.isAdmin = $rootScope.isAdmin;
        
        activate();

        function activate() {
            //loadData();
            console.log("updateHeaders page Loaded!");
        }

        function refresh() {
            var tagstr = '';
            var valTags = [];
            var arrIdxs = [];
            vm.res = [];
            var obj = {};
            var r = true;
            var catstr = '';
            var fcatstr = '';
            
            for (var i = 0; i < $rootScope.cblocks.length; i++) {
                catstr = '';    
                fcatstr = '';
                r = true;
                obj = {};
                arrIdxs = [];
                for (var n=0; n < $rootScope.headlines.length; n++){
                    if ($rootScope.cblocks[i].type == $rootScope.headlines[n].type){
                        if ($rootScope.cblocks[i].scope == "city"){
                            //add 'isMP' tag to filter
                            tagstr = $rootScope.headlines[n].filter + ' isMP';
                        }
                        if ($rootScope.cblocks[i].scope == "rx"){
                            //add 'isMP' tag to filter
                            tagstr = $rootScope.headlines[n].filter;
                        }
                        if ($rootScope.cblocks[i].scope == "nh"){  
                            //add neighborhood to filter
                            tagstr = $rootScope.headlines[n].filter + ' ' + $rootScope.cblocks[i].scopename; 
                        }                        
                        valTags = tagstr.split(" ");
                        break;                    
                    }
                }
                //console.log("valTags -- ", valTags);
                var searchStr = '';
                for (var j = 0; j < $rootScope.content.length; j++) {
                    searchStr = $rootScope.content[j].tags + " " + $rootScope.content[j].title;
                    r = true;
                    //check that all tags exist
                    for (var k = 0; k < valTags.length; k++) {
                        var tagCapitalized = valTags[k].charAt(0).toUpperCase() + valTags[k].slice(1);
                        var tagFirstLowered = valTags[k].charAt(0).toLowerCase() + valTags[k].slice(1);
                        r = r && 
                            (searchStr.indexOf(valTags[k]) > -1 ||
                            searchStr.indexOf(valTags[k].toUpperCase()) > -1 ||
                            searchStr.indexOf(tagCapitalized) > -1 ||
                            searchStr.indexOf(tagFirstLowered) > -1);
                            //AM: Changed searchStr to tags searchStr[j]
                    }
                    if (r) {
                        arrIdxs.push(j);
                        //catstr = catstr + ':' + j;
                    }
                }
                //console.log("arrIdxs -- ", arrIdxs);
                
                shuffle(arrIdxs);
                for (var m = 0; m < arrIdxs.length; m++) {
                    //create catstr string
                    catstr = catstr + ':' + arrIdxs[m];
                    
                }
                fcatstr = catstr.substring(1);
                //update database with new catstr
                cblock.update($rootScope.cblocks[i].id,['catstr'],[fcatstr]);              
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
        var exe1 = false;
        function createCBlocksRecsCity(){
            if (exe1) return;
            var cityArr = ['rankofweek','city','lifestyle','food','politics','services','social','beauty','sports','personalities','technology','dating','health'];
            var cbObj = {};
            for (var i=0; i< cityArr.length; i++){
                cbObj = {};
                cbObj.scope = 'city';
                cbObj.scopename = 'San Diego';
                cbObj.catstr = '0';
                cbObj.type = cityArr[i];        
                cblock.addcblock(cbObj);
            }
            exe1 = true;
                   
        }
        var nhs = $rootScope.neighborhoods.concat($rootScope.districts);
        var exe2 = false;
        function createCBlocksRecsNh(){
            if (exe2) return;
            var nhArr = ['rankofweeknh','neighborhood','lifestyle','food','services','social','beauty','health'];
            var cbObj = {};
            for (var n=0; n<nhs.length; n++){
                for (var i=0; i< nhArr.length; i++){
                cbObj = {};
                cbObj.scope = 'nh';
                cbObj.scopename = nhs[n];
                cbObj.catstr = '0';
                cbObj.type = nhArr[i];
                
                cblock.addcblock(cbObj);
                }   
            }
            exe2 = true;
            //console.log("nhArr",nhArr);
        }
        
        var exe3 = false;
        function createCBlocksRecsRankX(){
            if (exe3) return;
            var rxArr = ['rxfeedback','rxsuggestion'];
            var cbObj = {};
            for (var i=0; i< rxArr.length; i++){
                cbObj = {};
                cbObj.scope = 'rx';
                cbObj.scopename = 'RankX';
                cbObj.catstr = '0';
                cbObj.type = rxArr[i];        
                cblock.addcblock(cbObj);
            }   
            exe3 = true;
            //console.log("nhArr",nhArr);
        }
        
        function deleteCBlocks(){
            for (var i=0; i < $rootScope.cblocks.length; i++){
                cblock.deleteRec($rootScope.cblocks[i].id);
            }
        }
    }
})();
