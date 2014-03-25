app.controller('CoinpairsCtrl', ['$scope', 'Coinpair', '$location', function($scope, Coinpair, $location) {
  $scope.coinpairs = Coinpair.all();

  $scope.showCoinpair = function(id){
  	console.log('clicked')
  	$location.path('/coinpair/' + id)
  }
}]);