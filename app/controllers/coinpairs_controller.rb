class CoinpairsController < ApplicationController
	respond_to :json

	def index
		respond_with Coinpair.where(exchange_id: 1).where(secondary: 'BTC')
	end

	def show
		respond_with Coinpair.where(id: params[:id])
	end


	def depth
		market_id = params["market_id"].to_i

		coinpair_id = Coinpair.where(market_id: market_id).first.id
		respond_with Order.where(coinpair_id: coinpair_id).where(order_type: 'sell')
	end

	def live_depth
		market_id = Coinpair.find(params["coinpair_id"]).market_id
		cryptsy = Cryptsy::API::Client.new(ENV["CRYPTSY_PUBLIC_KEY"], ENV["CRYPTSY_PRIVATE_KEY"])
		respond_to do |format|
			format.html
			format.json do
				response = cryptsy.depth(market_id)
				parsed_response = response["return"]
				render json: parsed_response.to_json
			end
		end
	end

end