(function () {
    'use strict';

    angular
        .module('app')
        .factory('votes', votes);

    votes.$inject = ['$http', '$q', '$rootScope','uaf'];

    function votes($http, $q, $rootScope, uaf) {

        // Members
        var _votes = [];
        var baseURI = '/api/v2/mysql/_table/votetable';

        var service = {
            loadVotesByUser: loadVotesByUser,
            loadAllVotes: loadAllVotes,
            patchRec: patchRec,
			postRec: postRec,
            deleteVotesbyCatans: deleteVotesbyCatans,
            deleteRec: deleteRec,
			loadVotesByMyFriends: loadVotesByMyFriends,
            loadLastMonthVoting: loadLastMonthVoting
            //    addTable: addTable
        };

        return service;


        function loadVotesByUser(forceRefresh) {
      
             if (_isVotesLoaded() && !forceRefresh) {

                return $q.when(_votes);
            }
            
           //Get all vote records for current user
            var url = baseURI + '/?filter=user='+ $rootScope.user.id;
             
            return $http.get(url).then(querySucceeded, _queryFailed);
            
            function querySucceeded(result) {

                return _votes = result.data.resource;
            }
                 
        }
        
        function loadVotesByMyFriends(forceRefresh) {
            var filterQuery = "";
            
            for (var i = 0; i < $rootScope.user.friends.data.length; i++) {
                filterQuery += '(user=';
                filterQuery += $rootScope.user.friends.data[i].id;
                filterQuery += ')';
                if( i != $rootScope.user.friends.data.length - 1 )
                    filterQuery += ' or ';
            }

            //Get all vote records for current user
            var url = baseURI + '/?filter=' + filterQuery;
             
            return $http.get(url).then(querySucceeded, _queryFailed);
            
            function querySucceeded(result) {

                return result.data.resource;
            }
                 
        }

        function loadAllVotes(forceRefresh) {
      
           //Get all vote records for current user
            var url = baseURI;
             
            return $http.get(url).then(querySucceeded, _queryFailed);
            
            function querySucceeded(result) {

                return _votes = result.data.resource;
            }
                 
        }
		
        function postRec(catans_id, answer_id, category_id, vote) {
            
            //form match record
            var obj = {};
            obj.resource = [];
                     
            var data={};
            data.user = $rootScope.user.id;
            data.catans = catans_id;
            data.answer = answer_id;
            data.vote = vote;
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
                _votes.push(datax);
                
               if (data.vote == 1) uaf.post('upVoted',['answer','category'],[answer_id, category_id]); //user activity feed
               if (data.vote == -1) uaf.post('downVoted',['answer','category'],[answer_id, category_id]); //user activity feed 
                //$rootScope.cvotes.push(datax);
                $rootScope.$emit('updateVoteTable');
                
                console.log("Creating new voting record was succesful");
                return result.data;
            }
        }
        
        function patchRec(rec_id,vote) {
            
            //form match record
            var obj = {};
            obj.resource = [];
            
           
            var data={};
            data.id = rec_id;
            data.vote = vote;
            data.timestmp = Date.now(); 
            
            obj.resource.push(data); 
            
            var url = baseURI; 
            
            //update local record of votes
            var i = _votes.map(function(x) {return x.id; }).indexOf(rec_id);
            _votes[i].vote = vote;
            _votes[i].timestmp = data.timestmp;
            
            return $http.patch(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                if ($rootScope.DEBUG_MODE) console.log("Updating vote record was succesful");
                return result.data;
            }
        }
        function deleteVotesbyCatans(catans_id) {
            
            //delete records from local copy
            for (var i=0; i<_votes.length;i++){
                if (_votes[i].catans == catans_id){
                    _votes.splice(i,1);
                } 
            }
            
           var url = baseURI + '/?filter=catans=' + catans_id; 
            
            return $http.delete(url).then(querySucceeded, _queryFailed);
            
            function querySucceeded(result) {
                
                if ($rootScope.DEBUG_MODE) console.log("Deleting vote records by Catans was succesful");
                return result.data;
            }
        }
        
        function deleteRec(rec_id) {
            
            //delete records from local copy
            for (var i=0; i<_votes.length;i++){
                if (_votes[i].id == rec_id){
                    _votes.splice(i,1);
                } 
            }
            
           var url = baseURI + '/' + rec_id; 
            
            return $http.delete(url).then(querySucceeded, _queryFailed);
            
            function querySucceeded(result) {
                if ($rootScope.DEBUG_MODE) console.log("Deleting vote record was succesful");
                return result.data;
            }
        }
        
        function _isVotesLoaded(id) {

            return _votes.length > 0;
        }
        function _queryFailed(error) {

            throw error;
        }

        function loadLastMonthVoting(answerIDs) {
            var filterQuery = "(";
            
            for (var i = 0; i < answerIDs.length; i++) {
                filterQuery += '(answer=';
                filterQuery += answerIDs[i];
                filterQuery += ')';
                if( i != answerIDs.length - 1 )
                    filterQuery += ' or ';
            }
            filterQuery += ' and (timestmp > ' + moment().subtract(1, 'month').startOf('month').format('YYYY-MM-DD') + ')';
            filterQuery += ' and (vote = 1))';
            
            //Get all vote records for current user
            var url = baseURI + '/?filter=' + filterQuery;
             
            return $http.get(url).then(querySucceeded, _queryFailed);
            
            function querySucceeded(result) {

                return result.data.resource;
            }
                 
        }
    }
})();