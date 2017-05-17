var express = require('express');
var bodyParser = require('body-parser');

var API_KEY = 'sk_test_3wskGTu6PIB1tG5RedtvyRNL';
var CLIENT_ID = 'ca_AdOtLByD0cfx8W3d76nnKqLjruvHmGlh';
var stripe = require('stripe')(API_KEY);
var http = require('http');
var querystring = require('querystring');
var unirest = require('unirest');
var request = require('request');
var jsonfile = require('jsonfile');
var configFilePath = 'config.json';
var moment = require('moment');

//for image download
var fs = require('fs'),
    request = require('request');
var azure = require('azure-storage');
var blobSvc = azure.createBlobService('rankx', 'PrnitxLed+IWZzITtd+seNgtFrsjfnHaTKvuUNVpfjtw6NAPnnJVIYtxVsc7z8miCT16kHSNdsnQMtH06DB+Rw==');

var app = express();
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
var rankxBaseUrl = "https://rank-x.com";
// var rankxBaseUrl = "http://localhost:3006";



app.all('*', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});


//app.use(express.static('public'))


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
    var d = new Date(timestamp * 1000);
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
var useraccntId = 0;
var dfUseraccntId = 0;
var couponCode = 'NONE';

var stripeCustomer = {};
var stripeSubscriptionId = 0;

log("--- Started rank-x communicator server ---");


app.get('/', function(req, res) {
    log('This is a log record from an empty GET request');
    res.send('Hello World from Rank-X Server! We are alive and well!');
});

app.get('/stripeServer/', function(req, res, next) {
    log("***********   responding to your GET request to Stripe Server ***************");
    res.send('hello world ... just responding to your GET request to the Stripe Server \'/\'');

});

app.get('/settings/', function(req, res, next) {
    var config = jsonfile.readFileSync(configFilePath);
    config.serverDate = moment().format('YYYY-MM-DD');
    res.json({settings:config});
});

app.post('/settings/', function(req, res, next) {
    var config = jsonfile.readFileSync(configFilePath);
    
    for (key in req.body){
        config[key] = req.body[key];
    }
    jsonfile.writeFileSync(configFilePath, config);
    config.serverDate = moment().format('YYYY-MM-DD');
    res.json({settings:config});
});

app.get('/stripeServer/:stripeId/invoices', function(req, res, next) {
    var _invoices;
    var stripeInvoices = stripe.invoices.list({
            // limit: 10,
            customer: req.params['stripeId'],
            //paid: true
    })
    .then(function(invoices){
        _invoices = invoices;
        return stripe.customers.retrieve( req.params['stripeId'])
    })
    .then(function(customer){
        res.json({
            invoices:_invoices,
            customer:customer
        });
    }).catch(function (err){
        res.status(400).json({err:err});
    });
});


app.get('/stripeServer/connectpromoter', function(req, res, next) {
    var code = req.query.code;
    var promoterId = req.query.state;
    // Make /oauth/token endpoint POST request
    request.post({
        url: 'https://connect.stripe.com/oauth/token',
        form: {
            grant_type: "authorization_code",
            client_id: CLIENT_ID,
            code: code,
            client_secret: API_KEY
        }
    }, function(err, r, body) {
        var accessToken = JSON.parse(body).access_token;
        var stripe_user_id = JSON.parse(body).stripe_user_id;

        writeToDreamFactoryPromoters("updatePromoterStripeId", promoterId, {stripeid: stripe_user_id}, res);
    });
});

app.get('/stripeServer/:stripeId/:useraccntId/deleteCustomer', function(req, res, next) {
    var _invoices;
    var stripeInvoices = stripe.customers.del(req.params['stripeId'])
    .then(function(confirmation){
        if( confirmation.deleted == true ){
            
            writeToDreamFactory('deleteAccount', req.params['useraccntId'], 0, {});
            res.status(204);
        }
    }).catch(function (err){
        res.status(400).json({err:err});
    });
});


app.post('/stripeServer/payPromoter', function(req, res, next) {
    stripe.transfers.create({
        amount: Math.floor(req.body.amount),
        currency: "usd",
        // source_transaction:"ch_1AIiTkChTCXrS8u5XMp1bMl9",
        destination: req.body.stripeId,
    }).then(function(transfer) {
        console.log(transfer);
        writeToDreamFactoryPromoters("updatePaymentDate", req.body.promoterId, {lastPaymentDate: moment().format('YYYY-MM-DD')}, res)
        .end(function(response){
            res.json({transfer: transfer, lastPaymentDate: moment().format('YYYY-MM-DD')});
        });
    }).catch(function(err){
        console.log(err);
        res.status(400).json({err: err});
    });
});
   
// app.get('/dreamfactory-user', function (req, res) {
app.get('/dreamfactory-stripe-user/:stripeId/:useraccntId', function(req, res, next) {

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

    log("req.params['useraccntId']:" + JSON.stringify(req.params["useraccntId"]));
    if (req.params["useraccntId"]) {
        useraccntId = req.params["useraccntId"];
    }

    // res.send('hello world ... just responding to your GET request at \'/dreamfactory-user/:stripeId/:useraccntId\' with stripeId = ' + stripeId + ' and useraccntId = ' + useraccntId);

    // CALL STRIPE to get customer and then subscription information
    if (stripeId != '' && useraccntId) {
        log(" ------------ CALLING getStripeCustomerSubscriptionCopyToDatabase -------");
        getStripeCustomerSubscriptionCopyToDatabase(stripeId, useraccntId); //417
        log(" ------------ RETURNED FROM CALLING getStripeCustomerSubscriptionCopyToDatabase -------");

        // ERROR THIS PROMISE NEVER RETURNS (PROBABLY YOU DIDN'T CREATE A PROMISE)
        // stripeCustomer = getStripeCustomerSubscriptionCopyToDatabase(stripeId).then(function (customerObject) {
        //   log(" ------------ PROMISE RETURNED (from getStripeCustomerSubscriptionCopyToDatabase) -------");
        //   log("customerObject: " + JSON.stringify(customerObject));
        //   log("customerObject.subscriptions: " + JSON.stringify(customerObject.customers));
        // }
        // ); // end run after getStripeCustomerSubscriptionCopyToDatabase returns an object

        return stripe.customers.retrieve(stripeId)
        .then(function(customer){
            res.json(customer);
        }).catch(function (err){
            res.status(400).json({err:err});
        });
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
app.post('/StripeServer/cancel', function(req, res, next) {
    log("------->>   STRIPE CANCEL via app = express();-------------");

    var stripeCustomerId = req.body.stripeId;
    this.useraccntId = req.body.useraccntId;
    var cancelAll = req.body.cancelAll;
    var cancelPremium = req.body.cancelPremium;
    var cancelRanks = req.body.cancelRanks;
    var cancelNumRanks = req.body.cancelNumRanks;
    var stripesub = req.body.stripesub;
    var stripesipremium = req.body.stripesipremium;
    var stripesiranks = req.body.stripesiranks;

    var cancelData = req.body;

    log("req from cancel " + JSON.stringify(req.body));
    //log("cancel all: " + cancelAll + " cancel Premium: " + cancelPremium + " cancel Ranks: " + cancelRanks);
    //log("calling stripe to cancel " + stripeSubscriptionId);
    // stripe.subscriptions.del("sub_3R3PlB2YlJe84a",
    // { at_period_end: true },

    if (cancelAll) {
        stripe.subscriptions.del(
            stripesub,
            function(err, confirmation) {
                // asynchronously called
                if (err) {
                    log("error while deleting subscription:" + JSON.stringify(err));
                    res.send(500, err);
                }
                if (confirmation) {
                    log("success deleting subscription: ");
                    res.send(200);
                }
            }
        );
    } else if (cancelPremium) {
        stripe.subscriptionItems.del(
            stripesipremium,
            function(err, subscriptionItem) {
                // asynchronously called
                if (err) {
                    log("error while deleting Premium subscription:" + JSON.stringify(err));
                    //res.send(500, err);
                    res.status(500).send(err);
                }
                if (subscriptionItem) {
                    log("success deleting Premium subscription: ");
                    res.send(200);
                }
            }
        );
    } else if (cancelRanks) {
        stripe.subscriptionItems.del(
            stripesiranks,
            function(err, subscriptionItem) {
                // asynchronously called
                if (err) {
                    log("error while deleting Ranks subscription:" + JSON.stringify(err));
                    res.send(500, err);
                }
                if (subscriptionItem) {
                    log("success deleting Ranks subscription: ");
                    res.send(200);
                }
            }
        );
    }

    /*
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
      );*/
    writeToDreamFactory('cancelledSubscription', this.useraccntId, 0, cancelData);
    log("<<-------   end STRIPE CANCEL via app = express();-------------");
    //res.send(204);
});

// ********************************************************************
// **********  STRIPE EDIT NUMBER OF RANKS   ***************************
app.post('/StripeServer/edit', function(req, res, next) {
    log("------->>   STRIPE EDIT RANKS via app = express();-------------");
    var action = req.body.action;
    var numRanks = req.body.numRanks;
    var stripeId = req.body.stripeId;
    var useraccntId = req.body.useraccntId;
    var stripesub = req.body.stripesub;
    var stripesiranks = req.body.stripesiranks;

    var editData = req.body;

    //Update subscription
    stripe.subscriptionItems.update(
        stripesiranks, {
            quantity: numRanks,
        },
        function(err, transfer) {
            // asynchronously called
            if (err) {
                log("error while updating custom ranks..." + JSON.stringify(err));
                res.status(500).send(err);
            }
            if (transfer) {
                log("success updating custom ranks ");
                res.send(200);
            }

        }
    );

    writeToDreamFactory('updateSubscription', useraccntId, 0, editData);
});

// ********************************************************************
// **********  STRIPE CHARGE THE CUSTOMER   ***************************
// Change the source of the customer with new card NUMBER
app.post('/StripeServer/changeSource', function(req, res, next) {
    log("------->> START STRIPE ChangeSource via app = express();-------------");
    var stripeId = req.body.stripeId;
    if (stripeId && stripeId != "0" && stripeId != "") {
        stripe.customers.retrieve(stripeId)
        .then(function(customer){
            return stripe.customers.update(stripeId, {
                source: req.body.stripeToken
            });
        })
        .then(function(customer){
            res.redirect(rankxBaseUrl + '/mybusiness?cardUpdate=success');
        })
        .catch(function(err){
            res.redirect(rankxBaseUrl + '/mybusiness?cardUpdate=fail&message=Update Failed Due to ' + err.message);
        })
    } else {
        res.status(400).json({
            message: "No stripe Id is mentioned"
        });
    }
    
    log("------->> END STRIPE ChangeSource via app = express();-------------");
});


// ********************************************************************
// **********  STRIPE CHARGE THE CUSTOMER   ***************************
// I would not change that post url address below
// breaks customer creation saying "no valid payment method"
app.post('/StripeServer/charge', function(req, res, next) {
    log("------->>   STRIPE SUBSCRIBE via app = express();-------------");

    // Set your secret key: remember to change this to your live secret key in production
    // See your keys here: https://dashboard.stripe.com/account/apikeys

    // COMPLETE VARIABLE LIST FOR STRIPE: https://stripe.com/docs/checkout
    var stripePlan = '';
    //stripePlan = req.body.stripePlan;

    var customerId = 0;

    // Get the credit card details submitted by the form
    var stripeToken = req.body.stripeToken;
    var userId = req.body.userId;
    this.useraccntId = req.body.useraccntId;
    var userEmail = req.body.userEmail;
    this.couponValid = req.body.couponValid;
    this.getPremium = req.body.getPremiumPlan;
    this.getRanks = req.body.getCustomRanks;
    this.ranksQuantity = req.body.ranksQuantity;

    log("useraccntId " + this.useraccntId + " this.getPremium " + this.getPremium + " this.getRanks " + this.getRanks + " this.ranksQuantity " + this.ranksQuantity);

    //Create susbsciption object
    var subscriptions = [];
    if (this.getPremium == 'true') {
        var item = {};
        item.plan = "premium-plan-REB";
        subscriptions.push(item);
    }
    if (this.getRanks == 'true') {
        var item = {};
        item.plan = "custom-rank";
        item.quantity = this.ranksQuantity;
        subscriptions.push(item);
    }

    if (this.couponValid == 'true') {
        this.couponCode = 'startup-promo';
        
        writeToDreamFactory('setPromoCode', useraccntId, "0", {promoCode: req.body.promoCode});
    }
    else this.couponCode = '';

    //log("req.body.couponCode: " + req.body.couponCode);

    var createNewCustomer = true;
    stripeId = req.body.stripeId;
    if (stripeId && stripeId != "0" && stripeId != "") {
        createNewCustomer = false;
        this.customerId = stripeId;
    }

    var description = "useraccount:" + this.useraccntId + ", user:" + userId;

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

                        //writeToDreamFactory('newSubscription', this.useraccntId, this.customerId, "0", 0, 0, 0 );
                        //
                        // //test moving this to the top if it's non-blocking
                        //res.sendStatus(status);
                        res.send(204);
                        log("calling stripe to create subscriptions");
                        createStripeSubscription(this.customerId, subscriptions);
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

                        //writeToDreamFactory('newSubscription', this.useraccntId, this.customerId, "0", 0, 0, 0 );
                        //
                        // //test moving this to the top if it's non-blocking
                        //res.sendStatus(status);
                        res.send(204);

                        log("calling stripe to create subscriptions");
                        createStripeSubscription(this.customerId, subscriptions);
                    }
                });

        }


    } else {
        log("Create Subscription (Stripe Customer already exists.)");
        createStripeSubscription(this.customerId, subscriptions);
        res.send(204)
            //res.sendStatus(status);
    }


});
// **********  END STRIPE CHARGE THE CUSTOMER   ***************************
// ************************************************************************





// ********************************************************************
// **************     GET STRIPE CUSTOMER      ************************
function getStripeCustomerSubscriptionCopyToDatabase(stripeCustomerId, useraccntId) {
    var stripeCustomer = {};
    var stripeSubscription = {};
    var monthlyCost = 0.00;
    var nextPaymentDue = '';
    var lastPaymentMade = '';
    var customerData = {};

    log("------ START getStripeCustomerSubscriptionCopyToDatabase --------")


    log("-----------------------------------------------------------");
    log("---------------------- CUSTOMERS     ----------------------");
    stripe.customers.retrieve(
        stripeCustomerId,
        function(err, customer) {
            stripeCustomer = customer;
            // asynchronously called
            log("STRIPE customer response: " + JSON.stringify(customer));

            // NOW GET SUBSCRIPTIONS OBJECT
            log("---% stripeCustomer.subscriptions: " + JSON.stringify(stripeCustomer.subscriptions));

            log("----- MONTHLY COST -------");
            //monthlyCost = (stripeCustomer.subscriptions.data[0].items.data[0].plan.amount)/100;
            //log("monthlyCost: " + JSON.stringify(monthlyCost));

            //log("----- SUBSCRIPTION DATA[0] -------")
            log("stripeCustomer.subscriptions.data[0]: " + JSON.stringify(stripeCustomer.subscriptions.data[0]));
            log("----  END SUBSCRIPTIONS -----------------------------------");
            //log("-----------------------------------------------------------");
            //log("-----------------------------------------------------------");
            var subItem = {};

            //initialize data
            customerData.ispremium = false;
            customerData.hasranks = false;
            customerData.stripesipremium = '';
            customerData.stripesiranks = '';
            customerData.stripesub = '';

            if (stripeCustomer.subscriptions.data[0]) {
                customerData.stripesub = stripeCustomer.subscriptions.data[0].id;
                if (stripeCustomer.subscriptions.data[0].items.data) {
                    for (var i = 0; i < stripeCustomer.subscriptions.data[0].items.data.length; i++) {
                        subItem = stripeCustomer.subscriptions.data[0].items.data[i];
                        if (subItem.plan.id.indexOf('premium') > -1) {
                            customerData.ispremium = true;
                            customerData.stripesipremium = subItem.id;
                            monthlyCost = monthlyCost + subItem.plan.amount * (subItem.quantity);
                        }
                        if (subItem.plan.id.indexOf('custom-rank') > -1) {
                            customerData.hasranks = true;
                            customerData.stripesiranks = subItem.id;
                            customerData.ranksqty = subItem.quantity;
                            monthlyCost = monthlyCost + subItem.plan.amount * (subItem.quantity);
                        }
                    }
                }
            }
            if (stripeCustomer.subscriptions.data[1]) {
                customerData.stripesub = stripeCustomer.subscriptions.data[1].id;
                if (stripeCustomer.subscriptions.data[1].items.data) {
                    for (var i = 0; i < stripeCustomer.subscriptions.data[1].items.data.length; i++) {
                        subItem = stripeCustomer.subscriptions.data[1].items.data[i];
                        if (subItem.plan.id.indexOf('premium') > -1) {
                            customerData.ispremium = true;
                            customerData.stripesipremium = subItem.id;
                            monthlyCost = monthlyCost + subItem.plan.amount * (subItem.quantity);
                        }
                        if (subItem.plan.id.indexOf('custom-rank') > -1) {
                            customerData.hasranks = true;
                            customerData.stripesiranks = subItem.id;
                            customerData.ranksqty = subItem.quantity;
                            monthlyCost = monthlyCost + subItem.plan.amount * (subItem.quantity);
                        }
                    }
                }
            }
            var istrial = false;
            var discountEndDate = null;
            if ( stripeCustomer.discount ) {
                istrial = stripeCustomer.discount.end < + new Date();
                discountEndDate = convertTimestampToDate(stripeCustomer.discount.end);
            }
            
            customerData.monthlyCost = monthlyCost;
            customerData.istrial = istrial;
            customerData.discountEndDate = discountEndDate;
            log("----  INVOICES          -----------------------------------");

            // TypeError: Converting circular structure to JSON
            // log("stripe.invoices: " + JSON.stringify(stripe.invoices) );
            //log("stripe.invoices: " + stripe.invoices);


            //log("----- SHOW ALL INVOICES -------");
            var stripeInvoices = stripe.invoices.list({
                    // limit: 10,
                    customer: stripeCustomerId,
                    //paid: true
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
                        //log("invoice: " + JSON.stringify(invoice));
                        //log("invoice.date: " + invoice.date);

                        //log("checking if invoice.date of " + invoice.date + " is > than current value of largestPaymentDate: " + largestPaymentDate);
                        if (invoice.date > largestPaymentDate) {
                            //log("yes it was bigger, so setting largestPaymentDate to " + invoice.date);

                            largestPaymentDate = invoice.date;

                            //log("largestPaymentDate: " + largestPaymentDate);
                        }
                    }
                    lastPaymentMade = largestPaymentDate;
                    nextPaymentDue = lastPaymentMade + (86400 * 30);
                    // log("---- - -- - - -- -nexdtPaymentDue: " + nextPaymentDue);
                    // add a day to a unix timestamp
                    // + (1000*60*60*24)

                    // add a month
                    // + (1000*60*60*24)*30
                    /*
          log("lastPaymentMade: " + convertTimestampToDate(lastPaymentMade));
          log("nextPaymentDue: " + convertTimestampToDate(nextPaymentDue));
          log("monthlyCost: " + monthlyCost);
          log("lastPaymentAmount: " + monthlyCost);
          log("nextPaymentAmount: " + invoice.amount_due);
          log("this.useraccntId: " + this.useraccntId);
            */
                    customerData.lastPaymentMade = convertTimestampToDate(lastPaymentMade);
                    customerData.nextPaymentDue = convertTimestampToDate(nextPaymentDue);
                    log("customerData for " + useraccntId + JSON.stringify(customerData));

                    writeToDreamFactory('updateInvoiceChargeInfo', useraccntId, "0", customerData);


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
            //log("-----------------------------------------------------------");
            // ***********************



        }
    ); // END get stripe customer    cutomers.retrieve();
    log("------ END getStripeCustomerSubscriptionCopyToDatabase --------")
}
// **************    END GET STRIPE CUSTOMER   ************************
// ********************************************************************




// ********************************************************************
// **************    CREATE A NEW SUBSCRIPTION ************************
function createStripeSubscription(customerId, stripePlans) {

    log("subscriptions:" + JSON.stringify(stripePlans));

    stripe.subscriptions.create({
        customer: customerId,
        items: stripePlans,
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
            var subscriptionsData = {};
            var subscriptionItem = {};
            subscriptionsData.sub = subscription.id;
            subscriptionsData.items = [];
            for (var i = 0; i < subscription.items.data.length; i++) {
                subscriptionItem = {};
                subscriptionItem.id = subscription.items.data[i].id;
                subscriptionItem.plan = subscription.items.data[i].plan.id;
                subscriptionItem.quantity = subscription.items.data[i].quantity;
                subscriptionsData.items.push(subscriptionItem);
            }
            //stripePlanDetails = subscription.plan.id + ':' + subscription.plan.name + ':' + subscription.id;
            // stripePlanDetails = subscription.plan.id;
            //log("stripePlanDetails: ");
            //log(stripePlanDetails);
            //  log("subscriptionData " + JSON.stringify(subscriptionsData));
            writeToDreamFactory('newSubscription', this.useraccntId, customerId, subscriptionsData, 0, 0, 0);
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

function writeToDreamFactory(updateReason, useraccntId, stripeCustomerId, callData) {
    log("----  writeToDreamFactory via UniRest: ----" + updateReason);
    // http://unirest.io/nodejs.html

    //var server = '13.64.118.45';
    var server = 'http://api.rank-x.com';
    var path = '/api/v2/mysql/_table/useraccnts/' + useraccntId;

    var url = server + path;

    var params = {};
    if (updateReason == 'newSubscription') {

        var stripePlan = callData;
        //Determine which plans were purchased
        log("stripePlan " + JSON.stringify(stripePlan));
        //log("stripePlan.items[0].id " + stripePlan.items[0].id);
        //log("stripePlan.items[1].id " + stripePlan.items[1].id);

        var stripeSub = stripePlan.sub;
        var stripesipremium = '';
        var stripesiranks = '';
        var gotPremium = false;
        var gotRanks = false;
        var ranksQuantity = 0;

        for (var i = 0; i < stripePlan.items.length; i++) {
            log("stripePlan[i] " + JSON.stringify(stripePlan.items[i]));
            if (stripePlan.items[i].plan == 'premium-plan-REB') {
                gotPremium = true;
                stripesipremium = stripePlan.items[i].id;
            }
            if (stripePlan.items[i].plan == 'custom-rank') {
                gotRanks = true;
                stripesiranks = stripePlan.items[i].id;
                ranksQuantity = stripePlan.items[i].quantity;
            }
        }

        if (gotPremium && !gotRanks) { //if only purchased premium
            params = {
                "id": useraccntId,
                "stripeid": stripeCustomerId,
                "ispremium": gotPremium,
                "stripesub": stripeSub,
                "stripesipremium": stripesipremium,
            };
        }
        if (!gotPremium && gotRanks) { //if only purchased ranks
            params = {
                "id": useraccntId,
                "stripeid": stripeCustomerId,
                "hasranks": gotRanks,
                "ranksqty": ranksQuantity,
                "stripesub": stripeSub,
                "stripesiranks": stripesiranks,
            };
        }
        if (gotPremium && gotRanks) { //if purchased both premium and ranks
            params = {
                "id": useraccntId,
                "stripeid": stripeCustomerId,
                "ispremium": gotPremium,
                "hasranks": gotRanks,
                "ranksqty": ranksQuantity,
                "stripesub": stripeSub,
                "stripesiranks": stripesiranks,
                "stripesipremium": stripesipremium,
            };
        }
    }
    if (updateReason == 'cancelledSubscription') {
        var cancelData = callData;
        if (cancelData.cancelAll) {
            params = {
                "id": useraccntId,
                "ispremium": false,
                "hasranks": false,
                "ranksqty": 0,
                "stripesub": '',
                "stripesipremium": '',
                "stripesiranks": '',
            };
        } else if (cancelData.cancelPremium) {
            params = {
                "id": this.useraccntId,
                "ispremium": false,
                "stripesipremium": '',
            };
        } else if (cancelData.cancelRanks) {
            params = {
                "id": this.useraccntId,
                "hasranks": false,
                "stripesiranks": '',
            };
        }
    }
    if (updateReason == 'updateInvoiceChargeInfo') {
        var customerData = callData;
        params = {
            "id": useraccntId,
            "monthlyCost": customerData.monthlyCost,
            "nextPaymentDue": customerData.nextPaymentDue,
            "lastPaymentMade": customerData.lastPaymentMade,
            "ispremium": customerData.ispremium,
            "hasranks": customerData.hasranks,
            "ranksqty": customerData.ranksqty,
            "stripesub": customerData.stripesub,
            "stripesipremium": customerData.stripesipremium,
            "stripesiranks": customerData.stripesiranks,
            "istrial": customerData.istrial,
            "discountEndDate": customerData.discountEndDate,
        };
    }
    if (updateReason == 'updateSubscription') {
        var editData = callData;
        params = {
            "id": useraccntId,
            "ranksqty": editData.numRanks,
        };
    }
    if (updateReason == 'setPromoCode') {
        params = {
            "id": useraccntId,
            "promocode": callData.promoCode,
        }
    }

    if (updateReason == 'deleteAccount') {
        unirest.delete(url)
        .headers({
            'Accepts': 'application/json',
            'Content-Type': 'application/json',
            'X-DreamFactory-Api-Key': 'da4f7e05b7afc5beffe8d9d416abec73cf98ef89e3703beeb5144f325be5decc',
        })
        .send(JSON.stringify(params))
        .end(function(response) {
            log("response from DreamFactory: " + JSON.stringify(response.body));
            log("response from DreamFactory: " + JSON.stringify(response));
        });
        return;
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
            'X-DreamFactory-Api-Key': 'da4f7e05b7afc5beffe8d9d416abec73cf98ef89e3703beeb5144f325be5decc',
        })
        .send(JSON.stringify(params))
        .end(function(response) {
            log("response from DreamFactory: " + JSON.stringify(response.body));
            log("response from DreamFactory: " + JSON.stringify(response));
        });

    

    log("<<-------   end STRIPE SUBSCRIBE via app = express();-------------");
}
// **************    END WRITE TO DREAMFACTORY         ****************
// ********************************************************************

function writeToDreamFactoryPromoters(updateReason, promoterId, callData, res){
    var server = 'http://api.rank-x.com';
    var path = '/api/v2/mysql/_table/promoters/' + promoterId;
    var param = {};
    if (updateReason == 'updatePromoterStripeId') {
        param = {"id":promoterId, "stripeId":callData.stripeid }
    } else if(updateReason == 'updatePaymentDate') {
        param = {"id":promoterId, "lastPaymentDate":callData.lastPaymentDate }
    }

    return unirest.patch(server + path)
    .headers({
        'Accepts': 'application/json',
        'Content-Type': 'application/json',
        'X-DreamFactory-Api-Key': 'da4f7e05b7afc5beffe8d9d416abec73cf98ef89e3703beeb5144f325be5decc',
    })
    .send(JSON.stringify(param));
}

// ------ Image Download and Upload ----- 
// This code can be moved to a different file with a library, but temporarily here for testing.


app.post('/ImageServer/SaveImage', function(req, res, next) {
    log("------->>   Received ImageServer / Save Image Request--------");

    var imageurl = req.body.imageurl;
    var filename = req.body.filename;
    var rank = req.body.rank;

    var fext = '';

    if (imageurl.indexOf('jpg') > -1) fext = 'jpg';
    if (imageurl.indexOf('png') > -1) fext = 'png';
    if (imageurl.indexOf('jpeg') > -1) fext = 'jpeg';

    try {
        //console.log("index - ",images[i].id);
        download(imageurl,
            'imagesTempDir/' + filename + '.' + fext,
            function() {
                log("image " + filename + "download done");
                //after image is done downloading, upload to Azure Storage Account
                blobSvc.createBlockBlobFromLocalFile('sandiego',
                    "featuredImages/" + filename + '.' + fext,
                    'imagesTempDir/' + filename + '.' + fext,
                    function(error, result, response) {
                        if (!error) {
                            log("image " + filename + "uploaded Succesfully");
                            //after upload succesful
                            updateImageUrlDreamFactory(rank, filename + '.' + fext);
                        } else {
                            log("Error uploading image " + filename + " error: " + error);
                            res.send(500, "Error uploading image " + filename + " error: " + error);
                        }
                    });

            });
    } catch (err) {
        log("error downloading image " + filename);
        res.send(500, "error downloading image " + filename);
    }

    log("<<-------   end Save Image-------------");


});

var download = function(uri, filename, callback) {

    request.head(uri, function(err, res, body) {
        //console.log("url - ", uri);
        //console.log("res - ", res);
        if (res != undefined) {
            console.log('content-type:', res.headers['content-type']);
            console.log('content-length:', res.headers['content-length']);
            request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
        } else log("error downloading image " + filename);
    });
};

function updateImageUrlDreamFactory(rank, filename) {
    log("----  updateImageUrlDreamFactory ----");

    var server = 'http://api.rank-x.com';
    var path = '/api/v2/mysql/_table/ranking/' + rank;
    var url = server + path;

    var params = {};
    params.fimage = 'https://rankx.blob.core.windows.net/sandiego/featuredImages/' + filename;

    unirest.patch(url)
        .headers({
            'Accepts': 'application/json',
            'Content-Type': 'application/json',
            'X-DreamFactory-Api-Key': 'da4f7e05b7afc5beffe8d9d416abec73cf98ef89e3703beeb5144f325be5decc',
        })
        .send(JSON.stringify(params))
        .end(function(response) {
            log("response from DreamFactory: " + JSON.stringify(response.body));
            log("response from DreamFactory: " + JSON.stringify(response));
        });
    log("<<-------   end STRIPE SUBSCRIBE via app = express();-------------");
}

//--- end of image download / upload

var port = process.env.PORT || '3000';
app.listen(port);