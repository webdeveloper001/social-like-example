(function () {
    'use strict';

    angular
        .module('app')
        .controller('locations', locations);

    locations.$inject = ['$rootScope', 'staticpages', 'dialog','SERVER_URL','$timeout','locations'];

    function locations($rootScope, staticpages, dialog, SERVER_URL, $timeout, locations) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'locations';

        //Methods
        vm.getLocations = getLocations;
        
        activate();
        
        function activate() {
            
            vm.opts = ['San Diego'];
            
            if ($rootScope.DEBUG_MODE) console.log("locations page Loaded!");
        }

        function getLocations(){
            vm.locations = $rootScope.locations.slice(1);
            vm.locations.forEach(function(loc){
                loc.saidxs = loc.sub_areas.split(',').map(Number);
                loc.sastrs = '';
                loc.saidxs.forEach(function(sa){
                    var i = $rootScope.locations.map(function(x) {return x.id; }).indexOf(sa);
                    if (i > -1) loc.sastrs = loc.sastrs + ', ' + $rootScope.locations[i].nh_name; 
                });
                loc.sastrs = loc.sastrs.slice(1);
            })
        }

    }
})();
