app.controller('CoinpairShowCtrl', ['$scope', '$routeParams', 'Coinpair', 'Depth', '$interval', '$rootScope', '$timeout', function($scope, $routeParams, Coinpair, Depth, $interval, $rootScope, $timeout) {

	function init(){
		console.log('grabbing_depth');
		Depth.getData($routeParams.coinpair_id)
		Depth.lastPrice($routeParams.coinpair_id)
	}

	init();

	var depthInterval = $interval(function(){
		console.log('interval')
		Depth.getData($routeParams.coinpair_id);
		Depth.lastPrice($routeParams.coinpair_id);
		$timeout(function(){
			$scope.buyData = Depth.buyData();
			$scope.sellData = Depth.sellData();
			$scope.lastPrice = Depth.getLastPrice();
		}, 2000)
		// $scope.buyData = [1,2,3,4]
	}, 5000)

	$scope.sellData = Depth.sellData();
	$scope.buyData = Depth.buyData();

	$scope.lastPrice = Depth.getLastPrice();

	$scope.coinpairs = Coinpair.show($routeParams.coinpair_id)

	$rootScope.$on('$routeChangeStart', function(event, next, current){
		console.log('leaving')
		$interval.cancel(depthInterval)
	})





}]);