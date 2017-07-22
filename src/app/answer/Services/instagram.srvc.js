(function () {
    'use strict';

    angular
        .module('app')
        .factory('instagram', instagram);

    instagram.$inject = ['$http', '$rootScope'];

    function instagram($http, $rootScope) {

        var service = {
            getImages: getImages,
        };

        return service;
        

        function getImages() {
            
            var instagramAPIurl = 'https://api.instagram.com/v1';
			var instagramClientId = 'c46745e083b7451a99461240e01da20b';
            var instagramAccessToken = '4368719989.c46745e.407288e972a64c119093166b8ba280c0';
            var redirecturi = 'https://rank-x.com';
            
            $rootScope.igimages = [];
            
            var tags = $rootScope.canswer.name.replace(' ','');
            
            var url = instagramAPIurl + '/tags/'+ 'rankxdemo' +'/media/recent?access_token='+instagramAccessToken + '&callback=JSON_CALLBACK';
            //var url = instagramAPIurl + '/media/search?lat='+$rootScope.canswer.lat+'&lng='+$rootScope.canswer.lng+
            //'&access_token='+instagramAccessToken + '&callback=JSON_CALLBACK';
            
            //&scope=public_content
            //https://api.instagram.com/v1/tags/{tag-name}?access_token=ACCESS-TOKEN
            //var url = 'https://api.instagram.com/v1/media/search?lat=48.858844&lng=2.294351&access_token='+instagramAccessToken;
            
            //var url = 'https://api.instagram.com/oauth/authorize/?client_id='+ instagramClientId + 
            //'&redirect_uri='+ redirecturi +'&response_type=token&scope=public_content';
            
            //return $http.get(url);
            if ($rootScope.DEBUG_MODE) console.log(url);
            
            return $http.jsonp(url)
                .success(function(data){
                    var myObj = {};
                if ($rootScope.DEBUG_MODE) console.log(data);
                for (var i=0; i<data.data.length; i++){
                    myObj = {};
                    myObj.url = data.data[i].images.standard_resolution.url;
                    myObj.caption = data.data[i].caption ? data.data[i].caption.text : undefined;
                    myObj.from = data.data[i].user.username;
                    $rootScope.igimages.push(myObj);
                    //$rootScope.igimages[i].Name = data.data[i].images.standard_resolution.url;
                    if ($rootScope.DEBUG_MODE) console.log(data.data[i].images.standard_resolution.url);
                }
            });
            /*
            return $http.get(url, {
                crossDomain: true,
                dataType: 'jsonp',
            }).then(function(response){
                
            console.log("Instagram Response: ", response);
            
            });
            
            */
        }
    }
})();