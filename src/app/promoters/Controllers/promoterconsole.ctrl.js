(function () {
    'use strict';

    angular
        .module('app')
        .controller('promoterconsole', promoterconsole);

    promoterconsole.$inject = ['$location', '$rootScope', '$state', '$window', 'useraccnt', 'dialog', 'promoter', '$location', 'STRIPE_CLIENT_ID', 'setting', '$q'];

    function promoterconsole(location, $rootScope, $state, $window, useraccnt, dialog, promoter, $location, STRIPE_CLIENT_ID, setting, $q) {
        /* jshint validthis:true */
        var vm = this;
        vm.notifications = [];        
        if($window.location.href.indexOf('connectStripe') !== -1) {
            var isSuccess =  $window.location.href.slice($window.location.href.indexOf('connectStripe')).split('=')[1].split('&')[0];
            if(isSuccess == 'success'){
                vm.notifications.push({message:"You are successfully connected to your Stripe Account", type: "success"});
            } else {
                $window.alert($window.location.href.slice($window.location.href.indexOf('message')).split('=')[1].split('&')[0]);
            }
        }

        var fields = [];
        var labels = [];
        var vals = [];

        vm.title = 'promoterconsole';

        vm.overview = true;
        vm.manageview = true;
        
        //Methods
        vm.gotoanswer = gotoanswer;
        vm.gotomanage = gotomanage;
        vm.gotoPromotePage = gotoPromotePage;
        vm.goBack = goBack;
        vm.goEdit = goEdit;
        vm.goSignup = goSignup;
        vm.connectStripe = connectStripe;
        vm.myaccnts = [];
        vm.noAns = false;
        vm.manageview = false;
        vm.dataReady = false;
        var promoterdataok = false;

        retrieveData();

        function retrieveData() {
            $q.all([promoter.getbyUser($rootScope.user.id), setting.getSetting()])
            .then(function (data) {
                $rootScope.userpromoter = data[0];
                vm.STRIPE_COMMISSION_PERCENTAGE = data[1].STRIPE_COMMISSION_PERCENTAGE;
                vm.CUSTOM_RANK_PRICE = data[1].CUSTOM_RANK_PRICE;
                activate();
            });
        }

        function connectStripe(){
	        var igPopup = window.open('https://connect.stripe.com/oauth/authorize?response_type=code&client_id=' + STRIPE_CLIENT_ID + '&scope=read_write&state=' + vm.promoter.id,'Stripe Connect', '_self');
            
        }

        function activate() {

            //Check there is only one promoter accounts and that is for current useraccnt
            if ($rootScope.userpromoter) {
                if ($rootScope.userpromoter.length == 1 && $rootScope.userpromoter[0].user == $rootScope.user.id) {
                    promoterdataok = true;
                    vm.promoter = $rootScope.userpromoter[0];
                    vm.userIsPromoter = true;
                }
                else {
                    vm.userIsPromoter = false;
                    vm.dataReady = true;
                }
            }
            else {
                vm.userIsPromoter = false;
                vm.dataReady = true;
            }

            if (!vm.dataReady) {
                loadData();
            }
            console.log("Promoter console page Loaded!");
            console.log("vm.dataReady - ",vm.dataReady);

        }

        function loadData() {

            var answerid = 0;
            var idx = 0;
            var obj = {};


            if (!vm.dataReady && promoterdataok) {
                useraccnt.getaccntsbycode($rootScope.userpromoter[0].code).then(function (result) {

                    console.log("resuls -", result);

                    for (var i = 0; i < result.length; i++) {
                        answerid = result[i].answer;
                        obj = {};
                        idx = $rootScope.answers.map(function (x) { return x.id; }).indexOf(answerid);
                        obj = angular.copy(result[i])
                        obj.name = $rootScope.answers[idx].name;
                        obj.answerObj = $rootScope.answers[idx];
                        if (obj.status == 'Basic') obj.style = 'background-color:#bfbfbf';
                        if (obj.istrial){
                            obj.status = 'On Trial ' + Math.ceil(moment.duration(moment(obj.discountEndDate) - moment()).asDays()) + ' Days left';
                            obj.style = 'background-color:#b3b300';
                        } else {
                            obj.status = 'Active';
                            obj.style = 'background-color:#009900';
                        } 

                        //get monthly price
                        for (var k=0; k<$rootScope.codeprices.length; k++){
                            //console.log($rootScope.codeprices[k].code, bizObj.bizcat);
                            if ($rootScope.codeprices[k].code == obj.bizcat){
                                obj.price = $rootScope.codeprices[k].price;
                                break;
                            }
                        }
                        obj.totalCommission = 0;
                        if(obj.ispremium)
                            obj.totalCommission += obj.price  * vm.STRIPE_COMMISSION_PERCENTAGE;
                        if(obj.hasranks)
                            obj.totalCommission += obj.ranksqty* vm.CUSTOM_RANK_PRICE *vm.STRIPE_COMMISSION_PERCENTAGE;

                        vm.myaccnts.push(obj);
                    }
                    if (vm.myaccnts.length > 0) vm.noAns = false;
                    else vm.noAns = true;

                    vm.dataReady = true;
                    activate();
                });
            }
        }



        function gotoanswer(x) {
            $state.go('answerDetail', { index: x.slug });
        }

        function gotoPromotePage() {
            $state.go('promote');
        }

        function gotomanage(x) {
            //$state.go('mybiz');
            vm.manageview = true;
            vm.business = x;
            vm.overview = false;
        }

        function goBack() {
            if (vm.manageview == true) {
                vm.overview = true;
                vm.manageview = false;
                return;
            }

            if ($rootScope.previousState == 'rankSummary')
                $state.go('rankSummary', { index: $rootScope.cCategory.id });
            else if ($rootScope.previousState == 'answerDetail')
                $state.go('answerDetail', { index: $rootScope.canswer.id });
            else if ($rootScope.previousState == 'addAnswer')
                $state.go('addAnswer', { index: $rootScope.canswer.id });
            else if ($rootScope.previousState == 'editAnswer')
                $state.go('editAnswer', { index: $rootScope.canswer.id });
            else if ($rootScope.previousState == 'about')
                $state.go('about');
            else $state.go('cwrapper');
        }

        function goEdit() {
            fields = ['firstname', 'lastname', 'email', 'address', 'phone'];
            labels = ['First Name', 'Last Name', 'Email', 'Address', 'Phone'];
            vals = [vm.promoter.firstname, vm.promoter.lastname, vm.promoter.email, vm.promoter.address, vm.promoter.phone];

            dialog.editInfo(fields, labels, vals, execEdit);
        }

        function execEdit(newvals) {
            promoter.update(vm.promoter.id, fields, newvals).then(function () {
                loadData();
            });
        }

        function goSignup(){
            $state.go('promotersignup');
        }

    }
})();
