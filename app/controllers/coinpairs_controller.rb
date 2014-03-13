class CoinpairsController < ApplicationController
	respond_to :json

	def index
		respond_with Coinpair.where(exchange_id: 1)
	end

end