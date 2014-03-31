class Coinpair < ActiveRecord::Base
	belongs_to :exchange
	has_many :orders
	has_many :trades

	def similar?(other_coinpair)
		primary == other_coinpair.primary && secondary == other_coinpair.secondary
	end

	#Given multiple coinpairs, returns the coinpair with the highest bid
	def self.find_max_pair(matches)
		matches.max_by do |match| 
			price = match.orders.where(order_type:'buy').max_by(&:price).price
			price - match.exchange.sell_fee * price
		end
	end

	#Given multiple coinpairs, returns the coinpair with the lowest ask
	def self.find_min_pair(matches)
		matches.min_by do |match| 
			price = match.orders.where(order_type: 'sell').min_by(&:price).price
			price + match.exchange.buy_fee * price
		end
	end

	#Finds all the ask orders below a given price
	def asks_below(price)
		orders.where("order_type = 'sell' AND price < '#{price}'").order(:price)
	end

	#Finds all the bids above a given price
	def bids_above(price)
		orders.where("order_type = 'buy' AND price > #{price}").order(:price)
	end

=begin
An arbitrage opportunity exists when it is profitiable to buy on one exchange and sell on another. For example, if the price to buy CoinA on Exchange1 is $10 and the price to sell CoinA on Exchange2 is $15, then an arbitrage opportunity exists. This method is used to identify arbitrage opportunities, return the maximum quantity that can be bought, and the profit that can be made.
=end

	#Returns an array of arbitrage opportunities
	def arbitrage
			#Finds similar coinpairs on different exchanges
			matches = Coinpair.where(primary: primary, secondary: secondary)
			if matches.count > 1
				#Finds the maximum bid price
				bid_max_pair = Coinpair.find_max_pair(matches)
				bid_max_order = bid_max_pair.orders.where(order_type:'buy').max_by(&:price).price
				bid_max_fees = bid_max_order - bid_max_pair.exchange.sell_fee * bid_max_order
				#Finds the minimum ask price
				ask_min_pair = Coinpair.find_min_pair(matches)
				ask_min_order = ask_min_pair.orders.where(order_type: 'sell').min_by(&:price).price
				ask_min_fees = ask_min_order - ask_min_pair.exchange.buy_fee * ask_min_order
				#Finds the necessary ask and bid prices to breakeven
				breakeven_ask = bid_max_fees - ask_min_pair.exchange.buy_fee * bid_max_fees
				breakeven_bid = ask_min_fees + bid_max_pair.exchange.sell_fee * ask_min_fees
				#Finds asks and bids that have the potential for arbitrage opportunities
				asks_below_bid_max = ask_min_pair.asks_below(breakeven_ask)
				bids_above_ask_min = bid_max_pair.bids_above(breakeven_bid)

				orders = arbitrage_orders(bids_above_ask_min, asks_below_bid_max)

				if orders.any? && ask_min_fees < bid_max_fees
					ArbitragePair.new(
						quantity:      orders.sum(&:first),
						profit:        orders.sum(&:last),
						buy_exchange:  ask_min_pair.exchange,
						sell_exchange: bid_max_pair.exchange,
						lowest_ask:    ask_min_order,
						highest_bid:   bid_max_order,
						primary:       primary,
						secondary:     secondary
					)
				end
			end
	rescue
		puts "RESCUED"
	end

	#Creates an array of orders that can be purchased to profit via arbitrage
	def arbitrage_orders(bids, asks)
		order_array = []
		#Iterates through array of bids and asks
		#Pushes orders to an array that indicate the price, quantity, and profit of an arbitrage opportunity
		#Stops when arbitrage opportunities no longer exist
		until bids.empty? || asks.empty?
			ask_qty = asks.first.quantity
			bid_qty = bids.last.quantity

			ask_with_fees = asks.first.price_with_fee
			bid_with_fees = bids.last.price_with_fee

			arbitrage_opportunity = ask_with_fees < bid_with_fees

			if ask_qty < bid_qty && arbitrage_opportunity
				profit = (bid_with_fees - ask_with_fees) * ask_qty
				order_array << [ask_qty, asks.first.price, profit]
				bids.last.quantity -= ask_qty  
				asks.shift
			elsif arbitrage_opportunity
				profit = (bid_with_fees - ask_with_fees) * bid_qty				
				order_array << [bid_qty, asks.first.price, profit]
				asks.last.quantity -= bid_qty  
				bids.pop
			else
				break
			end
		end
		order_array
	end


end



























