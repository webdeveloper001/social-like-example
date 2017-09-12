
var log = require('../log');
var helpers = require('../helpers');
var mailing = require('./mailing');
var moment = require('moment');
var request = require('request');
var rankxBaseUrl = "https://rank-x.com";
// var rankxBaseUrl = "http://localhost:3006";

var stripe = require('stripe')(process.env.STRIPE_API_KEY);

var stripePlanDetails = '';
var stripeId = '';
var useraccntId = 0;
var dfUseraccntId = 0;
var couponCode = 'NONE';

var stripeCustomer = {};
var stripeSubscriptionId = 0;

function getStripeServerStatus(req, res, next) {
    log("***********   responding to your GET request to Stripe Server ***************");
    res.send('hello world ... just responding to your GET request to the Stripe Server \'/\'');
}

function getInvoiceList(req, res, next) {
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
}

function connectPromoter(req, res, next) {
    var code = req.query.code;
    var promoterId = req.query.state;
    // Make /oauth/token endpoint POST request
    request.post({
        url: 'https://connect.stripe.com/oauth/token',
        form: {
            grant_type: "authorization_code",
            client_id: process.env.STRIPE_CLIENT_ID,
            code: code,
            client_secret: process.env.STRIPE_API_KEY
        }
    }, function(err, r, body) {
        var accessToken = JSON.parse(body).access_token;
        var stripe_user_id = JSON.parse(body).stripe_user_id;

        helpers.writeToDreamFactoryPromoters("updatePromoterStripeId", promoterId, {stripeid: stripe_user_id}, res)
        .end(function(response){
            res.redirect(rankxBaseUrl + '/promoterconsole?connectStripe=success');
        });
    });
}

function deleteCustomer(req, res, next) {
    var _invoices;
    var stripeInvoices = stripe.customers.del(req.params['stripeId'])
    .then(function(confirmation){
        if( confirmation.deleted == true ){
            
            writeToDreamFactory('deleteAccount', req.params['useraccntId'], 0, {});

            //helpers.writeToDreamFactoryAnswers('cancelledSubscription', this.answerId, 0, cancelData);
            res.status(204);
        }
    }).catch(function (err){
        res.status(400).json({err:err});
    });
}

function payPromoter(req, res, next) {
    stripe.transfers.create({
        amount: Math.floor(req.body.amount),
        currency: "usd",
        // source_transaction:"ch_1AIiTkChTCXrS8u5XMp1bMl9",
        destination: req.body.stripeId,
    }).then(function(transfer) {
        console.log(transfer);
        mailing.paymentProceed(req.body.amount, req.body.promoterId);
        helpers.writeToDreamFactoryPromoters("updatePaymentDate", req.body.promoterId, {lastPaymentDate: moment().format('YYYY-MM-DD')}, res)
        .end(function(response){
            res.json({transfer: transfer, lastPaymentDate: moment().format('YYYY-MM-DD')});
        });
    }).catch(function(err){
        console.log(err);
        res.status(400).json({err: err});
    });
}
function getStripeUser(req, res, next) {

    log(" ------------ START getStripeCustomerSubscriptionCopyToDatabase -------");

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
        helpers.getStripeCustomerSubscriptionCopyToDatabase(stripeId, useraccntId); //417
        log(" ------------ RETURNED FROM CALLING getStripeCustomerSubscriptionCopyToDatabase -------");


        return stripe.customers.retrieve(stripeId)
        .then(function(customer){
            res.json(customer);
        }).catch(function (err){
            res.status(400).json({err:err});
        });
    } // end if stripeId != 0

    log(" ------------ END getStripeCustomerSubscriptionCopyToDatabase -------");

}
function cancelSubscription(req, res, next) {
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
    this.answerId = req.body.answerId;

    var cancelData = req.body;

    log("req from cancel " + JSON.stringify(req.body));
    //log("cancel all: " + cancelAll + " cancel Premium: " + cancelPremium + " cancel Ranks: " + cancelRanks);
    //log("calling stripe to cancel " + stripeSubscriptionId);
    // stripe.subscriptions.del("sub_3R3PlB2YlJe84a",
    // { at_period_end: true },
    if (cancelAll || cancelPremium || cancelRanks) {
        mailing.codeCancelSubscription(req.body.useraccntId);
    }
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
    helpers.writeToDreamFactory('cancelledSubscription', this.useraccntId, 0, cancelData);
    helpers.writeToDreamFactoryAnswers('cancelledSubscription', this.answerId, 0, cancelData);
    log("<<-------   end STRIPE CANCEL via app = express();-------------");
    //res.send(204);
}

function editSubscription(req, res, next) {
    log("------->>   STRIPE EDIT RANKS via app = express();-------------");
    var action = req.body.action;
    var numRanks = req.body.numRanks;
    var stripeId = req.body.stripeId;
    var useraccntId = req.body.useraccntId;
    var stripesub = req.body.stripesub;
    var stripesiranks = req.body.stripesiranks;
    var answerId = req.body.answerId;

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

    helpers.writeToDreamFactory('updateSubscription', useraccntId, 0, editData);
    helpers.writeToDreamFactoryAnswers('updateSubscription', answerId, 0, editData);
}

function changeSource(req, res, next) {
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
}

function charge(req, res, next) {
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
    this.answerId = req.body.answerId;
    
    var userEmail = req.body.userEmail;
    this.couponValid =   req.body.couponValid;
    this.bizcat = req.body.bizcat;
    this.getPremium = req.body.getPremiumPlan;
    this.getRanks = req.body.getCustomRanks;
    this.ranksQuantity = req.body.ranksQuantity; 


    log("useraccntId " + this.useraccntId + " this.getPremium " + this.getPremium + " this.getRanks " + this.getRanks + " this.ranksQuantity " + this.ranksQuantity);

    //Create susbsciption object
    var subscriptions = [];
    if (this.getPremium == 'true') {
        var item = {};
        item.plan = "premium-plan-" + this.bizcat;
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
        var callObj = {};
        mailing.codeSignupSubscription(req.body.promoCode, req.body.useraccntId);

        helpers.writeToDreamFactory('setPromoCode', useraccntId, "0", {promoCode: req.body.promoCode});
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

    mailing.sendMailTo(req.body.userEmail, 'planPurchased', {
        userName: req.body.userName, 
        bizName: req.body.bizName,
        getPremiumPlan: req.body.getPremiumPlan,
        getCustomRanks: req.body.getCustomRanks,
        ranksQuantity: req.body.ranksQuantity}
    );
    mailing.sendReportEmail('planPurchased', {
        userName: req.body.userName, 
        bizName: req.body.bizName,
        getPremiumPlan: req.body.getPremiumPlan,
        getCustomRanks: req.body.getCustomRanks,
        ranksQuantity: req.body.ranksQuantity}
    );
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
        // res.send(204)
            //res.sendStatus(status);
    }


}

// **************          UPDATE A SUBSCRIPTION   **********************
function updateSubscription(req, res, next) {
    var userId = req.body.userId;
    this.useraccntId = req.body.useraccntId;
    this.answerId = req.body.answerId;
    this.stripeId = req.body.stripeId;
    this.stripeSub = req.body.stripeSub;
    var userEmail = req.body.userEmail;
    this.couponValid =   req.body.couponValid;
    this.bizcat = req.body.bizcat;
    this.getPremium = req.body.getPremiumPlan;
    this.getRanks = req.body.getCustomRanks;
    this.ranksQuantity = req.body.ranksQuantity; 

    this.plan = "";
    this.quantity = 1;
    if (this.getPremium == true) {
        this.plan = "premium-plan-" + this.bizcat;
    }
    if (this.getRanks == true) {
        this.plan = "custom-rank";
        this.quantity = this.ranksQuantity;
    }
    if (this.couponValid == true) {
        this.couponCode = 'startup-promo';
        var callObj = {};
        // mailing.codeSignupSubscription(req.body.promoCode, req.body.useraccntId);
        helpers.writeToDreamFactory('setPromoCode', this.useraccntId, "0", {promoCode: req.body.promoCode});
    }    
    //Update subscription
    stripe.subscriptionItems.create({
        subscription: this.stripeSub,
        plan: this.plan,
        quantity: this.quantity
    }, function(err, item) {
            if (err) {
                log("error while updating custom ranks..." + JSON.stringify(err));
                res.status(500).send(err);
            }
            if (item) {
                id = item.id
                log("success updating custom ranks ");
                var subscriptionsData = {};
                subscriptionsData.sub = this.stripeSub;
                subscriptionsData.items = [{
                    "plan": this.plan,
                    "quantity": this.quantity,
                    "id": id,
                }];
                //stripePlanDetails = subscription.plan.id + ':' + subscription.plan.name + ':' + subscription.id;
                // stripePlanDetails = subscription.plan.id;
                //log("stripePlanDetails: ");
                //log(stripePlanDetails);
                //  log("subscriptionData " + JSON.stringify(subscriptionsData));
                helpers.writeToDreamFactory('newSubscription', this.useraccntId, this.stripeId, subscriptionsData, 0, 0, 0);
                helpers.writeToDreamFactoryAnswers('newSubscription', this.answerId, this.stripeId, subscriptionsData, 0, 0, 0);
                res.send(204);
            }
    });

}
// *********************    END UPDATING A SUBSCRIPTION **************************


// ********************************************************************
// **************    CREATE A NEW SUBSCRIPTION ************************
function createStripeSubscription(customerId, stripePlans, userName, bizName) {

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
            helpers.writeToDreamFactory('newSubscription', this.useraccntId, customerId, subscriptionsData, 0, 0, 0);
            helpers.writeToDreamFactoryAnswers('newSubscription', this.answerId, customerId, subscriptionsData, 0, 0, 0);
            log("back from writing to DreamFactory");

            //test moving this to the top if it's non-blocking
            // res.send(204);
            return subscription;
        }

    });

}
// **************    END CREATE A NEW SUBSCRIPTION ********************
// ********************************************************************

module.exports = {
    getStripeServerStatus: getStripeServerStatus,
    getInvoiceList: getInvoiceList,
    connectPromoter: connectPromoter,
    deleteCustomer: deleteCustomer,
    payPromoter: payPromoter,
    getStripeUser: getStripeUser,
    cancelSubscription: cancelSubscription,
    editSubscription: editSubscription,
    changeSource: changeSource,
    charge: charge,
    updateSubscription: updateSubscription,
};

