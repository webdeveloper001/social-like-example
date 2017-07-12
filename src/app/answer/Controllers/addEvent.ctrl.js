(function () {
    'use strict';

    angular
        .module('app')
        .controller('addEvent', addEvent);

    addEvent.$inject = ['dialog', '$state', 'answer', '$rootScope', '$modal', 'datetime',
     'image', 'catans', 'getgps', '$timeout','getwiki','$window','$scope'];

    function addEvent(dialog, $state, answer, $rootScope, $modal, datetime,
    image, catans, getgps, $timeout, getwiki, $window, $scope) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'addEvent';
        //vm.header = "table" + $rootScope.cCategory.id + ".header";
        //vm.body = 'table' + $rootScope.cCategory.id + '.body';
        vm.searchDisabled = 'disabled';
        vm.modalEnable = true;
        vm.publicfields = [];
        //vm.ranking = $rootScope.cCategory.title;
        var publicfield_obj = {};
        var loadImageDataOk = false;
        var addEventDataOk = false;
        var addEventExec = false;
        var events = $rootScope.events;
        var nhChanged = false;
        
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
        vm.ev = {};
        var myEvent = {};

        //search for equivalent ranks
        var inDistrict = false;
        var inDistrictName = '';
        var inDowntown = false;
        var inCity = false;
        var eqRankIdx = 0;
        var eqFound = false;
        var inputLengthMem = 0; //inputLength in Memory
        var maybeLocations = [];
        
        // Members
        //var myAnswer = {};
        
        // Methods
        vm.calladdEvent = calladdEvent;
        vm.rankSummary = rankSummary;
        vm.callSearchImage = callSearchImage;
        vm.viewNext = viewNext;
        vm.viewPrev = viewPrev;
        vm.closeRank = closeRank;
        vm.onNoGoodImages = onNoGoodImages;
        vm.showHowItWorksDialog = showHowItWorksDialog;
        vm.displayCharLength = displayCharLength;
        vm.frequencySel = frequencySel;
        vm.showPreview = showPreview;
        vm.deleteSpecial = deleteSpecial;
        vm.onSelect = onSelect;
        vm.goBack = goBack;
        
        vm.imageURL = $rootScope.EMPTY_IMAGE;
        vm.header = $rootScope.header;
        
        //TODO: Would like to add this abstract template, but dont know how         
        
		//Adjust picture size for very small displays
        if ($window.innerWidth < 512) {vm.sm = true; vm.nsm = false; }
        else {vm.sm = false; vm.nsm = true; }

        activate();

        function activate() {

            //Concatenate Establishments and Places to show venue options
            vm.locations = $rootScope.estNames.concat($rootScope.plaNames);

            //Load neighborhoods
            vm.neighborhoods = $rootScope.neighborhoods.concat($rootScope.districts);
            
            //$rootScope.eventmode = 'add';
             if ($rootScope.eventmode == 'edit') {
                
                //Copy object without reference
                vm.ev = JSON.parse(JSON.stringify($rootScope.canswer));
                
                //Check if this event is bind to user
                if (vm.ev.owner != 0 && vm.ev.owner != undefined) vm.bind = true;
                else vm.bind = false;
                
                datetime.formatdatetime(vm.ev);
                
                vm.isEdit = true;
                if (vm.ev.freq == 'onetime') frequencySel(1);
                if (vm.ev.freq == 'weekly') frequencySel(2);
                //vm.ev.bc = vm.sp.bc;
                //vm.ev.fc = vm.sp.fc;
                if ($rootScope.DEBUG_MODE) console.log("vm.ev --- ", vm.ev);
                vm.imageURL = vm.ev.imageurl;

            }

            if ($rootScope.eventmode == 'add') {

                determineScope();
                vm.char = 45;
                vm.ev.fc = "hsl(0, 100%, 0%)"; //black
                vm.ev.bc = "hsl(0, 0%, 100%)"; //white
                vm.ev.eventlocid = -1;
                frequencySel(1);
            }

            createTimeDropdown();            
            console.log("Add Event Activated!");

        }

        function determineScope() {
            if ($rootScope.cCategory.title.indexOf('San Diego') > -1) {
                inCity = true;
            }
            if ($rootScope.cCategory.title.indexOf('Downtown') > -1) {
                inDowntown = true;
            }
            for (var j = 0; j < $rootScope.districts.length; j++) {
                if ($rootScope.cCategory.title.indexOf($rootScope.districts[j]) > -1) {
                    inDistrict = true;
                    inDistrictName = $rootScope.districts[j];
                }
            }
        }
        
        function loadFormData() {
            //initialize form
            //for (var i = 0; i < vm.fields.length; i++) {
                //switch (vm.fields[i].name) {
                    myEvent.name = vm.ev.name;
                    myEvent.location = vm.ev.location;
                    myEvent.addinfo = vm.ev.addinfo;
                    myEvent.cityarea = vm.ev.cityarea;
                    myEvent.website = vm.ev.website;
                    myEvent.eventloc = vm.ev.eventloc;
                    
        }

        function validateData() {
            loadImageDataOk = true;
            //addEventDataOk = true;
            if (vm.ev.name.length < 3) {
                  loadImageDataOk = false;
            }
            
           //loadImageDataOk = loadImageDataOk && countryIsValid;
           addEventDataOk = (loadImageDataOk && (vm.numLinks > 0 || vm.ngi));
        }

        function rankSummary() {

            $state.go("rankSummary", { index: $rootScope.cCategory.id });
        }

        function callSearchImage() {

            var pFields = [];

            loadFormData();
            validateData();

            if (loadImageDataOk) {
                
                var obj = {};
                obj.field = "name";
                obj.val = vm.ev.name;
                obj.cval = vm.ev.name;
                
                pFields.push(obj);
                //pFields = JSON.parse(JSON.stringify(vm.ev));
                //pFields = [vm.ev.title];
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

        function calladdEvent() {
            loadFormData();
            validateData();
            
            if (addEventDataOk) {
                addEvent();
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

        function addEventConfirmed(myEvent) {
            //Add new answer, also add new post to catans (inside addAnser)
            var eventObj = {};
            eventObj.bc = myEvent.bc;
            eventObj.fc = myEvent.fc;
            eventObj.freq = myEvent.freq;
            eventObj.edate = myEvent.edate;
            eventObj.sdate = myEvent.sdate;
            eventObj.etime = myEvent.etime;
            eventObj.etime2 = myEvent.etime2;
            eventObj.stime = myEvent.stime;
            eventObj.stime2 = myEvent.stime2;
            eventObj.mon = myEvent.mon;
            eventObj.tue = myEvent.tue;
            eventObj.wed = myEvent.wed;
            eventObj.thu = myEvent.thu;
            eventObj.fri = myEvent.fri;
            eventObj.sat = myEvent.sat;
            eventObj.sun = myEvent.sun;
            
            var eventstr = JSON.stringify(eventObj);
            
            var ansObj = {};
            ansObj.name = myEvent.name;
            ansObj.addinfo = myEvent.addinfo;
            ansObj.cityarea = myEvent.cityarea;
            ansObj.location = myEvent.location;
            ansObj.eventloc = myEvent.eventloc;
            ansObj.eventlocid = myEvent.eventlocid;
            ansObj.lat = myEvent.lat;
            ansObj.lng = myEvent.lng;
            ansObj.type = 'Event';
            ansObj.website = myEvent.website;
            ansObj.phone = myEvent.phone;
            ansObj.imageurl = myEvent.imageurl;
            ansObj.views = 0;
            ansObj.eventstr = eventstr;
            ansObj.userid = $rootScope.user.id;
            ansObj.ig_image_urls = '';
            ansObj.slug = '';
            if(vm.bind) ansObj.owner = $rootScope.user.id;

            console.log("ansObj - ", ansObj);
            
            eqRanks();
            if (eqFound && !inCity) answer.addAnswer2(ansObj, [$rootScope.cCategory.id, eqRankIdx]).then(rankSummary);
            else if (eqFound && inCity) answer.addAnswer2(ansObj, [eqRankIdx]).then(rankSummary);
            else answer.addAnswer(ansObj,[$rootScope.cCategory]).then(rankSummary); 
            
         }
        
        function updateEventConfirmed(){

            console.log("updateEventComfirmed");
            
            var eventObj = {};
            eventObj.bc = myEvent.bc;
            eventObj.fc = myEvent.fc;
            eventObj.freq = myEvent.freq;
            eventObj.edate = myEvent.edate;
            eventObj.sdate = myEvent.sdate;
            eventObj.etime = myEvent.etime;
            eventObj.etime2 = myEvent.etime2;
            eventObj.stime = myEvent.stime;
            eventObj.stime2 = myEvent.stime2;
            eventObj.mon = myEvent.mon;
            eventObj.tue = myEvent.tue;
            eventObj.wed = myEvent.wed;
            eventObj.thu = myEvent.thu;
            eventObj.fri = myEvent.fri;
            eventObj.sat = myEvent.sat;
            eventObj.sun = myEvent.sun;
            
            var eventstrNew = JSON.stringify(eventObj);
            if(!vm.bind) vm.ev.owner = 0;
            
            var fields = [];
            var vals = []; 
            
            if($rootScope.canswer.name != vm.ev.name) {fields.push('name'); vals.push(vm.ev.name);}
            if($rootScope.canswer.addinfo != vm.ev.addinfo) {fields.push('addinfo'); vals.push(vm.ev.addinfo);}
            if($rootScope.canswer.cityarea != vm.ev.cityarea) {fields.push('cityarea'); vals.push(vm.ev.cityarea); nhChanged = true;}
            if($rootScope.canswer.location != vm.ev.location) {fields.push('location'); vals.push(vm.ev.location);}
            if($rootScope.canswer.website != vm.ev.website) {fields.push('website'); vals.push(vm.ev.website);}
            if($rootScope.canswer.phone != vm.ev.phone) {fields.push('phone'); vals.push(vm.ev.phone);}
            if($rootScope.canswer.imageurl != vm.imageURL) {fields.push('image'); vals.push(vm.imageURL);}
            if($rootScope.canswer.eventstr != eventstrNew) {fields.push('eventstr'); vals.push(eventstrNew);}
            if($rootScope.canswer.owner != vm.ev.owner) {fields.push('owner'); vals.push(vm.ev.owner);}
            if($rootScope.canswer.eventloc != vm.ev.eventloc) {fields.push('eventloc'); vals.push(vm.ev.eventloc);}
            if($rootScope.canswer.eventlocid != vm.ev.eventlocid) {fields.push('eventlocid'); vals.push(vm.ev.eventlocid);}
            if($rootScope.canswer.lat != vm.ev.lat) {fields.push('lat'); vals.push(vm.ev.lat);}
            if($rootScope.canswer.lng != vm.ev.lng) {fields.push('lng'); vals.push(vm.ev.lng);}
            
            if ($rootScope.DEBUG_MODE) console.log("fields - ", fields);
            if ($rootScope.DEBUG_MODE) console.log("vals - ", vals);

            if (nhChanged) updateCatans();
            
            answer.updateAnswer(vm.ev.id, fields, vals).then(function(){
                $state.go('answerDetail',{index: vm.ev.id});
            });
        }

        function updateCatans(){
                //if change neighborhood, modify catans as well
                //---Search catans with this answer
                var cidx = 0;
                var cObj = {};
                var sTitle = ''; //searched title
                var rec2change = []; //store id of catans to change
                var change2cat = []; //store category to change to
                
                for (var i=0; i<$rootScope.catansrecs.length; i++){
                    if ($rootScope.catansrecs[i].answer == vm.ev.id){
                        cidx = $rootScope.content.map(function(x) {return x.id; }).indexOf($rootScope.catansrecs[i].category);
                        cObj = $rootScope.content[cidx];
                        //if category for catans includes old nh, see if category for new nh exists
                        if (cObj.title.indexOf($rootScope.canswer.cityarea) > -1){
                            sTitle = cObj.title.replace($rootScope.canswer.cityarea,vm.ev.cityarea);
                            for (var k=0; k<$rootScope.content.length; k++){
                                //if searched title is found, store catans rec and category
                                if ($rootScope.content[k].title == sTitle){
                                    //console.log($rootScope.content[k].title);
                                    rec2change.push($rootScope.catansrecs[i].id);
                                    change2cat.push($rootScope.content[k].id);
                                    break;
                                }
                            }
                        }
                    }
                }
                for (var i=0; i<rec2change.length; i++){
                    catans.updateRec(rec2change[i],['category'],[change2cat[i]]);
                }
        }
        
        function showHowItWorksDialog() {
            dialog.howItWorks('addEvent');
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
        
        function onNoGoodImages(x){
            if (x){
                vm.imageURL = $rootScope.EMPTY_IMAGE;
            }
            else{
                vm.imageURL = imageLinks[vm.linkIdx];
            }
        }
        
        function displayCharLength() {
            vm.char = 45 - vm.ev.name.length;
        }

        function frequencySel(x) {
            if (x == 1) {
                vm.weekly = false;
                vm.onetime = true;
                vm.ev.freq = 'onetime';
            }
            if (x == 2) {
                vm.weekly = true;
                vm.onetime = false;
                vm.ev.freq = 'weekly';
            }
        }

        function showPreview() {
            myEvent = vm.ev;
            myEvent.imageurl = vm.imageURL;
            myEvent.date = myEvent.sdate;
            
            if ($rootScope.eventmode == 'add') dialog.createEventPreview(myEvent, 'add', addEventConfirmed);
            else dialog.createEventPreview(myEvent, 'edit', updateEventConfirmed);
        }
        
        function eqRanks() {
            var lookRank = '';
            if (inDowntown || inDistrict || inCity) {
                if (inDowntown && myEvent.cityarea != 'Downtown') {
                    lookRank = $rootScope.cCategory.title.replace('Downtown', vm.ev.cityarea);
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
                    lookRank = $rootScope.cCategory.title.replace('San Diego', vm.ev.cityarea);
                    for (var n = 0; n < $rootScope.content.length; n++) {
                        if ($rootScope.content[n].title == lookRank) {
                            eqFound = true;
                            eqRankIdx = $rootScope.content[n].id;
                        }
                    }
                }
            }
        }

        function onSelect(){
            maybeLocations = [];
            //only use for field name
                if (Math.abs(vm.ev.eventloc.length - inputLengthMem)>2 && vm.ev.eventloc.length != 0){
                    //an option was selected from the typeahead
                    //search for this answer, if single result populate fields, if not
                    //show dialog with options
                    inputLengthMem = vm.ev.eventloc.length;        
                    for (var i=0; i<$rootScope.answers.length; i++){
                        if ($rootScope.answers[i].name == vm.ev.eventloc){
                            maybeLocations.push($rootScope.answers[i]);
                        }
                    }
                    //console.log("MaybeSameAnswers - ", maybeSameAnswers);
                    if (maybeLocations.length == 1) {
                        //checkAnswerExists(maybeLocations[0]);
                        dialog.confirmSameAnswer(maybeLocations[0],locationSelected);
                    }
                    else if (maybeLocations.length > 1) dialog.confirmSameAnswerMultiple(maybeSameAnswers,locationSelected);                 
                }                
            inputLengthMem = vm.ev.eventloc.length;                       
        }

        function locationSelected(x){
            var n = 0;
            if (x != undefined) n = x;
                console.log("n ", maybeLocations[n], n);
                for (var i=0; i< $rootScope.answers.length; i++){
                        if ($rootScope.answers[i].name == maybeLocations[n].name){
                            vm.ev.location = $rootScope.answers[i].location;
                            vm.ev.cityarea = $rootScope.answers[i].cityarea;
                            vm.ev.eventloc = $rootScope.answers[i].name;
                            vm.ev.eventlocid = $rootScope.answers[i].id;
                            vm.ev.phone = $rootScope.answers[i].phone;
                            vm.ev.website = $rootScope.answers[i].website;
                            vm.ev.lat = $rootScope.answers[i].lat;
                            vm.ev.lng = $rootScope.answers[i].lng;
                            $scope.$apply();
                        }
                }
        }
        
       function deleteSpecial() {
            event.deleteEvent(myEvent.id);
            $state.go('specials');
        }

        function goBack() {
            //$state.go('specials');
            if ($rootScope.eventmode == 'edit') $state.go("answerDetail", { index: $rootScope.canswer.slug });
            if ($rootScope.eventmode == 'add') $state.go("rankSummary", { index: $rootScope.cCategory.slug });
        }

        function createTimeDropdown() {

            vm.timeDD = ["7:00 AM", "7:30 AM", "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
                "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM",
                "8:00 PM", "8:30 PM", "9:00 PM", "9:30 PM", "10:00 PM", "10:30 PM", "11:00 PM", "11:30 PM", "12:00 AM", "12:30 AM", "1:00 AM", "1:30 AM",
                "2:00 AM", "2:30 AM", "3:00 AM", "3:30 AM", "4:00 AM", "4:30 AM", "5:00 AM", "5:30 AM", "6:00 AM", "6:30 AM"];
        }

        function closeRank() {
            $state.go('cwrapper');
        }

    }

})();
