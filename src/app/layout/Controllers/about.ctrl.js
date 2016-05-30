(function () {
    'use strict';

    angular
        .module('app')
        .controller('about', about);

    about.$inject = ['$location', '$rootScope', '$state'];

    function about(location, $rootScope, $state) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'about';
        

        vm.goBack = goBack;

       activate();

        function activate() {            

            console.log("About page Loaded!");
            
        }

        function goBack() {
            if ($rootScope.cCategory.id == undefined) $state.go('rankSummary', { index: $rootScope.cCategory.id });
            else $state.go('rankSummary', { index: 1 });
        }

    }
})();
