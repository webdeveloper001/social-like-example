 var url = 'https://rankx.file.core.windows.net/?restype=service&comp=properties';
            //var url = 'https://rankx.file.core.windows.net/sandiego/est';
            //return $http.put(url, file, {
            return $http.put(url, {
                headers: { 
                    'Content-Type': "multipart/form-data",
                    'x-ms-date': Date.now(),
                    Authorization: 'SharedKey rankx:SJegEG%2BrdGpXKWBzTkRQDbDBT%2Bks8JcXih8c%2Ffltg9s%3D',
                   // 'AZURE_STORAGE_ACCOUNT': "rankx",
                   // 'AZURE_STORAGE_ACCESS_KEY': "PrnitxLed+IWZzITtd+seNgtFrsjfnHaTKvuUNVpfjtw6NAPnnJVIYtxVsc7z8miCT16kHSNdsnQMtH06DB+Rw=="
                     },
                body: '<?xml version="1.0" encoding="utf-8"?>'+
                '<StorageServiceProperties>'+
                '<Cors>'+
                    '<CorsRule>'+
                        '<AllowedOrigins>http://localhost:3006</AllowedOrigins>'+
                        '<AllowedMethods>PUT,GET</AllowedMethods>'+
                        '<MaxAgeInSeconds>100</MaxAgeInSeconds>'+
                        '<ExposedHeaders>x-ms-meta-*</ExposedHeaders>'+
                        '<AllowedHeaders>x-ms-meta-data*,x-ms-meta-target*,x-ms-meta-abc</AllowedHeaders>'+          
                    '</CorsRule>'+
                '</Cors>'+
                '</StorageServiceProperties>'
            })
                .success(function (result) {
                    //console.log("result", result);
                      console.log("Uploading file was succesful");
                      //$http.defaults.headers.common['X-Dreamfactory-API-Key'] = APP_API_KEY;
                })
                .error(function (error) {
                    //console.log("error", error)
                    console.log("There was a problem uploading your file");
                    //$http.defaults.headers.common['X-Dreamfactory-API-Key'] = APP_API_KEY;
                });