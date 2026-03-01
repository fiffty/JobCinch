import React from "react";
import { Link, useParams } from "wouter";
import { useResumeStore } from "../store/resumeStore";
import type { Resume } from "../types/resume";

function formatDate(value: string | undefined): string {
  if (!value) return '';
  const [year, month] = value.split('-');
  if (!month) return year;
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function renderResume(resume: Resume) {
  return (
    <div className="resume-page-content">
      <header className="resume-header">
        <div className="resume-header-row">
          <h1>{resume.name}</h1>
          <div className="resume-contacts">
            <p>
              {[resume.location?.city, resume.location?.country]
                .filter(Boolean)
                .join(", ")}
              {resume.location?.remote
                ? ` • ${resume.location.remote} remote`
                : ""}
            </p>
            <p>
              <a href={`mailto:${resume.email}`}>{resume.email}</a>
              {resume.phone ? ` • ${resume.phone}` : ""}
            </p>
            {resume.links && (
              <p>
                {[
                  resume.links.linkedin && (
                    <a key="linkedin" href={resume.links.linkedin}>
                      {resume.links.linkedin}
                    </a>
                  ),
                  resume.links.github && (
                    <a key="github" href={resume.links.github}>
                      {resume.links.github}
                    </a>
                  ),
                  resume.links.portfolio && (
                    <a key="portfolio" href={resume.links.portfolio}>
                      Portfolio
                    </a>
                  ),
                  ...(resume.links.other?.map((o) => (
                    <a key={o.url} href={o.url}>
                      {o.label || o.url}
                    </a>
                  )) ?? []),
                ]
                  .filter(Boolean)
                  .reduce<React.ReactNode[]>(
                    (acc, el, i) => (i === 0 ? [el] : [...acc, " • ", el]),
                    [],
                  )}
              </p>
            )}
          </div>
        </div>
      </header>

      {resume.summary && (
        <section>
          <h2>Summary</h2>
          <p>{resume.summary}</p>
        </section>
      )}

      <div className="resume-columns">
        <div className="resume-main">
          {resume.experience && resume.experience.length > 0 && (
            <section>
              <h2>Experience</h2>
              {resume.experience.map((item, idx) => (
                <article
                  key={`${item.company}-${item.jobTitle}-${idx}`}
                  className="resume-block"
                >
                  <h3>
                    {item.jobTitle} {item.company ? `@ ${item.company}` : ""}
                  </h3>
                  <p className="resume-subline">
                    {[formatDate(item.startDate), item.endDate ? formatDate(item.endDate) : "Present"]
                      .filter(Boolean)
                      .join(" – ")}
                  </p>
                  {item.description && <p>{item.description}</p>}
                  {item.impactEntries && item.impactEntries.length > 0 && (
                    <ul>
                      {item.impactEntries.map((entry, i) => (
                        <li key={i}>{entry}</li>
                      ))}
                    </ul>
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

          {resume.certifications && resume.certifications.length > 0 && (
            <section>
              <h2>Certifications</h2>
              <ul>
                {resume.certifications.map((cert, idx) => (
                  <li key={`${cert.name}-${idx}`}>
                    <strong>
                      {cert.link ? <a href={cert.link}>{cert.name}</a> : cert.name}
                    </strong>
                    {cert.issuer ? ` — ${cert.issuer}` : ""}
                    {cert.issuedAt
                      ? ` (${formatDate(cert.issuedAt)}${cert.expiresAt ? ` – ${formatDate(cert.expiresAt)}` : ""})`
                      : ""}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {resume.significantItems && resume.significantItems.length > 0 && (
            <section>
              <h2>Significant Items</h2>
              <ul>
                {resume.significantItems.map((item, idx) => (
                  <li key={`${item.title}-${idx}`}>
                    <strong>
                      {item.links && item.links.length > 0 ? (
                        <a href={item.links[0]}>{item.title}</a>
                      ) : (
                        item.title
                      )}
                    </strong>
                    {item.kind ? ` (${item.kind})` : ""}: {item.summary}
                    {item.impact ? ` Impact: ${item.impact}` : ""}
                    {item.links && item.links.length > 1 && (
                      <span>
                        {" "}
                        {item.links.slice(1).map((url, i) => (
                          <a key={i} href={url}>
                            [{i + 2}]
                          </a>
                        ))}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <div className="resume-sidebar">
          {resume.skills && resume.skills.length > 0 && (
            <section>
              <h2>Skills</h2>
              <p>
                {resume.skills
                  .map((skill) => skill.name)
                  .filter(Boolean)
                  .join(" • ")}
              </p>
            </section>
          )}

          {resume.projects && resume.projects.length > 0 && (
            <section>
              <h2>Projects</h2>
              {resume.projects.map((project, idx) => (
                <article key={`${project.name}-${idx}`} className="resume-block">
                  <h3>
                    {project.link ? (
                      <a href={project.link}>{project.name}</a>
                    ) : (
                      project.name
                    )}
                  </h3>
                  {project.description && <p>{project.description}</p>}
                  {project.impactEntries && project.impactEntries.length > 0 && (
                    <ul>
                      {project.impactEntries.map((entry) => (
                        <li key={entry}>{entry}</li>
                      ))}
                    </ul>
                  )}
                </article>
              ))}
            </section>
          )}

          {resume.education && resume.education.length > 0 && (
            <section>
              <h2>Education</h2>
              {resume.education.map((edu, idx) => (
                <article key={`${edu.institution}-${idx}`} className="resume-block">
                  <h3>
                    {[edu.degree, edu.field].filter(Boolean).join(' in ')}
                    {edu.institution ? ` — ${edu.institution}` : ''}
                  </h3>
                  <p className="resume-subline">
                    {[formatDate(edu.startDate), edu.endDate ? formatDate(edu.endDate) : 'Present'].filter(Boolean).join(' – ')}
                    {edu.gpa ? ` • GPA: ${edu.gpa}` : ''}
                  </p>
                  {edu.highlights && edu.highlights.length > 0 && (
                    <ul>
                      {edu.highlights.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  )}
                </article>
              ))}
            </section>
          )}
        </div>
      </div>
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
