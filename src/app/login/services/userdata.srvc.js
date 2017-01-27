(function () {
    'use strict';

    angular
        .module('app')
        .service('userdata', userdata);

    userdata.$inject = ['$rootScope', 'votes', 'editvote', 'vrowvotes', 'useraccnt', 'useractivity', '$q'];

    function userdata($rootScope, votes, editvote, vrowvotes, useraccnt, useractivity, $q) {

        var service = {

            loadUserData: loadUserData,
            loadUserAccount: loadUserAccount,
        };

        return service;

        function loadUserData() {

            if ($rootScope.isLoggedIn) {
                if ($rootScope.DEBUG_MODE) console.log("user is logged in, loading data");
                //Promises
                var p0 = votes.loadVotesByUser();
                var p1 = editvote.loadEditVotesTable();
                var p2 = vrowvotes.loadVrowVotes();
                var p3 = useractivity.getActivitybyUser();

                return $q.all([p0, p1, p2, p3]).then(function (d) {
                    $rootScope.cvotes = d[0];
                    $rootScope.editvotes = d[1];
                    $rootScope.cvrowvotes = d[2];
                    $rootScope.thisuseractivity = d[3];

                    $rootScope.userDataLoaded = true;
                    $rootScope.$emit('userDataLoaded');

                });
            }
            else {
                if ($rootScope.DEBUG_MODE) console.log("user is not logged in, no need to load data");
                $rootScope.cvotes = [];
                $rootScope.editvotes = [];
                $rootScope.cvrowvotes = [];
                $rootScope.thisuseractivity = [];

                $rootScope.userDataLoaded = true;
                $rootScope.$emit('userDataLoaded');
            }
        }

        function loadUserAccount() {

            if ($rootScope.isLoggedIn) {
           
                //Check if user has business account    
                useraccnt.getuseraccnt().then(function (useraccnt) {
                    $rootScope.useraccnts = useraccnt;
                    $rootScope.showWarning = false;
                    if ($rootScope.useraccnts.length > 0) {
                        var missingEmail = true;
                        for (var i = 0; i < $rootScope.useraccnts.length; i++) {
                            if ($rootScope.useraccnts[i].email != '') missingEmail = false;
                        }
                        if (missingEmail) {
                            $rootScope.showWarning = true;
                            $rootScope.$emit('showWarning');
                        }
                        else $rootScope.showWarning = false;
                    }
                });
            }
        }
    }
})();