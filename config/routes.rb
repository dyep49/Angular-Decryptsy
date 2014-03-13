AngularDecryptsy::Application.routes.draw do
  scope :api do 
    resources :coinpairs, only: [:index], defaults: {format: :json}
  end

 root "decryptsy#index"
end
