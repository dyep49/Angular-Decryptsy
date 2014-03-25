app.controller('CoinpairShowCtrl', ['$scope', '$routeParams', 'Coinpair', function($scope, $routeParams, Coinpair) {
	console.log($routeParams)
	$scope.coinpairs = Coinpair.show($routeParams.coinpair_id)
}]);