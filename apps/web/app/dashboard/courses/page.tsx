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
    <div className="flex flex-col gap-4 p-4">
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

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Courses</h1>
          <p className="text-muted-foreground">Overview of all courses.</p>
        </div>
      </div>
    </div>
  );
}
