(function () {
    'use strict';

    angular
        .module('app')
        .controller('flags', flags);

    flags.$inject = ['$location', '$rootScope', '$state','flag','catans','comment','comment2'];

    function flags(location, $rootScope, $state, flag, catans, comment, comment2) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'flags';
        
        //Methods
        vm.getFlags = getFlags;
        vm.gotoView = gotoView;
        vm.delCatans = delCatans;
        vm.delComment = delComment;
        vm.seeDetails = seeDetails;
        vm.seeFlags = seeFlags;
        vm.deleteFlag = deleteFlag;

        vm.viewDetails = false;
        vm.viewTable = true;
               
       activate();

        function activate() {            

            console.log("Flags page loaded!");           
        }
        
        function getFlags(){            
            flag.getFlags().then(function(result){
                vm.flags = result;
                console.log("flags - ", vm.flags);
                for (var i=0; i<vm.flags.length; i++){
                    if (vm.flags[i].type == 'comment-rank' || vm.flags[i].type == 'comment-answer'){
                        switch (vm.flags[i].flag){
                            case 1: { vm.flags[i].desc = 'Off-Topic'; break; }
                            case 2: { vm.flags[i].desc = 'Offensive'; break; }
                            case 3: { vm.flags[i].desc = 'Spam'; break; }
                        }
                    }
                    if (vm.flags[i].type == 'answer'){
                        switch (vm.flags[i].flag){
                            case 1: { vm.flags[i].desc = 'Wrong Category'; break; }
                            case 2: { vm.flags[i].desc = 'No longer active'; break; }
                            case 3: { vm.flags[i].desc = 'Offensive'; break; }
                            case 4: { vm.flags[i].desc = 'Spam'; break; }
                        }
                    }
                }
            });          
        }

        function gotoView(x){
            
            if (x.type == 'answer'){
                $state.go('answerDetail',{index: x.number});
            }
            if (x.type == 'comment-answer'){
                $state.go('answerDetail',{index: x.number});
            }
            if (x.type == 'comment-rank'){
                $state.go('rankSummary',{index: x.number});
            }
        }

        function seeDetails(x){
            vm.viewTable = false;
            vm.viewDetails = true;

            var catansobj = {};

            vm.data = {};
            vm.catans = [];
            vm.comments = [];
            vm.data.type = x.type;
            vm.data.desc = x.desc;
            vm.data.id = x.id;
            
            if (x.type == 'answer'){

                
                var idx = $rootScope.answers.map(function(x) {return x.id; }).indexOf(x.number);
                vm.data.imageurl = $rootScope.answers[idx].imageurl;
                vm.data.name = $rootScope.answers[idx].name;
                vm.data.location = $rootScope.answers[idx].location;
                vm.data.cityarea = $rootScope.answers[idx].cityarea;
                vm.data.phone = $rootScope.answers[idx].phone;
                vm.data.website = $rootScope.answers[idx].website;
                vm.data.addinfo = $rootScope.answers[idx].addinfo;
                
                //Get Catans for this answer
                for (var k=0; k < $rootScope.catansrecs.length; k++){
                    if ($rootScope.answers[idx].id == $rootScope.catansrecs[k].answer){
                        catansobj = {};
                        catansobj = $rootScope.catansrecs[k];
                            for (var n=0; n < $rootScope.content.length; n++){
                                if ($rootScope.catansrecs[k].category == $rootScope.content[n].id){
                                    catansobj.rank = $rootScope.content[n].title;
                                }
                            }
                    vm.catans.push(catansobj);
                    }    
                }

            }
            if (x.type == 'comment-answer'){
                var idx = $rootScope.answers.map(function(x) {return x.id; }).indexOf(x.number);
                vm.data.imageurl = $rootScope.answers[idx].imageurl;
                vm.data.name = $rootScope.answers[idx].name;
                vm.data.location = $rootScope.answers[idx].location;
                vm.data.cityarea = $rootScope.answers[idx].cityarea;
                vm.data.phone = $rootScope.answers[idx].phone;
                vm.data.website = $rootScope.answers[idx].website;
                vm.data.addinfo = $rootScope.answers[idx].addinfo;
                comment2.getcommentsbyanswer(x.number).then(function (result){
                    vm.comments = result;
                });

            }
            if (x.type == 'comment-rank'){
                var idx = $rootScope.content.map(function(x) {return x.id; }).indexOf(x.number);
                vm.data.title = $rootScope.content[idx].title;
                comment.getcommentsbyrank(x.number).then(function (result){
                    vm.comments = result;
                });
            }
        }

        function seeFlags(){
            vm.viewTable = true;
            vm.viewDetails = false;
        }

        function delCatans(y){
            catans.deleteRec(y.answer, y.category);
        }

        function delComment(x){
            if (vm.data.type == 'comment-rank') comment.deletecomment(x.id);
            if (vm.data.type == 'comment-answer') comment2.deletecomment(x.id);
        }

        function deleteFlag(x){
            flag.deleteFlag(x.id).then(function(){
                getFlags();
            });
        }
    }
})();
