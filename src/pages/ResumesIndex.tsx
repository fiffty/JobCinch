import { useLocation } from 'wouter';
import { useResumeStore } from '../store/resumeStore';

export default function ResumesIndex() {
  const resumes = useResumeStore((state) => state.resumes);
  const [, setLocation] = useLocation();

  return (
    <div className="app">
      <h1>Resumes</h1>

      {resumes.length === 0 ? (
        <p>No resumes found.</p>
      ) : (
        <ul className="resumes-list">
          {resumes.map((resume) => {
            const title = resume.metaTitle || resume.name || resume.id || 'Untitled Resume';
            const sub =
              (resume.metaTitle && resume.name ? resume.name : null) ??
              resume.experience?.[0]?.jobTitle ??
              null;
            return (
              <li key={resume.id}>
                <button
                  type="button"
                  className="resume-list-item"
                  onClick={() => setLocation(`/resume/${resume.id}`)}
                >
                  <span className="resume-list-item-body">
                    <span className="resume-list-item-title">{title}</span>
                    {sub && <span className="resume-list-item-sub">{sub}</span>}
                  </span>
                  <span className="resume-list-item-arrow">›</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
