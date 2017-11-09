(function () {
    'use strict';

    angular
        .module('app')
        .controller('privacypolicy', privacypolicy);

    privacypolicy.$inject = ['$state','$rootScope'];

    function privacypolicy($state, $rootScope) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'privacypolicy';

        vm.goBack = goBack;
        
        activate();

        function activate() {            

            console.log("privacypolicy page Loaded!");
            
        }

        function goBack() {
            if ($rootScope.previousState == 'rankSummary')
                    $state.go('rankSummary', {index: $rootScope.cCategory.id});
            else if ($rootScope.previousState == 'answerDetail')
                    $state.go('answerDetail', {index: $rootScope.canswer.id});
            else if ($rootScope.previousState == 'addAnswer')
                    $state.go('addAnswer', {index: $rootScope.canswer.id});
            else if ($rootScope.previousState == 'editAnswer')
                    $state.go('editAnswer', {index: $rootScope.canswer.id});                
            else if ($rootScope.previousState == 'about')
                    $state.go('about');
            else {
                $rootScope.$emit('backToResults');
                $state.go('cwrapper');
            }                
        }

    }
})();
