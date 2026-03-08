"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Camera, SwitchCamera, X, Scan } from "lucide-react";

type Props = {
  onCapture: (file: File) => void;
  onClose: () => void;
};

export function CameraCapture({ onCapture, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string>("");

  const startCamera = useCallback(async (facing: "user" | "environment") => {
    // Stop any existing stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }

    setReady(false);
    setError("");

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError("Camera wordt niet ondersteund in deze browser. Gebruik HTTPS of een andere browser.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 1280 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setReady(true);
        };
      }
    } catch (err) {
      console.error("Camera error:", err);
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setError("Camera toegang geweigerd. Sta camera toe in je browser instellingen.");
      } else {
        setError("Kan camera niet openen. Probeer het opnieuw.");
      }
    }
  }, []);

  useEffect(() => {
    startCamera(facingMode);

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);// eslint-disable-line react-hooks/exhaustive-deps

  function switchCamera() {
    const newMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(newMode);
    startCamera(newMode);
  }

  function capture() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    // Use square crop (center)
    const size = Math.min(video.videoWidth, video.videoHeight);
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const offsetX = (video.videoWidth - size) / 2;
    const offsetY = (video.videoHeight - size) / 2;

    ctx.drawImage(video, offsetX, offsetY, size, size, 0, 0, size, size);

    // iOS Safari doesn't support WebP canvas encoding — detect and fall back to JPEG
    const supportsWebp = canvas.toDataURL("image/webp").startsWith("data:image/webp");
    const mimeType = supportsWebp ? "image/webp" : "image/jpeg";
    const ext = supportsWebp ? "webp" : "jpg";

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], `camera-capture.${ext}`, {
            type: blob.type,
          });

          // Stop camera
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
          }

          onCapture(file);
        }
      },
      mimeType,
      0.85
    );
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/80">
        <button
          type="button"
          onClick={() => {
            if (streamRef.current) {
              streamRef.current.getTracks().forEach((t) => t.stop());
            }
            onClose();
          }}
          className="flex items-center gap-2 text-white text-sm font-medium min-h-12"
        >
          <X className="h-5 w-5" />
          Sluiten
        </button>

        <button
          type="button"
          onClick={switchCamera}
          className="flex items-center gap-2 text-white text-sm font-medium min-h-12"
        >
          <SwitchCamera className="h-5 w-5" />
          Draai
        </button>
      </div>

      {/* Camera view */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {error ? (
          <div className="text-white text-center px-6">
            <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">{error}</p>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Square guide overlay */}
            {ready && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[75vw] h-[75vw] max-w-[400px] max-h-[400px] border-2 border-white/40 rounded-2xl" />
              </div>
            )}
          </>
        )}
      </div>

      {/* Capture button */}
      <div className="flex items-center justify-center py-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] bg-black/80">
        {ready && (
          <button
            type="button"
            onClick={capture}
            className="flex items-center justify-center w-20 h-20 rounded-full bg-white border-4 border-white/30 active:scale-90 transition-transform"
          >
            <Scan className="h-8 w-8 text-slate-900" />
          </button>
        )}
      </div>

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
