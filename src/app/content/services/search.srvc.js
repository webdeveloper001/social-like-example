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
            searchRanks2: searchRanks2,
            searchAnswers: searchAnswers,
            searchRanksMainPage: searchRanksMainPage,
            sibblingRanks: sibblingRanks, 
        };

        return service;

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
                                if ($rootScope.content[j].mp)
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
                //find answers in this category
                for (var n = 0; n < catArr.length; n++) {
                    if ($rootScope.catansrecs[i].category == catArr[n]) {
                        for (var j = 0; j < $rootScope.catansrecs.length; j++) {
                            //find answers in other categories
                            if ($rootScope.catansrecs[j].answer == $rootScope.catansrecs[i].answer) {
                                idx = $rootScope.content.map(function (x) { return x.id; }).indexOf($rootScope.catansrecs[j].category);
                                if (idx > -1){
                                    sibExists = false;
                                    for (var k = 0; k < sibblingRanksX.length; k++) {
                                        if (sibblingRanksX[k].title.substr(0, 6) == $rootScope.content[idx].title.substr(0, 6)) {
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
                        }
                        ansCtr++;
                        if (ansCtr >= ansLim) break;
                    }
                }
            }
            //Change to appropriate neighborhood
            for (var i=0; i < sibblingRanksX.length; i++){
                //console.log("sibblingRanksX - ", sibblingRanksX[i]);
                if (sibblingRanksX[i].isatomic && sibblingRanksX[i].ismp) sibblingRanks.push(sibblingRanksX[i]);
                
                if (!sibblingRanksX[i].isatomic && catObj.nh != 1) sibblingRanks.push(sibblingRanksX[i]);
                
                else if (sibblingRanksX[i].isatomic && !sibblingRanksX[i].ismp || 
                            !sibblingRanksX[i].isatomic && sibblingRanksX[i].nh != 1){
                    for (var j=0; j < $rootScope.locations.length; j++){
                        if (sibblingRanksX[i].title.indexOf($rootScope.locations[j].nh_name)>-1){
                            searchtitle = sibblingRanksX[i].title.replace($rootScope.locations[j].nh_name,neighborhood);
                            var rFound = false;
                            for (var k=0; k<$rootScope.content.length; k++){
                                if ($rootScope.content[k].title == searchtitle){
                                    //console.log('found and added - ', searchtitle );
                                    rankObj = $rootScope.content[k];
                                    rankObj.ctr = sibblingRanksX[i].ctr;
                                    rankObj.isghost = false;
                                    sibblingRanks.push(rankObj);
                                    rFound = true;
                                    break;
                                }
                            }
                            if (!rFound){
                                if ($rootScope.DEBUG_MODE) console.log('Couldnt find: ', searchtitle, ' made it ghost :)');
                                //Create ghost ranking for suggestion
                                var ghostObj = {};
                                ghostObj.title = searchtitle;
                                ghostObj.cat = sibblingRanksX[i].cat;
                                var nidx = $rootScope.locations.map(function (x) { return x.nh_name; }).indexOf(neighborhood);
                                ghostObj.nh = $rootScope.locations[nidx].id;
                                ghostObj.isghost = true;
                                ghostObj.isatomic = true;
                                if ($rootScope.DEBUG_MODE) console.log('ghost - ', ghostObj);
                                sibblingRanks.push(ghostObj);
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

            //if(nh_names.indexOf('Pacific Beach') != -1)

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
                if (input.indexOf('what ') > -1) input = input.replace('what ', '');
                if (input.indexOf('What ') > -1) input = input.replace('What ', '');
                if (input.indexOf('are ') > -1) input = input.replace('are ', '');
                if (input.indexOf('where ') > -1) input = input.replace('where ', '');
                if (input.indexOf('Where ') > -1) input = input.replace('Where ', '');

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
                /*
                if (inputVal == 'pho' || inputVal == 'Pho') {
                    inputVal = 'vietnamese';
                }*/

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

                    //check for nh tags tag first
                             for (var k = 0; k < valTags.length; k++) {

                                tagCapitalized = valTags[k].charAt(0).toUpperCase() + valTags[k].slice(1);
                                tagFirstLowered = valTags[k].charAt(0).toLowerCase() + valTags[k].slice(1);

                                //look if input makes reference to specific neighborhood
                                if (valTags[k].length >= 3) {

                                    if (valTags[k] != 'car' && 
                                        valTags[k] != 'del' &&
                                        valTags[k] != 'bar'){
                                        for (var q = 0; q < $rootScope.locations.length; q++) {
                                            if ($rootScope.locations[q].nh_name.toLowerCase().indexOf(valTags[k]) > -1 ||
                                                $rootScope.locations[q].nh_name.toLowerCase().indexOf(valTags[k].toUpperCase()) > -1 ||
                                                $rootScope.locations[q].nh_name.indexOf(tagCapitalized) > -1 ||
                                                $rootScope.locations[q].nh_name.indexOf(tagFirstLowered) > -1) {
                                                //console.log("found neighborhood!", $rootScope.locations[q]);
                                                checkNoDupThenPush($rootScope.locations[q], nh);
                                                m_nh = true;
                                                ignoreTagsIdx.push(k);
                                            }
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
                            ignoreTagsIdx.push(valTags.indexOf('la'));

                      for (var j = 0; j < $rootScope.categories.length; j++) {  
                        if ($rootScope.categories[j].category.indexOf('@Nh')>-1) {    
                            
                            ss = $rootScope.searchStr[j]; //Search string
                            rt = $rootScope.categories[j].category; // title
                            rank = $rootScope.categories[j];

                            m_ss = true;
                            m_rt = true;                 
                            
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
                                        rObj.useTemp = true;
                                        results_rt.push(rObj);
                                    }
                                }
                                else {
                                    rObj.title = rObj.category.replace('@Nh', 'San Diego');
                                    rObj.locationId = 1;
                                    rObj.useTemp = true;
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
                                        rObj.useTemp = true;
                                        results_ss.push(rObj);
                                    }
                                }
                                else {
                                    rObj.title = rObj.category.replace('@Nh', 'San Diego');
                                    rObj.locationId = 1;
                                    rObj.useTemp = true;
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

        function searchRanks2(query) {
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

                    //if (inputVal == 'Food') inputVal = inputVal.replace('Food', 'Food Near Me');
                    //if (inputVal == 'food') inputVal = inputVal.replace('food', 'Food Near Me');
                 
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

                    //check for nh tags tag first
                    for (var k = 0; k < valTags.length; k++) {

                        tagCapitalized = valTags[k].charAt(0).toUpperCase() + valTags[k].slice(1);
                        tagFirstLowered = valTags[k].charAt(0).toLowerCase() + valTags[k].slice(1);

                        //look if input makes reference to specific neighborhood

                        if (valTags[k].length >= 3) {

                            if (valTags[k] != 'car' &&
                                valTags[k] != 'del' &&
                                valTags[k] != 'bar') {
                                for (var q = 0; q < $rootScope.locations.length; q++) {
                                    if ($rootScope.locations[q].nh_name.toLowerCase().indexOf(valTags[k]) > -1 ||
                                        $rootScope.locations[q].nh_name.toLowerCase().indexOf(valTags[k].toUpperCase()) > -1 ||
                                        $rootScope.locations[q].nh_name.indexOf(tagCapitalized) > -1 ||
                                        $rootScope.locations[q].nh_name.indexOf(tagFirstLowered) > -1) {
                                        //console.log("found neighborhood!", $rootScope.locations[q]);
                                        //checkNoDupThenPush($rootScope.locations[q], nh);
                                        m_nh = true;
                                        //ignoreTagsIdx.push(k);
                                    }
                                }
                            }
                        }
                        //Special cases for neighborhoods
                        if (valTags[k].length == 2) {
                            for (var q = 0; q < shortnames.length; q++) {
                                if (shortnames[q] == valTags[k] ||
                                    shortnames[q] == valTags[k].toUpperCase() ||
                                    shortnames[q] == tagCapitalized ||
                                    shortnames[q] == tagFirstLowered) {
                                    //checkNoDupThenPush(short[q],nh);
                                    m_nh = true;
                                    //ignoreTagsIdx.push(k);
                                    valTags[k] = corrnh[q];
                                    //console.log("valTags - ", valTags);                                            
                                }
                            }
                        }
                    }
                    //ignoreTagsIdx.push(valTags.indexOf('la'));


                      for (var j = 0; j < $rootScope.content.length; j++) {  
                        if (true) {    
                            
                            ss = $rootScope.searchStrContent[j]; //Search string
                            rt = $rootScope.content[j].title; // title
                            rank = $rootScope.content[j];

                            if(!rt || !ss) console.log("this has issues - content.id - ",$rootScope.content[j]);
                            else {
                            m_ss = true;
                            m_rt = true;
                            //check that all tags exist exept those that are for neighborhood
                             for (var k = 0; k < valTags.length; k++) {

                                 //if (ignoreTagsIdx.indexOf(k) < 0) {
                                   if (true){  

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
                                rObj = JSON.parse(JSON.stringify($rootScope.content[j]));
                                rObj.useTemp = false;
                                if (m_nh) results_rt.push(rObj);
                                else if (rObj.ismp) results_rt.push(rObj);
                                rte = true; 
                            }
                            
                            else if (m_ss){
                                rObj = {};
                                rObj = JSON.parse(JSON.stringify($rootScope.content[j]));
                                rObj.useTemp = false;
                                if (m_nh) results_ss.push(rObj);
                                else if (rObj.ismp) results_ss.push(rObj);
                                
                            }
                            }//temp 
                        }
                    }

                    //if (nhe) results = results.concat(results_nh);
                    //if (rt_nme) results = results.concat(results_rt_nm);
                    if (results_rt.length > 2) shuffle(results_rt);
                    if (rte) results = results.concat(results_rt);
                    //if (nme) results = results.concat(results_nm);
                    if (results_ss.length > 2) shuffle(results_ss);
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

        function shuffle(array) {
            var currentIndex = array.length, temporaryValue, randomIndex;
            // While there remain elements to shuffle...
            while (0 !== currentIndex) {
                // Pick a remaining element...
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1;
                // And swap it with the current element.
                temporaryValue = array[currentIndex];
                array[currentIndex] = array[randomIndex];
                array[randomIndex] = temporaryValue;
            }
            return array;
        }
        
        
        
    }
})();