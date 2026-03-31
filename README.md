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
