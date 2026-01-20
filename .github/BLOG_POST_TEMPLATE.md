---
title: "Your Blog Post Title"
date: "January 20, 2026"
description: "A brief description of your blog post for SEO and previews"
reading_time: 5
---

# Your Blog Post Title

This is a template for creating blog posts in markdown. The section above (between the `---` markers) is called "frontmatter" and contains metadata about your post.

## Frontmatter Fields

- **title**: The title of your blog post (required)
- **date**: Publication date in a readable format like "January 20, 2026" (optional, defaults to current date)
- **description**: A brief description for meta tags and previews (optional, defaults to title)
- **reading_time**: Estimated reading time in minutes (optional, auto-calculated if not provided)

## How to Use This Template

1. Create a new markdown file in the `posts/` directory (e.g., `posts/my-new-post.md`)
2. Copy this template content
3. Update the frontmatter with your post's metadata
4. Write your content using markdown syntax
5. Create a branch with the pattern `addcont/your-branch-name`
6. Commit and push your markdown file
7. Create a pull request to merge into main/master
8. When the PR is merged, the workflow will automatically generate the HTML file!

## Markdown Syntax Examples

### Headers

Use `#` for headers. More `#` symbols = smaller headers.

```markdown
# H1 Header
## H2 Header
### H3 Header
```

### Text Formatting

- **Bold text** using `**bold**` or `__bold__`
- *Italic text* using `*italic*` or `_italic_`
- ***Bold and italic*** using `***text***`

### Lists

Unordered list:
- Item 1
- Item 2
  - Nested item
- Item 3

Ordered list:
1. First item
2. Second item
3. Third item

### Links and Images

- Links: `[Link text](https://example.com)`
- Images: `![Alt text](image-url.jpg)`

### Code

Inline code: Use backticks like `this`

Code blocks:
```python
def hello_world():
    print("Hello, World!")
```

### Blockquotes

> This is a blockquote.
> It can span multiple lines.

### Horizontal Rules

Use three dashes for a horizontal rule:

---

## Tips for Writing Great Posts

1. **Start with a clear frontmatter**: Make sure your metadata is accurate
2. **Use descriptive headings**: They help readers scan your content
3. **Break up long paragraphs**: Aim for 3-4 sentences per paragraph
4. **Add images**: Visual content makes posts more engaging
5. **Preview before publishing**: Check your markdown syntax

## What Happens After You Merge?

When your PR from an `addcont/*` branch is merged:

1. GitHub Actions detects the merge
2. The workflow finds all `.md` files in the `posts/` directory
3. Each markdown file is converted to HTML using your frontmatter and content
4. The HTML file is automatically committed to the main branch
5. Your new post appears on the website!

Happy writing!
