(function () {
    'use strict';

    
    angular.module('app', [
        // Angular modules 
        'angulike',
        'color.picker',
        'ngFileUpload',
        'ngAnimate',
        'ngCookies',
        //'ngResource',
        'ngRoute',
        'ngSanitize',
        'ngTouch',
        'ngMessages',
        
        //'pascalprecht.translate',
        //'tmh.dynamicLocale',
        
        // Custom modules 
        'login',

        // 3rd Party Modules
        'ui.router',                 // state provider
        'ui.bootstrap.modal',
        'mgcrea.ngStrap',
        
        '720kb.datepicker', //date picker for specials
        '720kb.socialshare',
        'ngFacebook',
        
        'ui.select',
        'infinite-scroll',
        'datatables'
    ]);
})();