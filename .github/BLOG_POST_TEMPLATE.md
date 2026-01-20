---
title: "Your Blog Post Title"
date: "January 20, 2026"
description: "A brief description of your blog post for SEO and previews"
reading_time: 5
tags: ["Technology", "Tutorial", "Web Development"]
draft: false
---

# Your Blog Post Title

This is a template for creating blog posts in markdown. The section above (between the `---` markers) is called "frontmatter" and contains metadata about your post.

## Frontmatter Fields

- **title**: The title of your blog post (required)
- **date**: Publication date in a readable format like "January 20, 2026" (optional, defaults to current date)
- **description**: A brief description for meta tags and previews (optional, defaults to title)
- **reading_time**: Estimated reading time in minutes (optional, auto-calculated if not provided)
- **tags**: List of tags/categories for your post (optional, enables category pages)
- **draft**: Set to `true` to skip HTML generation (optional, defaults to false)

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

## Advanced Features

### Draft Posts

Set `draft: true` in your frontmatter to work on a post without generating HTML:

```yaml
---
title: "Work in Progress"
draft: true
---
```

The workflow will skip draft posts completely. Remove or set to `false` when ready to publish.

### Tags and Categories

Add tags to organize your posts:

```yaml
---
title: "My Post"
tags: ["Python", "Machine Learning", "Tutorial"]
---
```

- Tags appear on your blog post
- Category pages are automatically generated for each tag
- Clicking a tag shows all posts with that tag
- Tags also become meta keywords for SEO

### Table of Contents

If your post has **3 or more headings** (h2 or h3), a table of contents is automatically generated:

```markdown
## Introduction
Some content...

## Main Topic
More content...

### Subtopic
Details...

## Conclusion
Final thoughts...
```

The TOC will appear before your content with anchor links to each section.

## What Happens After You Merge?

When your PR from an `addcont/*` branch is merged:

1. GitHub Actions detects the merge
2. The workflow finds all `.md` files in the `posts/` directory
3. Each markdown file is converted to HTML (unless `draft: true`)
4. Category pages are generated for all tags
5. **index.html is automatically updated** with your new post
6. All generated files are committed to the main branch
7. Your new post appears on the website!

## Working with Drafts

**Use Case**: You want to work on multiple posts over time without publishing them.

1. Create your post with `draft: true`
2. Push to `addcont/draft-posts` branch
3. Merge to main - **no HTML is generated**
4. When ready to publish, change `draft: false`
5. Push to a new `addcont/publish-my-post` branch
6. Merge - HTML is generated and index is updated!

Happy writing!
