(function () {
    'use strict';

    angular
        .module('app')
        .controller('searchresults', searchresults);

    searchresults.$inject = ['$location', '$rootScope', '$state','$window', '$scope'];

    function searchresults(location, $rootScope, $state, $window, $scope) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'searchresults';

        vm.goBack = goBack;

        //Receive from layout search bar
        var getResultsListener = $rootScope.$on('getResults', function (event) {
            //console.log("rx getReuslts 2crwrapper");
            vm.searchActive = $rootScope.searchActive;
        });

        $scope.$on('$destroy',getResultsListener);
        
       activate();

        function activate() {            

            console.log("searchresults page Loaded!");
            
        }

        function goBack() {
            //if ($rootScope.cCategory.id == undefined) $state.go('rankSummary', { index: $rootScope.cCategory.id });
            //else $state.go('rankSummary', { index: 1 });
            $state.go('cwrapper');
        }

    }
})();
