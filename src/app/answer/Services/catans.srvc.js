(function () {
    'use strict';

    angular
        .module('app')
        .factory('catans', catans);

    catans.$inject = ['$http', '$q','$rootScope'];

    function catans($http, $q, $rootScope) {

        // Members
        var _allcatans = [];
        var baseURI = '/api/v2/mysql/_table/catans';

        var service = {
            getAllcatans: getAllcatans,
            postRec: postRec,
            deleteRec: deleteRec            
        };

        return service;

        function getAllcatans(forceRefresh) {

            if (_areAllcatansLoaded() && !forceRefresh) {

                return $q.when(_allcatans);
            }

            var url = baseURI;

            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                return _allcatans = result.data.resource;
            }

        }
        
        function postRec(x) {
           
            //form match record
            var data = {};
            data.answer = x;
            data.category = $rootScope.cCategory.id;
            data.timestmp = Date.now();
             
            var obj = {};
            obj.resource = [];

            obj.resource.push(data);
            
            //update local copy
            _allcatans.push(data);
            
            var url = baseURI;

            return $http.post(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {
                
                console.log("creating catans record was succesful");
                return result.data;
            }
        }
         function deleteRec(answer_id) {
            
            //delete records from local copy
            for (var i=0; i<_allcatans.length;i++){
                if (_allcatans[i].answer == answer_id){
                    _allcatans.splice(i,1);
                } 
            }
            
           var url = baseURI + '/_table/catans?filter=answer=' + answer_id; 
            
            return $http.delete(url).then(querySucceeded, _queryFailed);
            
            function querySucceeded(result) {

                console.log("Deleting catans records was succesful");
                return result.data;
            }
        }
     
        function _areAllcatansLoaded() {

            return _allcatans.length > 0;
        }

        function _queryFailed(error) {

            throw error;
        }
    }
})();