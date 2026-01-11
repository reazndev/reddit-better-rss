console.log("Starting server...");
const express = require('express');
const axios = require('axios');
const RSS = require('rss');
const NodeCache = require('node-cache');

const app = express();
const port = process.env.PORT || 3020;

// Cache for 10 minutes (600 seconds)
const cache = new NodeCache({ stdTTL: 600 });

// Helper to format comments into HTML with nesting
function formatComments(comments) {
    if (!comments || comments.length === 0) return '<p><em>No comments yet.</em></p>';

    let html = '<h3>Top Comments</h3><ul>';
    
    // Take top 5 top-level comments
    const topComments = comments.slice(0, 5);

    topComments.forEach(comment => {
        html += renderComment(comment);
    });
    
    html += '</ul>';
    return html;
}

// Recursive function to render a single comment and its replies
function renderComment(comment) {
    const data = comment.data;
    
    // Skip if it's a "more" object (Reddit pagination) or missing body
    if (!data.body) return '';

    let html = `
        <li style="margin-bottom: 10px; list-style-type: none; border-left: 2px solid #ddd; padding-left: 10px; margin-top: 10px;">
            <div style="font-size: 0.9em; color: #555;"><strong>/u/${data.author}</strong></div>
            <div style="margin-top: 5px;">${data.body_html ? decodeEntity(data.body_html) : data.body}</div>
    `;

    // Handle Replies
    if (data.replies && data.replies.data && data.replies.data.children) {
        const replies = data.replies.data.children;
        // Limit to 3 direct replies as requested
        const topReplies = replies.slice(0, 3);
        
        if (topReplies.length > 0) {
            html += '<ul style="padding-left: 0; margin-left: 10px;">';
            topReplies.forEach(reply => {
                html += renderComment(reply);
            });
            html += '</ul>';
        }
    }

    html += '</li>';
    return html;
}

// Simple HTML entity decoder
function decodeEntity(html) {
    return html.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
}

app.get('/:subreddit', async (req, res) => {
    let subreddit = req.params.subreddit;
    
    // Handle "r/subreddit" format if user provides it
    if (subreddit.startsWith('r/')) {
        subreddit = subreddit.substring(2);
    }

        // Strip extensions like .xml, .rss, or .json if present
        subreddit = subreddit.replace(/\.(xml|rss|json)$/, '');
    
        // Parameters
        const limit = parseInt(req.query.limit) || 10; // Default 10
        const sort = req.query.sort || 'hot'; // hot, new, top, rising
        const time = req.query.time || 'day'; // hour, day, week, month, year, all
    
        // Validate limit to prevent abuse/timeouts
        const finalLimit = Math.min(Math.max(limit, 1), 25); 
    
        const cacheKey = `rss_${subreddit}_${sort}_${time}_${finalLimit}`;
        const cachedFeed = cache.get(cacheKey);
    
        if (cachedFeed) {
            console.log(`Serving ${subreddit} (${sort}/${time}) from cache`);
            res.set('Content-Type', 'text/xml');
            return res.send(cachedFeed);
        }
    
        try {
            console.log(`Fetching ${subreddit} (${sort}/${time})...`);
            
            let apiUrl = `https://www.reddit.com/r/${subreddit}`;
            
            // Construct API URL based on sort
            if (['hot', 'new', 'top', 'rising'].includes(sort)) {
                apiUrl += `/${sort}`;
            }
            apiUrl += `/.json?limit=${finalLimit + 5}`; // Fetch slightly more to account for stickies/filters
    
            if (sort === 'top') {
                apiUrl += `&t=${time}`;
            }
    
            // 1. Fetch Subreddit Index
            const response = await axios.get(apiUrl, {
                headers: { 'User-Agent': 'BetterRSS/1.0' }
            });
    
            let posts = response.data.data.children.filter(p => !p.data.stickied);
    
            // Filter by Minimum Score (Upvotes)
            if (req.query.score) {
                const minScore = parseInt(req.query.score);
                if (!isNaN(minScore)) {
                    posts = posts.filter(p => p.data.score >= minScore);
                }
            }
    
            // Filter by Flair
            if (req.query.flair) {
                const flairFilter = req.query.flair.toLowerCase();
                posts = posts.filter(p => p.data.link_flair_text && p.data.link_flair_text.toLowerCase().includes(flairFilter));
            }
    
                    // Initialize RSS Feed (Minimal metadata)
                    const feed = new RSS({
                        title: `r/${subreddit} - ${sort}`,
                        description: `Reddit r/${subreddit} posts with comments`,
                        feed_url: `http://${req.headers.host}/${req.params.subreddit}`,
                        site_url: `https://www.reddit.com/r/${subreddit}`,
                        image_url: 'https://www.redditstatic.com/desktop2x/img/favicon/android-icon-192x192.png',
                        custom_namespaces: {
                            'content': 'http://purl.org/rss/1.0/modules/content/',
                            'media': 'http://search.yahoo.com/mrss/'
                        }
                    });    
            // 2. Process top X posts
            const topPosts = posts.slice(0, finalLimit);        
        const feedItems = await Promise.all(topPosts.map(async (postWrapper) => {
            const post = postWrapper.data;
            const postUrl = `https://www.reddit.com${post.permalink}`;
            
            // Format score with thousands separator
            const score = post.score.toLocaleString();
            let description = `<p><strong>&#8679; ${score}</strong> <span style="color:#666;">/u/${post.author}</span></p>`;
            
            // Add selftext or link preview
            if (post.selftext_html) {
                description += `<div>${decodeEntity(post.selftext_html)}</div>`;
            } 
            
            // Enhanced Image/Media Detection
            // Check post_hint OR file extension
            let isImage = post.post_hint === 'image' || (post.url && post.url.match(/\.(jpeg|jpg|gif|png)$/) != null);
            let imageUrl = null;

            // Priority 1: Direct Image URL
            if (isImage) {
                 imageUrl = post.url;
            }
            
            // Priority 2: High-Quality Preview (Works for external links too)
            if (!imageUrl && post.preview && post.preview.images && post.preview.images.length > 0) {
                const previewImage = post.preview.images[0].source.url;
                if (previewImage) {
                    imageUrl = decodeEntity(previewImage); // Reddit URLs are often escaped
                    isImage = true; // Treat as image for rendering purposes
                }
            }

            if (imageUrl) {
                 // Only add to description if we haven't already added it (avoid duplicates)
                 if (!description.includes(imageUrl)) {
                    description += `<img src="${imageUrl}" alt="${post.title}" style="max-width:100%; display:block; margin: 10px 0;" />`;
                 }
            } else if (post.url && !post.url.includes(post.permalink)) {
                // External link that isn't an image (e.g. article)
                description += `<p><a href="${post.url}">Direct Link to Content: ${post.url}</a></p>`;
            }

            // Determine Thumbnail
            let thumbnailUrl = null;
            if (post.thumbnail && post.thumbnail.startsWith('http')) {
                thumbnailUrl = post.thumbnail;
            } else if (imageUrl) {
                // Use the main image as thumbnail if no specific thumbnail exists
                thumbnailUrl = imageUrl;
            }

            try {
                // 3. Fetch Comments for this post
                // We add ?sort=top to get the best comments
                const commentRes = await axios.get(`${postUrl}.json?sort=top`, {
                    headers: { 'User-Agent': 'BetterRSS/1.0' }
                });

                // Reddit returns an array: [0] is post info, [1] is comments
                const comments = commentRes.data[1].data.children;
                description += formatComments(comments);

            } catch (err) {
                console.error(`Error fetching comments for ${post.id}: ${err.message}`);
                description += '<p><em>Could not load comments.</em></p>';
            }

            const item = {
                title: post.title,
                description: description,
                url: postUrl,
                author: post.author,
                date: new Date(post.created_utc * 1000),
                custom_elements: [
                    { 'content:encoded': description }
                ]
            };

            // Add Media elements for preview
            if (imageUrl) {
                item.enclosure = { url: imageUrl };
                item.custom_elements.push({
                    'media:content': {
                        _attr: { url: imageUrl, medium: 'image' }
                    }
                });
            }
            
            if (thumbnailUrl) {
                item.custom_elements.push({
                    'media:thumbnail': {
                        _attr: { url: thumbnailUrl }
                    }
                });
            }

            return item;
        }));

        feedItems.forEach(item => feed.item(item));

        const xml = feed.xml();
        cache.set(cacheKey, xml);

        res.set('Content-Type', 'text/xml');
        res.send(xml);

    } catch (error) {
        console.error(error);
        if (error.response && error.response.status === 404) {
             return res.status(404).send('Subreddit not found or private.');
        }
        res.status(500).send('Error generating feed');
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
    console.log(`To access from other devices, use your LAN IP (e.g., http://192.168.1.X:${port}/technology)`);
});
