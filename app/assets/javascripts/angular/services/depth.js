app.service('Depth', ['$http', function($http){

	Order = function(price, quantity){
		this.price = price
		this.quantity = quantity
	}

	var sell_data_array = []
	var buy_data_array = []

	this.getData = function(id, callback){
		sell_data_array = []
		buy_data_array = []
		$http.get('/api/live_depth/' + id)
			.success(function(data){
				var sell_total = 0
				data.sell.forEach(function(order, index){
					var price = parseFloat(order[0])
					sell_total += parseFloat(order[1])
					var quantity = sell_total
					sell_data_array.push(new Order(price, quantity))
				})

				var buy_total = 0
				data.buy.forEach(function(order, index){
					var price = parseFloat(order[0])
					buy_total += parseFloat(order[1])
					var quantity = buy_total
					buy_data_array.push(new Order(price, quantity))
				})
					if(typeof callback === 'function' && callback()){
						callback()
					}
			})
	}

	this.fuckshitup = function(){
		sell_data_array = []
	}

	this.sellData = function(){
		console.log(sell_data_array);
		return sell_data_array
	}

	this.buyData = function(){
		return buy_data_array
	}

}])