(function () {
    'use strict';

    angular
        .module('app')
        .controller('addAnswer', addAnswer);

    addAnswer.$inject = ['dialog', '$state', 'answer', '$rootScope', '$modal', 'image','catans','getgps'];

    function addAnswer(dialog, $state, answer, $rootScope, $modal, image, catans, getgps) {
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
        var answers = $rootScope.answers;
        
        //load public fields
        var fieldreq = [];
                
        //google search
        var imageLinks = [];
        vm.linkIdx = 0;
        vm.numLinks = 0;
        vm.imageCommand = 'Load images';
        vm.searchDisabled = '';
        var attNum = 1;
        vm.imagefunctions = 'none';

        //var answerhtml = '';
        //var categoryhtml = '';
        //var countryIsValid = false;
        //var countryIdx = -1;
        //var cFld = -1;
        var duplicateExists = false;
        var duplicateSameCategory = false;
        
        // Members
        var myAnswer = {};
        var extAnswer = {};

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
        
         //TODO: Would like to add this abstract template, but dont know how         
        $rootScope.$on('answerGPSready', function () {
            addAnswerGPS();
        });

        activate();

        function activate() {
            
            loadPublicFields();
            console.log("Add Answer Activated!");
            
        }

        function loadPublicFields() {
            vm.emptyarray = [];
            if ($rootScope.isDowntown) vm.neighborhoods = $rootScope.districts; 
            else vm.neighborhoods = $rootScope.neighborhoods;
            
            vm.establishmentNames = $rootScope.estNames;                         
            
            vm.fields = $rootScope.fields;
            vm.type = $rootScope.cCategory.type;
                       
            //Add extra info
            vm.fields.opts = [];
            vm.fields.val = [];
            vm.fields.textstyle = [];
                            
            for (var i=0; i<vm.fields.length; i++){
                vm.fields[i].val='';
                
                //Typeahead for neighborhoods
                if (vm.fields[i].name=="cityarea") vm.fields[i].opts="c for c in vm.neighborhoods";
                else vm.fields[i].opts="c for c in vm.emptyarray";
                
                //Typeahead check for current establishments
                if (vm.fields[i].name=="name" && $rootScope.cCategory.type=='Establishment') {
                    vm.fields[i].opts="c for c in vm.establishmentNames";
                }
                
                //When neighborhood is implied put it in the input field right away
                if (vm.fields[i].name=="cityarea" && $rootScope.cCategory.type=='Establishment' && $rootScope.NhImplied == true){
                    vm.fields[i].val = $rootScope.NhValue;
                }
                          
                if (vm.fields[i].name=="addinfo") vm.fields[i].textstyle="textarea";
                else vm.fields[i].textstyle="text";                 
            }                  
  
        }
        
        
        function addAnswer() {

            myAnswer.imageurl = imageLinks[vm.linkIdx];
            if ($rootScope.cCategory.type == 'Short-Phrase') myAnswer.imageurl='none';
            
            myAnswer.upV = 0;
            myAnswer.downV = 0;
            myAnswer.type = vm.type;
            myAnswer.userid = $rootScope.user.id;
            myAnswer.views = 0;
            
            if (duplicateExists) dialog.checkSameAnswer(myAnswer, extAnswer, addAnswerConfirmed, answerIsSame);
            else dialog.addAnswer(myAnswer, vm.imageURL, addAnswerConfirmed);

        }

        function loadFormData() {
            //initialize form
            for (var i = 0; i < vm.fields.length; i++) {
                switch (vm.fields[i].name) {

                    case "name": { myAnswer.name = vm.fields[i].val; break; }
                    case "location": { myAnswer.location = vm.fields[i].val; break; }
                    case "addinfo": { myAnswer.addinfo = vm.fields[i].val; break; }
                    case "cityarea": { myAnswer.cityarea = vm.fields[i].val; break; }
                    case "phone": { myAnswer.phone = vm.fields[i].val; break; }
                    case "website": { myAnswer.website = vm.fields[i].val; break; }  
                    
                }
            }
        }

        function validateData() {
            loadImageDataOk = true;
            //addAnswerDataOk = true;
            for (var i = 0; i < vm.fields.length; i++) {
                if (vm.fields[i].isrequired && vm.fields[i].val.length < 3) {
                    loadImageDataOk = false;
                    break;
                }
            }
            
            //loadImageDataOk = loadImageDataOk && countryIsValid;
            if ($rootScope.cCategory.type == 'Short-Phrase') addAnswerDataOk = loadImageDataOk;
            else addAnswerDataOk = (loadImageDataOk && vm.numLinks > 0);
            
        }

        function rankSummary() {

            $state.go("rankSummary", { index: $rootScope.cCategory.id });
        }

        function callSearchImage() {
            var pFields = [];
            
            loadFormData();
            validateData();
            
            if (loadImageDataOk) {
                pFields = JSON.parse(JSON.stringify(vm.fields));
                console.log("pFields --", pFields);
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
            checkAnswerExists(myAnswer);
            
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
            if (attNum > 1) vm.imageCommand = 'More images';
            vm.linkIdx = 0;

            vm.imageURL = imageLinks[vm.linkIdx];
                 
            testImageUrl(imageLinks[vm.linkIdx], showImageNotOk);

            if (vm.numLinks > 0) vm.imagefunctions = 'inline';
            
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
            //Add new answer, also add new post to catans (inside addAnser)
            console.log("addAnswerConfrimed", myAnswer);
            if (myAnswer.type == 'Establishment' && (myAnswer.location != undefined && myAnswer.location != "" && myAnswer.location != null)) {
                var promise = getgps.getLocationGPS(myAnswer);
                promise.then(function () {
                    //console.log("myAnswer --- ", myAnswer);
                    //answer.addAnswer(myAnswer).then(rankSummary);
                });
            }
            else {
            answer.addAnswer(myAnswer).then(rankSummary);
            }
        }
        
        function addAnswerGPS(){
            answer.addAnswer(myAnswer).then(rankSummary);
        }
                    
        function answerIsSame(){
            console.log("answerIsSame");
            //Answer already exist in this category, do not add
            if (duplicateSameCategory) dialog.getDialog('answerDuplicated');
            //Answer already exist, just post new category-answer record            
            else catans.postRec(extAnswer.id);
            rankSummary();
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
        
        function checkAnswerExists(answer){
            //Check if answer about to be added exists already among establishments
            for (var i=0; i < $rootScope.estAnswers.length; i++){
                if (answer.name == $rootScope.estAnswers[i].name){
                    
                    duplicateExists = true;
                    extAnswer = $rootScope.estAnswers[i];
                    
                    for (var j=0; j < $rootScope.catansrecs.length; j++){
                       if ($rootScope.catansrecs[j].answer == $rootScope.estAnswers[i].id && 
                           $rootScope.catansrecs[j].category == $rootScope.cCategory.id){
                               duplicateSameCategory = true;
                           }
                    }
                }
            }
        }
        
        function closeRank() {
               $state.go('cwrapper');                            
        }

    }

})();
