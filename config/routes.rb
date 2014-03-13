AngularDecryptsy::Application.routes.draw do
  scope :api do 
    resources :coinpairs, only: [:index], defaults: {format: :json}

    get '/depth/:market_id' => 'coinpairs#depth', defaults: {format: :json}
  end

 root "decryptsy#index"
end
