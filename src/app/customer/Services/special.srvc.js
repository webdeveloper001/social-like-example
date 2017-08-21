(function () {
    'use strict';

    angular
        .module('app')
        .factory('special', special);

    special.$inject = ['$http', '$q', '$rootScope', 'imagelist'];

    function special($http, $q, $rootScope, imagelist) {

        //Members
        var _specials = [];
        var _fetchAnswersMem = [];
        $rootScope.specials = _specials;
        var _selectedspecial;
        var _specialsByAnswer = [];
        var baseURI = '/api/v2/mysql/_table/specials';

        var service = {
            getSpecials: getSpecials,
            getSpecialsX: getSpecialsX,
            //getSpecial: getSpecial,
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

                var data = result.data.resource;
                _load (data);

                return _specials; 
            }

        }

        function getSpecialsX(data) {

            var _datax = [];  //this is filtered array (ignore those answers for which specials already fetched)
            data.forEach(function(item){
                if (_fetchAnswersMem.indexOf(item.answer)<0) {
                    _datax.push(item);
                    _fetchAnswersMem.push(item.answer);
                }
            });
            if (_datax.length == 0) return $q.when(false);
            // console.log("getspecials..._arespecialsLoaded()", _arespecialsLoaded());
            var filterstr = '?filter=(';
            for (var i=0; i< _datax.length; i++){
                filterstr = filterstr + 'answer=' + _datax[i].answer+')OR(';
            }
            filterstr = filterstr.substring(0,filterstr.length-3);
            
            var url = baseURI + filterstr;

            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {
                 if ($rootScope.DEBUG_MODE) console.log("specialsX data loaded")

                var data = result.data.resource;
                var map = _specials.map(function(x) {return x.id; });
                data.forEach(function(obj){
                        if(map.indexOf(obj.id) < 0)
                        _specials.push(obj);
                });
                return data;
            }

        }
/*
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
*/
        function getSpecialsbyAnswer(answer_id) {

            var url = baseURI + '/?filter=answer=' + answer_id;

            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                var data = result.data.resource;
                var map = _specials.map(function(x) {return x.id; });
                data.forEach(function(obj){
                        if(map.indexOf(obj.id) < 0)
                        _specials.push(obj);
                });
                
                _specialsByAnswer = data;
                if ($rootScope.DEBUG_MODE) console.log("gotSpecial for answer! ", _specialsByAnswer);
                return data;
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
                
                if ($rootScope.DEBUG_MODE) console.log("result", result);
                return result.data;
            }

        }

        function updateSpecial(special_id, field, val) {
           
            //form match record
            var obj = {};
            obj.resource = [];

            var data = {};
            data.id = special_id;
            
            for (var i=0; i<field.length; i++){
                data[field[i]] = val[i];
            }
            //console.log("data", data);
            obj.resource.push(data);

            var url = baseURI;
            
            //update local copy
            var idx = _specials.map(function(x) {return x.id; }).indexOf(special_id);  
            for (var i=0; i<field.length; i++){
                _specials[idx][field[i]] = val[i];
            }

            //update _specialsByAnswer
            var idx2 = _specialsByAnswer.map(function(x) {return x.id; }).indexOf(special_id);  
            for (var i=0; i<field.length; i++){
                _specialsByAnswer[idx2][field[i]] = val[i];
            }                                
            
            return $http.patch(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {
                
                if ($rootScope.DEBUG_MODE) console.log("updating special succesful");
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
            var blobImage;

            //update (delete special) local copy of specials
            if (_specials.length > 0) {
                var i = _specials.map(function (x) { return x.id; }).indexOf(special_id);
                blobImage = _specials[i].image;
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
                if(blobImage.indexOf('https://rankx.blob') != -1){
                    imagelist.deleteBlob(blobImage);
                }
                console.log("Deleting special was succesful");
                return result.data;   
            }
        }

        function _load(data){
            _specials.length = 0;
            data.forEach(function(x){
                _specials.push(x);
            });
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