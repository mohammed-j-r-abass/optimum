---
name: Gemini Live compatibility
description: Official Live documentation and SDK ephemeral-token API versions can disagree.
---
Google's public Live docs and the installed JavaScript SDK can disagree about which API version accepts ephemeral tokens. Do not assume a successful model listing or token issuance proves the browser Live connection works.

**Why:** During live-interview integration, official docs illustrated v1beta while the installed SDK explicitly required v1alpha. An actual constrained-token WebSocket session with streamed audio and transcripts verified the working version.

**How to apply:** When updating the Gemini SDK or Live configuration, inspect the installed SDK's ephemeral-auth requirements and verify one real token-to-WebSocket connection without printing tokens or permanent keys. Keep the key server-side and constrain browser tokens to one use and the intended session.
