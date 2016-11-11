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

        function specialHtml(x, sm) {
            var htmlmsg = '';
            var sch_str = '';
            if (x.freq == 'weekly') {
                var days_str = 'Every: ' +
                    (x.mon ? ' - Monday' : '') +
                    (x.tue ? ' - Tuesday' : '') +
                    (x.wed ? ' - Wednesday' : '') +
                    (x.thu ? ' - Thursday' : '') +
                    (x.fri ? ' - Friday' : '') +
                    (x.sat ? ' - Saturday' : '') +
                    (x.sun ? ' - Sunday' : '');
                sch_str = days_str + '<br>From: ' + x.stime2 + ' to ' + x.etime2;

                if (sm && days_str.length > 45) {

                    var lp = 0;
                    var newstr = '';
                    for (var n = 0; n < sch_str.length; n++) {
                        if (sch_str[n] == '-' && n < 45) lp = n;
                        if (sch_str[n] == '-' && n > 45) {
                            newstr = sch_str.substring(0, lp) + '<br>' + sch_str.substring(lp);
                            break;
                        }
                    }
                    sch_str = newstr;
                }
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

            var cc = 0; //char count
            var newstr2 = '';
            if (x.details == undefined) x.details = '';
            if (sm && x.details.length > 45) {
                for (var n = 0; n < x.details.length; n++) {
                     if (cc > 42 && x.details[n] == ' ') {
                        newstr2 = newstr2 + '<br>';
                        cc = 0;
                     }
                        newstr2 = newstr2 + x.details[n];
                        cc++;
                }
            }
            else newstr2 = x.details;

            htmlmsg = '<div class="text-center">' + '<h3>' + x.stitle +
            '</h3><p>' + sch_str + '</p><p>' + newstr2 + '</p></div>';
            return htmlmsg;
        }
        
        function eventHtml(x, sm) {
            var htmlmessage = '';
            var sch_str = '';

            if (x.freq == 'weekly') {
                sch_str = 'Every: ' +
                (x.mon ? ' - Monday' : '') +
                (x.tue ? ' - Tuesday' : '') +
                (x.wed ? ' - Wednesday' : '') +
                (x.thu ? ' - Thursday' : '') +
                (x.fri ? ' - Friday' : '') +
                (x.sat ? ' - Saturday' : '') +
                (x.sun ? ' - Sunday' : '') +
                '<br>From: ' + x.stime2 + ' to ' + x.etime2;
            }
            if (x.freq == 'onetime') {
                var sameday = (x.sdate == x.edate);
                if (sameday) {
                    sch_str = x.sdate + ' from ' + x.stime + ' to ' + x.etime;
                }
                else {
                    sch_str = (x.edate == undefined ? '':'Starts: ') + x.sdate + ' at ' + x.stime +  
                              (x.edate == undefined ? '':('<br>Ends: ' + x.edate + ' at ' + x.etime)); 
                }
            }
            
            var cc = 0; //char count
            var newstr = '';
            if (x.addinfo == undefined) x.addinfo = '';
            if (sm && x.addinfo.length > 45) {
                for (var n = 0; n < x.addinfo.length; n++) {

                    if (cc > 42 && x.addinfo[n] == ' ') {
                        newstr = newstr + '<br>';
                        cc = 0;
                    }
                    newstr = newstr + x.addinfo[n];
                    cc++;
                }
            }
            

            htmlmessage = '<p><strong>' + x.name + '</strong></p>' + 
            '<p><strong>' + (x.location != undefined ? (' @ ' + x.location):('')) + '</strong></p>' + 
            (x.cityarea != undefined ? ('<p>in ' + x.cityarea+'</p>'):'') +
            '<p>' + sch_str + '</p>' + 
            (x.addinfo != undefined ? ('<p>' + newstr + '</p>'):(''))+
            (x.website != undefined ? ('<p>For more information: <a href="' + x.website + '">'+ x.website +'</a></p>'):(''))+
            '</div>';
            
            return htmlmessage;
        }

    }
})();