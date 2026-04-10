import InfoPage from './InfoPage.jsx';

const VALUES = [
  { icon: '👨‍👩‍👧‍👦', title: 'Family First', desc: 'Every piece of information is chosen with parents and children in mind — not just serious hikers.' },
  { icon: '✅', title: 'Verified Trails', desc: 'We only list routes we\'ve walked ourselves or that trusted families in our community have tested.' },
  { icon: '🔓', title: 'Always Free', desc: 'Trail data, safety info, and family ratings are free and always will be. No paywalls for the basics.' },
  { icon: '🇷🇴', title: 'Local Knowledge', desc: 'We focus on Romanian mountains — the trails, the conditions, the language, the seasons.' },
];

const TEAM = [
  { name: 'Andreea', role: 'Co-founder & Trail Curator', emoji: '🥾', bio: 'Parent of two. Has hiked every trail listed with her kids. Obsessed with finding the perfect "just-hard-enough" route for a 6-year-old.' },
  { name: 'Alex', role: 'Co-founder & Tech', emoji: '💻', bio: 'Software engineer by day, reluctant hiker until his daughter dragged him up his first mountain. Now he can\'t stop.' },
];

export default function AboutPage() {
  return (
    <InfoPage
      icon="🌿"
      title="About Us"
      subtitle="The story behind Hike & Seek — built by parents, for parents"
    >
      <div className="info-intro">
        <p>
          Hike & Seek started from a frustrating afternoon googling "easy hikes for toddlers
          in the Bucegi" and getting results that ranged from "walk in the park" to "bring
          crampons". We needed trail information that understood what it actually means to
          hike with young children — minimum ages, rest areas, bear risks, stroller access,
          and whether there's a toilet at the trailhead.
        </p>
        <p style={{ marginTop: '1rem' }}>
          So we built it ourselves.
        </p>
      </div>

      <div className="info-section">
        <h2>Our Mission</h2>
        <p className="info-text">
          To help Romanian families discover the joy of hiking together — by giving them
          the right information to choose trails that match their children's age, fitness,
          and interests. We believe that outdoor experiences in childhood shape people for
          life, and we want to lower the barrier to getting started.
        </p>
      </div>

      <div className="info-section">
        <h2>What We Do</h2>
        <div className="info-card-grid info-card-grid--2">
          {VALUES.map((v) => (
            <div key={v.title} className="info-card">
              <div className="info-card-icon">{v.icon}</div>
              <h3 className="info-card-title">{v.title}</h3>
              <p className="info-card-body">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="info-section">
        <h2>The Team</h2>
        <div className="team-grid">
          {TEAM.map((member) => (
            <div key={member.name} className="team-card">
              <div className="team-avatar">{member.emoji}</div>
              <div className="team-info">
                <div className="team-name">{member.name}</div>
                <div className="team-role">{member.role}</div>
                <p className="team-bio">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="info-section">
        <h2>Our Community</h2>
        <p className="info-text">
          Beyond the two of us, Hike & Seek is shaped by dozens of families who share
          trail reports, submit new routes, and flag issues. If you've hiked a trail with
          your kids and have something to add — conditions, kid-friendliness ratings, photos —
          we'd love to hear from you.
        </p>
        <div className="about-cta-row">
          <a href="/submit-trail" className="info-btn info-btn--primary">Submit a Trail</a>
          <a href="/report-issue" className="info-btn info-btn--secondary">Report an Issue</a>
        </div>
      </div>
    </InfoPage>
  );
}
