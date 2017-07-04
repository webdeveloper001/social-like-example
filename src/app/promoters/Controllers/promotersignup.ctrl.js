(function () {
    'use strict';

    angular
        .module('app')
        .controller('promotersignup', promotersignup);

    promotersignup.$inject = ['$location', '$rootScope', '$state','promoter','dialog', 'mailing'];

    function promotersignup(location, $rootScope, $state, promoter, dialog, mailing) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'promote';

        vm.getcode = getcode;
        vm.submit = submit;
        
        var dataOk = false;
        
        activate();
        vm.showTOSPromotersDlg = showTOSPromotersDlg;
        function activate() {

            //initialize
            vm.promoter = {};
            vm.promoter.firstname = '';
            vm.promoter.lastname = '';
            vm.promoter.phone = '';
            vm.promoter.address = '';
            vm.promoter.code = '';
            vm.promoter.email = '';

            vm.code = '';
            
            if ($rootScope.user) {
                vm.promoter.firstname = $rootScope.user.first_name;
                vm.promoter.lastname = $rootScope.user.last_name;
                vm.promoter.user = $rootScope.user.id;
            }
            else dialog.getDialog('nologinsignup');

            console.log("promote page Loaded!");
        }

        function submit() {

            vm.promoter.code = vm.code;
            
            checkInputData();
            //vm.promoter.user = $rootScope.user.id;
            if (dataOk) promoter.add(vm.promoter).then(function(){
                mailing.promoterCreated(vm.promoter)
                .then(function(){

                });
                dialog.notificationWithCallback('Success','You have successfully registered as a Promoter. ',gotoPromoterConsole);

            });
        }

        function gotoPromoterConsole(){
            $state.go('promoterconsole');
        }
        function checkInputData(){
            dataOk = true;
            if ($rootScope.DEBUG_MODE) console.log("vm.promoter ", vm.promoter);

            if (vm.promoter.firstname.length < 1) {
                dialog.getDialog('firstnameisinvalid');
                dataOk = false;
            }
            else if (vm.promoter.lastname.length < 1) {
                dialog.getDialog('lastnameisinvalid');
                dataOk = false;
            }
            else if (vm.promoter.email.length < 1 || vm.promoter.email.indexOf('@')<0) {
                dialog.getDialog('emailisinvalid');
                dataOk = false;
            }
            else if (vm.promoter.address.length < 5) {
                dialog.getDialog('addressisinvalid');
                dataOk = false;
            }
            else if (vm.promoter.phone.length < 9) {
                dialog.getDialog('phoneisinvalid');
                dataOk = false;
            }
            else if (vm.promoter.code.length < 1) {
                dialog.getDialog('missingcode');
                dataOk = false;
            }
        }

        //Create random code
        function getcode() {

            var text = "";
            var nums = "";
            //var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            //var possible = "abcdefghijklmnopqrstuvwxyz0123456789";
            var possiblet = "abcdefghijklmnopqrstuvwxyz";
            var possiblen = "0123456789";
            for (var i = 0; i < 5; i++)
                text += possiblet.charAt(Math.floor(Math.random() * possiblet.length));

            for (var i = 0; i < 3; i++)
                nums += possiblen.charAt(Math.floor(Math.random() * possiblen.length));    

            vm.code = text+nums;
        }
        
        function showTOSPromotersDlg(){
            dialog.showTOSPromotersDlg();
        }
    }

})();




