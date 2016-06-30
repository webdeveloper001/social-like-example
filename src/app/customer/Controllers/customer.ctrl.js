(function () {
    'use strict';

    angular
        .module('app')
        .controller('customer', customer);

    customer.$inject = ['$location', '$rootScope', '$state'];

    function customer(location, $rootScope, $state) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'customer';
        
        vm.selMainPhoto = 'active';
        vm.selSpecials = '';
        vm.selPhotoGallery = '';

        vm.goBack = goBack;
        vm.loadMainPhoto = loadMainPhoto;
        vm.loadSpecials = loadSpecials;
        vm.loadPhotoGallery = loadPhotoGallery;

       activate();

        function activate() {            

            console.log("customer page Loaded!");
            
        }
        function loadMainPhoto() {            

            $state.go('mainphoto');
            
        }
        function loadSpecials() {            

            $state.go('specials');
            
        }
        function loadPhotoGallery() {            

            $state.go('photogallery');
            
        }

        function goBack() {
            //if ($rootScope.cCategory.id == undefined) $state.go('rankSummary', { index: $rootScope.cCategory.id });
            //else $state.go('rankSummary', { index: 1 });
            $state.go('content');
        }

    }
})();
