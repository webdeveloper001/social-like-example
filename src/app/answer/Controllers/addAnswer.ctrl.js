(function () {
    'use strict';

    angular
        .module('app')
        .controller('addAnswer', addAnswer);

    addAnswer.$inject = ['dialog', '$state', 'answer', '$rootScope', '$modal', '$q','common','table',
    'image', 'catans', 'getgps', '$timeout','getwiki','$window','$scope','search'];

    function addAnswer(dialog, $state, answer, $rootScope, $modal, $q, common, table,
    image, catans, getgps, $timeout, getwiki, $window,$scope, search) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'addAnswer';
        vm.header = "table" + $rootScope.cCategory.id + ".header";
        vm.body = 'table' + $rootScope.cCategory.id + '.body';
        vm.searchDisabled = 'disabled';
        vm.modalEnable = true;
        vm.userIsOwner = false;
        vm.addRanksEnable = true;
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
        //var inCity = false;
        var hasSubAreas = false;
        var needCreateRec = false;
        var eqRankIdx = 0;
        var eqFound = false;
        var rankNh = undefined;
        var answerNeighborhood = undefined;
        var rankObj = {};
        var rankNhObj = {};
        var isCustomRank = false;
        
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

            //Set custom rank flag
            if ($rootScope.cCategory.owner != undefined && $rootScope.cCategory.owner != 0 ) $rootScope.isCustomRank = true;
            else $rootScope.isCustomRank = false;

            $window.scrollTo(0, 0);
            vm.addToRanks = [];
            detectNeighborhood();
            loadPublicFields();
            determineScope(); 
            

            if ($rootScope.cCategory.owner != undefined && $rootScope.cCategory.owner != 0 ){
                isCustomRank = true;
                vm.addRanksEnable = false;
            } 

            if ($rootScope.cCategory.isatomic || rankNhObj.id != 1 ){
                vm.nhrdy = true;
                prepareCatansOptions();
                rankObj = $rootScope.cCategory;
                rankObj.sel = true;
                //vm.addToRanks.push(rankObj);
            }
            
             if ($rootScope.DEBUG_MODE) console.log("Add Answer Activated!");

        }

        function determineScope() {

            if (!$rootScope.cCategory.isatomic) hasSubAreas = true; 
            
            //if ($rootScope.cCategory.title.indexOf('San Diego') > -1) {
            //    inCity = true;
            // }
            
        }

        function loadPublicFields() {
            vm.emptyarray = [];
            //if ($rootScope.isDowntown) vm.neighborhoods = $rootScope.districts; 
            //else vm.neighborhoods = $rootScope.neighborhoods.concat($rootScope.districts);
            
            vm.neighborhoods = $rootScope.neighborhoods.concat($rootScope.districts);

            vm.establishmentNames = $rootScope.estNames.concat($rootScope.plaNames, $rootScope.orgNames, $rootScope.freNames);
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

                //Typeahead check for current Companies
                if (vm.fields[i].name == "name" && $rootScope.cCategory.type == 'PersonCust') {
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

        function neighborhoodOk(answer) {
            var nhOk = true;
            var idx = vm.fields.map(function (x) { return x.name; }).indexOf('cityarea');
            if (rankNh && idx > -1) {
                if (rankNh != answer.cityarea) {

                    var nhArr = [];
                    common.getInclusiveAreas(rankNhObj.id, nhArr);

                    var idx2 = $rootScope.locations.map(function (x) { return x.nh_name; }).indexOf(answer.cityarea);
                    var nhIsIncluded = nhArr.indexOf($rootScope.locations[idx2].id) > -1;

                    if (nhIsIncluded) nhOk = true;
                    else nhOk = false;

                    //Temp until all neighborhoods are set and confirmed
                    if (rankNhObj.id == 1) nhOk = true;
                }
            }
            else nhOk = true;
            return nhOk;
        }  

        function addAnswerConfirmed(myAnswer) {

            //Add new answer, also add new post to catans (inside addAnser)
            
            if ($rootScope.DEBUG_MODE) console.log("No, different! @addAnswerConfirmed");
            //***** if (myAnswer.type == 'Establishment' && rankNh && rankNh != myAnswer.cityarea) dialog.getDialog('neighborhoodsDontMatch');
            var nhIsValid = neighborhoodOk(myAnswer); 
            if (!nhIsValid) dialog.getDialog('neighborhoodsDontMatch');
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
                if (eqFound) {
                    if (!hasSubAreas){
                        if ($rootScope.DEBUG_MODE) console.log("P1 - eqFound,hasSubAreas,eqRankIdx - ", eqFound, hasSubAreas, eqRankIdx,myAnswer);
                        answer.addAnswer2(myAnswer, [$rootScope.cCategory.id, eqRankIdx]).then(rankSummary);
                    }
                    else {
                        if ($rootScope.DEBUG_MODE) console.log("P2 - eqFound,hasSubAreas,eqRankIdx - ", eqFound, hasSubAreas, eqRankIdx,myAnswer);
                        answer.addAnswer2(myAnswer, [eqRankIdx]).then(rankSummary);
                    }                    
                }
                else { //eqFound = false
                    if (needCreateRec){
                        console.log("Need to create record");
                    }
                    else{ 
                        if ($rootScope.DEBUG_MODE) console.log("P3 - ", myAnswer);
                        
                        var ranks = [];
                        var includesGhostRanking = false;
                        //var granks = [];
                        for (var i=0; i<vm.addToRanks.length; i++){
                            if (vm.addToRanks[i].sel) ranks.push(vm.addToRanks[i]);
                            if (vm.addToRanks[i].isghost) includesGhostRanking = true;
                            //if (vm.addToRanks[i].sel && vm.addToRanks[i].isghost) granks.push(vm.addToRanks[i]);
                        }
                        //Process non-ghost ranks  
                        if (!includesGhostRanking) answer.addAnswer(myAnswer, ranks).then(rankSummary);
                        //Process ghost ranks
                        else {
                            console.log("X1 - ", ranks, myAnswer);
                            table.ghostTablesWithAnswer(ranks, myAnswer).then(function(){
                                $timeout(function(){
                                    rankSummary();
                                },1000);
                            });
                        }

                    }
                    myAnswer = undefined;
                } 
            }
        }
    

        function addAnswerGPS() {
            if (!addAnswerGPSexec) {
                 if ($rootScope.DEBUG_MODE) console.log("@exec-addAnswerGPS");
                addAnswerGPSexec = true;
                eqRanks();
                //create 2 catans records one for downtown and then district
                if (eqFound) {
                    if (!hasSubAreas){
                        if ($rootScope.DEBUG_MODE) console.log("P4 - eqFound,hasSubAreas,eqRankIdx - ", eqFound, hasSubAreas, eqRankIdx, myAnswer);
                        if (myAnswer) answer.addAnswer2(myAnswer, [$rootScope.cCategory.id, eqRankIdx]).then(rankSummary);
                    }
                    else{
                        if ($rootScope.DEBUG_MODE) console.log("P5 - eqFound,hasSubAreas,eqRankIdx - ", eqFound, hasSubAreas, eqRankIdx, myAnswer);
                        if (myAnswer) answer.addAnswer2(myAnswer, [eqRankIdx]).then(rankSummary);
                    }
                }
                else { //eqFound = false
                    if (needCreateRec){
                        console.log("Need to Create Record")
                    }
                    else {
                        if ($rootScope.DEBUG_MODE) console.log("P6", myAnswer);
                        if (myAnswer) {
                            var ranks = [];
                            var includesGhostRanking = false;
                            //var granks = [];
                            for (var i = 0; i < vm.addToRanks.length; i++) {
                                if (vm.addToRanks[i].sel) ranks.push(vm.addToRanks[i]);
                                if (vm.addToRanks[i].isghost) includesGhostRanking = true;
                                //if (vm.addToRanks[i].sel && vm.addToRanks[i].isghost) granks.push(vm.addToRanks[i]);
                            }
                            //Process non-ghost ranks  
                            if (!includesGhostRanking) answer.addAnswer(myAnswer, ranks).then(rankSummary);
                            //Process ghost ranks
                            else {
                                console.log("X2 - ", ranks, myAnswer);
                                table.ghostTablesWithAnswer(ranks, myAnswer).then(function () {
                                    $timeout(function () {
                                        rankSummary();
                                    }, 1000);
                                });
                            }
                        }
                    }
                myAnswer = undefined;                                 
            }
            }
        }
        
         function answerIsSame() {
            if ($rootScope.DEBUG_MODE) console.log("Yeah Same, @answerIsSame");
            var nhIsValid = neighborhoodOk(extAnswer);
            //Answer already exist in this category, do not add
            if (duplicateSameCategory) dialog.getDialog('answerDuplicated');
            
            //**** else if (myAnswer.type == 'Establishment' && rankNh && rankNh != extAnswer.cityarea) dialog.getDialog('neighborhoodsDontMatch');
             
            else if (!nhIsValid) dialog.getDialog('neighborhoodsDontMatch');
            
            
            //else if (rankNh && rankNh != extAnswer.cityarea) {
            //    dialog.getDialog('neighborhoodsDontMatch');
            //}
            
            //Answer already exist, just post new category-answer record            
            else {
                //**** if (extAnswer.type == 'Establishment' || extAnswer.type == 'PersonCust' || extAnswer.type == 'Place'
                // || extAnswer.type == 'Event') eqRanks();
                eqRanks();
                if ($rootScope.DEBUG_MODE) console.log("eqFound, hasSubAreas, eqRankIdx = ", eqFound, hasSubAreas, eqRankIdx);
                //create 2 catans records one for downtown and then district
                if (eqFound) {
                    if (!hasSubAreas){
                        if ($rootScope.DEBUG_MODE) console.log("P7 - eqFound,hasSubAreas,eqRankIdx - ", eqFound, hasSubAreas, eqRankIdx);
                        catans.postRec2(extAnswer.id, eqRankIdx);
                        catans.postRec2(extAnswer.id, $rootScope.cCategory.id).then(rankSummary);
                    }
                    else{
                        if ($rootScope.DEBUG_MODE) console.log("P8 - eqFound,hasSubAreas,eqRankIdx - ", eqFound, hasSubAreas, eqRankIdx);
                        catans.postRec2(extAnswer.id, eqRankIdx).then(rankSummary);
                    }
                }
                else { //eqFound = false;
                    if (needCreateRec){
                        console.log("Need to create record");
                    }
                    else {
                        if ($rootScope.DEBUG_MODE) console.log("P9");
                        if ($rootScope.cCategory.isatomic) catans.postRec(extAnswer.id).then(rankSummary);
                        else{
                            //Need to find appropriate ranking record
                            var rFound = false;
                            var nidx = $rootScope.locations.map(function(x) {return x.nh_name; }).indexOf(extAnswer.cityarea);
                            $rootScope.content.forEach(function(r){
                                if (r.nh == $rootScope.locations[nidx].id && 
                                    r.cat == $rootScope.cCategory.cat ){
                                        rFound = true;
                                        rankid = r.id;
                                    }
                            });
                            if (rFound) catans.postRec2(extAnswer.id,rankid).then(rankSummary);
                            else{
                                //Need to create rank from ghost
                                var rObj = {};
                                rObj.cat = $rootScope.cCategory.cat;
                                rObj.nh = $rootScope.locations[nidx].id;
                                rObj.isatomic = true;
                                table.addTable(rObj).then(function(tableid){
                                    //update catstr and register new catans record
                                    var newcatstr = $rootScope.cCategory.catstr + ':' + tableid;
                                    var p1 = catans.postRec2(extAnswer.id,tableid);
                                    var p2 = table.update($rootScope.cCategory.id,['catstr'],[newcatstr]); 
                                    $q.all([p1,p2]).then(rankSummary);
                                });
                            }
                        }
                    }
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
                else cityarea = rankNh;
            else 
                cityarea = myAnswer.cityarea;

            if (hasSubAreas) {    
            //if (inDowntown || inDistrict || inCity) {              
                //if (inCity){
                    var idx = $rootScope.locations.map(function(x) {return x.nh_name; }).indexOf(cityarea);
                    //lookRank = $rootScope.cCategory.title.replace(rankNh, cityarea);
                    //console.log("lookRank - ", lookRank);
                    for (var n = 0; n < $rootScope.content.length; n++) {
                        if ($rootScope.content[n].cat == $rootScope.cCategory.cat && 
                            $rootScope.content[n].nh == $rootScope.locations[idx].id) {
                                eqFound = true;
                                eqRankIdx = $rootScope.content[n].id;
                        }
                    }
                    //if (!eqFound) needCreateGhostRec = true;
                //}
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

            if ($rootScope.DEBUG_MODE) console.log("prepareCatansOptions - ", $rootScope.cCategory, answerNeighborhood);
            if (!isCustomRank) {
                
                if (vm.addToRanks.length > 0) {
                    var morePossibleRanks = search.sibblingRanks($rootScope.cCategory, answerNeighborhood);
                    var map = vm.addToRanks.map(function (x) { return x.id; });
                    morePossibleRanks.forEach(function (item) {
                        if (map.indexOf(item.id) < 0) vm.addToRanks.push(item);
                    })
                    //vm.addToRanks = vm.addToRanks.concat(search.sibblingRanks($rootScope.cCategory, answerNeighborhood));
                }
                else vm.addToRanks = search.sibblingRanks($rootScope.cCategory, answerNeighborhood);
                      
                if (vm.addToRanks.length == 0) vm.addToRanks.push($rootScope.cCategory);
                if (vm.addToRanks.length > 0) vm.addToRanks[0].sel = true;
                for (var i = 1; i < vm.addToRanks.length; i++) {
                    vm.addToRanks[i].sel = false;
                }

                vm.addToRanks = vm.addToRanks.sort(compare);

                //search.sibblingRanks($rootScope.cCategory.id);
                vm.addctsopts = [];
                var opt = '';
                //if (answerNeighborhood == undefined || answerNeighborhood == '') answerNeighborhood = 'San Diego';
                for (var i = 0; i < $rootScope.ctsOptions.length; i++) {
                    if ($rootScope.ctsOptions[i].indexOf('@Nh') > -1) {
                        if (answerNeighborhood) {
                            opt = $rootScope.ctsOptions[i].replace('@Nh', answerNeighborhood);
                            vm.addctsopts.push(opt);
                        }
                    }
                    else vm.addctsopts.push($rootScope.ctsOptions[i]);
                }
            }
            else {
                //console.log("added $rootScope.cCategory - ", $rootScope.cCategory);
                //console.log("vm.addRanksEnable - ", vm.addRanksEnable);
                vm.addToRanks.push($rootScope.cCategory);
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
            if (idx > -1) {
                
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

                if (typemismatch) dialog.typemismatch($rootScope.content[idx].type, $rootScope.cCategory.type);
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
            //check if the value from addcts require ghost
            else{
                var idx2 = $rootScope.categories.map(function(x) {return x.category; }).indexOf(vm.addctsval.slice(0,9));
                if ($rootScope.categories[idx2].category.indexOf('@Nh')>-1){
                    var nidx = $rootScope.locations.map(function(x) {return x.nh_name; }).indexOf(answerNeighborhood);
                    var gObj = {};
                    gObj.cat = $rootScope.categories[idx2].id;
                    gObj.nh = $rootScope.locations[nidx].id;
                    gObj.isghost = true;
                    gObj.isatomic = true;
                    gObj.title = vm.addctsval;
                    console.log("added ghost to vm.addToRanks from addcts");
                    vm.addToRanks.push(gObj);
                }
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
                if (Math.abs(x.val.length - inputLengthMem)>=2 && x.val.length != 0){
                    //an option was selected from the typeahead
                    //search for this answer, if single result populate fields, if not
                    //show dialog with options
                    inputLengthMem = x.val.length;        
                    for (var i=0; i < $rootScope.answers.length; i++){
                        if ($rootScope.answers[i].name == x.val){
                            if (rankNhObj.id != 1){

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
            if (n == undefined ) extAnswer = maybeSameAnswers[0];
            else extAnswer = maybeSameAnswers[n];
            answerIsSame();
        }

        function detectNeighborhood(){
            //this function determines if current ranking is for a neighborhood or district
            var idx = $rootScope.locations.map(function (x) { return x.id; }).indexOf($rootScope.cCategory.nh);
            if (idx > -1){
                rankNh = $rootScope.locations[idx].nh_name;
                rankNhObj = $rootScope.locations[idx];
                answerNeighborhood = rankNh;
                if ($rootScope.cCategory.isatomic || rankNhObj.id != 1 ) prepareCatansOptions();
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
