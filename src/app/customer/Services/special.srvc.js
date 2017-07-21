(function () {
    'use strict';

    angular
        .module('app')
        .factory('special', special);

    special.$inject = ['$http', '$q', '$rootScope', 'imagelist'];

    function special($http, $q, $rootScope, imagelist) {

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
                switch (field[i]){
                    case "answer": data.answer = val[i]; break;
                    case "bc": data.bc = val[i]; break;
                    case "details": data.details = val[i]; break;
                    case "edate": data.edate = val[i]; break;
                    case "etime": data.etime = val[i]; break;
                    case "etime2": data.etime2 = val[i]; break;
                    case "fc": data.fc = val[i]; break;
                    case "freq": data.freq = val[i]; break;
                    case "mon": data.mon = val[i]; break;
                    case "tue": data.tue = val[i]; break;
                    case "wed": data.wed = val[i]; break;
                    case "thu": data.thu = val[i]; break;
                    case "fri": data.fri = val[i]; break;
                    case "sat": data.sat = val[i]; break;
                    case "sun": data.sun = val[i]; break;
                    case "name": data.name = val[i]; break;
                    case "image": data.image = val[i]; break;
                    case "sdate": data.sdate = val[i]; break;
                    case "stime": data.stime = val[i]; break;
                    case "stime2": data.stime2 = val[i]; break;
                    case "stitle": data.stitle = val[i]; break;
                }
            }
            //console.log("data", data);
            obj.resource.push(data);

            var url = baseURI;
            
            //update local copy
            //var idx = _answers.map(function(x) {return x.id; }).indexOf(answer_id);
            //var idx = $rootScope.A.indexOf(+answer_id);
            var idx = _specials.map(function(x) {return x.id; }).indexOf(special_id);  
            for (var i=0; i<field.length; i++){
                switch (field[i]){
                    case "answer": _specials[idx].answer = val[i]; break;
                    case "bc": _specials[idx].bc = val[i]; break;
                    case "details": _specials[idx].details = val[i]; break;
                    case "edate": _specials[idx].edate = val[i]; break;
                    case "etime": _specials[idx].etime = val[i]; break;
                    case "etime2": _specials[idx].etime2 = val[i]; break;
                    case "fc": _specials[idx].fc = val[i]; break;
                    case "freq": _specials[idx].freq = val[i]; break;
                    case "mon": _specials[idx].mon = val[i]; break;
                    case "tue": _specials[idx].tue = val[i]; break;
                    case "wed": _specials[idx].wed = val[i]; break;
                    case "thu": _specials[idx].thu = val[i]; break;
                    case "fri": _specials[idx].fri = val[i]; break;
                    case "sat": _specials[idx].sat = val[i]; break;
                    case "sun": _specials[idx].sun = val[i]; break;
                    case "name": _specials[idx].name = val[i]; break;
                    case "image": _specials[idx].image = val[i]; break;
                    case "sdate": _specials[idx].sdate = val[i]; break;
                    case "stime": _specials[idx].stime = val[i]; break;
                    case "stime2": _specials[idx].stime2 = val[i]; break;
                    case "stitle": _specials[idx].stitle = val[i]; break;
                }
            }

            //update _specialsByAnswer
            var idx2 = _specialsByAnswer.map(function(x) {return x.id; }).indexOf(special_id);  
            for (var i=0; i<field.length; i++){
                switch (field[i]){
                    case "answer": _specialsByAnswer[idx2].answer = val[i]; break;
                    case "bc": _specialsByAnswer[idx2].bc = val[i]; break;
                    case "details": _specialsByAnswer[idx2].details = val[i]; break;
                    case "edate": _specialsByAnswer[idx2].edate = val[i]; break;
                    case "etime": _specialsByAnswer[idx2].etime = val[i]; break;
                    case "etime2": _specialsByAnswer[idx2].etime2 = val[i]; break;
                    case "fc": _specialsByAnswer[idx2].fc = val[i]; break;
                    case "freq": _specialsByAnswer[idx2].freq = val[i]; break;
                    case "mon": _specialsByAnswer[idx2].mon = val[i]; break;
                    case "tue": _specialsByAnswer[idx2].tue = val[i]; break;
                    case "wed": _specialsByAnswer[idx2].wed = val[i]; break;
                    case "thu": _specialsByAnswer[idx2].thu = val[i]; break;
                    case "fri": _specialsByAnswer[idx2].fri = val[i]; break;
                    case "sat": _specialsByAnswer[idx2].sat = val[i]; break;
                    case "sun": _specialsByAnswer[idx2].sun = val[i]; break;
                    case "name": _specialsByAnswer[idx2].name = val[i]; break;
                    case "image": _specialsByAnswer[idx2].image = val[i]; break;
                    case "sdate": _specialsByAnswer[idx2].sdate = val[i]; break;
                    case "stime": _specialsByAnswer[idx2].stime = val[i]; break;
                    case "stime2": _specialsByAnswer[idx2].stime2 = val[i]; break;
                    case "stitle": _specialsByAnswer[idx2].stitle = val[i]; break;
                }
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
/*
        function updateSpecial(item) {
           
            
            
            //form match record
            var obj = {};
            obj.resource = [];


         
            //console.log("data", data);
            obj.resource.push(item);
            console.log("@special service - ", item);

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
*/
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