(function () {
    'use strict';

    angular
        .module('app')
        .factory('answer', answer);

    answer.$inject = ['$http', '$q', '$rootScope','catans','vrows','uaf','staticpages'];

    function answer($http, $q, $rootScope,catans, vrows, uaf, staticpages) {

        //Members
        var _answers = [];
        var _fetchAnswersMem = [];
        $rootScope.answers = _answers;

        var _selectedAnswer;
        var baseURI = '/api/v2/mysql/_table/answers';

        var service = {
            getAnswers: getAnswers,
            getAnswersX: getAnswersX,
            getAnswersL: getAnswersL,
            getAnswer: getAnswer,
            addAnswer: addAnswer,
            addAnswer2: addAnswer2,
            updateAnswer: updateAnswer,
            deleteAnswer: deleteAnswer,
            flagAnswer: flagAnswer,
            getAnswerbyCustomer:  getAnswerbyCustomer           
        };

        return service;
        

        function getAnswers(forceRefresh) {
            
            //Get all answer records
            var url0 = baseURI + '?offset=' + 0 * 1000;
            var url1 = baseURI + '?offset=' + 1 * 1000;
            var url2 = baseURI + '?offset=' + 2 * 1000;
            var url3 = baseURI + '?offset=' + 3 * 1000;
            var url4 = baseURI + '?offset=' + 4 * 1000;
            var url5 = baseURI + '?offset=' + 5 * 1000;
            var url6 = baseURI + '?offset=' + 6 * 1000;
            var url7 = baseURI + '?offset=' + 7 * 1000;


            var p0 = $http.get(url0);
            var p1 = $http.get(url1);
            var p2 = $http.get(url2);
            var p3 = $http.get(url3);
            var p4 = $http.get(url4);
            var p5 = $http.get(url5);
            var p6 = $http.get(url6);
            var p7 = $http.get(url7);

            return $q.all([p0, p1, p2, p3, p4, p5, p6, p7]).then(function (d){
                var data = d[0].data.resource.concat(d[1].data.resource, d[2].data.resource, d[3].data.resource, 
                d[4].data.resource, d[5].data.resource, d[6].data.resource, d[7].data.resource);
                _load (data);
                if ($rootScope.DEBUG_MODE) console.log("No. Answers: ", _answers.length);
                return _answers;            
            }, _queryFailed);  

        }

        function getAnswersX(scope) {
            
            //Get all answer records
            var url0 = baseURI + '?offset=' + 0 * 1000 + '&filter=scope='+scope;
            var url1 = baseURI + '?offset=' + 1 * 1000 + '&filter=scope='+scope;
            var url2 = baseURI + '?offset=' + 2 * 1000 + '&filter=scope='+scope;
            var url3 = baseURI + '?offset=' + 3 * 1000 + '&filter=scope='+scope;
            var url4 = baseURI + '?offset=' + 4 * 1000 + '&filter=scope='+scope;
            var url5 = baseURI + '?offset=' + 5 * 1000 + '&filter=scope='+scope;
            var url6 = baseURI + '?offset=' + 6 * 1000 + '&filter=scope='+scope;
            var url7 = baseURI + '?offset=' + 7 * 1000 + '&filter=scope='+scope;


            var p0 = $http.get(url0);
            var p1 = $http.get(url1);
            var p2 = $http.get(url2);
            var p3 = $http.get(url3);
            var p4 = $http.get(url4);
            var p5 = $http.get(url5);
            var p6 = $http.get(url6);
            var p7 = $http.get(url7);

            return $q.all([p0, p1, p2, p3, p4, p5, p6, p7]).then(function (d){
                var data = d[0].data.resource.concat(d[1].data.resource, d[2].data.resource, d[3].data.resource, 
                d[4].data.resource, d[5].data.resource, d[6].data.resource, d[7].data.resource);
                _load (data);
                if ($rootScope.DEBUG_MODE) console.log("No. Answers: ", _answers.length);
                return _answers;            
            }, _queryFailed);  

        }

        function getAnswersL(data) {

            var _datax = [];  //this is filtered array (ignore those ranks for which catans already fetched)
            data.forEach(function(item){
                if (_fetchAnswersMem.indexOf(item.answer)<0){
                     _datax.push(item);
                     _fetchAnswersMem.push(item.answer);
                }
            });
            //_datax = [];
            if (_datax.length == 0) return $q.when(false);
            
            var filterstr = '?filter=(';
            for (var i=0; i< _datax.length; i++){
                filterstr = filterstr + 'id=' + _datax[i].answer+')OR(';
            }
            filterstr = filterstr.substring(0,filterstr.length-3);
            //Get all answer records
            var url0 = baseURI + filterstr;
            
            var p0 = $http.get(url0);
            
            return $q.all([p0]).then(function (d){
                
                var _answersx = d[0].data.resource;
                var map = _answers.map(function(x) {return x.id; });
                
                _answersx.forEach(function(answer){
                        if(map.indexOf(answer.id) < 0)
                        _answers.push(answer);
                });
                
                if ($rootScope.DEBUG_MODE) console.log("answers L loaded ", _answersx); 
                return _answers;            
            }, _queryFailed);  

        }

        function getAnswer(id) {

            var url0 = baseURI + '/?filter=id=' + id;

            var p0 = $http.get(url0);
            
            return $q.all([p0]).then(function (d){
                var _answer = d[0].data.resource[0];
                
                var map = _answers.map(function(x) {return x.id; });
                if(map.indexOf(_answer.id) < 0) _answers.push(_answer);
                
                if ($rootScope.DEBUG_MODE) console.log("single answer loaded: ", _answer);
                return _answer;
            });
            
        }
        
        function getAnswerbyCustomer(customer_id) {

            var url = baseURI + '/?filter=customer='+ customer_id;

            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                return result.data;
            }
        }

        function addAnswer(answer, ranks) {

            answer.scope = $rootScope.SCOPE;
            
            var url = baseURI;
            var resource = [];

            //the isprivate flag is to distinghish answers that are for custom ranks
            if ($rootScope.cCategory.owner != undefined && $rootScope.cCategory.owner != 0 ) answer.isprivate = true;
            else answer.isprivate = false;
            
            resource.push(answer);
            
            return $http.post(url, resource, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: resource
            }).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                //update local copy
                var answerx = answer;
                answerx.id = result.data.resource[0].id; 
                
                //update slug tag and featured image
                var slug = answerx.name.toLowerCase(); 
                slug = slug.replace(/ /g,'-');
                slug = slug.replace('/','at');
                slug = slug + '-' + result.data.resource[0].id;
                answerx.slug = slug;
                
                _answers.push(answerx);

                updateAnswer(result.data.resource[0].id,['slug'],[slug]);
                staticpages.createPageAnswer(answerx);
                
                //Update current establishment and person names for typeahead
                if (answerx.type == 'Establishment') {
                    $rootScope.estNames.push(answerx.name);
                    $rootScope.estAnswers.push(answerx);
                }
                if (answerx.type == 'Person') {
                    $rootScope.pplNames.push(answerx.name);
                    $rootScope.pplAnswers.push(answerx);
                }
                if (answerx.type == 'Place') {
                    $rootScope.plaNames.push(answerx.name);
                    $rootScope.plaAnswers.push(answerx);
                }
                                
                for (var i=0; i<ranks.length; i++){
                    catans.postRec2(answerx.id, ranks[i].id);
                }
                //vrows.postVrows4Answer(answerx);
                
                //uaf.post('addedAnswer',['answer','category'],[answerx.id, $rootScope.cCategory.id]); //user activity feed
                
                if ($rootScope.DEBUG_MODE) console.log("created catans for a new answer");
                if ($rootScope.DEBUG_MODE) console.log("result", result);
                return result.data;
            }

        }
        
        function addAnswer2(answer, category) {

            answer.scope = $rootScope.SCOPE;

            var url = baseURI;
            var resource = [];

            answer.user = $rootScope.user.id;

            //the isprivate flag is to distinghish answers that are for custom ranks
            if (category.owner != undefined && category.owner != 0 ) answer.isprivate = true;
            else answer.isprivate = false;

            resource.push(answer);

            return $http.post(url, resource, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: resource
            }).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                //update local copy
                var answerx = answer;
                answerx.id = result.data.resource[0].id; 
                
                //update slug tag and featured image
                var slug = answerx.name.toLowerCase(); 
                slug = slug.replace(/ /g,'-');
                slug = slug.replace('/','at');
                slug = slug + '-' + result.data.resource[0].id;
                answerx.slug = slug;

                _answers.push(answerx);
                updateAnswer(result.data.resource[0].id,['slug'],[slug]);

                staticpages.createPageAnswer(answerx);
                
                //Update current establishment and person names for typeahead
                if (answerx.type == 'Establishment') {
                    $rootScope.estNames.push(answerx.name);
                    $rootScope.estAnswers.push(answerx);
                }
                if (answerx.type == 'Person') {
                    $rootScope.pplNames.push(answerx.name);
                    $rootScope.pplAnswers.push(answerx);
                }
                if (answerx.type == 'Place') {
                    $rootScope.plaNames.push(answerx.name);
                    $rootScope.plaAnswers.push(answerx);
                }
                
                //uaf.post('addedAnswer',['answer','category'],[answerx.id, category[0]]); //user activity feed
                                
                for (var n=0; n<category.length; n++){
                    if (n == 0) catans.postRec2(answerx.id, category[n]);
                    else catans.postRec2(answerx.id, category[n]);    
                }
                
                //vrows.postVrows4Answer(answerx);
                
                if ($rootScope.DEBUG_MODE) console.log('created '+ category.length + 'catans records for the new answer');
                if ($rootScope.DEBUG_MODE) console.log("result", result);
                return result.data;
            }

        }

        function updateAnswer(answer_id, field, val) {
           
            //form match record
            var obj = {};
            obj.resource = [];

            var data = {};
            data.id = answer_id;
            
            for (var i=0; i<field.length; i++){
               data[field[i]] = val[i];
            }
            //console.log("data", data);
            obj.resource.push(data);

            var url = baseURI;
            
            //update local copy
            var idx = _answers.map(function(x) {return x.id; }).indexOf(answer_id);  
            for (var i=0; i<field.length; i++){
                _answers[idx][field[i]] = val[i];
            }
            
            //determine if necessary to update static file
            var updateStaticFile = false;
            for (var i = 0; i < field.length; i++) {
                if (field[i] == 'name' || (field[i] == 'slug' && field.length > 1) || 
                    field[i] == 'imageurl' || field[i] == 'addinfo'){
                        updateStaticFile = true;
                        break;
                    }               
            }
            if (updateStaticFile) staticpages.createPageAnswer(_answers[idx]);
            
            return $http.patch(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {
                
                if (field[0] == 'owner') uaf.post('binded',['answer'],[answer_id]); //user activity feed 

                if ($rootScope.DEBUG_MODE) console.log("updating answer succesful");
                return result.data;
            }
        }
        
        function flagAnswer(answer_id, flag) {
           
            //form match record
            var obj = {};
            obj.resource = [];

            var data = {};
            data.id = answer_id;
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

                if ($rootScope.DEBUG_MODE) console.log(" answer flagged succesful");
                return result.data;
            }
        }
        

        function deleteAnswer(answer_id) {
           
            //form match record
            var obj = {};
            obj.resource = [];

            var data = {};
            data.id = answer_id;

            obj.resource.push(data);

            var url = baseURI + '/' + answer_id;
            
            //update (delete answer) local copy of answers
            var i = _answers.map(function(x) {return x.id; }).indexOf(answer_id);
            if (i > -1) _answers.splice(i,1);
            
            return $http.delete(url, data, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                //delete static page for this answer
                var filename = 'answer' + answer_id + '.html';
                var data = {};
                data.filename = filename;
                staticpages.removeFile(data);

                if ($rootScope.DEBUG_MODE) console.log("Deleting answer was succesful");
                return result.data;
            }
        }

        function _load(data){
            _answers.length = 0;
            _fetchAnswersMem.length = 0;
            data.forEach(function(x){
                _answers.push(x);
                _fetchAnswersMem.push(x.id);
            });        
        }

        function _areAnswersLoaded() {

            return _answers.length > 0;
        }

        function _isSelectedAnswerLoaded(id) {

            return _selectedAnswer && _selectedAnswer.id == id;
        }

        function _queryFailed(error) {

            throw error;
        }

    }
})();