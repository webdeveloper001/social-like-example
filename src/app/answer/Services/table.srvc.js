(function () {
    'use strict';

    angular
        .module('app')
        .factory('table', table);

    table.$inject = ['$http', '$q'];

    function table($http, $q) {

        // Members
        var _tables = [];
        var _selectedTable;
        var baseURI = '/api/v2/mysql/_table/ranking';

        var service = {
            getTables: getTables,
            getTable: getTable,
            addTable: addTable
        };

        return service;

        function getTables(forceRefresh) {
            
            if (_areTablesLoaded() && !forceRefresh) {

                return $q.when(_tables);
            }

            var url = baseURI;

            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                return _tables = result.data.resource;
            }

        }

        function getTable(id, forceRefresh) {

            if (_isSelectedTableLoaded(id) && !forceRefresh) {

                return $q.when(_selectedTable);
            }

            var url = baseURI + '/' + id;

            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                return _selectedTable = result.data;
            }
        }

        function addTable(table) {

            var defer = $q.defer();

            _tables.push(table);

            defer.resolve(_tables);

            return defer.promise;
        }

        function updateTableHeader() {
            console.log("updateTableHeader");
            //TODO code translation for Table title and header
        }

        function _areTablesLoaded() {

            return _tables.length > 0;
        }

        function _isSelectedTableLoaded(id) {

            return _selectedTable && _selectedTable.id == id;
        }

        function _queryFailed(error) {

            throw error;
        }
    }
})();