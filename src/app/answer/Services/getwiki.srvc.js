(function () {
    'use strict';

    angular
        .module('app')
        .service('getwiki', getwiki);

    getwiki.$inject = ['$rootScope', '$http', 'APP_API_KEY', 'GOOGLE_API_KEY','$cookies'];

    function getwiki($rootScope, $http, APP_API_KEY, GOOGLE_API_KEY, $cookies) {

        var service = {

            getWiki: getWiki
        };

        return service;

        function getWiki(answer) {

            delete $http.defaults.headers.common['X-Dreamfactory-API-Key'];
            delete $http.defaults.headers.common['X-DreamFactory-Session-Token'];
            
                var url = 'https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=extracts&list=&meta=&continue=&titles=' + answer;
                //console.log("url --- ", url);
                //return $http.get(url, {}, {
                return $http.post(url, {}, {   
                    headers: {
                        'Content-Type': 'multipart/form-data'
                        //'Access-Control-Allow-Headers': 'x-dreamfactory-api-key'
                    }
                }).then(function (result) {
                    //console.log("1. wiki results - ", result.query.pages[0].extract);
                    var wikiRaw = JSON.stringify(result.data.query.pages);
                    var wikiRes = wikiRaw.slice(wikiRaw.indexOf('<p><b>'),wikiRaw.indexOf('<h2>'));
                    wikiRes = wikiRes.replace(/<p>/g,'');
                    wikiRes = wikiRes.replace(/<\/p>/g,'');
                    wikiRes = wikiRes.replace(/<i>/g,'');
                    wikiRes = wikiRes.replace(/<\/i>/g,'');
                    wikiRes = wikiRes.replace(/<small>/g,'');
                    wikiRes = wikiRes.replace(/<\/small>/g,'');
                    wikiRes = wikiRes.replace(/<span title\=\\"Representation in the International Phonetic Alphabet \(IPA\)\\">/g,'');
                    wikiRes = wikiRes.replace(/<\/span>/g,'');
                    wikiRes = wikiRes.replace(/<b>/g,'');
                    wikiRes = wikiRes.replace(/<\/b>/g,'');
                    wikiRes = wikiRes.replace(/.\\n\\n/g,'.');
                    wikiRes = wikiRes.replace(/.\\n/g,'.');
                    wikiRes = wikiRes.replace(/<(?:.|\n)*?>/gm, '');

                    if ($rootScope.DEBUG_MODE) console.log("1. wiki results res - ", wikiRes);
                    //answer.location = result.data.results[0].formatted_address;
                    //answer.lat = result.data.results[0].geometry.location.lat;
                    //answer.lng = result.data.results[0].geometry.location.lng;

                    $http.defaults.headers.common['X-Dreamfactory-API-Key'] = APP_API_KEY;
                    $http.defaults.headers.common['X-DreamFactory-Session-Token'] = $cookies.session_token;
                    $rootScope.$emit('wikiReady', wikiRes);
                    //answer.updateAnswer(cAnswer.id,['lat','lng','location'],[lat,lng,fa]);
                });

            
        }
    }


})();