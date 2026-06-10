// Centralized branding for all transactional emails.
//
// Always load the logo from the production domain. Preview/branch deploy URLs
// (e.g. *.vercel.app) are typically login-protected, so the image fails to
// load in email clients and recipients see a broken image / no logo.
export const EMAIL_LOGO_URL =
  "https://www.gimmegolfsimulators.com/logos/logo-trimmed.png";
