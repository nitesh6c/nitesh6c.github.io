export const WCA_ORIGIN = import.meta.env.VITE_WCA_ORIGIN || 'https://api.worldcubeassociation.org';

export const WCA_OAUTH_ORIGIN =
  import.meta.env.VITE_WCA_OAUTH_ORIGIN || 'https://worldcubeassociation.org';

export const WCA_OAUTH_CLIENT_ID = import.meta.env.VITE_WCA_CLIENT_ID || 'example-application-id';

const usingExampleClientId = WCA_OAUTH_CLIENT_ID === 'example-application-id';

if (import.meta.env.DEV && usingExampleClientId) {
  console.warn(
    'WCA OAuth is using the placeholder client ID. Set VITE_WCA_CLIENT_ID in .env.local to sign in.',
  );
}

if (import.meta.env.PROD && usingExampleClientId) {
  console.error(
    'WCA OAuth client ID is not configured. Set VITE_WCA_CLIENT_ID when building for production.',
  );
}
