angular.module('app').directive('userfeedBlock', 
    ['$rootScope', '$state',  'fbusers', '$q','uaf','color','dataloader',
    function ($rootScope, $state, fbusers, $q, uaf, color, dataloader) {
    'use strict';

    return {
        templateUrl: 'app/content/partials/userfeed-block.html',
        transclude: true,
        scope: {
            showAll: '@',
            showQty: '@'
        },
        controller: ['$scope','$window', 'uaf',
            
            function contentCtrl($scope, $window, uaf) {
                var vm = $scope;
                vm.title = 'mycontent';

                vm.sm = $rootScope.sm;

                //Adjust picture size for very small displays
                if ($window.innerWidth < 768) vm.thumbheight = '80px';
                if ($window.innerWidth >= 768 && $window.innerWidth < 992) vm.thumbheight = '100px';
                if ($window.innerWidth >= 992 && $window.innerWidth < 1200) vm.thumbheight = '80px';
                if ($window.innerWidth > 1200) vm.thumbheight = '100px';
 
            }], //end controller
        link: function (scope) {

            var si = 0;
            pullData($rootScope.uafs.slice(si,scope.showQty));

            if (scope.isDestroyed == undefined){
                   getFeed();
            }   

            var bgc = '#595959';
            var bgc2 = color.shadeColor(bgc, 0.5);
            scope.headerStyle = 'color:#f8f8ff;width:100%;border-style:none;'+
                       'background:'+bgc+';'+
  					   'background: -webkit-linear-gradient(left,'+bgc+','+bgc2+');'+
  					   'background: -o-linear-gradient(right,'+bgc+','+bgc2+');'+
  					   'background: -moz-linear-gradient(right,'+bgc+', '+bgc2+');'+
  					   'background: linear-gradient(to right,'+bgc+', '+bgc2+');';  

        function getFeed(){
            // vm.feeds = angular.copy($rootScope.uafs);
            //console.log("$rootScope.uafs.length - ",$rootScope.uafs.length);
            load();
            //load uafs directly (without facebook) on init
            if (scope.feeds.length == 0) scope.feeds = $rootScope.uafs;

            /*if(scope.showAll == 'true')
                scope.fres = 30;
            else
                scope.fres = 6;
            scope.ftext = 'see more';*/

            scope.fres = scope.showQty;
        }
        
        function load() {

            scope.feeds = [];
            $q.all($rootScope.uafs.map(function (feed) {
                return fbusers.getFBUserById(feed.userid);
            }))
                .then(function (fbUsers) {
                    scope.feeds = [];
                    for (var i = 0; i < $rootScope.uafs.length; i++) {
                        var userWithPic = angular.copy($rootScope.uafs[i]);
                        userWithPic.picture = fbUsers[i] ? fbUsers[i].picture.data.url : null;
                        
                        scope.feeds[i] = userWithPic;
                    }
                });
            
        }
		
        function pullData(uafs){
            var ranks = [];
            var ans = [];
            var item = {};
            for (var i=0; i<uafs.length; i++){
                item = {};
                if (uafs[i].action == 'addedCustomRank') {item.id = uafs[i].answer; ans.push(item);}
                if (uafs[i].action == 'addedRank') {item.id = uafs[i].category; ranks.push(item);}
                if (uafs[i].action == 'binded') {item.id = uafs[i].answer; ans.push(item);}
                if (uafs[i].action == 'downVotedVrow') {item.id = uafs[i].answer; ans.push(item);}
                if (uafs[i].action == 'upVotedVrow') {item.id = uafs[i].answer; ans.push(item);}
                if (uafs[i].action == 'editA') {item.id = uafs[i].answer; ans.push(item);}
                if (uafs[i].action == 'commentA') {item.id = uafs[i].answer; ans.push(item);}
                if (uafs[i].action == 'commentR') {item.id = uafs[i].category; ranks.push(item);}
                if (uafs[i].action == 'downVoted') {item.id = uafs[i].category; ranks.push(item);
                    item = {}, item.id = uafs[i].answer; ans.push(item);}
                if (uafs[i].action == 'upVoted') {item.id = uafs[i].category; ranks.push(item);
                    item = {}, item.id = uafs[i].answer; ans.push(item);}
                if (uafs[i].action == 'addedAnswer') {item.id = uafs[i].category; ranks.push(item);
                    item = {}, item.id = uafs[i].answer; ans.push(item);}
            }
            
            if (ans.length > 0) dataloader.pulldata('answers',ans);
            if (ranks.length > 0) dataloader.pulldata('ranks',ranks);
        }
        /*
        scope.seeMoreFeed = function(isShowAll){
            if(scope.showAll == 'true'){
                uaf.getnext10actions().then(function(){
                    scope.fres += 20;
                    getFeed();
                })
                
            }         
            else{
                $state.go('feeds');
            }
        }*/
        scope.$watch('showQty', function() {
                si = scope.fres;
                scope.fres = scope.showQty;
                pullData($rootScope.uafs.slice(si,scope.showQty));
                //scope.disableScrolling = !scope.scrollactive;                                   
        });

        
        scope.refreshFeed = function(){
            console.log("refreshFeed");
            uaf.getactions().then(function(response){
                $rootScope.uafs = response;
                getFeed();
            });
        }

        scope.gotoAnswer = function(x){
            $state.go('answerDetail',{index: x.answer});
        }
        scope.gotoRank = function(x){
            $state.go('rankSummary',{index: x.category});
        }             

            scope.$on('$destroy',function(){
                scope.isDestroyed = true;
            });
             
        },
    }
}

]);