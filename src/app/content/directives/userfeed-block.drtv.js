angular.module('app').directive('userfeedBlock', 
    ['$rootScope', '$state',  'fbusers', '$q','uaf','color',
    function ($rootScope, $state, fbusers, $q, uaf, color) {
    'use strict';

    return {
        templateUrl: 'app/content/partials/userfeed-block.html',
        transclude: true,
        scope: {
            showAll: '@'
        },
        controller: ['$scope','$window',
            
            function contentCtrl($scope, $window) {
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
            console.log("$rootScope.uafs.length - ",$rootScope.uafs.length);

            scope.feeds = [];
            $q.all($rootScope.uafs.map(function(feed){ 
                return fbusers.getFBUserById(feed.userid); 
            }))
            .then(function (fbUsers){
                for (var i = 0; i < $rootScope.uafs.length; i++) {
                    var userWithPic = angular.copy($rootScope.uafs[i]);
                    userWithPic.picture = fbUsers[i] ? fbUsers[i].picture.data.url : null;
                    scope.feeds[i] = userWithPic;
                 }
            });
            if(scope.showAll == 'true')
                scope.fres = 30;
            else
                scope.fres = 6;
            scope.ftext = 'see more';
            //console.log("vm.feeds - ", vm.feeds);
        }
        
        scope.seeMoreFeed = function(isShowAll){
            if(scope.showAll == 'true'){
                scope.fres += 20;
                      
            }         
            else{
                $state.go('feeds');
            }
        }
        
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