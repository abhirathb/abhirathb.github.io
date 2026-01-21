#!/usr/bin/env python3
"""
Auto-update index.html with new blog posts from posts_metadata.json
"""

import os
import json
import re
from datetime import datetime

def parse_date(date_str):
    """Parse date string to datetime object for sorting."""
    try:
        # Try common formats
        for fmt in ['%B %d, %Y', '%Y-%m-%d', '%b %d, %Y']:
            try:
                return datetime.strptime(date_str, fmt)
            except ValueError:
                continue
        # If parsing fails, return current date
        return datetime.now()
    except:
        return datetime.now()


def generate_blog_card_html(post):
    """Generate HTML for a single blog card."""
    # Truncate description if too long
    description = post['description']
    if len(description) > 300:
        description = description[:300] + '...'

    # Check if this is an external link (like Substack)
    is_external = post.get('external_link', False)
    link = post.get('link', f"posts/{post['filename']}")
    link_attrs = ''

    if is_external:
        link_attrs = ' target="_blank" rel="noopener noreferrer"'

    # Generate tags if available
    tags_html = ''
    if post.get('tags'):
        tags_html = '\n                        <div style="margin-top: 0.5rem;">\n'
        for tag in post['tags'][:3]:  # Limit to 3 tags
            tags_html += f'                            <span style="display: inline-block; padding: 0.2rem 0.5rem; background-color: #e9ecef; border-radius: 10px; font-size: 0.75rem; margin-right: 0.3rem;">{tag}</span>\n'
        tags_html += '                        </div>'

    html = f'''                <article class="blog-card">
                    <div class="blog-header">
                        <h3>{post['title']}</h3>
                        <div class="blog-meta">
                            <span class="date">{post['date']}</span>
                            <span class="reading-time">{post['reading_time']} min read</span>
                        </div>{tags_html}
                    </div>
                    <div class="blog-excerpt">
                        <p>{description}</p>
                    </div>
                    <a href="{link}" class="read-more"{link_attrs}>Read more →</a>
                </article>
'''
    return html


def update_index_html():
    """Update index.html with posts from posts_metadata.json."""
    print("Updating index.html with blog posts...")

    # Check if metadata file exists
    if not os.path.exists('posts_metadata.json'):
        print("⚠ posts_metadata.json not found, skipping index update")
        return

    # Load posts metadata
    with open('posts_metadata.json', 'r', encoding='utf-8') as f:
        posts = json.load(f)

    if not posts:
        print("⚠ No posts in metadata, skipping index update")
        return

    # Sort posts by date (newest first)
    posts.sort(key=lambda x: parse_date(x['date']), reverse=True)

    print(f"Found {len(posts)} posts to add to index")

    # Read current index.html
    if not os.path.exists('index.html'):
        print("✗ index.html not found!")
        return

    with open('index.html', 'r', encoding='utf-8') as f:
        index_content = f.read()

    # Generate blog cards HTML
    blog_cards_html = ''
    for post in posts:
        blog_cards_html += generate_blog_card_html(post)

    # Add the Substack card (hardcoded as it's special)
    substack_card = '''                <article class="blog-card">
                    <div class="blog-header">
                        <h3>Organisation of posts</h3>
                        <div class="blog-meta">
                            <span class="date">April 28, 2022</span>
                            <span class="reading-time">1 min read</span>
                        </div>
                    </div>
                    <div class="blog-excerpt">
                        <p>This is how posts are organised on this site:</p>
                        <ol>
                            <li>Substack contains regularly written newsletter.</li>
                            <li>Older posts are in Archive</li>
                            <li>This section is for things that I want to be more permanent and not lost in the serialised nature of a newsletter.</li>
                        </ol>
                    </div>
                    <a href="https://abhirathb.substack.com" class="read-more" target="_blank" rel="noopener noreferrer">Visit Substack →</a>
                </article>
'''
    blog_cards_html += substack_card

    # Find and replace the blog-grid section
    # Pattern: <div class="blog-grid"> ... </div> (before </div></section>)
    pattern = r'(<div class="blog-grid">)(.*?)(</div>\s*</div>\s*</section>)'

    # Check if pattern exists
    if not re.search(pattern, index_content, re.DOTALL):
        print("✗ Could not find blog-grid section in index.html")
        return

    # Replace the blog-grid content
    new_content = re.sub(
        pattern,
        rf'\1\n{blog_cards_html}            \3',
        index_content,
        flags=re.DOTALL
    )

    # Write back to index.html
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(new_content)

    print("✓ Successfully updated index.html with blog posts")


def main():
    """Main function."""
    update_index_html()


if __name__ == '__main__':
    main()
