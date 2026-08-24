// Pure configuration for editable page section ITEMS (the repeating cards
// inside each section). NO server imports, so Client Components can import
// this safely -- the server-only readers live in lib/page-section-items.ts.
//
// This is the companion to lib/page-sections-config.ts: that file holds one
// heading per section, this one holds many items per section.
//
// NOTE ON TEXT: values here are stored DECODED ('&' not '&amp;', "'" not
// '&apos;'). React escapes text nodes automatically, so seeding entity source
// would render literally. Dashes are intentionally inconsistent between
// sections (Student Life uses en dash '–', the homepage teaser uses em dash
// '—') -- preserve exactly, do not normalise.

export type ItemField =
  | 'icon'
  | 'title'
  | 'subtitle'
  | 'body'
  | 'body_suffix'
  | 'link_href'
  | 'link_text'
  | 'anchor_id'
  | 'value'
  | 'value_suffix'
  | 'value_format'

export type SectionItem = {
  id?: string
  display_order?: number
  icon?: string | null
  title?: string | null
  subtitle?: string | null
  body?: string | null
  body_suffix?: string | null
  link_href?: string | null
  link_text?: string | null
  anchor_id?: string | null
  value?: string | null
  value_suffix?: string | null
  value_format?: string | null
}

export type ItemSectionMeta = {
  label: string
  fields: ItemField[]
  // Fixed sets (e.g. the 4 stats, the 8 intelligences) don't offer "Add".
  allowAdd: boolean
  // When true, the `icon` field can hold EITHER a Font Awesome class OR an
  // uploaded photo URL (the admin editor shows a photo picker, and the public
  // avatar renders an <img> when the value is a URL). Used by testimonials so
  // real people can have real photos, falling back to the icon otherwise.
  iconAsImage?: boolean
}

// Which fields each section's items actually use -- drives the admin form so
// there are no dead inputs, same approach as page-sections-config's `fields`.
export const ITEM_SECTIONS: Record<string, Record<string, ItemSectionMeta>> = {
  home: {
    programs: {
      label: 'Program Cards',
      fields: ['icon', 'title', 'body', 'link_href', 'link_text'],
      allowAdd: true,
    },
    stats: {
      label: 'Statistics',
      fields: ['icon', 'value', 'value_suffix', 'value_format', 'title'],
      allowAdd: true,
    },
    mi_words: { label: 'Hero Words', fields: ['title'], allowAdd: true },
    // The two buttons under the hero headline. `title` is the button label,
    // `icon` the Font Awesome class shown before it.
    hero_buttons: {
      label: 'Hero Buttons',
      fields: ['icon', 'title', 'link_href'],
      allowAdd: true,
    },
    cta_buttons: {
      label: 'Closing CTA Buttons',
      fields: ['icon', 'title', 'link_href'],
      allowAdd: true,
    },
    student_life: {
      label: 'Student Life Cards',
      fields: ['icon', 'title', 'body'],
      allowAdd: true,
    },
    testimonials: {
      label: 'Testimonials',
      fields: ['icon', 'title', 'subtitle', 'body', 'link_href', 'link_text'],
      allowAdd: true,
      iconAsImage: true,
    },
  },
  about: {
    // Body prose for "Our Story" -- one item per paragraph. `title` is an
    // optional bold lead-in shown inline at the start of the paragraph.
    intro: { label: 'Story Paragraphs', fields: ['title', 'body'], allowAdd: true },
    // Fixed pair: Our Mission and Our Vision.
    mission_vision: {
      label: 'Mission & Vision',
      fields: ['icon', 'title', 'body'],
      allowAdd: false,
    },
    values: { label: 'Core Values', fields: ['title', 'body'], allowAdd: true },
  },
  admissions: {
    cards: { label: 'Info Cards', fields: ['icon', 'title', 'body'], allowAdd: true },
    requirements: { label: 'Admission Requirements (list)', fields: ['body'], allowAdd: true },
    procedure: { label: 'Enrollment Procedure (steps)', fields: ['body'], allowAdd: true },
  },
  programs: {
    levels: {
      label: 'Program Levels',
      fields: ['anchor_id', 'icon', 'title', 'body'],
      allowAdd: true,
    },
    note: {
      label: 'Senior High Note',
      fields: ['icon', 'title', 'body', 'link_text', 'link_href', 'body_suffix'],
      allowAdd: false,
    },
    framework: {
      label: 'Eight Intelligences',
      fields: ['title', 'body'],
      allowAdd: true,
    },
  },
  'student-life': {
    cards: { label: 'Student Life Cards', fields: ['icon', 'title', 'body'], allowAdd: true },
  },
}

// The copy this site shipped with. Used as the runtime fallback when a
// section returns zero rows, so a DB hiccup can never render an empty grid.
export const ITEM_DEFAULTS: Record<string, Record<string, SectionItem[]>> = {
  home: {
    programs: [
      {
        icon: 'fas fa-child',
        title: 'Preschool',
        body: 'Play-based learning that builds curiosity and foundational skills in a nurturing environment.',
        link_href: '/programs#preschool',
        link_text: 'Learn More',
      },
      {
        icon: 'fas fa-book',
        title: 'Elementary',
        body: 'A strong academic foundation balancing literacy, numeracy, and character education.',
        link_href: '/programs#elementary',
        link_text: 'Learn More',
      },
      {
        icon: 'fas fa-user-graduate',
        title: 'Junior High School',
        body: 'A challenging curriculum that prepares students for higher education and beyond.',
        link_href: '/programs#junior-high',
        link_text: 'Learn More',
      },
      {
        icon: 'fas fa-hands-helping',
        title: 'Special Education',
        body: 'Individualized support that helps every learner reach their full potential.',
        link_href: '/programs#special-education',
        link_text: 'Learn More',
      },
    ],
    stats: [
      {
        icon: 'fas fa-calendar-check',
        value: '7',
        value_suffix: '+',
        value_format: null,
        title: 'Years of Excellence',
      },
      {
        icon: 'fas fa-layer-group',
        value: '4',
        value_suffix: null,
        value_format: null,
        title: 'Academic Programs',
      },
      {
        icon: 'fab fa-facebook',
        value: '1900',
        value_suffix: '+',
        value_format: 'k',
        title: 'Facebook Community',
      },
      {
        icon: 'fas fa-brain',
        value: '8',
        value_suffix: null,
        value_format: null,
        title: 'Intelligences We Nurture',
      },
    ],
    // First button renders as primary, the rest as secondary -- position, not
    // a stored style, so admins can't produce an invalid combination.
    hero_buttons: [
      { icon: 'fas fa-pen-to-square', title: 'Enroll Now', link_href: '/admissions' },
      { icon: 'fas fa-chevron-down', title: 'Learn More', link_href: '#programs' },
    ],
    cta_buttons: [
      { icon: 'fas fa-pen-to-square', title: 'Enroll Now', link_href: '/admissions' },
      { icon: 'fas fa-phone', title: 'Contact Us', link_href: '/contact' },
    ],
    mi_words: [
      { title: 'Discover' },
      { title: 'Create' },
      { title: 'Lead' },
      { title: 'Inspire' },
    ],
    student_life: [
      {
        icon: 'fas fa-medal',
        title: 'Clubs & Organizations',
        // em dash — (homepage teaser)
        body: "Debate, science, and art clubs — there's something for every interest.",
      },
      {
        icon: 'fas fa-futbol',
        title: 'Sports',
        body: 'Basketball, volleyball, track, and chess in a team environment.',
      },
      {
        icon: 'fas fa-theater-masks',
        title: 'Events & Activities',
        body: 'Cultural festivals, field trips, and community service projects.',
      },
      {
        icon: 'fas fa-trophy',
        title: 'Achievements',
        body: 'Students who consistently excel in regional and national competitions.',
      },
    ],
    testimonials: [
      {
        icon: 'fas fa-people-roof',
        title: 'Parents',
        subtitle: 'Syndesi Family',
        body: '"We\'d love to share what makes your experience as a Syndesi parent special. Your story could be the next one featured here."',
        link_href: '/contact',
        link_text: 'Share Your Story',
      },
      {
        icon: 'fas fa-user-graduate',
        title: 'Students',
        subtitle: 'Syndesi Student',
        body: '"What\'s your favorite Syndesi memory? We\'re inviting current students to share their experiences for this space."',
        link_href: '/contact',
        link_text: 'Share Your Story',
      },
      {
        icon: 'fas fa-user-tie',
        title: 'Alumni',
        subtitle: 'Syndesi Graduate',
        body: '"Wherever your journey has taken you since Syndesi, we\'d be honored to feature your reflections here."',
        link_href: '/contact',
        link_text: 'Share Your Story',
      },
    ],
  },
  about: {
    // `title` renders as a bold lead-in inline at the start of the paragraph;
    // leave it blank for a plain paragraph.
    intro: [
      {
        title: 'Syndesi School',
        body: 'is a progressive educational institution located in Batangas City, Batangas. We are committed to providing a holistic approach to education, focusing on the development of children\'s multiple intelligences.',
      },
      {
        title: null,
        body: "Our curriculum is based on the theory of multiple intelligences proposed by Howard Gardner, which suggests that intelligence is not a singular entity, but rather a blend of different abilities. We believe in nurturing the unique talents and strengths of each child.",
      },
      {
        title: null,
        body: 'With a strong emphasis on creativity, critical thinking, and emotional intelligence, we prepare students to become lifelong learners and responsible global citizens.',
      },
    ],
    mission_vision: [
      {
        icon: 'fas fa-bullseye',
        title: 'Our Mission',
        body: "To nurture every child's unique intelligences through holistic, learner-centered education — developing confident, compassionate, and capable individuals ready to contribute meaningfully to their community and the world.",
      },
      {
        icon: 'fas fa-eye',
        title: 'Our Vision',
        body: 'To be a leading school where every learner discovers their strengths, embraces lifelong learning, and grows into a responsible, globally-minded citizen.',
      },
    ],
    facts: [
      { icon: 'fas fa-calendar-alt', title: 'Founded', body: '2019' },
      { icon: 'fas fa-map-pin', title: 'Location', body: 'Batangas City, Batangas' },
      { icon: 'fas fa-user-graduate', title: 'School Head', body: 'Imeilyn Faltado' },
      { icon: 'fas fa-award', title: 'Accreditation', body: 'DepEd Accredited' },
    ],
    values: [
      { title: 'Integrity', body: 'Upholding honesty and moral principles.' },
      { title: 'Excellence', body: 'Striving for the highest quality in all we do.' },
      { title: 'Innovation', body: 'Embracing creativity and forward-thinking.' },
      { title: 'Community', body: 'Fostering a supportive and inclusive environment.' },
    ],
  },
  admissions: {
    // Cards 1 and 2 render their body from the requirements/procedure
    // sections below, so their own `body` stays null.
    cards: [
      { icon: 'fas fa-clipboard-list', title: 'Admission Requirements', body: null },
      { icon: 'fas fa-calendar-check', title: 'Enrollment Procedure', body: null },
      {
        icon: 'fas fa-coins',
        title: 'Tuition & Fees',
        body: 'For the latest tuition fee schedule, please contact our finance office or visit the school. We offer flexible payment plans.',
      },
      {
        icon: 'fas fa-graduation-cap',
        title: 'Scholarships',
        body: 'We offer academic and athletic scholarships. Inquire at the admissions office for qualification criteria and deadlines.',
      },
    ],
    requirements: [
      { body: 'Completed application form' },
      { body: 'Birth certificate (PSA)' },
      { body: 'Report card (previous grade)' },
      { body: 'Good moral certificate' },
      { body: '2x2 ID photos' },
    ],
    procedure: [
      { body: 'Submit requirements to the Registrar.' },
      { body: 'Take the entrance assessment (if applicable).' },
      { body: 'Interview with the Principal.' },
      { body: 'Pay the registration fee.' },
      { body: 'Receive class schedule and ID.' },
    ],
  },
  programs: {
    levels: [
      {
        anchor_id: 'preschool',
        icon: 'fas fa-child',
        title: 'Preschool',
        body: 'Play-based learning that fosters curiosity and foundational skills in a nurturing environment.',
      },
      {
        anchor_id: 'elementary',
        icon: 'fas fa-book',
        title: 'Elementary',
        body: 'Strong academic foundation with a balanced approach to literacy, numeracy, and character education.',
      },
      {
        anchor_id: 'junior-high',
        icon: 'fas fa-user-graduate',
        title: 'Junior High School',
        body: 'Challenging curriculum that prepares students for higher education and career readiness.',
      },
      {
        anchor_id: 'special-education',
        icon: 'fas fa-hands-helping',
        title: 'Special Education',
        body: "Individualized programs and support services designed around each learner's needs.",
      },
    ],
    note: [
      {
        icon: 'fas fa-question-circle',
        title: 'Considering Senior High?',
        body: 'Please ',
        link_text: 'inquire with our admissions office',
        link_href: '/contact',
        body_suffix: ' for current Senior High School offerings and available tracks.',
      },
    ],
    framework: [
      { title: 'Linguistic', body: 'Word and language mastery' },
      { title: 'Logical-Mathematical', body: 'Reasoning and numbers' },
      { title: 'Spatial', body: 'Visual and spatial thinking' },
      { title: 'Bodily-Kinesthetic', body: 'Physical expression' },
      { title: 'Musical', body: 'Rhythm and sound' },
      { title: 'Interpersonal', body: 'Social understanding' },
      { title: 'Intrapersonal', body: 'Self-awareness' },
      { title: 'Naturalistic', body: 'Nature and environment' },
    ],
  },
  'student-life': {
    cards: [
      {
        icon: 'fas fa-medal',
        title: 'Clubs & Organizations',
        // en dash – (student-life page, differs from the homepage teaser)
        body: "Join our debate club, science club, art society, and more – there's something for every interest.",
      },
      {
        icon: 'fas fa-futbol',
        title: 'Sports',
        body: 'Basketball, volleyball, track, and chess – compete and grow in a team environment.',
      },
      {
        icon: 'fas fa-theater-masks',
        title: 'Events & Activities',
        body: 'Annual cultural festivals, field trips, and community service projects.',
      },
      {
        icon: 'fas fa-trophy',
        title: 'Achievements',
        body: 'Our students consistently win in regional and national competitions, showcasing excellence.',
      },
    ],
  },
}
