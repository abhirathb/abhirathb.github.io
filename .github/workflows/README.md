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
---
```

### Fields

- **title** (required): Post title
- **date** (optional): Publication date - defaults to current date
- **description** (optional): Meta description - defaults to title
- **reading_time** (optional): Minutes to read - auto-calculated if omitted

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

After merging, `posts/my-awesome-post.html` will be automatically generated and committed.

## Features

- ✅ Automatic HTML generation from markdown
- ✅ Frontmatter metadata support
- ✅ Auto-calculated reading time
- ✅ Syntax highlighting for code blocks
- ✅ Support for tables, lists, images, and more
- ✅ Update existing posts by editing the markdown file
- ✅ Consistent styling matching your site design

## File Structure

```
.github/
├── workflows/
│   ├── markdown-to-html.yml    # Main workflow file
│   └── README.md               # This file
├── scripts/
│   └── convert_md_to_html.py   # Conversion script
└── BLOG_POST_TEMPLATE.md       # Template for new posts
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

### Wrong metadata in HTML

- Check your frontmatter formatting
- Dates should be strings in quotes
- YAML requires proper indentation

## Customization

To modify the HTML template, edit the `HTML_TEMPLATE` variable in `.github/scripts/convert_md_to_html.py`.

## Dependencies

The workflow automatically installs:
- `markdown` - Markdown to HTML conversion
- `pyyaml` - YAML parsing for frontmatter
- `python-frontmatter` - Frontmatter extraction

No local setup required!
