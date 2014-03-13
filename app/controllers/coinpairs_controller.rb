class CoinpairsController < ApplicationController
	respond_to :json

	def index
		respond_with Coinpair.where(exchange_id: 1).where(secondary: 'BTC')
	end

	def depth
		market_id = params["market_id"].to_i

		coinpair_id = Coinpair.where(market_id: market_id).first.id
		respond_with Order.where(coinpair_id: coinpair_id).where(order_type: 'sell')
	end

end