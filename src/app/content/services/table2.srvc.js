(function () {
    'use strict';

    angular
        .module('app')
        .factory('table2', table2);

    table2.$inject = ['$http', '$q', '$rootScope','answer','$state', 'filter'];

    function table2($http, $q, $rootScope, answer, $state, filter) {

        // Members
        var _tables = [];
        var _fetchAnswersMem = [];
        $rootScope.customranks = _tables;
        var baseURI = '/api/v2/mysql/_table/customranks';

        var service = {
            getTables: getTables,
            getTablesX: getTablesX,   //get tables from answers  
            getTablesD: getTablesD,   //get tables for demo
            update: update,
            addTable: addTable,
            addTableforAnswer: addTableforAnswer,
            deleteTable: deleteTable,
            getMostPopularData: getMostPopularData
        };

        return service;
        function getMostPopularData(){
            // $rootScope.filterOptions.isCity
            $http.get(baseURI + '?order=views DESC&offset=0&limit=8&filter=ismp=1')
            .then(function(data){
                $rootScope.initalHomeData = data.data.resource;
                filter.saveInitalHomeData($rootScope.initalHomeData);
                $rootScope.$emit('initalHomeDataLoaded');
            });
            return true;
        }

        function getTables(forceRefresh) {

            //Get all match records
            var url0 = baseURI + '?offset=' + 0 * 1000;
            
            var p0 = $http.get(url0);
            

            return $q.all([p0]).then(function (d){
                var data = d[0].data.resource;
                _load (data);
                if ($rootScope.DEBUG_MODE) console.log("tables length: ", _tables.length);
                return _tables;            
            }, _queryFailed);  
        }

        function getTablesX(data) {

            var _datax = [];  //this is filtered array (ignore those ranks for which data already fetched)
            data.forEach(function(item){
                if (_fetchAnswersMem.indexOf(item.answer)<0){
                    _datax.push(item);
                    _fetchAnswersMem.push(item.answer);
                }
            });
            if (_datax.length == 0) return $q.when(false);

            var filterstr = '?filter=(';
            for (var i=0; i< _datax.length; i++){
                filterstr = filterstr + 'owner=' + _datax[i].answer+')OR(';
            }
            filterstr = filterstr.substring(0,filterstr.length-3);

            var url0 = baseURI + filterstr;
            
            var p0 = $http.get(url0);
            
            return $q.all([p0]).then(function (d){
                
                var _tablesx = d[0].data.resource;
                var map = _tables.map(function(x) {return x.id; });
                _tablesx.forEach(function(table){
                        if(map.indexOf(table.id) < 0)
                        _tables.push(table);
                });
                
                if ($rootScope.DEBUG_MODE) 
                    console.log("getTablesX 'custom ranks' ", _tables.length);
                return _tables;            
            }, _queryFailed);  
        }

        function getTablesD(data) {

            var _datax = [];  //this is filtered array (ignore those ranks for which data already fetched)
            data.forEach(function(item){
                if (_fetchAnswersMem.indexOf(item.category)<0){
                    _datax.push(item);
                    _fetchAnswersMem.push(item.category);
                }
            });

            if (_datax.length == 0) return $q.when(false);

            var filterstr = '?filter=(';
            for (var i=0; i< _datax.length; i++){
                filterstr = filterstr + 'id=' + _datax[i].category+')OR(';
            }
            filterstr = filterstr.substring(0,filterstr.length-3);

            var url0 = baseURI + filterstr;
            
            var p0 = $http.get(url0);
            
            return $q.all([p0]).then(function (d){
                
                
                var _tablesx = d[0].data.resource;
                var map = _tables.map(function(x) {return x.id; });
                _tablesx.forEach(function(table){
                        if(map.indexOf(table.id) < 0)
                        _tables.push(table);
                });
                
                if ($rootScope.DEBUG_MODE) console.log("getTablesD 'custom ranks' ", _tables.length);
                return _tables;            
            }, _queryFailed);  
        }

        function addTable(table) {
            
            table.isatomic = true;

            var url = baseURI;
            var resource = [];

            resource.push(table);

            return $http.post(url, resource, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: resource
            }).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                //update local copy
                var tablex = table;
                tablex.id = result.data.resource[0].id;
                _tables.push(tablex);

                //push to search String array
                var searchStr = tablex.tags + " " + tablex.title;
                $rootScope.searchStr.push(searchStr);

                //update slug tag and featured image
                var slug = tablex.title.toLowerCase(); 
                slug = slug.replace(/ /g,'-');
                slug = slug.replace('/','at');
                slug = slug.replace('?','');
                slug = slug + '-' + result.data.resource[0].id;
                //var fimage = 'https://rankx.blob.core.windows.net/sandiego/featuredImages/'+slug+'.jpg';
                update(result.data.resource[0].id,['slug'],[slug]);

                //Create user-activity feed record
                //uaf.post('addedRank',['category'],[tablex.id]); //user activity feed

                if ($rootScope.DEBUG_MODE) console.log("result", result);
                return result.data;
            }

        }

        function addTableforAnswer(table,colors,answerid){
            table.isatomic = true;

            var url = baseURI;
            var resource = [];

            resource.push(table);

            return $http.post(url, resource, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: resource
            }).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                //update local copy
                var tablex = table;
                tablex.id = result.data.resource[0].id;
                _tables.push(tablex);

                //push to search String array
                var searchStr = tablex.tags + " " + tablex.title;
                $rootScope.searchStr.push(searchStr);

                //update slug tag and featured image
                var slug = tablex.title.toLowerCase(); 
                slug = slug.replace(/ /g,'-');
                slug = slug.replace('/','at');
                slug = slug + '-' + result.data.resource[0].id;
                //var fimage = 'https://rankx.blob.core.windows.net/sandiego/featuredImages/'+slug+'.jpg';
                update(result.data.resource[0].id,['slug'],[slug]);

                //update answer
                var obj = {};
                obj.id = result.data.resource[0].id;
                obj.bc = colors[0];
                obj.fc = colors[1];
                var rankExists = false;
                var ranksStr = '';
                var ranks = [];
                //if there is already a rank
                if ($rootScope.canswer.ranks != undefined && $rootScope.canswer.ranks != null &&
                    $rootScope.canswer.ranks != '') {
                        //console.log("there is already a rank");
                        ranksStr = $rootScope.canswer.ranks;
                        //console.log("this is the existing string - ", ranksStr);
                        ranks = JSON.parse(ranksStr);
                        //console.log("ranks", ranks);
                        ranks.push(obj);
                        ranksStr = JSON.stringify(ranks);
                        //console.log("this is the new string - ", ranksStr);
                        answer.updateAnswer(answerid, ['ranks'], [ranksStr]);
                }
                //if this is rank #1
                else{
                    ranksStr = '[' + JSON.stringify(obj) +']';
                    //console.log("this is the new string - ", ranksStr);
                    answer.updateAnswer(answerid, ['ranks'], [ranksStr]);
                }

                //Create user-activity feed record
                //uaf.post('addedCustomRank',['answer','category'],[$rootScope.canswer.id, tablex.id]); //user activity feed

                //$state.go('answerDetail',{index: answerid});
                if ($rootScope.DEBUG_MODE) console.log("result", result);
                return result.data;
            }
        }

        function deleteTable(table_id) {
           
            //form match record
            var obj = {};
            obj.resource = [];

            var data = {};
            data.id = table_id;

            obj.resource.push(data);

            var url = baseURI + '/' + table_id;
            
            //update (delete answer) local copy of answers
            var i = _tables.map(function (x) { return x.id; }).indexOf(table_id);
            if (i > -1) _tables.splice(i, 1);

            return $http.delete(url, data, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                if ($rootScope.DEBUG_MODE) console.log("Deleting table was succesful");
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
               data[field[i]] = val[i];                 
            }
            //console.log("data", data);
            obj.resource.push(data);

            var url = baseURI;
            
            //update local copy
            var idx = _tables.map(function(x) {return x.id; }).indexOf(id);
            for (var i = 0; i < field.length; i++) {
                _tables[idx][field[i]] = val[i];              
            }

            return $http.patch(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                if ($rootScope.DEBUG_MODE) console.log("updating ranking record succesful");
                return result.data;
            }
        }

        function _load(data){
            _tables.length = 0;
            data.forEach(function(x){
                _tables.push(x);
            });
        }

        function _areTablesLoaded() {

            return _tables.length > 0;
        }

        function _queryFailed(error) {

            throw error;
        }
    }
})();