(function () {
    'use strict';

    angular
        .module('app')
        .controller('staticpagesconsole', staticpagesconsole);

    staticpagesconsole.$inject = ['$rootScope', 'staticpages', 'dialog','SERVER_URL'];

    function staticpagesconsole($rootScope, staticpages, dialog, SERVER_URL) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'staticpagesconsole';

        vm.dataready = false;
        var staticpagesfiles = [];
        vm.rankopts = [];

        //Methods
        vm.getPage = getPage;
        vm.recreatePage = recreatePage;
        vm.forceScrape = forceScrape;
        vm.share = share;
        vm.pagecontent = '';

        activate();
        

        function activate() {

            staticpages.getFileList().then(function(result){
                        staticpagesfiles = result.data;
                        vm.dataready = false;
                        console.log("static pages list ready");
            });

            for (var i=0; i < $rootScope.content.length; i++){
                vm.rankopts.push($rootScope.content[i].title);
            }
            
            if ($rootScope.DEBUG_MODE) console.log("staticpagesconsole page Loaded!");
        }

        function getPage(){
            var filename = '';
            for (var i=0; i< $rootScope.content.length; i++){
                if ($rootScope.content[i].title == vm.query){
                    filename = 'rank' +  $rootScope.content[i].id + '.html';
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
            for (var i=0; i< $rootScope.content.length; i++){
                if ($rootScope.content[i].title == vm.query){
                    staticpages.createPageRank($rootScope.content[i]).then(function(){
                        dialog.notificationSuccess(
                            'Success',
                            'File recreated successfully'
                        )
                    });
                    
                }
            }
        }

        function forceScrape() {
            var filename = '';
            for (var i = 0; i < $rootScope.content.length; i++) {
                if ($rootScope.content[i].title == vm.query) {
                    filename = 'rank' +  $rootScope.content[i].id + '.html';
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

        function share(x) {
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
    }
})();
