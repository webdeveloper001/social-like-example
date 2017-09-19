(function () {
    'use strict';

    angular
        .module('app')
        .controller('editRanking', editRanking);

    editRanking.$inject = ['$location', '$rootScope', '$state','$stateParams', '$window','$http','imagelist',
    'table','dialog','catans','color','pixabay','pexels','categories', '$cookies','APP_API_KEY','answer'];

    function editRanking(location, $rootScope, $state, $stateParams, $window, $http, imagelist,
    table, dialog, catans, color, pixabay, pexels, categories, $cookies, APP_API_KEY, answer) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'editRanking';

        vm.goEdit = goEdit;
        vm.goDelete = goDelete;
        vm.getImages = getImages;
        vm.plusShade = plusShade;
        vm.minusShade = minusShade;
        vm.selImgBank = selImgBank;
        vm.shade = 0;
        vm.nextImg = nextImg;
        vm.prevImg = prevImg;
        vm.csel = csel;
        vm.goBack = goBack;

        var item = {};
        
        vm.typeList = ["Person", "Establishment", "Place", "Activity", "Short-Phrase", "Organization", "Event","Thing","PersonCust"];

        //Adjust picture size for very small displays
        if ($window.innerWidth < 512) { vm.sm = true; vm.nsm = false; }
        else { vm.sm = false; vm.nsm = true; }
        
        activate();

        function activate() {
            
            //Load current category
            $rootScope.cCategory = {};
            for (var i = 0; i < $rootScope.content.length; i++) {
                if (($rootScope.content[i].id == $stateParams.index) || ($rootScope.content[i].slug == $stateParams.index)) {
                    $rootScope.cCategory = $rootScope.content[i];
                    break;
                }
            }

            item = JSON.parse(JSON.stringify($rootScope.cCategory));
            if ($rootScope.DEBUG_MODE) console.log("$rootScope.cCategory - ", $rootScope.cCategory);
            vm.ranking = $rootScope.cCategory.title;
            
            $rootScope.rankIsActive = true;
            $rootScope.objNumAct = $rootScope.objNum;
            
            loadData();
            selImgBank(1);
            if ($rootScope.DEBUG_MODE) console.log("editRanking page Loaded!");

        }

        function loadData() {
            //Load current category

            vm.rankTitle = $rootScope.cCategory.title;
            vm.tags = $rootScope.cCategory.tags;
            vm.keywords = $rootScope.cCategory.keywords;
            vm.type = $rootScope.cCategory.type;
            vm.question = $rootScope.cCategory.question;
            vm.answertags = $rootScope.cCategory.answertags;
            vm.isatomic = $rootScope.cCategory.isatomic;
            vm.catstr = $rootScope.cCategory.catstr;
            vm.ismp = $rootScope.cCategory.ismp;
            vm.scope = $rootScope.cCategory.scope;
            vm.image = $rootScope.cCategory.fimage;
            if ($rootScope.cCategory.bc) vm.bc = $rootScope.cCategory.bc;
            if ($rootScope.cCategory.fc) vm.fc = $rootScope.cCategory.fc;
            if ($rootScope.cCategory.shade) vm.shade = $rootScope.cCategory.shade;
            if ($rootScope.cCategory.bc) vm.bc2 = color.shadeColor(vm.bc,vm.shade/10);
            if ($rootScope.cCategory.fimage) vm.image = $rootScope.cCategory.fimage;
  
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
        
        function goEdit(){
                        
           
            var fields = [];
            var vals = [];
            var fieldsc = [];
            var valsc = [];
            //if title change
            if (item.title != vm.rankTitle) {

                //Determine original title of category
                var idx = $rootScope.categories.map(function(x) {return x.id; }).indexOf(item.cat);
                var titleo = $rootScope.categories[idx].category;
                var titlex = vm.rankTitle;
                //if this was a generic ranking
                if (titleo.indexOf('@Nh')>-1){
                    var idx2 = $rootScope.locations.map(function(x) {return x.id; }).indexOf(item.nh);
                    var location = $rootScope.locations[idx2].nh_name;
                    titlex = vm.rankTitle.replace(location, '@Nh');
                }
                fieldsc.push('category');
                valsc.push(titlex);
                if ($rootScope.DEBUG_MODE) console.log("tablex - ", titlex);
                fields.push('title');
                vals.push(titlex);
                //console.log("tablex - ", titlex);
            }
            //if tags change
            if (item.tags != vm.tags) {
                fieldsc.push('tags');
                valsc.push(vm.tags);
            }
            //if keywords change
            if (item.keywords != vm.keywords) {
                fieldsc.push('keywords');
                valsc.push(vm.keywords);
            }
            //if type change
            if (item.type != vm.type) {
                fieldsc.push('type');
                valsc.push(vm.type);
            }
            //if type change
            if (item.question != vm.question) {
                fieldsc.push('question');
                valsc.push(vm.question);
            }
            //if type change
            //if (item.answertags != vm.answertags) {
            //    fields.push('answertags');
            //    vals.push(vm.answertags);
            //}
            //if isatomic changes
            //if (item.isatomic != vm.isatomic) {
            //    fields.push('isatomic');
            //    vals.push(vm.isatomic);
            //}
            //if category-string changes
            if (item.catstr != vm.catstr) {
                fields.push('catstr');
                vals.push(vm.catstr);
            }
            //if isatomic changes
            if (item.ismp != vm.ismp) {
                fieldsc.push('ismp');
                valsc.push(vm.ismp);
            }
            //if bc changes
            if (item.bc != vm.bc) {
                fieldsc.push('bc');
                valsc.push(vm.bc);
            }
            //if fc changes
            if (item.fc != vm.fc) {
                fieldsc.push('fc');
                valsc.push(vm.fc);
            }
            //if shade changes
            if (item.shade != vm.shade) {
                fieldsc.push('shade');
                valsc.push(vm.shade);
            }
            //if image changed via form
            if (item.fimage != vm.image) {
                fieldsc.push('fimage');
                valsc.push(vm.image);
            }
            if (item.scope != vm.scope) {
                fieldsc.push('scope');
                valsc.push(vm.scope);
                fields.push('scope');
                vals.push(vm.scope);
                changeScopeofAnswers();
                changeScopeofAnswers()
            }

            //if fimage changed
            if(vm.images){
                    //Save new image to azure-storage
                    processImage();
            }
            if (fields) {
                if ($rootScope.DEBUG_MODE) console.log("fields - ", fields, vals);
                table.update(item.id, fields, vals);
            }
            if (fieldsc) {
                if ($rootScope.DEBUG_MODE) console.log("fieldsc - ", fieldsc, valsc);
                categories.update(item.cat, fieldsc, valsc);
            }
            goBack();
        }
        
        function goDelete(){            
            dialog.deleteRank($rootScope.cCategory, confirmDelete);           
        }
        
        function confirmDelete(){
            //Delete image if stored in azure
            if (vm.image != null && vm.image != undefined ){
                if (vm.image.indexOf('https://rankx.blob') > -1) imagelist.deleteBlob(vm.image);
            }
            if ($rootScope.cCategory.nh == 1) categories.deleteRec($rootScope.cCategory.cat);
            catans.deletebyCategory($rootScope.cCategory.id);
            table.deleteTable($rootScope.cCategory.id);
            
            goBack();
        }

        function getImages() {
            var qry = vm.imageQuery.replace(' ', '+');
            vm.i = 0;
            vm.images = [];
            //If Image bank is Pixabay
            if (vm.pixabay) {
                pixabay.search(qry).then(function (result) {
                    if ($rootScope.DEBUG_MODE) console.log("Pixabay results - ", result);
                    vm.numResults = result.length;

                    for (var i = 0; i < vm.numResults; i++) {
                        vm.images.push(result[i]);
                        //console.log("image i - ", result[i].previewURL);
                    }
                    vm.image = vm.images[vm.i].previewURL;
                });
            }
            //If Image bank is Pexels
            if (vm.pexels) {
                //pexels.search(qry).then(function (result) {
                    pexels.reqFromServer(qry).then(function (res) {
                    var result = res.data.photos; //remove this line for direct query
                    
                    if ($rootScope.DEBUG_MODE) console.log("Pexels results - ", result);
                    vm.numResults = result.length;

                    for (var i = 0; i < vm.numResults; i++) {
                        vm.images.push(result[i]);
                        //console.log("image i - ", result[i].previewURL);
                    }
                    vm.image = vm.images[vm.i].src.small;
                });
            }

        }

        function nextImg(){
            vm.i = vm.i + 1;
            if (vm.i > vm.images.length -1) vm.i = vm.images.length-1;
            
            if (vm.pixabay) vm.image = vm.images[vm.i].previewURL;
            if (vm.pexels) vm.image = vm.images[vm.i].src.small;
                 
        }

        function prevImg(){
            vm.i = vm.i - 1;
            if (vm.i < 0) vm.i = 0;

            if (vm.pixabay) vm.image = vm.images[vm.i].previewURL;
            if (vm.pexels) vm.image = vm.images[vm.i].src.small;
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

        function processImage(){

            var img = '';
            if ($rootScope.DEBUG_MODE) console.log("fimage changed");

            if (vm.pixabay) img = vm.images[vm.i].webformatURL;
            if (vm.pexels) img = vm.images[vm.i].src.medium;

            if (item.fimage != img) {

            var ext = '';
            if (img.indexOf('.jpeg') > -1) ext = '.jpeg';
            if (img.indexOf('.jpg') > -1) ext = '.jpg';
            if (img.indexOf('.png') > -1) ext = '.png';

            var imagefilename = $rootScope.cCategory.title.toLowerCase(); 
                imagefilename = imagefilename.replace(/ /g,'-');
                imagefilename = imagefilename.replace('/','at');
                imagefilename = imagefilename.replace('?','');
       
                //fieldsc.push('fimage');
                //valsc.push('https://rankx.blob.core.windows.net/sandiego/featuredImages/' + imagefilename + ext);
                //Delete old image from storage if exists
                if (item.fimage) {
                    if (item.fimage.indexOf('https://rankx.blob') > -1) {

                        try { imagelist.deleteBlob(item.fimage); }
                        catch (err) { console.log('Error deleting existing image: ', (err)); }
                    }
                }

            var cat = $rootScope.cCategory.cat;
            
            if ($rootScope.DEBUG_MODE) console.log("Process Image - ", cat, img, imagefilename);
            processImageExec(img, imagefilename, cat);
            }

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
                    'category': rank,                  
                }
            }

            $http(req).then(function (result) {
                if ($rootScope.DEBUG_MODE) console.log("Processing Image Success", result);
                
            }, function (error) {
                $http.defaults.headers.common['X-Dreamfactory-API-Key'] = APP_API_KEY;
                $http.defaults.headers.common['X-DreamFactory-Session-Token'] = $cookies.session_token;
                if ($rootScope.DEBUG_MODE) console.log("Error Processing Image - ", error);
            });
        }

        function changeScopeofAnswers(){
            console.log("change Scope of Answres");
            for (var i=0; i<$rootScope.catansrecs.length; i++){
                if ($rootScope.catansrecs[i].category == $rootScope.cCategory.id){
                    //console.log('Catans: ',$rootScope.catansrecs[i].id, $rootScope.catansrecs[i].category,$rootScope.catansrecs[i].answer);
                    //console.log('Change scope of answer: ',$rootScope.catansrecs[i].answer, ' to ', vm.scope);
                    var idx = $rootScope.answers.map(function(x) {return x.id; }).indexOf($rootScope.catansrecs[i].answer); 
                    if (idx > -1) answer.updateAnswer($rootScope.catansrecs[i].answer,['scope'],[vm.scope]);
                }
            }
        }

        function goBack(){
            //$state.go('cwrapper');
            $rootScope.$emit('backToResults');
        }      
    }
})();
