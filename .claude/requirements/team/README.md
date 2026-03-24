# AI Team — Role Definitions

This folder defines the AI team members for TradingTool-3.

| Command | Role file | Scope |
|---------|-----------|-------|
| `/pm` | → `.claude/commands/pm.md` | Product: converts vague ideas to specs |
| `/infra-arch` | → `.claude/commands/infra-arch.md` | Platform: DAO, cron, coroutines, helpers |
| `/arch` | → `.claude/commands/arch.md` | System: full business + technical architecture |
| `/kite` | → `.claude/commands/kite.md` | Integration: Kite Connect API specialist |

## How the team works together

```
Kush (CEO + backend engineer)
  └─ Shares a vague market observation or product idea
       │
       ▼
     /pm (Priya)
       └─ Validates the observation, writes a feature spec
            │
            ▼
          /arch
            └─ Designs the technical solution (DB, API, services)
                 │
                 ▼
               /infra-arch (if new platform component needed)
                 └─ Designs the generic layer (DAO, cron, etc.)
                      │
                      ▼
                   Kush implements the Kotlin backend
```

## Workflow Rule

**Before any feature is implemented:**
1. PM produces the spec
2. Arch signs off on the design
3. Then coding begins

This prevents building the wrong thing.
