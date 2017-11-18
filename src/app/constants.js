(function () {
    'user strict';

    angular
        .module('app')
        //.constant('INSTANCE_URL', 'http://bitnami-dreamfactory-df88.westus.cloudapp.azure.com')
        .constant('INSTANCE_URL', 'https://api.rank-x.com')
       // .constant('APP_API_KEY', '7e9a54a80a6ae850bc38ff768d75e143e75c273d1f7e2f265648020bf8c42a3b')
       // .constant('APP_API_KEY','8b8174170d616f3adb571a0b28daf65a0cf07aa149aad9bf6554986856debdf4')
        .constant('APP_API_KEY','d85f0ae42651932fd92bb9dddfe1189c930adc3230ac4f578c4cb54073331555')
        .constant('GOOGLE_API_KEY', 'AIzaSyC2gAzj80m1XpaagvunSDPgEvOCleNNe5A')
        .constant('DEBUG_MODE', false)
        .constant('EMPTY_IMAGE','https://rank-x.com/assets/images/noimage.jpg')
        .constant('INSTAGRAM_CLIENT_ID', "c46745e083b7451a99461240e01da20b")
        .constant('SERVER_URL', "https://server.rank-x.com/")
        //.constant('SERVER_URL', "http://localhost:3000/")
        .constant('STRIPE_CLIENT_ID', "ca_AdOtLByD0cfx8W3d76nnKqLjruvHmGlh")
})();
