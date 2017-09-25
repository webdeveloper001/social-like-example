(function () {
    'use strict';

    angular
        .module('app')
        .service('getgps', getgps);

    getgps.$inject = ['$rootScope', '$http', 'APP_API_KEY', 'GOOGLE_API_KEY','$cookies','$state'];

    function getgps($rootScope, $http, APP_API_KEY, GOOGLE_API_KEY, $cookies, $state) {

        var service = {

            getLocationGPS: getLocationGPS
        };

        return service;

        function getLocationGPS(answer) {

            delete $http.defaults.headers.common['X-Dreamfactory-API-Key'];
            delete $http.defaults.headers.common['X-DreamFactory-Session-Token'];
            
            var myLoc = '';
                
                //Perform checks to make sure location is in recognizable format for google api
                var nhs = $rootScope.neighborhoods.concat($rootScope.districts);
                var locationHasNh = false; //location has neighborhood
                for (var i = 0; i < nhs.length; i++) {
                    if (answer.location.indexOf(nhs[i]) > -1) {
                        locationHasNh = true;
                        break;
                    }
                }    
                //if location does not contain any neighborhodd, add 'San Diego, CA'
                if (!locationHasNh && answer.location.indexOf('San Diego') < 0) {
                    myLoc = answer.location + ' San Diego, CA';
                }
                else myLoc = answer.location;
                //Remove '#' from address. This character causes error at google api
                myLoc = myLoc.replace('#','');

                //console.log("myLoc, GOOGLE_API_KEY --- ", myLoc, GOOGLE_API_KEY);
                var url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + myLoc + '&key=' + GOOGLE_API_KEY;
                //console.log("url --- ", url);
                return $http.get(url, {}, {   
                    headers: {
                        'Content-Type': 'multipart/form-data'
                        //'Access-Control-Allow-Headers': 'x-dreamfactory-api-key'
                    }
                }).then(function (result) {
                    answer.location = result.data.results[0].formatted_address;
                    answer.lat = result.data.results[0].geometry.location.lat;
                    answer.lng = result.data.results[0].geometry.location.lng;

                    $http.defaults.headers.common['X-Dreamfactory-API-Key'] = APP_API_KEY;
                    $http.defaults.headers.common['X-DreamFactory-Session-Token'] = $cookies.session_token;
                    
                    var isValid = (answer.location != undefined && answer.location != null &&
                        answer.lat != undefined && answer.lat != null &&
                        answer.lng != undefined && answer.lng != null);
                            
                    
                    if (isValid) {
                        if ($rootScope.coordForUSer){
                            $rootScope.currentUserLatitude = answer.lat;
                            $rootScope.currentUserLongitude = answer.lng;
                            $rootScope.coordForUSer = false;
                            $rootScope.coordsRdy = true;
                            $rootScope.$emit('coordsRdy');
                            if ($rootScope.DEBUG_MODE)  console.log('@gps - 71');
                            //if ($rootScope.loadFbnWhenCoordsRdy) $state.go('rankSummary', { index: 9521 });
                            //if ($rootScope.loadRankWhenCoordsRdy) 
                                //console.log("executed reload");
                                //$state.go('rankSummary', { reload: true }); //$state.reload();
                            
                        }
                        else $rootScope.$emit('answerGPSready');
                    }
                    //answer.updateAnswer(cAnswer.id,['lat','lng','location'],[lat,lng,fa]);
                });

            
        }
    }


})();