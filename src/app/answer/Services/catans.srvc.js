(function () {
    'use strict';

    angular
        .module('app')
        .factory('catans', catans);

    catans.$inject = ['$http', '$q','$rootScope','votes'];

    function catans($http, $q, $rootScope, votes) {

        // Members
        var _allcatans = [];
        var baseURI = '/api/v2/mysql/_table/catans';

        var service = {
            getAllcatans: getAllcatans,
            postRec: postRec,
            postRec2: postRec2,
            deleteRec: deleteRec,
            deleteAnswer: deleteAnswer,
            updateRec: updateRec,
            deletebyCategory: deletebyCategory            
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
            var url3 = baseURI + '?offset=' + 3 * 1000;

            var p0 = $http.get(url0);
            var p1 = $http.get(url1);
            var p2 = $http.get(url2);
            var p3 = $http.get(url3);

            return $q.all([p0, p1, p2, p3]).then(function (d){
                _allcatans = d[0].data.resource.concat(d[1].data.resource, d[2].data.resource, d[3].data.resource);
                if ($rootScope.DEBUG_MODE) console.log("No. Cat-Ans: ", _allcatans.length);
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
            data.user = $rootScope.user.id;
            data.timestmp = Date.now();
             
            var obj = {};
            obj.resource = [];

            obj.resource.push(data);
            
            _allcatans.push(data);
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
                _allcatans[_allcatans.length-1].id = id;
                
                if ($rootScope.DEBUG_MODE) console.log("creating catans record was succesful");
                return result.data;
            }
        }
        
        function postRec2(answer,category,isdup) {
           
            //form match record
            var data = {};
            data.answer = answer;
            data.category = category;
            data.upV = 0;
            data.downV = 0;
            data.user = $rootScope.user.id;
            data.timestmp = Date.now();
            data.isdup = isdup;
             
            var obj = {};
            obj.resource = [];

            obj.resource.push(data);
            
            _allcatans.push(data);
            var url = baseURI;

            return $http.post(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {
                
                //update local copies
                //var id = result.data.resource[0].id; 
                //_allcatans[_allcatans.length-1].id = id;
                
                if ($rootScope.DEBUG_MODE) console.log("creating catans record was succesful");
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
                
                //Everytime a CatAns record is deleted, delete associated user votes with it
                for (var i=0; i<result.data.resource.length; i++){
                    votes.deleteVotesbyCatans(result.data.resource[i].id);
                }
                if ($rootScope.DEBUG_MODE) console.log("Deleting catans records was succesful");
                return result.data;
            }
        }
        
        function deleteRec(answer_id, category_id) {
            
            //delete records from local copy
            for (var i=0; i<_allcatans.length;i++){
                if (_allcatans[i].answer == answer_id && _allcatans[i].category == category_id){
                    _allcatans.splice(i,1);
                } 
            }
            
           var url = baseURI + '?filter=(answer=' + answer_id+') AND (category='+category_id+')'; 
            
            return $http.delete(url).then(querySucceeded, _queryFailed);
            
            function querySucceeded(result) {
                
                //Everytime a CatAns record is deleted, delete associated user votes with it
                for (var i=0; i<result.data.resource.length; i++){
                    votes.deleteVotesbyCatans(result.data.resource[i].id);
                }
                
                if ($rootScope.DEBUG_MODE) console.log("Deleting catans records by answer and category was succesful");
                return result.data;
            }
        }
        
        function deletebyCategory(category_id) {
            
            //delete records from local copy
            for (var i=0; i<_allcatans.length;i++){
                if (_allcatans[i].category == category_id){
                    _allcatans.splice(i,1);
                } 
            }
            
           var url = baseURI + '?filter=category=' + category_id; 
            
            return $http.delete(url).then(querySucceeded, _queryFailed);
            
            function querySucceeded(result) {
                
                //Everytime a CatAns record is deleted, delete associated user votes with it
                for (var i=0; i<result.data.resource.length; i++){
                    votes.deleteVotesbyCatans(result.data.resource[i].id);
                }
                if ($rootScope.DEBUG_MODE) console.log("Deleting catans records by category was succesful");
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
                    case "answer": data.answer = val[i];break;
                    case "isdup": data.isdup = val[i];break;
                    case "category": data.category = val[i];break;
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
                    case "answer": $rootScope.catansrecs[idx].answer = val[i]; break;
                    case "isdup": $rootScope.catansrecs[idx].isdup = val[i]; break;
                    case "category": $rootScope.catansrecs[idx].category = val[i]; break;
                }
            }                        
            
            return $http.patch(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                if ($rootScope.DEBUG_MODE) console.log("updating catans record succesful");
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