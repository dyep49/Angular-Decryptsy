app.controller('ArbitrageCtrl', ['$scope', 'Arbitrage', function($scope, Arbitrage) {
  $scope.arbitrages = Arbitrage.all();

  $scope.orderByField = 'profit';
  $scope.reverseSort = false;

}]);