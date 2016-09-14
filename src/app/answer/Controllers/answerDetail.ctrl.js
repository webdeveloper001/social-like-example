(function () {
    'use strict';

    angular
        .module('app')
        .controller('answerDetail', answerDetail);

    answerDetail.$inject = ['flag', '$stateParams', '$state', 'answer', 'dialog', '$rootScope',
        'votes', 'matchrec', 'edit', 'editvote', 'catans', 'datetime', '$location', 'vrows', 'vrowvotes']; //AM:added user service

    function answerDetail(flag, $stateParams, $state, answer, dialog, $rootScope,
        votes, matchrec, edit, editvote, catans, datetime, $location, vrows, vrowvotes) { //AM:added user service
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'answerDetail';
        vm.ranking = $rootScope.title;
        
        var voteRecordExists = false;
        var dV = 0;
        var upVi = 0;  //upVotes initial value
        var downVi = 0; //downVotes initial value
        var A = $rootScope.A;
        var answers = $rootScope.canswers;
        var recordsUpdated = false;
        vm.numEdits = 0;
        
        // Members
        vm.relativetable = [];
        vm.catans = [];
               
        // Methods
        vm.UpVote = UpVote;
        vm.DownVote = DownVote;
        vm.refresh = refresh;
        vm.goBack = goBack;
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
        vm.showImages = showImages;
        vm.gotoRank = gotoRank;
        vm.vrowVoteUp = vrowVoteUp;
        vm.vrowVoteDown = vrowVoteDown;

        vm.fields = $rootScope.fields;
        vm.type = $rootScope.cCategory.type;
        //vm.userIsOwner = $rootScope.userIsOwner;

        if ($stateParams.index) vm.answer = answers[A.indexOf(+$stateParams.index)];
        $rootScope.canswer = vm.answer;
        activate();

        function activate() {

            vm.showImageGallery = false;
            //TODO: Would like to add this abstract template, but dont know how               
            $rootScope.$on('$stateChangeSuccess', function (ev, to, toParams, from, fromParams) {
                $rootScope.previousState = from.name;
            });
            $rootScope.$on('$stateChangeStart',
                function (ev, to, toParams, from, fromParams) {
                    if (from.name == 'answerDetail') {
                        if (!recordsUpdated) updateRecords();
                    }
                });

            getHeader();
    //        getCatAnsId(vm.answer.id);
            getEdits(vm.answer.id);
            deleteButtonAccess();

            makeRelativeTable(vm.answer.id);
            getSpecials(vm.answer.id);
            getVRows(vm.answer.id);
            getAnswerRanks();
            getAnswerVotes();

            if ($rootScope.isLoggedIn){
                if ($rootScope.user.id == vm.answer.owner) {
                    vm.userIsOwner = true;
                }
            }
            else vm.userIsOwner = false;

            $rootScope.userIsOwner = vm.userIsOwner;
            console.log("Answer details loaded");

        }

        function getHeader() {
            vm.public = $rootScope.canswers.public;
            if (vm.answer.owner == undefined || vm.answer.owner == null) {
                vm.answer.hasOwner = false;
            }
            else vm.answer.hasOwner = true;
        }

        function getAnswer() {

            if ($stateParams.index) {
                answer.getAnswer($stateParams.index).then(success, fail);
            }

            function success(result) {

                vm.answer = result;
                //console.log(vm.answer.Name);
            }

            function fail(error) {

                console.log("an error has occurred", error);
            }

        }

        function getAnswerImage() {

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
            //scroll(0,0);
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

            console.log("UpdateRecords @ answerDetail");    
            //update vote record if necessary
            //TODO Need to pass table id
            for (var i=0; i<vm.answerRanks.length; i++){
                var voteRecordExists = vm.answerRanks[i].voteRecordExists;
                if (voteRecordExists && vm.answerRanks[i].uservote.vote != vm.answerRanks[i].dV) {
                //console.log("vote exists and vote is different now", uservote.vote, dV);
                    $rootScope.cvotes[vm.answerRanks[i].uservote.ansvidx].vote = vm.answerRanks[i].dV;
                    votes.patchRec(vm.answerRanks[i].uservote.id, vm.answerRanks[i].dV);
                }
                if (!voteRecordExists && vm.answerRanks[i].dV != 0) {
                    votes.postRec(vm.answerRanks[i].catans, vm.answerRanks[i].dV);
                }
            
                //update answer record (vote count) if necessary
                //TODO Need to pass table id
                if ((vm.answerRanks[i].upV != vm.answerRanks[i].upVi) || (vm.answerRanks[i].downV != vm.answerRanks[i].downVi)) {
                    catans.updateRec(vm.answerRanks[i].catans, ["upV", "downV"], [vm.answerRanks[i].upV, vm.answerRanks[i].downV]);
                }
            }
            
            for (var i=0; i<vm.vrows.length; i++){
                var voteRecExists = vm.vrows[i].voteExists;
                console.log("vm.vrows --- ", vm.vrows);
                if (voteRecExists && vm.vrows[i].dVi != vm.vrows[i].dV) {
                    $rootScope.cvrowvotes[vm.vrows[i].vidx].val = vm.vrows[i].dV;
                    vrowvotes.patchRec(vm.vrows[i].voteid, vm.vrows[i].dV);
                }
                if (!voteRecExists && vm.vrows[i].dV != 0) {
                    vrowvotes.postRec(vm.vrows[i].id, vm.vrows[i].dV);
                }
            
                if ((vm.vrows[i].upV != vm.vrows[i].upVi) || (vm.vrows[i].downV != vm.vrows[i].downVi)) {
                    vrows.updateRec(vm.vrows[i].id, ["upV", "downV"], [vm.vrows[i].upV, vm.vrows[i].downV]);
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
            for (var i = 0; i < $rootScope.cedits.length; i++) {
                if ($rootScope.cedits[i].answer == id) {
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
                console.log("UpVote");
            }
            else {
                dialog.getDialog('notLoggedIn');
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
                console.log("DownVote");
            }
            else {
                dialog.getDialog('notLoggedIn');
                return;
            }
            
        }

        function goBack() {

            console.log("goBack");       
            
            //update Up and Down votes, and counter
            if (!recordsUpdated) updateRecords();

            if ($rootScope.previousState == 'match') {
                $state.go('match');
            }
            else {
                var nViews = vm.answer.views + 1;
                answer.updateAnswer(vm.answer.id, ['views'], [nViews]);
                $state.go('rankSummary', { index: $rootScope.cCategory.id });
            }
        }

        function rankSel(x) {
            //console.log(x);
            $rootScope.title = x.title;
            $state.go('rankSummary', { index: x.id });
        }


        function editAnswer() {
            $state.go("editAnswer", { index: vm.answer.id });
        }

        function deleteAnswer() {

            dialog.deleteType(function () {
                //delete catans for this answer
                catans.deleteRec(vm.answer.id, $rootScope.cCategory.id).then(function () {
                    $state.go("rankSummary", { index: $rootScope.cCategory.id });
                });
            }, function () {
                //delete answer 
                answer.deleteAnswer(vm.answer.id);
                //delete match records of that answer
                matchrec.deleteRecordsbyAnswer(vm.answer.id);
                //delete vote records from that answer
                votes.deleteVotesbyAnswer(vm.answer.id);
                //delete edits for this answer
                edit.deleteEditbyAnswer(vm.answer.id);
                //delete edit votes for this answer
                editvote.deleteEditVotesbyAnswer(vm.answer.id);
                //delete catans for this answer
                catans.deleteAnswer(vm.answer.id);
                $state.go("rankSummary", { index: $rootScope.cCategory.id });
            });

        }

        function flagAnswer(x) {
            if ($rootScope.isLoggedIn) {
                console.log("answer flagged!!!");
                flag.flagAnswer(vm.catans.id, x);
                dialog.getDialog('answerFlagged');
                return;
            }
            else dialog.getDialog('notLoggedIn');
        }

        function getAnswerRanks() {

            vm.answerRanks = [];
            for (var i = 0; i < $rootScope.catansrecs.length; i++) {
                //if ($rootScope.catansrecs[i].answer == vm.answer.id && $rootScope.catansrecs[i].category != $rootScope.cCategory.id) {
                if ($rootScope.catansrecs[i].answer == vm.answer.id) {
                    //console.log("catansrec ---,",$rootScope.catansrecs[i]);
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

                    var htmlmsg = specialHtml($rootScope.specials[i]);
                    $rootScope.specials[i].html = htmlmsg;
                    //Separate style (not working with ng-bind-html)
                    var spStyle = 'background-color:' + $rootScope.specials[i].bc + ';color:' + $rootScope.specials[i].fc + ';' +
                        'white-space:pre;';
                    $rootScope.specials[i].style = spStyle;

                    vm.specialsList.push($rootScope.specials[i]);
                }
            }
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
            console.log("$rootScope.cansvrows --- ",$rootScope.cansvrows);
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
                console.log("vm.vrows --- ",vm.vrows);
                
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
                console.log("vm.vrowgroups --- ",vm.vrowgroups);
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
            console.log("Bind business to user account");
            answer.updateAnswer(vm.answer.id, ['owner'], [$rootScope.user.id]);
        }

        function openSpecials() {
            $state.go('specials');
        }

        function editVRows() {
            $state.go('editvrows');
        }

        function specialHtml(x) {
            var htmlmsg = '';
            var sch_str = '';
            if (x.freq == 'weekly') {
                sch_str = 'Every: ' +
                (x.mon ? ' - Monday' : '') +
                (x.tue ? ' - Tuesday' : '') +
                (x.wed ? ' - Wednesday' : '') +
                (x.thu ? ' - Thursday' : '') +
                (x.fri ? ' - Friday' : '') +
                (x.sat ? ' - Saturday' : '') +
                (x.sun ? ' - Sunday' : '') +
                '<br>From: ' + x.stime2 + ' to ' + x.etime2;
            }
            if (x.freq == 'onetime') {
                var sameday = (x.sdate == x.edate);
                if (sameday) {
                    sch_str = x.sdate + ' from ' + x.stime + ' to ' + x.etime;
                }
                else {
                    sch_str = 'Starts: ' + x.sdate + ' at ' + x.stime + '<br>Ends: ' + x.edate + ' at ' + x.etime;
                }
            }

            htmlmsg = '<div class="text-center">' + '<h3>' + x.stitle +
            '</h3><p>' + sch_str + '</p><p>' + x.details + '</p></div>';
            return htmlmsg;
        }

        function showImages() {
            vm.showImageGallery = true;
        }
        
        function gotoRank(x){
            var nViews = vm.answer.views + 1;
            answer.updateAnswer(vm.answer.id, ['views'], [nViews]);
            $state.go('rankSummary', { index: x.id });
        }
        
        function vrowVoteUp(x) {

            if ($rootScope.isLoggedIn) {

                switch (x.dV) {
                    case -1: { x.dV = 1; x.upV++; x.downV--; break; }
                    case 0: { x.dV = 1; x.upV++; break; }
                    case 1: { x.dV = 0; x.upV--; break; }
                }

                displayVRowVote(x);
                console.log("VRow UpVote");
            }
            else {
                dialog.getDialog('notLoggedIn');
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
                console.log("DownVote");
            }
            else {
                dialog.getDialog('notLoggedIn');
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
 
    }
})();
