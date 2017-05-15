(function () {
    'use strict';

    angular
        .module('app')
        .controller('cwrapper', cwrapper);

    cwrapper.$inject = ['$rootScope', '$state', '$http', '$stateParams', '$scope',
        'query', 'table', 'dialog', 'uaf','$window','userdata','$location','color', 'fbusers', '$q', '$timeout'];

    function cwrapper($rootScope, $state, $http, $stateParams, $scope,
        query, table, dialog, uaf, $window, userdata, $location, color, fbusers, $q, $timeout) {
        /* jshint validthis:true */
        var vm = this;
        //-----SEO tags ----
        $scope.$parent.$parent.$parent.seo = { 
            pageTitle : 'Home | ', 
            metaDescription: 'Home | Rank-X creates collective rankings on everything in your city.' 
        };
        
        //if ($location.absUrl().indexOf('code=')>-1) $window.location.search = '';
         
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

        $scope.$on('$destroy',mainViewListener);

        //Receive from layout search bar
        /*
        var getResultsListener = $rootScope.$on('getResults', function (event) {
            vm.searchActive = $rootScope.searchActive;
        });*/

        //$scope.$on('$destroy',getResultsListener);

        window.prerenderReady = false;

        if ($rootScope.cwrapperLoaded) activate();
        else init();

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
            
            if ($rootScope.isAdmin) prepareNewCatansOptions();
            
            //userdata.loadVotes();
            activate();

        }

        function loadcontent() {

            //vm.content=[];
            //vm.searchArray = [];
            ///vm.empty = [];
            //vm.cTags = {};
            
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
                if ($rootScope.content[rn].tags.indexOf('isMP') > -1){
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
            switchScope(1);
            $rootScope.fbmode = false;
            vm.fbm = $rootScope.fbmode;
        }
        function gotoAnswer(x){
            $state.go('answerDetail',{index: x.answer});
        }
        function gotoRank(x){
            $state.go('rankSummary',{index: x.category});
        }
        function prepareNewCatansOptions() {
            
            console.log("@prepareNewCatansOptions - $rootScope.content.length ", $rootScope.content.length);
            $rootScope.ctsOptions = [];
            var titlex = '';
            for (var i = 0; i < $rootScope.content.length; i++) {
                if ($rootScope.content[i].title.indexOf('in Hillcrest') > -1) {
                    titlex = $rootScope.content[i].title.replace('Hillcrest', '@neighborhood');
                    $rootScope.ctsOptions.push(titlex);
                }
                if ($rootScope.content[i].tags.indexOf('isMP') > -1) {
                    $rootScope.ctsOptions.push($rootScope.content[i].title);
                }
            }
        }
        
        //***********End Admin Functions********************
    }
})();






