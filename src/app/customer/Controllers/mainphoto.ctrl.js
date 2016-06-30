(function () {
    'use strict';

    angular
        .module('app')
        .controller('mainphoto', mainphoto);

    mainphoto.$inject = ['$location', '$rootScope', '$state'];

    function mainphoto(location, $rootScope, $state) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'mainphoto';
               
       activate();

        function activate() {            

            console.log("mainphoto page Loaded!");
            
        }
    }
})();
