
var configFilePath = 'config.json';
var jsonfile = require('jsonfile');
var moment = require('moment');
var stripe = require('stripe')(process.env.STRIPE_API_KEY);
var helpers = require('../helpers');

function getSettings(req, res, next) {
    var config = jsonfile.readFileSync(configFilePath);
    config.serverDate = moment().format('YYYY-MM-DD');
    config.CUSTOM_RANK_PRICE = 0;
    stripe.plans.retrieve("custom-rank")
    .then(function(plan){
        config.CUSTOM_RANK_PRICE = plan.amount/100;
        res.json({settings:config});
    })
    .catch(function(err){
        res.status(500).json({error: 'Error occured.'})
    })
    
}

function setSettings(req, res, next) {
    var config = jsonfile.readFileSync(configFilePath);
    
    for (key in req.body){
        config[key] = req.body[key];
    }
    jsonfile.writeFileSync(configFilePath, config);
    config.serverDate = moment().format('YYYY-MM-DD');
    res.json({settings:config});
}
function changeCodePrice(req, res, next) {
    if(req.body.codeprice.code !== 'Custom Rank') {
        var oldcode = '';
        stripe.plans.retrieve("premium-plan-" + req.body.codeprice.code)
        .then(function(plan){
            return stripe.plans.del("premium-plan-" + req.body.codeprice.code)
            .then(function(confirmation){
                return stripe.plans.create({
                    amount: req.body.newPrice * 100,
                    name: "Premium Plan " + req.body.codeprice.code,
                    currency: "usd",
                    interval: "month",
                    id: "premium-plan-" + req.body.codeprice.code
                });
            });
        })
        .then(function(plan){
            helpers.writeToDreamFactoryCodePrices('updateCodePrice', req.body.codeprice.id, {newPrice: req.body.newPrice}, {})
            .end(function(response){
                res.json({"plan": plan});
            });
            
        })
        .catch(function(err){
            if(err.message.indexOf('No such plan') != -1){
                stripe.plans.create({
                    amount: req.body.newPrice * 100,
                    name: "Premium Plan " + req.body.codeprice.code,
                    interval: "month",
                    currency: "usd",
                    id: "premium-plan-" + req.body.codeprice.code
                }).then(function(plan){
                    helpers.writeToDreamFactoryCodePrices('updateCodePrice', req.body.codeprice.id, {newPrice: req.body.newPrice}, {})
                    .end(function(response){
                        res.json({plan: plan});
                    });
                    
                });
            } else {
                res.status(500).json({error: err.message});
            }
        })
        
    } else {
        stripe.plans.del("custom-rank")
        .then(function(confirmation){
            return stripe.plans.create({
                amount: req.body.newPrice * 100,
                name: "Custom Ranking",
                currency: "usd",
                interval: "month",
                id: "custom-rank"
            });
        })
        .then(function(plan){
            res.send({plan: plan});
        })
        .catch(function(err){
            res.status(500).json({error: err.message});
        })
    }
}
module.exports = {
    getSettings: getSettings,
    setSettings: setSettings,
    changeCodePrice: changeCodePrice
}