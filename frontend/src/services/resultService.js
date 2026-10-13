// resultService.js — MOCK. Replace with real REST calls later.
import { delay } from "./_utils";
import { resultsData } from "../data/mockData";

export function getResults() {
  return delay(resultsData);
}

export function saveMarks(entry) {
  return delay({ success: true, entry }, 600);
}
