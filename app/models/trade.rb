class Trade < ActiveRecord::Base
	beongs_to :coinpair
	validates_uniqueness_of :trade_id
	
end
