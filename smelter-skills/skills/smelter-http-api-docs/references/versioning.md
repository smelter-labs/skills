# Version & mismatch handling

This skill documents the Smelter HTTP API at a specific server version. The API does change
between releases, so a skill that's ahead of (or behind) the server you're driving will
describe fields, types, routes, or options that don't line up.

**This reference targets:** Smelter server **v0.6.0**.

## Detecting a mismatch

Suspect a version mismatch when a response looks like drift rather than a normal bug: a
field this reference documents is rejected as unknown, a type is unexpected, a route returns
404, or an option is reported as deprecated/removed.

When you suspect it, check the server's version. The Docker image tag (`v0.6.0`,
`v0.6.0-web-renderer`) or the GitHub release the binary came from tells you which version is
running; `GET /status` confirms you're talking to the right instance (`instance_id`).
Compare against the target version above.

**On a mismatch, tell the user the concrete fix and stop — do not keep emitting requests
with fields/routes that may not exist in their version.**

## Remediation

### The server is OLDER than this skill (skill is ahead)
Some fields/routes documented here may not exist yet in the running server. Recommend
upgrading the server to match the target version — e.g. pull the matching Docker tag:

```sh
docker pull ghcr.io/software-mansion/smelter:v0.6.0
```

(or `v0.6.0-web-renderer` if web rendering is needed). If the user can't or won't upgrade,
don't rely on this reference for the affected API; verify the exact request shape against the
running server's behavior, and make clear which version this reference assumes.

### The server is NEWER than this skill (skill is behind)
The server is ahead of this reference; update the skill to the latest version.

- **Claude Code (plugin marketplace):**
  ```bash
  /plugin marketplace add smelter-labs/skills
  /plugin install smelter-skills@smelter
  ```
- **Other agents (`npx skills`):**
  ```bash
  npx skills add smelter-labs/skills -s smelter-http-api-docs
  ```

The repository does not currently publish per-version skill tags, so install the latest
rather than a pinned older release.

---

*Maintainers: version numbers here are bumped by the `update-smelter-http-docs` skill, which
locates every pin across the skill by searching for the previous version's strings rather
than from a fixed list.*
