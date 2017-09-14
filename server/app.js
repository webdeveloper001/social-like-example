var express = require('express');
var bodyParser = require('body-parser');
require('dotenv').config();
var stripe = require('stripe')(process.env.STRIPE_API_KEY);
var http = require('http');
var querystring = require('querystring');
var request = require('request');
var moment = require('moment');
var schedule = require('node-schedule');
var stripeServer = require('./routes/stripeServer');
var image = require('./routes/image');
var settings = require('./routes/settings');
var mailing = require('./routes/mailing');
var staticpages = require('./routes/staticpages');

var log = require('./log');


var fs = require('fs');
var request = require('request');

var app = express();
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.all('*', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.get('/', function(req, res) {
    log('This is a log record from an empty GET request');
    res.send('Hello World from Rank-X Server! We are alive and well!');
});

log("--- Started rank-x communicator server ---");


app.get('/settings/', settings.getSettings);
app.post('/settings/', settings.setSettings);
app.post('/codeprice/', settings.changeCodePrice);

app.get('/stripeServer/', stripeServer.getStripeServerStatus);
app.get('/stripeServer/:stripeId/invoices', stripeServer.getInvoiceList);
app.get('/stripeServer/connectpromoter', stripeServer.connectPromoter);
app.get('/stripeServer/:stripeId/:useraccntId/deleteCustomer', stripeServer.deleteCustomer);
app.post('/stripeServer/payPromoter', stripeServer.payPromoter);
app.get('/dreamfactory-stripe-user/:stripeId/:useraccntId', stripeServer.getStripeUser);
app.post('/StripeServer/cancel', stripeServer.cancelSubscription);
app.post('/StripeServer/edit', stripeServer.editSubscription);
app.post('/StripeServer/update', stripeServer.updateSubscription);
app.post('/StripeServer/changeSource', stripeServer.changeSource);
app.post('/StripeServer/charge', stripeServer.charge);

app.post('/ImageServer/SaveImage', image.saveImage);
app.post('/ImageServer/requestPexels', image.requestPexels);

app.post('/mailing/promoterCreated', mailing.promoterCreated);
app.post('/mailing/newBizCreated', mailing.newBizCreated);
app.post('/mailing/userSubscribed', mailing.newImageUploaded);
app.post('/mailing/userSubscribed', mailing.userSubscribed);

app.post('/staticpages/createPageRank',staticpages.createPageRank);
app.post('/staticpages/createPageAnswer',staticpages.createPageAnswer);
app.post('/staticpages/getFileList', staticpages.getFileList);
app.post('/staticpages/removeFile', staticpages.removeFile);

// app.post('/mailing/', image.saveImage);
// app.post('/newBizCreated/', mailing.newBizCreated);

// , dayOfWeek: 0
// {hour: 8, minute: 30}

var rule = new schedule.RecurrenceRule();
rule.second = 1;
schedule.scheduleJob({hour: 23, minute: 55, dayOfWeek: 0}, () => {
    mailing.sendWeeklyNewsJob();
});
schedule.scheduleJob({hour: 23, minute: 55}, () => {
    mailing.sendDailyBizMail();
});

var port = process.env.PORT || '3000';
app.listen(port);