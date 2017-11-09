(function () {
    'use strict';

    angular
        .module('app')
        .controller('about', about);

    about.$inject = ['$location', '$rootScope', '$state','$window', '$scope'];

    function about(location, $rootScope, $state, $window, $scope) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'about';

        vm.goBack = goBack;
        
        if ($window.innerWidth < 512) {
            vm.logoimage = "/assets/images/rankxlogo_noheadline.png";
            vm.sm = true;
        }
        else {
            vm.logoimage = "/assets/images/rankxlogo_noheadline.png";
            vm.sm = false;
        }

        //-----SEO tags ----
        $scope.$parent.seo = { 
            pageTitle : 'About', 
            metaDescription: 'Rank-X creates collective rankings on everything in your city.' 
        };
      
        activate();

        function activate() {            

            console.log("About page Loaded!");
            
        }

        function goBack() {
            //if ($rootScope.cCategory.id == undefined) $state.go('rankSummary', { index: $rootScope.cCategory.id });
            //else $state.go('rankSummary', { index: 1 });
            //$state.go('cwrapper');
            if ($rootScope.previousState == 'rankSummary')  $state.go('rankSummary', { index: $rootScope.cCategory.slug });
            else if ($rootScope.previousState == 'answerDetail')  $state.go('answerDetail', { index: $rootScope.canswer.slug });
            else $rootScope.$emit('backToResults');
        }

    }
})();
