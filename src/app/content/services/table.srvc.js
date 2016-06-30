(function () {
    'use strict';

    angular
        .module('app')
        .factory('table', table);

    table.$inject = ['$http', '$q', '$rootScope'];

    function table($http, $q, $rootScope) {

        // Members
        var _tables = [];
        var baseURI = '/api/v2/mysql/_table/ranking';

        var service = {
            getTables: getTables,
            update: update
        };

        return service;

        function getTables(forceRefresh) {
            
            if (_areTablesLoaded() && !forceRefresh) {

                return $q.when(_tables);
            }

            var url = baseURI;

            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                return _tables = result.data.resource;
            }

        }
        
        function update(id, field, val) {
           
            //form match record
            var obj = {};
            obj.resource = [];

            var data = {};
            data.id = id;
            
            for (var i=0; i<field.length; i++){
                switch (field[i]){
                    case "views": data.views = val[i]; break;
                    case "answers": data.answers = val[i]; break;
                    case "title": data.title = val[i]; break;
                    case "tags": data.tags = val[i]; break;
                    case "keywords": data.keywords = val[i]; break;
                    case "type": data.type = val[i]; break;
                }
            }
            //console.log("data", data);
            obj.resource.push(data);

            var url = baseURI;
            
            //update local copy
            var idx=0;
            for (var i=0; i<$rootScope.content.length; i++){
                if ($rootScope.content[i].id == id) {
                    idx = i;
                    break;
                }
            }            
            for (var i=0; i<field.length; i++){
                switch (field[i]){
                    case "answers": $rootScope.content[idx].answers = val[i]; break;
                    case "views": $rootScope.content[idx].views = val[i]; break;
                    case "title": $rootScope.content[idx].title = val[i]; break;
                    case "tags": $rootScope.content[idx].tags = val[i]; break;
                    case "keywords": $rootScope.content[idx].keywords = val[i]; break;
                    case "type": $rootScope.content[idx].type = val[i]; break;
                }
            }                        
            
            return $http.patch(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                console.log("updating ranking record succesful");
                return result.data;
            }
        }
        
        function _areTablesLoaded() {

            return _tables.length > 0;
        }

        function _queryFailed(error) {

            throw error;
        }
    }
})();