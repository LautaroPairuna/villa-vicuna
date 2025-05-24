// middleware.ts
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Create the middleware with more configuration options
export default createMiddleware({
  // A list of all locales that are supported
  locales: routing.locales,
  
  // The default locale to use when a non-locale path is visited
  defaultLocale: routing.defaultLocale,
  
  // Optional: Specify domains for different locales
  // domains: [
  //   {
  //     domain: 'example.com',
  //     defaultLocale: 'en'
  //   },
  //   {
  //     domain: 'example.es',
  //     defaultLocale: 'es'
  //   }
  // ],
  
  // Optional: Redirect to locale-prefixed paths by default
  localePrefix: 'always', // 'as-needed' would only add the locale prefix when it's not the default locale
  
  // Optional: Prevent specific paths from being internationalized
  // pathnames: {
  //   '/api': { 
  //     locale: false  // Disable locale for /api routes
  //   },
  //   '/dashboard': {
  //     locale: 'always'  // Always add locale prefix for dashboard routes
  //   }
  // }
});

// Configure the matcher for the middleware
export const config = {
  // Match all pathnames except for:
  // - API routes, static files, images, etc.
  matcher: ['/((?!api|_next|.*\\..*).*)']
};