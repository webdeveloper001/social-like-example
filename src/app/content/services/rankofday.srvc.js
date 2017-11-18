(function () {
    'use strict';

    angular
        .module('app')
        .factory('rankofday', rankofday);

    rankofday.$inject = ['$http', '$q','$rootScope'];

    function rankofday($http, $q, $rootScope) {

        // Members
        var _rankofday = [];
        $rootScope.rankofday = _rankofday;
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

                    var rodObj = result.data.resource[0];
                    //once we get rankofday record, we find record with that category.
                    /*$rootScope.content.forEach(function(x){
                        if (x.cat == result.data.resource[0].category && x.nh == 1) _rankofday = x;
                    });
                    console.log("-rankofday - ", _rankofday);
                    return _rankofday; */
                    var url1 = '/api/v2/mysql/_table/categories/?filter=id=' + rodObj.category;
                    var url2 = '/api/v2/mysql/_table/ranking/?filter=(cat=' + rodObj.category +') AND (nh=1)'; 

                    var p1 = $http.get(url1);
                    var p2 = $http.get(url2);

                     return $q.all([p1, p2]).then(function (d) {
                     
                        var rankObj = d[1].data.resource[0];
                        var catObj = d[0].data.resource[0];
                        rankObj.title = catObj.category.replace('@Nh','San Diego');
                        rankObj.fimage = catObj.fimage;
                        rankObj.introtext = catObj.introtext;
                        rankObj.tags = catObj.tags;
                        rankObj.question = catObj.question;
                        rankObj.type = catObj.type;
                        rankObj.fc = catObj.fc;
                        rankObj.bc = catObj.bc;
                        rankObj.shade = catObj.shade;
                        _rankofday.push(rankObj);
                        $rootScope.$emit('rodReady');
                        return _rankofday;
                    },function(err){
                        console.log("Error getting rank of day data: ", err);
                    });
/*
                    return $http.get(url).then(function(resp) {
                        if (resp.data.resource.length != 0){ 
                            var obj = {};
                            obj = resp.data.resource[0];
                            var idx = _answers.map(function(x) {return x.id; }).indexOf(answer_id);
                            
                            return _rankofday = resp.data.resource[0];
                        }
                        else
                            return null;

                    }, _queryFailed); */
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
                 data[field[i]] = val[i]; 
            }
            //console.log("data", data);
            obj.resource.push(data);

            var url = baseURI;
            
            //update local copy
            var idx = _allranks.map(function(x) {return x.id; }).indexOf(id);  
            for (var i=0; i<field.length; i++){
                _allranks[idx][field[i]] = val[i];
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