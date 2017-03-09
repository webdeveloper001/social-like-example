var express = require('express');
var bodyParser = require('body-parser');
var stripe = require('stripe')('sk_test_3wskGTu6PIB1tG5RedtvyRNL');
var http = require('http');
var querystring = require('querystring');
var unirest = require('unirest');

var app = express();
app.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use(bodyParser());
// app.use(bodyParser.json());
// !!!!!  RESTART THE SERVER WHEN YOU MAKE MODS TO THIS FILE !!!!!
// by using:
//            node <this base filename>.js

function log(message) {
  var fs = require('fs');
  filepath = 'log/log.txt';

  var today = new Date();
  var UTCstring = today.toUTCString();
  // Mon, 03 Jul 2006 21:44:38 GMT

  message = '\n---------------------------------' + '\n' + UTCstring + '::' + message;

  // var message = "";
  // message = '\nData to append';
  fs.appendFile(filepath, message, (err) => {
    if (err) throw err;
  });
}

function convertTimestampToDate(timestamp) {
  // var timestamp = 1382086394000;

  // log("------- welcome to the convertTimestampToDate function -------")
  // log("--   you want to convert timestamp: " + timestamp);

  // PRODUCED 1970 DATE
  // var d = new Date(timestamp);
  var d = new Date(timestamp*1000);
  var dateDoubleDigitString = d.getDate().toString();
  var monthDoubleDigitString = (d.getMonth() + 1).toString();

  if (parseInt(monthDoubleDigitString) < 10) {
    monthDoubleDigitString = '0' + monthDoubleDigitString;
  }

  if (parseInt(dateDoubleDigitString) < 10) {
    dateDoubleDigitString = '0' + dateDoubleDigitString;
  }

  // log("Date of your converted timestamp: " + d);
  var dateString = d.getFullYear() + '-' + monthDoubleDigitString + '-' + dateDoubleDigitString;
  // log("Short Date Format: " + dateString);
  return dateString;
}


var stripePlanDetails = '';
var stripeId = '';
var dfUseraccntId = 0;
var couponCode = 'NONE';

var stripeCustomer = {};
var stripeSubscriptionId = 0;

log("--- restarted Stripe communicator server ---");
log("***********   LOG TEST SUCCESSFUL ***************");


// ***************************************************
// ***************************************************
// START GET FROM Stripe
// ***************************************************

// respond with "hello world" when a GET request is made to the homepage
app.get('/', function (req, res, next) {
  res.send('hello world ... just responding to your GET request at \'/\'');
});

// app.get('/dreamfactory-user', function (req, res) {
app.get('/dreamfactory-stripe-user/:stripeId/:dfUseraccntId', function (req, res, next) {

  log(" ------------ START getStripeCustomerSubscriptionCopyToDatabase -------");
  // res.send('hello world ... just responding to your GET request at \'/dreamfactory-user\'');

  // AVAILABLE RELEVANT PARAMS that could be sent to us from ng localstorage
  // localStorage.getItem('user') ... will produce:
  //   {"email":"sjurowski+facebook@ucsd.edu",
  //   "first_name":"Sandon",
  //   "host":"bitnami-dreamfactory-df88",
  //   "id":37,
  //   "is_sys_admin":false,
  //   "last_login_date":"2016-12-13 21:04:47",
  //   "last_name":"Jurowski",
  //   "name":"Sandon Jurowski",
  //   "dfUseraccntId":245,
  //   "stripeId":"cus_A36js8CJzphovQ"}

  // req.params: { "userId": "34", "bookId": "8989" }
  log("req.params:" + JSON.stringify(req.params));

  // req.params: {"id":"7"}
  log("req.params['stripeId']:" + JSON.stringify(req.params["stripeId"]));
  if (req.params["stripeId"]) {
    stripeId = req.params["stripeId"];
  }

  log("req.params['dfUseraccntId']:" + JSON.stringify(req.params["dfUseraccntId"]));
  if (req.params["stripeId"]) {
    this.dfUseraccntId = req.params["dfUseraccntId"];
  }

  res.send('hello world ... just responding to your GET request at \'/dreamfactory-user/:stripeId/:dfUseraccntId\' with stripeId = ' + stripeId + ' and dfUseraccntId = ' + this.dfUseraccntId );

  // CALL STRIPE to get customer and then subscription information
  if (stripeId != '' && this.dfUseraccntId) {

    log(" ------------ CALLING getStripeCustomerSubscriptionCopyToDatabase -------");
    getStripeCustomerSubscriptionCopyToDatabase(stripeId);
    log(" ------------ RETURNED FROM CALLING getStripeCustomerSubscriptionCopyToDatabase -------");

    // ERROR THIS PROMISE NEVER RETURNS (PROBABLY YOU DIDN'T CREATE A PROMISE)
    // stripeCustomer = getStripeCustomerSubscriptionCopyToDatabase(stripeId).then(function (customerObject) {
    //   log(" ------------ PROMISE RETURNED (from getStripeCustomerSubscriptionCopyToDatabase) -------");
    //   log("customerObject: " + JSON.stringify(customerObject));
    //   log("customerObject.subscriptions: " + JSON.stringify(customerObject.customers));
    // }
    // ); // end run after getStripeCustomerSubscriptionCopyToDatabase returns an object

  } // end if stripeId != 0

  log(" ------------ END getStripeCustomerSubscriptionCopyToDatabase -------");

});
// ***************************************************
// END GET FROM Stripe
// ***************************************************
// ***************************************************




// ***************************************************
// ***************************************************
// START write to Stripe
// ***************************************************
// app.post('/cancel', function(req, res) {
app.post('/cancel', function(req, res, next) {
  log("------->>   STRIPE CANCEL via app = express();-------------");

  var stripeSubscriptionId = req.body.stripeSubscriptionId;
  this.dfUseraccntId = req.body.dfUseraccntId;

  log("calling stripe to cancel " + stripeSubscriptionId);
  // stripe.subscriptions.del("sub_3R3PlB2YlJe84a",
    // { at_period_end: true },

  //cancel immediately so that you can re-up immediately if needed
  stripe.subscriptions.del(stripeSubscriptionId,
    function(err, confirmation) {
      log("started w/ stripe cancellation");
      // asynchronously called
      if (err) {
          log("error while deleting subscription:" + JSON.stringify(err));
          res.send(500, err);
      }
      if (confirmation) {
          log("success deleting subscription: ");
          log(JSON.stringify(confirmation));

          log("update DreamFactory w/ subscription cancellation");
          // function writeToDreamFactory(updateReason, dfUseraccntId, stripeCustomerId, stripePlan) {
          writeToDreamFactory('cancelledSubscription', this.dfUseraccntId, 0, 0, 0, 0, 0 );
          log("back from updating DreamFactory");
          // res.send(200);
      }
    }
  );

  log("<<-------   end STRIPE CANCEL via app = express();-------------");
  res.send(204);
});



// ********************************************************************
// **********  STRIPE CHARGE THE CUSTOMER   ***************************
// I would not change that post url address below
// breaks customer creation saying "no valid payment method"
app.post('/charge', function(req, res, next) {
  log("------->>   STRIPE SUBSCRIBE via app = express();-------------");

  // Set your secret key: remember to change this to your live secret key in production
  // See your keys here: https://dashboard.stripe.com/account/apikeys


  // COMPLETE VARIABLE LIST FOR STRIPE: https://stripe.com/docs/checkout
  var stripePlan = '';
  stripePlan = req.body.stripePlan;

  var customerId = 0;

  // Get the credit card details submitted by the form
  var stripeToken = req.body.stripeToken;
  var hiddenRankxId = req.body.hiddenRankxId;
  this.dfUseraccntId = req.body.dfUseraccntId;
  var userEmail = req.body.hiddenUserEmail;
  this.couponCode = req.body.couponCode;

  log("req.body.couponCode: " + req.body.couponCode);

  var createNewCustomer = true;
  stripeId = req.body.stripeId;
  if (stripeId && stripeId != "0" && stripeId != "")  {
    createNewCustomer = false;
    customerId = stripeId;
  }

  var description = "dfUseraccntId:" + this.dfUseraccntId + ", hiddenRankxId:" + hiddenRankxId;


  // log("****** so it looks like hiddenRankxId is coming through as: " + JSON.stringify(hiddenRankxId));
  //
  // log("****** and dfUseraccntId is coming through as: " + JSON.stringify(this.dfUseraccntId));

  // log("****** and stripeId is coming through as: " + JSON.stringify(stripeId));
  // log("****** and stripePlan is coming through as: " + JSON.stringify(stripePlan));

  // log("****** and userEmail is coming through as: " + JSON.stringify(userEmail));

  if (createNewCustomer == true) {
    log("YES going to create a stripe customer");
    log("coupon code: " + this.couponCode);

    var customerObject = {};

    if (!this.couponCode || this.couponCode == '') {
      this.couponCode = "NONE";
    }

    stripe.coupons.retrieve(
      this.couponCode,
      function(err, coupon) {
        // asynchronously called
        if (coupon) {
          // couponCode is valid
        } else {
          this.couponCode = "NONE";
        }
      }
    );


    if (this.couponCode == "NONE") {

      var customer = stripe.customers.create({
          source: stripeToken,
          email: userEmail,
          description: description
      },
      function(err, customer) {
          // asynchronously called
              if (err) {
                  log("error creating customer. returning 500. err object:");
                  log(JSON.stringify(err));
                  res.send(500, err);
              } else {
                  log("customer object returned from Stripe: " + JSON.stringify(customer));

                  this.customerId = customer.id

                  log("new Stripe Customer ID: " + this.customerId);

                  writeToDreamFactory('newSubscription', this.dfUseraccntId, this.customerId, "0", 0, 0, 0 );
                  //
                  // //test moving this to the top if it's non-blocking
                  // res.send(204);

                  log("calling stripe to create the subscription for stripePlan: " + stripePlan);
                  createStripeSubscription(this.customerId, stripePlan);
              }
      });


    } else {
      var customer = stripe.customers.create({
          source: stripeToken,
          email: userEmail,
          description: description,
          coupon: this.couponCode
      },
      function(err, customer) {
          // asynchronously called
              if (err) {
                  log("error creating customer. returning 500. err object:");
                  log(JSON.stringify(err));
                  res.send(500, err);
              } else {
                  log("customer object returned from Stripe: " + JSON.stringify(customer));

                  this.customerId = customer.id

                  log("new Stripe Customer ID: " + this.customerId);

                  writeToDreamFactory('newSubscription', this.dfUseraccntId, this.customerId, "0", 0, 0, 0 );
                  //
                  // //test moving this to the top if it's non-blocking
                  // res.send(204);

                  log("calling stripe to create the subscription for stripePlan: " + stripePlan);
                  createStripeSubscription(this.customerId, stripePlan);
              }
      });

    }


  } else {
    log("Create Subscription (Stripe Customer already exists.)");
    createStripeSubscription(this.customerId, stripePlan);
    res.send(204);
  }


});
// **********  END STRIPE CHARGE THE CUSTOMER   ***************************
// ************************************************************************





// ********************************************************************
// **************     GET STRIPE CUSTOMER      ************************
function getStripeCustomerSubscriptionCopyToDatabase(stripeCustomerId) {
  var stripeCustomer = {};
  var stripeSubscription = {};
  var monthlyCost = 0.00;
  var nextPaymentDue = '';
  var lastPaymentMade = '';

  log("------ START getStripeCustomerSubscriptionCopyToDatabase --------")


  log("-----------------------------------------------------------");
  log("---------------------- CUSTOMERS     ----------------------");
  stripe.customers.retrieve(
    stripeCustomerId,
    function(err, customer) {
      stripeCustomer = customer;
      // asynchronously called
      log("STRIPE customer response: " + JSON.stringify(customer));
      // log("stripeCustomer object: " + JSON.stringify(stripeCustomer));

      // ***********************
      // EXAMPLE CUSTOMER RESPONSE OBJECT FROM STRIPE
      // stripeCustomer object:
      // {
      //   "id":"cus_A36js8CJzphovQ",
      //   "object":"customer",
      //   "account_balance":0,
      //   "created":1486103151,
      //   "currency":"usd",
      //   "default_source":"card_19j0VyChTCXrS8u52jZFkHBY",
      //   "delinquent":false,
      //   "description":"dfUseraccntId:245, hiddenRankxId:37",
      //   "discount":null,
      //   "email":"sjurowski+facebook@ucsd.edu",
      //   "livemode":false,
      //   "metadata":{},
      //   "shipping":null,
      //   "sources":
      //   {
      //     "object":"list",
      //     "data":
      //     [
      //       {
      //         "id":"card_19j0VyChTCXrS8u52jZFkHBY",
      //         "object":"card",
      //         "address_city":null,
      //         "address_country":null,
      //         "address_line1":null,
      //         "address_line1_check":null,
      //         "address_line2":null,
      //         "address_state":null,
      //         "address_zip":"99999",
      //         "address_zip_check":"pass",
      //         "brand":"Visa",
      //         "country":"US",
      //         "customer":"cus_A36js8CJzphovQ",
      //         "cvc_check":"pass",
      //         "dynamic_last4":null,
      //         "exp_month":12,
      //         "exp_year":2021,
      //         "fingerprint":"8T3vHSHe76tsgqF6",
      //         "funding":"credit",
      //         "last4":"4242",
      //         "metadata":{},
      //         "name":"jurowski@gmail.com",
      //         "tokenization_method":null
      //       }
      //     ],
      //     "has_more":false,
      //     "total_count":1,
      //     "url":"/v1/customers/cus_A36js8CJzphovQ/sources"
      //   },
      //   "subscriptions":
      //   {
      //     "object":"list",
      //     "data":
      //     [
      //       {
      //         "id":"sub_A36jXImdkPeOjy",
      //         "object":"subscription",
      //         "application_fee_percent":null,
      //         "cancel_at_period_end":false,
      //         "canceled_at":null,
      //         "created":1486103151,
      //         "current_period_end":1488522351,
      //         "current_period_start":1486103151,
      //         "customer":"cus_A36js8CJzphovQ",
      //         "discount":null,
      //         "ended_at":null,
      //         "items":
      //         {
      //           "object":"list",
      //           "data":
      //           [
      //             {
      //               "id":"si_19j0W3ChTCXrS8u5VRcwz21l",
      //               "object":"subscription_item",
      //               "created":1486103152,
      //               "plan":
      //               {
      //                 "id":"1001",
      //                 "object":"plan",
      //                 "amount":5000,
      //                 "created":1480288330,
      //                 "currency":"usd",
      //                 "interval":"month",
      //                 "interval_count":1,
      //                 "livemode":false,
      //                 "metadata":{},
      //                 "name":"Rank-X Premium Business Plan - Tier 1",
      //                 "statement_descriptor":"Rank-X Prem Bus Plan",
      //                 "trial_period_days":null
      //               },                  "quantity":1
      //             }
      //           ],
      //           "has_more":false,
      //           "total_count":1,
      //           "url":"/v1/subscription_items?subscription=sub_A36jXImdkPeOjy"
      //         },
      //         "livemode":false,
      //         "metadata":{},
      //         "plan":
      //         {
      //           "id":"1001",
      //           "object":"plan",
      //           "amount":5000,
      //           "created":1480288330,
      //           "currency":"usd",
      //           "interval":"month",
      //           "interval_count":1,
      //           "livemode":false,
      //           "metadata":{},
      //           "name":"Rank-X Premium Business Plan - Tier 1",
      //           "statement_descriptor":"Rank-X Prem Bus Plan",
      //           "trial_period_days":null
      //         },
      //         "quantity":1,
      //         "start":1486103151,
      //         "status":"active",
      //         "tax_percent":null,
      //         "trial_end":null,
      //         "trial_start":null
      //       }
      //     ],
      //     "has_more":false,
      //     "total_count":1,
      //     "url":"/v1/customers/cus_A36js8CJzphovQ/subscriptions"
      //   }
      //
      // } // end example customer return object
      // ------- END CUSTOMER ------------
      // ---------------------------------



      log("-----------------------------------------------------------");
      log("---------------------- SUBSCRIPTIONS ----------------------");
      // ***********************
      // NOW GET SUBSCRIPTIONS OBJECT
      log("---% stripeCustomer.subscriptions: " + JSON.stringify(stripeCustomer.subscriptions));


      log("----- MONTHLY COST -------");
      monthlyCost = (stripeCustomer.subscriptions.data[0].plan.amount)/100;
      log("monthlyCost: " + JSON.stringify(monthlyCost));



      log("----- SUBSCRIPTION DATA[0] -------")
      log("stripeCustomer.subscriptions.data[0]: " + JSON.stringify(stripeCustomer.subscriptions.data[0]));
      // PRODUCES:
      // {
      //   "id":"sub_A36jXImdkPeOjy",
      //   "object":"subscription",
      //   "application_fee_percent":null,
      //   "cancel_at_period_end":false,
      //   "canceled_at":null,
      //   "created":1486103151,
      //   "current_period_end":1488522351,
      //   "current_period_start":1486103151,
      //   "customer":"cus_A36js8CJzphovQ",
      //   "discount":null,
      //   "ended_at":null,
      //   "items":{
      //     "object":"list",
      //     "data":[
      //       {
      //         "id":"si_19j0W3ChTCXrS8u5VRcwz21l",
      //         "object":"subscription_item",
      //         "created":1486103152,
      //         "plan":{
      //           "id":"1001",
      //           "object":"plan",
      //           "amount":5000,
      //           "created":1480288330,
      //           "currency":"usd",
      //           "interval":"month",
      //           "interval_count":1,
      //           "livemode":false,
      //           "metadata":{
      //
      //           },
      //           "name":"Rank-X Premium Business Plan - Tier 1",
      //           "statement_descriptor":"Rank-X Prem Bus Plan",
      //           "trial_period_days":null
      //         },
      //         "quantity":1
      //       }
      //     ],
      //     "has_more":false,
      //     "total_count":1,
      //     "url":"/v1/subscription_items?subscription=sub_A36jXImdkPeOjy"
      //   },
      //   "livemode":false,
      //   "metadata":{
      //
      //   },
      //   "plan":{
      //     "id":"1001",
      //     "object":"plan",
      //     "amount":5000,
      //     "created":1480288330,
      //     "currency":"usd",
      //     "interval":"month",
      //     "interval_count":1,
      //     "livemode":false,
      //     "metadata":{
      //
      //     },
      //     "name":"Rank-X Premium Business Plan - Tier 1",
      //     "statement_descriptor":"Rank-X Prem Bus Plan",
      //     "trial_period_days":null
      //   },
      //   "quantity":1,
      //   "start":1486103151,
      //   "status":"active",
      //   "tax_percent":null,
      //   "trial_end":null,
      //   "trial_start":null
      // }
      // ***********************

      // EXAMPLE subscriptions object
      // stripeCustomer.subscriptions:{
      //   "object":"list",
      //   "data":[
      //     {
      //       "id":"sub_A36jXImdkPeOjy",
      //       "object":"subscription",
      //       "application_fee_percent":null,
      //       "cancel_at_period_end":false,
      //       "canceled_at":null,
      //       "created":1486103151,
      //       "current_period_end":1488522351,
      //       "current_period_start":1486103151,
      //       "customer":"cus_A36js8CJzphovQ",
      //       "discount":null,
      //       "ended_at":null,
      //       "items":{
      //         "object":"list",
      //         "data":[
      //           {
      //             "id":"si_19j0W3ChTCXrS8u5VRcwz21l",
      //             "object":"subscription_item",
      //             "created":1486103152,
      //             "plan":{
      //               "id":"1001",
      //               "object":"plan",
      //               "amount":5000,
      //               "created":1480288330,
      //               "currency":"usd",
      //               "interval":"month",
      //               "interval_count":1,
      //               "livemode":false,
      //               "metadata":{
      //
      //               },
      //               "name":"Rank-X Premium Business Plan - Tier 1",
      //               "statement_descriptor":"Rank-X Prem Bus Plan",
      //               "trial_period_days":null
      //             },
      //             "quantity":1
      //           }
      //         ],
      //         "has_more":false,
      //         "total_count":1,
  //           "url":"/v1/subscription_items?subscription=sub_A36jXImdkPeOjy"
      //       },
      //       "livemode":false,
      //       "metadata":{},
      //       "plan":{
      //         "id":"1001",
      //         "object":"plan",
      //         "amount":5000,
      //         "created":1480288330,
      //         "currency":"usd",
      //         "interval":"month",
      //         "interval_count":1,
      //         "livemode":false,
      //         "metadata":{
      //
      //         },
      //         "name":"Rank-X Premium Business Plan - Tier 1",
      //         "statement_descriptor":"Rank-X Prem Bus Plan",
      //         "trial_period_days":null
      //       },
      //       "quantity":1,
      //       "start":1486103151,
      //       "status":"active",
      //       "tax_percent":null,
      //       "trial_end":null,
      //       "trial_start":null
      //     }
      //   ],
      //   "has_more":false,
      //   "total_count":1,
      //   "url":"/v1/customers/cus_A36js8CJzphovQ/subscriptions"
      //
      //     } // end sample output of the subscriptions object

      // END NOW GET SUBSCRIPTIONS OBJECT
      // ***********************
      log("----  END SUBSCRIPTIONS -----------------------------------");
      log("-----------------------------------------------------------");



      // ***********************
      log("-----------------------------------------------------------");
      log("----  INVOICES          -----------------------------------");

      // TypeError: Converting circular structure to JSON
      // log("stripe.invoices: " + JSON.stringify(stripe.invoices) );
      log("stripe.invoices: " + stripe.invoices);


      log("----- SHOW ALL INVOICES -------");
      var stripeInvoices = stripe.invoices.list(
        {
          // limit: 10,
          customer: stripeCustomerId,
          paid: true
        },
        function(err, invoices) {
          // asynchronously called

          // console.log("invoices.data: " + invoices.data);

          // var lastPaymentMade = '';
          // var nextPaymentDue = '';
          var largestPaymentDate = 0;
          for (invoice of invoices.data) {
            // ... do something with invoice ...
            // log("invoice: " + invoice);
            log("invoice: " + JSON.stringify(invoice));
            log("invoice.date: " + invoice.date);

            log("checking if invoice.date of " + invoice.date + " is > than current value of largestPaymentDate: " + largestPaymentDate);
            if ( invoice.date > largestPaymentDate) {
              log("yes it was bigger, so setting largestPaymentDate to " + invoice.date);

              largestPaymentDate = invoice.date;

              log("largestPaymentDate: " + largestPaymentDate);
            }
          }
          lastPaymentMade = largestPaymentDate;
          nextPaymentDue = lastPaymentMade + (86400*30);
          // log("---- - -- - - -- -nexdtPaymentDue: " + nextPaymentDue);
          // add a day to a unix timestamp
          // + (1000*60*60*24)

          // add a month
          // + (1000*60*60*24)*30

          log("lastPaymentMade: " + convertTimestampToDate(lastPaymentMade));
          log("nextPaymentDue: " + convertTimestampToDate(nextPaymentDue));
          log("monthlyCost: " + monthlyCost);

          log("this.dfUseraccntId: " + this.dfUseraccntId);

          writeToDreamFactory('updateInvoiceChargeInfo', this.dfUseraccntId, "0", "0", monthlyCost, convertTimestampToDate(nextPaymentDue), convertTimestampToDate(lastPaymentMade) );


          // ----------------------------
          // --- Sample Invoice   ---
          // {
          //   "id":"in_19j0W3ChTCXrS8u5tHsd3Yre",
          //   "object":"invoice",
          //   "amount_due":5000,
          //   "application_fee":null,
          //   "attempt_count":1,
          //   "attempted":true,
          //   "charge":"ch_19j0W3ChTCXrS8u5P51ZApcR",
          //   "closed":true,
          //   "currency":"usd",
          //   "customer":"cus_A36js8CJzphovQ",
          //   "date":1486103151,
          //   "description":null,
          //   "discount":null,
          //   "ending_balance":0,
          //   "forgiven":false,
          //   "lines":{
          //     "object":"list",
          //     "data":[
          //       {
          //         "id":"sub_A36jXImdkPeOjy",
          //         "object":"line_item",
          //         "amount":5000,
          //         "currency":"usd",
          //         "description":null,
          //         "discountable":true,
          //         "livemode":false,
          //         "metadata":{
          //
          //         },
          //         "period":{
          //           "start":1486103151,
          //           "end":1488522351
          //         },
          //         "plan":{
          //           "id":"1001",
          //           "object":"plan",
          //           "amount":5000,
          //           "created":1480288330,
          //           "currency":"usd",
          //           "interval":"month",
          //           "interval_count":1,
          //           "livemode":false,
          //           "metadata":{
          //
          //           },
          //           "name":"Rank-X Premium Business Plan - Tier 1",
          //           "statement_descriptor":"Rank-X Prem Bus Plan",
          //           "trial_period_days":null
          //         },
          //         "proration":false,
          //         "quantity":1,
          //         "subscription":null,
          //         "subscription_item":"si_19j0W3ChTCXrS8u5VRcwz21l",
          //         "type":"subscription"
          //       }
          //     ],
          //     "has_more":false,
          //     "total_count":1,
          //     "url":"/v1/invoices/in_19j0W3ChTCXrS8u5tHsd3Yre/lines"
          //   },
          //   "livemode":false,
          //   "metadata":{
          //
          //   },
          //   "next_payment_attempt":null,
          //   "paid":true,
          //   "period_end":1486103151,
          //   "period_start":1486103151,
          //   "receipt_number":null,
          //   "starting_balance":0,
          //   "statement_descriptor":null,
          //   "subscription":"sub_A36jXImdkPeOjy",
          //   "subtotal":5000,
          //   "tax":null,
          //   "tax_percent":null,
          //   "total":5000,
          //   "webhooks_delivered_at":1486103152
          // }
          // --- END Sample Invoice   ---
          // ----------------------------

        }
      );

      log("----  END INVOICES          -------------------------------");
      log("-----------------------------------------------------------");
      // ***********************



    }
  ); // END get stripe customer    cutomers.retrieve();
  log("------ END getStripeCustomerSubscriptionCopyToDatabase --------")
}
// **************    END GET STRIPE CUSTOMER   ************************
// ********************************************************************




// ********************************************************************
// **************    CREATE A NEW SUBSCRIPTION ************************
function createStripeSubscription(customerId, stripePlan) {

  stripe.subscriptions.create({
    customer: customerId,
    plan: stripePlan,
  }, function(err, subscription) {
    // asynchronously called
    if (err) {
        log("error while creating subscription:" + JSON.stringify(err));
        // res.send(500, err);
        return err;
    } else {
        log("success creating subscription: ");
        log(JSON.stringify(subscription));
//                       returned subscription object example:
// {"id":"sub_9qYX7LQPh6ouLg","object":"subscription","application_fee_percent":null,"cancel_at_period_end":false,"canceled_at":null,"created":1483208267,"current_period_end":1485886667,"current_period_start":1483208267,"customer":"cus_9qYXTlosRljd0i","discount":null,"ended_at":null,"livemode":false,"metadata":{},
// "plan":
//   {"id":"1001","object":"plan","amount":5000,"created":1480288330,"currency":"usd","interval":"month","interval_count":1,"livemode":false,"metadata":{},"name":"Rank-X Premium Business Plan","statement_descriptor":"Rank-X Prem Bus Plan","trial_period_days":null},"quantity":1,"start":1483208267,"status":"active","tax_percent":null,"trial_end":null,"trial_start":null}
// //

      stripePlanDetails = subscription.plan.id + ':' + subscription.plan.name + ':' + subscription.id;
      // stripePlanDetails = subscription.plan.id;

      log("stripePlanDetails: ");
      log(stripePlanDetails);

      writeToDreamFactory('newSubscription', this.dfUseraccntId, customerId, stripePlanDetails, 0, 0, 0 );
      log("back from writing to DreamFactory");

      //test moving this to the top if it's non-blocking
      // res.send(204);
      return subscription;
    }

  });

}
// **************    END CREATE A NEW SUBSCRIPTION ********************
// ********************************************************************



// ********************************************************************
// **************    WRITE TO DREAMFACTORY         ********************
// updateReasons options:
//  newSubscription,
//  cancelledSubscription,
//  updateInvoiceChargeInfo
      // "monthlyCost" : '--',
      // "nextPaymentDue": '--',
      // "lastPaymentMade": '--'

function writeToDreamFactory(updateReason, dfUseraccntId, stripeCustomerId, stripePlan, monthlyCost, nextPaymentDue, lastPaymentMade) {
  log("-------  writeToDreamFactory via UniRest: -------------");
  // http://unirest.io/nodejs.html

  var server = 'http://bitnami-dreamfactory-df88.westus.cloudapp.azure.com';
  var path = '/api/v2/mysql/_table/useraccnts/' + this.dfUseraccntId;

  var url = server + path;
  // var params = '?fields=stripeid&id_type=int&id_field=id';

  var params = {};
  if (updateReason == 'newSubscription') {
    params = {
      "id": this.dfUseraccntId,
      "status" : stripePlan,
      "stripeid": stripeCustomerId,
      "COUPON": this.couponCode
    };
  }
  if (updateReason == 'cancelledSubscription') {
    params = {
      "id": this.dfUseraccntId,
      "status" : 0
    };
  }
  if (updateReason == 'updateInvoiceChargeInfo') {
    params = {
      "id": this.dfUseraccntId,
      "monthlyCost" : monthlyCost,
      "nextPaymentDue": nextPaymentDue,
      "lastPaymentMade": lastPaymentMade
    };
  }

  // .send({
  //   "id": dfUseraccntId,
  //   "stripeid": stripeCustomerId,
  //   "status" : stripePlan
  // })

// using UniRest, patch df via url: http://bitnami-dreamfactory-df88.westus.cloudapp.azure.com/api/v2/mysql/_table/useraccnts/ with params: {"id":"","status":"0","stripeid":"cus_9r6oQ4JV0UFgtz"}

  log("using UniRest, patch df via url: " + url + " with params: " + JSON.stringify(params));
  unirest.patch(url)
  .headers({
    'Accepts': 'application/json',
    'Content-Type': 'application/json',
    'X-DreamFactory-Api-Key': '7e9a54a80a6ae850bc38ff768d75e143e75c273d1f7e2f265648020bf8c42a3b'
  })
  .send(JSON.stringify(params))
  .end(function (response) {
    log(JSON.stringify(response.body));
  });
  log("<<-------   end STRIPE SUBSCRIBE via app = express();-------------");
}
// **************    END WRITE TO DREAMFACTORY         ****************
// ********************************************************************


app.use(express.static(__dirname));
app.listen(process.env.PORT || 3000);
