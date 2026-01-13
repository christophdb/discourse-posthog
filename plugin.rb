# name: discourse-posthog
# about: PostHog identify endpoint for Discourse
# version: 1.0.0
# authors: Ihr Name
# url: https://github.com/IHRUSERNAME/discourse-posthog

enabled = true
after_initialize do
  Discourse::Application.routes.append do
    post "/posthog/identify" => "posthog#identify"
  end
  
  # Optional: Admin Panel
  add_admin_route "posthog.title", "/admin/plugins/posthog"
end