# Markdown to HTML Workflow

This workflow automatically converts markdown blog posts to HTML when changes are merged from `addcont/*` branches.

## How It Works

1. **Create a branch**: Branch name must start with `addcont/` (e.g., `addcont/my-new-post`)
2. **Write your post**: Create or edit `.md` files in the `posts/` directory
3. **Use frontmatter**: Add metadata at the top of your markdown file
4. **Create a PR**: Submit a pull request to merge into main/master
5. **Merge**: When merged, the workflow automatically generates HTML files
6. **Automatic commit**: The HTML files are committed back to the main branch

## Frontmatter Format

At the top of your markdown file, include:

```yaml
---
title: "Your Post Title"
date: "January 20, 2026"
description: "Brief description for SEO"
reading_time: 5
tags: ["Technology", "Tutorial"]
draft: false
---
```

### Fields

- **title** (required): Post title
- **date** (optional): Publication date - defaults to current date
- **description** (optional): Meta description - defaults to title
- **reading_time** (optional): Minutes to read - auto-calculated if omitted
- **tags** (optional): List of tags/categories - enables category pages
- **draft** (optional): Set to `true` to skip HTML generation

## Example Workflow

```bash
# Create a new branch
git checkout -b addcont/my-awesome-post

# Create your markdown file
cat > posts/my-awesome-post.md << 'EOF'
---
title: "My Awesome Post"
date: "January 20, 2026"
description: "This is an awesome post about something cool"
---

# My Awesome Post

Your content here...
EOF

# Commit and push
git add posts/my-awesome-post.md
git commit -m "Add new blog post: My Awesome Post"
git push origin addcont/my-awesome-post

# Create PR and merge
gh pr create --title "New post: My Awesome Post" --body "Adding a new blog post"
```

After merging, the workflow will:
1. Generate `posts/my-awesome-post.html`
2. Create category pages in `categories/` for any tags used
3. Update `index.html` to include the new post in the blog grid
4. Commit all changes back to the main branch

## Features

- ✅ Automatic HTML generation from markdown
- ✅ Frontmatter metadata support
- ✅ Auto-calculated reading time
- ✅ Syntax highlighting for code blocks
- ✅ Support for tables, lists, images, and more
- ✅ Update existing posts by editing the markdown file
- ✅ Consistent styling matching your site design
- ✅ **Draft support** - Skip HTML generation for drafts
- ✅ **Auto-generated Table of Contents** - For posts with 3+ headings
- ✅ **Tags/Categories** - Organize posts with tags
- ✅ **Category pages** - Auto-generated pages for each tag
- ✅ **Auto-update index.html** - Blog grid updates automatically

## Advanced Features

### Draft Support

Work on posts without publishing:

```yaml
---
title: "Work in Progress"
draft: true
---
```

Posts with `draft: true` are completely skipped during HTML generation. This allows you to:
- Store unfinished posts in the repo
- Collaborate on drafts before publishing
- Version control your writing process

When ready to publish, simply change `draft: false` and merge.

### Table of Contents

For longer posts, a table of contents is automatically generated when your post has **3 or more headings**:

```markdown
## Section 1
Content...

## Section 2
Content...

### Subsection 2.1
Details...
```

The TOC:
- Appears before your content in a styled box
- Includes clickable anchor links to each section
- Supports nested headings (h2 and h3)
- Uses smooth scrolling

### Tags and Categories

Organize your posts with tags:

```yaml
---
title: "My Post"
tags: ["Python", "Web Development", "Tutorial"]
---
```

Benefits:
- Tags appear as clickable pills on your post
- Category pages are auto-generated for each unique tag
- Clicking a tag shows all posts with that tag
- Tags become meta keywords for SEO
- Helps readers discover related content

Category pages are created at `categories/{tag-slug}.html` and include all posts with that tag, sorted by date.

### Auto-Update Index

The `index.html` file is automatically updated with new posts:
- Posts are sorted by date (newest first)
- Blog cards include title, date, excerpt, and reading time
- Tags are displayed on each card (up to 3)
- External links (like Substack) are preserved
- No manual editing required!

## File Structure

```
.github/
├── workflows/
│   ├── markdown-to-html.yml    # Main workflow file
│   └── README.md               # This file
├── scripts/
│   ├── convert_md_to_html.py   # Conversion script
│   └── update_index.py         # Index updater script
└── BLOG_POST_TEMPLATE.md       # Template for new posts

categories/                      # Auto-generated category pages
posts_metadata.json             # Metadata for index updates
```

## Troubleshooting

### Workflow doesn't trigger

- Ensure your branch name starts with `addcont/`
- Check that you're modifying files in the `posts/` directory
- Verify the markdown files have `.md` extension

### HTML not generated

- Check the Actions tab in GitHub for error logs
- Verify your frontmatter YAML syntax is correct
- Ensure required dependencies are installed (handled automatically)
- Check if `draft: true` is set (drafts are intentionally skipped)

### Wrong metadata in HTML

- Check your frontmatter formatting
- Dates should be strings in quotes
- YAML requires proper indentation
- Tags should be a list: `["tag1", "tag2"]`

### Table of Contents not appearing

- Ensure you have at least 3 headings (## or ###)
- Check that headings use proper markdown syntax
- Headings must be h2 (##) or h3 (###), not h1 (#)

### Category pages broken

- Verify tags are properly formatted in frontmatter
- Check that tag names don't contain special characters
- Category links use URL-friendly slugs (lowercase, dashes only)

### Index not updating

- Check if `posts_metadata.json` is being created
- Verify the blog-grid section exists in index.html
- Check git commit logs for the update_index.py script output

## Customization

### Modify HTML Templates

To customize post appearance, edit the `HTML_TEMPLATE` variable in `.github/scripts/convert_md_to_html.py`.

### Adjust Index Updates

To change how posts appear on index.html, edit the `generate_blog_card_html()` function in `.github/scripts/update_index.py`.

### Customize TOC Behavior

To change when TOC appears or its styling:
- Edit the `generate_toc()` function in `convert_md_to_html.py`
- Change the minimum heading count (default: 3)
- Modify TOC CSS styles in the HTML_TEMPLATE

### Category Page Styling

To customize category pages, edit the `generate_category_pages()` function in `convert_md_to_html.py`.

## Dependencies

The workflow automatically installs:
- `markdown` - Markdown to HTML conversion
- `pyyaml` - YAML parsing for frontmatter
- `python-frontmatter` - Frontmatter extraction

No local setup required!
