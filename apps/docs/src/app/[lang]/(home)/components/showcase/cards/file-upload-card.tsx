"use client";

import {Card, Chip, FancyButton, ProgressBar} from "@blakeui/react";
import {useEffect, useRef, useState} from "react";

import {Iconify} from "@/components/iconify";

import {upload} from "../data/placeholder";
import {prefersReducedMotion, useAutoRevert} from "../use-replay";

const UPLOAD_DURATION_MS = 2000;

/** "resting" is the neutral completed file; "uploaded" is the fresh success. */
type UploadState = "idle" | "resting" | "uploaded" | "uploading";

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

export function FileUploadCard() {
  const [uploadState, setUploadState] = useState<UploadState>("resting");
  const [progress, setProgress] = useState(100);
  const frameRef = useRef(0);

  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  // Replay rule: the success chip settles back to the neutral completed row.
  useAutoRevert(uploadState === "uploaded", () => setUploadState("resting"));

  const startUpload = () => {
    cancelAnimationFrame(frameRef.current);

    // Reduced motion: the animated fill becomes an instant completed swap.
    if (prefersReducedMotion()) {
      setProgress(100);
      setUploadState("uploaded");

      return;
    }

    setProgress(0);
    setUploadState("uploading");

    const startedAt = performance.now();

    const tick = (now: number) => {
      const elapsed = Math.min((now - startedAt) / UPLOAD_DURATION_MS, 1);

      setProgress(Math.round(easeOutCubic(elapsed) * 100));

      if (elapsed < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        setUploadState("uploaded");
      }
    };

    frameRef.current = requestAnimationFrame(tick);
  };

  const removeFile = () => {
    cancelAnimationFrame(frameRef.current);
    setProgress(100);
    setUploadState("idle");
  };

  if (uploadState === "idle") {
    return (
      <Card className="w-full">
        <Card.Content className="w-full items-center gap-2 py-6 text-center">
          <Iconify className="text-2xl text-muted" icon="file" />
          <p className="text-sm text-muted">No file uploaded</p>
          <FancyButton size="sm" variant="basic" onPress={startUpload}>
            Upload File
          </FancyButton>
        </Card.Content>
      </Card>
    );
  }

  const isUploading = uploadState === "uploading";
  const uploadedMb = Math.round((progress / 100) * upload.sizeMb);

  return (
    <Card className="w-full">
      <Card.Content className="w-full gap-3">
        {/* Status chip rides the size line (not the corner) so the filename gets
            full width at 300px and the docs chip owns the top-right. */}
        <div className="flex w-full items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-default-soft">
            <Iconify className="text-xl text-muted" icon="file-pdf" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
            <span className="w-full truncate text-left text-sm font-medium">{upload.fileName}</span>
            <span className="flex items-center gap-2 text-xs text-muted">
              {uploadedMb} MB of {upload.sizeMb} MB
              <Chip color={isUploading ? "default" : "success"} size="sm" variant="soft">
                {isUploading ? (
                  "Uploading"
                ) : uploadState === "uploaded" ? (
                  <>
                    <Iconify className="text-sm" icon="check" />
                    Uploaded
                  </>
                ) : (
                  <>
                    <Iconify className="text-sm" icon="check" />
                    Completed
                  </>
                )}
              </Chip>
            </span>
          </div>
        </div>
        <ProgressBar
          aria-label={`Upload progress for ${upload.fileName}`}
          className="w-full"
          value={progress}
        >
          <ProgressBar.Track>
            <ProgressBar.Fill />
          </ProgressBar.Track>
        </ProgressBar>
        <div className="flex w-full gap-2">
          <FancyButton
            fullWidth
            isDisabled={isUploading}
            size="sm"
            variant="basic"
            onPress={startUpload}
          >
            Change
          </FancyButton>
          <FancyButton
            fullWidth
            isDisabled={isUploading}
            size="sm"
            variant="danger"
            onPress={removeFile}
          >
            Remove
          </FancyButton>
        </div>
        {/* Success announced for screen readers, not just the chip color. */}
        <span aria-live="polite" className="sr-only">
          {uploadState === "uploaded" ? `${upload.fileName} uploaded` : ""}
        </span>
      </Card.Content>
    </Card>
  );
}
