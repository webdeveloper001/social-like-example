(function () {
    'use strict';

    angular
        .module('app')
        .service('userdata', userdata);

    userdata.$inject = ['$rootScope', 'votes', 'editvote', 'vrowvotes', 
    'useraccnt', 'answer','table2', 'catans','special', 'dataloader',
     'useractivity', '$q', 'promoter','categorycode', 'codeprice','$http', 'SERVER_URL'];

    function userdata($rootScope, votes, editvote, vrowvotes, 
        useraccnt, answer, table2, catans, special, dataloader,
    useractivity, $q, promoter, categorycode, codeprice, $http, SERVER_URL) {

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
                var p7 = votes.loadVotesByMyFriends();
    
                return $q.all([p0, p1, p2, p3, p4, p5, p6, p7]).then(function (d) {
                    $rootScope.cvotes = d[0];
                    $rootScope.editvotes = d[1];
                    $rootScope.cvrowvotes = d[2];
                    $rootScope.thisuseractivity = d[3];
                    $rootScope.userpromoter = d[4];
                    $rootScope.catcodes = d[5];
                    $rootScope.codeprices = d[6];
                    $rootScope.friends_votes = d[7];

                    pullFavoriteData();
                    dataloader.getDemoData();
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
                if ($rootScope.DEBUG_MODE) console.log("user is logged in, loading loading user accounts data");
           
                //Check if user has business account    
                useraccnt.getuseraccnt().then(function (result) {
                    //$rootScope.useraccnts = result;
                    $rootScope.showWarning = false;
                    if ($rootScope.useraccnts.length > 0) {
                        var missingEmail = true;
                        var url = '';
                        for (var i = 0; i < $rootScope.useraccnts.length; i++) {
                            
                            if ($rootScope.useraccnts[i].email != '') missingEmail = false;

                            //If user is customer, asynchronously ask server to get from Stripe latest invoice/subscription info
                            if ($rootScope.useraccnts[i].stripeid != undefined && $rootScope.useraccnts[i].stripeid != '' && 
                                $rootScope.useraccnts[i].stripeid != 0){
                                url = SERVER_URL + 'dreamfactory-stripe-user/'+$rootScope.useraccnts[i].stripeid+'/'+$rootScope.useraccnts[i].id;
                                var useraccnt = $rootScope.useraccnts[i];
                                var req = {
                                    method: 'GET',
                                    url: url,
                                    headers: {
                                        'X-Dreamfactory-API-Key': undefined,
                                        'X-DreamFactory-Session-Token': undefined
                                    }
                                }

                                $http(req).then(succeedFunc,function(error){
                                    console.log("Error updating Stripe Invoices - ", error);
                                });
                                function succeedFunc(result){
                                    // console.log("Success updating Stripe Invoices - ", result);
                                    useraccnt.customer = result.data;
                                    syncDatatoAnswers();
                                }
                                if ($rootScope.DEBUG_MODE) console.log("Retrieving latest invoice info from Stripe");
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

        function syncDatatoAnswers() {
            if ($rootScope.isLoggedIn && $rootScope.rankSummaryDataLoaded) {
                if ($rootScope.DEBUG_MODE) console.log("Syncing useraccnt data to answers");
                var idx = 0;
                for (var i = 0; i < $rootScope.useraccnts.length; i++) {
                    var fields = [];
                    var vals = [];
                    idx = $rootScope.answers.map(function (x) { return x.id; }).indexOf($rootScope.useraccnts[i].answer);
                    if ($rootScope.answers[idx].ispremium != $rootScope.useraccnts[i].ispremium) {
                        fields.push('ispremium'); vals.push($rootScope.useraccnts[i].ispremium);
                    }
                    if ($rootScope.answers[idx].hasranks != $rootScope.useraccnts[i].hasranks) {
                        fields.push('hasranks'); vals.push($rootScope.useraccnts[i].hasranks);
                    }
                    if ($rootScope.answers[idx].ranksqty != $rootScope.useraccnts[i].ranksqty) {
                        fields.push('ranksqty'); vals.push($rootScope.useraccnts[i].ranksqty);
                    }
                    if (fields.length > 0) answer.updateAnswer($rootScope.answers[idx].id, fields, vals);
                }
            }
        }

        function pullFavoriteData(){
            //Prepare array to pulldata
            var favans = [];
            var obj = {};
            for (var i = 0; i < $rootScope.cvotes.length; i++) {
                obj = {};
                obj.id = $rootScope.cvotes[i].answer;
                obj.answer = $rootScope.cvotes[i].answer;
                favans.push(obj);
            }
            dataloader.pulldata('answers',favans);
            //My friends answers
            $rootScope.friendsVotes = true;
            var friendsans = [];
            for (var i = 0; i < $rootScope.friends_votes.length; i++) {
                obj = {};
                obj.id = $rootScope.friends_votes[i].answer;
                obj.answer = $rootScope.friends_votes[i].answer;
                friendsans.push(obj);
            }
            dataloader.pulldata('answers',friendsans);

        }
    }
})();