# Smelter Skills

Repository contains [Agent Skills](https://agentskills.io/home) for [Smelter](https://smelter.dev/) by [Software Mansion](https://swmansion.com/)

## Available skills

- **`smelter-ts-docs`** — build video/audio apps with the Smelter TypeScript SDK (`@swmansion/smelter` and its runtime packages): the React-like component API, inputs, outputs, encoders, hooks, resources, and runtimes.
- **`smelter-http-api-docs`** — drive a Smelter server over its HTTP API: routes, WebSocket events, scene components, inputs, outputs, encoders, resources, and side-channel processing.

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
