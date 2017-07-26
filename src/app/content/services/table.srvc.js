(function () {
    'use strict';

    angular
        .module('app')
        .factory('table', table);

    table.$inject = ['$http', '$q', '$rootScope','answer','$state', 'filter','uaf'];

    function table($http, $q, $rootScope, answer, $state, filter, uaf) {

        // Members
        var _tables = [];
        var baseURI = '/api/v2/mysql/_table/ranking';

        var service = {
            getTables: getTables,
            getTablesMain: getTablesMain,
            getTablesNonMain: getTablesNonMain,
            //getSingleTable: getSingleTable,
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

            if (_areTablesLoaded() && !forceRefresh) {

                return $q.when(_tables);
            }

            //var url = baseURI;
            //Get all match records
            var url0 = baseURI + '?offset=' + 0 * 1000;
            var url1 = baseURI + '?offset=' + 1 * 1000;
            var url2 = baseURI + '?offset=' + 2 * 1000;
            var url3 = baseURI + '?offset=' + 3 * 1000;
            

            var p0 = $http.get(url0);
            var p1 = $http.get(url1);
            var p2 = $http.get(url2);
            var p3 = $http.get(url3);
            

            return $q.all([p0, p1, p2, p3]).then(function (d){
                _tables = d[0].data.resource.concat(d[1].data.resource, d[2].data.resource, d[3].data.resource);
                if ($rootScope.DEBUG_MODE) console.log("tables length: ", _tables.length);
                return _tables;            
            }, _queryFailed);  
            //return $http.get(url).then(querySucceeded, _queryFailed);
            
            //function querySucceeded(d) {

                
                //return _tables = result.data.resource;
            //}          
        }

        function getTablesMain() {

            var url0 = baseURI + '/?filter=ismp=true';

            var p0 = $http.get(url0);
            
            return $q.all([p0]).then(function (d){
                _tables = d[0].data.resource;
                if ($rootScope.DEBUG_MODE) console.log("tables_main length: ", _tables.length);
                return _tables;            
            }, _queryFailed);  
                      
        }

        function getTablesNonMain() {
            
            //Get all match records
            var url0 = baseURI + '/?filter=ismp=false'+'&offset=' + 0 * 1000;
            var url1 = baseURI + '/?filter=ismp=false'+'&offset=' + 1 * 1000;
            var url2 = baseURI + '/?filter=ismp=false'+'&offset=' + 2 * 1000;
            var url3 = baseURI + '/?filter=ismp=false'+'&offset=' + 3 * 1000;
            
            
            var p0 = $http.get(url0);
            var p1 = $http.get(url1);
            var p2 = $http.get(url2);
            var p3 = $http.get(url3);
            

            return $q.all([p0, p1, p2, p3]).then(function (d){
                _tables = _tables.concat(d[0].data.resource, d[1].data.resource, d[2].data.resource, d[3].data.resource);
                if ($rootScope.DEBUG_MODE) console.log("tables length: ", _tables.length);
                return _tables;            
            }, _queryFailed);
                      
        }
/*
        function getSingleTable(id) {

            var url0 = baseURI + '/?filter=id=' + id;

            var p0 = $http.get(url0);
            
            return $q.all([p0]).then(function (d){
                
                _tables = d[0].data.resource;
                console.log("single table ", _tables);
                if ($rootScope.DEBUG_MODE) console.log("single table loaded: ", _tables.length);
                return _tables;            
            }, _queryFailed);  
                      
        }
*/

        function addTable(table) {
            
            //table.isatomic = true;

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
                                
                //Unwrap category & neighborhood
                var idx = $rootScope.categories.map(function(x) {return x.id; }).indexOf(tablex.cat);
                var catObj = $rootScope.categories[idx]; 
                var idx2 = $rootScope.locations.map(function(x) {return x.id; }).indexOf(tablex.nh);
                var nhObj = $rootScope.locations[idx2];

                var title = catObj.category.replace('@Nh',nhObj.nh_name);
                tablex.title = title;
                tablex.fimage = catObj.fimage;
                tablex.tags = catObj.tags;
                tablex.keywords = catObj.keywords;
                tablex.fc = catObj.fc;
                tablex.bc = catObj.bc;
                tablex.shade = catObj.shade;
                tablex.type = catObj.type;
                tablex.user = $rootScope.user.id;
                tablex.introtext = catObj.introtext;

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
                //var fimage = 'https://rankx.blob.core.windows.net/sandiego/featuredImages/' + slug + fext;
                update(result.data.resource[0].id,['slug'],[slug]);

                //Create user-activity feed record
                uaf.post('addedRank',['category'],[tablex.id]); //user activity feed

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
                uaf.post('addedCustomRank',['answer','category'],[$rootScope.canswer.id, tablex.id]); //user activity feed

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
            var idx = 0;
            for (var i = 0; i < $rootScope.content.length; i++) {
                if ($rootScope.content[i].id == id) {
                    idx = i;
                    break;
                }
            }
            for (var i = 0; i < field.length; i++) {
                $rootScope.content[idx][field[i]] = val[i];              
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

        function _areTablesLoaded() {

            return _tables.length > 0;
        }

        function _queryFailed(error) {

            throw error;
        }
    }
})();