var app = angular.module("Decryptsy", ['ngResource', 'ngRoute']);

app.config(function($routeProvider){
	$routeProvider
		.when('/',{
			templateUrl : 'templates/home.html',
			controller  : 'CoinpairsCtrl'
		})

		.when('/arbitrage',{
			templateUrl : 'templates/arbitrage.html',
			controller  : 'CoinpairsCtrl'
		})
});



