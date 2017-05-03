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

    layout.$inject = ['$location', '$rootScope', '$window', '$q', '$http', 'pvisits', '$cookies', '$scope',
        'DEBUG_MODE', 'EMPTY_IMAGE', 'rankofday', 'answer', 'table', 'special', 'datetime', 'uaf', 'userdata', 'dialog',
        'matchrec', 'edit', 'useractivity', 'vrows', 'headline', 'cblock', 'catans', '$state','dataloader'];

    function layout($location, $rootScope, $window, $q, $http, pvisits, $cookies, $scope,
        DEBUG_MODE, EMPTY_IMAGE, rankofday, answer, table, special, datetime, uaf, userdata, dialog,
        matchrec, edit, useractivity, vrows, headline, cblock, catans, $state, dataloader) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'layout';
        vm.header = '';
        //-----SEO tags ----
        $scope.$parent.seo = { 
            pageTitle : 'Home |', 
            metaDescription: 'Home | Rank-X creates collective rankings on everything in your city.' 
        };
        
        //vm.searchRank = searchRank;

        //if ($rootScope.answers) vm.isLoading = false;
        //else
        vm.veilMsg = 'Just a moment, loading the best information about San Diego';
        vm.hidelogo = false;
        vm.getResults = getResults;
        vm.hideSearch = hideSearch;
        vm.gotoHome = gotoHome;

        vm.goPrivacyPolicy = goPrivacyPolicy;
        vm.goRankofDayConsole = goRankofDayConsole;

        $rootScope.$on('refreshRanks', function () {
            if ($state.current.name == 'cwrapper') {
                vm.hidelogo = $rootScope.hidelogo;
            }
        });
        $rootScope.$on('showLogo', function () {
            if ($state.current.name == 'rankSummary' || $state.current.name == 'answerDetail') {
                //vm.hidelogo = false;
            }
        });
        $rootScope.$on('userDataLoaded', function () {
            loadingDone();
        });
        $rootScope.$on('homeDataLoaded', function () {
            loadingDone();
        });
        $rootScope.$on('rankDataLoaded', function () {
            loadingDone();
        });
        $rootScope.$on('answerDataLoaded', function () {
            loadingDone();
        });

        /*
        if ($window.innerWidth < 512) vm.logoimage = "../../../assets/images/rankxlogosd_sm.png";
        else vm.logoimage = "../../../assets/images/rankxlogosd.png";
        */
        if ($window.innerWidth < 512) {
            vm.logoimage = "/assets/images/rankxlogosd2_sm.png";
            $rootScope.sm = true;
            vm.sm = true;
        }
        else {
            vm.logoimage = "/assets/images/rankxlogosd2_sm.png";
            $rootScope.sm = false;
            vm.sm = false;
        }

        //TODO: Would like to add this abstract template, but dont know how
        $rootScope.$on('$stateChangeSuccess', function (ev, to, toParams, from, fromParams) {
            $rootScope.previousState = from.name;
        });

        var nidx = 0;

        var tourviewed = $cookies.get('tourviewed');
        if (tourviewed == undefined) tourviewed = false;

        // Members
        activate();

        function activate() {

            $rootScope.DEBUG_MODE = DEBUG_MODE;
            $rootScope.EMPTY_IMAGE = EMPTY_IMAGE;    

            $rootScope.facebookAppId = ''; //1102409523140826'';
            $rootScope.facebookUrl = 'https://www.facebook.com/Rank-X-San-Diego-582174448644554';
       
            //$timeout(loadingDone, 1000);
            if ($rootScope.dataIsLoaded == undefined) {
                vm.isLoading = true;
                //vm.nh = 'hang in there';
                loadData();
                //if (!tourviewed && !$rootScope.isLoggedIn) dialog.tour();
            }

            //Determine if user is using Facebook browser
            $rootScope.isFacebookApp = isFacebookApp();

            if ($rootScope.DEBUG_MODE) console.log("Layout Loaded!");

        }

        function loadData() {

            $rootScope.neighborhoods = [
                "Downtown", "La Jolla", "Pacific Beach", "Hillcrest", "University Heights", "Old Town", "Del Mar",
                "Ocean Beach", "North Park", "Mission Hills", "Barrio Logan", "City Heights", "Clairemont", "La Mesa", "Point Loma",
                "South Park", "Scripps Ranch", "Mission Beach", "Mission Valley", "Kensington", "Cardiff by the Sea", "Coronado",
                "Leucadia", "Oceanside", "National City", "Rancho Santa Fe", "Solana Beach", "Poway", "El Cajon",
                "Escondido", "Carlsbad", "San Ysidro", "Otay Mesa", "Linda Vista", "Chula Vista", "Encinitas", "Golden Hills",
                "Spring Valley", "Rancho San Diego", "Mira Mesa",
                "Torrey Pines", "Carmel Valley", "Miramar", "Kearny Mesa", "Rancho Penasquitos",
                "Sorrento Valley", "Tierra Santa", "Logan Heights", "Serra Mesa", "Normal Heights", "Talmadge",
                "Bird Rock", "South San Diego", "North City", "San Carlos", "Del Cerro", "Grantville"
            ];

            $rootScope.districts = [
                "Columbia", "Core", "Cortez Hill", "East Village", "Gaslamp Quarter", "Horton Plaza", "Little Italy",
                "Marina", "Bankers Hill"];
            
            $rootScope.allnh = $rootScope.neighborhoods.concat($rootScope.districts);

            $http.get('../../../assets/fields.json').then(function (response) {
                $rootScope.typeSchema = response.data;
            });

            $http.get('../../../assets/dialogs.json').then(function (response) {
                $rootScope.dialogs = response.data;
            });

            $http.get('../../../assets/foodranks.json').then(function (response) {
                $rootScope.foodranks = response.data;
            });
/*
            if (window.location.href.indexOf('rankSummary')>-1){
                var myRegexp = /rankSummary\/([0-9]+)/g;
                var match = myRegexp.exec(window.location.href);
                var category = match[1];
                dataloader.getthisrankdata(category);
                console.log("rank id: ",match[1]);
            }
*/

            dataloader.gethomedata();
            dataloader.getallranks();
            dataloader.getallcblocks();
            dataloader.getrankdata();
            dataloader.getanswerdata();
            dataloader.getpagevisitdata();
            //loadingDone();
      }

        function loadingDone() {
            if ($rootScope.pageDataLoaded == undefined) $rootScope.pageDataLoaded = false;
            if ($rootScope.userDataLoaded == undefined) $rootScope.userDataLoaded = false;

            if (window.location.href.indexOf('rankSummary')>-1)
            $rootScope.dataIsLoaded = $rootScope.rankSummaryDataLoaded && $rootScope.pageDataLoaded && $rootScope.userDataLoaded;

            else if (window.location.href.indexOf('answerDetail')>-1)
            $rootScope.dataIsLoaded = $rootScope.answerDetailLoaded && $rootScope.rankSummaryDataLoaded && 
                                    $rootScope.pageDataLoaded && $rootScope.userDataLoaded;
            
            else $rootScope.dataIsLoaded = $rootScope.pageDataLoaded && $rootScope.userDataLoaded;

            vm.isLoading = !$rootScope.dataIsLoaded;
            //vm.isLoading = false;
            //$rootScope.dataIsLoaded = true;
            if ($rootScope.DEBUG_MODE) console.log("@loadingDone - $rootScope.dataIsLoaded -", $rootScope.dataIsLoaded);
            if ($rootScope.DEBUG_MODE) console.log("@loadingDone - $rootScope.pageDataLoaded -", $rootScope.pageDataLoaded);
            if ($rootScope.DEBUG_MODE) console.log("@loadingDone - $rootScope.userDataLoaded -", $rootScope.userDataLoaded);

        }

        function isFacebookApp() {
            var ua = navigator.userAgent || navigator.vendor || window.opera;
            //console.log("@isFacebook - ua - ", ua);
            return (ua.indexOf("FBAN") > -1) || (ua.indexOf("FBAV") > -1);
        }

        function goPrivacyPolicy(){
            $state.go('privacypolicy');
        }

        function goRankofDayConsole(){
            $state.go('rodconsole');
        }

        function showNeighborhoods(){

            setTimeout(function () {
                if (vm.isLoading) {
                    nidx = nidx + 1;
                    if (nidx >= $rootScope.neighborhoods.length-1) nidx = 0;
                    vm.nh = $rootScope.neighborhoods[nidx];
                    showNeighborhoods();
                }
            }, 333);
        }

        function getResults() {
            $rootScope.inputVal = vm.val;
            if ($rootScope.inputVal.length > 0) {
                $rootScope.searchActive = true;
            }
            else {
                $rootScope.searchActive = false;
            }
            vm.searchActive = $rootScope.searchActive;
            $window.scroll(0,0);
            $rootScope.$emit('getResults');
            
        }

        function hideSearch(){
            vm.searchActive = false;
        }

         function gotoHome() {
            $rootScope.fbmode = false;
            $rootScope.searchActive = false;
            vm.searchActive = false;
            $rootScope.hidelogo = false;
            $rootScope.inputVal = '';
            vm.val = '';
            //$state.go('cwrapper', {}, { reload: true });
            if ($state.current.name != 'cwrapper') {
                $state.go('cwrapper',{main: true});
            }
            else $rootScope.$emit('mainView');
        }

        /*
        function searchRank() {
            $rootScope.sval = vm.val;
            $rootScope.$emit('searchRank');
        }
        */
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
            //closeModal("#selectCityModal");
        }
    }
})();
