(function () {
    'use strict';

    angular
        .module('app')
        .controller('views', views);

    views.$inject = ['$location', '$rootScope', '$state'];

    function views(location, $rootScope, $state) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'views';
               
       activate();

        function activate() {            

            console.log("views page Loaded!");
            
        }
    }
})();
