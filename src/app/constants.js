(function () {
    'user strict';

    angular
        .module('app')
        //.constant('INSTANCE_URL', 'http://bitnami-dreamfactory-df88.westus.cloudapp.azure.com')
        .constant('INSTANCE_URL', 'https://api.rank-x.com')
       // .constant('APP_API_KEY', '7e9a54a80a6ae850bc38ff768d75e143e75c273d1f7e2f265648020bf8c42a3b')
        .constant('APP_API_KEY','8b8174170d616f3adb571a0b28daf65a0cf07aa149aad9bf6554986856debdf4')
        .constant('GOOGLE_API_KEY', 'AIzaSyC2gAzj80m1XpaagvunSDPgEvOCleNNe5A')
        .constant('DEBUG_MODE', false)
        
})();