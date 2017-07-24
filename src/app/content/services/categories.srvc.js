(function () {
    'use strict';

    angular
        .module('app')
        .factory('categories', categories);

    categories.$inject = ['$http', '$q', '$rootScope'];

    function categories($http, $q, $rootScope) {

        // Members
        var _categories = [];
        var baseURI = '/api/v2/mysql/_table/categories';

        var service = {
            getAllCategories: getAllCategories,
            addCategory: addCategory,
            update: update,
            deleteRec: deleteRec
        };

        return service;

        function getAllCategories(forceRefresh) {

            if (_categories.length > 0 && !forceRefresh) {

                return $q.when(categories);
            }

            //var url = baseURI;
            //Get all match records
            var url0 = baseURI + '?offset=' + 0 * 1000;
           //var url0 = baseURI + '/?filter=scope=city';

            var p0 = $http.get(url0);
            
            return $q.all([p0]).then(function (d){
                _categories = d[0].data.resource;
                if ($rootScope.DEBUG_MODE) console.log("No. Categories ", _categories.length);
                return _categories;            
            }, _queryFailed);  

        }

        function addCategory(category) {
            
            var url = baseURI;
            var resource = [];

            resource.push(category);

            return $http.post(url, resource, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: resource
            }).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                //update local copy
                var categoryx = category;
                categoryx.id = result.data.resource[0].id;
                _categories.push(categoryx);

                console.log("adding categoryx succesful", result);
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
            
            return $http.patch(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                //update local copy
                var idx = _categories.map(function (x) { return x.id; }).indexOf(id);
                for (var i = 0; i < field.length; i++) {
                    _categories[idx][field[i]] = val[i];
                }

                //unwrap to local copy of $rootScope.content
                for (var i = 0; i < $rootScope.content.length; i++) {
                    if ($rootScope.content[i].cat == _categories[idx].id) {
                        for (var j = 0; j < field.length; j++) {
                            $rootScope.content[i][field[j]] = val[j];
                        }
                    }
                }

                console.log("updating categoryx succesful");
                return result.data;
            }
        }
        
        function deleteRec(category_id) {
           
            //form match record
            var obj = {};
            obj.resource = [];

            var data = {};
            data.id = category_id;

            obj.resource.push(data);

            var url = baseURI + '/' + category_id;
            
            //update (delete answer) local copy of answers
            var i = _categories.map(function (x) { return x.id; }).indexOf(category_id);
            if (i > -1) _categories.splice(i, 1);

            return $http.delete(url, data, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                console.log("Deleting category was succesful");
                return result.data;
            }
        }

        function _queryFailed(error) {

            throw error;
        }
    }
})();