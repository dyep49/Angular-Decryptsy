app.factory('Arbitrage', ['$resource', function($resource){
	function Arbitrage(){
		this.service = $resource('/api/arbitrage')
	};

	Arbitrage.prototype.all = function(){
		return this.service.query()
	}

	return new Arbitrage;
}])