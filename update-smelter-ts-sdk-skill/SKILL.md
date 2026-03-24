---
name: update-smelter-ts-sdk-skill
description: >
  Maintenance skill for updating the smelter-ts-sdk Claude Code skill to reflect
  changes in the Smelter TypeScript SDK documentation. Compares existing skill content
  against the latest doc source files, identifies what changed, and produces a new skill
  version with minimal targeted updates.
  Use when: "update smelter skill", "refresh smelter skill", "sync smelter skill with docs",
  "regenerate smelter ts sdk skill", "update ts-sdk skill from docs".
  User MUST provide paths to the existing skill directory and the new docs directory.
---

# Update Smelter TS SDK Skill

Guide for updating the `smelter-ts-sdk` Claude Code skill to reflect doc changes.
Goal: MINIMAL, TARGETED updates — only change what the docs changed.

## Required User Input

User MUST provide both:
1. **Existing skill directory** — path to the current skill (contains `SKILL.md` and `references/`)
2. **New docs directory** — path to the TS SDK documentation source `.mdx` files

If either is missing, ask before proceeding.

## Workflow

Follow steps IN ORDER.

### Step 1: Read the Existing Skill

Read every file in the existing skill:
- `SKILL.md`
- All files under `references/` (all subdirectories)

Note the structure, style, content, and how reference files are organized.

### Step 2: Read Doc Source Files

Read all `.mdx` files in the docs directory and subdirectories.
Skip example/sample code files (e.g. `.tsx` files in `examples/` directories) — those are not documentation.

### Step 3: Match Docs to Skill Files

Dynamically determine which doc files correspond to which skill reference files by comparing content — matching on topic, component names, type definitions, and subject matter. A single skill reference file may correspond to multiple doc files (consolidated references), or a single doc file may map 1:1 to a skill reference.

Do NOT rely on filename or directory structure matching — match by semantic content.

### Step 4: Identify Changes

For each skill file and its corresponding doc source(s):

- New props, types, parameters, or options added in docs
- Removed props, types, or options
- Changed type definitions, defaults, or descriptions
- New doc topics with no corresponding skill reference
- Removed doc topics (flag for user, do not auto-delete)

### Step 5: Report Changes

Before editing, report findings:

```
## Changes Detected

### New (not in current skill):
- [list]

### Modified:
- [file: what changed]

### Unchanged:
- [list]
```

Ask user to confirm before proceeding.

### Step 6: Create Output Directory

```bash
cp -r <existing-skill-dir> <existing-skill-dir>-next
```

This copies the entire existing skill as baseline. Only modify files that need changes.

### Step 7: Apply Minimal Updates

Edit ONLY changed portions in the `-next` directory.

#### MDX-to-Markdown Conversion

Strip all Astro/MDX artifacts from doc content before incorporating into skill files:

| MDX | Markdown |
|---|---|
| `<Aside>text</Aside>` | `> **Note**: text` |
| `<Aside type="caution">` | `> **Caution**: text` |
| `<Aside type="tip">` | `> **Tip**: text` |
| `<Badge text="X" />` | `X` (inline) |
| `<Code code={...} lang="tsx" />` | `` ```tsx ... ``` `` |
| `<CollapsibleDetails>` | Remove wrapper, keep content |
| `<Steps>` | Plain numbered list |
| `<Tabs><TabItem>` | Pick most relevant or separate sections |
| `[Link](/path)` | Plain text with `— see references/...` if applicable |
| `import ...` | Remove |
| YAML frontmatter | Remove from reference files |

#### Style Rules

- **Preserve existing wording** when content is semantically unchanged, even if docs use different phrasing
- **Condense doc prose** — skill uses shorter, more direct language. Do NOT copy docs verbatim.
- **Keep existing section structure** — add new sections at logical positions matching existing patterns
- **Preserve type definitions** as fenced code blocks
- **Cross-references** between skill files: use format `— see references/path/File.md`
- **New reference files**: follow the format and style of existing sibling files in the same directory

#### For SKILL.md:
- Update tables only if entries were added, removed, or materially changed
- Update reference pointers if new files were created

### Step 8: Verify and Summarize

Read each modified file in `-next` to verify:
1. No MDX/Astro artifacts remain
2. All `references/` cross-links point to valid files
3. Style consistent with unchanged files
4. No accidental removals or duplications
5. SKILL.md tables match actual reference files

Report to user:
- Files created (new)
- Files modified
- Files unchanged (copied as-is)
- Any ambiguities encountered

## Edge Cases

- **New doc topic, no skill equivalent**: Create reference file matching sibling patterns. Add SKILL.md table entry.
- **Removed doc topic**: Do NOT remove skill reference unless certain the feature was removed (not just moved). Flag for user.
- **Only example/sample code changes**: Skip — skill does not mirror all examples.
- **Only formatting changes**: Skip — if semantic content is the same, do not touch the skill file.
