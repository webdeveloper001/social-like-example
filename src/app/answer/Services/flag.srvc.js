(function () {
    'use strict';

    angular
        .module('app')
        .factory('flag', flag);

    flag.$inject = ['$http', '$q','$rootScope'];

    function flag($http, $q, $rootScope) {

        // Members
        var baseURI = '/api/v2/mysql/_table/flagtable';

        var service = {
            flagAnswer: flagAnswer
            
        };

        return service;
        
        function flagAnswer(answer_id, flag) {
           
            //form match record
            var data = {};
            data.user = $rootScope.user.id;
            data.answer = answer_id;
			data.flag = flag;
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

                console.log("creating flag answer record was succesful");
                return result.data;
            }
        }
        
       

        function _queryFailed(error) {

            throw error;
        }
    }
})();