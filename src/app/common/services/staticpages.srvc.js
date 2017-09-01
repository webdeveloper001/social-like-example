(function () {
    'use strict';

    angular
        .module('app')
        .factory('staticpages', staticpages);

    staticpages.$inject = ['$http', '$q', '$rootScope','SERVER_URL'];

    function staticpages($http, $q, $rootScope,SERVER_URL) {

        // Members
        var fbUsers = [];

        var service = {
            createPageRank: createPageRank,
            createPageAnswer: createPageAnswer,
            removeFile: removeFile,
            getFileList: getFileList,
            getPageContent: getPageContent, 
        };

        return service;

        function createPageRank(rank){
            var url = SERVER_URL + 'staticpages/createPageRank';
            var req = {
                method: 'POST',
                data: rank,
                url: url,
                headers: {
                    'X-Dreamfactory-API-Key': undefined,
                    'X-DreamFactory-Session-Token': undefined
                }
            }

            return $http(req);
        }

        function createPageAnswer(answer){
            var url = SERVER_URL + 'staticpages/createPageAnswer';
            var req = {
                method: 'POST',
                data: answer,
                url: url,
                headers: {
                    'X-Dreamfactory-API-Key': undefined,
                    'X-DreamFactory-Session-Token': undefined
                }
            }
            return $http(req);
        }

        function getFileList(){
            var url = SERVER_URL + 'staticpages/getFileList';
            var req = {
                method: 'POST',
                data: {},
                url: url,
                headers: {
                    'X-Dreamfactory-API-Key': undefined,
                    'X-DreamFactory-Session-Token': undefined
                }
            }
            return $http(req);
        }

        function getPageContent(page){
            var url = SERVER_URL + 'staticpages/getPageContent';
            var req = {
                method: 'POST',
                data: page,
                url: url,
                headers: {
                    'X-Dreamfactory-API-Key': undefined,
                    'X-DreamFactory-Session-Token': undefined
                }
            }
            return $http(req);
        }

        function removeFile(page){
            var url = SERVER_URL + 'staticpages/removeFile';
            var req = {
                method: 'POST',
                data: page,
                url: url,
                headers: {
                    'X-Dreamfactory-API-Key': undefined,
                    'X-DreamFactory-Session-Token': undefined
                }
            }
            return $http(req);
        }
      
    }
})();