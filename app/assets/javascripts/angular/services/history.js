app.service('TradeHistory', ['$http', function($http){

	var candlestick_history = []
	var trade_history = []

	Date.prototype.addHours = function(h){
	    this.setHours(this.getHours()+h);
	    return this;
	}

	var Trade = function(time, price){
		this.datetime = time
		this.price = price
	}

	var CandleStick = function(open_time, open, close, min, max){
		this.open_datetime = open_time
		this.open = open
		this.close = close
		this.min = min
		this.max = max
	}

	function roundTime(date) {
			var copied_date = new Date(date.getTime());
	    copied_date.setHours(date.getHours() + Math.floor(date.getMinutes()/60));
	    copied_date.setMinutes(0);
	    copied_date.setSeconds(date.getSeconds() + Math.floor(date.getSeconds()/60));
	    copied_date.setSeconds(0);
	    return copied_date;
	}

	var populate_line_array = function(data){
		data.forEach(function(trade){
			datetime = new Date(trade.datetime)
			trade_history.push(new Trade(datetime, parseFloat(trade.tradeprice)))
		})
	}


	var populate_candlestick_array = function(data){
		var grouped_history = _.groupBy(data, function(n){return roundTime(n.datetime)})
		
		_.each(grouped_history, function(trades){
			var min = _.min(trades, function(trade){return trade.price}).price
			var max = _.max(trades, function(trade){return trade.price}).price
			var open = trades[0].price
			var close = _.last(trades).price
			var open_time = roundTime(trades[0].datetime)
			// var close_time = open_time.addHours(1)
			candlestick_history.push(new CandleStick(open_time, open, close, min, max))
		})
	}

	this.fetchData = function(id){

		$http.get('/api/history/' + id)
			.success(function(data){
				populate_line_array(data)
				populate_candlestick_array(trade_history)
			})
	}

	this.getCandlesticks = function(){
		return candlestick_history
	}

	this.getTrades = function(){
		return trade_history
	}




}])