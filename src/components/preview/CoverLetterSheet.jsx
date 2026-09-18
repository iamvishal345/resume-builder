import React from "react";

const today = () =>
  new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

// Pure render of the cover letter "paper" from document data. Used by both
// the in-editor CoverLetterEditor and the resume listing preview dialog, and
// the node is what gets cloned for PDF export so both look identical.
export const CoverLetterSheet = ({
  personalDetails = {},
  socialLinks = [],
  coverLetter = { recipient: "", body: "" },
  letterRef,
  align = "left",
}) => {
  const name = [personalDetails.firstName, personalDetails.lastName]
    .filter(Boolean)
    .join(" ") || "";
  const contact = [
    personalDetails.email,
    personalDetails.contactNumber,
    [personalDetails.city, personalDetails.state].filter(Boolean).join(", "),
  ].filter(Boolean);
  const social = (socialLinks || [])
    .map((l) => l.value || l.descriptionValue)
    .filter(Boolean);

  return (
    <div
      className={`letter-paper letter-align-${align}`}
      ref={letterRef}
    >
      {name && (
        <div className="letter-sender">
          <span className="letter-name">{name}</span>
          {personalDetails.designation && (
            <span>{personalDetails.designation}</span>
          )}
          {(contact.length > 0 || social.length > 0) && (
            <span className="letter-contact">
              {[...contact, ...social].join("  ·  ")}
            </span>
          )}
        </div>
      )}
      <div className="letter-date">{today()}</div>
      {coverLetter.recipient && (
        <div className="letter-recipient">{coverLetter.recipient}</div>
      )}
      <div className="letter-body">
        {coverLetter.body ? (
          <div dangerouslySetInnerHTML={{ __html: coverLetter.body }} />
        ) : (
          <p>Dear hiring manager,</p>
        )}
      </div>
      <div className="letter-sign">
        <p>Sincerely,</p>
        <p className="letter-sign-name">{name || "Your name"}</p>
      </div>
    </div>
  );
};

export default CoverLetterSheet;