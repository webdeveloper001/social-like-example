(function () {
    'use strict';

    angular
        .module('app')
        .controller('photogallery', photogallery);

    photogallery.$inject = ['$location', '$rootScope', '$state'];

    function photogallery(location, $rootScope, $state) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'photogallery';
               
       activate();

        function activate() {            

            console.log("photogallery page Loaded!");
            
        }
    }
})();
