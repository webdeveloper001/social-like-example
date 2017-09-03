(function () {
    'use strict';

    angular
        .module('app')
        .service('common', common);

    common.$inject = ['$rootScope'];

    function common($rootScope) {

        //Members
        
        var service = {
            getInclusiveAreas: getInclusiveAreas
        };

        return service;

        function getInclusiveAreas(nh, arr) {

            var idx = $rootScope.locations.map(function (x) { return x.id; }).indexOf(nh);
            if (idx > -1) {
                var nhSub = $rootScope.locations[idx].sub_areas.split(',').map(Number);
                if (!$rootScope.locations[idx].sub_areas) {
                    arr.push(nh);
                }
                else {
                    arr.push(nh);
                    for (var i = 0; i < nhSub.length; i++) {
                        getInclusiveAreas(nhSub[i], arr);
                    }
                }
            }
            else console.log("Could not find -- ", nh);
        }


    }
})();