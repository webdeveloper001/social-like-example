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
            getTablesMain: getTablesMain,
            getTablesNonMain: getTablesNonMain,
            //getSingleTable: getSingleTable,
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
            var url3 = baseURI + '?offset=' + 3 * 1000;
            var url4 = baseURI + '?offset=' + 4 * 1000;
            var url5 = baseURI + '?offset=' + 5 * 1000;
            var url6 = baseURI + '?offset=' + 6 * 1000;
            var url7 = baseURI + '?offset=' + 7 * 1000;

            var p0 = $http.get(url0);
            var p1 = $http.get(url1);
            var p2 = $http.get(url2);
            var p3 = $http.get(url3);
            var p4 = $http.get(url4);
            var p5 = $http.get(url5);
            var p6 = $http.get(url6);
            var p7 = $http.get(url7);

            return $q.all([p0, p1, p2, p3, p4, p5, p6, p7]).then(function (d){
                _tables = d[0].data.resource.concat(d[1].data.resource, d[2].data.resource, d[3].data.resource,
                  d[4].data.resource,  d[5].data.resource, d[6].data.resource, d[7].data.resource);
                if ($rootScope.DEBUG_MODE) console.log("tables length: ", _tables.length);
                return _tables;            
            }, _queryFailed);  
            //return $http.get(url).then(querySucceeded, _queryFailed);
            
            //function querySucceeded(d) {

                
                //return _tables = result.data.resource;
            //}          
        }

        function getTablesMain() {

            var url0 = baseURI + '/?filter=ismp=true';

            var p0 = $http.get(url0);
            
            return $q.all([p0]).then(function (d){
                _tables = d[0].data.resource;
                if ($rootScope.DEBUG_MODE) console.log("tables_main length: ", _tables.length);
                return _tables;            
            }, _queryFailed);  
                      
        }

        function getTablesNonMain() {
            
            //Get all match records
            var url0 = baseURI + '/?filter=ismp=false'+'&offset=' + 0 * 1000;
            var url1 = baseURI + '/?filter=ismp=false'+'&offset=' + 1 * 1000;
            var url2 = baseURI + '/?filter=ismp=false'+'&offset=' + 2 * 1000;
            var url3 = baseURI + '/?filter=ismp=false'+'&offset=' + 3 * 1000;
            var url4 = baseURI + '/?filter=ismp=false'+'&offset=' + 4 * 1000;
            var url5 = baseURI + '/?filter=ismp=false'+'&offset=' + 5 * 1000;
            var url6 = baseURI + '/?filter=ismp=false'+'&offset=' + 6 * 1000;
            var url7 = baseURI + '/?filter=ismp=false'+'&offset=' + 7 * 1000;
            
            var p0 = $http.get(url0);
            var p1 = $http.get(url1);
            var p2 = $http.get(url2);
            var p3 = $http.get(url3);
            var p4 = $http.get(url4);
            var p5 = $http.get(url5);
            var p6 = $http.get(url6);
            var p7 = $http.get(url7);

            return $q.all([p0, p1, p2, p3, p4, p5, p6, p7]).then(function (d){
                _tables = _tables.concat(d[0].data.resource, d[1].data.resource, d[2].data.resource, d[3].data.resource,
                  d[4].data.resource,  d[5].data.resource, d[6].data.resource, d[7].data.resource);
                if ($rootScope.DEBUG_MODE) console.log("tables length: ", _tables.length);
                return _tables;            
            }, _queryFailed);
                      
        }
/*
        function getSingleTable(id) {

            var url0 = baseURI + '/?filter=id=' + id;

            var p0 = $http.get(url0);
            
            return $q.all([p0]).then(function (d){
                
                _tables = d[0].data.resource;
                console.log("single table ", _tables);
                if ($rootScope.DEBUG_MODE) console.log("single table loaded: ", _tables.length);
                return _tables;            
            }, _queryFailed);  
                      
        }
*/

        function addTable(table) {
            
            table.isatomic = true;

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

                if ($rootScope.DEBUG_MODE) console.log("result", result);
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

                if ($rootScope.DEBUG_MODE) console.log("Deleting table was succesful");
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
                    case "isatomic": data.isatomic = val[i]; break;
                    case "catstr": data.catstr = val[i]; break;
                    case "numcom": data.numcom = val[i]; break;
                    case "ismp": data.ismp = val[i]; break;                    
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
                    case "isatomic": $rootScope.content[idx].isatomic = val[i]; break;
                    case "catstr": $rootScope.content[idx].catstr = val[i]; break;
                    case "numcom": $rootScope.content[idx].numcom = val[i]; break;
                    case "ismp": $rootScope.content[idx].ismp = val[i]; break;                   
                }
            }

            return $http.patch(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                if ($rootScope.DEBUG_MODE) console.log("updating ranking record succesful");
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