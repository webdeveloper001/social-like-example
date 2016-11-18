(function () {
    'use strict';

    angular
        .module('app')
        .controller('editvrows', editvrows);

    editvrows.$inject = ['$location', '$rootScope', '$state', 'dialog', 'vrows','vrowvotes'];

    function editvrows(location, $rootScope, $state, dialog, vrows, vrowvotes) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'editvrows';

        var tidx = 99999;

        vm.header = 'Edit Vote Rows for ' + $rootScope.canswer.name;
        vm.editvrowsList = [];
        vm.vrows = [];
        
        //Methods
        vm.addVRowDiag = addVRowDiag;
        vm.addVRowGroupDiag = addVRowGroupDiag;
        vm.deleteVRowDiag = deleteVRowDiag;
        vm.editVRowGroupDiag = editVRowGroupDiag;
        vm.closeRank = closeRank;
        
        activate();

        function activate() {
            vm.vrows = $rootScope.cansvrows;
            displayVRows();
            console.log("editvrows Page loaded!");

        }

        function displayVRows() {

            vm.vrows = [];
            function compare(a, b) {
                return a.gnum - b.gnum;
            }
            if ($rootScope.cansvrows.length > 0) {
                vm.vrows = $rootScope.cansvrows.sort(compare);
                //console.log("length $rootScope.cansvrows--",$rootScope.cansvrows.length);
                vm.vrows[0].shdr = true;
                for (var i = 1; i < vm.vrows.length; i++) {
                    if (vm.vrows[i].gnum == vm.vrows[i - 1].gnum) vm.vrows[i].shdr = false;
                    else vm.vrows[i].shdr = true;
                }
                vm.vrows[vm.vrows.length - 1].saddr = true;
                for (var i = 0; i < vm.vrows.length - 1; i++) {
                    if (vm.vrows[i].gnum != vm.vrows[i + 1].gnum) vm.vrows[i].saddr = true;
                    else vm.vrows[i].saddr = false;
                }
            }
            
        }

        function closeRank() {
            $state.go("answerDetail", { index: $rootScope.canswer.id });
        }

        function getVRows(answerid) {
            $rootScope.cansvrows = [];
            //Load vrows for this answer           
            for (var i = 0; i < $rootScope.cvrows.length; i++) {
                if ($rootScope.cvrows[i].answer == answerid) {
                    $rootScope.cansvrows.push($rootScope.cvrows[i]);
                }
            }
            displayVRows();
        }

        function addVRowDiag(x) {
            dialog.addVRow(x, addVRow);
        }

        function addVRow(x, newname) {
            
            //if title is '-' is a row without title
            var isGroupFirst = false;
            if (x.title == '-') isGroupFirst = true;

            var vrowobj = JSON.parse(JSON.stringify(x));
            vrowobj.id = undefined;
            vrowobj.$$hashKey = undefined;
            vrowobj.upV = 0;
            vrowobj.downV = 0;
            vrowobj.title = newname;

            if (isGroupFirst) {
                var promise = vrows.updateRec(x.id, ['title'], [newname]);

                promise.then(function () {
                    getVRows($rootScope.canswer.id);
                    //displayVRows();
                });
            }
            else {
                var promise2 = vrows.postRec(vrowobj); 
                
                promise2.then(function () {
                    getVRows($rootScope.canswer.id);
                    //displayVRows();
                });

            }

        }

        function deleteVRowDiag(x) {
            dialog.deleteVRow(x, deleteVRow);
        }

        function deleteVRow(x) {
            var promise = vrows.deleteVrow(x.id);
            vrowvotes.deleteVrowVotesbyVrow(x.id);

            promise.then(function () {
                getVRows($rootScope.canswer.id);
                //displayVRows();
            });
        }

        function addVRowGroupDiag() {
           
                var x = vm.vrows[vm.vrows.length - 1];
                dialog.addVRowGroup(x, addVRowGroup);
           
        }

        function addVRowGroup(x, newname) {
            if (vm.vrows.length > 0){
            var vrowobj = JSON.parse(JSON.stringify(x));
            vrowobj.id = undefined;
            vrowobj.$$hashKey = undefined;
            vrowobj.upV = 0;
            vrowobj.downV = 0;
            vrowobj.title = '-';
            vrowobj.gnum = vm.vrows[vm.vrows.length - 1].gnum + 1;
            vrowobj.gtitle = newname;
            }
            else {
                vrowobj = {};
                vrowobj.answer = $rootScope.canswer.id;
                vrowobj.gnum = 0;
                vrowobj.gtitle = newname;
                vrowobj.title = '-';
                vrowobj.upV = 0;
                vrowobj.downV = 0;
            }
            
            var promise = vrows.postRec(vrowobj);

            promise.then(function () {
                getVRows($rootScope.canswer.id);
                //displayVRows();
            });
            // console.log(x);
        }
        
        function editVRowGroupDiag(x){
            dialog.editVRowGroup(x, editVRowGroup, deleteVRowGroupDiag);
        }
        
        function editVRowGroup(x, newgroupname) {

            var nameChanged = false;
            if (x.gtitle != newgroupname) nameChanged = true;

            if (nameChanged) {
                for (var i = 0; i < $rootScope.cansvrows.length; i++) {
                    if ($rootScope.cansvrows[i].gnum == x.gnum) {
                        $rootScope.cansvrows[i].gtitle = newgroupname;
                        vrows.updateRec($rootScope.cansvrows[i].id, ['gtitle'], [newgroupname]);
                    }
                }
                getVRows($rootScope.canswer.id);
            }
        }
        
        function deleteVRowGroupDiag(x){
            dialog.deleteVRowGroup(x, deleteVRowGroup);
        }
        
        function deleteVRowGroup(x){
            
            //delete votes for all vrow in group that is deleted
            /*No need for this, delete votes automatically deleted from call within vrow service
            for (var i=0; i < vm.vrows.length; i++){
                if (vm.vrows[i].gnum == x.gnum){
                    vrowvotes.deleteVrowVotesbyVrow(vm.vrows[i].id);
                }
            }*/
            
            //delete all vrows in that group
            var promise = vrows.deleteVrowByGroup(x.gnum, x.answer);

            promise.then(function () {
                console.log("$rootScope.cvrows - ", $rootScope.cvrows);
                getVRows($rootScope.canswer.id);
                //displayVRows();
            });
            
        }

    }
})();
