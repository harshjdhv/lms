"use client";

import { Button } from "@workspace/ui/components/button";

export default function CoursesPage() {
  const handleDevPause = () => {
    // Send a pause signal to any ReflectionVideoPlayer on the page
    window.dispatchEvent(
      new CustomEvent("devPauseRequest", {
        detail: { source: "courses-page-dev-button" },
      }),
    );
  };

  return (
    <div className="w-full flex flex-col gap-6 p-6 max-w-[1600px] mx-auto">
      {/* Dev Fallback Pause Button - Remove this later */}
      <div className="fixed top-20 right-4 z-50">
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDevPause}
          className="shadow-lg"
        >
          🛑 DEV: Pause Video
        </Button>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
          <p className="text-muted-foreground">Overview of all courses.</p>
        </div>
      </div>
    </div>
  );
}
