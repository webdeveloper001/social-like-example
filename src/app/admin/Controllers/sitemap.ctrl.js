(function () {
    'use strict';

    angular
        .module('app')
        .controller('sitemap', sitemap);

    sitemap.$inject = ['$rootScope', 'staticpages', 'dialog','SERVER_URL','$timeout'];

    function sitemap($rootScope, staticpages, dialog, SERVER_URL, $timeout) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'sitemap';

        //Methods
        vm.createSitemap = createSitemap;
        var sitemap_raw = '';
        vm.sitemap = '';
        
        activate();
        
        function activate() {

         console.log("sitemap console loaded")
        }

        function createSitemap(){
            sitemap_raw = '';
            $rootScope.content.forEach(function(rank){
                if (rank.scope == 2 && rank.ismp == true && rank.slug != null){
                    sitemap_raw += '<url><loc>https://rank-x.com/rankSummary/'+rank.slug+'</loc></url>';
                }
            });
            sitemap_raw = sitemap_raw.replace(/\/url>/g,'/url>&&&'); 
            vm.sitemap = sitemap_raw.split("&&&");
        }

    }
})();
