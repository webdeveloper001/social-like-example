(function () {
    'use strict';

    angular
        .module('app')
        .factory('dataloader', dataloader);

    dataloader.$inject = ['$http', '$q','$rootScope','pvisits', 'table2', 'dialog',
        'rankofday', 'answer', 'table', 'special', 'datetime', 'uaf', 'common', '$timeout',
        'matchrec', 'edit', 'useractivity', 'vrows', 'headline', 'cblock', 'catans','categories', 'locations'];

    function dataloader($http, $q, $rootScope, pvisits, table2, dialog,
        rankofday, answer, table, special, datetime, uaf, common, $timeout,
        matchrec, edit, useractivity, vrows, headline, cblock, catans, categories, locations) {

        // Members
        var service = {
            gethomedataX: gethomedataX,
            getRank: getRank,
            getAnswer: getAnswer,
            getInitialData: getInitialData,
            unwrap: unwrap,
            unwrapSingle: unwrapSingle,
            createSearchStrings: createSearchStrings,
            pulldata: pulldata,
            getDemoData: getDemoData,
        };

        var _ranksLoaded = false;

        var demoData1of3 = false;
        var demoData2of3 = false;
        var demoData3of3 = false;
        var demoDataReady = false;

        var answerReady = false;
        var dataReady = false;
        var catansReady = false;

        var landAnswerActive = false;
        var landRankActive = false;

        var rids = [1733, 11619, 11285, 11288, 11673, 9734, 468, 9822, 11271, 11927, 
                11241, 7674, 368, 43, 1728, 7965, 9735, 192, 10339, 9903, 
                11598, 12041, 93, 12020, 3125];
        var cids = [1164, 1130, 1403, 1407, 1313, 1275, 1149, 1276, 1390, 1475, 
                1367, 1241, 1128, 1092, 1161, 1260, 1277, 1112, 1305, 1293, 
                1106, 1542, 1104, 1535, 1200];
        var ridsx = [];
        var cidsx = [];

        return service;

        function getInitialData() {
            if ($rootScope.DEBUG_MODE) console.log("get initial data called");
            //Initial ranks and categories ids
            shuffle();
            var p1 = table.getInitialHomeData(ridsx);
            var p2 = categories.getInitialHomeData(cidsx);
            
            $q.all([p1,p2]).then(function(d){
                unwrap();
                waitforImages(d[1]);
                pulldata('ranks',d[0]).then(function(){
                    $timeout(function(){
                        gethomedataX($rootScope.SCOPE);
                    },50);
                });
            });
        }

        function gethomedataX(scope) {

            if ($rootScope.DEBUG_MODE) console.log("gethomedataX called");

            $rootScope.pageDataLoaded = false;
            var p0 = table.getTablesX(scope);
            var p1 = categories.getAllCategoriesX(scope);
            var p2 = locations.getAllLocations();
            var p3 = answer.getAnswersX(scope,1).then(function(){
                if ($rootScope.isLoggedIn) getDemoData();
                getSecondaryData();
                table.storeInitialHomeData(ridsx);
                categories.storeInitialHomeData(cidsx);
                //getEstablishmentAnswers();
                $rootScope.pageDataLoaded = true;
                checkStatus();
            });
            
            //Minimum Data for Cwrapper
            return $q.all([p0, p1, p2]).then(function (d) {
            
                // run whatever needs to be timed in between the statements
                unwrap();
                createSearchStrings();
                
                //Create array of neighborhood options
                $rootScope.nhs = $rootScope.locations.map(function(x) {return x.nh_name; });
                
                //Create array of neighborhoods that have sub areas
                $rootScope.locsas = $rootScope.locations.filter(function(x) {
                    return (x.sub_areas != undefined && x.sub_areas != '' && x.nh_name != 'San Diego');
                }).map(function(x) { return x.nh_name; });
                
                if ($rootScope.DEBUG_MODE) console.log("cwrapper data ready!");
                $rootScope.$emit('homeDataLoaded');

            });
        }

        function getSecondaryData(){
            var p0 = uaf.getactions();
            var p1 = headline.getheadlines();        
        }

        function unwrap(){

            if ($rootScope.DEBUG_MODE) console.log("dataloader.unwrap");

            var nhObj = {};
            var catObj = {};
            var idx = -1;
            var idx2 = -1;
            var idx = 0;
                for (var i=0; i < $rootScope.content.length; i++){
                    idx = $rootScope.locations.map(function (x) { return x.id; }).indexOf($rootScope.content[i].nh);
                    nhObj = $rootScope.locations[idx];
                    idx2 = $rootScope.categories.map(function (x) { return x.id; }).indexOf($rootScope.content[i].cat);
                    catObj = $rootScope.categories[idx2];
                    //console.log("catObj - ", catObj);
                    if(nhObj == undefined) {
                        nhObj = {};
                        nhObj.nh_name = 'San Diego';
                        nhObj.id = 1;
                        nhObj.sub_areas = '';
                    }
                    if (catObj) {
                        $rootScope.content[i].title = catObj.category.replace('@Nh', nhObj.nh_name);
                        $rootScope.content[i].fimage = catObj.fimage;
                        $rootScope.content[i].bc = catObj.bc;
                        $rootScope.content[i].fc = catObj.fc;
                        $rootScope.content[i].tags = catObj.tags;
                        $rootScope.content[i].keywords = catObj.keywords;
                        $rootScope.content[i].type = catObj.type;
                        $rootScope.content[i].question = catObj.question;
                        $rootScope.content[i].shade = catObj.shade;
                        if ($rootScope.content[i].nh == 1) $rootScope.content[i].introtext = catObj.introtext;
                        else $rootScope.content[i].introtext = '';
                        $rootScope.content[i].user = catObj.user;
                        //if (nhObj.sub_areas.split(',').map(Number).length > 1 && catObj.category.indexOf('@Nh')>-1)
                        if (nhObj.sub_areas && catObj.category.indexOf('@Nh') > -1)
                            $rootScope.content[i].isatomic = false;
                        else $rootScope.content[i].isatomic = true;
                        //Determine if set ismp flag.
                        if (catObj.ismp != null && catObj.ismp != undefined) $rootScope.content[i].ismp = catObj.ismp;
                        else if (nhObj.id == 1) $rootScope.content[i].ismp = true;
                        else $rootScope.content[i].ismp = false;
                        //$rootScope.content[i].ismp = true;
                    }
                    else if ($rootScope.DEBUG_MODE) console.log("Couldnt find this category --- ",$rootScope.content[i].cat);
                }
        }

        function unwrapSingle(rankObj, catObj, nhObj) {

            if ($rootScope.DEBUG_MODE) console.log("dataloader.unwrapSingle");

            var idx = $rootScope.content.map(function(x) {return x.id; }).indexOf(rankObj.id); 
            var rank = $rootScope.content[idx];

            rank.title = catObj.category.replace('@Nh', nhObj.nh_name);
            rank.fimage = catObj.fimage;
            rank.bc = catObj.bc;
            rank.fc = catObj.fc;
            rank.tags = catObj.tags;
            rank.keywords = catObj.keywords;
            rank.type = catObj.type;
            rank.question = catObj.question;
            rank.shade = catObj.shade;
            if (rank.nh == 1) rank.introtext = catObj.introtext;
            else rank.introtext = '';
            rank.user = catObj.user;
            //if (nhObj.sub_areas.split(',').map(Number).length > 1 && catObj.category.indexOf('@Nh')>-1)
            if (nhObj.sub_areas && catObj.category.indexOf('@Nh') > -1)
                rank.isatomic = false;
            else rank.isatomic = true;
            //Determine if set ismp flag.
            if (catObj.ismp != null && catObj.ismp != undefined) rank.ismp = catObj.ismp;
            else if (nhObj.id == 1) rank.ismp = true;
            else rank.ismp = false;
        }

        function getDemoData(){
            //Load demo custom ranks for customers to see
            var demoCustomRanks = [
                { category: 11091, id: 11091 },
                { category: 11092, id: 11092 },
                { category: 11093, id: 11093 },
            ];

            table2.getTablesD(demoCustomRanks).then(function(){
                demoData1of3 = true;
                checkDemoDataStatus();
            });
            catans.getAllcatansX(demoCustomRanks).then(function (result2) {
                if (result2 != false) 
                    answer.getAnswersFromCatans(result2).then(function(){
                        demoData2of3 = true;
                        checkDemoDataStatus();
                    });
                else {
                    demoData2of3 = true;
                    checkDemoDataStatus();
                }
            });
            special.getSpecialsbyAnswer(1).then(function(){
                demoData3of3 = true;
                checkDemoDataStatus();
            });       
        }

        function checkDemoDataStatus(){
            demoDataReady = demoData1of3 && demoData2of3 && demoData3of3;
        }

        

        function createSearchStrings(){
            $rootScope.searchStr = [];
            //Create seach strings combination of tags, title and answers            
            for (var i = 0; i < $rootScope.categories.length; i++) {                
                //Create single string for search
                $rootScope.searchStr[i] = ($rootScope.categories[i].tags ? $rootScope.categories[i].tags : '') + 
                " " + ($rootScope.categories[i].title ? $rootScope.categories[i].title : '');

            }

            $rootScope.searchStrContent = [];
            //Create seach strings combination of tags, title and answers            
            for (var i = 0; i < $rootScope.content.length; i++) {                
                //Create single string for search
                $rootScope.searchStrContent[i] = ($rootScope.content[i].tags ? $rootScope.content[i].tags : '') + 
                " " + ($rootScope.content[i].title ? $rootScope.content[i].title : '');
            }          
        }

        function pulldata(type, data) {
            if (type == 'ranks') {
                return catans.getAllcatansX(data).then(function (result) {
                        if (result){
                        //_ranksLoaded = true;
                        //if ($rootScope.rankSummaryDataLoaded == false ||
                        //$rootScope.rankSummaryDataLoaded == undefined) checkStatus();

                        var si = 0;
                        var ei = result.length > 200 ? 200:result.length;
                            while (si < result.length) {
                                answer.getAnswersFromCatans(result.slice(si,ei));
                                special.getSpecialsX(result.slice(si,ei));
                                vrows.getVrowsX(result.slice(si,ei));
                                matchrec.GetMatchTableX(result.slice(si,ei));
                                //useractivity.getAllUserActivityX(result.slice(si,ei));
                                edit.getEditsX(result.slice(si,ei));
                                table2.getTablesX(result.slice(si,ei));
                                si = ei;
                                ei = ei+200;
                                if (ei > result.length) ei = result.length;
                            }
                        }                     
                });
            }
            if (type == 'answers') {
                answer.getAnswers(data);
                catans.getAllcatansY(data).then(function (result) {
                        if (result){
                        var si = 0;
                        var ei = result.length > 200 ? 200:result.length;
                            while (si < result.length) {
                                special.getSpecialsX(result.slice(si,ei));
                                vrows.getVrowsX(result.slice(si,ei));
                                matchrec.GetMatchTableX(result.slice(si,ei));
                                //useractivity.getAllUserActivityX(result);
                                edit.getEditsX(result.slice(si,ei));
                                table2.getTablesX(result.slice(si,ei)).then(function(result2){
                                    if (result2 != false) pulldata('ranks',result2);
                                });
                                si = ei;
                                ei = ei+200;
                                if (ei > result.length) ei = result.length;
                            }

                            var cranks = [];
                            var cr = {};
                            data.forEach(function (item) {
                                if (item.ranks != null) {
                                    if (item.ranks.length > 2) {
                                        cr = JSON.parse(item.ranks);
                                        for (var i = 0; i < cr.length; i++) {
                                            cranks.push(cr[i]);
                                        }
                                    }
                                }
                            });
                            if (cranks.length > 0) pulldata('ranks', cranks);
                            
                        }   
                });
            }
        }

        //load data for single rank
        function getRank(slug) {
            if ($rootScope.DEBUG_MODE) console.log("getRank exec");
            var rankid = common.getIndexFromSlug(slug);
            var rankObj = {};
            if ($rootScope.isCustomRank) {
                var p0 = table2.getSingleTable(rankid);
                catans.getAllcatansX([{"id":rankid}]).then(function (result) {
                        if (result){
                            var p1 = answer.getAnswersFromCatans(result);
                            var p2 = special.getSpecialsX(result);
                            var p3 = vrows.getVrowsX(result);
                            var p4 = matchrec.GetMatchTableX(result);
                            var p5 = edit.getEditsX(result);
                            var p6 = table2.getTablesX(result);
                            $q.all([p0,p1,p2,p3,p4,p5,p6]).then(function(){
                                $rootScope.$emit('rankDataLoaded');
                            })
                        }                  
                });
            }
            else {
                var p0 = table.getSingleTable(rankid).then(function (res) {
                    var rankObj = res; //its necessary to wait for rank as the field 'catstr' is needed to parse
                    var p1 = categories.getCategory(rankObj.cat);
                    var p2 = locations.getLocation(rankObj.nh);
                    catans.getAllcatansX([rankObj]).then(function (result) {         //all the catans and answers
                        if (result){
                            var p4 = answer.getAnswersFromCatans(result);
                            var p5 = special.getSpecialsX(result);
                            var p6 = vrows.getVrowsX(result);
                            var p7 = matchrec.GetMatchTableX(result);
                            var p8 = edit.getEditsX(result);
                            var p9 = table2.getTablesX(result);
                            $q.all([p1,p2,p4,p5,p6,p7,p8,p9]).then(function(d){
                                var catObj = d[0][0];
                                var nhObj = d[1][0];
                                unwrapSingle(rankObj, catObj, nhObj);
                                $rootScope.$emit('rankDataLoaded');
                            });
                        }                  
                    });
                    if ($rootScope.SCOPE == undefined) $rootScope.SCOPE = rankObj.scope; 
                });
            }
        }
            
        function errorLoading() {
            dialog.notificationWithCallback(
                'Oops', 'Sorry, there was an error loading this ranking.',
                function(){
                    $state.go('cwrapper');
                });
        }

        //load data for just one answer
        function getAnswer(slug){
            var ansid = common.getIndexFromSlug(slug);
            var ansObj = {};
            var data = {};
            data.id = ansid;
            data.answer = ansid;
            var p0 = answer.getAnswer(ansid);
            var p1 = special.getSpecialsX([data]);
            var p2 = matchrec.GetMatchTableX([data]);
            var p3 = edit.getEditsX([data]);
            var p4 = table2.getTablesX([data]);
            var p5 = vrows.getVrowsX([data]);
            catans.getAllcatansY([data]).then(function(result){
                if (result){
                    
                    var p6 = table.getTablesL(result).then(function(resultx){
                    
                    if (resultx.constructor === Array) {}
                    else resultx = [resultx];
                    var p7 = categories.getCategoriesL(resultx);
                    var p8 = locations.getLocationsL(resultx);
                    $q.all([p0,p1,p2,p3,p4,p5,p6,p7,p8]).then(function (d){
                        var ans = d[0];
                        unwrap();
                        if ($rootScope.SCOPE == undefined) $rootScope.SCOPE = ans.scope;
                        $rootScope.$emit('answerDataLoaded');
                    });
                });
                }
            else $rootScope.$emit('answerDataLoaded');
                
            });
        }
/*
        function landAnswer(slug){
            landAnswerActive = true;
            var slugA = slug.split('-').map(Number);
            var idx = slugA[slugA.length-1];
            
            answer.getAnswer(idx).then(function(result){
                //$rootScope.answers = result;
                answerReady = true;
                landAnswerCheckStatus();
                if (result.scope == 1){
                    $rootScope.SCOPE = 1;
                    //table.getMostPopularDataX(1);
                    getInitialData();
                    gethomedataX(1);
                }
                else{
                    $rootScope.SCOPE = 2;
                    //table.getMostPopularDataX(2);
                    getInitialData();
                    gethomedataX(2);
                }
                $rootScope.$emit('setScope');
            });
            var data = {};
            data.id = idx;
            catans.getAllcatansY([data]).then(function(result){
                var p0 = table.getTablesL(result);
                //var p1 = useractivity.getAllUserActivityX(result);
                return $q.all([p0]).then(function (d){
                    catansReady = true;
                    landAnswerCheckStatus(); 
                });              
            });
            data.answer = idx;
                var p2 = special.getSpecialsX([data]);
                var p3 = matchrec.GetMatchTableX([data]);
                var p4 = edit.getEditsX([data]);
                var p5 = table2.getTablesX([data]);
                var p6 = vrows.getVrowsX([data]);
                
                return $q.all([p2, p3, p4, p5, p6]).then(function (d){
                    dataReady = true;
                    landAnswerCheckStatus();  
                });
            
        }

        function landAnswerCheckStatus(){
            if (answerReady && catansReady && dataReady){
                    if ($rootScope.isLoggedIn){
                        if (demoDataReady){
                            $rootScope.rankSummaryDataLoaded = true;
                            $rootScope.answerDetailLoaded = true;
                            $rootScope.$emit('answerDataLoaded');
                        }
                    }
                    else{
                        $rootScope.rankSummaryDataLoaded = true;
                        $rootScope.answerDetailLoaded = true;
                        $rootScope.$emit('answerDataLoaded');
                    }
            }
        }
*/
        function checkStatus(){
            if ($rootScope.pageDataLoaded && _ranksLoaded && !landAnswerActive){
                    $rootScope.rankSummaryDataLoaded = true;
                    $rootScope.answerDetailLoaded = true;
                    $rootScope.$emit('rankDataLoaded');
                }
        }

        function waitforImages(cats){
            //get all fimage and wait until they are resolved
            var pArr = [];
            cats.forEach(function(item){
                if (item.fimage != null && item.fimage != undefined && item.fimage.indexOf('rankx')>-1) 
                    pArr.push( $http.get(item.fimage) );
            });
            $q.all(pArr).then(function(){
                $rootScope.$emit('initalHomeDataLoaded');
            });
        }

        function shuffle(){
            //Randomly get 12 ranks from those listed in rids and cids
            var N = rids.length;
            var idxs = [];
            var n = 0;
            while (idxs.length < 12){
                n = Math.floor(Math.random() * N);
                if (idxs.indexOf(n) == -1) idxs.push(n);
            }
            
            idxs.forEach(function(i){
                ridsx.push(rids[i]);
                cidsx.push(cids[i]);
            })

        }
                
    }
})();