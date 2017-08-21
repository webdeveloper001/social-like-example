(function () {
    'use strict';

    angular
        .module('app')
        .factory('vrows', vrows);

    vrows.$inject = ['$http', '$q', '$rootScope', 'vrowvotes'];

    function vrows($http, $q, $rootScope, vrowvotes) {

        // Members
        var _allvrows = [];
        var _fetchAnswersMem = [];
        $rootScope.cvrows = _allvrows;
        var baseURI = '/api/v2/mysql/_table/vrows';

        var service = {
            getAllvrows: getAllvrows,
            getVrowsX: getVrowsX,
            postRec: postRec,
            postRec2: postRec2,
            deleteVrowByAnswer: deleteVrowByAnswer,
            deleteVrow: deleteVrow,
            updateRec: updateRec,
            deleteVrowByGroup: deleteVrowByGroup,
            //postVrows4Answer: postVrows4Answer
        };

        return service;

        function getAllvrows(forceRefresh) {

            //Get all vrows records
            var url0 = baseURI + '?offset=' + 0 * 1000;

            var p0 = $http.get(url0);

            return $q.all([p0]).then(function (d) {
                var data = d[0].data.resource;
                _load (data);
                if ($rootScope.DEBUG_MODE) console.log("No. Vrows: ", _allvrows.length);
                return _allvrows;
            }, _queryFailed); 

            //return _allvrows;
        }

        function getVrowsX(data) {

            var _datax = [];  //this is filtered array (ignore those answers for which vrows already fetched)
            data.forEach(function(item){
                if (_fetchAnswersMem.indexOf(item.answer)<0){
                     _datax.push(item);
                     _fetchAnswersMem.push(item.answer);
                }
            });

            if (_datax.length == 0) return $q.when(false);

            var filterstr = '?filter=(';
            for (var i=0; i< _datax.length; i++){
                filterstr = filterstr + 'answer=' + _datax[i].answer+')OR(';
            }
            filterstr = filterstr.substring(0,filterstr.length-3);
            
            //Get all vrows records
            var url0 = baseURI + filterstr;
            
            var p0 = $http.get(url0);
          
            return $q.all([p0]).then(function (d) {
                
                var _allvrowsx = d[0].data.resource;
                var map = _allvrows.map(function(x) {return x.id; });
                
                _allvrowsx.forEach(function(vrowobj){
                        if(map.indexOf(vrowobj.id) < 0)
                        _allvrows.push(vrowobj);
                });

                if ($rootScope.DEBUG_MODE) console.log("No. Vrows: ", _allvrows.length);
                return _allvrowsx;
            }, _queryFailed); 

            //return _allvrows;
        }
/*
        function postVrows4Answer(answer) {
            var titles = [];
            var obj = {};
            var vrowsobjs = [];
            if ($rootScope.cCategory.tags.indexOf('food') > -1 || $rootScope.cCategory.tags.indexOf('services') > -1 ||
                $rootScope.cCategory.tags.indexOf('health') > -1 || $rootScope.cCategory.tags.indexOf('beauty') > -1 ||
                $rootScope.cCategory.tags.indexOf('food') > -1 || $rootScope.cCategory.title.indexOf('food') > -1 ||
                $rootScope.cCategory.title.indexOf('restaurants') > -1 ||
                $rootScope.cCategory.title.indexOf('Bars') > -1 || $rootScope.cCategory.title.indexOf('bars') > -1 ||
                $rootScope.cCategory.title.indexOf('pubs') > -1 ||
                $rootScope.cCategory.title.indexOf('Yoga') > -1 || $rootScope.cCategory.title.indexOf('Pilates') > -1 ||
                $rootScope.cCategory.title.indexOf('yoga') > -1 || $rootScope.cCategory.title.indexOf('pilates') > -1||
                $rootScope.cCategory.title.indexOf('schools') > -1 ||
                $rootScope.cCategory.title.indexOf('Gyms') > -1 || $rootScope.cCategory.title.indexOf('gyms') > -1 ||
                $rootScope.cCategory.title.indexOf('Nightclubs') > -1 || answer.type == 'PersonCust' ||
                answer.type == 'Establishment') {

                titles = ['Quality of Service', 'Friendliness of Staff', 'Promptness of Service', 'Value for the Money'];

                if ($rootScope.cCategory.tags.indexOf('food') > -1 || $rootScope.cCategory.title.indexOf('food') > -1 ||
                    $rootScope.cCategory.title.indexOf('restaurants') > -1 || $rootScope.cCategory.title.indexOf('offee') > -1) {
                    titles = ['Quality of Food and Drinks', 'Friendliness of Staff', 'Promptness of Service', 'Value for the Money'];
                }
                if ($rootScope.cCategory.title.indexOf('Bars') > -1 || $rootScope.cCategory.title.indexOf('bars') > -1 ||
                    $rootScope.cCategory.title.indexOf('pubs') > -1) {
                    titles = ['Quality of Drinks', 'Friendliness of Staff', 'Promptness of Service', 'Value for the Money'];
                }

                if ($rootScope.cCategory.title.indexOf('Gyms') > -1 || $rootScope.cCategory.title.indexOf('gyms') > -1) {
                    titles = ['Equipment & Facilities', 'Friendliness of Staff', 'Environment', 'Value for the Money'];
                }
                
                if ($rootScope.cCategory.title.indexOf('Yoga') > -1 || $rootScope.cCategory.title.indexOf('Pilates') > -1 ||
                    $rootScope.cCategory.title.indexOf('yoga') > -1 || $rootScope.cCategory.title.indexOf('pilates') > -1 ||
                    $rootScope.cCategory.title.indexOf('schools') > -1 || $rootScope.cCategory.title.indexOf('MMA') > -1) {
                    titles = ['Quality of Instructors', 'Friendliness of Staff', 'Class Environment', 'Value for the Money'];
                }
                
                if ($rootScope.cCategory.title.indexOf('Apartments') > -1 || $rootScope.cCategory.title.indexOf('apartments') > -1) {
                    titles = ['Location', 'Floor Layout', 'Facilities', 'Value for the Money'];
                }
                //ranks of categories that include 'shops' or 'stores' but not 'barbershops' or 'coffee shops or repair shops'
                if (($rootScope.cCategory.title.indexOf('shop') > -1 || $rootScope.cCategory.title.indexOf('store') > -1) 
                    && ($rootScope.cCategory.title.indexOf('arber') < 0 && $rootScope.cCategory.title.indexOf('offee') < 0 &&
                    $rootScope.cCategory.title.indexOf('repair') < 0)) {
                    titles = ['Assortment of Products', 'Friendliness of Staff','Value for the Money'];
                }
                if ($rootScope.cCategory.title.indexOf('Tattoo') > -1 || $rootScope.cCategory.title.indexOf('tattoo') > -1) {
                    titles = ['Quality of Service', 'Friendliness of Staff', 'Promptness of Service', 'Value for the Money'];
                }
                
                if ($rootScope.cCategory.title.indexOf('Nightclubs') > -1 || $rootScope.cCategory.title.indexOf('music') > -1 || 
                    $rootScope.cCategory.title.indexOf('dancing') > -1) {
                    titles = [' Quality of Music', 'Environment', 'Friendliness of Staff', 'Value for the Money'];
                }
                if (answer.type == 'PersonCust') {
                    titles = [' Quality of Service', 'Friendliness', 'Value for the Money'];
                }
                //else if ($rootScope.cCategory.tags.includes('services')){
                            
                //}
                for (var n = 0; n < titles.length; n++) {
                    obj = {};
                    obj.gnum = 1;
                    obj.gtitle = 'General';
                    obj.title = titles[n];
                    obj.upV = 0;
                    obj.downV = 0;
                    //obj.timestmp = Date.now();
                    obj.answer = answer.id;
                    vrowsobjs.push(obj);
                    //vrows.postRec(obj);                           
                }
                postRec2(vrowsobjs);
            }

    }
*/
        function postRec(x) {
           
            //form match record
            var data = {};
            data.title = x;
            data.answer = $rootScope.canswer.id;
            data.gtitle = '';
            data.user = $rootScope.user.id;
            data.gnum = 0;
            data.upV = 0;
            data.downV = 0;
            data.timestmp = Date.now();

            var obj = {};
            obj.resource = [];

            obj.resource.push(data);

            var url = baseURI;

            return $http.post(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {
                
                //update local copy
                var newVRow = data;
                newVRow.id = result.data.resource[0].id;
                _allvrows.push(newVRow);
                //$rootScope.cvrows.push(newVRow);

                return result.data;

            }
        }

        function postRec2(x) {

            var obj = {};
            obj.resource = [];

            obj.resource.push(x);
            
            //update local copy
            _allvrows.push.apply(_allvrows, x);

            var url = baseURI;

            return $http.post(url, x, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {
                
                //update local copy
                var eidx = _allvrows.length - 1;
                for (var n = result.data.resource.length - 1; n >= 0; n--) {
                    _allvrows[eidx].id = result.data.resource[n].id;
                    eidx--;
                }

                return result.data;

            }
        }
        function deleteVrowByAnswer(answer_id) {
            
            //delete records from local copy
            for (var i = 0; i < _allvrows.length; i++) {
                if (_allvrows[i].answer == answer_id) {
                    _allvrows.splice(i, 1);
                }
            }

            var url = baseURI + '?filter=answer=' + answer_id;

            return $http.delete(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {
                
                //Everytime a Vrow record is deleted, delete associated user votes with it
                for (var i = 0; i < result.data.resource.length; i++) {
                    vrowvotes.deleteVrowVotesbyVrow(result.data.resource[i].id);
                }

                if ($rootScope.DEBUG_MODE) console.log("Deleting vrows records for answer was succesful");
                return result.data;
            }
        }

        function deleteVrowByGroup(gnum,answer) {
            
            //delete records from local copy
            for (var i = _allvrows.length - 1; i >= 0; i--) {
                if (_allvrows[i].gnum == gnum) {
                    _allvrows.splice(i, 1);
                }
            }
            var url = baseURI + '?filter=(gnum=' + gnum+') AND (answer='+ answer+')';

            return $http.delete(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {
                
                //Everytime a Vrow record is deleted, delete associated user votes with it
                for (var i = 0; i < result.data.resource.length; i++) {
                    vrowvotes.deleteVrowVotesbyVrow(result.data.resource[i].id);
                }

                if ($rootScope.DEBUG_MODE) console.log("Deleting vrows records for group was succesful");
                return result.data;
            }
        }

        function deleteVrow(vrow_id) {
            
            //form match record
            var obj = {};
            obj.resource = [];

            var data = {};
            data.id = vrow_id;

            obj.resource.push(data);

            var url = baseURI + '/' + vrow_id;
            
            //update (delete answer) local copy of answers
            var i = _allvrows.map(function (x) { return x.id; }).indexOf(vrow_id);
            if (i > -1) _allvrows.splice(i, 1);

            return $http.delete(url, data, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {
                
                //Everytime a Vrow record is deleted, delete associated user votes with it
                for (var i = 0; i < result.data.resource.length; i++) {
                    vrowvotes.deleteVrowVotesbyVrow(result.data.resource[i].id);
                }

                if ($rootScope.DEBUG_MODE) console.log("Deleting vrow was succesful");
                return result.data;
            }
        }

        function updateRec(rec_id, field, val) {
             
            //form match record
            var obj = {};
            obj.resource = [];

            var data = {};
            data.id = rec_id;

            for (var i = 0; i < field.length; i++) {
               data[field[i]] = val[i];
            }
            //console.log("data", data);
            obj.resource.push(data);

            var url = baseURI;
            
            //update local copy
            var idx = _allvrows.map(function (x) { return x.id; }).indexOf(rec_id);
            for (var i = 0; i < field.length; i++) {
                _allvrows[idx][field[i]] = val[i];
            }

            return $http.patch(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                if ($rootScope.DEBUG_MODE) console.log("updating vrows record succesful");
                return result.data;
            }
        }

        function _load(data){
            _allvrows.length = 0;
            data.forEach(function(x){
                _allvrows.push(x);
            });
        }

        function _areAllvrowsLoaded() {

            return _allvrows.length > 0;
        }

        function _queryFailed(error) {

            throw error;
        }
    }
})();