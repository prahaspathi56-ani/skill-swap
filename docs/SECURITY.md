# SkillSwap Security & Trust Policy

SkillSwap is designed strictly for safe, positive student collaboration. This document outlines the security architecture and community safeguards.

## 1. Authentication & Session Security
- **Password Protection**: Passwords are hashed with `bcryptjs` using a salt work factor of 10. Raw passwords are never logged or stored.
- **JWT Integrity**: Tokens are signed with HMAC-SHA256 (`JWT_SECRET`) and expire after 7 days.
- **Authorization Guard**: Role-based access control (`STUDENT`, `ADMIN`) validates that only authorized administrators access moderation queues and platform metrics.
- **Ownership Verification**: Resource operations (e.g. deleting skills, editing questions, updating swap requests) enforce strict student ownership checks.

## 2. Sandboxed Code Execution
- Student-submitted code in the Coding Challenges module is evaluated in an isolated execution sandbox.
- Dangerous modules (`fs`, `child_process`, `net`, `http`, `process`) are blocked.
- Execution boundaries are enforced with a strict 2,000ms wall-clock timeout to prevent infinite loops and denial-of-service attempts.

## 3. WebRTC & Media Privacy
- Video and audio streams flow strictly **peer-to-peer (P2P)** between students using standard WebRTC encryption (DTLS/SRTP).
- The signaling server never records or stores audio or video packets.
- Meeting rooms are authenticated and accessible only to participants enrolled in the scheduled session.

## 4. Trust, Safety & Anti-Commercialization
- **Strict Free Model**: The application has no payment gateway, credit tokens, or subscription checks. All features are open to verified students.
- **Report & Moderation System**: Students can flag spam, harassment, or commercial solicitation. Admin moderators review flagged content in the Admin Control Panel.
- **Verified Badges**: Students can earn verification through institutional `.edu` domains and positive peer reviews.
