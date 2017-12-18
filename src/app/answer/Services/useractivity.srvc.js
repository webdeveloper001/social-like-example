(function () {
    'use strict';

    angular
        .module('app')
        .factory('useractivity', useractivity);

    useractivity.$inject = ['$http', '$q','$rootScope'];

    function useractivity($http, $q, $rootScope) {

        // Members
        var _alluseractivity = [];
        var _fetchRanksMem = [];
        $rootScope.alluseractivity = _alluseractivity;

        var _useractivity = [];
        var baseURI = '/api/v2/mysql/_table/useractivity';

        var service = {
            getAllUserActivity: getAllUserActivity,
            getAllUserActivityX: getAllUserActivityX,
            getActivitybyUser: getActivitybyUser,
            postRec: postRec,
            patchRec: patchRec,
            deleteRec: deleteRec,
            //deletebyVote: deletebyVote
            
        };

        getAllUserActivity();
        return service;

        function getAllUserActivity(forceRefresh) {

            /*if (_areAllUserActivityLoaded() && !forceRefresh) {

                return $q.when(_alluseractivity);
            }*/

            var url = baseURI;
            var url0 = baseURI + '?offset=0';
            var url1 = baseURI + '?offset=1000';
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

            return $q.all([p0, p1]).then(querySucceeded, _queryFailed);

            function querySucceeded(d) {
                var data = d[0].data.resource.concat(d[1].data.resource);

                _load (data);

                return _alluseractivity;
            }

        }

        function getAllUserActivityX(data) {

            var _datax = [];  //this is filtered array (ignore those ranks for which useractivity already fetched)
            if (data != false) {
                data.forEach(function (item) {
                    if (_fetchRanksMem.indexOf(item.category) < 0) {
                        _datax.push(item);
                        _fetchRanksMem.push(item.category);
                    }
                });
            }

            if (_datax.length == 0) return $q.when(false);

            var filterstr = '?filter=(';
            for (var i=0; i< _datax.length; i++){
                filterstr = filterstr + 'category=' + _datax[i].category+')OR(';
            }
            filterstr = filterstr.substring(0,filterstr.length-3);

            var url = baseURI + filterstr;

            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                var _alluseractivityx = result.data.resource;
                var map = _alluseractivity.map(function(x) {return x.id; });
                _alluseractivityx.forEach(function(obj){
                        if(map.indexOf(obj.id) < 0)
                        _alluseractivity.push(obj);
                });

                if ($rootScope.DEBUG_MODE) console.log("useractivityX loaded");
                return _alluseractivity;
                
                }
        }
        
        function getActivitybyUser() {

            /*if (_userActivityLoaded() && !forceRefresh) {

                return $q.when(_userActivityLoaded);
            }*/

            var url = baseURI + '/?filter=user='+ $rootScope.user.id;

            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                return _useractivity = result.data.resource;
            }

        }
        
        function postRec(category) {
           
            //form match record
            var data = {};
            data.user = $rootScope.user.id;
            data.category = category;
            data.votes = 1;
            data.timestmp = Date.now();
             
            var obj = {};
            obj.resource = [];  

            obj.resource.push(data);
            
            //update local copy
            //_alluseractivity.push(data);
            
            var url = baseURI;

            return $http.post(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {
                
                //update local copy
                var datax = data;
                datax.id = result.data.resource[0].id; 
                _alluseractivity.push(datax);
                
                //update current user activity array
                $rootScope.thisuseractivity.push(datax);                

                if ($rootScope.DEBUG_MODE) console.log("creating useractivity record was succesful");
                return result.data;
            }
        }
       
       function patchRec(rec_id, votes) {
            
            //form match record
            var obj = {};
            obj.resource = [];
                      
            var data={};
            data.id = rec_id;
            data.user = $rootScope.user.id;
            data.votes = votes;
            data.timestmp = Date.now(); 
            
            obj.resource.push(data); 
            
            var url = baseURI;
            
            var idx = _alluseractivity.map(function(x) {return x.id; }).indexOf(rec_id);   
            _alluseractivity[idx].votes = votes;            
            
            return $http.patch(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                if ($rootScope.DEBUG_MODE) console.log("Updating useractivity record was succesful");
                return result.data;
            }
        }
        
        function deleteRec(rec_id) {
            
            //update (delete answer) local copy of alluseractivity
            var i = _alluseractivity.map(function(x) {return x.id; }).indexOf(rec_id);
            if (i > -1) _alluseractivity.splice(i,1);
            
           var url = baseURI + '/' + rec_id; 
            
            return $http.delete(url).then(querySucceeded, _queryFailed);
            
            function querySucceeded(result) {
                if ($rootScope.DEBUG_MODE) console.log("Deleting user activity record was succesful");
                return result.data;
            }
        }
        
        /*
        function deletebyVote(vote_id) {
            
            //delete records from local copy
            for (var i=0; i<_alluseractivity.length;i++){
                if (_alluseractivity[i].voterec == vote_id){
                    _alluseractivity.splice(i,1);
                } 
            }
            
           var url = baseURI + '/?filter=voterec=' + vote_id; 
            
            return $http.delete(url).then(querySucceeded, _queryFailed);
            
            function querySucceeded(result) {

                console.log("Deleting useractivity records by vote was succesful");
                return result.data;
            }
        }*/

        function _load(data){
            _alluseractivity = [];
            data.forEach(function(x){
                _alluseractivity.push(x);
            });
        }
     
        function _areAllUserActivityLoaded() {

            return _alluseractivity.length > 0;
        }
        
        function _userActivityLoaded() {

            return _useractivity.length > 0;
        }

        function _queryFailed(error) {

            throw error;
        }
    }
})();