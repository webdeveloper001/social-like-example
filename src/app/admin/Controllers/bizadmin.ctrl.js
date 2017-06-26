(function () {
    'use strict';

    angular
        .module('app')
        .controller('bizadmin', bizadmin);

    bizadmin.$inject = ['$location', '$rootScope', '$state','$stateParams', 'table','dialog', '$q', 'useraccnt', 'promoter', 'answer', 'codeprice', 'setting', '$timeout', 'DTOptionsBuilder', 'DTColumnDefBuilder'];

    function bizadmin(location, $rootScope, $state, $stateParams, table, dialog, $q, useraccnt, promoter, answer, codeprice,setting,$timeout, DTOptionsBuilder, DTColumnDefBuilder) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'bizadmin';
        vm.dataReady = false;
        vm.businesses = [];
        vm.isAdmin = $rootScope.isAdmin;

        vm.notifications = [];

        vm.gotoanswer = gotoanswer;
        vm.getFiltered = getFiltered;

        vm.showFilter = 0;
        vm.showUserFilter = true;
        vm.setShowPurchases = setShowPurchases;
        vm.setShowAll = setShowAll;
        vm.setShowNonPurchases = setShowNonPurchases;
        vm.showUser = showUser;
        // vm.dtOptions = DTOptionsBuilder.newOptions();
        // vm.dtColumnDefs = [
        //     DTColumnDefBuilder.newColumnDef(0),
        //     DTColumnDefBuilder.newColumnDef(1),
        //     DTColumnDefBuilder.newColumnDef(2)
        // ];
        vm.dtInstance = {};


        retrieveData();

        function retrieveData() {
            
            $q.all([useraccnt.getallaccnts(),  setting.getSetting(), codeprice.get()])
            .then(function(data){

                var accounts = data[0];
                var codeprices = data[2];

                vm.STRIPE_COMMISSION_PERCENTAGE = data[1].STRIPE_COMMISSION_PERCENTAGE ? data[1].STRIPE_COMMISSION_PERCENTAGE : 0.2;
                vm.CUSTOM_RANK_PRICE = data[1].CUSTOM_RANK_PRICE;

                data[0].forEach(function(business){
                    var pextend = angular.copy(business);
                    getAnswer(pextend);
                    
                    vm.businesses.push(pextend);   
                });

                vm.dataReady = true;
                // $timeout(function(){
                //     vm.dtInstance.rerender();
                // })
                
            });
            activate();

        }

        function activate() {
            console.log("bizadmin page Loaded!");
        }

        function getAnswer(account){
            answer.getAnswer(account.answer)
            .then(function(answer){
                account.answerObj = answer;
            })
        }           
        function dismissNotification(notification){
            if(vm.notifications.indexOf(notification) != '-1'){

            }
        }
        function showBusinessDetail(business){
            dialog.showBusinessDetailDlg(business, vm.STRIPE_COMMISSION_PERCENTAGE, vm.CUSTOM_RANK_PRICE);
        }
        function gotoanswer(x) {
            $state.go('answerDetail', { index: x.slug });
        }

        function getFiltered() {
            if(vm.showFilter == 1) {
                return vm.businesses.filter(function(p) { return p.hasranks || p.haspremium;});
            }
            if(vm.showFilter == 2) {
                return vm.businesses.filter(function(p) { return !(p.hasranks || p.haspremium);});
            }
            return vm.businesses;
        }

        function  setShowPurchases  () {
            vm.showFilter = 1;
            vm.dtInstance.rerender();
        }

        function setShowNonPurchases() {
            vm.showFilter = 2;
            vm.dtInstance.rerender();

        }

        function setShowAll() {
            vm.showFilter = 0;
            vm.dtInstance.rerender();

        }
        function showUser() {
            vm.showUserFilter = !vm.showUserFilter;
            vm.dtInstance.rerender();

        }
    }
})();
