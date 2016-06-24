(function () {
    'use strict';

    angular
        .module('app')
        .controller('queries', queries);

    queries.$inject = ['$location', '$rootScope', '$state', 'query'];

    function queries(location, $rootScope, $state, query) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'queries';

        vm.clearDb = clearDb;

        activate();

        function activate() {

            query.getQueries().then(function (response) {
                vm.queries = response;
                console.log("Queries Loaded!");

            });

        }

        function clearDb() {
                
            var data = [];
            for (var i = 0; i < vm.queries.length; i++) {
                var item = {};
                item.id = vm.queries[i].id;
                data.push(item);
            }

            //console.log("obj    ---- ", obj)
            query.flushAll(data);

        }
    }
})();
