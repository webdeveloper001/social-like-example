(function () {
    'use strict';

    angular
        .module('app')
        .controller('specials', specials);

    specials.$inject = ['$location', '$rootScope', '$state', 'dialog', 'special'];

    function specials(location, $rootScope, $state, dialog, special) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'specials';

        vm.addSpecial = addSpecial;
        vm.selSpecial = selSpecial;
        vm.closeRank = closeRank;
        vm.header = $rootScope.canswer.name;

        vm.specialsList = [];

        //$rootScope.cust.specials = [];

        activate();

        function activate() {
           
            //Load specials for this answer
            special.getSpecialsbyAnswer($rootScope.canswer.id).then(function (response) {
                $rootScope.specials = response;
                displaySpecials();
            });

            console.log("Specials Page loaded!")

        }

        function displaySpecials() {
            vm.specialsList = $rootScope.specials;
        }

        function addSpecial() {
            $rootScope.specialmode = 'add'
            $state.go('editspecial');
        }

        function selSpecial(x) {

            $rootScope.cspecial = x;
            $rootScope.specialmode = 'edit'
            $state.go('editspecial');
        }
        
        function closeRank() {
               $state.go("answerDetail", { index: $rootScope.canswer.id });                              
        }

    }
})();
