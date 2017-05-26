(function () {
    'use strict';

    angular
        .module('app')
        .controller('payment', payment);

    payment.$inject = ['$location', '$rootScope', '$state','$stateParams', 'table','dialog', '$q', 'useraccnt', 'promoter', 'answer', 'codeprice', 'setting', '$timeout'];

    function payment(location, $rootScope, $state, $stateParams, table, dialog, $q, useraccnt, promoter, answer, codeprice,setting,$timeout) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'payment';
        vm.dataReady = false;
        vm.promoters = [];
        vm.isAdmin = $rootScope.isAdmin;
        vm.detailview = false;
        vm.overview = true;
        vm.notifications = [];
        vm.selectedPromoters = [];

        vm.payPromoter = payPromoter;
        vm.gotoanswer = gotoanswer;
        vm.goBack = goBack;
        vm.goDetailView = goDetailView;
        vm.showBusinessDetail = showBusinessDetail; 
        vm.addOrRemovePromoter = addOrRemovePromoter;
        vm.paySelectedPromoters = paySelectedPromoters;
        vm.changeCommission = changeCommission;
        // answer.getAnswers()
        // .then(function (res) {
        //     $rootScope.answers = res;
        retrieveData();
        // });
        function retrieveData() {
            $q.all([promoter.getall(), useraccnt.getallaccnts(), codeprice.get(), setting.getSetting()])
            .then(function(data){
                //data[0] promoter array
                //data[1] useraccount array
                var accounts = data[1];
                var codeprices = data[2];

                vm.STRIPE_COMMISSION_PERCENTAGE = data[3].STRIPE_COMMISSION_PERCENTAGE ? data[3].STRIPE_COMMISSION_PERCENTAGE : 0.2;
                vm.CUSTOM_RANK_PRICE = data[3].CUSTOM_RANK_PRICE;
                data[0].forEach(function(promoter){
                    var pextend = angular.copy(promoter);
                    pextend.businesses = [];
                    for(var i = 0; i < accounts.length; i ++){
                        if(accounts[i].promocode == promoter.code){
                            var accntcopy = angular.copy(accounts[i]);
                            if (accntcopy.status == 'Basic') accntcopy.style = 'background-color:#bfbfbf';
                            if (accntcopy.istrial){
                                accntcopy.status = 'On Trial ' + Math.ceil(moment.duration(moment(accntcopy.discountEndDate) - moment()).asDays()) + ' Days left';
                                accntcopy.style = 'background-color:#b3b300';
                            } else {
                                accntcopy.status = 'Active';
                                accntcopy.style = 'background-color:#009900';
                            } 
                            for (var k=0; k<codeprices.length; k++){
                                if (codeprices[k].code == accntcopy.bizcat){
                                    accntcopy.price = codeprices[k].price;
                                    break;
                                }
                            }
                            // var idx = $rootScope.answers.map(function (x) { return x.id; }).indexOf(accntcopy.answer);
                            // accntcopy.answerObj = $rootScope.answers[i];
                            accntcopy.totalCommission = 0;
                            if(accntcopy.ispremium)
                                accntcopy.totalCommission += accntcopy.price*vm.STRIPE_COMMISSION_PERCENTAGE;
                            if(accntcopy.hasranks)
                                accntcopy.totalCommission += accntcopy.ranksqty * vm.CUSTOM_RANK_PRICE * vm.STRIPE_COMMISSION_PERCENTAGE;
                            
                            pextend.businesses.push(accntcopy);
                            getAnswer(pextend.businesses[pextend.businesses.length-1]);

                        }
                    }
                    ///This is to find out whether the promoter is payable or not.
                    //by comparing last paid date and current server date.
                    //If server date is another month than lastPaymentDate, it means the promoter can get paid for that month.

                    pextend.payedThisMonth = true;
                    if(!pextend.lastPaymentDate){
                        pextend.payedThisMonth = false;
                    }

                    if(((moment(pextend.lastPaymentDate).year() == moment($rootScope.setting.serverDate).year()) &&
                        (moment(pextend.lastPaymentDate).month() < moment($rootScope.setting.serverDate).month()))||
                        (moment(pextend.lastPaymentDate).year() < moment($rootScope.setting.serverDate).year())) {
                        pextend.payedThisMonth = false;
                    }

                    ////Balance is total money of monthly pay of each business of the promoter
                    pextend.balance = 0;
                    for(i = 0; i < pextend.businesses.length; i ++){
                        if (pextend.businesses[i].status == 'Active'){
                            pextend.balance += pextend.businesses[i].monthlyCost;
                        }
                    }
                    
                    pextend.activeCount = pextend.businesses.filter(function(p){ return p.status == 'Active'}).length;
                    pextend.ontrialCount = pextend.businesses.filter(function(p){ return p.status.indexOf('On Trial') != -1}).length;
                    vm.promoters.push(pextend);

   
                });

                vm.dataReady = true;
            });
        }
        activate();

        function activate() {
            console.log("payment admin page Loaded!");
        }

        function changeCommission(){
            dialog.changeCommissionDlg(vm.STRIPE_COMMISSION_PERCENTAGE, execChangeCommssion);
        }

        function execChangeCommssion(changePercent){
            setting.setSetting({STRIPE_COMMISSION_PERCENTAGE: parseInt(changePercent)/100})
            .then(function(setting){
                vm.STRIPE_COMMISSION_PERCENTAGE = setting.STRIPE_COMMISSION_PERCENTAGE;
            });
        }
        function addOrRemovePromoter(promoter){
            if(vm.selectedPromoters.indexOf(promoter) != -1){
                vm.selectedPromoters.splice(vm.selectedPromoters.indexOf(promoter), 1);
            } else {
                vm.selectedPromoters.push(promoter);
            }
        }
        function paySelectedPromoters(){
            vm.selectedPromoters.forEach(function(promoter){
                vm.payPromoter(promoter);
            })
        }
        function payPromoter(promoter){
            if( !promoter.stripeid )
                window.alert("The promoter" + promoter.firstname + ' ' + promoter.lastname +" need to connect stipe account.")
            else
                useraccnt.payPromoter(promoter, vm.STRIPE_COMMISSION_PERCENTAGE)
                .then(function(res){
                    vm.notifications.push({message:"$" + promoter.balance*vm.STRIPE_COMMISSION_PERCENTAGE + "transfered successfully to Promoter: " + promoter.firstname + ' ' + promoter.lastname, type:"success"});
                    promoter.lastPaymentDate = res.data.lastPaymentDate;

                    promoter.payedThisMonth = true;
                    // if(!promoter.lastPaymentDate){
                    //     promoter.payedThisMonth = false;
                    // }
                    
                    // if(((moment(promoter.lastPaymentDate).year() == moment($rootScope.setting.serverDate).year()) &&
                    //     (moment(promoter.lastPaymentDate).month() < moment($rootScope.setting.serverDate).month()))||
                    //     (moment(promoter.lastPaymentDate).year() < moment($rootScope.setting.serverDate).year())) {
                    //     promoter.payedThisMonth = false;
                    // }
                })
                .catch(function(res){
                    vm.notifications.push({message:"$" + promoter.balance*vm.STRIPE_COMMISSION_PERCENTAGE + "  to Promoter: " + promoter.firstname + ' ' + promoter.lastname + " transfer failed. " , type:"error"});
                });
        }
        
        function getAnswer(account){
            answer.getAnswer(account.answer)
            .then(function(answer){
                account.answerObj = answer;
            })
        }           
        function goDetailView(promoter){
            vm.currentPromoter = promoter;
            vm.detailview = true;
            vm.overview = false;
        }
        function goBack() {
            if (vm.detailview == true) {
                vm.overview = true;
                vm.detailview = false;
                return;
            }
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
    }
})();
