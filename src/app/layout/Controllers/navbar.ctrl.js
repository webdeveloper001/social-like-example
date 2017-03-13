(function () {
    'use strict';

    angular
        .module('app')
        .controller('navbar', navbar);

    navbar.$inject = ['$location', '$translate', '$rootScope', 'login', '$state',
        'city', '$cookies', '$http', 'GOOGLE_API_KEY', 'dialog','getgps', 'useraccnt'];

    function navbar($location, $translate, $rootScope, login, $state,
        city, $cookies, $http, GOOGLE_API_KEY, dialog, getgps, useraccnt) {
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
        vm.gotomybusiness = gotomybusiness;
        vm.gotomyfavs = gotomyfavs;
        vm.gotoFeedback = gotoFeedback;
        vm.gotoTour = gotoTour;
        vm.gotoHome = gotoHome;
        vm.gotoAdmin = gotoAdmin;
        vm.goPromoterConsole = goPromoterConsole;
        vm.gotoFileUpload = gotoFileUpload;
        vm.gotoCustomer = gotoCustomer;
        vm.openCitySelection = openCitySelection;
        vm.goWarning = goWarning;
        vm.goCoords = goCoords;

        if ($rootScope.coordsRdy == undefined) $rootScope.coordsRdy = false;
        $rootScope.loadFbnWhenCoordsRdy = false;

        //Geolocation options
        var geoOptions = {};

        vm.warning = false;

        $rootScope.$on('getLocation', function (e) {
            autoDetectCity();
        });

        $rootScope.$on('coordsRdy', function (e) {
            showCoordsIcon();
        });

        $rootScope.$on('showWarning', function (e) {
            if ($rootScope.DEBUG_MODE) console.log("rx showWarning");
            showWarningsIcon();
        });

        $rootScope.$on('hideWarning', function (e) {
            if ($rootScope.DEBUG_MODE) console.log("rx clearWarning");
            hideWarningsIcon();
        });

        $rootScope.$on('useAddress', function (e, address) {
            var obj = {};
            obj.location = address.address;
            obj.lat = 0;
            obj.lng = 0;
            $rootScope.coordForUSer = true;
            getgps.getLocationGPS(obj);
        });

        $rootScope.$on('userDataLoaded', function (e) {
            if ($rootScope.isLoggedIn && $rootScope.userpromoter.length > 0) {
                vm.isPromoter = true;
                $rootScope.isPromoter = true;
                console.log("User is promoter");
            }
            else {
                $rootScope.isPromoter = false;
                vm.isPromoter = false;
            }
        });

        $rootScope.$on('userAccountsLoaded', function (e) {
            if ($rootScope.isLoggedIn && $rootScope.useraccnts.length > 0) {
                vm.hasBusiness = true;
                $rootScope.hasBusiness = true;
                console.log("User has business");
            }
            else {
                $rootScope.hasBusiness = false;
                vm.hasBusiness = false;
            }
        });

        activate();

        function activate() {

            if ($rootScope.hasBusiness == undefined) vm.hasBusiness = false;
            else vm.hasBusiness = $rootScope.hasBusiness;

            if ($rootScope.isPromoter == undefined) vm.isPromoter = false;
            else vm.isPromoter = $rootScope.isPromoter;

            if ($rootScope.showWarning) showWarningsIcon();
            configGeolocation();

            vm.coordsRdy = $rootScope.coordsRdy;

            if ($rootScope.DEBUG_MODE) console.log("Navbar Loaded!");
            //console.log("isLoggedIn", !$rootScope.isLoggedIn)
            //console.log("user", $rootScope.user);
            //getCities();
            //detectLocation2();
        }

        function gotomybusiness() {
            //$stateProvider.state('app');
            // http://localhost:3006/#/mybiz
            // $state.go('mybiz');
/* 
            if (vm.isLoggedIn) {
              //double-check that a user account record exists
              var promise = useraccnt.adduseraccnt();
              promise.then(function(newId) {
                $state.go('mybiz');
              });

            } else {
              gotoHome();
            }
*/
            $state.go('mybusiness');            
        }

        function gotomyfavs() {
            //$stateProvider.state('app');
            $state.go('myfavs');
        }

        function goPromoterConsole(){
            $state.go('promoterconsole');
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

        function gotoTour() {
            dialog.tour();
        }

        function gotoHome() {
            $rootScope.fbmode = false;
            $rootScope.searchActive = false;
            $rootScope.hidelogo = false;
            $rootScope.inputVal = '';
            $state.go('cwrapper', {}, { reload: true });
            $rootScope.$emit('mainView');
        }


        function gotoCustomer() {
            //$stateProvider.state('app');
            $state.go('customer');
        }

        function goToLogin() {

            //Store current state
            $rootScope.stateName = $state.current.name;
            if ($rootScope.stateName == 'rankSummary') $rootScope.stateNum = $rootScope.cCategory.id;
            else if ($rootScope.stateName == 'answerDetail') $rootScope.stateNum = $rootScope.canswer.id;
            else $rootScope.stateNum = undefined;

            $state.go('login');
        }

        function logout() {

            login.logout().then(function () {

                vm.user = '';
                vm.isLoggedIn = false;

                localStorage.clear();

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
            $cookies.put('currentUserLatitude', $rootScope.currentUserLatitude);
            $cookies.put('currentUserLongitude', $rootScope.currentUserLongitude);

            $rootScope.coordsRdy = true;
            showCoordsIcon();

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
                timeout: 10000,
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

        function showWarningsIcon(){
            vm.warning = true;
        }
        function hideWarningsIcon(){
            vm.warning = false;
        }
        function showCoordsIcon(){
            vm.coordsRdy = true;
        }

        function goWarning(){
            /*
            var accntname = '';
            var answerid = 0;
            var idx = 0;
            for (var i=0; i < $rootScope.useraccnts.length; i++){
                if ($rootScope.useraccnts[i].email != '') {
                       answerid = $rootScope.useraccnts[i].answer
                       break;
                }
             }
            idx = $rootScope.answers.map(function(x) {return x.id; }).indexOf(answerid);
            console.log("$rootScope.useraccnts - ", $rootScope.useraccnts);
            console.log("idx - answerid - $rootScope.answers[idx].name -",idx,answerid);*/
           var idx = $rootScope.answers.map(function(x) {return x.id; }).indexOf($rootScope.useraccnts[0].answer);
           dialog.askEmail($rootScope.answers[idx].name);
        }

        function goCoords(){
           dialog.askPermissionToLocate();
        }
    }
})();
