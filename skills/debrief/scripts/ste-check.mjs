#!/usr/bin/env node
// Measures the ASD-STE100 writing rules that a program can measure, in Markdown.
// Usage: node ste-check.mjs <file.md> [more.md ...]
// Exit code: 0 = no errors, 1 = errors found, 2 = bad usage.

import { readFileSync } from "node:fs";

const MAX_DESCRIPTIVE = 25;
const MAX_PROCEDURAL = 20;
const MAX_PARAGRAPH_SENTENCES = 6;

const IRREGULAR =
  "been|built|bound|broken|caught|chosen|done|drawn|found|given|held|hidden|kept|known|left|lost|made|put|read|run|seen|sent|set|shown|split|taken|thrown|written";
const PARTICIPLE = `(?:[a-z]+ed|${IRREGULAR})`;
const PASSIVE = new RegExp(`\\b(?:am|is|are|was|were|be|been|being)\\s+(?:[a-z]+ly\\s+)?${PARTICIPLE}\\b`, "gi");
const PERFECT = new RegExp(`\\b(?:has|have|had)\\s+(?:[a-z]+ly\\s+)?${PARTICIPLE}\\b`, "gi");
const CONTRACTION = /\b(?:[a-z]+n['’]t|[a-z]+['’](?:re|ve|ll|d|m)|(?:it|that|there|here|what|who|let)['’]s)\b/gi;
const ING = /\b[a-z]{2,}ing\b/gi;

// Common words that end in -ing but are not verb forms.
const ING_ALLOWED = new Set([
  "anything", "bring", "during", "everything", "king", "nothing", "ring",
  "something", "spring", "string", "thing",
]);

const AVOID = [
  [/\butili[sz]\w*\b/gi, "use"],
  [/\bleverag\w*\b/gi, "use"],
  [/\bperform(?:s|ed)?\b/gi, "do"],
  [/\bcarr(?:y|ies|ied) out\b/gi, "do"],
  [/\bensur(?:e|es|ed)\b/gi, "make sure"],
  [/\bin order to\b/gi, "to"],
  [/\bprior to\b/gi, "before"],
  [/\bvia\b/gi, "through or with"],
  [/\be\.g\./gi, "for example"],
  [/\bi\.e\./gi, "that is"],
  [/\betc\b\.?/gi, "the full list"],
  [/\bsince\b/gi, "\"because\" when it gives a reason"],
  [/\b(?:should|may|might)\b/gi, "\"must\", \"can\", or a statement of fact"],
  [/\b(?:simply|just|easily|obviously|basically)\b/gi, "nothing (remove the word)"],
];

// Replace Markdown syntax with plain text. A code span or a URL becomes the
// token CODE, which counts as one word and is exempt from the word checks.
function clean(text) {
  return text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, (_, label) => (label.includes("`") ? "CODE" : label))
    .replace(/`[^`]*`/g, "CODE")
    .replace(/https?:\/\/\S+/g, "CODE")
    .replace(/<[^>]+>/g, " ")
    .replace(/\*+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function splitSentences(text) {
  return text
    .split(/(?<=[.!?]["')\]]?)\s+(?=[("'[]?[A-Z])/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function countWords(sentence) {
  return (sentence.match(/[A-Za-z0-9][\w'’/.:-]*/g) ?? []).length;
}

// Turn the file into blocks: { kind, line, text }.
function parse(source) {
  const blocks = [];
  let current = null;
  let fence = null;
  let inComment = false;

  const flush = () => {
    if (current) blocks.push(current);
    current = null;
  };

  source.split(/\r?\n/).forEach((raw, index) => {
    const line = index + 1;

    if (fence) {
      if (raw.trim().startsWith(fence)) fence = null;
      return;
    }
    const fenceStart = raw.match(/^\s*(```|~~~)/);
    if (fenceStart) {
      flush();
      fence = fenceStart[1];
      return;
    }

    if (inComment) {
      if (raw.includes("-->")) inComment = false;
      return;
    }
    if (raw.trim().startsWith("<!--")) {
      flush();
      if (!raw.includes("-->")) inComment = true;
      return;
    }

    if (raw.trim() === "") return flush();
    if (/^#{1,6}\s/.test(raw)) return flush();

    if (/^\s*\|/.test(raw)) {
      flush();
      if (/^\s*\|?[\s:|-]+$/.test(raw)) return;
      for (const cell of raw.split("|")) {
        if (cell.trim()) blocks.push({ kind: "cell", line, text: cell });
      }
      return;
    }

    const ordered = raw.match(/^\s*\d+[.)]\s+(.*)$/);
    if (ordered) {
      flush();
      current = { kind: "step", line, text: ordered[1] };
      return;
    }
    const bullet = raw.match(/^\s*[-*+]\s+(?:\[[ xX]\]\s+)?(.*)$/);
    if (bullet) {
      flush();
      current = { kind: "bullet", line, text: bullet[1] };
      return;
    }

    const text = raw.replace(/^\s*>\s?/, "");
    if (current) current.text += " " + text;
    else current = { kind: "paragraph", line, text };
  });

  flush();
  return blocks;
}

function check(file) {
  const findings = [];
  const add = (level, line, message, excerpt) => findings.push({ level, line, message, excerpt });

  for (const block of parse(readFileSync(file, "utf8"))) {
    const text = clean(block.text);
    if (!text) continue;

    const sentences = splitSentences(text);
    const limit = block.kind === "step" ? MAX_PROCEDURAL : MAX_DESCRIPTIVE;

    if (block.kind === "paragraph" && sentences.length > MAX_PARAGRAPH_SENTENCES) {
      add("error", block.line, `Paragraph has ${sentences.length} sentences (limit ${MAX_PARAGRAPH_SENTENCES})`, sentences[0]);
    }

    for (const sentence of sentences) {
      const words = countWords(sentence);
      if (words > limit) add("error", block.line, `Sentence has ${words} words (limit ${limit})`, sentence);

      for (const match of sentence.match(CONTRACTION) ?? []) {
        add("error", block.line, `Contraction "${match}": write the full words`, sentence);
      }
      for (const match of sentence.match(PASSIVE) ?? []) {
        add("warning", block.line, `Possible passive "${match}": name who or what does the action`, sentence);
      }
      for (const match of sentence.match(PERFECT) ?? []) {
        add("warning", block.line, `Possible perfect tense "${match}": use a simple tense`, sentence);
      }
      const ing = [...new Set((sentence.match(ING) ?? []).map((w) => w.toLowerCase()))].filter((w) => !ING_ALLOWED.has(w));
      if (ing.length) {
        add("warning", block.line, `-ing form ${ing.map((w) => `"${w}"`).join(", ")}: keep only in a technical name`, sentence);
      }
      for (const [pattern, better] of AVOID) {
        for (const match of sentence.match(pattern) ?? []) {
          add("warning", block.line, `"${match}": write ${better}`, sentence);
        }
      }
      if (sentence.includes(";")) add("warning", block.line, "Semicolon: make two sentences", sentence);
    }
  }
  return findings;
}

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error("Usage: node ste-check.mjs <file.md> [more.md ...]");
  process.exit(2);
}

let errors = 0;
let warnings = 0;
for (const file of files) {
  for (const { level, line, message, excerpt } of check(file)) {
    if (level === "error") errors += 1;
    else warnings += 1;
    const short = excerpt.length > 90 ? excerpt.slice(0, 87) + "..." : excerpt;
    console.log(`${file}:${line}  ${level.toUpperCase().padEnd(7)}  ${message}\n    ${short}`);
  }
}
console.log(`\n${errors} error(s), ${warnings} warning(s) in ${files.length} file(s).`);
process.exit(errors > 0 ? 1 : 0);
