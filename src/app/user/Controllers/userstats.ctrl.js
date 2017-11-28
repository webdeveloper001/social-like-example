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

            $q.all([userpts.getRecsByUser($rootScope.user.id)]).then(function(result){
                var user_points = result[0];
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


            // var q0 = users.getUser($rootScope.user.id)
            // var q1 = userpts.getRecsByUser($rootScope.user.id)
            // var q2 = userpts.getActionPoints()

            // $q.all([q0, q1, q2]).then(function(data) {
            //     var stats = data[0][0];
            //     vm.award_points = stats.points;
            //     vm.current_level = stats.level ? stats.level  : 'Newcomer';
            //     vm.activities = data[1];
            //     vm.action_points = data[2];
            //     $q.all($rootScope.uafs.map(function (feed) {
            //         return fbusers.getFBUserById(feed.userid);
            //     }))
            //     .then(function (fbUsers) {
            //         vm.feeds = [];
            //         for (var i = 0; i < $rootScope.uafs.length; i++) {
            //             var userWithPic = angular.copy($rootScope.uafs[i]);
            //             userWithPic.picture = fbUsers[i] ? fbUsers[i].picture.data.url : null;
            //             for (var k = 0; k < vm.action_points.length; k++) {
            //                 if (userWithPic.action == vm.action_points[k].action) {
            //                     userWithPic.pts = vm.action_points[k].pts;
            //                 }
            //             }

            //             vm.feeds[i] = userWithPic;
            //         }
            //     });                    
            // })
        }

        function seeMoreActivites() {
            vm.maxActivities += 10;
        }

        function isMoreAvailable() {
            return ($rootScope.uafs.length - 10 >= vm.maxActivities);
        }

        function seeLessActivites() {
            vm.maxActivities -= 10;
        }

        function isLessAvailable() {
            return (vm.maxActivities >= 20);            
        }

    }
})();
