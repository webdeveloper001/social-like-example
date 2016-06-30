(function () {
    'use strict';

    angular
        .module('app')
        .factory('query', query);

    query.$inject = ['$http', '$q', '$rootScope'];

    function query($http, $q, $rootScope) {

        // Members
        var _querys = [];
        var baseURI = '/api/v2/mysql/_table/queries';

        var service = {
            getQueries: getQueries,
            postQuery: postQuery,
            flushAll: flushAll,
            deleteRec: deleteRec
        };

        return service;

        function getQueries(forceRefresh) {
            
            if (_areQueriesLoaded() && !forceRefresh) {

                return $q.when(_querys);
            }

            var url = baseURI;

            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                return _querys = result.data.resource;
            }

        }
        
       function postQuery(query, results){
		     //form match record
           //form match record
            var obj = {};
            obj.resource = [];
                     
            var data={};
            data.query = query;
            data.results = results;
            data.timestmp = Date.now(); 
            
            obj.resource.push(data); 
            
            var url = baseURI; 
            
            return $http.post(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {                
             
                console.log("Creating new query record was succesful");
            }
	   }
       
       function flushAll(resource) {
           
            //form match record
            var obj = {};
            obj.resource = resource;

            //obj.resource.push(data);
            console.log("obj ---",  resource)
            
            var url = baseURI; 
            return $http.delete(url, resource , {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: resource
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                console.log("Flushing queries db was succesful");
            }
        }
        
        function deleteRec(id){
            
             //form match record
            var obj = {};
            obj.resource = [];

            var data = {};
            data.id = id;

            obj.resource.push(data);

            var url = baseURI + '/' + id;
            
            return $http.delete(url, data, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                console.log("Deleting record was succesful");
                return result.data;
            }
            
        }
	   
        
        function _areQueriesLoaded() {

            return _querys.length > 0;
        }

        function _queryFailed(error) {

            throw error;
        }
    }
})();