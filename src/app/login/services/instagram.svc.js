
angular.module('app')
.factory("InstagramService", function ($rootScope, $location, $http) {
    var client_id = "205800c140bd4ff8a1e7778b5ec4a681";     
    var service = {         
    	_access_token: null,
	    access_token: function(newToken) {             
	    	if(angular.isDefined(newToken)) {                 
	    		this._access_token = newToken;             }             
	    		return this._access_token;         
	    },
    	login: function () {

	        var igPopup = window.open("https://api.instagram.com/oauth/authorize/?client_id=" + client_id +                 
	        "&redirect_uri=" + $location.absUrl().split('#')[0] +
	        "&response_type=token&scope=likes+relationships",'newwindow', 'width=600, height=240');
        },
        getUserprofile: function() {
        	var headers = {
				'Access-Control-Allow-Origin' : '*',
				'Access-Control-Allow-Methods' : 'POST, GET, OPTIONS, PUT',
				'Content-Type': 'application/json',
				'Accept': 'application/json'
			};
	    	return $http({
				method: "POST",
				headers: headers,
	      		url: 'https://api.instagram.com/v1/users/self/?access_token=' + service.access_token(),
        	})	
    		// return $http.get('https://api.instagram.com/v1/users/self/?access_token=' + service.access_token())
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
		alert(args.access_token);
		service.getUserprofile().then(function(data){
			console.log('returnerd');
		})
	});
    return service; 
});