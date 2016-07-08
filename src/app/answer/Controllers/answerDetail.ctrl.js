(function () {
    'use strict';

    angular
        .module('app')
        .controller('answerDetail', answerDetail);

    answerDetail.$inject = ['flag', '$stateParams', '$state', 'answer', 'dialog', '$rootScope',
        'votes', 'matchrec', 'edit', 'editvote', 'catans', 'datetime']; //AM:added user service

    function answerDetail(flag, $stateParams, $state, answer, dialog, $rootScope,
        votes, matchrec, edit, editvote, catans, datetime) { //AM:added user service
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'answerDetail';
        //vm.header = "table" + $rootScope.cCategory.id + ".header";
        vm.ranking = $rootScope.title;
        //vm.body = 'table' + $rootScope.cCategory.id + '.body';
        
        var voteRecordExists = false;
        var uservote = {};
        var catansid = 0;
        var dV = 0;
        var ansvidx = 0;
        var upVi = 0;  //upVotes initial value
        var downVi = 0; //downVotes initial value
        var A = $rootScope.A;
        var answers = $rootScope.canswers;
        var headerstr = '';
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

        vm.fields = $rootScope.fields;
        vm.type = $rootScope.cCategory.type;

        if ($stateParams.index) vm.answer = answers[A.indexOf(+$stateParams.index)];
        
        
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

        //Execute this view only if rankWindow is open
        if ($rootScope.showR) activate();

        function activate() {

            getHeader();
            getCatAnsId(vm.answer.id);
            getEdits(vm.answer.id);
            deleteButtonAccess();
            getAnswerVote(vm.catans.id);
            makeRelativeTable(vm.answer.id);
            getSpecials(vm.answer.id);
            getOtherRanks();
            console.log("Answer details loaded");

        }

        function getHeader() {
            vm.public = $rootScope.canswers.public;
        }

        function getCatAnsId(x) {
            for (var i = 0; i < $rootScope.ccatans.length; i++) {
                if ($rootScope.ccatans[i].answer == x) {
                    vm.catans = $rootScope.ccatans[i];
                }
            }
            upVi = vm.catans.upV;
            downVi = vm.catans.downV;
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
            getEdits(vm.answer.id);
            //vm.imageURL = INSTANCE_URL + '/api/v2/files/images/' + vm.answer.imagefile + '?api_key='+APP_API_KEY;
            upVi = vm.catans.upV;
            downVi = vm.catans.downV;
            getHeader();
            getCatAnsId(vm.answer.id);
            getAnswerVote(vm.catans.id);
            makeRelativeTable(x);
            getSpecials(vm.answer.id);
            getOtherRanks();
        }
        
        //Update Records
        function updateRecords() {

            console.log("UpdateRecords @ answerDetail");    
            //update vote record if necessary
            //TODO Need to pass table id
            if (voteRecordExists && uservote.vote != dV) {
                //console.log("vote exists and vote is different now", uservote.vote, dV);
                $rootScope.cvotes[ansvidx].vote = dV;
                votes.patchRec(uservote.id, dV);

            }
            if (!voteRecordExists && dV != 0) {
                //console.log("there is a new vote  ", dV);
                votes.postRec(catansid, dV);
            }
            
            //update answer record (vote count) if necessary
            //TODO Need to pass table id
            if ((vm.catans.upV != upVi) || (vm.catans.downV != downVi)) {
                //console.log("number of votes changed: ",vm.answer.upV, upVi, vm.answer.downV, downVi);
                //answer.updateAnswer(vm.answer.id, ["upV", "downV"], [vm.answer.upV, vm.answer.downV]);
                catans.updateRec(vm.catans.id, ["upV", "downV"], [vm.catans.upV, vm.catans.downV]);
            }

            recordsUpdated = true;
        }
        
        //AM:Refresh Thumb Up and Thumb down Vote Displays
        function getAnswerVote(x) {
            for (var i = 0; i < $rootScope.cvotes.length; i++) {
                if ($rootScope.cvotes[i].catans == x) {
                    uservote = $rootScope.cvotes[i];

                    ansvidx = i;
                    voteRecordExists = true;
                    break;
                }
            }

            if (voteRecordExists) {
                dV = uservote.vote;
                catansid = uservote.catans;
            }
            else {
                dV = 0;
                catansid = x;
            }
            displayVote(dV);

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

        function displayVote(dV) {

            if (dV == 1) {
                vm.answer.thumbUp = "thumbs_up_blue.png";
                vm.answer.thumbDn = "thumbs_down_gray.png";
            }

            if (dV == 0) {
                vm.answer.thumbUp = "thumbs_up_gray.png";
                vm.answer.thumbDn = "thumbs_down_gray.png";
            }
            if (dV == -1) {
                vm.answer.thumbUp = "thumbs_up_gray.png";
                vm.answer.thumbDn = "thumbs_down_blue.png";
            }
        }
        
        //AM:UpVote
        function UpVote() {

            if ($rootScope.isLoggedIn) {

                switch (dV) {
                    case -1: { dV = 1; vm.catans.upV++; vm.catans.downV--; break; }
                    case 0: { dV = 1; vm.catans.upV++; break; }
                    case 1: { dV = 0; vm.catans.upV--; break; }
                }

                displayVote(dV);
                console.log("UpVote");
            }
            else {
                dialog.getDialog('notLoggedIn');
                return;
            }
        }
        
        //AM:DownVote
        function DownVote() {

            if ($rootScope.isLoggedIn) {
                switch (dV) {
                    case -1: { dV = 0; vm.catans.downV--; break; }
                    case 0: { dV = -1; vm.catans.downV++; break; }
                    case 1: { dV = -1; vm.catans.upV--; vm.catans.downV++; break; }
                }

                displayVote(dV);
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

        function getOtherRanks() {

            vm.otherRanks = [];
            for (var i = 0; i < $rootScope.catansrecs.length; i++) {
                if ($rootScope.catansrecs[i].answer == vm.answer.id && $rootScope.catansrecs[i].category != $rootScope.cCategory.id) {
                    for (var j = 0; j < $rootScope.content.length; j++) {
                        if ($rootScope.content[j].id == $rootScope.catansrecs[i].category) {
                            vm.otherRanks.push($rootScope.content[j]);
                        }
                    }

                }
            }
            vm.otherRanksExist = vm.otherRanks.length > 0 ? true : false;
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
                    var spStyle='background-color:' + $rootScope.specials[i].bc + ';color:' + $rootScope.specials[i].fc + ';'+
                    'white-space:pre;';
                    $rootScope.specials[i].style = spStyle;
                    
                    vm.specialsList.push($rootScope.specials[i]);
                }
            }
        }

        function deleteButtonAccess() {
            if ($rootScope.isLoggedIn) {
                var username = $rootScope.user.name;
                var n = username.localeCompare("Andres Moctezuma");
                if ($rootScope.user.id == 7 && n == 0) vm.deleteButton = 'inline';
                else vm.deleteButton = 'none';
            }
        }

        function showUrl() {
            dialog.url(vm.answer.imageurl);
        }
        function closeRank() {
            $rootScope.$emit('closeRank');
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

            htmlmsg = '<div >' + '<p><strong>' + x.stitle + ' @ ' +
            x.name + '</strong></p><p>' + sch_str + '</p><p>' + x.details + '</p></div>';
            return htmlmsg;
        }




    }
})();
