(function () {
    'use strict';

    angular
        .module('app')
        .controller('rodconsole', rodconsole);

    rodconsole.$inject = ['$location', '$rootScope', '$state','rankofday','color',
    'datetime','dialog','$q','table','imagelist','categories'];

    function rodconsole(location, $rootScope, $state, rankofday, color,
     datetime, dialog, $q, table, imagelist, categories) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'rodconsole';

        //Methods
        vm.selRank = selRank;
        vm.goBack = goBack;
        vm.plusShade = plusShade;
        vm.minusShade = minusShade;
        vm.refreshImages = refreshImages;
        vm.filterData = filterData;
        vm.goSaveImage = goSaveImage;
        vm.goSaveText = goSaveText;
        vm.goDeleteImage = goDeleteImage;
        vm.addCategory = addCategory;

        vm.dataReady = false;
        var rods = [];
        var todaydatenum = 0;
        vm.overview = true;
        vm.detail = false;
        vm.rank = {};
        vm.sm = $rootScope.sm;
        vm.allIsSelected = true;
        vm.next20IsSelected = false;
        vm.loadText = "Loading data..."
        var fimageExists = false;

        $rootScope.canswer = {};
        $rootScope.canswer.id = 'featuredImages';
        vm.testimage = $rootScope.EMPTY_IMAGE;

        var hexcolor = '';

        $rootScope.$on('fileUploaded', function (event, data){
                $rootScope.cmd1exe = $rootScope.cmd1exe ? $rootScope.cmd1exe : false;
                if ($state.current.name == 'rodconsole' && !$rootScope.cmd1exe) {
                $rootScope.cmd1exe = true;
                $rootScope.blobimage = data;
                refreshImages();                
            }
        });

        dialog.enterPassword(activate,goHome);
        
        //activate();
        
        function activate() {

            //get todays date
            var datenow = new Date();
            var tz = datenow.getTimezoneOffset();
            datenow.setMinutes( datenow.getMinutes() - tz);
            function pad(n) {return n < 10 ? n : n;}
            var dateStr = pad(datenow.getMonth()+1)+"/"+pad(datenow.getDate())+"/"+datenow.getFullYear();
            todaydatenum = datetime.date2number(dateStr);

            loadData2();
            if ($rootScope.DEBUG_MODE) console.log("rodconsole page Loaded!");
            
        }

        function loadData2(){
            rods = [];
            rankofday.getall().then(function(result){
                rods = result;
                rods.forEach(function(obj){
                    obj.datenum = datetime.date2number(obj.date);
                    //console.log("obj - ", obj);
                    if (obj.category){
                        //console.log("obj.category - ", obj.category);
                        var idx = $rootScope.categories.map(function(x) {return x.id; }).indexOf(obj.category);
                         if (idx > -1){
                        obj.title = $rootScope.categories[idx].category.replace('@Nh','San Diego');
                        obj.fimage = $rootScope.categories[idx].fimage;
                        
                        if (!obj.introtext){
                        if ($rootScope.categories[idx].introtext != null &&
                            $rootScope.categories[idx].introtext != undefined &&
                            $rootScope.categories[idx].introtext != '' ) 
                        
                            obj.introtext = $rootScope.categories[idx].introtext;
                        }
                        obj.fc = $rootScope.categories[idx].fc;
                        obj.bc = $rootScope.categories[idx].bc;
                        obj.shade = $rootScope.categories[idx].shade;
                    }

                    if (obj.fimage != undefined && obj.fimage != '') obj.imageok = true;
                    else obj.imageok = false;

                    if (obj.introtext != undefined && obj.introtext != '') obj.textok = true;
                    else obj.textok = false;
                    }
                });
                vm.dataReady = true;
                vm.rods = rods;
            });
            vm.addopts = [];
            for (var i=0; i< $rootScope.categories.length; i++){
                vm.addopts.push($rootScope.categories[i].category);
            }
           
        }

        function addCategory(){
            for (var i=0; i< $rootScope.categories.length; i++){
                if (vm.addval == $rootScope.categories[i].category){
                    console.log(vm.rank.id, vm.addval);
                    rankofday.update(vm.rank.id,['category'],[$rootScope.categories[i].id]);
                }
            }
        }
    /*
        function loadData(){

            var res = [];
            rods = [];

            rankofday.getall().then(function(result){
                rods = result;
                for (var i=0; i< rods.length; i++){
                    res = searchRanking(rods[i].main);
                    if(res[0]){
                        rods[i].title = res[0].title;
                        rods[i].rankid = res[0].id;
                        rods[i].fimage = res[0].fimage;
                        rods[i].bc = res[0].bc;
                        rods[i].fc = res[0].fc;
                        rods[i].shade = res[0].shade;
                        rods[i].image1 = res[0].image1url;
                        rods[i].image2 = res[0].image2url;
                        rods[i].image3 = res[0].image3url;
                        rods[i].isatomic = res[0].isatomic;
                        rods[i].webtext = res[0].introtext;
                        rods[i].datenum = datetime.date2number(rods[i].date);
                        
                        if (rods[i].bc == undefined || rods[i].bc == ''){
                            var colors = color.defaultRankColor(res[0]);
                            rods[i].bc = colors[0];
                            rods[i].fc = colors[1];
                            rods[i].shade = 0;
                        }
                        if (rods[i].fimage != undefined && rods[i].fimage != '') {
                            rods[i].imageok = true;
                            fimageExists = true;
                        }
                        else {
                            rods[i].imageok = false;
                            fimageExists = false;
                        }
                        if (rods[i].introtext != undefined && rods[i].introtext != ''){
                            rods[i].textok = true;
                        }
                        else rods[i].textok = false;
                    }                                   
                }
                sortByDate();
                filterData();
                vm.dataReady = true;
            });

        }*/

        function filterData(x){
            if (x == "all"){
                vm.next20IsSelected = false;
                vm.allIsSelected = true;
            }
            if (x == "next20"){
                vm.next20IsSelected = true;
                vm.allIsSelected = false;
            } 
            
            vm.rods = [];
            if (vm.next20IsSelected){
                for (var i=0; i<rods.length; i++){
                    if (rods[i].datenum >= todaydatenum)
                        vm.rods.push(rods[i]);
                }
            }
            else vm.rods = rods;
        }

        function searchRanking(x) {

            var valTags = x.split(" ");
            var rt = '';
            var results = [];

            for (var j = 0; j < $rootScope.content.length; j++) {
                
                var r = true;
                rt = $rootScope.content[j].title;
                
                //check that all tags exist
                for (var k = 0; k < valTags.length; k++) {
                    
                    var tagCapitalized = valTags[k].charAt(0).toUpperCase() + valTags[k].slice(1);
                    var tagFirstLowered = valTags[k].charAt(0).toLowerCase() + valTags[k].slice(1);
                    
                    r = r && ((rt.indexOf(valTags[k]) > -1) || (rt.indexOf(valTags[k].toUpperCase()) > -1) ||
                        (rt.indexOf(tagCapitalized) > -1) || (rt.indexOf(tagFirstLowered) > -1));
                }
                if (r) {
                    results.push($rootScope.content[j]);
                    break;
                }
            }
            return results;
        }

        function selRank(x){
            vm.overview = false;
            vm.detail = true;
            vm.addval = '';
            vm.rank = x;
            if (vm.rank.fimage != undefined && vm.rank.fimage != ''){
                vm.rank.image3 = vm.rank.image2;
                vm.rank.image2 = vm.rank.image1;
                vm.rank.image1 = vm.rank.fimage;
            }
            console.log("selRank", vm.rank);
            console.log(vm.rank.bc);
            if (vm.rank.bc != null){
                if (vm.rank.bc.charAt(0) != 'h') hexcolor = vm.rank.bc;
                else hexcolor = color.hsl2rgb(vm.rank.bc);
                vm.rank.bc2 = color.shadeColor(hexcolor, vm.rank.shade/10);
            }
            else{
                vm.rank.bc = 'hsl(240, 100%, 99%)';
                vm.rank.bc2 = color.shadeColor(vm.rank.bc, -3/10);
            }
            $rootScope.cmd1exe = false;
            

        }

        function goBack(){
            vm.overview = true;
            vm.detail = false;
        }

        function goHome(){
            $rootScope.$emit('backToResults');
            //$state.go('cwrapper');
        }

        function plusShade(){
            vm.rank.shade = vm.rank.shade + 1;
            if  (vm.rank.shade > 10 ) vm.rank.shade = 10;
            hexcolor = color.hsl2rgb(vm.rank.bc);
            vm.rank.bc2 = color.shadeColor(hexcolor, vm.rank.shade/10);
        }

        function minusShade(){
            vm.rank.shade = vm.rank.shade - 1;
            if  (vm.rank.shade < -10 ) vm.rank.shade = -10;
            hexcolor = color.hsl2rgb(vm.rank.bc);
            vm.rank.bc2 = color.shadeColor(hexcolor, vm.rank.shade/10);
        }

        function refreshImages(){
            if (fimageExists){
                vm.rank.fimage = $rootScope.blobimage;
                vm.rank.image1 = vm.rank.fimage;        
            }
            else {
                vm.rank.fimage = $rootScope.blobimage;
                vm.rank.image3 = vm.rank.image2;
                vm.rank.image2 = vm.rank.image1;
                vm.rank.image1 = vm.rank.fimage;
            }
            $rootScope.cmd1exe = false;
        }

         function sortByDate() {
            function compare(a, b) {

               var d1 = datetime.date2number(a.date);
               var d2 = datetime.date2number(b.date);
             
               return d1 - d2;
            }

            rods = rods.sort(compare);
        }

        function goSaveImage(){

            if (vm.rank.fimage != undefined && vm.rank.fimage != ''){
            var fields = ['fimage','bc','fc','shade'];
            
            //If color is in HSL, change color to RGB
            if (vm.rank.bc.charAt(0) == 'h') vm.rank.bc = color.hsl2rgb(vm.rank.bc);
            if (vm.rank.fc.charAt(0) == 'h') vm.rank.fc = color.hsl2rgb(vm.rank.fc);

            var vals = [vm.rank.fimage, vm.rank.bc, vm.rank.fc, vm.rank.shade];
            var traw = '';  //raw title (no location)
            var promiseArray = [];
            
                if (!vm.rank.isatomic){
                    vm.dataReady = false;
                    vm.loadText = 'Saving data...';
                    traw = vm.rank.title.replace(' in San Diego','');
                        for (var i=0; i<$rootScope.content.length; i++){
                            if ($rootScope.content[i].title.indexOf(traw)>-1){
                                //console.log("rank:",$rootScope.content[i].title);
                                //table.update($rootScope.content[i].id,fields, vals);
                                promiseArray.push(table.update($rootScope.content[i].id,fields, vals));
                            }
                        }
                        
                        $q.all(promiseArray).then(function(){
                            vm.dataReady = true;
                            dialog.getDialog('rodimageuploadsuccess');
                            loadData();
                            goBack();
                        });
                }
                else {
                    console.log("rank:",vm.rank.title);
                    table.update(vm.rank.rankid,fields, vals).then(function(){
                        dialog.getDialog('rodimageuploadsuccess');
                        loadData();
                        goBack();
                    });
                }
            }
            else dialog.getDialog('nouploadedimage');
        }

        function goSaveText(){
            
            //Save intro text in category record
            categories.update(vm.rank.category,['introtext'],[vm.rank.introtext]).then(function(){
                dialog.getDialog('introTextSaved');
                loadData2();
            });

            //temporarily flush records from rank of day. Field 'introtext' in rankofday table will be deleted
            var texthold = vm.rank.introtext;
            rankofday.update(vm.rank.id,['introtext'],['']).then(function(){
            //    dialog.getDialog('introTextSaved');
            //    loadData();
            });
            if (vm.rank.introtext == '') vm.rank.introtext = texthold;
        }

        function goDeleteImage(){
            if (vm.rank.fimage != undefined && vm.rank.fimage != ''){
            //Delete image from Azure Storage
            imagelist.deleteBlob(vm.rank.fimage);

            //Find ranking to determine original default colors
            var idx = $rootScope.content.map(function(x) {return x.id; }).indexOf(vm.rank.rankid);
            var colors = color.defaultRankColor($rootScope.content[idx]);
            var fields = ['fimage','bc','fc','shade'];
            var vals = ['', colors[0], colors[1], 0];
            var traw = '';  //raw title (no location)
            var promiseArray = [];
            
                if (!vm.rank.isatomic){
                    vm.dataReady = false;
                    vm.loadText = 'Deleting image...';
                    traw = vm.rank.title.replace(' in San Diego','');
                        for (var i=0; i<$rootScope.content.length; i++){
                            if ($rootScope.content[i].title.indexOf(traw)>-1){
                                //console.log("rank:",$rootScope.content[i].title);
                                //table.update($rootScope.content[i].id,fields, vals);
                                promiseArray.push(table.update($rootScope.content[i].id,fields, vals));
                            }
                        }
                        
                        $q.all(promiseArray).then(function(){
                            vm.dataReady = true;
                            dialog.getDialog('rodimagedeletesuccess');
                            loadData();
                            goBack();
                        });
                }
                else {
                    //console.log("rank:",vm.rank.title);
                    table.update(vm.rank.rankid,fields, vals).then(function(){
                        dialog.getDialog('rodimagedeletesuccess');
                        loadData();
                        goBack();
                    });
                }
            }
            else dialog.getDialog('nouploadedimage');          
        }                  
    }
})();
