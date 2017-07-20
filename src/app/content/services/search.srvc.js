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
            searchRanksMainPage: searchRanksMainPage,
            sibblingRanks: sibblingRanks, 
        };

        return service;
/*
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
                                    for (var q = 0; q < $rootScope.locations.length; q++) {
                                        if ($rootScope.locations[q].indexOf(valTags[k]) > -1 ||
                                            $rootScope.locations[q].indexOf(valTags[k].toUpperCase()) > -1 ||
                                            $rootScope.locations[q].indexOf(tagCapitalized) > -1 ||
                                            $rootScope.locations[q].indexOf(tagFirstLowered) > -1) {
                                            //console.log("found neighborhood!", $rootScope.locations[q]);
                                            nh = $rootScope.locations[q];
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
                            
                            if (m_rt && rank.ismp) {
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
        */

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

                            //look for input in answer names ||

                            var caseInsensitive = false;
                            var equals = an.toLowerCase().split(' ').filter(function(antag){
                                return antag == valTags[k].toLowerCase();
                            });
                        
                            if (equals.length >= 1) {
                                caseInsensitive = true;
                            } 
                            m = m &&
                               (an.indexOf(valTags[k]) > -1 ||
                                an.indexOf(valTags[k].toUpperCase()) > -1 ||
                                an.indexOf(tagCapitalized) > -1 ||
                                an.indexOf(tagFirstLowered) > -1 ||
                                caseInsensitive);   // If one splited by space and lowercased answer name tags is same as tag then return

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

        function searchRanksMainPage(isCity, query) {

            //initialize tool variables 
            var rank = {};
            var tagCapitalized = '';
            var tagFirstLowered = '';
            var rankObj = {};
            var results = [];
            var ss = '';

            var input = query;
            if (input) {
                var inputVal = input;

                var results_ss = [];
                var m_ss = true; //match in search string
                
                var valTags = inputVal.split(" ");
                
                    for (var j = 0; j < $rootScope.searchStrContent.length; j++) {
                      //  if ($rootScope.content[j].ismp) {
                            //console.log("ismp is true");
                            ss = $rootScope.searchStrContent[j]; //search String
                            rank = $rootScope.content[j];
                            m_ss = true;

                            //check that all tags exist
                            for (var k = 0; k < valTags.length; k++) {

                                tagCapitalized = valTags[k].charAt(0).toUpperCase() + valTags[k].slice(1);
                                tagFirstLowered = valTags[k].charAt(0).toLowerCase() + valTags[k].slice(1);
                                if(!ss)
                                    console.log(j);
                                //look for input in rank title only        
                                m_ss = m_ss &&
                                    (ss.indexOf(valTags[k]) > -1 ||
                                        ss.indexOf(valTags[k].toUpperCase()) > -1 ||
                                        ss.indexOf(tagCapitalized) > -1 ||
                                        ss.indexOf(tagFirstLowered) > -1);
                            }
                            
                            if (m_ss && isCity) {
                                if ($rootScope.content[j].ismp)
                                    results_ss.push($rootScope.content[j]);
                            }
                            else if (m_ss){
                                results_ss.push($rootScope.content[j]);
                            }
                     //   }
                    }
                    results = results_ss;              
            }

            return results;

        }

        function sibblingRanks(catObj,neighborhood) {

            function compare(a, b) {
                return b.ctr - a.ctr;
            }
            //console.log("@sibblingRanks", catObj);
            var sibblingRanksX = [];
            var sibblingRanks = [];
            var catArr = [];
            var sibExists = false;
            var searchtitle = '';
            var ansLim = 50;
            var ansCtr = 0;
            var rankObj = {};
            if (catObj.isatomic) catArr.push(catObj.id)
            else catArr = catObj.catstr.split(':').map(Number);

            var idx = 0;
            //Determine suggestions for answers in this category
            for (var i = 0; i < $rootScope.catansrecs.length; i++) {
                //found answers in this category
                for (var n = 0; n < catArr.length; n++) {
                    if ($rootScope.catansrecs[i].category == catArr[n]) {
                        for (var j = 0; j < $rootScope.catansrecs.length; j++) {
                            //find answers in other categories
                            if ($rootScope.catansrecs[j].answer == $rootScope.catansrecs[i].answer) {
                                idx = $rootScope.content.map(function (x) { return x.id; }).indexOf($rootScope.catansrecs[j].category);
                                
                                sibExists = false;
                                for (var k=0; k < sibblingRanksX.length; k++){
                                    if (sibblingRanksX[k].title.substr(0,6) == $rootScope.content[idx].title.substr(0,6)) {
                                        sibblingRanksX[k].ctr++; 
                                        sibExists = true;
                                    }                                     
                                }
                                if (!sibExists) {
                                    rankObj = $rootScope.content[idx];
                                    rankObj.ctr = 1;
                                    sibblingRanksX.push(rankObj);
                                }                                                                    
                            }
                        }
                        ansCtr++;
                        if (ansCtr >= ansLim) break;
                    }
                }
            }
            //Change to approprate neighborhood
            for (var i=0; i < sibblingRanksX.length; i++){
                if (sibblingRanksX[i].isatomic && sibblingRanksX[i].ismp) sibblingRanks.push(sibblingRanksX[i]);
                else if (sibblingRanksX[i].isatomic && !sibblingRanksX[i].ismp){
                    for (var j=0; j < $rootScope.locations.length; j++){
                        if (sibblingRanksX[i].title.indexOf($rootScope.locations[j].nh_name)>-1){
                            searchtitle = sibblingRanksX[i].title.replace($rootScope.locations[j].nh_name,neighborhood);
                            for (var k=0; k<$rootScope.content.length; k++){
                                if ($rootScope.content[k].title == searchtitle){
                                    rankObj = $rootScope.content[k];
                                    rankObj.ctr = sibblingRanksX[i].ctr;
                                    sibblingRanks.push(rankObj);
                                }
                            }
                        }
                    }                    
                }
            }
            /*
            for (var m=0; m<sibblingRanks.length; m++){
                console.log(sibblingRanks[m].title, sibblingRanks[m].ctr);
            }
            */
            sibblingRanks = sibblingRanks.sort(compare);
            if (sibblingRanks.length > 8) return sibblingRanks.slice(0,8);
            else return sibblingRanks;
        }

        
 function searchRanks(query) {
            //initialize tool variables 
            var rt = '';   //rank title 
            var ss = '';   //search string
            var inm = false;
            var rank = {};
            var tagCapitalized = '';
            var tagFirstLowered = '';
            var rankObj = {};
            var short = [];
            var shortnames = ['pb', 'ob', 'dt', 'mb'];
            var corrnh = ['Pacific Beach', 'Ocean Beach', 'Downtown', 'Mission Beach'];
            if(!$rootScope.locations)
                return [];
            var nh_names = $rootScope.locations.map(function(loc){ return loc.nh_name; });
            for (var i = 0; i < corrnh.length; i++) {
                var ind = nh_names.indexOf(corrnh[i]);
                if(ind != -1) {
                    var loc = angular.copy($rootScope.locations[ind]);
                    loc.nh_short_name =  shortnames[i];
                    short.push(loc);
                }
            }

            if(nh_names.indexOf('Pacific Beach') != -1)

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
                var rObj = {};
                var ignoreTagsIdx = [];

                var m_ss = true; //match in search string
                var m_rt = true; //match in title
                var m_nh = false; //reference to neighborhood
                var nh = []; //neighborhood reference
                var sc = false; //special case
                    
                    var valTags = inputVal.toLowerCase().split(" ");
                      for (var j = 0; j < $rootScope.categories.length; j++) {  
                        if (true) {    
                            
                            ss = $rootScope.searchStr[j]; //Search string
                            rt = $rootScope.categories[j].category; // title
                            rank = $rootScope.categories[j];

                            m_ss = true;
                            m_rt = true;
                            
                            //check for nh tags tag first
                             for (var k = 0; k < valTags.length; k++) {

                                tagCapitalized = valTags[k].charAt(0).toUpperCase() + valTags[k].slice(1);
                                tagFirstLowered = valTags[k].charAt(0).toLowerCase() + valTags[k].slice(1);

                                //look if input makes reference to specific neighborhood
                                if (valTags[k].length >= 3) {
                                    for (var q = 0; q < $rootScope.locations.length; q++) {
                                        if ($rootScope.locations[q].nh_name.toLowerCase().indexOf(valTags[k]) > -1 ||
                                            $rootScope.locations[q].nh_name.toLowerCase().indexOf(valTags[k].toUpperCase()) > -1 ||
                                            $rootScope.locations[q].nh_name.indexOf(tagCapitalized) > -1 ||
                                            $rootScope.locations[q].nh_name.indexOf(tagFirstLowered) > -1) {
                                            //console.log("found neighborhood!", $rootScope.locations[q]);
                                            checkNoDupThenPush($rootScope.locations[q],nh);
                                            m_nh = true;
                                            ignoreTagsIdx.push(k);
                                        }
                                    }
                                }
                                //Special cases for neighborhoods
                                if (valTags[k].length == 2) {
                                    for (var q = 0; q < short.length; q++) {
                                        if (short[q].nh_short_name.toLowerCase().indexOf(valTags[k]) > -1 ||
                                            short[q].nh_short_name.toLowerCase().indexOf(valTags[k].toUpperCase()) > -1 ||
                                            short[q].nh_short_name.indexOf(tagCapitalized) > -1 ||
                                            short[q].nh_short_name.indexOf(tagFirstLowered) > -1) {
                                            checkNoDupThenPush(short[q],nh);
                                            m_nh = true;
                                            ignoreTagsIdx.push(k);
                                        }
                                    }
                                }
                            }


                             //check that all tags exist exept those that are for neighborhood
                             for (var k = 0; k < valTags.length; k++) {

                                 if (ignoreTagsIdx.indexOf(k) < 0) {

                                     tagCapitalized = valTags[k].charAt(0).toUpperCase() + valTags[k].slice(1);
                                     tagFirstLowered = valTags[k].charAt(0).toLowerCase() + valTags[k].slice(1);

                                     //look for input in whole search string
                                     if(!ss)
                                        console.log(j);
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

                                 }
                             }
                            
                            if (m_rt){
                                rObj = {};
                                rObj = JSON.parse(JSON.stringify($rootScope.categories[j]));
                                if (m_nh) {
                                    for (var n=0; n < nh.length; n++){
                                        rObj = {};
                                        rObj = JSON.parse(JSON.stringify($rootScope.categories[j]));
                                        rObj.title = rObj.category.replace('@Nh', nh[n].nh_name);
                                        rObj.locationId = nh[n].id;
                                        results_rt.push(rObj);
                                    }
                                }
                                else {
                                    rObj.title = rObj.category.replace('@Nh', 'San Diego');
                                    rObj.locationId = 1;
                                    results_rt.push(rObj);
                                }
                                
                                rte = true; 
                            }
                            
                            else if (m_ss){
                                rObj = {};
                                rObj = JSON.parse(JSON.stringify($rootScope.categories[j]));
                                if (m_nh) {
                                    for (var n=0; n < nh.length; n++){
                                        rObj = {};
                                        rObj = JSON.parse(JSON.stringify($rootScope.categories[j]));
                                        rObj.title = rObj.category.replace('@Nh', nh[n].nh_name);
                                        rObj.locationId = nh[n].id;
                                        results_ss.push(rObj);
                                    }
                                }
                                else {
                                    rObj.title = rObj.category.replace('@Nh', 'San Diego');
                                    rObj.locationId = 1;
                                    results_ss.push(rObj);
                                }
                            } 
                        }
                    }

                    if (nhe) results = results.concat(results_nh);
                    //if (rt_nme) results = results.concat(results_rt_nm);
                    if (rte) results = results.concat(results_rt);
                    //if (nme) results = results.concat(results_nm);
                    results = results.concat(results_ss);

                }

                else {
                    results = [];
                }
            }

            return results;

        }

        function checkNoDupThenPush(x,array){
            var isdup = false;
            for (var i=0; i<array.length; i++){
                if (x.nh_name == array[i].nh_name){
                    isdup = true;
                    break;
                }
            }
            if (!isdup) array.push(x);
        }
        
        
        
    }
})();