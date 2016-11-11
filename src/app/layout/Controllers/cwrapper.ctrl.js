(function () {
    'use strict';

    angular
        .module('app')
        .controller('cwrapper', cwrapper);

    cwrapper.$inject = ['$rootScope', '$state', '$http', '$stateParams', '$scope',
        'query', 'table', 'dialog',
        'votes', 'editvote', 'vrowvotes'];

    function cwrapper($rootScope, $state, $http, $stateParams, $scope, 
        query, table, dialog,
        votes, editvote, vrowvotes) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'cwrapper';

        vm.switchScope = switchScope;
        vm.refreshRanks = refreshRanks;
        //vm.setObj = setObj;
        
        //Admin Functions
        vm.viewRank = viewRank;
        vm.editRank = editRank;
        vm.applyRule = applyRule;
        vm.selnh = selnh;
        vm.goHome = goHome;
        
        //Quick Links 
        vm.foodNearMe = foodNearMe;
        vm.events = events;
        vm.selfimprove = selfimprove;
        
        //vm.isAdmin = true;
        $rootScope.editMode = false;
        //*****************************
        
        vm.content = [];
        vm.emptyspace = '';
        vm.fbm = $rootScope.fbmode ? true:false;
        
        $rootScope.searchActive = false;
        vm.searchActive = $rootScope.searchActive;
        
        //Receive from navbar, if 'Home' go to Main View
        $rootScope.$on('mainView', function (event) {
            if ($state.current.name == 'cwrapper') switchScope(1);
        });
        
        if ($rootScope.cwrapperLoaded) activate();
        else init();

        function activate() {
            if ($rootScope.DEBUG_MODE) console.log("activate cwrapper!");
            vm.isNh = $rootScope.isNh;
            
            vm.isNhRdy = $rootScope.isNhRdy;
            vm.cnh = $rootScope.cnh;
            
            if (vm.isNh) vm.searchScope = vm.isNhRdy ? $rootScope.cnh : 'Neighborhood';
            vm.isCity = $rootScope.isCity;
            
            if (vm.isCity) vm.searchScope = 'all San Diego';
            
            vm.nhs = $rootScope.neighborhoods.concat($rootScope.districts);
            vm.searchActive = $rootScope.searchActive;
            vm.isAdmin = $rootScope.isAdmin;

            vm.selEditRank = $rootScope.editMode ? 'active' : 'none';
            vm.selViewRank = $rootScope.editMode ? 'none' : 'active';
            
            $rootScope.includeNearMe = false;
            
        }
        function init() {

            if ($rootScope.DEBUG_MODE) console.log("init cwrapper!");
                
            //****SUPER TEMP*****************
            $rootScope.isAdmin = false;
            vm.isAdmin = false;
               /*
            $rootScope.isLoggedIn = true;
            $rootScope.user = {};
            $rootScope.user.name = "Andres Moctezuma";
            $rootScope.user.id = 12;
            $rootScope.answeridxgps = 1258; //starting indx for gps conversion
                       
            if ($rootScope.isLoggedIn && $rootScope.user.name == "Andres Moctezuma" && $rootScope.user.id == 12) {
                $rootScope.isAdmin = true;
                vm.isAdmin = true;
            }

            viewRank();
                */
            //******************************

            //Load current category
            //$rootScope.content = {};
            //vm.isBasic = $rootScope.isBasic;
            switchScope(1); //Default view is basic query view
            vm.cnh = 'Select Neighborhood';
            $rootScope.cnh = vm.cnh;
            vm.isNhRdy = false;
            $rootScope.isNhRdy = false; 
            //vm.viewNum = 0;
/*
            $rootScope.content = rankings; //response
            $rootScope.specials = specials;
            $rootScope.answers = answers;
            $rootScope.catansrecs = catansrecs;
            $rootScope.cvrows = allvrows;
            $rootScope.headlines = headlines;
            $rootScope.cblocks = cblocks;
*/
            
            loadcontent();
            getEstablishmentAnswers();

            //});

            $rootScope.cwrapperLoaded = true;
        }

        function loadcontent() {
            
            //vm.content=[];
            vm.searchArray = [];
            vm.empty = [];
            vm.cTags = {};
            $rootScope.searchStr = [];
            
            
            //start temp code to load answertags
            /*
            //$rootScope.answers = answers;
            
            for (var i = 0; i < $rootScope.content.length; i++) {
            //for (var i = 400; i < 500; i++) {               
                       //Load current answers
            //$rootScope.canswers = [];
            
            for (var j = 0; j < catansrecs.length; j++) {
                if (catansrecs[j].category == $rootScope.content[i].id) {
                    for (var k = 0; k < answers.length; k++){
                        if (catansrecs[j].answer == answers[k].id){
                            $rootScope.canswers.push(answers[k]);
                            //$rootScope.ccatans.push(catansrecs[i]);
                            
                            //Collect array of 'current' catans records ids
                            //$rootScope.B.push(catansrecs[i].id);
                            break;        
                        }
                    }                    
                }
            }    
            var answertags = '';
            for (var n=0; n < $rootScope.canswers.length; n++){
                answertags = answertags + ' ' + $rootScope.canswers[n].name;
            }
            table.update($rootScope.content[i].id,['answertags'],[answertags]);        
            //console.log(answertags);
            }
            */
            //end temp code to add answer tags
            
            //Create seach strings combination of tags, title and answers            
            for (var i = 0; i < $rootScope.content.length; i++) {                
                //Tags cwrapper of title and tags for better search
                $rootScope.searchStr[i] = $rootScope.content[i].tags + " " + $rootScope.content[i].title + " " + $rootScope.content[i].answertags;
            }
            
            //temp
            /*
            for (var i = 0; i < $rootScope.content.length; i++) {
                //$rootScope.content[i].title = $rootScope.content[i].title.replace('Best ', '');
                //$rootScope.content[i].title = $rootScope.content[i].title.replace('Top ', '');
                //$rootScope.content[i].title = $rootScope.content[i].title.replace('Most ', '');
                if ($rootScope.content[i].title.includes('Most ')){
                    $rootScope.content[i].title = $rootScope.content[i].title.replace('Most ', '');
                    $rootScope.content[i].title = $rootScope.content[i].title.charAt(0).toUpperCase() + $rootScope.content[i].title.slice(1);
                    table.update($rootScope.content[i].id,['title'],[$rootScope.content[i].title]);
                }
            }*/
            
            $rootScope.cityranks = ['city', 'lifestyle', 'food', 'politics', 'services', 'social', 'beauty', 'sports', 'personalities', 'technology', 'dating', 'health'];
            $rootScope.nhranks = ['neighborhood', 'lifestyle', 'food', 'services', 'social', 'beauty', 'health'];

            vm.nhs = $rootScope.neighborhoods.concat($rootScope.districts);

            if ($rootScope.isLoggedIn) {
                //load answer votes
                votes.loadVotesTable().then(function (votetable) {
                    $rootScope.cvotes = votetable;
                });
            
                //load edit votes
                editvote.loadEditVotesTable().then(function (editvotes) {
                    $rootScope.editvotes = editvotes;
                });
                //Vrow Votes for this user
                vrowvotes.loadVrowVotes().then(function (vrowvotes) {
                    $rootScope.cvrowvotes = vrowvotes;
                });

            }
        }

        function getEstablishmentAnswers() {
            $rootScope.estAnswers = [];
            $rootScope.estNames = [];
            $rootScope.pplAnswers = [];
            $rootScope.pplNames = [];
            for (var i = 0; i < $rootScope.answers.length; i++) {
                if ($rootScope.answers[i].type == 'Establishment') {
                    $rootScope.estNames.push($rootScope.answers[i].name);
                    $rootScope.estAnswers.push($rootScope.answers[i]);
                }
                if ($rootScope.answers[i].type == 'Person') {
                    $rootScope.pplNames.push($rootScope.answers[i].name);
                    $rootScope.pplAnswers.push($rootScope.answers[i]);
                }
            }
        }

        function refreshRanks(val) {
            $rootScope.inputVal = val;
            if ($rootScope.inputVal.length > 0) $rootScope.searchActive = true;
            else $rootScope.searchActive = false;
            vm.searchActive = $rootScope.searchActive;
            $rootScope.$emit('refreshRanks');
        }

        function switchScope(x) {
            if (x == 1) {
                vm.isNh = false; //Neighborhood Scope
                vm.isCity = true; //City Scope
                $rootScope.isNh = false;
                $rootScope.isCity = true;
                vm.val = '';
                $rootScope.inputVal = '';
                $rootScope.searchActive = false;
                $rootScope.$emit('loadNh');
                vm.searchScope = 'all San Diego';
                vm.ranks = $rootScope.cityranks;
            }
            if (x == 2) {
                vm.isNh = true; //Neighborhood View
                vm.isCity = false; //Classified View
                $rootScope.isNh = true;
                $rootScope.isCity = false;
                vm.val = '';
                $rootScope.inputVal = '';
                $rootScope.searchActive = false;
                if ($rootScope.isNhRdy) $rootScope.$emit('loadNh');
                vm.searchScope = 'Neighborhood';
                vm.ranks = $rootScope.nhranks;
            }
            vm.searchActive = $rootScope.searchActive;
        }

        function selnh(x) {
            $rootScope.cnh = x;
            vm.cnh = x;
            vm.isNhRdy = true;
            $rootScope.isNhRdy = vm.isNhRdy;
            $rootScope.$emit('loadNh');
            vm.searchScope = x;
            vm.val = '';
            $rootScope.inputVal = '';
        }
        
        //Quick Links
        function foodNearMe(){
            if ($rootScope.coordsRdy) $state.go('rankSummary', { index: 9521 });
            else {
                $rootScope.loadFbnWhenCoordsRdy = true;
                dialog.askPermissionToLocate();
            }            
        }
        
        function selfimprove(){
            var introsRank = 0;
            for (var i=0; i<$rootScope.content.length; i++){
                if ($rootScope.content[i].title.indexOf($rootScope.rankofday[0].intros) > -1){
                    introsRank = $rootScope.content[i].id;
                    break;
                }
            }
            $state.go('rankSummary', { index: introsRank });
        }
        
        function events(){
             $state.go('rankSummary', { index: 6949 });
        }
        //*****************Admin Functions************
        function editRank() {
            $rootScope.editMode = true;
            vm.selEditRank = 'active';
            vm.selViewRank = '';
            //console.log("mode -- ", editMode);

        }
        function viewRank() {
            $rootScope.editMode = false;
            vm.selEditRank = '';
            vm.selViewRank = 'active';
            //console.log("mode -- ", editMode);
        }
        function applyRule() {          
             // $rootScope.$emit('applyRule');
        }
           
        /*//Upload Image
        function uploadFile() {
            console.log('file is ');
            console.log(vm.myFile);

            if (vm.myFile) {
                fileupload.uploadFileToUrl(vm.myFile);
            }

        }
        */
        function goHome(){
            //$rootScope.$emit('quitFeedbackMode');
            $rootScope.fbmode = false;
            vm.fbm = $rootScope.fbmode;
        }
        //***********End Admin Functions********************
    }
})();






