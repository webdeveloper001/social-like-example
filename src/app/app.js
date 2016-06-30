(function () {
    'use strict';

    angular.module('app', [
        // Angular modules 
        'ngAnimate',
        'ngCookies',
        'ngResource',
        'ngRoute',
        'ngSanitize',
        'ngTouch',
        'ngMessages',
        'pascalprecht.translate',
        'tmh.dynamicLocale',
        //'ngStrap',
        
        //'mgcrea.ngStrap.typeahead',
        //'mgcrea.ngStrap.tooltip',
        //'mgcrea.ngStrap.helpers.parseOptions',

        // Custom modules 
        'login',

        // 3rd Party Modules
        'ui.router',                 // state provider
        'ui.bootstrap.modal',
        'mgcrea.ngStrap',
        'color.picker',
        'ui.calendar'
    ]);
})();