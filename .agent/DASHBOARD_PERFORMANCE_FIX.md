# Dashboard Performance Fix: Server-Side Prefetching

## Issue
The user reported that `/dashboard` was loading slowly.
Investigation revealed a **waterfall fetching pattern**:
1. Server renders `page.tsx` (fetches user)
2. Client hydrates
3. `AssignmentFeed` component mounts -> Fetches assignments API
4. `StudentAnnouncementFeed` component mounts -> Fetches announcements API
5. `StudentCourseCatalog` component mounts -> Fetches available courses API

This resulted in 3 separate network requests on page load, causing layout shifts and loading spinners.

## Solution Implemented

### 1. Server-Side Prefetching
Modified `app/dashboard/page.tsx` to prefetch data on the server:
- Instantiated `QueryClient` on the server.
- Used `prisma` to fetch Assignments and Announcements directly (replicating API logic).
- Prefetched this data into the QueryClient cache.
- Wrapped the page content in `<HydrationBoundary>` with dehydrated state.

**Result:** Data is available *immediately* upon HTML arrival. No loading states for these sections.

### 2. Lazy Loading `StudentCourseCatalog`
Modified `components/courses/student-course-catalog.tsx` and `hooks/queries/use-courses.ts`:
- Added `enabled` option to `useAvailableCourses` hook.
- Set `enabled: open` in the component.

**Result:** The "Available Courses" API is ONLY called when the user actually clicks explicitly to browse courses (opens the dialog), saving 1 network request on initial page load.

## Performance Impact
- **Initial Load:** 3 fewer API calls.
- **Visual Stability:** "Active Assignments" and "Recent Announcements" render immediately without skeletons.
- **Network:** Reduced initial payload and request overhead.

## Files Changed
- `apps/web/app/dashboard/page.tsx`
- `apps/web/hooks/queries/use-courses.ts`
- `apps/web/components/courses/student-course-catalog.tsx`
