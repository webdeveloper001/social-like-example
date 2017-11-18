(function () {
    'use strict';

    angular
        .module('app')
        .controller('feedback', feedback);

    feedback.$inject = ['$location', '$rootScope', '$state'];

    function feedback(location, $rootScope, $state) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'feedback';
        

        vm.goBack = goBack;

       activate();

        function activate() {            

            console.log("feedback page Loaded!");
            
        }

        function goBack() {
            //if ($rootScope.cCategory.id == undefined) $state.go('rankSummary', { index: $rootScope.cCategory.id });
            //else $state.go('rankSummary', { index: 1 });
            $state.go('cwrapper');
        }

    }
})();
