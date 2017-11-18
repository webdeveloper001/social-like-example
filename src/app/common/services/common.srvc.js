(function () {
    'use strict';

    angular
        .module('app')
        .service('common', common);

    common.$inject = ['$rootScope'];

    function common($rootScope) {

        //Members
        
        var service = {
            getInclusiveAreas: getInclusiveAreas,
            getIndexFromSlug: getIndexFromSlug
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

        function getIndexFromSlug(slug){
            //first check if slug is number
            if (isNumber(slug)){
                return slug;
            }
            else{
                var slugA = slug.split('-').map(Number);
                return slugA[slugA.length-1];
            }
        }

        function isNumber (o) {
            return ! isNaN (o-0) && o !== null && o !== "" && o !== false;
        }


    }
})();