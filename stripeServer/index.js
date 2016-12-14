var express = require('express');
var bodyParser = require('body-parser');
var stripe = require('stripe')('sk_test_3wskGTu6PIB1tG5RedtvyRNL');



var app = express();
app.use(bodyParser());

app.post('/charge', function(req, res) {

  // Set your secret key: remember to change this to your live secret key in production
  // See your keys here: https://dashboard.stripe.com/account/apikeys

  var stripeToken = req.body.stripeToken;
  var userEmail = req.body.userEmail;
  // var amount = 1000;

  //
  // stripe.charges.create({
  //     card: stripeToken,
  //     currency: 'usd',
  //     amount: amount
  // },
  // function(err, charge) {
  //     if (err) {
  //         res.send(500, err);
  //     } else {
  //         res.send(204);
  //     }
  // });

  // create customer
  // email: "jenny1@example.com"
  var customer = stripe.customers.create({
      email: userEmail
  },
  function(err, customer) {
  });

  // WHEN RUNNING FROM A PUBLIC IP,
  // STRIPE CLOUD WILL RESPOND WITH A CUSTOMER ID
  // IN THIS FORMAT: cus_9jbvLtOeuURYQg
  // SEND IT OVER TO DREAMFACTORY



  // var customer = stripe.customers.create({
  //   email: "jenny.rosen@example.com",
  // }, function(err, customer) {
  //   // asynchronously called
  //       if (err) {
  //           res.send(500, err);
  //       } else {
  //           res.send(204);
  //       }
  // });

});

app.use(express.static(__dirname));
app.listen(process.env.PORT || 3000);
