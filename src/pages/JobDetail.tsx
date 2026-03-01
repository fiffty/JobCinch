import { useParams, useLocation } from "wouter";
import { Link } from "wouter";
import { useJobStore } from "../store/jobStore";
import { useCurrencyStore, getCurrencySymbol } from "../store/currencyStore";
import { DeleteConfirmModal, useDeleteWithConfirmation } from "../components/DeleteConfirmModal";
import type { ContactInfo, JobStatus } from "../types/job";

function EditableDate({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <input
      type="date"
      className="editable-date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function ContactSection({
  label,
  contact,
}: {
  label: string;
  contact: ContactInfo;
}) {
  return (
    <div>
      <h3>{label}</h3>
      <p>
        <a href={contact.link} target="_blank" rel="noopener noreferrer">
          {contact.name}
        </a>
      </p>
      <p>{contact.conversationSummary}</p>
    </div>
  );
}

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const job = useJobStore((state) => state.getJobById(id));
  const updateJobStatus = useJobStore((state) => state.updateJobStatus);
  const deleteJob = useJobStore((state) => state.deleteJob);
  const { displayCurrency, convertSalary } = useCurrencyStore();
  const [, navigate] = useLocation();

  const { showModal, requestDelete, confirmDelete, cancelDelete } =
    useDeleteWithConfirmation(() => {
      deleteJob(job!.id);
      navigate("/");
    });

  if (!job) {
    return (
      <div className="app">
        <Link href="/">&larr; Back to jobs</Link>
        <h1>Job not found</h1>
      </div>
    );
  }

  const { status } = job;

  const updateField = (field: keyof JobStatus, value: string | string[]) => {
    updateJobStatus(job.id, field, value);
  };

  const addInterview = () => {
    const hasEmpty = status.interviewsAt.some((d) => !d);
    if (hasEmpty) return;
    updateField("interviewsAt", [...status.interviewsAt, ""]);
  };

  const updateInterview = (index: number, value: string) => {
    const updated = status.interviewsAt.map((d, i) =>
      i === index ? value : d,
    );
    updateField("interviewsAt", updated);
  };

  const removeInterview = (index: number) => {
    updateField(
      "interviewsAt",
      status.interviewsAt.filter((_, i) => i !== index),
    );
  };

  return (
    <div className="app job-detail">
      <Link href="/">&larr; Back to jobs</Link>

      <h1>
        {job.jobTitle} @ {job.company}
      </h1>

      <a href={job.link} target="_blank" rel="noopener noreferrer">
        View job posting
      </a>

      <section>
        <h2>Status Timeline</h2>
        <dl>
          <dt>Applied</dt>
          <dd>
            <EditableDate
              value={status.appliedAt}
              onChange={(v) => updateField("appliedAt", v)}
            />
          </dd>
          <dt>Intro Call</dt>
          <dd>
            <EditableDate
              value={status.introCallAt}
              onChange={(v) => updateField("introCallAt", v)}
            />
          </dd>
          <dt>Interviews</dt>
          <dd>
            <div className="interviews-list">
              {status.interviewsAt.map((date, i) => (
                <div key={i} className="interview-row">
                  <EditableDate
                    value={date}
                    onChange={(v) => updateInterview(i, v)}
                  />
                  <button
                    type="button"
                    className="remove-interview-btn"
                    onClick={() => removeInterview(i)}
                    aria-label="Remove interview date"
                  >
                    &times;
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="add-interview-btn"
                onClick={addInterview}
                disabled={status.interviewsAt.some((d) => !d)}
              >
                + Add interview
              </button>
            </div>
          </dd>
          <dt>Offer Received</dt>
          <dd>
            <EditableDate
              value={status.receivedOfferAt}
              onChange={(v) => updateField("receivedOfferAt", v)}
            />
          </dd>
        </dl>
      </section>

      <section>
        <h2>Compensation</h2>
        <dl>
          <dt>Salary</dt>
          <dd>
            {(() => {
              const curr =
                displayCurrency && displayCurrency !== job.currency
                  ? displayCurrency
                  : job.currency;
              const min =
                displayCurrency && displayCurrency !== job.currency
                  ? convertSalary(job.salaryMin, job.currency, displayCurrency)
                  : job.salaryMin;
              const max =
                displayCurrency && displayCurrency !== job.currency
                  ? convertSalary(job.salaryMax, job.currency, displayCurrency)
                  : job.salaryMax;
              return `${curr} ${getCurrencySymbol(curr)}${min.toLocaleString()} – ${getCurrencySymbol(curr)}${max.toLocaleString()}`;
            })()}
          </dd>
          {job.rsu > 0 && (
            <>
              <dt>RSU</dt>
              <dd>${job.rsu.toLocaleString()}</dd>
            </>
          )}
          {job.stockOption && (
            <>
              <dt>Stock Option</dt>
              <dd>{job.stockOption}</dd>
            </>
          )}
          {job.bonus && (
            <>
              <dt>Bonus</dt>
              <dd>{job.bonus}</dd>
            </>
          )}
        </dl>
      </section>

      <section>
        <h2>Location</h2>
        <p>
          {job.city}, {job.country}
          {job.remote && " (Remote)"}
        </p>
        {job.address.map((addr, i) => (
          <p key={i}>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {addr}
            </a>
          </p>
        ))}
        <p>Visa Sponsorship: {job.visaSponsorship ? "Yes" : "No"}</p>
      </section>

      <section>
        <h2>About the Company</h2>
        <p>{job.companyDescription}</p>
      </section>

      <section>
        <h2>About the Team</h2>
        <p>{job.teamDescription}</p>
      </section>

      <section>
        <h2>Responsibilities</h2>
        <ul>
          {job.responsibilities.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Perks</h2>
        <ul>
          {job.perks.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      </section>

      {(job.keyAttributes?.length ?? 0) > 0 && (
        <section>
          <h2>Key Attributes</h2>
          <ul>
            {job.keyAttributes.map((attr, i) => (
              <li key={i}>{attr}</li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2>People</h2>
        <div className="people-grid">
          <ContactSection label="Referrer" contact={job.referrer} />
          <ContactSection
            label="Point of Contact"
            contact={job.pointOfContact}
          />
        </div>
      </section>

      <section className="delete-section">
        <button type="button" className="delete-btn" onClick={requestDelete}>
          Delete Job
        </button>
      </section>

      {showModal && (
        <DeleteConfirmModal
          itemLabel="this job"
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </div>
  );
}
