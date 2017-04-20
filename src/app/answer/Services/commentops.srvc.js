(function () {
    'use strict';

    angular
        .module('app')
        .service('commentops', commentops);

    commentops.$inject = ['$rootScope', 'table', 'answer', 'comment', 'comment2'];

    function commentops($rootScope, table, answer, comment, comment2) {

        var service = {

            loadComments: loadComments,
            postComment: postComment,
            getIconColors: getIconColors
        };

        var _colors = {};
        _colors.bc = '';
        _colors.fc = '';

        return service;

        function loadComments(type, x) {
            if (!x.commLoaded) {
                x.commLoaded = true;
                if ($rootScope.isLoggedIn) {
                    x.initials = $rootScope.user.name.replace(/[^A-Z]/g, '');
                    getIconColors($rootScope.user.id, _colors);
                    x.bc = _colors.bc;
                    x.fc = _colors.fc;
                }
                //comments = [];
                if (type == 'answer') {
                    return comment2.getcomments().then(function (_comments) {
                        //console.log("_comments", _comments);
                        x.comments = _comments;
                        for (var i = 0; i < x.comments.length; i++) {
                            x.comments[i].initials = x.comments[i].username.replace(/[^A-Z]/g, '');

                            var datenow = new Date();
                            var tz = datenow.getTimezoneOffset();

                            //Explicitly format the date -- iPhone has issues otherwise
                            var t = x.comments[i].timestmp.split(/[- :]/);
                            var cdate = new Date(t[0], t[1]-1, t[2], t[3], t[4], t[5]);
                            
                            cdate.setMinutes(cdate.getMinutes() - tz);
                            function pad(n) {return n < 10 ? '0'+ n : n;}
                            
                            var dateStr = cdate.getMonth()+1+"/"+cdate.getDate()+"/"+cdate.getFullYear();
                            
                            var hrs = cdate.getHours();
                            var timeStr = hrs > 12 ? hrs%12 + ':'+ pad(cdate.getMinutes()) + ' '+'PM' :
                                                     hrs + ':'+ pad(cdate.getMinutes()) + ' '+'AM'; 
                                          
                            x.comments[i].date = dateStr + ' ' + timeStr;
                            getIconColors(x.comments[i].user, _colors);
                            x.comments[i].bc = _colors.bc;
                            x.comments[i].fc = _colors.fc;
                        }
                        //console.log("vm.commLoaded, vm.comments.length, vm.isLoggedIn, vm.commentAllowed ---", vm.commLoaded, vm.comments.length, vm.isLoggedIn, vm.commentAllowed);
                    });
                }
                if (type == 'category') {
                    return comment.getcomments().then(function (_comments) {
                        //console.log("_comments", _comments);
                        x.comments = _comments;
                        for (var i = 0; i < x.comments.length; i++) {
                            x.comments[i].initials = x.comments[i].username.replace(/[^A-Z]/g, '');

                            var datenow = new Date();
                            var tz = datenow.getTimezoneOffset();

                            //Explicitly format the date -- iPhone has issues otherwise
                            var t = x.comments[i].timestmp.split(/[- :]/);
                            var cdate = new Date(t[0], t[1]-1, t[2], t[3], t[4], t[5]);
                            
                            cdate.setMinutes(cdate.getMinutes() - tz);
                            function pad(n) {return n < 10 ? '0'+ n : n;}
                            
                            var dateStr = cdate.getMonth()+1+"/"+cdate.getDate()+"/"+cdate.getFullYear();
                            
                            var hrs = cdate.getHours();
                            var timeStr = hrs > 12 ? hrs%12 + ':'+ pad(cdate.getMinutes()) + ' '+'PM' :
                                                     hrs + ':'+ pad(cdate.getMinutes()) + ' '+'AM'; 
                                          
                            x.comments[i].date = dateStr + ' ' + timeStr;
                            getIconColors(x.comments[i].user, _colors);
                            x.comments[i].bc = _colors.bc;
                            x.comments[i].fc = _colors.fc;
                        }
                        //console.log("vm.commLoaded, vm.comments.length, vm.isLoggedIn, vm.commentAllowed ---", vm.commLoaded, vm.comments.length, vm.isLoggedIn, vm.commentAllowed);
                    });
                }
            }
        }

        function postComment(type, x) {
            var cobj = {};
            cobj.body = x.newComment;
            cobj.username = $rootScope.user.name;
            cobj.user = $rootScope.user.id;
            cobj.picture = $rootScope.user.picture.data.url;
            cobj.timestmp = Date.now();
            x.newComment = '';
            if (type == 'category') {
                cobj.category = $rootScope.cCategory.id;
                comment.addcomment(cobj).then(function () {
                    cobj.initials = $rootScope.user.name.replace(/[^A-Z]/g, '');
                    getIconColors($rootScope.user.id, _colors);
                    //datetime.formatdatetime(cobj);
                    cobj.fc = _colors.fc;
                    cobj.bc = _colors.bc;
                    cobj.date = 'Just now';
                    x.comments.push(cobj);
                    table.update($rootScope.cCategory.id, ['numcom'], [x.comments.length]);
                });
            }
            if (type == 'answer') {
                cobj.answer = $rootScope.canswer.id;
                comment2.addcomment(cobj).then(function () {
                    cobj.initials = $rootScope.user.name.replace(/[^A-Z]/g, '');
                    getIconColors($rootScope.user.id, _colors);
                    //datetime.formatdatetime(cobj);
                    cobj.fc = _colors.fc;
                    cobj.bc = _colors.bc;
                    cobj.date = 'Just now';
                    x.comments.push(cobj);
                    answer.updateAnswer($rootScope.canswer.id, ['numcom'], [x.comments.length]);
                    //console.log("vm.comments - ", vm.comments);                
                });
            }
        }

        function getIconColors(x, c) {
            switch (x % 10) {
                case 0: { c.bc = '#b3b3b3'; c.fc = 'black'; break; }
                case 1: { c.bc = '#666666'; c.fc = 'white'; break; }
                case 2: { c.bc = '#006bb3'; c.fc = 'white'; break; }
                case 3: { c.bc = '#009933'; c.fc = 'white'; break; }
                case 4: { c.bc = '#cc0000'; c.fc = 'white'; break; }
                case 5: { c.bc = '#538cc6'; c.fc = 'black'; break; }
                case 6: { c.bc = '#b36b00'; c.fc = 'white'; break; }
                case 7: { c.bc = '#999966'; c.fc = 'black'; break; }
                case 8: { c.bc = '#4d0099'; c.fc = 'white'; break; }
                case 9: { c.bc = '#009999'; c.fc = 'black'; break; }
            }
        }


    }
})();