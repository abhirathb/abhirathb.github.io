#!/usr/bin/env python3
"""
Convert markdown blog posts to HTML with proper formatting and metadata.
Features: Draft support, Table of Contents, Tags/Categories
"""

import os
import re
import glob
import json
from datetime import datetime
import markdown
import frontmatter
from collections import defaultdict

# HTML template for blog posts
HTML_TEMPLATE = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="{description}">
    <meta name="keywords" content="{keywords}">
    <title>{title} | Abhirath Batra</title>
    <link rel="stylesheet" href="../css/styles.css">
    <style>
        .post-container {{
            max-width: 800px;
            margin: 100px auto 60px;
            padding: 0 20px;
        }}
        .post-header {{
            margin-bottom: 2rem;
        }}
        .post-title {{
            font-size: 2.5rem;
            color: var(--primary-color);
            margin-bottom: 1rem;
            line-height: 1.2;
        }}
        .post-meta {{
            display: flex;
            gap: 1.5rem;
            color: var(--text-light);
            font-size: 0.95rem;
            margin-bottom: 1rem;
            flex-wrap: wrap;
        }}
        .post-tags {{
            display: flex;
            gap: 0.5rem;
            margin-bottom: 2rem;
            flex-wrap: wrap;
        }}
        .tag {{
            display: inline-block;
            padding: 0.25rem 0.75rem;
            background-color: var(--border-color);
            color: var(--text-color);
            border-radius: 15px;
            font-size: 0.85rem;
            text-decoration: none;
            transition: background-color 0.2s;
        }}
        .tag:hover {{
            background-color: var(--secondary-color);
            color: white;
        }}
        .toc {{
            background-color: #f8f9fa;
            border-left: 4px solid var(--secondary-color);
            padding: 1.5rem;
            margin: 2rem 0;
            border-radius: 5px;
        }}
        .toc-title {{
            font-size: 1.2rem;
            font-weight: 600;
            color: var(--primary-color);
            margin-bottom: 1rem;
        }}
        .toc ul {{
            list-style: none;
            padding-left: 0;
            margin: 0;
        }}
        .toc ul ul {{
            padding-left: 1.5rem;
            margin-top: 0.5rem;
        }}
        .toc li {{
            margin-bottom: 0.5rem;
        }}
        .toc a {{
            color: var(--text-color);
            text-decoration: none;
            border-bottom: none;
            transition: color 0.2s;
        }}
        .toc a:hover {{
            color: var(--secondary-color);
        }}
        .post-content {{
            line-height: 1.8;
        }}
        .post-content h2 {{
            font-size: 1.8rem;
            color: var(--primary-color);
            margin-top: 2.5rem;
            margin-bottom: 1rem;
            scroll-margin-top: 100px;
        }}
        .post-content h3 {{
            font-size: 1.4rem;
            color: var(--primary-color);
            margin-top: 2rem;
            margin-bottom: 0.75rem;
            scroll-margin-top: 100px;
        }}
        .post-content p {{
            margin-bottom: 1.5rem;
        }}
        .post-content img {{
            max-width: 100%;
            height: auto;
            margin: 2rem 0;
            border-radius: 8px;
        }}
        .post-content a {{
            color: var(--secondary-color);
            text-decoration: none;
            border-bottom: 1px solid var(--secondary-color);
        }}
        .post-content a:hover {{
            color: var(--accent-color);
            border-bottom-color: var(--accent-color);
        }}
        .post-content ol, .post-content ul {{
            margin: 1.5rem 0;
            padding-left: 2rem;
        }}
        .post-content li {{
            margin-bottom: 0.75rem;
        }}
        .post-content hr {{
            border: none;
            border-top: 2px solid var(--border-color);
            margin: 2rem 0;
        }}
        .post-content strong {{
            font-weight: 600;
            color: var(--primary-color);
        }}
        .post-content code {{
            background-color: #f4f4f4;
            padding: 0.2em 0.4em;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
        }}
        .post-content pre {{
            background-color: #f4f4f4;
            padding: 1em;
            border-radius: 5px;
            overflow-x: auto;
            margin: 1.5rem 0;
        }}
        .post-content pre code {{
            background-color: transparent;
            padding: 0;
        }}
        .post-content blockquote {{
            border-left: 4px solid var(--secondary-color);
            padding-left: 1.5rem;
            margin: 1.5rem 0;
            color: var(--text-light);
            font-style: italic;
        }}
        .back-link {{
            display: inline-block;
            margin-bottom: 2rem;
            color: var(--secondary-color);
            text-decoration: none;
            font-weight: 500;
        }}
        .back-link:hover {{
            color: var(--accent-color);
        }}
        @media (max-width: 768px) {{
            .post-title {{
                font-size: 2rem;
            }}
        }}
    </style>
</head>
<body>
    <nav class="navbar">
        <div class="container">
            <div class="nav-brand">
                <a href="../index.html">Abhirath Batra</a>
            </div>
        </div>
    </nav>

    <div class="post-container">
        <a href="../index.html#blogs" class="back-link">← Back to Blogs</a>

        <article>
            <div class="post-header">
                <h1 class="post-title">{title}</h1>
                <div class="post-meta">
                    <span>{date}</span>
                    <span>{reading_time} min read</span>
                </div>
                {tags_html}
                <div class="divider"></div>
            </div>

            {toc_html}

            <div class="post-content">
{content}
            </div>
        </article>

        <div style="margin-top: 3rem; padding-top: 2rem; border-top: 1px solid var(--border-color);">
            <a href="../index.html#blogs" class="back-link">← Back to Blogs</a>
        </div>
    </div>

    <footer class="footer">
        <div class="container">
            <p>&copy; {year} Abhirath Batra. Built with HTML, CSS, and JavaScript.</p>
        </div>
    </footer>
</body>
</html>
'''


def calculate_reading_time(text):
    """Calculate reading time based on average reading speed of 200 words per minute."""
    words = len(text.split())
    minutes = max(1, round(words / 200))
    return minutes


def slugify(text):
    """Convert text to URL-friendly slug."""
    text = text.lower()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    return text.strip('-')


def extract_headings(content):
    """Extract h2 and h3 headings from markdown content."""
    headings = []
    lines = content.split('\n')

    for line in lines:
        # Match ## Heading (h2) or ### Heading (h3)
        match = re.match(r'^(#{2,3})\s+(.+)$', line.strip())
        if match:
            level = len(match.group(1))
            text = match.group(2).strip()
            slug = slugify(text)
            headings.append({
                'level': level,
                'text': text,
                'slug': slug
            })

    return headings


def generate_toc(headings):
    """Generate HTML table of contents from headings."""
    if len(headings) < 3:  # Only generate TOC if 3+ headings
        return ''

    toc_html = '<div class="toc">\n'
    toc_html += '                <div class="toc-title">Table of Contents</div>\n'
    toc_html += '                <ul>\n'

    current_level = 2
    for heading in headings:
        level = heading['level']

        # Handle nesting
        if level > current_level:
            toc_html += '                    <ul>\n'
        elif level < current_level:
            toc_html += '                    </ul>\n'

        toc_html += f'                    <li><a href="#{heading["slug"]}">{heading["text"]}</a></li>\n'
        current_level = level

    # Close any open nested lists
    if current_level > 2:
        toc_html += '                    </ul>\n'

    toc_html += '                </ul>\n'
    toc_html += '            </div>\n'

    return toc_html


def add_heading_ids(content_html, headings):
    """Add IDs to headings in HTML content for anchor links."""
    for heading in headings:
        # Pattern for h2 or h3 tags
        pattern = rf'(<h{heading["level"]}>)({re.escape(heading["text"])})(</h{heading["level"]}>)'
        replacement = rf'\1<span id="{heading["slug"]}"></span>\2\3'
        content_html = re.sub(pattern, replacement, content_html, count=1)

    return content_html


def generate_tags_html(tags):
    """Generate HTML for post tags."""
    if not tags:
        return ''

    tags_html = '<div class="post-tags">\n'
    for tag in tags:
        slug = slugify(tag)
        tags_html += f'                    <a href="../categories/{slug}.html" class="tag">{tag}</a>\n'
    tags_html += '                </div>'

    return tags_html


def convert_markdown_to_html(md_file_path, all_posts_metadata):
    """Convert a markdown file to HTML using the blog post template."""
    print(f"Processing: {md_file_path}")

    # Read the markdown file with frontmatter
    with open(md_file_path, 'r', encoding='utf-8') as f:
        post = frontmatter.load(f)

    # Check if this is a draft
    if post.get('draft', False):
        print(f"⊘ Skipping draft: {md_file_path}")
        return None

    # Extract metadata from frontmatter
    title = post.get('title', 'Untitled Post')
    date = post.get('date', datetime.now().strftime('%B %d, %Y'))
    description = post.get('description', title)
    reading_time = post.get('reading_time', calculate_reading_time(post.content))
    tags = post.get('tags', [])

    # Ensure tags is a list
    if isinstance(tags, str):
        tags = [t.strip() for t in tags.split(',')]

    # Convert date to readable format if it's a datetime object
    if isinstance(date, datetime):
        date = date.strftime('%B %d, %Y')

    # Extract headings for table of contents
    headings = extract_headings(post.content)
    toc_html = generate_toc(headings)

    # Convert markdown content to HTML
    md = markdown.Markdown(extensions=[
        'extra',      # Tables, fenced code blocks, etc.
        'codehilite', # Syntax highlighting
        'nl2br',      # Newline to <br>
        'sane_lists'  # Better list handling
    ])
    content_html = md.convert(post.content)

    # Add IDs to headings for TOC links
    content_html = add_heading_ids(content_html, headings)

    # Generate tags HTML
    tags_html = generate_tags_html(tags)

    # Indent the content for proper HTML formatting
    content_html = '\n'.join('                ' + line if line.strip() else ''
                              for line in content_html.split('\n'))

    # Create keywords for meta tags
    keywords = ', '.join(tags) if tags else title

    # Fill in the template
    html_output = HTML_TEMPLATE.format(
        title=title,
        description=description,
        keywords=keywords,
        date=date,
        reading_time=reading_time,
        tags_html=tags_html,
        toc_html=toc_html,
        content=content_html,
        year=datetime.now().year
    )

    # Generate output file path (same name but .html extension)
    html_file_path = os.path.splitext(md_file_path)[0] + '.html'
    filename = os.path.basename(html_file_path)

    # Write the HTML file
    with open(html_file_path, 'w', encoding='utf-8') as f:
        f.write(html_output)

    print(f"✓ Generated: {html_file_path}")

    # Store metadata for index updates and category pages
    all_posts_metadata.append({
        'title': title,
        'description': description,
        'date': date,
        'reading_time': reading_time,
        'tags': tags,
        'filename': filename,
        'html_path': html_file_path
    })

    return html_file_path


def generate_category_pages(all_posts_metadata):
    """Generate category pages for each tag."""
    # Group posts by tag
    tags_dict = defaultdict(list)
    for post in all_posts_metadata:
        for tag in post['tags']:
            tags_dict[tag].append(post)

    if not tags_dict:
        print("\nNo tags found, skipping category page generation")
        return

    # Create categories directory
    os.makedirs('categories', exist_ok=True)

    print(f"\nGenerating category pages for {len(tags_dict)} categories...")

    for tag, posts in tags_dict.items():
        slug = slugify(tag)
        category_path = f'categories/{slug}.html'

        # Sort posts by date (newest first)
        posts.sort(key=lambda x: x['date'], reverse=True)

        # Generate posts HTML
        posts_html = ''
        for post in posts:
            posts_html += f'''                <article class="blog-card">
                    <div class="blog-header">
                        <h3>{post['title']}</h3>
                        <div class="blog-meta">
                            <span class="date">{post['date']}</span>
                            <span class="reading-time">{post['reading_time']} min read</span>
                        </div>
                    </div>
                    <div class="blog-excerpt">
                        <p>{post['description']}</p>
                    </div>
                    <a href="../posts/{post['filename']}" class="read-more">Read more →</a>
                </article>\n\n'''

        # Generate category page HTML
        category_html = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Posts tagged with {tag}">
    <title>{tag} | Abhirath Batra</title>
    <link rel="stylesheet" href="../css/styles.css">
</head>
<body>
    <nav class="navbar">
        <div class="container">
            <div class="nav-brand">
                <a href="../index.html">Abhirath Batra</a>
            </div>
        </div>
    </nav>

    <section class="section" style="padding-top: 120px;">
        <div class="container">
            <a href="../index.html#blogs" style="display: inline-block; margin-bottom: 2rem; color: var(--secondary-color); text-decoration: none;">← Back to Blogs</a>
            <h2>Posts tagged with "{tag}"</h2>
            <div class="divider"></div>
            <p style="color: var(--text-light); margin-bottom: 2rem;">{len(posts)} post{'s' if len(posts) != 1 else ''}</p>

            <div class="blog-grid">
{posts_html}            </div>
        </div>
    </section>

    <footer class="footer">
        <div class="container">
            <p>&copy; {datetime.now().year} Abhirath Batra. Built with HTML, CSS, and JavaScript.</p>
        </div>
    </footer>
</body>
</html>
'''

        # Write category page
        with open(category_path, 'w', encoding='utf-8') as f:
            f.write(category_html)

        print(f"✓ Generated category page: {category_path} ({len(posts)} posts)")

    # Save metadata for index update script
    with open('posts_metadata.json', 'w', encoding='utf-8') as f:
        json.dump(all_posts_metadata, f, indent=2)
    print("✓ Saved posts metadata to posts_metadata.json")


def main():
    """Main function to process all markdown files in posts/ directory."""
    # Find all markdown files in posts/ directory
    md_files = glob.glob('posts/*.md')

    if not md_files:
        print("No markdown files found in posts/ directory")
        return

    print(f"Found {len(md_files)} markdown file(s) to convert\n")

    # Convert each markdown file
    converted_files = []
    all_posts_metadata = []

    for md_file in md_files:
        try:
            html_file = convert_markdown_to_html(md_file, all_posts_metadata)
            if html_file:  # None if draft
                converted_files.append(html_file)
        except Exception as e:
            print(f"✗ Error processing {md_file}: {e}")
            import traceback
            traceback.print_exc()
            continue

    print(f"\n✓ Successfully converted {len(converted_files)} file(s)")

    if converted_files:
        print("\nConverted files:")
        for f in converted_files:
            print(f"  - {f}")

    # Generate category pages
    if all_posts_metadata:
        generate_category_pages(all_posts_metadata)


if __name__ == '__main__':
    main()
