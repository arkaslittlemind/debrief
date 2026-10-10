---
name: debrief
description: Debrief finished work into a study document in Simplified Technical English (ASD-STE100 rules) - why it exists, how it is designed, the run-time workflow, the blast radius, and the tradeoffs. Use after a feature, fix, or rollback lands (a merge, a squash, a closed pull request), or when the user asks for a debrief or a design doc of work that is already built.
argument-hint: "[commit | range | branch | PR | work item id]"
---

# debrief - turn finished work into a document you can study

A **debrief** is one Markdown file that lets a reader understand a finished piece
of work without reading all of its code. The reader is a **learner**: they know
basic programming, they are new to this stack, and they study the debrief to
learn how the system works and why it was built this way.

Two rules govern every step:

- **Evidence.** Every statement comes from something read in this run: the diff,
  the code, a spec, a commit message, a finding, or this conversation. Every
  design reason carries a label. **Recorded** means a source states the reason;
  name the source. **Inferred** means you deduced it from the code; say from
  what. A reason with no evidence is written as "Reason not recorded". An honest
  gap teaches more than an invented reason.
- **STE.** The prose obeys [reference/ste-rules.md](reference/ste-rules.md) and
  passes `scripts/ste-check.mjs`.

Debrief reads source code and writes only inside the debrief directory. A defect
found on the way goes into the debrief's Known limits and the hand-over report.

## Input

One optional argument names the work: a commit, a commit range, a branch, a pull
request, or a work item id. No argument means the most recently landed work.

The debrief directory is `design-docs/` at the repository root, unless project
instructions name another one.

## Step 1 - fix the scope

Resolve the work to one **change** and its **intent record**.

The **change** is a commit or a commit range. A named argument decides it. With
no argument it is the most recently landed work: the branch against its
merge-base when the current branch is ahead of the default branch, otherwise the
newest merge or squash commit on the default branch.

The **intent record** is everything written down about what the work was for.
Projects keep it in different places, so search each of these and use every
source that matches the change:

1. The location that project instructions name for specs, plans, or history.
2. Files that the change itself adds, moves, or completes: a spec, a plan, a
   design note, a decision record, a task file, a changelog entry.
3. The pull request or merge request, its linked issues, and its review
   comments, when a command-line client for the host is available.
4. The commit messages of the change.
5. This conversation, when the work was built in it.

Commit messages always exist, so the search never comes back empty. A thin
intent record gives more Inferred reasons, and the debrief says so.

If two changes fit, ask which one.

**Done when** you can state the commit range, every intent source found (or
"commit messages only"), and the id and title of the work.

## Step 2 - read the change

Read every file in the diff in full, at the final commit of the change. Sort
each file into a **part**: a unit with one job. Then follow one **trace**: pick
one real input and follow it through the code from the entry point to the
result.

**Done when** every changed file belongs to a named part or is listed as support
(config, lockfile, generated file), and the trace names each function it passes
through with file and line.

## Step 3 - map the blast radius

The **blast radius** is everything that can break when this work fails or
changes. For every interface the change adds or alters (exported function,
route, table or column, environment variable, config key, command, dependency),
search the repository for its consumers. Record three things:

- **Upstream** - what this work needs to run, and what happens when each one fails.
- **Downstream** - what uses this work, found by search.
- **Shared ground** - anything other work also relies on that this change touched.

**Done when** every altered interface has a searched consumer list (an empty
list is a valid result: write "No consumers yet") and every upstream dependency
has a failure mode.

## Step 4 - recover the decisions

A **decision** is a point where a competent engineer could have chosen
differently: a library, a data shape, where a boundary sits, where validation
happens, how errors behave, what was left out. For each one, collect the choice,
the alternatives, the reason, the cost, and the Recorded or Inferred label.

Look for reasons in the intent record, the findings and review, commit messages,
code comments, and the conversation.

**Done when** every decision has all five fields, and every reason carries its
label and its source.

## Step 5 - write

Fill [reference/debrief-template.md](reference/debrief-template.md) and save it
in the debrief directory:

- Work with an id (a plan item, a ticket, an issue, a pull request):
  `<id>-<kebab-title>.md`, for example `05-data-tools.md`.
- Work without an id: `<YYYY-MM-DD>-<kebab-title>.md`, dated by the change.
- A debrief that already exists for the same change is revised in place. When
  the filename belongs to a debrief of another change, add the short commit
  hash of this change to the name.

Write for the learner:

- At the first use of each tool, pattern, or term that this work introduces,
  give one sentence on what it is and one sentence on why this work uses it.
- A diagram earns its place when it shows three or more parts or actors. Use
  Mermaid: a `flowchart` for the design, a `sequenceDiagram` for the trace.
- Link each stop on the code reading path to the file and line, relative to the
  debrief directory.
- Write five self-test questions that ask "why" or "what happens if". Each
  answer cites the section that explains it.
- A debrief is read in one sitting. Aim for 800 to 1,500 words of prose. Large
  work gets one Design subsection per subsystem, in the same file.

**Done when** every template section is filled or removed with a stated reason.

## Step 6 - check

1. Run `node <this skill's directory>/scripts/ste-check.mjs <debrief file>`.
   Rewrite every error. Review every warning: rewrite it, or keep it when the
   flagged word is a technical name. Run again until the script exits with 0.
2. Check the facts against the repository at the change's commit: every path
   and line link resolves, every diagram node is a part named in Design, and
   every self-test answer cites a section that exists.

**Done when** the script exits with 0 and all three fact checks pass.

## Step 7 - index and hand over

Add one line for this debrief to `README.md` in the debrief directory, in id or
date order. Create that file with a one-line title when it is absent.

Report the debrief path, the STE check result, the count of Recorded and
Inferred reasons, each "Reason not recorded" gap, and each defect found. Then
offer the commit `docs: debrief <id> <title>` and wait for approval. The
project's own commit rules apply.
