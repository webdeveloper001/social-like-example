(function () {
    'use strict';

    angular
        .module('app')
        .factory('vrowvotes', vrowvotes);

    vrowvotes.$inject = ['$http', '$q', '$rootScope','uaf'];

    function vrowvotes($http, $q, $rootScope, uaf) {

        // Members
        var _vrowvotes = [];
        var baseURI = '/api/v2/mysql/_table/vrowvotes';

        var service = {
            loadVrowVotes: loadVrowVotes,
            patchRec: patchRec,
			postRec: postRec,
            deleteVrowVotesbyVrow: deleteVrowVotesbyVrow			
        };

        return service;

        function loadVrowVotes(forceRefresh) {
      
             if (_areVrowVotesLoaded() && !forceRefresh) {

                return $q.when(_vrowvotes);
            }
            
           //Get all vote records for current user
            var url = baseURI + '?filter=user='+ $rootScope.user.id;
             
            return $http.get(url).then(querySucceeded, _queryFailed);
            
            function querySucceeded(result) {

                return _vrowvotes = result.data.resource;
            }
                 
        }
		
        function postRec(vrow_id, vote) {
            
            //form match record
            var obj = {};
            obj.resource = [];
                     
            var data={};
            data.user = $rootScope.user.id;
            data.answer = $rootScope.canswer.id;
            data.vrow = vrow_id;
            data.val = vote;
            data.timestmp = Date.now(); 
            
            obj.resource.push(data); 
            
            var url = baseURI; 
            
            return $http.post(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {
                
                //update local copies
                var datax = data;
                datax.id = result.data.resource[0].id; 
                _vrowvotes.push(datax);
                
                $rootScope.cvrowvotes.push(datax);
               
               //user activity feed 
               if (data.val == 1) uaf.post('upVotedVrow',['answer','vrow'],[data.answer, datax.vrow]); 
               if (data.val == -1) uaf.post('downVotedVrow',['answer','vrow'],[data.answer, datax.vrow]);  
                
                if ($rootScope.DEBUG_MODE) console.log("Creating new vrowvoting record was succesful");
                return result.data;
            }
        }
        
        function patchRec(rec_id,vote) {
            
            //form match record
            var obj = {};
            obj.resource = [];
            
           
            var data={};
            data.id = rec_id;
            data.val = vote;
            data.timestmp = Date.now(); 
            
            obj.resource.push(data); 
            
            var url = baseURI; 
            
             //update local record of vrowvotes
            var i = _vrowvotes.map(function(x) {return x.id; }).indexOf(rec_id);
            _vrowvotes[i].vote = vote;
            _vrowvotes[i].timestmp = data.timestmp;
            
            return $http.patch(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                if ($rootScope.DEBUG_MODE) console.log("Updating vrow vote record was succesful");
                return result.data;
            }
        }
        function deleteVrowVotesbyVrow(vrow_id) {
            
            //delete records from local copy
            for (var i=0; i<_vrowvotes.length;i++){
                if (_vrowvotes[i].vrow == vrow_id){
                    _vrowvotes.splice(i,1);
                } 
            }
            
           var url = baseURI + '?filter=vrow=' + vrow_id; 
            
            return $http.delete(url).then(querySucceeded, _queryFailed);
            
            function querySucceeded(result) {

                if ($rootScope.DEBUG_MODE) console.log("Deleting vrow votes records was succesful");
                return result.data;
            }
        }
        
        function _areVrowVotesLoaded(id) {

            return _vrowvotes.length > 0;
        }
        function _queryFailed(error) {

            throw error;
        }

    }
})();