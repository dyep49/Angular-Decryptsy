AngularDecryptsy::Application.routes.draw do
  scope :api do 
    resources :coinpairs, only: [:index, :show], defaults: {format: :json}

    get '/depth/:market_id' => 'coinpairs#depth', defaults: {format: :json}
    get '/live_depth/:pair_id' => 'coinpairs#live_depth', defaults: {format: :json}


    resources :arbitrage, only: [:index], defaults: {format: :json}
  end

 root "decryptsy#index"
end
