import type { NavItem } from "@/content/types";
import { getDefaultPropertyDestinationHref } from "@/lib/cx-api";

export const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Property", href: getDefaultPropertyDestinationHref() },
  { label: "Experiences", href: "/events" },
  { label: "About", href: "/about" },
];

export const footerLinks = {
  quickLinks: [
    ...navItems,
    { label: "Upcoming", href: "/upcoming" },
    { label: "Partner With Us", href: "/partner-with-us" },
  ],
  legal: [
    { label: "Policies", href: "/policies" },
  ],
};

export const siteMeta = {
  name: "Roost",
  tagline: "Stay. Mix. Repeat.",
  description:
    "A boutique social sanctuary and coliving hub in Koramangala, Bangalore. Designer private rooms, acoustic pod dorms, rooftop culture, and high-speed fiber.",
  contact: {
    email: "hello@roost.co",
    emailHref: "mailto:hello@roost.co",
    addressLines: [
      "Roost Koramangala",
      "13/14, Bank Officer Housing Co-operative Society",
      "Bengaluru Urban, Karnataka, India",
    ],
    instagramHref: "https://instagram.com/roost",
    mapsHref: "https://maps.app.goo.gl/jJKJUUKzdmFJGbCG6?g_st=aw",
  },
};
