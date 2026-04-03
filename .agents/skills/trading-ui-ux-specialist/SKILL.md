---
name: trading-ui-ux-specialist
description: Design or improve UX for a custom single-user trading tool with a minimal, intuitive, and execution-focused style inspired by globally successful platforms. Use when creating watchlists, order flows, chart screens, portfolio views, risk panels, or any personal high-frequency finance UI where clarity, speed, and trust are critical.
---

# Trading UI/UX Specialist

## Goal

Create clean trading interfaces for one specific user, not a broad audience.
Prioritize fast decision-making, low cognitive load, and confidence during money-related actions.
Prefer fewer features, fewer controls, and fewer visual layers unless the user explicitly needs more.

## Single-User Constraint

1. Design for one person's workflow, habits, and priorities.
2. Avoid generic mass-market UX patterns that add options for many user types.
3. Keep customization practical and small; do not build complex preference systems.
4. Default to minimal screens with only essential actions and information.
5. Add new UI elements only when they solve a real pain point for the single user.

## Design Workflow

1. Define user intent before layout
- Identify the primary job for the screen: scan market, place order, manage risk, or review performance.
- Keep one dominant action per screen state.
- If an element does not support the user's core flow, remove it.

2. Build a visual hierarchy in three levels
- Level 1: price, P&L, position, order CTA.
- Level 2: context such as time frame, holdings, margin usage.
- Level 3: advanced analytics and secondary tools.
- Ensure users can complete common tasks without touching level 3.

3. Keep interaction paths short
- Target 1-2 taps/clicks for frequent actions like Buy, Sell, Modify SL/TP, and Exit.
- Show key pre-trade checks inline, not hidden in deep dialogs.

4. Reduce accidental actions
- Separate destructive and non-destructive actions clearly.
- Add friction only for irreversible actions; keep reversible actions fast.
- Always provide instant confirmation and post-action status.

5. Design for trust and readability
- Use neutral base colors and reserve strong colors for outcomes (profit, loss, warnings).
- Display fees, margin impact, and risk exposure before final confirmation.
- Use consistent terminology across chart, order ticket, and portfolio.
- Avoid cosmetic experimentation that does not improve this user's execution speed.

## Minimal Design Principles With User Benefit

1. Progressive disclosure
- Show essentials first, reveal advanced controls on demand.
- Benefit: beginners are not overwhelmed; advanced users still get power tools.

2. Information chunking
- Group price, position, risk, and action controls into predictable blocks.
- Benefit: faster scanning and fewer interpretation errors under pressure.

3. Stable action zones
- Keep primary trade actions in fixed locations across screens.
- Benefit: muscle memory improves execution speed and reduces misclicks.

4. Intentional defaults
- Preselect safe defaults (quantity guardrails, product type, risk controls) and allow quick override.
- Benefit: fewer avoidable mistakes without slowing expert users.

5. Calm visual language
- Avoid decorative noise, heavy shadows, and competing accents.
- Benefit: important signals stand out immediately.

6. Dense but legible data
- Use compact spacing, but preserve readable typography and clear alignment.
- Benefit: users see more market context without fatigue.

7. Personal workflow first
- Shape layouts around this single user's routine, not broad persona assumptions.
- Benefit: less navigation overhead and faster repeat actions.

## Screen-Level Heuristics

1. Watchlist
- Prioritize symbol, last price, % move, and mini trend.
- Support quick actions without opening full detail screens.

2. Chart and analysis
- Keep chart primary; indicators and drawing tools remain accessible but secondary.
- Preserve chart state while users open order ticket overlays.

3. Order ticket
- Show quantity, order type, estimated cost, fees, and risk controls in one flow.
- Provide plain-language validation and real-time preview of impact.

4. Portfolio and positions
- Surface today's P&L, total return, allocation, and risk concentration first.
- Keep drill-down available without disrupting summary context.

## Output Standard For This Skill

When applying this skill, return:
1. A compact design rationale for the chosen structure.
2. A screen-by-screen spec with primary actions and hierarchy.
3. A "design choice -> user benefit" mapping.
4. At least one risk-reduction recommendation for trading errors.
5. A short list of metrics to validate UX quality, such as task completion time, order error rate, and time-to-first-trade.
6. A short "what was intentionally excluded" list to enforce minimal scope.

## Guardrails

1. Do not add features without a user task justification.
2. Do not hide critical cost/risk information behind extra clicks.
3. Do not optimize for visual novelty over execution clarity.
4. Favor consistency across all trading flows to build user trust.
5. Treat minimalism as default: when in doubt, remove rather than add.
6. Design for one user, not for scale, onboarding funnels, or broad segmentation.
