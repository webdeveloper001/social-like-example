(function () {
    'use strict';

    angular
        .module('app')
        .factory('datacontext', datacontext);

    datacontext.$inject = ['$http'];

    function datacontext($http) {
        var service = {
            getData: getData
        };

        return service;

        function getData() { }
    }
})();