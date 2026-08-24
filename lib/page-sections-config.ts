// Pure configuration for editable page sections -- NO server imports, so
// Client Components (e.g. PageSectionsForm) can safely import this. The
// server-only readers live in lib/page-sections.ts.

export type SectionField =
  | 'tag'
  | 'title'
  | 'subtitle'
  // Optional trailing note under a section's content.
  | 'footnote'
  // Optional call-to-action button rendered after the section.
  | 'link_text'
  | 'link_href'
  | 'link_icon'
  // Message shown when a database-driven section has nothing to show.
  | 'empty_text'

// Every field, in admin-form display order. Single source of truth: the
// reader, the save action, and the SQL column list are all derived from this,
// so adding a field here is the only edit needed to plumb it through.
export const SECTION_FIELDS = [
  'tag',
  'title',
  'subtitle',
  'footnote',
  'link_text',
  'link_href',
  'link_icon',
  'empty_text',
] as const satisfies readonly SectionField[]

// Drives the admin form: each declared field renders itself from this, so a
// new field needs no changes in PageSectionsForm.
export const SECTION_FIELD_META: Record<
  SectionField,
  { label: string; hint?: string; control: 'input' | 'textarea' }
> = {
  tag: {
    label: 'Label',
    hint: 'The small caption above the heading.',
    control: 'input',
  },
  title: { label: 'Heading', control: 'input' },
  subtitle: { label: 'Subtitle', control: 'textarea' },
  footnote: {
    label: 'Closing Note',
    hint: 'A short paragraph shown after this section, above the button. Leave blank to hide it.',
    control: 'textarea',
  },
  link_text: {
    label: 'Button Text',
    hint: 'Leave blank to hide the button entirely.',
    control: 'input',
  },
  link_href: {
    label: 'Button Link',
    hint: 'An internal path like /contact, or a full https:// address.',
    control: 'input',
  },
  link_icon: {
    label: 'Button Icon',
    hint: 'A Font Awesome class, e.g. "fab fa-facebook". Leave blank for no icon.',
    control: 'input',
  },
  empty_text: {
    label: 'Empty Message',
    hint: 'Shown only when there is nothing published in this section yet.',
    control: 'textarea',
  },
}

export type PageSection = {
  tag: string | null
  title: string | null
  subtitle: string | null
  footnote: string | null
  link_text: string | null
  link_href: string | null
  link_icon: string | null
  empty_text: string | null
}

export type PageSectionRow = PageSection & {
  id: string
  page_slug: string
  section_key: string
  display_order: number
  updated_at: string
}

// The pages that have editable sections, in the order shown in the admin.
export const PAGES: { slug: string; label: string }[] = [
  { slug: 'home', label: 'Home' },
  { slug: 'about', label: 'About' },
  { slug: 'admissions', label: 'Admissions' },
  { slug: 'programs', label: 'Programs' },
  { slug: 'student-life', label: 'Student Life' },
  { slug: 'faculty', label: 'Faculty' },
  { slug: 'news', label: 'News' },
  { slug: 'resources', label: 'Resources' },
  { slug: 'contact', label: 'Contact' },
]

// The copy this site shipped with. Single source of truth for fallbacks, so a
// missing row or cleared field never renders a blank heading on the public
// site. `label` is the human name shown above each section in the admin form;
// `fields` declares which of tag/title/subtitle that section actually uses.
export type SectionMeta = Partial<PageSection> & {
  label: string
  fields: SectionField[]
}

// Entries are Partial: any field a section doesn't declare is normalised to
// null by getPageSections(), so adding a new optional field here never
// requires touching all 16 existing sections.
export const SECTION_DEFAULTS: Record<string, Record<string, SectionMeta>> = {
  home: {
    programs: {
      label: 'Programs',
      fields: ['tag', 'title', 'subtitle'],
      tag: 'Our Programs',
      title: 'What We Offer',
      subtitle: 'Explore our holistic curriculum designed for the whole child.',
    },
    stats: {
      label: 'Milestones / Stats',
      fields: ['tag', 'title'],
      tag: 'Our Milestones',
      title: 'Syndesi School at a Glance',
      subtitle: null,
    },
    news: {
      label: 'Latest News',
      fields: ['tag', 'title', 'subtitle', 'empty_text', 'link_text', 'link_href'],
      tag: 'Updates',
      title: 'Latest News',
      subtitle: 'Stay informed about our school community.',
      empty_text: 'No news articles have been published yet. Check back soon.',
      link_text: 'View All News',
      link_href: '/news',
    },
    student_life: {
      label: 'Student Life',
      fields: ['tag', 'title', 'subtitle', 'link_text', 'link_href'],
      tag: 'Student Life',
      title: 'Beyond the Classroom',
      subtitle:
        'We believe in developing the whole student through clubs, sports, and activities.',
      link_text: 'Explore Student Life',
      link_href: '/student-life',
    },
    testimonials: {
      label: 'Community Voices',
      fields: ['tag', 'title', 'subtitle'],
      tag: 'Community Voices',
      title: 'What Our Community Says',
      subtitle:
        "We're building a collection of real stories from Syndesi families — here's your invitation to be featured.",
    },
    cta: {
      label: 'Closing Call to Action',
      // link_* here is the small inquiry link under the two CTA buttons; the
      // buttons themselves are items in the `cta_buttons` section.
      fields: ['title', 'subtitle', 'link_text', 'link_href'],
      link_text: 'Or send us a quick inquiry →',
      link_href: '/contact#contactForm',
      tag: null,
      title: "Ready to Begin Your Child's Learning Journey?",
      subtitle:
        'Join the Syndesi School community and give your child an education that nurtures every intelligence.',
    },
  },
  about: {
    intro: {
      label: 'Page Banner',
      fields: ['tag', 'title', 'subtitle'],
      tag: 'About Us',
      title: 'Our Story',
      subtitle:
        'Discover who we are, what we believe, and the values that shape every Syndesi learner.',
    },
    values: {
      label: 'Core Values',
      fields: ['title'],
      tag: null,
      title: 'Our Core Values',
      subtitle: null,
    },
  },
  admissions: {
    intro: {
      label: 'Page Banner',
      fields: ['tag', 'title', 'subtitle', 'link_text', 'link_href'],
      tag: 'Admissions',
      title: 'Enroll Your Child Today',
      subtitle:
        'We welcome students from Preschool through Junior High, with dedicated Special Education support. Discover the Syndesi difference.',
      link_text: 'Request More Information',
      link_href: '/contact',
    },
  },
  programs: {
    intro: {
      label: 'Page Banner',
      fields: ['tag', 'title', 'subtitle'],
      tag: 'Academic Programs',
      title: 'Our Educational Pathways',
      subtitle:
        'A seamless, enriched learning journey from Preschool through Junior High, with dedicated Special Education support.',
    },
    framework: {
      label: 'Multiple Intelligences Framework',
      fields: ['tag', 'title', 'subtitle'],
      tag: 'The Framework',
      title: 'Eight Multiple Intelligences',
      subtitle:
        "Our curriculum integrates Howard Gardner's theory, nurturing each child's unique strengths.",
    },
  },
  'student-life': {
    intro: {
      label: 'Page Banner',
      fields: ['tag', 'title', 'subtitle', 'footnote', 'link_text', 'link_href', 'link_icon'],
      tag: 'Student Life',
      title: 'Beyond the Classroom',
      subtitle:
        'We believe in developing the whole student through clubs, sports, and activities.',
      footnote: 'See student life in action on our Facebook photo albums.',
      link_text: 'View Photos on Facebook',
      link_href: 'https://www.facebook.com/profile.php?id=100057701558010&sk=photos',
      link_icon: 'fab fa-facebook',
    },
  },
  faculty: {
    intro: {
      label: 'Page Banner',
      fields: ['tag', 'title', 'subtitle', 'empty_text', 'footnote'],
      tag: 'Faculty & Staff',
      title: 'Our Dedicated Team',
      subtitle: 'Meet the educators who inspire and guide our students.',
      empty_text: 'Our faculty roster is being updated. Please check back soon.',
      footnote: 'Our complete faculty roster is available at the school office.',
    },
  },
  news: {
    intro: {
      label: 'Page Banner',
      fields: [
        'tag',
        'title',
        'subtitle',
        'empty_text',
        'footnote',
        'link_text',
        'link_href',
        'link_icon',
      ],
      tag: 'News & Announcements',
      title: 'Stay Updated',
      subtitle: 'The latest happenings at Syndesi School.',
      empty_text:
        'No news articles have been published yet. Check back soon, or follow us on Facebook below.',
      footnote: 'For real-time updates, announcements, and photos, follow us on Facebook.',
      link_text: 'Follow Us on Facebook',
      link_href:
        'https://www.facebook.com/SyndesiSchoolDemo',
      link_icon: 'fab fa-facebook',
    },
  },
  resources: {
    intro: {
      label: 'Page Banner',
      fields: ['tag', 'title', 'subtitle', 'empty_text', 'link_text', 'link_href'],
      tag: 'Resources',
      title: 'Helpful Forms & Handbooks',
      subtitle: 'Download the documents you need, or contact the school office for assistance.',
      empty_text:
        'Resources are being prepared. Please check back soon, or contact the school office.',
      link_text: 'Contact Us for These Documents',
      link_href: '/contact',
    },
  },
  contact: {
    intro: {
      label: 'Page Banner',
      fields: ['tag', 'title', 'subtitle'],
      tag: 'Get in Touch',
      title: "We'd Love to Hear From You",
      subtitle: "Visit us, call, or send a message. We're here to help.",
    },
    // The school name, address, phone, email, office hours and social links
    // shown under this heading all come from Website Settings -- this section
    // only owns the heading, so there is one source of truth for contact data.
    info: {
      label: 'Contact Information Heading',
      fields: ['title'],
      title: 'Contact Information',
    },
  },
}
