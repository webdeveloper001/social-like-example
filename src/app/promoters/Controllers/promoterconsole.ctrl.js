(function () {
    'use strict';

    angular
        .module('app')
        .controller('promoterconsole', promoterconsole);

    promoterconsole.$inject = ['$location', '$rootScope', '$state', '$window', 'useraccnt', 'dialog', 'promoter'];

    function promoterconsole(location, $rootScope, $state, $window, useraccnt, dialog, promoter) {
        /* jshint validthis:true */
        var vm = this;

        var fields = [];
        var labels = [];
        var vals = [];

        vm.title = 'promoterconsole';

        vm.overview = true;

        //Methods
        vm.gotoanswer = gotoanswer;
        vm.gotomanage = gotomanage;
        vm.gotoPromotePage = gotoPromotePage;
        vm.goBack = goBack;
        vm.goEdit = goEdit;
        vm.goSignup = goSignup;
        vm.myaccnts = [];
        vm.noAns = false;

        vm.dataReady = false;
        var promoterdataok = false;

        retrieveData();

        function retrieveData() {
            promoter.getbyUser($rootScope.user.id).then(function (result) {
                 $rootScope.userpromoter = result;
                 activate();
            });
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
                    //vm.myaccnts = result;
                    console.log("resuls -", result);

                    for (var i = 0; i < result.length; i++) {
                        answerid = result[i].answer;
                        obj = {};
                        idx = $rootScope.answers.map(function (x) { return x.id; }).indexOf(answerid);
                        obj = result[i];
                        obj.name = $rootScope.answers[idx].name;
                        if (obj.status == 'Basic') obj.style = 'background-color:#bfbfbf';
                        if (obj.status == 'Premium-Free Trial') obj.style = 'background-color:#b3b300';
                        if (obj.status == 'Premium-Active') obj.style = 'background-color:#009900';
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
            $state.go('answerDetail', { index: x.id });
        }

        function gotoPromotePage() {
            $state.go('promote');
        }

        function gotomanage(x) {
            //$state.go('mybiz');
            if (x.status == 'Basic') vm.isBasic = true;
            else vm.isBasic = false;
            vm.business = x;
            vm.overview = false;
        }

        function goBack() {
            if (vm.overview == false) {
                vm.overview = true;
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
