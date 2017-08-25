(function () {
    'use strict';

    angular
        .module('app')
        .factory('edit', edit);

    edit.$inject = ['$http', '$q', '$rootScope','uaf'];

    function edit($http, $q, $rootScope,uaf) {

        //Members
        var _edits = [];
        $rootScope.edits = _edits;
        var baseURI = '/api/v2/mysql/_table/edittable';

        var service = {
            getEdits: getEdits,
            getEditsX: getEditsX,
            addEdit: addEdit,
            updateEdit: updateEdit,
            deleteEdit: deleteEdit,
            deleteEditbyAnswer: deleteEditbyAnswer
        };

        return service;

        function getEdits(forceRefresh) {
            // console.log("getAnswers..._areAnswersLoaded()", _areAnswersLoaded());

            var url = baseURI;

            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                var data = result.data.resource;
                _load (data);

                if ($rootScope.DEBUG_MODE) console.log("Edits Loaded");
                return _edits; 
            }

        }

        function getEditsX(data) {

            var filterstr = '?filter=(';
            for (var i=0; i< data.length; i++){
                filterstr = filterstr + 'answer=' + data[i].answer+')OR(';
            }
            filterstr = filterstr.substring(0,filterstr.length-3);
            
            var url = baseURI + filterstr;

            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                var _editsx = result.data.resource;
                var map = $rootScope.edits.map(function(x) {return x.id; });
                _editsx.forEach(function(obj){
                        if(map.indexOf(obj.id) < 0)
                        _edits.push(obj);
                });
                
                if ($rootScope.DEBUG_MODE) console.log("editsX data loaded - ", _editsx)

                return _editsx;
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
                console.log("newEditx - ", newEditx);
                console.log("_edits - ", _edits);
                console.log("$rootScope.edits - ", $rootScope.edits);
                
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

        function _load(data){
            _edits.length = 0;
            data.forEach(function(x){
                _edits.push(x);
            });
        }
        
        function _areEditsLoaded() {

            return _edits.length > 0;
        }

        function _queryFailed(error) {

            throw error;
        }

    }
})();