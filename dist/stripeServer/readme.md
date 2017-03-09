This folder (stripeServer) is to handle calls to the stripe service.

Backend: Node.js + Express

Set it up:
  npm init 
  npm install --save stripe express body-parser unirest

Launch it:
  node stripeapi.srvc.js

It's now ready to call it's "charge" function in its "stripeapi.srvc.js" file when a form submit action is pointed to:

  live example:
  https://rank-x:3000/create-customer

  development example:
  http://localhost:3000/create-customer

See a canned version of such a form here:
  examples/stripe.html
