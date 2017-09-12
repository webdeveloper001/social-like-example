(function () {
    'use strict';

    angular
        .module('app')
        .factory('color', color);

    color.$inject = ['$http', '$q', '$rootScope'];

    function color($http, $q, $rootScope) {

        var service = {
            shadeColor: shadeColor,
            hsl2rgb: hsl2rgb,
            hue2rgb: hue2rgb,
            defaultRankColor: defaultRankColor
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
                else if (color == 'blue') color = '#0000ff';
                else if (color == 'white') color = '#ffffff';
                else if ($rootScope.DEBUG_MODE) console.log("Dont know what color is ", color);
            }

            var f = parseInt(color.slice(1), 16), t = percent < 0 ? 0 : 255, p = percent < 0 ? percent * -1 : percent, R = f >> 16, G = f >> 8 & 0x00FF, B = f & 0x0000FF;
            return "#" + (0x1000000 + (Math.round((t - R) * p) + R) * 0x10000 + (Math.round((t - G) * p) + G) * 0x100 + (Math.round((t - B) * p) + B)).toString(16).slice(1);
        }

        function hsl2rgb(hsl) {
            var a, b, g, h, l, p, q, r, ref, s;
            //if (isString(hsl)) {
                //if (!hsl.match(Color.HSL_REGEX)) {
                //    return;
                //}
                ref = hsl.match(/hsla?\((.+?)\)/)[1].split(',').map(function (value) {
                    value.trim();
                    return parseFloat(value);
                }), h = ref[0], s = ref[1], l = ref[2], a = ref[3];
            //} else if ((isObject(hsl)) && (hasKeys(hsl, ['h', 's', 'l']))) {
            //    h = hsl.h, s = hsl.s, l = hsl.l, a = hsl.a;
            //} else {
            //    return;
            //}
            h /= 360;
            s /= 100;
            l /= 100;
            if (s === 0) {
                r = g = b = l;
            } else {
                q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                p = 2 * l - q;
                r = hue2rgb(p, q, h + 1 / 3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1 / 3);
            }
            return '#' + Math.round(r * 255).toString(16) + Math.round(g * 255).toString(16) + Math.round(b * 255).toString(16);
        }

        function hue2rgb(p, q, t){
                if(t < 0) t += 1;
                if(t > 1) t -= 1;
                if(t < 1/6) return p + (q - p) * 6 * t;
                if(t < 1/2) return q;
                if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
        }

        function defaultRankColor(x){
             //Determine background color for rank of rankofday
             var bc = '';
             var fc = '';
             if (x.tags == undefined || x.tags == null ) {
                 x.tags = '';
                 //console.log("@color - ", x);
             }

                    if (x.tags.indexOf('food')>-1) {bc = 'brown'; fc = '#f8f8ff';}
                    else if (x.tags.indexOf('lifestyle')>-1) {bc = '#008080'; fc = '#f8f8ff';}
                    else if (x.tags.indexOf('social')>-1) {bc = '#4682b4'; fc = '#f8f8ff';}
                    else if (x.tags.indexOf('city')>-1) {bc = 'gray'; fc = '#f8f8ff';}
                    else if (x.tags.indexOf('neighborhood')>-1) {bc = 'gray'; fc = '#f8f8ff';}
                    else if (x.tags.indexOf('politics')>-1) {bc = '#595959'; fc = '#f8f8ff';}
                    else if (x.tags.indexOf('sports')>-1) {bc = '#4682b4'; fc = '#f8f8ff';} 
                    else if (x.tags.indexOf('beauty')>-1) {bc = '#a3297a'; fc = '#f8f8ff';}
                    else if (x.tags.indexOf('health')>-1) {bc = 'green'; fc = '#f8f8ff';}
                    else if (x.tags.indexOf('services')>-1) {bc = '#c68c53'; fc = '#f8f8ff';}
                    else if (x.tags.indexOf('technology')>-1) {bc = 'gray'; fc = '#f8f8ff';}
                    else if (x.tags.indexOf('dating')>-1) {bc = '#b22222'; fc = '#f8f8ff';}
                    else if (x.tags.indexOf('personalities')>-1) {bc = '#c68c53'; fc = '#f8f8ff';}
                    else {bc = 'gray'; fc = '#f8f8ff';}

                    return [bc, fc];
        }

    }
})();