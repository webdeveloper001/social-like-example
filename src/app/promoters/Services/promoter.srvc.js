(function () {
    'use strict';

    angular
        .module('app')
        .factory('promoter', promoter);

    promoter.$inject = ['$http', '$q', '$rootScope'];

    function promoter($http, $q, $rootScope) {

        //Members
        var _promoters = [];
        var _promoter = {};
        var baseURI = '/api/v2/mysql/_table/promoters';

        var service = {
            getall: getall,
            get: get,
            getbyUser: getbyUser,
            getbyCode: getbyCode,
            add: add,
            update: update,
            deletepromoter: deletepromoter,
            getbycode: getbycode,
        };

        return service;

        function getall(forceRefresh) {
            // console.log("getpromotes..._arepromotesLoaded()", _arepromotesLoaded());

            if (_arepromotersLoaded() && !forceRefresh) {

                return $q.when(_promoters);
            }
            
            //Get all promote records
            var url0 = baseURI + '?offset=' + 0 * 1000;
            
            var p0 = $http.get(url0);
            
            return $q.all([p0]).then(function (d){
                _promoters = d[0].data.resource;

                if ($rootScope.DEBUG_MODE) console.log("No. promoters: ", _promoters.length);
                return _promoters;            
            }, _queryFailed);  

        }

        function get(id) {

            var url = baseURI + '/' + id;

            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                return _promoter = result.data.resource;
            }
        }

        function getbyUser(user) {

            var url = baseURI + '/?filter=user=' + user;

            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                return _promoter = result.data.resource;
            }
        }

        function getbyCode(code) {

            var url = baseURI + '/?filter=code=' + code;

            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                return _promoter = result.data.resource;
            }
        }
        
        function add(promoter) {

            var url = baseURI;
            var resource = [];

            resource.push(promoter);
            
            return $http.post(url, resource, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: resource
            }).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                //update local copy
                var promoterx = promoter;
                promoterx.id = result.data.resource[0].id; 
                _promoters.push(promoterx);
                
                return result.data;
            }

        }
       
        function update(promoter_id, field, val) {
           
            //form match record
            var obj = {};
            obj.resource = [];

            var data = {};
            data.id = promoter_id;
            
            for (var i=0; i<field.length; i++){
                switch (field[i]){
                    case "firstname": data.firstname = val[i]; break;
                    case "lastname": data.lastname = val[i]; break;
                    case "email": data.email = val[i]; break;
                    case "address": data.address = val[i]; break;
                    case "phone": data.phone = val[i]; break;
                    case "code": data.code = val[i]; break;
                    case "stripeid": data.stripeid = val[i]; break;
                }
            }
            //console.log("data", data);
            obj.resource.push(data);

            var url = baseURI;
            
            //update local copy
            var idx = _promoter.map(function(x) {return x.id; }).indexOf(promoter_id);  
            for (var i=0; i<field.length; i++){
                switch (field[i]){
                    case "firstname": _promoter[idx].firstname = val[i]; break;
                    case "lastname": _promoter[idx].lastname = val[i]; break;
                    case "email": _promoter[idx].email = val[i]; break;
                    case "address": _promoter[idx].address = val[i]; break;
                    case "phone": _promoter[idx].phone = val[i]; break;
                    case "code": _promoter[idx].code = val[i]; break;
                    case "stripeid": _promoter[idx].stripeid = val[i]; break;
                }
            }                        
            
            return $http.patch(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {
                
                if ($rootScope.DEBUG_MODE) console.log("updating promoter succesful");
                return result.data;
            }
        }
        
        function deletepromoter(promoter_id) {
           
            //form match record
            var obj = {};
            obj.resource = [];

            var data = {};
            data.id = promote_id;

            obj.resource.push(data);

            var url = baseURI + '/' + promoter_id;
            
            //update (delete promote) local copy of promotes
            var i = _promoters.map(function(x) {return x.id; }).indexOf(promoter_id);
            if (i > -1) _promoters.splice(i,1);
            
            return $http.delete(url, data, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                if ($rootScope.DEBUG_MODE) console.log("Deleting promote was succesful");
                return result.data;
            }
        }

        function getbycode(code){

            var url = baseURI + '/?filter=code='+ code;

            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                return _promoter = result.data.resource;
            }

        }

        function _arepromotersLoaded() {

            return _promoters.length > 0;
        }

        function _queryFailed(error) {

            throw error;
        }

    }
})();