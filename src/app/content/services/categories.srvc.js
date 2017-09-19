(function () {
    'use strict';

    angular
        .module('app')
        .factory('categories', categories);

    categories.$inject = ['$http', '$q', '$rootScope','$window'];

    function categories($http, $q, $rootScope, $window) {

        // Members
        var _categories = [];
        $rootScope.categories = _categories;

        var baseURI = '/api/v2/mysql/_table/categories';

        var service = {
            getAllCategories: getAllCategories,
            getAllCategoriesX: getAllCategoriesX,
            getAllCategoriesG: getAllCategoriesG,
            addCategory: addCategory,
            update: update,
            deleteRec: deleteRec,
            getInitialHomeData: getInitialHomeData,
            storeInitialHomeData: storeInitialHomeData
        };

        return service;

        function getInitialHomeData(data){

            var catsFromStorage = $window.localStorage.getItem("Categories-HomeData");
            if (catsFromStorage) {
                 _load(JSON.parse(catsFromStorage));
                 return $q.when(true);
            }

            var filterstr = '?filter=(';
            for (var i=0; i< data.length; i++){
                filterstr = filterstr + 'id=' + data[i]+')OR(';
            }
            filterstr = filterstr.substring(0,filterstr.length-3);

            var url0 = baseURI + filterstr;
            var p0 = $http.get(url0);

            return $q.all([p0]).then(function (d){
                var datax = d[0].data.resource;
                
                if (_categories.length == 0) _load(datax);

                if ($rootScope.DEBUG_MODE) console.log("categories length: ", _categories.length);
                //$window.localStorage.setItem("Categories-HomeData", JSON.stringify(datax));
                return _categories;            
            }, _queryFailed);  

        }

        function getAllCategories(forceRefresh) {

            /*if (_categories.length > 0 && !forceRefresh) {

                return $q.when(_categories);
            }*/

            //var url = baseURI;
            //Get all match records
            var url0 = baseURI + '?offset=' + 0 * 1000;
           //var url0 = baseURI + '/?filter=scope=city';

            var p0 = $http.get(url0);
            
            return $q.all([p0]).then(function (d){
                var data = d[0].data.resource;
                _load (data);
                if ($rootScope.DEBUG_MODE) console.log("No. Categories ", _categories.length);
                return _categories;            
            }, _queryFailed);  

        }

        function getAllCategoriesX(scope) {

            var url0 = baseURI + '?offset=' + 0 * 1000+'&filter=scope='+scope;
            var p0 = $http.get(url0);
            
            return $q.all([p0]).then(function (d){
                var data = d[0].data.resource;
                _load (data);
                if ($rootScope.DEBUG_MODE) console.log("No. Categories ", _categories.length);
                return _categories;            
            }, _queryFailed);  
        }

        function getAllCategoriesG(data) {

            var filterstr = '?filter=(';
            for (var i=0; i< data.length; i++){
                filterstr = filterstr + 'id=' + data[i].cat+')OR(';
            }
            filterstr = filterstr.substring(0,filterstr.length-3);

            var url0 = baseURI + filterstr;
            var p0 = $http.get(url0);
            
            return $q.all([p0]).then(function (d){
                var data = d[0].data.resource;
                _load (data);
                $rootScope.categories = d[0].data.resource;
                if ($rootScope.DEBUG_MODE) console.log("No. Categories ", _categories.length);
                return _categories;            
            }, _queryFailed);  
        }

        function addCategory(category) {

            category.scope = $rootScope.SCOPE;
            
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
                        //update searchStr
                        $rootScope.searchStrContent[i] = $rootScope.content[i].tags + $rootScope.content[i].title; 
                    }
                }

                if ($rootScope.DEBUG_MODE) console.log("updating categoryx succesful");
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

                if ($rootScope.DEBUG_MODE) console.log("Deleting category was succesful");
                return result.data;
            }
        }

        function storeInitialHomeData(cids){
            var data = [];
            var idx = 0;
            cids.forEach(function(i){
                 idx = _categories.map(function (x) { return x.id; }).indexOf(i);
                 if (idx > -1) data.push(_categories[idx]);
            });
            $window.localStorage.setItem("Categories-HomeData", JSON.stringify(data));
        }

        function _load(data){
            _categories.length = 0;
            data.forEach(function(x){
                _categories.push(x);
            });
        }

        function _queryFailed(error) {

            throw error;
        }
    }
})();