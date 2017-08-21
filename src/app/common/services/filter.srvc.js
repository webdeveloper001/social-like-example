(function () {
    'use strict';

    angular
        .module('app')
        .factory('filter', filter);

    filter.$inject = ['$http', '$q', '$rootScope', '$window'];

    function filter($http, $q, $rootScope, $window) {

        // Members
        var defaultOptions = {
            isNh: false,
            isCity: true,
            isNhRdy: '',
            cnh: '',
            isAllTopics: true,
            ctopics: ['LifeStyle', 'Social', 'Sports', 'Food', 'Beauty & Fashion', 'Family', 'Technology', 'Dating', 'City', 'Services', 'Health', 'Celebrities']
        };
        var service = {
            loadFilterOptions: loadFilterOptions,
            saveFilterOptions: saveFilterOptions,
            saveInitalHomeData: saveInitalHomeData,
            loadInitalHomeData: loadInitalHomeData
        };

        return service;

        function loadFilterOptions(){
            //$rootScope.filterOptions = $window.localStorage.getItem("Rank-X-Filters");
            if( !$rootScope.filterOptions )
                $rootScope.filterOptions = defaultOptions;
            else
                $rootScope.filterOptions = JSON.parse($rootScope.filterOptions);
            return $rootScope.filterOptions;
        }

        function saveFilterOptions(filterOptions){
            $rootScope.filterOptions = filterOptions;
            $window.localStorage.setItem("Rank-X-Filters", JSON.stringify(filterOptions));
        }


        function loadInitalHomeData(){
            //$rootScope.initalHomeData = $window.localStorage.getItem("Rank-X-HomeData");
            if( !$rootScope.initalHomeData ){
                return false;
            }
            else{
                //$rootScope.initalHomeData = JSON.parse($rootScope.initalHomeData);
                $rootScope.$emit('initalHomeDataLoaded');
                return true;
            }
        }

        function saveInitalHomeData(initalHomeData){
            //$rootScope.initalHomeData = initalHomeData;
            //$window.localStorage.setItem("Ranks-HomeData", JSON.stringify(initalHomeData));
            //$window.localStorage.setItem("Categories-HomeData", JSON.stringify(initalHomeData));
        }

    }
})();