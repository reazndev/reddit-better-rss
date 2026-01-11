# Reddit RSS Feed with Comments

This is a simple Node.js server that generates RSS feeds for any Subreddit, including the post content and top comments.

## Usage

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Start the Server:**
    ```bash
    node index.js
    ```
    (Or use `npm start` if you add a start script)

3.  **Access Feed:**
    Open your RSS reader or browser and point it to:
    `http://3020/subreddit_name`

    Examples:
    *   `http://3020/technology`
    *   `http://3020/worldnews`
    *   `http://3020/r/programming`

## Features

*   **No API Key Required:** Uses Reddit's public JSON endpoints.
*   **Comments Included:** Fetches top 5 comments for each post and embeds them in the feed item description.
*   **Caching:** Caches feeds for 10 minutes to respect rate limits and improve speed.
*   **Media Support:** Embeds images and self-text content.

## Configuration

*   **Port:** Default is 3000. Set `PORT` environment variable to change.
