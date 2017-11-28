(function () {
    'use strict';

    angular
        .module('app')
        .controller('myfriends', myfriends);

    myfriends.$inject = ['$location', '$rootScope', '$state', '$window', 'votes', '$scope', 'dialog'];

    function myfriends(location, $rootScope, $state, $window, votes, $scope, dialog) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'myfriends';

        vm.goBack = goBack;
        vm.answerDetail = answerDetail;
        vm.seeMore = seeMore;
        vm.showAllFriendsList = showAllFriendsList;

        // ----- SEO tags ----
        $scope.$parent.$parent.$parent.seo = { 
            pageTitle : "My Friends' Favourite", 
            metaDescription: "RankX lets you see your friends' favorite food, lifestyle, health, beauty and services." 
        };

        var cdate = new Date();
        var dayOfWeek = cdate.getDay();
        var isToday = false;
        vm.noAns = false;
        vm.friendsDataLoading = true;
        vm.maxRes1 = 5; vm.btext1 = 'See more';
        vm.maxRes2 = 5; vm.btext2 = 'See more';
        vm.maxRes3 = 5; vm.btext3 = 'See more';
        vm.maxRes4 = 5; vm.btext4 = 'See more';
        vm.maxRes5 = 5; vm.btext5 = 'See more';
        vm.maxRes6 = 5; vm.btext6 = 'See more';
        vm.maxRes7 = 5; vm.btext7 = 'See more';

        vm.cb1gt5 = false;
        vm.cb2gt5 = false;
        vm.cb3gt5 = false;
        vm.cb4gt5 = false;
        vm.cb5gt5 = false;
        vm.cb6gt5 = false;
        vm.cb7gt5 = false;


        function showAllFriendsList(userObjs, answername){
            dialog.showAllFriendsListDlg(userObjs, answername);
        }
        activate();

        function activate() {
            formatTables(); 
            if( !$rootScope.friendsVotes ){
                votes.loadVotesByMyFriends()
                .then(function(data){
                    $rootScope.friends_votes = data;
                    formatData();
                })
            } else {
                formatData();
            }
        }

        function formatTables() {

            for (var i = 0; i < $rootScope.headlines.length; i++) {
                if ($rootScope.headlines[i].type == 'food') {
                    vm.bgc1 = $rootScope.headlines[i].bc;
                    vm.fc1 = $rootScope.headlines[i].fc;
                    vm.headline1 = $rootScope.headlines[i].title;
                    break;
                }
            }

            for (var i = 0; i < $rootScope.headlines.length; i++) {
                if ($rootScope.headlines[i].type == 'lifestyle') {
                    vm.bgc2 = $rootScope.headlines[i].bc;
                    vm.fc2 = $rootScope.headlines[i].fc;
                    vm.headline2 = $rootScope.headlines[i].title; 
                    break;
                }
            }

            for (var i = 0; i < $rootScope.headlines.length; i++) {
                if ($rootScope.headlines[i].type == 'services') {
                    vm.bgc3 = $rootScope.headlines[i].bc;
                    vm.fc3 = $rootScope.headlines[i].fc;
                    vm.headline3 = $rootScope.headlines[i].title;
                    break;
                }
            }

            for (var i = 0; i < $rootScope.headlines.length; i++) {
                if ($rootScope.headlines[i].type == 'health') {
                    vm.bgc4 = $rootScope.headlines[i].bc;
                    vm.fc4 = $rootScope.headlines[i].fc;
                    vm.headline4 = $rootScope.headlines[i].title;
                    break;
                }
            }

            for (var i = 0; i < $rootScope.headlines.length; i++) {
                if ($rootScope.headlines[i].type == 'beauty') {
                    vm.bgc5 = $rootScope.headlines[i].bc;
                    vm.fc5 = $rootScope.headlines[i].fc;
                    vm.headline5 = $rootScope.headlines[i].title;
                    break;
                }
            }

            for (var i = 0; i < $rootScope.headlines.length; i++) {
                if ($rootScope.headlines[i].type == 'social') {
                    vm.bgc6 = $rootScope.headlines[i].bc;
                    vm.fc6 = $rootScope.headlines[i].fc;
                    vm.headline6 = $rootScope.headlines[i].title;
                    break;
                }
            }

            for (var i = 0; i < $rootScope.headlines.length; i++) {
                if ($rootScope.headlines[i].type == 'family') {
                    vm.bgc7 = $rootScope.headlines[i].bc;
                    vm.fc7 = $rootScope.headlines[i].fc;
                    vm.headline7 = $rootScope.headlines[i].title;
                    break;
                }
            }
        }

        function formatData() {
            var answer = {};
            var category = {};

            vm.foodans = [];
            vm.lifestyleans = [];
            vm.servicesans = [];
            vm.healthans = [];
            vm.beautyans = [];
            vm.socialans = [];
            vm.familyans = [];

            var tmap = [];


            for (var i = 0; i < $rootScope.friends_votes.length; i++) {
                if ($rootScope.friends_votes[i].vote == 1) {
                    var idx = $rootScope.answers.map(function (x) { return x.id; }).indexOf($rootScope.friends_votes[i].answer);
                    answer = $rootScope.answers[idx];
                    if (idx > -1) {
                        //console.log("answer - ", answer.name);
                        if (answer.type == 'Establishment') {

                            //look this answer in catans recs
                            for (var n = 0; n < $rootScope.catansrecs.length; n++) {

                                if ($rootScope.catansrecs[n].answer == answer.id) {

                                    var idx2 = $rootScope.content.map(function (x) { return x.id; }).indexOf($rootScope.catansrecs[n].category);
                                    category = $rootScope.content[idx2];
                                    if (!category)
                                        continue;
                                    if (category.title.indexOf('food') > -1 || category.tags.indexOf('food') > -1) {
                                        addRecord(vm.foodans, answer, i);
                                    }

                                    if (category.title.indexOf('lifestyle') > -1 || category.tags.indexOf('lifestyle') > -1) {

                                        addRecord(vm.lifestyleans, answer, i);
                                    }

                                    if (category.title.indexOf('services') > -1 || category.tags.indexOf('services') > -1) {

                                        addRecord(vm.servicesans, answer, i);
                                    }

                                    if (category.title.indexOf('health') > -1 || category.tags.indexOf('health') > -1) {

                                        addRecord(vm.healthans, answer, i);
                                    }

                                    if (category.title.indexOf('beauty') > -1 || category.tags.indexOf('beauty') > -1) {

                                        addRecord(vm.beautyans, answer, i);
                                    }


                                    if (category.title.indexOf('social') > -1 || category.tags.indexOf('social') > -1) {

                                        addRecord(vm.socialans, answer, i);
                                    }

                                    if (category.title.indexOf('family') > -1 || category.tags.indexOf('family') > -1) {

                                        addRecord(vm.familyans, answer, i);
                                    }
                                }
                            }
                        }
                    }   
                }
            }
            
            if (vm.foodans.length > 5) vm.cb1gt5 = true;
            if (vm.lifestyleans.length > 5) vm.cb2gt5 = true;
            if (vm.servicesans.length > 5) vm.cb3gt5 = true;
            if (vm.healthans.length > 5) vm.cb4gt5 = true;
            if (vm.beautyans.length > 5) vm.cb5gt5 = true;
            if (vm.socialans.length > 5) vm.cb6gt5 = true;
            if (vm.familyans.length > 5) vm.cb7gt5 = true;

            if (vm.foodans.length > 0) vm.answerExist1 = true;
            else vm.answerExist1 = false;

            if (vm.lifestyleans.length > 0) vm.answerExist2 = true;
            else vm.answerExist2 = false;

            if (vm.servicesans.length > 0) vm.answerExist3 = true;
            else vm.answerExist3 = false;

            if (vm.healthans.length > 0) vm.answerExist4 = true;
            else vm.answerExist4 = false;

            if (vm.beautyans.length > 0) vm.answerExist5 = true;
            else vm.answerExist5 = false;

            if (vm.socialans.length > 0) vm.answerExist6 = true;
            else vm.answerExist6 = false;

            if (vm.familyans.length > 0) vm.answerExist7 = true;
            else vm.answerExist7 = false;
            
            
            if (vm.foodans.length == 0 && vm.servicesans.length == 0 && vm.lifestyleans.length == 0 &&
            vm.healthans.length == 0 && vm.beautyans.length == 0 && vm.socialans.length == 0 && vm.familyans.length == 0){
                vm.noAns = true;
            }

        }

        function getSpecials(answer) {
            for (var i = 0; i < $rootScope.specials.length; i++) {
                if (answer.id == $rootScope.specials[i].answer) {
                    if ($rootScope.specials[i].freq == 'weekly') {
                        if (dayOfWeek == 0 && $rootScope.specials[i].sun) isToday = true;
                        if (dayOfWeek == 1 && $rootScope.specials[i].mon) isToday = true;
                        if (dayOfWeek == 2 && $rootScope.specials[i].tue) isToday = true;
                        if (dayOfWeek == 3 && $rootScope.specials[i].wed) isToday = true;
                        if (dayOfWeek == 4 && $rootScope.specials[i].thu) isToday = true;
                        if (dayOfWeek == 5 && $rootScope.specials[i].fri) isToday = true;
                        if (dayOfWeek == 6 && $rootScope.specials[i].sat) isToday = true;
                        if (isToday) {
                            answer.sp_bc = $rootScope.specials[i].bc;
                            answer.sp_fc = $rootScope.specials[i].fc;
                            answer.sp_title = $rootScope.specials[i].stitle;
                            break;
                        }
                    }
                }
            }
        }

        function getUser(answer, votetable) {
            for (var i = 0; i < $rootScope.user.friends.data.length; i++) {
                if (votetable.user == $rootScope.user.friends.data[i].id) {
                    return $rootScope.user.friends.data[i];
                }
            }
        }

        function addRecord(part, answer, i){
            var cidx = 0;
            var ridx = 0;
            var fidx = 0;
            var idx = 0;
            
            cidx = $rootScope.catansrecs.map(function(x) {return x.id; }).indexOf($rootScope.friends_votes[i].catans);
            ridx = $rootScope.content.map(function(x) {return x.id; }).indexOf($rootScope.catansrecs[cidx].category); 

            var map = part.map(function (x) { return x.id; });
            idx = map.indexOf(answer.id);
            if(idx == -1){
                var data = angular.copy(answer);
                getSpecials(data);
                data.trackID = data.id + '' + $rootScope.friends_votes[i].id;
                data.userObjs = [];
                var friend = angular.copy(getUser(data, $rootScope.friends_votes[i]));
                
                friend.endorsements = [];
                friend.endorsements.push($rootScope.content[ridx].title);
                data.userObjs.push(friend);
                part.push(data);
            }
            else {
                
                var friend = angular.copy(getUser(data, $rootScope.friends_votes[i]));
                fidx = part[idx].userObjs.map(function(x) {return x.id; }).indexOf(friend.id);
                
                if (fidx == -1){
                    friend.endorsements = [];
                    friend.endorsements.push($rootScope.content[ridx].title);
                    part[idx].userObjs.push(friend);
                }
                else {
                    if (part[idx].userObjs[fidx].endorsements.indexOf($rootScope.content[ridx].title) == -1){ 
                        part[idx].userObjs[fidx].endorsements.push($rootScope.content[ridx].title);
                    }
                }
            }
        }

        function addUser(data, friend){

            var map = data.userObjs.map(function (x) { return x.id; });
            if( map.indexOf(friend.id) == -1 )
                data.userObjs.push(friend);

        }

        function answerDetail(cb,x) {
            
            $rootScope.myfavs = {};
            
            switch (cb){
                case 1: { $rootScope.canswers = vm.foodans; 
                          $rootScope.myfavs.title = 'My Food';  break; }
                case 2: { $rootScope.canswers = vm.lifestyleans; 
                          $rootScope.myfavs.title = 'My Lifestyle';  break; }
                case 3: { $rootScope.canswers = vm.servicesans;
                          $rootScope.myfavs.title = 'My Services';  break; }  
                case 4: { $rootScope.canswers = vm.healthans; 
                          $rootScope.myfavs.title = 'My Health';  break; }
                case 5: { $rootScope.canswers = vm.beautyans; 
                          $rootScope.myfavs.title = 'My Beauty';  break; }
                case 6: { $rootScope.canswers = vm.socialans; 
                          $rootScope.myfavs.title = 'My Social';  break; }
                case 7: { $rootScope.canswers = vm.familyans; 
                          $rootScope.myfavs.title = 'My Family';  break; }
            }
            $state.go("answerDetail", { index: x.slug });
        }

        function seeMore(x) {
            if (x == 1) {
                if (vm.maxRes1 == 5) { vm.btext1 = 'See less'; vm.maxRes1 = 100; }
                else { vm.btext1 = 'See more'; vm.maxRes1 = 5; }
            }
            if (x == 2) {
                if (vm.maxRes2 == 5) { vm.btext2 = 'See less'; vm.maxRes2 = 100; }
                else { vm.btext2 = 'See more'; vm.maxRes2 = 5; }
            }
            if (x == 3) {
                if (vm.maxRes3 == 5) { vm.btext3 = 'See less'; vm.maxRes3 = 100; }
                else { vm.btext3 = 'See more'; vm.maxRes3 = 5; }
            }
            if (x == 4) {
                if (vm.maxRes4 == 5) { vm.btext4 = 'See less'; vm.maxRes4 = 100; }
                else { vm.btext4 = 'See more'; vm.maxRes4 = 5; }
            }
            if (x == 5) {
                if (vm.maxRes5 == 5) { vm.btext5 = 'See less'; vm.maxRes5 = 100; }
                else { vm.btext5 = 'See more'; vm.maxRes5 = 5; }
            }
            if (x == 6) {
                if (vm.maxRes6 == 5) { vm.btext6 = 'See less'; vm.maxRes6 = 100; }
                else { vm.btext6 = 'See more'; vm.maxRes6 = 5; }
            }
            if (x == 7) {
                if (vm.maxRes7 == 5) { vm.btext7 = 'See less'; vm.maxRes7 = 100; }
                else { vm.btext7 = 'See more'; vm.maxRes7 = 5; }
            }
        }

        function goBack() {
            
            if ($rootScope.previousState == 'rankSummary')  $state.go('rankSummary', { index: $rootScope.cCategory.slug });
            else $state.go('cwrapper');
        }

    }
})();
