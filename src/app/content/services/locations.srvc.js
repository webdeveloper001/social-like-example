(function () {
    'use strict';

    angular
        .module('app')
        .factory('locations', locations);

    locations.$inject = ['$http', '$q', '$rootScope'];

    function locations($http, $q, $rootScope) {

        // Members
        var _locations = [];
        $rootScope.locations = _locations;
        var baseURI = '/api/v2/mysql/_table/locations';

        var service = {
            getAllLocations: getAllLocations,
            addLocation: addLocation,
            update: update,
            deleteRec: deleteRec
        };

        return service;

        function getAllLocations(forceRefresh) {

            if (_locations.length > 0 && !forceRefresh) {

                return $q.when(_locations);
            }

            //var url = baseURI;
            //Get all match records
            var url0 = baseURI + '?offset=' + 0 * 1000;
           //var url0 = baseURI + '/?filter=scope=city';

            var p0 = $http.get(url0);
            
            return $q.all([p0]).then(function (d){
                var data = d[0].data.resource;
                _load (data);
                if ($rootScope.DEBUG_MODE) console.log("No. Categories ", _locations.length);
                return _locations;            
            }, _queryFailed);  

        }

        function addLocation(location) {
            
            var url = baseURI;
            var resource = [];

            resource.push(location);

            return $http.post(url, resource, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: resource
            }).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                //update local copy
                var locationx = location;
                locationx.id = result.data.resource[0].id;
                _locations.push(locationx);

                console.log("adding locationx succesful", result);
                return result.data;
            }

        }

        
        function update(id, field, val) {
           
            //form match record
            var obj = {};
            obj.resource = [];

            var data = {};
            data.id = id;

            for (var i = 0; i < field.length; i++) {
            	data[field[i]] =  val[i];
            }
            //console.log("data", data);
            obj.resource.push(data);

            var url = baseURI;
            
            //update local copy
            var idx = _locations.map(function(x) {return x.id; }).indexOf(id);  
            for (var i = 0; i < field.length; i++) {
            	_locations[idx][field[i]] = val[i];
                
            }

            return $http.patch(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                console.log("updating locationx succesful");
                return result.data;
            }
        }
        
        function deleteRec(location_id) {
           
            //form match record
            var obj = {};
            obj.resource = [];

            var data = {};
            data.id = location_id;

            obj.resource.push(data);

            var url = baseURI + '/' + location_id;
            
            //update (delete answer) local copy of answers
            var i = _locations.map(function (x) { return x.id; }).indexOf(location_id);
            if (i > -1) _locations.splice(i, 1);

            return $http.delete(url, data, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                console.log("Deleting location was succesful");
                return result.data;
            }
        }

        function _load(data){
            _locations.length = 0;
            data.forEach(function(x){
                _locations.push(x);
            });
        }

        function _queryFailed(error) {

            throw error;
        }
    }
})();