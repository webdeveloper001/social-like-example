(function () {
    'use strict';

    angular
        .module('app')
        .controller('navbar', navbar);

    navbar.$inject = ['$location', '$translate', '$rootScope', 'login', '$state', 'city','$cookieStore','$http','GOOGLE_API_KEY'];

    function navbar($location, $translate, $rootScope, login, $state, city,$cookieStore,$http, GOOGLE_API_KEY) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'navbar';

        // Members
        vm.user = $rootScope.user;
        vm.isLoggedIn = $rootScope.isLoggedIn ? $rootScope.isLoggedIn : false;

        // Methods
        vm.logout = logout;
        vm.goToLogin = goToLogin;
        vm.gotoAbout = gotoAbout;
        vm.gotoFeedback = gotoFeedback;
        vm.gotoHome = gotoHome;
        vm.gotoAdmin = gotoAdmin;
        vm.gotoFileUpload = gotoFileUpload;
        vm.gotoCustomer = gotoCustomer;
        vm.openCitySelection = openCitySelection;
        
        $rootScope.coordsRdy = false;
        $rootScope.loadFbnWhenCoordsRdy = false;

        activate();
        
        function activate() {

            if ($rootScope.DEBUG_MODE) console.log("Navbar Loaded!");
            //console.log("isLoggedIn", !$rootScope.isLoggedIn)
            //console.log("user", $rootScope.user);
            //getCities();
            //detectLocation2();
        }

        function gotoAbout() {
            //$stateProvider.state('app');
            $state.go('about');
        }
        
        function gotoFileUpload() {
            //$stateProvider.state('app');
            $state.go('fileuploadtest');
        }

        function gotoAdmin() {
            //$stateProvider.state('app');
            $state.go('admin');
        }
        
        function gotoFeedback() {
            $rootScope.fbmode = true;
            $state.go('cwrapper', {}, {reload: true});
        }
        function gotoHome() {
            $rootScope.fbmode = false;
            $state.go('cwrapper', {}, {reload: true});
            $rootScope.$emit('mainView');
        }
        

        function gotoCustomer() {
            //$stateProvider.state('app');
            $state.go('customer');
        }

        function goToLogin() {

            $location.path('/login');
        }

        function logout() {

            login.logout().then(function () {

                vm.user = '';
                vm.isLoggedIn = false;

                //$location.path('/');
                $state.go('cwrapper', {}, {location: 'replace'});
            });
        }

        /**
         * Open model for city selection 
         */
        function openCitySelection() {
            openModal("#selectCityModal");
        }


        /**
         * This function get cities from API call only if cities is not already loaded
         */
        function getCities() {

            if (!$rootScope.cities) {
                city.getCities().then(function (response) {
                    $rootScope.cities = response;
                    autoDetectCity();
                });
            }

        }
        
        $rootScope.$on('getLocation', function (e) {
                autoDetectCity();
            });

        /**
         * Function to get current location of User based on navigator
         */
        $rootScope.getCurrentPositionOfUser = function() {
            
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position){
                    setUserLatitudeLongitude(position);
                }, function(error){
                }, {maximumAge:60000, timeout:5000, enableHighAccuracy:true});
            }else{
                if ($rootScope.DEBUG_MODE) console.log('Geo location not supported.');
            }
            
        };

        /**
         * Function to set latitude and longitude to $rootScope and Cookie
         * @param position
         */
        function setUserLatitudeLongitude(position) {
            
            if ($rootScope.DEBUG_MODE) console.log("position.coords.latitude - ", position.coords.latitude);
            if ($rootScope.DEBUG_MODE) console.log("position.coords.longitude - ", position.coords.longitude);
            /**
             * Set Latitude and Longitude from navigator to rootScope
             */
            $rootScope.currentUserLatitude = position.coords.latitude;
            $rootScope.currentUserLongitude = position.coords.longitude;
            
            

            //console.log("$rootScope.currentUserLatitude", $rootScope.currentUserLatitude);
            //console.log("$rootScope.currentUserLongitude", $rootScope.currentUserLongitude);

            /**
             * Set Latitude and Longitude to cookie
             */
            $cookieStore.put('currentUserLatitude', $rootScope.currentUserLatitude);
            $cookieStore.put('currentUserLongitude', $rootScope.currentUserLongitude);
            
            $rootScope.coordsRdy = true;
            
            if ($rootScope.loadFbnWhenCoordsRdy) $state.go('rankSummary', { index: 9521 });

            /**
             * If user is logged in, then set latitude and longitude to user's object
             */
            if($rootScope.isLoggedIn)
            {
                $rootScope.user.latitude = $rootScope.currentUserLatitude;
                $rootScope.user.longitude = $rootScope.currentUserLongitude;
                if ($rootScope.DEBUG_MODE) console.log("Geo Location is set for logged in user.");
            }

            if ($rootScope.DEBUG_MODE) console.log("Geo Location is set for user.");
            if ($state.current.name == 'rankSummary'){
                $state.reload();
            }
        }

        /**
         * This function detect City using geo location(lat,long)
         * Geo location works only on secure origins in Google Chrome
         */
        function autoDetectCity() {
            
            if ($rootScope.DEBUG_MODE) console.log("@autoDetectCity");
            
            var geocoder;
            geocoder = new google.maps.Geocoder();

            if (navigator.geolocation) {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(showPosition, function(){
                        console.log("Error getting geolocation");
                    });
                } else {
                    selectCity();
                }
            } else {
                selectCity();
            }

            function showPosition(position) {
                
                if ($rootScope.DEBUG_MODE) console.log("@showPosition - position -", position);

                var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

                setUserLatitudeLongitude(position);

                geocoder.geocode(
                    {'latLng': latlng},
                    function (results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            if (results[0]) {
                                var add = results[0].formatted_address;
                                var value = add.split(",");

                                var count = value.length;
                                var country = value[count - 1];
                                var state = value[count - 2];
                                city = value[count - 3];
                                selectCity(city);
                            }
                            else {
                                selectCity();
                            }
                        }
                        else {
                            selectCity();
                        }
                    }
                );
            }

        }

        /**
         * This function match detected to available cities
         * if match is found then it select city, otherwise give options to select city
         * @param detectedCity
         */
        function selectCity(detectedCity) {

            if ($rootScope.selectedCity) {
                
            }else {
                var isCityInList = false;
                var cityObject = {};

                angular.forEach($rootScope.cities, function (city) {

                    if (city.name == detectedCity.trim() && city.is_active) {
                        isCityInList = true;
                        cityObject = city;
                    }

                });

                if (isCityInList == false) {
                    openModal("#selectCityModal");
                } else {
                    $rootScope.selectedCity = cityObject;
                    window.localStorage.selectedCity = JSON.stringify($rootScope.selectedCity);
                    $rootScope.$digest();
                }
            }
        }
        
        function detectLocation(){
           var url = 'https://ipinfo.io/json';
           return $http.get(url, {}, {   
                    headers: {}
                }).then(function (result) {
                    if ($rootScope.DEBUG_MODE) console.log("Result from ipinfo - ", result);
                    var loc = result.data.loc.split(",");
                    if ($rootScope.DEBUG_MODE) console.log("loc - ", loc);
                    $rootScope.currentUserLatitude = loc[0];
                    $rootScope.currentUserLongitude = loc[1];                    
                });         
        }
        
        function detectLocation2(){
            var geobody = {};
            
            geobody.homeMobileCountryCode = 310;
            geobody.homeMobileNetworkCode = 38;
            geobody.considerIp = false;
  
            var url = 'https://www.googleapis.com/geolocation/v1/geolocate?key='+'AIzaSyDtDvBsex9Ytz1aWl5uET8MwjlmvEMTF70';
             return $http.post(url, {}, {   
                    headers: {},
                    body: geobody
                }).then(function (result) {
                    if ($rootScope.DEBUG_MODE) console.log("Result from google geolocate - ", result);
                    
                    //var loc = result.data.loc.split(",");
                    //console.log("loc - ", loc);
                    $rootScope.currentUserLatitude = result.data.location.lat;
                    $rootScope.currentUserLongitude = result.data.location.lng;                    
                });      
        }
    }
})();
