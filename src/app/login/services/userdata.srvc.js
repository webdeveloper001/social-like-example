(function () {
    'use strict';

    angular
        .module('app')
        .service('userdata', userdata);

    userdata.$inject = ['$rootScope', 'votes','editvote','vrowvotes',];

    function userdata($rootScope, votes,editvote,vrowvotes) {

        var service = {

            loadVotes: loadVotes,
        };

        return service;

        function loadVotes() {
            
            var dataLoaded = $rootScope.dataLoaded ? $rootScope.dataLoaded : false;
            
            if ($rootScope.isLoggedIn && !dataLoaded) {
                //load answer votes
                if ($rootScope.cvotes == undefined) {
                    votes.loadVotesByUser().then(function (votetable) {
                        $rootScope.cvotes = votetable;
                    });
                }
                if ($rootScope.editvotes == undefined) {
                    //load edit votes
                    editvote.loadEditVotesTable().then(function (editvotes) {
                        $rootScope.editvotes = editvotes;
                    });
                }
                if ($rootScope.cvrowvotes == undefined) {
                    //Vrow Votes for this user
                    vrowvotes.loadVrowVotes().then(function (vrowvotes) {
                        $rootScope.cvrowvotes = vrowvotes;
                    });
                }
                
                $rootScope.dataLoaded = true;
            }
        }

    }
})();