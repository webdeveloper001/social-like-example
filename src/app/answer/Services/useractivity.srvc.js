(function () {
    'use strict';

    angular
        .module('app')
        .factory('useractivity', useractivity);

    useractivity.$inject = ['$http', '$q','$rootScope'];

    function useractivity($http, $q, $rootScope) {

        // Members
        var _alluseractivity = [];
        var _useractivity = [];
        var baseURI = '/api/v2/mysql/_table/useractivity';

        var service = {
            getAllUserActivity: getAllUserActivity,
            getActivitybyUser: getActivitybyUser,
            postRec: postRec,
            patchRec: patchRec,
            deleteRec: deleteRec,
            //deletebyVote: deletebyVote
            
        };

        return service;

        function getAllUserActivity(forceRefresh) {

            if (_areAllUserActivityLoaded() && !forceRefresh) {

                return $q.when(_alluseractivity);
            }

            var url = baseURI;

            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                return _alluseractivity = result.data.resource;
            }

        }
        
        function getActivitybyUser(forceRefresh) {

            if (_userActivityLoaded() && !forceRefresh) {

                return $q.when(_userActivityLoaded);
            }

            var url = baseURI + '/?filter=user='+ $rootScope.user.id;;

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