/* eslint-disable no-console */
import { ajax } from "discourse/lib/ajax";
import { apiInitializer } from "discourse/lib/api";

export default apiInitializer((api) => {
  const currentUser = api.getCurrentUser();
  let lastTopicId = null;

  // initialize
  const posthog = window.posthog;

  console.debug("🦔 PostHog Initializer gestartet");

  // 1. USER IDENTIFICATION
  if (currentUser) {
    const storageKey = `posthog_identified_${currentUser.id}`;
    console.debug(
      "🦔 PostHog Identify started. Current storageKey:",
      storageKey
    );

    // Nur ausführen, wenn wir es in dieser Session noch nicht getan haben
    if (!sessionStorage.getItem(storageKey)) {
      ajax("/discourse-posthog/identify", { type: "POST" })
        .then((data) => {
          posthog.identify(data.email, {
            discourse_email: data.email,
            discourse_id: data.id,
            discourse_username: data.username,
          });
          sessionStorage.setItem(storageKey, "true");
          console.debug("🦔 Posthog Identify send");
        })
        .catch((e) => console.error("🦔❌ PostHog Identify fehlgeschlagen", e));
    }
  }

  // 2. PAGEVIEW TRACKING (SPA-kompatibel)
  api.onPageChange((url, title) => {
    if (!window.posthog) {
      return;
    }

    // Extrahiere Topic ID aus der URL (Format: /t/slug/ID/post_number)
    const topicMatch = url.match(/\/t\/[^\/]+\/(\d+)/);

    if (topicMatch) {
      const currentTopicId = topicMatch[1];

      // Nur tracken, wenn es ein neues Topic ist (nicht beim Scrollen durch Posts)
      if (currentTopicId !== lastTopicId) {
        posthog.capture("$pageview", {
          discourse_topic_id: currentTopicId,
          discourse_title: title,
          url,
        });
        lastTopicId = currentTopicId;
        console.debug("🦔✅ Posthog $pageview capture for a topic");
      }
    } else {
      // Für alle anderen Seiten (Suche, Profil, Kategorien)
      lastTopicId = null;
      posthog.capture("$pageview");
      console.debug("🦔✅ Posthog $pageview capture for a page");
    }
  });

  // ✅ EVENT Tracking
  api.onAppEvent("topic:created", (data) => {
    posthog.capture("discourse_topic_created", {
      discourse_topic_id: data.topic_id,
      discourse_title: data.title,
      discourse_slug: data.slug,
    });
    console.debug("🦔✅ Posthog event discourse_topic_created");
  });

  api.onAppEvent("post:created", (data) => {
    console.log(data);
    posthog.capture("discourse_post_created", {
      discourse_topic_id: data.topic_id,
      discourse_slug: data.slug,
    });
    console.debug("🦔✅ Posthog event discourse_post_created");
  });

  api.onAppEvent("page:like-toggled", (data) => {
    const topicId = data.post_url.match(/\/t\/[^\/]+\/(\d+)\//)?.[1] || 0;

    if (data.actionByName?.like?.acted) {
      posthog.capture("discourse_post_liked", {
        discourse_topic_id: topicId,
      });
      console.debug("🦔✅ Posthog event discourse_post_liked");
    } else {
      posthog.capture("discourse_post_unliked", {
        discourse_topic_id: topicId,
      });
      console.debug("🦔✅ Posthog event discourse_post_unliked");
    }
  });
});
