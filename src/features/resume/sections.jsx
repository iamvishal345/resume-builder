import React from "react";

export const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

export const Range = ({ start, end, disabledEnd }) => {
  const from = formatDate(start);
  const to = disabledEnd || end === "Present" ? "Present" : formatDate(end);
  if (!from && !to) return null;
  return (
    <span className="r-dates">
      {from}
      {from && to ? " – " : ""}
      {to && to !== from ? to : ""}
    </span>
  );
};

export const contactParts = (pd, socialLinks) => {
  const location = [
    pd.address,
    pd.city,
    pd.state,
    pd.country,
    pd.pinCode,
  ]
    .filter(Boolean)
    .join(", ");
  return [
    pd.email,
    pd.contactNumber,
    location,
    ...socialLinks.map((link) =>
      link.value ? `${link.descriptionValue || "Link"}: ${link.value}` : ""
    ),
  ].filter(Boolean);
};

export const ContactLine = ({ personalDetails, socialLinks }) => {
  const parts = contactParts(personalDetails, socialLinks);
  if (!parts.length) return null;
  return (
    <div className="r-contact">
      {parts.map((part, i) => (
        <React.Fragment key={i}>
          <span className="r-contact-item">{part}</span>
          {i < parts.length - 1 ? (
            <span className="r-contact-sep" aria-hidden="true">
              •
            </span>
          ) : null}
        </React.Fragment>
      ))}
    </div>
  );
};

export const SectionHeading = ({ title }) => (
  <h2 className="r-section-heading">{title}</h2>
);

export const RichText = ({ html }) =>
  html ? (
    <div className="r-richtext" dangerouslySetInnerHTML={{ __html: html }} />
  ) : null;

export const ExperienceItems = ({ items }) => (
  <>
    {items
      .filter((entry) => entry.positionTitle || entry.companyName || entry.workSummary)
      .map((entry, i) => (
        <div className="r-entry" key={entry.key ?? i}>
          <div className="r-entry-row">
            <div className="r-entry-main">
              <div className="r-entry-title">
                {entry.positionTitle}
                {entry.positionTitle && entry.companyName ? ", " : ""}
                <span className="r-entry-org">{entry.companyName}</span>
              </div>
              <div className="r-entry-meta">
                {[entry.positionTitle ? "" : entry.companyName, entry.location]
                  .filter(Boolean)
                  .join(" · ")}
              </div>
            </div>
            <Range
              start={entry.startDate}
              end={entry.endDate}
              disabledEnd={entry.disabledendDate}
            />
          </div>
          <RichText html={entry.workSummary} />
        </div>
      ))}
  </>
);

export const EducationItems = ({ items }) => (
  <>
    {items
      .filter((entry) => entry.schoolName || entry.degree || entry.educationSummary)
      .map((entry, i) => (
        <div className="r-entry" key={entry.key ?? i}>
          <div className="r-entry-row">
            <div className="r-entry-main">
              <div className="r-entry-title">
                {[entry.degree, entry.fieldOfStudy].filter(Boolean).join(", ")}
                {entry.schoolName ? ` — ${entry.schoolName}` : ""}
              </div>
              <div className="r-entry-meta">{entry.location}</div>
            </div>
            <Range
              start={entry.startDate}
              end={entry.endDate}
              disabledEnd={entry.disabledendDate}
            />
          </div>
          <RichText html={entry.educationSummary} />
        </div>
      ))}
  </>
);

const dots = (level) =>
  Array.from({ length: 5 }, (_, i) => (i < level ? "●" : "○")).join(" ");

export const SkillList = ({ items }) => (
  <div className="r-skills">
    {items
      .filter((item) => item.name)
      .map((item) => (
        <span className="r-skill" key={item.key || item.name}>
          {item.name}
          {item.level > 0 ? (
            <span className="r-skill-dots">{dots(item.level)}</span>
          ) : null}
        </span>
      ))}
  </div>
);

export const LanguagesBlock = ({ items }) => (
  <SkillList items={items || []} />
);

export const CustomSectionBlock = ({ items, title }) => (
  <div className="r-custom-section">
    {items?.map((item, i) => (
      <div className="r-custom-item" key={item.key ?? i}>
        {item.title && <h3 className="r-custom-title">{item.title}</h3>}
        {item.description && <RichText html={item.description} />}
      </div>
    ))}
  </div>
);

export const AccomplishmentsBlock = ({ items }) => (
  <div className="r-accomplishments">
    {items?.map((item, i) => (
      <div className="r-accomplishment" key={item.key ?? i}>
        {item.title && <h3 className="r-accomplishment-title">{item.title}</h3>}
        {item.description && <RichText html={item.description} />}
      </div>
    ))}
  </div>
);

export const VolunteerBlock = ({ items }) => (
  <div className="r-volunteer">
    {items?.map((item, i) => (
      <div className="r-volunteer-item" key={item.key ?? i}>
        <div className="r-volunteer-header">
          {item.role && <h3 className="r-volunteer-role">{item.role}</h3>}
          {item.organization && (
            <span className="r-volunteer-org">{item.organization}</span>
          )}
        </div>
        {item.location && (
          <span className="r-volunteer-location">{item.location}</span>
        )}
        <Range start={item.startDate} end={item.endDate} disabledEnd={item.current} />
        {item.description && <RichText html={item.description} />}
      </div>
    ))}
  </div>
);

export const CertificationsBlock = ({ items }) => (
  <div className="r-certifications">
    {items?.map((item, i) => (
      <div className="r-certification" key={item.key ?? i}>
        <div className="r-certification-header">
          {item.name && <h3 className="r-cert-name">{item.name}</h3>}
          {item.issuer && <span className="r-cert-issuer">{item.issuer}</span>}
        </div>
        {item.date && <span className="r-cert-date">{item.date}</span>}
        {item.credentialId && (
          <span className="r-cert-credential">Credential: {item.credentialId}</span>
        )}
        {item.url && (
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="r-cert-url">
            Verify Credential
          </a>
        )}
      </div>
    ))}
  </div>
);