(function () {
    'use strict';
    angular
        .module('app').filter('orderObjectBy', function () {
        return function (items, field, reverse) {
            var filtered = [];
            angular.forEach(items, function (item) {
                filtered.push(item);
            });
            filtered.sort(function (a, b) {
                return (a[field] > b[field] ? 1 : -1);
            });
            if (reverse) filtered.reverse();
            return filtered;
        };
    }).filter('objectLength', function () {
        return function (item) {
            if (!item) {
                return 0;
            }

            return Object.keys(item).length;
        }
    }).filter('searchObject', function () {
        return function (items, query, field) {
            if (!items)
                return null;

            var result = [];
            if (!query) {
                var obj = Object.keys(items);
                for (var i = 0, len = obj.length; i < len; i++) {
                    result.push(items[obj[i]]);
                }
                return result;
            }
            
            function compareStr(stra, strb) {
                stra = ("" + stra).toLowerCase();
                strb = ("" + strb).toLowerCase();
                return stra.indexOf(strb) !== -1;
            }
            
            angular.forEach(items, function (friend) {
                if (!field || field == '') {
                    var keys = Object.keys(friend);
                    for (var i = 0, len = keys.length; i < len; i++) {
                        if (compareStr(friend[keys[i]], query)) {
                            result.push(friend);
                            break;
                        }
                    }
                } else {
                    if (friend[field] && compareStr(friend[field], query)) {
                        result.push(friend);
                    }
                }
            });
            return result;
        }
    });
})();

