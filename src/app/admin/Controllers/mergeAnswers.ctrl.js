(function () {
    'use strict';

    angular
        .module('app')
        .controller('mergeAnswers', mergeAnswers);

    mergeAnswers.$inject = ['$location', '$rootScope', '$state', 'catans', '$http','answer','$stateParams'];

    function mergeAnswers(location, $rootScope, $state, catans, $http, answer, $stateParams) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'mergeAnswers';
        
        var idx = 0;
        //if ($stateParams.index) { idx =  $stateParams.index;}
        
        vm.goPrev = goPrev;
        vm.goNext = goNext;
        vm.delAnswer = delAnswer;
        vm.addCatans = addCatans;
        vm.addcts = addcts;
        vm.delCatans = delCatans;
        vm.editAnswer = editAnswer;
        
        vm.addcts1active=false;
        vm.addcts2active=false;
        
        var ctsOptions = [];

        activate();

        function activate() {

            vm.tot = $rootScope.dupAns.length-1;
            prepareData();
            getData();
        
        console.log("mergeAnswers page Loaded!");

    }
    
    function getData(){
        
        console.log("@getData");
        console.log("$rootScope.catansrecs.length ",$rootScope.catansrecs.length);
        
            vm.idx = idx;
            
            var catans1obj = {};
            var catans2obj = {};
            var ansId1 = 0;
            var ansId2 = 0;

            vm.ans1 = $rootScope.dupAns[idx].ans1;
            vm.ans2 = $rootScope.dupAns[idx].ans2;
            
            prepareData();
            
            //Get Catans for Answer 1
            vm.ans1.catans = [];
            ansId1 = vm.ans1.id
            for (var k = 0; k < $rootScope.catansrecs.length; k++) {
                if (ansId1 == $rootScope.catansrecs[k].answer) {
                    catans1obj = $rootScope.catansrecs[k];
                    for (var n = 0; n < $rootScope.content.length; n++) {
                        if ($rootScope.catansrecs[k].category == $rootScope.content[n].id) {
                            catans1obj.rank = $rootScope.content[n].title;
                        }
                    }
                    vm.ans1.catans.push(catans1obj);
                }
            }
            
            //Get Catans for Answer 2
            vm.ans2.catans = [];
            ansId2 = vm.ans2.id
            for (var k = 0; k < $rootScope.catansrecs.length; k++) {
                if (ansId2 == $rootScope.catansrecs[k].answer) {
                    catans2obj = $rootScope.catansrecs[k];
                    for (var n = 0; n < $rootScope.content.length; n++) {
                        if ($rootScope.catansrecs[k].category == $rootScope.content[n].id) {
                            catans2obj.rank = $rootScope.content[n].title;
                        }
                    }
                    vm.ans2.catans.push(catans2obj);
                }
            }
            
            console.log("vm.ans1.catans.length ",vm.ans1.catans.length);
            console.log("vm.ans2.catans.length ",vm.ans2.catans.length);
    }
    
    function goPrev(x){
        idx = idx - x;
        if (idx < 0) idx = 0;
        getData();
        
    }
    
    function goNext(x){
        idx = idx + x;
        if (idx >= vm.tot) idx = vm.tot;
        getData();
    }
    
    function delAnswer(x){
        if (x==1){
            answer.deleteAnswer($rootScope.dupAns[idx].ans1.id);
            catans.deleteAnswer($rootScope.dupAns[idx].ans1.id);
        }
        if (x==2){
            answer.deleteAnswer($rootScope.dupAns[idx].ans2.id);
            catans.deleteAnswer($rootScope.dupAns[idx].ans2.id);
        }
    }
    
    function addCatans(x){
        if (x==1){
            vm.addcts1opts = [];
            var opt = '';
            for (var i=0; i<ctsOptions.length; i++){
                    if (ctsOptions[i].indexOf('@neighborhood')>-1){
                        opt = ctsOptions[i].replace('@neighborhood',vm.ans1.cityarea);
                        vm.addcts1opts.push(opt);
                    }
                    else vm.addcts1opts.push(ctsOptions[i]);
            }
            vm.addcts1active=true;
        }
        if (x==2){
            vm.addcts2opts = [];
            var opt2 = '';
            for (var i=0; i<ctsOptions.length; i++){
                    if (ctsOptions[i].indexOf('@neighborhood')>-1){
                        opt2 = ctsOptions[i].replace('@neighborhood',vm.ans2.cityarea);
                        vm.addcts2opts.push(opt2);
                    }
                    else vm.addcts2opts.push(ctsOptions[i]);
            }
            vm.addcts2active=true;
        }
        
    }
    
    function prepareData(){
        ctsOptions = [];
        var titlex = '';
        for (var i=0; i<$rootScope.content.length; i++){
            if ($rootScope.content[i].title.indexOf('in Hillcrest')>-1){
                titlex = $rootScope.content[i].title.replace('Hillcrest', '@neighborhood');
                ctsOptions.push(titlex);
            }
            if ($rootScope.content[i].ismp){
                ctsOptions.push($rootScope.content[i].title);
            }
        }
    }
    
    function addcts(x){
        var title = '';
        var myAnswer = {};
        var category = 0;
        var isDup = false;
        if (x==1){
            title = vm.addcts1val;
            myAnswer = vm.ans1;
            isDup = vm.cat1isdup == undefined ? false:vm.cat1isdup;
            
        }
        if (x==2){
            title = vm.addcts2val;
            myAnswer = vm.ans2;
            isDup = vm.cat2isdup == undefined ? false:vm.cat2isdup;
        }
        
        for (var i=0; i<$rootScope.content.length; i++){
            if ($rootScope.content[i].title == title){
                category = $rootScope.content[i].id;
                break;
            }
        }
        //console.log("postRec catans -",myAnswer.id,category,isDup);
        catans.postRec2(myAnswer.id, category);
        
        if (x==1) vm.addcts1active=false;
        if (x==2) vm.addcts2active=false;
        
        setTimeout(function () {
             getData();
        }, 1000);  
    }
     function delCatans(y){
            catans.deleteRec(y.answer, y.category);
            setTimeout(function () {
              getData();
            }, 1000);
        }
        
        function editAnswer(x){
            if (x==1){
                $state.go('editAnswer',{index: vm.ans1.id});
            }
            if (x==2){
                $state.go('editAnswer',{index: vm.ans2.id});
            }
        }
}
})();
