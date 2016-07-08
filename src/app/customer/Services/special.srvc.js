(function () {
    'use strict';

    angular
        .module('app')
        .factory('special', special);

    special.$inject = ['$http', '$q', '$rootScope'];

    function special($http, $q, $rootScope) {

        //Members
        var _specials = [];
        var _selectedspecial;
        var _specialsByAnswer = [];
        var baseURI = '/api/v2/mysql/_table/specials';

        var service = {
            getSpecials: getSpecials,
            getSpecial: getSpecial,
            addSpecial: addSpecial,
            updateSpecial: updateSpecial,
            deleteSpecial: deleteSpecial,
            getSpecialsbyAnswer: getSpecialsbyAnswer
        };

        return service;

        function getSpecials(forceRefresh) {
            // console.log("getspecials..._arespecialsLoaded()", _arespecialsLoaded());

            if (_arespecialsLoaded() && !forceRefresh) {

                return $q.when(_specials);
            }

            var url = baseURI;

            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                return _specials = result.data.resource;
            }

        }

        function getSpecial(id, forceRefresh) {

            if (_isSelectedspecialLoaded(id) && !forceRefresh) {

                return $q.when(_selectedspecial);
            }

            var url = baseURI + '/' + id;

            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                return _selectedspecial = result.data;
            }
        }

        function getSpecialsbyAnswer(answer_id, forceRefresh) {

            if (_areSpecialsByAnswerLoaded() && !forceRefresh) {
                return $q.when(_specialsByAnswer);
            }


            var url = baseURI + '/?filter=answer=' + answer_id;

            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                return _specialsByAnswer = result.data.resource;
            }
        }

        function addSpecial(special) {

            var url = baseURI;
            var resource = [];

            resource.push(special);

            return $http.post(url, resource, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: resource
            }).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                //update local copy
                var specialx = special;
                specialx.id = result.data.resource[0].id;
                if (_specials.length > 0) _specials.push(specialx);
                if (_specialsByAnswer.length > 0) _specialsByAnswer.push(specialx);                
                
                console.log("result", result);
                return result.data;
            }

        }

        function updateSpecial(item) {
           
            //form match record
            var obj = {};
            obj.resource = [];

         
            //console.log("data", data);
            obj.resource.push(item);

            var url = baseURI;
            
            //TODO: update local copy
            if (_specials.length > 0){
                for (var i=0; i < _specials.length; i++){
                    if (_specials[i].id == item.id) _specials[i] = item; 
                }
            }
            
            if (_specialsByAnswer.length > 0){
                for (var i=0; i < _specialsByAnswer.length; i++){
                    if (_specialsByAnswer[i].id == item.id) _specialsByAnswer[i] = item; 
                }
            }
            
            return $http.patch(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                console.log("updating special succesful");
                return result.data;
            }
        }

        function deleteSpecial(special_id) {
           
            //form match record
            var obj = {};
            obj.resource = [];

            var data = {};
            data.id = special_id;

            obj.resource.push(data);

            var url = baseURI + '/' + special_id;
            
            //update (delete special) local copy of specials
            if (_specials.length > 0) {
                var i = _specials.map(function (x) { return x.id; }).indexOf(special_id);
                if (i > -1) _specials.splice(i, 1);
            }
            
            //update (delete special) local copy of specials
            if (_specialsByAnswer.length > 0) {
                var i = _specialsByAnswer.map(function (x) { return x.id; }).indexOf(special_id);
                if (i > -1) _specialsByAnswer.splice(i, 1);
            }

            return $http.delete(url, data, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                console.log("Deleting special was succesful");
                return result.data;
            }
        }

        function _arespecialsLoaded() {

            return _specials.length > 0;
        }

        function _areSpecialsByAnswerLoaded() {
            return _specialsByAnswer.length > 0;
        }

        function _isSelectedspecialLoaded(id) {

            return _selectedspecial && _selectedspecial.id == id;
        }

        function _queryFailed(error) {

            throw error;
        }

    }
})();