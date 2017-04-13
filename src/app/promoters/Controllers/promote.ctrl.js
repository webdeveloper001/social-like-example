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

        vm.show = show;

        vm.showOne = false;
        vm.showTwo = false;
        vm.showThree = false;
        vm.showFour = false;
        vm.showFive = false;
        vm.showSix = false;
        
        activate();

        function activate() {

            console.log("promote page Loaded!");
        }

        function show(x) {

            if (x == 1 && vm.showOne) vm.showOne = false;
            else if (x == 2 && vm.showTwo) vm.showTwo = false;
            else if (x == 3 && vm.showThree) vm.showThree = false;
            else if (x == 4 && vm.showFour) vm.showFour = false;
            else if (x == 5 && vm.showFive) vm.showFive = false;
            else if (x == 6 && vm.showSix) vm.showSix = false;
            else {
                vm.showOne = false;
                vm.showTwo = false;
                vm.showThree = false;
                vm.showFour = false;
                vm.showFive = false;
                vm.showSix = false;

                if (x == 1 && !vm.showOne) vm.showOne = true;
                if (x == 2 && !vm.showTwo) vm.showTwo = true;
                if (x == 3 && !vm.showThree) vm.showThree = true;
                if (x == 4 && !vm.showFour) vm.showFour = true;
                if (x == 5 && !vm.showFive) vm.showFive = true;
                if (x == 6 && !vm.showSix) vm.showSix = true;
            }
            
        }

    }

})();
