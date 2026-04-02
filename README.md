# Smelter Skills

Repository contains [Agent Skills](https://agentskills.io/home) for [Smelter](https://smelter.dev/) by [Software Mansion](https://swmansion.com/)

## Installation

### Claude Code users

Add marketplace to Claude Code:
```bash
/plugin marketplace add smelter-labs/skills
```

Install skills:
```bash
/plugin install smelter-skills@smelter
```

### Other agents

To install skills for other agents use the [`npx skills`](https://github.com/vercel-labs/skills) tool

Install all skills from the repository:
```bash
npx skills add smelter-labs/skills
```

or install specific skill:
```bash
npx skills add smelter-labs/skills -s smelter-ts-docs
```

## Development

### Evaluation

All new skills and updates should be evaluated before being merged into `master`. Evaluation is costly, so it should be done once, directly before the merge:

- Start new empty conversation with your AI agent
- Load the Anthropic's `skill-creator` skill (if using Claude Code the best way of acquiring it is installing it as plugin)
- Perform evaluation using `JSON` file corresponding to the updated skill from the `evals` dir.
  - If there any new functionalities, that you think should be covered in evals, tell the model to add them.
  - e. g.
  ```
  /skill-creator Perform evaluation of the `smelter-ts-docs` skill using evals from @evals/smelter-ts-docs/evals.json. Add eval to check if mp4 pause and seek work work correctly.
  ```
- The results will be saved into the `smelter-skills/skills/<SKILL>-workspace`. If model does not summarize them for you, tell him do and analyze the results.
  - Evals with skill should have pass rate in the 90% - 100% range. For evals without skill it varies, but is significantly lower, sometimes even reaches 0%
- Delete the `smelter-skills/skills/<SKILL>-workspace`
