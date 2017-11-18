(function () {
    'use strict';

    angular
        .module('app')
        .controller('cleandb', cleandb);

    cleandb.$inject = ['$location', '$rootScope', '$state','$stateParams', 'table','dialog', 
    '$q', 'useraccnt', 'promoter', 'answer', 'codeprice', 'setting', '$timeout', 
    'DTOptionsBuilder', 'DTColumnDefBuilder', 'catans','categories', 'dataloader',  'locations', 'imagelist'];

    function cleandb(location, $rootScope, $state, $stateParams, table, dialog, 
    $q, useraccnt, promoter, answer, codeprice, setting, $timeout, 
    DTOptionsBuilder, DTColumnDefBuilder, catans, categories, dataloader,  locations, imagelist) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'cleandb';
        vm.dataReady = false;
        vm.catans = [];
        vm.accounts = [];
        vm.rankings = [];
        vm.categories = [];
        vm.answers = [];
        vm.fimages = [];

        vm.isAdmin = $rootScope.isAdmin;

        vm.notifications = [];

        vm.gotoanswer = gotoanswer;
        vm.filterCatans = filterCatans;
        vm.filterCategories = filterCategories;
        vm.filterAnswers = filterAnswers;
        vm.filterRankings = filterRankings;
        vm.filterFImages = filterFImages;


        vm.deleteSelectedCatans = deleteSelectedCatans;
        vm.deleteSelectedCategories = deleteSelectedCategories;
        vm.deleteSelectedAnswers = deleteSelectedAnswers;
        vm.deleteSelectedRankings = deleteSelectedRankings;
        vm.deleteSelectedFImages = deleteSelectedFImages;
        vm.dtInstanceCatans = {};
        vm.dtInstanceCategories = {};
        vm.dtInstanceAnswers = {};
        vm.dtInstanceRankings = {};
        vm.dtInstanceFImages = {};

        vm.filteredCatans = [];
        vm.filteredCategories = [];
        vm.filteredAnswers = [];
        vm.filteredRankings = [];
        vm.filteredFImages = [];

        retrieveData();

        function retrieveData() {
            
            $q.all([catans.getAllcatans(),  useraccnt.getallaccnts(), categories.getAllCategories(), 
                locations.getAllLocations(), table.getTables(), answer.getAnswers(), imagelist.getFeatureImageList()])
            .then(function(data){

                vm.catans = data[0];
                vm.accounts = data[1];

                vm.categories = data[2];
                vm.locations = data[3];

                $rootScope.categories = data[2];
                $rootScope.locations = data[3];
                $rootScope.content = data[4];
                dataloader.unwrap(); 
                vm.rankings = $rootScope.content;
                
                vm.answers = data[5];
                vm.fimages = data[6];
                console.log("vm.fimages - ", vm.fimages);
                vm.dataReady = true;

                filterCatans();
                filterCategories();
                filterAnswers();
                filterRankings();
                filterFImages();
            });

        }


        function getAnswer(account){
            return answer.getAnswer(account.answer)
            .then(function(answer){
                account.answerObj = answer;
            })
        }           


        function dismissNotification(notification){
            if(vm.notifications.indexOf(notification) != '-1'){

            }
        }
        function gotoanswer(x) {
            $state.go('answerDetail', { index: x.slug });
        }

        function filterCatans() {
            
            vm.filteredCatans = [];
            var items = _.groupBy(vm.catans,  function(item){
            	return 'cat' + item.category + 'answer' + item.answer;
            });
            for (var key in items) {
            	if (items[key].length > 1){
            		items[key].dup = items[key].length;
            		vm.filteredCatans.push(items[key]);
            	}
            }
            vm.deletingCatans = false;
            vm.dtInstanceCatans = {};
            $timeout(function(){
            	vm.dtInstanceCatans.rerender()
            }, 1000);
            
        }

        function deleteSelectedCatans() {
        	vm.deletingCatans = true;
        	var dupCatans = vm.filteredCatans.filter(function(biz){ return biz[0].checked;});
        	var promises = [];
        	dupCatans.forEach(function(deletecatans){
        		for (var i = 1; i < deletecatans.length; i++) {
        			promises.push(catans.deleteCatan(deletecatans[i].id));
        		}
        	});
            $q.all(promises)
            .then(function(deleteIDs){
            	deleteIDs.forEach(function(dcatan){
	            	var index = vm.catans.map(function(catan){return catan.id;}).indexOf(dcatan.resource[0].id);
                    vm.catans.splice(index,1);
            	});
            	filterCatans();
            });
        }



        function filterCategories() {
            
            vm.filteredCategories = [];
            var rankingCatIDs = vm.rankings.map(function(ranking){ return ranking.cat; });
            vm.filteredCategories = vm.categories.filter(function(cat){
            	return rankingCatIDs.indexOf(cat.id) == -1;
            });

            vm.deletingCategories = false;
            vm.dtInstanceCategories = {};
            $timeout(function(){
            	vm.dtInstanceCategories.rerender()
            }, 1000);
            
        }

        function deleteSelectedCategories() {
        	vm.deletingCategories = true;
        	var dupCats = vm.filteredCategories.filter(function(cat){ return cat.checked;});
        	var promises = [];
        	dupCats.forEach(function(deletecat){
    			promises.push(categories.deleteRec(deletecat.id));
        	});
            $q.all(promises)
            .then(function(deleteIDs){
            	deleteIDs.forEach(function(dcatan){
	            	var index = vm.categories.map(function(cat){return cat.id;}).indexOf(dcatan.id);
                    vm.categories.splice(index,1);
            	});
            	filterCategories();
            });
        }



        function filterAnswers() {
            
            vm.filteredAnswers = [];
            var catAnswerIDs = vm.catans.map(function(catan){ return catan.answer; });
            vm.filteredAnswers = vm.answers.filter(function(ans){
            	return catAnswerIDs.indexOf(ans.id) == -1;
            });

            vm.deletingAnswers = false;
            vm.dtInstanceAnswers = {};
            $timeout(function(){
            	vm.dtInstanceAnswers.rerender()
            }, 1000);
            
        }

        function deleteSelectedAnswers() {
        	vm.deletingAnswers = true;
        	var dupCats = vm.filteredAnswers.filter(function(ans){ return ans.checked;});
        	var promises = [];
        	dupCats.forEach(function(deleteans){
    			promises.push(answer.deleteAnswer(deleteans.id));
        	});
            $q.all(promises)
            .then(function(deleteIDs){
            	deleteIDs.forEach(function(dcatan){
	            	var index = vm.answers.map(function(cat){return cat.id;}).indexOf(dcatan.id);
                    vm.answers.splice(index,1);
            	});
            	filterAnswers();
            });
        }



        function filterRankings() {
            
            vm.filteredRankings = [];
            var catRankingIDs = vm.catans.map(function(catan){ return catan.category; });
            vm.filteredRankings = vm.rankings.filter(function(ranking){
            	return catRankingIDs.indexOf(ranking.id) == -1;
            });

            vm.deletingRankings = false;
            vm.dtInstanceRankings = {};
            $timeout(function(){
            	vm.dtInstanceRankings.rerender()
            }, 1000);
            
        }

        function deleteSelectedRankings() {
        	vm.deletingRankings = true;
        	var dupCats = vm.filteredRankings.filter(function(ans){ return ans.checked;});
        	var promises = [];
        	dupCats.forEach(function(deleteans){
    			promises.push(table.deleteTable(deleteans.id));
        	});
            $q.all(promises)
            .then(function(deleteIDs){
            	deleteIDs.forEach(function(dcatan){
	            	var index = vm.rankings.map(function(cat){return cat.id;}).indexOf(dcatan.id);
                    vm.rankings.splice(index,1);
            	});
            	filterRankings();
            });
        }


        function filterFImages() {
            
            vm.filteredFImages = [];
            var catFImages = vm.categories.map(function(cat){ return cat.fimage; });
            vm.filteredFImages = vm.fimages.filter(function(img){
            	return catFImages.indexOf(img.url) == -1;
            });

            vm.deletingFImages = false;
            vm.dtInstanceFImages = {};
            $timeout(function(){
            	vm.dtInstanceFImages.rerender()
            }, 1000);
            
        }

        function deleteSelectedFImages() {
        	vm.deletingFImages = true;
        	var dupCats = vm.filteredFImages.filter(function(ans){ return ans.checked;});
        	var promises = [];
        	dupCats.forEach(function(deleteans){
    			promises.push(imagelist.deleteBlob(deleteans.url));
        	});
            $q.all(promises)
            .then(function(deleteIDs){
            	dupCats.forEach(function(dcatan){
	            	var index = vm.fimages.map(function(img){return img.url;}).indexOf(dcatan.url);
                    vm.fimages.splice(index,1);
            	});
            	filterFImages();
            });
        }


    }
})();
