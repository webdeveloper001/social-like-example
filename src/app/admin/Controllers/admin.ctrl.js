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
        vm.foodranks = foodranks;
        vm.payment = payment;
        //vm.fbpost = fbpost;
        
        activate();

        function activate() {
            
            vm.isDET = $rootScope.isLoggedIn && ($rootScope.user.id == '10104518570729893' ||
                                          $rootScope.user.id == 30 ||
                                          $rootScope.user.id == 41 ||  
                                          $rootScope.user.id == 42 ||
                                          $rootScope.user.id == 30 ||
                                          $rootScope.user.id == 187959328383879);
            
            vm.isAdmin = $rootScope.user.is_sys_admin;
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
            vm.selFoodRanks = '';
            vm.selPayment = '';

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
            vm.selFoodRanks = '';
            vm.selPayment = '';

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
            vm.selFoodRanks = '';
            vm.selPayment = '';

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
            vm.selFoodRanks = '';
            vm.selPayment = '';

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
            vm.selFoodRanks = '';
            vm.selPayment = '';
            
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
            vm.selFoodRanks = '';
            vm.selPayment = '';
            
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
            vm.selFoodRanks = '';
            vm.selPayment = '';
            
            $state.go('updateHeaders');
        }
        
        function foodranks(){
            vm.selKeywords = '';
            vm.selViews = '';
            vm.selFlags = '';
            vm.selRankings = '';
            vm.selDbMaint = '';
            vm.selQuery = '';
            vm.selUpdate = '';
            vm.selFoodRanks = 'active';
            vm.selPayment = '';
            
            $state.go('foodRanks');
            
        }

        function payment() {
            vm.selKeywords = '';
            vm.selViews = '';
            vm.selFlags = '';
            vm.selRankings = '';
            vm.selDbMaint = '';
            vm.selQuery = '';
            vm.selUpdate = '';
            vm.selFoodRanks = '';
            vm.selPayment = 'active';

            $state.go('payment');

        }

        function goBack() {
            //if ($rootScope.cCategory.id == undefined) $state.go('rankSummary', { index: $rootScope.cCategory.id });
            //else $state.go('rankSummary', { index: 1 });
            $state.go('content');
        }     
    }
})();
