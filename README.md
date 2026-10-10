# debrief

An agent skill that turns finished work into a document you can study.

After a feature lands, `debrief` reads the change and writes one Markdown file
that explains it in Simplified Technical English: why the work exists, how it is
designed, how it runs, what it can break, and which tradeoffs it made. You read
the debrief first, then go into the code with a map.

It is for people who learn while they build, and for anyone who has to
understand a change they did not write line by line.

## What a debrief contains

| Section | Answers |
|---|---|
| Summary | What does this work do, and what is the one idea to remember? |
| Why this work exists | What problem did it solve? What happened before? |
| Design | What are the parts, and what is the one job of each part? |
| Workflow | What happens, step by step, for one real input? |
| Decisions and tradeoffs | What was chosen, what was the alternative, why, and at what cost? |
| Blast radius | What does this work need, what uses it, and what breaks if it changes? |
| Code reading path | Which files and lines do I read, in which order, and what do I look for? |
| Known limits | What does it not do? |
| Self-test | Do I understand it? Five questions, with answers. |

Diagrams are Mermaid, which GitHub renders. In VS Code, install a Mermaid preview
extension to see them.

## Two rules it does not bend

**Evidence.** Every statement comes from the diff, the code, a spec, a commit
message, or the conversation. Every design reason is labelled **Recorded** (a
source states it) or **Inferred** (deduced from the code). When no reason can be
found, the debrief says "Reason not recorded" and does not invent one.

**STE.** The prose obeys the writing rules of ASD-STE100: short sentences,
active voice, simple tenses, one word for one meaning. A bundled script checks
the rules that a program can measure, and the skill rewrites until it passes.

## Install

Copy the skill folder to where your agent reads skills.

```bash
git clone https://github.com/arkaslittlemind/debrief
```

| Scope | Copy `skills/debrief` to |
|---|---|
| Claude Code, all your projects | `~/.claude/skills/debrief` |
| Claude Code, one project | `<project>/.claude/skills/debrief` |
| Codex, Copilot, and other tools that read shared skills | `<project>/.agents/skills/debrief` |

The checker needs Node.js 18 or later. It has no dependencies.

## Use

```text
/debrief                 the most recently landed work
/debrief 4f2a9c1         one commit
/debrief main..my-branch a commit range
/debrief 128             a pull request
```

Debriefs are written to `design-docs/` at the repository root, one file per
piece of work, with an index in `design-docs/README.md`. To use another folder,
say so in your project instructions (`AGENTS.md` or `CLAUDE.md`).

The skill never commits. It writes the file, then offers a `docs:` commit.

### Run it after every feature

Add one line to your project instructions:

```markdown
After work lands on the default branch, run `/debrief` for that work before stopping.
```

### It fits your workflow

`debrief` needs only a Git repository. It does not assume a branching model, a
planning tool, or a spec format.

To learn why the work was done, it reads whatever your project keeps: specs,
plans, decision records, task files, pull requests and their issues, and commit
messages. The more of this exists, the more reasons come out as Recorded. With
commit messages alone it still works, and it labels more reasons as Inferred.

If your records live somewhere unusual, name the place in your project
instructions:

```markdown
Specs for finished work are in `docs/specs/`. Decision records are in `docs/adr/`.
```

## The checker by itself

```bash
node skills/debrief/scripts/ste-check.mjs design-docs/05-data-tools.md
```

| Level | Rule |
|---|---|
| Error | A sentence longer than 25 words, or longer than 20 words in a numbered step |
| Error | A paragraph longer than six sentences |
| Error | A contraction |
| Warning | A likely passive verb, a likely perfect tense, an -ing form, a semicolon |
| Warning | A word with a simpler replacement ("utilize", "in order to", "should") |

Exit code 0 means no errors. Warnings are questions for the writer: a technical
name such as "rate limiting" is a valid reason to keep an -ing form.

## About STE, honestly

ASD-STE100 Simplified Technical English is a controlled language maintained by
ASD, the AeroSpace, Security and Defence Industries Association of Europe. It
has two parts: writing rules and a dictionary of approved words.

This skill applies the writing rules. It does not include the dictionary, which
is licensed, and it cannot check that every word is an approved word. A debrief
therefore says that it obeys the STE writing rules, and that it is not a
certified STE document. You can request the full specification at no cost from
[asd-ste100.org](https://www.asd-ste100.org).

This project is not affiliated with or endorsed by ASD.

## Layout

```text
skills/debrief/
  SKILL.md                      the steps the agent follows
  reference/ste-rules.md        the writing rules
  reference/debrief-template.md the document shape
  scripts/ste-check.mjs         the checker
```

## License

MIT. See [LICENSE](LICENSE).
