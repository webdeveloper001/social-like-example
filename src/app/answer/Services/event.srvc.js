(function () {
    'use strict';

    angular
        .module('app')
        .factory('event', event);

    event.$inject = ['$http', '$q', '$rootScope','catans','vrows'];

    function event($http, $q, $rootScope,catans, vrows) {

        //Members
        var _events = [];
        var _selectedevent;
        var baseURI = '/api/v2/mysql/_table/events';

        var service = {
            getevents: getevents,
            getevent: getevent,
            addevent: addevent,
            update: update,
            deleteEvent: deleteEvent,
            flagEvent: flagEvent,                       
        };

        return service;
        

        function getevents(forceRefresh) {
            // console.log("getevents..._areeventsLoaded()", _areeventsLoaded());

            if (_areeventsLoaded() && !forceRefresh) {

                return $q.when(_events);
            }
            
            //Get all event records
            var url0 = baseURI + '?offset=' + 0 * 1000;
            var url1 = baseURI + '?offset=' + 1 * 1000;

            var p0 = $http.get(url0);
            var p1 = $http.get(url1);

            return $q.all([p0, p1]).then(function (d){
                _events = d[0].data.resource.concat(d[1].data.resource);
                if ($rootScope.DEBUG_MODE) console.log("No. events: ", _events.length);
                return _events;            
            }, _queryFailed);  

        }

        function getevent(id, forceRefresh) {

            if (_isSelectedeventLoaded(id) && !forceRefresh) {

                return $q.when(_selectedevent);
            }

            var url = baseURI + '/' + id;

            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                return _selectedevent = result.data;
            }
        }
        

        function addevent(event) {

            var url = baseURI;
            var resource = [];

            resource.push(event);

            return $http.post(url, resource, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: resource
            }).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                //update local copy
                var eventx = event;
                eventx.id = result.data.resource[0].id; 
                _events.push(eventx);
                                
               	return result.data;
            }

        }

        function update(event_id, field, val) {
           
            //form match record
            var obj = {};
            obj.resource = [];

            var data = {};
            data.id = event_id;
            
            for (var i=0; i<field.length; i++){
                data[field[i]] = val[i];
            }
            //console.log("data", data);
            obj.resource.push(data);

            var url = baseURI;
            
            //update local copy
            //var idx = _events.map(function(x) {return x.id; }).indexOf(event_id);
            //var idx = $rootScope.A.indexOf(+event_id);
            var idx = _events.map(function(x) {return x.id; }).indexOf(event_id);  
            for (var i=0; i<field.length; i++){
               _events[idx][field[i]] = val[i];
            }                        
            
            return $http.patch(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                if ($rootScope.DEBUG_MODE) console.log("updating event succesful");
                return result.data;
            }
        }
        
        function flagEvent(event_id, flag) {
           
            //form match record
            var obj = {};
            obj.resource = [];

            var data = {};
            data.id = event_id;
            data.flag = flag

            //console.log("data", data);
            obj.resource.push(data);

            var url = baseURI;          
            
            return $http.patch(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                if ($rootScope.DEBUG_MODE) console.log(" event flagged succesful");
                return result.data;
            }
        }
        

        function deleteEvent(event_id) {
           
            //form match record
            var obj = {};
            obj.resource = [];

            var data = {};
            data.id = event_id;

            obj.resource.push(data);

            var url = baseURI + '/' + event_id;
            
            //update (delete event) local copy of events
            var i = _events.map(function(x) {return x.id; }).indexOf(event_id);
            if (i > -1) _events.splice(i,1);
            
            return $http.delete(url, data, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                if ($rootScope.DEBUG_MODE) console.log("Deleting event was succesful");
                return result.data;
            }
        }

        function _areeventsLoaded() {

            return _events.length > 0;
        }

        function _isSelectedeventLoaded(id) {

            return _selectedevent && _selectedevent.id == id;
        }

        function _queryFailed(error) {

            throw error;
        }

    }
})();