(function () {
    'use strict';

    angular
        .module('app')
        .controller('flags', flags);

    flags.$inject = ['$location', '$rootScope', '$state'];

    function flags(location, $rootScope, $state) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'flags';
               
       activate();

        function activate() {            

            console.log("flags page Loaded!");
            
        }
    }
})();
