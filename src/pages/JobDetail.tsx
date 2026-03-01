import { useParams } from "wouter";
import { Link } from "wouter";
import { useJobStore } from "../store/jobStore";
import { useCurrencyStore, getCurrencySymbol } from "../store/currencyStore";
import type { ContactInfo } from "../types/job";

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
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
  const { displayCurrency, convertSalary } = useCurrencyStore();

  if (!job) {
    return (
      <div className="app">
        <Link href="/">&larr; Back to jobs</Link>
        <h1>Job not found</h1>
      </div>
    );
  }

  const { status } = job;

  return (
    <div className="app job-detail">
      <Link href="/">&larr; Back to jobs</Link>

      <h1>
        {job.jobTitle} @ {job.company}
      </h1>

      <Link href={job.link}>View job posting</Link>

      <section>
        <h2>Status Timeline</h2>
        <dl>
          <dt>Applied</dt>
          <dd>{status.appliedAt ? formatDate(status.appliedAt) : "—"}</dd>
          <dt>Intro Call</dt>
          <dd>{status.introCallAt ? formatDate(status.introCallAt) : "—"}</dd>
          <dt>Interviews</dt>
          <dd>
            {status.interviewsAt.length > 0
              ? status.interviewsAt.map(formatDate).join(", ")
              : "—"}
          </dd>
          <dt>Offer Received</dt>
          <dd>
            {status.receivedOfferAt ? formatDate(status.receivedOfferAt) : "—"}
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

      {job.keyAttributes.length > 0 && (
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
    </div>
  );
}
