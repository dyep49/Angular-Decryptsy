var app = angular.module("Decryptsy", ['ngResource', 'ngRoute', 'd3']);

app.config(function($routeProvider){
	$routeProvider
		.when('/',{
			templateUrl : 'templates/home.html',
			controller  : 'CoinpairsCtrl'
		})
		.when('/arbitrage',{
			templateUrl : 'templates/arbitrage.html',
			controller  : 'ArbitrageCtrl'
		})
		.when('/coinpair/:coinpair_id',{
			templateUrl : 'templates/coinpair.html',
			controller  : 'CoinpairShowCtrl'
		})
});



