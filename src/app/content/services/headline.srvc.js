(function () {
    'use strict';

    angular
        .module('app')
        .factory('headline', headline);

    headline.$inject = ['$http', '$q', '$rootScope'];

    function headline($http, $q, $rootScope) {

        // Members
        var _headlines = [];
        $rootScope.headlines = _headlines;
        var baseURI = '/api/v2/mysql/_table/headlines';

        var service = {
            getheadlines: getheadlines,
			addheadline: addheadline,
            update: update,
        };

        return service;

        function getheadlines(forceRefresh) {

            if (_areheadlinesLoaded() && !forceRefresh) {

                return $q.when(_headlines);
            }

            //var url = baseURI;
            //Get all match records
            var url0 = baseURI + '?offset=' + 0 * 1000;
           
            var p0 = $http.get(url0);
            
            return $q.all([p0]).then(function (d){
                var data = d[0].data.resource;
                _load(data);
                return _headlines;            
            }, _queryFailed);  

        }

        function addheadline(headline) {
            
            var url = baseURI;
            var resource = [];

            resource.push(headline);

            return $http.post(url, resource, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: resource
            }).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                //update local copy
                var headlinex = headline;
                headlinex.id = result.data.resource[0].id;
                _headlines.push(headlinex);

                if ($rootScope.DEBUG_MODE) console.log("result", result);
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
                switch (field[i]) {
                    case "city": data.city = val[i]; break;
                    case "nh": data.nh = val[i]; break;
                    case "title": data.title = val[i]; break;
                    case "filter": data.filter = val[i]; break;
                    case "bc": data.bc = val[i]; break;
                    case "fc": data.fc = val[i]; break;                                          
                }
            }
            //console.log("data", data);
            obj.resource.push(data);

            var url = baseURI;
            
            //update local copy
            var idx = _headlines.map(function(x) {return x.id; }).indexOf(id);  
            for (var i = 0; i < field.length; i++) {
                switch (field[i]) {
                    case "city": $rootScope.content[idx].city = val[i]; break;
                    case "nh": $rootScope.content[idx].nh = val[i]; break;
                    case "title": $rootScope.content[idx].title = val[i]; break; 
                    case "filter": $rootScope.content[idx].filter = val[i]; break;
                    case "bc": $rootScope.content[idx].bc = val[i]; break;
                    case "fc": $rootScope.content[idx].fc = val[i]; break;                                       
                }
            }

            return $http.patch(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                console.log("updating headlines succesful");
                return result.data;
            }
        }

        function _load(data){
            _headlines.length = 0;
            data.forEach(function(x){
                _headlines.push(x);
            });
        }

        function _areheadlinesLoaded() {

            return _headlines.length > 0;
        }

        function _queryFailed(error) {

            throw error;
        }
    }
})();