AngularDecryptsy::Application.routes.draw do
  scope :api do 
    resources :coinpairs, only: [:index, :show], defaults: {format: :json}

    get '/depth/:market_id' => 'coinpairs#depth', defaults: {format: :json}
    get '/live_depth/:coinpair_id' => 'coinpairs#live_depth', defaults: {format: :json}
    get '/last_price/:coinpair_id' => 'coinpairs#last_price', defaults: {format: :json}
    get '/history/:coinpair_id' => 'coinpairs#history', defaults: {format: :json}




    resources :arbitrage, only: [:index], defaults: {format: :json}
  end

 root "decryptsy#index"
end
