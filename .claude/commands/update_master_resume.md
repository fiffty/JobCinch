You are helping the user create or update their master resume stored at `src/resumes/master_resume.json`.

## Your job

Upsert `src/resumes/master_resume.json` based on the input provided (a resume file, raw text, or explicit instructions). The output must conform to `src/resume_schema.json`.

## Steps

1. **Read the schema** — load `src/resume_schema.json` so you understand every field and its intent.
2. **Read the current master resume** — load `src/resumes/master_resume.json`. If it does not exist, start from an empty object.
3. **Parse the input** — the user may provide:
   - A resume file (PDF, DOCX, plain text, or another JSON resume)
   - Free-text instructions (e.g. "add my new job at Acme Corp", "update my email", "add a React skill entry")
   - A combination of both
4. **Merge intelligently**:
   - Never delete existing data unless the user explicitly asks to remove something.
   - For array sections (`experience`, `education`, `skills`, `projects`, `certifications`, `significantItems`): match on natural keys and use safer composite keys where needed.
     - `experience`: company + jobTitle + startDate
     - `education`: institution + degree (+ endDate when available)
     - `skills`: name
     - `projects`: name + link (or name + description if no link)
     - `certifications`: name + issuer (+ issuedAt when available)
     - `significantItems`: title + kind (or title + date when kind is missing)
   - If required key parts for a confident match are missing, ask a targeted clarifying question before merging that entry.
   - Update matched entries in place; append unmatched entries.
   - For scalar fields (`name`, `email`, `phone`, `summary`, `location`, `links`): overwrite only when new data is explicitly provided.
   - For `impactEntries` (a list of plain strings): copy bullet points **verbatim** from the source. The only exception is deduplication — if a new bullet point substantially overlaps with an existing one, keep the new version and drop the old one. Never rewrite, embellish, or infer content not explicitly present in the input.
   - Preserve existing `highlights` unless the user explicitly asks to replace or remove them.
5. **Validate before write** — validate the merged JSON against `src/resume_schema.json`. If invalid, either fix deterministically from known data or ask a targeted clarifying question before writing.
6. **Write the result** — overwrite `src/resumes/master_resume.json` with the merged JSON, pretty-printed with 2-space indentation.
7. **Summarise changes** — after writing, tell the user what was added, updated, or left unchanged in plain language.

## Rules

- Output must be valid JSON that conforms to `src/resume_schema.json`.
- **Do not invent or hallucinate details not present in the input or the existing file.** When in doubt, leave a field empty rather than guess.
- `impactEntries` strings must be taken directly from the source text. Never rewrite or fabricate bullet points. Only modify an existing bullet when a new one from the input substantially overlaps with it — in that case, prefer the user's wording and remove the old one.
- If the input is ambiguous (e.g. a new job but no dates), ask a targeted clarifying question before writing.
- Dates must follow the schema-allowed format for each field (`YYYY`, `YYYY-MM`, or `YYYY-MM-DD` as applicable). For current roles, omit `endDate` or leave it `""`.
- Keep `id` and `metaTitle` stable unless the user explicitly asks to change them.
