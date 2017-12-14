(function () {
    'use strict';

    angular
        .module('app')
        .service('search', search);

    search.$inject = ['$rootScope'];

    function search($rootScope) {

        //Members
        var _nhid = -1;
        var _nhname = '';
        var _searchFavs = '';
        var _searchFFavs = '';

        var service = {

            searchRanks: searchRanks,
            searchRanks2: searchRanks2,
            searchAnswers: searchAnswers,
            searchAnswersQuery: searchAnswersQuery,
            searchRanksMainPage: searchRanksMainPage,
            sibblingRanks: sibblingRanks,
            searchRelatedRanks: searchRelatedRanks,
            searchMyFavs: searchMyFavs,
            searchMyFFavs: searchMyFFavs
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
            var ansObj = {};
            
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
                            /*
                             if ($rootScope.isNh) {
                                 if ($rootScope.answers[j].cityarea == $rootScope.cnh){
                                        results_ans.push($rootScope.answers[j]);
                                 }
                             }
                            else*/
                            ansObj = JSON.parse(JSON.stringify($rootScope.answers[j]));
                            results_ans.push(ansObj);
                        }
                    }
                }
            }

            prepareForDisplay(results_ans);
            return results_ans;

        }

        function searchAnswersQuery(ranks) {
            //console.log("searchAnswersQuery - ", ranks, $rootScope.catansrecs.length);

            //var ranksmap = ranks.map(function(x) {return x.id; });
            var results_ans = [];
            var aidx = -1;
            var catstrA = [];
            $rootScope.catansrecs.forEach(function(c){ //catans
                ranks.forEach(function(r){ //rank
                    
                    if (r.catstr != undefined && r.catstr != '') {
                        catstrA = r.catstr.split(':').map(Number);
                    } 

                    if (c.category == r.id || catstrA.indexOf(c.category)>-1) {
                        //check if its not in results already
                        if (results_ans.length > 0){
                            //console.log("results_ans - ", results_ans);
                            if (results_ans.map(function(x) {return x.id; }).indexOf(c.answer) < 0){
                                aidx = $rootScope.answers.map(function(x) {return x.id; }).indexOf(c.answer);
                                if ($rootScope.answers[aidx] != undefined) results_ans.push($rootScope.answers[aidx]);
                            }
                        }
                        else {
                            aidx = $rootScope.answers.map(function(x) {return x.id; }).indexOf(c.answer);
                            if ($rootScope.answers[aidx] != undefined) results_ans.push($rootScope.answers[aidx]);
                        }
                    }
                });
            });
            prepareForDisplay(results_ans);
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
            //NOTE in this function catObj is a rank object
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
                
               getFilter(input);
               input = cleanFromCommonWords(input);

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

                //if ($rootScope.isNh) inputVal = inputVal + ' ' + $rootScope.cnh;

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
                input = getFilter(input);
                input = cleanFromCommonWords(input);
                if (input.length >= 3 || _nhid > -1 || _searchFavs == true || _searchFFavs == true) {

                var userIsTyping = false;
                var inputVal = input;
 
                /*//Special Cases
                if (inputVal == 'pho' || inputVal == 'Pho') {
                    inputVal = 'vietnamese';
                }*/

                //if ($rootScope.isNh) inputVal = inputVal + ' ' + $rootScope.cnh;

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
                if (valTags.length == 1 && valTags[0]=="") valTags.length = 0;
                //check for nh tags tag first -- if there is no reference to neighborhood
                if (_nhid == -1 && !$rootScope.isqf) {
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
                }
                //if neighborhood is selected but query string is empty,
                //select all rankings of that neighborhood
                if (_nhid > -1 && valTags.length == 0) {
                    $rootScope.content.forEach(function (rObj) {
                        if (rObj.nh == _nhid) {
                            results_rt.push(rObj);
                            rte = true;
                        }
                    })
                }
                else {
                      for (var j = 0; j < $rootScope.content.length; j++) {  
                        if (true) {    
                            ss = $rootScope.searchStrContent[j]; //Search string
                            rt = $rootScope.content[j].title; // title
                            rank = $rootScope.content[j];

                            if(!rt || !ss) console.log("this has issues - content.id - ",$rootScope.content[j]);
                            else {
                            m_ss = true;
                            m_rt = true;
             
                            //check that all tags exist except those that are for neighborhood
                             for (var k = 0; k < valTags.length; k++) {

                                 //if (ignoreTagsIdx.indexOf(k) < 0) {
                                   if (true){  

                                     tagCapitalized = valTags[k].charAt(0).toUpperCase() + valTags[k].slice(1);
                                     tagFirstLowered = valTags[k].charAt(0).toLowerCase() + valTags[k].slice(1);

                                     //look for input in whole search string
                                     if(!ss) console.log(j);
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
                                else if (rObj.nh == _nhid) results_rt.push(rObj); 
                                else if (_nhid == -1 && rObj.ismp) results_rt.push(rObj);
                                rte = true; 
                            }
                            
                            else if (m_ss){
                                rObj = {};
                                rObj = JSON.parse(JSON.stringify($rootScope.content[j]));
                                rObj.useTemp = false;
                                if (m_nh) results_ss.push(rObj);
                                else if (rObj.nh == _nhid) results_ss.push(rObj);
                                else if (_nhid == -1 && rObj.ismp) results_ss.push(rObj);
                            }
                            }//temp 
                        }
                    }
                }

                //if query is from quick filter shuffle answers else show those that match ranking title first
                if ($rootScope.isqf){
                    if (rte) results = results.concat(results_rt);
                    results = shuffle(results.concat(results_ss));
                }
                else{
                    if (results_rt.length > 2) shuffle(results_rt);
                    if (rte) results = results.concat(results_rt);
                    if (results_ss.length > 2) shuffle(results_ss);
                    results = results.concat(results_ss);
                }
                
                //if query is food related, make Food Near Me rank first option
                if ((query == 'food' || query == 'Food') && _nhid == -1 && _searchFavs == false && _searchFFavs == false) {
                    var ni = $rootScope.content.map(function (x) { return x.title; }).indexOf('Food Near Me');
                    results = [$rootScope.content[ni]].concat(results);
                }
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

        function searchRelatedRanks(ranks, query) {
            //console.log("query - ", query);
            var tagsm = [];
            var tagsr = [];
            var tstr = '';
            var idx1 = 0;
            var obj = {};
            for (var i = 0; i < ranks.length; i++) {
                if (ranks[i].isAnswer == true || ranks[i].title == 'Food Near Me'){}
                else{
                    tstr = ranks[i].tags.replace(/,/g, ' ');
                    tagsr = tstr.split(' ');
                    //console.log("tagsr - ", tagsr);
                    for (var j = 0; j < tagsr.length; j++) {
                        if (tagsr[j] != 'isMP' && tagsr[j] != query) {
                            idx1 = tagsm.map(function (x) { return x.tag; }).indexOf(tagsr[j]);
                            //console.log("idx1 - ", idx1);
                            if (idx1 < 0) {
                                obj = {};
                                obj.tag = tagsr[j];
                                obj.ctr = 1;
                                tagsm.push(obj);
                            }
                            else {
                                tagsm[idx1].ctr++;
                            }
                        }
                    }
                }
            }
            tagsm = tagsm.sort(compare);
            return tagsm;
            //console.log("tagsm - ", tagsm);
        }
            function compare(a, b) {
                return b.ctr - a.ctr;         
            }
        
            function prepareForDisplay(a){
                for (var i=0; i<a.length; i++){
                    a[i].isAnswer = true;
                    if (a[i].type == 'Establishment') {
                        a[i].itext = 'Establishment';
                        a[i].icon = 'fa fa-building-o';
                    }
                    if (a[i].type == 'Person'){
                        a[i].itext = 'Public Figure'; 
                        a[i].icon = 'fa fa-male';
                    }
                    if (a[i].type == 'PersonCust'){
                        a[i].itext = 'Contractor'; 
                        a[i].icon = 'fa fa-male';
                    }
                    if (a[i].type == 'Short-Phrase') {
                        a[i].itext = 'Opinion';
                        a[i].icon = 'fa fa-comment-o';
                    }
                    if (a[i].type == 'Event') {
                        a[i].itext = 'Event';
                        a[i].icon = 'fa fa-calendar-o';
                    }
                    if (a[i].type == 'Organization') {
                        a[i].itext = 'Brand';
                        a[i].icon = 'fa fa-trademark';
                    }
                    if (a[i].type == 'Place') {
                        a[i].itext = 'Place';
                        a[i].icon = 'fa fa-map-marker';
                    } 
                }
            }

            function searchMyFavs(query) {
                var input = getFilter(query);
                var resultAns = [];
                var tmap = [];
                var ansObj = {};
                for (var i = 0; i < $rootScope.cvotes.length; i++) {
                    if ($rootScope.cvotes[i].vote == 1) {
                        var idx = $rootScope.answers.map(function (x) { return x.id; }).indexOf($rootScope.cvotes[i].answer);
                        if (idx > -1) {
                            ansObj = $rootScope.answers[idx];
                            tmap = resultAns.map(function (x) { return x.id; });
                            if (input.length > 0) {
                                if ((ansObj.name.toLowerCase().indexOf(input.toLowerCase()) > -1) ||
                                    (ansObj.tags.indexOf(input.toLowerCase()) > -1)){
                                        if (tmap.indexOf(ansObj.id) < 0) {
                                            resultAns.push(ansObj);
                                        }   
                                }
                            }
                            else {
                                if (tmap.indexOf(ansObj.id) < 0) {
                                    resultAns.push(ansObj);
                                }
                            }
                        }
                    }
                }
                prepareForDisplay(resultAns);
                return resultAns;
            }

            function searchMyFFavs(query) {
                var input = getFilter(query);
                var tmap = [];
                var ansObj = {};
                var resultAns = [];
                for (var i = 0; i < $rootScope.friends_votes.length; i++) {
                    if ($rootScope.friends_votes[i].vote == 1) {
                        var idx = $rootScope.answers.map(function (x) { return x.id; }).indexOf($rootScope.friends_votes[i].answer);
                        if (idx > -1) {
                            ansObj = $rootScope.answers[idx];
                            tmap = resultAns.map(function (x) { return x.id; });
                            if (input.length > 0) {
                                if ((ansObj.name.toLowerCase().indexOf(input.toLowerCase()) > -1) ||
                                    (ansObj.tags.indexOf(input.toLowerCase()) > -1)){
                                        if (tmap.indexOf(ansObj.id) < 0) {
                                            addRecord(resultAns, ansObj, i);
                                        }   
                                }
                            }
                            else {
                                if (tmap.indexOf(ansObj.id) < 0) {
                                    addRecord(resultAns, ansObj, i);
                                }
                            }

                            
                        }
                    }
                }
                prepareForDisplay(resultAns);
                return resultAns
            }

        function getUser(answer, votetable) {
            for (var i = 0; i < $rootScope.user.friends.data.length; i++) {
                if (votetable.user == $rootScope.user.friends.data[i].id) {
                    return $rootScope.user.friends.data[i];
                }
            }
        }

        function addRecord(part, answer, i){
            var cidx = -1;
            var ridx = -1;
            var fidx = -1;
            var idx = -1;
            
            cidx = $rootScope.catansrecs.map(function(x) {return x.id; }).indexOf($rootScope.friends_votes[i].catans);
            ridx = $rootScope.content.map(function(x) {return x.id; }).indexOf($rootScope.catansrecs[cidx].category); 

            var map = part.map(function (x) { return x.id; });
            idx = map.indexOf(answer.id);
            if(idx == -1 && ridx > -1){
                //var data = angular.copy(answer);
                var data = answer;
                data.trackID = data.id + '' + $rootScope.friends_votes[i].id;
                data.userObjs = [];
                var friend = angular.copy(getUser(data, $rootScope.friends_votes[i]));
                
                friend.endorsements = [];
                friend.endorsements.push($rootScope.content[ridx].title);
                data.userObjs.push(friend);
                part.push(data);
            }
            else if (idx > -1){
                
                var friend = angular.copy(getUser(data, $rootScope.friends_votes[i]));
                fidx = part[idx].userObjs.map(function(x) {return x.id; }).indexOf(friend.id);
                
                if (fidx == -1){
                    friend.endorsements = [];
                    friend.endorsements.push($rootScope.content[ridx].title);
                    part[idx].userObjs.push(friend);
                }
                else {
                    if (part[idx].userObjs[fidx].endorsements.indexOf($rootScope.content[ridx].title) == -1){ 
                        part[idx].userObjs[fidx].endorsements.push($rootScope.content[ridx].title);
                    }
                }
            }
        }

        function addUser(data, friend){

            var map = data.userObjs.map(function (x) { return x.id; });
            if( map.indexOf(friend.id) == -1 )
                data.userObjs.push(friend);

        }

        function getFilter(input){
            //Determine if search has special filter, neighborhood, friends or favorites    
                var cdx = input.indexOf(':'); 
                if ( cdx > -1){
                    if (input.substring(0,cdx+1) == 'myfavs:') _searchFavs = true;
                    else if (input.substring(0,cdx+1) == 'myffavs:') _searchFFavs = true;
                    else{
                        var n =  $rootScope.locations.map(function(x) {return x.nh_name; }).indexOf(input.substring(0,cdx));
                        _nhname = $rootScope.locations[n].nh_name;
                        _nhid = $rootScope.locations[n].id;
                    }
                    return input = input.substring(cdx+2);
                }
                else{
                    _searchFavs = false;
                    _searchFFavs = false;
                    _nhid = -1;
                    _nhname = '';
                    return input;
                }
        }
        
        function cleanFromCommonWords(input){
             //ignore some keywords
             if (input){
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
             }
            return input;
        }
        
    }
})();