# Reddit RSS Feed with Comments - Project Plan

## Objective
Create a custom RSS feed generator for Reddit that includes post content and comments, accessible via a URL structure. This version will use Reddit's public `.json` endpoints to avoid API key registration.

## Architecture
- **Language/Framework:** Node.js with Express
- **Data Source:** Reddit Public JSON API (no key required)
- **Output:** XML RSS Feed

## Todo List

### 1. Initial Setup
- [ ] Initialize project (`npm init -y`)
- [ ] Install dependencies:
    - `express`: Web server
    - `axios`: For fetching JSON data
    - `rss`: RSS feed generator
- [ ] Create `.gitignore`

### 2. Implementation
- [ ] **Server Setup:** Basic Express server.
- [ ] **Data Fetching Logic:**
    - [ ] Fetch subreddit data: `https://www.reddit.com/r/[subreddit]/.json`
    - [ ] For each post, fetch comment data: `https://www.reddit.com/comments/[id]/.json`
- [ ] **Data Parsing:**
    - [ ] Extract post body (selftext or link).
    - [ ] Extract top comments and format them into HTML.
- [ ] **RSS Generation:**
    - [ ] Map the combined data to RSS items.
- [ ] **Routing:**
    - [ ] Route: `GET /:subreddit`

### 3. Caching
- [ ] Implement a simple in-memory cache to stay within public rate limits.

### 4. Verification
- [ ] Test with `r/technology` or `r/programming`.
- [ ] Validate XML output.
