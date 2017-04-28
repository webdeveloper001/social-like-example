(function () {
    'use strict';

    angular
        .module('app')
        .service('userdata', userdata);

    userdata.$inject = ['$rootScope', 'votes', 'editvote', 'vrowvotes', 'useraccnt',
     'useractivity', '$q', 'promoter','categorycode', 'codeprice','$http'];

    function userdata($rootScope, votes, editvote, vrowvotes, useraccnt, 
    useractivity, $q, promoter, categorycode, codeprice, $http) {

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
                var p4 = promoter.getbyUser($rootScope.user.id);
                var p5 = categorycode.get();
                var p6 = codeprice.get();
    
                return $q.all([p0, p1, p2, p3, p4, p5, p6]).then(function (d) {
                    $rootScope.cvotes = d[0];
                    $rootScope.editvotes = d[1];
                    $rootScope.cvrowvotes = d[2];
                    $rootScope.thisuseractivity = d[3];
                    $rootScope.userpromoter = d[4];
                    $rootScope.catcodes = d[5];
                    $rootScope.codeprices = d[6];
                    
                    if ($rootScope.DEBUG_MODE) console.log("user promoter - ",$rootScope.userpromoter);
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
                $rootScope.userpromoter = [];
                $rootScope.catcodes = [];
                $rootScope.codeprices = [];

                $rootScope.userDataLoaded = true;
                $rootScope.$emit('userDataLoaded');
            }
        }

        function loadUserAccount() {

            if ($rootScope.isLoggedIn) {
           
                //Check if user has business account    
                useraccnt.getuseraccnt().then(function (result) {
                    $rootScope.useraccnts = result;
                    $rootScope.showWarning = false;
                    if ($rootScope.useraccnts.length > 0) {
                        var missingEmail = true;
                        var url = '';
                        for (var i = 0; i < $rootScope.useraccnts.length; i++) {
                            
                            if ($rootScope.useraccnts[i].email != '') missingEmail = false;

                            //If user is customer, asynchronously ask server to get from Stripe latest invoice/subscription info
                            if ($rootScope.useraccnts[i].stripeid != undefined && $rootScope.useraccnts[i].stripeid != '' && 
                                $rootScope.useraccnts[i].stripeid != 0){
                                url = 'https://server.rank-x.com/dreamfactory-stripe-user/'+$rootScope.useraccnts[i].stripeid+'/'+$rootScope.useraccnts[i].id;
                                var req = {
                                    method: 'GET',
                                    url: url,
                                    headers: {
                                        'X-Dreamfactory-API-Key': undefined,
                                        'X-DreamFactory-Session-Token': undefined
                                    }
                                }

                                $http(req).then(function(result){
                                    console.log("Success updating Stripe Invoices - ", result);
                                },function(error){
                                    console.log("Error updating Stripe Invoices - ", error);
                                });
                                console.log("Retrieving latest invoice info from Stripe");
                            }
                        }
                        $rootScope.$emit('userAccountsLoaded');
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