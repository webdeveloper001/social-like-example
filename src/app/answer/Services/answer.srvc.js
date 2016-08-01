(function () {
    'use strict';

    angular
        .module('app')
        .factory('answer', answer);

    answer.$inject = ['$http', '$q', '$rootScope','catans'];

    function answer($http, $q, $rootScope,catans) {

        //Members
        var _answers = [];
        var _selectedAnswer;
        var baseURI = '/api/v2/mysql/_table/answers';

        var service = {
            getAnswers: getAnswers,
            getAnswer: getAnswer,
            addAnswer: addAnswer,
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

            var p0 = $http.get(url0);
            var p1 = $http.get(url1);

            return $q.all([p0, p1]).then(function (d){
                _answers = d[0].data.resource.concat(d[1].data.resource);
                console.log("No. Answers: ", _answers.length);
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
                                
                catans.postRec(answerx.id);
                
                console.log("result", result);
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
                }
            }
            //console.log("data", data);
            obj.resource.push(data);

            var url = baseURI;
            
            //update local copy
            var idx = $rootScope.A.indexOf(+answer_id);            
            for (var i=0; i<field.length; i++){
                switch (field[i]){
                    case "name": $rootScope.canswers[idx].name = val[i]; break;
                    case "addinfo": $rootScope.canswers[idx].addinfo = val[i]; break;
                    case "cityarea": $rootScope.canswers[idx].cityarea = val[i]; break;
                    case "location": $rootScope.canswers[idx].location = val[i]; break;
                    case "image": $rootScope.canswers[idx].imageurl = val[i]; break;
                    case "views": $rootScope.canswers[idx].views = val[i]; break;
                }
            }                        
            
            return $http.patch(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                console.log("updating answer succesful");
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

                console.log(" answer flagged succesful");
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

                console.log("Deleting answer was succesful");
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