(function () {
    'use strict';

    angular
        .module('app')
        .factory('fbusers', fbusers);

    fbusers.$inject = ['$http', '$q', '$rootScope', '$facebook'];

    function fbusers($http, $q, $rootScope, $facebook) {

        // Members
        var fbUsers = [];

        var service = {
            findFBUserById: findFBUserById,
            getFBUserById: getFBUserById,
            addFBUser: addFBUser,

            loadProfilePicture: loadProfilePicture
        };

        return service;

        function addFBUser(user){
            fbUsers.push(user);
        }

        function getFBUserById(fbId){
            var user = findFBUserById(fbId);
            if(user)
                return $q.when(user);
            return $facebook.api('/'+fbId+'?fields=first_name,gender,locale,picture,last_name,email', 'GET').then(
            function(user){
                service.addFBUser(user);
                return user;
            },
            function(err){
                return null;
            });
        }

        function findFBUserById(fbId){
            return fbUsers.find(function(user){
                return user.id == fbId;
            });
        }

        function loadProfilePicture(users, fieldName){
            for (var i = 0; i < users.length; i++) {
                var userWithPic = angular.copy(user[i]);
                service.getFBUserById(userWithPic[fieldName])
                .then(function(fbUser){

                });
            }
            return users;
        }
        
    }
})();