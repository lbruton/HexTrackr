#!/usr/bin/env node
/* eslint-env node */
/* global require, module, process, console */
/* eslint no-console: "off" */

// Tracked shim to run the rMemory organizer. The .rMemory directory is a symlink
// and is intentionally ignored by Git. This shim allows invoking the organizer
// and serves as a stable entrypoint in this repository.

try {
  const { HierarchicalMemoryOrganizer } = require("../.rMemory/core/hierarchical-memory-organizer.js");
  if (require.main === module) {
    const organizer = new HierarchicalMemoryOrganizer();
    organizer.organizeMemoryHierarchy()
      .then(() => process.exit(0))
      .catch(err => {
        console.error("Organizer failed:", err);
        process.exit(1);
      });
  }
} catch (e) {
  console.error("Unable to load organizer from .rMemory symlink. Ensure the symlink is present and points to the rMemory toolkit.");
  console.error(e && e.message ? e.message : e);
  process.exit(1);
}
