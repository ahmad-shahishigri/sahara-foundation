"use client";
export default function Home() {

  return (
    <div style={pageStyle}>
      {/* Landing Page Section */}
      <main style={mainStyle}>
        <div style={introStyle}>
          <h1 style={h1Style}>Sahara  Welfare Foundation</h1>
          <p style={pStyle}>
            Welcome to the Sahara Welfare Foundation Management System. 
            Track donations, manage loans, and monitor expenses in real-time.
          </p>
          <div style={ctasStyle}>
            <a
              href="/dashboard"
              style={primaryBtnStyle}
              rel="noopener noreferrer"
            >
              Go to Dashboard →
            </a>
            <a
              href="https://www.saharafoundation.pk/"
              style={secondaryBtnStyle}
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn More
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={footerStyle}>
        <div style={footerContainerStyle}>
          {/* Main Footer Content */}
          <div style={footerMainStyle}>
            {/* Logo and Description */}
            <div style={footerBrandStyle}>
              <div style={footerLogoStyle}>
                <div style={logoStyle}>
                  <i className="fas fa-hands-helping"></i>
                </div>
                <div style={footerTitleStyle}>
                  <h3 style={footerH3Style}>Sahara Welfare Foundation</h3>
                  <p style={footerP1Style}>Empowering communities through financial support and resources</p>
                </div>
              </div>
              <p style={footerDescriptionStyle}>
                A non-profit organization dedicated to providing financial assistance, 
                loans, and support to those in need. Building stronger communities 
                through compassion and action.
              </p>
              <div style={socialLinksStyle}>
                <a href="#" style={socialLinkStyle} aria-label="Facebook">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="#" style={socialLinkStyle} aria-label="Twitter">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#" style={socialLinkStyle} aria-label="Instagram">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="#" style={socialLinkStyle} aria-label="LinkedIn">
                  <i className="fab fa-linkedin-in"></i>
                </a>
                <a href="#" style={socialLinkStyle} aria-label="YouTube">
                  <i className="fab fa-youtube"></i>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div style={footerLinksStyle}>
              <h4 style={linksTitleStyle}>Quick Links</h4>
              <ul style={linksListStyle}>
                <li><a href="#" style={linkItemStyle}><i className="fas fa-chevron-right"></i> About Us</a></li>
                <li><a href="#" style={linkItemStyle}><i className="fas fa-chevron-right"></i> Our Mission</a></li>
                <li><a href="#" style={linkItemStyle}><i className="fas fa-chevron-right"></i> How to Donate</a></li>
                <li><a href="#" style={linkItemStyle}><i className="fas fa-chevron-right"></i> Loan Application</a></li>
                <li><a href="#" style={linkItemStyle}><i className="fas fa-chevron-right"></i> Success Stories</a></li>
                <li><a href="#" style={linkItemStyle}><i className="fas fa-chevron-right"></i> Annual Reports</a></li>
              </ul>
            </div>

            {/* Contact Information */}
            <div style={footerContactStyle}>
              <h4 style={contactTitleStyle}>Contact Us</h4>
              <div style={contactInfoStyle}>
                <div style={contactItemStyle}>
                  <div style={contactIconStyle}>
                    <i className="fas fa-envelope"></i>
                  </div>
                  <div style={contactDetailsStyle}>
                    <p style={contactLabelStyle}>Email</p>
                    <a href="mailto:saharafoundation@support.pk" style={contactValueStyle}>saharafoundation@support.pk</a>
                  </div>
                </div>
                
                <div style={contactItemStyle}>
                  <div style={contactIconStyle}>
                    <i className="fas fa-phone"></i>
                  </div>
                  <div style={contactDetailsStyle}>
                    <p style={contactLabelStyle}>Office Contact</p>
                    <a href="tel:03105855299" style={contactValueStyle}>0310 5855299</a>
                  </div>
                </div>
                
                <div style={contactItemStyle}>
                  <div style={contactIconStyle}>
                    <i className="fas fa-map-marker-alt"></i>
                  </div>
                  <div style={contactDetailsStyle}>
                    <p style={contactLabelStyle}>Address</p>
                    <p style={contactValueStyle}>PD House No. 249, Near Double Road, Rawalpindi</p>
                  </div>
                </div>
                
                <div style={contactItemStyle}>
                  <div style={contactIconStyle}>
                    <i className="fas fa-clock"></i>
                  </div>
                  <div style={contactDetailsStyle}>
                    <p style={contactLabelStyle}>Office Hours</p>
                    <p style={contactValueStyle}>Mon - Fri: 9:00 AM - 5:00 PM</p>
                    <p style={contactValueStyle}>Sat: 10:00 AM - 2:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Newsletter */}
            <div style={footerNewsletterStyle}>
              <h4 style={newsletterTitleStyle}>Stay Updated</h4>
              <p style={newsletterDescStyle}>Subscribe to our newsletter for updates on our initiatives</p>
              <form style={newsletterFormStyle}>
                <div style={inputGroupStyle}>
                  <input type="email" placeholder="Enter your email" required style={inputStyle} />
                  <button type="submit" style={subscribeBtnStyle}>
                    <i className="fas fa-paper-plane"></i>
                  </button>
                </div>
              </form>
              <div style={trustBadgesStyle}>
                <div style={badgeStyle}>
                  <i className="fas fa-shield-alt"></i>
                  <span>Trusted Organization</span>
                </div>
                <div style={badgeStyle}>
                  <i className="fas fa-certificate"></i>
                  <span>Registered NGO</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div style={footerBottomStyle}>
            <div style={footerBottomContentStyle}>
              <div style={copyrightStyle}>
                <p>&copy; 2024 Sahara Welfare Foundation. All Rights Reserved.</p>
              </div>
              <div style={footerBottomLinksStyle}>
                <a href="#" style={bottomLinkStyle}>Privacy Policy</a>
                <a href="#" style={bottomLinkStyle}>Terms of Service</a>
                <a href="#" style={bottomLinkStyle}>Disclaimer</a>
                <a href="#" style={bottomLinkStyle}>Sitemap</a>
              </div>
              <div style={paymentMethodsStyle}>
                <span style={paymentTextStyle}>Donations Accepted Via:</span>
                <div style={paymentIconsStyle}>
                  <i className="fab fa-cc-visa" title="Visa" style={paymentIconStyle}></i>
                  <i className="fab fa-cc-mastercard" title="MasterCard" style={paymentIconStyle}></i>
                  <i className="fas fa-university" title="Bank Transfer" style={paymentIconStyle}></i>
                  <i className="fas fa-mobile-alt" title="Mobile Banking" style={paymentIconStyle}></i>
                  <i className="fas fa-hand-holding-usd" title="Cash" style={paymentIconStyle}></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
        }
        
        body {
          margin: 0;
          padding: 0;
        }
      `}</style>
    </div>
  );
}

// Inline CSS Styles
const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
};

const mainStyle: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px 20px',
};

const introStyle: React.CSSProperties = {
  maxWidth: '800px',
  textAlign: 'center',
  padding: '60px 40px',
  background: 'rgba(255, 255, 255, 0.9)',
  borderRadius: '24px',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
};

const h1Style: React.CSSProperties = {
  fontSize: '48px',
  fontWeight: 800,
  color: '#1a202c',
  marginBottom: '24px',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
};

const pStyle: React.CSSProperties = {
  fontSize: '20px',
  color: '#4a5568',
  marginBottom: '40px',
  lineHeight: 1.8,
};

const ctasStyle: React.CSSProperties = {
  display: 'flex',
  gap: '20px',
  justifyContent: 'center',
  flexWrap: 'wrap',
};

const primaryBtnStyle: React.CSSProperties = {
  padding: '16px 32px',
  borderRadius: '12px',
  fontSize: '18px',
  fontWeight: 600,
  textDecoration: 'none',
  transition: 'all 0.3s ease',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  boxShadow: '0 8px 30px rgba(102, 126, 234, 0.4)',
};

const secondaryBtnStyle: React.CSSProperties = {
  padding: '16px 32px',
  borderRadius: '12px',
  fontSize: '18px',
  fontWeight: 600,
  textDecoration: 'none',
  transition: 'all 0.3s ease',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  background: 'white',
  color: '#667eea',
  border: '2px solid #667eea',
};

// Footer Styles
const footerStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)',
  color: '#e2e8f0',
  padding: '60px 0 0',
  position: 'relative',
};

const footerContainerStyle: React.CSSProperties = {
  maxWidth: '1400px',
  margin: '0 auto',
  padding: '0 24px',
};

const footerMainStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '40px',
  marginBottom: '50px',
};

const footerBrandStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
};

const footerLogoStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '15px',
  marginBottom: '10px',
};

const logoStyle: React.CSSProperties = {
  width: '50px',
  height: '50px',
  background: 'linear-gradient(135deg, #4c6ef5, #3b5bdb)',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const footerTitleStyle: React.CSSProperties = {
  flex: 1,
};

const footerH3Style: React.CSSProperties = {
  fontSize: '22px',
  fontWeight: 700,
  color: 'white',
  marginBottom: '5px',
};

const footerP1Style: React.CSSProperties = {
  color: '#a0aec0',
  fontSize: '14px',
};

const footerDescriptionStyle: React.CSSProperties = {
  color: '#a0aec0',
  fontSize: '15px',
  lineHeight: 1.6,
};

const socialLinksStyle: React.CSSProperties = {
  display: 'flex',
  gap: '15px',
  marginTop: '10px',
};

const socialLinkStyle: React.CSSProperties = {
  width: '40px',
  height: '40px',
  borderRadius: '10px',
  background: 'rgba(255, 255, 255, 0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#e2e8f0',
  textDecoration: 'none',
  transition: 'all 0.3s ease',
};

const footerLinksStyle: React.CSSProperties = {};

const linksTitleStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 700,
  color: 'white',
  marginBottom: '25px',
  position: 'relative',
  paddingBottom: '10px',
};

const linksListStyle: React.CSSProperties = {
  listStyle: 'none',
};

const linkItemStyle: React.CSSProperties = {
  color: '#a0aec0',
  textDecoration: 'none',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  transition: 'all 0.3s ease',
  fontSize: '15px',
  marginBottom: '15px',
};

const footerContactStyle: React.CSSProperties = {};

const contactTitleStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 700,
  color: 'white',
  marginBottom: '25px',
  position: 'relative',
  paddingBottom: '10px',
};

const contactInfoStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '25px',
};

const contactItemStyle: React.CSSProperties = {
  display: 'flex',
  gap: '15px',
  alignItems: 'flex-start',
};

const contactIconStyle: React.CSSProperties = {
  width: '40px',
  height: '40px',
  background: 'rgba(76, 110, 245, 0.1)',
  borderRadius: '10px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const contactDetailsStyle: React.CSSProperties = {
  flex: 1,
};

const contactLabelStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#a0aec0',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  marginBottom: '5px',
};

const contactValueStyle: React.CSSProperties = {
  color: '#e2e8f0',
  fontSize: '15px',
  lineHeight: 1.5,
  textDecoration: 'none',
  display: 'block',
};

const footerNewsletterStyle: React.CSSProperties = {};

const newsletterTitleStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 700,
  color: 'white',
  marginBottom: '25px',
  position: 'relative',
  paddingBottom: '10px',
};

const newsletterDescStyle: React.CSSProperties = {
  color: '#a0aec0',
  fontSize: '14px',
  marginBottom: '25px',
  lineHeight: 1.6,
};

const newsletterFormStyle: React.CSSProperties = {
  marginBottom: '30px',
};

const inputGroupStyle: React.CSSProperties = {
  display: 'flex',
  background: 'rgba(255, 255, 255, 0.1)',
  borderRadius: '10px',
  overflow: 'hidden',
  border: '1px solid rgba(255, 255, 255, 0.1)',
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  background: 'transparent',
  border: 'none',
  padding: '15px 20px',
  color: 'white',
  fontSize: '15px',
  outline: 'none',
};

const subscribeBtnStyle: React.CSSProperties = {
  background: '#4c6ef5',
  border: 'none',
  color: 'white',
  padding: '0 25px',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const trustBadgesStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '15px',
};

const badgeStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 15px',
  background: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '10px',
  borderLeft: '3px solid #20c997',
};

const footerBottomStyle: React.CSSProperties = {
  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  padding: '25px 0',
};

const footerBottomContentStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '20px',
};

const copyrightStyle: React.CSSProperties = {
  color: '#a0aec0',
  fontSize: '14px',
};

const footerBottomLinksStyle: React.CSSProperties = {
  display: 'flex',
  gap: '25px',
};

const bottomLinkStyle: React.CSSProperties = {
  color: '#a0aec0',
  textDecoration: 'none',
  fontSize: '14px',
  transition: 'all 0.3s ease',
};

const paymentMethodsStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '15px',
};

const paymentTextStyle: React.CSSProperties = {
  color: '#a0aec0',
  fontSize: '14px',
};

const paymentIconsStyle: React.CSSProperties = {
  display: 'flex',
  gap: '15px',
};

const paymentIconStyle: React.CSSProperties = {
  color: '#a0aec0',
  fontSize: '22px',
  transition: 'all 0.3s ease',
};

// Add hover effects with inline styles (these would need to be handled differently in React)
// For simplicity, I'm showing the base styles. In a real app, you'd use CSS-in-JS library or CSS classes for hover states.