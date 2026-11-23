// All cabinets in this installed workbench share their controls and scores.
const arcadeRoot = location.pathname
  .replace(/\/games\/[^/]+\/(?:index\.html)?$/, "/")
  .replace(/\/(?:index\.html)?$/, "");
const recordPrefix = "penguin.pocket-arcade:" + arcadeRoot + ":";
function readRecord(key) {
  try {
    return localStorage.getItem(recordPrefix + key);
  } catch {
    return null;
  }
}
function writeRecord(key, value) {
  try {
    localStorage.setItem(recordPrefix + key, String(value));
  } catch {
    // Storage may be disabled in an embedded or file-based cabinet.
  }
}
