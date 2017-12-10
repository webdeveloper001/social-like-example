(function () {
    'use strict';

    angular
        .module('app')
        .controller('layout', layout);

    layout.$inject = ['$location', '$rootScope', '$window', '$q', '$http', 'pvisits', '$cookies', '$scope','$timeout',
        'DEBUG_MODE', 'EMPTY_IMAGE', 'rankofday', 'answer', 'table', 'special', 'datetime', 'uaf', 'userdata', 'dialog',
        'matchrec', 'edit', 'useractivity', 'vrows', 'headline', 'cblock', 'catans', '$state', 'dataloader', 'setting', 'filter'];

    function layout($location, $rootScope, $window, $q, $http, pvisits, $cookies, $scope, $timeout,
        DEBUG_MODE, EMPTY_IMAGE, rankofday, answer, table, special, datetime, uaf, userdata, dialog,
        matchrec, edit, useractivity, vrows, headline, cblock, catans, $state, dataloader, setting, filter) {
        /* jshint validthis:true */

        //console.log("layout loading---------------------");
        var vm = this;
        vm.title = 'layout';
        vm.header = '';
        //-----SEO tags ----
        $scope.$parent.seo = {
            pageTitle: 'Rank-X',
            metaDescription: 'Rank-X creates collective rankings on everything in your city.'
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
        vm.quickFilter = quickFilter;
        vm.buttonsFwd = buttonsFwd;
        vm.buttonsPrev = buttonsPrev;
        
        vm.foodNearMe = false;
        if ($window.location.href.indexOf('rankSummary/food-near-me-9521') != -1) {
            vm.foodNearMe = true;
            vm.veilMsg = 'Just a moment, finding some delicious food...';
        }
        vm.dataready = false;
        vm.initready = false;
        vm.barIsActive = true;
        vm.childActive = false;
        vm.rodready = false;
        vm.showans = false;
        vm.myfavs = false;
        vm.myffavs = false;
        vm.noquery = true;

        //Admin Methods
        vm.editRank = editRank;
        vm.viewRank = viewRank;
        vm.applyRule = applyRule;
        vm.selCityActive = false;
        vm.selectNh = selectNh;
        vm.clearNh = clearNh;
        vm.nhctrl = false;
        vm.nh = '';
        vm.val = '';
        //vm.toggleSelCity = toggleSelCity;
        vm.showTrends = showTrends;
        //vm.scopeGeneral = scopeGeneral;
        //vm.scopeCity = scopeCity;
        //vm.childActive = false;

        vm.goPrivacyPolicy = goPrivacyPolicy;
        vm.goRankofDayConsole = goRankofDayConsole;

        $rootScope.inputVal = vm.val;
        $rootScope.nh = vm.nh;
        
        jQuery(document).ready(function () {
            var offset = 250;
            var duration = 300;
            jQuery(window).scroll(function () {
                if (jQuery(this).scrollTop() > offset) {
                    jQuery('.back-to-top').fadeIn(duration);
                } else {
                    jQuery('.back-to-top').fadeOut(duration);
                }
            });

            jQuery('.back-to-top').click(function (event) {
                event.preventDefault();
                jQuery('html, body').animate({ scrollTop: 0 }, duration);
                return false;
            })
        });
        /* Start Filtering feature by Roy */

        vm.showFilters = false;
        vm.toggleFilterBox = function () {
            vm.showFilters = !vm.showFilters;
        }

        vm.hideFilterBox = function () {
            vm.showFilters = false;
        }


        var refreshRanksListener = $rootScope.$on('refreshRanks', function () {
            if ($state.current.name == 'cwrapper') {
                vm.hidelogo = $rootScope.hidelogo;
            }
        });
        var showLogoListener = $rootScope.$on('showLogo', function () {
            if ($state.current.name == 'rankSummary' || $state.current.name == 'answerDetail') {
                //vm.hidelogo = false;
            }
        });
        var userDataLoadedListener = $rootScope.$on('userDataLoaded', function () {
            if ($rootScope.DEBUG_MODE) console.log("RX - userDataLoaded");
            loadingDone();
        });
        var homeDataLoadedListener = $rootScope.$on('homeDataLoaded', function () {
            if ($rootScope.DEBUG_MODE) console.log("RX - homeDataLoaded");
            vm.isLoading = false;
            vm.dataready = true;
            prepareNewCatansOptions();
            if ($rootScope.isLoggedIn) userdata.pullFavoriteData();
        });
        var rankDataLoadedListener = $rootScope.$on('rankDataLoaded', function () {
            if ($rootScope.DEBUG_MODE) console.log("RX - rankDataLoaded");
            if ($rootScope.initalHomeDataLoaded != true) {
                dataloader.getInitialData();
                if ($rootScope.isLoggedIn) userdata.pullFavoriteData();
            }
            loadingDone();
        });
        var answerDataLoadedListener = $rootScope.$on('answerDataLoaded', function () {
            if ($rootScope.DEBUG_MODE) console.log("RX - answerDataLoaded");
            if ($rootScope.initalHomeDataLoaded != true) {
                dataloader.getInitialData();
                if ($rootScope.isLoggedIn) userdata.pullFavoriteData();
            }
            loadingDone();
        });
        var initialHomeDataLoadedListener = $rootScope.$on('initalHomeDataLoaded', function () {
            if ($rootScope.DEBUG_MODE) console.log("RX - initialHomeLoaded");
            $rootScope.initalHomeDataLoaded = true;
            vm.initready = true;
            loadingDone();
        });
        var mainViewListener = $rootScope.$on('mainView', function (event) {
                vm.childActive = false; 
                gotoHome();
        });
        var hideSearchBarListener = $rootScope.$on('hideBar', function (event) {
                vm.childActive = true; 
                vm.barIsActive = false;
        });
        var backtoResultsListener = $rootScope.$on('backToResults', function (event) {
                    backToResults();   
        });

        var userLoggedOutListener = $rootScope.$on('userLoggedOut', function (event) {
                vm.isAdmin = false;
                buttons();
                vm.val = '';
        });
        
        var rodReadyListener = $rootScope.$on('rodReady', function (event) {
                vm.rodready = true;
                if ($rootScope.rankofday != undefined) {
                    if ($rootScope.DEBUG_MODE) console.log("$rootScope.rankofday - ", $rootScope.rankofday);
                    dataloader.pulldata('ranks', $rootScope.rankofday);
                }
                //console.log("$rootScope.rankofday - ", $rootScope.rankofday);
        });
        /*
        var setScopeListener = $rootScope.$on('setScope', function () {
            if ($rootScope.SCOPE == 1) {vm.scopeIsGeneral = true; vm.scopeIsCity = false; }
            if ($rootScope.SCOPE == 2) {vm.scopeIsGeneral = false; vm.scopeIsCity = true; } 
        });
        */
        var locationChangeListener = $rootScope.$on('$locationChangeSuccess', function() {
            if (window.location.href.indexOf('home') > -1) { vm.childActive = false; vm.barIsActive = true; }
            if (window.location.href.indexOf('rankSummary') > -1) { vm.childActive = true; vm.barIsActive = false; }
            if (window.location.href.indexOf('answerDetail') > -1) { vm.childActive = true; vm.barIsActive = false; }
            if (window.location.href.indexOf('trends') > -1) { vm.childActive = true; vm.barIsActive = false; }
        });   

        //$scope.$on('$destroy',setScopeListener);
        $scope.$on('$destroy',userLoggedOutListener);
        $scope.$on('$destroy',backtoResultsListener);
        $scope.$on('$destroy',hideSearchBarListener);
        $scope.$on('$destroy',mainViewListener);
        $scope.$on('$destroy',initialHomeDataLoadedListener);
        $scope.$on('$destroy',answerDataLoadedListener);
        $scope.$on('$destroy',rankDataLoadedListener);
        $scope.$on('$destroy',homeDataLoadedListener);
        $scope.$on('$destroy',userDataLoadedListener);
        $scope.$on('$destroy',showLogoListener);
        $scope.$on('$destroy',refreshRanksListener);
        $scope.$on('$destroy',rodReadyListener);

        if ($window.innerWidth < 512) {
            vm.logoimage = "/assets/images/rankxlogosd2_sm.png";
            $rootScope.sm = true;
            vm.sm = true;
            vm.wallpaper_fontsize = 21;
            $rootScope.DISPLAY_XSMALL = true;
            $rootScope.numInitItems = 12;
        }
        else {
            vm.logoimage = "/assets/images/rankxlogosd2_sm.png";
            $rootScope.sm = false;
            vm.sm = false;
            vm.wallpaper_fontsize = 28;
        }

        if (($window.innerWidth >= 512) && ($window.innerWidth < 768)) {
            $rootScope.DISPLAY_SMALL = true;
            $rootScope.numInitItems = 12;
        }

        $rootScope.md = false;
        if (($window.innerWidth >= 768) && ($window.innerWidth < 991)) {
            $rootScope.md = true;
            $rootScope.DISPLAY_MEDIUM = true;
            $rootScope.numInitItems = 16;
        }
        if ($window.innerWidth > 991) {
            $rootScope.DISPLAY_LARGE = true;
            $rootScope.numInitItems = 24;
        }
        vm.innerWidth = $window.innerWidth;

        //TODO: Would like to add this abstract template, but dont know how
        $rootScope.$on('$stateChangeSuccess', function (ev, to, toParams, from, fromParams) {
            vm.hideFilterBox();
            $rootScope.previousState = from.name;

        });

        var nidx = 0;

        var tourviewed = $cookies.get('tourviewed');
        if (tourviewed == undefined) tourviewed = false;

        activate();
        
        function activate() {

            $rootScope.isAdmin = false;
            $rootScope.dataAdmin = false;
            if ($rootScope.isLoggedIn) {
                // @rootScope.isAdmin = true;
                // @rootScope.dataAdmin = true;
                // @rootScope.contentAdmin = true;
                // @rootScope.modAdmin = true;

                if ($rootScope.user.id == '1599427743409374') $rootScope.dataAdmin = true;
                if ($rootScope.user.id == '10104518570729893') $rootScope.isAdmin = true;
                if ($rootScope.user.id == '10214255239240099') $rootScope.contentAdmin = true;
                if ($rootScope.user.id == '1638806919478345') $rootScope.modAdmin = true;
                if ($rootScope.user.id == '618105535243711') $rootScope.isAdmin = true;
            }
            vm.isAdmin = $rootScope.isAdmin || $rootScope.contentAdmin;

            $rootScope.$emit('adminCredentials');

            $rootScope.DEBUG_MODE = DEBUG_MODE;
            $rootScope.EMPTY_IMAGE = EMPTY_IMAGE;
            
            //$rootScope.SCOPE = 2; // This scope number is for city of San Diego.

            $rootScope.facebookAppId = ''; //1102409523140826'';
            $rootScope.facebookUrl = 'https://www.facebook.com/Rank-X-San-Diego-582174448644554';

            //$timeout(loadingDone, 1000);
            if ($rootScope.dataIsLoaded == undefined) {
                vm.isLoading = true;
                //vm.nh = 'hang in there';
                loadJSON();
                //if (!tourviewed && !$rootScope.isLoggedIn) dialog.tour();
            }
            else loadData();
            buttons();

            //Call userdata functions, If user is not logged in, functions do not execute.
            userdata.loadUserData();        //load user data (votes and activities)
            userdata.loadUserAccount();     //load user business account

            //Determine if user is using Facebook browser
            $rootScope.isFacebookApp = isFacebookApp();

            if ($rootScope.DEBUG_MODE) console.log("Layout Loaded!");

        }

        function loadJSON(){
            var p0 = $http.get('../../../assets/fields.json').then(function (response) {
                $rootScope.typeSchema = response.data;
                loadData();
            });

            $http.get('../../../assets/dialogs.json').then(function (response) {
                $rootScope.dialogs = response.data;
            });

            }

        function loadData() {
           
            //vm.allTopics = ['LifeStyle', 'Social', 'Sports', 'Food', 'Beauty & Fashion', 'Family', 'Technology', 'Dating', 'City', 'Services', 'Health', 'Celebrities'];
            //dataloader.getInitialData();    
            getDestination();
            //dataloader.getpagevisitdata();
            setting.getSetting();    

        }

        function loadingDone() {
            if ($rootScope.pageDataLoaded == undefined) $rootScope.pageDataLoaded = false;
            if ($rootScope.userDataLoaded == undefined) $rootScope.userDataLoaded = false;

            if (window.location.href.indexOf('rankSummary') > -1)
                //$rootScope.dataIsLoaded = $rootScope.rankSummaryDataLoaded && $rootScope.userDataLoaded;
                $rootScope.dataIsLoaded = $rootScope.userDataLoaded;

            else if (window.location.href.indexOf('answerDetail') > -1)
                $rootScope.dataIsLoaded = $rootScope.userDataLoaded;
            
            /*
            else if (window.location.href.indexOf('favs') > -1)
                $rootScope.dataIsLoaded = $rootScope.answerDetailLoaded && $rootScope.rankSummaryDataLoaded &&
                    $rootScope.pageDataLoaded && $rootScope.userDataLoaded;
            else if (window.location.href.indexOf('mybusiness') > -1)
                $rootScope.dataIsLoaded = $rootScope.answerDetailLoaded;
            else if (window.location.href.indexOf('promoteconsole') > -1)
                $rootScope.dataIsLoaded = $rootScope.answerDetailLoaded && $rootScope.rankSummaryDataLoaded &&
                    $rootScope.pageDataLoaded && $rootScope.userDataLoaded;
            else if (window.location.href.indexOf('home') > -1)
                $rootScope.dataIsLoaded = $rootScope.initalHomeDataLoaded;
            else $rootScope.dataIsLoaded = $rootScope.pageDataLoaded && $rootScope.userDataLoaded;*/
                else {
                    $rootScope.dataIsLoaded = $rootScope.initalHomeDataLoaded;
                    $state.go('cwrapper');
                }

            vm.isLoading = !$rootScope.dataIsLoaded;
            if ($rootScope.DEBUG_MODE) console.log("@loadingDone - $rootScope.dataIsLoaded -", $rootScope.dataIsLoaded);
            if ($rootScope.DEBUG_MODE) console.log("@loadingDone - $rootScope.pageDataLoaded -", $rootScope.pageDataLoaded);
            if ($rootScope.DEBUG_MODE) console.log("@loadingDone - $rootScope.userDataLoaded -", $rootScope.userDataLoaded);

        }

        function isFacebookApp() {
            var ua = navigator.userAgent || navigator.vendor || window.opera;
            //console.log("@isFacebook - ua - ", ua);
            return (ua.indexOf("FBAN") > -1) || (ua.indexOf("FBAV") > -1);
        }

        function goPrivacyPolicy() {
            vm.childActive = true; 
            vm.barIsActive = false;
            $state.go('privacypolicy');
        }

        function goRankofDayConsole() {
            vm.childActive = true; 
            vm.barIsActive = false;
            $state.go('rodconsole');
        }
        
        function getResults() {
            if (vm.val.length == 1) vm.showans = true;
            $rootScope.searchActive = true;
            vm.searchActive = $rootScope.searchActive;
            vm.childActive = !$rootScope.searchActive;
            $rootScope.isqf = false;
            if (vm.val.length == 0) vm.noquery = true;
            else vm.noquery = false
        }

        function hideSearch() {
            vm.searchActive = false;
            vm.childActive = true; 
            vm.barIsActive = false;
        }

        function gotoHome() {
            //$rootScope.searchActive = true;
            vm.searchActive = true;
            vm.childActive = false; 
            vm.barIsActive = true;
            if ($state.current.name == 'cwrapper') {
             //$rootScope.inputVal = '';
             vm.val = '';
            }
        }

        function backToResults() {
            vm.childActive = false; 
            vm.barIsActive = true;
            // $rootScope.cCategory = undefined;

            if ($state.current.name == 'cwrapper') {
                //$rootScope.inputVal = '';
                vm.val = '';
            }
            $state.go('cwrapper');

            if ($rootScope.inputVal != undefined && $rootScope.inputVal != '') {
                $rootScope.searchActive = true;
                vm.searchActive = true;
                vm.childActive = false;
            }

            
            $timeout(function(){
                $window.scrollTo(0, $rootScope.pageYOffset);
            })
        }

        function goAddRank() {
            if ($rootScope.isLoggedIn) {
                vm.childActive = true; 
                vm.barIsActive = false;
                $rootScope.cCategory = undefined; //clear current category 
                $state.go('addCustomRank');
            }
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
        }
        function applyRule() {
            $rootScope.$emit('applyRule');
        }

        function quickFilter(x){
            vm.showans = false;
            if (x == 'Favorites') {
                if ($rootScope.isLoggedIn) {
                    if (vm.myfavs == true) vm.myfavs = false;
                    else vm.myfavs = true;


                    if (vm.myfavs == true) {
                        //vm.showans = true;
                        clearNh();
                        vm.myffavs = false;
                        vm.val = 'myfavs:';
                        //clearNh();
                    }
                    else vm.val = '';
                }
                else dialog.getDialog('loginForFavorites');
            }
            else if (x == 'Friends') {
                if ($rootScope.isLoggedIn) {
                    if (vm.myffavs == true) vm.myffavs = false;
                    else vm.myffavs = true;

                    if (vm.myffavs == true) {
                        //vm.showans = true;
                        clearNh();
                        vm.myfavs = false;
                        vm.val = 'myffavs:';
                        //clearNh();
                    }
                    else vm.val = '';
                }
                else dialog.getDialog('loginForFriends');
            }
            else if (x == 'Neighborhood' || x == vm.nh) {
                if (vm.nhctrl == false) vm.nhctrl = true;
                else vm.nhctrl = false;

                if (vm.nhctrl == true) vm.nhops = $rootScope.nhs;
            }
            else {
                if (vm.nh == '' && vm.myfavs == false && vm.myffavs == false) vm.val = x;
                else {
                    if (vm.myfavs == true) vm.val = 'myfavs: ' + x;
                    else if (vm.myffavs == true) vm.val = 'myffavs: ' + x; 
                    else vm.val = vm.nh + ': ' + x;
                }
            }
            if (vm.myfavs == true || vm.myffavs == true) vm.showans = true;
            else vm.showans = false;

            $rootScope.isqf = true;
            getResults();
        }

        function selectNh(){
            if (vm.nhops.indexOf(vm.nhinp)>-1) {
                //Substitute 'Neighborhood' for selection
                if (vm.nh == '') vm.buts[vm.buts.indexOf('Neighborhood')] = vm.nhinp;
                else vm.buts[vm.buts.indexOf(vm.nh)] = vm.nhinp;
                
                vm.nh = vm.nhinp;
                vm.nhctrl = false;
                vm.val = vm.nh + ':';
                vm.myfavs = false;
                vm.myffavs = false;
                getResults();
            }
        }

        function clearNh(){
            var idx = vm.buts.indexOf(vm.nh);
            vm.buts[idx] = 'Neighborhood';

            vm.nhinp = '';
            vm.nh = '';
            vm.nhctrl = false;
            vm.val = '';
            getResults();
        }


        function prepareNewCatansOptions() {

            if ($rootScope.DEBUG_MODE) console.log("@prepareNewCatansOptions - $rootScope.content.length ", $rootScope.content.length);
            $rootScope.ctsOptions = [];
            //var titlex = '';
            for (var i = 0; i < $rootScope.categories.length; i++) {
                $rootScope.ctsOptions.push($rootScope.categories[i].category);
            }
        }
        
         function getDestination(){
            if (window.location.href.indexOf('rankSummary') > -1 && window.location.href.indexOf('food-near-me') < 0){
                vm.childActive = true; 
                vm.barIsActive = false;
            }
            else if(window.location.href.indexOf('answerDetail') > -1){
                vm.childActive = true; 
                vm.barIsActive = false;
            }
            else{
                $rootScope.SCOPE = 2; // Scope=2 is for city of San Diego, will change for different cities
                dataloader.getInitialData();
                $rootScope.childActive = false;
            }
        }

        function showTrends(){            
            vm.childActive = true; 
            vm.barIsActive = false;
            $rootScope.cCategory = undefined; //clear current category
            $state.go('trends');
        }

        function buttons(){
            vm.buts = ['Food','Coffee','Activities','Nightlife','Shopping','Beauty','Events','Health','Fitness','Sports','Services',
                        'Culture','People','City','Kids','Groups','Technology','Religion','Pets','Home','Cars','Neighborhood'];
            vm.bi = 0;
            if ($rootScope.isLoggedIn){
                vm.buts = ['Favorites'].concat(vm.buts);
                if ($rootScope.DISPLAY_XSMALL == true || $rootScope.DISPLAY_SMALL == true ){
                    //if display is small, add 'Friends' as 5th option
                    vm.buts = vm.buts.slice(0,4).concat(['Friends'].concat(vm.buts.slice(4,vm.buts.length)));
                }
                else {
                    //if display is large, add 'Friends' as 3rd option
                    vm.buts = vm.buts.slice(0,2).concat(['Friends'].concat(vm.buts.slice(2,vm.buts.length)));
                }
            }
        }
        
        function buttonsFwd(){
            if ($rootScope.DISPLAY_XSMALL || $rootScope.DISPLAY_SMALL){
                vm.bi = vm.bi += 8;
                if (vm.bi+8 > vm.buts.length) vm.bi = vm.buts.length-8;
            }
            if ($rootScope.DISPLAY_MEDIUM || $rootScope.DISPLAY_LARGE){
                vm.bi = vm.bi += 14;
                if (vm.bi+14 > vm.buts.length) vm.bi = vm.buts.length-14;
            }
        }
        function buttonsPrev(){
            if ($rootScope.DISPLAY_XSMALL || $rootScope.DISPLAY_SMALL){
                vm.bi = vm.bi -= 8;
                if (vm.bi < 0) vm.bi = 0;
            }
            if ($rootScope.DISPLAY_MEDIUM || $rootScope.DISPLAY_LARGE){
                vm.bi = vm.bi -= 14;
                if (vm.bi < 0) vm.bi = 0;
            }
        }

    }
})();
