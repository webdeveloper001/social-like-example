(function () {
    'use strict';

    angular
        .module('app')
        .controller('userstats', userstats);

    userstats.$inject = ['$location', '$rootScope', '$state', '$q', 'users', 'userpts', 'fbusers', 'uaf'];

    function userstats(location, $rootScope, $state, $q, users, userpts, fbusers, uaf) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'userstats';
        vm.award_points = "";
        vm.current_level = "";
        vm.maxActivities = 10;
        vm.totalActivitiesCount = 0;
        vm.seeMoreActivites = seeMoreActivites;
        vm.isMoreAvailable = isMoreAvailable;
        vm.seeLessActivites = seeLessActivites;
        vm.isLessAvailable = isLessAvailable;
        vm.gotoRank = gotoRank;
        vm.gotoAnswer = gotoAnswer;
                
        activate();

        function activate() {
            loadUserStats();
            if ($rootScope.DEBUG_MODE) console.log("userstats page Loaded!");
        }

        function gotoAnswer(x){
            $state.go('answerDetail',{index: x.answer});
        }
        function gotoRank(x){
            $state.go('rankSummary',{index: x.category});
        }

        function loadUserStats() {

            var q0 = userpts.getRecsByUser($rootScope.user.id); 
            var q1 = users.getUser($rootScope.user.id);
            $q.all([q0, q1]).then(function(result){
                var stats = result[1][0];
                vm.award_points = stats.points;
                vm.current_level = stats.level ? stats.level  : 'Newcomer';

                var user_points = result[0];
                vm.totalActivitiesCount = user_points.length;
                var activities = [];
                var uaf_ids = []; 
                for (var i = 0; i < user_points.length; i++) {
                    uaf_ids.push(user_points[i].uaf);
                }
                $q.all([uaf.getUafsFromId(uaf_ids)]).then(function(result){
                    var _uafs = result[0];
                    var uafs = [];
                    for (var i = 0; i < _uafs.length; i++) {
                        uafs[_uafs[i].id.toString()] = _uafs[i];
                    }
                    for (var i = 0; i < user_points.length; i++) {
                        var activity = angular.copy(angular.extend(uafs[parseInt(user_points[i].uaf)], user_points[i]));
                        activities.push(activity);
                    }
                    vm.feeds = activities;
                })
            })

        }

        function seeMoreActivites() {
            vm.maxActivities += 10;
        }

        function isMoreAvailable() {
            return (vm.totalActivitiesCount - 10 >= vm.maxActivities);
        }

        function seeLessActivites() {
            vm.maxActivities -= 10;
        }

        function isLessAvailable() {
            return (vm.maxActivities >= 20);            
        }

    }
})();
