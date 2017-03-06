(function () {
    'use strict';

    angular
        .module('app')
        .controller('mybiz', mybiz);


    mybiz.$inject = ['$location', '$state','$window', 'useraccnt', '$http'];

    function mybiz(location, $state, $window, useraccnt, $http) {

      /* jshint validthis:true */
      // Members
        var vm = this;
        vm.title = 'mybiz';

        // keep null until we load the stripe plan from useraccnt record
        vm.useraccntStatus = null;

        // show until we know what to show them
        vm.showSpinner = true;

        // hide until we know what to show them
        vm.showCurrentPlan = false;
        vm.showUpgrade = false;
        vm.showGoodbye = false;
        vm.showCancelOption = false;

        vm.showPricePerMonth = false;
        vm.showNextPaymentDue = false;
        vm.showLastPaymentMade = false;

        vm.monthlyCost = '0';
        vm.nextPaymentDue = '3000-01-01';
        vm.lastPaymentMade = '1900-01-01';

        // default plan for upgrade form
        vm.stripePlan = '1001';

        vm.user = JSON.parse(localStorage.getItem("user"));
        vm.dfUseraccntId = vm.user.dfUseraccntId;

        //stripe customer id, stored in DF as such
        vm.stripeid = vm.user.stripeid;

        vm.stripeSubscriptionId = '0';

        //  set loop check counter to 1
        var i = 1;
      // END Members
      // -----------------------------------------------------



      // -----------------------------------------------------
      // ------------------    START VIEW VARIABLES ----------
        vm.goBack = goBack;
        vm.refreshAccountInfo = refreshAccountInfo;

        vm.wasUpgradeSuccess = wasUpgradeSuccess;
        vm.wasDowngradeSuccess = wasDowngradeSuccess;

        vm.stripeServerLocal = false;
        if (window.location.hostname == "localhost") {
          vm.stripeServerLocal = true;
        }

        // ------------------    END VIEW VARIABLES ------------
        // -----------------------------------------------------


        // -----------------------------------------------------
        // ------------------    SART RUNTIME        -----------

        // $http({
        //   method: 'GET',
        //   url: '/someUrl'
        // }).then(function successCallback(response) {
        //     // this callback will be called asynchronously
        //     // when the response is available
        //   }, function errorCallback(response) {
        //     // called asynchronously if an error occurs
        //     // or server returns response with an error status.
        //   });
        //

        console.log("--------------------------------------------------------");
        console.log("-----LOOK UP INVOICES AND SAVE THEM---------------------");
        if (vm.user.stripeid && vm.user.dfUseraccntId) {
          //pull the lastPaymentMade and nextPaymentDue from Stripe and save in db
          saveStripeInvoices(vm.user.stripeid, vm.user.dfUseraccntId);
        }
        console.log("-----END LOOK UP INVOICES AND SAVE THEM-----------------");
        console.log("--------------------------------------------------------");

        // call it once now, and re-call it from the UI as needed
        refreshAccountInfo();



        // ------------------    END RUNTIME        ------------
        // -----------------------------------------------------


        // -----------------------------------------------------
        // ------------------    START METHODS -----------------

        function saveStripeInvoices(stripeId, dfUseraccntId) {

          // var _stripeCustomerId = 'cus_A36js8CJzphovQ';
          // var _stripeCustomerId = 'cus_A36js8CJzphovQ';
          // http://localhost:3000/dreamfactory-stripe-user/cus_A36js8CJzphovQ/24
          var url = '';


          //<!-- // flip the server name if localhost -->
          if (vm.stripeServerLocal) {
            // url = 'http://localhost:3000/dreamfactory-stripe-user/' + _stripeCustomerId + '/' + vm.dfUseraccntId;
            url = 'http://localhost:3000/dreamfactory-stripe-user/' + stripeId + '/' + dfUseraccntId;

          } else {
            // url = 'https://rank-x.com:3000/dreamfactory-stripe-user/' + _stripeCustomerId + '/' + vm.dfUseraccntId;
            url = 'https://rank-x.com:3000/dreamfactory-stripe-user/' + dfUseraccntId + '/' + dfUseraccntId;

          }


          var req = {
           method: 'GET',
           url: url,
           headers: {
             'X-Dreamfactory-API-Key': undefined,
             'X-DreamFactory-Session-Token': undefined
           }
          }

          $http(req).then(stripeServerSaveInvoicesSucceeded, _queryFailed);

            function stripeServerSaveInvoicesSucceeded(result) {
                return result.data.resource;
            }

        }

      function refreshAccountInfo() {
        useraccnt.getuseraccnt(true).then(successGetuseraccnt, failGetuseraccnt);

        function successGetuseraccnt(result) {

          console.log("mybiz.ctrl.js:refreshAccountInfo():successGetuseraccnt:result[0]: " + JSON.stringify(result[0]));
          // PRODUCES:
          // refreshAccountInfo():successGetuseraccnt:result[0]: {"user":37,"answer":0,"bizcat":"REB","email":"sjurowski+facebook@ucsd.edu","status":"1001:Rank-X Premium Business Plan - Tier 1:sub_A36jXImdkPeOjy","stripeid":"cus_A36js8CJzphovQ","id":245,"COUPON":"NONE","monthlyCost":50,"lastPaymentMade":"2017-02-02","nextPaymentDue":"2017-03-04"}

          var hasSubscription = false;
          try {
            if (result[0].status.split(":")[0] && result[0].status.split(":")[0] == '1001') {

              hasSubscription = true;
              localStorage.setItem('hasSubscription', true);

              vm.useraccntStatus = result[0].status.split(":")[1];
              vm.stripeSubscriptionId = result[0].status.split(":")[2];

              vm.monthlyCost = result[0].monthlyCost;
              vm.nextPaymentDue = makeDatePretty(result[0].nextPaymentDue);
              vm.lastPaymentMade = makeDatePretty(result[0].lastPaymentMade);

              //since the person had a subscription when this
              //page was first loaded,
              //give them the cancel option
              //(if you give it to them immediately after they sign up.
              // it give header rewrite errors on the local stripe server)
              vm.showCancelOption = true;

            }
          }
          catch(err) {
              console.log("error while looking up subscription info from DF: " + JSON.stringify(err));
          }

          if (hasSubscription) {

            console.log("SHOW CURRENT PLAN");
            vm.showSpinner = false;

            vm.showUpgrade = false;

            vm.showCurrentPlan = true;


            vm.showPricePerMonth = true;
            vm.showNextPaymentDue = true;
            vm.showLastPaymentMade = true;


            console.log("start the downgrade success check loop");
            loopCheckDowngradeSuccess();

          } else {

            console.log("SHOW UPGRADE PANEL");

            localStorage.setItem('hasSubscription', false);

            vm.useraccntStatus = "You should upgrade. ";

            vm.showSpinner = false;

            vm.showUpgrade = true;
            vm.showCurrentPlan = false;

            console.log("start the upgrade success check loop");
            loopCheckUpgradeSuccess();

          }

        }
        function failGetuseraccnt(err) {
            console.log(JSON.stringify(err));
            return err;
        }
      }

      // ------------------------------------------------------------
      // ------------------------------------------------------------
      // -------- **UPGRADE**  STRIPE LOOP CHECKERS
      function loopCheckUpgradeSuccess() {
         setTimeout(function () {
           //  call a 3s setTimeout when the loop is called
            //  your code here
            console.log('loopCheckUpgradeSuccess --> wasUpgradeSuccess');


            useraccnt.getuseraccnt(true).then(successGetuseraccnt, failGetuseraccnt);
            function successGetuseraccnt(result) {
              // result[0] =
              // {"user":37,"answer":0,"bizcat":"REB","email":"sjurowski+facebook@ucsd.edu","status":"1001:Rank-X Premium Business Plan:sub_9qe3oH617BKGWD","stripeid":"cus_9qe3Kburx73l2L","id":176}

              var checkAgain = true;
              console.log("i'm in, will check every 3 seconds for signup success");
              console.log("full result:");
              console.log(result);

              var hasSubscription = false;
              try {
                if (result[0].status.split(":")[0] && result[0].status.split(":")[0] == '1001') {
                  console.log("i'm in2");


                  hasSubscription = true;
                  localStorage.setItem('hasSubscription', true);

                  vm.useraccntStatus = result[0].status.split(":")[1];

                  // reload goBack()
                  // (this should fix an issue if someone tries to
                  // cancel immediately, the local stripe server
                  // might otherwise complain of modifying headers twice)
                  // goBack();

                  vm.showUpgrade = false;
                  vm.showCurrentPlan = true;

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


            i++;
            // if ( (i < 30) && (checkAgain == true) ) {
            if ( (1 < 2) && (checkAgain == true) ) {
              //recursion ... find another way if possible
              loopCheckUpgradeSuccess();
            } else {
              return;
            }
            //  ..  setTimeout()
          }
         }, 3000);
      }

      function makeDatePretty(d) {
        // console.log("-----------   welcome to makeDatePretty(d) -----------");
        // console.log("d:", d);

        // 2017-02-15
        // 0123456789

        var yr1   = parseInt(d.substring(0,4));
        var mon1  = parseInt(d.substring(5,7));
        var dt1   = parseInt(d.substring(8,10));

        // console.log("YYYY-MM-DD:" + yr1 + mon1-1 + dt1);

        var date = new Date(yr1, mon1, dt1);

        var monthNames = [
          "January", "February", "March",
          "April", "May", "June", "July",
          "August", "September", "October",
          "November", "December"
        ];

        var day = date.getDate();
        var monthIndex = date.getMonth();
        var year = date.getFullYear();

        // console.log("day: " + day);
        // console.log("monthIndex: " + monthIndex);
        // console.log("year: " + year);
        //
        // console.log(day, monthNames[monthIndex], year);
        var dateString = (monthNames[monthIndex] + ' ' + day + ', ' + year);
        return dateString;
      }
      // end makeDatePretty()

      function wasUpgradeSuccess() {

        useraccnt.getuseraccnt(true).then(successGetuseraccnt, failGetuseraccnt);
        function successGetuseraccnt(result) {
          // result[0] =
          // {"user":37,"answer":0,"bizcat":"REB","email":"sjurowski+facebook@ucsd.edu","status":"1001:Rank-X Premium Business Plan:sub_9qe3oH617BKGWD","stripeid":"cus_9qe3Kburx73l2L","id":176}

          var hasSubscription = false;
          try {
            if (result[0].status.split(":")[0] && result[0].status.split(":")[0] == '1001') {
              hasSubscription = true;
              vm.useraccntStatus = result[0].status.split(":")[1];

              // --- this may hang your loop checker b/c never returns
              saveStripeInvoices();

              // reload goBack()
              // (this should fix an issue if someone tries to
              // cancel immediately, the local stripe server
              // might otherwise complain of modifying headers twice)
              // goBack();

              //reload the page now ... otherwise eventually
              //the page will time out with a call to '/charge' and
              //an error saying that you can't use a token more than once
              // window.location.href= '/#/mybiz';
              $state.go('cwrapper');

              return true;

            } else {
              return false;
            }
          }
          catch(err) {
              console.log("error while looking up subscription info from DF: " + JSON.stringify(err));
              return err;
          }
          return false;
        }
      }
      // -------- end **UPGRADE**  STRIPE LOOP CHECKERS
      // ------------------------------------------------------------
      // ------------------------------------------------------------



      // ------------------------------------------------------------
      // ------------------------------------------------------------
      // -------- **DOWNGRADE**  STRIPE LOOP CHECKERS
      function loopCheckDowngradeSuccess() {
         setTimeout(function () {
           //  call a 3s setTimeout when the loop is called
            //  your code here
            console.log('loopCheckDowngradeSuccess --> wasDowngradeSuccess');


            useraccnt.getuseraccnt(true).then(successGetuseraccnt, failGetuseraccnt);
            function successGetuseraccnt(result) {
              // result[0] =
              // {"user":37,"answer":0,"bizcat":"REB","email":"sjurowski+facebook@ucsd.edu","status":"1001:Rank-X Premium Business Plan:sub_9qe3oH617BKGWD","stripeid":"cus_9qe3Kburx73l2L","id":176}

              var checkAgain = true;
              console.log("i'm in, will check every 3 seconds for downgrade success");
              console.log("full result:");
              console.log(result);

              var hasSubscription = true;
              try {
                if (result[0].status == 0) {
                  console.log("i'm in2");

                  hasSubscription = false;
                  vm.useraccntStatus = result[0].status;

                  // reload goBack()
                  // (this should fix an issue if someone tries to
                  // cancel immediately, the local stripe server
                  // might otherwise complain of modifying headers twice)
                  // goBack();

                  vm.showGoodbye = true;
                  vm.showCurrentPlan = false;
                  // vm.showUpgrade = true;

                  // setTimeout(function(){
                  //     //redirect to the homepage after a while
                  //     $state.go('cwrapper');
                  // }, 2000);


                  return true;
                } else {
                  console.log("no subscription cancellation yet");
                  // return false;  <-- this will stop the looping
                }
              }
              catch(err) {
                  console.log("error while looking up subscription info from DF: " + JSON.stringify(err));

                  checkAgain = false;

                  return err;
              }


            i++;
            // if ( (i < 30) && (checkAgain == true) ) {
            if ( (1 < 2) && (checkAgain == true) ) {
              //recursion ... find another way if possible
              loopCheckDowngradeSuccess();
            } else {
              return;
            }
            //  ..  setTimeout()
          }
         }, 3000);
      }


      function wasDowngradeSuccess() {

        useraccnt.getuseraccnt(true).then(successGetuseraccnt, failGetuseraccnt);
        function successGetuseraccnt(result) {
          // result[0] =
          // {"user":37,"answer":0,"bizcat":"REB","email":"sjurowski+facebook@ucsd.edu","status":"1001:Rank-X Premium Business Plan:sub_9qe3oH617BKGWD","stripeid":"cus_9qe3Kburx73l2L","id":176}

          var hasSubscription = true;
          try {
            if (result[0].status == 0) {
              hasSubscription = false;
              vm.useraccntStatus = result[0].status;

              // reload goBack()
              // (this should fix an issue if someone tries to
              // cancel immediately, the local stripe server
              // might otherwise complain of modifying headers twice)
              // goBack(); <-- the loop never stops

              return true;
            } else {
              return false;
            }
          }
          catch(err) {
              console.log("error while looking up subscription info from DF: " + JSON.stringify(err));
              return err;
          }
          return false;
        }
      }
      // -------- end **DOWNGRADE**  STRIPE LOOP CHECKERS
      // ------------------------------------------------------------
      // ------------------------------------------------------------


      function failGetuseraccnt(err) {
        return err;
      }
      function _queryFailed(error) {
        // console.log("app/login/services/useraccnt.srvc.js:_queryFailed(error):result.data: " + JSON.stringify(result.data);

          throw error;
      }

      function goBack() {
          $state.go('cwrapper');
      }


    }
})();
