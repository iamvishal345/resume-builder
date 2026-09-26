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
    translationKey: "extras.custom",
    component: CustomSection,
    icon: LayoutGrid,
  },
  {
    id: 2,
    title: "Accomplishments",
    translationKey: "extras.accomplishments",
    component: Accomplishments,
    icon: Award,
  },
  {
    id: 3,
    title: "Volunteer Experience",
    translationKey: "extras.volunteering",
    component: VolunteerExperience,
    icon: Wind,
  },
  {
    id: 4,
    title: "Certifications",
    translationKey: "extras.certifications",
    component: Certifications,
    icon: BadgeCheck,
  },
  {
    id: 5,
    title: "Languages",
    translationKey: "extras.languages",
    component: Languages,
    icon: Type,
  },
  {
    id: 6,
    title: "References",
    translationKey: "extras.references",
    component: References,
    icon: Briefcase,
  },
  {
    id: 7,
    title: "Interests",
    translationKey: "extras.interests",
    component: Interests,
    icon: Heart,
  },
];
