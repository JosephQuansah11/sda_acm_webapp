import React, { FC, useState } from 'react';
import { sendNewsletter } from '../api/NewsletterApi';
import EmailTemplate, { EmailTemplateProps } from '../components/EmailTemplate';


/**
 * Simplified hook for sending newsletters.
 *
 * Usage:
 *   const { send, loading, error } = useNewsletter();
 *   await send(user.email, <b>Hello World</b>);
 *
 * @param userEmail Email address of the user.
 * @param body JSX body or string that will be rendered inside the template.
 * @param subject Optional subject override.
 */
export function useNewsletter() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);



const send = async (
    userEmail: string,
    body: React.ReactNode | string,
    subject?: string,
): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
        // 1️⃣  Render the template to raw HTML. This step can be done server‑side,
        // but it’s convenient to do it client‑side so you can preview it instantly.
        




        const html = React.createElement(EmailTemplate)
        html.props.subject = subject ?? 'Community Newsletter'
        html.props.previewText = "Catch up on our latest updates"
        html.props.body = body
        html.props.footer = `<a href="https://your‑domain.com/unsubscribe?email={encodeURIComponent(userEmail)}">
        Unsubscribe
      </a>`
    
      // Convert the React element to an HTML string for mail‑clients.
      // Note: In a real project you might use something like `react-dom/server` here,
      // but for a browser‑only stack, you can simply `renderToStaticMarkup`.
      const rendered = renderToString(html); // <-- you'll need react‑dom/server

        await sendNewsletter({
            to: userEmail,
            subject: subject ?? (html.props.subject || 'Newsletter'),
            html: rendered,
        });

        // If you want a fallback plain‑text version, generate it here.
        // For now we let the user decide.
    } catch (e: any) {
        setError(e.message || 'Unknown error');
        throw e;
    } finally {
        setLoading(false);
    }
};

return { send, loading, error };
}



function renderToString(html: any) {
   return html.toString()
}
