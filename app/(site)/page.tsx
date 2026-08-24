import Link from 'next/link'
import { getFeaturedNews } from '@/lib/news'
import { getSiteSettings, DEFAULT_SETTINGS } from '@/lib/settings'
import { getPageSections } from '@/lib/page-sections'
import { getPageItems } from '@/lib/page-section-items'
import SectionCta, { SectionTag, SmartLink } from '@/components/SectionCta'

export default async function HomePage() {
  const [latestNews, settings, s, items] = await Promise.all([
    getFeaturedNews(3),
    getSiteSettings(),
    getPageSections('home'),
    getPageItems('home'),
  ])

  // Fall back to the shipped copy if a hero column is ever null, so the
  // banner is never blank.
  const heroTagline = settings.hero_tagline || DEFAULT_SETTINGS.hero_tagline
  const heroHeading = settings.hero_heading || DEFAULT_SETTINGS.hero_heading
  const heroHeadingHighlight =
    settings.hero_heading_highlight || DEFAULT_SETTINGS.hero_heading_highlight
  const heroDescription = settings.hero_description || DEFAULT_SETTINGS.hero_description
  // No default fallback here: a blank caption should genuinely hide the line,
  // since not every hero photo needs a location label.
  const campusCaption = settings.hero_campus_caption
  return (
    <>
      {/* ===== HERO ===== */}
      <section className="hero" id="home">
        <div
          className="hero-bg-photo"
          role="img"
          aria-label="Syndesi School campus building in Batangas City, Batangas"
        ></div>
        <div className="hero-overlay" aria-hidden="true"></div>
        <div className="hero-ring" aria-hidden="true"></div>
        <div className="hero-ring-inner" aria-hidden="true"></div>
        <div className="hero-shapes" aria-hidden="true">
          <span className="shape-1"></span>
          <span className="shape-2"></span>
          <span className="shape-3"></span>
          <span className="shape-4"></span>
        </div>

        <div className="hero-mi-orbit" aria-hidden="true">
          <span className="mi-icon-wrap mi-tier-1 mi-pos-1" title="Linguistic / Communication">
            <span className="mi-icon"><i className="fas fa-book"></i></span>
          </span>
          <span className="mi-icon-wrap mi-tier-3 mi-pos-2" title="Logical / Science">
            <span className="mi-icon"><i className="fas fa-atom"></i></span>
          </span>
          <span className="mi-icon-wrap mi-tier-1 mi-pos-3" title="Creativity / Arts">
            <span className="mi-icon"><i className="fas fa-palette"></i></span>
          </span>
          <span className="mi-icon-wrap mi-tier-1 mi-pos-4" title="Music">
            <span className="mi-icon"><i className="fas fa-music"></i></span>
          </span>
          <span className="mi-icon-wrap mi-tier-2 mi-pos-5" title="Sports / Physical Development">
            <span className="mi-icon"><i className="fas fa-futbol"></i></span>
          </span>
          <span className="mi-icon-wrap mi-tier-3 mi-pos-6" title="Leadership / Collaboration">
            <span className="mi-icon"><i className="fas fa-users"></i></span>
          </span>
          <span className="mi-icon-wrap mi-tier-2 mi-pos-7" title="Nature / Discovery">
            <span className="mi-icon"><i className="fas fa-seedling"></i></span>
          </span>
          <span className="mi-icon-wrap mi-tier-1 mi-pos-8" title="Innovation / Problem Solving">
            <span className="mi-icon"><i className="fas fa-lightbulb"></i></span>
          </span>
        </div>

        <div className="hero-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <i className="fas fa-star" aria-hidden="true"></i>
              <span className="hero-badge-label">Every Student Can</span>
              <span className="rotating-word" id="rotatingWord">Think</span>
            </div>
            <p className="hero-tagline">{heroTagline}</p>
            <h1>
              {heroHeading}<br />
              <span className="highlight">{heroHeadingHighlight}</span>
            </h1>
            <p>{heroDescription}</p>
            <div className="hero-mi-words" aria-hidden="true">
              {items.mi_words?.map((w, i) => (
                <span key={w.id ?? i}>
                  <span className="mi-word">{w.title}</span>
                  {i < (items.mi_words?.length ?? 0) - 1 && <span className="dot">•</span>}
                </span>
              ))}
            </div>
            <div className="hero-buttons">
              {/* First button is primary, the rest secondary -- derived from
                  position so the CMS can't produce two competing primaries. */}
              {items.hero_buttons?.map((b, i) => (
                <SmartLink
                  key={b.id ?? i}
                  href={b.link_href ?? '#'}
                  className={i === 0 ? 'btn-primary' : 'btn-secondary'}
                >
                  {b.icon && (
                    <i className={b.icon} aria-hidden="true" style={{ marginRight: 8 }}></i>
                  )}
                  {b.title}
                </SmartLink>
              ))}
            </div>
          </div>
        </div>

        {campusCaption && (
          <div className="hero-photo-credit">
            <i className="fas fa-location-dot" aria-hidden="true"></i> {campusCaption}
          </div>
        )}
        <a href="#programs" className="hero-scroll-cue" aria-label="Scroll to programs">
          <i className="fas fa-chevron-down" aria-hidden="true"></i>
        </a>
      </section>

      {/* ===== FEATURED PROGRAMS ===== */}
      <section id="programs">
        <div className="container">
          <div className="section-head-center">
            <SectionTag icon="fas fa-graduation-cap" label={s.programs.tag} />
            <h2 className="section-title">{s.programs.title}</h2>
            <p className="section-subtitle">{s.programs.subtitle}</p>
          </div>
          <div className="card-grid">
            {items.programs?.map((p, i) => (
              <div className="program-card reveal" key={p.id ?? i}>
                <span className="program-icon"><i className={p.icon ?? ''} aria-hidden="true"></i></span>
                <h4>{p.title}</h4>
                <p>{p.body}</p>
                {p.link_text && (
                  <Link href={p.link_href ?? '#'} className="card-learn-more program-link">
                    {p.link_text} <i className="fas fa-arrow-right" aria-hidden="true"></i>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="stats-section dot-pattern" id="stats">
        <div className="container">
          <div className="section-head-center">
            <SectionTag
              icon="fas fa-chart-line"
              label={s.stats.tag}
              style={{ background: 'rgba(246,201,59,0.15)', color: 'var(--gold)' }}
            />
            <h2 className="section-title" style={{ color: '#fff' }}>{s.stats.title}</h2>
          </div>
          <div className="stats-strip">
            {items.stats?.map((stat, i) => (
              <div className="stat-card reveal" key={stat.id ?? i}>
                <i className={stat.icon ?? ''} aria-hidden="true"></i>
                {/* data-* attributes drive the count-up animation in
                    site-interactions.tsx -- omit them when empty so the
                    formatter behaves exactly as it did when hardcoded. */}
                <h3
                  data-count={stat.value ?? undefined}
                  data-suffix={stat.value_suffix ?? undefined}
                  data-format={stat.value_format ?? undefined}
                >
                  0
                </h3>
                <p>{stat.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== LATEST NEWS & ANNOUNCEMENTS ===== */}
      <section>
        <div className="container">
          <div className="section-head-center">
            <SectionTag icon="fas fa-newspaper" label={s.news.tag} />
            <h2 className="section-title">{s.news.title}</h2>
            <p className="section-subtitle">{s.news.subtitle}</p>
          </div>
          {latestNews.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{s.news.empty_text}</p>
          ) : (
            <div className="card-grid">
              {latestNews.map((article) => (
                <div className="card news-card reveal" key={article.id}>
                  {/* Same conditional as the /news list: no image attached
                      means a plain text card, not an empty placeholder. */}
                  {article.featured_image_url && (
                    <div className="news-card-media">
                      <img
                        src={article.featured_image_url}
                        alt={article.title}
                        className="news-card-image"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <h4>{article.title}</h4>
                  {article.summary && <p>{article.summary}</p>}
                  <Link href={`/news/${article.slug}`} className="card-learn-more">
                    Read More <i className="fas fa-arrow-right" aria-hidden="true"></i>
                  </Link>
                </div>
              ))}
            </div>
          )}
          <SectionCta section={s.news} marginTop={30} />
        </div>
      </section>

      {/* ===== STUDENT LIFE TEASER ===== */}
      <section className="section-alt" id="student-life-preview">
        <div className="container">
          <div className="section-head-center">
            <SectionTag icon="fas fa-users" label={s.student_life.tag} />
            <h2 className="section-title">{s.student_life.title}</h2>
            <p className="section-subtitle">{s.student_life.subtitle}</p>
          </div>
          <div className="card-grid">
            {items.student_life?.map((c, i) => (
              <div className="program-card reveal" key={c.id ?? i}>
                <span className="program-icon"><i className={c.icon ?? ''} aria-hidden="true"></i></span>
                <h4>{c.title}</h4>
                <p>{c.body}</p>
              </div>
            ))}
          </div>
          <SectionCta section={s.student_life} marginTop={30} />
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section id="testimonials">
        <div className="container">
          <div className="section-head-center">
            <SectionTag icon="fas fa-comment-dots" label={s.testimonials.tag} />
            <h2 className="section-title">{s.testimonials.title}</h2>
            <p className="section-subtitle">{s.testimonials.subtitle}</p>
          </div>
          <div className="testimonial-carousel reveal" id="testimonialCarousel">
            <div className="testimonial-track-wrap">
              <div className="testimonial-track" id="testimonialTrack">
                {items.testimonials?.map((t, i) => (
                  <div className="testimonial-slide" key={t.id ?? i}>
                    <div className="testimonial-card">
                      {/* The icon slot holds either a photo URL (real person)
                          or a Font Awesome class (placeholder). */}
                      <div className="testimonial-avatar">
                        {t.icon && /^(https?:\/\/|\/)/.test(t.icon) ? (
                          <img src={t.icon} alt={t.title ?? ''} className="testimonial-photo" />
                        ) : (
                          <i className={t.icon ?? ''} aria-hidden="true"></i>
                        )}
                      </div>
                      <h4>{t.title}</h4>
                      <div className="role">{t.subtitle}</div>
                      <p>{t.body}</p>
                      {t.link_text && (
                        <Link href={t.link_href ?? '#'} className="card-learn-more">
                          {t.link_text} <i className="fas fa-arrow-right" aria-hidden="true"></i>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="testimonial-dots" id="testimonialDots"></div>
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="cta-section dot-pattern" id="cta">
        <div className="container">
          <h2>{s.cta.title}</h2>
          <p>{s.cta.subtitle}</p>
          <div className="cta-buttons">
            {items.cta_buttons?.map((b, i) => (
              <SmartLink
                key={b.id ?? i}
                href={b.link_href ?? '#'}
                className={i === 0 ? 'btn-primary' : 'btn-secondary'}
              >
                {b.icon && <i className={b.icon} aria-hidden="true" style={{ marginRight: 8 }}></i>}
                {b.title}
              </SmartLink>
            ))}
          </div>
          {s.cta.link_text && s.cta.link_href && (
            <SmartLink href={s.cta.link_href} className="cta-inquiry-link">
              {s.cta.link_text}
            </SmartLink>
          )}
        </div>
      </section>
    </>
  )
}
