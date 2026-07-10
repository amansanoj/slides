# Getting Started with Kiro

### An AI-Powered Development Environment

*January 2025*

---

## What is Kiro?

- AI-powered development environment built on VS Code
- Two session types: **Vibe** (conversational) and **Spec** (structured)
- Two autonomy modes: **Autopilot** and **Supervised**
- Works directly in your editor and workspace

---

## Key Features

- 🤖 Autonomous code generation
- 📋 Spec-driven development
- 🔗 MCP (Model Context Protocol) integration
- 🎣 Agent hooks for automation
- 🧭 Steering files for project context

---

## Spec Workflow

```
Requirements → Design → Tasks → Implementation
```

1. Describe what you want to build
2. Kiro drafts requirements
3. You review and iterate
4. Kiro generates implementation tasks
5. Execute tasks autonomously

Notes:
The Spec workflow is great for complex features that need structured planning.

---

## Agent Hooks

Hooks let you automate tasks based on IDE events:

| Trigger | Use Case |
|---------|----------|
| `PostFileSave` | Run linter on save |
| `PostTaskExec` | Run tests after task |
| `SessionStart` | Load project context |
| `PreToolUse` | Access control checks |

---

## Getting Started

```bash
# Open your project in Kiro
# Start a Vibe session for quick tasks
# Start a Spec session for new features
```

> Press **S** for speaker notes
> Press **?** for keyboard shortcuts
> Add **?print-pdf** to the URL to export

---

## Thank You

**slides.amansanoj.com**

Built with [reveal.js](https://revealjs.com) + Cloudflare Workers
