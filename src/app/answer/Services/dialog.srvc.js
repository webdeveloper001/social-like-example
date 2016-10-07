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
            checkSameAnswer: checkSameAnswer,
            showSameAnswer: showSameAnswer,
            deleteType: deleteType,
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
            deleteVRowGroup: deleteVRowGroup
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
            message = 'Are these the same '+ $rootScope.cCategory.type +'? </br></br><div class="row">' +
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
            btnCancelLabel = 'Just this category';
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
            '<p><strong>' + x.stitle + ' @ ' + x.name + '</strong></p><p>' + sch_str + '</p><p>' + x.details + '</p></div>';


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

        function deleteRank(deleteRank) {

            var title = '';
            var message = '';
            var btnCancelLabel = '';
            var btnOkLabel = '';

            title = 'Confirm Delete';
            btnCancelLabel = 'Cancel';
            btnOkLabel = 'Delete';
            message = 'Just confirming, do you want to delete?';

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
                    if (result) deleteRank();
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
            '<input class="form-control" type="text" placeholder="'+ x.gtitle + '">' +
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

    }
})();