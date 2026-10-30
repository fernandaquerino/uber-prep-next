# Delivery 05.3 — Plan Page UI state stability

## Symptom

When interacting with any block (start, complete, save a note, save a solution, etc.) the interface showed:

- The modal closing automatically.
- The page flickering (skeleton → content flicker).
- The week collapsing.
- Expanded days closing.
- Scroll jumping back to the top.
- Quick filters with no visual effect.

## Identified root cause

### Cause 1 — `refresh()` forced `status: "loading"` (primary)

`src/hooks/use-plan-page.ts`:

```ts
// BEFORE (incorrect)
const refresh = useCallback(() => {
  setState({ status: "loading" }); // ← forces a global skeleton
  setRev((r) => r + 1);
}, []);
```

Setting `status: "loading"` made `PlanScreen` render `<PlanSkeleton />` instead of the content. That **unmounted the whole tree**: modal, days, weeks, filters. All local state was lost.

**Fix**: remove the `setState({ status: "loading" })` line from the callback. The initial `"loading"` state is already set by `useState` on the first mount and doesn't need to be repeated on each refresh.

```ts
// AFTER (correct)
const refresh = useCallback(() => {
  setRev((r) => r + 1);
}, []);
```

### Cause 2 — `doAction` closed the modal after every action (secondary)

`src/components/features/plan/plan-block-details.tsx`:

```ts
// BEFORE (incorrect)
async function doAction(fn: () => Promise<void>) {
  setLoading(true);
  try {
    await fn();
    onActionDone();
    handleClose(); // ← closed the modal after every successful action
  } finally {
    setLoading(false);
  }
}
```

`handleClose()` reset the view, the active tab and called `setOpenBlockId(null)`, closing the modal.

**Fix**: remove `handleClose()` from `doAction`. Return to the "details" view (leave completion/stuck sub-forms) without closing the modal:

```ts
// AFTER (correct)
async function doAction(fn: () => Promise<void>) {
  setLoading(true);
  try {
    await fn();
    setView("details"); // leaves sub-forms; preserves activeTab
  } finally {
    setLoading(false);
  }
}
```

The internal `refresh` is already triggered by `usePlanActions.wrap → onSuccess` and doesn't need an extra call (`onActionDone` was removed).

### Cause 3 — Filters fell back to the base schedule (filtering bug)

`src/components/features/plan/plan-week.tsx`:

```ts
// BEFORE (incorrect)
const dayMap = new Map(effectiveDays.map((d) => [d.date, d]));
{week.days.map((baseDay) => {
  const effectiveDay = dayMap.get(baseDay.date) ?? {
    ...baseDay,
    items: baseDay.items.map(...) // fallback with ALL the base schedule's items!
  };
})}
```

When a day had no items in the `filteredEffectiveSchedule`, the fallback used all the base schedule's items, making the filter visually ineffective.

**Fix**: a new `isFiltered` prop. When active, days not present in `effectiveDays` are omitted instead of using the fallback:

```ts
// AFTER (correct)
if (!effectiveDay && isFiltered) return null; // skips a day with no filtered items
const day = effectiveDay ?? fallback(baseDay, today);
```

## Components involved

| Component                | Role in the problem                                                                     |
| ------------------------ | --------------------------------------------------------------------------------------- |
| `use-plan-page.ts`       | Cause 1: `refresh()` → `setState("loading")`                                            |
| `plan-block-details.tsx` | Cause 2: `doAction` → `handleClose()`                                                   |
| `plan-week.tsx`          | Cause 3: fallback to the base schedule on filtered days                                 |
| `plan-screen.tsx`        | Receiver: passes `isFiltered`, removes `onActionDone`, resets state on `changeStartDate` |

## UI state strategy

### Modal controlled by ID

```ts
const [openBlockId, setSelectedBlockId] = useState<string | null>(null);
const openBlock = effectiveSchedule.flatMap((d) => d.items).find((b) => b.blockId === openBlockId);
```

The modal opens/closes by `openBlockId`, not by the block's reference. When the data is re-fetched, the block is found by the same ID with an updated status. The modal stays open.

### Modal tabs — local state preserved

`view` and `activeTab` are local state of `PlanBlockDetails`. Since the component doesn't unmount during a refresh (Cause 1 resolved), these states are preserved between mutations.

`handleClose()` resets both only on explicit close (Close, Escape, clicking outside).

### Day accordions — local state preserved

`open` is local state of `PlanDayCard` with `key={baseDay.date}`. Since the component doesn't unmount during a refresh (Cause 1 resolved), the state is preserved. No key change or lifting needed.

### Selected week

`selectedWeekId` is initialized with `prev ?? result.data.initialWeekId` on the first load. Subsequent refreshes use `prev ?? ...`, preserving the user's manual selection.

Reset only when `changeStartDate` is called (the whole schedule changes).

### Initial loading vs. mutation

| Situation               | Behavior                                                                            |
| ----------------------- | ----------------------------------------------------------------------------------- |
| First load              | `useState({ status: "loading" })` → skeleton                                        |
| Refresh after a mutation| `setRev(r+1)` → old data stays visible; the update arrives in the background         |
| Start-date change       | Explicit reset of `openBlockId` and `selectedWeekId`; a new `initialWeekId` computed |

### Scroll

There's no route navigation during mutations. The scroll is preserved naturally because the DOM isn't unmounted.

### Keys and identity

All components use stable keys:

- `PlanDayCard`: `key={baseDay.date}` (immutable date)
- `PlanBlockCard`: `key={block.blockId}` (domain ID)
- `PlanWeek`: has no key of its own (a single instance)

### Forms

Buttons inside forms without `type="button"` and without an `onSubmit` using `e.preventDefault()` could cause a reload. Reviewed: all the action buttons are correctly typed.

## Modal — action table

| Action               | Modal stays?                     |
| -------------------- | -------------------------------- |
| Start                | ✅ Yes                           |
| Complete             | ✅ Yes                           |
| Mark as stuck        | ✅ Yes                           |
| Return to pending    | ✅ Yes                           |
| Pause                | ✅ Yes                           |
| Save notes           | ✅ Yes                           |
| Save solution        | ✅ Yes                           |
| Reschedule           | ✅ Yes (via a separate dialog)   |
| Skip                 | ✅ Yes (via a separate dialog)   |
| Restore              | ✅ Yes                           |
| Undo                 | ✅ Yes                           |
| Close                | ❌ Closes (correct behavior)     |
| Escape               | ❌ Closes (correct behavior)     |
| Click outside        | ❌ Closes (correct behavior)     |

## Tests

### Regression tests (unit)

172 existing tests — all passing after the fixes.

### New E2E tests

`tests/e2e/plan-stability.spec.ts`:

1. **05.3.1** — The modal doesn't close after starting a block; the selected week is kept.
2. **05.3.2** — The Notes tab stays after saving.
3. **05.3.3** — The Solution tab stays after saving.
4. **05.3.4** — The day accordion doesn't close after an action.
5. **05.3.5** — Filters (in progress) show only the matching blocks.
6. **05.3.6** — The modal is stable in a mobile viewport (375px).

All tests are conditional: they skip if the plan isn't loaded (no start date configured).

## Modified files

| File                                                  | Change                                                                                                                    |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `src/hooks/use-plan-page.ts`                          | Removes `setState({ status: "loading" })` from `refresh()`; exposes `setSelectedWeekId(id: string \| null)`               |
| `src/components/features/plan/plan-block-details.tsx` | Removes the `onActionDone` prop; removes `handleClose()` from `doAction`; adds `setView("details")`                       |
| `src/components/features/plan/plan-week.tsx`          | Adds the `isFiltered` prop; skips days with no items when filtering                                                       |
| `src/components/features/plan/plan-screen.tsx`        | Passes `isFiltered` to `PlanWeek`; removes `onActionDone` from `PlanBlockDetails`; resets state in `handleChangeStartDate` |

## Created files

| File                                       | Content                      |
| ------------------------------------------ | ---------------------------- |
| `tests/e2e/plan-stability.spec.ts`         | 6 E2E stability tests        |
| `docs/delivery-05.3-ui-state-stability.md` | This document                |

## Verified regressions

- Closing the modal with Escape/Close still works.
- The completion and stuck sub-forms still work.
- Rescheduling and skip (separate dialogs) still work.
- The "All" filter still shows all days/blocks.
- The week is initialized to the current week on the first load.
- Changing the start date resets the week and the open block.
