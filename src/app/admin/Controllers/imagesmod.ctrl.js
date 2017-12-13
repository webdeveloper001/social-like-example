(function () {
    'use strict';

    angular
        .module('app')
        .controller('imagesmod', imagesmod);

    imagesmod.$inject = ['$rootScope', 'useruploadedimages','imagelist','answer'];

    function imagesmod($rootScope, useruploadedimages, imagelist, answer) {
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
            //find corresponding image, if main image is to be deleted, set to empty image
            var idx = $rootScope.answers.map(function(x) {return x.id; }).indexOf(x.answer);
            if ($rootScope.answers[idx].imageurl == x.imageurl){
                answer.updateAnswer($rootScope.answers[idx].id,['imageurl'],[$rootScope.EMPTY_IMAGE]);
            }  
            imagelist.deleteBlob(x.imageurl);
            useruploadedimages.deleteRecord(x.id).then(draw);
        }
        //function blockUser(x){
        //}
 
    }
})();
