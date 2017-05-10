(function () {
    'use strict';

    angular
        .module('app')
        .factory('image', image);

    image.$inject = ['$http', '$rootScope'];

    function image($http, $rootScope) {

        //Members
        var _searchResults = [];
        var numRes = 10; //This is max number of results from google search
        
        var service = {
            imageSearch: imageSearch,
            getImageLinks: getImageLinks,
            filterImageResults: filterImageResults
        };

        return service;
        
        function getImageLinks(fields, attNum, type) {
            var imageQuery = imageSearch(fields, attNum, type);            
            return imageQuery.then(querySucceeded, queryFailed);
            function querySucceeded(result) {
                if ($rootScope.DEBUG_MODE) console.log('query succeded');
                _searchResults = result; 
                return filterImageResults(_searchResults); 

            }
            function queryFailed(result) {

                if ($rootScope.DEBUG_MODE) console.log('image query failed');
            }
        }

        function imageSearch(fields, attNum, type) {

            var searchQuery = '';
            var googleAPIurl = 'https://www.googleapis.com/customsearch/v1?';
            var googleCSEid = '&cx=000139851817949790257%3Aqwkdgi2q2ew';
            var googleAPI_KEY = '&key=AIzaSyBr143lDEROCrUWdKvqPQmhQ5BoFo13oSE';
            var googleCSEconfig = '&num=10&searchType=image&fileType=jpg%2C+png%2C+bmp&imgType=photo&imgSize=large&filter=1';

            var f1 = '';
            var f2 = '';
            var f3 = '';
            var f4 = '';
            var f5 = '';
            var f6 = '';
            
            var keywords = '';
            if ($rootScope.cCategory) keywords = $rootScope.cCategory.keywords;
            //else keywords = $rootScope.cCategory.keywords;
            
            var data = [];
            
            //If used during add Answer use html input, if used during edit, use already stored value
            for (var i=0; i<fields.length; i++){
                if (type == 'edit') data[i] = fields[i].cval;
                else if (type == 'add') data[i] = fields[i].val;   
            }
            
            if (fields.length == 1){
                if (data[0]) f1 = data[0];
            }
            if (fields.length == 2){
                if (data[0]) f1 = data[0];
                if (data[1]) f2 = data[1];
            }
            if (fields.length == 3){
                if (data[0]) f1 = data[0];
                if (data[1]) f2 = data[1];
                if (data[2]) f3 = data[2];
            }
            if (fields.length > 3){
                if (data[0]) f1 = data[0];
                if (data[1]) f2 = data[1];
                if (data[2]) f3 = data[2];
                if (data[3]) f4 = data[3];
            }
            
            switch (attNum) {
                case 1: { searchQuery = 'q=' + f1 + ' ' + f2 + ' ' + keywords; break; }
                case 2: { searchQuery = 'q=' + f1 + ' ' + keywords; break; } 
                case 3: { searchQuery = 'q=' + f1 + ' ' + keywords; break; }
                case 4: { searchQuery = 'q=' + f1 + ' ' + f2 + ' ' + keywords; break; }
            }

            var url = googleAPIurl + searchQuery + googleCSEid + googleCSEconfig + googleAPI_KEY;

            //console.log('url', url);

            return $http.get(url);

        }

        function filterImageResults(_searchResults) {
            //Check results grab those with proper dimensions
            var _imageLinks = [];
            var sizeOk = false;
            var linkOk = false;
            var link_length = 0;
            var iheight = 0;
            var iwidth = 0;
            
            for (var i = 0; i < numRes; i++) {
                sizeOk = false;
                linkOk = false;
                iheight = _searchResults.data.items[i].image.height;
                iwidth = _searchResults.data.items[i].image.width;

                if (iwidth > iheight && (iwidth / iheight) < 1.8) sizeOk = true;

                link_length = _searchResults.data.items[i].link.length; 
                
                //check last character in result link is 'g' or 'p' (jpg, png or bmp)
                // and that image is serve securely from https source
                if ((_searchResults.data.items[i].link[link_length - 1] == 'g' ||
                    _searchResults.data.items[i].link[link_length - 1] == 'p') &&(
                    _searchResults.data.items[i].link.indexOf('https')>-1 )) linkOk = true;
                
                if (sizeOk && linkOk) {
                    var url = _searchResults.data.items[i].link;
                    //console.log('url result ', url);
                    _imageLinks.push(url);
                }
                //console.log('sizeok ', sizeOk, 'linkOk ', linkOk);
            }
            return _imageLinks;
        }
    }
})();