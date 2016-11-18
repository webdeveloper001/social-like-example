(function () {
    'use strict';

    angular
        .module('app')
        .factory('editvote', editvote);

    editvote.$inject = ['$http', '$q', '$rootScope','uaf'];

    function editvote($http, $q, $rootScope,uaf) {

        // Members
        var _editvotes = [];
        var baseURI = '/api/v2/mysql';

        var service = {
            loadEditVotesTable: loadEditVotesTable,
            patchEditVoteRec: patchEditVoteRec,
            postEditVoteRec: postEditVoteRec,
            deleteEditVotes: deleteEditVotes,
            deleteEditVotesbyAnswer: deleteEditVotesbyAnswer

        };

        return service;


        function loadEditVotesTable(forceRefresh) {

            if (_isEditVotesLoaded() && !forceRefresh) {

                return $q.when(_editvotes);
            }
            
            //Get all vote records for current user
            var url = baseURI + '/_table/editvotetable/?filter=user=' + $rootScope.user.id;

            return $http.get(url).then(querySucceeded, _queryFailed);
            
            function querySucceeded(result) {

                return _editvotes = result.data.resource;
            }

        }

        function postEditVoteRec(items) {
            
            //form match record
            var obj = {};
            obj.resource = [];

            obj.resource.push(items);

            var url = baseURI + '/_table/editvotetable';

            return $http.post(url, items, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: items
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {
                
                //update local copies
                var itemx = {};
                for (var i = 0; i < result.data.resource.length; i++) {
                    itemx = items[i];
                    itemx.id = result.data.resource[i].id;
                    _editvotes.push(itemx);

                    $rootScope.ceditvotes.push(itemx);
                    if (itemx.vote == 1) uaf.post('upVotedEdit',['answer', 'edit'],[itemx.answer, itemx.edit]); //user activity feed
                    if (itemx.vote == -1) uaf.post('downVotedEdit',['answer', 'edit'],[itemx.answer, itemx.edit]); //user activity feed
                }

                if ($rootScope.DEBUG_MODE) console.log("Creating new voting record for edit was succesful");
                return result.data;
            }
        }

        function patchEditVoteRec(rec_id, vote) {
            
            //form match record
            var obj = {};
            obj.resource = [];


            var data = {};
            data.id = rec_id;
            data.vote = vote;
            data.timestmp = Date.now();

            obj.resource.push(data);

            var url = baseURI + '/_table/editvotetable'; 
            
            //update local record of votes
            var i = _editvotes.map(function (x) { return x.id; }).indexOf(rec_id);
            _editvotes[i].vote = vote;
            _editvotes[i].timestmp = data.timestmp;

            return $http.patch(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                if ($rootScope.DEBUG_MODE) console.log("Updating vote record for edit was succesful");
                return result.data;
            }
        }
        function deleteEditVotesbyAnswer(answer_id) {
            
            //delete records from local copy
            for (var i = 0; i < _editvotes.length; i++) {
                if (_editvotes[i].answer == answer_id) {
                    _editvotes.splice(i, 1);
                }
            }

            var url = baseURI + '/_table/editvotetable?filter=answer=' + answer_id;

            return $http.delete(url).then(querySucceeded, _queryFailed);
            
            function querySucceeded(result) {

                if ($rootScope.DEBUG_MODE) console.log("Deleting edit vote records for answer was succesful");
                return result.data;
            }
        }

        function deleteEditVotes(edit_id) {
            
            //delete records from local copy
            for (var i = 0; i < _editvotes.length; i++) {
                if (_editvotes[i].edit == edit_id) {
                    _editvotes.splice(i, 1);
                }
            }

            var url = baseURI + '/_table/editvotetable?filter=edit=' + edit_id;

            return $http.delete(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                if ($rootScope.DEBUG_MODE) console.log("Deleting edit vote records for answer was succesful");
                return result.data;
            }
        }

        function _isEditVotesLoaded(id) {

            return _editvotes.length > 0;
        }
        function _queryFailed(error) {

            throw error;
        }

    }
})();