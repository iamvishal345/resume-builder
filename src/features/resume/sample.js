export const SAMPLE_RESUME = {
  pd: {
    firstName: "Vishal",
    lastName: "Sharma",
    designation: "Principal Product Engineer",
    email: "vishal.sharma@email.com",
    contactNumber: "+91 98765 43210",
    city: "Gurgaon",
    state: "Haryana",
    country: "India",
  },
  socialLinks: [
    { descriptionValue: "LinkedIn", value: "linkedin.com/in/vishal" },
    { descriptionValue: "GitHub", value: "github.com/vishal" },
  ],
  summary:
    "<p>Product-minded engineer with 10+ years turning ambiguous problems into shipped platforms. Led cross-functional teams and cut cloud spend by 40%.</p>",
  experience: [
    {
      key: "job-1",
      positionTitle: "Principal Product Engineer",
      companyName: "Acme Systems",
      location: "Gurgaon, India",
      startDate: "2021-03-01",
      endDate: "",
      disabledendDate: true,
      workSummary:
        "<ul><li>Scaled the core platform to 2M+ monthly users with a 99.98% uptime SLA.</li><li>Reduced infrastructure cost 40% through autoscaling and caching.</li><li>Mentored 6 engineers and introduced the team's first design review culture.</li></ul>",
    },
    {
      key: "job-2",
      positionTitle: "Senior Software Engineer",
      companyName: "Globex Labs",
      location: "Hyderabad, India",
      startDate: "2017-06-01",
      endDate: "2021-02-28",
      workSummary:
        "<ul><li>Delivered a real-time analytics pipeline processing 50k events/sec.</li><li>Shipped 3 major releases a year on a two-week cadence.</li></ul>",
    },
  ],
  education: [
    {
      key: "edu-1",
      schoolName: "Indian Institute of Technology",
      location: "Delhi, India",
      degree: "B.Tech.",
      fieldOfStudy: "Computer Science",
      startDate: "2013-07-01",
      endDate: "2017-05-30",
      educationSummary:
        "<p>Graduated with distinction; led the robotics team to a national final.</p>",
    },
  ],
  skills: [
    { key: "s1", name: "JavaScript / TypeScript", level: 5 },
    { key: "s2", name: "React & Node.js", level: 5 },
    { key: "s3", name: "System Design", level: 4 },
    { key: "s4", name: "Kubernetes", level: 4 },
    { key: "s5", name: "GraphQL", level: 3 },
  ],
  extras: [
    { id: 5, title: "Languages", data: [{ key: "l1", name: "English", level: 5 }, { key: "l2", name: "Hindi", level: 5 }] },
  ],
};