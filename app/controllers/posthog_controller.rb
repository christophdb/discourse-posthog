class PosthogController < ApplicationController
  before_action :ensure_logged_in
  
  def identify
    render json: {
      distinct_id: current_user.email,
      username: current_user.username,
      user_id: current_user.id,
      admin: current_user.admin,
      moderator: current_user.moderator
    }
  end
end
