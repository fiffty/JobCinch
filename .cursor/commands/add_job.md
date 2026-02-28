The user wants to add a new job to track. They will provide a job posting URL.

1. Visit the provided URL and extract all relevant job information.
2. Create a new JSON file in `src/jobs/` that conforms to `src/job_schema.json`.
3. Use `src/jobs/example_job.json` as a formatting reference.
4. Name the file using the pattern: `{company}-{job-title}.json` (lowercase, hyphenated). If a file with that name already exists, append `-2`, `-3`, etc. (e.g. `acme-senior-engineer-2.json`).
5. Confirm the file path and briefly summarize what was extracted (company, role, salary range if any).

If the URL cannot be accessed or the content cannot be reliably extracted, ask the user to paste key details (company, title, salary, etc.) or provide an alternative source.

## Schema reference

Populate every field you can from the job posting. For fields not found in the posting, use these defaults:

- **id**: `{company}-{job-title}` (lowercase, hyphenated, no suffix unless duplicate)
- **currency**: Infer from location, default `"USD"`
- **salaryMin / salaryMax**: Use values from posting, or `0` if not listed
- **rsu**: Use value from posting, or `0` if not listed
- **stockOption / bonus**: Use values from posting, or `""` if not listed
- **remote**: Use `"full"` if fully remote, `"hybrid"` if hybrid, `"on-site"` if onsite only, or `false` if unclear
- **visaSponsorship**: `false` unless explicitly stated
- **city / country / address**: Extract when given; leave `""` if not found
- **companyDescription / teamDescription**: Extract from the posting; leave `""` if absent
- **responsibilities / perks**: Use arrays of strings from the posting; use `[]` if absent
- **referrer / pointOfContact**: Set both to `{ "name": "", "link": "", "conversationSummary": "" }`
- **status**: Leave all fields empty unless user says otherwise.

## Input

$ARGUMENTS
