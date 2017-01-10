(function () {
    'use strict';

    angular
        .module('app')
        .controller('answerDetail', answerDetail);

    answerDetail.$inject = ['flag', '$stateParams', '$state', 'answer', 'dialog', '$rootScope','$window', 'useractivity','htmlops',
        'votes', 'matchrec', 'edit', 'editvote', 'catans', 'datetime','commentops', 'userdata','useraccnt',
        '$location', 'vrows', 'vrowvotes','imagelist']; //AM:added user service

    function answerDetail(flag, $stateParams, $state, answer, dialog, $rootScope, $window, useractivity,htmlops,
        votes, matchrec, edit, editvote, catans, datetime, commentops, userdata,useraccnt,
        $location, vrows, vrowvotes, imagelist) { //AM:added user service
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'answerDetail';
        vm.ranking = $rootScope.title;
        
        var voteRecordExists = false;
        var dV = 0;
        var upVi = 0;  //upVotes initial value
        var downVi = 0; //downVotes initial value
        var answers = $rootScope.canswers;
        var recordsUpdated = false;
        vm.numEdits = 0;
        
        // Members
        vm.relativetable = [];
        vm.catans = [];
        vm.sm = false;
               
        // Methods
        vm.UpVote = UpVote;
        vm.DownVote = DownVote;
        vm.refresh = refresh;
        vm.goBack = goBack;
        vm.goPrev = goPrev;
        vm.goNext = goNext;
        vm.editAnswer = editAnswer;
        vm.deleteAnswer = deleteAnswer;
        vm.flagAnswer = flagAnswer;
        vm.deleteButton = 'none';
        vm.showUrl = showUrl;
        vm.closeRank = closeRank;
        vm.rankSel = rankSel;
        vm.bizRegDialog = bizRegDialog;
        vm.openSpecials = openSpecials;
        vm.editVRows = editVRows;
        vm.getImages = getImages;
        vm.showsimage = showsimage;
        vm.gotoRank = gotoRank;
        vm.showcomplete = showcomplete;
        vm.vrowVoteUp = vrowVoteUp;
        vm.vrowVoteDown = vrowVoteDown;
        vm.loadComments = loadComments;
        vm.postComment = postComment;
        vm.selectPhoto = selectPhoto;
        vm.cmFlag = cmFlag;
        vm.toggleimgmode = toggleimgmode;
        
        vm.fields = $rootScope.fields;
        
        $rootScope.isLoggedIn = $rootScope.isLoggedIn ? $rootScope.isLoggedIn:false;
        vm.isLoggedIn = $rootScope.isLoggedIn;
        
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
        
        //vm.userIsOwner = $rootScope.userIsOwner;
        if ($stateParams.index) {
            var i =  $rootScope.answers.map(function(x) {return x.id; }).indexOf(+$stateParams.index);
            vm.answer = $rootScope.answers[i];
        }
        $rootScope.canswer = vm.answer;
        vm.type = vm.answer.type;
        
        if ($rootScope.cCategory) vm.title = $rootScope.cCategory.title;
        else {
            vm.title = '';
            answers = [vm.answer];
        }
 
        vm.idx = answers.map(function(x) {return x.id; }).indexOf(vm.answer.id)+1;
        
        vm.isMobile = false; 
        // device detection
        if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
            || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) 
            vm.isMobile = true;
    
        //Adjust picture size for very small displays
        if ($window.innerWidth < 512) {
            vm.mxheight = '250';
            vm.sp1 = 'width:5%;padding:0px;';
            vm.sp2 = 'width:25%;max-height:50px';
            vm.sp3 = 'width:20%';
            vm.sm = true; vm.nsm = false;
            vm.width = Math.round($window.innerWidth*0.9);
            //console.log('screen is small');
        }
        else {
            vm.mxheight = '300';
            vm.sp1 = 'width:15%';
            vm.sp2 = 'width:22.5%;max-height:50px;';
            vm.sp3 = 'width:20%';
            vm.sm = false; vm.nsm = true;
            vm.width = Math.round($window.innerWidth*0.9);
            //console.log('screen is big');
        }
        
        //TODO: Would like to add this abstract template, but dont know how               
            $rootScope.$on('$stateChangeSuccess', function (ev, to, toParams, from, fromParams) {
                $rootScope.previousState = from.name;
            });
            $rootScope.$on('$stateChangeStart',
                function (ev, to, toParams, from, fromParams) {
                    if (from.name == 'answerDetail' && to.name != 'answerDetail' ) {
                         if (!recordsUpdated && $rootScope.isLoggedIn) updateRecords();
                    }
                });

            $rootScope.$on('refreshImages', function () {
                if ($state.current.name == 'answerDetail') getImages();
            });
            $rootScope.$on('fileUploaded', function () {
                if ($state.current.name == 'answerDetail') getImages();
            });
        
        activate();
        
        function activate() {
            
            getFields();
            
            //Set Image Mode -- Map or Photo
            vm.modeIsImage = $rootScope.modeIsImage == undefined ? true : $rootScope.modeIsImage;
            if (vm.answer.location == undefined) vm.modeIsImage = true; 
            
            if (vm.modeIsImage) setImage();
            else setMap();
                
            if ($rootScope.previousState != 'answerDetail') $window.scrollTo(0,0);

            vm.showImageGallery = false;
            $rootScope.$emit('showLogo');
            
            getHeader();
    //        getCatAnsId(vm.answer.id);
            getEdits(vm.answer.id);
            deleteButtonAccess();
            if (vm.type == 'Establishment') getHours();
            if (vm.type != 'Establishment' && vm.type != 'Event' && false) makeRelativeTable(vm.answer.id);
            if (vm.type == 'Establishment') getSpecials(vm.answer.id);
            if (vm.type == 'Establishment' || vm.type == 'PersonCust') getVRows(vm.answer.id);
            getAnswerRanks();
            //if user votes are available - do my thing at getAnswerVotes
            //else fetch user votes
            if ($rootScope.cvotes) getAnswerVotes();
            else {
                 $rootScope.cvotes = [];
                 $rootScope.ceditvotes = [];
            }
            
            if (vm.type == 'Event'){
                var eventObj = JSON.parse(vm.answer.eventstr);
                //Object.assign(vm.answer, eventObj);
                mergeObject(vm.answer,eventObj);
                vm.ehtml = htmlops.eventHtml(vm.answer,vm.sm);
                vm.estyle = 'background-color:' + vm.answer.bc + ';color:' + vm.answer.fc + ';'+'white-space:pre;';
            }

            vm.access = false; //use this variable to access editspecials
            if ($rootScope.isLoggedIn){
                if ($rootScope.user.id == vm.answer.owner) {
                    vm.userIsOwner = true;
                    if (vm.answer.isactive) vm.access = true;
                }
                else vm.userIsOwner = false;
            }
            else vm.userIsOwner = false;            

            $rootScope.userIsOwner = vm.userIsOwner;
            
            //Determine number of user comments
            if (vm.answer.numcom == undefined) vm.numcom = 0;
            else vm.numcom = vm.answer.numcom;
            
            if (answers.length > 1) vm.showNextnPrev = true;
            else vm.showNextnPrev = false;
            
            //Update number of views
            var nViews = vm.answer.views + 1;
            answer.updateAnswer(vm.answer.id, ['views'], [nViews]);
            
            if ($rootScope.DEBUG_MODE) console.log("Answer details loaded");
          
        }
        
        function getFields(){
            
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
            
            if (vm.answer.addinfo != undefined){
                vm.answer.addinfo_teaser = vm.answer.addinfo.slice(0,300);
                //console.log("addinfo_teaser - ", vm.answer.addinfo_teaser);
                vm.answer.addinfo_complete = vm.answer.addinfo.slice(300);
                //console.log("addinfo_complete - ", vm.answer.addinfo_complete);
            }
            
            vm.bindtxt = '';
            if (vm.type == 'Establishment') vm.bindtxt = 'I represent this business';
            if (vm.type == 'PersonCust') vm.bindtxt = 'I am this person';
            if (vm.type == 'Event') vm.bindtxt = 'I organize this event';
            
            vm.moretext = ' more ';
            vm.completeinfo = false;
        }
        
        function showcomplete(){
            if (vm.moretext == ' more ') {
                vm.moretext = ' less ';
                vm.completeinfo = true;
                return;
            }
            if (vm.moretext == ' less ') {
                vm.moretext = ' more ';
                vm.completeinfo = false;
                return;
            }         
        }
     
        function getHours(){
            vm.hrset = false;
            if (vm.answer.strhours != undefined && vm.answer.strhours != null){
                vm.hrset = true;
                var cdate = new Date();
                var dayOfWeek = cdate.getDay();
                var idx = dayOfWeek - 1;
                if (idx < 0) idx = 6;
                
                var openhours = JSON.parse(vm.answer.strhours);
                if (openhours[idx].opn == 'CLOSED'){
                    vm.hourstr = 'Closed today';
                }
                else{
                    vm.hourstr = 'Open today from: '+ openhours[idx].st + ' to '+ openhours[idx].ct;
                }
            }
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
            getAnswerRanks();
        }
        
        //Update Records
        function updateRecords() {
            
            //update vote record if necessary
             if ($rootScope.DEBUG_MODE) console.log("UpdateRecords @answerDetail");
            
            //TODO Need to pass table id
            for (var i=0; i<vm.answerRanks.length; i++){
                
                var voteRecordExists = vm.answerRanks[i].voteRecordExists;
                var userHasRank = false;
                var useractivityrec = {};
                var idx = $rootScope.thisuseractivity.map(function(x) {return x.category; }).indexOf(vm.answerRanks[i].id); 
                if (idx >= 0) {
                    userHasRank = true; 
                    useractivityrec = $rootScope.thisuseractivity[idx];
                }
                else userHasRank = false;  
                //if vote is changed to non-zero
                if (voteRecordExists && vm.answerRanks[i].uservote.vote != vm.answerRanks[i].dV && vm.answerRanks[i].dV != 0 ) {
                    //update vote
                    if ($rootScope.DEBUG_MODE) console.log("UR-1");
                    votes.patchRec(vm.answerRanks[i].uservote.id, vm.answerRanks[i].dV);
                }
                //if vote is changed to zero
                if (voteRecordExists && vm.answerRanks[i].uservote.vote != vm.answerRanks[i].dV && vm.answerRanks[i].dV == 0 ) {
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
                        useractivity.patchRec(useractivityrec.id, useractivityrec.votes-1);
                        //$rootScope.userActRec.votes--;
                    }                    
                }
                if (!voteRecordExists && vm.answerRanks[i].dV != 0) {
                    //Post a new vote and create useractivity record
                    if ($rootScope.DEBUG_MODE) console.log("UR-5");
                    votes.postRec(vm.answerRanks[i].catans, vm.answer.id, vm.answerRanks[i].id, vm.answerRanks[i].dV);
                    if (userHasRank) {
                        if ($rootScope.DEBUG_MODE) console.log("UR-6");
                        useractivity.patchRec(useractivityrec.id, useractivityrec.votes+1);
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
                    catans.updateRec(vm.answerRanks[i].catans, ["upV", "downV"], [vm.answerRanks[i].upV, vm.answerRanks[i].downV]);
                }
            }
           
            if (vm.type == 'Establishment' || vm.type == 'PersonCust' ) {
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
        
        function getVRowVotes(){
            if ($rootScope.isLoggedIn) {
                for (var i = 0; i < $rootScope.cansvrows.length; i++) {
                    //check votes for display
                    for (var j=0; j < $rootScope.cvrowvotes.length; j++){
                        
                        if ($rootScope.cvrowvotes[j].vrow == $rootScope.cansvrows[i].id){
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
                x.thumbUp = "thumbs_up_blue.png";
                x.thumbDn = "thumbs_down_gray.png";
            }

            if (x.dV == 0) {
                x.thumbUp = "thumbs_up_gray.png";
                x.thumbDn = "thumbs_down_gray.png";
            }
            if (x.dV == -1) {
                x.thumbUp = "thumbs_up_gray.png";
                x.thumbDn = "thumbs_down_blue.png";
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
            else {
                //var nViews = vm.answer.views + 1;
                //answer.updateAnswer(vm.answer.id, ['views'], [nViews]);
                if ($rootScope.cCategory) $state.go('rankSummary', { index: $rootScope.cCategory.id });
                else $state.go('cwrapper');
            }
        }

        function rankSel(x) {
            //console.log(x);
            $rootScope.title = x.title;
            $state.go('rankSummary', { index: x.id });
        }


        function editAnswer() {
            if ($rootScope.isLoggedIn) {
                if (vm.answer.type == 'Event') {
                    $rootScope.eventmode = 'edit';
                    $state.go("addEvent", { index: vm.answer.id });
                }
                else $state.go("editAnswer", { index: vm.answer.id });
            }
            else dialog.loginFacebook(); 
            //dialog.getDialog('notLoggedIn');           
        }

        function deleteAnswer() {

            dialog.deleteType(function () {
                //delete catans for this answer
                matchrec.deleteRecordsbyCatans($rootScope.cCategory.id, vm.answer.id);
                catans.deleteRec(vm.answer.id, $rootScope.cCategory.id).then(function () {
                    $state.go("rankSummary", { index: $rootScope.cCategory.id });
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

        function flagAnswer(x) {
            if ($rootScope.isLoggedIn) {
                if ($rootScope.DEBUG_MODE) console.log("Answer Flagged");
                flag.flagAnswer('answer',vm.answer.id, x);
                dialog.getDialog('answerFlagged');
                return;
            }
            else dialog.loginFacebook(); 
            //dialog.getDialog('notLoggedIn');
        }
        
        function cmFlag(x){
            if ($rootScope.isLoggedIn) {
                if ($rootScope.DEBUG_MODE) console.log("Answer Comment Flagged");
                flag.flagAnswer('comment-answer',vm.answer.id, x);
                dialog.getDialog('commentFlagged');
                return;
            }
            else dialog.loginFacebook(); 
            //dialog.getDialog('notLoggedIn'); 
        }

        function getAnswerRanks() {
            
            vm.answerRanks = [];
            for (var i = 0; i < $rootScope.catansrecs.length; i++) {
                //if ($rootScope.catansrecs[i].answer == vm.answer.id && $rootScope.catansrecs[i].category != $rootScope.cCategory.id) {
                if ($rootScope.catansrecs[i].answer == vm.answer.id) {
                    for (var j = 0; j < $rootScope.content.length; j++) {
                        if ($rootScope.content[j].id == $rootScope.catansrecs[i].category) {
                            //to each rank object attach catans data
                            var rankObj = $rootScope.content[j];
                            rankObj.upV = $rootScope.catansrecs[i].upV;
                            rankObj.downV = $rootScope.catansrecs[i].downV;
                            rankObj.catans = $rootScope.catansrecs[i].id;
                            rankObj.rank = $rootScope.catansrecs[i].rank;
                            rankObj.uservote = {};
                            rankObj.upVi = $rootScope.catansrecs[i].upV;
                            rankObj.downVi = $rootScope.catansrecs[i].downV;
   
                            //TODO insert rank position out of total list, will be in catans
                            vm.answerRanks.push(rankObj);
                        }
                    }
                }
            }
            //vm.otherRanksExist = vm.otherRanks.length > 0 ? true : false;
            vm.otherRanksExist = true;            
        }

        function getSpecials(answerid) {
            vm.specialsList = [];
            for (var i = 0; i < $rootScope.specials.length; i++) {
                if ($rootScope.specials[i].answer == answerid) {
                    //format date, load name and html msg
                    datetime.formatdatetime($rootScope.specials[i]);
                    $rootScope.specials[i].name = vm.answer.name;

                    var htmlmsg = htmlops.specialHtml($rootScope.specials[i],vm.sm);
                    $rootScope.specials[i].html = htmlmsg;
                    //Separate style (not working with ng-bind-html)
                    var spStyle = 'background-color:' + $rootScope.specials[i].bc + ';color:' + $rootScope.specials[i].fc + ';' +
                        'white-space:pre;';
                    $rootScope.specials[i].style = spStyle;
                    if ($rootScope.specials[i].image != undefined && 
                        $rootScope.specials[i].image != '../../../assets/images/noimage.jpg'){
                            $rootScope.specials[i].hasimage = true;
                        }
                        else $rootScope.specials[i].hasimage = false;
                    vm.specialsList.push($rootScope.specials[i]);
                }
            }
        }
        
        function showsimage(x){
            if (!x.showimage){
                x.showimage = true;
            }
            else x.showimage = false;
        }

        function getVRows(answerid) {
            $rootScope.cansvrows = [];
            //Load vrows for this answer           
            for (var i = 0; i < $rootScope.cvrows.length; i++) {
                if ($rootScope.cvrows[i].answer == answerid) {
                    var obj = $rootScope.cvrows[i];
                    obj.idx = i; //Store object but store index in main local copy
                    obj.voteExists = false;
                    obj.dV = 0;
                    obj.upVi = $rootScope.cvrows[i].upV;
                    obj.downVi = $rootScope.cvrows[i].downV;
                    obj.upImage = 'thumbs_up_gray_table.png';
                    obj.downImage = 'thumbs_down_gray_table.png';
                    $rootScope.cansvrows.push(obj);
                }
            }
            getVRowVotes();
            
        }

        function displayVRows() {

            vm.vrows = [];
            function compare(a, b) {
                return a.gnum - b.gnum;
            }
            if ($rootScope.cansvrows.length > 0) {
                vm.vrows = $rootScope.cansvrows.sort(compare);
                vm.vrows[0].shdr = true;
                for (var i = 1; i < vm.vrows.length; i++) {
                    if (vm.vrows[i].gnum == vm.vrows[i - 1].gnum) vm.vrows[i].shdr = false;
                    else vm.vrows[i].shdr = true;
                }
                vm.vrows[vm.vrows.length - 1].saddr = true;
                for (var i = 0; i < vm.vrows.length - 1; i++) {
                    if (vm.vrows[i].gnum != vm.vrows[i + 1].gnum) vm.vrows[i].saddr = true;
                    else vm.vrows[i].saddr = false;
                }
                
                vm.vrowgroups = [];
                var vrowgroup = [];
                var tgroup = vm.vrows[0].gnum;
                for (var i=0; i<vm.vrows.length; i++){
                
                    if (tgroup != vm.vrows[i].gnum) {
                        //console.log("vrowgroup --- ", vrowgroup);
                        vm.vrowgroups.push(vrowgroup);
                        vrowgroup = [];
                        vrowgroup.push(vm.vrows[i]);
                        tgroup = vm.vrows[i].gnum;

                    }
                    else {
                        vrowgroup.push(vm.vrows[i]);
                    }
                    //for last element
                    if (i == vm.vrows.length - 1) {
                        vm.vrowgroups.push(vrowgroup);
                    }
                }
                
            }
        }
      
        function deleteButtonAccess() {
            if ($rootScope.isAdmin) vm.deleteButton = 'inline';
            else vm.deleteButton = 'none';
        }

        function showUrl() {
            dialog.url(vm.answer.imageurl);
        }

        function closeRank() {
            //$state.go('cwrapper');
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
            useraccnt.adduseraccnt().then(function(){
                   //Check if user account has email - if not set warning in navbar
                   var hasEmail = false;
                   for(var i=0; i<$rootScope.useraccnts.length; i++){
                       if ($rootScope.useraccnts[i].email != '') hasEmail = true; 
                   }
                   if (!hasEmail) $rootScope.$emit('showWarning');
                });                     
        }
        
        function reloadAnswer(){
            $state.go("answerDetail", { index: vm.answer.id },{reload:true});
        }

        function openSpecials() {          
            $state.go('specials');
        }

        function editVRows() {
            $state.go('editvrows');
        }

        function getImages() {
            imagelist.getImageList().then(showImages);
            vm.showImageGallery = true;
        }
        function showImages(){
            vm.images = $rootScope.blobs;
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
        
        function gotoRank(x){
            //var nViews = vm.answer.views + 1;
            //answer.updateAnswer(vm.answer.id, ['views'], [nViews]);
            $state.go('rankSummary', { index: x.id });
        }
        
        function goPrev(){
            var L = answers.length;
            var i = answers.map(function(x) {return x.id; }).indexOf(vm.answer.id);
            var ni = i-1; //next index
            if (ni < 0) ni = L-1; //if less than zero wrap to last
            //var nViews = vm.answer.views + 1;
            //answer.updateAnswer(vm.answer.id, ['views'], [nViews]);
            if ($rootScope.isLoggedIn) updateRecords();
            $state.go('answerDetail', { index: answers[ni].id });
        }
        
        function goNext(){
            var L = answers.length;
            var i = answers.map(function(x) {return x.id; }).indexOf(vm.answer.id);
            var ni = i+1; //next index
            if (ni > L-1) ni = 0; //if less than zero wrap to last
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
        
         function loadComments(){
            commentops.loadComments('answer', cObj);
        }
        function postComment(){
            commentops.postComment('answer', cObj);
        }
        
        function mergeObject(x,y) {
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
        
        function selectPhoto(x){
            dialog.seePhotos(vm.images,x,vm.answer,vm.userIsOwner);            
        }
        
        function toggleimgmode(){
            if (vm.modeIsImage) setMap();
            else setImage();
        }
        
        function setImage(){
            vm.imgmode = 'Show Map';
            vm.imgmodeicon = 'fa fa-globe'; 
            vm.modeIsImage = true;
            $rootScope.modeIsImage = true;
        }
        
        function setMap(){
            vm.imgmode = 'Show Image';
            vm.imgmodeicon = 'fa fa-picture-o';
            vm.modeIsImage = false;
            $rootScope.modeIsImage = false;
        }
 
    }
})();
