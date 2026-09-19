'use strict';
const fs = require('node:fs');
const path = require('node:path');

// Hallway's personality collection: short curated lines, kept apart from the UI code and
// from every student snapshot. This module is the gate. Only approved, well-formed entries
// ever leave the server; drafts, retired lines and unsourced "facts" stay on disk.
// A missing or broken file switches personality off. It never affects coursework.
const SURFACES = ['daily_extra', 'all_clear', 'loading'];
const KINDS = ['joke', 'fact'];
const STATUSES = ['draft', 'approved', 'retired'];
const OFF = Object.freeze({version: 1, enabled: false, entries: []});

function httpsUrl(value) { try { return new URL(value).protocol === 'https:'; } catch { return false; } }
function isoDay(value) { return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value) && !Number.isNaN(Date.parse(value)); }

function checkEntry(entry) {
  const errors = [];
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return ['entry is not an object'];
  if (typeof entry.id !== 'string' || !/^[a-z0-9][a-z0-9-]{1,60}$/.test(entry.id)) errors.push('id must be a short kebab-case string');
  if (typeof entry.text !== 'string' || !entry.text.trim() || entry.text.length > 160) errors.push('text must be 1-160 characters');
  if (!Array.isArray(entry.surfaces) || !entry.surfaces.length || !entry.surfaces.every(s => SURFACES.includes(s))) errors.push('surfaces must list known surfaces');
  if (!KINDS.includes(entry.kind)) errors.push('kind must be joke or fact');
  if (!STATUSES.includes(entry.status)) errors.push('status must be draft, approved or retired');
  if (entry.kind === 'fact') {
    if (!httpsUrl(entry.source)) errors.push('a fact needs an https source');
    if (!isoDay(entry.reviewedAt)) errors.push('a fact needs a review date');
  }
  return errors;
}

// What the browser is allowed to see.
function publicCollection(raw) {
  if (!raw || typeof raw !== 'object' || raw.enabled !== true || !Array.isArray(raw.entries)) return OFF;
  const seen = new Set(), entries = [];
  for (const entry of raw.entries) {
    if (checkEntry(entry).length || entry.status !== 'approved' || seen.has(entry.id)) continue;
    seen.add(entry.id);
    entries.push({id: entry.id, text: entry.text.trim(), surfaces: [...entry.surfaces], kind: entry.kind, tone: typeof entry.tone === 'string' ? entry.tone.slice(0, 24) : '', source: entry.kind === 'fact' ? entry.source : null});
  }
  return entries.length ? {version: 1, enabled: true, entries} : OFF;
}

function loadCollection({file = path.join(__dirname, 'content', 'personality.json'), env = process.env} = {}) {
  if (String(env.HALLWAY_PERSONALITY || '').toLowerCase() === 'off') return OFF;
  try { return publicCollection(JSON.parse(fs.readFileSync(file, 'utf8'))); } catch { return OFF; }
}

module.exports = {SURFACES, checkEntry, publicCollection, loadCollection, OFF};
