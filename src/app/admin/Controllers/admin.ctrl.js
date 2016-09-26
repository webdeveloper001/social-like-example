(function () {
    'use strict';

    angular
        .module('app')
        .controller('admin', admin);

    admin.$inject = ['$location', '$rootScope', '$state'];

    function admin(location, $rootScope, $state) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'admin';

        vm.selKeywords = 'active';
        vm.selViews = '';
        vm.selFlags = '';
        vm.selRankings = '';

        vm.goBack = goBack;
        vm.keywords = keywords;
        vm.views = views;
        vm.flags = flags;
        vm.addRank = addRank;
        vm.dbMaint = dbMaint;
        vm.dbQuery = dbQuery;
        vm.update = update;

        activate();

        function activate() {

            console.log("admin page Loaded!");

        }
        function keywords() {
            vm.selKeywords = 'active';
            vm.selViews = '';
            vm.selFlags = '';
            vm.selRankings = '';
            vm.selDbMaint = '';
            vm.selQuery = '';
            vm.selUpdate = '';

            $state.go('queries');

        }
        function views() {
            vm.selKeywords = '';
            vm.selViews = 'active';
            vm.selFlags = '';
            vm.selRankings = '';
            vm.selDbMaint = '';
            vm.selQuery = '';
            vm.selUpdate = '';

            $state.go('views');

        }
        function flags() {
            vm.selKeywords = '';
            vm.selViews = '';
            vm.selFlags = 'active';
            vm.selRankings = '';
            vm.selDbMaint = '';
            vm.selQuery = '';
            vm.selUpdate = '';

            $state.go('flags');

        }

        function addRank() {
            vm.selKeywords = '';
            vm.selViews = '';
            vm.selFlags = '';
            vm.selRankings = 'active';
            vm.selDbMaint = '';
            vm.selQuery = '';
            vm.selUpdate = '';

            $state.go('addRank');

        }

        function dbMaint() {
            vm.selKeywords = '';
            vm.selViews = '';
            vm.selFlags = '';
            vm.selRankings = '';
            vm.selDbMaint = 'active';
            vm.selQuery = '';
            vm.selUpdate = '';
            
            $state.go('dbMaint');
        }

        function dbQuery() {
            vm.selKeywords = '';
            vm.selViews = '';
            vm.selFlags = '';
            vm.selRankings = '';
            vm.selDbMaint = '';
            vm.selQuery = 'active';
            vm.selUpdate = '';
            
            $state.go('dbQuery');
        }
        
         function update() {
            vm.selKeywords = '';
            vm.selViews = '';
            vm.selFlags = '';
            vm.selRankings = '';
            vm.selDbMaint = '';
            vm.selQuery = '';
            vm.selUpdate = 'active';
            
            $state.go('updateHeaders');
        }


        function goBack() {
            //if ($rootScope.cCategory.id == undefined) $state.go('rankSummary', { index: $rootScope.cCategory.id });
            //else $state.go('rankSummary', { index: 1 });
            $state.go('content');
        }

    }
})();
