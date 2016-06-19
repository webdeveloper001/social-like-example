(function () {
    'use strict';

    angular
        .module('app')
        .controller('queries', queries);

    queries.$inject = ['$location', '$rootScope', '$state'];

    function queries(location, $rootScope, $state) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'queries';
               
       activate();

        function activate() {            

            console.log("queries page Loaded!");
            
        }
    }
})();
