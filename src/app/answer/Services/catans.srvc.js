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
            deleteRec: deleteRec,
            deleteAnswer: deleteAnswer,
            updateRec: updateRec            
        };

        return service;

        function getAllcatans(forceRefresh) {

            if (_areAllcatansLoaded() && !forceRefresh) {

                return $q.when(_allcatans);
            }
            
            //Get all catans records
            var url0 = baseURI + '?offset=' + 0 * 1000;
            var url1 = baseURI + '?offset=' + 1 * 1000;
            var url2 = baseURI + '?offset=' + 2 * 1000;

            var p0 = $http.get(url0);
            var p1 = $http.get(url1);
            var p2 = $http.get(url2);

            return $q.all([p0, p1, p2]).then(function (d){
                _allcatans = d[0].data.resource.concat(d[1].data.resource, d[2].data.resource);
                console.log("No. Cat-Ans: ", _allcatans.length);
                return _allcatans;            
            }, _queryFailed);  
            
        }
        
        function postRec(x) {
           
            //form match record
            var data = {};
            data.answer = x;
            data.category = $rootScope.cCategory.id;
            data.upV = 0;
            data.downV = 0;
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
         function deleteAnswer(answer_id) {
            
            //delete records from local copy
            for (var i=0; i<_allcatans.length;i++){
                if (_allcatans[i].answer == answer_id){
                    _allcatans.splice(i,1);
                } 
            }
            
           var url = baseURI + '?filter=answer=' + answer_id; 
            
            return $http.delete(url).then(querySucceeded, _queryFailed);
            
            function querySucceeded(result) {

                console.log("Deleting catans records was succesful");
                return result.data;
            }
        }
        
        function deleteRec(answer_id, category_id) {
            
            //delete records from local copy
            for (var i=0; i<_allcatans.length;i++){
                if (_allcatans[i].answer == answer_id && _allcatans[i].category == $rootScope.cCategory.id){
                    _allcatans.splice(i,1);
                } 
            }
            
           var url = baseURI + '?filter=(answer=' + answer_id+') AND (category='+category_id+')'; 
            
            return $http.delete(url).then(querySucceeded, _queryFailed);
            
            function querySucceeded(result) {

                console.log("Deleting catans records by answer and category was succesful");
                return result.data;
            }
        }
        
         function updateRec(rec_id, field, val) {
             
            //form match record
            var obj = {};
            obj.resource = [];

            var data = {};
            data.id = rec_id;
            
            for (var i=0; i<field.length; i++){
                switch (field[i]){
                    case "upV": data.upV = val[i]; break;
                    case "downV": data.downV = val[i]; break;
                    case "rank": data.rank = val[i]; break;
                }
            }
            //console.log("data", data);
            obj.resource.push(data);

            var url = baseURI;
            
            //update local copy
            //var idx = $rootScope.B.indexOf(+rec_id);
            var idx = _allcatans.map(function(x) {return x.id; }).indexOf(rec_id);            
            for (var i=0; i<field.length; i++){
                switch (field[i]){
                    case "upV": $rootScope.catansrecs[idx].upV = val[i]; break;
                    case "downV": $rootScope.catansrecs[idx].downV = val[i]; break;
                    case "rank": $rootScope.catansrecs[idx].rank = val[i]; break;
                }
            }                        
            
            return $http.patch(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                console.log("updating catans record succesful");
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