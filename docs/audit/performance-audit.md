# Performance audit

## Verified

- Monaco is loaded with `dynamic` and `ssr: false`;
- independent reads use `Promise.all`;
- Dashboard and Reports derive data outside the render cycle;
- the timer persists timestamps and doesn't write on every tick;
- reports process only the plan's weeks;
- seeds are idempotent.

## Decisions

No additional persisted cache was introduced: the default plan has few weeks and the complexity of invalidation would outweigh the current gain. Report snapshots already avoid losing historical numbers.

## Monitoring

The production build is the reference for chunks and routes. Future data growth should prioritize history pagination and incremental selectors.
