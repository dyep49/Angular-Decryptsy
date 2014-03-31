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
			if matches.count > 1
				bid_max_pair = Coinpair.find_max_pair(matches)
				bid_max_order = bid_max_pair.orders.where(order_type:'buy').max_by(&:price).price
				bid_max_with_fees = bid_max_order - bid_max_pair.exchange.sell_fee * bid_max_order

				ask_min_pair = Coinpair.find_min_pair(matches)
				ask_min_order = ask_min_pair.orders.where(order_type: 'sell').min_by(&:price).price
				ask_min_with_fees = ask_min_order - ask_min_pair.exchange.buy_fee * ask_min_order

				breakeven_ask_price = bid_max_with_fees - ask_min_pair.exchange.buy_fee * bid_max_with_fees
				breakeven_bid_price = ask_min_with_fees + bid_max_pair.exchange.sell_fee * ask_min_with_fees

				asks_below_bid_max = ask_min_pair.asks_below(breakeven_ask_price)
				bids_above_ask_min = bid_max_pair.bids_above(breakeven_bid_price)

				orders = arbitrage_orders(bids_above_ask_min, asks_below_bid_max)

				if orders.any? && ask_min_with_fees < bid_max_with_fees
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
			#Occasionally, the market APIs provide inconsistent/corrupted data causing this method to fail. This method is used in a rake task, scheduled to run over 100+ coinpairs. This ensures that the entire task won't break in case of a small amount of inconsistent data.
			puts "RESCUED"
		end
	end

	def arbitrage_orders(bids, asks)
		order_array = []
		until bids.empty? || asks.empty?
			ask_qty = asks.first.quantity
			bid_qty = bids.last.quantity

			ask_with_fees = asks.first.price_with_fee
			bid_with_fees = bids.last.price_with_fee

			arbitrage_opportunity = ask_with_fees < bid_with_fees

			if ask_qty < bid_qty && arbitrage_opportunity
				profit = bid_with_fees * ask_qty - ask_with_fees * ask_qty
				order_array << [ask_qty, asks.first.price, profit]
				bids.last.quantity -= ask_qty  
				asks.shift
			elsif arbitrage_opportunity
				profit = bid_with_fees * bid_qty - ask_with_fees * bid_qty
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



























