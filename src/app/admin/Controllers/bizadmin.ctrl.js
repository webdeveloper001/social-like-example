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
        vm.filterData = filterData;

        vm.showFilter = 0;
        vm.showUserFilter = true;
        vm.setShowPurchases = setShowPurchases;
        vm.setShowAll = setShowAll;
        vm.setShowNonPurchases = setShowNonPurchases;
        vm.showUser = showUser;
        vm.deleteSelected = deleteSelected;
        // vm.dtOptions = DTOptionsBuilder.newOptions();
        // vm.dtColumnDefs = [
        //     DTColumnDefBuilder.newColumnDef(0),
        //     DTColumnDefBuilder.newColumnDef(1),
        //     DTColumnDefBuilder.newColumnDef(2)
        // ];
        vm.dtInstance = {};
        vm.filtered = [];
        vm.loading = false;
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
                    var idx = $rootScope.answers.map(function(x) {return x.id; }).indexOf(pextend.answer);  
                    if (idx > -1){
                    
                        getAnswer(pextend).then(function(){
                            filterData();    
                        });
                        vm.businesses.push(pextend);       
                    }                        
                });

                vm.dataReady = true;
                filterData();
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
            return answer.getAnswer(account.answer)
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

        function filterData() {
            if(vm.showFilter == 1) {
                return vm.filtered = vm.businesses.filter(function(p) { return p.hasranks || p.haspremium;});
            }
            if(vm.showFilter == 2) {
                return vm.filtered = vm.businesses.filter(function(p) { return !(p.hasranks || p.haspremium);});
            }
            return vm.filtered = vm.businesses;
            vm.loading = false;    
            vm.dtInstance.rerender();
        }

        function  setShowPurchases  () {
            vm.showFilter = 1;
            filterData();
        }

        function setShowNonPurchases() {
            vm.showFilter = 2;
            filterData();
        }

        function setShowAll() {
            vm.showFilter = 0;
            filterData();
        }
        function showUser() {
            vm.showUserFilter = !vm.showUserFilter;
            filterData();
        }
        function deleteSelected() {
            console.log(vm.filtered.filter(function(biz){ return biz.checked;}).map(function(biz){
                return biz;
            }));
        }
    }
})();
