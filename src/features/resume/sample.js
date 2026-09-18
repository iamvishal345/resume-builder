import { defaultResumeData } from "@store";

/** Full store-shaped sample used by demos, gallery, and PDF previews. */
export const FULL_SAMPLE_STORE = () => ({
  ...defaultResumeData(),
  personalDetails: {
    firstName: "Vishal",
    lastName: "Sharma",
    designation: "Principal Product Engineer",
    email: "vishal.sharma@email.com",
    contactNumber: "+91 98765 43210",
    city: "Gurgaon",
    state: "Haryana",
    country: "India",
    address: "Sector 29",
    pinCode: "122001",
  },
  socialLinks: [
    {
      descriptionKey: "s1",
      descriptionValue: "LinkedIn",
      valueKey: "v1",
      value: "linkedin.com/in/vishal",
    },
    {
      descriptionKey: "s2",
      descriptionValue: "GitHub",
      valueKey: "v2",
      value: "github.com/vishal",
    },
    {
      descriptionKey: "s3",
      descriptionValue: "Portfolio",
      valueKey: "v3",
      value: "vishal.dev",
    },
  ],
  resumeSummary:
    "<p>Product-minded engineer with 10+ years turning ambiguous problems into shipped platforms. Led cross-functional teams across India and remote US time zones, cut cloud spend by 40%, and built design systems used by 30+ squads.</p><p>Comfortable owning roadmap, mentoring seniors, and partnering with design and GTM on 0→1 launches.</p>",
  workHistory: [
    {
      key: "job-1",
      positionTitle: "Principal Product Engineer",
      companyName: "Acme Systems",
      location: "Gurgaon, India",
      startDate: "2021-03-01",
      endDate: "",
      disabledendDate: true,
      workSummary:
        "<ul><li>Scaled the core platform to 2M+ monthly users with a 99.98% uptime SLA.</li><li>Reduced infrastructure cost 40% through autoscaling, caching, and right-sizing.</li><li>Mentored 6 engineers and introduced the team's first design-review culture.</li><li>Partnered with Product to ship a self-serve onboarding flow that lifted activation 18%.</li></ul>",
    },
    {
      key: "job-2",
      positionTitle: "Senior Software Engineer",
      companyName: "Globex Labs",
      location: "Hyderabad, India",
      startDate: "2017-06-01",
      endDate: "2021-02-28",
      workSummary:
        "<ul><li>Delivered a real-time analytics pipeline processing 50k events/sec.</li><li>Shipped 3 major releases a year on a two-week cadence.</li><li>Led the GraphQL migration that cut mobile payload sizes by 35%.</li></ul>",
    },
    {
      key: "job-3",
      positionTitle: "Software Engineer",
      companyName: "Initech",
      location: "Bengaluru, India",
      startDate: "2015-07-01",
      endDate: "2017-05-31",
      workSummary:
        "<ul><li>Built internal tooling for support that saved ~12 hrs/week per agent.</li><li>Owned CI improvements that halved average PR merge time.</li></ul>",
    },
  ],
  education: [
    {
      key: "edu-1",
      schoolName: "Indian Institute of Technology",
      location: "Delhi, India",
      degree: "B.Tech.",
      fieldOfStudy: "Computer Science",
      startDate: "2011-07-01",
      endDate: "2015-05-30",
      educationSummary:
        "<p>Graduated with distinction; led the robotics team to a national final. Coursework in distributed systems, compilers, and HCI.</p>",
    },
  ],
  skills: [
    { key: "s1", name: "JavaScript / TypeScript", level: 5 },
    { key: "s2", name: "React & Node.js", level: 5 },
    { key: "s3", name: "System Design", level: 4 },
    { key: "s4", name: "Kubernetes", level: 4 },
    { key: "s5", name: "GraphQL", level: 3 },
    { key: "s6", name: "PostgreSQL", level: 4 },
    { key: "s7", name: "AWS", level: 4 },
    { key: "s8", name: "Product Discovery", level: 3 },
  ],
  additionalSections: [
    {
      id: 1,
      title: "Custom Section",
      data: [
        {
          key: "cs1",
          title: "Open source",
          description:
            "<p>Maintainer of a React form library with 4k GitHub stars; published monthly release notes and RFCs.</p>",
        },
      ],
    },
    {
      id: 2,
      title: "Accomplishments",
      data: [
        {
          key: "a1",
          title: "Speaker — React India 2024",
          description:
            "<p>Talk on incremental adoption of React Server Components in brownfield apps.</p>",
        },
        {
          key: "a2",
          title: "Hackathon winner",
          description:
            "<p>First place at Acme internal hack week for an AI-assisted support triage tool.</p>",
        },
      ],
    },
    {
      id: 3,
      title: "Volunteer Experience",
      data: [
        {
          key: "v1",
          role: "Mentor",
          organization: "Code to Scale",
          location: "Remote",
          startDate: "2020-01-01",
          endDate: "",
          current: true,
          description:
            "<p>Coach early-career engineers on system design interviews and portfolio projects.</p>",
        },
      ],
    },
    {
      id: 4,
      title: "Certifications",
      data: [
        {
          key: "c1",
          name: "AWS Solutions Architect — Associate",
          issuer: "Amazon Web Services",
          date: "2023",
          credentialId: "AWS-SAA-92811",
          url: "https://aws.amazon.com/certification/",
        },
        {
          key: "c2",
          name: "Certified Scrum Product Owner",
          issuer: "Scrum Alliance",
          date: "2021",
        },
      ],
    },
    {
      id: 5,
      title: "Languages",
      data: [
        { key: "l1", name: "English", level: 5 },
        { key: "l2", name: "Hindi", level: 5 },
        { key: "l3", name: "Spanish", level: 2 },
      ],
    },
    {
      id: 6,
      title: "References",
      data: [
        {
          key: "r1",
          name: "Priya Nair",
          role: "VP Engineering",
          organization: "Acme Systems",
          email: "priya.nair@acme.example",
          phone: "+91 90000 11111",
        },
        {
          key: "r2",
          name: "James Okonkwo",
          role: "Director of Product",
          organization: "Globex Labs",
          email: "james.o@globex.example",
          phone: "",
        },
      ],
    },
    {
      id: 7,
      title: "Interests",
      data: [
        { key: "i1", name: "Trail running" },
        { key: "i2", name: "Film photography" },
        { key: "i3", name: "Chess" },
        { key: "i4", name: "Open-source tooling" },
      ],
    },
  ],
  coverLetter: {
    recipient: "Hiring Manager\nAcme Systems\nGurgaon, India",
    body: "<p>Dear Hiring Manager,</p><p>I am excited to apply for the Principal Engineer role. Over the last decade I have led platform teams that ship reliable product surfaces at scale, and I would welcome the chance to bring that experience to your team.</p><p>Sincerely,<br/>Vishal Sharma</p>",
  },
});

/** View-model shape for TemplateGallery / Resume preview swatches. */
export const SAMPLE_RESUME = (() => {
  const store = FULL_SAMPLE_STORE();
  return {
    pd: store.personalDetails,
    socialLinks: store.socialLinks,
    summary: store.resumeSummary,
    experience: store.workHistory,
    education: store.education,
    skills: store.skills,
    extras: store.additionalSections,
  };
})();
