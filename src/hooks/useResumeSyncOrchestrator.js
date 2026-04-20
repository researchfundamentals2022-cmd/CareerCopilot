import { useCallback, useRef } from "react";
import { getResumeContentHash, saveResumeSectionsBatch } from "../services/resumeBuilderApi";

/**
 * Strict Imperative Orchestrator Hook
 * Ensures that the projection table (resume_full_documents) is ONLY ever updated through a single,
 * protected entry point, eliminating effect-driven Read/Write Storms.
 */
export function useResumeSyncOrchestrator({
  resumeId,
  userId,
  getLatestResumeData,
  setProjectionStatus,
  setProjectionMessage,
  setLatestProjectedVersion,
}) {
  const isSyncingRef = useRef(false);
  const pendingSyncReasonRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const lastProjectedHashRef = useRef("");
  const latestProjectedVersionRef = useRef(null);

  // Called ONLY by initPage when we verify a read-model already exists.
  const setInitialHash = useCallback((hash, version = null) => {
    lastProjectedHashRef.current = hash;
    if (version !== null) {
      latestProjectedVersionRef.current = version;
    }
  }, []);

  const executeSync = async (reason) => {
    if (!resumeId || !userId) return false;

    if (isSyncingRef.current) {
      // If a sync is already in flight, queue this reason to run immediately after.
      // This ensures "Review" navigation never gets dropped.
      pendingSyncReasonRef.current = reason;
      return false;
    }

    const { resumeData, customSections } = getLatestResumeData();
    const currentHash = getResumeContentHash(resumeData, customSections);

    if (currentHash === lastProjectedHashRef.current) {
      setProjectionStatus?.("up_to_date");
      setProjectionMessage?.("Preview is up to date.");
      return true;
    }

    try {
      isSyncingRef.current = true;
      setProjectionStatus?.("updating");
      setProjectionMessage?.("Updating preview...");

      // Perform the actual API projection step without regenerating fragments
      const result = await saveResumeSectionsBatch({
        sectionKeys: [], // Only trigger projection, fragmented saves happened earlier
        resumeId,
        userId,
        resumeData,
        customSections,
        regenerateReadModel: true,
        version: latestProjectedVersionRef.current !== null ? latestProjectedVersionRef.current + 1 : undefined,
      });
      
      if (result?.version) {
        setLatestProjectedVersion?.(result.version);
        latestProjectedVersionRef.current = result.version;
        lastProjectedHashRef.current = currentHash;
      }

      setProjectionStatus?.("up_to_date");
      setProjectionMessage?.("Preview is up to date.");
      return true;
    } catch (e) {
      setProjectionStatus?.("error");
      setProjectionMessage?.("Failed to update preview.");
      return false;
    } finally {
      isSyncingRef.current = false;
      
      // If a request was queued while we were busy, run it now.
      if (pendingSyncReasonRef.current) {
        const nextReason = pendingSyncReasonRef.current;
        pendingSyncReasonRef.current = null;
        executeSync(nextReason);
      }
    }
  };

  const requestSync = useCallback((reason, options = { immediate: false }) => {
    // Always clear the existing debounce timer if a new request comes in
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    if (options.immediate) {
      return executeSync(reason);
    }

    return new Promise((resolve) => {
      debounceTimerRef.current = setTimeout(async () => {
        const success = await executeSync(reason);
        resolve(success);
      }, 15000); // 15s debounce for idle editing syncs
    });
  }, [resumeId, userId, getLatestResumeData, setProjectionStatus, setProjectionMessage, setLatestProjectedVersion]);

  return { requestSync, setInitialHash };
}
