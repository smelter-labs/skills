# Version & mismatch handling

This skill documents the Smelter TypeScript SDK at a specific version. The API does
change between releases, so a skill that's ahead of (or behind) the project's
installed packages will describe fields, types, or options that don't line up.

**This reference targets:** SDK **v0.4.0** · Smelter server **v0.6.0** · React **18.3.1** recommended.

## Detecting a mismatch

Suspect a version mismatch when an error looks like drift rather than a normal bug:
a field this reference documents is reported missing or renamed, a type is unexpected,
a property "does not exist", or an option is flagged deprecated.

When you suspect it, check the project's installed version — read `package.json` and
look at `@swmansion/smelter` (and the runtime package: `@swmansion/smelter-node`,
`@swmansion/smelter-web-client`, or `@swmansion/smelter-web-wasm`). Compare against the
target version above.

**On a mismatch, tell the user the concrete fix and stop — do not keep emitting APIs
that may not exist in their version.**

## Remediation

### Installed packages are OLDER than this skill (skill is ahead)
Some APIs documented here may not exist yet in the project's version. Recommend
upgrading the Smelter packages to match:

```bash
npm install @swmansion/smelter@^0.4.0 @swmansion/smelter-node@^0.4.0
# (use the runtime package the project actually uses; web-client / web-wasm equivalently)
```

If the user can't or won't upgrade, don't rely on this reference for the affected API.
Verify the exact shape against the installed package's own type definitions before
writing code, and make clear to the user which version this reference assumes.

### Installed packages are NEWER than this skill (skill is behind)
The project is ahead of this reference; update the skill to the latest version.

- **Claude Code (plugin marketplace):**
  ```bash
  /plugin marketplace add smelter-labs/skills
  /plugin install smelter-skills@smelter
  ```
- **Other agents (`npx skills`):**
  ```bash
  npx skills add smelter-labs/skills -s smelter-ts-docs
  ```

The repository does not currently publish per-version skill tags, so install the
latest rather than a pinned older release.

---

*Maintainers: version numbers here are bumped by the `update-smelter-ts-docs` skill,
which locates every pin across the skill by searching for the previous version's
strings rather than from a fixed list.*
