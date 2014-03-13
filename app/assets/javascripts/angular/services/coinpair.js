app.factory('Coinpair', ['$resource', function($resource){
	function Coinpair(){
		this.service = $resource(
			'/api/coinpairs/:coinpairId', {coinpairId: '@id'})
	};
	Coinpair.prototype.all = function(){
		return this.service.query();
	};
	return new Coinpair;
}]);