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
        vm.update = update;
        vm.enableAddLocation = enableAddLocation;
        vm.addLocation = addLocation;
        vm.editLocation = editLocation;
        vm.selsa = selsa;
        vm.addsa = addsa;
        vm.savesa = savesa;
        vm.deleteloc = deleteloc;
        vm.cancel = cancel;

        activate();
        
        function activate() {
            
            vm.showAddLocation = false;
            vm.opts = ['San Diego'];
            vm.locs = [];
            
            if ($rootScope.DEBUG_MODE) console.log("locations page Loaded!");
        }

        function getLocations(){
            vm.locs = [];
            var obj = {};
            var saidxs = [];
            vm.locations = $rootScope.locations.slice(1);
            vm.locations.forEach(function(loc){
                saidxs = loc.sub_areas.split(',').map(Number);
                loc.sa = [];
                //loc.sastrs = '';
                saidxs.forEach(function(sa){
                    var i = $rootScope.locations.map(function(x) {return x.id; }).indexOf(sa);
                    if (i > -1) {
                        //loc.sastrs = loc.sastrs + ', ' + $rootScope.locations[i].nh_name;
                        obj = {};
                        obj.id = sa;
                        obj.name = $rootScope.locations[i].nh_name;
                        obj.sel = true;
                        loc.sa.push(obj);
                    } 
                });
                loc.sel = false;
                //loc.sastrs = loc.sastrs.slice(1);
                vm.locs.push(loc.nh_name);
            });
        }

        function update(){
            /*
            $rootScope.locations.forEach(function(loc){
                locations.update(loc.id,['cityname','cityid'],['San Diego',2]);
            });
            */
            //UPDATE SubAreas for CITY
            var str = '';
            vm.locations.forEach(function(s){
                str += ',' + s.id;
            });
            str = str.substring(1);
            //if ($rootScope.DEBUG_MODE) 
                console.log("str - ", str);
            var idx = $rootScope.locations.map(function(x) {return x.nh_name; }).indexOf('San Diego');
            //console.log('----> ', $rootScope.locations[idx].id, str);
            locations.update($rootScope.locations[idx].id,['sub_areas'],[str]);
        }

        function enableAddLocation(){
            vm.showAddLocation = true;
        }

        function addLocation(){
            var obj = {};
            obj.nh_name = vm.locname;
            obj.cityid = $rootScope.locations[0].cityid;
            obj.cityname = $rootScope.locations[0].cityname;
            obj.sub_areas = '';
            locations.addLocation(obj).then(function(){
                vm.showAddLocation = false;
                getLocations();
            });
        }

        function editLocation(x){
            vm.locations.forEach(function(loc){
                loc.sel = false;
            });
            x.sel = true;
        }

        function selsa(x){
            if (x.sel) x.sel = false;
            else x.sel = true;
        }

        function addsa(x){
            var obj = {};
            obj.sel = true;
            obj.name = vm.newsa;
            var idx = $rootScope.locations.map(function(x) {return x.nh_name; }).indexOf(vm.newsa);
            if (idx > -1) {
                obj.id = $rootScope.locations[idx].id;
                x.sa.push(obj);
                vm.newsa = '';
            }
            else dialog.getDialog('subAreaInvalid');
        }

        function savesa(x){
            var str = '';
            x.sa.forEach(function(s){
                if (s.sel) str += ',' + s.id;
            });

            str = str.substring(1);
            if ($rootScope.DEBUG_MODE) console.log("str - ", str);
            locations.update(x.id,['sub_areas'],[str]);
            x.sel = false;
            getLocations();

        }

        function deleteloc(x){
            locations.deleteRec(x.id).then(function(){
                getLocations();
            });
        }

        function cancel(x){
            x.sel = false;
        }
    }
})();
