# Discourse PostHog

This plugin integrates Discourse with PostHog, sending events like pageviews, topic/post creation, and likes. It supports anonymous tracking, email-based identification, or SHA256-hashed emails via a custom Discourse endpoint.

## Features

- **Events**: pageview, pageleave, create topic, create post, like/unlike post
- **Privacy levels of the event tracking**: anonymous, user email, hashed email

## Production Installation

### 1. Load plugin

Edit `containers/app.yml` and add this code:


```yaml
hooks:
  after_code:
    - exec:
        cd: $home/plugins
        cmd:
          # ... existing plugins ...
          - git clone https://github.com/christophdb/discourse-posthog.git
```

### 2. Rebuild container

```bash
cd /var/discourse
./launcher rebuild app
```

### 3. Enable plugin

- Go to `Admin` → `Plugins` → Enable "discourse-posthog"
- Add your `POSTHOG_API_KEY`. Update the other settings, if needed.

### 4. Verify

Open the browser console and change the output to `verbose`. Now you will see log message from the plugin.

```
🦔 PostHog Initializer gestartet
🦔✅ Posthog $pageview capture for a page
```

## Local Development (VSCode DevContainer)

### Workspace Setup

```bash
mkdir discourse-dev && cd discourse-dev
git clone https://github.com/christophdb/discourse-posthog.git
git clone https://github.com/discourse/discourse.git
code discourse
```

### Directory structure:

```
discourse-dev/
├── discourse/           ← Discourse Core (workspaceMount)
└── discourse-posthog/   ← Plugin (separate mount)
```

### Extend .devcontainer/devcontainer.json

```bash
"source=${localWorkspaceFolder}/../discourse-posthog,target=${containerWorkspaceFolder}/plugins/discourse-posthog,type=bind,consistency=cached"
```

### Start sequence

Inside visual studio code, start the dev container. You will find the plugin in `plugins/discourse-posthog`.

Open your browser and open `http://localhost:4200`.

### Initial Admin User

After the first start of discourse you need to create an initial admin user with `bundle exec rake admin:create`.

### Development

The Mount ensures local plugin changes are immediately visible in container.