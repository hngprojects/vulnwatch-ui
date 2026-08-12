export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Product",
    links: [
      { label: "About Us", href: "/about-us" },
      { label: "Contact", href: "/contact" },
    ],
  },
  // Press hidden for now — re-enable when the Press page is ready.
  // {
  //   title: "Company",
  //   links: [
  //     { label: "Press", href: "/press" },
  //   ],
  // },
  {
    title: "Legal",
    links: [
      { label: "Legal Docs", href: "/legal-docs" },
    ],
  },
];
