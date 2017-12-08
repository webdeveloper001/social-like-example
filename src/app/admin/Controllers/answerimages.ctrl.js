(function () {
    'use strict';

    angular
        .module('app')
        .controller('answerimages', answerimages);

    answerimages.$inject = ['$rootScope', 'staticpages', 'dialog','SERVER_URL','$timeout','$http','answer'];

    function answerimages($rootScope, staticpages, dialog, SERVER_URL, $timeout, $http, answer) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'answerimages';

        vm.ansimgs = [];
        var n = 0;
        //Methods
        vm.processAllImages = processAllImages;

        activate();
        
        function activate() {

            prepareData();
            
            if ($rootScope.DEBUG_MODE) console.log("answerimages page Loaded!");
        }

        function prepareData(){
            $rootScope.answers.forEach(function(ansObj){
                if (ansObj.imageurl != undefined &&
                    ansObj.imageurl.indexOf('noimage.jpg')== -1 &&
                    ansObj.imageurl.indexOf('rankx.blob.core') == -1 &&
                    ansObj.type != 'Short-Phrase'){
                        vm.ansimgs.push(ansObj);
                        console.log(ansObj.name, ansObj.imageurl);
                    }
                   // geurl = "https://rankx.blob.core.windows.net/sandiego/"+$rootScope.canswer.id+"/" + file.name
            });
        }

        function processAllImages(){
            //Try see if link still valid
            if (n < vm.ansimgs.length) {
                vm.inprogress = true;
                //$http.get(vm.ansimgs[n].imageurl).then(function () {
                    //console.log('link is ok - ', vm.ansimgs[n].imageurl);
                    processImageExec(vm.ansimgs[n].imageurl, vm.ansimgs[n].slug, vm.ansimgs[n].id).then(function () {
                        console.log('processing image success - ', vm.ansimgs[n].slug);
                        n++;
                        vm.cpct = (n/vm.ansimgs.length)*100;
                        processAllImages();
                    },
                        function (err) {
                            console.log('there was error processing image: ', err);
                            n++;
                            vm.cpct = (n/vm.ansimgs.length)*100;
                            processAllImages();
                            //console.log('setting answer image to empty - ');
                            //answer.updateAnswer(vm.ansimgs[n].id, ['imageurl'], [$rootScope.EMPTY_IMAGE]);
                        });
                    
            }

        }

        function processImageExec(imageurl, filename, answerid){
            var url = 'https://server.rank-x.com/ImageServer/SaveImage';
            var req = {
                method: 'POST',
                url: url,
                headers: {
                    'X-Dreamfactory-API-Key': undefined,
                    'X-DreamFactory-Session-Token': undefined
                },
                data: {
                    'imageurl': imageurl,
                    'filename': filename,
                    'answerid': answerid,                  
                }
            }

            return $http(req);
        }

    }
})();
