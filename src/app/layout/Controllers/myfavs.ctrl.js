(function () {
    'use strict';

    angular
        .module('app')
        .controller('myfavs', myfavs);

    myfavs.$inject = ['$location', '$rootScope', '$state', '$window','dataloader'];

    function myfavs(location, $rootScope, $state, $window, dataloader) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'myfavs';

        vm.goBack = goBack;
        vm.answerDetail = answerDetail;
        vm.seeMore = seeMore;

        var cdate = new Date();
        var dayOfWeek = cdate.getDay();
        var isToday = false;
        vm.noAns = false;

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

        activate();

        function activate() {
            
            $rootScope.inFavMode = true;

            formatTables();
            loadData();
            if ($rootScope.DEBUG_MODE) console.log("myfavs page Loaded!");

        }

        function formatTables() {

            for (var i = 0; i < $rootScope.headlines.length; i++) {
                if ($rootScope.headlines[i].type == 'food') {
                    vm.bgc1 = $rootScope.headlines[i].bc;
                    vm.fc1 = $rootScope.headlines[i].fc;
                    vm.headline1 = 'My ' + $rootScope.headlines[i].title;
                    break;
                }
            }

            for (var i = 0; i < $rootScope.headlines.length; i++) {
                if ($rootScope.headlines[i].type == 'lifestyle') {
                    vm.bgc2 = $rootScope.headlines[i].bc;
                    vm.fc2 = $rootScope.headlines[i].fc;
                    vm.headline2 = 'My ' + $rootScope.headlines[i].title; 
                    break;
                }
            }

            for (var i = 0; i < $rootScope.headlines.length; i++) {
                if ($rootScope.headlines[i].type == 'services') {
                    vm.bgc3 = $rootScope.headlines[i].bc;
                    vm.fc3 = $rootScope.headlines[i].fc;
                    vm.headline3 = 'My ' + $rootScope.headlines[i].title;
                    break;
                }
            }

            for (var i = 0; i < $rootScope.headlines.length; i++) {
                if ($rootScope.headlines[i].type == 'health') {
                    vm.bgc4 = $rootScope.headlines[i].bc;
                    vm.fc4 = $rootScope.headlines[i].fc;
                    vm.headline4 = 'My ' + $rootScope.headlines[i].title;
                    break;
                }
            }

            for (var i = 0; i < $rootScope.headlines.length; i++) {
                if ($rootScope.headlines[i].type == 'beauty') {
                    vm.bgc5 = $rootScope.headlines[i].bc;
                    vm.fc5 = $rootScope.headlines[i].fc;
                    vm.headline5 = 'My ' + $rootScope.headlines[i].title;
                    break;
                }
            }

            for (var i = 0; i < $rootScope.headlines.length; i++) {
                if ($rootScope.headlines[i].type == 'social') {
                    vm.bgc6 = $rootScope.headlines[i].bc;
                    vm.fc6 = $rootScope.headlines[i].fc;
                    vm.headline6 = 'My ' + $rootScope.headlines[i].title;
                    break;
                }
            }


            for (var i = 0; i < $rootScope.headlines.length; i++) {
                if ($rootScope.headlines[i].type == 'family') {
                    vm.bgc7 = $rootScope.headlines[i].bc;
                    vm.fc7 = $rootScope.headlines[i].fc;
                    vm.headline7 = 'My ' + $rootScope.headlines[i].title;
                    break;
                }
            }
        }

        function loadData() {
            var answer = {};
            var category = {};

            vm.myfoodans = [];
            vm.mylifestyleans = [];
            vm.myservicesans = [];
            vm.myhealthans = [];
            vm.mybeautyans = [];
            vm.mysocialans = [];
            vm.myfamilyans = [];

            var tmap = [];

            for (var i = 0; i < $rootScope.cvotes.length; i++) {
                if ($rootScope.cvotes[i].vote == 1) {
                    var idx = $rootScope.answers.map(function (x) { return x.id; }).indexOf($rootScope.cvotes[i].answer);
                    if (idx > -1) {
                        answer = $rootScope.answers[idx];
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
                                        tmap = vm.myfoodans.map(function (x) { return x.id; });
                                        if (tmap.indexOf(answer.id) < 0) {
                                            getSpecials(answer);
                                            vm.myfoodans.push(answer);
                                        }
                                    }

                                    if (category.title.indexOf('lifestyle') > -1 || category.tags.indexOf('lifestyle') > -1) {
                                        tmap = vm.mylifestyleans.map(function (x) { return x.id; });
                                        if (tmap.indexOf(answer.id) < 0) {
                                            getSpecials(answer);
                                            vm.mylifestyleans.push(answer);
                                        }
                                    }

                                    if (category.title.indexOf('services') > -1 || category.tags.indexOf('services') > -1) {
                                        tmap = vm.myservicesans.map(function (x) { return x.id; });
                                        if (tmap.indexOf(answer.id) < 0) {
                                            getSpecials(answer);
                                            vm.myservicesans.push(answer);
                                        }
                                    }

                                    if (category.title.indexOf('health') > -1 || category.tags.indexOf('health') > -1) {
                                        tmap = vm.myhealthans.map(function (x) { return x.id; });
                                        if (tmap.indexOf(answer.id) < 0) {
                                            getSpecials(answer);
                                            vm.myhealthans.push(answer);
                                        }
                                    }

                                    if (category.title.indexOf('beauty') > -1 || category.tags.indexOf('beauty') > -1) {
                                        tmap = vm.mybeautyans.map(function (x) { return x.id; });
                                        if (tmap.indexOf(answer.id) < 0) {
                                            getSpecials(answer);
                                            vm.mybeautyans.push(answer);
                                        }
                                    }


                                    if (category.title.indexOf('social') > -1 || category.tags.indexOf('social') > -1) {
                                        tmap = vm.mysocialans.map(function (x) { return x.id; });
                                        if (tmap.indexOf(answer.id) < 0) {
                                            getSpecials(answer);
                                            vm.mysocialans.push(answer);
                                        }
                                    }


                                    if (category.title.indexOf('family') > -1 || category.tags.indexOf('family') > -1) {
                                        tmap = vm.myfamilyans.map(function (x) { return x.id; });
                                        if (tmap.indexOf(answer.id) < 0) {
                                            getSpecials(answer);
                                            vm.myfamilyans.push(answer);
                                        }
                                    }
                                }
                            }

                        }
                    }
                }
            }
            
            if (vm.myfoodans.length > 5) vm.cb1gt5 = true;
            if (vm.mylifestyleans.length > 5) vm.cb2gt5 = true;
            if (vm.myservicesans.length > 5) vm.cb3gt5 = true;
            if (vm.myhealthans.length > 5) vm.cb4gt5 = true;
            if (vm.mybeautyans.length > 5) vm.cb5gt5 = true;
            if (vm.mysocialans.length > 5) vm.cb6gt5 = true;
            if (vm.myfamilyans.length > 5) vm.cb7gt5 = true;

            if (vm.myfoodans.length > 0) vm.answerExist1 = true;
            else vm.answerExist1 = false;

            if (vm.mylifestyleans.length > 0) vm.answerExist2 = true;
            else vm.answerExist2 = false;

            if (vm.myservicesans.length > 0) vm.answerExist3 = true;
            else vm.answerExist3 = false;

            if (vm.myhealthans.length > 0) vm.answerExist4 = true;
            else vm.answerExist4 = false;

            if (vm.mybeautyans.length > 0) vm.answerExist5 = true;
            else vm.answerExist5 = false;

            if (vm.mysocialans.length > 0) vm.answerExist6 = true;
            else vm.answerExist6 = false;

            if (vm.myfamilyans.length > 0) vm.answerExist7 = true;
            else vm.answerExist7 = false;
            
            if (vm.myfoodans.length == 0 && vm.myservicesans.length == 0 && vm.mylifestyleans.length == 0 &&
            vm.myhealthans.length == 0 && vm.mybeautyans.length == 0 && vm.mysocialans.length == 0 && vm.myfamilyans.length == 0){
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

        function answerDetail(cb,x) {
            
            $rootScope.myfavs = {};
            
            switch (cb){
                case 1: { $rootScope.canswers = vm.myfoodans; 
                          $rootScope.myfavs.title = 'My Food';  break; }
                case 2: { $rootScope.canswers = vm.mylifestyleans; 
                          $rootScope.myfavs.title = 'My Lifestyle';  break; }
                case 3: { $rootScope.canswers = vm.myservicesans;
                          $rootScope.myfavs.title = 'My Services';  break; }  
                case 4: { $rootScope.canswers = vm.myhealthans; 
                          $rootScope.myfavs.title = 'My Health';  break; }
                case 5: { $rootScope.canswers = vm.mybeautyans; 
                          $rootScope.myfavs.title = 'My Beauty';  break; }
                case 6: { $rootScope.canswers = vm.mysocialans; 
                          $rootScope.myfavs.title = 'My Social';  break; }
                case 7: { $rootScope.canswers = vm.myfamilyans; 
                          $rootScope.myfavs.title = 'My Family';  break; }
            }
            $state.go("answerDetail", { index: x.id });
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
            else $rootScope.$emit('backToResults');
        }

    }
})();
