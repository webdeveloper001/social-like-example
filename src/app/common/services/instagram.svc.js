
angular.module('app')
.factory("InstagramService", function ($rootScope, $location, $http, INSTAGRAM_CLIENT_ID) {
    var client_id = INSTAGRAM_CLIENT_ID;     
    var service = {         
    	_access_token: null,
	    access_token: function(newToken) {             
	    	if(angular.isDefined(newToken)) {                 
	    		this._access_token = newToken;             
            }             
	    	return this._access_token;         
	    },
    	login: function () {
            var redirect_uri = $location.absUrl().split($location.path())[0] + '/';
	        var igPopup = window.open("https://api.instagram.com/oauth/authorize/?client_id=" + client_id +                 
	        "&redirect_uri=" + redirect_uri +
	        "&response_type=token&scope=likes+relationships+public_content+follower_list",'Instagram Auth', 'width=400, height=600, centerscreen=true, chrome=yes');
        },
        getMyRecentImages: function() {
            return $http.jsonp('https://api.instagram.com/v1/users/self/media/recent?access_token=' + service.access_token()); 
        },
        getUserprofile: function() {
    		return $http.jsonp('https://api.instagram.com/v1/users/self/?access_token=' + service.access_token())
    		.then(function(data){
        		console.log(data);
        		return data;
        	})
        	.catch(function(err){
        		console.log(err);
        	});
        }
    };     
    $rootScope.$on("igAccessTokenObtained", function (evt, args) {
		service.access_token(args.access_token.replace('#', '').replace('!', ''));     
		$rootScope.$broadcast("instagramLoggedIn", { access_token: service._access_token });
	});
    return service; 
});