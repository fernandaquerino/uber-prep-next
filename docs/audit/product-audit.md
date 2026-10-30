# Product audit

## Core answers

- **What to study now?** Dashboard and Plan consult `getCurrentStudyState` over the effective schedule.
- **What to review today?** Review Today uses the normalized review queue.
- **Am I behind?** Lateness is derived from the effective date and appears in the Dashboard and Plan.
- **How much have I progressed?** Dashboard and Reports use real evidence, without converting absence of data into zero.
- **Which topics are at risk?** The evidence layer explains reasons and recommends actions.
- **What to do next?** The next study respects rest and the configured availability.
- **Where are records and progress?** The main navigation exposes Notes, Mocks, Plan and Reports.
- **How to recover data?** Settings contains export, validated import and a confirmed reset.

## Verified consistency

Dashboard, Plan, Review Today and Reports share settings, the scheduler, the effective schedule and the progress selectors. Categories and topics are normalized in the domain layer.

## Decisions

Computed metrics stay read-only. Weekly reflections are the editable exception and use the same source in Review Today and Reports.
