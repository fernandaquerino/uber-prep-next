# Delivery 15 — Dashboard Analytics

## Scope

This delivery consolidates real evidence from Plan, Reviews, Flashcards, Quizzes,
Playground, Timer, Mocks, Notes, Resources and Technical English.

Weekly reports and the final audit were not implemented.

## Result

- an in-memory derived snapshot per Dashboard update;
- overall and per-area readiness with an insufficient-data state;
- a Skill Tree by canonical topic;
- risk topics and strong topics;
- a knowledge heatmap;
- per-module metrics, weekly evolution and time per area;
- deterministic and explainable recommendations.

## Performance

The tables are read once, in parallel. The snapshot is computed in the application
layer and delivered ready to the components. There are no IndexedDB queries or
domain computations during the render.

No snapshots table was created because the current recomputation is simple and avoids
duplicate synchronization. Persistence may be considered if future measurements
show a need.
