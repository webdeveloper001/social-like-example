(function () {
    'use strict';

    angular
        .module('app')
        .controller('navbar', navbar);

    navbar.$inject = ['$location', '$translate', '$rootScope', 'login', '$state',
        'city', '$cookieStore', '$http', 'GOOGLE_API_KEY', 'dialog','getgps'];

    function navbar($location, $translate, $rootScope, login, $state,
        city, $cookieStore, $http, GOOGLE_API_KEY, dialog, getgps) {
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

        if ($rootScope.coordsRdy == undefined) $rootScope.coordsRdy = false;
        $rootScope.loadFbnWhenCoordsRdy = false;
        
        //Geolocation options
        var geoOptions = {};
        activate();

        function activate() {

            configGeolocation();

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
            $state.go('cwrapper', {}, { reload: true });
        }
        function gotoHome() {
            $rootScope.fbmode = false;
            $state.go('cwrapper', {}, { reload: true });
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
                $state.go('cwrapper', {}, { location: 'replace' });
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
        
        $rootScope.$on('useAddress', function (e, address) {
            var obj = {};
            obj.location = address.address;
            obj.lat = 0;
            obj.lng = 0;
            $rootScope.coordForUSer = true;
            getgps.getLocationGPS(obj);
        });

        /**
         * Function to get current location of User based on navigator
         */
        $rootScope.getCurrentPositionOfUser = function () {
            
            
            geolocator.locate(geoOptions, function (err, location) {
                if (err) {
                    if ($rootScope.DEBUG_MODE) console.log('Error getting geolocation - ERROR(' + err.code + '): ' + err.message);
                    dialog.getDialog('errorGettingGeolocation');
                }
                else {
                    if ($rootScope.DEBUG_MODE) console.log(location);
                    setUserLatitudeLongitude(location);
                }
            });
            
            /*
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position){
                    setUserLatitudeLongitude(position);
                }, function(error){
                }, {maximumAge:60000, timeout:10000, enableHighAccuracy:true});
            }else{
                if ($rootScope.DEBUG_MODE) console.log('Geo location not supported.');
                dialog.getDialog('browserDoesntSupportGeolocation');
            }
            */
        };

        /**
         * Function to set latitude and longitude to $rootScope and Cookie
         * @param position
         */
        function setUserLatitudeLongitude(location) {

            if ($rootScope.DEBUG_MODE) console.log("position.coords.latitude - ", location.coords.latitude);
            if ($rootScope.DEBUG_MODE) console.log("position.coords.longitude - ", location.coords.longitude);
            /**
             * Set Latitude and Longitude from navigator to rootScope
             */
            $rootScope.currentUserLatitude = location.coords.latitude;
            $rootScope.currentUserLongitude = location.coords.longitude;
        
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
            if ($rootScope.isLoggedIn) {
                $rootScope.user.latitude = $rootScope.currentUserLatitude;
                $rootScope.user.longitude = $rootScope.currentUserLongitude;
                if ($rootScope.DEBUG_MODE) console.log("Geo Location is set for logged in user.");
            }

            if ($rootScope.DEBUG_MODE) console.log("Geo Location is set for user.");
            if ($state.current.name == 'rankSummary') {
                $state.reload();
            }
        }

        /**
         * This function detect City using geo location(lat,long)
         * Geo location works only on secure origins in Google Chrome
         */
        function autoDetectCity() {

            if ($rootScope.DEBUG_MODE) console.log("@autoDetectCity");

            geolocator.locate(geoOptions, function (err, location) {
                if (err) {
                    if ($rootScope.DEBUG_MODE) console.log('Error getting geolocation - ERROR(' + err.code + '): ' + err.message);
                    dialog.getDialog('errorGettingGeolocation');
                    }
                else {
                    if ($rootScope.DEBUG_MODE) console.log(location);
                    setUserLatitudeLongitude(location);
                }
            });
            
            /*
            geolocator.locate(options, setUserLatitudeLongitude(location),function (err) {
             console.log('Error getting geolocation - ERROR(' + err.code + '): ' + err.message);
             dialog.getDialog('errorGettingGeolocation');
            });
            
            /*
            var geocoder;
            geocoder = new google.maps.Geocoder();

            if (navigator.geolocation) {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(showPosition, function(err){
                        console.log('Error getting geolocation - ERROR(' + err.code + '): ' + err.message);
                        dialog.getDialog('errorGettingGeolocation');
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
            }*/

        }

        /**
         * This function match detected to available cities
         * if match is found then it select city, otherwise give options to select city
         * @param detectedCity
         */
        function selectCity(detectedCity) {

            if ($rootScope.selectedCity) {

            } else {
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

        function configGeolocation() {
            
            geolocator.config({
                language: "en",
                google: {
                    version: "3",
                    key: GOOGLE_API_KEY
                }
            });

            geoOptions = {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumWait: 10000,     // max wait time for desired accuracy
                maximumAge: 0,          // disable cache
                desiredAccuracy: 30,    // meters
                fallbackToIP: true,     // fallback to IP if Geolocation fails or rejected
            };
        }

        function detectLocation() {
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

        function detectLocation2() {
            var geobody = {};

            geobody.homeMobileCountryCode = 310;
            geobody.homeMobileNetworkCode = 38;
            geobody.considerIp = false;

            var url = 'https://www.googleapis.com/geolocation/v1/geolocate?key=' + 'AIzaSyDtDvBsex9Ytz1aWl5uET8MwjlmvEMTF70';
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
