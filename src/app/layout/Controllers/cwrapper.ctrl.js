(function () {
    'use strict';

    angular
        .module('app')
        .controller('cwrapper', cwrapper);

    cwrapper.$inject = ['$rootScope', '$state', '$http', '$stateParams', '$scope',
        'query', 'table', 'dialog', 'uaf','$window','userdata','$location','color', 'fbusers', '$q', '$timeout', 'filter', 'search', 'mailing'];

    function cwrapper($rootScope, $state, $http, $stateParams, $scope,
        query, table, dialog, uaf, $window, userdata, $location, color, fbusers, $q, $timeout, filter, search, mailing) {

        /* jshint validthis:true */
        var vm = this;
        //-----SEO tags ----
        $scope.$parent.$parent.$parent.seo = { 
            pageTitle : '', 
            metaDescription: 'Rank-X is a web application that collects users preferences and creates simple rankings on everything in your city. Get the local insight and find the best restaurants, services, activities, events, places, events and more.'
        };


        window.prerenderReady = false;

        function activate() {
            
            window.prerenderReady = true;
            if ($rootScope.DEBUG_MODE) console.log('cwrapper activated');
        }
    }
})();