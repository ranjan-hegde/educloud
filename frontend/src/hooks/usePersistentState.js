// usePersistentState.js
// Robust, loop-safe hook for reactive synchronized state backed by storageService.
// Uses deep equality checks to strictly prevent infinite setState re-render loops.

import { useState, useEffect, useRef, useCallback } from "react";
import * as storageService from "../services/storageService";

function areValuesEqual(a, b) {
  if (a === b) return true;
  if (a === null || b === null || a === undefined || b === undefined) return a === b;
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}

export function usePersistentState(key) {
  const [value, setValue] = useState(() => storageService.getData(key));
  const lastKnownJson = useRef(() => {
    try {
      return JSON.stringify(value);
    } catch {
      return "";
    }
  });
  const isFirstMount = useRef(true);

  // Write through to storage ONLY when the value actually changed semantically
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    let currentJson = "";
    try {
      currentJson = JSON.stringify(value);
    } catch {
      currentJson = "";
    }

    if (currentJson === lastKnownJson.current) {
      return; // No change, skip write to prevent loop
    }

    lastKnownJson.current = currentJson;
    storageService.setData(key, value);
  }, [key, value]);

  // Sync when another component or tab updates this key
  const syncFromStorage = useCallback(() => {
    const fresh = storageService.getData(key);
    let freshJson = "";
    try {
      freshJson = JSON.stringify(fresh);
    } catch {
      freshJson = "";
    }

    if (freshJson !== lastKnownJson.current) {
      lastKnownJson.current = freshJson;
      setValue(fresh);
    }
  }, [key]);

  useEffect(() => {
    function onCustomUpdate(e) {
      if (e.detail?.key === key) {
        syncFromStorage();
      }
    }

    function onNativeStorageEvent(e) {
      if (!e.key || e.key === "educloud_data") {
        syncFromStorage();
      }
    }

    window.addEventListener("educloud-storage-update", onCustomUpdate);
    window.addEventListener("storage", onNativeStorageEvent);

    return () => {
      window.removeEventListener("educloud-storage-update", onCustomUpdate);
      window.removeEventListener("storage", onNativeStorageEvent);
    };
  }, [key, syncFromStorage]);

  return [value, setValue];
}
