![job_cinch_hero](https://github.com/user-attachments/assets/dbf06580-7850-41ab-9faf-050ac8afe23e)

# JobCinch

JobCinch is an AI-powered tool for job seekers that combines job tracking with resume building. Drop a link to a job posting and JobCinch will parse and save it, letting you manage your applications and track their status in one place. For resumes, import your existing resume to build a master profile that accumulates all your experience, then use AI to generate tailored resumes optimized for specific job postings.

JobCinch runs locally on your machine and is designed to work alongside AI coding tools like Cursor and Claude Code. Rather than calling AI APIs directly, JobCinch provides JSON schemas and ready-made prompts that you feed into your preferred AI tool to parse job postings, build your master resume, and generate tailored versions.

## How to Use

### For Developers

1. `npm install`
2. `npm run dev`
3. But you already knew that. Fork it. Add more features. The whole intention of building this was to have a tool tailored to my specific needs (e.g., comparing compensation across currencies). Build it your own!

### For Non-Technical Users

JobCinch is a web app that runs on your own computer. Here's how to get it set up and start using it.

#### Initial Setup

You'll need two things installed on your computer before starting:

- **Node.js** — the runtime that powers the app. Download it from [nodejs.org](https://nodejs.org) and install the LTS (Long Term Support) version. Follow the installer prompts with the default options.
- **An AI coding tool** — JobCinch is designed to be used with tools like [Cursor](https://www.cursor.com/) or [Claude Code](https://docs.anthropic.com/en/docs/claude-code/overview). These are apps that let you chat with an AI that can read and edit files on your computer. Install at least one of these.
- **Get familiar with the terminal** - You will at least need to know how to navigate between folders in the terminal. This[Terminal Cheat Sheet article](https://terminalcheatsheet.com/guides/navigate-terminal) is a good resource.

Once Node.js is installed, open your terminal (on Mac, search for "Terminal" in Spotlight; on Windows, search for "Command Prompt" or "PowerShell") and run these commands:

```bash
# Navigate to where you want to install JobCinch
cd path/to/install

# Download the code
git clone git@github.com:fiffty/JobCinch.git

# Navigate to downloaded folder
cd JobCinch

# Install dependencies (only needed once)
npm install

# Start the app
npm run dev
```

The terminal will show a local URL (usually `http://localhost:5173`). Open that in your browser and you'll see the JobCinch interface.

### Available ready-written prompts

These are slash commands you can run in Cursor or Claude Code.

- **`/add_job`** — Parses a job posting URL, extracts key details (company, title, salary, requirements, etc.), and saves them as a structured JSON file in `src/jobs/`.
- **`/update_master_resume`** — Creates or updates your master resume (`src/resumes/master_resume.json`) from a resume file, raw text, or free-text instructions. Merges new data intelligently without losing existing entries.
- **`/create_job_resume`** — Generates a tailored resume for a specific job by selecting and reordering content from your master resume to match the job's requirements. Then walks you through filling gaps by asking targeted questions about your experience.
- **`/ask`** — Ask questions about your tracked jobs and resume. Compares jobs against your resume, highlights strengths and gaps, and suggests concrete next steps.
