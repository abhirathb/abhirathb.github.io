#!/usr/bin/env python3
"""
Convert markdown blog posts to HTML with proper formatting and metadata.
"""

import os
import re
import glob
from datetime import datetime
import markdown
import frontmatter

# HTML template for blog posts
HTML_TEMPLATE = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="{description}">
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
            margin-bottom: 2rem;
        }}
        .post-content {{
            line-height: 1.8;
        }}
        .post-content h2 {{
            font-size: 1.8rem;
            color: var(--primary-color);
            margin-top: 2.5rem;
            margin-bottom: 1rem;
        }}
        .post-content h3 {{
            font-size: 1.4rem;
            color: var(--primary-color);
            margin-top: 2rem;
            margin-bottom: 0.75rem;
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
                <div class="divider"></div>
            </div>

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


def convert_markdown_to_html(md_file_path):
    """Convert a markdown file to HTML using the blog post template."""
    print(f"Processing: {md_file_path}")

    # Read the markdown file with frontmatter
    with open(md_file_path, 'r', encoding='utf-8') as f:
        post = frontmatter.load(f)

    # Extract metadata from frontmatter
    title = post.get('title', 'Untitled Post')
    date = post.get('date', datetime.now().strftime('%B %d, %Y'))
    description = post.get('description', title)
    reading_time = post.get('reading_time', calculate_reading_time(post.content))

    # Convert date to readable format if it's a datetime object
    if isinstance(date, datetime):
        date = date.strftime('%B %d, %Y')

    # Convert markdown content to HTML
    md = markdown.Markdown(extensions=[
        'extra',      # Tables, fenced code blocks, etc.
        'codehilite', # Syntax highlighting
        'nl2br',      # Newline to <br>
        'sane_lists'  # Better list handling
    ])
    content_html = md.convert(post.content)

    # Indent the content for proper HTML formatting
    content_html = '\n'.join('                ' + line if line.strip() else ''
                              for line in content_html.split('\n'))

    # Fill in the template
    html_output = HTML_TEMPLATE.format(
        title=title,
        description=description,
        date=date,
        reading_time=reading_time,
        content=content_html,
        year=datetime.now().year
    )

    # Generate output file path (same name but .html extension)
    html_file_path = os.path.splitext(md_file_path)[0] + '.html'

    # Write the HTML file
    with open(html_file_path, 'w', encoding='utf-8') as f:
        f.write(html_output)

    print(f"✓ Generated: {html_file_path}")
    return html_file_path


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
    for md_file in md_files:
        try:
            html_file = convert_markdown_to_html(md_file)
            converted_files.append(html_file)
        except Exception as e:
            print(f"✗ Error processing {md_file}: {e}")
            continue

    print(f"\n✓ Successfully converted {len(converted_files)} file(s)")

    if converted_files:
        print("\nConverted files:")
        for f in converted_files:
            print(f"  - {f}")


if __name__ == '__main__':
    main()
