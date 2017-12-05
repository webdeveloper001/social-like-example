(function () {
    'use strict';

    angular
        .module('app')
        .service('userpts', userpts);

    userpts.$inject = ['$http', '$rootScope', '$q', 'users'];

    function userpts($http, $rootScope, $q, users) {

        //Members
        var action_points = [];
        
        var baseURI = "/api/v2/mysql/_table/";

        var service = {
            addrec: addrec,
            getRecsByUser: getRecsByUser,
            deleterec: deleterec,
            getActionPoints: getActionPoints,
            getUserLevels: getUserLevels,
            updatePointsForShow: updatePointsForShow,
        };

        getActionPoints();
        
        return service;

        function getActionPoint(action) {
            var baseURI = "/api/v2/mysql/_table/actionpoints";

            var url = baseURI + "/?filter=action=" + action;
            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {
                return result.data.resource;
            }
        }

        function addrec(uaf) {
            var baseURI = "/api/v2/mysql/_table/userpoints";
            var resource = [];

            var userpoint1;
            var userpoint2;

            var action = getActionFromUaf(uaf.action);  
            userpoint1 = {
                userid: uaf.userid,
                uaf: uaf.id,
                action: action
            }

            resource.push(userpoint1);
            var action1 = resource[0].action;
            
            $q.all([getActionPoint(action1)]).then(function(result){
                resource[0].pts = result[0][0].pts;
                users.updateUser(resource[0].userid, resource[0].pts);
            })

            $q.all([getCatanFromUaf(uaf), getVrowFromUaf(uaf)]).then(function(data) {
                var catan = data[0];
                var vrow = data[1];
                switch (uaf.action) {
                    case "upVoted":
                        action = "userVoteUpAnswerYouAdded";
                        userpoint2 = {
                            userid: catan.user,
                            uaf: uaf.id,
                            action: action
                        }
                        resource.push(userpoint2);
                        break;
                    case "downVoted":
                        action = "userVoteDownAnswerYouAdded";
                        userpoint2 = {
                            userid: catan.user,
                            uaf: uaf.id,
                            action: action
                        }
                        resource.push(userpoint2);
                        break;
                    case "upVotedVrow":
                        action = "userVoteUpYourOpinion";
                        userpoint2 = {
                            userid: vrow.user,
                            uaf: uaf.id,
                            action: action
                        }                     
                        resource.push(userpoint2);
                        break;
                    case "downVotedVrow":
                        action = "userVoteDownYourOpinion";
                        userpoint2 = {
                            userid: vrow.user,
                            uaf: uaf.id,
                            action: action
                        }                     
                        resource.push(userpoint2);
                        break;
                }
                var action2 = resource[1] ? resource[1].action : "undefined";

                $q.all([getActionPoint(action2)]).then(function(result) {
                    if (result[0][0]) {
                        resource[1].pts = result[0][0].pts;
                    }
                    if (resource[1]) users.updateUser(resource[1].userid, resource[1].pts);
                    var url = baseURI;
                    return $http.post(url, resource, {
                        headers: {
                            "Content-Type": "multipart/form-data"
                        },
                        body: resource
                    }).then(querySucceeded, _queryFailed)                    
                });

            })

            function querySucceeded(result) {
                // var url = "/api/v2/mysql/_table/actionpoints/?filter=action=" + uaf.action
                // $http.get(url).then(function(result) {
                //     if (result.data.resource[0]) {
                //         var pts = result.data.resource[0].pts;
                //         return users.updateUser(uaf.userid, pts)
                //     }
                // }, _queryFailed);
                return result.data;
            }
        }

        function getRecsByUser(userId) {
            var url = "/api/v2/mysql/_table/userpoints/?filter=userid=" + userId;

            return $http.get(url).then(querySucceeded, _queryFailed)

            function querySucceeded(result) {
                return result.data.resource;
            }
        }

        function deleterec(userId) {
            var url = "/api/v2/mysql/_table/userpoints/?filter=userid=" + userId;

            return $http.delete(url).then(querySucceeded, _queryFailed)

            function querySucceeded(result) {
                if ($rootScope.DEBUG_MODE) console.log("deleting matching records succeeded")
            }
        }

        function getActionPoints() {
            var url = "/api/v2/mysql/_table/actionpoints";

            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {
                var list = result.data.resource;
                var _action_points = {};
                for (var i = 0; i < list.length; i++) {
                    _action_points[list[i].action] = list[i].pts;
                }
                $rootScope.action_points = _action_points;

                return result.data.resource;
            }            
        }

        function getUserLevels() {
            var url = "/api/v2/mysql/_table/userlevels";

            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {
                return result.data.resource;
            }   
        }

        function getCatanFromUaf(uaf) {
            var baseURI = '/api/v2/mysql/_table/catans';
            if (!(uaf.answer && uaf.category)) {
                return null;
            }
            var url = baseURI + '/?filter=((' + 'answer=' + uaf.answer + ') and (' + 'category=' + uaf.category + '))'
            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {
                return result.data.resource[0];
            }            
        }

        function getVrowFromUaf(uaf) {
            var baseURI = '/api/v2/mysql/_table/vrows';
            if (!uaf.vrow) {
                return null;
            }
            var url = baseURI + "/?filter=id=" + uaf.vrow;

            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {
                return result.data.resource[0];
            }            
        }
        
        function updatePointsForShow(uaf_action){
            if ($rootScope.action_points) {
                var action = getActionFromUaf(uaf_action);          
                var pts = $rootScope.action_points[action];
                if ($rootScope.DEBUG_MODE) console.log("update points: " + pts + " for action: " + action)
                $rootScope.$broadcast('getAttentionForUserPoints', {points: $rootScope.user.points + pts});                    
            }
        }   
        
        function getActionFromUaf(uaf_action) {
            var action = "";
            switch (uaf_action) {
                case 'addedAnswer':
                    action = 'addAnswer';
                    break;
                case 'binded':                  
                    break;
                case 'commentR':
                    break;
                case 'commentA':
                    break;
                case 'editA':
                    action = 'editAnswer';
                    break;
                case 'upVotedEdit':
                    break;
                case 'downVotedEdit':
                    break;
                case 'upVoted':
                    action = 'voteUpAnswer';
                    break;
                case 'downVoted':
                    action = 'voteDownAnswer';
                    break;
                case 'upVotedVrow':
                    action = 'voteUpOpinion';
                    break;
                case 'downVotedVrow':
                    action = 'voteDownOpinion';
                    break;
                case 'postPhoto':
                    action = 'postPhoto';
                    break;
                case 'shareFacebook':
                    action = 'shareFacebook';
                    break;                
                case 'addedRank':
                    break;
                case 'addedOpinion':
                    action = 'writeOpinion';                    
                    break;
                default:
                    break;
            }       
            return action;             
        }

        function _queryFailed(error) {
            throw error;
        }        
    }
})();