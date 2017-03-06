(function () {
    'use strict';

    angular
        .module('app')
        .controller('mybusiness', mybusiness);

    mybusiness.$inject = ['$location', '$rootScope', '$state', '$window','useraccnt'];

    function mybusiness(location, $rootScope, $state, $window, useraccnt) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'mybusiness';

        vm.overview = true;

        //Methods
        vm.gotoanswer = gotoanswer;
        vm.gotomanage = gotomanage;
        vm.goBack = goBack;
        vm.mybizs = [];
        activate();
        vm.noAns = false;

        function activate() {
            loadData();
            console.log("mybusiness page Loaded!");

        }

        function loadData(){
            var accntExists = false;
            var bizObj = {};
            for (var i=0; i<$rootScope.answers.length; i++){
                if ($rootScope.answers[i].owner == $rootScope.user.id){
                    accntExists = false;
                    bizObj = {};
                    bizObj = $rootScope.answers[i];

                    //Check that record exists also in user accounts, if not, it will get created
                    for (var j=0; j<$rootScope.useraccnts.length; j++){
                        if ($rootScope.useraccnts[j].answer == $rootScope.answers[i].id) { 
                            accntExists = true;
                            bizObj.status = $rootScope.useraccnts[j].status;
                            bizObj.bizcat = $rootScope.useraccnts[j].bizcat;
                            bizObj.email = $rootScope.useraccnts[j].email;
                            bizObj.accountid = $rootScope.useraccnts[j].id;
                            bizObj.firstname = $rootScope.user.first_name;
                            bizObj.lastname = $rootScope.user.last_name;
                                if (bizObj.status == 'Basic') bizObj.style = 'background-color:#bfbfbf';
                                if (bizObj.status == 'Premium-Free Trial') bizObj.style = 'background-color:#b3b300';
                                if (bizObj.status == 'Premium-Active') bizObj.style = 'background-color:#009900';
                            break;
                        }                        
                    }
                    if (!accntExists) useraccnt.adduseraccnt($rootScope.answers[i]);
                    vm.mybizs.push(bizObj);               
                }
            }
  
            console.log("vm.mybizs", vm.mybizs);
            if (vm.mybizs.length == 0) vm.noAns = true;           
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
