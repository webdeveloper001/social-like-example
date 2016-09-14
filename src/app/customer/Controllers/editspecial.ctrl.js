(function () {
    'use strict';

    angular
        .module('app')
        .controller('editspecial', editspecial);

    editspecial.$inject = ['$location', '$rootScope', '$state', 'dialog', 'special','datetime'];

    function editspecial(location, $rootScope, $state, dialog, special,datetime) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'editspecial';
        vm.sp = {};
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

        activate();

        function activate() {

            if ($rootScope.specialmode == 'edit') {
                
                //Copy object without reference
                vm.sp = JSON.parse(JSON.stringify($rootScope.cspecial));
                datetime.formatdatetime(vm.sp);
                
                vm.isEdit = true;
                if (vm.sp.freq == 'onetime') frequencySel(1);
                if (vm.sp.freq == 'weekly') frequencySel(2);
                vm.sp.bc = vm.sp.bc;
                vm.sp.fc = vm.sp.fc;

            }

            if ($rootScope.specialmode == 'add') {

                vm.char = 25;
                vm.sp.fc = "hsl(0, 100%, 0%)"; //black
                vm.sp.bc = "hsl(0, 0%, 100%)"; //white
                frequencySel(1);
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
            item.name = 'Your business';
            item.answer = $rootScope.canswer.id;
            item.freq = (vm.onetime ? 'onetime' : 'weekly');

            dialog.createSpecialPreview(item, addSpecial);

        }

        function addSpecial() {
            if (vm.isEdit == false) {
                if (vm.sp.freq == 'onetime'){
                    item.stime2 = null;
                    item.etime2 = null;
                }
                if (vm.sp.freq == 'weekly'){
                    item.stime = null; item.sdate = null;
                    item.etime = null; item.edate = null;
                }
                special.addSpecial(item).then();
                
            }
            else special.updateSpecial(item);
            $state.go('specials');
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
