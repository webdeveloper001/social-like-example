(function () {
    'use strict';

    angular
        .module('app')
        .service('datetime', datetime);

    datetime.$inject = ['$rootScope'];

    //This function changes the format of the date as it comes from the db in DreamFactory
    //To the date, it adds the 3 character day of the week
    //To the time, it removes secs and makes it into 12h format
    function datetime($rootScope) {


        var service = {

            formatdatetime: formatdatetime,
            formatTime: formatTime,
            date2number: date2number,
            dateIsCurrent: dateIsCurrent
        };

        return service;

        function formatdatetime(sp) {

            if (sp.freq == 'onetime') {
                formatTime(sp, 'stime');
                formatTime(sp, 'etime');
            
                //Format dates
                var d = new Date(sp.sdate);
                var s = d.toString();
                sp.sdate = s.substring(0, 15);

                d = new Date(sp.edate);
                s = d.toString();
                sp.edate = s.substring(0, 15);
            }
            if (sp.freq == 'weekly') {
                formatTime(sp, 'stime2');
                formatTime(sp, 'etime2');
            }

        }

        function formatTime(sp, s) {
            var date = '';

            switch (s) {
                case "stime": date = sp.stime; break;
                case "etime": date = sp.etime; break;
                case "stime2": date = sp.stime2; break;
                case "etime2": date = sp.etime2; break;
            }
            
            //Format time, remove seconds
            if (date != null && date != undefined && (date.indexOf('00:00') > -1 || date.indexOf('30:00') > -1)) {
                date = date.replace('00:00', '00');
                date = date.replace('30:00', '30');
                var itsAM = parseInt(date.substring(0, 2)) < 12;
                if (itsAM) date = date + ' AM';
                else date = date + ' PM';
                //if PM put in 12h notation
                if (!itsAM) {
                    var hr = parseInt(date.substring(0, 2)) - 12;
                    var hrstr = '';
                    if (hr < 10) hrstr = '0' + hr.toString();
                    else hrstr = hr.toString();
                    date = date.replace(date.substring(0, 2), hrstr);
                }
            }

            switch (s) {
                case "stime": sp.stime = date; break;
                case "etime": sp.etime = date; break;
                case "stime2": sp.stime2 = date; break;
                case "etime2": sp.etime2 = date; break;
            }

        }
        
        //Get date in number from date in string
        function date2number(datestr){
             var d1 = new Date(datestr);
             var d1s = d1.getFullYear().toString() +
                (d1.getMonth() + 1 < 10 ? ('0' + (d1.getMonth() + 1).toString()) : (d1.getMonth() + 1).toString()) +
                (d1.getDate() < 10 ? ('0' + d1.getDate().toString()) : d1.getDate().toString());
             return Number(d1s);  
        }
        
        //return true if date is today or in the future
        function dateIsCurrent(datestr){
            var date = date2number(datestr);
            return date - $rootScope.dateTodayNum >= 0;
        }

    }
})();