---
name: Direct Gemini Live provider
description: Provider and API-version constraints for live interview work.
---
The managed OpenAI and Gemini AI integrations cannot provide duplex live audio/video. Use a direct provider credential for Gemini Live; do not silently replace it with recorded clips or snapshot-only chat.

**Why:** Live audio-and-visual interaction is core product scope. Provider availability must be verified before promising it.

**How to apply:** Check the direct provider's current model list and documentation, then verify ephemeral provisioning and a constrained Live handshake. Never expose the permanent credential to a browser.

The Google SDK may warn that ephemeral credentials require v1alpha even when Google's current documentation specifies v1beta. A constrained ephemeral-token Live handshake with v1beta was verified on 2026-11-03 despite that warning.

**Why:** Following the SDK warning alone can lead to an unnecessary API-version change.

**How to apply:** Prefer current provider documentation and an actual handshake over this warning; reverify when changing SDK versions or provider models.

Ephemeral-token constraints must leave the session-resumption handle editable by the browser, while keeping safety instructions locked.

**Why:** Google's default constraint behavior locks unspecified fields too. Locking an empty resumption configuration silently drops the reconnect handle, so a one-use token attempts a second new session instead of resuming. This was confirmed with real provider connections.

**How to apply:** Explicitly limit additional field locking, omit session resumption from the locked configuration, and verify a second handshake using the same one-use token and a real resumable handle.
