app.controller('CoinpairsCtrl', ['$scope', 'Coinpair', function($scope, Coinpair) {
  $scope.coinpairs = Coinpair.all();
}]);