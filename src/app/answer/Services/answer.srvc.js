(function () {
    'use strict';

    angular
        .module('app')
        .factory('answer', answer);

    answer.$inject = ['$http', '$q', '$rootScope','catans','vrows','uaf'];

    function answer($http, $q, $rootScope,catans, vrows, uaf) {

        //Members
        var _answers = [];
        var _selectedAnswer;
        var baseURI = '/api/v2/mysql/_table/answers';

        var service = {
            getAnswers: getAnswers,
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
            // console.log("getAnswers..._areAnswersLoaded()", _areAnswersLoaded());

            if (_areAnswersLoaded() && !forceRefresh) {

                return $q.when(_answers);
            }
            
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
                _answers = d[0].data.resource.concat(d[1].data.resource, d[2].data.resource, d[3].data.resource, 
                d[4].data.resource, d[5].data.resource, d[6].data.resource, d[7].data.resource);
                if ($rootScope.DEBUG_MODE) console.log("No. Answers: ", _answers.length);
                return _answers;            
            }, _queryFailed);  

        }

        function getAnswer(id, forceRefresh) {

            if (_isSelectedAnswerLoaded(id) && !forceRefresh) {

                return $q.when(_selectedAnswer);
            }

            var url = baseURI + '/' + id;

            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                return _selectedAnswer = result.data;
            }
        }
        
        function getAnswerbyCustomer(customer_id) {
/*
            if (_isSelectedAnswerLoaded(id) && !forceRefresh) {

                return $q.when(_selectedAnswer);
            }
*/
            var url = baseURI + '/?filter=customer='+ customer_id;

            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                return result.data;
            }
        }

        function addAnswer(answer) {

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
                _answers.push(answerx);

                //update slug tag and featured image
                var slug = answerx.name.toLowerCase(); 
                slug = slug.replace(/ /g,'-');
                slug = slug + '-' + result.data.resource[0].id;
                updateAnswer(result.data.resource[0].id,['slug'],[slug]);
                
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
                                
                catans.postRec(answerx.id);
                vrows.postVrows4Answer(answerx);
                
                //uaf.post('addedAnswer',['answer','category'],[answerx.id, $rootScope.cCategory.id]); //user activity feed
                
                if ($rootScope.DEBUG_MODE) console.log("created catans for a new answer");
                if ($rootScope.DEBUG_MODE) console.log("result", result);
                return result.data;
            }

        }
        
        function addAnswer2(answer, category) {

            var url = baseURI;
            var resource = [];

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
                _answers.push(answerx);

                //update slug tag and featured image
                var slug = answerx.name.toLowerCase(); 
                slug = slug.replace(/ /g,'-');
                slug = slug + '-' + result.data.resource[0].id;
                updateAnswer(result.data.resource[0].id,['slug'],[slug]);
                
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
                    if (n == 0) catans.postRec2(answerx.id, category[n], false);
                    else catans.postRec2(answerx.id, category[n], true);    
                }
                
                vrows.postVrows4Answer(answerx);
                
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
                switch (field[i]){
                    case "name": data.name = val[i]; break;
                    case "addinfo": data.addinfo = val[i]; break;
                    case "cityarea": data.cityarea = val[i]; break;
                    case "location": data.location = val[i]; break;
                    case "image": data.imageurl = val[i]; break;
                    case "views": data.views = val[i]; break;
                    case "lat": data.lat = val[i]; break;
                    case "lng": data.lng = val[i]; break;
                    case "owner": data.owner = val[i]; break;
                    case "phone": data.phone = val[i]; break;
                    case "website": data.website = val[i]; break;
                    case "email": data.email = val[i]; break;
                    case "strhours": data.strhours = val[i]; break;
                    case "eventstr": data.eventstr = val[i]; break;
                    case "numcom": data.numcom = val[i]; break;
                    case "ranks": data.ranks = val[i]; break;
                    case "ispremium": data.ispremium = val[i]; break;
                    case "hasranks": data.hasranks = val[i]; break;
                    case "ranksqty": data.ranksqty = val[i]; break;
                    case "ig_image_urls": data.ig_image_urls = val[i]; break;
                    case "slug": data.slug = val[i]; break;
                    case "type": data.type = val[i]; break;
                    case "eventloc": data.eventloc = val[i]; break;
                    case "eventlocid": data.eventlocid = val[i]; break;
                }
            }
            //console.log("data", data);
            obj.resource.push(data);

            var url = baseURI;
            
            //update local copy
            //var idx = _answers.map(function(x) {return x.id; }).indexOf(answer_id);
            //var idx = $rootScope.A.indexOf(+answer_id);
            var idx = _answers.map(function(x) {return x.id; }).indexOf(answer_id);  
            for (var i=0; i<field.length; i++){
                switch (field[i]){
                    case "name": $rootScope.answers[idx].name = val[i]; break;
                    case "addinfo": $rootScope.answers[idx].addinfo = val[i]; break;
                    case "cityarea": $rootScope.answers[idx].cityarea = val[i]; break;
                    case "location": $rootScope.answers[idx].location = val[i]; break;
                    case "image": $rootScope.answers[idx].imageurl = val[i]; break;
                    case "views": $rootScope.answers[idx].views = val[i]; break;
                    case "lat": $rootScope.answers[idx].lat = val[i]; break;
                    case "lng": $rootScope.answers[idx].lng = val[i]; break;
                    case "owner": $rootScope.answers[idx].owner = val[i]; break;
                    case "phone": $rootScope.answers[idx].phone = val[i]; break;
                    case "website": $rootScope.answers[idx].website = val[i]; break;
                    case "email": $rootScope.answers[idx].email = val[i]; break;
                    case "strhours": $rootScope.answers[idx].strhours = val[i]; break;
                    case "eventstr": $rootScope.answers[idx].eventstr = val[i]; break;
                    case "numcom": $rootScope.answers[idx].numcom = val[i]; break;
                    case "ranks": $rootScope.answers[idx].ranks = val[i]; break;
                    case "ispremium": $rootScope.answers[idx].ispremium = val[i]; break;
                    case "hasranks": $rootScope.answers[idx].hasranks = val[i]; break;
                    case "ranksqty": $rootScope.answers[idx].ranksqty = val[i]; break;
                    case "slug": $rootScope.answers[idx].slug = val[i]; break;
                    case "type": $rootScope.answers[idx].type = val[i]; break;
                    case "eventloc": $rootScope.answers[idx].eventloc = val[i]; break;
                    case "eventlocid": $rootScope.answers[idx].eventlocid = val[i]; break;
                }
            }                        
            
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

                if ($rootScope.DEBUG_MODE) console.log("Deleting answer was succesful");
                return result.data;
            }
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