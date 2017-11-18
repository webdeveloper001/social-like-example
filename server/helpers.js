
var unirest = require('unirest');
var server = 'http://api.rank-x.com';
var log = require('./log');
var moment = require('moment');

var stripe = require('stripe')(process.env.STRIPE_API_KEY);

function writeToDreamFactoryAnswers(updateReason, answerId, stripeCustomerId, callData) {
    log("----  writeToDreamFactory via UniRest: ----" + updateReason);

    var path = '/api/v2/mysql/_table/answers/' + answerId;

    var url = server + path;

    var params = {};
    if (updateReason == 'newSubscription') {

        var stripePlan = callData;
        log("stripePlan " + JSON.stringify(stripePlan));

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
                "id": answerId,
                "ispremium": gotPremium
            };
        }
        if (!gotPremium && gotRanks) { //if only purchased ranks
            params = {
                "id": answerId,
                "hasranks": gotRanks,
                "ranksqty": ranksQuantity
            };
        }
        if (gotPremium && gotRanks) { //if purchased both premium and ranks
            params = {
                "id": answerId,
                "ispremium": gotPremium,
                "hasranks": gotRanks,
                "ranksqty": ranksQuantity
            };
        }
    }
    if (updateReason == 'cancelledSubscription') {
        var cancelData = callData;
        if (cancelData.cancelAll) {
            params = {
                "id": answerId,
                "ispremium": false,
                "hasranks": false,
                "ranksqty": 0
            };
        } else if (cancelData.cancelPremium) {
            params = {
                "id": this.answerId,
                "ispremium": false
            };
        } else if (cancelData.cancelRanks) {
            params = {
                "id": this.answerId,
                "hasranks": false
            };
        }
    }
    if (updateReason == 'updateInvoiceChargeInfo') {
        var customerData = callData;
        params = {
            "id": answerId,
            "ispremium": customerData.ispremium,
            "hasranks": customerData.hasranks,
            "ranksqty": customerData.ranksqty,
        };
    }
    if (updateReason == 'updateSubscription') {
        var editData = callData;
        params = {
            "id": useraccntId,
            "hasranks": true,
            "ranksqty": editData.numRanks,
        };
    }
    if (updateReason == 'deleteAccount') {
        params = {
            "id": answerId,
            "ranksqty": 0,
            "hasranks": false,
            "ispremium": false,

        };
    }

    log("using UniRest, patch df via url: " + url + " with params: " + JSON.stringify(params));
    unirest.patch(url)
        .headers({
            'Accepts': 'application/json',
            'Content-Type': 'application/json',
            'X-DreamFactory-Api-Key': process.env.DREAMFACTORY_API_KEY,
        })
        .send(JSON.stringify(params))
        .end(function(response) {
            log("response from DreamFactory: " + JSON.stringify(response.body));
            log("response from DreamFactory: " + JSON.stringify(response));
        });

    log("<<-------   end STRIPE SUBSCRIBE via app = express();-------------");
}

function writeToDreamFactory(updateReason, useraccntId, stripeCustomerId, callData) {
    log("----  writeToDreamFactory via UniRest: ----" + updateReason);

    var path = '/api/v2/mysql/_table/useraccnts/' + useraccntId;

    var url = server + path;

    var params = {};
    if (updateReason == 'newSubscription') {

        var stripePlan = callData;
        log("stripePlan " + JSON.stringify(stripePlan));

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
    if (updateReason == 'updateSubscriptionItems') {
        var editData = callData;
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
            'X-DreamFactory-Api-Key': process.env.DREAMFACTORY_API_KEY,
        })
        .send(JSON.stringify(params))
        .end(function(response) {
            log("response from DreamFactory: " + JSON.stringify(response.body));
            log("response from DreamFactory: " + JSON.stringify(response));
        });
        return;
    }

    log("using UniRest, patch df via url: " + url + " with params: " + JSON.stringify(params));
    unirest.patch(url)
        .headers({
            'Accepts': 'application/json',
            'Content-Type': 'application/json',
            'X-DreamFactory-Api-Key': process.env.DREAMFACTORY_API_KEY,
        })
        .send(JSON.stringify(params))
        .end(function(response) {
            log("response from DreamFactory: " + JSON.stringify(response.body));
            log("response from DreamFactory: " + JSON.stringify(response));
        });

    

    log("<<-------   end STRIPE SUBSCRIBE via app = express();-------------");
}

function writeToDreamFactoryPromoters(updateReason, promoterId, callData, res){
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
        'X-DreamFactory-Api-Key': process.env.DREAMFACTORY_API_KEY,
    })
    .send(JSON.stringify(param));
}

function getBizFeedToday() {

    var path = '/api/v2/mysql/_table/useractivityfeed/';
    return unirest.get(server + path + '?limit=10000&offset=0&filter=(date like ' + moment().format('YYYY-MM-DD') + ')')
    .headers({
        'Accepts': 'application/json',
        'Content-Type': 'application/json',
        'X-DreamFactory-Api-Key': process.env.DREAMFACTORY_API_KEY,
    })
    .send();
}
function getSubscribedBizList(){

    var path = '/api/v2/mysql/_table/emailsubscription/';
    return unirest.get(server + path + '?limit=10000&offset=0&filter=(subgroup=2)')
    .headers({
        'Accepts': 'application/json',
        'Content-Type': 'application/json',
        'X-DreamFactory-Api-Key': process.env.DREAMFACTORY_API_KEY,
    })
    .send();
}

function writeToDreamFactoryEmailSubscriptions(updateReason, subscription_id, callData){
    var path = '/api/v2/mysql/_table/emailsubscription/';
    var param = {};
    if (updateReason == 'addNewSubscriber') {
        param = {
            resource:[{
                "email": callData.email,
                "userid": callData.userid,
                "answer": parseInt(callData.answer),
                "options": callData.options,
                "subgroup": callData.subgroup,
                "username": callData.username
            }]
        };  

        return unirest.post(server + path)
        .headers({
            'Accepts': 'application/json',
            'Content-Type': 'application/json',
            'X-DreamFactory-Api-Key': process.env.DREAMFACTORY_API_KEY,
        })
        .send(JSON.stringify(param));

    } else if(updateReason == 'updatePaymentDate') {
        param = {"id":promoterId, "lastPaymentDate":callData.lastPaymentDate }
    }
}

function writeToDreamFactoryCodePrices(updateReason, codeprice_id, callData, res){
    var path = '/api/v2/mysql/_table/codeprice/' + codeprice_id;
    var param = {};
    if (updateReason == 'updateCodePrice') {
        param = {"id":codeprice_id, "price":callData.newPrice }
    } 

    return unirest.patch(server + path)
    .headers({
        'Accepts': 'application/json',
        'Content-Type': 'application/json',
        'X-DreamFactory-Api-Key': process.env.DREAMFACTORY_API_KEY,
    })
    .send(JSON.stringify(param));
}


function getNewRankingThisWeek(){
    var path = '/api/v2/mysql/_table/ranking?order=timestmp DESC&limit=3&offset=0&filter=ismp=1';
    var param = {};

    return unirest.get(server + path)
    .headers({
        'Accepts': 'application/json',
        'Content-Type': 'application/json',
        'X-DreamFactory-Api-Key': process.env.DREAMFACTORY_API_KEY,
    })
    .send();
}

function getPopularRankingThisWeek(){
    var path = '/api/v2/mysql/_table/ranking?order=views DESC&limit=3&offset=0&filter=ismp=1';
    var param = {};

    return unirest.get(server + path)
    .headers({
        'Accepts': 'application/json',
        'Content-Type': 'application/json',
        'X-DreamFactory-Api-Key': process.env.DREAMFACTORY_API_KEY,
    })
    .send();
}

function updateImageUrlDreamFactory(category, filename) {
    log("----  updateImageUrlDreamFactory ----");

    var path = '/api/v2/mysql/_table/categories/' + category;
    var url = server + path;

    var params = {};
    params.fimage = 'https://rankx.blob.core.windows.net/sandiego/featuredImages/' + filename;

    unirest.patch(url)
        .headers({
            'Accepts': 'application/json',
            'Content-Type': 'application/json',
            'X-DreamFactory-Api-Key': process.env.DREAMFACTORY_API_KEY,
        })
        .send(JSON.stringify(params))
        .end(function(response) {
            log("response from DreamFactory: " + JSON.stringify(response.body));
            log("response from DreamFactory: " + JSON.stringify(response));
        });
    log("<<-------   end STRIPE SUBSCRIBE via app = express();-------------");
}


function convertTimestampToDate(timestamp) {
    var d = new Date(timestamp * 1000);
    var dateDoubleDigitString = d.getDate().toString();
    var monthDoubleDigitString = (d.getMonth() + 1).toString();

    if (parseInt(monthDoubleDigitString) < 10) {
        monthDoubleDigitString = '0' + monthDoubleDigitString;
    }

    if (parseInt(dateDoubleDigitString) < 10) {
        dateDoubleDigitString = '0' + dateDoubleDigitString;
    }

    var dateString = d.getFullYear() + '-' + monthDoubleDigitString + '-' + dateDoubleDigitString;

    return dateString;
}

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


function getPromoterByCode(promoCode){

    var path = '/api/v2/mysql/_table/promoters/?filter=code='+promoCode;
    var param = {};

    return unirest.get(server + path)
    .headers({
        'Accepts': 'application/json',
        'Content-Type': 'application/json',
        'X-DreamFactory-Api-Key': process.env.DREAMFACTORY_API_KEY,
    })
    .send();
}

function getEmailSubscriptionById(id){

    var path = '/api/v2/mysql/_table/emailsubscription/?filter=userid='+id;
    var param = {};

    return unirest.get(server + path)
    .headers({
        'Accepts': 'application/json',
        'Content-Type': 'application/json',
        'X-DreamFactory-Api-Key': process.env.DREAMFACTORY_API_KEY,
    })
    .send();
}

function getSubscribers(){

    var path = '/api/v2/mysql/_table/emailsubscription/?filter=(subgroup=1) or (subgroup=2)';
    var param = {};

    return unirest.get(server + path)
    .headers({
        'Accepts': 'application/json',
        'Content-Type': 'application/json',
        'X-DreamFactory-Api-Key': process.env.DREAMFACTORY_API_KEY,
    })
    .send();
}

function getAccountById(useraccntId){
    var path = '/api/v2/mysql/_table/useraccnts/?filter=id='+useraccntId;
    var param = {};

    return unirest.get(server + path)
    .headers({
        'Accepts': 'application/json',
        'Content-Type': 'application/json',
        'X-DreamFactory-Api-Key': process.env.DREAMFACTORY_API_KEY,
    })
    .send();
}

function getAnswerById(id){
    var path = '/api/v2/mysql/_table/answers/?filter=id='+id;
    var param = {};

    return unirest.get(server + path)
    .headers({
        'Accepts': 'application/json',
        'Content-Type': 'application/json',
        'X-DreamFactory-Api-Key': process.env.DREAMFACTORY_API_KEY,
    })
    .send();
}

function getPromoterById(id){
    var path = '/api/v2/mysql/_table/promoters/?filter=id='+id;
    var param = {};

    return unirest.get(server + path)
    .headers({
        'Accepts': 'application/json',
        'Content-Type': 'application/json',
        'X-DreamFactory-Api-Key': process.env.DREAMFACTORY_API_KEY,
    })
    .send();
}

module.exports = {
    writeToDreamFactory: writeToDreamFactory,
    writeToDreamFactoryPromoters: writeToDreamFactoryPromoters,
    writeToDreamFactoryCodePrices: writeToDreamFactoryCodePrices,
    updateImageUrlDreamFactory: updateImageUrlDreamFactory,
    convertTimestampToDate: convertTimestampToDate,
    getStripeCustomerSubscriptionCopyToDatabase: getStripeCustomerSubscriptionCopyToDatabase,
    getNewRankingThisWeek: getNewRankingThisWeek,
    getSubscribedBizList: getSubscribedBizList,
    getBizFeedToday: getBizFeedToday,
    writeToDreamFactoryEmailSubscriptions: writeToDreamFactoryEmailSubscriptions,
    getPromoterByCode: getPromoterByCode,
    getEmailSubscriptionById: getEmailSubscriptionById,getAccountById,
    getAccountById: getAccountById,
    getAnswerById: getAnswerById,
    getPromoterById: getPromoterById,
    getPopularRankingThisWeek: getPopularRankingThisWeek,
    getSubscribers: getSubscribers,
    writeToDreamFactoryAnswers: writeToDreamFactoryAnswers
}