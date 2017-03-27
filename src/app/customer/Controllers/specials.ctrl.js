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
        vm.deleteSpecial = deleteSpecial;
        vm.goBack = goBack;

        vm.specialsList = [];
        vm.dataReady = false;
        var selSpecial = {};

        //$rootScope.cust.specials = [];

        activate();

        function activate() {
           
            //Load specials for this answer
            special.getSpecialsbyAnswer($rootScope.canswer.id).then(function (response) {
                $rootScope.specials = response;
                vm.dataReady = true;
                displaySpecials();
            });

            console.log("Specials Page loaded!")

        }

        function displaySpecials() {
            vm.specialsList = [];
            var obj = {};
            for (var i=0; i<7; i++){
                obj = {};
                if (i < $rootScope.specials.length){
                    obj = $rootScope.specials[i];
                    obj.used = true;
                }
                else{
                    obj.stitle = 'Empty';
                    obj.used = false;
                }
                vm.specialsList.push(obj);
            }
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

        function deleteSpecial(x){
            selSpecial = x;
            dialog.deleteRank(x,execDeleteSpecial,true);
        }

        function execDeleteSpecial(){
            special.deleteSpecial(selSpecial.id).then(function(){
                displaySpecials();
            });
        }
        
        function goBack() {
               $state.go("answerDetail", { index: $rootScope.canswer.id });                              
        }

    }
})();
