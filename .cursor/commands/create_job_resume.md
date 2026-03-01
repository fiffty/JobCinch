You are helping the user create a tailored resume for a specific job application.

## Inputs

- **Job file** — a JSON file conforming to `src/job_schema.json` (the user will provide the path)
- **Master resume** — `src/resumes/master_resume.json`
- **Resume schema** — `src/resume_schema.json`

## Steps

### 1. Load all source files

Read the job file, `src/resumes/master_resume.json`, and `src/resume_schema.json` before doing anything else.

### 2. Analyse the job

Extract the signal that drives tailoring decisions:

- **Essential requirements** — `keyAttributes` entries marked `(essential)`, plus recurring themes in `responsibilities`
- **Nice-to-haves** — `keyAttributes` entries marked `(nice to have)`
- **Role type signals** — infer the primary discipline (backend, frontend, fullstack, infra, ML, product, leadership, etc.) from the job title, responsibilities, and team description
- **Company/team context** — note company size signals, stage, and any stated values from `companyDescription` and `teamDescription` that can inform tone
- **Term normalization** — when matching job requirements to resume content, normalize to lowercase and apply simple alias mapping before scoring (e.g. `ts` -> `typescript`, `js` -> `javascript`, `k8s` -> `kubernetes`, `gcp` -> `google cloud`, `aws` -> `amazon web services`)

### 3. Score and select master resume content

For each section of the master resume, identify what to include, reorder, or omit:

**Experience**
- Include all entries by default; deprioritise (move to end) entries with low skill overlap.
- Within each entry, select `impactEntries` that most directly evidence the essential requirements. If an entry has many `impactEntries`, surface the top 2–3 most relevant and keep the remainder in original order.
- Do not fabricate new `impactEntries`. Only reframe existing ones by choosing different emphasis in ordering.

**Skills**
- Include all skills but reorder: skills that appear in `keyAttributes` or `responsibilities` come first, ordered by essentialness (essential → nice to have → remaining).
- Matching rule: compare normalized lowercase tokens and aliases first, then substring overlap as a fallback.

**Education**
- Include all education entries unchanged. Preserve existing wording and dates.

**Projects**
- Include projects where the `skills` or `impactEntries` match job requirements. Omit projects with no clear relevance unless the master resume has fewer than two projects total.

**Certifications**
- Include all certifications. If a certification directly matches a job requirement, it will surface naturally via skill ordering.

**significantItems**
- Include items whose `tags` or `kind` overlap with the role type or company values. Omit items with no connection to the role.

### 4. Rewrite the summary

Write a new `summary` (2–4 sentences) that:
- Opens with the candidate's years of experience and primary discipline, framed toward the target role
- Calls out 2–3 strengths that directly match the essential requirements
- Closes with a signal about why this role/company is a fit (draw from `teamDescription` or `companyDescription` if useful)

Only use facts present in the master resume. Do not invent credentials.

### 5. Set metadata

- `id`: `{job-id}-resume` (use the job file's `id` field)
- `metaTitle`: `{Candidate Name} — {jobTitle} at {company}`
- All personal contact fields (`name`, `email`, `phone`, `location`, `links`): copy unchanged from master resume

### 6. Validate

Confirm the output is valid JSON conforming to `src/resume_schema.json`. Fix any structural issues before writing.
Also confirm these top-level fields are present in the tailored resume unless they are absent in the master resume: `name`, `email`, `phone`, `location`, `links`, `summary`, `experience`, `education`, `skills`, `certifications`.

### 7. Write the output file

Save to `src/resumes/resume_{job-id}.json`, pretty-printed with 2-space indentation.

### 8. Summarise

After writing, report:
- Which experience entries were included and which (if any) were deprioritised
- Which `impactEntries` were surfaced as top picks per role, and why
- Which projects and significantItems were included or omitted, and why
- Key gaps: essential requirements from the job that have weak or no coverage in the master resume (flag these so the user can decide whether to strengthen the master resume)

## Rules

- Never invent or embellish content. Every fact must come from the master resume or the job file.
- Do not remove contact info, education, or certifications.
- The tailored resume is a curated view of the master resume — not a rewrite. Wording inside `impactEntries` must remain unchanged.
- Do not create new bullets by paraphrasing `impactEntries`; selection and ordering only.
- If the job file has insufficient signal for confident tailoring (e.g. missing `keyAttributes`, vague `responsibilities`, and little team/company context), ask one targeted clarifying question before proceeding.
