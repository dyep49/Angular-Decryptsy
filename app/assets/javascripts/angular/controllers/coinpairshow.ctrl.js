app.controller('CoinpairShowCtrl', ['$scope', '$routeParams', 'Coinpair', 'Depth', '$interval', '$rootScope', function($scope, $routeParams, Coinpair, Depth, $interval, $rootScope) {

	function init(){
		console.log('grabbing_depth');
		Depth.getData($routeParams.coinpair_id)
	}

	init();

	var depthInterval = $interval(function(){
		console.log('fucking shit up')
		Depth.fuckshitup()
	}, 5000)

	$scope.sellData = Depth.sellData();
	$scope.buyData = Depth.buyData();


	$scope.coinpairs = Coinpair.show($routeParams.coinpair_id)

	$rootScope.$on('$routeChangeStart', function(event, next, current){
		console.log('leaving')
		$interval.cancel(depthInterval)
	})


}]);