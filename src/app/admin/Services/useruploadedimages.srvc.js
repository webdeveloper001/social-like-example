(function () {
    'use strict';

    angular
        .module('app')
        .factory('useruploadedimages', useruploadedimages);

    useruploadedimages.$inject = ['$http', '$q','$rootScope'];

    function useruploadedimages($http, $q, $rootScope) {

        //Members
        var _uuis = [];
        $rootScope.uuis = _uuis;
        
        // Members
        var baseURI = '/api/v2/mysql/_table/useruploadedimages';

        var service = {
            getRecords: getRecords,
            postRecord: postRecord,
            deleteRecord: deleteRecord,            
        };

        return service;
        
        function getRecords(){
            //Get all user uploaded images records
            var url0 = baseURI;
            
            var p0 = $http.get(url0);
            
            return $q.all([p0]).then(function (d){
                var data = d[0].data.resource;
                _load(data);
                if ($rootScope.DEBUG_MODE) console.log("User uploaded images: ", _uuis.length);
                return _uuis;            
            }, _queryFailed);  

        }

        function postRecord(item){
            
            var url = baseURI;
            var resource = [];

            resource.push(item);
            
            return $http.post(url, resource, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: resource
            }).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                //update local copy
                var itemx = item;
                itemx.id = result.data.resource[0].id; 
                _uuis.push(itemx);

                if ($rootScope.DEBUG_MODE) console.log("created uui record");
                if ($rootScope.DEBUG_MODE) console.log("result", result);
                return result.data;
            }
        }

        function deleteRecord(id){
            //form match record
            var obj = {};
            obj.resource = [];

            var data = {};
            data.id = id;

            obj.resource.push(data);

            var url = baseURI + '/' + id;
            
            //update (delete answer) local copy of answers
            var i = _uuis.map(function(x) {return x.id; }).indexOf(id);
            if (i > -1) _uuis.splice(i,1);
            
            return $http.delete(url, data, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                if ($rootScope.DEBUG_MODE) console.log("Deleting uui record was succesful");
                return result.data;
            }
        }

        function _load(data){
            _uuis.length = 0;
            data.forEach(function(x){
                _uuis.push(x);
            });        
        }

        function _queryFailed(error) {

            throw error;
        }
    }
})();