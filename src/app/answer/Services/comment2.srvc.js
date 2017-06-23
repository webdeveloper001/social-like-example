(function () {
    'use strict';

    angular
        .module('app')
        .factory('comment2', comment2);

    comment2.$inject = ['$http', '$q', '$rootScope','uaf'];

    function comment2($http, $q, $rootScope, uaf) {

        //Members
        var _comments = [];
        var baseURI = '/api/v2/mysql/_table/comments2';

        var service = {
            getcomments: getcomments,
            getcommentsbyanswer: getcommentsbyanswer,
            addcomment: addcomment,
            updatecomment: updatecomment,
            deletecomment: deletecomment,
            deletecommentsbyuser: deletecommentsbyuser
        };

        return service;

        function getcomments(forceRefresh) {
            // console.log("getAnswers..._areAnswersLoaded()", _areAnswersLoaded());

            if (_arecommentsLoaded() && !forceRefresh) {

                 return $q.when(_comments);
            }

            var url = baseURI +'/?filter=answer='+ $rootScope.canswer.id;

            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                return _comments = result.data.resource;
            }

        }

        function getcommentsbyanswer(answer) {
            
            var url = baseURI +'/?filter=answer='+ answer;

            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                return _comments = result.data.resource;
            }

        }

       function addcomment(newcomment) {

            var url = baseURI;
            var resource = [];

            resource.push(newcomment);

            return $http.post(url, resource, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: resource
            }).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                //update local copy
                var newcommentx = newcomment;
                newcommentx.id = result.data.resource[0].id; 
                //_comments.push(newcommentx);
                
                uaf.post('commentA',['answer', 'comment'],[newcomment.answer, newcomment.body]); //user activity feed 
                //$rootScope.ccomments.push(newcommentx);

                if ($rootScope.DEBUG_MODE) console.log("Adding new comment succesful", result);
                return result.data;
            }

        }

        function updatecomment(comment_id, upV, downV) {
           
            //form match record
            var obj = {};
            obj.resource = [];

            var data = {};
            data.id = comment_id;
            data.upV = upV;
            data.downV = downV;

            obj.resource.push(data);

            var url = baseURI;

            return $http.patch(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                if ($rootScope.DEBUG_MODE) console.log("updating comment vote counts succesful");
                return result.data;
            }
        }

        function deletecomment(comment_id) {
           
            //form match record
            var obj = {};
            obj.resource = [];

            var data = {};
            data.id = comment_id;

            obj.resource.push(data);

            var url = baseURI + '/' + comment_id;
            
            //update (delete answer) local copy of answers
            var i = _comments.map(function(x) {return x.id; }).indexOf(comment_id);
            if (i > -1) _comments.splice(i,1);
            
            
            return $http.delete(url, data, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                if ($rootScope.DEBUG_MODE) console.log("Deleting comment was succesful");
                return result.data;
            }
        }
        
        function deletecommentsbyuser(user_id) {
            
            //delete records from local copy
            for (var i = 0; i < _comments.length; i++) {
                if (_comments[i].user == user_id) {
                    _comments.splice(i, 1);
                }
            }

            var url = baseURI + '?filter=user=' + user_id;

            return $http.delete(url).then(querySucceeded, _queryFailed);
            
            function querySucceeded(result) {

                if ($rootScope.DEBUG_MODE) console.log("Deleting comments for answer was succesful");
                return result.data;
            }
        }
        

        function _arecommentsLoaded() {

            //return _comments.length > 0;
            return false;
        }

        function _queryFailed(error) {

            throw error;
        }

    }
})();