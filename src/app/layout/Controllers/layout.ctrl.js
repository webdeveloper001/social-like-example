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
        'matchrec', 'edit', 'useractivity', 'vrows', 'headline', 'cblock', 'catans', '$state','dataloader', 'setting', 'filter'];

    function layout($location, $rootScope, $window, $q, $http, pvisits, $cookies, $scope,
        DEBUG_MODE, EMPTY_IMAGE, rankofday, answer, table, special, datetime, uaf, userdata, dialog,
        matchrec, edit, useractivity, vrows, headline, cblock, catans, $state, dataloader, setting, filter) {
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
        vm.goAddRank = goAddRank;
        vm.foodNearMe = false;
        if ($window.location.href.indexOf('rankSummary/food-near-me-9521') != -1 ) {
            vm.foodNearMe = true;
            vm.veilMsg = 'On rankSummary, there is special rank called ‘Food Near Me’.. this rank is more complicated than other ranks because it looks at all answers that are in ‘food related rankings’. The rankings are saved offline in JSON, foodranks.json. With these rankings we simplify a bit of the processing necessary to find all the answers. Problem is still there few seconds of a processing time needed. The task is to add a loading indication while this data is loaded.';
        }
        
        //Admin Methods
        vm.editRank = editRank;
        vm.viewRank = viewRank;
        vm.applyRule = applyRule;
        
        vm.goPrivacyPolicy = goPrivacyPolicy;
        vm.goRankofDayConsole = goRankofDayConsole;

        jQuery(document).ready(function() {
        var offset = 250; 
        var duration = 300;

        jQuery(window).scroll(function() {
            if (jQuery(this).scrollTop() > offset) {
                jQuery('.back-to-top').fadeIn(duration);
            } else {
                jQuery('.back-to-top').fadeOut(duration);
            }
        });
 
        jQuery('.back-to-top').click(function(event) {
            event.preventDefault();
            jQuery('html, body').animate({scrollTop: 0}, duration);
                return false;
            })
        });
        /* Start Filtering feature by Roy */
        
        vm.showFilters = false;
        vm.toggleFilterBox = function(){
            vm.showFilters = !vm.showFilters;
        }
        
        vm.selectNh = function(item, data){
            vm.filterOptions.isCity = false;
            vm.filterOptions.isNh = true;
        }

        vm.selectTopic = function(topic){
            if (topic == "All"){
                if(vm.filterOptions.isAllTopics == false){
                    vm.filterOptions.isAllTopics = true;
                    vm.filterOptions.ctopics = angular.copy(vm.allTopics);
                } else {
                    vm.filterOptions.isAllTopics = false;
                    vm.filterOptions.ctopics = [];
                }

            } else {
                if (vm.filterOptions.ctopics.indexOf(topic) !== -1) {
                    vm.filterOptions.isAllTopics = false;
                    vm.filterOptions.ctopics.splice(vm.filterOptions.ctopics.indexOf(topic), 1);
                } else {
                    vm.filterOptions.ctopics.push(topic);
                    var isAll = vm.allTopics.filter(function(topic){ return vm.filterOptions.ctopics.indexOf(topic) == -1 });
                    if(isAll.length == 0){
                        vm.filterOptions.isAllTopics = true;
                    }
                }
            }
        }
        
        vm.switchLocationScope = function(loc){
            if( loc == 'city' ){
                vm.filterOptions.isCity = true;    
                vm.filterOptions.isNh = false;
            } else {

                vm.filterOptions.isCity = false;
                vm.filterOptions.isNh = true;
            }
        }

        vm.applyFilters = function(){
            if(vm.filterOptions.ctopics.length == 0){
                alert("Please select at least 1 topic.");
                return;
            }
            filter.saveFilterOptions(vm.filterOptions);
            $rootScope.$emit('filterOptionChanged');
            vm.showFilters = !vm.showFilters;
        }
        /* End Filtering feature by Roy */

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
            prepareNewCatansOptions();
        });
        $rootScope.$on('rankDataLoaded', function () {
            loadingDone();
        });
        $rootScope.$on('answerDataLoaded', function () {
            loadingDone();
        });
        $rootScope.$on('initalHomeDataLoaded', function () {
            $rootScope.initalHomeDataLoaded = true;
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
            $rootScope.DISPLAY_XSMALL = true;
        }
        else {
            vm.logoimage = "/assets/images/rankxlogosd2_sm.png";
            $rootScope.sm = false;
            vm.sm = false;
        }

        if (($window.innerWidth >= 512) && ($window.innerWidth < 768)) {
            $rootScope.DISPLAY_SMALL = true;
        }

        $rootScope.md = false;
        if (($window.innerWidth >= 768) && ($window.innerWidth < 991)) {
            $rootScope.md = true;
            $rootScope.DISPLAY_MEDIUM = true;
        }
        if ($window.innerWidth > 991) {
            $rootScope.DISPLAY_LARGE = true;
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

            //****TEMP CODE, ENable for Admin Functions*****************
            $rootScope.isAdmin = false;
            vm.isAdmin = false;
            /*
            $rootScope.isLoggedIn = true;
            $rootScope.user = {};
            $rootScope.user.name = "Andres Moctezuma";
            $rootScope.user.first_name = 'Andres';
            $rootScope.user.last_name = 'Moctezuma';
            $rootScope.user.id = "10104518570729893";
            //**********************End of Temp Code */

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

            //Call userdata functions, If user is not logged in, functions do not execute.
                userdata.loadUserData();        //load user data (votes and activities)
                userdata.loadUserAccount();     //load user business account
            
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
                "Marina", "Bankers Hill","Balboa Park"];

            vm.nhs = [];
            vm.nhs = vm.nhs.concat($rootScope.neighborhoods,$rootScope.districts);
            vm.allTopics = ['LifeStyle', 'Social', 'Sports', 'Food', 'Beauty & Fashion', 'Family', 'Technology', 'Dating', 'City', 'Services', 'Health', 'Celebrities'];

            
            vm.filterOptions = filter.loadFilterOptions();

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
            if(!filter.loadInitalHomeData())
            // if (!$rootScope.initalHomeData)
                table.getMostPopularData();
            dataloader.gethomedata();
            // dataloader.getallranks();
            //dataloader.getallcblocks();
            dataloader.getrankdata();
            dataloader.getanswerdata();
            dataloader.getpagevisitdata();
            setting.getSetting();
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
            else if (window.location.href.indexOf('favs')>-1)
                $rootScope.dataIsLoaded = $rootScope.answerDetailLoaded && $rootScope.rankSummaryDataLoaded && 
                                    $rootScope.pageDataLoaded && $rootScope.userDataLoaded;
            else if (window.location.href.indexOf('mybusiness')>-1)
                $rootScope.dataIsLoaded = $rootScope.answerDetailLoaded;
            else if (window.location.href.indexOf('promoteconsole')>-1)
                $rootScope.dataIsLoaded = $rootScope.answerDetailLoaded && $rootScope.rankSummaryDataLoaded && 
                                    $rootScope.pageDataLoaded && $rootScope.userDataLoaded;
            else if (window.location.href.indexOf('home')>-1)
                $rootScope.dataIsLoaded = $rootScope.initalHomeDataLoaded;
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

        function goAddRank(){
            if ($rootScope.isLoggedIn) $state.go('addCustomRank');
            else dialog.loginFacebook();
        }

         //*****************Admin Functions************
        function editRank() {
            $rootScope.editMode = true;
            vm.selEditRank = 'active';
            vm.selViewRank = '';
            if ($rootScope.DEBUG_MODE) console.log("$rootScope.editMode -- ", $rootScope.editMode);

        }
        function viewRank() {
            $rootScope.editMode = false;
            vm.selEditRank = '';
            vm.selViewRank = 'active';
            //console.log("mode -- ", editMode);
        }
        function applyRule() {          
            $rootScope.$emit('applyRule');
        }

        function prepareNewCatansOptions() {
            
            if ($rootScope.DEBUG_MODE) console.log("@prepareNewCatansOptions - $rootScope.content.length ", $rootScope.content.length);
            $rootScope.ctsOptions = [];
            var titlex = '';
            for (var i = 0; i < $rootScope.content.length; i++) {
                if ($rootScope.content[i].title.indexOf('in Hillcrest') > -1) {
                    titlex = $rootScope.content[i].title.replace('Hillcrest', '@neighborhood');
                    $rootScope.ctsOptions.push(titlex);
                }
                if ($rootScope.content[i].tags.indexOf('isMP') > -1 && $rootScope.content[i].isatomic) {
                    $rootScope.ctsOptions.push($rootScope.content[i].title);
                }
            }
        }
/*
        $rootScope.selectCity = function (city) {
            $rootScope.selectedCity = city;
            window.localStorage.selectedCity = JSON.stringify($rootScope.selectedCity);
        }*/
    }
})();
