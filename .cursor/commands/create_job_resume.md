You are helping the user produce a tailored resume for a specific job, then strengthen it by filling evidence gaps through conversation.

## Inputs

- Job file (user-provided path), conforming to `src/job_schema.json`
- Master resume: `src/resumes/master_resume.json`
- Resume schema: `src/resume_schema.json`

## Workflow

### Phase 1: Build initial tailored resume

1. Read the job file, `src/resumes/master_resume.json`, and `src/resume_schema.json`.
2. Extract job signals:
   - Essential requirements: `keyAttributes` marked `(essential)` + repeated themes in `responsibilities`
   - Nice-to-haves: `keyAttributes` marked `(nice to have)`
   - Role type: infer discipline from title, responsibilities, and team context
   - Company/team context: stage, size signals, values, tone
3. Match requirements to resume content using normalized lowercase terms and simple aliases (e.g. `ts`->`typescript`, `js`->`javascript`, `k8s`->`kubernetes`, `gcp`->`google cloud`, `aws`->`amazon web services`), then fallback to substring overlap.
4. Select and order content:
   - `experience`: keep all entries; move low-overlap entries later. Prioritize the most relevant `impactEntries` (surface top 2-3 first when many exist).
   - `skills`: keep all skills; order as essential-match -> nice-to-have-match -> remaining.
   - `education`: keep unchanged.
   - `projects`: keep relevant ones by `skills`/`impactEntries`; omit unrelated projects unless fewer than two exist in master.
   - `certifications`: keep all.
   - `significantItems`: keep items matching role type or company values.
5. Rewrite `summary` in 2-4 sentences: role-aligned opening, 2-3 requirement-matched strengths, close with fit for role/company.
6. Set metadata:
   - `id`: `{job-id}-resume`
   - `metaTitle`: `{Candidate Name} — {jobTitle} at {company}`
   - Copy `name`, `email`, `phone`, `location`, `links` unchanged from master.
7. Validate against `src/resume_schema.json` and ensure expected top-level fields exist (unless absent in master): `name`, `email`, `phone`, `location`, `links`, `summary`, `experience`, `education`, `skills`, `certifications`.
8. Save to `src/resumes/resume_{job-id}.json` with 2-space indentation.

### Phase 2: Identify gaps

Review every job `keyAttributes` and `responsibilities` item for direct evidence in the tailored resume.

Create and present a gap list before continuing:

- Hard gaps: essential items with no matching skills or `impactEntries` in master.
- Soft gaps: only partial/tangential evidence.

### Phase 3: Fill gaps through conversation

Work one gap at a time (or small related clusters).

1. Ask a targeted recall question tied to the gap type (technical, responsibility, leadership/scope, domain).
2. Always ask for metrics and scope when applicable.
3. If user has no relevant experience, mark it as a confirmed gap and move on.
4. If user provides useful detail:
   - Draft one concise, action-oriented, past-tense `impactEntry` (include metrics/scope when available).
   - Show it to the user for confirmation/edit before saving.
5. After confirmation, update both files:
   - `src/resumes/master_resume.json`: add to best matching experience/project entry; if unclear, ask user where it belongs.
   - `src/resumes/resume_{job-id}.json`: add the same entry in job-relevant position.
6. Update relevant experience/project `skills` arrays if new tools/tech were mentioned.
7. After all gaps, provide a concise final summary:
   - new `impactEntries` added (and where)
   - remaining confirmed gaps

### Phase 4: Align language to job post

Do a final pass on tailored resume `impactEntries` to better match job-post language (terms and verbs), while preserving original meaning and factual accuracy.

## Non-negotiable rules

- Never invent or embellish. Facts must come from master resume, job file, or user-provided details.
- Do not remove contact info, education, or certifications.
- New `impactEntries` from Phase 3 must be user-confirmed before saving.
- Ask gap questions incrementally (one at a time, or clusters of 2-3 related items), not all at once.
- If job signal is too weak for confident tailoring, ask one targeted clarifying question before proceeding.
