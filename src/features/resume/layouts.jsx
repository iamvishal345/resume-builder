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
} from "./sections";
import { availableSections, isExtra } from "./order";
import { SectionShell } from "./canvas";

// Builds the canonical, ordered list of resume sections. Each entry has a
// stable id ("summary" | "experience" | "education" | "skills" | "extra:<n>")
// so the interactive canvas can select and reorder them, and every layout
// renders them in resumeSettings.sectionOrder. Which sections exist is decided
// once, in availableSections(), which the PDF export reuses.
const BuildSections = ({ data }) => {
  const out = availableSections(data).map((entry) => {
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
              <ExperienceItems items={data.experience} />
            </section>
          ),
        };
      case "education":
        return {
          ...entry,
          node: (
            <section className="r-section" key="education">
              <SectionHeading title="Education" />
              <EducationItems items={data.education} />
            </section>
          ),
        };
      case "skills":
        return {
          ...entry,
          node: (
            <section className="r-section" key="skills">
              <SectionHeading title="Skills" />
              <SkillList items={data.skills} />
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
            content = <LanguagesBlock items={items} />;
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
  return out;
};

// Shared header — a "color" header fills the full width with the accent color
const PaperHeader = ({ data, cfg = {}, className = "" }) => {
  const colorBand = cfg.headerStyle === "color";
  return (
    <header
      className={`r-header ${className}${colorBand ? " r-header-band" : ""}`}
    >
      <h1 className="r-name">
        {[data.pd.firstName, data.pd.lastName].filter(Boolean).join(" ") ||
          "Your Name"}
      </h1>
      <div className="r-title">{data.pd.designation || "Job Title"}</div>
      <ContactLine personalDetails={data.pd} socialLinks={data.socialLinks} />
    </header>
  );
};

const HeaderShell = ({ data, cfg, className, canvas }) => {
  if (!canvas || !canvas.interactive) {
    return <PaperHeader data={data} cfg={cfg} className={className} />;
  }
  return (
    <SectionShell
      id="header"
      title="Header"
      kind="header"
      canvas={canvas}
      node={<PaperHeader data={data} cfg={cfg} className={className} />}
    />
  );
};

// Renders an ordered id list into section shells; falls back to plain nodes
// when the canvas isn't interactive so printed/static output is unchanged.
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

// Column membership helpers. Every layout expresses how the (already
// reordered) section ids flow into its columns; reordering only ever swaps
// sections within a column so a drag can't physically cross layouts.
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

const LayoutSingle = withCols(
  ({ data, vars, cfg, sections, order, canvas }) => {
    const [stack] = columnsSingle(order);
    return (
      <div className="r-paper r-l-single" style={vars}>
        <HeaderShell data={data} cfg={cfg} className="r-header-center" canvas={canvas} />
        <div style={{ display: "contents" }}>
          {renderColumn(stack, sections, canvas)}
        </div>
      </div>
    );
  },
  columnsSingle
);

const LayoutMinimal = withCols(
  ({ data, vars, cfg, sections, order, canvas }) => {
    const [stack] = columnsSingle(order);
    return (
      <div className="r-paper r-l-minimal" style={vars}>
        <HeaderShell data={data} cfg={cfg} className="r-header-minimal" canvas={canvas} />
        <div style={{ display: "contents" }}>
          {renderColumn(stack, sections, canvas)}
        </div>
      </div>
    );
  },
  columnsSingle
);

const LayoutSidebar = withCols(
  ({ data, vars, cfg, sections, order, canvas }) => {
    const [side, main] = columnsWithSide(order);
    return (
      <div className="r-paper r-l-sidebar" style={vars}>
        <HeaderShell data={data} cfg={cfg} className="r-header-sidebar-top" canvas={canvas} />
        <div className="r-sidebar-grid">
          <aside className="r-sidebar">{renderColumn(side, sections, canvas)}</aside>
          <main className="r-main">{renderColumn(main, sections, canvas)}</main>
        </div>
      </div>
    );
  },
  columnsWithSide
);

const LayoutTopband = withCols(
  ({ data, vars, cfg, sections, order, canvas }) => {
    const [stack] = columnsSingle(order);
    const colorBand = cfg.headerStyle === "color";
    return (
      <div className="r-paper r-l-topband" style={vars}>
        <SectionShell
          id="header"
          title="Header"
          kind="header"
          canvas={canvas}
          node={
            <header className={`r-band${colorBand ? " r-header-band" : ""}`}>
              <h1 className="r-name">
                {[data.pd.firstName, data.pd.lastName].filter(Boolean).join(" ") ||
                  "Your Name"}
              </h1>
              <div className="r-title">{data.pd.designation || "Job Title"}</div>
              <ContactLine personalDetails={data.pd} socialLinks={data.socialLinks} />
            </header>
          }
        />
        <div className="r-band-body" style={{ display: "contents" }}>
          {renderColumn(stack, sections, canvas)}
        </div>
      </div>
    );
  },
  columnsSingle
);

const LayoutSplit = withCols(
  ({ data, vars, cfg, sections, order, canvas }) => {
    const [left, right] = columnsSplit(order);
    return (
      <div className="r-paper r-l-split" style={vars}>
        <HeaderShell data={data} cfg={cfg} className="r-header-split" canvas={canvas} />
        <div className="r-sidebar-grid r-split-grid">
          <main className="r-main">{renderColumn(left, sections, canvas)}</main>
          <aside className="r-sidebar">{renderColumn(right, sections, canvas)}</aside>
        </div>
      </div>
    );
  },
  columnsSplit
);

// Modern — airy two-column with a crisp accent-led header
const LayoutModern = withCols(
  ({ data, vars, cfg, sections, order, canvas }) => {
    const [side, main] = columnsWithSide(order);
    return (
      <div className="r-paper r-l-modern" style={vars}>
        <HeaderShell data={data} cfg={cfg} className="r-header-modern" canvas={canvas} />
        <div className="r-sidebar-grid">
          <aside className="r-sidebar">{renderColumn(side, sections, canvas)}</aside>
          <main className="r-main">{renderColumn(main, sections, canvas)}</main>
        </div>
      </div>
    );
  },
  columnsWithSide
);

// Timeline — single column, dates on a rail with an accent rule
const LayoutTimeline = withCols(
  ({ data, vars, cfg, sections, order, canvas }) => {
    const [stack] = columnsSingle(order);
    return (
      <div className="r-paper r-l-timeline" style={vars}>
        <HeaderShell data={data} cfg={cfg} className="r-header-centered" canvas={canvas} />
        <div style={{ display: "contents" }}>
          {renderColumn(stack, sections, canvas)}
        </div>
      </div>
    );
  },
  columnsSingle
);

// ===== NEW LAYOUTS =====

// Column rule for layouts that put name/contact inside a sidebar:
// summary/skills/languages/extras go to the sidebar, experience/education
// flow to the wide main column.
const columnSidebarHeader = (ids) => {
  const side = ids.filter(
    (id) => id === "summary" || id === "skills" || id === "extra:5" || isExtra(id)
  );
  const main = ids.filter((id) => !side.includes(id));
  return [side, main];
};

// Shared in-sidebar header: name + title + contact block, wrapped in a
// draggable shell when the editor is interactive.
const SidebarHeader = ({ data, canvas }) => (
  <SectionShell
    id="header"
    title="Header"
    kind="header"
    canvas={canvas}
    node={
      <>
        <h1 className="r-name">
          {[data.pd.firstName, data.pd.lastName].filter(Boolean).join(" ") || "Your Name"}
        </h1>
        <div className="r-title">{data.pd.designation || "Job Title"}</div>
        <ContactLine personalDetails={data.pd} socialLinks={data.socialLinks} />
      </>
    }
  />
);

// Dark sidebar — colored sidebar with white text, name/contact inside sidebar
const LayoutDarkSidebar = withCols(
  ({ data, vars, cfg, sections, order, canvas }) => {
    const [side, main] = columnSidebarHeader(order);
    return (
      <div className="r-paper r-l-darksidebar" style={vars}>
        <div className="r-sidebar-grid">
          <aside className="r-sidebar r-sidebar-dark">
            <SidebarHeader data={data} canvas={canvas} />
            {renderColumn(side, sections, canvas)}
          </aside>
          <main className="r-main">{renderColumn(main, sections, canvas)}</main>
        </div>
      </div>
    );
  },
  columnSidebarHeader
);

// Sidebar header — name/contact embedded in light sidebar, no full-width header
const LayoutSidebarHeader = withCols(
  ({ data, vars, cfg, sections, order, canvas }) => {
    const [side, main] = columnSidebarHeader(order);
    return (
      <div className="r-paper r-l-sidebarheader" style={vars}>
        <div className="r-sidebar-grid">
          <aside className="r-sidebar r-sidebar-accent">
            <SidebarHeader data={data} canvas={canvas} />
            {renderColumn(side, sections, canvas)}
          </aside>
          <main className="r-main">{renderColumn(main, sections, canvas)}</main>
        </div>
      </div>
    );
  },
  columnSidebarHeader
);

// Photo top — photo circle + name in header, single column below
const LayoutPhotoTop = withCols(
  ({ data, vars, cfg, sections, order, canvas }) => {
    const [stack] = columnsSingle(order);
    return (
      <div className="r-paper r-l-phototop" style={vars}>
        <SectionShell
          id="header"
          title="Header"
          kind="header"
          canvas={canvas}
          node={
            <header className="r-header r-header-phototop">
              <div className="r-photo-circle" />
              <div className="r-phototop-text">
                <h1 className="r-name">
                  {[data.pd.firstName, data.pd.lastName].filter(Boolean).join(" ") || "Your Name"}
                </h1>
                <div className="r-title">{data.pd.designation || "Job Title"}</div>
                <ContactLine personalDetails={data.pd} socialLinks={data.socialLinks} />
              </div>
            </header>
          }
        />
        <div style={{ display: "contents" }}>
          {renderColumn(stack, sections, canvas)}
        </div>
      </div>
    );
  },
  columnsSingle
);

// Elegant — single column, decorative rules
const LayoutElegant = withCols(
  ({ data, vars, cfg, sections, order, canvas }) => {
    const [stack] = columnsSingle(order);
    return (
      <div className="r-paper r-l-elegant" style={vars}>
        <HeaderShell data={data} cfg={cfg} className="r-header-elegant" canvas={canvas} />
        <div style={{ display: "contents" }}>
          {renderColumn(stack, sections, canvas)}
        </div>
      </div>
    );
  },
  columnsSingle
);

// Compact — dense single column, accent left-border headings
const LayoutCompact = withCols(
  ({ data, vars, cfg, sections, order, canvas }) => {
    const [stack] = columnsSingle(order);
    return (
      <div className="r-paper r-l-compact" style={vars}>
        <HeaderShell data={data} cfg={cfg} className="r-header-compact" canvas={canvas} />
        <div style={{ display: "contents" }}>
          {renderColumn(stack, sections, canvas)}
        </div>
      </div>
    );
  },
  columnsSingle
);

// Branded — full-width band + two columns below
const LayoutBranded = withCols(
  ({ data, vars, cfg, sections, order, canvas }) => {
    const [side, main] = columnSidebarHeader(order);
    return (
      <div className="r-paper r-l-branded" style={vars}>
        <SectionShell
          id="header"
          title="Header"
          kind="header"
          canvas={canvas}
          node={
            <header className="r-band r-band-branded">
              <h1 className="r-name">
                {[data.pd.firstName, data.pd.lastName].filter(Boolean).join(" ") || "Your Name"}
              </h1>
              <div className="r-title">{data.pd.designation || "Job Title"}</div>
              <ContactLine personalDetails={data.pd} socialLinks={data.socialLinks} />
            </header>
          }
        />
        <div className="r-sidebar-grid">
          <aside className="r-sidebar">{renderColumn(side, sections, canvas)}</aside>
          <main className="r-main">{renderColumn(main, sections, canvas)}</main>
        </div>
      </div>
    );
  },
  columnSidebarHeader
);

// Executive — formal centered header, double rules
const LayoutExecutive = withCols(
  ({ data, vars, cfg, sections, order, canvas }) => {
    const [stack] = columnsSingle(order);
    return (
      <div className="r-paper r-l-executive" style={vars}>
        <HeaderShell data={data} cfg={cfg} className="r-header-executive" canvas={canvas} />
        <div style={{ display: "contents" }}>
          {renderColumn(stack, sections, canvas)}
        </div>
      </div>
    );
  },
  columnsSingle
);

// Minimal columns — two equal columns, thin divider
const LayoutMinimalColumns = withCols(
  ({ data, vars, cfg, sections, order, canvas }) => {
    const [side, main] = columnSidebarHeader(order);
    return (
      <div className="r-paper r-l-minimalcolumns" style={vars}>
        <HeaderShell data={data} cfg={cfg} className="r-header-minimalcols" canvas={canvas} />
        <div className="r-sidebar-grid r-split-grid">
          <aside className="r-sidebar">{renderColumn(side, sections, canvas)}</aside>
          <main className="r-main">{renderColumn(main, sections, canvas)}</main>
        </div>
      </div>
    );
  },
  columnSidebarHeader
);

// Clean — ultra-minimal single, no rules
const LayoutClean = withCols(
  ({ data, vars, cfg, sections, order, canvas }) => {
    const [stack] = columnsSingle(order);
    return (
      <div className="r-paper r-l-clean" style={vars}>
        <HeaderShell data={data} cfg={cfg} className="r-header-clean" canvas={canvas} />
        <div style={{ display: "contents" }}>
          {renderColumn(stack, sections, canvas)}
        </div>
      </div>
    );
  },
  columnsSingle
);

// Accent left — accent left-border section headings
const LayoutAccentLeft = withCols(
  ({ data, vars, cfg, sections, order, canvas }) => {
    const [stack] = columnsSingle(order);
    return (
      <div className="r-paper r-l-accentleft" style={vars}>
        <HeaderShell data={data} cfg={cfg} className="r-header-accentleft" canvas={canvas} />
        <div style={{ display: "contents" }}>
          {renderColumn(stack, sections, canvas)}
        </div>
      </div>
    );
  },
  columnsSingle
);

// Timeline split — split with timeline rail in left column
const LayoutTimelineSplit = withCols(
  ({ data, vars, cfg, sections, order, canvas }) => {
    const [left, right] = columnsSplit(order);
    return (
      <div className="r-paper r-l-timelinesplit" style={vars}>
        <HeaderShell data={data} cfg={cfg} className="r-header-timelinesplit" canvas={canvas} />
        <div className="r-sidebar-grid r-split-grid">
          <main className="r-main">{renderColumn(left, sections, canvas)}</main>
          <aside className="r-sidebar">{renderColumn(right, sections, canvas)}</aside>
        </div>
      </div>
    );
  },
  columnsSplit
);

// Modern split — split with bold center stripe
const LayoutModernSplit = withCols(
  ({ data, vars, cfg, sections, order, canvas }) => {
    const [left, right] = columnsSplit(order);
    return (
      <div className="r-paper r-l-modernsplit" style={vars}>
        <HeaderShell data={data} cfg={cfg} className="r-header-modernsplit" canvas={canvas} />
        <div className="r-sidebar-grid r-split-grid">
          <main className="r-main">{renderColumn(left, sections, canvas)}</main>
          <aside className="r-sidebar">{renderColumn(right, sections, canvas)}</aside>
        </div>
      </div>
    );
  },
  columnsSplit
);

export const RESUME_LAYOUTS = {
  single: { id: "single", name: "Single Column", ...LayoutSingle },
  minimal: { id: "minimal", name: "Minimal", ...LayoutMinimal },
  sidebar: { id: "sidebar", name: "Sidebar", ...LayoutSidebar },
  topband: { id: "topband", name: "Top Band", ...LayoutTopband },
  split: { id: "split", name: "Split", ...LayoutSplit },
  modern: { id: "modern", name: "Modern", ...LayoutModern },
  timeline: { id: "timeline", name: "Timeline", ...LayoutTimeline },
  darksidebar: { id: "darksidebar", name: "Dark Sidebar", ...LayoutDarkSidebar },
  sidebarheader: { id: "sidebarheader", name: "Sidebar Header", ...LayoutSidebarHeader },
  phototop: { id: "phototop", name: "Photo Top", ...LayoutPhotoTop },
  elegant: { id: "elegant", name: "Elegant", ...LayoutElegant },
  compact: { id: "compact", name: "Compact", ...LayoutCompact },
  branded: { id: "branded", name: "Branded", ...LayoutBranded },
  executive: { id: "executive", name: "Executive", ...LayoutExecutive },
  minimalcolumns: { id: "minimalcolumns", name: "Minimal Columns", ...LayoutMinimalColumns },
  clean: { id: "clean", name: "Clean", ...LayoutClean },
  accentleft: { id: "accentleft", name: "Accent Left", ...LayoutAccentLeft },
  timelinesplit: { id: "timelinesplit", name: "Timeline Split", ...LayoutTimelineSplit },
  modernsplit: { id: "modernsplit", name: "Modern Split", ...LayoutModernSplit },
};

export { BuildSections, availableSections };