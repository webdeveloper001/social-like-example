(function () {
    'use strict';

    angular
        .module('app')
        .service('search', search);

    search.$inject = ['$rootScope'];

    function search($rootScope) {

        //Members

        var service = {

            searchRanks: searchRanks,
            searchAnswers: searchAnswers,
        };

        return service;

        function searchRanks(query) {

            //initialize tool variables 
            var rt = '';   //rank title 
            var ss = '';   //search string
            var inm = false;
            var rank = {};
            var tagCapitalized = '';
            var tagFirstLowered = '';
            var rankObj = {};
            var short = ['pb', 'ob', 'dt', 'mb'];
            var corrnh = ['Pacific Beach', 'Ocean Beach', 'Downtown', 'Mission Beach'];

            var nme = false;  //near me
            var rte = false;
            var rt_nme = false;
            var nhe = false;
            var results = [];

            var input = query;
            
            if (input) {
                
                //ignore some keywords
                if (input.indexOf('best') > -1) input = input.replace('best', '');
                if (input.indexOf('Best') > -1) input = input.replace('Best', '');
                if (input.indexOf('top') > -1) input = input.replace('top', '');
                if (input.indexOf('Top') > -1) input = input.replace('Top', '');
                if (input.indexOf('great') > -1) input = input.replace('great', '');
                if (input.indexOf('Great') > -1) input = input.replace('Great', '');
                if (input.indexOf('awesome') > -1) input = input.replace('awesome', '');
                if (input.indexOf('Awesome') > -1) input = input.replace('Awesome', '');
                if (input.indexOf('amazing') > -1) input = input.replace('amazing', '');
                if (input.indexOf('Amazing') > -1) input = input.replace('Amazing', '');
                if (input.indexOf('most') > -1) input = input.replace('most', '');
                if (input.indexOf('Most') > -1) input = input.replace('Most', '');
                if (input.indexOf('the ') > -1) input = input.replace('the ', '');
                if (input.indexOf('The ') > -1) input = input.replace('The ', '');
                if (input.indexOf('shops') > -1) input = input.replace('shops', '');
                if (input.indexOf('Shops') > -1) input = input.replace('Shops', '');
                if (input.indexOf('places') > -1) input = input.replace('places', '');
                if (input.indexOf('Places') > -1) input = input.replace('Places', '');
                if (input.indexOf('delicious') > -1) input = input.replace('delicious', '');
                if (input.indexOf('Delicious') > -1) input = input.replace('Delicious', '');

                if (input.length >= 3) {

                var userIsTyping = false;
                var inputVal = input;

                //Check if user typed 'near me' conditions
                if (inputVal.indexOf('near me') > -1 ||
                    inputVal.indexOf('near') > -1 ||
                    inputVal.indexOf('close') > -1 ||
                    inputVal.indexOf('close to') > -1 ||
                    inputVal.indexOf('close to me') > -1) {
                    inm = true; //input has near me context
                    inputVal = inputVal.replace('near me', 'in San Diego');
                    inputVal = inputVal.replace('near', 'in San Diego');
                    inputVal = inputVal.replace('close to me', 'in San Diego');
                    inputVal = inputVal.replace('close to', 'in San Diego');
                    inputVal = inputVal.replace('close', 'in San Diego');
                }
                else {
                    inm = false;
                }

                    if (inputVal == 'Food') inputVal = inputVal.replace('Food', 'Food Near Me');
                    if (inputVal == 'food') inputVal = inputVal.replace('food', 'Food Near Me');
                 
                //Special Cases
                if (inputVal == 'pho' || inputVal == 'Pho') {
                    inputVal = 'vietnamese';
                }

                if ($rootScope.isNh) inputVal = inputVal + ' ' + $rootScope.cnh;

                var results_nm = [];
                var results_ss = [];
                var results_rt = [];
                var results_rt_nm = [];
                var results_nh = [];

                var m_ss = true; //match in search string
                var m_rt = true; //match in title
                var m_nh = false; //reference to neighborhood
                var nh = ''; //neighborhood reference
                var sc = false; //special case
                    //vm.content = $rootScope.content;
                    var valTags = inputVal.split(" ");
                    for (var j = 0; j < $rootScope.content.length; j++) {
                        if ($rootScope.content[j].ismp) {
                            //console.log("ismp is true");
                            ss = $rootScope.searchStr[j]; //Search string
                            rt = $rootScope.content[j].title; // title
                            rank = $rootScope.content[j];

                            m_ss = true;
                            m_rt = true;
                            
                            //check that all tags exist
                            for (var k = 0; k < valTags.length; k++) {

                                tagCapitalized = valTags[k].charAt(0).toUpperCase() + valTags[k].slice(1);
                                tagFirstLowered = valTags[k].charAt(0).toLowerCase() + valTags[k].slice(1);

                                //look for input in whole search string
                                m_ss = m_ss &&
                                    (ss.indexOf(valTags[k]) > -1 ||
                                        ss.indexOf(valTags[k].toUpperCase()) > -1 ||
                                        ss.indexOf(tagCapitalized) > -1 ||
                                        ss.indexOf(tagFirstLowered) > -1);

                                //look for input in rank title only        
                                m_rt = m_rt &&
                                    (rt.indexOf(valTags[k]) > -1 ||
                                        rt.indexOf(valTags[k].toUpperCase()) > -1 ||
                                        rt.indexOf(tagCapitalized) > -1 ||
                                        rt.indexOf(tagFirstLowered) > -1);

                                //look if input makes reference to specific neighborhood
                                if (valTags[k].length >= 3) {
                                    for (var q = 0; q < $rootScope.allnh.length; q++) {
                                        if ($rootScope.allnh[q].indexOf(valTags[k]) > -1 ||
                                            $rootScope.allnh[q].indexOf(valTags[k].toUpperCase()) > -1 ||
                                            $rootScope.allnh[q].indexOf(tagCapitalized) > -1 ||
                                            $rootScope.allnh[q].indexOf(tagFirstLowered) > -1) {
                                            //console.log("found neighborhood!", $rootScope.allnh[q]);
                                            nh = $rootScope.allnh[q];
                                            m_nh = true;
                                        }
                                    }
                                }
                                //Special cases for neighborhoods
                                if (valTags[k].length == 2) {
                                for (var q=0; q < short.length; q++) {
                                    if (short[q].indexOf(valTags[k]) > -1 ||
                                        short[q].indexOf(valTags[k].toUpperCase()) > -1 ||
                                        short[q].indexOf(tagCapitalized) > -1 ||
                                        short[q].indexOf(tagFirstLowered) > -1) {
                                        nh = corrnh[q];
                                        m_nh = true;
                                    }
                                }
                                }

                            }
                            
                            if (m_rt && rank.tags.indexOf('isMP') > -1) {
                                results_rt.push($rootScope.content[j]);
                                rte = true;
                            }

                            else if (m_ss) {
                                if (inm) {
                                    if (rank.title.indexOf('in San Diego') > -1) {
                                        results_ss.push($rootScope.content[j]);
                                    }
                                }
                                else results_ss.push($rootScope.content[j]);
                            }
                        }
                    }

                    //Execute only if input made reference to neighborhood
                    if (m_nh){
                        var m = false;
                        for (var j = 0; j < $rootScope.content.length; j++) {
                            ss = $rootScope.searchStr[j]; //Search string
                            //check that all tags exist
                            m = true;
                            for (var k = 0; k < valTags.length; k++) {

                                tagCapitalized = valTags[k].charAt(0).toUpperCase() + valTags[k].slice(1);
                                tagFirstLowered = valTags[k].charAt(0).toLowerCase() + valTags[k].slice(1);

                                //look for input in whole search string
                                m = m &&
                                    (ss.indexOf(valTags[k]) > -1 ||
                                        ss.indexOf(valTags[k].toUpperCase()) > -1 ||
                                        ss.indexOf(tagCapitalized) > -1 ||
                                        ss.indexOf(tagFirstLowered) > -1);
                            }

                            if (m) {
                                results_nh.push($rootScope.content[j]);
                                nhe = true;
                            }
                        }
                    }

                    //look in results that match title, if includes 'San Diego', make
                    //corresponding 'close to me'
                    for (var k = 0; k < results_rt.length; k++) {
                        rt = results_rt[k].title; //Rank title
                        if (rt.indexOf('in San Diego') > -1 && results_rt[k].isatomic == false) {
                            rankObj = {};
                            rankObj = JSON.parse(JSON.stringify(results_rt[k]));
                            rankObj.title = rankObj.title.replace('in San Diego', 'close to me');
                            results_rt_nm.push(rankObj);
                            rt_nme = true;
                        }
                    }

                    //look in results that match search string, in includes 'San Diego', make
                    //corresponding 'close to me'
                    for (var k = 0; k < results.length; k++) {
                        rt = results[k].title; //Rank title
                        if (rt.indexOf('in San Diego') > -1 && results[k].isatomic == false) {
                            rankObj = {};
                            rankObj = JSON.parse(JSON.stringify(results[k]));
                            rankObj.title = rankObj.title.replace('in San Diego', 'close to me');
                            results_nm.push(rankObj);
                            nme = true;
                        }
                    }

                    if (nhe) results = results.concat(results_nh);
                    if (rt_nme) results = results.concat(results_rt_nm);
                    if (rte) results = results.concat(results_rt);
                    if (nme) results = results.concat(results_nm);
                    results = results.concat(results_ss);

                    //sort results, give priority to city ones
                    //function compare(a, b) {
                    //    return b.title.indexOf('in San Diego') - a.title.indexOf('in San Diego');
                    //}
                    //vm.results = vm.results.sort(compare);
                }

                else {
                    results = [];
                }
            }

            return results;

        }

        function searchAnswers(query) {

            //initialize tool variables
            var tagCapitalized = '';
            var tagFirstLowered = '';
            var results_ans = [];
            var input = query;
            var m = false;
            var an = '';   //answer name
            
            if (input) {

                if (input.length >= 3) {

                    var userIsTyping = false;
                    var inputVal = input;
                    var valTags = inputVal.split(" ");

                    for (var j = 0; j < $rootScope.answers.length; j++) {

                        an = $rootScope.answers[j].name; // title
                        m = true;
                        
                        //check that all tags exist
                        for (var k = 0; k < valTags.length; k++) {

                            tagCapitalized = valTags[k].charAt(0).toUpperCase() + valTags[k].slice(1);
                            tagFirstLowered = valTags[k].charAt(0).toLowerCase() + valTags[k].slice(1);

                            //look for input in answer names
                            m = m &&
                               (an.indexOf(valTags[k]) > -1 ||
                                an.indexOf(valTags[k].toUpperCase()) > -1 ||
                                an.indexOf(tagCapitalized) > -1 ||
                                an.indexOf(tagFirstLowered) > -1);

                        }

                        if (m) {

                             if ($rootScope.isNh) {
                                 if ($rootScope.answers[j].cityarea == $rootScope.cnh){
                                        results_ans.push($rootScope.answers[j]);
                                 }
                             }
                            else results_ans.push($rootScope.answers[j]);
                        }

                    }
                }
            }

            return results_ans;

        }

    }
})();