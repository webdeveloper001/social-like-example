(function () {
    'use strict';

    angular
        .module('app')
        .controller('staticpagesconsole', staticpagesconsole);

    staticpagesconsole.$inject = ['$rootScope', 'staticpages', 'dialog','SERVER_URL','$timeout'];

    function staticpagesconsole($rootScope, staticpages, dialog, SERVER_URL, $timeout) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'staticpagesconsole';

        vm.dataready = false;
        vm.inprogress = false;
        var staticpagesfiles = [];
        vm.rankopts = [];
        var midx = 0;

        //Methods
        vm.selRanks = selRanks;
        vm.selAnswers = selAnswers;
        vm.getPage = getPage;
        vm.recreatePage = recreatePage;
        vm.forceScrape = forceScrape;
        vm.recreateAll = recreateAll;
        vm.scrapeAll = scrapeAll;
        vm.share = share;
        vm.pagecontent = '';

        activate();
        
        function activate() {

            selRanks();

            staticpages.getFileList().then(function(result){
                        staticpagesfiles = result.data;
                        vm.dataready = false;
                        console.log("static pages list ready");
            });
            
            if ($rootScope.DEBUG_MODE) console.log("staticpagesconsole page Loaded!");
        }

        function selRanks(){
            vm.mode = 'ranks';
            vm.rankopts = [];
            for (var i=0; i < $rootScope.content.length; i++){
                vm.rankopts.push($rootScope.content[i].title);
            }
        }
        function selAnswers(){
            vm.mode = 'answers';
            vm.rankopts = [];
            for (var i=0; i < $rootScope.answers.length; i++){
                vm.rankopts.push($rootScope.answers[i].name);
            }
        }

        function getPage(){
            var filename = '';
            if (vm.mode == 'ranks') {
                for (var i = 0; i < $rootScope.content.length; i++) {
                    if ($rootScope.content[i].title == vm.query) {
                        filename = 'rank' + $rootScope.content[i].id + '.html';
                    }
                }
            }
            if (vm.mode == 'answers') {
                for (var i = 0; i < $rootScope.answers.length; i++) {
                    if ($rootScope.answers[i].name == vm.query) {
                        filename = 'answer' + $rootScope.answers[i].id + '.html';
                    }
                }
            }
            var data = {};
            var rawtext = '';
            data.filename = filename;
            staticpages.getPageContent(data).then(function(result){
                rawtext = result.data;
                rawtext = rawtext.replace(/>/g,'>&&&'); //
                vm.pagecontent = rawtext.split("&&&"); 
            });           
        }

        function recreatePage(){
            var filename = '';
            if (vm.mode == 'ranks') {
                for (var i = 0; i < $rootScope.content.length; i++) {
                    if ($rootScope.content[i].title == vm.query) {
                        staticpages.createPageRank($rootScope.content[i]).then(function () {
                            dialog.notificationSuccess(
                                'Success',
                                'File recreated successfully'
                            )
                        });

                    }
                }
            }
            if (vm.mode == 'answers') {
                for (var i = 0; i < $rootScope.answers.length; i++) {
                    if ($rootScope.answers[i].name == vm.query) {
                        staticpages.createPageRank($rootScope.answers[i]).then(function () {
                            dialog.notificationSuccess(
                                'Success',
                                'File recreated successfully'
                            )
                        });
                    }
                }
            }
        }

        function forceScrape() {
            var filename = '';
            if (vm.mode == 'ranks') {
                for (var i = 0; i < $rootScope.content.length; i++) {
                    if ($rootScope.content[i].title == vm.query) {
                        filename = 'rank' + $rootScope.content[i].id + '.html';
                        var link = SERVER_URL + filename;
                        FB.api('https://graph.facebook.com/', 'post', {
                            id: [link],
                            scrape: true
                        }, function (response) {
                            dialog.notificationSuccess(
                                'Success',
                                'File scrapped successfully - ' + response
                            )
                        });

                    }
                }
            }
            if (vm.mode == 'answers') {
                for (var i = 0; i < $rootScope.answers.length; i++) {
                    if ($rootScope.answers[i].name == vm.query) {
                        filename = 'answer' + $rootScope.answers[i].id + '.html';
                        var link = SERVER_URL + filename;
                        FB.api('https://graph.facebook.com/', 'post', {
                            id: [link],
                            scrape: true
                        }, function (response) {
                            dialog.notificationSuccess(
                                'Success',
                                'File scrapped successfully - ' + response
                            )
                        });
                    }
                }
            }
        }

        function share(x) {
            if (vm.mode == 'ranks') {
                for (var i = 0; i < $rootScope.content.length; i++) {
                    if ($rootScope.content[i].title == vm.query) {
                        var filename = 'rank' + $rootScope.content[i].id + '.html';
                        var link = SERVER_URL + filename;
                        FB.ui({
                            method: 'feed',
                            link: link,
                            caption: 'An example caption',
                        }, function (response) { });
                    }
                }
            }
             if (vm.mode == 'answers') {
                for (var i = 0; i < $rootScope.answers.length; i++) {
                    if ($rootScope.answers[i].name == vm.query) {
                        var filename = 'answer' + $rootScope.answers[i].id + '.html';
                        var link = SERVER_URL + filename;
                        FB.ui({
                            method: 'feed',
                            link: link,
                            caption: 'An example caption',
                        }, function (response) { });
                    }
                }
            }
        }

        function recreateAll(){
            vm.inprogress = true;
            var filename = '';
            if (vm.mode == 'answers') {
                vm.cpct = (midx/$rootScope.answers.length)*100;
                //for (var i = 0; i < $rootScope.answers.length; i++) {
                    filename = 'answer' + $rootScope.answers[midx].id + '.html';
                    //if (staticpagesfiles.indexOf(filename) == -1){
                            
                            staticpages.createPageAnswer($rootScope.answers[midx]);
                            midx++;
                            $timeout(function(){
                                recreateAll();
                            },400);
                    //}
                    //else {
                    //    midx++;
                    //    recreateAll();
                    //}
                //}
            }
        }

        function scrapeAll(){
            //TODO
        }

    }
})();
