(function () {
    'use strict';

    angular
        .module('app')
        .factory('cblock', cblock);

    cblock.$inject = ['$http', '$q', '$rootScope'];

    function cblock($http, $q, $rootScope) {

        // Members
        var _cblocks = [];
        var baseURI = '/api/v2/mysql/_table/cblocks';

        var service = {
            getcblocks: getcblocks,
            getcblocksmain: getcblocksmain,
			getcblocksall: getcblocksall,
            addcblock: addcblock,
            update: update,
            deleteRec: deleteRec
        };

        return service;

        function getcblocks(forceRefresh) {

            if (_arecblocksLoaded() && !forceRefresh) {

                return $q.when(_cblocks);
            }

            //var url = baseURI;
            //Get all match records
            var url0 = baseURI + '?offset=' + 0 * 1000;
           //var url0 = baseURI + '/?filter=scope=city';

            var p0 = $http.get(url0);
            
            return $q.all([p0]).then(function (d){
                _cblocks = d[0].data.resource;
                if ($rootScope.DEBUG_MODE) console.log("No. C-Blocks: ", _cblocks.length);
                return _cblocks;            
            }, _queryFailed);  

        }

        function getcblocksmain() {

            //Get all match records
            var url0 = baseURI + '/?filter=ismp=true';
           //var url0 = baseURI + '/?filter=scope=city';

            var p0 = $http.get(url0);
            
            return $q.all([p0]).then(function (d){
                _cblocks = d[0].data.resource;
                if ($rootScope.DEBUG_MODE) console.log("No. C-Blocks: ", _cblocks.length);
                return _cblocks;            
            }, _queryFailed);  

        }

        function getcblocksall() {

            //Get all match records
            var url0 = baseURI + '/?filter=ismp=false';
           //var url0 = baseURI + '/?filter=scope=city';

            var p0 = $http.get(url0);
            
            return $q.all([p0]).then(function (d){
                _cblocks = _cblocks.concat(d[0].data.resource);
                if ($rootScope.DEBUG_MODE) console.log("No. C-Blocks: ", _cblocks.length);
                return _cblocks;            
            }, _queryFailed);  

        }

        function addcblock(cblock) {
            
            var url = baseURI;
            var resource = [];

            resource.push(cblock);

            return $http.post(url, resource, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: resource
            }).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                //update local copy
                var cblockx = cblock;
                cblockx.id = result.data.resource[0].id;
                _cblocks.push(cblockx);

                console.log("adding cblock succesful", result);
                return result.data;
            }

        }

        
        function update(id, field, val) {
           
            //form match record
            var obj = {};
            obj.resource = [];

            var data = {};
            data.id = id;

            for (var i = 0; i < field.length; i++) {
                switch (field[i]) {
                    case "catstr": data.catstr = val[i]; break;
                    case "ismp": data.ismp = val[i]; break;                                          
                }
            }
            //console.log("data", data);
            obj.resource.push(data);

            var url = baseURI;
            
            //update local copy
            var idx = _cblocks.map(function(x) {return x.id; }).indexOf(id);  
            for (var i = 0; i < field.length; i++) {
                switch (field[i]) {
                    case "catstr": _cblocks[idx].catstr = val[i]; break;
                    case "ismp": _cblocks[idx].ismp = val[i]; break;                                    
                }
            }

            return $http.patch(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                console.log("updating cblocks succesful");
                return result.data;
            }
        }
        
        function deleteRec(block_id) {
           
            //form match record
            var obj = {};
            obj.resource = [];

            var data = {};
            data.id = block_id;

            obj.resource.push(data);

            var url = baseURI + '/' + block_id;
            
            //update (delete answer) local copy of answers
            var i = _cblocks.map(function (x) { return x.id; }).indexOf(block_id);
            if (i > -1) _cblocks.splice(i, 1);

            return $http.delete(url, data, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                console.log("Deleting cblock was succesful");
                return result.data;
            }
        }

        function _arecblocksLoaded() {

            return _cblocks.length > 0;
        }

        function _queryFailed(error) {

            throw error;
        }
    }
})();