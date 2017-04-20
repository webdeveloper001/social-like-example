(function () {
    'use strict';

    angular
        .module('app')
        .controller('updateHeaders', updateHeaders);

    updateHeaders.$inject = ['$location', '$rootScope', '$state', 'headline', 'cblock','table'];

    function updateHeaders(location, $rootScope, $state, headline, cblock, table) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'updateHeaders';

        vm.refresh = refresh;
        vm.createCBlocksRecsCity = createCBlocksRecsCity;
        vm.createCBlocksRecsNh = createCBlocksRecsNh;
        vm.createCBlocksRecsRankX = createCBlocksRecsRankX;
        vm.deleteCBlocks = deleteCBlocks;
        vm.catStrings = catStrings;

        vm.isAdmin = $rootScope.isAdmin;
        
        var execRefresh = false;

        activate();

        function activate() {
            //loadData();
            console.log("updateHeaders page Loaded!");
        }

        
        function refresh() {
            if (!execRefresh) {
                execRefresh = true;
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
                    for (var n = 0; n < $rootScope.headlines.length; n++) {
                        if ($rootScope.cblocks[i].type == $rootScope.headlines[n].type) {
                            if ($rootScope.cblocks[i].scope == "city") {
                                //add 'isMP' tag to filter
                                tagstr = $rootScope.headlines[n].filter + ' isMP';
                            }
                            if ($rootScope.cblocks[i].scope == "rx") {
                                //add 'isMP' tag to filter
                                tagstr = $rootScope.headlines[n].filter;
                            }
                            if ($rootScope.cblocks[i].scope == "nh") {  
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
                            //arrIdxs.push(j);
                            arrIdxs.push($rootScope.content[j].id);
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
                    cblock.update($rootScope.cblocks[i].id, ['catstr'], [fcatstr]);
                }
            }
        }

        function catStrings() {
            //8. Generate Category Strings for non neighborhood ranks
            var isDistrictRanking = false;
            var results = [];

            //Grab template for results
            for (var n = 0; n < $rootScope.content.length; n++) {
                if ($rootScope.content[n].title.indexOf('in Hillcrest') > -1) {
                    results.push($rootScope.content[n]);
                }
            }

            for (var i = 0; i < results.length; i++) {
                var catstr = '';
                var fcatstr = '';
                //1. - Do cat strings for all San Diego first
                var genRank = results[i].title.replace("Hillcrest", "San Diego");
                for (var j = 0; j < $rootScope.content.length; j++) {
                    if (genRank == $rootScope.content[j].title) {
                        if ($rootScope.content[j].catstr == null || //comment these 3
                            $rootScope.content[j].catstr == undefined || //if want to redo everythign
                            $rootScope.content[j].catstr.length == 0) {  //categories
                            // TODO ---- 6949 --- events need to add 6969
                            // TODO ---- 473 -- law san diego --- ignore, isatomic=true, catstr='';

                            //--- Prevent execution for specific ranks ---
                            var cid = $rootScope.content[j].id;
                            if (cid != 473 && cid != 3125 && cid != 6949 && cid != 7424 && cid != 7675 &&
                                cid != 3124 && cid != 3163 && cid != 3202) {

                                console.log("Found gen rank --- ", $rootScope.content[j].title, ' ', $rootScope.content[j].id);
                                var srchStr = $rootScope.content[j].title.replace("San Diego", "");
                                for (var k = 0; k < $rootScope.content.length; k++) {

                                    if ($rootScope.content[k].title.indexOf(srchStr) > -1 && k != j) {
                                        //console.log("Found sub rank --- ", $rootScope.content[k].title);
                                        /*
                                        isDistrictRanking = false;
                                        for (var n = 0; n < $rootScope.districts.length; n++) {
                                            if ($rootScope.content[k].title.includes($rootScope.districts[n])) {
                                                isDistrictRanking = true;
                                            }
                                        }
                                        if (isDistrictRanking) catstr = catstr + ':' + $rootScope.content[k].id;
                                        */
                                        catstr = catstr + ':' + $rootScope.content[k].id;

                                    }

                                }
                                fcatstr = catstr.substring(1); //remove leading ':'
                                console.log("final catstr ---", fcatstr);

                                table.update($rootScope.content[j].id, ['isatomic', 'catstr'], [false, fcatstr]);
                            }//this is specific rank braket
                        } //this is bracket
                        break;
                    }
                }
                //2. - Do cat Strings for Downtown ranks
                catstr = '';
                fcatstr = '';
                genRank = results[i].title.replace("Hillcrest", "Downtown");
                
                for (var j = 0; j < $rootScope.content.length; j++) {
                    if (genRank == $rootScope.content[j].title) {
                        if ($rootScope.content[j].catstr == null || //comment these 3
                            $rootScope.content[j].catstr == undefined || //if want to redo everythign
                            $rootScope.content[j].catstr.length == 0) {  //categories
                            // TODO ---- 6949 --- events need to add 6969
                            // TODO ---- 473 -- law san diego --- ignore, isatomic=true, catstr='';

                            //--- Prevent execution for specific ranks ---
                            var cid = $rootScope.content[j].id;
                            if (cid != 473 && cid != 3125 && cid != 6949 && cid != 7424 && cid != 7675 &&
                                cid != 3124 && cid != 3163 && cid != 3202) {

                                console.log("Found gen rank --- ", $rootScope.content[j].title, ' ', $rootScope.content[j].id);
                                var srchStr = $rootScope.content[j].title.replace("Downtown", "");
                                for (var k = 0; k < $rootScope.content.length; k++) {

                                    if ($rootScope.content[k].title.indexOf(srchStr) > -1 && k != j) {
                                        //console.log("Found sub rank --- ", $rootScope.content[k].title);
                                        isDistrictRanking = false;
                                        for (var n = 0; n < $rootScope.districts.length; n++) {
                                            if ($rootScope.content[k].title.includes($rootScope.districts[n])) {
                                                isDistrictRanking = true;
                                            }
                                        }
                                        if (isDistrictRanking) catstr = catstr + ':' + $rootScope.content[k].id;
                                    }

                                }
                                fcatstr = catstr.substring(1); //remove leading ':'
                                console.log("final catstr ---", fcatstr);

                                table.update($rootScope.content[j].id, ['isatomic', 'catstr'], [false, fcatstr]);
                            }//this is specific rank braket
                        } //this is bracket
                        break;
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
            }*/
            //End 8
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
        function createCBlocksRecsCity() {
            if (exe1) return;
            var cityArr = ['rankofweek', 'city', 'lifestyle', 'food', 'politics', 'services', 'social', 'beauty', 'sports', 'personalities', 'technology', 'dating', 'health'];
            var cbObj = {};
            for (var i = 0; i < cityArr.length; i++) {
                cbObj = {};
                cbObj.scope = 'city';
                cbObj.ismp = true;
                cbObj.scopename = 'San Diego';
                cbObj.catstr = '0';
                cbObj.type = cityArr[i];
                cblock.addcblock(cbObj);
            }
            exe1 = true;

        }
        var nhs = $rootScope.neighborhoods.concat($rootScope.districts);
        var exe2 = false;
        function createCBlocksRecsNh() {
            if (exe2) return;
            var nhArr = ['rankofweeknh', 'neighborhood', 'lifestyle', 'food', 'services', 'social', 'beauty', 'health'];
            var cbObj = {};
            for (var n = 0; n < nhs.length; n++) {
                for (var i = 0; i < nhArr.length; i++) {
                    cbObj = {};
                    cbObj.scope = 'nh';
                    cbObj.ismp = false;
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
        function createCBlocksRecsRankX() {
            if (exe3) return;
            var rxArr = ['rxfeedback', 'rxsuggestion'];
            var cbObj = {};
            for (var i = 0; i < rxArr.length; i++) {
                cbObj = {};
                cbObj.scope = 'rx';
                cbObj.scopename = 'RankX';
                cbObj.ismp = false;
                cbObj.catstr = '0';
                cbObj.type = rxArr[i];
                cblock.addcblock(cbObj);
            }
            exe3 = true;
            //console.log("nhArr",nhArr);
        }

        function deleteCBlocks() {
            for (var i = 0; i < $rootScope.cblocks.length; i++) {
                cblock.deleteRec($rootScope.cblocks[i].id);
            }
        }
    }
})();
