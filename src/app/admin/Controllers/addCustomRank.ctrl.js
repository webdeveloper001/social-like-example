(function () {
    'use strict';

    angular
        .module('app')
        .controller('addCustomRank', addCustomRank);

    addCustomRank.$inject = ['$location', '$rootScope', '$state','$stateParams','categories','search',
    'dialog','$window','answer','color','pixabay','pexels','$http','table','$timeout','$scope'];

    function addCustomRank(location, $rootScope, $state, $stateParams, categories, search,
     dialog, $window, answer, color, pixabay, pexels, $http, table, $timeout, $scope) {
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
        vm.selImgBank = selImgBank;
        vm.selScopeGeneral = selScopeGeneral;
        vm.imageBanksDialog = imageBanksDialog;
        vm.csel = csel;
        vm.c1sel = true;
        vm.showAlert = false;
        vm.showAddButton = false;
        vm.selImageEnable = 'disabled';
        vm.question = 'Who do you recommend?';    
        
        var itemt = {};
        var item = {};
        var rankTitleOk = true;
        var rankTypeOk = true;
        var rankQuestionOk = true;
        vm.imageLoading = false;
            
        vm.editRank = editRank;
        vm.addRank = addRank;
        
        vm.typeList = ["Person", "Establishment", "Place", "Activity", "Short-Phrase", "Organization", "Event", "Thing","PersonCust"];

        vm.isAdmin = $rootScope.isAdmin;
        var colors = [];
        var ranks = [];
        var idx = 0;
        var idx2 = 0;

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
                vm.selScopeGeneralText = "Choose Scope...";
                vm.selScopeCityText = "San Diego";
                vm.image = $rootScope.EMPTY_IMAGE;
                vm.i = 0;
                vm.step = 1;
                vm.shade = 0;
                setBoxColor(1);
                vm.buttonLabel = 'Add Rank';
                selImgBank(1);
            
            //loadData();
            if ($rootScope.DEBUG_MODE) console.log("addCustomRank page Loaded!");
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

                itemt = {};
                item = {};

                item.category = vm.rankTitle;
                item.type = vm.type;
                item.tags = vm.tags;
                item.question = vm.question;
                item.user = $rootScope.user.id;
                item.timestmp = Date.now();
                item.bc = vm.bc;
                item.fc = vm.fc;
                item.shade = vm.shade;
                item.keywords = '';
                item.fimage = vm.image;
                item.scope = $rootScope.SCOPE;

                categories.addCategory(item).then(function(result){
                    
                    itemt = {};
                    itemt.views = 0;
                    itemt.answers = 0;
                    itemt.numcom = 0;
                    itemt.ismp = true;
                    itemt.isatomic = true;
                    itemt.cat = result.resource[0].id;
                    itemt.nh = 1;
                    itemt.scope = $rootScope.SCOPE;

                    //Create and update slug
                    //Create table record
                    table.addTable(itemt).then(function(resultx){
                        //$timeout(function(){
                        //console.log("result ---> ", resultx.resource[0].id);
                        processImage(itemt.cat);
                        //dialog.getDialog('newRank');
                        var titlemsg = 'Success!';
                        var message = 'Your ranking has been created succesfully! <br><br> Now add items to rank and '+
                        'don\'t forget to share your ranking with other users!';
                        idx2 = resultx;
                        dialog.notificationWithCallback(titlemsg, message, goToNewRank);
                        
                        //},2000);
                    });

                    if ($rootScope.DEBUG_MODE) console.log("category added --- ", result);
                });
            }
        }

        function goToNewRank(){
            $state.go('rankSummary',{index: idx2}); //slug matches filename
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
            if (x == 1) {vm.rankType = 'ESTABLISHMENTS'; vm.type='Establishment';}
            if (x == 2) {vm.rankType = 'PEOPLE'; vm.type='Person';}
            if (x == 3) {vm.rankType = 'ORGANIZATIONS'; vm.type='Organization';}
            if (x == 4) {vm.rankType = 'PLACES'; vm.type='Place';}
            if (x == 5) {vm.rankType = 'OPINIONS'; vm.type='Short-Phrase';}
            if (x == 6) {vm.rankType = 'CONTRACTORS'; vm.type='PersonCust';}
            if (x == 7) {vm.rankType = 'ITEM / OBJECTS'; vm.type='Thing';}
            if (x == 8) {vm.rankType = 'EVENTS'; vm.type='Event';}
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
                if (vm.rankTitle.indexOf('San Diego') < 0 && vm.scopeIsCity){
                    vm.rankTitle = vm.rankTitle + ' in San Diego';
                    var title = 'We made an adjustment';
                    var message = "Because you are adding a City Ranking, we added 'in San Diego' to your Rank Title.";
                    dialog.notificationWithCallback(title,message,getSimilarRanks);
                }
                //if (vm.rankTitle.length < 10) dialog.getDialog('rankTitle'); 
                else getSimilarRanks();
            }
        }

        function getSimilarRanks(){
             vm.similarRanks = search.searchRanks2(vm.rankTitle);
             if (vm.similarRanks.length > 0){
                vm.showAlert = true;
                //$scope.$apply();
             }
             else alertOk();

        }

        function getImages() {
            var qry = vm.imageQuery.replace(' ', '+');
            vm.images = [];
            vm.i = 0;

            if (vm.pixabay) {
                vm.imageLoading = true;
                pixabay.search(qry).then(function (result) {
                    if ($rootScope.DEBUG_MODE) console.log("Pixabay results - ", result);
                    vm.numResults = result.length;

                    for (var i = 0; i < vm.numResults; i++) {
                        vm.images.push(result[i]);
                        //console.log("image i - ", result[i].previewURL);

                    }
                    if (vm.images[vm.i]) {
                        vm.image = vm.images[vm.i].previewURL;
                        vm.selImageEnable = '';
                    }
                    else {
                        vm.selImageEnable = 'disabled';
                        dialog.getDialog('noImages');
                    }

                    vm.imageLoading = false;
                });
            }
            if (vm.pexels) {
                vm.imageLoading = true;
                //pexels.search(qry).then(function (result) {
                pexels.reqFromServer(qry).then(function (res) {
                    
                    var result = res.data.photos; //remove this line for direct query
                    if ($rootScope.DEBUG_MODE) console.log("Pexels results - ", result);
                    vm.numResults = result.length;

                    for (var i = 0; i < vm.numResults; i++) {
                        vm.images.push(result[i]);
                        //console.log("image i - ", result[i].previewURL);
                    }
                    if (vm.images[vm.i]) {
                        vm.image = vm.images[vm.i].src.small;
                        vm.selImageEnable = '';
                    }
                    else {
                        vm.selImageEnable = 'disabled';
                        dialog.getDialog('noImages');
                    }

                    vm.imageLoading = false;
                });
            }
        }

        function nextImg(){
            vm.i = vm.i + 1;
            if (vm.i > vm.images.length -1) vm.i = vm.images.length-1;
            if(vm.pixabay && vm.images[vm.i]) vm.image = vm.images[vm.i].previewURL;
            if(vm.pexels && vm.images[vm.i]) vm.image = vm.images[vm.i].src.small; 
        }

        function prevImg(){
            vm.i = vm.i - 1;
            if (vm.i < 0) vm.i = 0;
            
            if(vm.pixabay && vm.images[vm.i]) vm.image = vm.images[vm.i].previewURL;
            if(vm.pexels && vm.images[vm.i]) vm.image = vm.images[vm.i].src.small; 
        }

        function selectImg(){
            vm.step = 7;
            vm.showAddButton = true;
        }

        function alertOk(){
            vm.showAlert = false;
            vm.step = 4;
            //$scope.$apply();
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

            var fext = '';       
            var cat = category;
            var imageurl = '';
            
            if(vm.pixabay) imageurl = vm.images[vm.i].webformatURL;
            if(vm.pexels) imageurl = vm.images[vm.i].src.medium;

            if (imageurl.indexOf('jpg') > -1) fext = '.jpg';
            if (imageurl.indexOf('png') > -1) fext = '.png';
            if (imageurl.indexOf('jpeg') > -1) fext = '.jpeg';
            
            var filename = vm.rankTitle.toLowerCase(); 
            filename = filename.replace(/ /g,'-');
            filename = filename.replace('?','');
            filename = filename + '-' + cat;

            var fimage = 'https://rankx.blob.core.windows.net/sandiego/featuredImages/' + filename + fext;
            
            processImageExec(imageurl, filename, cat);
            
            /*
            $timeout(function(){
                categories.update(category, ['fimage'], [fimage]);
            },2000);*/
            
            if ($rootScope.DEBUG_MODE) console.log("Process Image - ", cat, imageurl, filename);
            
        }

        function processImageExec(imageurl, filename, category){
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
                    'category': category,                  
                }
            }

            $http(req).then(function (result) {
                if ($rootScope.DEBUG_MODE) console.log("Processing Image Success", result);
                
            }, function (error) {
                if ($rootScope.DEBUG_MODE) console.log("Error Processing Image - ", error);
            });
        }

        function goBack(){
            if ($rootScope.previousState == 'rankSummary')  $state.go('rankSummary', { index: $rootScope.cCategory.slug });
            else if ($rootScope.previousState == 'answerDetail')  $state.go('answerDetail', { index: $rootScope.canswer.slug });
            else $rootScope.$emit('backToResults');
        }

        function selImgBank(x){
            if (x == 1){
                vm.pixabay = true;
                vm.pexels = false;
            }
            if (x == 2){
                vm.pixabay = false;
                vm.pexels = true;
            }
        }

        function selScopeGeneral(x){
            if (x==1) { 
                vm.scopeIsGeneral = true; 
                vm.scopeIsCity = false; 
                vm.selScopeGeneralText = 'General';
            }
            if (x==2) { 
                vm.scopeIsGeneral = false; 
                vm.scopeIsCity = true; 
                vm.selScopeGeneralText = 'City';
            }       
        }

        function imageBanksDialog(){
            dialog.imageBank();
        }
                     
    }
})();
