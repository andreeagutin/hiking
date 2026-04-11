/**
 * Logo Showcase — presents 4 different "Hike'n'Seek" logo variations
 * for the user to choose from.
 */

export default function LogoShowcase() {
  return (
    <div className="logo-showcase">
      <div className="logo-showcase-header">
        <h1>Choose Your New Logo</h1>
        <p>Four versions of &quot;Hike&apos;n&apos;Seek&quot; designed to match your family hiking website</p>
      </div>

      <div className="logo-grid">
        {/* Version 1: Classic with ampersand styling */}
        <div className="logo-card">
          <span className="logo-version">Version 1</span>
          <h3 className="logo-name">Classic Elegant</h3>
          <div className="logo-preview logo-preview--dark">
            <div className="logo-display logo-v1">
              <svg className="logo-icon" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="24" cy="24" r="22" fill="#1a3d2b" stroke="#40916c" strokeWidth="2"/>
                <path d="M24 10L36 32H12L24 10Z" fill="#40916c"/>
                <path d="M24 16L32 30H16L24 16Z" fill="#74c69d"/>
                <circle cx="24" cy="22" r="3" fill="#d8f3dc"/>
                <path d="M18 32C18 32 21 28 24 28C27 28 30 32 30 32" stroke="#1a3d2b" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span className="logo-text">
                <span className="logo-hike">Hike</span>
                <span className="logo-apostrophe">&apos;</span>
                <span className="logo-n">n</span>
                <span className="logo-apostrophe">&apos;</span>
                <span className="logo-seek">Seek</span>
              </span>
            </div>
          </div>
          <p className="logo-desc">
            Clean separation with subtle apostrophes. The &quot;n&quot; acts as a natural bridge between words.
          </p>
        </div>

        {/* Version 2: Playful with highlighted connector */}
        <div className="logo-card">
          <span className="logo-version">Version 2</span>
          <h3 className="logo-name">Playful Adventure</h3>
          <div className="logo-preview logo-preview--dark">
            <div className="logo-display logo-v2">
              <svg className="logo-icon" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="24" cy="24" r="22" fill="#1a3d2b" stroke="#40916c" strokeWidth="2"/>
                <path d="M24 10L36 32H12L24 10Z" fill="#40916c"/>
                <path d="M24 16L32 30H16L24 16Z" fill="#74c69d"/>
                <circle cx="24" cy="22" r="3" fill="#d8f3dc"/>
                <path d="M18 32C18 32 21 28 24 28C27 28 30 32 30 32" stroke="#1a3d2b" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span className="logo-text">
                <span className="logo-hike">Hike</span>
                <span className="logo-connector">&apos;n&apos;</span>
                <span className="logo-seek">Seek</span>
              </span>
            </div>
          </div>
          <p className="logo-desc">
            The &quot;&apos;n&apos;&quot; connector is highlighted in gold, adding warmth and a playful family feel.
          </p>
        </div>

        {/* Version 3: Compact with script styling */}
        <div className="logo-card">
          <span className="logo-version">Version 3</span>
          <h3 className="logo-name">Compact Script</h3>
          <div className="logo-preview logo-preview--dark">
            <div className="logo-display logo-v3">
              <svg className="logo-icon" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="24" cy="24" r="22" fill="#1a3d2b" stroke="#40916c" strokeWidth="2"/>
                <path d="M24 10L36 32H12L24 10Z" fill="#40916c"/>
                <path d="M24 16L32 30H16L24 16Z" fill="#74c69d"/>
                <circle cx="24" cy="22" r="3" fill="#d8f3dc"/>
                <path d="M18 32C18 32 21 28 24 28C27 28 30 32 30 32" stroke="#1a3d2b" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span className="logo-text">
                Hike<span className="logo-script">&apos;n&apos;</span>Seek
              </span>
            </div>
          </div>
          <p className="logo-desc">
            Tightly connected with an italicized &quot;&apos;n&apos;&quot; that flows like a trail between words.
          </p>
        </div>

        {/* Version 4: Bold with underline accent */}
        <div className="logo-card">
          <span className="logo-version">Version 4</span>
          <h3 className="logo-name">Bold Trail</h3>
          <div className="logo-preview logo-preview--dark">
            <div className="logo-display logo-v4">
              <svg className="logo-icon" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="24" cy="24" r="22" fill="#1a3d2b" stroke="#40916c" strokeWidth="2"/>
                <path d="M24 10L36 32H12L24 10Z" fill="#40916c"/>
                <path d="M24 16L32 30H16L24 16Z" fill="#74c69d"/>
                <circle cx="24" cy="22" r="3" fill="#d8f3dc"/>
                <path d="M18 32C18 32 21 28 24 28C27 28 30 32 30 32" stroke="#1a3d2b" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span className="logo-text-wrap">
                <span className="logo-text">HIKE&apos;N&apos;SEEK</span>
                <span className="logo-underline"></span>
              </span>
            </div>
          </div>
          <p className="logo-desc">
            All caps with a trail-like underline accent. Strong, confident, and adventure-ready.
          </p>
        </div>
      </div>

      <div className="logo-footer">
        <p>Each version maintains your existing mountain logo icon and color palette.</p>
      </div>
    </div>
  );
}
