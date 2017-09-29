(function () {
    'use strict';

    angular
        .module('app')
        .factory('dataloader', dataloader);

    dataloader.$inject = ['$http', '$q','$rootScope','pvisits', 'table2',
        'rankofday', 'answer', 'table', 'special', 'datetime', 'uaf', 
        'matchrec', 'edit', 'useractivity', 'vrows', 'headline', 'cblock', 'catans','categories', 'locations'];

    function dataloader($http, $q, $rootScope, pvisits, table2,
        rankofday, answer, table, special, datetime, uaf, 
        matchrec, edit, useractivity, vrows, headline, cblock, catans, categories, locations) {

        // Members
        var service = {
            gethomedata: gethomedata,
            gethomedataX: gethomedataX,
            landRanking: landRanking,
            landAnswer: landAnswer,
            //getallranks: getallranks,
            //getrankdata: getrankdata,
            //getanswerdata: getanswerdata,
            getpagevisitdata: getpagevisitdata,
            getInitialData: getInitialData,
            unwrap: unwrap,
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
            
            $q.all([p1,p2]).then(function(){
                unwrap();
                $rootScope.$emit('initalHomeDataLoaded');
            });

            var p3 = rankofday.getrankofday();
        }

       

        function gethomedata() {
/*
            var p0 = table.getTables();
            //var p1 = headline.getheadlines();
            //var p2 = cblock.getcblocksmain();
            //$rootScope.uafs = [];
            var p1 = rankofday.getrankofday();
            // var p2 = uaf.getactions();
            var p2 = uaf.getnext10actions();
            var p3 = categories.getAllCategories();
            var p4 = locations.getAllLocations();

            // userdata.loadUserData();        //load user data (votes and activities)
            // userdata.loadUserAccount();     //load user business account

            //Minimum Data for Cwrapper
            return $q.all([p0, p1, p2, p3, p4]).then(function (d) {
            
                //$rootScope.headlines = d[1];
                //$rootScope.cblocks = d[2];
                $rootScope.rankofday = d[1];
                $rootScope.uafs = d[2];

                $rootScope.categories = d[3];
                $rootScope.locations = d[4];

                $rootScope.content = d[0];
                unwrap(); // run whatever needs to be timed in between the statements

                //syncCatNh();
                createSearchStrings();

                $rootScope.pageDataLoaded = true;
                //loadingDone();
                createSearchStrings();
                if ($rootScope.DEBUG_MODE) console.log("cwrapper data ready!");
                $rootScope.$emit('homeDataLoaded');

            });
            */
        }

        function gethomedataX(scope) {

            if ($rootScope.DEBUG_MODE) console.log("gethomedataX called");

            $rootScope.pageDataLoaded = false;
            var p0 = table.getTablesX(scope);
            var p1 = categories.getAllCategoriesX(scope);
            var p2 = locations.getAllLocations();
            var p3 = answer.getAnswersX(scope);
            
            //Minimum Data for Cwrapper
            return $q.all([p0, p1, p2]).then(function (d) {
            
                // run whatever needs to be timed in between the statements
                unwrap();
                createSearchStrings();
                getEstablishmentAnswers();
                if ($rootScope.isLoggedIn) getDemoData();

                $rootScope.pageDataLoaded = true;
                checkStatus();
                getSecondaryData();
                table.storeInitialHomeData(ridsx);
                categories.storeInitialHomeData(cidsx);
                createNhOps();
                
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
                    else console.log("Couldnt find this category --- ",$rootScope.content[i].cat);
                }
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
                    answer.getAnswersL(result2).then(function(){
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
            landAnswerCheckStatus();
        }

        function createNhOps(){
            $rootScope.nhops = [];
            $rootScope.locations.forEach(function(nh){
                $rootScope.nhops.push(nh.nh_name);
            })
        }
/*
        function getallranks(){
            
            var p0 = table.getTablesNonMain();      //Get ranks that are non main page, load them on the background

            //Minimum Data for Cwrapper
            return $q.all([p0]).then(function (d) {
            
                $rootScope.content = d[0];
                $rootScope.allRanksLoaded = true;
                createSearchStrings();
                //loadingDone();
                if ($rootScope.DEBUG_MODE) console.log("all ranks data ready!");
                // $rootScope.$emit('homeDataLoaded');

            });
        }
*//*
        function getrankdata() {

            // Requirement for rankSummary
            var q0 = answer.getAnswers();
            var q1 = special.getSpecials();
            var q2 = matchrec.GetMatchTable();
            var q3 = useractivity.getAllUserActivity();
            var q4 = catans.getAllcatans();

            return $q.all([q0, q1, q2, q3, q4]).then(function (d) {
            
                $rootScope.answers = d[0];
                $rootScope.specials = d[1];
                $rootScope.mrecs = d[2];
                $rootScope.alluseractivity = d[3];
                $rootScope.catansrecs = d[4];
                
                $rootScope.rankSummaryDataLoaded = true;
                getEstablishmentAnswers();
                if ($rootScope.DEBUG_MODE) console.log("rankSummary data ready!");
                $rootScope.$emit('rankDataLoaded');

            });
        }
*//*
        function getanswerdata(){

            //Requirement for answerDetail
            var r0 = edit.getEdits();
            var r1 = vrows.getAllvrows();
            var r2 = table2.getTables();
            
            return $q.all([r0, r1, r2]).then(function (d) {
                
                $rootScope.edits = d[0];
                $rootScope.cvrows = d[1];
                $rootScope.customranks = d[2];
                
                $rootScope.answerDetailLoaded = true;
                if ($rootScope.DEBUG_MODE) console.log("answerdetail data ready!");
                $rootScope.$emit('answerDataLoaded');

            });   
        }
*/
        function getpagevisitdata(){

            //Not required for anything, just statistic, page visit counter
            var s0 = pvisits.getpvisits();
            return $q.all([s0]).then(function (d) {
                
                $rootScope.pvisits = d[0];
                updatePageVisits();
                if ($rootScope.DEBUG_MODE) console.log("page visits data ready!");
                
            });      
        }


        function updatePageVisits() {
            //get todays date
            var datenow = new Date();
            var tz = datenow.getTimezoneOffset();

            datenow.setMinutes(datenow.getMinutes() - tz);

            //var dateStr = datenow.toLocaleDateString();
            function pad(n) { return n < 10 ? n : n; }
            var dateStr = pad(datenow.getMonth() + 1) + "/" + pad(datenow.getDate()) + "/" + datenow.getFullYear();

            //console.log('Date Str: ', dateStr);
            var newDate = true;
            var pvisitrec = {};
            for (var i = 0; i < $rootScope.pvisits.length; i++) {
                if ($rootScope.pvisits[i].date == dateStr) {
                    newDate = false;
                    pvisitrec = $rootScope.pvisits[i];
                    break;
                }
            }
            if (newDate) pvisits.postRec(dateStr);
            else pvisits.patchRec(pvisitrec.id, pvisitrec.nvisits + 1);

            $rootScope.dateToday = dateStr;
            $rootScope.dateTodayNum = datetime.date2number(dateStr);
        }

        function getEstablishmentAnswers() {
            $rootScope.estAnswers = [];
            $rootScope.estNames = [];
            $rootScope.pplAnswers = [];
            $rootScope.pplNames = [];
            $rootScope.plaAnswers = [];
            $rootScope.plaNames = [];
            $rootScope.freAnswers = [];
            $rootScope.freNames = [];
            $rootScope.orgNames = [];
            $rootScope.orgAnswers = [];
            $rootScope.orgNames = [];
            for (var i = 0; i < $rootScope.answers.length; i++) {
                if ($rootScope.answers[i].type == 'Establishment') {
                    $rootScope.estNames.push($rootScope.answers[i].name);
                    $rootScope.estAnswers.push($rootScope.answers[i]);
                }
                if ($rootScope.answers[i].type == 'Person') {
                    $rootScope.pplNames.push($rootScope.answers[i].name);
                    $rootScope.pplAnswers.push($rootScope.answers[i]);
                }
                if ($rootScope.answers[i].type == 'Place') {
                    $rootScope.plaNames.push($rootScope.answers[i].name);
                    $rootScope.plaAnswers.push($rootScope.answers[i]);
                }
                if ($rootScope.answers[i].type == 'Organization') {
                    $rootScope.orgNames.push($rootScope.answers[i].name);
                    $rootScope.orgAnswers.push($rootScope.answers[i]);
                }
                if ($rootScope.answers[i].type == 'PersonCust') {
                    $rootScope.freNames.push($rootScope.answers[i].name);
                    $rootScope.freAnswers.push($rootScope.answers[i]);
                }
            }
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
                catans.getAllcatansX(data).then(function (result) {
                        if (result){
                        _ranksLoaded = true;
                        if ($rootScope.rankSummaryDataLoaded == false ||
                        $rootScope.rankSummaryDataLoaded == undefined) checkStatus();

                        var si = 0;
                        var ei = result.length > 200 ? 200:result.length;
                            while (si < result.length) {
                                answer.getAnswersL(result.slice(si,ei));
                                special.getSpecialsX(result.slice(si,ei));
                                vrows.getVrowsX(result.slice(si,ei));
                                matchrec.GetMatchTableX(result.slice(si,ei));
                                useractivity.getAllUserActivityX(result.slice(si,ei));
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
                //if (data.length > 0 && data.length < (20 + 1)) {

                    catans.getAllcatansY(data).then(function (result) {
                        if (result){
                        var si = 0;
                        var ei = result.length > 200 ? 200:result.length;
                            while (si < result.length) {
                                special.getSpecialsX(result);
                                vrows.getVrowsX(result);
                                matchrec.GetMatchTableX(result);
                                useractivity.getAllUserActivityX(result);
                                edit.getEditsX(result);
                                table2.getTablesX(result).then(function(result2){
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
                            pulldata('ranks', cranks);
                        }   
                    });
                //}
            }
        }

        function landRanking(slug){
            landRankActive = true;
            _ranksLoaded = false;
            var slugA = slug.split('-').map(Number);
            var idx = slugA[slugA.length-1];
            table.getSingleTable(idx).then(function(result){
                //$rootScope.content = result;
                catans.getAllcatansX(result).then(function(result2){
                _ranksLoaded = true;
                checkStatus();
                if (result2 != false){
                    answer.getAnswersL(result2).then(function(resultx){
                        $rootScope.answerDetailLoaded = true;
                        pulldata('answers', resultx);
                    });
                }
            });          
              
                if (result[0].scope == 1){
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
                //});                
            });
            //var data = {};
            //data.id = idx;
            //getDemoData();
        }

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
                var p1 = useractivity.getAllUserActivityX(result);
                return $q.all([p0,p1]).then(function (d){
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
            
            //getDemoData();
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

        function checkStatus(){
            if ($rootScope.pageDataLoaded && _ranksLoaded && !landAnswerActive){
                    $rootScope.rankSummaryDataLoaded = true;
                    $rootScope.answerDetailLoaded = true;
                    $rootScope.$emit('rankDataLoaded');
                }
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