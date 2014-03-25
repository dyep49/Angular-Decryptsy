app.controller('CoinpairShowCtrl', ['$scope', '$routeParams', 'Coinpair', 'Depth', function($scope, $routeParams, Coinpair, Depth) {

	function init(){
		Depth.getData($routeParams.coinpair_id)
	}

	init();

	$scope.sellData = Depth.sellData();



	$scope.coinpairs = Coinpair.show($routeParams.coinpair_id)
}]);