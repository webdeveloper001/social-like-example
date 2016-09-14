(function () {
    'use strict';

    angular
        .module('app')
        .controller('cwrapper', cwrapper);

    cwrapper.$inject = ['$rootScope', '$state', '$http', '$stateParams', '$scope',
     'answers', 'rankings', 'catansrecs','query', 'table', 'specials','fileupload','allvrows'];

    function cwrapper($rootScope, $state, $http, $stateParams, $scope,
     answers, rankings, catansrecs, query, table, specials, fileupload, allvrows) {
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
        vm.uploadFile = uploadFile;
        
        //vm.isAdmin = true;
        $rootScope.editMode = false;
        //*****************************
        
        vm.content = [];
        vm.emptyspace = '';
       
        
        $rootScope.searchActive = false;
        vm.searchActive = $rootScope.searchActive;

        if ($rootScope.cwrapperLoaded) activate();
        else init();

        function activate(){
            console.log("activate cwrapper!");
            vm.isNh = $rootScope.isNh;
            vm.isCity = $rootScope.isCity;
            vm.isNhRdy = $rootScope.isNhRdy;
            vm.nhs = $rootScope.neighborhoods;
            vm.searchActive = $rootScope.searchActive;
            vm.cnh = $rootScope.cnh;
            
        }
        function init() {

            console.log("init cwrapper!");
                
           //****SUPER TEMP*****************
           $rootScope.isAdmin = false;
           vm.isAdmin = false;
                    /*
           $rootScope.isLoggedIn = true;
           $rootScope.user = {};
           $rootScope.user.name = "Andres Moctezuma";
           $rootScope.user.id = 12;
           $rootScope.answeridxgps = 1258; //starting indx for gps conversion
                       
            if ($rootScope.isLoggedIn && $rootScope.user.name == "Andres Moctezuma" && $rootScope.user.id == 12 ){
                $rootScope.isAdmin = true;
                vm.isAdmin=true;
            }
            
            viewRank();
            */
            //******************************

            //Load current category
            $rootScope.content = {};
            //vm.isBasic = $rootScope.isBasic;
            switchScope(1); //Default view is basic query view
            vm.cnh = 'Select Neighborhood';
            $rootScope.cnh = vm.cnh;
            vm.isNhRdy = false;
            $rootScope.isNhRdy = false; 
            //vm.viewNum = 0;

            $rootScope.content = rankings; //response
            $rootScope.specials = specials;
            $rootScope.answers = answers;
            $rootScope.cvrows = allvrows;
            
            loadcontent();
            getEstablishmentAnswers();

            //});
            
            $http.get('../../../assets/fields.json').success(function (response) {
                $rootScope.typeSchema = response;
                console.log("Fields Loaded!");

            });

            $http.get('../../../assets/dialogs.json').success(function (response) {
                $rootScope.dialogs = response;
                console.log("Dialogs Loaded!");

            });

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
            $rootScope.answers = answers;
            
            for (var i = 0; i < $rootScope.content.length; i++) {
            //for (var i = 400; i < 500; i++) {               
                       //Load current answers
            $rootScope.canswers = [];
            
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

            $rootScope.neighborhoods = [
                "Downtown", "La Jolla", "Pacific Beach", "Hillcrest", "University Heights", "Old Town", "Del Mar",
                "Ocean Beach", "North Park", "Mission Hills", "Barrio Logan", "City Heights", "Clairemont", "La Mesa", "Point Loma",
                "South Park", "Scripps Ranch", "Mission Beach", "Kensington", "Cardiff by the Sea", "Coronado",
                "Leucadia", "Oceanside", "National City", "Rancho Santa Fe", "Solana Beach", "Poway", "El Cajon",
                "Escondido", "Carlsbad", "San Ysidro", "Otay Mesa", "Linda Vista", "Chula Vista", "Encinitas", "Golden Hills", "Spring Valley", "Rancho San Diego"];
            $rootScope.districts = [
                "Columbia", "Core", "Cortez Hill", "East Village", "Gaslamp Quarter", "Horton Plaza", "Little Italy",
                "Marina", "Seaport Village"];
                
                vm.nhs = $rootScope.neighborhoods;            
        }

        function getEstablishmentAnswers() {
            $rootScope.estAnswers = [];
            $rootScope.estNames = [];
            for (var i = 0; i < answers.length; i++) {
                if (answers[i].type == 'Establishment') {
                    $rootScope.estNames.push(answers[i].name);
                    $rootScope.estAnswers.push(answers[i]);
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
            if (x==1){
                vm.isNh=false; //Neighborhood Scope
                vm.isCity=true; //City Scope
                $rootScope.isNh = false;
                $rootScope.isCity = true; 
                vm.val = '';
                $rootScope.inputVal = '';
                $rootScope.searchActive = false;
                $rootScope.$emit('loadNh');
                vm.searchScope = 'all San Diego';               
            }
            if (x==2){
                vm.isNh=true; //Neighborhood View
                vm.isCity=false; //Classified View
                $rootScope.isNh = true;
                $rootScope.isCity = false; 
                vm.val = '';
                $rootScope.inputVal = '';
                $rootScope.searchActive = false;
                if ($rootScope.isNhRdy)  $rootScope.$emit('loadNh');
                vm.searchScope = 'Neighborhood';
            }
            vm.searchActive = $rootScope.searchActive;                      
        }
        
        function selnh(x){
            $rootScope.cnh = x;
            vm.cnh = x;
            vm.isNhRdy = true;
            $rootScope.isNhRdy = vm.isNhRdy;
            $rootScope.$emit('loadNh');
            vm.searchScope = x;
            vm.val = '';
            $rootScope.inputVal = '';
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
                 //$rootScope.$emit('applyRule');
           }
           
        //Upload Image
        function uploadFile() {
            console.log('file is ');
            console.log(vm.myFile);

            if (vm.myFile) {
                fileupload.uploadFileToUrl(vm.myFile);
            }

        }
        //***********End Admin Functions********************
    }
})();






