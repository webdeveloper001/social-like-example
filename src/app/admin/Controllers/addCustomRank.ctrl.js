(function () {
    'use strict';

    angular
        .module('app')
        .controller('addCustomRank', addCustomRank);

    addCustomRank.$inject = ['$location', '$rootScope', '$state','$stateParams',
    'dialog','$window','answer','color','pixabay','$http','table','$timeout'];

    function addCustomRank(location, $rootScope, $state, $stateParams,
     dialog, $window, answer, color, pixabay, $http, table, $timeout) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'addCustomRank';

        vm.goBack = goBack;
        vm.selType = selType;
        vm.selCat = selCat;
        vm.minusShade = minusShade;
        vm.plusShade = plusShade;
        vm.valRank = valRank;
        vm.alertOk = alertOk;
        vm.tagsOk = tagsOk;
        vm.questionOk = questionOk;
        vm.getImages = getImages;
        vm.nextImg = nextImg;
        vm.prevImg = prevImg;
        vm.selectImg = selectImg;
        vm.processImage = processImage;
        vm.whatisrankquestion = whatisrankquestion;
        vm.whataretags = whataretags;
        vm.csel = csel;
        vm.c1sel = true;
        vm.showAlert = false;
        vm.showAddButton = false;    
        
        var item = {};
        var rankTitleOk = true;
        var rankTypeOk = true;
        var rankQuestionOk = true;
            
        vm.editRank = editRank;
        vm.addRank = addRank;
        
        vm.typeList = ["Person", "Establishment", "Place", "Activity", "Short-Phrase", "Organization", "Event", "Thing","PersonCust"];

        vm.isAdmin = $rootScope.isAdmin;
        var colors = [];
        var ranks = [];
        var idx = 0;

        //Adjust picture size for very small displays
        if ($window.innerWidth < 512) { vm.sm = true; vm.nsm = false; }
        else { vm.sm = false; vm.nsm = true; }
        
        activate();

        function activate() {
                //vm.rankTitle = 'Enter a title...';
                //vm.question = 'Enter a question...';
                vm.resLength = -1;
                vm.rankType = 'Select ranking type';
                vm.rankCat = 'Choose a category';
                vm.image = $rootScope.EMPTY_IMAGE;
                vm.i = 0;
                vm.step = 1;
                vm.shade = 0;
                setBoxColor(1);
                vm.buttonLabel = 'Add Rank';
            
            //loadData();
            console.log("addCustomRank page Loaded!");
        }
        
        function validateData(){
            
            var titleOk = true;
            var tagsOk = true;
            var questionOk = true;

            if (vm.rankTitle.length < 10) {dialog.getDialog('rankTitle'); titleOk = false;}
            if (vm.tags < 5) {dialog.getDialog('rankTags'); tagsOk = false;}
            if (vm.question.length < 10) {dialog.getDialog('rankQuestion'); questionOk = false;}

            return titleOk && tagsOk && questionOk;                 

        }

        function editRank(){
            validateData();

                var tfields = [];
                var tvals = [];

                if (rankTitleOk && rankTypeOk && rankQuestionOk) {
                    if ($rootScope.rankforAnswerMode == 'add'){
                        table.addTableforAnswer(item,colors,$rootScope.canswer.id).then(function(){
                            $state.go('answerRanksManager');
                        });
                    }
                    else{
                        if ($rootScope.content[idx].title != vm.rankTitle +' @ ' + $rootScope.canswer.name){
                            tfields.push('title');
                            tvals.push(vm.rankTitle +' @ ' + $rootScope.canswer.name);                            
                        }
                        if ($rootScope.content[idx].question != vm.question){
                            tfields.push('question');
                            tvals.push(vm.question);                            
                        }
                        if (tfields.length > 0) 
                        table.update($rootScope.content[idx].id, tfields, tvals).then(function(){
                            $state.go('answerRanksManager');
                        });

                        if (vm.bc != ranks[$rootScope.rankIdx].bc || vm.fc != ranks[$rootScope.rankIdx].fc){
                            ranks[$rootScope.rankIdx].bc = vm.bc;
                            ranks[$rootScope.rankIdx].fc = vm.fc;
                            var ranksStr = JSON.stringify(ranks);
                            answer.updateAnswer($rootScope.canswer.id,['ranks'],[ranksStr]).then(function(){
                            $state.go('answerRanksManager');
                        });
                        }
                    }
                    
                    //clearFields();
                }
                else {
                    if (!rankTitleOk) dialog.getDialog('rankTitle');
                    else if (!rankQuestionOk) dialog.getDialog('rankQuestion');
                    else dialog.getDialog('rankType');
                }                  
        }

        function addRank(){

            var dataOk = validateData();

            if (dataOk){

                item.title = vm.rankTitle;
                item.tags = vm.tags;
                item.question = vm.question;
                item.views = 0;
                item.answers = 0;
                item.ismp = true;
                item.user = $rootScope.user.id;
                item.timestmp = Date.now();
                item.bc = vm.bc;
                item.fc = vm.fc;
                item.shade = vm.shade;
                item.keywords = '';
                item.fimage = vm.image;
            
                table.addTable(item).then(function(result){
                    if ($rootScope.DEBUG_MODE) console.log("table added --- ", result);
                    var rankid = result.resource[0].id;
                    //Create and update slug
                    var slug = item.title.toLowerCase();; 
                    slug = slug.replace(/ /g,'-');
                    slug = slug + '-' + rankid;
                    table.update(rankid,['slug'],[slug]);
                    processImage(rankid);
                });
            }
        }
        
        function clearFields(){
            item = {};
            vm.rankTitle = '';
            vm.tags = '';
            vm.keywords = '';
            vm.type = '';
            vm.isatomic = true;
            vm.question = '';
            vm.image1url = '';
            vm.image2url = '';
            vm.image3url = '';
        }

        function selType(x){
            if (x == 1) {vm.rankType = 'ESTABLISHMENTS'; item.type='Establishment';}
            if (x == 2) {vm.rankType = 'PEOPLE'; item.type='Person';}
            if (x == 3) {vm.rankType = 'ORGANIZATIONS'; item.type='Organization';}
            if (x == 4) {vm.rankType = 'PLACES'; item.type='Place';}
            if (x == 5) {vm.rankType = 'OPINIONS'; item.type='Short-Phrase';}
            if (x == 6) {vm.rankType = 'CONTRACTORS'; item.type='PersonCust';}
            if (x == 7) {vm.rankType = 'ITEM / OBJECTS'; item.type='Thing';}
            if (x == 8) {vm.rankType = 'EVENTS'; item.type='Event';}
            vm.step = 3;
        }

        function selCat(x){
            if (x == 1) {vm.rankCat = 'FOOD'; vm.tags = 'food';}
            if (x == 2) {vm.rankCat = 'LIFESTYLE'; vm.tags = 'lifestyle';}
            if (x == 3) {vm.rankCat = 'HEALTH'; vm.tags= 'health';}
            if (x == 4) {vm.rankCat = 'SOCIAL'; vm.tags='social';}
            if (x == 5) {vm.rankCat = 'SPORTS'; vm.tags='sports';}
            if (x == 6) {vm.rankCat = 'PERSONALITIES'; vm.tags='personalities';}
            if (x == 7) {vm.rankCat = 'SERVICES'; vm.tags='services';}
            if (x == 8) {vm.rankCat = 'BEAUTY'; vm.tags='beauty';}
            if (x == 9) {vm.rankCat = 'CITY'; vm.tags='city';}
            if (x == 10) {vm.rankCat = 'POLITICS'; vm.tags='politics';}
            if (x == 11) {vm.rankCat = 'SCIENCE & TECH'; vm.tags='technology';}
            if (x == 12) {vm.rankCat = 'LOVE & RELATIONSHIPS'; vm.tags='dating';}
            if (x == 13) {vm.rankCat = 'FAMILY'; vm.tags='family';}
            vm.step = 2;
        }

        function csel(x){
            vm.c1sel = false;
            vm.c2sel = false;
            vm.c3sel = false;
            vm.c4sel = false;
            vm.c5sel = false;
            vm.c6sel = false;
            if (x == 1) vm.c1sel = true;
            if (x == 2) vm.c2sel = true;
            if (x == 3) vm.c3sel = true;
            if (x == 4) vm.c4sel = true;
            if (x == 5) vm.c5sel = true;
            if (x == 6) vm.c6sel = true;
            setBoxColor(x);
        }

        function setBoxColor(x){
            if (x == 1) {vm.bc = 'brown'; vm.fc = '#f8f8ff'; }
            if (x == 2) {vm.bc = '#4682b4'; vm.fc = '#f8f8ff'; }
            if (x == 3) {vm.bc = '#008080'; vm.fc = '#f8f8ff'; }
            if (x == 4) {vm.bc = 'gray'; vm.fc = '#f8f8ff'; }
            if (x == 5) {vm.bc = '#a3297a'; vm.fc = '#f8f8ff'; }
            if (x == 6) {vm.bc = '#c68c53'; vm.fc = '#f8f8ff'; }
            vm.bc2 = color.shadeColor(vm.bc, vm.shade);
        }
        
         function plusShade(){
            vm.shade = vm.shade + 1;
            if  (vm.shade > 10 ) vm.shade = 10;
            vm.bc2 = color.shadeColor(vm.bc, vm.shade/10);
        }

        function minusShade(){
            vm.shade = vm.shade - 1;
            if  (vm.shade < -10 ) vm.shade = -10;
            vm.bc2 = color.shadeColor(vm.bc, vm.shade/10);
        }

        function valRank(){
            if (vm.rankTitle == undefined) {
                dialog.getDialog('rankTitle');
            }
            else {
                if (vm.rankTitle.length < 10) dialog.getDialog('rankTitle'); 
                else {
                    vm.rankTitleVal = vm.rankTitle;
                    vm.showAlert = true;
                }
            }
        }

        function getImages(){
            var qry = vm.imageQuery.replace(' ','+');
            vm.images = [];
            pixabay.search(qry).then(function(result){
                if ($rootScope.DEBUG_MODE) console.log("Pixabay results - ", result);
                vm.numResults = result.length;
                
                for (var i=0; i<vm.numResults; i++){
                    vm.images.push(result[i]);
                    //console.log("image i - ", result[i].previewURL);

                }
                vm.image = vm.images[vm.i].previewURL;
            });
        }

        function nextImg(){
            vm.i = vm.i + 1;
            if (vm.i > vm.images.length -1) vm.i = vm.images.length-1;
            vm.image = vm.images[vm.i].previewURL; 
        }

        function prevImg(){
            vm.i = vm.i - 1;
            if (vm.i < 0) vm.i = 0;
            vm.image = vm.images[vm.i].previewURL; 
        }

        function selectImg(){
            vm.step = 7;
            vm.showAddButton = true;
        }

        function alertOk(){
            vm.showAlert = false;
            if (vm.resLength == 0) vm.step = 4;
        }

        function tagsOk(){
            if (vm.tags.length == 0) dialog.getDialog('rankTags');
            else vm.step = 6;
        }

        function questionOk(){
              if (vm.question == undefined) {
                dialog.getDialog('rankQuestion');
            }
            else {
                if (vm.question.length < 10) dialog.getDialog('rankQuestion'); 
                else {
                    vm.step = 5;
                }
            }
        }

        function whatisrankquestion(){
            dialog.whatisrankquestion();
        }
        function whataretags(){
            dialog.getDialog('whataretags');
        }

        function processImage(category){
            var rank = category;
            var imageurl = vm.images[vm.i].webformatURL;
            
            var filename = vm.rankTitle.toLowerCase();; 
            filename = filename.replace(/ /g,'-');
            filename = filename + '-' + rank;

            if ($rootScope.DEBUG_MODE) console.log("Process Image - ", rank, imageurl, filename);
            processImageExec(imageurl, filename, rank);

            $timeout(function(){
                dialog.getDialog('newRank');
                $state.go('rankSummary',{index: filename}); //slug matches filename
            },2000);
        }

        function processImageExec(imageurl, filename, rank){
            var url = 'https://server.rank-x.com/ImageServer/SaveImage';
            var req = {
                method: 'POST',
                url: url,
                headers: {
                    'X-Dreamfactory-API-Key': undefined,
                    'X-DreamFactory-Session-Token': undefined
                },
                data: {
                    'imageurl': imageurl,
                    'filename': filename,
                    'rank': rank,                  
                }
            }

            $http(req).then(function (result) {
                if ($rootScope.DEBUG_MODE) console.log("Processing Image Success", result);
                
            }, function (error) {
                if ($rootScope.DEBUG_MODE) console.log("Error Processing Image - ", error);
            });
        }

        function goBack(){
            $state.go('cwrapper');
        }
                     
    }
})();
