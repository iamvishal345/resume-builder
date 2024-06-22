import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useStore = create(
  persist(
    (set, get) => ({
      // Personal Details
      personalDetails: {},
      socialLinks: [],
      setPersonalDetails: (key, value) =>
        set(() => ({
          personalDetails: { ...get().personalDetails, [key]: value },
        })),
      setSocialLinks: (value) =>
        set(() => ({
          socialLinks: value,
        })),
      removeSocialLinks: (value) =>
        set(() => ({
          socialLinks: get().socialLinks.filter(
            (item) => item.descriptionKey !== value.descriptionKey
          ),
        })),
      reset: () => set({ personalDetails: {}, socialLinks: [] }),

      // Work Experience
      workHistory: [],
      setWorkHistory: (value) => set(() => ({ workHistory: value })),

      // Education
      education: [],
      setEducation: (value) => set(() => ({ education: value })),

      // Skills
      skills: [],
      setSkills: (value) => set(() => ({ skills: value })),

      // Summary
      resumeSummary: "",
      setResumeSummary: (value) => set(() => ({ resumeSummary: value })),

      // Additional Sections
      additionalSections: [],
      setAdditionalSections: (value) =>
        set(() => ({
          additionalSections: value,
        })),
      removeAdditionalSections: (value) =>
        set(() => ({
          additionalSections: get().additionalSections.filter(
            ({ key }) => key !== value.key
          ),
        })),
      setAdditionalSectionData: (sectionId, data) => {
        const sections = [...get().additionalSections];
        const section = sections.find(({ id }) => sectionId === id);
        section.data = data;
        set(() => ({ additionalSections: sections }));
      },
    }),
    {
      name: "resume-data", // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);

window.store = useStore;
