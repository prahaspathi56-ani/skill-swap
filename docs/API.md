# SkillSwap REST API Documentation

Base URL: `http://localhost:5000/api`

All protected endpoints require the `Authorization: Bearer <jwt_token>` header.

## 1. Authentication (`/api/auth`)
- `POST /register`: Register a new student account.
- `POST /login`: Authenticate and receive a JWT token + user profile.
- `GET /me`: Fetch the current authenticated user's profile and skills.
- `POST /forgot-password`: Request password reset token.
- `POST /reset-password`: Reset password using token.

## 2. Skills & Taxonomy (`/api/skills`)
- `GET /`: Search and list skills by category or keyword.
- `POST /`: Propose/add a new skill to the taxonomy.
- `POST /user-skills`: Associate skills to teach or learn with proficiency level.
- `DELETE /user-skills/:id`: Remove a skill from the student's profile.

## 3. Matching & Discovery (`/api/matches`)
- `GET /`: Returns compatible student matches based on reciprocal teach-learn fit.
- `GET /explore`: Advanced search for students with filters (category, college, level, availability).

## 4. Swap Requests (`/api/swaps`)
- `GET /`: List incoming and outgoing swap requests.
- `POST /`: Submit a new swap request specifying offered and requested skills.
- `PATCH /:id/status`: Accept or decline a swap request.

## 5. Learning Sessions (`/api/sessions`)
- `GET /`: List upcoming, active, and completed sessions.
- `POST /`: Schedule a new session with date, duration, skill, and agenda.
- `GET /:id`: Retrieve session details and room credentials.
- `PATCH /:id/status`: Update session state (`LIVE`, `COMPLETED`, `CANCELLED`).
- `PATCH /:id/notes`: Save synchronized session notes.

## 6. Real-Time Chat (`/api/conversations`)
- `GET /`: List conversations with last message previews and unread counts.
- `GET /:id/messages`: Retrieve chat history for a conversation.
- `POST /:id/messages`: Send a message (also emitted via Socket.IO).

## 7. Question Hub (`/api/questions`)
- `GET /`: Search and browse questions by tag or category.
- `POST /`: Ask a new question.
- `GET /:id`: View question details with answers.
- `POST /:id/answers`: Post an answer to a question.
- `POST /answers/:id/upvote`: Upvote an answer.

## 8. Coding Challenges (`/api/coding`)
- `GET /challenges`: List challenges with tags and difficulty.
- `GET /challenges/:id`: Fetch problem description, starter code, and test cases.
- `POST /challenges/:id/run`: Run code in safe sandbox against test cases.
- `POST /challenges/:id/submit`: Submit solution and record score.

## 9. AI Assistant (`/api/ai`)
- `POST /ask`: Submit questions to the AI Doubt Assistant.
- `POST /roadmap`: Generate tailored learning roadmap for any subject.
- `POST /english-feedback`: Receive grammar and vocabulary feedback on text.
- `POST /prep`: Generate session preparation checklists and discussion points.

## 10. Admin & Safety (`/api/admin`)
- `GET /stats`: Platform analytics (users, sessions, swaps, completed hours).
- `GET /users`: Student directory with moderation actions (ban, verify).
- `GET /reports`: Community moderation queue for reported questions and posts.
