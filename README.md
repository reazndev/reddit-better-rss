# Reddit RSS Feed with Comments

This is a robust Node.js server that generates RSS feeds for any Subreddit, including full post content, images, and nested top comments.

## Usage

### Local Setup
1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Start the Server:**
    ```bash
    npm start
    ```

3.  **Access Feed:**
    `http://localhost:3020/subreddit_name`

### Docker Setup
1.  **Run with Docker Compose:**
    ```bash
    docker-compose up -d
    ```
    The server will be available at `http://localhost:3020`.

## Advanced Query Parameters

You can customize your feed by adding query parameters to the URL:

| Parameter | Options | Description |
| :--- | :--- | :--- |
| `limit` | `1` to `25` | Number of posts to fetch (Default: `10`). |
| `sort` | `hot`, `new`, `top`, `rising` | How to sort the posts (Default: `hot`). |
| `time` | `hour`, `day`, `week`, `month`, `year`, `all` | Time filter for `top` sort (Default: `day`). |
| `score` | Number (e.g., `500`) | Filter out posts with a score lower than this. |
| `flair` | String (e.g., `News`) | Filter posts by a specific flair (case-insensitive). |

### Examples:
*   **Top 5 tech posts of the week:**
    `http://localhost:3020/technology?sort=top&time=week&limit=5`
*   **Only high-score posts from r/worldnews:**
    `http://localhost:3020/worldnews?score=1000`
*   **Filter by Flair:**
    `http://localhost:3020/gaming?flair=official`

## Features

*   **No API Key Required:** Uses Reddit's public JSON endpoints.
*   **Nested Comments:** Fetches the top 5 comments and up to 3 nested replies for each, providing a rich reading experience.
*   **Media Support:** Automatically detects and embeds high-quality images and preview thumbnails.
*   **Caching:** Caches results for 10 minutes to ensure performance and avoid rate limiting.
*   **Robust Parsing:** Decodes HTML entities for clean readability in all RSS readers.

## Configuration

*   **Port:** The application runs on port `3020`. You can change this via the `PORT` environment variable.
