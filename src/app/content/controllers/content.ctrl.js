(function () {
    'use strict';

    angular
        .module('app')
        .controller('content', content);

    content.$inject = ['$rootScope', '$state', '$http', '$stateParams', '$scope','answers'];

    function content($rootScope, $state, $http, $stateParams, $scope, answers) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'content';


        vm.goBack = goBack;
        vm.rankSel = rankSel;
        vm.switchArray = switchArray;

        vm.content = [];

        $rootScope.$on('newCategory', function (e) {
            console.log("trigger");
            loadContent();
        });
        $rootScope.$on('closeRank', function (e) {
            console.log("trigger closeRank");
            closeRank();
        });

        window.onload = function () {

        }

        activate();

        function activate() {
            
            //****SUPER TEMP*****************
            $rootScope.isLoggedIn = true;
            $rootScope.user={};
            $rootScope.user.id=7;
            $rootScope.user.name="Andres Moctezuma";
            //******************************

            //Load current category
            $rootScope.content = {};
            $rootScope.viewCtn = 0;
            
            getEstablishmentNames();

            $http.get('../../../assets/testcontent.json').success(function (response) {
                $rootScope.content = response;
                console.log("Content Loaded!");
                loadContent();

            });
            
            $http.get('../../../assets/fields.json').success(function (response) {
                $rootScope.typeSchema = response;
                console.log("Fields Loaded!");
                
            });
            
            $http.get('../../../assets/dialogs.json').success(function (response) {
                $rootScope.dialogs = response;
                console.log("Dialogs Loaded!");
                
            });
            
             $state.go('rankSummary', { index: 1 });
            
        }

        function loadContent() {
            
            //vm.content=[];
            vm.searchArray = [];
            vm.empty = [];
            vm.cTags = {};
            $rootScope.searchStr = [];
            
            //Show ranking titles, hide all ranks
            for (var i = 0; i < $rootScope.content.length; i++) {
                $rootScope.content[i].showR = false;
                $rootScope.content[i].showT = true;
                
                //Tags content of title and tags for better search
                $rootScope.searchStr[i] = $rootScope.content[i].tags + " " + $rootScope.content[i].title;                
            }
            
            $rootScope.neighborhoods = [
                "Downtown","La Jolla","Pacific Beach","HillCrest","University Heights","Old Town","Del Mar",
                "Ocean Beach","North Park","Mission Hills","Barrio Logan","City Heights","Clairemont","Mira Mesa","Point Loma",
                "South Park","Scripps Ranch","Mission Valley", "Kensington"];
            $rootScope.districts = [
                "Columbia","Core","Cortez Hill","East Village","Gaslamp Quarter","Horton Plaza","Little Italy",
                "Marina","Seaport Village"];    


            console.log("content loaded", $rootScope.content.length);

        }

        function goBack() {

            $state.go('rankSummary', { index: $rootScope.cCategory.id });

        }

        function rankSel(x, index) {
            console.log("clicked on", x.title, index);
            
            $rootScope.title = x.title;
            $rootScope.isDowntown = x.title.includes("downtown");
            
            var n=x.title.length;
            var ctr=0;
            var si=0;
            for (var i=0; i<n ; i++){
                if (x.title[i]==' ') ctr++;
                if (ctr==3){
                    si=i;
                    break;
                }
            }
            $rootScope.header = x.title.substring(si,n-1);
            
            //close all ranks first
            for (var i = 0; i < $rootScope.content.length; i++) {
                $rootScope.content[i].showR = false;
                $rootScope.content[i].showT = true;
            }
            
            x.showR = true;
            x.showT = false;
            //vm.show = true;
            $rootScope.viewNum = index;
            $rootScope.viewCtn = 0;
                        
            $state.go('rankSummary', { index: x.id });
        }

        function switchArray() {
            //console.log("SwitchArray ", vm.cTags.length);
            vm.results = [];
            if (vm.val.length >= 3) {
                //vm.content = $rootScope.content;
                var valTags = vm.val.split(" ");

                for (var j = 0; j < $rootScope.content.length; j++) {
                  //for (var j = 50; j < 60; j++) {
                    var r = true;
                    //check that all tags exist
                    for (var k = 0; k < valTags.length; k++) {
                        var tagCapitalized = valTags[k].charAt(0).toUpperCase() + valTags[k].slice(1);
                        r = r && ($rootScope.searchStr[j].includes(valTags[k]) || 
                                  $rootScope.searchStr[j].includes(valTags[k].toUpperCase()) || 
                                  $rootScope.searchStr[j].includes(tagCapitalized));
                        //console.log("r ", r , valTags[k]);
                    }
                    if (r) {
                        //console.log("push to vm.results array");
                        vm.results.push($rootScope.content[j]);
                        //console.log("vm.results  ", vm.results);
                    }
                }
            }
            else{
                vm.results = [];
            }
            $rootScope.viewNum = 999;
        }
        
        function getEstablishmentNames(){
            $rootScope.answerNames=[];
            for (var i=0; i<answers.length; i++){
                if (answers[i].type == 'Establishment'){
                    $rootScope.answerNames.push(answers[i].name);    
                }                
            }
        }

        function closeRank() {
            //Show ranking titles, hide all ranks
            for (var i = 0; i < $rootScope.content.length; i++) {
                $rootScope.content[i].showR = false;
                $rootScope.content[i].showT = true;
            }
        }

    }
})();






