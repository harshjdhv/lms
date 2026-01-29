"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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

export function ReflectionVideoPlayer({ videoId, reflectionPoints, studentId }: Props) {
  const [showReflection, setShowReflection] = useState(false);
  const [currentReflection, setCurrentReflection] = useState<ReflectionPoint | null>(null);
  const [videoPaused, setVideoPaused] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastTriggeredRef = useRef<number[]>([]);

  // Add debug logging
  const addDebugLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`[ReflectionVideoPlayer] ${timestamp}: ${message}`);
  }, []);

  // Initialize YouTube player
  useEffect(() => {
    addDebugLog(`Initializing with videoId: ${videoId}`);
    addDebugLog(`Reflection points: ${JSON.stringify(reflectionPoints, null, 2)}`);
    
    if (typeof window !== "undefined" && window.YT) {
      initializePlayer();
    } else {
      // Load YouTube API if not already loaded
      addDebugLog("Loading YouTube API...");
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      if (firstScriptTag?.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }
      
      window.onYouTubeIframeAPIReady = initializePlayer;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [videoId, reflectionPoints.length]);

  const initializePlayer = () => {
    if (!iframeRef.current) {
      addDebugLog("Iframe ref not available");
      return;
    }
    
    addDebugLog("Creating YouTube player...");
    playerRef.current = new window.YT.Player(iframeRef.current, {
      videoId,
      events: {
        onReady: (event: any) => {
          addDebugLog("Player ready, starting playback and monitoring");
          event.target.playVideo();
          startPolling();
        },
        onStateChange: (event: any) => {
          addDebugLog(`Player state changed to: ${event.data}`);
          if (event.data === window.YT.PlayerState.PLAYING) {
            setVideoPaused(false);
          } else if (event.data === window.YT.PlayerState.PAUSED) {
            setVideoPaused(true);
          }
        }
      },
    },
  });

  const startPolling = useCallback(() => {
    addDebugLog("Starting time polling every 500ms");
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
          const shouldTrigger = timeDiff < 0.5 && !videoPaused && !lastTriggeredRef.current.includes(point.time);
          
          if (shouldTrigger) {
            addDebugLog(`🎯 TRIGGER: Reflection point at ${point.time}s - "${point.topic}"`);
            lastTriggeredRef.current = [...lastTriggeredRef.current, point.time];
          }
          
          return shouldTrigger;
        });
        
        if (nextReflection) {
          handleReflectionPoint(nextReflection);
        }
      }
    }, 500); // Poll every 500ms
  }, [reflectionPoints, videoPaused]);

  const handleReflectionPoint = useCallback((reflection: ReflectionPoint) => {
    addDebugLog(`🚫 PAUSING VIDEO at ${reflection.time}s for reflection on "${reflection.topic}"`);
    
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
  }, []);

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
  }, []);

  return (
    <div className="space-y-6 w-full max-w-full p-6">
      {/* Debug Panel */}
      <div className="mb-4 p-3 bg-gray-100 rounded border border-gray-300">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-mono text-sm font-bold">🐛 Debug Panel</h3>
          <button 
            onClick={() => setDebugLogs([])}
            className="text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            Clear Logs
          </button>
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
        <iframe
          ref={iframeRef}
          className="w-full h-full"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
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