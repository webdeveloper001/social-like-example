(function () {
    'use strict';

    angular
        .module('app')
        .factory('dataloader', dataloader);

    dataloader.$inject = ['$http', '$q','$rootScope','pvisits', 
        'rankofday', 'answer', 'table', 'special', 'datetime', 'uaf', 'userdata',
        'matchrec', 'edit', 'useractivity', 'vrows', 'headline', 'cblock', 'catans'];

    function dataloader($http, $q, $rootScope, pvisits, 
        rankofday, answer, table, special, datetime, uaf, userdata,
        matchrec, edit, useractivity, vrows, headline, cblock, catans) {

        // Members
        var service = {
            gethomedata: gethomedata,
            getallranks: getallranks,
            //getthisrankdata: getthisrankdata,
            getallcblocks: getallcblocks,
            getrankdata: getrankdata,
            getanswerdata: getanswerdata,
            getpagevisitdata: getpagevisitdata,
            getInitalHomeData: getInitalHomeData
        };

        return service;

        function getInitalHomeData() {
            table.getInitalHomeData().then(function(response){

            });
        }
        function gethomedata() {

            var p0 = table.getTables();
            var p1 = headline.getheadlines();
            //var p2 = cblock.getcblocksmain();
            var p3 = rankofday.getrankofday();
            var p4 = uaf.getactions();

            userdata.loadUserData();        //load user data (votes and activities)
            userdata.loadUserAccount();     //load user business account

            //Minimum Data for Cwrapper
            return $q.all([p0, p1, p3, p4]).then(function (d) {
            
                $rootScope.content = d[0];
                $rootScope.headlines = d[1];
                //$rootScope.cblocks = d[2];
                $rootScope.rankofday = d[2];
                $rootScope.uafs = d[3];

                $rootScope.pageDataLoaded = true;
                //loadingDone();
                createSearchStrings();
                if ($rootScope.DEBUG_MODE) console.log("cwrapper data ready!");
                $rootScope.$emit('homeDataLoaded');

            });
        }

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

        function getallcblocks(){
            
            var p0 = cblock.getcblocksall();      //Get ranks that are non main page, load them on the background

            //Minimum Data for Cwrapper
            return $q.all([p0]).then(function (d) {
            
                $rootScope.cblocks = d[0];
                $rootScope.allCblocksLoaded = true;
                
                if ($rootScope.DEBUG_MODE) console.log("all cblocks ready!");
                //$rootScope.$emit('homeDataLoaded');
            });
        }

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

        function getanswerdata(){

            //Requirement for answerDetail
            var r0 = edit.getEdits();
            var r1 = vrows.getAllvrows();
            
            return $q.all([r0, r1]).then(function (d) {
                
                $rootScope.edits = d[0];
                $rootScope.cvrows = d[1];
                
                $rootScope.answerDetailLoaded = true;
                if ($rootScope.DEBUG_MODE) console.log("answerdetail data ready!");
                $rootScope.$emit('answerDataLoaded');

            });   
        }

        function getpagevisitdata(){

            //Not required for anything, just statistic, page visit counter
            var s0 = pvisits.getpvisits();
            return $q.all([s0]).then(function (d) {
                
                $rootScope.pvisits = d[0];
                updatePageVisits();
                if ($rootScope.DEBUG_MODE) console.log("page visits data ready!");
                
            });      
        }

        /*
        function getthisrankdata(category){
            var p0 = table.getSingleTable(category);
            return $q.all([p0]).then(function (d) {
                
                $rootScope.content = d[0];
                if ($rootScope.DEBUG_MODE) console.log("loaded single table!");

                var catansarr = [];
                if ($rootScope.content[0].isatomic == true){
                    catansarr = [category];
                }
                else catansarr = $rootScope.content[0].catstr.split(':').map(Number);
                console.log("catansarr - ",catansarr);
                var s0 = catans.getbyCategory(catansarr);
                
            });
        }*/

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
            }
        }

        function createSearchStrings(){
            $rootScope.searchStr = [];
            //Create seach strings combination of tags, title and answers            
            for (var i = 0; i < $rootScope.content.length; i++) {                
                //Create single string for search
                //$rootScope.searchStr[i] = $rootScope.content[i].tags + " " + $rootScope.content[i].title + " " + $rootScope.content[i].answertags;
                $rootScope.searchStr[i] = $rootScope.content[i].tags + " " + $rootScope.content[i].title;
            
            }
        }

    }
})();