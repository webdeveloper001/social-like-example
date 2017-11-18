(function () {
    'use strict';

    angular
        .module('app')
        .controller('favs', favs);

    favs.$inject = ['$location', '$rootScope', '$state', '$window'];

    function favs(location, $rootScope, $state, $window) {
        
    }
})();
