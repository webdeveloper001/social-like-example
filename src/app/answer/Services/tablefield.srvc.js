(function () {
    'use strict';

    angular
        .module('app')
        .factory('tablefield', tablefield);

    tablefield.$inject = ['$http', '$q'];

    function tablefield($http, $q) {

        // Members
        var _alltablefields = [];
        var _selectedtablefields;
        var baseURI = '/api/v2/mysql/_table/tablefield';

        var service = {
            getAllTableFields: getAllTableFields,
            getTableFields: getTableFields
            
        };

        return service;

        function getAllTableFields(forceRefresh) {

            if (_areAllTableFieldsLoaded() && !forceRefresh) {

                return $q.when(_alltablefields);
            }

            var url = baseURI;

            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                return _alltablefields = result.data.resource;
            }

        }

        function getTableFields(id, forceRefresh) {

      //      if (_isSelectedTableLoaded(id) && !forceRefresh) {
      //              return $q.when(_selectedtablefields);
      //      }
            var url = baseURI + '/?fields=field&filter=tableid=' + id;

            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                return _selectedtablefields = result.data;
            }
        }

     
        function _areAllTableFieldsLoaded() {

            return _alltablefields.length > 0;
        }

        function _isSelectedTableLoaded(id) {

          return _selectedtablefields.length > 0;
          
        }

        function _queryFailed(error) {

            throw error;
        }
    }
})();