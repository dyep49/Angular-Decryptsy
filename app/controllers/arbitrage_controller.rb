class ArbitrageController < ApplicationController
	respond_to :json

	def index
		respond_with Arbitrage.all
	end

end
