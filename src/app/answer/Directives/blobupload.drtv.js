angular.module('app').directive('blobUpload', ['$rootScope', '$state', function ($rootScope, $state) {
    //angular.module('app').directive('contentBlock', ['$rootScope', '$state', function ($rootScope, $state) {
    'use strict';

    return {
        
        templateUrl: 'app/answer/Partials/blobupload.html',
        transclude: true,
        scope: {
            //   modeNum: '=mode',
            //   isDynamic: '=dynamic',
            //   isRoW: '=rankofweek'
        },
         controller: ['$scope', 'Upload', '$timeout', '$http', '$rootScope', 'useruploadedimages','mailing',
          function blobUploadCtrl($scope, Upload, $timeout, $http, $rootScope, useruploadedimages, mailing) {           
            //$scope.uploadfile = function($scope, Upload, $timeout, $http) {
            // jshint validthis:true 
            displayError("");
            //$scope.errFile = {};
            //$scope.errFile.name = '';
                
            $scope.uploadFiles = function (file, errFiles) {
                $scope.f = file;
                $scope.errFile = errFiles && errFiles[0];

                if (file == null) {
                    console.log("file is null");
                    if ($scope.errFile != undefined) {
                        var errorMgs = 'Uploading failed for ' + $scope.errFile.name + ', ' +
                            $scope.errFile.$error + ' exceeds ' + $scope.errFile.$errorParam;
                        //console.log("errormsg", errorMgs);
                        displayError(errorMgs);
                    }
                    else displayError("");
                }
               
                else {
                    
                    var storageurl = "https://rankx.blob.core.windows.net/sandiego/"+$rootScope.canswer.id+"/" + file.name + "?sv=2015-04-05&ss=bfqt&srt=sco&sp=rwdlacup&se=2018-08-30T01:15:12Z&st=2016-08-29T17:15:12Z&spr=https,http&sig=PpyWE0X%2Fpz9SuRje5GtHh44WaWIii0GBU9PbIcDIka8%3D";
                    var fileReader = new FileReader();
                    
                    fileReader.readAsArrayBuffer(file);
                    fileReader.onload = function (e) {
                        Upload.http({
                            //file.upload = Upload.upload({
                            url: storageurl,
                            method: "PUT",
                            headers: {
                                'x-ms-blob-type': 'BlockBlob',
                                'x-ms-blob-content-type': file.type
                             },
                            data: e.target.result 
                            //file: file
                        }).then(function (response) {
                            if (response.status > 0)
                                $scope.errorMsg = response.status + ': ' + response.data;
                                var imageurl = 'https://rankx.blob.core.windows.net/sandiego/'+$rootScope.canswer.id+'/' + file.name;
                                console.log('emitted fileUploaded!!');
                                postUserUploadedRecord(imageurl);
                                $rootScope.$emit('fileUploaded', imageurl);
                        }, null, function (evt) {
                            file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
                        });
                    }
                }
            }
        
                function displayError(s) {
                    $scope.errorMsg = s;
                }

                function postUserUploadedRecord(x){
                    var obj = {};
                    console.log("$rootScope.user - ", $rootScope.user);
                    obj.user = $rootScope.user.id;
                    obj.username = $rootScope.user.name;
                    obj.imageurl = x;
                    obj.answer = $rootScope.canswer.id;
                    obj.answername = $rootScope.canswer.name;
                    useruploadedimages.postRecord(obj);
                    //Mail to moderation notification of new image
                    mailing.newImageUploaded(obj).then(function(data){
                     console.log("Send mail request for image notification");
                    })
                }

            }] 
    }
}
]);