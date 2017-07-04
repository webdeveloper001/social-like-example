(function () {
    'use strict';

    angular
        .module('app')
        .service('htmlops', htmlops);

    htmlops.$inject = ['$rootScope'];

    function htmlops($rootScope) {

        var service = {

            specialHtml: specialHtml,
            eventHtml: eventHtml
        };

        return service;

        function specialHtml(x) {
            var htmlmsg = '';
            var sch_str = '';
            if (x.freq == 'weekly') {
                var days_str = strLimit('Every: ' +
                    (x.mon ? ' - Monday' : '') +
                    (x.tue ? ' - Tuesday' : '') +
                    (x.wed ? ' - Wednesday' : '') +
                    (x.thu ? ' - Thursday' : '') +
                    (x.fri ? ' - Friday' : '') +
                    (x.sat ? ' - Saturday' : '') +
                    (x.sun ? ' - Sunday' : ''));
                sch_str = days_str + '<br>From: ' + x.stime2 + ' to ' + x.etime2;
            }
            if (x.freq == 'onetime') {
                var sameday = (x.sdate == x.edate);
                if (sameday) {
                    sch_str = x.sdate + ' from ' + x.stime + ' to ' + x.etime;
                }
                else {
                    sch_str = 'Starts: ' + x.sdate + ' at ' + x.stime + '<br>Ends: ' + x.edate + ' at ' + x.etime;
                }
            }

            var newstr = strLimit(x.details);

            htmlmsg = '<div style="background-color:' + x.bc + ';color:' + x.fc + ';">' +
            '<div class="text-center">' + '<h3>' + x.stitle +
            '</h3><p>' + sch_str + '</p><p>' + newstr + '</p></div>'+
            '</div>';

            return htmlmsg;
        }
        
        function eventHtml(x) {
            var htmlmessage = '';
            
            var addinfomessage = '';
            var sch_str = '';

            if (x.freq == 'weekly') {
                sch_str = x.sdate + ' to ' + x.edate + '<br>'+ 
                strLimit('Every: ' +
                (x.mon ? ' - Monday' : '') +
                (x.tue ? ' - Tuesday' : '') +
                (x.wed ? ' - Wednesday' : '') +
                (x.thu ? ' - Thursday' : '') +
                (x.fri ? ' - Friday' : '') +
                (x.sat ? ' - Saturday' : '') +
                (x.sun ? ' - Sunday' : '')) +
                '<br>' + (x.stime2 == undefined ? '' : 'From: ' + x.stime2 ) +  
                 (x.etime2 == undefined ? '' : ' to ' +  x.etime2 );
                
            }
            if (x.freq == 'onetime') {
                var sameday = (x.sdate == x.edate);
                if (sameday) {
                    sch_str = x.sdate + ' from ' + x.stime + ' to ' + x.etime;
                }
                else {
                    sch_str = (x.edate == undefined ? '' : 'Starts: ') + x.sdate + 
                    (x.stime == undefined ? '' : ' at ' + x.stime ) +
                    (x.edate == undefined ? '' : '<br>Ends: ' + x.edate) + 
                    (x.etime == undefined ? '' : ' at ' + x.etime );
                }
            }
         
            addinfomessage = '<div style="background-color:' + x.bc + ';color:' + x.fc + ';">' +
            /*'<p><strong>' + 
            strLimit(x.name + (x.eventloc != undefined ? (' @ ' + x.eventloc) : '')) + 
            '</strong></p>' +
            '<p>' + (x.location != undefined ? (x.location + '<br>') : '') +
            (x.cityarea != undefined ? ('in ' + x.cityarea) : '') + '</p>' +*/
            '<p>' + sch_str + '</p>' +
            (x.addinfo != undefined ? ('<p>' + strLimit(x.addinfo) + '</p>') : ('')) +
            //(x.website != undefined ? ('<p>For more information visit: <br><a href="' + x.website + '">' + x.website + '</a></p>') : ('')) +
            '</div>';
                        
            htmlmessage = addinfomessage;
            
            return htmlmessage;
            //return '<p>'+sch_str+'</p>';
        }

        //This function takes a string and add a '<br>' every so many characters
        //This is so that the text do not overflow bigger than the screen size.

        function strLimit(x){
            var charlim = 0;
            if ($rootScope.DISPLAY_XSMALL) charlim = 45;
            if ($rootScope.DISPLAY_SMALL) charlim = 60;
            if ($rootScope.DISPLAY_MEDIUM) charlim = 90;
            if ($rootScope.DISPLAY_LARGE) charlim = 150;

            var cc = 0; //char count
            var newstr = '';
            if (x == undefined) return '';
            if (x.length > charlim) {
                for (var n = 0; n < x.length; n++) {

                    if (cc > (charlim-5) && x[n] == ' ') {
                        newstr = newstr + '<br>';
                        cc = 0;
                    }
                    newstr = newstr + x[n];
                    cc++;
                }
            }
            else newstr = x;

            return newstr;
        }

    }
})();