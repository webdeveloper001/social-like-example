(function () {
    'use strict';

    angular
        .module('app')
        .controller('plan', plan);

    plan.$inject = ['$location', '$rootScope', '$state','$stateParams', 'table','dialog', '$q', 'useraccnt', 'promoter', 'answer', 'codeprice', 'setting', '$timeout'];

    function plan(location, $rootScope, $state, $stateParams, table, dialog, $q, useraccnt, promoter, answer, codeprice,setting,$timeout) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'plan';
        vm.dataReady = false;
        vm.changeCodePrice = changeCodePrice;
        vm.customranking = {};
        vm.notifications = [];
        vm.isAdmin = $rootScope.isAdmin;
        vm.isSaving = false;
        retrieveData();
        // });
        function retrieveData() {
            $q.all([codeprice.get(), setting.getSetting()])
            .then(function(data){
                vm.codeprices = data[0];

                vm.STRIPE_COMMISSION_PERCENTAGE = data[1].STRIPE_COMMISSION_PERCENTAGE;
                vm.CUSTOM_RANK_PRICE = data[1].CUSTOM_RANK_PRICE;
                vm.customranking = {
                    code: 'Custom Rank',
                    price: vm.CUSTOM_RANK_PRICE,
    
                };
                vm.codeprices.push(vm.customranking);
                vm.dataReady = true;
                activate();
            });
        }

        function activate() {
            console.log("Plan admin page Loaded!");
        }

        function changeCodePrice(codeprice){
            dialog.changeCodePriceDlg(codeprice, execChangeCodePrice);
        }

        function execChangeCodePrice(codeprice, price){
            vm.isSaving = true;
            setting.setCodePrice(codeprice, price)
            .then(function(resp){
                vm.isSaving = false;
                if(codeprice.code == 'Custom Rank') {
                    vm.notifications.push({message: 'Custom Rank Price $ ' +resp.data.plan.amount/100 + ' has changed successfully', type:'success'});
                    codeprice.price = resp.data.plan.amount/100;
                } else {
                    vm.notifications.push({message: 'Premium Plan ' + codeprice.code + ' Price $ ' + resp.data.plan.amount/100 + ' has changed successfully', type:'success'});
                    codeprice.price = resp.data.plan.amount/100;
                }
                
            })
            .catch(function(resp){
                vm.notifications.push({message: resp.data.err.message, type:'error'});
            })
        }
        
    }
})();
