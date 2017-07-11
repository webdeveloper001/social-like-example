(function () {
    'use strict';

    angular
        .module('app')
        .controller('addAnswer', addAnswer);

    addAnswer.$inject = ['dialog', '$state', 'answer', '$rootScope', '$modal', '$q',
    'image', 'catans', 'getgps', '$timeout','getwiki','$window','$scope','search'];

    function addAnswer(dialog, $state, answer, $rootScope, $modal, $q, 
    image, catans, getgps, $timeout, getwiki, $window,$scope, search) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'addAnswer';
        vm.header = "table" + $rootScope.cCategory.id + ".header";
        vm.body = 'table' + $rootScope.cCategory.id + '.body';
        vm.searchDisabled = 'disabled';
        vm.modalEnable = true;
        vm.userIsOwner = false;
        vm.publicfields = [];
        vm.ranking = $rootScope.cCategory.title;
        var publicfield_obj = {};
        var loadImageDataOk = false;
        var addAnswerDataOk = false;
        var addAnswerExec = false;
        var addAnswerGPSexec = false;
        var answers = $rootScope.answers;
        var inputLengthMem = 0; //inputLength in Memory
        var inputLengthMemNh = 0; //inputLength in Memory
        var maybeSameAnswers = [];
        
        
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
        var rankNh = undefined;
        var answerNeighborhood = undefined;
        var rankObj = {};
        
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
        vm.onSelect = onSelect;
        vm.addCatans = addCatans;
        vm.addcts = addcts;
        vm.selRank = selRank;

        vm.imageURL = $rootScope.EMPTY_IMAGE;
        vm.header = $rootScope.header;
        
        //TODO: Would like to add this abstract template, but dont know how         
        var GPSReadyListener = $rootScope.$on('answerGPSready', function () {
            if ($state.current.name == 'addAnswer' && !addAnswerGPSexec) addAnswerGPS();
        });
        
        var WikiReadyListener = $rootScope.$on('wikiReady', function (event,wikiRes) {
            if ($state.current.name == 'addAnswer') loadWiki(wikiRes);
        });

        var fileUploadedListener = $rootScope.$on('fileUploaded', function (event, data){
            if ($state.current.name == 'addAnswer') {
                $rootScope.blobimage = data;
                showUploadedImage();                
            }
        });

        $scope.$on('$destroy',GPSReadyListener);
        $scope.$on('$destroy',WikiReadyListener);
        $scope.$on('$destroy', fileUploadedListener);

        checkUserCredentials();

        //Adjust picture size for very small displays
        if ($window.innerWidth < 512) {vm.sm = true; vm.nsm = false; }
        else {vm.sm = false; vm.nsm = true; }

        activate();

        function activate() {

            $window.scrollTo(0, 0);

            vm.addToRanks = [];
            if ($rootScope.cCategory.isatomic){
                vm.nhrdy = true;
                prepareCatansOptions();
                rankObj = $rootScope.cCategory;
                rankObj.sel = true;
                //vm.addToRanks.push(rankObj);
            }

            loadPublicFields();
            detectNeighborhood();
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

            vm.establishmentNames = $rootScope.estNames.concat($rootScope.plaNames, $rootScope.orgNames);
            vm.peopleNames = $rootScope.pplNames;
            //vm.placesNames = $rootScope.plaNames;
            //vm.organizationNames = $rootScope.orgNames;

            vm.fields = $rootScope.fields;
            vm.type = $rootScope.cCategory.type;
            myAnswer.type = vm.type;
                       
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
                
                //Typeahead check for current Places
                if (vm.fields[i].name == "name" && $rootScope.cCategory.type == 'Place') {
                    //vm.fields[i].opts = "c for c in vm.placesNames";
                    vm.fields[i].opts = "c for c in vm.establishmentNames";
                }

                //Typeahead check for current Companies
                if (vm.fields[i].name == "name" && $rootScope.cCategory.type == 'Organization') {
                    //vm.fields[i].opts = "c for c in vm.organizationNames";
                    vm.fields[i].opts = "c for c in vm.establishmentNames";
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
                if (vm.userIsOwner) myAnswer.owner = $rootScope.user.id;

                if (duplicateExists) dialog.checkSameAnswer(myAnswer, extAnswer, addAnswerConfirmed, answerIsSame);
                else dialog.addAnswer(myAnswer, vm.addToRanks, vm.imageURL, addAnswerConfirmed);

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

            //For freelancer type 'PersonCust' data required is either email or website, not necessarily both
            if ($rootScope.cCategory.type == 'PersonCust'){
                for (var i = 0; i < vm.fields.length; i++) {
                    if ((vm.fields[i].name == 'email' && vm.fields[i].val.length > 3 ) || 
                        (vm.fields[i].name == 'website' && vm.fields[i].val.length > 3)){
                        loadImageDataOk = true;
                        break;
                    }
                } 
            }
            
            //loadImageDataOk = loadImageDataOk && countryIsValid;
            if ($rootScope.cCategory.type == 'Short-Phrase' || $rootScope.cCategory.type == 'PersonCust' 
            || $rootScope.cCategory.type == 'Simple' ) addAnswerDataOk = loadImageDataOk;
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
            //***** if (myAnswer.type == 'Establishment' && rankNh && rankNh != myAnswer.cityarea) dialog.getDialog('neighborhoodsDontMatch');
            if (rankNh && rankNh != myAnswer.cityarea) dialog.getDialog('neighborhoodsDontMatch');
            
            //****else if (myAnswer.type == 'Establishment' && (myAnswer.location != undefined && myAnswer.location != "" && myAnswer.location != null)) {
            else if ((myAnswer.location != undefined && myAnswer.location != "" && myAnswer.location != null)) {
              
                var promise = getgps.getLocationGPS(myAnswer);
                promise.then(function () {
                    //console.log("myAnswer --- ", myAnswer);
                    //answer.addAnswer(myAnswer).then(rankSummary);
                });
            }
            else {
                //**** if (myAnswer.type == 'Establishment' || myAnswer.type == 'PersonCust') eqRanks();
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
                    /*
                    var prms = []
                    for (var i=0; i<vm.addToRanks.length; i++){
                        if (vm.addToRanks[i].sel)
                        prms.push(answer.addAnswer2(myAnswer,vm.addToRanks[i].id));
                    }

                    console.log("prms - ", prms);

                    $q.all(prms).then(rankSummary);*/  
                    answer.addAnswer(myAnswer, vm.addToRanks).then(rankSummary);
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
                    if (myAnswer) {
                        /*
                        console.log("vm.ranksToAdd - ", vm.ranksToAdd);
                        var prms = []
                        for (var i = 0; i < vm.addToRanks.length; i++) {
                            if (vm.addToRanks[i].sel)
                                prms.push(answer.addAnswer2(myAnswer, vm.addToRanks[i].id));
                        }

                        console.log("prms - ", prms);

                        $q.all(prms).then(rankSummary);*/  
                        answer.addAnswer(myAnswer, vm.addToRanks).then(rankSummary);
                    }
                }
                myAnswer = undefined;                                 
            }
        }
        
         function answerIsSame() {
            if ($rootScope.DEBUG_MODE) console.log("Yeah Same, @answerIsSame");
            //Answer already exist in this category, do not add
            if (duplicateSameCategory) dialog.getDialog('answerDuplicated');
            
            //**** else if (myAnswer.type == 'Establishment' && rankNh && rankNh != extAnswer.cityarea) dialog.getDialog('neighborhoodsDontMatch');
            else if (rankNh && rankNh != extAnswer.cityarea) dialog.getDialog('neighborhoodsDontMatch');
            
            //Answer already exist, just post new category-answer record            
            else {
                //**** if (extAnswer.type == 'Establishment' || extAnswer.type == 'PersonCust' || extAnswer.type == 'Place'
                // || extAnswer.type == 'Event') eqRanks();
                eqRanks();
                if ($rootScope.DEBUG_MODE) console.log("eqFound, inCity, eqRankIdx = ", eqFound, inCity, eqRankIdx);
                //create 2 catans records one for downtown and then district
                if (eqFound && !inCity) {
                    if ($rootScope.DEBUG_MODE) console.log("P7 - eqFound,inCity,eqRankIdx - ", eqFound, inCity, eqRankIdx);
                    catans.postRec2(extAnswer.id, eqRankIdx);
                    catans.postRec2(extAnswer.id, $rootScope.cCategory.id).then(rankSummary);
                }
                else if (eqFound && inCity) {
                    if ($rootScope.DEBUG_MODE) console.log("P8 - eqFound,inCity,eqRankIdx - ", eqFound, inCity, eqRankIdx);
                    catans.postRec2(extAnswer.id, eqRankIdx).then(rankSummary);
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
            var cityarea = '';
            //Determine answer neighborhood
            if (myAnswer.cityarea == undefined)
                if (extAnswer.cityarea) cityarea = extAnswer.cityarea;
            else 
                cityarea = myAnswer.cityarea;

            if (inDowntown || inDistrict || inCity) {
                /*
                if (inDowntown && myAnswer.cityarea != 'Downtown') {
                    lookRank = $rootScope.cCategory.title.replace('Downtown', myAnswer.cityarea);
                    for (var n = 0; n < $rootScope.content.length; n++) {
                        if ($rootScope.content[n].title == lookRank) {
                            eqFound = true;
                            eqRankIdx = $rootScope.content[n].id;
                        }
                    }
                }*/
                /*
                if (inDistrict) {
                    lookRank = $rootScope.cCategory.title.replace(inDistrictName, 'Downtown');
                    for (var n = 0; n < $rootScope.content.length; n++) {
                        if ($rootScope.content[n].title == lookRank) {
                            eqFound = true;
                            eqRankIdx = $rootScope.content[n].id;
                        }
                    }
                }
                */               
                if (inCity){
                    lookRank = $rootScope.cCategory.title.replace('San Diego', cityarea);
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

        function selRank(x, idx){
            if (x.sel) {
                if (idx != 0) x.sel = false;
            }
            else x.sel = true;
            vm.addToRanks = vm.addToRanks.sort(compare);
        }

        function prepareCatansOptions(){

            if ($rootScope.DEBUG_MODE) console.log("prepareCatansOptions");

            if (vm.addToRanks) vm.addToRanks = vm.addToRanks.concat(search.sibblingRanks($rootScope.cCategory, answerNeighborhood)); 
            else vm.addToRanks = search.sibblingRanks($rootScope.cCategory, answerNeighborhood);

            if (!answerNeighborhood && vm.addToRanks.length == 0) vm.addToRanks.push($rootScope.cCategory);
            if (vm.addToRanks.length > 0) vm.addToRanks[0].sel = true;
            
            for (var i=1; i<vm.addToRanks.length; i++){
                vm.addToRanks[i].sel = false;
            }

            vm.addToRanks = vm.addToRanks.sort(compare);

            //search.sibblingRanks($rootScope.cCategory.id);
            vm.addctsopts = [];
            var opt = '';
            //if (answerNeighborhood == undefined || answerNeighborhood == '') answerNeighborhood = 'San Diego';
            for (var i = 0; i < $rootScope.ctsOptions.length; i++) {
                if ($rootScope.ctsOptions[i].indexOf('@neighborhood') > -1) {
                    if (answerNeighborhood){
                        opt = $rootScope.ctsOptions[i].replace('@neighborhood', answerNeighborhood);
                        vm.addctsopts.push(opt);
                    }
                }
                else vm.addctsopts.push($rootScope.ctsOptions[i]);
            }
        }

        function compare(a,b) {
                //console.log("sort.compare");
                if (a.sel == b.sel) return (b.ctr - a.ctr);
                else if (b.sel) return 1;
                else return -1;
        }

        function addCatans(){            
            vm.addctsactive = true;
        }

        function addcts(){
            var typemismatch = false;
            var rankObj = {};
            var idx = $rootScope.content.map(function(x) {return x.title; }).indexOf(vm.addctsval);  
            //Check types match
            if ($rootScope.cCategory.type == 'Person' && 
                $rootScope.content[idx].type != 'Person') typemismatch = true;
            if ($rootScope.cCategory.type == 'Event' && 
                $rootScope.content[idx].type != 'Event') typemismatch = true;
            if ($rootScope.cCategory.type == 'Thing' && 
                $rootScope.content[idx].type != 'Thing') typemismatch = true;
            if ($rootScope.cCategory.type == 'PersonCust' && 
                $rootScope.content[idx].type != 'PersonCust') typemismatch = true;        
            if (($rootScope.cCategory.type == 'Place' || 
                $rootScope.cCategory.type == 'Establishment' || 
                $rootScope.cCategory.type == 'Organization') &&  
                ($rootScope.content[idx].type != 'Place' &&
                $rootScope.content[idx].type != 'Establishment' &&
                $rootScope.content[idx].type != 'Organization')) typemismatch = true;
            
            if (typemismatch) dialog.typemismatch($rootScope.content[idx].type,$rootScope.cCategory.type);
            else {
                rankObj = $rootScope.content[idx];
                rankObj.sel = true;
                vm.addToRanks.push(rankObj);
                vm.addToRanks = vm.addToRanks.sort(compare);

                //console.log("vm.addToRanks - ", vm.addToRanks);
                vm.addctsval = '';
                vm.addctsactive = false;
            }
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
            if (vm.type == 'Establishment' || vm.type == 'Place' || vm.type == 'Organization') {
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
            else if (vm.type == 'Establishment' || vm.type == 'Place' || vm.type == 'Organization') {
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
            else if (vm.type == 'Establishment' || vm.type == 'Place' || vm.type == 'Organization') {
                for (var i = 0; i < $rootScope.orgAnswers.length; i++) {
                    if (answer.name == $rootScope.orgAnswers[i].name) {

                        duplicateExists = true;
                        extAnswer = $rootScope.orgAnswers[i];

                        for (var j = 0; j < $rootScope.catansrecs.length; j++) {
                            if ($rootScope.catansrecs[j].answer == $rootScope.orgAnswers[i].id &&
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

        function onSelect(x){
            maybeSameAnswers = [];
            //console.log("x.val.length, inputLengthMem - ", x.val.length, inputLengthMem);
            //only use for field name
            if (x.name == 'name'){
                if (Math.abs(x.val.length - inputLengthMem)>2 && x.val.length != 0){
                    //an option was selected from the typeahead
                    //search for this answer, if single result populate fields, if not
                    //show dialog with options
                    inputLengthMem = x.val.length;        
                    for (var i=0; i<$rootScope.answers.length; i++){
                        if ($rootScope.answers[i].name == x.val){
                            if (rankNh){
                                if ($rootScope.answers[i].cityarea == rankNh)
                                    maybeSameAnswers.push($rootScope.answers[i]);    
                            }
                            else maybeSameAnswers.push($rootScope.answers[i]);
                        }
                    }
                    //console.log("MaybeSameAnswers - ", maybeSameAnswers);
                    if (maybeSameAnswers.length == 1) {
                        checkAnswerExists(maybeSameAnswers[0]);
                        dialog.confirmSameAnswer(maybeSameAnswers[0],answerChosen);
                    }
                    else if (maybeSameAnswers.length > 1) dialog.confirmSameAnswerMultiple(maybeSameAnswers,answerChosen);                 
                }
                inputLengthMem = x.val.length;                
            }
            if (x.name == 'cityarea'){
                if (Math.abs(x.val.length - inputLengthMemNh)>2 && x.val.length != 0){
                    //an option was selected from the typeahead
                    inputLengthMemNh = x.val.length;
                    for (var i=0; i < $rootScope.allnh.length; i++){
                        if ($rootScope.allnh[i] == x.val){
                            vm.nhrdy = true;
                            answerNeighborhood = x.val;
                            prepareCatansOptions();
                        }
                    }                
                }
                inputLengthMemNh = x.val.length;                
            }                             
        }

        function answerChosen(n){
            console.log("answerChosen - ", extAnswer);
            if (n == undefined ) extAnswer = maybeSameAnswers[0];
            else extAnswer = maybeSameAnswers[n];
            answerIsSame();
        }

        function detectNeighborhood(){
            //this function determines if current ranking is for a neighborhood or district
            for (var i=0; i<$rootScope.allnh.length; i++){
                if ($rootScope.cCategory.title.indexOf($rootScope.allnh[i])>-1){
                    rankNh = $rootScope.allnh[i];
                    answerNeighborhood = rankNh;
                    prepareCatansOptions();
                    break;
                }
            }
        }

        function checkUserCredentials(){
            if ($rootScope.isLoggedIn){
                //if $rootScope.cCategoryExists
                var answerParent = $rootScope.cCategory.owner;
                if (answerParent != undefined && answerParent != 0){
                    //look for answerParent and see who is its owner
                     var idx = $rootScope.answers.map(function(x) {return x.id; }).indexOf(Number(answerParent));
                     var owner = $rootScope.answers[idx].owner;
                     if ($rootScope.user.id == owner) vm.userIsOwner = true;  
                }
            }
        }

        function showUploadedImage(){
            vm.imageURL = $rootScope.blobimage;
        }
                     
    }

})();
