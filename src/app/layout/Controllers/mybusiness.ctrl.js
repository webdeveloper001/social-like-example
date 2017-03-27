(function () {
    'use strict';

    angular
        .module('app')
        .controller('mybusiness', mybusiness);

    mybusiness.$inject = ['$location', '$rootScope', '$state', '$window','useraccnt','dialog','answer','$http'];

    function mybusiness(location, $rootScope, $state, $window, useraccnt, dialog, answer, $http) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'mybusiness';

        vm.overview = true;
        vm.manageview = false;
        vm.codeOk = false;
        vm.getRanks = false;
        vm.getPremium = false;
        vm.dataReady = false;

        //Methods
        vm.gotoanswer = gotoanswer;
        vm.gotomanage = gotomanage;
        vm.goCheckout = goCheckout;
        vm.unbind = unbind;
        vm.goBack = goBack;
        vm.ranksQty = 1;
        vm.plusQty = plusQty;
        vm.minusQty = minusQty;
        vm.checkcode = checkcode;
        vm.cancelPremium = cancelPremium;
        vm.cancelRanks = cancelRanks;
        vm.editRanks = editRanks;
        vm.cancelAll = cancelAll;

        vm.mybizs = [];
        activate();
        vm.noAns = false;

        var cancelAll = false;
        var cancelPremium = false;
        var cancelRanks = false;
        var cancelNumRanks = 0;

        function activate() {

            useraccnt.getuseraccnt(true).then(function(result){
                $rootScope.useraccnts.result;
                vm.dataReady = true;
                loadData();
            });

            //loadData();
            console.log("mybusiness page Loaded!");

        }

        function loadData(){
            vm.mybizs = [];
            var accntExists = false;
            var bizObj = {};
            for (var i=0; i<$rootScope.answers.length; i++){
                if ($rootScope.answers[i].owner == $rootScope.user.id){
                    accntExists = false;
                    bizObj = {};
                    bizObj = $rootScope.answers[i];

                    //Check that record exists also in user accounts, if not, it will get created
                    for (var j=0; j<$rootScope.useraccnts.length; j++){
                        if ($rootScope.useraccnts[j].answer == $rootScope.answers[i].id) { 
                            accntExists = true;
                            bizObj.status = $rootScope.useraccnts[j].status;
                            bizObj.bizcat = $rootScope.useraccnts[j].bizcat;
                            bizObj.email = $rootScope.useraccnts[j].email;
                            bizObj.accountid = $rootScope.useraccnts[j].id;
                            bizObj.stripeid = $rootScope.useraccnts[j].stripeid;
                            bizObj.lastPaymentMade = $rootScope.useraccnts[j].lastPaymentMade;
                            bizObj.nextPaymentDue = $rootScope.useraccnts[j].nextPaymentDue;
                            bizObj.monthlyCost = $rootScope.useraccnts[j].monthlyCost;
                            bizObj.isPremium = $rootScope.useraccnts[j].ispremium;
                            bizObj.hasRanks = $rootScope.useraccnts[j].hasranks;
                            bizObj.ranksQty = $rootScope.useraccnts[j].ranksqty;
                            bizObj.stripesub = $rootScope.useraccnts[j].stripesub;
                            bizObj.stripesipremium = $rootScope.useraccnts[j].stripesipremium;
                            bizObj.stripesiranks = $rootScope.useraccnts[j].stripesiranks;
                            bizObj.user = $rootScope.useraccnts[j].user;
                            bizObj.firstname = $rootScope.user.first_name;
                            bizObj.lastname = $rootScope.user.last_name;
                                
                                if (bizObj.isPremium) {
                                    bizObj.status = 'Premium'; bizObj.style = 'background-color:#009900';
                                }
                                else {bizObj.status = 'Basic'; bizObj.style = 'background-color:#bfbfbf';}

                                if (bizObj.hasRanks) {
                                    bizObj.status2 = bizObj.ranksQty + ' Custom Ranks';
                                     bizObj.style2 = 'background-color:#009900';
                                }
                                else {bizObj.status2 = 'No Custom Ranks'; bizObj.style2 = 'background-color:#bfbfbf';}

                            //get monthly price
                            for (var k=0; k<$rootScope.codeprices.length; k++){
                                //console.log($rootScope.codeprices[k].code, bizObj.bizcat);
                                if ($rootScope.codeprices[k].code == bizObj.bizcat){
                                    bizObj.price = $rootScope.codeprices[k].price;
                                    break;
                                }
                            }
                            break;
                        }                        
                    }
                    if (!accntExists) useraccnt.adduseraccnt($rootScope.answers[i]);
                    vm.mybizs.push(bizObj);               
                }
            }
  
            //console.log("vm.mybizs", vm.mybizs);
            if (vm.mybizs.length == 0) vm.noAns = true;           
        }

        function gotoanswer(x){
            $state.go('answerDetail', {index: x.id});
        }

        function gotomanage(x){
            vm.codeMsg = 'Enter a code and validate it using the \'Check code\' button';
            vm.promocode = '';
            //$state.go('mybiz');
            vm.business = x;
            vm.getRanks = false;
            vm.getPremium = false;
            vm.ranksQty = 1;
            vm.overview = false;
            vm.manageview = true;
            if (!x.isPremium && !x.hasRanks) vm.sell = true;
            else vm.sell = false;

            console.log("vm.business",x);
            
        }

        function goBack() {
            if (vm.manageview == true) {
                vm.overview = true;
                vm.manageview = false;
                vm.checkout = false;
                return;
            }
            if (vm.checkout == true) {
                vm.manageview = true;
                vm.checkout = false;
                vm.overview = false;
                return;
            }

            if ($rootScope.previousState == 'rankSummary')
                    $state.go('rankSummary', {index: $rootScope.cCategory.id});
            else if ($rootScope.previousState == 'answerDetail')
                    $state.go('answerDetail', {index: $rootScope.canswer.id});
            else if ($rootScope.previousState == 'addAnswer')
                    $state.go('addAnswer', {index: $rootScope.canswer.id});
            else if ($rootScope.previousState == 'editAnswer')
                    $state.go('editAnswer', {index: $rootScope.canswer.id});                
            else if ($rootScope.previousState == 'about')
                    $state.go('about');
            else $state.go('cwrapper');                
        }

        function unbind(id){
            dialog.unbindAccount(vm.business, exec_unbind);
        }

        function exec_unbind(){
            answer.updateAnswer(vm.business.id,['owner'],[0]);
            vm.mybizs = [];
            loadData();
            vm.overview = true;
        }

        function plusQty(){
            vm.ranksQty = vm.ranksQty + 1;
        }

        function minusQty(){
            vm.ranksQty = vm.ranksQty - 1;
            if (vm.ranksQty < 1) vm.ranksQty = 1;
        }

        function checkcode(){
            if (vm.promocode.length > 5){
                //TODO check code is valid
                vm.codeOk = true;
                vm.codeMsg = 'This code gets you 60 days free on all your subscriptions!';
            }
            else {
                vm.codeOk = false;
                vm.codeMsg = 'Sorry, this is not a valid code.';
            }
        }

        function goCheckout(){
            vm.acceptTOS = false;
            if (vm.contactInfoOk == false) {
                dialog.getDialog('contactInfoIncomplete');
            }
            else if (vm.getRanks == false && vm.getPremium == false ) {
                dialog.getDialog('nothingSelectedForPurchase');
            }
            else {
                vm.total = vm.getRanks*vm.ranksQty*35 + vm.getPremium*vm.business.price;
                vm.manageview = false;
                vm.checkout = true;
                loopCheckUpgradeSuccess();
                
            }
        }

        function cancelPremium(){
            //Check if there are other subscriptions other than Premium, if not delete entire subscription otherwise StripeServer
            //gives error
            if (vm.business.hasRanks){
                cancelAll = false;
                cancelPremium = true;
                cancelRanks = false;
                cancelNumRanks = 0;
                dialog.confirmCancel(vm.business, 'Premium',execCancel);
            }
            else{
                cancelAll = true;
                cancelPremium = false;
                cancelRanks = false;
                cancelNumRanks = 0;
                dialog.confirmCancel(vm.business, 'Premium',execCancel);
            }
        }

        function execCancel(){
            var url = 'https://server.rank-x.com/StripeServer/cancel';
            var req = {
                method: 'POST',
                url: url,
                headers: {
                    'X-Dreamfactory-API-Key': undefined,
                    'X-DreamFactory-Session-Token': undefined
                },
                data: {
                    'cancelAll': cancelAll,
                    'cancelPremium': cancelPremium,
                    'cancelRanks': cancelRanks,
                    'cancelNumRanks': cancelNumRanks,
                    'stripeId': vm.business.stripeid,
                    'useraccntId': vm.business.accountid,
                    'stripesub' : vm.business.stripesub,
                    'stripesipremium' : vm.business.stripesipremium,
                    'stripesiranks' : vm.business.stripesiranks,
                    
                }
            }

            $http(req).then(function (result) {
                console.log("Cancelling Premium Membership Success", result);
            }, function (error) {
                console.log("Error Cancelling Premium Membership - ", error);
            });
            loopCheckDowngradeSuccess();        
        }
        function cancelRanks(){
            //Check if there are other subscriptions other than Premium, if not delete entire subscription otherwise StripeServer
            //gives error
            if (vm.business.isPremium){
                cancelAll = false;
                cancelPremium = false;
                cancelRanks = true;
                cancelNumRanks = 0;
                dialog.confirmCancel(vm.business, 'Ranks',execCancel);
            }
            else{
                cancelAll = true;
                cancelPremium = false;
                cancelRanks = false;
                cancelNumRanks = 0;
                dialog.confirmCancel(vm.business, 'Ranks',execCancel);
            }
        }
        
        function cancelAll(){
            cancelAll = true;
            cancelPremium = false;
            cancelRanks = false;
            cancelNumRanks = 0;
            dialog.confirmCancel(vm.business,'All',execCancel);
        }
        function editRanks(){
            dialog.editNumRanks(vm.business, execEditNumRanks);
        }
        function execEditNumRanks(action, N){
            //if deleting all ranks, call delete ranks subscription
            if (action == 'cancel' && N == vm.busines.ranksQty){
                cancelRanks();
            }
            else {

                var updatedNumRanks = 0;
                if (action == 'purchase') updatedNumRanks = vm.business.ranksQty + N;
                if (action == 'cancel') updatedNumRanks = vm.business.ranksQty - N;
                var url = 'https://server.rank-x.com/StripeServer/edit';
                var req = {
                    method: 'POST',
                    url: url,
                    headers: {
                        'X-Dreamfactory-API-Key': undefined,
                        'X-DreamFactory-Session-Token': undefined
                    },
                    data: {
                        'action': action,
                        'numRanks': updatedNumRanks,
                        'stripeId': vm.business.stripeid,
                        'useraccntId': vm.business.accountid,
                        'stripesub': vm.business.stripesub,
                        'stripesiranks': vm.business.stripesiranks,
                    }
                }

                $http(req).then(function (result) {
                    console.log("Updating Quantity of Custom Ranks Success", result);
                }, function (error) {
                    console.log("Error Updating Quantity of Custom Ranks - ", error);
                });
                loopCheckDowngradeSuccess();
            }
            console.log("Execute Edit Num Ranks");

        }

      // -------- **UPGRADE**  STRIPE LOOP CHECKERS
      function loopCheckUpgradeSuccess() {
         setTimeout(function () {
           //  call a 3s setTimeout when the loop is called
            //  your code here
            console.log('loopCheckUpgradeSuccess --> wasUpgradeSuccess');


            useraccnt.getuseraccntans(vm.business.id).then(successGetuseraccnt, failGetuseraccnt);
            function failGetuseraccnt(err) {
                console.log(JSON.stringify(err));
                return err;
            }
            function successGetuseraccnt(result) {
              // result[0] =
              // {"user":37,"answer":0,"bizcat":"REB","email":"sjurowski+facebook@ucsd.edu","status":"1001:Rank-X Premium Business Plan:sub_9qe3oH617BKGWD","stripeid":"cus_9qe3Kburx73l2L","id":176}

              var checkAgain = true;
              console.log("i'm in, will check every 3 seconds for signup success");
              console.log("full result:");
              console.log(result);
              
              var hasSubscription = false;
              try {

                if ((vm.getPremium && result[0].ispremium && !vm.getRanks) ||      //if purchase only Premium
                (!vm.getPremium && vm.getRanks && result[0].hasranks && vm.ranksQty == result[0].ranksqty) || //if purchase only ranks
                (vm.getPremium && result[0].ispremium && vm.getRanks && result[0].hasranks && vm.ranksQty == result[0].ranksqty)){

                  hasSubscription = true;
                  //update local copy
                  var idx = $rootScope.useraccnts.map(function(x) {return x.id; }).indexOf(result[0].id);
                  $rootScope.useraccnts[idx] = result[0]; 
                  loadData();
                  console.log(vm.mybiz);
                  vm.overview = true;
                  vm.manageview = false;
                  vm.checkout = false;
                  return true;

                } else {
                  console.log("no subscription created yet");
                  // return false;  <-- this will stop the looping
                }
              }
              catch(err) {
                  console.log("error while looking up subscription info from DF: " + JSON.stringify(err));

                  checkAgain = false;

                  return err;
              }

            // if (loopCheckUpgradeSuccess() == true) {
            //
            //   this.vm.showSpinner = false;
            //   this.vm.showCurrentPlan = true;
            //   this.vm.showUpgrade = false;
            //
            //   return;
            // }


            //i++;
            // if ( (i < 30) && (checkAgain == true) ) {
            if ( (1 < 2) && (checkAgain == true) && vm.checkout) {
              //recursion ... find another way if possible
              loopCheckUpgradeSuccess();
            } else {
              return;
            }
            //  ..  setTimeout()
          }
         }, 3000);
      }        

            // -------- **DOWNGRADE**  STRIPE LOOP CHECKERS
      function loopCheckDowngradeSuccess() {
         setTimeout(function () {
           //  call a 3s setTimeout when the loop is called
            //  your code here
            console.log('loopCheckDowngradeSuccess --> wasDowngradeSuccess');


            useraccnt.getuseraccntans(vm.business.id).then(successGetuseraccnt, failGetuseraccnt);
            function failGetuseraccnt(err) {
                console.log(JSON.stringify(err));
                return err;
            }
            function successGetuseraccnt(result) {
              // result[0] =
              // {"user":37,"answer":0,"bizcat":"REB","email":"sjurowski+facebook@ucsd.edu","status":"1001:Rank-X Premium Business Plan:sub_9qe3oH617BKGWD","stripeid":"cus_9qe3Kburx73l2L","id":176}

              var checkAgain = true;
              console.log("i'm in, will check every 3 seconds for signup success");
              console.log("full result:");
              console.log(result);
              
              var hasDowngraded = false;
              try {

                console.log("l1", cancelPremium,!result[0].ispremium,result[0].stripesipremium == '');
                console.log("l2", cancelRanks, !result[0].hasranks, result[0].stripesiranks == '');
                console.log("l3", cancelAll, result[0].stripesub == '');
                if ((cancelPremium && !result[0].ispremium && result[0].stripesipremium == '') ||      //if Premium was cancellesd
                (cancelRanks && !result[0].hasranks && result[0].stripesiranks == '') || //if Ranks were cancellesd
                (cancelAll && result[0].stripesub == '')){

                  hasDowngraded = true;
                  //update local copy
                  var idx = $rootScope.useraccnts.map(function(x) {return x.id; }).indexOf(result[0].id);
                  $rootScope.useraccnts[idx] = result[0]; 
                  loadData();
                  console.log(vm.mybiz);
                  vm.overview = true;
                  vm.manageview = false;
                  vm.checkout = false;
                  return true;

                } else {
                  console.log("subscription not cancelled yet");
                  // return false;  <-- this will stop the looping
                }
              }
              catch(err) {
                  console.log("error while looking up subscription info from DF: " + JSON.stringify(err));

                  checkAgain = false;

                  return err;
              }

            if ( (1 < 2) && (checkAgain == true) && vm.checkout) {
              //recursion ... find another way if possible
              loopCheckDowngradeSuccess();
            } else {
              return;
            }
            //  ..  setTimeout()
          }
         }, 3000);
      }   
    }
})();
