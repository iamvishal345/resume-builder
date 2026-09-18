import React from "react";
import {
  ContactLine,
  EducationItems,
  ExperienceItems,
  LanguagesBlock,
  RichText,
  SectionHeading,
  SkillList,
  CustomSectionBlock,
  AccomplishmentsBlock,
  VolunteerBlock,
  CertificationsBlock,
  ReferencesBlock,
  InterestsBlock,
} from "./sections";
import { availableSections, isExtra } from "./order";
import { SectionShell } from "./canvas";

const STYLE_DEFAULTS = {
  skillStyle: "chips",
  languageStyle: "dots",
  experienceStyle: "standard",
};

/** Ordered section nodes for the resume paper. */
export const BuildSections = ({ data, styles = {} }) => {
  const skillStyle = styles.skillStyle || STYLE_DEFAULTS.skillStyle;
  const languageStyle = styles.languageStyle || STYLE_DEFAULTS.languageStyle;
  const experienceStyle =
    styles.experienceStyle || STYLE_DEFAULTS.experienceStyle;

  return availableSections(data).map((entry) => {
    switch (entry.id) {
      case "summary":
        return {
          ...entry,
          node: (
            <section className="r-section" key="summary">
              <SectionHeading title="Summary" />
              <RichText html={data.summary} />
            </section>
          ),
        };
      case "experience":
        return {
          ...entry,
          node: (
            <section className="r-section" key="experience">
              <SectionHeading title="Experience" />
              <ExperienceItems
                items={data.experience}
                style={experienceStyle}
              />
            </section>
          ),
        };
      case "education":
        return {
          ...entry,
          node: (
            <section className="r-section" key="education">
              <SectionHeading title="Education" />
              <EducationItems items={data.education} style={experienceStyle} />
            </section>
          ),
        };
      case "skills":
        return {
          ...entry,
          node: (
            <section className="r-section" key="skills">
              <SectionHeading title="Skills" />
              <SkillList items={data.skills} style={skillStyle} />
            </section>
          ),
        };
      default: {
        const section = (data.extras || []).find(
          (extra) => `extra:${extra.id}` === entry.id
        );
        const items = section?.data || [];
        let content = null;
        switch (entry.id) {
          case "extra:1":
            content = <CustomSectionBlock items={items} title={entry.title} />;
            break;
          case "extra:2":
            content = <AccomplishmentsBlock items={items} />;
            break;
          case "extra:3":
            content = <VolunteerBlock items={items} />;
            break;
          case "extra:4":
            content = <CertificationsBlock items={items} />;
            break;
          case "extra:5":
            content = <LanguagesBlock items={items} style={languageStyle} />;
            break;
          case "extra:6":
            content = <ReferencesBlock items={items} />;
            break;
          case "extra:7":
            content = (
              <InterestsBlock
                items={items}
                style={
                  items.some((item) => Number(item.level) > 0)
                    ? languageStyle
                    : "chips"
                }
              />
            );
            break;
          default:
            content = null;
        }
        return {
          ...entry,
          node: (
            <section className="r-section" key={entry.id}>
              <SectionHeading title={entry.title} />
              {content}
            </section>
          ),
        };
      }
    }
  });
};

const HEADER_STYLE_CLASS = {
  plain: "",
  rule: "r-header-rule",
  band: "r-header-band",
  double: "r-header-double",
  accent: "r-header-accent",
};

export const PaperHeader = ({
  data,
  align = "left",
  style = "plain",
  cfg = {},
  className = "",
}) => {
  const headerStyle = style || cfg.headerStyle || "plain";
  const variant = HEADER_STYLE_CLASS[headerStyle] || "";
  const photo = data?.pd?.photoDataUrl;
  const showPhoto = Boolean(photo) && cfg.showPhoto !== false;
  return (
    <header
      className={[
        "r-header",
        variant,
        showPhoto ? "r-header-with-photo" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {showPhoto ? (
        <img
          className="r-photo"
          src={photo}
          alt=""
          width={72}
          height={72}
        />
      ) : null}
      <div className="r-header-text">
        <h1 className="r-name">
          {[data.pd.firstName, data.pd.lastName].filter(Boolean).join(" ") ||
            "Your Name"}
        </h1>
        <div className="r-title">{data.pd.designation || "Job Title"}</div>
        <ContactLine
          personalDetails={data.pd}
          socialLinks={data.socialLinks}
          align={align}
        />
      </div>
    </header>
  );
};

const HeaderShell = ({ data, align, style, cfg, className, canvas }) => {
  const node = (
    <PaperHeader
      data={data}
      align={align}
      style={style}
      cfg={cfg}
      className={className}
    />
  );
  if (!canvas || !canvas.interactive) return node;
  return (
    <SectionShell
      id="header"
      title="Header"
      kind="header"
      canvas={canvas}
      node={node}
    />
  );
};

/** In-sidebar name/contact (Metro / dark sidebar). */
const SidebarIdentity = ({ data, canvas }) => {
  const node = (
    <div className="r-sidebar-identity">
      <h1 className="r-name">
        {[data.pd.firstName, data.pd.lastName].filter(Boolean).join(" ") ||
          "Your Name"}
      </h1>
      <div className="r-title">{data.pd.designation || "Job Title"}</div>
      <ContactLine
        personalDetails={data.pd}
        socialLinks={data.socialLinks}
        align="left"
      />
    </div>
  );
  if (!canvas || !canvas.interactive) return node;
  return (
    <SectionShell
      id="header"
      title="Header"
      kind="header"
      canvas={canvas}
      node={node}
    />
  );
};

const renderColumn = (ids, sections, canvas) => {
  const nodes = Object.fromEntries(sections.map((entry) => [entry.id, entry]));
  return ids.map((id) => {
    const entry = nodes[id];
    return entry ? (
      <SectionShell
        key={`${canvas?.interactive ? "shell" : "static"}:${id}`}
        id={id}
        title={entry.title}
        node={entry.node}
        canvas={canvas}
      />
    ) : null;
  });
};

export const columnsSingle = (ids) => [ids];

export const columnsWithSide = (ids) => {
  const side = ids.filter(
    (id) => id === "summary" || id === "skills" || isExtra(id)
  );
  const main = ids.filter((id) => !side.includes(id));
  return [side, main];
};

export const columnsSplit = (ids) => {
  const left = ids.filter((id) => id === "summary" || id === "experience");
  const right = ids.filter((id) => !left.includes(id));
  return [left, right];
};

const withCols = (render, columnsOf) => ({ render, columnsOf });

const paperClass = (layoutId, cfg = {}) => {
  const align = cfg.headerAlign || "left";
  const experienceStyle = cfg.experienceStyle || "standard";
  const tone = cfg.sidebarTone || "light";
  // Header style classes (band/rule/…) belong on <header>, not the paper —
  // putting r-header-band on .r-paper painted the whole page accent and left
  // section text on --r-ink (black-on-dark / white-on-light conflicts).
  return [
    "r-paper",
    `r-l-${layoutId}`,
    `r-align-${align}`,
    `r-exp-${experienceStyle}`,
    `r-sidebar-${tone}`,
  ].join(" ");
};

const LayoutSingle = withCols(({ data, vars, cfg, sections, order, canvas }) => {
  const [stack] = columnsSingle(order);
  const align = cfg.headerAlign || "left";
  return (
    <div className={paperClass("single", cfg)} style={vars}>
      <HeaderShell
        data={data}
        align={align}
        style={cfg.headerStyle}
        cfg={cfg}
        canvas={canvas}
      />
      <div style={{ display: "contents" }}>
        {renderColumn(stack, sections, canvas)}
      </div>
    </div>
  );
}, columnsSingle);

const SidebarLayout = ({
  data,
  vars,
  cfg,
  sections,
  order,
  canvas,
  layoutId,
  reverse,
}) => {
  const [side, main] = columnsWithSide(order);
  const tone = cfg.sidebarTone || "light";
  const darkIdentity = tone === "dark";
  const align = cfg.headerAlign || "left";
  const sideClass = ["r-sidebar", `r-sidebar-tone-${tone}`]
    .filter(Boolean)
    .join(" ");

  const sideCol = (
    <aside className={sideClass}>
      {darkIdentity ? <SidebarIdentity data={data} canvas={canvas} /> : null}
      {renderColumn(side, sections, canvas)}
    </aside>
  );
  const mainCol = (
    <main className="r-main">{renderColumn(main, sections, canvas)}</main>
  );

  return (
    <div className={paperClass(layoutId, cfg)} style={vars}>
      {!darkIdentity ? (
        <HeaderShell
          data={data}
          align={align}
          style={cfg.headerStyle}
          cfg={cfg}
          canvas={canvas}
        />
      ) : null}
      <div className="r-sidebar-grid">
        {reverse ? (
          <>
            {mainCol}
            {sideCol}
          </>
        ) : (
          <>
            {sideCol}
            {mainCol}
          </>
        )}
      </div>
    </div>
  );
};

const LayoutSidebar = withCols(
  (props) => <SidebarLayout {...props} layoutId="sidebar" reverse={false} />,
  columnsWithSide
);

const LayoutSidebarRight = withCols(
  (props) => (
    <SidebarLayout {...props} layoutId="sidebar-right" reverse={true} />
  ),
  columnsWithSide
);

const LayoutSplit = withCols(({ data, vars, cfg, sections, order, canvas }) => {
  const [left, right] = columnsSplit(order);
  const align = cfg.headerAlign || "left";
  return (
    <div className={paperClass("split", cfg)} style={vars}>
      <HeaderShell
        data={data}
        align={align}
        style={cfg.headerStyle}
        cfg={cfg}
        canvas={canvas}
      />
      <div className="r-sidebar-grid r-split-grid">
        <main className="r-main">{renderColumn(left, sections, canvas)}</main>
        <aside className="r-sidebar">{renderColumn(right, sections, canvas)}</aside>
      </div>
    </div>
  );
}, columnsSplit);

export const RESUME_LAYOUTS = {
  single: { id: "single", name: "Single Column", ...LayoutSingle },
  sidebar: { id: "sidebar", name: "Left Sidebar", ...LayoutSidebar },
  "sidebar-right": {
    id: "sidebar-right",
    name: "Right Sidebar",
    ...LayoutSidebarRight,
  },
  split: { id: "split", name: "Two Columns", ...LayoutSplit },
};

export { availableSections };
