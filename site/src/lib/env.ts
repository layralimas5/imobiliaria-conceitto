/**
 * Server-side configuration read from the environment.
 *
 * Every value is optional on purpose: the site has to build and run before the
 * client hands over credentials. What changes when a variable is missing is the
 * *behaviour of a channel*, never whether the app boots — and a channel that is
 * configured but failing must surface as an error, not a silent drop.
 */

function read(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value === undefined || value.length === 0 ? undefined : value;
}

export interface EmailChannelConfig {
  readonly apiKey: string;
  /** Verified sender on the Resend account, e.g. "Site Conceitto <site@imobiliariaconceitto.com.br>". */
  readonly from: string;
  /** Fallback inbox, used when no branch-specific address is configured. */
  readonly to: string;
  readonly toFarroupilha: string | undefined;
  readonly toBentoGoncalves: string | undefined;
}

export interface WebhookChannelConfig {
  readonly url: string;
  /** Sent as `authorization` when present, for endpoints that require a token. */
  readonly token: string | undefined;
}

export interface LeadDeliveryConfig {
  readonly email: EmailChannelConfig | null;
  readonly webhook: WebhookChannelConfig | null;
}

/**
 * Read on every request rather than at module load: on Vercel a variable added
 * after the build is picked up by the running instance without a redeploy.
 */
export function leadDeliveryConfig(): LeadDeliveryConfig {
  const apiKey = read('RESEND_API_KEY');
  const to = read('LEAD_INBOX');
  const webhookUrl = read('LEAD_WEBHOOK_URL');

  return {
    email:
      apiKey && to
        ? {
            apiKey,
            from: read('LEAD_FROM') ?? 'Site Conceitto <site@imobiliariaconceitto.com.br>',
            to,
            toFarroupilha: read('LEAD_INBOX_FARROUPILHA'),
            toBentoGoncalves: read('LEAD_INBOX_BENTO_GONCALVES'),
          }
        : null,
    webhook: webhookUrl ? { url: webhookUrl, token: read('LEAD_WEBHOOK_TOKEN') } : null,
  };
}

/** Public origin of the deployment, used to build absolute links inside e-mails. */
export function siteOrigin(): string {
  const explicit = read('NEXT_PUBLIC_SITE_URL');
  if (explicit) return explicit.replace(/\/$/, '');
  const vercel = read('VERCEL_PROJECT_PRODUCTION_URL') ?? read('VERCEL_URL');
  if (vercel) return `https://${vercel}`;
  return 'https://imobiliariaconceitto.com.br';
}
