# Performance Analysis Report - LMS Application

## Executive Summary
The LMS application is experiencing significant performance issues due to inefficient data fetching patterns. The main problems are:

1. **Inconsistent Data Fetching Strategy** - Some components use TanStack Query, others use raw `useEffect` + `useState`
2. **Aggressive Polling** - AssignmentFeed polls every 5 seconds unnecessarily
3. **Duplicate API Calls** - Same data fetched from multiple components independently
4. **No Data Prefetching** - All fetches happen on mount, causing waterfall loading
5. **Missing Loading State Optimization** - No skeleton/placeholder consistency

---

## Detailed Issues Analysis

### 🔴 Critical Issue #1: AssignmentFeed 5-Second Polling

**File:** `components/assignments/assignment-feed.tsx`

**Problem:**
```typescript
useEffect(() => {
    fetchAssignments()
    const interval = setInterval(fetchAssignments, 5000) // POLL EVERY 5 SECONDS!
    return () => clearInterval(interval)
}, [])
```

This causes:
- Network request every 5 seconds while dashboard is open
- Battery drain on mobile devices
- Server load issues at scale
- UI flickering on updates

**Solution:** Use TanStack Query with intelligent refetching (on focus, reconnect) instead of polling.

---

### 🔴 Critical Issue #2: Inconsistent Data Fetching Patterns

**Components NOT using TanStack Query (raw useEffect):**
1. `assignment-feed.tsx` - useEffect + useState + polling
2. `student-announcement-feed.tsx` - useEffect + useState
3. `student-assignments-view.tsx` - useEffect + useState
4. `teacher-assignment-list.tsx` - useEffect + useState
5. `teacher-announcement-list.tsx` - useEffect + useState
6. `student-course-catalog.tsx` - useEffect + useState (fetches on dialog open)

**Components using TanStack Query correctly:**
1. `catalog-view.tsx` - useQuery
2. `my-courses-view.tsx` - useQuery
3. `course-overview.tsx` - useQuery with initialData

**Problem:** Inconsistent patterns mean no shared caching, duplicate requests, and unpredictable loading states.

---

### 🔴 Critical Issue #3: Duplicate Data Fetching

**Same endpoints called multiple times:**

| Endpoint | Called From | Pattern |
|----------|-------------|---------|
| `/api/assignments` | `assignment-feed.tsx` | useEffect + polling |
| `/api/assignments` | `student-assignments-view.tsx` | useEffect |
| `/api/assignments` | `teacher-assignment-list.tsx` | useEffect |
| `/api/announcements` | `student-announcement-feed.tsx` | useEffect |
| `/api/announcements` | `teacher-announcement-list.tsx` | useEffect |
| `/api/courses/available` | `catalog-view.tsx` | useQuery |
| `/api/courses/available` | `student-course-catalog.tsx` | useEffect (dialog open) |

**Result:** User navigating the dashboard causes 3-4x more API calls than necessary.

---

### 🟡 Medium Issue #4: Server/Client Data Waterfall

**File:** `app/dashboard/page.tsx`

The dashboard page fetches user data server-side, but all child components then make their own client-side fetches:

```
Server: getCurrentUser() → User data
              ↓
Client Mount: AssignmentFeed fetches /api/assignments
Client Mount: StudentAnnouncementFeed fetches /api/announcements
Client Mount: StudentCourseCatalog ready to fetch (on dialog open)
```

No data is prefetched or passed as initial data to client components.

---

### 🟡 Medium Issue #5: Course Catalog Page Inefficiency

**File:** `app/dashboard/courses/catalog/page.tsx`

```typescript
export default async function CourseCatalogPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    // ... authentication code ...
    
    // Comment says: "We fetch courses on the client now to avoid blocking navigation"
    // But this is actually WORSE - it causes client waterfall
    return <CatalogView />;
}
```

The page ALREADY does a server-side call to validate user, but doesn't fetch course data that the `CatalogView` component will need anyway.

---

### 🟡 Medium Issue #6: No Query Key Normalization

Different query keys for potentially same data:
- `["courses", "available"]` in catalog-view.tsx
- `["courses", "my"]` in my-courses-view.tsx
- `["course", courseId]` in course-overview.tsx

While these are semantically different, there's no shared hook or query factory pattern.

---

## Action Plan

### Priority 1: Standardize on TanStack Query
Convert all components to use TanStack Query with consistent patterns.

### Priority 2: Create Centralized Query Hooks
Create `hooks/queries/` directory with hooks like:
- `useAssignments()`
- `useAnnouncements()`
- `useCourses()`
- `useAvailableCourses()`

### Priority 3: Add Query Invalidation
After mutations (create assignment, enroll, etc.), invalidate related queries.

### Priority 4: Server-Side Data Hydration
Pass initial data from server components to client components to eliminate loading states on first render.

### Priority 5: Add `gcTime` and Smart Refetching
Configure TanStack Query with:
- `staleTime: 5 * 60 * 1000` (already set globally)
- `gcTime: 10 * 60 * 1000` (keep in cache longer)
- `refetchOnWindowFocus: true` (smart refetch)
- Remove manual polling

---

## Files to Modify

1. **New:** `hooks/queries/use-assignments.ts`
2. **New:** `hooks/queries/use-announcements.ts`
3. **New:** `hooks/queries/use-courses.ts`
4. **Modify:** `components/assignments/assignment-feed.tsx`
5. **Modify:** `components/assignments/student-assignments-view.tsx`
6. **Modify:** `components/assignments/teacher-assignment-list.tsx`
7. **Modify:** `components/announcements/student-announcement-feed.tsx`
8. **Modify:** `components/announcements/teacher-announcement-list.tsx`
9. **Modify:** `components/courses/student-course-catalog.tsx`
10. **Modify:** `components/providers.tsx` (add gcTime config)
