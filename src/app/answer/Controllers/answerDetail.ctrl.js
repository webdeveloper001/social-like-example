(function () {
    'use strict';

    angular
        .module('app')
        .controller('answerDetail', answerDetail);

    answerDetail.$inject = ['flag', '$stateParams', '$state', 'answer', 'dialog', '$rootScope','$window', 'useractivity','htmlops',
        'votes', 'matchrec', 'edit', 'editvote', 'catans', 'datetime','commentops', 'userdata','useraccnt','dataloader','$timeout',
        '$location', 'vrows', 'vrowvotes','imagelist','instagram', '$scope', 'table', 'SERVER_URL','$http',
        '$cookies', '$q', 'fbusers', 'InstagramService', 'mailing', 'Socialshare']; //AM:added user service

    function answerDetail(flag, $stateParams, $state, answer, dialog, $rootScope, $window, useractivity,htmlops,
        votes, matchrec, edit, editvote, catans, datetime, commentops, userdata,useraccnt, dataloader, $timeout,
        $location, vrows, vrowvotes, imagelist, instagram, $scope, table, SERVER_URL, $http,
        $cookies, $q, fbusers, InstagramService, mailing, Socialshare) { //AM:added user service
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'answerDetail';
        //if ($location.absUrl().indexOf('code=')>-1)$window.location.search = '';

        var voteRecordExists = false;
        var dV = 0;
        var upVi = 0;  //upVotes initial value
        var downVi = 0; //downVotes initial value
        var answers = [];
        var recordsUpdated = false;
        var vrowsByUserCounter = 0;
        vm.numEdits = 0;
        var numImages = 0;
        var numImagesPage = 0;
        
        // Members
        vm.relativetable = [];
        vm.catans = [];
        vm.sm = $rootScope.sm;
        vm.votemode = false;
        vm.dispRanks = 3;
               
        // Methods
        vm.UpVote = UpVote;
        vm.DownVote = DownVote;
        vm.refresh = refresh;
        vm.goBack = goBack;
        vm.goPrev = goPrev;
        vm.goNext = goNext;
        vm.deleteAnswer = deleteAnswer;
        vm.flagAnswer = flagAnswer;
        vm.deleteButton = false;
        vm.showUrl = showUrl;
        vm.closeRank = closeRank;
        vm.closeAnswerDetail = closeAnswerDetail;
        vm.rankSel = rankSel;
        vm.bizRegDialog = bizRegDialog;
        vm.openSpecials = openSpecials;
        vm.editVRows = editVRows;
        vm.getImages = getImages;
        vm.showsimage = showsimage;
        vm.gotoRank = gotoRank;
        vm.vrowVoteUp = vrowVoteUp;
        vm.vrowVoteDown = vrowVoteDown;
        vm.loadComments = loadComments;
        vm.postComment = postComment;
        vm.selectPhoto = selectPhoto;
        vm.cmFlag = cmFlag;
        vm.deleteThisCatans = deleteThisCatans;
        vm.addRankforAnswer = addRankforAnswer;
        vm.votemodeON = votemodeON;
        vm.votemodeOFF = votemodeOFF;
        vm.user = $rootScope.user;
        vm.endorseDialog = endorseDialog;
        vm.selectInstagramImages = selectInstagramImages;
        vm.showRanks = showRanks;
        vm.hideCustomRanks = hideCustomRanks;
        vm.hideGetPremium = hideGetPremium;
        vm.gotoMyBusiness = gotoMyBusiness;
        vm.share = share;
        vm.addvrow = addvrow;
        vm.moreImagesRev = moreImagesRev;
        vm.moreImagesFwd = moreImagesFwd;
        vm.showSpecial = showSpecial;
        vm.showLocations = showLocations;
        vm.navigateTowards = navigateTowards;
        vm.gotoCustomRank = gotoCustomRank;
        vm.backToResults = backToResults;
      
        //Admin Function adding catans on spot
        vm.addCatans = addCatans;
        vm.addctsactive = false;
        vm.addcts = addcts;

       //Comments related variables
        var cObj = {};
        cObj.commLoaded = false;
        cObj.initials = '';
        cObj.bc = '';
        cObj.fc = '';
        cObj.comments = [];
        cObj.newComment = '';
        vm.cm = cObj;
        vm.commentAllowed = true;
        vm.searchActive = $rootScope.searchActive;
        var answerFound = false;
        
        vm.isMobile = false; 
        // device detection
        if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
            || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) 
            vm.isMobile = true;
        
        //TODO: Would like to add this abstract template, but dont know how                           
        var updateRecordsListener = $rootScope.$on('$stateChangeStart',
            function (ev, to, toParams, from, fromParams) {
                if (from.name == 'answerDetail' && to.name != 'answerDetail') {
                    if (!recordsUpdated && $rootScope.isLoggedIn && answerFound) updateRecords();
                }
            });

        var refreshImagesListener = $rootScope.$on('refreshImages', function () {
            if ($state.current.name == 'answerDetail') getImages();
        });
        var fileUploadedListener = $rootScope.$on('fileUploaded', function () {
            if ($state.current.name == 'answerDetail') getImages();
        });

        var answerDataLoadedListener = $rootScope.$on('answerDataLoaded', function () {
            vm.dataReady = true;
            getAnswer();
        });

        $scope.$on('$destroy',refreshImagesListener);
        $scope.$on('$destroy',fileUploadedListener);
        $scope.$on('$destroy',answerDataLoadedListener);
        $scope.$on('$destroy',updateRecordsListener);
    
        if ($rootScope.answerDetailLoaded) { 
            vm.dataReady = true; 
            getAnswer(); 
        }
        else vm.dataReady = false;

        //Flags to hide advertisement blocks
        vm.hideCustomRanksMsg = $rootScope.hideCustomRankMsg == undefined ? false:$rootScope.hideCustomRankMsg; 
        vm.hideGetPremiumMsg = $rootScope.hideGetPremiumMsg == undefined ? false:$rootScope.hideGetPremiumMsg;

        //activate();
        window.prerenderReady = false;
        

        function getAnswer(){

            if ($stateParams.index) {
                var isnum = /^\d+$/.test($stateParams.index);
                if(isnum){
                    var i = $rootScope.answers.map(function (x) { return x.id; }).indexOf(+$stateParams.index);
                    vm.answer = $rootScope.answers[i];
                } else {
                    var i = $rootScope.answers.map(function (x) { return x.slug; }).indexOf($stateParams.index);
                    vm.answer = $rootScope.answers[i];
                }
            }

            if (vm.answer == undefined) {
                answerFound = false;
                dialog.notificationWithCallback(
                'Oops','Couldnt find this answer. This answer probably got deleted and its no longer in the database.',
                goBack );
            }
            else {
                answerFound = true;
                activate();
            }
            
        }

        function activate() {

            //Init variables
            //vm.ranking = $rootScope.title;
            answers = $rootScope.canswers;
            vm.fields = $rootScope.fields;
            vm.isAdmin = $rootScope.isAdmin || $rootScope.dataAdmin;
            if (vm.isAdmin) vm.bizcat = useraccnt.getBizCat(vm.answer.id);

            $rootScope.isLoggedIn = $rootScope.isLoggedIn ? $rootScope.isLoggedIn : false;
            vm.isLoggedIn = $rootScope.isLoggedIn;

            $rootScope.cansvrows = undefined;

            // ----- SEO tags ----
            $scope.$parent.$parent.$parent.seo = { 
                pageTitle : vm.answer.name, 
                metaDescription: vm.answer.addinfo 
            };

            if (vm.answer.isprivate == undefined) vm.answer.isprivate = false;            

            $rootScope.canswer = vm.answer;
            vm.type = vm.answer.type;
            vm.i = -1;
            if ($rootScope.DISPLAY_XSMALL || $rootScope.DISPLAY_SMALL) numImagesPage = 4;
            if ($rootScope.DISPLAY_MEDIUM) numImagesPage = 6;
            if ($rootScope.DISPLAY_LARGE) numImagesPage = 12;
            getImages();
            //vm.isShortPhrase = vm.type == 'Short-Phrase';
            
            //if there is no category, look for it in cookies
            /*if ($rootScope.cCategory == undefined) {
                var ccategoryid = $cookies.get('ccategory');
                if ($rootScope.DEBUG_MODE) console.log("@answerDetail - ccategory ", ccategoryid);
                var idx = $rootScope.content.map(function (x) { return x.id; }).indexOf(ccategoryid);
                if (idx > -1) $rootScope.cCategory = $rootScope.content[idx];
            }*/

            if ($rootScope.inFavMode) vm.ranking = $rootScope.myfavs.title;
            else if ($rootScope.cCategory) vm.ranking = $rootScope.cCategory.title;
            else vm.ranking = '';

            //if answers not loaded (state went straight to asnwerDetail, answers is just current answer)
            if (answers == undefined) answers = [vm.answer];

            vm.idx = answers.map(function (x) { return x.id; }).indexOf(vm.answer.id) + 1;
            if ($rootScope.cCategory == undefined) vm.idx = 0;

            //Temp for Instagram Demo
            if (vm.answer.id == 2225) vm.igdemo = true;
            else vm.igdemo = false;

            getFields();

            //Set Image Mode -- Map or Photo
            vm.modeIsImage = $rootScope.modeIsImage == undefined ? true : $rootScope.modeIsImage;
            if (vm.answer.location == undefined) vm.modeIsImage = true;

            if ($rootScope.previousState != 'answerDetail') $window.scrollTo(0, 0);

            //vm.showImageGallery = false;
            //$rootScope.$emit('showLogo');

            getHeader();
            //        getCatAnsId(vm.answer.id);
            getEdits(vm.answer.id);
            
            vm.access = false; //use this variable to access editspecials
            if ($rootScope.isLoggedIn) {
                if ($rootScope.user.id == vm.answer.owner) {
                    vm.userIsOwner = true;
                    //dataloader.getDemoData();
                    if (vm.answer.isactive) vm.access = true;
                }
                else vm.userIsOwner = false;
                if ($rootScope.isAdmin) vm.userIsOwner = true;
            }
            else vm.userIsOwner = false;

            $rootScope.userIsOwner = vm.userIsOwner;
            deleteButtonAccess();

            //if (vm.type == 'Establishment') getHours();
            if (vm.type != 'Establishment' && vm.type != 'Event' && false) makeRelativeTable(vm.answer.id);
            if (vm.type == 'Establishment') getSpecials(vm.answer.id);
            //if (vm.type == 'Establishment' || vm.type == 'PersonCust') 
            getVRows(vm.answer.id);
            getAnswerRanks();
            dataloader.pulldata('ranks',vm.answerRanks);                        

            //if user votes are available - do my thing at getAnswerVotes
            //else fetch user votes
            //if ($rootScope.cvotes) {
            //    console.log('exec answer votes, $rootScope.isLoggedIn - ', $rootScope.isLoggedIn);
                
            //}
            //else {
            //    $rootScope.cvotes = [];
            //    $rootScope.ceditvotes = [];
            //}

            //Check if answer is event
            if (vm.type == 'Event') {
                var eventObj = JSON.parse(vm.answer.eventstr);
                //Object.assign(vm.answer, eventObj);
                mergeObject(vm.answer, eventObj);
                vm.ehtml = htmlops.eventHtml(vm.answer);
                vm.estyle = 'background-color:' + vm.answer.bc + ';color:' + vm.answer.fc + ';' + 'white-space:pre;';
            }

            //custom ranks 
            if (vm.answer.hasranks) {
                var n = 0;
                vm.myranks = JSON.parse(vm.answer.ranks);
                if (vm.myranks != undefined && vm.myranks.length > 0){
                    for (var i=0; i<vm.myranks.length; i++){
                        n = $rootScope.customranks.map(function(x) {return x.id; }).indexOf(vm.myranks[i].id);
                        vm.myranks[i].title = $rootScope.customranks[n].title.replace(' @ '+vm.answer.name,'');
                        vm.myranks[i].image = $rootScope.customranks[n].image1url;
                        if (vm.myranks[i].image == undefined || vm.myranks[i].image == '')
                        vm.myranks[i].image = $rootScope.EMPTY_IMAGE;
                    }
                }
           }
            //Demo custom ranks
            else if (vm.userIsOwner){
                vm.myranks = [];
                //Demo custom rank 1
                var demorank = {};
                demorank.id = 11091;
                demorank.bc = '#027fa8';
                demorank.fc = 'white';
                vm.myranks.push(demorank);
                //Demo custom rank 2
                demorank={};
                demorank.id = 11092;
                demorank.bc = '#027fa8';
                demorank.fc = 'white';
                vm.myranks.push(demorank);
                //Demo custom rank 3
                demorank={};
                demorank.id = 11093;
                demorank.bc = '#027fa8';
                demorank.fc = 'white';
                vm.myranks.push(demorank);

                for (var i=0; i<vm.myranks.length; i++){
                    n = $rootScope.customranks.map(function(x) {return x.id; }).indexOf(vm.myranks[i].id);
                    vm.myranks[i].title = $rootScope.customranks[n].title.replace(' @ Demo','');
                    vm.myranks[i].image = $rootScope.customranks[n].image1url;
                    if (vm.myranks[i].image == undefined || vm.myranks[i].image == '')
                    vm.myranks[i].image = $rootScope.EMPTY_IMAGE;
                }
                $rootScope.rankOwner = {};
                $rootScope.rankOwner.name = vm.answer.name;
                $rootScope.rankOwner.slug = vm.answer.slug;
            }
            
            //Determine number of user comments
            if (vm.answer.numcom == undefined) vm.numcom = 0;
            else vm.numcom = vm.vrows.length;

            if (vm.answer.numcom != vm.vrows.length)
                answer.updateAnswer(vm.answer.id, ['numcom'], [vm.numcom]);

            //Determine if necessary to show navigation buttons
            if (vm.ranking) vm.showNextnPrev = true;
            else vm.showNextnPrev = false;

            //Update number of views
            incViews();

            votemodeOFF();

            if ($rootScope.DEBUG_MODE) console.log("Answer details loaded");

            window.prerenderReady = true;
        }

        function getFields() {

            if ($rootScope.fields) return;
            else {
                var fidx = 0;
                switch (vm.answer.type) {
                    case "Place": { fidx = 0; break; }
                    case "Person": { fidx = 1; break; }
                    case "Event": { fidx = 2; break; }
                    case "Organization": { fidx = 3; break; }
                    case "Short-Phrase": { fidx = 4; break; }
                    case "Activity": { fidx = 5; break; }
                    case "Establishment": { fidx = 6; break; }
                    case "Thing": { fidx = 7; break; }
                    case "PersonCust": { fidx = 8; break; }
                    case "Simple": { fidx = 9; break; }
                }

                var fields = $rootScope.typeSchema[fidx].fields;
                $rootScope.fields = fields;
            }

        }

        function getHeader() {
            //vm.public = $rootScope.canswers.public;
            if (vm.answer.owner == undefined || vm.answer.owner == null || vm.answer.owner == 0) {
                vm.answer.hasOwner = false;
            }
            else vm.answer.hasOwner = true;

            vm.bindtxt = '';
            if (vm.type == 'Establishment') vm.bindtxt = 'I represent this business';
            if (vm.type == 'PersonCust') vm.bindtxt = 'I am this person';
            if (vm.type == 'Event') vm.bindtxt = 'I organize this event';

        }

        //AM: Create the relative table of this answer with respect to the other ones.
        function makeRelativeTable(id) {
            //rank.computeRanking(answers,mrecs);
            var PctF = 0;
            var PctC = 0;
            var vsName = "";
            vm.relativetable = [];
            var R = $rootScope.R;
            var GP = $rootScope.GP;
            var answersR = $rootScope.answersR;
            var x = A.indexOf(+id);
            var W = 0;
            var mainField = $rootScope.fields[0].name;
            var isC = false; //main field is country

            for (var n = 0; n < answersR.length; n++) {
                if (A[n] != id) {
                    //W = (GP[x][n] + R[x][n]) / 2;
                    W = R[x][n];

                    switch (mainField) {
                        case "name": { vsName = answersR[n].name; break; }
                        case "nickname": { vsName = answersR[n].nickname; break; }
                        case "country": { vsName = answersR[n].country; isC = true; break; }
                        case "club": { vsName = answersR[n].club; break; }
                    }

                    if (GP[x][n]) {
                        PctF = Math.round((W / GP[x][n]) * 100);
                        PctC = 100 - PctF;
                    }
                    else {
                        PctF = 0;
                        PctC = 0;
                    }
                    vm.relativetable.push({
                        id: answersR[n].id,
                        Rank: answersR[n].Rank,
                        PctF: PctF,
                        vsName: vsName,
                        PctC: PctC,
                        GP: GP[x][n],
                        isC: isC
                    })
                }
            }
        }
        
        //AM: Refresh display when new answer is selected from relative table
        function refresh(x) {
            //$window.scrollTo(0,0);
            updateRecords();
            recordsUpdated = false;
            voteRecordExists = false;


            vm.answer = answers[A.indexOf(+x)];
            $rootScope.canswer = vm.answer;
            getEdits(vm.answer.id);
            upVi = vm.catans.upV;
            downVi = vm.catans.downV;
            getHeader();
            getAnswerRanks();
            getAnswerVotes();
            makeRelativeTable(x);
            getSpecials(vm.answer.id);
            getVRows(vm.answer.id);
        }
        
        //Update Records
        function updateRecords() {

            if ($rootScope.isLoggedIn && answerFound){
            
            //update vote record if necessary
            if ($rootScope.DEBUG_MODE) console.log("UpdateRecords @answerDetail");
            
            //TODO Need to pass table id
            for (var i = 0; i < vm.answerRanks.length; i++) {

                var voteRecordExists = vm.answerRanks[i].voteRecordExists;
                var userHasRank = false;
                var useractivityrec = {};
                //console.log("$rootScope.thisuseractivity - ", $rootScope.thisuseractivity);
                try {
                    var idx = $rootScope.thisuseractivity.map(function (x) { return x.category; }).indexOf(vm.answerRanks[i].id);
                }
                catch (err) {
                    console.log("Error: ", err);
                    console.log("$rootScope.thisuseractivity - ", $rootScope.thisuseractivity);
                    var idx = -1;                    
                }
                if (idx >= 0) {
                    userHasRank = true;
                    useractivityrec = $rootScope.thisuseractivity[idx];
                }
                else userHasRank = false;  
                //if vote is changed to non-zero
                if (voteRecordExists && vm.answerRanks[i].uservote.vote != vm.answerRanks[i].dV && vm.answerRanks[i].dV != 0) {
                    //update vote
                    if ($rootScope.DEBUG_MODE) console.log("UR-1");
                    votes.patchRec(vm.answerRanks[i].uservote.id, vm.answerRanks[i].dV);
                }
                //if vote is changed to zero
                if (voteRecordExists && vm.answerRanks[i].uservote.vote != vm.answerRanks[i].dV && vm.answerRanks[i].dV == 0) {
                    //Delete vote
                    if ($rootScope.DEBUG_MODE) console.log("UR-2");
                    votes.deleteRec(vm.answerRanks[i].uservote.id);
                    //Decrease vote counter from user activity. If counter is 1, also delete user activiy record (since there is no more votes
                    //from this user)
                    if (useractivityrec.votes < 2) {
                        if ($rootScope.DEBUG_MODE) console.log("UR-3");
                        useractivity.deleteRec(useractivityrec.id);
                    }
                    else {
                        if ($rootScope.DEBUG_MODE) console.log("UR-4");
                        useractivity.patchRec(useractivityrec.id, useractivityrec.votes - 1);
                        //$rootScope.userActRec.votes--;
                    }
                }
                if (!voteRecordExists && vm.answerRanks[i].dV != 0) {
                    //Post a new vote and create useractivity record
                    if ($rootScope.DEBUG_MODE) console.log("UR-5");
                    votes.postRec(vm.answerRanks[i].catans, vm.answer.id, vm.answerRanks[i].id, vm.answerRanks[i].dV);
                    if (userHasRank) {
                        if ($rootScope.DEBUG_MODE) console.log("UR-6");
                        useractivity.patchRec(useractivityrec.id, useractivityrec.votes + 1);
                        //$rootScope.userActRec.votes++;
                    }
                    else {
                        if ($rootScope.DEBUG_MODE) console.log("UR-7");
                        useractivity.postRec(vm.answerRanks[i].id);
                        //$rootScope.thisuseractivity.push();
                    }
                }
            
                //update answer record (vote count) if necessary
                //TODO Need to pass table id
                if ((vm.answerRanks[i].upV != vm.answerRanks[i].upVi) || (vm.answerRanks[i].downV != vm.answerRanks[i].downVi)) {
                    if ($rootScope.DEBUG_MODE) console.log("UR-8");
                    //catans.getCatan(vm.answerRanks[i].catans).then(function(catan){
                      //  var updV = vm.answerRanks[i].upV + vm.answerRanks[i].upVi;
                      //  var downdV = vm.answerRanks[i].downV + vm.answerRanks[i].downVi;
                        
                        catans.updateRec(vm.answerRanks[i].catans, ["upV", "downV"], [vm.answerRanks[i].upV, vm.answerRanks[i].downV]);    
                    //})
                    
                }
            }

            if (vm.vrows) {
                for (var i = 0; i < vm.vrows.length; i++) {
                    var voteRecExists = vm.vrows[i].voteExists;
                    if (voteRecExists && vm.vrows[i].dVi != vm.vrows[i].dV) {
                        if ($rootScope.DEBUG_MODE) console.log("UR-9");
                        $rootScope.cvrowvotes[vm.vrows[i].vidx].val = vm.vrows[i].dV;
                        vrowvotes.patchRec(vm.vrows[i].voteid, vm.vrows[i].dV);
                    }
                    if (!voteRecExists && vm.vrows[i].dV != 0) {
                        if ($rootScope.DEBUG_MODE) console.log("UR-10");
                        vrowvotes.postRec(vm.vrows[i].id, vm.vrows[i].dV);
                    }

                    if ((vm.vrows[i].upV != vm.vrows[i].upVi) || (vm.vrows[i].downV != vm.vrows[i].downVi)) {
                        if ($rootScope.DEBUG_MODE) console.log("UR-11");
                        vrows.updateRec(vm.vrows[i].id, ["upV", "downV"], [vm.vrows[i].upV, vm.vrows[i].downV]);
                    }
                }
            }
            recordsUpdated = true;
        }
        }
        
        //AM:Refresh Thumb Up and Thumb down Vote Displays
        
        function getAnswerVotes() {
            //look for user vote for this catans
            for (var i = 0; i < vm.answerRanks.length; i++) {
                vm.answerRanks[i].voteRecordExists = false;

                for (var j = 0; j < $rootScope.cvotes.length; j++) {
                    if ($rootScope.cvotes[j].catans == vm.answerRanks[i].catans) {
                        vm.answerRanks[i].uservote = $rootScope.cvotes[j];
                        vm.answerRanks[i].uservote.ansvidx = i;
                        //ansvidx = i;
                        vm.answerRanks[i].voteRecordExists = true;
                        break;
                    }

                }
                if (vm.answerRanks[i].voteRecordExists) {
                    vm.answerRanks[i].dV = vm.answerRanks[i].uservote.vote;
                    //catansid = uservote.catans;
                }
                else {
                    vm.answerRanks[i].dV = 0;
                    //catansid = x;
                }
                displayVote(vm.answerRanks[i]);
            }

        }

        function getVRowVotes() {
            if ($rootScope.isLoggedIn) {
                for (var i = 0; i < $rootScope.cansvrows.length; i++) {
                    //check votes for display
                    for (var j = 0; j < $rootScope.cvrowvotes.length; j++) {

                        if ($rootScope.cvrowvotes[j].vrow == $rootScope.cansvrows[i].id) {
                            $rootScope.cansvrows[i].voteExists = true;
                            $rootScope.cansvrows[i].dVi = $rootScope.cvrowvotes[j].val;
                            $rootScope.cansvrows[i].dV = $rootScope.cvrowvotes[j].val;
                            $rootScope.cansvrows[i].voteid = $rootScope.cvrowvotes[j].id;
                            $rootScope.cansvrows[i].vidx = j;
                            setVRowVoteImage($rootScope.cansvrows[i], $rootScope.cvrowvotes[j].val);
                        }
                    }
                }
            }
            displayVRows();
        }

        function setVRowVoteImage(obj, val) {
            if (val == 1) {

                obj.upImage = 'thumbs_up_blue_table.png';
                obj.downImage = 'thumbs_down_gray_table.png';
            }
            if (val == 0) {
                obj.dVi = 0;
                obj.dV = 0;
                obj.upImage = 'thumbs_up_gray_table.png';
                obj.downImage = 'thumbs_down_gray_table.png';
            }
            if (val == -1) {
                obj.dVi = -1;
                obj.dV = -1;
                obj.upImage = 'thumbs_up_gray_table.png';
                obj.downImage = 'thumbs_down_blue_table.png';
            }
        }
        //See if there are edits for this answer
        function getEdits(id) {
            vm.numEdits = 0;
            for (var i = 0; i < $rootScope.edits.length; i++) {
                if ($rootScope.edits[i].answer == id) {
                    vm.numEdits++;
                }
            }
        }

        function displayVote(x) {

            if (x.dV == 1) {
                //x.thumbUp = "thumbs_up_blue_table.png";//"thumbs_up_blue.png";//
                //x.thumbDn = "thumbs_down_gray_table.png";//"thumbs_down_gray.png";
                x.thumbUp = '#0070c0';
                x.thumbDn = 'grey';
            }

            if (x.dV == 0) {
                //x.thumbUp = "thumbs_up_gray_table.png";//"thumbs_up_gray.png";
                //x.thumbDn = "thumbs_down_gray_table.png";//"thumbs_down_gray.png";
                x.thumbUp = 'grey';
                x.thumbDn = 'grey';
            }
            if (x.dV == -1) {
                //x.thumbUp = "thumbs_up_gray_table.png";//"thumbs_up_gray.png";
                //x.thumbDn = "thumbs_down_blue_table.png";//"thumbs_down_blue.png";
                x.thumbUp = 'grey';
                x.thumbDn = '#0070c0';
            }
        }
        
        //AM:UpVote
        function UpVote(x) {

            if ($rootScope.isLoggedIn) {

                switch (x.dV) {
                    case -1: { x.dV = 1; x.upV++; x.downV--; break; }
                    case 0: { x.dV = 1; x.upV++; break; }
                    case 1: { x.dV = 0; x.upV--; break; }
                }

                displayVote(x);
                if ($rootScope.DEBUG_MODE) console.log("UpVote");
            }
            else {
                dialog.loginFacebook();
                //dialog.getDialog('notLoggedIn');
                return;
            }

        }
        
        //AM:DownVote
        function DownVote(x) {

            if ($rootScope.isLoggedIn) {
                switch (x.dV) {
                    case -1: { x.dV = 0; x.downV--; break; }
                    case 0: { x.dV = -1; x.downV++; break; }
                    case 1: { x.dV = -1; x.upV--; x.downV++; break; }
                }

                displayVote(x);
                if ($rootScope.DEBUG_MODE) console.log("DownVote");
            }
            else {
                dialog.loginFacebook();
                //dialog.getDialog('notLoggedIn');
                return;
            }

        }

        function goBack() {

            if ($rootScope.DEBUG_MODE) console.log("goBack");       
            
            //update Up and Down votes, and counter
            //if (!recordsUpdated && $rootScope.isLoggedIn) updateRecords();
            
            if ($rootScope.previousState == 'match') {
                $state.go('match');
            }
            else if ($rootScope.inFavMode) {
                $state.go('favs');
            }
            else {
                //var nViews = vm.answer.views + 1;
                //answer.updateAnswer(vm.answer.id, ['views'], [nViews]);
                if ($rootScope.cCategory) {
                    if ($rootScope.cCategory.title.indexOf('@')>-1) $rootScope.isCustomRank = true;
                    $state.go('rankSummary', { index: $rootScope.cCategory.id });
                }
                else //$state.go('cwrapper');
                backToResults();
            }
        }

        function rankSel(x) {
            //console.log(x);
            $rootScope.title = x.title;
            $state.go('rankSummary', { index: x.id });
        }

        function deleteAnswer() {

            console.log("Delete Answer");

            dialog.deleteType(function () {
                //delete catans for this answer
                matchrec.deleteRecordsbyCatans($rootScope.cCategory.id, vm.answer.id);
                catans.deleteRec(vm.answer.id, $rootScope.cCategory.id).then(function () {
                    vm.addctsactive = false;
                    getAnswerRanks();
                    vm.dispRanks--;
                });

            }, function () {
                //delete answer 
                answer.deleteAnswer(vm.answer.id);
                //delete match records of that answer
                matchrec.deleteRecordsbyAnswer(vm.answer.id);
                //delete vote records from that answer
                //votes.deleteVotesbyCatans(vm.answer.id);
                //delete edits for this answer
                edit.deleteEditbyAnswer(vm.answer.id);
                //delete edit votes for this answer
                editvote.deleteEditVotesbyAnswer(vm.answer.id);
                //delete catans for this answer
                catans.deleteAnswer(vm.answer.id);
                //delete vrows for this answer
                vrows.deleteVrowByAnswer(vm.answer.id);
                $state.go("rankSummary", { index: $rootScope.cCategory.id });
            });

        }

        function deleteThisCatans(r) {

            var thisAnswer = vm.answer.name;
            var idx = $rootScope.content.map(function (x) { return x.id; }).indexOf(r.id);
            var thisCategory = $rootScope.content[idx].title;
            dialog.deleteThisCatans(thisAnswer, thisCategory, function () {
                //delete catans for this answer
                matchrec.deleteRecordsbyCatans(r.id, vm.answer.id);
                catans.deleteRec(vm.answer.id, r.id).then(function () {
                    vm.addctsactive = false;
                    getAnswerRanks();
                    vm.dispRanks--;
                });
            });
        }



        function flagAnswer(x) {
            if ($rootScope.isLoggedIn) {
                if ($rootScope.DEBUG_MODE) console.log("Answer Flagged");
                flag.flagAnswer('answer', vm.answer.id, x);
                dialog.getDialog('answerFlagged');
                return;
            }
            else dialog.loginFacebook(); 
            //dialog.getDialog('notLoggedIn');
        }

        function cmFlag(x) {
            if ($rootScope.isLoggedIn) {
                if ($rootScope.DEBUG_MODE) console.log("Answer Comment Flagged");
                flag.flagAnswer('comment-answer', vm.answer.id, x);
                dialog.getDialog('commentFlagged');
                return;
            }
            else dialog.loginFacebook(); 
            //dialog.getDialog('notLoggedIn'); 
        }

        function getAnswerRanks() {
           vm.answerRanks = [];
            var rankObj = {};
            for (var i = 0; i < $rootScope.catansrecs.length; i++) {
                //if ($rootScope.catansrecs[i].answer == vm.answer.id && $rootScope.catansrecs[i].category != $rootScope.cCategory.id) {
                if ($rootScope.catansrecs[i].answer == vm.answer.id) {
                    for (var j = 0; j < $rootScope.content.length; j++) {
                        if ($rootScope.content[j].id == $rootScope.catansrecs[i].category) {
                            //to each rank object attach catans data
                            rankObj = {};
                            rankObj = $rootScope.content[j];
                            rankObj.upV = $rootScope.catansrecs[i].upV;
                            rankObj.downV = $rootScope.catansrecs[i].downV;
                            rankObj.catans = $rootScope.catansrecs[i].id;
                            rankObj.rank = $rootScope.catansrecs[i].rank;
                            rankObj.uservote = {};
                            rankObj.upVi = $rootScope.catansrecs[i].upV;
                            rankObj.downVi = $rootScope.catansrecs[i].downV;

                            if (rankObj.rank == 1) rankObj.icon = "/assets/images/gold.png";
                            else if (rankObj.rank == 2) rankObj.icon = "/assets/images/silver.png";
                            else if (rankObj.rank == 3) rankObj.icon = "/assets/images/bronze.png";
                            else if (rankObj.rank > 3 && rankObj.rank < 11) rankObj.icon = "/assets/images/top10.png";
                            else if (rankObj.rank >= 11 && rankObj.rank < 21) rankObj.icon = "/assets/images/top20.png";
                            else if (rankObj.rank >= 21 && rankObj.rank < 51) rankObj.icon = "/assets/images/top50.png";
                            else if (rankObj.rank >= 51 && rankObj.rank < 101) rankObj.icon = "/assets/images/top100.png";
                            else rankObj.icon = "/assets/images/blank.png";
   
                            //TODO insert rank position out of total list, will be in catans
                            vm.answerRanks.push(rankObj);
                        }
                    }
                }
            }
            //vm.otherRanksExist = vm.otherRanks.length > 0 ? true : false;
            vm.otherRanksExist = true;
            getAnswerVotes();
            //$timeout(function(){
            //    $scope.$apply();
            //});   
            //console.log("vm.answerRanks - ", vm.answerRanks);
        }

        function getSpecials(x) {
            var answerid = 0;
            if (!vm.answer.ispremium && vm.userIsOwner) answerid = 1;
            else answerid = x;
            vm.specialsList = [];
            for (var i = 0; i < $rootScope.specials.length; i++) {
                if ($rootScope.specials[i].answer == answerid) {
                    //format date, load name and html msg
                    vm.specialsList.push($rootScope.specials[i]);
                }
            }
        }

        function showSpecial(x){
            dialog.showSpecial(x);
        }

        function showsimage(x) {
            if (!x.showimage) {
                x.showimage = true;
            }
            else x.showimage = false;
        }

        function getVRows(answerid) {
            var objExists = false;
            var obj = {};
            var callgetVotes = false;

            if ($rootScope.cansvrows == undefined) {
                $rootScope.cansvrows = [];
                callgetVotes = true;
            }
            
            //Load vrows for this answer
            if ($rootScope.cvrows) {
                for (var i = 0; i < $rootScope.cvrows.length; i++) {
                    if ($rootScope.cvrows[i].answer == answerid) {
                        objExists = false;
                        //Check vrow is not already added
                        for (var j=0; j < $rootScope.cansvrows.length; j++){
                            if ($rootScope.cansvrows[j].id == $rootScope.cvrows[i].id)
                                objExists = true;
                        }
                        
                        if (!objExists) {
                            obj = {};
                            obj = $rootScope.cvrows[i];
                            obj.idx = i; //Store object but store index in main local copy
                            obj.voteExists = false;
                            obj.dV = 0;
                            obj.upVi = $rootScope.cvrows[i].upV;
                            obj.downVi = $rootScope.cvrows[i].downV;
                            obj.upImage = 'thumbs_up_gray_table.png';
                            obj.downImage = 'thumbs_down_gray_table.png';
                            obj.delta = obj.upV - obj.downV;
                            if ($rootScope.isLoggedIn){
                                if (obj.user == $rootScope.user.id) vrowsByUserCounter++;
                            }
                            $rootScope.cansvrows.push(obj);
                        }
                    }
                }
                if (callgetVotes) getVRowVotes();
                else (vm.newop = '');
                if (vrowsByUserCounter >= 3 || !$rootScope.isLoggedIn) vm.addvrowbutton = 'disabled';
                //if (!callgetVotes) displayVRows();                
            }
        }

        function displayVRows() {
            vm.vrows = $rootScope.cansvrows;
        }

        function validateNewVrow(){
            vm.maybeRepeatedVrows = [];
            var tags = [];
            var vrowtitle = '';
            var newop = vm.newop;
            var foundMatch = false;
            newop = newop.toLowerCase();
            newop = newop.replace(',',' ');
            newop = newop.replace('!',' ');
            var tagsnewop = newop.split(" ");
            for (var i=0; i < vm.vrows.length ; i++){
                foundMatch = false;
                vrowtitle = vm.vrows[i].title;
                vrowtitle = vrowtitle.toLowerCase();
                vrowtitle = vrowtitle.replace(',',' ');
                vrowtitle = vrowtitle.replace('!',' ');
                tags = vrowtitle.split(" ");
                for (var j=0; j < tags.length; j++){
                    for (var k=0; k < tagsnewop.length; k++){
                        
                        if (tags[j].length > 3 && tagsnewop[k].length > 3 ){
                            //if tags from vrow bigger than opinion
                            if (tags[j].length >= tagsnewop[k].length){
                                if(tags[j].indexOf(tagsnewop[k])>-1){
                                    vm.maybeRepeatedVrows.push(vm.vrows[i]);
                                    foundMatch = true;
                                    break;
                                }
                            }
                            else {
                                if(tagsnewop[k].indexOf(tags[j])>-1){
                                    vm.maybeRepeatedVrows.push(vm.vrows[i]);
                                    foundMatch = true;
                                    break;
                                }
                            }
                        }
                        //if (newop.indexOf(tags[j])>-1)                    
                    }
                    if (foundMatch) break;                    
                }
            }
        }

        function deleteButtonAccess() {
            if ($rootScope.dataAdmin || $rootScope.isAdmin || (vm.userIsOwner && vm.answer.isprivate)) vm.deleteButton = true;
            else vm.deleteButton = false;
        }

        function showUrl() {
            dialog.url(vm.answer.imageurl);
        }

        function closeRank() {
            $state.go('cwrapper');            
        }

        function closeAnswerDetail(){
            goBack();
        }

        function bizRegDialog() {
            dialog.bizRegistration(bizRegistration);
        }

        function bizRegistration() {
            if ($rootScope.isLoggedIn) {
                dialog.bindAccount($rootScope.user.name, vm.answer.name, bindAccount);
            }
            else {
                dialog.getDialog('notLoggedInBiz');
            }
            //$state.go('register');
        }

        function bindAccount() {
            if ($rootScope.DEBUG_MODE) console.log("Bind business to user account");
            answer.updateAnswer(vm.answer.id, ['owner'], [$rootScope.user.id]).then(reloadAnswer);
            var item = {};
            item = vm.answer;
            item.username = $rootScope.user.first_name + ' ' + $rootScope.user.last_name;  
            item.email = $rootScope.user.email;
            useraccnt.adduseraccnt(item).then(function (useracc) {
                //Check if user account has email - if not set warning in navbar
                mailing.newBizCreated({account: useracc, answer: item}).then(function(data){
                    // console.log()
                })
                var hasEmail = false;
                for (var i = 0; i < $rootScope.useraccnts.length; i++) {
                    if ($rootScope.useraccnts[i].email != '') hasEmail = true;
                }
                if (!hasEmail) $rootScope.$emit('showWarning');
                $rootScope.$emit('userAccountsLoaded');
            });
        }

        function reloadAnswer() {
            vm.userIsOwner = true;
            getHeader();
            //$state.go("answerDetail", { index: vm.answer.id }, { reload: true });
        }

        function openSpecials() {
            $state.go('specials');
        }

        function editVRows() {
           // $state.go('editvrows');
        }

        function addRankforAnswer() {
            $state.go('answerRanksManager');
        }

        function getImages() {
            vm.showImageGallery = true;
            if (vm.igdemo) instagram.getImages().then(showImages);
            else {
                $rootScope.blobs = [];
                var urls = vm.answer.ig_image_urls.split(';');

                for (var i = 0; i < urls.length; i++) {
                    if(urls[i] != ''){
                        var myObj = {};
                        myObj.url = urls[i];
                        myObj.type = 'Instagram';
                        $rootScope.blobs.push(myObj);
                    }
                }
                imagelist.getImageList().then(showImages);
            }
        }
        function showImages() {
            var specialImages = [];
            if (vm.specialsList) specialImages = vm.specialsList.map(function(special){ return special.image;});
            $rootScope.blobs = $rootScope.blobs.filter(function(blob){
                if (specialImages.indexOf(blob.url) != -1) {
                    return false;
                } else {
                    return true;
                }
                
            })
            if (vm.igdemo) vm.images = $rootScope.igimages;
            else vm.images = $rootScope.blobs;

            numImages = vm.images.length;
            vm.i = 0;
            imageNav();
            //console.log("@showImages - ", vm.images);
        }

        function imageNav(){
            if ((vm.i + (numImagesPage-1)) <= numImages) vm.e = vm.i+numImagesPage;
            else vm.e = numImages;
            if (numImages <= 4) { vm.showFwd = false; vm.showRev = false; }
            else {
                if (vm.i == 0) vm.showRev = false;
                else vm.showRev = true;
                if (vm.e == vm.images.length-1) vm.showFwd = false;
                else vm.showFwd = true;
            }
            if (vm.e >= (numImages-1)) vm.showFwd = false;    
        }

        function moreImagesFwd(){
            if (vm.showFwd){
                vm.i = vm.i+numImagesPage;
                imageNav();
            }
        }

        function moreImagesRev(){
            if (vm.showRev){
                vm.i = vm.i-numImagesPage;
                imageNav();
            }
        }

        /*
        function showMap(){
          google.maps.event.addDomListener(window, "load", initMap);

        }
        var map = {};
        function initMap(){
            var latlng = new google.maps.LatLng(-34.397, 150.644);
            var myOptions = {
                zoom: 8,
                center: latlng,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            map = new google.maps.Map(document.getElementById("map-canvas"),myOptions);
        }*/

        function gotoRank(x) {
            //var nViews = vm.answer.views + 1;
            //answer.updateAnswer(vm.answer.id, ['views'], [nViews]);
            $state.go('rankSummary', { index: x.slug });
        }

        function gotoCustomRank(x) {
            //var nViews = vm.answer.views + 1;
            //answer.updateAnswer(vm.answer.id, ['views'], [nViews]);
            $rootScope.oCategory = $rootScope.cCategory;
            $rootScope.oAnswer = vm.answer;
            $rootScope.isCustomRank = true;
            $state.go('rankSummary', { index: x.id });
        }

        function goPrev() {
            var L = answers.length;
            var i = answers.map(function (x) { return x.id; }).indexOf(vm.answer.id);
            var ni = i - 1; //next index
            if (ni < 0) ni = L - 1; //if less than zero wrap to last
            //var nViews = vm.answer.views + 1;
            //answer.updateAnswer(vm.answer.id, ['views'], [nViews]);
            if ($rootScope.isLoggedIn) updateRecords();
            $state.go('answerDetail', { index: answers[ni].id });
        }

        function goNext() {
            var L = answers.length;
            var i = answers.map(function (x) { return x.id; }).indexOf(vm.answer.id);
            var ni = i + 1; //next index
            if (ni > L - 1) ni = 0; //if less than zero wrap to last
            //var nViews = vm.answer.views + 1;
            //answer.updateAnswer(vm.answer.id, ['views'], [nViews]);
            if ($rootScope.isLoggedIn) updateRecords();
            $state.go('answerDetail', { index: answers[ni].id });
        }

        function vrowVoteUp(x) {

            if ($rootScope.isLoggedIn) {

                switch (x.dV) {
                    case -1: { x.dV = 1; x.upV++; x.downV--; break; }
                    case 0: { x.dV = 1; x.upV++; break; }
                    case 1: { x.dV = 0; x.upV--; break; }
                }
                x.delta = x.upV - x.downV;
                displayVRowVote(x);
                if ($rootScope.DEBUG_MODE) console.log("VRow UpVote");
            }
            else {
                dialog.loginFacebook();
                //dialog.getDialog('notLoggedIn');
                return;
            }
            //console.log("vm.answerRanks ---", vm.answerRanks);
        }        
        //AM:DownVote
        function vrowVoteDown(x) {

            if ($rootScope.isLoggedIn) {
                switch (x.dV) {
                    case -1: { x.dV = 0; x.downV--; break; }
                    case 0: { x.dV = -1; x.downV++; break; }
                    case 1: { x.dV = -1; x.upV--; x.downV++; break; }
                }
                x.delta = x.upV - x.downV;
                displayVRowVote(x);
                if ($rootScope.DEBUG_MODE) console.log("DownVote");
            }
            else {
                dialog.loginFacebook();
                //dialog.getDialog('notLoggedIn');
                return;
            }
            //console.log("vm.answerRanks ---", vm.answerRanks);
        }

        function displayVRowVote(x) {

            if (x.dV == 1) {
                x.upImage = "thumbs_up_blue_table.png";
                x.downImage = "thumbs_down_gray_table.png";
            }

            if (x.dV == 0) {
                x.upImage = "thumbs_up_gray_table.png";
                x.downImage = "thumbs_down_gray_table.png";
            }
            if (x.dV == -1) {
                x.upImage = "thumbs_up_gray_table.png";
                x.downImage = "thumbs_down_blue_table.png";
            }
        }

        function loadComments() {
            commentops.loadComments('answer', cObj)
            .then(function(){

                $q.all(cObj.comments.map(function(comment){ return fbusers.getFBUserById(comment.user); }))
                .then(function (fbUsers){
                    for (var i = 0; i < cObj.comments.length; i++) {
                        cObj.comments[i].picture = fbUsers[i] ? fbUsers[i].picture.data.url : null;
                    }
                });
                
            })
        }
        
        function postComment() {
            commentops.postComment('answer', cObj);
        }

        function mergeObject(x, y) {
            x.bc = y.bc;
            x.fc = y.fc;
            x.freq = y.freq;
            x.edate = y.edate;
            x.sdate = y.sdate;
            x.etime = y.etime;
            x.etime2 = y.etime2;
            x.stime = y.stime;
            x.stime2 = y.stime2;
            x.mon = y.mon;
            x.tue = y.tue;
            x.wed = y.wed;
            x.thu = y.thu;
            x.fri = y.fri;
            x.sat = y.sat;
            x.sun = y.sun;
        }

        function selectPhoto(x) {
            dialog.seePhotos(vm.images, x, vm.answer, vm.userIsOwner);
        }

        function addcts(x) {
            var title = '';
            var rank = -1;
            var rFound = false;
            var cat = -1;
            var nh = -1;
            title = vm.addctsval;

            for (var i=0; i<$rootScope.content.length; i++){
                if ($rootScope.content[i].title == title){
                    rFound = true;
                    rank = $rootScope.content[i].id;
                    break;
                }
            }
            console.log("could not find - ", title);
            if (rFound) {
                console.log('rank found, posting record');
                catans.postRec2(vm.answer.id, rank).then(function () {
                    vm.addctsactive = false;
                    getAnswerRanks();
                    vm.dispRanks++;
                });
            }
            //Rank not found, determine category and create ghost
            else {
                //find string to look in category
                console.log('rank not found, will create ghost');
                if (title.indexOf(vm.answer.cityarea) > -1) {
                    title = title.replace(vm.answer.cityarea, '@Nh');
                    console.log('category title - ', title);
                }

                for (var i=0; i< $rootScope.categories.length; i++) {
                    if ($rootScope.categories[i].category == title) {
                        cat = $rootScope.categories[i].id;
                        break;
                    }
                }

                for (var i=0; i< $rootScope.locations.length; i++) {
                    if ($rootScope.locations[i].nh_name == vm.answer.cityarea) {
                        nh = $rootScope.locations[i].id;
                        break;
                    }
                }
                
                if (cat > -1 && nh > -1) {
                    var obj = {};
                    obj.cat = cat;
                    obj.nh = nh;
                    obj.isatomic = true;
                    table.addTable(obj).then(function (tableid) {
                        catans.postRec2(vm.answer.id, tableid).then(function () {
                            vm.addctsactive = false;
                            getAnswerRanks();
                            vm.dispRanks++;
                        })
                    })
                }
                else console.log('Error creating ghost rank, cat, nh ', cat, nh);
            }           
        }

        function addCatans(x) {
            vm.addctsopts = [];
            var opt = '';
            for (var i = 0; i < $rootScope.ctsOptions.length; i++) {
                if ($rootScope.ctsOptions[i].indexOf('@Nh') > -1) {
                    opt = $rootScope.ctsOptions[i].replace('@Nh', vm.answer.cityarea);
                    vm.addctsopts.push(opt);
                }
                else vm.addctsopts.push($rootScope.ctsOptions[i]);
            }
            vm.addctsactive = true;
        }

        function votemodeON(){
            vm.votemode = true;
            vm.voteonstyle = "background-color:#3277b3;color:#e6e6e6";
            vm.voteoffstyle = "background-color:#e6e6e6;color:black";
            //if ($rootScope.endorseDialogShown == undefined) endorseDialog();
            
        }
        function votemodeOFF(){
            vm.votemode = false;
            vm.voteoffstyle = "background-color:#3277b3;color:#e6e6e6";
            vm.voteonstyle = "background-color:#e6e6e6;color:black";
        }

        function endorseDialog(){
            dialog.endorse(vm.type);
            $rootScope.endorseDialogShown = true;
        }

        function addvrow(){
            if (vrowsByUserCounter < 3 && $rootScope.isLoggedIn){
                validateNewVrow();
                if (vm.maybeRepeatedVrows.length > 0 ) 
                    dialog.maybeRepeatVrows(vm.newop, vm.maybeRepeatedVrows, addvrowexec);
                else
                    addvrowexec();
            }
            else if (!$rootScope.isLoggedIn) dialog.loginFacebook();
            else dialog.getDialog('opinionsLimit'); 
                           
        }
        function addvrowexec(){
            vrows.postRec(vm.newop).then(function(){
                    getVRows($rootScope.canswer.id);
             });
        }



        function selectInstagramImages(){
            if(InstagramService.access_token() == null) {
                InstagramService.login();
            }
            else {
                InstagramService.getMyRecentImages()
                .then(function(data){
                    dialog.chooseImgFromIgDlg(data, vm.answer, vm.userIsOwner, vm.navigateTowards);
                })
                .catch(function(err){
                    console.log(err);
                });
            }
            $rootScope.$on("instagramLoggedIn", function (evt, args) {
                InstagramService.getMyRecentImages()
                .then(function(data){
                    dialog.chooseImgFromIgDlg(data, vm.answer, vm.userIsOwner, vm.navigateTowards);
                }).catch(function(err){
                    console.log(err);
                });
            });
        }

        function navigateTowards(direction) {
            if(direction == 'next') {
                InstagramService.getNextPage()
                .then(function(data){
                    dialog.chooseImgFromIgDlg(data, vm.answer, vm.userIsOwner, vm.navigateTowards);
                })
                .catch(function(err){
                    console.log(err);
                });
            } else if (direction == 'previous') {
                InstagramService.getPreviousPage()
                .then(function(data){
                    dialog.chooseImgFromIgDlg(data, vm.answer, vm.userIsOwner, vm.navigateTowards);
                })
                .catch(function(err){
                    console.log(err);
                });    
            }
            
        }

        function showRanks(){
            if (vm.dispRanks <= 3) vm.dispRanks = vm.answerRanks.length;
            else vm.dispRanks = 3; 
        }

        function hideCustomRanks(){
            vm.hideCustomRanksMsg = true;
            $rootScope.hideCustomRankMsg = true;
        }
        function hideGetPremium(){
            vm.hideGetPremiumMsg = true;
            $rootScope.hideGetPremiumMsg = true;
        }

        function gotoMyBusiness(){
            $state.go('mybusiness');
        }

        function showLocations(){
            var locsIdx = vm.answer.family.split(':').map(Number);
            var locs = [];
            var idx = 0;
            for (var i=0; i<locsIdx.length; i++){
                idx = $rootScope.answers.map(function(x) {return x.id; }).indexOf(locsIdx[i]);
                if (idx > -1) locs.push($rootScope.answers[idx]);  
            }

            dialog.showLocations(locs);
        }

        function backToResults(){
            updateRecords();
            if ($rootScope.previousState == 'trends') $state.go('trends');
            else $rootScope.$emit('backToResults');
        }

        function share(){
            //vm.linkurl = 'https://rank-x.com/answerDetail/' + vm.answer.slug;
            vm.linkurl = SERVER_URL + 'answer' + vm.answer.id + '.html';
            vm.tweet = vm.answer.name + ', endorse your favorite ones at: ';

            var imageurl = vm.answer.imageurl;

            dialog.shareOptions(shareFunction, vm.isMobile, vm.linkurl, 'Rank-X, '+ vm.answer.name +  '\n' + imageurl, $scope);
        }
        
        function shareFunction(x){
            
            var imageurl = vm.answer.imageurl;
            switch(x){
                case 'twitter':{
                    if ($rootScope.DEBUG_MODE) console.log(x);
                    Socialshare.share({
                        'provider': 'twitter',
                        'attrs': {
                            'socialshareUrl': vm.linkurl,
                            'socialshareText': vm.tweet,
                            'socialshareHashtags': 'rankxsandiego'
                        }
                    }); 
                    break;
                }
                case 'facebook':{
                    if ($rootScope.DEBUG_MODE) console.log(x);
                    FB.ui(
                    {
                        method: 'feed',
                        link: vm.linkurl,
                        caption: 'Rank-X San Diego',
                    }); 
                    break;
                }  
                case 'email':{
                    if ($rootScope.DEBUG_MODE) console.log(x);
                    Socialshare.share({
                        'provider': 'email',
                        'attrs': {
                            'socialshareSubject': 'Rank-X, '+vm.answer.name,
                            'socialshareBody': vm.linkurl
                        }
                    }); 
                    break;
                }
                case 'gplus':{
                    if ($rootScope.DEBUG_MODE) console.log(x);
                    Socialshare.share({
                        'provider': 'google',
                        'attrs': {
                            'socialshareUrl': vm.linkurl,
                            'socialshareText': vm.answer.name,
                            'socialshareMedia': imageurl                                
                        }
                    }); 
                    break;
                }
                case 'pinterest':{
                    if ($rootScope.DEBUG_MODE) console.log(x);
                    Socialshare.share({
                        'provider': 'pinterest',
                        'attrs': {
                            'socialshareUrl': vm.linkurl,
                            'socialshareText': 'Rank-X, '+ vm.answer.name,
                            'socialshareMedia': imageurl                                
                        }
                    }); 
                    break;
                }
                                    
                case 'tumblr':{
                    if ($rootScope.DEBUG_MODE) console.log(x);
                    Socialshare.share({
                        'provider': 'tumblr',
                        'attrs': {
                            'socialshareUrl': vm.linkurl,
                            'socialshareText': 'Rank-X, '+ vm.answer.name,
                            'socialshareMedia': imageurl                                
                        }
                    }); 
                    break;
                }
                case 'reddit':{
                    if ($rootScope.DEBUG_MODE) console.log(x);
                    Socialshare.share({
                        'provider': 'reddit',
                        'attrs': {
                            'socialshareUrl': vm.linkurl,
                            'socialshareText': 'Rank-X, '+ vm.answer.name,
                            'socialshareSubreddit':''                       
                        }
                    }); 
                    break;
                }
                // case 'whatsapp':{
                //     if ($rootScope.DEBUG_MODE) console.log(x);
                //     Socialshare.share({
                //         'provider': 'whatsapp',
                //         'attrs': {
                //             'socialshareUrl': vm.linkurl,
                //             'socialshareText': 'Rank-X, '+ vm.ranking + ', '+ $rootScope.cCategory.question,
                //          }
                //     }); 
                //     break;
                // }
                // case 'messenger':{
                //     if ($rootScope.DEBUG_MODE) console.log(x);
                //     Socialshare.share({
                //         'provider': 'facebook-messenger',
                //         'attrs': {
                //             'socialshareUrl': vm.linkurl,
                //          }
                //     }); 
                //     break;
                // }
                // case 'sms':{
                //     if ($rootScope.DEBUG_MODE) console.log(x);
                //     Socialshare.share({
                //         'provider': 'sms',
                //         'attrs': {
                //             'socialshareUrl': vm.linkurl,
                //             'socialshareText': 'Rank-X, '+ vm.ranking + ', '+ $rootScope.cCategory.question,
                //          }
                //     }); 
                //     break;
                // }
            } 
        }

        function incViews(){
            var nViews = vm.answer.views++;
            //increment number of views of this answer - request to server
            var url = SERVER_URL + 'databaseOps/incViews/answer/' + vm.answer.id;
            var req = {
                method: 'POST',
                url: url,
                headers: {
                    'X-Dreamfactory-API-Key': undefined,
                    'X-DreamFactory-Session-Token': undefined
                }
            }
            $http(req);
        }
    }
})();
