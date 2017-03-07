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
            getrankdata: getrankdata,
            getanswerdata: getanswerdata,
            getpagevisitdata: getpagevisitdata,
        };

        return service;

        function gethomedata() {

            var p0 = table.getTables();
            var p1 = headline.getheadlines();
            var p2 = cblock.getcblocks();
            var p3 = rankofday.getrankofday();
            var p4 = uaf.getactions();

            userdata.loadUserData();        //load user data (votes and activities)
            userdata.loadUserAccount();     //load user business account

            //Minimum Data for Cwrapper
            return $q.all([p0, p1, p2, p3, p4]).then(function (d) {
            
                $rootScope.content = d[0];
                $rootScope.headlines = d[1];
                $rootScope.cblocks = d[2];
                $rootScope.rankofday = d[3];
                $rootScope.uafs = d[4];

                $rootScope.pageDataLoaded = true;
                //loadingDone();
                if ($rootScope.DEBUG_MODE) console.log("cwrapper data ready!");
                $rootScope.$emit('homeDataLoaded');

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
            }
        }


        
       
    }
})();