The user wants to add a new job to track. They will provide a job posting URL.

1. First, run `bun run scrape <url>` (where `<url>` is the provided job posting URL) to extract the page content. Use the scraped output as your primary source of job information.
2. If the scrape script fails or returns unusable output, fall back to visiting the URL directly to extract job information.
3. Create a new JSON file in `src/jobs/` that conforms to `src/job_schema.json`.
4. Use `src/jobs/example_job.json` as a formatting reference.
5. Name the file using the pattern: `{company}-{job-title}.json` (lowercase, hyphenated). If a file with that name already exists, append `-2`, `-3`, etc. (e.g. `acme-senior-engineer-2.json`).
6. Confirm the file path and briefly summarize what was extracted (company, role, salary range if any).

If neither the scrape script nor direct URL access yields reliable content, ask the user to paste key details (company, title, salary, etc.) or provide an alternative source.

## Schema reference

Populate every field you can from the job posting. For fields not found in the posting, use these defaults:

- **id**: `{company}-{job-title}` (lowercase, hyphenated, no suffix unless duplicate)
- **currency**: Infer from location, default `"USD"`
- **salaryMin / salaryMax**: Use values from posting, or `0` if not listed
- **rsu**: Use value from posting, or `0` if not listed
- **stockOption / bonus**: Use values from posting, or `""` if not listed
- **remote**: Use `"full"` if fully remote, `"hybrid"` if hybrid, `"on-site"` if onsite only, or `false` if unclear
- **visaSponsorship**: `false` unless explicitly stated
- **city / country / address**: Extract from the posting. If the office address is not in the posting, search the internet for the company's office address (prioritize the office nearest to the listed city). `address` is an array of strings—include multiple addresses if the company has several relevant offices. Use `[]` if no address is found
- **companyDescription / teamDescription**: Extract from the posting; leave `""` if absent
- **responsibilities / perks**: Use arrays of strings from the posting; use `[]` if absent
- **keyAttributes**: Extract key qualifications, skills, and requirements. Append `(essential)` if the posting marks them as required/must-have, or `(nice to have)` if marked as preferred/bonus/plus. Leave untagged if the posting doesn't indicate priority. Use `[]` if absent
- **referrer / pointOfContact**: Set both to `{ "name": "", "link": "", "conversationSummary": "" }`
- **status**: Leave all fields empty unless user says otherwise.

## Input

$ARGUMENTS
