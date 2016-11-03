(function () {
    'use strict';

    angular
        .module('app')

        /*['ngAnimate',
         'ngCookies',
         'ngResource',
         'ngRoute',
         'ngSanitize',
         'ngTouch',
         'pascalprecht.translate',
         'tmh.dynamicLocale'])*/

        .controller('layout', layout);

    layout.$inject = ['$location', '$rootScope','$window','$q', '$http','pvisits', 'DEBUG_MODE', 'rankofday',
    'answer', 'table','special', 'matchrec', 'edit','useractivity','vrows','headline','cblock', 'catans'];

    function layout($location, $rootScope, $window, $q, $http, pvisits, DEBUG_MODE, rankofday,
    answer, table, special, matchrec, edit, useractivity, vrows, headline, cblock, catans) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'layout';
        vm.header = '';
        vm.searchRank = searchRank;

        if ($rootScope.answers) vm.isLoading = false;
        else vm.isLoading = true;
        // Members

        activate();
        
        if ($window.innerWidth < 512) vm.logoimage = "../../../assets/images/rankxlogosd_sm.png";
        else vm.logoimage = "../../../assets/images/rankxlogosd.png";;

        function activate() {
            
            $rootScope.DEBUG_MODE = DEBUG_MODE;

            //$timeout(loadingDone, 1000);
            loadData();
            
            if ($rootScope.DEBUG_MODE) console.log("Layout Loaded!");

        }
        
        function loadData(){
            
            $rootScope.neighborhoods = [
                "Downtown", "La Jolla", "Pacific Beach", "Hillcrest", "University Heights", "Old Town", "Del Mar",
                "Ocean Beach", "North Park", "Mission Hills", "Barrio Logan", "City Heights", "Clairemont", "La Mesa", "Point Loma",
                "South Park", "Scripps Ranch", "Mission Beach", "Mission Valley","Kensington", "Cardiff by the Sea", "Coronado",
                "Leucadia", "Oceanside", "National City", "Rancho Santa Fe", "Solana Beach", "Poway", "El Cajon",
                "Escondido", "Carlsbad", "San Ysidro", "Otay Mesa", "Linda Vista", "Chula Vista", "Encinitas", "Golden Hills", 
                "Spring Valley", "Rancho San Diego", "Mira Mesa",
                "Torrey Pines", "Carmel Valley", "Miramar","Kearny Mesa","Bankers HIll","Rancho Penasquitos",
                "Sorrento Valley","Tierra Santa","Logan Heights","Serra Mesa","Normal Heights","Talmadge",
                "Bird Rock","South San Diego","North City","San Carlos","Del Cerro"
                ];
            
            $rootScope.districts = [
                "Columbia", "Core", "Cortez Hill", "East Village", "Gaslamp Quarter", "Horton Plaza", "Little Italy",
                "Marina", "Seaport Village"];
            
             $http.get('../../../assets/fields.json').success(function (response) {
                $rootScope.typeSchema = response;
                
            });

            $http.get('../../../assets/dialogs.json').success(function (response) {
                $rootScope.dialogs = response;
                
            });
            //answers
            var p0 = answer.getAnswers();
            var p1 = table.getTables();
            var p2 = special.getSpecials();
            var p3 = matchrec.GetMatchTable();
            var p4 = edit.getEdits();
            var p5 = useractivity.getAllUserActivity();
            var p6 = catans.getAllcatans();
            var p7 = vrows.getAllvrows();
            var p8 = headline.getheadlines();
            var p9 = cblock.getcblocks();
            var p10 = pvisits.getpvisits();
            var p11 = rankofday.getrankofday();

            return $q.all([p0, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11]).then(function (d){
                $rootScope.answers = d[0];
                $rootScope.content = d[1];
                $rootScope.specials = d[2];
                $rootScope.mrecs = d[3];
                $rootScope.edits = d[4];
                $rootScope.alluseractivity = d[5];
                $rootScope.catansrecs = d[6];
                $rootScope.cvrows = d[7];
                $rootScope.headlines = d[8];
                $rootScope.cblocks = d[9];
                $rootScope.pvisits = d[10];
                $rootScope.rankofday = d[11];
                
                updatePageVisits();
                loadingDone();
                      
            });
        }

        function loadingDone() {
            vm.isLoading = false;
        }
        
        function updatePageVisits(){
            //get todays date
            var datenow = new Date();
            var tz = datenow.getTimezoneOffset();
            
            datenow.setMinutes( datenow.getMinutes() - tz);
            var dateStr = datenow.toLocaleDateString();
            //console.log('Date Str: ', dateStr);
            var newDate = true;
            var pvisitrec = {};
            for (var i=0; i<$rootScope.pvisits.length; i++){
                if ($rootScope.pvisits[i].date == dateStr) {
                    newDate=false;
                    pvisitrec = $rootScope.pvisits[i];
                    break;
                }
            }
            if (newDate) pvisits.postRec(dateStr);
            else pvisits.patchRec(pvisitrec.id, pvisitrec.nvisits+1);                        
        }

        function searchRank() {
            $rootScope.sval = vm.val;
            $rootScope.$emit('searchRank');
        }

        /**
         * Set selected city
         * Now you can use $rootScope.selectCity variable anywhere to load city specific data.
         * i.e if you want to load ranks from particular city having table rank-la.
         * so you will get la from $rootScope.selectCity.code
         * @param city
         */
        $rootScope.selectCity = function (city) {
            $rootScope.selectedCity = city;
            window.localStorage.selectedCity = JSON.stringify($rootScope.selectedCity);
            closeModal("#selectCityModal");
        }
    }
})();
