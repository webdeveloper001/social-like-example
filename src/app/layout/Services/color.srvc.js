(function () {
    'use strict';

    angular
        .module('app')
        .factory('color', color);

    color.$inject = ['$http', '$q', '$rootScope'];

    function color($http, $q, $rootScope) {

        var service = {
            shadeColor: shadeColor
        };

        return service;
        //Color must be on format '#AA00BB'
        function shadeColor(color, percent) {

            if (color.charAt(0) != '#'){
                if (color == 'red') color = '#ff0000';
                else if (color == 'black') color = '#000000';
                else if (color == 'grey' || color == 'gray') color = '#808080';
                else if (color == 'lightgrey' || color == 'lightgray') color = '#d3d3d3';
                else if (color == 'darkgrey' || color == 'darkgray') color = '#a9a9a9';
                else if (color == 'green') color = '#008000';
                else if (color == 'brown') color = '#a52a2a';
                else if (color == 'blue') color = '#ff0000';
                else if (color == 'white') color = '#ffffff';
                else console.log("Dont know what color is ", color);
            }

            var f = parseInt(color.slice(1), 16), t = percent < 0 ? 0 : 255, p = percent < 0 ? percent * -1 : percent, R = f >> 16, G = f >> 8 & 0x00FF, B = f & 0x0000FF;
            return "#" + (0x1000000 + (Math.round((t - R) * p) + R) * 0x10000 + (Math.round((t - G) * p) + G) * 0x100 + (Math.round((t - B) * p) + B)).toString(16).slice(1);
        }



    }
})();