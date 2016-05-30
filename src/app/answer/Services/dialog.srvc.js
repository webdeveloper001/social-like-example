(function () {
    'use strict';

    angular
        .module('app')
        .factory('dialog', dialog);

    dialog.$inject = ['$q', '$rootScope'];

    function dialog($q, $rootScope) {

        var service = {
            editConfirm: editConfirm,
            getDialog: getDialog,
            showDialog: showDialog,
            howItWorks: howItWorks,
            addAnswer: addAnswer,
            showAddAnswer: showAddAnswer,
            editChangeEffective: editChangeEffective,
            url: url
        };

        return service;

        function showDialog(title, text) {
            BootstrapDialog.show({
                type: BootstrapDialog.TYPE_PRIMARY,
                title: title,
                message: text,
                buttons: [{
                    id: 'btn-ok',
                    label: 'OK',
                    cssClass: 'btn-primary',
                    autospin: false,
                    action: function (dialogRef) {
                        dialogRef.close();
                    }
                }]
            });
        }

        function getDialog(x) {

            var title = $rootScope.dialogs['dialog.' + x + '.title'];
            var text = $rootScope.dialogs['dialog.' + x + '.text'];

            showDialog(title, text);
        }


        function editConfirm(edit, type, callback) {

            var title = '';
            var message = '';
            var btnCancelLabel = '';
            var btnOkLabel = '';

            title = 'Please Confirm';
            btnCancelLabel = 'Cancel';
            btnOkLabel = 'Confirm';
            if (type == 'image') {
                message = 'You want to change the image of <strong><em>' + edit.name + '</em></strong> to this one: </br>' +
                '<img src=' + edit.imageURL + ' class="thumbnail" style="width:60%; max-height:150px">';
            }
            if (type == 'field') {
                message = 'You want to change the <strong class="capitalize"><em>' + edit.field +
                '</em></strong> of <strong><em>' + edit.name + '</em></strong> to <strong><em>' + edit.nval + '</em></strong>.';
            }

            BootstrapDialog.confirm({
                type: BootstrapDialog.TYPE_PRIMARY,
                title: title,
                message: message,
                closable: true, // <-- Default value is false
                draggable: true, // <-- Default value is false
                btnCancelLabel: btnCancelLabel,
                btnOKLabel: btnOkLabel,
                btnOKClass: 'btn-primary',
                btnCancelAction: function (dialogRef) {
                    dialogRef.close();
                },
                callback: function (result) {
                    if (result) callback(edit);
                }
            });

        }

        function addAnswer(answer, url, callback) {

            var answerhtml = '';
            var categoryhtml = '';
            var newline = '';
            var header = "table" + $rootScope.cCategory.id + ".header";

            for (var i = 0; i < $rootScope.fields.length; i++) {
                switch ($rootScope.fields[i].name) {
                    case "name": {
                        newline = '<strong class="capitalize">' + 'Name' + '</strong>: ' + answer.name + '</br>';
                        break;
                    }
                    case "location": {
                        if (answer.location) newline = '<strong class="capitalize">' + 'Location' + '</strong>: ' + answer.location + '</br>';
                        else newline = '<strong>' + 'Location' + '</strong>: ' + '' + '</br>';
                        break;
                    }
                    case "cityarea": {
                        //newline = '<strong class="capitalize">'+addinfo+'</strong>: ' + $rootScope.cCountries[answer.cnum] + '</br>';
                        newline = '<strong class="capitalize">' + 'City Area' + '</strong>: ' + answer.cityarea + '</br>';
                        break;
                    }
                    case "addinfo": {
                        if (answer.addinfo) newline = '<strong class="capitalize">' + 'Additional Info' + 'b</strong>: ' + answer.addinfo + '</br>';
                        else newline = '<strong>' + 'Additional Info' + '</strong>: ' + '' + '</br>';
                        break;
                    }
                }
                answerhtml = answerhtml + newline;
            }

            showAddAnswer(answer, categoryhtml, answerhtml, url, callback);
            //console.log("headline ", categoryhtml)
       
        }
        function showAddAnswer(answer, categoryhtml, answerhtml, imageurl, callback) {

            var title = '';
            var message = '';
            var btnCancelLabel = '';
            var btnOkLabel = '';

            title = 'Please Confirm';
            btnCancelLabel = 'Cancel';
            btnOkLabel = 'Confirm';
            message = 'You want to add the following answer to <strong>' + $rootScope.header + '</strong>. </br></br>' +
            answerhtml + '</br>' +
            'With the following image:' +
            '<img src=' + imageurl + ' class="thumbnail" style="width:60%; max-height:150px">';

            BootstrapDialog.confirm({
                type: BootstrapDialog.TYPE_PRIMARY,
                title: title,
                message: message,
                closable: true, // <-- Default value is false
                draggable: true, // <-- Default value is false
                btnCancelLabel: btnCancelLabel,
                btnOKLabel: btnOkLabel,
                btnOKClass: 'btn-primary',
                btnCancelAction: function (dialogRef) {
                    dialogRef.close();
                },
                //callback: function (dialogRef, result) {
                callback: function (result) {
                    if (result) callback(answer);
                    //dialogRef.close();
                }
            });
        }

        function editChangeEffective(edit, index, type, callback) {

            var title = '';
            var message = '';

            if (type == 'approve') {

                title = 'Changed Approved';
                message = 'Congrats! With your vote, the change of <strong>' + edit.field + '</strong> of <strong>' +
                edit.name + '</strong> to <strong>' + edit.nval + '</strong> gets approved.';

            }
            if (type == 'reject') {

                title = 'Changed Rejected';
                message = 'Congrats! With your vote, the change of <strong>' + edit.field + '</strong> of <strong>' +
                edit.name + '</strong> to <strong>' + edit.nval + '</strong> has been rejected.';

            }

            BootstrapDialog.show({
                type: BootstrapDialog.TYPE_PRIMARY,
                title: title,
                message: message,
                buttons: [{
                    id: 'btn-ok',
                    label: 'OK',
                    cssClass: 'btn-primary',
                    autospin: false,
                    action: function (dialogRef, result) {
                        callback(index, type);
                        dialogRef.close();
                    }
                }]
            });
        }

        function howItWorks(type) {
            var message = '';
            var title = '';

            if (type == 'editAnswer') {
                title = 'Information Edits';
                message = 'Use edits to correct, add or update information in a profile. ' +
                'All edits need to be accepted by other users before they are approved. </br></br>' +
                'An edit or change becomes approved when the number of people that agree exceeds the number of people that disagree by 5. ' +
                '</br></br>An edit or change gets rejected when the number of people that disagree exceeds those that agree by 5. ' +
                '</br></br> Only one edit per field at a time is allowed. Make sure you vote on the edits you agree or disagree.';
            }
            if (type == 'addAnswer') {
                title = 'Add an Answer';
                message = '1. Fill out the form. The fields marked with * are required. All other fields are not required but recommended. <br/>' +
                '<br/>2. Click the \'Load Images\' button. <br/>' +
                '<br/>3. Use \'>>\' and \'<<\' buttons to browse through the images. You can \'Load More\' images.<br/>' +
                '<br/>4. When you find the image you like \'Add\' your answer to the ranking.<br/>' +
                '<br/>' +
                '<br/>NOTE: Not all images will correspond to your answer. Entering all fields will help with the image results.';
            }

            BootstrapDialog.show({
                type: BootstrapDialog.TYPE_PRIMARY,
                title: title,
                message: message,
                buttons: [{
                    id: 'btn-ok',
                    label: 'OK',
                    cssClass: 'btn-primary',
                    autospin: false,
                    action: function (dialogRef) {
                        dialogRef.close();
                    }
                }]
            });
        }

        function url(link) {
            BootstrapDialog.show({
                type: BootstrapDialog.TYPE_PRIMARY,
                title: "Image URL",
                message: link,
                buttons: [{
                    id: 'btn-ok',
                    label: 'OK',
                    cssClass: 'btn-primary',
                    autospin: false,
                    action: function (dialogRef) {
                        dialogRef.close();
                    }
                }]
            });
        }
    }
})();