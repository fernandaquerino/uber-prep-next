# Skill Tree

The Skill Tree uses a canonical taxonomy defined in
`src/lib/data/skill-topics.ts`.

Aliases normalize legacy topics, free-form tags and plan titles.

## States

- `not_started`: a planned topic with no activity;
- `learning`: first evidence;
- `practicing`: multiple practices or sources;
- `consistent`: sustained positive performance;
- `mastered`: high knowledge and retention across at least three sources;
- `at_risk`: failures, gaps, overdue review or low confidence.

Each topic exposes the explanation, evidence count, sources, last activity,
retention, confidence, time and the next action.

Risk is only shown for topics present in the plan.
