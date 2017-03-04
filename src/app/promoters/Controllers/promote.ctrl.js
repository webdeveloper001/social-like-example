(function () {
    'use strict';

    angular
        .module('app')
        .controller('promote', promote);

    promote.$inject = ['$location', '$rootScope', '$state','promoter'];

    function promote(location, $rootScope, $state, promoter) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'promote';

        vm.getcode = getcode;
        vm.submit = submit;
        
        activate();

        function activate() {

            console.log("promote page Loaded!");
        }

        function submit() {
            vm.promoter.user = $rootScope.user.id;
            vm.promoter.code = vm.code;
            
            console.log("Add Promoter");
            promoter.add(vm.promoter);
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

    }

})();
