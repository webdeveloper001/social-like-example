(function () {
    'use strict';

    angular
        .module('app')
        .factory('rankofday', rankofday);

    rankofday.$inject = ['$http', '$q','$rootScope'];

    function rankofday($http, $q, $rootScope) {

        // Members
        var _rankofday = [];
        var _allranks = [];
        var baseURI = '/api/v2/mysql/_table/rankofday';

        var service = {
            getrankofday: getrankofday,
            getall: getall,
            update: update
        };

        return service;

        function getrankofday(forceRefresh) {

            //if (_arerankofdayLoaded() && !forceRefresh) {

            //    return $q.when(_rankofday);
            //}
            
             //get todays date
            var datenow = new Date();
            var tz = datenow.getTimezoneOffset();
            datenow.setMinutes( datenow.getMinutes() - tz);
            //var dateStr = datenow.toLocaleDateString();
            //var dateobj = new Date();
            //function pad(n) {return n < 10 ? "0"+n : n;}
            function pad(n) {return n < 10 ? n : n;}
            var dateStr = pad(datenow.getMonth()+1)+"/"+pad(datenow.getDate())+"/"+datenow.getFullYear();
            
            
            var url = baseURI + '/?filter=date='+ dateStr;

            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {
                if (result.data.resource.length != 0) {
                    var url = '/api/v2/mysql/_table/ranking/?filter=title=' + result.data.resource[0].main;

                    return $http.get(url).then(function(resp) {
                        if (resp.data.resource.length != 0) 
                            return _rankofday = resp.data.resource[0];
                        else
                            return null;

                    }, _queryFailed);
                } 
            }
        }

        function getall(){
            var url = baseURI;
            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                return _allranks = result.data.resource;
            }
        }

        function update(id, field, val) {
           
            //form match record
            var obj = {};
            obj.resource = [];

            var data = {};
            data.id = id;
            
            for (var i=0; i<field.length; i++){
                switch (field[i]){
                    case "introtext": data.introtext = val[i]; break;                    
                }
            }
            //console.log("data", data);
            obj.resource.push(data);

            var url = baseURI;
            
            //update local copy
            var idx = _allranks.map(function(x) {return x.id; }).indexOf(id);  
            for (var i=0; i<field.length; i++){
                switch (field[i]){
                    case "name": _allranks[idx].introtext = val[i]; break;                    
                }
            }                        
            
            return $http.patch(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {
                
                console.log("updating rank of day succesful");
                return result.data;
            }
        }
        
        function _arerankofdayLoaded() {

            return _rankofday.length > 0;
        }

        function _queryFailed(error) {

            throw error;
        }
    }
})();