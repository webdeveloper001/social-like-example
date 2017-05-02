(function () {
    'use strict';

    angular.module('app')
        .run(configureHeaders);

    configureHeaders.$inject = ['$cookies', '$http', '$rootScope', 'APP_API_KEY', '$window'];

    function configureHeaders($cookies, $http, $rootScope, APP_API_KEY, $window) {

        // Configure API Headers
        $http.defaults.headers.common['X-Dreamfactory-API-Key'] = APP_API_KEY;
        $http.defaults.headers.common['X-DreamFactory-Session-Token'] = $cookies.session_token;
        
	    var access = $window.location.hash.replace('#access_token=', '').split("&")[0];

	    if ($window.location.hash.indexOf('access_token') != -1) {
	    	console.log("opener",  $window.opener);

		    var $parentScope = $window.opener.angular.element($window.opener.document).scope(); 
		       
	        $parentScope.$broadcast("igAccessTokenObtained", 
	            { access_token: access });
		    $window.close();
	    	
	    } 
    }
})();