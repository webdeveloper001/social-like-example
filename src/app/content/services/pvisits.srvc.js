(function () {
    'use strict';

    angular
        .module('app')
        .factory('pvisits', pvisits);

    pvisits.$inject = ['$http', '$q','$rootScope'];

    function pvisits($http, $q, $rootScope) {

        // Members
        var _pvisits = [];
        var baseURI = '/api/v2/mysql/_table/pvisits';

        var service = {
            getpvisits: getpvisits,
            postRec: postRec,
            patchRec: patchRec,
            deleteRec: deleteRec,
            
        };

        return service;

        function getpvisits(forceRefresh) {

            if (_arepvisitsLoaded() && !forceRefresh) {

                return $q.when(_pvisits);
            }

            var url = baseURI;

            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                return _pvisits = result.data.resource;
            }

        }
        
        function postRec(date) {
           
            //form match record
            var data = {};
            data.date = date;
			data.nvisits = 1;
             
            var obj = {};
            obj.resource = [];

            obj.resource.push(data);
            
            //update local copy
            _pvisits.push(data);
            
            var url = baseURI;

            return $http.post(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {
                
                 //update local copies
                var id = result.data.resource[0].id; 
                _pvisits[_pvisits.length-1].id = id;

                if ($rootScope.DEBUG_MODE) console.log("creating pvisits record was succesful");
                return result.data;
            }
        }
       
       function patchRec(rec_id, visits) {
            
            //form match record
            var obj = {};
            obj.resource = [];
                      
            var data={};
            data.id = rec_id;
            data.nvisits = visits;
            
            obj.resource.push(data); 
            
            var url = baseURI; 
                        
            return $http.patch(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                if ($rootScope.DEBUG_MODE) console.log("Updating pvisits record was succesful");
                return result.data;
            }
        }
        
        function deleteRec(rec_id) {
            
            //delete records from local copy
            for (var i=0; i<_pvisits.length;i++){
                if (_pvisits[i].id == rec_id){
                    _pvisits.splice(i,1);
                } 
            }
            
           var url = baseURI + '/' + rec_id; 
            
            return $http.delete(url).then(querySucceeded, _queryFailed);
            
            function querySucceeded(result) {
                if ($rootScope.DEBUG_MODE) console.log("Deleting user activity record was succesful");
                return result.data;
            }
        }
     
        function _arepvisitsLoaded() {

            return _pvisits.length > 0;
        }

        function _queryFailed(error) {

            throw error;
        }
    }
})();