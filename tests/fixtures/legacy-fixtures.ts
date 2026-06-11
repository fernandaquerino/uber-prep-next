// Fixtures for legacy localStorage data used in migration tests.

export const LEGACY_PROGRESS_FIXTURE = JSON.stringify({
  blocks: {
    "w1-d1-b0": { status: "done", patternUsed: "two-pointers", difficulty: 3, actualMinutes: 45 },
    "w1-d1-b1": { status: "in_progress" },
  },
  reviews: {
    "w1-d1-b0": {
      blockKey: "w1-d1-b0",
      blockLabel: "Two Sum",
      leetcode: "1",
      nextReview: "2025-02-01",
      cycleIndex: 1,
      doneAt: "2025-01-15",
      history: ["2025-01-15"],
    },
  },
  startDate: "2025-01-01",
  mocks: [
    {
      id: "mock-1",
      date: "2025-01-10",
      type: "Coding",
      question: "Implement a LRU Cache",
      solution: "Use HashMap + DLL",
      hasAudio: false,
      createdAt: "2025-01-10T10:00:00.000Z",
    },
  ],
  playground: [
    {
      id: "play-1",
      title: "Two Sum solution",
      language: "typescript",
      code: "function twoSum(nums: number[], target: number) {}",
      createdAt: "2025-01-05T00:00:00.000Z",
      updatedAt: "2025-01-05T00:00:00.000Z",
    },
  ],
  learningJournal: {
    "2025-01-10": { content: "Studied graphs today", mood: "focused" },
  },
  weeklyReflections: {
    "1": { weekNumber: 1, content: "Good week", rating: 4, createdAt: "2025-01-07T00:00:00.000Z" },
  },
  topicNotes: {
    "dynamic-programming": "DP is about overlapping subproblems",
  },
  notes: {},
  goals: {},
  studyDays: [],
});

export const LEGACY_FLASHCARDS_FIXTURE = JSON.stringify({
  cards: [
    {
      id: "fc-1",
      front: "O que é O(n)?",
      back: "Linear time",
      category: "algo",
      tags: ["big-o"],
      status: "pending",
      reviewCount: 0,
      reviews: [],
      nextReview: null,
    },
    {
      id: "fc-user-1",
      front: "User card front",
      back: "User card back",
      category: "custom",
      tags: ["custom"],
      status: "review",
      reviewCount: 2,
      reviews: [
        { date: "2025-01-10", result: "knew" },
        { date: "2025-01-13", result: "didnt" },
      ],
      nextReview: "2025-01-20",
      knownAt: null,
      lastReviewedAt: "2025-01-13",
    },
  ],
});

export const LEGACY_QUIZZES_FIXTURE = JSON.stringify({
  attempts: [
    {
      id: "attempt-1",
      quizId: null,
      dailyDate: "2025-01-10",
      attemptNumber: 1,
      mode: "daily",
      questionIds: ["q1", "q2", "q3"],
      startedAt: "2025-01-10T09:00:00.000Z",
      finishedAt: "2025-01-10T09:15:00.000Z",
      createdAt: "2025-01-10T09:00:00.000Z",
      totalQuestions: 3,
      correctAnswers: 2,
      wrongAnswers: 1,
      skippedAnswers: 0,
      accuracyPercentage: 66.7,
      totalTimeSeconds: 900,
      averageTimePerQuestion: 300,
    },
  ],
  answers: [],
  reviews: {
    q1: {
      questionId: "q1",
      topic: "arrays",
      group: "easy",
      nextReview: "2025-01-17",
      cycleIndex: 1,
      history: ["2025-01-10"],
      lastAnswer: "correct",
      lastRating: "good",
    },
  },
  customQuestions: [],
  dailyQuizzes: {},
  markedQuestions: {},
});

export const LEGACY_TIMER_SESSIONS_FIXTURE = JSON.stringify([
  {
    id: "timer-1",
    category: "algo",
    duration: 1500,
    preset: 1500,
    completedAt: "2025-01-10T10:00:00.000Z",
    date: "2025-01-10",
    weekNumber: 2,
  },
  {
    category: "system-design",
    duration: 2700,
    preset: 3600,
    completedAt: "2025-01-11T14:00:00.000Z",
    date: "2025-01-11",
  },
]);

export const LEGACY_CHECKLIST_FIXTURE = JSON.stringify({
  checked: {
    "phase1-item1": true,
    "phase1-item2": false,
    "phase2-item1": true,
  },
  evidence: {
    "phase1-item1": "Completed all easy LeetCode problems",
  },
});
