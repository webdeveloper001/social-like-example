(function () {
    'use strict';

    angular
        .module('app')
        .service('users', users);

    users.$inject = ['$http', '$rootScope', '$q'];

    function users($http, $rootScope, $q) {

        var BaseURI = "/api/v2/mysql/_table/users";

        var service = {
            addUser: addUser,
            getUser: getUser,
            updateUser: updateUser
        };

        return service;

        function addUser() {

            var currentuser = $rootScope.user;            
            var userinfo = {
                first_name: currentuser.first_name,
                last_name: currentuser.last_name,
                email: currentuser.email,
                gender: currentuser.gender? currentuser.gender : 'unknown',
                role: currentuser.role? currentuser.role : 'unknown',
                userid: currentuser.id,
                age: currentuser.age? currentuser.age : '-1',
                level: 'Newcomer',
                points: 0,
            };
            //Set level and points of new user for RootScope
            $rootScope.user.level = 'Newcomer';
            $rootScope.user.points = 0;

            var resource = [];
            resource.push(userinfo)
            var url = BaseURI;

            $http.post(url, resource, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: resource
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {
                return result.data;
            }
        }

        function getUser(userid) {
            var url = BaseURI + '/?filter=userid=' + userid;
            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {
                return result.data.resource;
            }
        }

        function updateUser(userid, pts) {
            if ($rootScope.user.id == userid) {
                $rootScope.$broadcast('getAttentionForUserPoints', {points: $rootScope.user.points + pts});
            }

            $q.all([getUser(userid)]).then(function(data) {
                if (data) {
                    var userinfo = data[0][0];
                    userinfo.points += pts;
                    var url = BaseURI;
                    var obj = {
                        resource: []
                    };
                    $q.all([getUserLevels()]).then(function(data) {
                        if (data[0]) {
                            var userlevels = data[0]
                            var i = 0;
                            for (i = 0; i < userlevels.length; i++) {
                                if (userinfo.points == userlevels[i].pts) {
                                    userinfo.level = userlevels[i].level;
                                    break;
                                } 
                                if (userinfo.points < userlevels[i].pts) {
                                    userinfo.level = userlevels[i-1].level;
                                    break;
                                }
                            }
                            obj.resource.push(userinfo);
                            //update level and points for current user for rootScope
                            if ($rootScope.user.id == userid) {
                                $rootScope.user.level = userinfo.level;
                            }

                            return $http.patch(url, obj, {
                                headers: {
                                    "Content-Type": "multipart/form-data"
                                },
                                body: obj
                            }).then(querySucceeded, _queryFailed);                            
                        }
                    })

                    function querySucceeded(result) {
                        if ($rootScope.DEBUG_MODE) console.log("updating user succesful");
                        return result.data;                        
                    }
                }
            })
        }

        function getUserLevels() {
            var url = "/api/v2/mysql/_table/userlevels";

            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {
                return result.data.resource;
            }   
        }

        function _queryFailed(error) {
            throw error;
        }        
    }
})();