(function () {
    'use strict';

    angular
        .module('app')
        .controller('addAnswer', addAnswer);

    addAnswer.$inject = ['dialog', '$state', 'answer', '$rootScope', '$modal', 
    'image', 'catans', 'getgps', '$timeout','getwiki','$window'];

    function addAnswer(dialog, $state, answer, $rootScope, $modal,
    image, catans, getgps, $timeout, getwiki, $window) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'addAnswer';
        vm.header = "table" + $rootScope.cCategory.id + ".header";
        vm.body = 'table' + $rootScope.cCategory.id + '.body';
        vm.searchDisabled = 'disabled';
        vm.modalEnable = true;
        vm.publicfields = [];
        vm.ranking = $rootScope.cCategory.title;
        var publicfield_obj = {};
        var loadImageDataOk = false;
        var addAnswerDataOk = false;
        var addAnswerExec = false;
        var addAnswerGPSexec = false;
        var answers = $rootScope.answers;
        
        
        //load public fields
        var fieldreq = [];
                
        //google search
        var imageLinks = [];
        vm.linkIdx = 0;
        vm.numLinks = 0;
        vm.imageCommand = 'Get images';
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
        
        //search for equivalent ranks
        var inDistrict = false;
        var inDistrictName = '';
        var inDowntown = false;
        var inCity = false;
        var eqRankIdx = 0;
        var eqFound = false;
        
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
        vm.getWiki = getWiki;
        vm.onNoGoodImages = onNoGoodImages;
        vm.showHowItWorksDialog = showHowItWorksDialog;
        
        vm.imageURL = $rootScope.EMPTY_IMAGE;
        vm.header = $rootScope.header;
        
        //TODO: Would like to add this abstract template, but dont know how         
        $rootScope.$on('answerGPSready', function () {
            if ($state.current.name == 'addAnswer' && !addAnswerGPSexec) addAnswerGPS();
        });
        
        $rootScope.$on('wikiReady', function (event,wikiRes) {
            if ($state.current.name == 'addAnswer') loadWiki(wikiRes);
        });
        
        //Adjust picture size for very small displays
        if ($window.innerWidth < 512) {vm.sm = true; vm.nsm = false; }
        else {vm.sm = false; vm.nsm = true; }

        activate();

        function activate() {
            loadPublicFields();
            determineScope(); 
             if ($rootScope.DEBUG_MODE) console.log("Add Answer Activated!");

        }

        function determineScope() {
            if ($rootScope.cCategory.title.indexOf('San Diego') > -1) {
                inCity = true;
            }
            /*
            if ($rootScope.cCategory.title.indexOf('Downtown') > -1) {
                inDowntown = true;
            }
            for (var j = 0; j < $rootScope.districts.length; j++) {
                if ($rootScope.cCategory.title.indexOf($rootScope.districts[j]) > -1) {
                    inDistrict = true;
                    inDistrictName = $rootScope.districts[j];
                }
            }*/
        }

        function loadPublicFields() {
            vm.emptyarray = [];
            //if ($rootScope.isDowntown) vm.neighborhoods = $rootScope.districts; 
            //else vm.neighborhoods = $rootScope.neighborhoods.concat($rootScope.districts);
            
            vm.neighborhoods = $rootScope.neighborhoods.concat($rootScope.districts);

            vm.establishmentNames = $rootScope.estNames;
            vm.peopleNames = $rootScope.pplNames;
            vm.placesNames = $rootScope.plaNames;

            vm.fields = $rootScope.fields;
            vm.type = $rootScope.cCategory.type;
                       
            //Add extra info
            vm.fields.opts = [];
            vm.fields.val = [];
            vm.fields.textstyle = [];

            for (var i = 0; i < vm.fields.length; i++) {
                vm.fields[i].val = '';
                
                //Typeahead for neighborhoods
                if (vm.fields[i].name == "cityarea") vm.fields[i].opts = "c for c in vm.neighborhoods";
                else vm.fields[i].opts = "c for c in vm.emptyarray";
                
                //Typeahead check for current establishments
                if (vm.fields[i].name == "name" && $rootScope.cCategory.type == 'Establishment') {
                    vm.fields[i].opts = "c for c in vm.establishmentNames";
                }
                
                //Typeahead check for current Persons
                if (vm.fields[i].name == "name" && $rootScope.cCategory.type == 'Person') {
                    vm.fields[i].opts = "c for c in vm.peopleNames";
                }
                
                //Typeahead check for current Persons
                if (vm.fields[i].name == "name" && $rootScope.cCategory.type == 'Place') {
                    vm.fields[i].opts = "c for c in vm.placesNames";
                }
                
                //When neighborhood is implied put it in the input field right away
                if (vm.fields[i].name == "cityarea" && $rootScope.cCategory.type == 'Establishment' && $rootScope.NhImplied == true) {
                    if ($rootScope.NhValue != 'Downtown') vm.fields[i].val = $rootScope.NhValue;
                }

                if (vm.fields[i].name == "addinfo") vm.fields[i].textstyle = "textarea";
                else vm.fields[i].textstyle = "text";
                
                //console.log("name, opts -- ", vm.fields[i].name, vm.fields[i].opts);
            }

        }


        function addAnswer() {

            if (!addAnswerExec) {
                myAnswer.imageurl = vm.imageURL;
                if ($rootScope.cCategory.type == 'Short-Phrase') myAnswer.imageurl = 'none';

                myAnswer.upV = 0;
                myAnswer.downV = 0;
                myAnswer.type = vm.type;
                myAnswer.userid = $rootScope.user.id;
                myAnswer.views = 0;
                myAnswer.ig_image_urls = '';
                myAnswer.slug = '';

                if (duplicateExists) dialog.checkSameAnswer(myAnswer, extAnswer, addAnswerConfirmed, answerIsSame);
                else dialog.addAnswer(myAnswer, vm.imageURL, addAnswerConfirmed);

                addAnswerExec = true;
                
                //This is to prevent double pulses and have two answers get submitted by hardware glitch
                $timeout(function () {
                    addAnswerExec = false;
                }, 1000)
            }
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
                    case "email": { myAnswer.email = vm.fields[i].val; break; }

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
            if ($rootScope.cCategory.type == 'Short-Phrase' || $rootScope.cCategory.type == 'PersonCust' ) addAnswerDataOk = loadImageDataOk;
            else addAnswerDataOk = (loadImageDataOk && (vm.numLinks > 0 || vm.ngi));

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
                //console.log("pFields --", pFields);
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
            if (vm.type == 'Establishment' || vm.type == 'Person' || vm.type == 'Place') checkAnswerExists(myAnswer);

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
            if (attNum > 1) vm.imageCommand = 'Get more images';
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
            
             if ($rootScope.DEBUG_MODE) console.log("No, different! @addAnswerConfirmed");
            if (myAnswer.type == 'Establishment' && (myAnswer.location != undefined && myAnswer.location != "" && myAnswer.location != null)) {
                var promise = getgps.getLocationGPS(myAnswer);
                promise.then(function () {
                    //console.log("myAnswer --- ", myAnswer);
                    //answer.addAnswer(myAnswer).then(rankSummary);
                });
            }
            else {
                eqRanks();
                //create 2 catans records one for downtown and then district
                if (eqFound && !inCity) {
                    if ($rootScope.DEBUG_MODE) console.log("P1 - eqFound,inCity,eqRankIdx - ", eqFound, inCity, eqRankIdx,myAnswer);
                    answer.addAnswer2(myAnswer, [$rootScope.cCategory.id, eqRankIdx]).then(rankSummary);                    
                }
                else if (eqFound && inCity) {
                    if ($rootScope.DEBUG_MODE) console.log("P2 - eqFound,inCity,eqRankIdx - ", eqFound, inCity, eqRankIdx,myAnswer);
                    answer.addAnswer2(myAnswer, [eqRankIdx]).then(rankSummary);
                }
                else { 
                    if ($rootScope.DEBUG_MODE) console.log("P3 - ", myAnswer);
                    answer.addAnswer(myAnswer).then(rankSummary);
                }
                myAnswer = undefined; 
            }
        }

        function addAnswerGPS() {
            if (!addAnswerGPSexec) {
                 if ($rootScope.DEBUG_MODE) console.log("@exec-addAnswerGPS");
                addAnswerGPSexec = true;
                eqRanks();
                //create 2 catans records one for downtown and then district
                if (eqFound && !inCity) {
                    if ($rootScope.DEBUG_MODE) console.log("P4 - eqFound,inCity,eqRankIdx - ", eqFound, inCity, eqRankIdx, myAnswer);
                    if (myAnswer) answer.addAnswer2(myAnswer, [$rootScope.cCategory.id, eqRankIdx]).then(rankSummary);
                }
                else if (eqFound && inCity) {
                    if ($rootScope.DEBUG_MODE) console.log("P5 - eqFound,inCity,eqRankIdx - ", eqFound, inCity, eqRankIdx, myAnswer);
                    if (myAnswer) answer.addAnswer2(myAnswer, [eqRankIdx]).then(rankSummary);
                }
                else {
                    if ($rootScope.DEBUG_MODE) console.log("P6",myAnswer);
                    if (myAnswer) answer.addAnswer(myAnswer).then(rankSummary);
                }
                myAnswer = undefined;                                 
            }
        }
        
         function answerIsSame() {
             if ($rootScope.DEBUG_MODE) console.log("Yeah Same, @answerIsSame");
            //Answer already exist in this category, do not add
            if (duplicateSameCategory) dialog.getDialog('answerDuplicated');
            //Answer already exist, just post new category-answer record            
            else {
                eqRanks();
                //create 2 catans records one for downtown and then district
                if (eqFound && !inCity) {
                    if ($rootScope.DEBUG_MODE) console.log("P7 - eqFound,inCity,eqRankIdx - ", eqFound, inCity, eqRankIdx);
                    catans.postRec2(extAnswer.id, eqRankIdx, false);
                    catans.postRec2(extAnswer.id, $rootScope.cCategory.id, true).then(rankSummary);
                }
                else if (eqFound && inCity) {
                    if ($rootScope.DEBUG_MODE) console.log("P8 - eqFound,inCity,eqRankIdx - ", eqFound, inCity, eqRankIdx);
                    catans.postRec2(extAnswer.id, eqRankIdx, false).then(rankSummary);
                }
                else {
                    if ($rootScope.DEBUG_MODE) console.log("P9");
                    catans.postRec(extAnswer.id).then(rankSummary);
                }
                myAnswer = undefined;                
             }
         }

        function eqRanks() {
            var lookRank = '';
            if (inDowntown || inDistrict || inCity) {
                if (inDowntown && myAnswer.cityarea != 'Downtown') {
                    lookRank = $rootScope.cCategory.title.replace('Downtown', myAnswer.cityarea);
                    for (var n = 0; n < $rootScope.content.length; n++) {
                        if ($rootScope.content[n].title == lookRank) {
                            eqFound = true;
                            eqRankIdx = $rootScope.content[n].id;
                        }
                    }
                }
                if (inDistrict) {
                    lookRank = $rootScope.cCategory.title.replace(inDistrictName, 'Downtown');
                    for (var n = 0; n < $rootScope.content.length; n++) {
                        if ($rootScope.content[n].title == lookRank) {
                            eqFound = true;
                            eqRankIdx = $rootScope.content[n].id;
                        }
                    }
                }               
                if (inCity){
                    lookRank = $rootScope.cCategory.title.replace('San Diego', myAnswer.cityarea);
                    for (var n = 0; n < $rootScope.content.length; n++) {
                        if ($rootScope.content[n].title == lookRank) {
                            eqFound = true;
                            eqRankIdx = $rootScope.content[n].id;
                        }
                    }
                }
            }
        }

        function showHowItWorksDialog() {
            if ($rootScope.cCategory.type == 'Short-Phrase') dialog.howItWorks('shortPhrase');
            else dialog.howItWorks('addAnswer');
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
                vm.imageURL = $rootScope.EMPTY_IMAGE;
            }
        }

        function checkAnswerExists(answer) {
            //Check if answer about to be added exists already among establishments
            if (vm.type == 'Establishment') {
                for (var i = 0; i < $rootScope.estAnswers.length; i++) {
                    if (answer.name == $rootScope.estAnswers[i].name &&
                        answer.cityarea == $rootScope.estAnswers[i].cityarea) {

                        duplicateExists = true;
                        extAnswer = $rootScope.estAnswers[i];

                        for (var j = 0; j < $rootScope.catansrecs.length; j++) {
                            if ($rootScope.catansrecs[j].answer == $rootScope.estAnswers[i].id &&
                                $rootScope.catansrecs[j].category == $rootScope.cCategory.id) {
                                duplicateSameCategory = true;
                            }
                        }
                    }
                }
            }
            else if (vm.type == 'Person') {
                for (var i = 0; i < $rootScope.pplAnswers.length; i++) {
                    if (answer.name == $rootScope.pplAnswers[i].name) {

                        duplicateExists = true;
                        extAnswer = $rootScope.pplAnswers[i];

                        for (var j = 0; j < $rootScope.catansrecs.length; j++) {
                            if ($rootScope.catansrecs[j].answer == $rootScope.pplAnswers[i].id &&
                                $rootScope.catansrecs[j].category == $rootScope.cCategory.id) {
                                duplicateSameCategory = true;
                            }
                        }
                    }
                }
            }
            else if (vm.type == 'Place') {
                for (var i = 0; i < $rootScope.plaAnswers.length; i++) {
                    if (answer.name == $rootScope.plaAnswers[i].name) {

                        duplicateExists = true;
                        extAnswer = $rootScope.plaAnswers[i];

                        for (var j = 0; j < $rootScope.catansrecs.length; j++) {
                            if ($rootScope.catansrecs[j].answer == $rootScope.plaAnswers[i].id &&
                                $rootScope.catansrecs[j].category == $rootScope.cCategory.id) {
                                duplicateSameCategory = true;
                            }
                        }
                    }
                }
            }
            //console.log("duplicateExists: ", duplicateExists, " duplicateSameCategory: ", duplicateSameCategory);
        }
        
        function getWiki(){
            var wikiSearchStr = '';
            for (var n=0; n < vm.fields.length; n++){
                if (vm.fields[n].name == 'name') {
                    wikiSearchStr = vm.fields[n].val;
                    break;
                }
            }
            
            if (wikiSearchStr.length > 0){
                getwiki.getWiki(wikiSearchStr);
            }
            return;
        }
        
        function loadWiki(x){
            for (var n=0; n < vm.fields.length; n++){
                if (vm.fields[n].name == 'addinfo') {
                    vm.fields[n].val = x;
                    break;
                }
            }          
        }
        
        function onNoGoodImages(x){
            if (x){
                vm.imageURL = $rootScope.EMPTY_IMAGE;
            }
            else{
                vm.imageURL = imageLinks[vm.linkIdx];
            }
        }

        function closeRank() {
            $state.go('cwrapper');
        }        
        
    }

})();
