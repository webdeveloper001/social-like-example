(function () {
    'use strict';

    angular
        .module('app')
        .controller('editRanking', editRanking);

    editRanking.$inject = ['$location', '$rootScope', '$state','$stateParams', '$window','$http','imagelist',
    'table','dialog','catans','color','pixabay'];

    function editRanking(location, $rootScope, $state, $stateParams, $window, $http, imagelist,
    table, dialog, catans, color, pixabay) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'editRanking';

        vm.closeRank = closeRank;
        vm.goEdit = goEdit;
        vm.goDelete = goDelete;
        vm.getImages = getImages;
        vm.plusShade = plusShade;
        vm.minusShade = minusShade;
        vm.shade = 0;
        vm.nextImg = nextImg;
        vm.prevImg = prevImg;
        vm.csel = csel;
        vm.goBack = goBack;
        
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
            console.log("$rootScope.cCategory - ", $rootScope.cCategory);
            vm.ranking = $rootScope.cCategory.title;
            
            $rootScope.rankIsActive = true;
            $rootScope.objNumAct = $rootScope.objNum;
            
            loadData();
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
            if ($rootScope.cCategory.bc) vm.bc = $rootScope.cCategory.bc;
            if ($rootScope.cCategory.fc) vm.fc = $rootScope.cCategory.fc;
            if ($rootScope.cCategory.shade) vm.shade = $rootScope.cCategory.shade;
            if ($rootScope.cCategory.bc) vm.bc2 = color.shadeColor(vm.bc,vm.shade/10);
            if ($rootScope.cCategory.fimage) vm.image = $rootScope.cCategory.fimage;
  
        }
        
         function closeRank() {
               $state.go('cwrapper');                            
        }
        
        function goEdit(){
                        
            var item = JSON.parse(JSON.stringify($rootScope.cCategory));
            var fields = [];
            var vals = [];
            //if title change
            if (item.title != vm.rankTitle) {
                fields.push('title');
                vals.push(vm.rankTitle);
            }
            //if tags change
            if (item.tags != vm.tags) {
                fields.push('tags');
                vals.push(vm.tags);
            }
            //if keywords change
            if (item.keywords != vm.keywords) {
                fields.push('keywords');
                vals.push(vm.keywords);
            }
            //if type change
            if (item.type != vm.type) {
                fields.push('type');
                vals.push(vm.type);
            }
            //if type change
            if (item.question != vm.question) {
                fields.push('question');
                vals.push(vm.question);
            }
            //if type change
            if (item.answertags != vm.answertags) {
                fields.push('answertags');
                vals.push(vm.answertags);
            }
            //if isatomic changes
            if (item.isatomic != vm.isatomic) {
                fields.push('isatomic');
                vals.push(vm.isatomic);
            }
            //if category-string changes
            if (item.catstr != vm.catstr) {
                fields.push('catstr');
                vals.push(vm.catstr);
            }
            //if isatomic changes
            if (item.ismp != vm.ismp) {
                fields.push('ismp');
                vals.push(vm.ismp);
            }
            //if bc changes
            if (item.bc != vm.bc) {
                fields.push('bc');
                vals.push(vm.bc);
            }
            //if fc changes
            if (item.fc != vm.fc) {
                fields.push('fc');
                vals.push(vm.fc);
            }
            //if shade changes
            if (item.shade != vm.shade) {
                fields.push('shade');
                vals.push(vm.shade);
            }

            //if fimage changed
            if (item.fimage != vm.images[vm.i].webformatURL) {
                fields.push('fimage');
                vals.push('https://rankx.blob.core.windows.net/sandiego/featuredImages/'+$rootScope.cCategory.slug+'.jpg');
                //Delete old image from storage if exists
                if (item.fimage){
                    if (item.fimage.indexOf('https://rankx.blob')>-1) imagelist.deleteBlob(item.fimage);
                }
                //Save new image to azure-storage
                processImage();
            }
            
            table.update(item.id, fields, vals);
            closeRank();
        }
        
        function goDelete(){            
            dialog.deleteRank($rootScope.cCategory, confirmDelete);           
        }
        
        function confirmDelete(){
            table.deleteTable($rootScope.cCategory.id);
            catans.deletebyCategory($rootScope.cCategory.id);
            $state.go('cwrapper');
        }

         function getImages(){
            var qry = vm.imageQuery.replace(' ','+');
            vm.i = 0;
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
            var filename = $rootScope.cCategory.slug;
            var imageurl = vm.images[vm.i].webformatURL;
            var rank = $rootScope.cCategory.id;
            
            if ($rootScope.DEBUG_MODE) console.log("Process Image - ", rank, imageurl, filename);
            processImageExec(imageurl, filename, rank);
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
