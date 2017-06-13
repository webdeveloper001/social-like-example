(function () {
    'use strict';

    angular
        .module('app')
        .controller('customertos', customertos);

    customertos.$inject = ['$state','$rootScope'];

    function customertos($state, $rootScope) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'Customer Terms of Service';

        vm.goBack = goBack;
        
        activate();

        function activate() {
            console.log("Customer Terms of Service page Loaded!");
        }

        function goBack() {
            if ($rootScope.previousState == 'rankSummary')
                    $state.go('rankSummary', {index: $rootScope.cCategory.slug});
            else if ($rootScope.previousState == 'answerDetail')
                    $state.go('answerDetail', {index: $rootScope.canswer.slug});
            else if ($rootScope.previousState == 'addAnswer')
                    $state.go('addAnswer', {index: $rootScope.canswer.slug});
            else if ($rootScope.previousState == 'editAnswer')
                    $state.go('editAnswer', {index: $rootScope.canswer.slug});                
            else if ($rootScope.previousState == 'about')
                    $state.go('about');
            else $state.go('cwrapper');                
        }

    }
})();
