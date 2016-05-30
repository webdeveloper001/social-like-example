(function () {
    'use strict';

    angular
        .module('app')
        .controller('addAnswer', addAnswer);

    addAnswer.$inject = ['dialog', '$state', 'answer', '$rootScope', '$modal', 'image'];

    function addAnswer(dialog, $state, answer, $rootScope, $modal, image) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'addAnswer';
        vm.header = "table" + $rootScope.cCategory.id + ".header";
        vm.body = 'table' + $rootScope.cCategory.id + '.body';
        vm.searchDisabled = 'disabled';
        vm.modalEnable = true;
        vm.publicfields = [];
        vm.ranking = $rootScope.title;
        var publicfield_obj = {};
        var loadImageDataOk = false;
        var addAnswerDataOk = false;
        
        //load public fields
        var fieldreq = [];
                
        //google search
        var imageLinks = [];
        vm.linkIdx = 0;
        vm.numLinks = 0;
        vm.imageCommand = 'image.loadImages';
        vm.searchDisabled = '';
        var attNum = 1;
        vm.imagefunctions = 'none';

        var answerhtml = '';
        var categoryhtml = '';
        var countryIsValid = false;
        var countryIdx = -1;
        var cFld = -1;
        
        // Members
        var myAnswer = {};

        // Methods
        vm.callAddAnswer = callAddAnswer;
        vm.rankSummary = rankSummary;
        vm.callSearchImage = callSearchImage;
        vm.viewNext = viewNext;
        vm.viewPrev = viewPrev;
        vm.closeRank = closeRank;
        vm.showHowItWorksDialog = showHowItWorksDialog;

        vm.imageURL = '../../../assets/images/noimage.jpg';
        vm.header = $rootScope.header;

        activate();

        function activate() {
            
            //country.loadCountries();
            //vm.countries = $rootScope.cCountries;
            
            loadPublicFields();
            console.log("Add Answer Activated!");
            
        }

        function loadPublicFields() {
            vm.emptyarray = [];
            if ($rootScope.isDowntown) vm.neighborhoods = $rootScope.districts; 
            else vm.neighborhoods = $rootScope.neighborhoods;
            
            vm.fields = $rootScope.fields;
                       
            //Add extra info
            vm.fields.opts = [];
            vm.fields.val = [];
            vm.fields.textstyle = [];
            
            for (var i=0; i<vm.fields.length; i++){
                vm.fields[i].val='';
                
                if (vm.fields[i].name=="cityarea") vm.fields[i].opts="c for c in vm.neighborhoods";
                else vm.fields[i].opts="c for c in vm.emptyarray";
                
                if (vm.fields[i].name=="addinfo") vm.fields[i].textstyle="textarea";
                else vm.fields[i].textstyle="text";                 
            }                  
  
        }
        
        

        function addAnswer() {

            myAnswer.imageurl = imageLinks[vm.linkIdx];
            myAnswer.upV = 0;
            myAnswer.downV = 0;
            //myAnswer.userid = $rootScope.user.id;
            myAnswer.userid = 1;
            myAnswer.category = $rootScope.cCategory.id;

            dialog.addAnswer(myAnswer, vm.imageURL, addAnswerConfirmed);

        }

        function loadFormData() {
            //initialize form
            for (var i = 0; i < vm.fields.length; i++) {
                switch (vm.fields[i].name) {

                    case "name": { myAnswer.name = vm.fields[i].val; break; }
                    case "location": { myAnswer.location = vm.fields[i].val; break; }
                    case "addinfo": { myAnswer.addinfo = vm.fields[i].val; break; }
                    case "cityarea": { myAnswer.cityarea = vm.fields[i].val; break; } 
                    
                }
            }
        }

        function validateData() {
            countryIsValid=true; //remove later, only temp
            loadImageDataOk = true;
            //addAnswerDataOk = true;
            for (var i = 0; i < vm.fields.length; i++) {
                if (vm.fields[i].isrequired && vm.fields[i].val.length < 3) {
                    loadImageDataOk = false;
                    break;
                }
            }
            
            loadImageDataOk = loadImageDataOk && countryIsValid;
            addAnswerDataOk = (loadImageDataOk && vm.numLinks > 0);
        }

        function rankSummary() {

            $state.go("rankSummary", { index: $rootScope.cCategory.id });
        }
        
        /*
        //Upload Image
        function uploadFile() {
            console.log('file is ');
            console.dir(vm.myFile);

            if (vm.myFile) {
                fileupload.uploadFileToUrl(vm.myFile);
            }

        }*/

        function callSearchImage() {
            var pFields = [];
            
            loadFormData();
            validateData();
            
            if (loadImageDataOk) {
                pFields = JSON.parse(JSON.stringify(vm.fields));
                //pFields[cFld].val = $rootScope.countries_en[countryIdx];
                var q1 = image.getImageLinks(pFields, attNum, 'add');
                q1.then(processImageResults, imageQueryFailed)

            }
            else {
                dialog.getDialog('missingDataImage');
                return;
            }
        }

        function imageQueryFailed() {
            console.log('query failed, dont give up');
        }

        function callAddAnswer() {
            loadFormData();
            validateData();
            if (addAnswerDataOk) {
                addAnswer();
            }
            else {
                dialog.getDialog('missingDataAnswer');
                return;
            }
        }

        function processImageResults(results) {

            var n;
            var linkExists = false;
            //Check link results are not repeated.
            for (var j = 0; j < results.length; j++) {
                for (var i = 0; i < imageLinks.length; i++) {
                    n = results[j].localeCompare(imageLinks[i]);
                    if (n == 0) {
                        linkExists = true;
                        break;
                    }
                }
                if (!linkExists) imageLinks.push(results[j]);
            }     
            
            //imageLinks = imageLinks.concat(results);
            vm.numLinks = imageLinks.length;
            attNum++;
            if (vm.numLinks > 10 || attNum >= 4) vm.searchDisabled = 'disabled';
            if (attNum > 1) vm.imageCommand = 'image.moreImages';
            vm.linkIdx = 0;

            vm.imageURL = imageLinks[vm.linkIdx];
            testImageUrl(imageLinks[vm.linkIdx], showImageNotOk);

            if (vm.numLinks > 0) vm.imagefunctions = 'inline';
            console.log('attNum  ', attNum);

        }


        function viewNext() {
            vm.linkIdx++;
            if (vm.linkIdx >= vm.numLinks) vm.linkIdx = 0;
            vm.imageURL = imageLinks[vm.linkIdx];
            testImageUrl(imageLinks[vm.linkIdx], showImageNotOk);
        }
        function viewPrev() {
            vm.linkIdx--;
            if (vm.linkIdx < 0) vm.linkIdx = vm.numLinks - 1;
            vm.imageURL = imageLinks[vm.linkIdx];
            testImageUrl(imageLinks[vm.linkIdx], showImageNotOk);
        }

        function addAnswerConfirmed(myAnswer) {
            answer.addAnswer(myAnswer).then(rankSummary);

        }

        function showHowItWorksDialog() {
            dialog.howItWorks('addAnswer');
        }

        function testImageUrl(url, callback, timeout) {
            timeout = timeout || 5000;
            var timedOut = false, timer;
            var img = new Image();
            img.onerror = img.onabort = function () {
                if (!timedOut) {
                    clearTimeout(timer);
                    callback(url, "error");
                }
            };
            img.onload = function () {
                if (!timedOut) {
                    clearTimeout(timer);
                    callback(url, "success");
                }
            };
            img.src = url;
            timer = setTimeout(function () {
                timedOut = true;
                callback(url, "timeout");
            }, timeout);
        }


        function showImageNotOk(url, result) {
            if (result == "error" || result == "timeout") {
                vm.imageURL = '../../../assets/images/noimage.jpg';
            }
        }
         function closeRank() {
                $rootScope.viewCtn = 0;
                $rootScope.$emit('closeRank');                            
        }

    }

})();
