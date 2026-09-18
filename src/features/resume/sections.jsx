import React from "react";
import { toSkillList } from "./skillList";

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

export const contactParts = (personalDetails = {}, socialLinks = []) => {
  const location = [personalDetails.city, personalDetails.state, personalDetails.country]
    .filter(Boolean)
    .join(", ");
  const socials = (socialLinks || [])
    .map((link) => link.value || link.descriptionValue)
    .filter(Boolean);
  return [
    personalDetails.email,
    personalDetails.contactNumber,
    location,
    ...socials,
  ].filter(Boolean);
};

export const ContactLine = ({ personalDetails, socialLinks, align = "left" }) => {
  const parts = contactParts(personalDetails, socialLinks);
  if (!parts.length) return null;
  return (
    <div className={`r-contact r-contact-${align}`}>
      {parts.map((part, i) => (
        <React.Fragment key={`${part}-${i}`}>
          {i > 0 ? <span className="r-contact-sep">·</span> : null}
          <span>{part}</span>
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
    <div className="r-rich" dangerouslySetInnerHTML={{ __html: html }} />
  ) : null;

const LevelDots = ({ level }) => {
  const n = Math.min(5, Math.max(0, Number(level) || 0));
  return (
    <span className="r-level-dots" aria-label={`Level ${n} of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={i < n ? "r-level-dot r-level-dot-on" : "r-level-dot"}
        />
      ))}
    </span>
  );
};

const LevelBar = ({ level }) => {
  const n = Math.min(5, Math.max(0, Number(level) || 0));
  return (
    <span className="r-level-bar" aria-label={`Level ${n} of 5`}>
      <span
        className="r-level-bar-fill"
        style={{ width: `${n * 20}%` }}
      />
    </span>
  );
};

/** Skills with multiple Zety-style render modes. */
export const SkillList = ({ items, style = "chips" }) => {
  const list = toSkillList(items).filter((item) => item.name);
  if (!list.length) return null;

  if (style === "comma") {
    return (
      <p className="r-skills-comma">{list.map((s) => s.name).join(", ")}</p>
    );
  }

  if (style === "list") {
    return (
      <ul className="r-skills-list">
        {list.map((item) => (
          <li key={item.key || item.name}>{item.name}</li>
        ))}
      </ul>
    );
  }

  if (style === "columns") {
    const mid = Math.ceil(list.length / 2);
    const cols = [list.slice(0, mid), list.slice(mid)];
    return (
      <div className="r-skills-columns">
        {cols.map((col, i) => (
          <ul key={i} className="r-skills-list">
            {col.map((item) => (
              <li key={item.key || item.name}>{item.name}</li>
            ))}
          </ul>
        ))}
      </div>
    );
  }

  if (style === "bars") {
    return (
      <div className="r-skills-bars">
        {list.map((item) => (
          <div className="r-skill-bar-row" key={item.key || item.name}>
            <span className="r-skill-bar-name">{item.name}</span>
            <LevelBar level={item.level} />
          </div>
        ))}
      </div>
    );
  }

  if (style === "dots") {
    return (
      <div className="r-skills-dots">
        {list.map((item) => (
          <div className="r-skill-dot-row" key={item.key || item.name}>
            <span className="r-skill-dot-name">{item.name}</span>
            <LevelDots level={item.level} />
          </div>
        ))}
      </div>
    );
  }

  // chips (default)
  return (
    <div className="r-skills">
      {list.map((item) => (
        <span className="r-skill" key={item.key || item.name}>
          {item.name}
          {item.level > 0 && style === "chips-dots" ? (
            <LevelDots level={item.level} />
          ) : null}
        </span>
      ))}
    </div>
  );
};

export const LanguagesBlock = ({ items, style = "dots" }) => (
  <SkillList items={items || []} style={style} />
);

export const ExperienceItems = ({ items, style = "standard" }) => (
  <>
    {(items || [])
      .filter((e) => e.positionTitle || e.companyName || e.workSummary)
      .map((entry) => (
        <div
          className={`r-entry r-entry-${style}`}
          key={entry.key || `${entry.positionTitle}-${entry.companyName}`}
        >
          {style === "timeline" ? (
            <div className="r-entry-timeline-rail">
              <Range
                start={entry.startDate}
                end={entry.endDate}
                disabledEnd={entry.disabledendDate}
              />
            </div>
          ) : null}
          <div className="r-entry-main">
            <div className="r-entry-header">
              <div className="r-entry-title-block">
                {entry.positionTitle ? (
                  <h3 className="r-entry-title">{entry.positionTitle}</h3>
                ) : null}
                {entry.companyName ? (
                  <span className="r-entry-org">{entry.companyName}</span>
                ) : null}
              </div>
              {style !== "timeline" ? (
                <div className="r-entry-meta">
                  {entry.location ? (
                    <span className="r-entry-location">{entry.location}</span>
                  ) : null}
                  <Range
                    start={entry.startDate}
                    end={entry.endDate}
                    disabledEnd={entry.disabledendDate}
                  />
                </div>
              ) : entry.location ? (
                <span className="r-entry-location">{entry.location}</span>
              ) : null}
            </div>
            <RichText html={entry.workSummary} />
          </div>
        </div>
      ))}
  </>
);

export const EducationItems = ({ items, style = "standard" }) => (
  <>
    {(items || [])
      .filter((e) => e.schoolName || e.degree || e.educationSummary)
      .map((entry) => (
        <div
          className={`r-entry r-entry-${style}`}
          key={entry.key || `${entry.schoolName}-${entry.degree}`}
        >
          {style === "timeline" ? (
            <div className="r-entry-timeline-rail">
              <Range
                start={entry.startDate}
                end={entry.endDate}
                disabledEnd={entry.disabledendDate}
              />
            </div>
          ) : null}
          <div className="r-entry-main">
            <div className="r-entry-header">
              <div className="r-entry-title-block">
                <h3 className="r-entry-title">
                  {[entry.degree, entry.fieldOfStudy].filter(Boolean).join(", ")}
                </h3>
                {entry.schoolName ? (
                  <span className="r-entry-org">{entry.schoolName}</span>
                ) : null}
              </div>
              {style !== "timeline" ? (
                <div className="r-entry-meta">
                  {entry.location ? (
                    <span className="r-entry-location">{entry.location}</span>
                  ) : null}
                  <Range
                    start={entry.startDate}
                    end={entry.endDate}
                    disabledEnd={entry.disabledendDate}
                  />
                </div>
              ) : null}
            </div>
            <RichText html={entry.educationSummary} />
          </div>
        </div>
      ))}
  </>
);

export const CustomSectionBlock = ({ items }) => (
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
        <div className="r-entry-header">
          <div className="r-entry-title-block">
            {item.role && <h3 className="r-entry-title">{item.role}</h3>}
            {item.organization && (
              <span className="r-entry-org">{item.organization}</span>
            )}
          </div>
          <div className="r-entry-meta">
            {item.location && (
              <span className="r-entry-location">{item.location}</span>
            )}
            <Range
              start={item.startDate}
              end={item.endDate}
              disabledEnd={item.current}
            />
          </div>
        </div>
        {item.description && <RichText html={item.description} />}
      </div>
    ))}
  </div>
);

export const CertificationsBlock = ({ items }) => (
  <div className="r-certifications">
    {items?.map((item, i) => (
      <div className="r-certification" key={item.key ?? i}>
        <div className="r-entry-header">
          <div className="r-entry-title-block">
            {item.name && <h3 className="r-entry-title">{item.name}</h3>}
            {item.issuer && <span className="r-entry-org">{item.issuer}</span>}
          </div>
          {item.date && <span className="r-dates">{item.date}</span>}
        </div>
        {item.credentialId && (
          <span className="r-cert-credential">ID: {item.credentialId}</span>
        )}
        {item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="r-cert-url"
          >
            Verify
          </a>
        )}
      </div>
    ))}
  </div>
);

export const ReferencesBlock = ({ items }) => (
  <div className="r-references">
    {items?.map((item, i) => (
      <div className="r-reference" key={item.key ?? i}>
        {item.name && <h3 className="r-reference-name">{item.name}</h3>}
        {(item.role || item.organization) && (
          <div className="r-reference-meta">
            {[item.role, item.organization].filter(Boolean).join(" · ")}
          </div>
        )}
        {(item.email || item.phone) && (
          <div className="r-reference-contact">
            {[item.email, item.phone].filter(Boolean).join(" · ")}
          </div>
        )}
      </div>
    ))}
  </div>
);

export const InterestsBlock = ({ items, style = "chips" }) => (
  <SkillList items={items || []} style={style} />
);
