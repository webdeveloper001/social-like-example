(function () {
    'use strict';

    angular
        .module('app')
        .controller('customer', customer);

    customer.$inject = ['$location', '$rootScope', '$state','answer','dialog','special'];

    function customer(location, $rootScope, $state, answer, dialog, special) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'customer';
        
        vm.selMainPhoto = 'active';
        vm.selSpecials = '';
        vm.selPhotoGallery = '';

        vm.goBack = goBack;
        vm.loadMainPhoto = loadMainPhoto;
        vm.loadSpecials = loadSpecials;
        vm.loadPhotoGallery = loadPhotoGallery;
        vm.selAnswer = selAnswer;
        
        //****Temp, need to create customer object when customer logs in ****//
        $rootScope.cust = {};
        $rootScope.cust.id = 1;
        //**********************************************************************           

        activate();
        //utiat228
        function activate() {            

            //Load answers for this customer
            answer.getAnswerbyCustomer($rootScope.cust.id).then(function(response){
                $rootScope.custans = response.resource;
                console.log("Customer-Answer records: ", $rootScope.custans)
                //loadSpecialsObjects();
                displayAnswers();
            });  
                      
            console.log("customer page Loaded!");
            
        }
        
        function displayAnswers(){
           vm.answers = $rootScope.custans;
            
        }
        
        function selAnswer(x){
            $rootScope.cust.canswer = x.id;
            console.log("current answer ", x.id, x.name);
        }
        
        function loadMainPhoto() {            
            
            if ($rootScope.cust.canswer == undefined ) dialog.getDialog('selectBusiness');
            else $state.go('mainphoto');
            
        }
        function loadSpecials() {            

            if ($rootScope.cust.canswer == undefined ) dialog.getDialog('selectBusiness');
            else $state.go('specials');
            
        }
        function loadPhotoGallery() {            
            
            if ($rootScope.cust.canswer == undefined ) dialog.getDialog('selectBusiness');
            else $state.go('photogallery');
            
        }

        function goBack() {
            //if ($rootScope.cCategory.id == undefined) $state.go('rankSummary', { index: $rootScope.cCategory.id });
            //else $state.go('rankSummary', { index: 1 });
            $state.go('content');
        }

    }
})();
