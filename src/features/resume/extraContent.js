// Content checks for optional "extra" sections so preview / PDF / DOCX
// agree on when a section is worth showing.

export const extraItemHasContent = (sectionId, item) => {
  if (!item) return false;
  switch (Number(sectionId)) {
    case 1: // Custom
    case 2: // Accomplishments
      return Boolean(item.title || item.description);
    case 3: // Volunteer
      return Boolean(
        item.role || item.organization || item.description || item.location,
      );
    case 4: // Certifications
      return Boolean(item.name || item.issuer);
    case 5: // Languages
      return Boolean(item.name);
    case 6: // References
      return Boolean(item.name || item.email || item.organization || item.phone);
    case 7: // Interests
      return Boolean(item.name);
    default:
      return Boolean(
        item.name || item.title || item.value || item.description || item.role,
      );
  }
};

export const extraSectionHasContent = (section) => {
  const items = section?.data || [];
  return items.some((item) => extraItemHasContent(section?.id, item));
};

/** Plain-text lines for DOCX / simple list export. */
export const extraItemLines = (sectionId, item) => {
  if (!extraItemHasContent(sectionId, item)) return [];
  switch (Number(sectionId)) {
    case 1:
    case 2: {
      const lines = [];
      if (item.title) lines.push(item.title);
      if (item.description) {
        lines.push(
          String(item.description)
            .replace(/<[^>]*>/g, " ")
            .replace(/\s+/g, " ")
            .trim(),
        );
      }
      return lines.filter(Boolean);
    }
    case 3: {
      const head = [item.role, item.organization].filter(Boolean).join(" — ");
      const meta = [item.location, item.startDate, item.endDate]
        .filter(Boolean)
        .join(" · ");
      const lines = [head, meta].filter(Boolean);
      if (item.description) {
        lines.push(
          String(item.description)
            .replace(/<[^>]*>/g, " ")
            .replace(/\s+/g, " ")
            .trim(),
        );
      }
      return lines;
    }
    case 4: {
      const head = [item.name, item.issuer].filter(Boolean).join(" — ");
      const meta = [item.date, item.credentialId, item.url]
        .filter(Boolean)
        .join(" · ");
      return [head, meta].filter(Boolean);
    }
    case 5:
      return [item.level ? `${item.name} (${item.level}/5)` : item.name];
    case 6: {
      const head = [item.name, item.role].filter(Boolean).join(" — ");
      const meta = [item.organization, item.email, item.phone]
        .filter(Boolean)
        .join(" · ");
      return [head, meta].filter(Boolean);
    }
    case 7:
      return [item.name];
    default:
      return [[item.name, item.value, item.title].filter(Boolean).join(" — ")];
  }
};
