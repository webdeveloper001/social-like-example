(function () {
    'use strict';

    angular
        .module('app')
        .controller('navbar', navbar);

    navbar.$inject = ['$location', '$translate', '$rootScope', 'login', '$state', 'city'];

    function navbar($location, $translate, $rootScope, login, $state, city) {
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
        vm.gotoAdmin = gotoAdmin;
        vm.gotoCustomer = gotoCustomer;
        vm.openCitySelection = openCitySelection;

        activate();
        getCities();

        function activate() {

            console.log("Navbar Loaded!");
            //console.log("isLoggedIn", !$rootScope.isLoggedIn)
            //console.log("user", $rootScope.user);
        }

        function gotoAbout() {
            //$stateProvider.state('app');
            $state.go('about');
        }

        function gotoAdmin() {
            //$stateProvider.state('app');
            $state.go('admin');
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

        /**
         * This function detect City using geo location(lat,long)
         * Geo location works only on secure origins in Google Chrome
         */
        function autoDetectCity() {

            var geocoder;
            geocoder = new google.maps.Geocoder();

            if (navigator.geolocation) {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(showPosition);
                } else {
                    selectCity();
                }
            } else {
                selectCity();
            }

            function showPosition(position) {

                var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

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
    }
})();
