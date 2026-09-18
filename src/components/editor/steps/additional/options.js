import {
  Award,
  BadgeCheck,
  Briefcase,
  Heart,
  LayoutGrid,
  Type,
  Wind,
} from "lucide-react";
import CustomSection from "./CustomSection";
import Accomplishments from "./Accomplishments";
import VolunteerExperience from "./VolunteerExperience";
import Certifications from "./Certifications";
import Languages from "./Languages";
import References from "./References";
import Interests from "./Interests";

export const additionalSectionsOptions = [
  {
    id: 1,
    title: "Custom Section",
    component: CustomSection,
    icon: LayoutGrid,
  },
  {
    id: 2,
    title: "Accomplishments",
    component: Accomplishments,
    icon: Award,
  },
  {
    id: 3,
    title: "Volunteer Experience",
    component: VolunteerExperience,
    icon: Wind,
  },
  {
    id: 4,
    title: "Certifications",
    component: Certifications,
    icon: BadgeCheck,
  },
  {
    id: 5,
    title: "Languages",
    component: Languages,
    icon: Type,
  },
  {
    id: 6,
    title: "References",
    component: References,
    icon: Briefcase,
  },
  {
    id: 7,
    title: "Interests",
    component: Interests,
    icon: Heart,
  },
];
