(function () {
    'use strict';

    angular
        .module('app')
        .factory('dialog', dialog);

    dialog.$inject = ['$q', '$rootScope', 'useraccnt', 'imagelist', 'answer', 'login',
        '$window','$cookies', '$state']
    function dialog($q, $rootScope, useraccnt, imagelist, answer, login,
        $window, $cookies, $state) {

        var service = {
            editConfirm: editConfirm,
            getDialog: getDialog,
            showDialog: showDialog,
            howItWorks: howItWorks,
            addAnswer: addAnswer,
            showAddAnswer: showAddAnswer,
            editChangeEffective: editChangeEffective,
            checkSameAnswer: checkSameAnswer,
            showSameAnswer: showSameAnswer,
            deleteType: deleteType,
            deleteThisCatans: deleteThisCatans,
            deleteRank: deleteRank,
            getLocation: getLocation,
            url: url,
            createSpecialPreview: createSpecialPreview,
            bizRegistration: bizRegistration,
            bindAccount: bindAccount,
            addVRow: addVRow,
            deleteVRow: deleteVRow,
            addVRowGroup: addVRowGroup,
            editVRowGroup: editVRowGroup,
            deleteVRowGroup: deleteVRowGroup,
            showAddEvent: showAddEvent,
            createEventPreview: createEventPreview,
            askPermissionToLocate: askPermissionToLocate,
            askEmail: askEmail,
            seePhotos: seePhotos,
            loginFacebook: loginFacebook,
            shareOptions: shareOptions,
            tour: tour,
            unbindAccount: unbindAccount,
            confirmCancel: confirmCancel,
            editNumRanks: editNumRanks,
            editInfo: editInfo,
            notificationWithCallback: notificationWithCallback
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
            if (type == 'field' && edit.field != 'addinfo') {
                message = 'You want to change the <strong class="capitalize"><em>' + edit.field +
                '</em></strong> of <strong><em>' + edit.name + '</em></strong> to <strong><em>' + edit.nval + '</em></strong>.';
            }
            if (type == 'field' && edit.field == 'addinfo') {
                message = 'You want to change the information of ' +
                '<strong><em>' + edit.name + '</em></strong> to: <br><br>' + edit.nval + '</br>.';
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
                        if (answer.addinfo) newline = '<strong class="capitalize">' + 'Additional Info' + '</strong>: ' + answer.addinfo + '</br>';
                        else newline = '<strong>' + 'Additional Info' + '</strong>: ' + '' + '</br>';
                        break;
                    }
                    case "phone": {
                        if (answer.phone) newline = '<strong class="capitalize">' + 'Phone' + '</strong>: ' + answer.phone + '</br>';
                        else newline = '<strong>' + 'Phone' + '</strong>: ' + '' + '</br>';
                        break;
                    }
                    case "website": {
                        if (answer.website) newline = '<strong class="capitalize">' + 'Website' + '</strong>: ' + answer.website + '</br>';
                        else newline = '<strong>' + 'Website' + '</strong>: ' + '' + '</br>';
                        break;
                    }
                    case "email": {
                        if (answer.email) newline = '<strong class="capitalize">' + 'Email' + '</strong>: ' + answer.email + '</br>';
                        else newline = '<strong>' + 'Email' + '</strong>: ' + '' + '</br>';
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
            message = 'You want to add the following answer to <strong>' + $rootScope.cCategory.title + '</strong>. </br></br>' +
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

            if (type == 'approve' && edit.field != 'addinfo') {

                title = 'Changed Approved';
                message = 'Congrats! With your vote, the change of <strong>' + edit.field + '</strong> of <strong>' +
                edit.name + '</strong> to <strong>' + edit.nval + '</strong> gets approved.';

            }

            if (type == 'approve' && edit.field == 'addinfo') {

                title = 'Changed Approved';
                message = 'Congrats! With your vote, the information of <strong>' +
                edit.name + '</strong> to <br><br>' + edit.nval + '</br> gets approved.';

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
                'An edit or change becomes approved when the number of people that agree exceeds the number of people that disagree by 3. ' +
                '</br></br>An edit or change gets rejected when the number of people that disagree exceeds those that agree by 3. ' +
                '</br></br> Only one edit per field at a time is allowed. Make sure you vote on the edits you agree or disagree.';
            }
            if (type == 'addAnswer') {
                title = 'Add a new answer';
                message = '1. Fill out the form. The fields marked with ** are required. All other fields are not required but recommended. <br/>' +
                '<br/>2. Click the \'Get Images\' button. <br/>' +
                '<br/>3. Use \'>>\' and \'<<\' buttons to browse through the images. You can \'Get More Images\' button to load more images.<br/>' +
                '<br/>4. When the image you want shows in the image box, click the button \'Add\' to add the new answer' +
                ' to the list.<br/>' +
                '<br/>NOTE: Not all images will correspond to your answer. Entering all fields will help with the image results.';
            }
            if (type == 'shortPhrase') {
                title = 'Add an Answer';
                message = 'Fill out the form. The fields marked with ** are required. <br/>' +
                '<br/> - The <strong>Title</strong> is the main idea of your answer. <br/>' +
                '<br/> - In the <strong>Details</strong> box, write additional details about your answer.' +
                ' You can also write arguments on why it should be included in this list.<br/>' +
                '<br/>For example: <br/>' +
                '<br/>In the rank <strong><em>Reasons why dogs are awesome</em></strong> you can add following answer: <br/>' +
                '<br/><strong>Title:</strong> They enjoy the simple things in life <br/>' +
                '<br/><strong>Details:</strong> Dogs dont need much to be happy, they are happy with simple things ' +
                'like a belly rub, a walk around the block, playing in the snow or going for a drive.';
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

        function checkSameAnswer(answer1, answer2, callback1, callback2) {

            var answerhtml = '';
            var answerhtml2 = '';
            var newline = '';
            var newline2 = '';

            for (var i = 0; i < $rootScope.fields.length; i++) {
                switch ($rootScope.fields[i].name) {
                    case "name": {
                        newline = '<strong class="capitalize">' + 'Name' + '</strong>: ' + answer1.name + '</br>';
                        newline2 = '<strong class="capitalize">' + 'Name' + '</strong>: ' + answer2.name + '</br>';
                        break;
                    }
                    case "location": {
                        if (answer1.location) newline = '<strong class="capitalize">' + 'Location' + '</strong>: ' + answer1.location + '</br>';
                        else newline = '<strong>' + 'Location' + '</strong>: ' + '' + '</br>';
                        if (answer2.location) newline2 = '<strong class="capitalize">' + 'Location' + '</strong>: ' + answer2.location + '</br>';
                        else newline2 = '<strong>' + 'Location' + '</strong>: ' + '' + '</br>';
                        break;
                    }
                    case "cityarea": {
                        //newline = '<strong class="capitalize">'+addinfo+'</strong>: ' + $rootScope.cCountries[answer.cnum] + '</br>';
                        newline = '<strong class="capitalize">' + 'City Area' + '</strong>: ' + answer1.cityarea + '</br>';
                        newline2 = '<strong class="capitalize">' + 'City Area' + '</strong>: ' + answer2.cityarea + '</br>';
                        break;
                    }
                    case "addinfo": {
                        if (answer1.addinfo) newline = '<strong class="capitalize">' + 'Additional Info' + 'b</strong>: ' + answer1.addinfo + '</br>';
                        else newline = '<strong>' + 'Additional Info' + '</strong>: ' + '' + '</br>';
                        if (answer2.addinfo) newline2 = '<strong class="capitalize">' + 'Additional Info' + 'b</strong>: ' + answer2.addinfo + '</br>';
                        else newline2 = '<strong>' + 'Additional Info' + '</strong>: ' + '' + '</br>';
                        break;
                    }
                    case "phone": {
                        if (answer1.phone) newline = '<strong class="capitalize">' + 'Phone' + 'b</strong>: ' + answer1.phone + '</br>';
                        else newline = '<strong>' + 'Phone' + '</strong>: ' + '' + '</br>';
                        if (answer2.phone) newline2 = '<strong class="capitalize">' + 'Phone' + 'b</strong>: ' + answer2.phone + '</br>';
                        else newline2 = '<strong>' + 'Phone' + '</strong>: ' + '' + '</br>';
                        break;
                    }
                    case "website": {
                        if (answer1.website) newline = '<strong class="capitalize">' + 'Website' + 'b</strong>: ' + answer1.website + '</br>';
                        else newline = '<strong>' + 'Website' + '</strong>: ' + '' + '</br>';
                        if (answer2.website) newline2 = '<strong class="capitalize">' + 'Website' + 'b</strong>: ' + answer2.website + '</br>';
                        else newline2 = '<strong>' + 'Website' + '</strong>: ' + '' + '</br>';
                        break;
                    }
                    case "email": {
                        if (answer1.email) newline = '<strong class="capitalize">' + 'Email' + 'b</strong>: ' + answer1.email + '</br>';
                        else newline = '<strong>' + 'Email' + '</strong>: ' + '' + '</br>';
                        if (answer2.email) newline2 = '<strong class="capitalize">' + 'Email' + 'b</strong>: ' + answer2.email + '</br>';
                        else newline2 = '<strong>' + 'Email' + '</strong>: ' + '' + '</br>';
                        break;
                    }
                }
                answerhtml = answerhtml + newline;
                answerhtml2 = answerhtml2 + newline2;
            }

            showSameAnswer(answer1, answerhtml, answer2, answerhtml2, callback1, callback2);
            //console.log("headline ", categoryhtml)
       
        }
        function showSameAnswer(answer1, answerhtml, answer2, answerhtml2, callback1, callback2) {

            var title = '';
            var message = '';
            var btnCancelLabel = '';
            var btnOkLabel = '';

            title = 'Just checking';
            btnCancelLabel = 'No, they are different';
            btnOkLabel = 'Yeah, same';
            message = 'Are these the same ' + $rootScope.cCategory.type + '? </br></br><div class="row">' +
            '<div class="col-sm-6">' + answerhtml + '</br>' +
            '<img src=' + answer1.imageurl + ' class="thumbnail" style="width:60%; max-height:150px"></div>' +

            '<div class="col-sm-6">' + answerhtml2 + '</br>' +
            '<img src=' + answer2.imageurl + ' class="thumbnail" style="width:60%; max-height:150px"></div>' +
            '</div>';

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
                    if (result) callback2();
                    else callback1(answer1);

                }
            });
        }

        function deleteType(thisCatOnly, everywhere) {

            var title = '';
            var message = '';
            var btnCancelLabel = '';
            var btnOkLabel = '';

            title = 'Scope of Delete';
            btnCancelLabel = 'Just in the category: ' + $rootScope.cCategory.title;
            btnOkLabel = 'Everywhere';
            message = 'Choose scope to delete:';

            BootstrapDialog.confirm({
                type: BootstrapDialog.TYPE_DANGER,
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
                    if (result) everywhere();
                    else thisCatOnly();

                }
            });
        }

        function deleteThisCatans(answer, category, callback) {
            var title = '';
            var message = '';
            var btnCancelLabel = '';
            var btnOkLabel = '';

            title = 'Confirm Delete';
            btnCancelLabel = 'Cancel';
            btnOkLabel = 'Delete';
            message = 'This will delete the CatAns record for <strong>' + answer +
            '</strong> in the category of <strong>' + category + '</strong>.';

            BootstrapDialog.confirm({
                type: BootstrapDialog.TYPE_DANGER,
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
                    if (result) callback();
                }
            });
        }

        function createSpecialPreview(x, addSpecial) {
            var title = '';
            var message = '';
            var htmlmsg = '';
            var btnCancelLabel = '';
            var btnOkLabel = '';
            var sch_str = '';

            title = 'Special Preview';
            btnCancelLabel = 'Back';
            btnOkLabel = 'Save Special';
            if (x.freq == 'weekly') {
                sch_str = 'Every: ' +
                (x.mon ? ' - Monday' : '') +
                (x.tue ? ' - Tuesday' : '') +
                (x.wed ? ' - Wednesday' : '') +
                (x.thu ? ' - Thursday' : '') +
                (x.fri ? ' - Friday' : '') +
                (x.sat ? ' - Saturday' : '') +
                (x.sun ? ' - Sunday' : '') +
                '<br>From: ' + x.stime2 + ' to ' + x.etime2;
            }
            if (x.freq == 'onetime') {
                var sameday = (x.sdate == x.edate);
                if (sameday) {
                    sch_str = x.sdate + ' from ' + x.stime + ' to ' + x.etime;
                }
                else {
                    sch_str = 'Starts: ' + x.sdate + ' at ' + x.stime + '<br>Ends: ' + x.edate + ' at ' + x.etime;
                }
            }

            message = 'This is how this special will look: </br></br>In the ranking summary:<br>' +
            '<table class="table table-hover cursor ">' +
            '<thead><tr><th>Rank</th><th>Name</th><th>Distance</th><th>Specials</th>' +
            '</tr></thead><tbody><tr><td>1</td><td>' + x.name + '</td><td>1.5</td>' +
            '<td style="background-color:' + x.bc + ';color:' + x.fc + ';">' + x.stitle + '<td></tr></tbody></table><br>' +
            'Inside your business profile:<br><br><div style="background-color:' + x.bc + ';color:' + x.fc + ';">' +
            '<p><strong>' + x.stitle + ' @ ' + x.name + '</strong></p><p>' + sch_str + '</p><p>' + x.details + '</p></div>' +
            '</br>' +
            'With the following image:' +
            '<img src=' + x.image + ' class="thumbnail" style="width:70%; max-height:150px">';

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
                    if (result) addSpecial();
                    //else callback1(answer1);
                    
                }
            });
        }

        function deleteRank(x,callback,isSpecial) {

            var title = '';
            var message = '';
            var btnCancelLabel = '';
            var btnOkLabel = '';

            title = 'Yes, Delete';
            btnCancelLabel = 'Cancel';
            btnOkLabel = 'Delete';
            if (isSpecial)
            message = 'Just confirming, do you want to delete the special <strong>' + x.stitle +'</strong>?';
            else
            message = 'Just confirming, do you want to delete the ranking <strong>' + x.title +'</strong>?';
            
            BootstrapDialog.confirm({
                type: BootstrapDialog.TYPE_DANGER,
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
                    if (result) callback();
                }
            });
        }

        function getLocation(callback) {

            var title = '';
            var message = '';
            var btnCancelLabel = '';
            var btnOkLabel = '';

            title = 'Share Location';
            btnCancelLabel = 'Not Now';
            btnOkLabel = 'Ok';
            message = 'Please allow browser share location so we can calculate distance to the best places.';

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
                    if (result) callback();
                }
            });


        }

        function bizRegistration(callback) {

            var title = '';
            var message = '';
            var btnCancelLabel = '';
            var btnOkLabel = '';

            title = 'Do you own this business?';
            btnCancelLabel = 'Cancel';
            btnOkLabel = 'Bind';
            message = 'If you own or represent this business, please bind to your account so only you can change or edit its information.' +
            '<br><br><strong>* Name of Business</strong>' +
            '<br><strong>* Address</strong>' +
            '<br><strong>* Phone Number</strong>' +
            '<br><strong>* Main Photo</strong>' +
            '<br><strong>* Hours</strong>' +
            '<br><br>Binding this business to your account is free.';

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
                    if (result) callback();
                }
            });

        }

        function bindAccount(name, business, callback) {

            var title = '';
            var message = '';
            var btnCancelLabel = '';
            var btnOkLabel = '';

            title = 'Confirmation';
            btnCancelLabel = 'Cancel';
            btnOkLabel = 'Yes, bind this business to my account';
            message = '<br><strong>Note:</strong> Claiming to have false authority over a business is against the law.' +
            '<br><br>Please confirm:' +
            '<br><br>' +
            'You, <strong>' + name + '</strong>, have the authority to represent <strong>' + business + '</strong>.';

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
                    if (result) callback();
                }
            });

        }

        function addVRow(x, callback) {

            var title = '';
            var message = '';
            var btnCancelLabel = '';
            var btnOkLabel = '';

            title = 'Enter Data';
            btnCancelLabel = 'Cancel';
            btnOkLabel = 'Add';
            message = '<br> Enter new vote row to be added in Group: <strong>' + x.gtitle + '</strong>' +
            '<br><br>Vote Row Name:' +
            '<input class="form-control" type="text" placeholder="Enter Vote Row Name">' +
            '<br><br>';
            BootstrapDialog.show({
                type: BootstrapDialog.TYPE_PRIMARY,
                title: title,
                message: message,
                closable: true, // <-- Default value is false
                draggable: true, // <-- Default value is false
                
                buttons: [{
                    label: 'Cancel',
                    action: function (dialogRef) {
                        //console.log("dialogRef2---", dialogRef);
                        dialogRef.close();
                    },
                },
                    {
                        label: 'OK',
                        action: function (dialogRef, result) {
                            //console.log("dialogRef---", dialogRef);
                            var vrowname = dialogRef.getModalBody().find('input').val();
                            if (result) callback(x, vrowname);
                            dialogRef.close();
                        },
                    }]
            });
        }

        function deleteVRow(x, callback) {

            var title = '';
            var message = '';
            var btnCancelLabel = '';
            var btnOkLabel = '';

            title = 'Please Confirm';
            btnCancelLabel = 'Cancel';
            btnOkLabel = 'Yes, Delete';
            message = '<br>Please confirm, you want to delete vote row <strong>' + x.title +
            '</strong> from <strong>' + x.gtitle + '</strong>.' +
            '<br><br><strong>Note:</strong> All vote records will be lost';

            BootstrapDialog.confirm({
                type: BootstrapDialog.TYPE_DANGER,
                title: title,
                message: message,
                closable: true, // <-- Default value is false
                draggable: true, // <-- Default value is false
                btnCancelLabel: btnCancelLabel,
                btnOKLabel: btnOkLabel,
                btnOKClass: 'btn-default',
                btnCancelAction: function (dialogRef) {
                    dialogRef.close();
                },
                callback: function (result) {
                    if (result) callback(x);
                }
            });
        }

        function addVRowGroup(x, callback) {

            var title = '';
            var message = '';
            var btnCancelLabel = '';
            var btnOkLabel = '';

            title = 'Enter Data';
            btnCancelLabel = 'Cancel';
            btnOkLabel = 'Add';
            message = '<br>Enter name of Vote Group you want to create: ' +
            '<br><br>Group Name:' +
            '<input class="form-control" type="text" placeholder="Enter Vote Row Group Name">' +
            '<br><br>';
            BootstrapDialog.show({
                type: BootstrapDialog.TYPE_PRIMARY,
                title: title,
                message: message,
                closable: true, // <-- Default value is false
                draggable: true, // <-- Default value is false
                
                buttons: [{
                    label: 'Cancel',
                    action: function (dialogRef) {
                        //console.log("dialogRef2---", dialogRef);
                        dialogRef.close();
                    },
                },
                    {
                        label: 'OK',
                        action: function (dialogRef, result) {
                            //console.log("dialogRef---", dialogRef);
                            var vrowgroupname = dialogRef.getModalBody().find('input').val();
                            if (result) callback(x, vrowgroupname);
                            dialogRef.close();
                        },
                    }]
            });
        }

        function editVRowGroup(x, callback, callback2) {

            var title = '';
            var message = '';
            var btnCancelLabel = '';
            var btnOkLabel = '';

            title = 'Enter Data';
            btnCancelLabel = 'Cancel';
            btnOkLabel = 'Edit';
            message = '<br>Enter new name of Vote Group: ' +
            '<br><br>Group Name:' +
            '<input class="form-control" type="text" placeholder="' + x.gtitle + '">' +
            '<br><br>';
            BootstrapDialog.show({
                type: BootstrapDialog.TYPE_PRIMARY,
                title: title,
                message: message,
                closable: true, // <-- Default value is false
                draggable: true, // <-- Default value is false
                
                buttons: [{
                    label: 'Cancel',
                    action: function (dialogRef) {
                        //console.log("dialogRef2---", dialogRef);
                        dialogRef.close();
                    },
                },
                    {
                        label: 'Edit',
                        action: function (dialogRef, result) {
                            //console.log("dialogRef---", dialogRef);
                            var vrowgroupname = dialogRef.getModalBody().find('input').val();
                            if (result) callback(x, vrowgroupname);
                            dialogRef.close();
                        },
                    },
                    {
                        label: 'Delete',
                        action: function (dialogRef, result) {
                            //console.log("dialogRef---", dialogRef);
                            if (result) callback2(x);
                            dialogRef.close();
                        },
                    }
                ]
            });
        }

        function deleteVRowGroup(x, callback) {

            var title = '';
            var message = '';
            var btnCancelLabel = '';
            var btnOkLabel = '';

            title = 'Please Confirm';
            btnCancelLabel = 'Cancel';
            btnOkLabel = 'Yes, Delete';
            message = '<br>Please confirm, you want to delete the vote group <strong>' + x.gtitle +
            '</strong> and all the items within it.' +
            '<br><br><strong>Note:</strong> All vote records for all items will be lost';

            BootstrapDialog.confirm({
                type: BootstrapDialog.TYPE_DANGER,
                title: title,
                message: message,
                closable: true, // <-- Default value is false
                draggable: true, // <-- Default value is false
                btnCancelLabel: btnCancelLabel,
                btnOKLabel: btnOkLabel,
                btnOKClass: 'btn-default',
                btnCancelAction: function (dialogRef) {
                    dialogRef.close();
                },
                callback: function (result) {
                    if (result) callback(x);
                }
            });
        }

        function createEventPreview(event, callback) {

            var answerhtml = '';
            var newline = '';
            //var header = "table" + $rootScope.cCategory.id + ".header";
            for (var i = 0; i < $rootScope.fields.length; i++) {
                switch ($rootScope.fields[i].name) {
                    case "name": {
                        newline = '<strong class="capitalize">' + 'Name' + '</strong>: ' + event.name + '</br>';
                        break;
                    }
                    case "location": {
                        if (event.location) newline = '<strong class="capitalize">' + 'Location' + '</strong>: ' + event.location + '</br>';
                        else newline = '<strong>' + 'Location' + '</strong>: ' + '' + '</br>';
                        break;
                    }
                    case "cityarea": {
                        newline = '<strong class="capitalize">' + 'City Area' + '</strong>: ' + event.cityarea + '</br>';
                        break;
                    }
                    case "addinfo": {
                        if (event.addinfo) newline = '<strong class="capitalize">' + 'Additional Info' + '</strong>: ' + event.addinfo + '</br>';
                        else newline = '<strong>' + 'Additional Info' + '</strong>: ' + '' + '</br>';
                        break;
                    }
                    case "website": {
                        if (event.website) newline = '<strong class="capitalize">' + 'Website' + '</strong>: ' + event.website + '</br>';
                        else newline = '<strong>' + 'Website' + '</strong>: ' + '' + '</br>';
                        break;
                    }
                    case "date": {
                        if (event.date) newline = '<strong class="capitalize">' + 'Date' + '</strong>: ' + event.sdate + '</br>';
                        else newline = '<strong>' + 'Date' + '</strong>: ' + '' + '</br>';
                        break;
                    }

                }
                answerhtml = answerhtml + newline;
            }

            var addinfomessage = '';
            var sch_str = '';

            if (event.freq == 'weekly') {
                sch_str = 'Every: ' +
                (event.mon ? ' - Monday' : '') +
                (event.tue ? ' - Tuesday' : '') +
                (event.wed ? ' - Wednesday' : '') +
                (event.thu ? ' - Thursday' : '') +
                (event.fri ? ' - Friday' : '') +
                (event.sat ? ' - Saturday' : '') +
                (event.sun ? ' - Sunday' : '') +
                '<br>From: ' + event.stime2 + ' to ' + event.etime2;
            }
            if (event.freq == 'onetime') {
                var sameday = (event.sdate == event.edate);
                if (sameday) {
                    sch_str = event.sdate + ' from ' + event.stime + ' to ' + event.etime;
                }
                else {
                    sch_str = (event.edate == undefined ? '' : 'Starts: ') + event.sdate + ' at ' + event.stime +
                    (event.edate == undefined ? '' : ('<br>Ends: ' + event.edate + ' at ' + event.etime));
                }
            }

            addinfomessage = '<div style="background-color:' + event.bc + ';color:' + event.fc + ';">' +
            '<p><strong>' + event.name +
            (event.location != undefined ? (' @ ' + event.location) : ('')) + '</strong></p>' +
            (event.cityarea != undefined ? ('<p>in ' + event.cityarea + '</p>') : '') +
            '<p>' + sch_str + '</p>' +
            (event.addinfo != undefined ? ('<p>' + event.addinfo + '</p>') : ('')) +
            (event.website != undefined ? ('<p>For more information: <a href="' + event.website + '">' + event.website + '</a></p>') : ('')) +
            '</div>';

            showAddEvent(event, answerhtml, addinfomessage, event.imageurl, callback);
            //console.log("headline ", categoryhtml)
       
        }
        function showAddEvent(event, answerhtml, addinfomessage, imageurl, callback) {

            var title = '';
            var message = '';
            var btnCancelLabel = '';
            var btnOkLabel = '';

            title = 'Please Confirm';
            btnCancelLabel = 'Cancel';
            btnOkLabel = 'Confirm';
            message = 'You want to add the following event to <strong>' + $rootScope.cCategory.title + '</strong>. </br><p></p>' +
            addinfomessage + '</br>' +
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
                    if (result) callback(event);
                    //dialogRef.close();
                }
            });

        }
        /*
        function askPermissionToLocate() {

            var title = '';
            var message = ''
            var btnCancelLabel = 'No, I don\'t approve';
            var btnOkLabel = 'Yes, locate me';

            title = 'Please Confirm';
            message = 'Is it ok if we locate your position?';
            BootstrapDialog.confirm({
                type: BootstrapDialog.TYPE_PRIMARY,
                title: title,
                message: message,
                closable: true, // <-- Default value is false
                draggable: true, // <-- Default value is false
                btnCancelLabel: btnCancelLabel,
                btnOKLabel: btnOkLabel,
                btnOKClass: 'btn-success',
                btnCancelClass: 'btn-warning',
                btnCancelAction: function (dialogRef) {
                    dialogRef.close();
                },
                 callback: function (result) {
                    if (result) $rootScope.$emit('getLocation');                                     
                }                          
              });
        }*/

        function askPermissionToLocate() {

            var title = '';
            var messagehtml = ''
            var messageLoading = '';
            var btnCancelLabel = 'No, I don\'t approve';
            var btnOkLabel = 'Yes, locate me';

            title = 'Please Confirm';


            messagehtml = '<div class="text-left">Is it ok if we locate your position?</div>' +
            '<br>' +
            '<div class="row">' +
            //($rootScope.sm ? '<div class="container col-xs-12">':'<div class="container col-xs-6">') +
            '<div class="container col-xs-12">' +
            '<div class="text-left" style="color:blue">Option 1</div>' +
            '<div class="text-center" style="border:2px"><button class="btn btn-success" id="useGeo">Yes, locate me using geolocation</button></div><br>' +
            '<div class="text-left" style="color:blue">Option 2 <small>(recommended for accuracy)</small></div><br>' +
            '<p>Yes, use this address as my current location</p>' +
            '<div class="input-group">' +
            '<input id="address" type="text" class="form-control" placeholder="Enter address">' +
            '<span class="input-group-btn text-right">' +
            '<button class="btn btn-success" type="button" id="gobutton">Go</button>' +
            '</span>' +
            '</div><br><br>' +
            '</div>' +
            //($rootScope.sm ? '<div class="container col-xs-12">':'<div class="container col-xs-6">') +
            '<div class="container col-xs-12">' +
            '<div class="text-center" style="border:2px"><button class="btn btn-default" id="noapprove">No, I don\'t approve</button></div>' +
            '</div>' +
            '</div>';

            messageLoading = '<div class="loading-pulse"></div>' +
            '<p>Just a moment, finding your location...</p>';

            BootstrapDialog.show({
                type: BootstrapDialog.TYPE_PRIMARY,
                title: title,
                message: function (dialogRef) {
                    var $content = $(messagehtml);

                    $content.find('#useGeo').click({}, function () {

                        if ($rootScope.isFacebookApp) {
                            getDialog('FacebookAppNotSupported');
                        }
                        else {
                            var x = dialogRef;
                            $rootScope.$emit('getLocation');
                            x.enableButtons(false);
                            x.setClosable(false);
                            x.getModalBody().html(messageLoading);
                            x.setTitle('Please wait');
                            setTimeout(function () {
                                x.close();
                            }, 10000);
                        }
                        //x.close();
                    });
                    $content.find('#gobutton').click({}, function () {
                        var address = $content.find('input').val();
                        var x = dialogRef;
                        $rootScope.$emit('useAddress', { address: address });
                        x.close();
                    });
                    $content.find('#noapprove').click({}, function () {
                        var x = dialogRef;
                        x.close();
                    });

                    return $content;
                },
                closable: true, // <-- Default value is false
                draggable: true, // <-- Default value is false
                btnCancelLabel: btnCancelLabel,
                btnOKLabel: btnOkLabel,
                btnOKClass: 'btn-success',
                btnCancelClass: 'btn-warning',
                btnCancelAction: function (dialogRef) {
                    dialogRef.close();
                }
            });
        }

        function askEmail(accntname) {

            var title = '';
            var messagehtml = ''
            var btnCancelLabel = 'No, I don\'t approve';
            var btnOkLabel = 'Yes, locate me';

            title = 'Missing info';

            messagehtml = '<div class="text-left">Let\'s stay in touch.' +
            ' Please provide us an email address where we can ' +
            'keep you updated on everything related to the <strong>' + accntname + '</strong> account.</div>' +
            '<br>' +
            '<div class="input-group">' +
            '<input id="email" type="text" class="form-control" placeholder="Enter email address">' +
            '<span class="input-group-btn text-right">' +
            '<button class="btn btn-primary" type="button" id="gobutton">Submit</button>' +
            '</span>' +
            '</div><br>';

            BootstrapDialog.show({
                type: BootstrapDialog.TYPE_PRIMARY,
                title: title,
                message: function (dialogRef) {
                    var $content = $(messagehtml);

                    $content.find('#gobutton').click({}, function () {
                        var address = $content.find('input').val();
                        var x = dialogRef;
                        $rootScope.showWarning = false;
                        useraccnt.updateuseraccnt($rootScope.useraccnts[0].id, ['email'], [address]);
                        x.close();
                        $rootScope.$emit('hideWarning');
                    });

                    return $content;
                },
                closable: true, // <-- Default value is false
                draggable: true, // <-- Default value is false
                btnCancelLabel: btnCancelLabel,
                btnOKLabel: btnOkLabel,
                btnOKClass: 'btn-success',
                btnCancelClass: 'btn-warning',
                btnCancelAction: function (dialogRef) {
                    dialogRef.close();
                }
            });
        }

        function seePhotos(blobList, idx, answer, isOwner) {

            var title = '';
            var messagehtml = ''
            var btnCancelLabel = 'No, I don\'t approve';
            var btnOkLabel = 'Yes, locate me';
            var n = idx;
            var L = blobList.length;
            var img_style = '';

            if ($rootScope.sm) {
                img_style = 'width:100%;height:auto';
            }
            else {
                img_style = 'width:100%;height:auto';
            }

            title = 'Photos - ' + answer.name;

            var m1 = '';
            var m2 = '';
            var m3 = '';
            var m4 = '';
            var cap = '';
            
            if (isOwner) {
                m1 =
                '<div class="row">' +
                '<div class="text-left col-xs-3 col-md-4">' +
                '<button class="btn btn-default pull-left" id="prevbutton">&lt;&lt</button>' +
                '</div>' +
                '<div class="text-middle col-xs-5 col-md-4">' +
                '<button class="btn btn-default" id="makeprimary">Make Main Photo</button>' +
                '</div>' +
                '<div class="text-right col-xs-4 col-md-4">' +
                '<button class="btn btn-default pull-right" id="nextbutton">&gt;&gt</button>' +
                '</div>' +
                '</div>';
                m4 =
                '<div class="text-right">' +
                '<button type="button" class="btn btn-default pull-right" style="vertical-align:middle;" id="trashbutton">' +
                '<span class="glyphicon glyphicon-trash" style="padding-top:0px;padding-bottom:0px;" aria-hidden="true">' +
                '</span>' +
                '</button>' +
                '</div><br/>';

            }
            else {
                m1 = '<div class="row">' +
                '<div class="text-left col-xs-6">' +
                '<button class="btn btn-default pull-left" id="prevbutton">&lt;&lt</button>' +
                '</div>' +
                '<div class="text-right col-xs-6">' +
                '<button class="btn btn-default pull-right" id="nextbutton">&gt;&gt</button>' +
                '</div>' +
                '</div>';
                m4 = '<br/>';
            }
            m2 = '<br>' +
            '<div class="text-center">' +
            '<img id="image" class="displayed" src="' +
            //'https://rankx.blob.core.windows.net/sandiego/';
            '';
            m3 =
            '" style="' + img_style + '">' +
            '</div>' + 
            '<br/>';
            
            if (blobList[n].from != undefined){
                cap = '<p id="credit">Photo by:&nbsp<strong>@'+ blobList[n].from + '</strong></p></br><p id="caption">' + 
                (blobList[n].caption ? blobList[n].caption : '')  +'</p>';
            }
            else{
                cap = '<p id="credit"></p><p id="caption"></p>';
            }
            
            messagehtml =  m1 + m2 + blobList[n].url + m3 + m4 + cap;
            
            BootstrapDialog.show({
                type: BootstrapDialog.TYPE_PRIMARY,
                title: title,
                message: function (dialogRef) {
                    var $content = $(messagehtml);
                    var x = dialogRef;
                    $content.find('#prevbutton').click({}, function () {
                        n = n - 1;
                        if (n < 0) n = L - 1;
                        $content.find('#image').attr('src', blobList[n].url);
                        
                        if (blobList[n].from != undefined) $('#credit').html('Photo by:&nbsp<strong>@'+ blobList[n].from + '</strong></br>');
                        else $('#credit').html('');
                        
                        if (blobList[n].caption != undefined) $('#caption').html(blobList[n].caption);
                        else $('#caption').html('');
                    });

                    $content.find('#nextbutton').click({}, function () {
                        n = n + 1;
                        if (n >= L) n = 0;
                         $content.find('#image').attr('src', blobList[n].url);
                         
                         if (blobList[n].from != undefined) $('#credit').html('Photo by:&nbsp<strong>@'+ blobList[n].from + '</strong></br>');
                         else $('#credit').html('');
                        
                         if (blobList[n].caption != undefined) $('#caption').html(blobList[n].caption);
                         else $('#caption').html('');
                    });

                    $content.find('#trashbutton').click({}, function () {
                        confirmPhotoDelete(blobList, n);
                        x.close();
                    });

                    $content.find('#makeprimary').click({}, function () {
                        confirmMakePrimary(blobList, n, answer);
                        x.close();
                    });
                    return $content;
                },
                closable: true, // <-- Default value is false
                draggable: true, // <-- Default value is false
                btnCancelLabel: btnCancelLabel,
                btnOKLabel: btnOkLabel,
                btnOKClass: 'btn-success',
                btnCancelClass: 'btn-warning',
                btnCancelAction: function (dialogRef) {
                    dialogRef.close();
                },

            });

        }

        function confirmPhotoDelete(blobList, n) {

            var title = '';
            var message = '';
            var btnCancelLabel = '';
            var btnOkLabel = '';

            title = 'Please Confirm';
            btnCancelLabel = 'Cancel';
            btnOkLabel = 'Yes, Delete';
            message = '<br>Please confirm, you want to delete this photo: ' +
            '<br/><img id="image" class="displayed" src="' +
            blobList[n].url +
            '" style="width:100%;height:auto">' +
            '<br><br>';

            BootstrapDialog.confirm({
                type: BootstrapDialog.TYPE_DANGER,
                title: title,
                message: message,
                closable: true, // <-- Default value is false
                draggable: true, // <-- Default value is false
                btnCancelLabel: btnCancelLabel,
                btnOKLabel: btnOkLabel,
                btnOKClass: 'btn-default',
                btnCancelAction: function (dialogRef) {
                    dialogRef.close();
                },
                callback: function (result) {
                    if (result) {
                        imagelist.deleteBlob(blobList[n].url);
                    }
                }
            });
        }

        function confirmMakePrimary(blobList, n, myanswer) {

            var title = '';
            var message = '';
            var btnCancelLabel = '';
            var btnOkLabel = '';

            title = 'Please Confirm';
            btnCancelLabel = 'Cancel';
            btnOkLabel = 'Yes, make primary';
            message = '<br>Please confirm, you want to make this the primary photo: ' +
            '<br/><img id="image" class="displayed" src="' +
            blobList[n].url +
            '" style="width:100%;height:auto">' +
            '<br><br>';

            BootstrapDialog.confirm({
                type: BootstrapDialog.TYPE_PRIMARY,
                title: title,
                message: message,
                closable: true, // <-- Default value is false
                draggable: true, // <-- Default value is false
                btnCancelLabel: btnCancelLabel,
                btnOKLabel: btnOkLabel,
                btnOKClass: 'btn-default',
                btnCancelAction: function (dialogRef) {
                    dialogRef.close();
                },
                callback: function (result) {
                    if (result) {
                        var imageurl = blobList[n].url;
                        answer.updateAnswer(myanswer.id, ["image"], [imageurl]);
                    }
                }
            });
        }

        function loginFacebook() {
            var title = '';
            var message = '';
            var btnCancelLabel = '';
            var btnOkLabel = '';

            title = 'Login required';
            message = 'You must be logged in to add answers, endorse establishments and participate in the rankings.' +
            '</br></br>' +
            'Do you want to log in?';

            BootstrapDialog.show({
                title: title,
                message: message,
                buttons: [{
                    label: 'Not now',
                    action: function (dialogItself) {
                        dialogItself.close();
                    }
                },
                    {
                        icon: 'fa fa-facebook',
                        label: 'Login',
                        cssClass: 'btn-primary',
                        action: function () {

                             //Store current state 
                            $rootScope.stateName = $state.current.name;
                            if ($rootScope.stateName == 'rankSummary') $rootScope.stateNum = $rootScope.cCategory.id;
                            else if ($rootScope.stateName == 'answerDetail') $rootScope.stateNum = $rootScope.canswer.id;
                            else $rootScope.stateNum = undefined;
                        
                            login.loginWithFacebook()
                                .then(function (result) {
                                    $window.location = result.url;
                                });
                        }
                    }]
            });
        }

        function shareOptions(callback, isMobile) {
            var title = '';
            var messagehtml = '';
            var btnCancelLabel = '';
            var btnOkLabel = '';

            title = 'Share Options';
            messagehtml =
            '<div class="row">' +
            '<div class="col-xs-3 col-sm-3 col-md-2 col-lg-2 text-center">' +
            '<img src="/assets/images/1485385043_mail.png" id="email" style="width:50px;margin-bottom:20px">' +
            '</div>' +
            '<div class="col-xs-3 col-sm-3 col-md-2 col-lg-2 text-center">' +
            '<img src="/assets/images/1485384809_2_-_Facebook.png" id="facebook" style="width:50px;margin-bottom:20px">' +
            '</div>' +
            '<div class="col-xs-3 col-sm-3 col-md-2 col-lg-2 text-center">' +
            '<img src="/assets/images/1485384868_1_-_Twitter.png" id="twitter" style="width:50px;margin-bottom:20px">' +
            '</div>' +
            '<div class="col-xs-3 col-sm-3 col-md-2 col-lg-2 text-center">' +
            '<img src="/assets/images/1485384841_13_-_Pintrest.png" id="pinterest" style="width:50px;margin-bottom:20px">' +
            '</div>' +
            '<div class="col-xs-3 col-sm-3 col-md-2 col-lg-2 text-center">' +
            '<img src="/assets/images/1485384824_6_-_Google_Plus.png" id="gplus" style="width:50px;margin-bottom:20px">' +
            '</div>' +
            '<div class="col-xs-3 col-sm-3 col-md-2 col-lg-2 text-center">' +
            '<img src="/assets/images/1485384853_5_-_Tumbler.png" id="tumblr" style="width:50px;margin-bottom:20px">' +
            '</div>' +
            '<div class="col-xs-3 col-sm-3 col-md-2 col-lg-2 text-center">' +
            '<img src="/assets/images/1485425301_reddit.png" id="reddit" style="width:50px;margin-bottom:20px">' +
            '</div>' +
            '<div class="col-xs-3 col-sm-3 col-md-2 col-lg-2 text-center">' +
            '<img src="/assets/images/1485384832_16_-_Whatsapp.png" id="whatsapp"'+
            ' style="width:50px;margin-bottom:20px;display:'+ (isMobile ? 'inline':'none') + '">' +
            '</div>' +
            '<div class="col-xs-3 col-sm-3 col-md-2 col-lg-2 text-center">' +
            '<img src="/assets/images/1485385110_Facebook_Messenger.png" id="messenger"'+
            ' style="width:50px;margin-bottom:20px;display:'+ (isMobile ? 'inline':'none') + '">' +
            '</div>' +
            '<div class="col-xs-3 col-sm-3 col-md-2 col-lg-2 text-center">' +
            '<img src="/assets/images/1485385026_sms.png" id="sms"'+ 
            ' style="width:50px;margin-bottom:20px;display:'+ (isMobile ? 'inline':'none') + '">' +
            '</div>'
            '</div>';

            BootstrapDialog.show({
                title: title,
                message: function (dialogRef) {
                    var $content = $(messagehtml);
                    var x = dialogRef;
                    $content.find('#twitter').click({}, function () {
                        callback('twitter');
                        x.close();
                    });
                    $content.find('#facebook').click({}, function () {
                        callback('facebook');
                        x.close();
                    });
                    $content.find('#email').click({}, function () {
                        callback('email');
                        x.close();
                    });
                    $content.find('#pinterest').click({}, function () {
                        callback('pinterest');
                        x.close();
                    });
                    $content.find('#gplus').click({}, function () {
                        callback('gplus');
                        x.close();
                    });
                    $content.find('#reddit').click({}, function () {
                        callback('reddit');
                        x.close();
                    });
                    $content.find('#tumblr').click({}, function () {
                        callback('tumblr');
                        x.close();
                    });
                    $content.find('#whatsapp').click({}, function () {
                        callback('whatsapp');
                        x.close();
                    });
                    $content.find('#messenger').click({}, function () {
                        callback('messenger');
                        x.close();
                    });
                    $content.find('#sms').click({}, function () {
                        callback('sms');
                        x.close();
                    });
                    return $content;
                },
                buttons: [{
                    label: 'Cancel',
                    action: function (dialogItself) {
                        dialogItself.close();
                    }
                }]
            });
        }

         function tour() {

            var title = '';
            var messagehtml = ''
            var n = 1;
            var img_style = '';
            
            //if ($rootScope.sm) {
                img_style = 'width:100%;max-width:450px;height:auto;margin-left:auto;margin-right:auto;';
            //}
            //else {
            //    img_style = 'width:90%;height:auto';
            // }

            title = 'Rank-X Intro Tour';

            var m1 = '';
            var m2 = '';
            var m3 = '';
            var m4 = '';
            var cap = '';

           // <div class="container hidden-xs hidden-sm hidden-md col-lg-3" ng-if="isShortPhrase" style="background-color:lightgray;color:black;height:{{sm ? '150px':'200px'}};margin:0px;padding:0px;border:0px;position:relative;">
//	<div style="padding:3px; margin:0px; position:absolute; top:50%; left:50%; margin-right:-50%;transform: translate(-50%,-50%)">
		

            
            m1 =
            '<img id="image" class="displayed" src="' +
            '/assets/images/rxtour1.png'+'" style="' + img_style + '">';
            
            messagehtml =  m1;
            
            BootstrapDialog.show({
                type: BootstrapDialog.TYPE_PRIMARY,
                title: title,
                message: messagehtml,
                closable: true, // <-- Default value is false
                draggable: true, // <-- Default value is false
                buttons: [
                {
                id: 'btn1',
                label: 'No, thanks',
                action: function(dialog, messagehtml) {
                    var $button = this; // 'this' here is a jQuery object that wrapping the <button> DOM element.
                    //console.log("bt1-clicked,",n);
                    if (n==1) {
                        $cookies.put('tourviewed', true);
                        dialog.close();
                    }
                    else {
                        n = n - 1;
                        if (n==1){
                            $('#btn1').text('No, thanks');
                            $('#btn2').text('Yes, take tour');
                        }
                        else if (n == 12){
                            $('#btn1').text('Back');
                            $('#btn2').text('Close');
                            $cookies.put('tourviewed', true);
                        } 
                        else {
                            $('#btn1').text('Back');
                            $('#btn2').text('Next');
                        }
                        m1 = '<img id="image" class="displayed" src="' +
                            '/assets/images/rxtour'+n+'.png'+'" style="'+img_style+'">';
                        dialog.setMessage(m1);
                        
                        }
                    }
                },
                {
                id: 'btn2',
                label: 'Yes, take tour',
                action: function(dialog, messagehtml) {
                    var $button = this; // 'this' here is a jQuery object that wrapping the <button> DOM element.
                    //console.log("bt2-clicked,",n);
                    if (n==12) {
                        $cookies.put('tourviewed', true);
                        dialog.close();
                    }
                    else {
                        if (n == 12) dialog.getButton(this.id).label = 'Close';
                        else {
                            //$button.text = 'Next'; 
                            n = n + 1;
                            if (n == 1) {
                                $('#btn1').text('No, thanks');
                                $('#btn2').text('Yes, take tour');
                            }
                            else if (n == 12) {
                                $('#btn1').text('Back');
                                $('#btn2').text('Close');
                                $cookies.put('tourviewed', true);
                            }
                            else {
                                $('#btn1').text('Back');
                                $('#btn2').text('Next');
                            }
                        }
                        m1 = '<img id="image" class="displayed" src="' +
                            '/assets/images/rxtour' + n + '.png' + '" style="' + img_style + '">';
                        dialog.setMessage(m1);
                    }
                }
            }]

            });

        }

        function unbindAccount(x, callback) {

            var title = '';
            var message = '';
            var btnCancelLabel = '';
            var btnOkLabel = '';

            title = 'Confirm Unbind';
            btnCancelLabel = 'Cancel';
            btnOkLabel = 'Yes, Unbind';
            message = 'Just confirming, do you want to unbind <strong>' + x.name + '</strong> from your account?';

            BootstrapDialog.confirm({
                type: BootstrapDialog.TYPE_DANGER,
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
                    if (result) callback();
                }
            });
        }

        function confirmCancel(x, type, callback){
             var title = '';
            var message = '';
            var btnCancelLabel = '';
            var btnOkLabel = '';

            if (type == 'Premium'){
                btnOkLabel = 'Cancel Premium Membership';
                message = 'Do you want to cancel your Premium Membership for <strong>'+x.name+'</strong>?'
            }
            if (type == 'Ranks'){
                btnOkLabel = 'Cancel All Custom Ranks';
                message = 'Do you want to cancel all of your Custom Ranks for <strong>'+x.name+'</strong>?'
            }
            if (type == 'All'){
                btnOkLabel = 'Cancel All Subscriptions';
                message = 'Do you want to cancel all of your Subscriptions for <strong>'+x.name+'</strong>?'
            }

            title = 'Please confirm';
            btnCancelLabel = 'Back';
            
            BootstrapDialog.confirm({
                type: BootstrapDialog.TYPE_DANGER,
                title: title,
                message: message,
                closable: true, // <-- Default value is false
                draggable: true, // <-- Default value is false
                btnCancelLabel: btnCancelLabel,
                btnOKLabel: btnOkLabel,
                btnOKClass: 'default',
                btnCancelAction: function (dialogRef) {
                    dialogRef.close();
                },
                //callback: function (dialogRef, result) {
                callback: function (result) {
                    if (result) callback();
                }
            });
        }

        function editNumRanks(x,callback){
            var title = 'Buy or Cancel Custom Ranks';
            var message = '';
            var btnCancelLabel = 'Back';
            var btnOkLabel = 'Purchase';
            var m1 = '';
            var m2 = '';
            var n = 1;
            var N = x.ranksQty;
            var action = 'purchase';
            var msgpayment = '<br><br>If purchasing Custom Ranks you will be ask for your payment info after clicking the Purchase button.';
            var msgcancel = '<br><br>Your Custom Ranks will be active until the last day of your subscription.';

            var msg = 'You have selected to <strong>purchase ' + n + '</strong> Custom Ranks.' + msgpayment;
            
            //message = getMessageHtml(n,msg);
            //function getMessageHtml(n,msg){
            var message = 
            '<p>You are currently subscribed to <strong>' + N + '</strong> Custom Ranks.</p>'+
            '<br>'+
            '<p class="text-left">Select what you want to do.</p>'+
            '<br>'+
            '<div class="radio">'+
                '<label><input type="radio" value="0" checked name="radiogrp">PURCHASE CUSTOM RANKINGS</label>'+
            '</div>'+
            '<div class="radio">'+
               '<label><input type="radio" value="1" name="radiogrp">CANCEL CUSTOM RANKINGS</label>'+
            '</div>'+
            '<br>' +
            '<div class="row">'+
                '<div class="col-xs-7">'+
                    '<p class="text-right">Select quantity:</p>'+
                '</div>'+
                '<div class="col-xs-5">'+
				    '<div class="input-group">'+
					    '<span class="input-group-btn">'+
					        '<button class="btn btn-primary" id="btn_minus"><i class="fa fa-minus"></i></button>'+
				        '</span>'+
					    '<input style="text-align:center" id="numRanks" class="form-control" type="text" placeholder="'+ n +'">'+
					        '<span class="input-group-btn">'+
					            '<button class="btn btn-primary" id="btn_plus"><i class="fa fa-plus"></i></button>'+
				            '</span>'+
				    '</div>'+
			    '</div>'+
            '</div>'+
            '<br><p class="text-left" id="mytext">'+msg+'</p>';
                //return msghtml;    
            
            title = 'Please confirm';
            btnCancelLabel = 'Back';
            
            BootstrapDialog.show({
                type: BootstrapDialog.TYPE_PRIMARY,
                title: title,
                message: function (dialogRef) {
                    var $content = $(message);
                    var x = dialogRef;
                    var msg = '';
                    var msgpayment = '<br><br>If purchasing Custom Ranks you will be ask for your payment info after clicking the Purchase button.';
                    var msgcancel = '<br><br>Your Custom Ranks will be active until last day of your subscription.';

                    $content.find('#btn_minus').click({}, function () {
                        n = n - 1;
                        if (n < 1) n = 1;
                        $content.find('#numRanks').val(n);
                        //console.log("n, N - ", n, N);
                        if (action == 'purchase'){
                            msg = 'You have selected to <strong>purchase ' + n + '</strong> Custom Ranks. ' + msgpayment;
                            $('#btn2').text('Purchase ' + n + ' Custom Rankings');
                        }
                        else {
                            msg = 'You have selected to <strong>cancel ' + n + '</strong> Custom Ranks. ' + msgcancel;
                            $('#btn2').text('Cancel ' + n + ' Custom Rankings');
                        }
                        //console.log("msg - ", msg);
                        $('#mytext').html(msg);                  
                    });
                    $content.find('#btn_plus').click({}, function () {
                        n = n + 1;
                        if (n > 10) n = 10;
                        if (action == 'cancel'){
                            if (n >= N) n = N;
                        }
                        $content.find('#numRanks').val(n);
                        //console.log("n, N - ", n, N);
                        if (action == 'purchase'){
                            msg = 'You have selected to <strong>purchase ' + n + '</strong> Custom Ranks. ' + msgpayment;
                            $('#btn2').text('Purchase ' + n + ' Custom Rankings');
                        }
                        else {
                            msg = 'You have selected to <strong>cancel ' + n + '</strong> Custom Ranks. ' + msgcancel;
                            $('#btn2').text('Cancel ' + n + ' Custom Rankings');
                        }
                        //console.log("msg - ", msg);
                        $('#mytext').html(msg);                       
                    });
                    $content.find('input[type=radio][name=radiogrp]').change(function() {
                        n = 1;
                        if (this.value == 0) {
                            action = 'purchase';
                            $('#btn2').text('Purchase ' + n + ' Custom Rankings');
                            msg = 'You have selected to <strong>purchase ' + n + '</strong> Custom Ranks. ' + msgpayment;                           
                        }
                        else if (this.value == 1) {
                            action = 'cancel';
                            $('#btn2').text('Cancel ' + n + ' Custom Rankings');
                            msg = 'You have selected to <strong>cancel ' + n + '</strong> Custom Ranks. ' + msgcancel;
                        }
                        $content.find('#numRanks').val(n);
                        $('#mytext').html(msg);
                    });
                    return $content;
                },
                closable: true, // <-- Default value is false
                draggable: true, // <-- Default value is false
                buttons: [
                {
                id: 'btn1',
                label: 'Back',
                action: function(dialog) {
                    dialog.close();
                    }
                },
                {
                id: 'btn2',
                label: 'Purchase ' + n + ' Custom Rankings',
                action: function(dialog, messagehtml) {
                   callback(action,n);
                   dialog.close();
                }
            }]
            });
        }

         function editInfo(fields,labels,vals,callback) {

            var title = '';
            var messagehtml = ''
            var btnCancelLabel = 'Cancel';
            var btnOkLabel = 'Save';

            title = 'Edit Information';

            messagehtml = '<p>Please verify the information is correct.</p>';

            for (var i=0; i<fields.length; i++){
                messagehtml = messagehtml + 
                
                '<div class="input-group">'+
                '<label class="input-group-addon">'+labels[i]+':</label>'+
                '<input type="text" class="form-control" id="'+fields[i]+'" value="'+ vals[i] +'">'+
                '</div>';
            }
            
            BootstrapDialog.show({
                type: BootstrapDialog.TYPE_PRIMARY,
                title: title,
                message: function (dialogRef) {
                    var $content = $(messagehtml);
                    return $content;
                },
                closable: true, // <-- Default value is false
                draggable: true, // <-- Default value is false
                btnCancelLabel: btnCancelLabel,
                btnOKLabel: btnOkLabel,
                btnOKClass: 'btn-success',
                btnCancelClass: 'btn-warning',
                btnCancelAction: function (dialogRef) {
                    dialogRef.close();
                },
                buttons: [
                    {
                        id: 'btn1',
                        label: 'Cancel',
                        action: function (dialog) {
                            dialog.close();
                        }
                    },
                    {
                        id: 'btn2',
                        label: 'Save',
                        action: function (dialog, messagehtml) {
                            var newvals = [];
                            var val = '';
                            for (var i = 0; i < fields.length; i++) {
                                val = dialog.getModalBody().find('#' + fields[i])[0].value;
                                //console.log(fields[i], " ", val);
                                newvals.push(val);
                            }
                            callback(newvals);
                            dialog.close();
                        }
                    }]
            });
         }

         function notificationWithCallback(title, message, callback) {

            var title = title;
            var message = message;
            
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
                        callback();
                        dialogRef.close();
                    }
                }]
            });

        }
    }
})();