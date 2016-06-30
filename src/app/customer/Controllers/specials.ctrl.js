(function () {
    'use strict';

    angular
        .module('app')
        .controller('specials', specials);

    specials.$inject = ['$location', '$rootScope', '$state','uiCalendarConfig'];

    function specials(location, $rootScope, $state, uiCalendarConfig) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'specials';
        
        //Methods
        vm.displayCharLength = displayCharLength;
               
       activate();

        function activate() {            

            console.log("specials page Loaded!");
            vm.char = 25;
            vm.fontColor = "hsl(0, 100%, 0%)"; //black
            vm.backgroundColor = "hsl(0, 0%, 100%)"; //white
            
            
        }
        
        function displayCharLength() {
            vm.char = 25 - vm.val.length;
        }
    }
})();
