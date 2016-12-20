(function () {
    'use strict';

    angular
        .module('app')
        .controller('flags', flags);

    flags.$inject = ['$location', '$rootScope', '$state','flag'];

    function flags(location, $rootScope, $state, flag) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'flags';
        
        //Methods
        vm.getFlags = getFlags;
               
       activate();

        function activate() {            

            console.log("Flags page loaded!");           
        }
        
        function getFlags(){            
            flag.getFlags().then(function(result){
                vm.flags = result;
                for (var i=0; i<vm.flags.length; i++){
                    if (vm.flags[i].type == 'comment-rank' || vm.flags[i].type == 'comment-answer'){
                        switch (vm.flags[i].flag){
                            case 1: { vm.flags[i].desc = 'Off-Topic'; break; }
                            case 2: { vm.flags[i].desc = 'Offensive'; break; }
                            case 3: { vm.flags[i].desc = 'Spam'; break; }
                        }
                    }
                    if (vm.flags[i].type == 'answer'){
                        switch (vm.flags[i].flag){
                            case 1: { vm.flags[i].desc = 'Wrong Category'; break; }
                            case 2: { vm.flags[i].desc = 'No longer active'; break; }
                            case 3: { vm.flags[i].desc = 'Offensive'; break; }
                            case 4: { vm.flags[i].desc = 'Spam'; break; }
                        }
                    }
                }
            });          
        }
    }
})();
