(function () {
    'use strict';

    angular
        .module('app')
        .controller('cwrapper', cwrapper);

    cwrapper.$inject = ['$rootScope', '$state', '$http', '$stateParams', '$scope',
     'answers', 'rankings', 'query', 'table', 'specials'];

    function cwrapper($rootScope, $state, $http, $stateParams, $scope,
     answers, rankings, query, table, specials) {
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
           $rootScope.answeridxgps = 1258;
                       
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
            
            //Show ranking titles, hide all ranks
            for (var i = 0; i < $rootScope.content.length; i++) {
                //$rootScope.content[i].showR = false;
                //$rootScope.content[i].showT = true;
                
                //Tags cwrapper of title and tags for better search
                $rootScope.searchStr[i] = $rootScope.content[i].tags + " " + $rootScope.content[i].title;
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
            }
            vm.searchActive = $rootScope.searchActive;                      
        }
        
        function selnh(x){
            $rootScope.cnh = x;
            vm.cnh = x;
            vm.isNhRdy = true;
            $rootScope.isNhRdy = vm.isNhRdy;
            $rootScope.$emit('loadNh');
        }
/*
        function seeMore(obj) {
            vm.viewNum = obj;
            $rootScope.activeView = obj+1;
            //emitLim30(obj+1);
        }
        
        function goBack(obj){
            vm.viewNum = 0;
            $rootScope.activeView = obj+1;
            //emitLim5(obj+1);                        
        }
/*
        function emitLim30(objNum) {
            $rootScope.$emit('numRes30', objNum);
        }

        function emitLim5(objNum) {
            $rootScope.$emit('numRes5', objNum);
        }
        
        function emitLoadContent(objNum) {
            $rootScope.$emit('loadContent', objNum);
        }*/
        /*
        function setObj(objNum) {
            $rootScope.objNum = objNum;
            
            if (objNum != objNum_o && !$rootScope.rankIsActive){
            
            $rootScope.$emit('numObjChanged');
            }
            objNum_o = objNum;
            //if (!$rootScope.rankIsActive) $rootScope.objNumAct = $rootScope.objNum;
        }*/
        
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
                 $rootScope.$emit('applyRule');
                 //console.log("apply Rule");
           }
        //***********End Admin Functions********************
    }
})();






