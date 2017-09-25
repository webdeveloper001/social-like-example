(function () {
    'use strict';

    angular
        .module('app')
        .controller('dbMaint', dbMaint);

    dbMaint.$inject = ['$location', '$rootScope', '$state', '$stateParams', 'Upload', '$q','getgps',
        'table', 'dialog', 'answer', 'catans', 'votes', 'common', 
        '$http','categorycode','codeprice','useraccnt'];

    function dbMaint(location, $rootScope, $state, $stateParams, Upload, $q, getgps,
        table, dialog, answer, catans, votes, common,
        $http, categorycode, codeprice, useraccnt) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'dbMaint';

        vm.showUrefAns = showUrefAns;
        vm.delAnswer = delAnswer;
        vm.selAns = selAns;
        vm.showPossibleDuplicated = showPossibleDuplicated;
        vm.syncToFirst = syncToFirst;
        vm.syncToSecond = syncToSecond;
        vm.showDuplicatedOnlyName = showDuplicatedOnlyName;
        vm.showDuplicatedByLocation = showDuplicatedByLocation;
        vm.findPhoneWebsite = findPhoneWebsite;
        vm.findDuplicatedRanks = findDuplicatedRanks;
        vm.clearAllCatansVotes = clearAllCatansVotes;
        vm.syncUserVotes = syncUserVotes;
        vm.getAnswerBizCode = getAnswerBizCode;
        vm.updatecatans = updatecatans;
        vm.estDistances = estDistances;
        vm.gotoAnswer = gotoAnswer;
        vm.createImagesJSON = createImagesJSON;
        vm.updateUrls = updateUrls;
        vm.goMerge = goMerge;
        vm.getSlugs = getSlugs;
        vm.delAnswer = delAnswer;
        vm.addcts = addcts;
        vm.selEditAddress = selEditAddress;
        vm.editAddress = editAddress;
        vm.addcatcode = addcatcode;
        vm.categoryStr = categoryStr;
        vm.deleteDupVotes = deleteDupVotes;

        vm.isAdmin = $rootScope.isAdmin;
        
        vm.dupAnsRdy = false;
        vm.catstrmode = false;

        activate();

        function activate() {
            //loadData();
            console.log("dbMaint page Loaded!");

        }

        function showUrefAns() {
            var cans = {};
            var ansIsRef = false;
            var resObj = {};
            vm.unrefans = [];
            vm.addctsopts = [];
            vm.ans = -1;
            for (var i = 0; i < $rootScope.answers.length; i++) {
                resObj = {};
                cans = {};
                cans = $rootScope.answers[i];
                ansIsRef = false;
                for (var j = 0; j < $rootScope.catansrecs.length; j++) {
                    if ($rootScope.catansrecs[j].answer == cans.id) {
                        ansIsRef = true;
                        break;
                    }
                }
                if (ansIsRef == false) {
                    vm.unrefans.push(cans);
                }
            }
            
            //if unreference answer prepare catans options
            if (vm.unrefans.length > 0) {
                for (var n=0; n<$rootScope.content.length; n++){
                    vm.addctsopts.push($rootScope.content[n].title);
                }
            };
            
        }

        function delAnswer(x) {
                answer.deleteAnswer(x.id).then(function(){
                    showUrefAns();
                });             
        }

        function selAns(x) {
            vm.ans = x.id;
        }

        function addcts(x) {
            var title = '';
            var category = 0;
            
            title = vm.addctsval;
            
            for (var i = 0; i < $rootScope.content.length; i++) {
                if ($rootScope.content[i].title == title) {
                    category = $rootScope.content[i].id;
                    break;
                }
            }
            //console.log("postRec catans -",myAnswer.id,category,isDup);
            catans.postRec2(vm.ans, category).then(function(){
                showUrefAns();
            });
        }

        function showPossibleDuplicated() {
            // Find answers that are duplicated
            console.log("@ Show Possible Duplicated")
            console.log("answers length", $rootScope.answers.length);
            var canswer = {};
            var obj = {};
            vm.dupAnswers = [];
            var idx = 0;
            var n75 = 0;
            var canswer75 = '';
            for (var i = 0; i < $rootScope.answers.length; i++) {
                n75 = $rootScope.answers[i].name.length * 0.75;
                canswer = $rootScope.answers[i];
                canswer75 = $rootScope.answers[i].name.slice(0, n75);

                if ($rootScope.answers[i].type == 'Establishment' && canswer75.length > 8) {

                    for (var j = 0; j < $rootScope.answers.length; j++) {
                        if ($rootScope.answers[j].name.indexOf(canswer75) > -1 && i != j) {
                            //console.log("Duplicated answer: ", canswer.name);
                            obj = {};
                            obj.id = idx;
                            obj.add1 = canswer.addinfo;
                            obj.nh1 = canswer.cityarea;
                            obj.loc1 = canswer.location;
                            obj.name1 = canswer.name;
                            obj.image1 = canswer.imageurl;
                            obj.id1 = canswer.id;
                            obj.name2 = $rootScope.answers[j].name;
                            obj.idx1 = i;
                            obj.idx2 = j;
                            obj.loc2 = $rootScope.answers[j].location;
                            obj.nh2 = $rootScope.answers[j].cityarea;
                            obj.add2 = $rootScope.answers[j].addinfo;
                            obj.image2 = $rootScope.answers[j].imageurl;
                            obj.id2 = $rootScope.answers[j].id;
                            vm.dupAnswers.push(obj);
                            idx++;
                        }
                    }
                }
            }
            console.log("finished")
        }

        function syncToFirst(x) {
            //Sync to first answer in obj
            //Update catans from ans2 to ans1
            for (var i = 0; i < $rootScope.catansrecs.length; i++) {
                if (x.id2 == $rootScope.catansrecs[i].answer) {
                    catans.updateRec($rootScope.catansrecs[i].id, ["answer"], [x.id1]);
                    break;
                }
            }
            //delete answer 2
            answer.deleteAnswer(x.id2);
            showPossibleDuplicated();
        }

        function syncToSecond(x) {
            //Sync to second answer in obj
            //Update catans from ans1 to ans2
            for (var i = 0; i < $rootScope.catansrecs.length; i++) {
                if (x.id1 == $rootScope.catansrecs[i].answer) {
                    catans.updateRec($rootScope.catansrecs[i].id, ["answer"], [x.id2]);
                    break;
                }
            }
            //delete answer 2
            answer.deleteAnswer(x.id1);
            showPossibleDuplicated();
        }
        function showDuplicatedOnlyName() {
            // Find answers that are duplicated
            $rootScope.dupAns = [];
            var canswer = {};
            var obj = {};
            vm.dupAnsNames = [];
            var idx = 0;
            var isFF = false;
            for (var i = 0; i < $rootScope.answers.length; i++) {
                canswer = $rootScope.answers[i];
                for (var j = 0; j < $rootScope.answers.length; j++) {
                    if (canswer.name == $rootScope.answers[j].name && 
                    //canswer.cityarea == $rootScope.answers[j].cityarea && 
                        canswer.location == $rootScope.answers[j].location && i != j) {
                        //console.log("Duplicated answer: ", canswer.name);
                        isFF = false;
                        obj = {};
                        obj.ans1 = canswer;
                        obj.ans2 = $rootScope.answers[j];
                        /*obj.id = idx;
                        obj.add1 = canswer.addinfo;
                        obj.nh1 = canswer.cityarea;
                        obj.loc1 = canswer.location;
                        obj.name1 = canswer.name;
                        obj.image1 = canswer.imageurl;
                        obj.id1 = canswer.id;
                        obj.name2 = $rootScope.answers[j].name;
                        obj.idx1 = i;
                        obj.idx2 = j;
                        obj.loc2 = $rootScope.answers[j].location;
                        obj.nh2 = $rootScope.answers[j].cityarea;
                        obj.add2 = $rootScope.answers[j].addinfo;
                        obj.image2 = $rootScope.answers[j].imageurl;
                        obj.id2 = $rootScope.answers[j].id;
                        //vm.dupAnsNames.push(obj);*/
                        /*
                        if ((obj.ans1.name.indexOf('Subway')>-1 || obj.ans2.name.indexOf('Subway')>-1) ||
                        (obj.ans1.name.indexOf('Starbucks')>-1 || obj.ans2.name.indexOf('Starbucks')>-1) ||
                        (obj.ans1.name.indexOf('Pizza Hut')>-1 || obj.ans2.name.indexOf('Pizza Hut')>-1) ||
                        (obj.ans1.name.indexOf('Domino')>-1 || obj.ans2.name.indexOf('Domino')>-1) ||
                        (obj.ans1.name.indexOf('KFC')>-1 || obj.ans2.name.indexOf('KFC')>-1) ||
                        (obj.ans1.name.indexOf('Burger King')>-1 || obj.ans2.name.indexOf('Burger King')>-1) ||
                        (obj.ans1.name.indexOf('Eleven')>-1 || obj.ans2.name.indexOf('Eleven')>-1)) isFF = true;
                        */
                        if (true) $rootScope.dupAns.push(obj);
                        vm.dupAnsRdy = true;
                        idx++;
                    }
                }
            }
        }

        function showDuplicatedByLocation() {
            // Find answers that are duplicated
            $rootScope.fields = $rootScope.typeSchema[6].fields;
            
            var canswer = {};
            var obj = {};
            var dupAnsLocation = [];
            var idx = 0;
            for (var i = 0; i < $rootScope.answers.length; i++) {
                canswer = $rootScope.answers[i];
                if (canswer.location != undefined && canswer.location != '') {
                    for (var j = 0; j < $rootScope.answers.length; j++) {
                        if ($rootScope.answers[j].location != undefined && $rootScope.answers[j].location != '') {
                            if (canswer.location == $rootScope.answers[j].location &&  i != j) {
                                //console.log("Duplicated answer: ", canswer.name);
                                obj = {};
                                obj.ans1 = canswer;
                                obj.ans2 = $rootScope.answers[j];
                                dupAnsLocation.push(obj);
                                idx++;
                            }
                        }
                    }
                }
            }
            $rootScope.dupAns = dupAnsLocation;
            console.log("@finished - showDuplicatedByLocation");
            vm.dupAnsRdy = true;
        }
        
        function goMerge(){
            $state.go('mergeAnswers');
        }

        function findPhoneWebsite() {
            
            //console.log("Executing findingPhones");
            //var regex_pn = /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/;
            //var regex_pn = /\(([0-9]{3})\)([ .-]?)([0-9]{3})\2([0-9]{4})|([0-9]{3})([ .-]?)([0-9]{3})\5([0-9]{4})/;
            //var regex_pn
            //var regex_pn = /^[\.-)( ]*([0-9]{3})[\.-)( ]*([0-9]{3})[\.-)( ]*([0-9]{4})$/;
            //var regex_pn = /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/;
            //var regex_pn = /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/
            var regex_pn = /(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})\s*$/
            //var regex_url = /(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/igm;
            var phoneNum = '';
            //var url = '';
            var idx = 1;
            var obj = {};
            var newaddinfo = '';
            /*
            for (var i = 0; i < $rootScope.answers.length; i++) {
                if ($rootScope.answers[i].addinfo != null && $rootScope.answers[i].addinfo != undefined) {
                    if ($rootScope.answers[i].addinfo.length > 0) {
                        if ($rootScope.answers[i].addinfo.includes('(') == true && $rootScope.answers[i].addinfo.includes(')') == false) {
                            //newaddinfo = $rootScope.answers[i].addinfo;
                            //newaddinfo
                            console.log("current, new - ", $rootScope.answers[i].addinfo, $rootScope.answers[i].addinfo.replace('(',''));
                            //answer.updateAnswer($rootScope.answers[i].id,['phone'],[newphone]);
                        }
                    }
                }
            }*/
            /*
             for (var i=0; i<$rootScope.answers.length; i++){
                 if ($rootScope.answers[i].addinfo.length > 0){
                     //console.log("$rootScope.answers[i].addinfo",$rootScope.answers[i].addinfo);
                     var regRes = regex_pn.exec($rootScope.answers[i].addinfo);
                     //var regRes_url = regex_url.exec($rootScope.answers[i].addinfo);
                     //
                     if (regRes != null) phoneNum = regRes[0];
                     else phoneNum = '';
                     
                     //if (regRes_url != null) url = regRes_url[0];
                     //else url = '';
                     
                     if (phoneNum.length > 0){
                         obj = JSON.parse(JSON.stringify($rootScope.answers[i]));
                         var addinfox = obj.addinfo.replace(phoneNum, '');
                         //answer.updateAnswer($rootScope.answers[i].id,['phone','addinfo'],[phoneNum, addinfox]);
                         //addinfox.
                         console.log("matched!!!!", idx++, $rootScope.answers[i].name, " Phone Num: ", phoneNum);
                         //console.log(idx++, $rootScope.answers[i].name, " url: ", url);
                         //console.log("add info: ", $rootScope.answers[i].addinfo, addinfox);
                         //console.log(regRes);
                     }
                 }
             }*/
        }

        function findDuplicatedRanks() {

            var resDupRanks = [];
            for (var i = 0; i < $rootScope.content.length; i++) {
                for (var j = i; j < $rootScope.content.length; j++) {
                    if ($rootScope.content[i].title == $rootScope.content[j].title && i != j) {
                        console.log("duplicated rank --- ", $rootScope.content[i].title);
                        resDupRanks.push($rootScope.content[i]);
                    }
                }
            }
        }

        function clearAllCatansVotes() {
            console.log("Clearing all catans vote sums to zero");
            for (var i = 0; i < $rootScope.catansrecs.length; i++) {
                if ($rootScope.catansrecs[i].upV != 0 || $rootScope.catansrecs[i].downV != 0) {
                    catans.updateRec($rootScope.catansrecs[i].id, ['upV', 'downV'], [0, 0]);
                }
            }
        }

        function syncUserVotes() {

            console.log("syncUSerVotes");

            votes.loadAllVotes().then(function (result) {
                $rootScope.allvotes = result;
                syncVotes();
            });

        }

        function syncVotes() {

            console.log("syncVotes");
            var ca = {};
            var v = {};
            var nUpV = [];
            var nDownV = [];
            var idx = 0;
            var idx2 = 0;
            vm.syncp = [];
            var obj = {};
            for (var i = 0; i < $rootScope.catansrecs.length; i++) {
                ca = $rootScope.catansrecs[i];
                nUpV = [];
                nDownV = [];
                v = {};
                for (var j = 0; j < $rootScope.allvotes.length; j++) {
                    v = $rootScope.allvotes[j];
                    if (v.catans == ca.id) {   //if vote correspond to current catans
                        //console.log("vote id - ", v.id);
                        if (v.vote == 1) {
                            //console.log("upV catans -", ca.id, v.id);
                            nUpV.push(v);
                        }
                        if (v.vote == -1) {
                            //console.log("downV catans -", ca.id, v.id);
                            nDownV.push(v);
                        }
                    }
                }
                if (nUpV.length != ca.upV || nDownV.length != ca.downV) {

                    obj = {};

                    idx = $rootScope.answers.map(function (x) { return x.id; }).indexOf(ca.answer);
                    idx2 = $rootScope.content.map(function (x) { return x.id; }).indexOf(ca.category);

                    obj.answername = $rootScope.answers[idx].name;
                    obj.categorytitle = $rootScope.content[idx2].title;
                    obj.answer = $rootScope.answers[idx].id;
                    obj.catans = ca.id;
                    obj.category = $rootScope.content[idx2].id;
                    obj.caUpV = ca.upV;
                    obj.caDownV = ca.downV;
                    obj.nUpVlen = nUpV.length;
                    obj.nDownVlen = nDownV.length;
                    obj.upVotes = nUpV;
                    obj.downVotes = nDownV;

                    vm.syncp.push(obj);
                    //console.log("syn problem upV @ catans - ", $rootScope.answers[idx].name, $rootScope.content[idx2].title, ca.upV, nUpV);
                }
            }
        }

        function updatecatans(x) {
            catans.updateRec(x.catans, ['upV', 'downV'], [x.nUpVlen, x.nDownVlen]);
        }

        function deleteDupVotes(x){
            var rFound = false;
            for (var j = 0; j < $rootScope.allvotes.length; j++) {
                if (x.user == $rootScope.allvotes[j].user && 
                    x.vote == $rootScope.allvotes[j].vote && 
                    x.catans == $rootScope.allvotes[j].catans &&
                    x.answer == $rootScope.allvotes[j].answer){
                    if (rFound) {
                        votes.deleteRec($rootScope.allvotes[j].id);
                    }
                    rFound = true;
                }
            }
        }

        function estDistances() {
            console.log("@estDistances, need to have GPS location stored-", $rootScope.answers.length);
            vm.ans = -1;
            vm.answerdist = [];
            //Calculate distances to user
            var p = 0.017453292519943295;    // Math.PI / 180
            var c = Math.cos;
            var a = 0;
            var lat_o = $rootScope.currentUserLatitude;
            var lng_o = $rootScope.currentUserLongitude;
            var lat = 0;
            var lng = 0;
            var dist_mi = 0;
            var myObj = {};

            for (var i = 0; i < $rootScope.answers.length; i++) {
                if ($rootScope.answers[i].type == 'Establishment') {
                    if ($rootScope.answers[i].location != undefined &&
                        $rootScope.answers[i].location != '') {
                            
                        //console.log($rootScope.answers[i].name," - ",$rootScope.answers[i].location);

                        lat = $rootScope.answers[i].lat;
                        lng = $rootScope.answers[i].lng;
                        myObj = $rootScope.answers[i];
                        a = 0.5 - c((lat - lat_o) * p) / 2 + c(lat_o * p) * c(lat * p) * (1 - c((lng - lng_o) * p)) / 2;

                        dist_mi = (12742 * Math.asin(Math.sqrt(a))) / 1.609; // 2 * R; R = 6371 km
                        myObj.dist = dist_mi;
                        if (dist_mi > 100 || dist_mi == NaN) {
                            //console.log('Answer Id. ',myObj.id,' Name: ',myObj.name);
                            vm.answerdist.push(myObj);
                        }
                    }
                }
            }
        }

        function gotoAnswer(x) {
            $state.go("answerDetail", { index: x.id });
        }

        function createImagesJSON() {
            
            //creates json of images that are non-secure
            var images = [];
            var imgObj = {};
            var idx = 1256;
            for (var i = 0; i < $rootScope.answers.length; i++) {
                if ($rootScope.answers[i].imageurl.indexOf('http://') > -1) {
                    imgObj = {};
                    imgObj.id = idx++;
                    imgObj.answer = $rootScope.answers[i].id;
                    imgObj.url = $rootScope.answers[i].imageurl;
                    images.push(imgObj);
                }
            }
            console.log(JSON.stringify(images));
        }

        function updateUrls() {

            var images = [];
            var fext = '';
            $http.get('../../../assets/images.json').then(function (response) {
                images = response.data;
                //console.log("images length - ", images.length);
                for (var i = 0; i < images.length; i++) {

                    if (images[i].url.indexOf('jpg') > -1) fext = 'jpg';
                    if (images[i].url.indexOf('png') > -1) fext = 'png';
                    if (images[i].url.indexOf('jpeg') > -1) fext = 'jpeg';

                    answer.updateAnswer(images[i].answer, ['image'],
                        ['https://rankx.blob.core.windows.net/sandiego/' + images[i].answer + '/' + images[i].id + '.' + fext]);
                }
            });
        }

        function getAnswerBizCode() {
            var category = 0;
            var rank = {};
            var catcodes = [];
            var scale_current = 0;
            var scale_this = 0;
            var ansObj = {};
            var bizcat = '';
            vm.codes = [];
            vm.catcode = {};
            vm.ans = -1;
            
            var p0 = categorycode.get();
            var p1 = codeprice.get();

            return $q.all([p0, p1]).then(function (d) {
                $rootScope.catcodes = d[0];
                $rootScope.codeprices = d[1];

                for (var m=0; m<$rootScope.codeprices.length; m++){
                    vm.codes.push($rootScope.codeprices[m].code);
                }

                console.log('Category-codes loaded...');

                vm.ansNoCode = [];
                for (var i = 0; i < $rootScope.answers.length; i++) {
                    if ($rootScope.answers[i].type == 'Establishment' ||
                        $rootScope.answers[i].type == 'PersonCust'){
                        ansObj = {};
                        ansObj = $rootScope.answers[i];
                        bizcat = useraccnt.getBizCat(ansObj.id);
                        if (bizcat == undefined || bizcat == '' || bizcat == null){
                            //ansObj.bizcat = bizcat;
                            //vm.ansNoCode.push(ansObj);
                            //look categories of answer that dont have category codeprice
                            ansObj.cats = [];
                            for (var k=0; k<$rootScope.catansrecs.length; k++){
                                if ($rootScope.catansrecs[k].answer == ansObj.id){
                                    for (var n=0; n<$rootScope.content.length; n++){
                                        if ($rootScope.content[n].id == $rootScope.catansrecs[k].category){
                                            ansObj.cats.push($rootScope.content[n].title);
                                        }
                                    }
                                }
                            }
                            vm.ansNoCode.push(ansObj);                            
                        }
                        //else console.log(ansObj.name,"-",bizcat);
                    }
                }
            });
        }

        function addcatcode(){
            categorycode.post(vm.catcode).then(function(){
                console.log("Added category code pair");
                getAnswerBizCode();
            });
        }

        function selEditAddress(x){
            console.log("selEditAddess - ", x);
            vm.ans = x.id;
        }

        function editAddress(x){
            getgps.getLocationGPS(x).then(function(){
                answer.updateAnswer(x.id,['location','lat','lng'],[x.location, x.lat, x.lng]).then(function(){
                    estDistances();
                });

            });
            
        }

        function getSlugs(){
            /*
            //for answers
            for (var i=0; i<$rootScope.answers.length; i++){
                if ($rootScope.answers[i].slug == undefined || $rootScope.answers[i].slug == ''){
                var slugTag = '';
                //Change all to lowercase
                slugTag = $rootScope.answers[i].name.toLowerCase();
                //replace space with dash
                slugTag = slugTag.replace(/ /g,'-');
                //add -id at the end to ensure uniqueness
                slugTag = slugTag + '-' + $rootScope.answers[i].id;
                
                //Update database
                answer.updateAnswer($rootScope.answers[i].id,['slug'],[slugTag]);
                }
                //console.log("slugTag - ", slugTag);  
            }*/

            
            //for rankings
            //for (var i=0; i<20; i++){
            /*
            for (var i=0; i<$rootScope.content.length; i++){
                if ($rootScope.content[i].slug == undefined || $rootScope.content[i].slug == ''){    
                var slugTag = '';
                //Change all to lowercase
                slugTag = $rootScope.content[i].title.toLowerCase();
                //replace space with dash
                slugTag = slugTag.replace(/ /g,'-');
                //add -id at the end to ensure uniqueness
                slugTag = slugTag + '-' + $rootScope.content[i].id;
                
                //Update database
                table.update($rootScope.content[i].id,['slug'],[slugTag]);
                //console.log("slugTag - ", slugTag);
                }  
            }*/
        }

        function categoryStr(){
            vm.catstrmode = true;
            var ctr = 0;
            // 32.*****Populate catstr field for all ranks **** 
                    var catstr = '';
                    var idx = -1;
                    var idx2 = -1;
                    var nhObj = {};
                    var nhArr = [];
                    var nhSub = [];
                    var nhSub2 = [];
                    var catArr = [];

                    for (var i=0; i < $rootScope.content.length; i++){
                    //for (var i=0; i < 100; i++){
                        nhArr = [];
                        common.getInclusiveAreas($rootScope.content[i].nh,nhArr);
                        
                        catArr = [];
                        for (var j=0; j < $rootScope.content.length; j++){
                            if ($rootScope.content[i].cat == $rootScope.content[j].cat){
                                for (var n=0; n < nhArr.length; n++){
                                    if (nhArr[n] == $rootScope.content[j].nh) {
                                        catArr.push($rootScope.content[j].id);
                                        //console.log($rootScope.content[j].slug);
                                    }
                                }
                            }
                        }
                        //console.log("length catArr ", catArr.length);
                        catstr = '';
                        for (var m=0; m < catArr.length; m++){
                            catstr = catstr + ':'+ catArr[m];
                        }
                        catstr = catstr.substring(1);
                        //console.log("catstr - ", catstr);
                        table.update($rootScope.content[i].id,['catstr'],[catstr]).then(function(){
                            ctr++;
                            vm.cpct = Math.floor((ctr/$rootScope.content.length)*100);
                        });
                        
                    }
                    //End of 32 */
        }
    }
})();
