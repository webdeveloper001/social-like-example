(function () {
    'use strict';

    angular
        .module('app')
        .controller('imagesmod', imagesmod);

    imagesmod.$inject = ['$rootScope', 'useruploadedimages','imagelist'];

    function imagesmod($rootScope, useruploadedimages, imagelist) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'imagesmod';

        vm.dataready = false;

        //Methods
        vm.removeImage = removeImage;
        vm.approveImage = approveImage;
        
        activate();

        function activate() {

            useruploadedimages.getRecords().then(function(){
                vm.dataready = true;
                draw();
            });
            
            if ($rootScope.DEBUG_MODE) console.log("imagesmod page Loaded!");
        }

        function draw(){
            vm.uuis = $rootScope.uuis;
        }

        function approveImage(x){
            useruploadedimages.deleteRecord(x.id).then(draw);
        }

        function removeImage(x){
            imagelist.deleteBlob(x.imageurl);
            useruploadedimages.deleteRecord(x.id).then(draw);
        }
        //function blockUser(x){
        //}
 
    }
})();
