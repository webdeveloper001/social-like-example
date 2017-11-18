(function () {
    'use strict';

    angular
        .module('app')
        .factory('uaf', uaf);

    uaf.$inject = ['$http', '$q', '$rootScope'];

    function uaf($http, $q, $rootScope) {

        //Members
        var _actions = [];
        $rootScope.uafs = _actions;
        var baseURI = '/api/v2/mysql/_table/useractivityfeed';

        var service = {
            getactions: getactions,
            post: post,
			deletebyId: deletebyId,
			getnext10actions: getnext10actions
        };

        return service;
        
        function getactions(forceRefresh) {
            // console.log("getuaf s..._areuaf sLoaded()", _areuaf sLoaded());
            /*
            if (_actionsLoaded() && !forceRefresh) {

                return $q.when(_actions);
            }
            */
            //Get all uaf  records
            var url0 = baseURI + '?limit=100&order=id%20DESC';
            //var url1 = baseURI + '?offset=' + 1 * 1000;

            var p0 = $http.get(url0);
            //var p1 = $http.get(url1);

            return $q.all([p0]).then(function (d){
                var data = d[0].data.resource;
                _load (data);
                if ($rootScope.DEBUG_MODE) console.log("No. user actions: ", _actions.length);
                return _actions;            
            }, _queryFailed);  

        }


        function getnext10actions(forceRefresh) {
            //Get all uaf  records
            var url0 = baseURI + '?limit=20&order=id%20DESC&offset=' + $rootScope.uafs.length ;
            //var url1 = baseURI + '?offset=' + 1 * 1000;

            var p0 = $http.get(url0);
            //var p1 = $http.get(url1);

            return $q.all([p0]).then(function (d){
                //_actions = _actions.concat(d[0].data.resource);
                var data = d[0].data.resource;
                var map = _actions.map(function(x) {return x.id; });
                data.forEach(function(obj){
                        if(map.indexOf(obj.id) < 0)
                        _actions.push(obj);
                });
                
                if ($rootScope.DEBUG_MODE) console.log("No. user actions: ", _actions.length);
                return _actions;
            }, _queryFailed);  

        }

        function post(action,field,val) {

            var url = baseURI;
			var _colors = {};
            _colors.bc = '';
            _colors.fc = '';
			var data = {};
            var n = 0;
			data.userid = $rootScope.user.id;
			data.action = action;
            data.initials = $rootScope.user.name.replace(/[^A-Z]/g, '');
            getIconColors($rootScope.user.id, _colors);
            data.fc = _colors.fc;
            data.bc = _colors.bc;
            data.date = moment().format('YYYY-MM-DD');
            //data.actorusername = $rootScope.user.first_name + ' ' + $rootScope.user.last_name;
            data.actorusername = $rootScope.user.first_name;
			for (var i=0; i<field.length; i++){
                switch (field[i]){
                    case "answer": {
                        data.answer = val[i]; 
                        n = $rootScope.answers.map(function(x) {return x.id; }).indexOf(data.answer);
                        data.text1 = $rootScope.answers[n].name;  
                        break;
                    }
                    case "category": {
                        data.category = val[i]; 
                        n = $rootScope.content.map(function(x) {return x.id; }).indexOf(data.category);
                        data.text2 = $rootScope.content[n].title;  
                        break;
                    }
                    case "comment": data.comment = val[i]; break;
                    case "edit": {
                        data.edit = val[i];
                        n = $rootScope.edits.map(function(x) {return x.id; }).indexOf(data.edit);
                        data.text2 = $rootScope.edits[n].field;  
                        break;
                    }
                    case "vrow": {
                        data.vrow = val[i]; 
                        n = $rootScope.cvrows.map(function(x) {return x.id; }).indexOf(data.vrow);
                        data.text2 = $rootScope.cvrows[n].title;  
                        break;
                    }
                    case "text1": data.text1 = val[i]; break;
                    case "text2": data.text2 = val[i]; break;
                 }
            }
            //obj.resource.push(data);
			
            var resource = [];
			resource.push(data);
            
            return $http.post(url, resource, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: resource
            }).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {
                
                //update local copy
                var uafx = data;
                uafx.id = result.data.resource[0].id; 
                _actions.push(uafx);

                if ($rootScope.DEBUG_MODE) console.log("Posted user activity feed");
                return result.data;
            }

        }
 
        function deletebyId(id) {
           
            //form match record
            var obj = {};
            obj.resource = [];

            var data = {};
            data.id = id;

            obj.resource.push(data);

            var url = baseURI + '/' + id;
            
            //update (delete uaf ) local copy of uaf s
            var i = _actions.map(function(x) {return x.id; }).indexOf(id);
            if (i > -1) _actions.splice(i,1);
            
            return $http.delete(url, data, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                if ($rootScope.DEBUG_MODE) console.log("Deleting user activity feed was succesful");
                return result.data;
            }
        }
        
        function getIconColors(x, c) {
            switch (x % 10) {
                case 0: { c.bc = '#b3b3b3'; c.fc = 'black'; break; }
                case 1: { c.bc = '#666666'; c.fc = 'white'; break; }
                case 2: { c.bc = '#006bb3'; c.fc = 'white'; break; }
                case 3: { c.bc = '#009933'; c.fc = 'white'; break; }
                case 4: { c.bc = '#cc0000'; c.fc = 'white'; break; }
                case 5: { c.bc = '#538cc6'; c.fc = 'black'; break; }
                case 6: { c.bc = '#b36b00'; c.fc = 'white'; break; }
                case 7: { c.bc = '#999966'; c.fc = 'black'; break; }
                case 8: { c.bc = '#4d0099'; c.fc = 'white'; break; }
                case 9: { c.bc = '#009999'; c.fc = 'black'; break; }
            }
        }

        function _load(data){
            _actions.length = 0;
            data.forEach(function(x){
                _actions.push(x);
            });
        }

        function _actionsLoaded() {

            return _actions.length > 0;
        }

        function _queryFailed(error) {

            throw error;
        }

    }
})();