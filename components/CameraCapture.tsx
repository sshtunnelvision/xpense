"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, X, Upload, RotateCw } from "lucide-react";

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  disabled?: boolean;
}

export default function CameraCapture({
  onCapture,
  disabled,
}: CameraCaptureProps) {
  const [isInitializing, setIsInitializing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debug, setDebug] = useState<string>("");
  const [facingMode, setFacingMode] = useState<"environment" | "user">(
    "environment"
  );
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
        setDebug((prev) => `${prev}\nStopped track: ${track.label}`);
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    return cleanup;
  }, []);

  // New effect to handle camera initialization
  useEffect(() => {
    let mounted = true;

    const initCamera = async () => {
      if (!isInitializing || !videoRef.current) return;

      try {
        setError(null);
        setDebug("Starting camera initialization...");

        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("Camera API is not supported in this browser");
        }

        const devices = await navigator.mediaDevices.enumerateDevices();
        if (!mounted) return;
        setDebug((prev) => `${prev}\nFound devices: ${devices.length}`);

        const cameras = devices.filter(
          (device) => device.kind === "videoinput"
        );
        if (!mounted) return;
        setDebug((prev) => `${prev}\nFound cameras: ${cameras.length}`);

        if (cameras.length === 0) {
          throw new Error("No camera found on this device");
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facingMode,
          },
          audio: false,
        });

        if (!mounted || !videoRef.current) return;

        const video = videoRef.current;
        video.srcObject = stream;
        streamRef.current = stream;

        await new Promise<void>((resolve) => {
          if (!video) return;
          video.onloadedmetadata = () => resolve();
        });

        if (!mounted) return;
        setDebug((prev) => `${prev}\nVideo metadata loaded`);

        await video.play();

        if (!mounted) return;
        setDebug((prev) => `${prev}\nCamera started`);
        setShowCamera(true);
      } catch (err) {
        if (!mounted) return;
        cleanup();
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(`Camera access failed: ${errorMessage}`);
        setDebug((prev) => `${prev}\nError: ${errorMessage}`);
      } finally {
        if (mounted) {
          setIsInitializing(false);
        }
      }
    };

    initCamera();

    return () => {
      mounted = false;
    };
  }, [isInitializing, facingMode]);

  const startCamera = () => {
    setShowCamera(true);
    setIsInitializing(true);
  };

  const stopCamera = () => {
    cleanup();
    setShowCamera(false);
    setError(null);
  };

  const switchCamera = () => {
    cleanup();
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
    setIsInitializing(true);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image size should be less than 10MB");
      return;
    }

    onCapture(file);

    // Reset the input
    event.target.value = "";
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) {
      setError("Video or canvas element not found");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) {
      setError("Could not get canvas context");
      return;
    }

    try {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // If using front camera, flip the image horizontally
      if (facingMode === "user") {
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
      }

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setError("Failed to create image blob");
            return;
          }
          const file = new File([blob], `receipt-${Date.now()}.jpg`, {
            type: "image/jpeg",
          });
          onCapture(file);
          stopCamera();
        },
        "image/jpeg",
        0.8
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to capture image";
      setError(errorMessage);
      setDebug((prev) => `${prev}\nCapture error: ${errorMessage}`);
    }
  };

  return (
    <div className="relative">
      {!showCamera ? (
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={startCamera}
              disabled={disabled || isInitializing}
              className="flex-1 hidden md:flex"
              size="lg"
              type="button"
            >
              <Camera className="mr-2 h-4 w-4" />
              {isInitializing ? "Initializing Camera..." : "Open Camera"}
            </Button>
            <Button
              onClick={() => uploadInputRef.current?.click()}
              disabled={disabled}
              variant="outline"
              size="lg"
              type="button"
              className="flex-1"
            >
              <Upload className="mr-2 h-4 w-4" />
              <span className="md:hidden">Capture/Upload</span>
              <span className="hidden md:inline">Upload</span>
            </Button>
          </div>
          <input
            ref={uploadInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          {error && (
            <div className="text-sm text-red-500 text-center">{error}</div>
          )}
          {debug && (
            <div className="text-xs text-gray-500 whitespace-pre-wrap">
              {debug}
            </div>
          )}
        </div>
      ) : (
        <div className="relative rounded-lg bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`h-auto w-full rounded-lg ${
              facingMode === "user" ? "scale-x-[-1]" : ""
            }`}
          />
          <canvas ref={canvasRef} className="hidden" />
          <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
            <Button
              onClick={switchCamera}
              size="lg"
              variant="outline"
              type="button"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
            <Button
              onClick={captureImage}
              size="lg"
              variant="default"
              type="button"
            >
              Capture
            </Button>
            <Button
              onClick={stopCamera}
              size="lg"
              variant="outline"
              type="button"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
