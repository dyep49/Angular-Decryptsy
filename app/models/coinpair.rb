class Coinpair < ActiveRecord::Base
	belongs_to :exchange
	has_many :orders
	has_many :trades
end
