(function () {
    'use strict';

    angular
        .module('app')
        .factory('matchrec', matchrec);

    matchrec.$inject = ['$http', '$q', '$rootScope'];

    function matchrec($http, $q, $rootScope) {

        // Members
        var _mrecs = [];
        var json_schema = [];
        var baseURI = '/api/v2/mysql';

        var service = {
            GetMatchTable: GetMatchTable,
            postRec: postRec,
            deleteRecordsbyAnswer: deleteRecordsbyAnswer
            //    addTable: addTable
        };

        return service;

        function postRec(data) {
           
            //form match record
            var obj = {};
            obj.resource = [];

            obj.resource.push(data);
            
            //update local copy
            // _mrecs.push(data);
            _mrecs.push.apply(_mrecs, data);
            //update local copy of mrecs by user
            //$rootScope.cmrecs_user.push(data);
            //$rootScope.cmrecs_user.push.apply($rootScope.cmrecs_user, data);  
            
            var url = baseURI + '/_table/matchtable';

            return $http.post(url, data, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                console.log("creating match record was succesful");
                return result.data;
            }
        }

        function GetMatchTable(forceRefresh) {

            if (_areMatchRecsLoaded() && !forceRefresh) {
                return $q.when(_mrecs);
            }
            
            //Get all match records
            var url = baseURI + '/_table/matchtable';

            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                return _mrecs = result.data.resource;
            }
        }

        function deleteRecordsbyAnswer(answer_id) {
           
            //Delete all match records that correspond to this answer
            
            //delete records from local copy
            for (var i=0; i<_mrecs.length;i++){
                if (_mrecs[i].ls == answer_id || _mrecs[i].hs == answer_id){
                    _mrecs.splice(i,1);
                } 
            }
            
            //TODO: Unable to filter by both ls and hs in a single query. Now using two queries.
            var url = baseURI + '/_table/matchtable?filter=ls=' + answer_id;
            return $http.delete(url).then(deleteLSRecsSucceeded, _queryFailed);

            function deleteLSRecsSucceeded(result) {
                url = baseURI + '/_table/matchtable?filter=hs=' + answer_id;
                return $http.delete(url).then(deleteHSRecsSucceeded, _queryFailed);
                function deleteHSRecsSucceeded(result) {
                    console.log("deleting records succesful");
                    return;
                }
            }
        }

        function _queryFailed(error) {

            throw error;
        }

        function _areMatchRecsLoaded() {

            return _mrecs.length > 0;
        }

    }
})();