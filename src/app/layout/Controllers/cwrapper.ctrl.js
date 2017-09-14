(function () {
    'use strict';

    angular
        .module('app')
        .controller('cwrapper', cwrapper);

    cwrapper.$inject = ['$rootScope', '$state', '$http', '$stateParams', '$scope',
        'query', 'table', 'dialog', 'uaf','$window','userdata','$location','color', 'fbusers', '$q', '$timeout', 'filter', 'search', 'mailing'];

    function cwrapper($rootScope, $state, $http, $stateParams, $scope,
        query, table, dialog, uaf, $window, userdata, $location, color, fbusers, $q, $timeout, filter, search, mailing) {

        /* jshint validthis:true */
        var vm = this;
        //-----SEO tags ----
        $scope.$parent.$parent.$parent.seo = { 
            pageTitle : '', 
            metaDescription: 'Rank-X creates collective rankings on everything in your city. '+ 
            'Find the best restaurants, services, activities, events, places, events and more.' 
        };
        
        /// ui-scroll
        var datasource = {};
        datasource.get = function (index, count, success) {
            $timeout(function () {
                var result = [];
                for (var i = index; i <= index + count - 1; i++) {
                    result.push("item #" + i);
                }
                success(result);
            }, 100);
        };
        $rootScope.$emit('homeDataLoaded');
        vm.sm = $rootScope.sm;
        vm.md = $rootScope.md;
        vm.datasource = datasource;
        ///Ui-scroll ends

        $timeout(function(){
            
            var height = 70;
            // if (vm.md) {
            //     height = 400;
            // }
            var width = $('#facebook-container').width();
            $('#facebook-display').html('');
            $('#facebook-display').html('<div class="fb-page" \
                ng-if="vm.pageDataLoaded"           \
                data-href="https://www.facebook.com/rankxsandiego/"  \
                data-tabs="timeline"  \
                data-height="' + height + '" \
                data-width="' + width + '" \
                data-small-header="false"  \
                data-adapt-container-width="true"  \
                data-hide-cover="false" \
                data-show-facepile="true"> \
                    <blockquote cite="https://www.facebook.com/rankxsandiego/" class="fb-xfbml-parse-ignore">\
                    <a href="https://www.facebook.com/rankxsandiego/">Rank-X San Diego</a></blockquote>\
            </div>');

            
            FB.XFBML.parse();    
        }, 2000);

        vm.title = 'cwrapper';

        vm.switchScope = switchScope;
        
        if ($rootScope.hidelogo == undefined) vm.hidelogo = false;
        else vm.hidelogo = $rootScope.hidelogo;
        //Quick Links 
        vm.foodNearMe = foodNearMe;
        vm.events = events;
        vm.selfimprove = selfimprove;
        
        //Methods
        vm.selnh = selnh;
        vm.goHome = goHome;
        vm.gotoAnswer = gotoAnswer;
        vm.gotoRank = gotoRank;
        
        //vm.fres = 4;
        //vm.ftext = 'see more';
        
        //vm.isAdmin = true;
        $rootScope.editMode = false;
        //*****************************
        
        vm.content = [];
        vm.emptyspace = '';
        vm.fbm = $rootScope.fbmode ? true:false;
        
        //$rootScope.searchActive = $rootScope.searchActive ? $rootScope.searchActive: false;
        //vm.searchActive = $rootScope.searchActive;
        
        //Receive from navbar, if 'Home' go to Main View
        var mainViewListener = $rootScope.$on('mainView', function (event) {
            if ($state.current.name == 'cwrapper') {
                goHome();
            }
        });


        /* Start Ininite scrolling and new features by Roy */
        vm.loadMore = loadMore;
        vm.showLess = showLess;

/*
        vm.initialDataCount = 12;
        //if ($rootScope.md) {
          //  vm.initialDataCount = 8;
        //}
        vm.pageDataLoaded = $rootScope.pageDataLoaded;
        vm.initalHomeData = $rootScope.initalHomeData;
        
        vm.initalHomeData = vm.initalHomeData.splice(0, vm.initalHomeData.length > vm.initialDataCount ? vm.initialDataCount : vm.initalHomeData.length);

        vm.currentIndex = 0;
            vm.startIndex = 0;
        if($rootScope.sm){
            vm.scrollingItemsOnePage = 6;
            vm.loadingCountOneScroll = 3;
        }
        else{
            vm.loadingCountOneScroll = 6;
            vm.scrollingItemsOnePage = 12;
        }

        vm.scrollingItemsOnePage = 1000;
        //vm.scrollingData = [];
        vm.scrollDataLoading = false;
        vm.content = [];
        vm.endReached = false;
        vm.scrollingData = [];
        vm.uniqueResult = [];
        if($rootScope.pageDataLoaded){
            //vm.content = angular.copy($rootScope.content);
            //loadInifiniteScroll(true);
        }*/

        $rootScope.$on('filterOptionChanged', function () {
            //if(vm.pageDataLoaded)
                //loadInifiniteScroll(true);
        });

        $rootScope.$on('initalHomeDataLoaded', function () {
            //reload();
        });

        $rootScope.$on('homeDataLoaded', function () {
            //vm.pageDataLoaded = true;
            //console.log("length $rootScope.content - ",$rootScope.content.length );
            vm.content = angular.copy($rootScope.content);
            //loadInifiniteScroll(false);

/*
            if(!$rootScope.hasBusiness && !$rootScope.isPromoter) {
                var time = 60000 * 5;
                if ($rootScope.isLoggedIn){
                    time = 60000 * 5;
                }
                $timeout(function(){
                    //dialog.openSubscriptionDlg(execSubscription);
                }, time);;
            }*/
        });

        function reload(){
            vm.initalHomeData = $rootScope.initalHomeData;
        }

        function execSubscription(email){
            mailing.subscribed(email, $rootScope.user ? $rootScope.user.first_name + ' ' + $rootScope.user.last_name : '');
        }
        // angular.element($window).bind("scroll", function() {
        //     var height = Math.max( angular.element('body')[0].scrollHeight, angular.element('body')[0].offsetHeight, 
        //                angular.element('html')[0].clientHeight, angular.element('html')[0].scrollHeight, angular.element('html')[0].offsetHeight );
        //     if (($('#inifinite-container').offset().top + 600 > this.pageYOffset) && (this.pageYOffset > $('#inifinite-container').offset().top)) {
        //         console.log(height, this.pageYOffset);
        //         // vm.showLess();
        //     } 
        //     $scope.$apply();
        // });
        function loadInifiniteScroll(reloading){
            
            vm.currentIndex = 0;
            vm.startIndex = 0;
            vm.loadingCountOneScroll = 6;
            vm.scrollDataLoading = false;
            // vm.content = [];
            vm.endReached = false;
            vm.scrollingData = [];
            
            var searchResult = [];
            var uniqueResult = [];

            var searchLocation = '';
            if($rootScope.filterOptions.isCity)
                searchLocation = " in San Diego";
            else
                searchLocation = ' in ' + $rootScope.filterOptions.cnh;

            if($rootScope.filterOptions.isAllTopics && $rootScope.filterOptions.isCity){
                // uniqueResult = angular.copy($rootScope.content.filter(function(ranking){ return ranking.ismp == 1;}));
                //var res = search.searchRanksMainPage($rootScope.filterOptions.isCity,'san diego');
                res = $rootScope.content;
                searchResult = searchResult.concat(res);
            } else if($rootScope.filterOptions.isAllTopics && !$rootScope.filterOptions.isCity) {
                var res = search.searchRanksMainPage($rootScope.filterOptions.isCity, $rootScope.filterOptions.cnh);
                searchResult = searchResult.concat(res);
            } else {
                for (var i = 0; i < $rootScope.filterOptions.ctopics.length; i++) {
                    var res = search.searchRanksMainPage($rootScope.filterOptions.isCity, $rootScope.filterOptions.ctopics[i].toLowerCase() + searchLocation);
                    searchResult = searchResult.concat(res);               
                }
            }
            //var res = $rootScope.content;
            
            shuffle(searchResult);

            searchResult.forEach(function(ranking){
                if(uniqueResult.indexOf(ranking) == -1 && ranking.ismp){
                    uniqueResult.push(ranking);
                }
            });
            
            // uniqueResult.sort(function(ranking1, ranking2){
            //     var view1 = ranking1.views ? ranking1.views : 0;
            //     var view2 = ranking2.views ? ranking2.views : 0;
            //     if( ranking1.id == ranking2.id )
            //         return 0;

            //     return view1 < view2 ? 1 : -1;
            // })
            if(reloading) {
                if( uniqueResult.length >= vm.initialDataCount ) {
                    vm.initalHomeData = uniqueResult.splice(0, vm.initialDataCount);
                    filter.saveInitalHomeData(vm.initalHomeData);
                } else {
                    vm.initalHomeData = uniqueResult;
                    filter.saveInitalHomeData(vm.initalHomeData);
                    uniqueResult = [];
                }
                vm.uniqueResult = uniqueResult;
            } else {
                
                var initalHomeDataIDs = vm.initalHomeData.map(function(ranking){ return ranking.id; })
                vm.uniqueResult = uniqueResult.filter(function(ranking){
                    return initalHomeDataIDs.indexOf(ranking.id) == -1;
                });

            }
            for(var i = 0; i < vm.uniqueResult.length; i ++){
                //Push Only applying to filters
                vm.scrollingData.push(i);
            }
            
            shuffle(vm.scrollingData);
            //Sort again to lay rankings with images first
        }

        function loadMore(){

            vm.scrollDataLoading = true;
            $timeout(function(){
                if(vm.currentIndex + vm.loadingCountOneScroll > vm.scrollingData.length - 1){
                    vm.current = vm.scrollingData.length;
                    vm.endReached = true;
                }
                vm.currentIndex += vm.loadingCountOneScroll;
                if((vm.currentIndex - vm.startIndex) > vm.scrollingItemsOnePage){
                    vm.startIndex = vm.currentIndex - vm.scrollingItemsOnePage;        
                }

            
                vm.scrollDataLoading = false;
            }, 500);
        }

        function showLess(){
            if(vm.startIndex >= 3){
                vm.startIndex -= 3;
                vm.currentIndex -= 3;
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
        /* End Ininite scrolling and new features by Roy */

        $scope.$on('$destroy',mainViewListener);

        //Receive from layout search bar
        /*
        var getResultsListener = $rootScope.$on('getResults', function (event) {
            vm.searchActive = $rootScope.searchActive;
        });*/

        //$scope.$on('$destroy',getResultsListener);

        window.prerenderReady = false;

        //if ($rootScope.cwrapperLoaded) activate();
        //else init();
        function activate() {
            if ($state.params.main == true) goHome();
            
            $rootScope.inFavMode = false;
            
            //getFeed();
            if ($rootScope.DEBUG_MODE) console.log("activate cwrapper!");
            vm.isNh = $rootScope.isNh;
            
            if (vm.isNh) vm.querybc = '#428bca';
            else vm.querybc = 'white'; //#f9f9f9
            
            vm.isNhRdy = $rootScope.isNhRdy;
            vm.cnh = $rootScope.cnh;
            
            if (vm.isNh) vm.searchScope = vm.isNhRdy ? $rootScope.cnh : 'Neighborhood';
            vm.isCity = $rootScope.isCity;
            
            if (vm.isCity) vm.searchScope = 'all San Diego';
            
            vm.nhs = $rootScope.neighborhoods.concat($rootScope.districts);
            vm.searchActive = $rootScope.searchActive ? $rootScope.searchActive: false;
            
            //$rootScope.includeNearMe = false;
            $rootScope.cCategory = undefined;
            
            vm.val = $rootScope.inputVal; //remember user query
            
            window.prerenderReady = true;   
            
                    
        }
        function init() {

            if ($rootScope.DEBUG_MODE) console.log("init cwrapper!");
                
            //****SUPER TEMP*****************
            vm.isAdmin = $rootScope.isAdmin;
            /*
            $rootScope.isLoggedIn = true;
            $rootScope.user = {};
            $rootScope.user.name = "Andres Moctezuma";
            $rootScope.user.first_name = 'Andres';
            $rootScope.user.last_name = 'Moctezuma';
            $rootScope.user.id = "10104518570729893";
            userdata.loadUserData();        //load user data (votes and activities)
            userdata.loadUserAccount();     //load user business account
            //$rootScope.answeridxgps = 1258; //starting indx for gps conversion
               /*        
            if ($rootScope.isLoggedIn && $rootScope.user.name == "Andres Moctezuma" && $rootScope.user.id == 12) {
                $rootScope.isAdmin = true;
                vm.isAdmin = true;
            }
            viewRank();
                */
            //******************************

            //Load current category
            //$rootScope.content = {};
            //vm.isBasic = $rootScope.isBasic;

            $rootScope.inputVal = '';
            
            switchScope(1); //Default view is basic query view
            vm.cnh = 'Select Neighborhood';
            $rootScope.cnh = vm.cnh;
            vm.isNhRdy = false;
            $rootScope.isNhRdy = false; 

            var bgc = '#595959';
            var bgc2 = color.shadeColor(bgc, 0.5);
            vm.headerStyle = 'color:#f8f8ff;width:50%;border-style:none;'+
                       'background:'+bgc+';'+
  					   'background: -webkit-linear-gradient(left,'+bgc+','+bgc2+');'+
  					   'background: -o-linear-gradient(right,'+bgc+','+bgc2+');'+
  					   'background: -moz-linear-gradient(right,'+bgc+', '+bgc2+');'+
  					   'background: linear-gradient(to right,'+bgc+', '+bgc2+');';
            
            loadcontent();
            //getEstablishmentAnswers();
            //getFeed();

            //});
            $rootScope.cwrapperLoaded = true;
            $rootScope.cCategory = undefined;
            
            vm.searchActive = $rootScope.searchActive ? $rootScope.searchActive: false;
            
            //userdata.loadVotes();
            activate();

        }

        function loadcontent() {
            $rootScope.cityranks = ['city', 'lifestyle', 'food', 'politics', 'services', 'social', 'beauty', 'sports', 'personalities', 'technology', 'dating', 'health'];
            $rootScope.nhranks = ['neighborhood', 'lifestyle', 'food', 'services', 'social', 'beauty', 'health'];

            vm.nhs = $rootScope.neighborhoods.concat($rootScope.districts);
           
        }

        function switchScope(x) {
            if (x == 1) {
                vm.isNh = false; //Neighborhood Scope
                vm.isCity = true; //City Scope
                $rootScope.isNh = false;
                $rootScope.isCity = true;
                //vm.val = '';
                //$rootScope.inputVal = '';
                //$rootScope.searchActive = false;
                $rootScope.$emit('loadNh');
                vm.searchScope = 'all San Diego';
                vm.ranks = $rootScope.cityranks;
                //vm.querybc = '#f9f9f9';
                vm.querybc = 'white';
            }
            if (x == 2) {
                vm.isNh = true; //Neighborhood View
                vm.isCity = false; //Classified View
                $rootScope.isNh = true;
                $rootScope.isCity = false;
                vm.val = '';
                $rootScope.inputVal = '';
                $rootScope.searchActive = false;
                if ($rootScope.isNhRdy) $rootScope.$emit('loadNh');
                vm.searchScope = 'Neighborhood';
                vm.ranks = $rootScope.nhranks;
                vm.querybc = '#428bca';
            }
            vm.searchActive = $rootScope.searchActive;
        }

        function selnh(x) {
            $rootScope.cnh = x;
            vm.cnh = x;
            vm.isNhRdy = true;
            $rootScope.isNhRdy = vm.isNhRdy;
            vm.inputVal = '';
            vm.searchActive = false;
            $rootScope.$emit('loadNh');
            vm.searchScope = x;
            vm.val = '';
            $rootScope.inputVal = '';
            //force close the dropdown neighborhood menu            
            $("#nhdropdown").dropdown("toggle");
        }
        
        //Quick Links
        function foodNearMe(){
            //console.log("$rootScope.coordsRdy - ", $rootScope.coordsRdy);
            if ($rootScope.coordsRdy) $state.go('rankSummary', { index: 9521 });
            else {
                $rootScope.loadFbnWhenCoordsRdy = true;
                dialog.askPermissionToLocate();
            }            
        }
        
        function selfimprove(){
            var introsRank = 0;
            var rankFound = false;
            var rn = 0; //random number
            var N = $rootScope.content.length-1;
            
            while(!rankFound){
             rn = Math.floor(Math.random() * (N - 0 + 1)) + 0;
                if ($rootScope.content[rn].ismp){
                    rankFound=true;
                }   
            }
            /*
            for (var i=0; i<$rootScope.content.length; i++){
                if ($rootScope.content[i].title.indexOf($rootScope.rankofday[0].intros) > -1){
                    introsRank = $rootScope.content[i].id;
                    break;
                }
            }*/
            $state.go('rankSummary', { index: $rootScope.content[rn].id });
        }
        
        function events(){
             $state.go('rankSummary', { index: 6949 });
        }
           
        function goHome(){
            //$rootScope.$emit('quitFeedbackMode');
            $rootScope.inputVal = '';
            vm.val = '';
            //switchScope(1);
            //$rootScope.fbmode = false;
            //vm.fbm = $rootScope.fbmode;
        }
        function gotoAnswer(x){
            $state.go('answerDetail',{index: x.answer});
        }
        function gotoRank(x){
            $state.go('rankSummary',{index: x.category});
        }
        
        //***********End Admin Functions********************
    }
})();