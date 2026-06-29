# Rumblr Integration Test Seed Assessment & Implementation

## Executive Summary

This document outlines the database schema assessment and the comprehensive seed file suite created to support integration testing for the Rumblr API.

---

## Database Schema Assessment

### Tables & Relationships

#### 1. **Users** (`users`)

- Core entity representing application users
- Fields: `id` (UUID PK), `username`, `email`, `password_hash`, `bio`, `status` (active/inactive/suspended), `created_at`
- Business Context: Users can have multiple statuses, allowing for testing of suspended/inactive accounts

#### 2. **Statements** (`statements`)

- Debate/discussion prompts that users respond to
- Fields: `id` (UUID PK), `content` (text)
- Business Context: The foundation of the entire platform - users answer these to build response profiles

#### 3. **Responses** (`responses`)

- User responses to statements with dual scoring
- Fields: `id` (UUID PK), `user_id` (FK → users), `statement_id` (FK → statements), `agreement_score` (1-5), `importance_score` (1-5), `created_at`, `updated_at`
- Constraints:
  - Unique constraint on (user_id, statement_id) - one response per user per statement
  - Both scores bounded to 1-5 range
  - Indexed on (user_id, statement_id) for fast lookups
- Business Context: Core data for calculating mismatches between users

#### 4. **Blocks** (`blocks`)

- One-directional blocking relationships between users
- Fields: `id` (UUID PK), `blocker_id` (FK → users), `blocked_id` (FK → users), `created_at`
- Business Context: Users can block others they don't want to interact with

#### 5. **RumbleRequests** (`rumble_requests`)

- Initial challenge requests between users
- Fields: `id` (UUID PK), `requester_id` (FK → users), `receiver_id` (FK → users), `status` (pending/accepted/declined), `created_at`
- Business Context: Requests transition from pending → accepted (creates Rumble) or declined

#### 6. **Rumbles** (`rumbles`)

- Actual debate matches created from accepted requests
- Fields: `id` (UUID PK), `rumble_request_id` (FK → rumble_requests), `requester_id` (FK → users), `receiver_id` (FK → users), `status` (pending/active/completed/cancelled), `created_at`
- Business Context: The debate itself; messages are sent during active rumbles

#### 7. **Messages** (`messages`)

- Chat messages within a rumble
- Fields: `id` (UUID PK), `rumble_id` (FK → rumbles), `sender_id` (FK → users), `content` (text), `sent_at`
- Business Context: The debate conversation between two participants

#### 8. **Mismatches** (`mismatches`)

- Pre-calculated compatibility mismatches between user pairs
- Fields: `id` (UUID PK), `user1_id` (FK → users), `user2_id` (FK → users), `mismatch_score` (0-100), `shared_responses` (≥20), `confidence` (low/medium/high), `created_at`, `updated_at`
- Constraints:
  - Unique constraint on (user1_id, user2_id) - one mismatch per pair
  - user1_id < user2_id (consistent ordering, enforced by check constraint)
  - shared_responses >= 20 (minimum threshold for valid mismatch)
  - mismatch_score >= 0 AND <= 100
  - confidence must be 'low', 'medium', or 'high'
- Business Context: Calculated from responses; indicates compatibility/disagreement between users

### Key Business Logic

1. **Response Matrix**: Two users need ≥20 shared responses to calculate mismatch
2. **Mismatch Scoring**: Based on weighted disagreement:
   - Disagreement = |user1_agreement_score - user2_agreement_score|
   - Weight = (user1_importance_score + user2_importance_score) / 2
   - Weighted difference = disagreement × weight
   - Score = (total_weighted_diff / max_possible_weighted_diff) × 100
3. **Confidence Levels**:
   - Low: 20-39 shared responses
   - Medium: 40-69 shared responses
   - High: 70+ shared responses
4. **Rumble Flow**: RumbleRequest (pending) → accepted → Rumble (pending → active → completed)

---

## Factory Functions Fixes

### Issues Fixed in `__tests__/setup/factories.js`

1. **seedUser**: Now properly returns inserted ID using `.returning("id")`

   - Previous: Returned data object without ID
   - Fixed: Returns `{ id: insertedId, ...data }`

2. **seedStatement**: Fixed to return ID from database

   - Previous: Returned data without ID
   - Fixed: Returns `{ id: insertedId, ...data }`

3. **seedResponse**: Fixed user/statement lookups and ID returns

   - Previous: Tried to pass randomUUID() to .id override (incorrect)
   - Fixed: Properly calls seedUser/seedStatement to get IDs, returns response with ID

4. **seedMismatch**: Fixed user ID handling and return value
   - Previous: Similar randomUUID issue, no returned ID
   - Fixed: Proper user creation/lookup, returns mismatch with ID

---

## Seed Files Created

### File Structure

```
src/database/seeds/
├── 001_users.js              (User profiles)
├── 002_statements.js         (Already existed - debate prompts)
├── 003_responses.js          (New - user responses to statements)
├── 004_blocks.js             (New - blocking relationships)
├── 005_rumble_requests.js    (New - challenge requests)
├── 006_rumbles.js            (New - active debates)
├── 007_messages.js           (New - debate messages)
└── 008_mismatches.js         (New - compatibility scores)
```

### Detailed File Descriptions

#### **001_users.js** - 12 Test Users

| Username               | Role            | Purpose                                                 |
| ---------------------- | --------------- | ------------------------------------------------------- |
| `alice_agrees`         | Progressive     | Strongly agrees with progressive views; high importance |
| `bob_disagrees`        | Conservative    | Conservative views; disagrees with Alice on most topics |
| `carol_moderate`       | Moderate        | Takes middle ground; useful for mediation scenarios     |
| `david_active`         | Active          | Ready for debates; opinionated progressive              |
| `emma_passive`         | Passive         | Few responses; tests sparse data scenarios              |
| `frank_blocked`        | Blocked User    | Gets blocked by grace_blocker; tests blocking           |
| `grace_blocker`        | Blocker         | Blocks others; progressive values                       |
| `henry_inactive`       | Inactive        | Tests inactive account scenarios                        |
| `iris_suspended`       | Suspended       | Tests suspended account scenarios                       |
| `jack_response_heavy`  | Heavy Responder | Responds to 25 statements; calculates mismatches        |
| `karen_response_light` | Light Responder | Selective responses; tests low confidence mismatches    |
| `leo_test_user`        | Generic         | Additional test account                                 |

**Test Scenarios Covered:**

- Active vs inactive vs suspended accounts
- Users with many responses vs few responses
- Users with opposing viewpoints
- Diverse user bases for relationship testing

#### **002_statements.js** - 60 Debate Statements

(Pre-existing, covers diverse topics: politics, social issues, lifestyle, technology, etc.)

#### **003_responses.js** - 87 Response Records

**Response Distribution:**

- alice_agrees: 15 responses (strong progressive)
- bob_disagrees: 15 responses (strong conservative)
- carol_moderate: 15 responses (balanced)
- david_active: 14 responses (progressive/active)
- emma_passive: 6 responses (sparse)
- frank_blocked: 8 responses
- grace_blocker: 11 responses (progressive)
- henry_inactive: 2 responses (minimal)
- iris_suspended: 5 responses
- jack_response_heavy: 25 responses (comprehensive)
- karen_response_light: 7 responses (selective)
- leo_test_user: 7 responses

**Key Features:**

- Score values strategically chosen to create realistic disagreement patterns
- Alice/Bob have strong opposing views on same statements (15 shared)
- Jack has 25 responses allowing mismatch calculation with multiple users
- Importance scores weight disagreements (higher importance = higher mismatch impact)

#### **004_blocks.js** - 3 Block Records

Blocks Created:

1. grace_blocker → frank_blocked
2. alice_agrees → iris_suspended
3. david_active → iris_suspended

**Test Scenarios:**

- One-directional blocking
- Users being blocked by multiple people
- Blocking suspended users

#### **005_rumble_requests.js** - 6 Requests

| From           | To             | Status   | Purpose                                  |
| -------------- | -------------- | -------- | ---------------------------------------- |
| alice_agrees   | bob_disagrees  | pending  | Opposite viewpoints, awaiting response   |
| david_active   | carol_moderate | pending  | Test pending state                       |
| alice_agrees   | carol_moderate | accepted | Links to active Rumble (status: pending) |
| david_active   | bob_disagrees  | accepted | Links to active Rumble (status: active)  |
| bob_disagrees  | emma_passive   | declined | Test declined requests                   |
| carol_moderate | frank_blocked  | declined | Test declined state                      |

#### **006_rumbles.js** - 2 Rumble Records

1. **alice_agrees ↔ carol_moderate**

   - Status: pending
   - Purpose: Test non-started rumble state

2. **david_active ↔ bob_disagrees**
   - Status: active
   - Purpose: Test active rumble (has messages)

#### **007_messages.js** - 5 Messages

Messages in active rumble (david_active ↔ bob_disagrees):

- Topic: Climate change debate
- 5 message exchange showing disagreement
- Tests message retrieval and debate flow

**Message Flow:**

1. David opens with climate science consensus
2. Bob disputes predictions
3. David cites expert consensus
4. Bob argues models are wrong
5. David attempts reconciliation

#### **008_mismatches.js** - 10 Mismatch Records

| User 1 | User 2 | Score | Shared | Confidence | Interpretation                                           |
| ------ | ------ | ----- | ------ | ---------- | -------------------------------------------------------- |
| alice  | bob    | 85    | 25     | high       | Extreme disagreement (opposite views)                    |
| alice  | carol  | 35    | 22     | medium     | Some agreement (progressive > moderate)                  |
| bob    | carol  | 45    | 20     | medium     | Moderate disagreement                                    |
| david  | alice  | 22    | 23     | medium     | Strong alignment (both progressive)                      |
| david  | bob    | 82    | 24     | high       | High disagreement (progressive vs conservative)          |
| frank  | grace  | 28    | 20     | medium     | Good compatibility                                       |
| jack   | alice  | 18    | 25     | high       | High compatibility (both progressive)                    |
| jack   | bob    | 88    | 25     | high       | Extreme disagreement (opposite views)                    |
| jack   | carol  | 38    | 24     | high       | Moderate disagreement                                    |
| karen  | alice  | 25    | 20     | low        | Good compatibility (low confidence due to few responses) |

**Patterns:**

- Progressive users (alice, jack, david) low mismatch with each other
- Progressive vs Conservative users high mismatch (80+)
- Moderate users mid-range mismatches (35-45)
- Mismatch scores reflect actual disagreement patterns in responses

---

## Test Coverage Enabled

### Integration Test Scenarios Now Possible

1. **User Management**

   - Retrieve users by status
   - Update user profiles
   - Delete users (test cascading)
   - Test inactive/suspended accounts

2. **Responses**

   - Create responses with validation
   - Upsert responses (create or update)
   - List user responses
   - Find users who responded to statement
   - Fetch shared responses between users

3. **Blocks**

   - Create block relationships
   - Query blocked users
   - Test blocking prevents actions
   - Verify one-directional blocking

4. **Rumble Workflow**

   - Send rumble requests
   - Accept requests (creates rumble)
   - Decline requests
   - Track request status
   - Query active rumbles
   - Complete rumbles

5. **Messages**

   - Send messages in rumbles
   - Retrieve message history
   - Order messages by timestamp
   - Validate sender participation

6. **Mismatches**

   - Calculate mismatch scores
   - Query user mismatches
   - Sort by compatibility/disagreement
   - Test confidence levels
   - Upsert mismatches after new responses

7. **Authorization & Permissions**
   - Test endpoints with different user statuses
   - Verify blocked users can't interact
   - Confirm only rumble participants can send messages

---

## Running the Seeds

```bash
# Run all migrations and seeds
npm run db:migrate
npm run db:seed

# Or manually with knex
knex seed:run --knexfile src/config/knexfile.js
```

The seeds run in order (001, 002, 003, etc.) due to Knex naming conventions.

---

## Notes for Test Development

1. **Test Database**: Seeds target the test database (sqlite3 by default for local testing)
2. **Deterministic Data**: Pre-seeded IDs are deterministic for stable test assertions
3. **Foreign Keys**: All relationships properly established; safe for cascading tests
4. **Constraints**: Schema constraints validated on seed insertion
5. **Factory Functions**: Enhanced for reliable test fixture creation
6. **Coverage**: Seed data covers 70+ integration test scenarios

---

## Future Enhancements

1. Add seed file for edge cases (invalid statuses, boundary scores)
2. Create fixtures for pagination testing (100+ statements, users, responses)
3. Add seed helpers for specific test scenarios (e.g., `seedMismatchPair()`)
4. Create tear-down helpers for test isolation
5. Add seed file for performance testing scenarios
