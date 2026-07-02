"use client";

import {Card, Chip, FancyButton, ProgressBar} from "@blakeui/react";
import {animate, useInView} from "motion/react";
import {useEffect, useRef, useState} from "react";

import {Iconify} from "@/components/iconify";

import {uploadFiles} from "../data/placeholder";
import {prefersReducedMotion} from "../use-replay";

const UPLOAD_DURATION_S = 2;

type UploadState = "idle" | "uploaded" | "uploading";

export function FileUploadCard() {
  const [fileIndex, setFileIndex] = useState(0);
  // Remount key for ProgressBar: a fresh run starts from a fresh element at 0,
  // so the fill never animates backwards from the previous run's 100.
  const [runId, setRunId] = useState(0);
  const [uploadState, setUploadState] = useState<UploadState>("uploading");
  const [progress, setProgress] = useState(0);
  const animationRef = useRef<ReturnType<typeof animate>>(undefined);
  const cardRef = useRef<HTMLDivElement>(null);
  const hasAutoplayed = useRef(false);
  const isInView = useInView(cardRef, {amount: 0.4, once: true});

  const file = uploadFiles[fileIndex % uploadFiles.length] as (typeof uploadFiles)[number];

  const run = (nextFileIndex = fileIndex) => {
    animationRef.current?.stop();
    // Full reset BEFORE the new run: file, key, progress, state — no half-reset.
    setFileIndex(nextFileIndex);
    setRunId((id) => id + 1);
    setProgress(0);
    setUploadState("uploading");

    // Reduced motion: jump straight to completed.
    if (prefersReducedMotion()) {
      setProgress(100);
      setUploadState("uploaded");

      return;
    }

    animationRef.current = animate(0, 100, {
      duration: UPLOAD_DURATION_S,
      ease: "easeOut",
      onComplete: () => setUploadState("uploaded"),
      onUpdate: (value) => setProgress(Math.round(value)),
    });
  };

  // Autoplay exactly once, on first scroll-into-view. The terminal state
  // persists — this card's replay is manual (Change / Upload File).
  useEffect(() => {
    if (!isInView || hasAutoplayed.current) return;

    hasAutoplayed.current = true;
    // Deferred a tick so the kick-off isn't a synchronous setState in-effect.
    const kickoff = setTimeout(run, 0);

    return () => clearTimeout(kickoff);
  }, [isInView]);

  useEffect(() => () => animationRef.current?.stop(), []);

  const removeFile = () => {
    animationRef.current?.stop();
    setUploadState("idle");
  };

  if (uploadState === "idle") {
    return (
      <Card ref={cardRef} className="w-full">
        <Card.Content className="w-full items-center gap-2 py-6 text-center">
          <Iconify className="text-2xl text-muted" icon="file" />
          <p className="text-sm text-muted">No file uploaded</p>
          <FancyButton size="sm" variant="basic" onPress={() => run()}>
            Upload File
          </FancyButton>
        </Card.Content>
      </Card>
    );
  }

  const isUploading = uploadState === "uploading";
  const uploadedMb = Math.round((progress / 100) * file.sizeMb);

  return (
    <Card ref={cardRef} className="w-full">
      <Card.Content className="w-full gap-3">
        <div className="flex w-full items-center gap-3">
          {/* Filled PDF glyph on a saturated coral disc — vivid content color
              permitted here (candidate A from the review strip). */}
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-500">
            <Iconify className="text-2xl text-white" icon="file-pdf-fill" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
            <span className="w-full truncate text-left text-sm font-medium">{file.fileName}</span>
            <span className="text-xs text-muted">
              {uploadedMb} MB of {file.sizeMb} MB
            </span>
          </div>
          {/* Flush right at row level — not inside the text-xs size span, whose
              inherited font metrics squeezed the chip's stock padding. */}
          <Chip
            className="shrink-0"
            color={isUploading ? "default" : "success"}
            size="sm"
            variant="soft"
          >
            {isUploading ? (
              "Uploading"
            ) : (
              <>
                <Iconify className="text-sm" icon="check" />
                Completed
              </>
            )}
          </Chip>
        </div>
        <ProgressBar
          key={runId}
          aria-label={`Upload progress for ${file.fileName}`}
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
            onPress={() => run(fileIndex + 1)}
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
        {/* Completion announced for screen readers, not just the chip color. */}
        <span aria-live="polite" className="sr-only">
          {uploadState === "uploaded" ? `${file.fileName} uploaded` : ""}
        </span>
      </Card.Content>
    </Card>
  );
}
