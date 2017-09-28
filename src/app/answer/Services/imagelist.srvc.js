(function () {
    'use strict';

    angular
        .module('app')
        .factory('imagelist', imagelist);

    imagelist.$inject = ['$http', '$rootScope'];

    function imagelist($http, $rootScope) {

        var service = {
            getImageList: getImageList,
            deleteBlob: deleteBlob,
            getFeatureImageList: getFeatureImageList
        };

        return service;

        function getFeatureImageList() {
            var storageurl = "https://rankx.blob.core.windows.net/sandiego?restype=container&comp=list" + "&prefix=featuredImages/" +
            "&sv=2015-04-05&ss=bfqt&srt=sco&sp=rwdlacup&se=2018-08-30T01:15:12Z&st=2016-08-29T17:15:12Z&spr=https,http&sig=PpyWE0X%2Fpz9SuRje5GtHh44WaWIii0GBU9PbIcDIka8%3D";
            return $http.get(storageurl).then(querySucceeded, queryFailed);
        
            //return imageQuery.then(querySucceeded, queryFailed);
            function querySucceeded(result) {
                
                //var parser = new DOMParser();
                //var xmlDoc = parser.parseFromString(result.data,"text/xml");
                var x2js = new X2JS();
                var myJSON = x2js.xml_str2json(result.data);
                var myObj = {};
                var images = [];
                var resParse = myJSON.EnumerationResults.Blobs.Blob;
                if ((!!resParse) && (resParse.constructor === Array)){
                    for (var i=0; i < resParse.length; i++){
                        myObj = {};
                        myObj.url = 'https://rankx.blob.core.windows.net/sandiego/'+resParse[i].Name;
                        myObj.type = 'azure-uploaded';
                        myObj.size = resParse[i].Properties["Content-Length"]/1024;
                        images.push(myObj);
                    }
                } else if ((!!resParse) && (resParse.constructor === Object)) {
                    myObj = {};
                    myObj.url = 'https://rankx.blob.core.windows.net/sandiego/'+resParse.Name;
                    myObj.type = 'Uploaded';
                    myObj.size = resParse.Properties["Content-Length"]/1024;
                    images.push(myObj);
                }
                return images;
                if ($rootScope.DEBUG_MODE) console.log('query succeded');

            }
            function queryFailed(result) {
                if ($rootScope.DEBUG_MODE) console.log('image query failed');
            }

        }
        function getImageList() {

            var storageurl = "https://rankx.blob.core.windows.net/sandiego?restype=container&comp=list" + "&prefix=" + $rootScope.canswer.id + "/" +
            "&sv=2015-04-05&ss=bfqt&srt=sco&sp=rwdlacup&se=2018-08-30T01:15:12Z&st=2016-08-29T17:15:12Z&spr=https,http&sig=PpyWE0X%2Fpz9SuRje5GtHh44WaWIii0GBU9PbIcDIka8%3D";
            return $http.get(storageurl).then(querySucceeded, queryFailed);
        
            //return imageQuery.then(querySucceeded, queryFailed);
            function querySucceeded(result) {
                
                //var parser = new DOMParser();
                //var xmlDoc = parser.parseFromString(result.data,"text/xml");
                var x2js = new X2JS();
                var myJSON = x2js.xml_str2json(result.data);
                var myObj = {};
                
                var resParse = myJSON.EnumerationResults.Blobs.Blob;

                if ((!!resParse) && (resParse.constructor === Array)){
                    for (var i=0; i < resParse.length; i++){
                        myObj = {};
                        myObj.url = 'https://rankx.blob.core.windows.net/sandiego/'+resParse[i].Name;
                        myObj.type = 'azure-uploaded';
                        $rootScope.blobs.push(myObj);
                    }
                } else if ((!!resParse) && (resParse.constructor === Object)) {
                    myObj = {};
                    myObj.url = 'https://rankx.blob.core.windows.net/sandiego/'+resParse.Name;
                    myObj.type = 'Uploaded';
                    $rootScope.blobs.push(myObj);
                }
                
                if ($rootScope.DEBUG_MODE) console.log('query succeded');

            }
            function queryFailed(result) {
                if ($rootScope.DEBUG_MODE) console.log('image query failed');
            }


        }
        
        function deleteBlob(blobName) {

            if ($rootScope.DEBUG_MODE) console.log("blobname, ", blobName);
            
            var url = blobName + 
            "?sv=2015-04-05&ss=bfqt&srt=sco&sp=rwdlacup&se=2018-08-30T01:15:12Z&st=2016-08-29T17:15:12Z&spr=https,http&sig=PpyWE0X%2Fpz9SuRje5GtHh44WaWIii0GBU9PbIcDIka8%3D";
            
            return $http.delete(url).then(querySucceeded, queryFailed);
        
            function querySucceeded(result) {
                $rootScope.$emit('refreshImages');
                if ($rootScope.DEBUG_MODE) console.log('Blob image deleted succesfully');

            }
            function queryFailed(result) {
                if ($rootScope.DEBUG_MODE) console.log('Blob image delete failed');
            }            
        }

        function XML2jsobj(node) {

            var data = {};

            // append a value
            function Add(name, value) {
                if (data[name]) {
                    if (data[name].constructor != Array) {
                        data[name] = [data[name]];
                    }
                    data[name][data[name].length] = value;
                }
                else {
                    data[name] = value;
                }
            };
	
            // element attributes
            var c, cn;
            for (c = 0; cn = node.attributes[c]; c++) {
                Add(cn.name, cn.value);
            }
	
            // child elements
            for (c = 0; cn = node.childNodes[c]; c++) {
                if (cn.nodeType == 1) {
                    if (cn.childNodes.length == 1 && cn.firstChild.nodeType == 3) {
                        // text value
                        Add(cn.nodeName, cn.firstChild.nodeValue);
                    }
                    else {
                        // sub-object
                        Add(cn.nodeName, XML2jsobj(cn));
                    }
                }
            }

            return data;
        }
    }
})();

