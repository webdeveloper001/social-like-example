(function () {
    'use strict';

    angular
        .module('app')
        .factory('catans', catans);

    catans.$inject = ['$http', '$q','$rootScope','votes','uaf'];

    function catans($http, $q, $rootScope, votes, uaf) {

        // Members
        var _allcatans = [];
        var _fetchAnswersMem = [];
        var _fetchRanksMem = [];
        var _idx = 0;
        
        $rootScope.catansrecs = _allcatans;

        var baseURI = '/api/v2/mysql/_table/catans';

        var service = {
            getAllcatans: getAllcatans,
            getAllcatansX: getAllcatansX,
            getAllcatansY: getAllcatansY,
            //getbyCategory: getbyCategory,
            postRec: postRec,
            postRec2: postRec2,
            deleteRec: deleteRec,
            deleteAnswer: deleteAnswer,
            updateRec: updateRec,
            deletebyCategory: deletebyCategory,
            getCatan: getCatan,
            deleteCatan: deleteCatan
        };

        return service;

        function getCatan(id) {


            var url = baseURI + '/' + id;

            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                return result.data;
            }
        }
        
        function getAllcatans(forceRefresh) {

            //Get all catans records
            var url0 = baseURI + '?offset=' + 0 * 1000;
            var url1 = baseURI + '?offset=' + 1 * 1000;
            var url2 = baseURI + '?offset=' + 2 * 1000;
            var url3 = baseURI + '?offset=' + 3 * 1000;
            var url4 = baseURI + '?offset=' + 4 * 1000;
            var url5 = baseURI + '?offset=' + 5 * 1000;
            var url6 = baseURI + '?offset=' + 6 * 1000;
            var url7 = baseURI + '?offset=' + 7 * 1000;
            var url8 = baseURI + '?offset=' + 8 * 1000;
            var url9 = baseURI + '?offset=' + 9 * 1000;

            var p0 = $http.get(url0);
            var p1 = $http.get(url1);
            var p2 = $http.get(url2);
            var p3 = $http.get(url3);
            var p4 = $http.get(url4);
            var p5 = $http.get(url5);
            var p6 = $http.get(url6);
            var p7 = $http.get(url7);
            var p8 = $http.get(url8);
            var p9 = $http.get(url9);

            return $q.all([p0, p1, p2, p3, p4, p5, p6, p7, p8, p9]).then(function (d){
                var data = d[0].data.resource.concat(d[1].data.resource, d[2].data.resource, d[3].data.resource, d[4].data.resource,
                d[5].data.resource, d[6].data.resource, d[7].data.resource, d[8].data.resource, d[9].data.resource);
                _load (data);
                if ($rootScope.DEBUG_MODE) console.log("No. Cat-Ans: ", _allcatans.length);
                return _allcatans;            
            }, _queryFailed);  
            
        }

        function getAllcatansX(data) {
            var _datax = [];  //this is filtered array (ignore those ranks for which catans already fetched)
            if (data.length > 0) {
                data.forEach(function (item) {
                    if (_fetchRanksMem.indexOf(item.id) < 0) {
                        _datax.push(item);
                        _fetchRanksMem.push(item.id);
                    }
                });
            }
            //_datax = [];
            if (_datax.length == 0) return $q.when(false);
                
            var filterstr = '?filter=(';
            for (var i=0; i< _datax.length; i++){
                if (_datax[i].catstr){
                    var catArr = _datax[i].catstr.split(':').map(Number);
                    for (var j=0; j<catArr.length; j++) {
                        filterstr = filterstr + 'category=' + catArr[j]+')OR(';
                        //console.log("@allcatansX", catArr[j]);
                    }
                }
                else{
                filterstr = filterstr + 'category=' + _datax[i].id+')OR(';
                //console.log("@allcatansX", _datax[i].id);
                }
            }

            filterstr = filterstr.substring(0,filterstr.length-3);
            
            //Get all catans records
            var url0 = baseURI + filterstr;
            
            var p0 = $http.get(url0);
            
            return $q.all([p0]).then(function (d){
                
                var _allcatansx = d[0].data.resource;
                var map = _allcatans.map(function(x) {return x.id; });
                _allcatansx.forEach(function(catansobj){
                        if(map.indexOf(catansobj.id) < 0)
                        _allcatans.push(catansobj);
                });

                if ($rootScope.DEBUG_MODE) 
                    console.log("getAllCatansX loaded: ", _allcatansx.length);
                
                return _allcatansx;            
            }, _queryFailed);  
            
        }

        function getAllcatansY(data) {

            var _datax = [];  //this is filtered array (ignore those answers for which catans already fetched)
            if (data.length > 0) {
                data.forEach(function (item) {
                    if (_fetchAnswersMem.indexOf(item.id) < 0) {
                        _datax.push(item);
                        _fetchAnswersMem.push(item.id);
                    }
                });
            }
            //_datax = [];

            if (_datax.length == 0) return $q.when(false);
            //console.log();
            var filterstr = '?filter=(';
            for (var i=0; i< _datax.length; i++){
                filterstr = filterstr + 'answer=' + _datax[i].id+')OR(';
                //console.log("@catansY -- answer =", _datax[i].id);
            }
            
            filterstr = filterstr.substring(0,filterstr.length-3);
            //Get all catans records
            var url0 = baseURI + filterstr;
            
            var p0 = $http.get(url0);
            
            return $q.all([p0]).then(function (d){
                
                var _allcatansy = d[0].data.resource;
                var map = _allcatans.map(function(x) {return x.id; });
                _allcatansy.forEach(function(catansobj){
                        if(map.indexOf(catansobj.id) < 0)
                        _allcatans.push(catansobj);
                });
                if ($rootScope.DEBUG_MODE) 
                    console.log("getAllCatansY loaded: ", _allcatansy.length);
                return _allcatansy;            
            }, _queryFailed);  
            
        }

        function deleteCatan(catan_id) {
            
            //delete records from local copy
            for (var i=0; i<_allcatans.length;i++){
                if (_allcatans[i].id == catan_id){
                    _allcatans.splice(i,1);
                    break;
                } 
            }
            
           var url = baseURI + '?filter=id=' + catan_id; 
            
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
/*
        function getbyCategory(catarr) {

            //Create filter string
            var filtstr = '';
            for (var i=0; i<catarr.length; i++){
                if (i == 0) filtstr = filtstr + '(answer=' + catarr[i] + ')';
                else filtstr = filtstr + ' OR (answer=' + catarr[i] + ')';  
            }

            var url0 = baseURI + '?filter=' + filtstr;

            //console.log('url0 - ', url0); 
            
            var p0 = $http.get(url0);
            
            return $q.all([p0]).then(function (d){
                _allcatans = d[0].data.resource;
                if ($rootScope.DEBUG_MODE) console.log("No. Cat-Ans by Category: ", _allcatans.length);
                return _allcatans;            
            }, _queryFailed);  
       }
       */
        
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

            //update local copy
            _allcatans.push(data);

            obj.resource.push(data);
            
            var url = baseURI;

            return $http.post(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {
                
                //write id to local copy record
                _allcatans.forEach(function(item){
                    if (item.category == data.category && 
                        item.answer == data.answer)
                        item.id = result.data.resource[0].id; 
                })
                //var datax = data;
                //datax.id = result.data.resource[0].id;
                //_allcatans.push(datax);

                //Create user activity feed
                uaf.post('addedAnswer',['answer','category'],[data.answer, data.category]); //user activity feed
                
                if ($rootScope.DEBUG_MODE) console.log("creating catans record was succesful");
                return result.data;
            }
        }
        
        function postRec2(answer,category) {
           
            //form match record
            var data = {};
            data.answer = answer;
            data.category = category;
            data.upV = 0;
            data.downV = 0;
            data.user = $rootScope.user.id;
            data.timestmp = Date.now();
            //data.isdup = isdup;
             
            var obj = {};
            obj.resource = [];

            //update local copy
            _allcatans.push(data);

            obj.resource.push(data);
            
            var url = baseURI;

            return $http.post(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {
                
                //update local copies
                //write id to local copy record
                _allcatans.forEach(function(item){
                    if (item.category == data.category && 
                        item.answer == data.answer)
                        item.id = result.data.resource[0].id; 
                });
                //var datax = data;
                //datax.id = result.data.resource[0].id;
                //_allcatans.push(datax);

                //Create user activity feed
                uaf.post('addedAnswer',['answer','category'],[answer, category]); //user activity feed
                
                //if ($rootScope.DEBUG_MODE) 
                    console.log("@postRec2 creating catans record was succesful");
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
                data[field[i]] = val[i];
            }
            //console.log("data", data);
            obj.resource.push(data);

            var url = baseURI;
            
            //update local copy
            //var idx = $rootScope.B.indexOf(+rec_id);
            var idx = _allcatans.map(function(x) {return x.id; }).indexOf(rec_id);            
            for (var i=0; i<field.length; i++){
                _allcatans[idx][field[i]] = val[i];
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

        function _load(data){
            _allcatans.length = 0;
            data.forEach(function(x){
                _allcatans.push(x);
            });
        }
     
        function _areAllcatansLoaded() {

            return _allcatans.length > 0;
        }

        function _queryFailed(error) {

            throw error;
        }
    }
})();