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
        vm.deleteCBlocks = deleteCBlocks;
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
                        else { 
                            //add neighborhood to filter
                            tagstr = $rootScope.headlines[n].filter + ' ' + $rootScope.cblocks[i].scopename; 
                        }                        
                        valTags = tagstr.split(" ");
                        break;
                    }
                }
                //console.log("valTags -- ", valTags);
                for (var j = 0; j < $rootScope.content.length; j++) {
                    r = true;
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
        
        function createCBlocksRecsCity(){
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
                   
        }
        
        function createCBlocksRecsNh(){
            var nhArr = ['rankofweeknh','neighborhood','lifestyle','food','services','social','beauty','health'];
            var cbObj = {};
            for (var n=0; n<$rootScope.neighborhoods.length; n++){
                for (var i=0; i< nhArr.length; i++){
                cbObj = {};
                cbObj.scope = 'nh';
                cbObj.scopename = $rootScope.neighborhoods[n];
                cbObj.catstr = '0';
                cbObj.type = nhArr[i];
                
                cblock.addcblock(cbObj);
            }   
            }
            //console.log("nhArr",nhArr);
        }
        
        function deleteCBlocks(){
            for (var i=0; i < $rootScope.cblocks.length; i++){
                cblock.deleteRec($rootScope.cblocks[i].id);
            }
        }
    }
})();
