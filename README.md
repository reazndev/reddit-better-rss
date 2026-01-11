# Reddit RSS Feed Generator

A self-hosted Node.js application that converts Reddit subreddits into rich RSS feeds with full post content, images, and top comments.

**Live URL:** `https://rss.ruu.by`

## Features

*   **Full Content:** Fetches the full text and images/media for posts.
*   **Comments:** Includes the top comments (and nested replies) in the feed description.
*   **Smart Filtering:** Filter by score, flair, time, and sort order.
*   **Caching:** Built-in caching to respect Reddit's API limits.
*   **Dockerized:** Ready to deploy with Docker Compose.

## Quick Start (Docker)

1.  **Navigate to directory:**
    ```bash
    cd reddit
    ```

2.  **Start the service:**
    ```bash
    docker-compose up -d --build
    ```

    The service will be running on **port 3020**.

3.  **Reverse Proxy (Caddy/Nginx):**
    Configure your reverse proxy (e.g., Caddy) to point `rss.ruu.by` to `localhost:3020`.

    *Example Caddy config:*
    ```caddy
    rss.ruu.by {
        reverse_proxy localhost:3020
    }
    ```

## Usage

**Format:** `https://rss.ruu.by/<subreddit>`

### Examples
*   **Technology:** `https://rss.ruu.by/technology`
*   **Top of the Week:** `https://rss.ruu.by/worldnews?sort=top&time=week`
*   **High Quality Only:** `https://rss.ruu.by/dataisbeautiful?score=1000`
