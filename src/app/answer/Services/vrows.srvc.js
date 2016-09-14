(function () {
    'use strict';

    angular
        .module('app')
        .factory('vrows', vrows);

    vrows.$inject = ['$http', '$q','$rootScope'];

    function vrows($http, $q, $rootScope) {

        // Members
        var _allvrows = [];
        var baseURI = '/api/v2/mysql/_table/vrows';

        var service = {
            getAllvrows: getAllvrows,
            postRec: postRec,
            deleteVrowByAnswer: deleteVrowByAnswer,
            deleteVrow: deleteVrow,
            updateRec: updateRec,
            deleteVrowByGroup: deleteVrowByGroup            
        };

        return service;

        function getAllvrows(forceRefresh) {

            if (_areAllvrowsLoaded() && !forceRefresh) {

                return $q.when(_allvrows);
            }
            
            //Get all vrows records
            var url0 = baseURI + '?offset=' + 0 * 1000;
            var url1 = baseURI + '?offset=' + 1 * 1000;

            var p0 = $http.get(url0);
            var p1 = $http.get(url1);

            return $q.all([p0, p1]).then(function (d){
                _allvrows = d[0].data.resource.concat(d[1].data.resource);
                console.log("No. Vrows: ", _allvrows.length);
                return _allvrows;            
            }, _queryFailed);  
            
        }
        
        function postRec(x) {
           
            //form match record
            var data = x;
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

                console.log("Adding new Vrow succesful", result);
                return result.data;
               
            }
        }
         function deleteVrowByAnswer(answer_id) {
            
            //delete records from local copy
            for (var i=0; i<_allvrows.length;i++){
                if (_allvrows[i].answer == answer_id){
                    _allvrows.splice(i,1);
                } 
            }
            
           var url = baseURI + '?filter=answer=' + answer_id; 
            
            return $http.delete(url).then(querySucceeded, _queryFailed);
            
            function querySucceeded(result) {

                console.log("Deleting vrows records for answer was succesful");
                return result.data;
            }
        }
        
         function deleteVrowByGroup(gnum) {
            
            //delete records from local copy
            for (var i=0; i<_allvrows.length;i++){
                if (_allvrows[i].gnum == gnum){
                    _allvrows.splice(i,1);
                } 
            }
            
           var url = baseURI + '?filter=gnum=' + gnum; 
            
            return $http.delete(url).then(querySucceeded, _queryFailed);
            
            function querySucceeded(result) {

                console.log("Deleting vrows records for group was succesful");
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
            var i = _allvrows.map(function(x) {return x.id; }).indexOf(vrow_id);
            if (i > -1) _allvrows.splice(i,1);
            
            return $http.delete(url, data, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                console.log("Deleting vrow was succesful");
                return result.data;
            }
        }
        
         function updateRec(rec_id, field, val) {
             
            //form match record
            var obj = {};
            obj.resource = [];

            var data = {};
            data.id = rec_id;
            
            for (var i=0; i<field.length; i++){
                switch (field[i]){
                    case "upV": data.upV = val[i]; break;
                    case "downV": data.downV = val[i]; break;
                    case "title": data.title = val[i]; break;
                    case "gnum": data.gnum = val[i]; break;
                    case "gtitle": data.gtitle = val[i]; break;
                }
            }
            //console.log("data", data);
            obj.resource.push(data);

            var url = baseURI;
            
            //update local copy
            var idx = _allvrows.map(function(x) {return x.id; }).indexOf(rec_id);
            for (var i=0; i<field.length; i++){
                switch (field[i]){
                    case "upV": $rootScope.cvrows[idx].upV = val[i]; break;
                    case "downV": $rootScope.cvrows[idx].downV = val[i]; break;
                    case "title": $rootScope.cvrows[idx].title = val[i]; break;
                    case "gnum": $rootScope.cvrows[idx].gnum = val[i]; break;
                    case "gtitle": $rootScope.cvrows[idx].gtitle = val[i]; break;
                }
            }                        
            
            return $http.patch(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                console.log("updating vrows record succesful");
                return result.data;
            }
        }
     
        function _areAllvrowsLoaded() {

            return _allvrows.length > 0;
        }

        function _queryFailed(error) {

            throw error;
        }
    }
})();