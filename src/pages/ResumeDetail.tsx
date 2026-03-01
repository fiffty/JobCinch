import { Link, useParams } from 'wouter';
import { useResumeStore } from '../store/resumeStore';
import type { ImpactEntry, Resume } from '../types/resume';

function renderImpactEntry(entry: ImpactEntry, index: number) {
  return (
    <li key={index}>
      {entry.action && <strong>{entry.action}</strong>}
      {entry.challenge && <> Solved: {entry.challenge}.</>}
      {entry.result && <> Result: {entry.result}.</>}
      {entry.metric && <> ({entry.metric})</>}
      {entry.scope && <> Scope: {entry.scope}.</>}
    </li>
  );
}

function renderResume(resume: Resume) {
  return (
    <div className="resume-page-content">
      <header className="resume-header">
        <h1>{resume.name}</h1>
        <p>
          {[resume.location?.city, resume.location?.country].filter(Boolean).join(', ')}
          {resume.location?.remote ? ` • ${resume.location.remote} remote` : ''}
        </p>
        <p>
          {resume.email}
          {resume.phone ? ` • ${resume.phone}` : ''}
        </p>
      </header>

      {resume.summary && (
        <section>
          <h2>Summary</h2>
          <p>{resume.summary}</p>
        </section>
      )}

      {resume.experience && resume.experience.length > 0 && (
        <section>
          <h2>Experience</h2>
          {resume.experience.map((item, idx) => (
            <article key={`${item.company}-${item.jobTitle}-${idx}`} className="resume-block">
              <h3>
                {item.jobTitle} {item.company ? `@ ${item.company}` : ''}
              </h3>
              <p className="resume-subline">
                {[item.startDate, item.endDate || 'Present'].filter(Boolean).join(' - ')}
              </p>
              {item.description && <p>{item.description}</p>}
              {item.impactEntries && item.impactEntries.length > 0 && (
                <ul>{item.impactEntries.map(renderImpactEntry)}</ul>
              )}
              {item.highlights && item.highlights.length > 0 && (
                <ul>
                  {item.highlights.map((highlight, highlightIndex) => (
                    <li key={highlightIndex}>{highlight}</li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </section>
      )}

      {resume.projects && resume.projects.length > 0 && (
        <section>
          <h2>Projects</h2>
          {resume.projects.map((project, idx) => (
            <article key={`${project.name}-${idx}`} className="resume-block">
              <h3>{project.name}</h3>
              {project.description && <p>{project.description}</p>}
              {project.impactEntries && project.impactEntries.length > 0 && (
                <ul>{project.impactEntries.map(renderImpactEntry)}</ul>
              )}
            </article>
          ))}
        </section>
      )}

      {resume.skills && resume.skills.length > 0 && (
        <section>
          <h2>Skills</h2>
          <p>
            {resume.skills
              .map((skill) => skill.name)
              .filter(Boolean)
              .join(' • ')}
          </p>
        </section>
      )}

      {resume.significantItems && resume.significantItems.length > 0 && (
        <section>
          <h2>Significant Items</h2>
          <ul>
            {resume.significantItems.map((item, idx) => (
              <li key={`${item.title}-${idx}`}>
                <strong>{item.title}</strong>
                {item.kind ? ` (${item.kind})` : ''}: {item.summary}
                {item.impact ? ` Impact: ${item.impact}` : ''}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

export default function ResumeDetail() {
  const { id } = useParams<{ id: string }>();
  const resume = useResumeStore((state) => state.getResumeById(id));

  if (!resume) {
    return (
      <div className="app">
        <Link href="/resumes">&larr; Back to resumes</Link>
        <h1>Resume not found</h1>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="resume-detail-toolbar">
        <Link href="/resumes">&larr; Back to resumes</Link>
        <button type="button" onClick={() => window.print()}>
          Print
        </button>
      </div>

      <div className="resume-page">{renderResume(resume)}</div>
    </div>
  );
}
