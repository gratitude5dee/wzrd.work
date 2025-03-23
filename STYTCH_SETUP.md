# Stytch Authentication Setup Guide

This guide explains how to set up Stytch authentication for your WZRD application.

## Domain Registration

Stytch requires that you register all domains where the SDK will be used. This is a security measure to prevent unauthorized use of your Stytch project.

### Registering Your Domains

1. Go to the [Stytch Dashboard SDK Configuration](https://stytch.com/dashboard/sdk-configuration)
2. Log in to your Stytch account
3. Navigate to the "Authorized domains" section
4. Click "Add domain"
5. Add your domains:
   - Your production domain
   - Development domains (e.g., `http://localhost:5173`, `http://localhost:8573`)
6. Click "Save changes"

Example domains to register:
```
https://yourproductiondomain.com
http://localhost:5173
http://localhost:8573
```

## Authentication Error Messages

If you see the error message "This website has not been registered as an allowed domain for the Stytch SDK", you need to follow the domain registration steps above.

## Troubleshooting

If you're experiencing authentication issues:

1. **Check Domain Registration**: Ensure your current domain is registered in Stytch's dashboard.
2. **Check Console Errors**: Look for specific error messages in the browser console.
3. **Check Network Tab**: Look for failed requests to Stytch's API in the Network tab of DevTools.
4. **Verify Public Token**: Make sure you're using the correct public token.
5. **Check CORS Settings**: Ensure Stytch's CORS settings are correctly configured.

## Current Project Configuration

The WZRD app uses Stytch for email magic link authentication. The authentication flow is:

1. User enters email on the login page
2. Stytch sends a magic link to the email
3. User clicks the magic link in their email
4. User is redirected to the app and automatically authenticated
5. User is redirected to the dashboard

## Integration Notes

- The application uses a custom Stytch context in `src/contexts/StytchContext.tsx`
- Authentication UI components are in `src/components/StytchLoginForm.tsx`
- Authentication page is in `src/pages/Auth.tsx`
- Protected routes use the `ProtectedRoute` component in `src/App.tsx` 