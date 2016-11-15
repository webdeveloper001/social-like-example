(function () {
    'use strict';

    angular
        .module('app')
        .controller('about', about);

    about.$inject = ['$location', '$rootScope', '$state','$window'];

    function about(location, $rootScope, $state, $window) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'about';

        vm.goBack = goBack;
        
        if ($window.innerWidth < 512) {
            vm.logoimage = "/assets/images/logogray.png";
            vm.sm = true;
        }
        else {
            vm.logoimage = "/assets/images/logogray.png";
            vm.sm = false;
        }
      
        activate();

        function activate() {            

            console.log("About page Loaded!");
            
        }

        function goBack() {
            //if ($rootScope.cCategory.id == undefined) $state.go('rankSummary', { index: $rootScope.cCategory.id });
            //else $state.go('rankSummary', { index: 1 });
            $state.go('cwrapper');
        }

    }
})();
