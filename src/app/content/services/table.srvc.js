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
            update: update,
            addTable: addTable,
            deleteTable: deleteTable
        };

        return service;

        function getTables(forceRefresh) {

            if (_areTablesLoaded() && !forceRefresh) {

                return $q.when(_tables);
            }

            //var url = baseURI;
            //Get all match records
            var url0 = baseURI + '?offset=' + 0 * 1000;
            var url1 = baseURI + '?offset=' + 1 * 1000;
            var url2 = baseURI + '?offset=' + 2 * 1000;

            var p0 = $http.get(url0);
            var p1 = $http.get(url1);
            var p2 = $http.get(url2);

            return $q.all([p0, p1, p2]).then(function (d){
                _tables = d[0].data.resource.concat(d[1].data.resource,d[2].data.resource);
                console.log("tables length: ", _tables.length);
                return _tables;            
            }, _queryFailed);  
            //return $http.get(url).then(querySucceeded, _queryFailed);
           
            //function querySucceeded(d) {

                
                //return _tables = result.data.resource;
            //}

        }

        function addTable(table) {

            var url = baseURI;
            var resource = [];

            resource.push(table);

            return $http.post(url, resource, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: resource
            }).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                //update local copy
                var tablex = table;
                tablex.id = result.data.resource[0].id;
                _tables.push(tablex);

                console.log("result", result);
                return result.data;
            }

        }

        function deleteTable(table_id) {
           
            //form match record
            var obj = {};
            obj.resource = [];

            var data = {};
            data.id = table_id;

            obj.resource.push(data);

            var url = baseURI + '/' + table_id;
            
            //update (delete answer) local copy of answers
            var i = _tables.map(function (x) { return x.id; }).indexOf(table_id);
            if (i > -1) _tables.splice(i, 1);

            return $http.delete(url, data, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                console.log("Deleting answer was succesful");
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
                    case "views": data.views = val[i]; break;
                    case "answers": data.answers = val[i]; break;
                    case "title": data.title = val[i]; break;
                    case "tags": data.tags = val[i]; break;
                    case "keywords": data.keywords = val[i]; break;
                    case "type": data.type = val[i]; break;
                    case "question": data.question = val[i]; break;
                    case "image1url": data.image1url = val[i]; break;
                    case "image2url": data.image2url = val[i]; break;
                    case "image3url": data.image3url = val[i]; break;
                    case "answertags": data.answertags = val[i]; break;                    
                }
            }
            //console.log("data", data);
            obj.resource.push(data);

            var url = baseURI;
            
            //update local copy
            var idx = 0;
            for (var i = 0; i < $rootScope.content.length; i++) {
                if ($rootScope.content[i].id == id) {
                    idx = i;
                    break;
                }
            }
            for (var i = 0; i < field.length; i++) {
                switch (field[i]) {
                    case "answers": $rootScope.content[idx].answers = val[i]; break;
                    case "views": $rootScope.content[idx].views = val[i]; break;
                    case "title": $rootScope.content[idx].title = val[i]; break;
                    case "tags": $rootScope.content[idx].tags = val[i]; break;
                    case "keywords": $rootScope.content[idx].keywords = val[i]; break;
                    case "type": $rootScope.content[idx].type = val[i]; break;
                    case "question": $rootScope.content[idx].question = val[i]; break;
                    case "image1url": $rootScope.content[idx].image1url = val[i]; break;
                    case "image2url": $rootScope.content[idx].image2url = val[i]; break;
                    case "image3url": $rootScope.content[idx].image3url = val[i]; break;
                    case "answertags": $rootScope.content[idx].answertags = val[i]; break;                   
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