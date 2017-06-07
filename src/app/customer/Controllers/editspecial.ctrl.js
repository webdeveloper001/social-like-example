(function () {
    'use strict';

    angular
        .module('app')
        .controller('editspecial', editspecial);

    editspecial.$inject = ['$location', '$rootScope', '$state', 'dialog', 'special','datetime','$scope'];

    function editspecial(location, $rootScope, $state, dialog, special,datetime, $scope) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'editspecial';
        vm.sp = {};
        var spx = {}; //special as loaded
        var item = {};
        
        //Methods
        vm.displayCharLength = displayCharLength;
        vm.frequencySel = frequencySel;
        vm.showPreview = showPreview;
        vm.deleteSpecial = deleteSpecial;
        vm.goBack = goBack;
        vm.closeRank = closeRank;
        vm.header = $rootScope.canswer.name;

        vm.isEdit = false;
        vm.userIsOwner = $rootScope.userIsOwner;
        
         var fileUploadedListener = $rootScope.$on('fileUploaded', function (event, data){            
            console.log("Received fileUploaded", data);
            console.log('$state.current.name - ',$state.current.name);
            if ($state.current.name == 'editspecial') {
                console.log("loaded date to vm.imageURL");
                vm.imageURL = data;
            }
        });

        $scope.$on('$destroy',fileUploadedListener);

        activate();

        function activate() {

            if ($rootScope.specialmode == 'edit') {
                
                //Copy object without reference
                vm.sp = JSON.parse(JSON.stringify($rootScope.cspecial));
                spx = JSON.parse(JSON.stringify($rootScope.cspecial));
                datetime.formatdatetime(vm.sp);
                
                vm.isEdit = true;
                if (vm.sp.freq == 'onetime') frequencySel(1);
                if (vm.sp.freq == 'weekly') frequencySel(2);
                vm.sp.bc = vm.sp.bc;
                vm.sp.fc = vm.sp.fc;
                if (vm.sp.image != undefined) vm.imageURL = vm.sp.image;
                else vm.imageURL = $rootScope.EMPTY_IMAGE; 
                
            }

            if ($rootScope.specialmode == 'add') {

                vm.char = 25;
                vm.sp.fc = "hsl(0, 100%, 0%)"; //black
                vm.sp.bc = "hsl(0, 0%, 100%)"; //white
                frequencySel(1);
                vm.imageURL = $rootScope.EMPTY_IMAGE;
            }

            createTimeDropdown();

            console.log("editspecial page Loaded!");

        }

        function displayCharLength() {
            vm.char = 25 - vm.sp.stitle.length;
        }

        function frequencySel(x) {
            if (x == 1) {
                vm.weekly = false;
                vm.onetime = true;
                vm.sp.freq = 'onetime';
            }
            if (x == 2) {
                vm.weekly = true;
                vm.onetime = false;
                vm.sp.freq = 'weekly';
            }
        }

        function showPreview() {
            item = vm.sp;
            item.name = $rootScope.canswer.name;
            item.answer = $rootScope.canswer.id;
            item.image = vm.imageURL;
            item.freq = (vm.onetime ? 'onetime' : 'weekly');

            dialog.createSpecialPreview(item, addSpecial);

        }

        function addSpecial() {
            if (vm.sp.freq == 'onetime') {
                item.stime2 = null;
                item.etime2 = null;
            }
            if (vm.sp.freq == 'weekly') {
                item.stime = null; item.sdate = null;
                item.etime = null; item.edate = null;
            }
            if (vm.isEdit == false) {
                special.addSpecial(item).then(function(){
                    $state.go('specials');
                });
            }
            else {
                //update special
                var fields = [];
                var vals = [];
                console.log("spx, vm.sp", spx, vm.sp);

                if (spx.bc != vm.sp.bc) { fields.push('bc'); vals.push(vm.sp.bc); }
                if (spx.fc != vm.sp.fc) { fields.push('fc'); vals.push(vm.sp.fc); }
                if (spx.edate != vm.sp.edate) { fields.push('edate'); vals.push(vm.sp.edate); }
                if (spx.etime != vm.sp.etime) { fields.push('etime'); vals.push(vm.sp.etime); }
                if (spx.etime2 != vm.sp.etime2) { fields.push('etime2'); vals.push(vm.sp.etime2); }
                if (spx.sdate != vm.sp.sdate) { fields.push('sdate'); vals.push(vm.sp.sdate); }
                if (spx.stime != vm.sp.stime) { fields.push('stime'); vals.push(vm.sp.stime); }
                if (spx.stime2 != vm.sp.stime2) { fields.push('stime2'); vals.push(vm.sp.stime2); }
                if (spx.stitle != vm.sp.stitle) { fields.push('stitle'); vals.push(vm.sp.stitle); }
                if (spx.image != vm.imageURL) { fields.push('image'); vals.push(vm.imageURL); }
                if (spx.name != vm.sp.name) { fields.push('name'); vals.push(vm.sp.name); }
                if (spx.details != vm.sp.details) { fields.push('details'); vals.push(vm.sp.details); }
                if (spx.freq != vm.sp.freq) { fields.push('freq'); vals.push(vm.sp.freq); }
                if (spx.mon != vm.sp.mon) { fields.push('mon'); vals.push(vm.sp.mon); }
                if (spx.tue != vm.sp.tue) { fields.push('tue'); vals.push(vm.sp.tue); }
                if (spx.wed != vm.sp.wed) { fields.push('wed'); vals.push(vm.sp.wed); }
                if (spx.thu != vm.sp.thu) { fields.push('thu'); vals.push(vm.sp.thu); }
                if (spx.fri != vm.sp.fri) { fields.push('fri'); vals.push(vm.sp.fri); }
                if (spx.sat != vm.sp.sat) { fields.push('sat'); vals.push(vm.sp.sat); }
                if (spx.sun != vm.sp.sun) { fields.push('sun'); vals.push(vm.sp.sun); }

                console.log("fields, vals", fields, vals);
                special.updateSpecial(item.id, fields, vals).then(function(){
                    $state.go('specials');
                });
            }
            
        }
        
       function deleteSpecial() {
            special.deleteSpecial(vm.sp.id);
            $state.go('specials');
        }

        function goBack() {
            $state.go('specials');
        }

        function createTimeDropdown() {

            vm.timeDD = ["7:00 AM", "7:30 AM", "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
                "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM",
                "8:00 PM", "8:30 PM", "9:00 PM", "9:30 PM", "10:00 PM", "10:30 PM", "11:00 PM", "11:30 PM", "12:00 AM", "12:30 AM", "1:00 AM", "1:30 AM",
                "2:00 AM", "2:30 AM", "3:00 AM", "3:30 AM", "4:00 AM", "4:30 AM", "5:00 AM", "5:30 AM", "6:00 AM", "6:30 AM"];
        }
        
        function closeRank() {
               $state.go("answerDetail", { index: $rootScope.canswer.id });                              
        }
    }
})();
