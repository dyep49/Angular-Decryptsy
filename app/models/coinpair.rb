class Coinpair < ActiveRecord::Base
	belongs_to :exchange
	has_many :orders
	has_many :trades

	def similar?(other_coinpair)
		self.primary == other_coinpair.primary && self.secondary == other_coinpair.secondary
	end

	def self.find_max_pair(matches)
		matches.max_by do |match| 
			price = match.orders.where(order_type:'buy').first.price
			price_with_fees = price - match.exchange.sell_fee * price
		end
	end

	def self.find_min_pair(matches)
		matches.min_by do |match| 
			price = match.orders.where(order_type: 'sell').first.price
			price_with_fees = price + match.exchange.buy_fee * price
		end
	end

	def asks_below(price)
		self.orders.where("order_type = 'sell' AND price < '#{price}'").order(:price)
	end

	def bids_above(price)
		self.orders.where("order_type = 'buy' AND price > #{price}").order(:price)
	end

=begin
An arbitrage opportunity exists when it is profitiable to buy on one exchange and sell on another. For example, if the price to buy CoinA on Exchange1 is $10 and the price to sell CoinA on Exchange2 is $15, then an arbitrage opportunity exists. This method is used to identify arbitrage opportunities, and return the maximum quantity that can be bought and what profit will be made.

At a high level, the following steps have to be taken:
1. Identical coinpairs on different exchanges are identified
2. To see if an arbitrage opportunity exists, the lowest ask price and the highest bid price are identified.
3. If the minimum ask is less than the maximum bid after fees, then calculate the breakeven price and check to see if there are multiple orders that could fulfill the arbitrage criteria   
4.  


=end

def arbitrage
		begin
			matches = Coinpair.where(primary: self.primary, secondary: self.secondary)
				#Check to see if more than one market has the coinpair
				if matches.count > 1
					#if it does, find the coinpair with the highest bid price after fees
					bid_max_pair = Coinpair.find_max_pair(matches)
					#then, it takes that coinpair and returns the order with the highest bid price, adjusted for exchange fees

					bid_max_order = bid_max_pair.orders.where(order_type:'buy').max_by{|x| x.price}.price
					bid_max_with_fees = bid_max_order - bid_max_pair.exchange.sell_fee * bid_max_order
					#Iterates through the matching coinpairs and returns the coinpair with the lowest ask price after adjusting for exchange fees
					ask_min_pair = Coinpair.find_min_pair(matches)
					#then, it takes that coinpair and returns the order with the lowest bid price, adjust for exchange fees
					ask_min_order = ask_min_pair.orders.where(order_type: 'sell').order(:price).first
					ask_min_with_fees = ask_min_order.price + ask_min_pair.exchange.buy_fee * ask_min_order.price
					#if the minimum ask price, is less than the maximum bid price, then an arbitrage opportunity exists
					if ask_min_with_fees < bid_max_with_fees
						#Calculates the ask price that guarantees arbitrage
						breakeven_ask_price = bid_max_with_fees - ask_min_pair.exchange.buy_fee * bid_max_with_fees
						#Creates an array of asks that are below the highest bid. Array is sorted by price, low to high
						asks_below_bid_max = ask_min_pair.asks_below(breakeven_ask_price)
						#Calculates the bid price that guarantees arbitrage
						breakeven_bid_price = ask_min_with_fees + bid_max_pair.exchange.sell_fee * ask_min_with_fees
						#Creates an array of bids that are above the breakeven bid price
						bids_above_ask_min = bid_max_pair.bids_above(breakeven_bid_price)
						#Creates an array of potential arbitrage orders. In the recursive method the order objects are directly manipulated, so clones were necessary  
						cloned_asks = asks_below_bid_max.map do |ask|
							ask.clone 
						end

						cloned_bids = bids_above_ask_min.map do |bid|
							bid.clone 
						end

						order_array = []
						arbitrage_array = Coinpair.arbitrage_recursion(cloned_bids, cloned_asks, order_array)
						if arbitrage_array.count >= 1
							buy_at = ask_min_pair.exchange
							sell_at = bid_max_pair.exchange
							quantity = arbitrage_array.inject(0){|sum, order| sum += order[0]}
							profit = arbitrage_array.inject(0){|sum, order| sum += order[2]}
							ArbitragePair.new(buy_exchange: buy_at, sell_exchange: sell_at, primary:self.primary, secondary:self.secondary, lowest_ask: ask_min_order.price, highest_bid: bid_max_order, quantity: quantity, profit: profit)
						end
					end
				end
		rescue
			#Occasionally, the market APIs provide inconsistent/corrupted data causing this method to fail. This method is used in a rake task, scheduled to run over 100+ coinpairs. This ensures that the entire task won't break in case of a small amount of inconsistent data.
			puts "RESCUED"
		end
	end

	def self.arbitrage_recursion(bids, asks, order_array)
		unless bids.count == 0 || asks.count == 0
			#Grabs the quantity of the highest bid and the lowest ask
			ask_quantity = asks.first.quantity
			bid_quantity = bids.last.quantity
			#Grabs the price of the highest bid and lowest ask after fees
			ask_price_with_fees = asks.first.price_with_fee
			bid_price_with_fees = bids.last.price_with_fee
			#Checks to see if arbitrage opportunity exists after fees
			arbitrage_opportunity = ask_price_with_fees < bid_price_with_fees
			#if there's a greater ask quantity than bid quantity an an arbitrage opportunity exists...
			if ask_quantity >= bid_quantity && arbitrage_opportunity
				profit = bid_price_with_fees * bid_quantity - ask_price_with_fees * bid_quantity
				order_array << [bid_quantity, asks.first.price, profit]
				asks.last.quantity -= bid_quantity  
				bids.delete(bids.last)
			elsif ask_quantity < bid_quantity && arbitrage_opportunity
				profit = bid_price_with_fees * ask_quantity - ask_price_with_fees * ask_quantity
				order_array << [ask_quantity, asks.first.price, profit]
				bids.last.quantity -= ask_quantity  
				asks.delete(asks.first)
			end
			Coinpair.arbitrage_recursion(bids, asks, order_array)
		end
		order_array
	end



end
