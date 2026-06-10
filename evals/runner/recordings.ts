import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { RunRecord } from "./types";

const RECORDINGS_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "recordings");

export const recordingPath = (id: string): string => join(RECORDINGS_DIR, `${id}.json`);

export const saveRecording = (record: RunRecord): void => {
  mkdirSync(RECORDINGS_DIR, { recursive: true });
  writeFileSync(recordingPath(record.scenarioId), `${JSON.stringify(record, null, 2)}\n`);
};

export const loadRecording = (id: string): RunRecord | null => {
  const path = recordingPath(id);
  if (!existsSync(path)) {
    return null;
  }
  return JSON.parse(readFileSync(path, "utf-8")) as RunRecord;
};

export const hasAnyRecordings = (): boolean => {
  if (!existsSync(RECORDINGS_DIR)) {
    return false;
  }
  return readdirSync(RECORDINGS_DIR).some((entry) => entry.endsWith(".json"));
};
