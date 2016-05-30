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

    layout.$inject = ['$location', '$rootScope', '$translate', '$timeout'];

    function layout($location, $rootScope, $translate, $timeout) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'layout';
        vm.header = '';
        vm.searchRank = searchRank;

        if ($rootScope.canswers) vm.isLoading = false;
        else vm.isLoading = true;
        // Members

        activate();

        function activate() {

            $timeout(loadingDone, 1000);
            console.log("Layout Loaded!");
            
        }
        function loadingDone() {
            vm.isLoading = false;
        }
        
        function searchRank(){
            $rootScope.sval = vm.val;
            $rootScope.$emit('searchRank');
        }      
    }
})();
