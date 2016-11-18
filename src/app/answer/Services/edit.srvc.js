(function () {
    'use strict';

    angular
        .module('app')
        .factory('edit', edit);

    edit.$inject = ['$http', '$q', '$rootScope','uaf'];

    function edit($http, $q, $rootScope,uaf) {

        //Members
        var _edits = [];
        var baseURI = '/api/v2/mysql/_table/edittable';

        var service = {
            getEdits: getEdits,
            addEdit: addEdit,
            updateEdit: updateEdit,
            deleteEdit: deleteEdit,
            deleteEditbyAnswer: deleteEditbyAnswer
        };

        return service;

        function getEdits(forceRefresh) {
            // console.log("getAnswers..._areAnswersLoaded()", _areAnswersLoaded());

            if (_areEditsLoaded() && !forceRefresh) {

                 return $q.when(_edits);
            }

            var url = baseURI;

            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                return _edits = result.data.resource;
            }

        }

       function addEdit(newEdit) {

            var url = baseURI;
            var resource = [];

            resource.push(newEdit);

            return $http.post(url, resource, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: resource
            }).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                //update local copy
                var newEditx = newEdit;
                newEditx.id = result.data.resource[0].id; 
                _edits.push(newEditx);
                
                //$rootScope.edits.push(newEditx);
                uaf.post('editA',['answer', 'edit'],[newEditx.answer, newEditx.id]); //user activity feed 

                if ($rootScope.DEBUG_MODE) console.log("Adding new Edit succesful", result);
                return result.data;
            }

        }

        function updateEdit(edit_id, upV, downV) {
           
            //form match record
            var obj = {};
            obj.resource = [];

            var data = {};
            data.id = edit_id;
            data.upV = upV;
            data.downV = downV;

            obj.resource.push(data);

            var url = baseURI;

            return $http.patch(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                if ($rootScope.DEBUG_MODE) console.log("updating edit vote counts succesful");
                return result.data;
            }
        }

        function deleteEdit(edit_id) {
           
            //form match record
            var obj = {};
            obj.resource = [];

            var data = {};
            data.id = edit_id;

            obj.resource.push(data);

            var url = baseURI + '/' + edit_id;
            
            //update (delete answer) local copy of answers
            var i = _edits.map(function(x) {return x.id; }).indexOf(edit_id);
            if (i > -1) _edits.splice(i,1);
            
            
            return $http.delete(url, data, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                if ($rootScope.DEBUG_MODE) console.log("Deleting edit was succesful");
                return result.data;
            }
        }
        
        function deleteEditbyAnswer(answer_id) {
            
            //delete records from local copy
            for (var i = 0; i < _edits.length; i++) {
                if (_edits[i].answer == answer_id) {
                    _edits.splice(i, 1);
                }
            }

            var url = baseURI + '?filter=answer=' + answer_id;

            return $http.delete(url).then(querySucceeded, _queryFailed);
            
            function querySucceeded(result) {

                if ($rootScope.DEBUG_MODE) console.log("Deleting edits for answer was succesful");
                return result.data;
            }
        }
        

        function _areEditsLoaded() {

            return _edits.length > 0;
        }

        function _queryFailed(error) {

            throw error;
        }

    }
})();