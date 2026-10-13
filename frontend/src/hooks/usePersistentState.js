// usePersistentState.js
// Drop-in replacement for useState(initialData) that automatically reads
// from and writes through to the shared storageService (localStorage-backed).
// Usage is identical to useState: const [items, setItems] = usePersistentState("students");
//
// It also stays in sync when the SAME key is changed elsewhere:
//   - by another mounted component in this tab (custom "educloud-storage-update" event)
//   - by another browser tab entirely (native "storage" event)
// This matters for cross-role flows like Student submitting feedback while
// a Faculty page reading the same key is already open.

import { useState, useEffect, useRef } from "react";
import * as storageService from "../services/storageService";

export function usePersistentState(key) {
  const [value, setValue] = useState(() => storageService.getData(key));
  const isFirstRun = useRef(true);
  const lastWritten = useRef(value);

  // Write through to storage whenever THIS hook's own state changes.
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    lastWritten.current = value;
    storageService.setData(key, value);
  }, [key, value]);

  // React to changes made by other components/tabs to this same key.
  useEffect(() => {
    function syncFromStorage() {
      const fresh = storageService.getData(key);
      if (fresh !== lastWritten.current) {
        lastWritten.current = fresh;
        setValue(fresh);
      }
    }
    function onCustomUpdate(e) {
      if (e.detail?.key === key) syncFromStorage();
    }
    function onNativeStorageEvent(e) {
      // Native "storage" only fires in OTHER tabs, with the raw namespace key.
      if (!e.key || e.key === "educloud_data") syncFromStorage();
    }
    window.addEventListener("educloud-storage-update", onCustomUpdate);
    window.addEventListener("storage", onNativeStorageEvent);
    return () => {
      window.removeEventListener("educloud-storage-update", onCustomUpdate);
      window.removeEventListener("storage", onNativeStorageEvent);
    };
  }, [key]);

  return [value, setValue];
}
