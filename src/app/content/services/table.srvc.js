(function () {
    'use strict';

    angular
        .module('app')
        .factory('table', table);

    table.$inject = ['$http', '$q', '$rootScope','answer','$state', 'filter','uaf','$window','catans','staticpages'];

    function table($http, $q, $rootScope, answer, $state, filter, uaf, $window, catans, staticpages) {

        // Members
        var _tables = [];
        $rootScope.content = _tables;

        var baseURI = '/api/v2/mysql/_table/ranking';

        var service = {
            getTables: getTables,
            getSingleTable: getSingleTable,
            update: update,
            addTable: addTable,
            deleteTable: deleteTable,
            getTablesX: getTablesX,
            getTablesL: getTablesL,
            getInitialHomeData: getInitialHomeData,
            ghostTablesWithAnswer: ghostTablesWithAnswer,
            storeInitialHomeData: storeInitialHomeData 
        };

        return service;
        
        function getInitialHomeData(data){

            var ranksFromStorage = $window.localStorage.getItem("Ranks-HomeData");
            if (ranksFromStorage) {
                 _load(JSON.parse(ranksFromStorage));
                 return $q.when(true);
            }

            var filterstr = '?filter=(';
            for (var i=0; i< data.length; i++){
                filterstr = filterstr + 'id=' + data[i]+')OR(';
            }
            filterstr = filterstr.substring(0,filterstr.length-3);

            var url0 = baseURI + filterstr;
            var p0 = $http.get(url0);

            return $q.all([p0]).then(function (d){
                var datax = d[0].data.resource;

                if (_tables.length == 0) _load(datax); 

                if ($rootScope.DEBUG_MODE) console.log("tables L length: ", _tables.length);
                //$window.localStorage.setItem("Ranks-HomeData", JSON.stringify(datax));
                return _tables;            
            }, _queryFailed);  

        }

        function getTablesX(scope) {

            //for performance request only following fields:
            var fields = '';
            fields += 'id,type,tags,keywords,question,image1url,image2url,image3url,catstr,owner,slug,views,answers,numcom,scope,isatomic,ismp,cat,nh';
            //_tables = [];
            var url0 = baseURI + '?offset=' + 0 * 1000 + '&filter=scope='+scope + '&fields=' + fields;
            var url1 = baseURI + '?offset=' + 1 * 1000 + '&filter=scope='+scope + '&fields=' + fields;
            var url2 = baseURI + '?offset=' + 2 * 1000 + '&filter=scope='+scope + '&fields=' + fields;
            var url3 = baseURI + '?offset=' + 3 * 1000 + '&filter=scope='+scope + '&fields=' + fields;
            
            var p0 = $http.get(url0);
            var p1 = $http.get(url1);
            var p2 = $http.get(url2);
            var p3 = $http.get(url3);
            
            return $q.all([p0,p1,p2,p3]).then(function (d){
                var data = d[0].data.resource.concat(d[1].data.resource,d[2].data.resource,d[3].data.resource);
                _load (data);
                if ($rootScope.DEBUG_MODE) console.log("tables length: ", _tables.length);
                return _tables;            
            }, _queryFailed);  
        }

        function getTablesL(data) {

            var filterstr = '?filter=(';
            for (var i=0; i< data.length; i++){
                filterstr = filterstr + 'id=' + data[i].category+')OR(';
            }
            filterstr = filterstr.substring(0,filterstr.length-3);
            
            var url0 = baseURI + filterstr;
            
            var p0 = $http.get(url0);
            
            return $q.all([p0]).then(function (d){
                var data = d[0].data.resource;
                _load(data);
                if ($rootScope.DEBUG_MODE) console.log("tables L length: ", _tables.length);
                return _tables;            
            }, _queryFailed);  
        }

        function getTables(forceRefresh) {

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
                var data = d[0].data.resource.concat(d[1].data.resource, d[2].data.resource, d[3].data.resource);
                _load(data);
                if ($rootScope.DEBUG_MODE) console.log("tables length: ", _tables.length);
                return _tables;            
            }, _queryFailed);  
             
        }

        function getSingleTable(id) {

            var url0 = baseURI + '/?filter=id=' + id;

            var p0 = $http.get(url0);
            
            return $q.all([p0]).then(function (d){
                
                var data = d[0].data.resource;
                _load(data);
                if ($rootScope.DEBUG_MODE) console.log("single table loaded: ", data);
                return _tables;            
            }, _queryFailed);  
                      
        }

        function addTable(table) {
            
            table.scope = $rootScope.SCOPE;

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
                                
                //push to search String array
                var searchStr = tablex.tags + " " + tablex.title;
                $rootScope.searchStr.push(searchStr);

                //update slug tag and featured image
                var slug = tablex.title.toLowerCase(); 
                slug = slug.replace(/ /g,'-');
                slug = slug.replace('/','at');
                slug = slug.replace('?','');
                slug = slug + '-' + result.data.resource[0].id;
                tablex.slug = slug;

                _tables.push(tablex);
                //var fimage = 'https://rankx.blob.core.windows.net/sandiego/featuredImages/' + slug + fext;
                update(result.data.resource[0].id,['slug'],[slug]);

                //create static page for this rank
                staticpages.createPageRank(tablex);

                //Create user-activity feed record
                uaf.post('addedRank',['category'],[tablex.id]); //user activity feed

                if ($rootScope.DEBUG_MODE) console.log("result", result);
                return result.data.resource[0].id;
            }

        }

        function ghostTablesWithAnswer(ranks,ans) {
           console.log("addGhostTableWithAnswer ", ranks, ans);
           var tids = []; //table ids
           var p = []; //promises array
           var granks = [];
           var granksids = [];
           p.push(answer.addAnswer(ans,[]));
           
           ranks.forEach(function(rank){
               if (rank.isghost) {
                   granks.push(rank);
                   p.push(addTable(rank));
               }
               else tids.push(rank.id); 
           });
           
           return $q.all(p).then(function (d) {
                var ansid = d[0].resource[0].id;
                console.log("answer id - ", ansid);
                for (var i=1; i < d.length; i++) {
                    tids.push(d[i]); //push ids of newly created ranks (from ghosts)
                    granksids.push(d[i]);
                }
                _updateCatstr(granks,granksids);
                console.log('tids - ', tids);                
                tids.forEach(function(t){
                    catans.postRec2(ansid, t);
                });
                return d;
            });
   
        }

        function _updateCatstr(ranks,ids){
            //update catstr from parent table if applicable
            console.log("@ _updateCatstr ", ranks, ids);
                var catvals = [];
                var catstr = '';
                for (var n = 0; n < ranks.length; n++) {
                    catvals = [];
                    catstr = '';
                    _tables.forEach(function (t) {
                        if (t.cat == ranks[n].cat && t.nh == 1) {
                            console.log("Found parent rank");
                            catvals = t.catstr.split(':').map(Number);
                            catvals.push(ids[n]);
                            catstr = '';
                            for (var i = 0; i < catvals.length; i++) {
                                catstr = catstr + ':' + catvals[i];
                            }
                            catstr = catstr.substring(1);
                            console.log("updated catstr for table - ", t.id);
                            update(t.id,['catstr'],[catstr]);
                        }
                    })
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

                //delete static page for this rank
                var filename = 'rank' + table_id + '.html';
                var data = {};
                data.filename = filename;
                staticpages.removeFile(data);

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
                $rootScope.updated_rank_id = result.data.resource[0].id
                if ($rootScope.DEBUG_MODE) console.log("updating ranking record succesful");
                return result.data;
            }
        }

        function storeInitialHomeData(rids){
            
            var data = [];
            var idx = 0;
            rids.forEach(function(i){
                 idx = _tables.map(function (x) { return x.id; }).indexOf(i);
                 if (idx > -1) data.push(_tables[idx]);
            });
            $window.localStorage.setItem("Ranks-HomeData", JSON.stringify(data));
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