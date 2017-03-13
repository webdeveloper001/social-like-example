(function () {
    'use strict';

    angular
        .module('app')
        .controller('promoterconsole', promoterconsole);

    promoterconsole.$inject = ['$location', '$rootScope', '$state', '$window','useraccnt'];

    function promoterconsole(location, $rootScope, $state, $window, useraccnt) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'promoterconsole';

        vm.overview = true;

        //Methods
        vm.gotoanswer = gotoanswer;
        vm.gotomanage = gotomanage;
        vm.goBack = goBack;
        vm.myaccnts = [];
        activate();
        vm.noAns = false;

        vm.dataReady = false;

        function activate() {

            if (!vm.dataReady){
                loadData();
            }
            console.log("Promoter console page Loaded!");

        }

        function loadData() {

            var promoterdataok = false;
            var answerid = 0;
            var idx = 0;
            var obj = {};
            //Check there is only one promoter accounts and that is for current useraccnt
            if ($rootScope.userpromoter.length == 1 && $rootScope.userpromoter[0].user == $rootScope.user.id) {
                promoterdataok = true;
            }

            if (!vm.dataReady && promoterdataok) {
                useraccnt.getaccntsbycode($rootScope.userpromoter[0].code).then(function (result) {
                    //vm.myaccnts = result;
                    console.log("resuls -", result);

                    for (var i=0; i < result.length; i++){
                        answerid = result[i].answer;
                        obj = {};
                        idx = $rootScope.answers.map(function(x) {return x.id; }).indexOf(answerid); 
                        obj = result[i];
                        obj.name = $rootScope.answers[idx].name;
                        if (obj.status == 'Basic') obj.style = 'background-color:#bfbfbf';
                        if (obj.status == 'Premium-Free Trial') obj.style = 'background-color:#b3b300';
                        if (obj.status == 'Premium-Active') obj.style = 'background-color:#009900';
                        vm.myaccnts.push(obj);
                    }
                    vm.dataReady = true;
                    activate();
                });
            }

        }

        function gotoanswer(x){
            $state.go('answerDetail', {index: x.id});
        }

        function gotomanage(x){
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
                    $state.go('rankSummary', {index: $rootScope.cCategory.id});
            else if ($rootScope.previousState == 'answerDetail')
                    $state.go('answerDetail', {index: $rootScope.canswer.id});
            else if ($rootScope.previousState == 'addAnswer')
                    $state.go('addAnswer', {index: $rootScope.canswer.id});
            else if ($rootScope.previousState == 'editAnswer')
                    $state.go('editAnswer', {index: $rootScope.canswer.id});                
            else if ($rootScope.previousState == 'about')
                    $state.go('about');
            else $state.go('cwrapper');                
        }
        

    }
})();
