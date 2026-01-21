#!/usr/bin/env python3
"""
Auto-update index.html with new blog posts from posts_metadata.json
Preserves existing posts and merges with new posts from markdown conversions
"""

import os
import json
import re
from datetime import datetime
from bs4 import BeautifulSoup

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


def extract_existing_posts(index_content):
    """Extract existing blog posts from index.html."""
    existing_posts = []

    # Parse HTML
    soup = BeautifulSoup(index_content, 'html.parser')
    blog_grid = soup.find('div', class_='blog-grid')

    if not blog_grid:
        print("⚠ Could not find blog-grid in index.html")
        return existing_posts

    # Find all blog cards
    cards = blog_grid.find_all('article', class_='blog-card')

    for card in cards:
        try:
            header = card.find('div', class_='blog-header')
            if not header:
                continue

            title_elem = header.find('h3')
            title = title_elem.get_text(strip=True) if title_elem else 'Untitled'

            # Extract metadata
            meta = header.find('div', class_='blog-meta')
            date = 'Unknown'
            reading_time = 0

            if meta:
                date_elem = meta.find('span', class_='date')
                if date_elem:
                    date = date_elem.get_text(strip=True)

                time_elem = meta.find('span', class_='reading-time')
                if time_elem:
                    time_text = time_elem.get_text(strip=True)
                    # Extract number from "X min read"
                    match = re.search(r'(\d+)', time_text)
                    if match:
                        reading_time = int(match.group(1))

            # Extract description
            excerpt = card.find('div', class_='blog-excerpt')
            description = ''
            if excerpt:
                # Get all text content
                description = excerpt.get_text(separator=' ', strip=True)

            # Extract link
            link_elem = card.find('a', class_='read-more')
            link = ''
            is_external = False
            filename = ''

            if link_elem:
                link = link_elem.get('href', '')
                is_external = link.startswith('http')

                if not is_external and link.startswith('posts/'):
                    filename = link.replace('posts/', '')

            # Extract tags if present
            tags = []
            tags_div = header.find('div', style=lambda x: x and 'margin-top' in x)
            if tags_div:
                tag_spans = tags_div.find_all('span')
                tags = [span.get_text(strip=True) for span in tag_spans]

            # Create post dict
            post = {
                'title': title,
                'date': date,
                'reading_time': reading_time,
                'description': description,
                'tags': tags,
                'filename': filename,
                'link': link,
                'external_link': is_external
            }

            existing_posts.append(post)

        except Exception as e:
            print(f"⚠ Error parsing blog card: {e}")
            continue

    print(f"Found {len(existing_posts)} existing posts in index.html")
    return existing_posts


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


def merge_posts(existing_posts, new_posts):
    """Merge existing posts with new posts, removing duplicates."""
    # Create a dict for quick lookup by filename
    merged_dict = {}

    # Add existing posts first
    for post in existing_posts:
        key = post.get('filename') or post.get('title')  # Use filename or title as key
        if key:
            merged_dict[key] = post

    # Add/update with new posts (they take precedence)
    for post in new_posts:
        key = post.get('filename') or post.get('title')
        if key:
            merged_dict[key] = post

    # Convert back to list
    merged_posts = list(merged_dict.values())

    print(f"Merged {len(existing_posts)} existing + {len(new_posts)} new = {len(merged_posts)} total posts")

    return merged_posts


def update_index_html():
    """Update index.html with posts from posts_metadata.json."""
    print("Updating index.html with blog posts...")

    # Read current index.html
    if not os.path.exists('index.html'):
        print("✗ index.html not found!")
        return

    with open('index.html', 'r', encoding='utf-8') as f:
        index_content = f.read()

    # Extract existing posts from index.html
    existing_posts = extract_existing_posts(index_content)

    # Load new posts from metadata if available
    new_posts = []
    if os.path.exists('posts_metadata.json'):
        with open('posts_metadata.json', 'r', encoding='utf-8') as f:
            new_posts = json.load(f)
        print(f"Found {len(new_posts)} new posts from markdown conversion")
    else:
        print("⚠ posts_metadata.json not found, only using existing posts")

    # Merge existing and new posts
    all_posts = merge_posts(existing_posts, new_posts)

    if not all_posts:
        print("⚠ No posts to add to index")
        return

    # Sort posts by date (newest first)
    all_posts.sort(key=lambda x: parse_date(x['date']), reverse=True)

    # Generate blog cards HTML
    blog_cards_html = ''
    for post in all_posts:
        blog_cards_html += generate_blog_card_html(post)

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
