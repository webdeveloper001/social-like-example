(function () {
    'use strict';

    angular
        .module('app')
        .controller('addEvent', addEvent);

    addEvent.$inject = ['dialog', '$state', 'answer', '$rootScope', '$modal', 'image', 'catans', 'getgps', '$timeout','getwiki','$window'];

    function addEvent(dialog, $state, answer, $rootScope, $modal, image, catans, getgps, $timeout, getwiki, $window) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'addEvent';
        vm.header = "table" + $rootScope.cCategory.id + ".header";
        vm.body = 'table' + $rootScope.cCategory.id + '.body';
        vm.searchDisabled = 'disabled';
        vm.modalEnable = true;
        vm.publicfields = [];
        vm.ranking = $rootScope.cCategory.title;
        var publicfield_obj = {};
        var loadImageDataOk = false;
        var addEventDataOk = false;
        var addEventExec = false;
        var events = $rootScope.events;
        
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
        
        // Members
        var myAnswer = {};
        
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
        vm.goBack = goBack;
        
        vm.imageURL = '../../../assets/images/noimage.jpg';
        vm.header = $rootScope.header;
        
        //TODO: Would like to add this abstract template, but dont know how         
        
		//Adjust picture size for very small displays
        if ($window.innerWidth < 512) {vm.sm = true; vm.nsm = false; }
        else {vm.sm = false; vm.nsm = true; }

        activate();

        function activate() {
            loadPublicFields();
            determineScope();
            $rootScope.eventmode = 'add';
             if ($rootScope.eventmode == 'edit') {
                
                //Copy object without reference
                vm.sp = JSON.parse(JSON.stringify($rootScope.cspecial));
                datetime.formatdatetime(vm.sp);
                
                vm.isEdit = true;
                if (vm.sp.freq == 'onetime') frequencySel(1);
                if (vm.sp.freq == 'weekly') frequencySel(2);
                vm.ev.bc = vm.sp.bc;
                vm.ev.fc = vm.sp.fc;

            }

            if ($rootScope.eventmode == 'add') {

                vm.char = 45;
                vm.ev.fc = "hsl(0, 100%, 0%)"; //black
                vm.ev.bc = "hsl(0, 0%, 100%)"; //white
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

        function loadPublicFields() {
            vm.emptyarray = [];
            
            vm.neighborhoods = $rootScope.neighborhoods.concat($rootScope.districts);

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
                
                //When neighborhood is implied put it in the input field right away
                if (vm.fields[i].name == "cityarea" && $rootScope.cCategory.type == 'Establishment' && $rootScope.NhImplied == true) {
                    vm.fields[i].val = $rootScope.NhValue;
                }

                if (vm.fields[i].name == "addinfo") vm.fields[i].textstyle = "textarea";
                else vm.fields[i].textstyle = "text";
                
                //console.log("name, opts -- ", vm.fields[i].name, vm.fields[i].opts);
            }

        }

        /*
        function addEvent() {

            if (!addEventExec) {
                myEvent.imageurl = vm.imageURL;
                
                myEvent.upV = 0;
                myEvent.downV = 0;
                myEvent.type = vm.type;
                myEvent.userid = $rootScope.user.id;
                myEvent.views = 0;

                dialog.addEvent(myEvent, vm.imageURL, addEventConfirmed);

                addEventExec = true;
                
                //This is to prevent double pulses and have two answers get submitted by hardware glitch
                $timeout(function () {
                    addEventExec = false;
                }, 1000)
            }
        }
        */
        
        function loadFormData() {
            //initialize form
            //for (var i = 0; i < vm.fields.length; i++) {
                //switch (vm.fields[i].name) {
                    myEvent.name = vm.ev.name;
                    myEvent.location = vm.ev.location;
                    myEvent.addinfo = vm.ev.addinfo;
                    myEvent.cityarea = vm.ev.cityarea;
                    myEvent.website = vm.ev.website;

              //  }
            //}
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
            ansObj.type = 'Event';
            ansObj.website = myEvent.website;
            ansObj.imageurl = myEvent.imageurl;
            ansObj.views = 0;
            ansObj.eventstr = eventstr;
            ansObj.userid = $rootScope.user.id
            if(vm.bind) ansObj.owner = $rootScope.user.id;
            
            eqRanks();
            if (eqFound && !inCity) answer.addAnswer2(ansObj, [$rootScope.cCategory.id, eqRankIdx]).then(rankSummary);
            else if (eqFound && inCity) answer.addAnswer2(ansObj, [eqRankIdx]).then(rankSummary);
            else answer.addAnswer(ansObj).then(rankSummary); 
            
            //answer.addAnswer(ansObj).then(rankSummary); 
            //console.log("adding myEvent", eventStr);
            //console.log("adding answer", ansObj);
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
                vm.imageURL = '../../../assets/images/noimage.jpg';
            }
        }
        
        function onNoGoodImages(x){
            if (x){
                vm.imageURL = '../../../assets/images/noimage.jpg';
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
            
            //myEvent.freq = (vm.onetime ? 'onetime' : 'weekly');
            dialog.createEventPreview(myEvent, addEventConfirmed);
        }
        
         function addSpecial() {
            if (vm.isEdit == false) {
                if (vm.sp.freq == 'onetime'){
                    myEvent.stime2 = null;
                    myEvent.etime2 = null;
                }
                if (vm.sp.freq == 'weekly'){
                    myEvent.stime = null; myEvent.sdate = null;
                    myEvent.etime = null; myEvent.edate = null;
                }
                event.addSpecial(myEvent).then();
                
            }
            else event.updateEvent(myEvent);
            $state.go('specials');
        }
        
        function eqRanks() {
            var lookRank = '';
            if (inDowntown || inDistrict || inCity) {
                if (inDowntown && myAnswer.cityarea != 'Downtown') {
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
        
       function deleteSpecial() {
            event.deleteEvent(myEvent.id);
            $state.go('specials');
        }

        function goBack() {
            //$state.go('specials');
            $state.go("rankSummary", { index: $rootScope.cCategory.id });
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
