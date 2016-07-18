(function () {
    'use strict';

    angular
        .module('app')
        .controller('cwrapper', cwrapper);

    cwrapper.$inject = ['$rootScope', '$state', '$http', '$stateParams', '$scope', 'answers', 'rankings', 'query', 'table', 'specials'];

    function cwrapper($rootScope, $state, $http, $stateParams, $scope, answers, rankings, query, table, specials) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'cwrapper';

        vm.switchView = switchView;
        vm.refreshRanks = refreshRanks;
        vm.setObj = setObj;
        
        //Admin Functions
        vm.viewRank = viewRank;
        vm.editRank = editRank;
        vm.applyRule = applyRule;
        //vm.isAdmin = true;
        $rootScope.editMode = false;
        //*****************************
        
        vm.content = [];
        vm.emptyspace = '';
        
        //delete these
        $rootScope.viewNum = 0;
        $rootScope.activeView = 1;
        //$rootScope.viewCtn = 0;
        $rootScope.isBasic = true;
        $rootScope.rankIsActive = false;
        
        //Methods
        vm.seeMore = seeMore;
        vm.goBack = goBack;
        
        var objNum_o = 0;

        activate();

        function activate() {
            
            //****SUPER TEMP*****************
            
            $rootScope.isLoggedIn = false;
            //$rootScope.user = {};
            //$rootScope.user.id = 7;
            //$rootScope.user.name = "Andres Moctezuma";
            $rootScope.isAdmin = false;
            vm.isAdmin=false;
            //viewRank();
            
            //******************************

            //Load current category
            $rootScope.content = {};
            vm.isBasic = $rootScope.isBasic;
            vm.viewNum = 0;

            $rootScope.content = rankings; //response
            $rootScope.specials = specials;
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

            $state.go('content');
            
            //Set results limits  
            emitLim30(1);
            emitLim5(2);
            emitLim5(3);
            emitLim5(4);
            emitLim5(5);
            emitLim5(6);
            emitLim5(7);

        }

        function loadcontent() {
            
            //vm.content=[];
            vm.searchArray = [];
            vm.empty = [];
            vm.cTags = {};
            $rootScope.searchStr = [];
            
            //Show ranking titles, hide all ranks
            for (var i = 0; i < $rootScope.content.length; i++) {
                $rootScope.content[i].showR = false;
                $rootScope.content[i].showT = true;
                
                //Tags cwrapper of title and tags for better search
                $rootScope.searchStr[i] = $rootScope.content[i].tags + " " + $rootScope.content[i].title;
            }

            $rootScope.neighborhoods = [
                "Downtown", "La Jolla", "Pacific Beach", "HillCrest", "University Heights", "Old Town", "Del Mar",
                "Ocean Beach", "North Park", "Mission Hills", "Barrio Logan", "City Heights", "Clairemont", "Mira Mesa", "Point Loma",
                "South Park", "Scripps Ranch", "Mission Valley", "Kensington"];
            $rootScope.districts = [
                "Columbia", "Core", "Cortez Hill", "East Village", "Gaslamp Quarter", "Horton Plaza", "Little Italy",
                "Marina", "Seaport Village"];
                
            
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
            $rootScope.$emit('refreshRanks');
        }

        function switchView() {
            if (vm.isBasic) $rootScope.isBasic = false;
            if (!vm.isBasic) $rootScope.isBasic = true;
            vm.isBasic = $rootScope.isBasic;
        }

        function seeMore(obj) {
            vm.viewNum = obj;
            $rootScope.activeView = obj+1;
            emitLim30(obj+1);
        }
        
        function goBack(obj){
            vm.viewNum = 0;
            $rootScope.activeView = obj+1;
            emitLim5(obj+1);                        
        }

        function emitLim30(objNum) {
            $rootScope.$emit('numRes30', objNum);
        }

        function emitLim5(objNum) {
            $rootScope.$emit('numRes5', objNum);
        }
        
        function setObj(objNum) {
            $rootScope.objNum = objNum;
            
            if (objNum != objNum_o){
            
            $rootScope.$emit('numObjChanged');
            }
            objNum_o = objNum;
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
                 $rootScope.$emit('applyRule');
                 console.log("apply Rule");
           }
        //***********End Admin Functions********************
    }
})();






