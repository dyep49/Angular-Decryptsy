app.factory('Coinpair', ['$resource', '$http', function($resource, $http){
	
	function Coinpair(){
		this.service = $resource(
			'/api/coinpairs/:coinpairId', {coinpairId: '@id'})
	};
	Coinpair.prototype.all = function(){
		self = this
		return this.service.query(function(data){
			data.forEach(function(coinpair){
				calcResistance(coinpair)
			});
		});
	}



Coinpair.prototype.show = function(id){
	return this.service.query({coinpairId: id}, function(data){
			data.forEach(function(coinpair){
				calcResistance(coinpair)
			});
	})
}

var calcResistance = function(coinpair){
			$http({method: 'GET', url: '/api/depth/' + coinpair.market_id}).
				success(function(response){
					var response = response
					var halfIndex;
					var doubleIndex;
					var secondIndex;
					var thirdIndex;
					var fourthIndex;
					var halfSellArray =[];
					var doubleSellArray = [];
					var secondSellArray = [];
					var thirdSellArray = [];
					var fourthSellArray = [];

					$.each(response, function(index, order){
						if (order.price > (coinpair.last_trade * 1.5)){
							halfIndex = index;
							return false;
						}
					});

					$.each(response, function(index, order){
						if (order.price > (coinpair.last_trade * 2)){
							doubleIndex = index;
							return false;
						}
					});

					$.each(response, function(index, order){
						if (order.price > (coinpair.last_trade * 2.25)){
							secondIndex = index;
							return false;
						}
					});

					$.each(response, function(index, order){
						if (order.price > (coinpair.last_trade * 2.5)){
							thirdIndex = index;
							return false;
						}
					});

					$.each(response, function(index, order){
						if (order.price > (coinpair.last_trade * 3)){
							fourthIndex = index;
							return false;
						}
					});

					$.each(response.slice(0,halfIndex), function(index, order){
						var total = order.price * order.quantity;
						halfSellArray.push(total);
					});

					$.each(response.slice(0,doubleIndex), function(index, order){
						var total = order.price * order.quantity;
						doubleSellArray.push(total);
					});

					$.each(response.slice(0,secondIndex), function(index, order){
						var total = order.price * order.quantity;
						secondSellArray.push(total);
					});

					$.each(response.slice(0,thirdIndex), function(index, order){
						var total = order.price * order.quantity;
						thirdSellArray.push(total);
					});

					$.each(response.slice(0,fourthIndex), function(index, order){
						var total = order.price * order.quantity;
						fourthSellArray.push(total);
					});

					coinpair.halfWall = +(_.reduce(halfSellArray, function(memo, num){return memo + num;}, 0)).toFixed(8)
					coinpair.doubleWall = (_.reduce(doubleSellArray, function(memo, num){return memo + num;}, 0)).toFixed(8);
					coinpair.secondWall = (_.reduce(secondSellArray, function(memo, num){return memo + num;}, 0)).toFixed(8);
					coinpair.thirdWall = (_.reduce(thirdSellArray, function(memo, num){return memo + num;}, 0).toFixed(8));
					coinpair.fourthWall = (_.reduce(fourthSellArray, function(memo, num){return memo + num;}, 0)).toFixed(8);
		});

}



	return new Coinpair;
}]);


