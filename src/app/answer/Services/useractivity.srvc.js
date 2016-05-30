(function () {
    'use strict';

    angular
        .module('app')
        .factory('useractivity', useractivity);

    useractivity.$inject = ['$http', '$q','$rootScope'];

    function useractivity($http, $q, $rootScope) {

        // Members
        var _alluseractivity = [];
        var baseURI = '/api/v2/mysql/_table/useractivity';

        var service = {
            getAllUserActivity: getAllUserActivity,
            postRec: postRec,
            patchRec: patchRec
            
        };

        return service;

        function getAllUserActivity(forceRefresh) {

            if (_areAllUserActivityLoaded() && !forceRefresh) {

                return $q.when(_alluseractivity);
            }

            var url = baseURI;

            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                return _alluseractivity = result.data.resource;
            }

        }
        
        function postRec() {
           
            //form match record
            var data = {};
            data.user = $rootScope.user.id;
            data.category = $rootScope.cCategory.id;
            data.timestmp = Date.now();
             
            var obj = {};
            obj.resource = [];

            obj.resource.push(data);
            
            //update local copy
            _alluseractivity.push(data);
            
            var url = baseURI;

            return $http.post(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                console.log("creating useractivity record was succesful");
                return result.data;
            }
        }
        
        function patchRec(rec_id) {
            
            //form match record
            var obj = {};
            obj.resource = [];
                      
            var data={};
            data.id = rec_id;
            data.timestmp = Date.now(); 
            
            obj.resource.push(data); 
            
            var url = baseURI; 
                        
            return $http.patch(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                console.log("Updating useractivity record was succesful");
                return result.data;
            }
        }
     
        function _areAllUserActivityLoaded() {

            return _alluseractivity.length > 0;
        }

        function _queryFailed(error) {

            throw error;
        }
    }
})();