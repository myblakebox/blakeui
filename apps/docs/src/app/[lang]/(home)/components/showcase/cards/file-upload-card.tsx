"use client";

import {Card, Chip, FancyButton, ProgressBar} from "@blakeui/react";
import {useEffect, useRef, useState} from "react";

import {Iconify} from "@/components/iconify";

import {upload} from "../data/placeholder";

export function FileUploadCard() {
  const [progress, setProgress] = useState(100);
  const [isRemoved, setIsRemoved] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const isCompleted = progress >= 100;
  const uploadedMb = Math.round((progress / 100) * upload.sizeMb);

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const startUpload = () => {
    clearInterval(intervalRef.current);
    setIsRemoved(false);

    // Under reduced motion the upload completes instantly instead of animating.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setProgress(100);

      return;
    }

    setProgress(0);
    intervalRef.current = setInterval(() => {
      setProgress((value) => {
        if (value >= 100) {
          clearInterval(intervalRef.current);

          return value;
        }

        return Math.min(value + 10, 100);
      });
    }, 150);
  };

  const removeFile = () => {
    clearInterval(intervalRef.current);
    setProgress(100);
    setIsRemoved(true);
  };

  if (isRemoved) {
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

  return (
    <Card className="w-full">
      <Card.Content className="w-full gap-3">
        <div className="flex w-full items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-default-soft">
            <Iconify className="text-xl text-muted" icon="file-pdf" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col items-start">
            <span className="w-full truncate text-left text-sm font-medium">{upload.fileName}</span>
            <span className="text-xs text-muted">
              {uploadedMb} MB of {upload.sizeMb} MB
            </span>
          </div>
          <Chip color={isCompleted ? "success" : "default"} size="sm" variant="soft">
            {isCompleted ? (
              <>
                <Iconify className="text-sm" icon="check" />
                Completed
              </>
            ) : (
              "Uploading"
            )}
          </Chip>
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
          <FancyButton fullWidth size="sm" variant="basic" onPress={startUpload}>
            Change
          </FancyButton>
          <FancyButton fullWidth size="sm" variant="danger" onPress={removeFile}>
            Remove
          </FancyButton>
        </div>
      </Card.Content>
    </Card>
  );
}
