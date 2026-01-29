"use client";

import { useState, useRef, useEffect, useCallback, useId } from "react";
import { ReflectionModal } from "./ReflectionModal";

export type ReflectionPoint = {
  time: number; // seconds
  topic: string;
};

type Props = {
  videoId: string;
  reflectionPoints: ReflectionPoint[];
  studentId: string;
};

export function ReflectionVideoPlayer({
  videoId,
  reflectionPoints,
  studentId,
}: Props) {
  const [showReflection, setShowReflection] = useState(false);
  const [currentReflection, setCurrentReflection] =
    useState<ReflectionPoint | null>(null);
  const [videoPaused, setVideoPaused] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  const containerId = useId().replace(/:/g, "-") || "youtube-player";
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastTriggeredRef = useRef<number[]>([]);
  const onReadyFiredRef = useRef(false);

  // Add debug logging
  const addDebugLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
    console.log(`[ReflectionVideoPlayer] ${timestamp}: ${message}`);
  }, []);

  const handleReflectionPoint = useCallback((reflection: ReflectionPoint) => {
    addDebugLog(
      `🚫 PAUSING VIDEO at ${reflection.time}s for reflection on "${reflection.topic}"`,
    );

    // Pause the video
    if (playerRef.current && playerRef.current.pauseVideo) {
      playerRef.current.pauseVideo();
    }

    setVideoPaused(true);
    setCurrentReflection(reflection);
    setShowReflection(true);

    // Stop polling while modal is open
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      addDebugLog("⏸️ Stopped time polling during reflection");
    }
  }, [addDebugLog]);

  const startPolling = useCallback(() => {
    addDebugLog("Starting time polling every 500ms");
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const currentTime = playerRef.current.getCurrentTime();

        // Only log every 5 seconds to reduce spam
        if (Math.floor(currentTime) % 5 === 0) {
          addDebugLog(`Current time: ${currentTime.toFixed(1)}s`);
        }

        // Check if we've reached a reflection point
        const nextReflection = reflectionPoints.find((point) => {
          const timeDiff = Math.abs(currentTime - point.time);
          const shouldTrigger =
            timeDiff < 0.5 &&
            !videoPaused &&
            !lastTriggeredRef.current.includes(point.time);

          if (shouldTrigger) {
            addDebugLog(
              `🎯 TRIGGER: Reflection point at ${point.time}s - "${point.topic}"`,
            );
            lastTriggeredRef.current = [
              ...lastTriggeredRef.current,
              point.time,
            ];
          }

          return shouldTrigger;
        });

        if (nextReflection) {
          handleReflectionPoint(nextReflection);
        }
      }
    }, 500); // Poll every 500ms
  }, [reflectionPoints, videoPaused, handleReflectionPoint, addDebugLog]);

  const tryStartPlaybackAndPolling = useCallback(() => {
    if (onReadyFiredRef.current) return;
    onReadyFiredRef.current = true;
    addDebugLog("✅ Starting playback and monitoring");
    try {
      if (playerRef.current?.playVideo) {
        playerRef.current.playVideo();
      }
      startPolling();
    } catch (error) {
      addDebugLog(`❌ Error starting playback: ${error}`);
    }
  }, [startPolling, addDebugLog]);

  const initializePlayer = useCallback(() => {
    // Container div must exist (YouTube API will create iframe inside it)
    const container = document.getElementById(containerId);
    if (!container) {
      addDebugLog("⚠️ Player container not in DOM, retrying in 100ms...");
      setTimeout(() => {
        if (document.getElementById(containerId)) {
          initializePlayer();
        } else {
          addDebugLog("❌ Container still not available after retry");
        }
      }, 100);
      return;
    }

    if (typeof window === "undefined" || !window.YT?.Player) {
      addDebugLog("⚠️ YouTube API not ready yet");
      return;
    }

    if (playerRef.current) {
      addDebugLog("⚠️ Player already initialized, skipping");
      return;
    }

    onReadyFiredRef.current = false;
    addDebugLog("Creating YouTube player (div container)...");
    try {
      // Pass container ID string so YouTube API creates iframe inside it (onReady fires reliably)
      playerRef.current = new window.YT.Player(containerId, {
        videoId,
        events: {
          onReady: (event: any) => {
            addDebugLog("✅ Player onReady fired");
            tryStartPlaybackAndPolling();
          },
          onStateChange: (event: any) => {
            addDebugLog(`Player state changed to: ${event.data}`);
            if (event.data === window.YT.PlayerState.PLAYING) {
              setVideoPaused(false);
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setVideoPaused(true);
            }
          },
          onError: (event: any) => {
            addDebugLog(`❌ Player error: ${event.data}`);
          },
        },
      });
      addDebugLog("Player instance created successfully");

      // Fallback: if onReady doesn't fire within 2.5s (e.g. strict mode / timing), start anyway
      setTimeout(() => {
        if (!onReadyFiredRef.current && playerRef.current) {
          addDebugLog("⚠️ onReady did not fire, using fallback start");
          tryStartPlaybackAndPolling();
        }
      }, 2500);
    } catch (error) {
      addDebugLog(`❌ Error creating player: ${error}`);
    }
  }, [videoId, containerId, addDebugLog, tryStartPlaybackAndPolling]);

  // Initialize YouTube player
  useEffect(() => {
    addDebugLog(`Initializing with videoId: ${videoId}`);
    addDebugLog(
      `Reflection points: ${JSON.stringify(reflectionPoints, null, 2)}`,
    );

    // Clean up existing player if videoId changes
    if (playerRef.current && playerRef.current.destroy) {
      addDebugLog("Cleaning up existing player");
      try {
        playerRef.current.destroy();
      } catch (error) {
        addDebugLog(`Error destroying player: ${error}`);
      }
      playerRef.current = null;
      onReadyFiredRef.current = false;
    }

    // Reset triggered points when video changes
    lastTriggeredRef.current = [];

    if (typeof window !== "undefined" && window.YT && window.YT.Player) {
      // API already loaded, initialize immediately (but wait for iframe)
      setTimeout(() => {
        initializePlayer();
      }, 100);
    } else {
      // Load YouTube API if not already loaded
      addDebugLog("Loading YouTube API...");
      
      // Check if script is already being loaded
      const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
      if (existingScript) {
        addDebugLog("YouTube API script already exists, waiting for it to load...");
        // Wait a bit and check again
        const checkInterval = setInterval(() => {
          if (window.YT && window.YT.Player) {
            clearInterval(checkInterval);
            setTimeout(() => initializePlayer(), 100);
          }
        }, 100);
        // Cleanup after 10 seconds
        setTimeout(() => clearInterval(checkInterval), 10000);
      } else {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        tag.async = true;
        const firstScriptTag = document.getElementsByTagName("script")[0];
        if (firstScriptTag?.parentNode) {
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }

        // Store the original callback if it exists
        const originalCallback = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
          addDebugLog("YouTube API ready callback fired");
          if (originalCallback) {
            originalCallback();
          }
          setTimeout(() => {
            initializePlayer();
          }, 100);
        };
      }
    }

    // Listen for dev pause requests
    const handleDevPause = (event: CustomEvent) => {
      addDebugLog(
        `🛑 DEV PAUSE REQUEST from: ${event.detail?.source || "unknown"}`,
      );

      if (playerRef.current && playerRef.current.pauseVideo && !videoPaused) {
        playerRef.current.pauseVideo();
        setVideoPaused(true);

        // Create a temporary reflection point for dev pause
        const devReflection: ReflectionPoint = {
          time: playerRef.current.getCurrentTime(),
          topic: "Manual Dev Pause - Testing",
        };

        setCurrentReflection(devReflection);
        setShowReflection(true);

        // Stop polling while modal is open
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          addDebugLog("⏸️ Stopped time polling during dev pause");
        }
      }
    };

    window.addEventListener("devPauseRequest", handleDevPause as EventListener);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      window.removeEventListener(
        "devPauseRequest",
        handleDevPause as EventListener,
      );
    };
  }, [videoId, reflectionPoints.length, initializePlayer, addDebugLog]);


  const handleReflectionComplete = useCallback(() => {
    addDebugLog(`✅ Reflection complete, resuming video`);
    setShowReflection(false);
    setVideoPaused(false);
    setCurrentReflection(null);

    // Resume video and restart polling
    if (playerRef.current && playerRef.current.playVideo) {
      playerRef.current.playVideo();
    }

    setTimeout(() => {
      addDebugLog("🔄 Restarted time polling");
      startPolling();
    }, 1000); // Small delay before resuming polling
  }, [startPolling, addDebugLog]);

  const triggerDevPause = useCallback(() => {
    if (playerRef.current && playerRef.current.pauseVideo && !videoPaused) {
      try {
        playerRef.current.pauseVideo();
        setVideoPaused(true);

        const currentTime = playerRef.current.getCurrentTime ? playerRef.current.getCurrentTime() : 0;
        const devReflection: ReflectionPoint = {
          time: currentTime,
          topic: "Manual Dev Pause - Testing",
        };

        setCurrentReflection(devReflection);
        setShowReflection(true);

        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          addDebugLog("⏸️ Stopped time polling during dev pause");
        }
        addDebugLog("🛑 Dev pause triggered via button");
      } catch (error) {
        addDebugLog(`❌ Error triggering dev pause: ${error}`);
      }
    } else {
      addDebugLog("⚠️ Dev pause skipped (no player, already paused, or modal open)");
    }
  }, [videoPaused, addDebugLog]);

  return (
    <div className="space-y-6 w-full max-w-full p-6">
      {/* Debug Panel */}
      <div className="mb-4 p-3 bg-gray-100 rounded border border-gray-300">
        <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
          <h3 className="font-mono text-sm font-bold">🐛 Debug Panel</h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={triggerDevPause}
              className="text-xs px-3 py-1.5 bg-amber-500 text-amber-950 rounded hover:bg-amber-400 font-medium"
              title="Pause video now and open reflection modal (for testing)"
            >
              Dev: Trigger pause
            </button>
            <button
              type="button"
              onClick={() => setDebugLogs([])}
              className="text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              Clear Logs
            </button>
          </div>
        </div>
        <div className="text-xs font-mono bg-white p-2 rounded border border-gray-200 h-32 overflow-y-auto">
          {debugLogs.length === 0 ? (
            <div className="text-gray-500">No logs yet...</div>
          ) : (
            debugLogs.map((log, index) => (
              <div key={index} className="border-b border-gray-100 pb-1">
                {log}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        <div
          id={containerId}
          className="w-full h-full min-h-[250px]"
        />
      </div>

      {showReflection && currentReflection && (
        <ReflectionModal
          reflection={currentReflection}
          studentId={studentId}
          onComplete={handleReflectionComplete}
        />
      )}
    </div>
  );
}
