// e.g. src/pages/NewsletterPreview.tsx
import React from 'react';
import Emailtemplate from '../../components/EmailTemplate'

const NewsletterPreview: React.FC = () => (
  <Emailtemplate
    subject="Monthly Update"
    previewText="<p>Quick teaser for your inbox.</p>"
    body={
      <>
        <p>Hello {`<strong>User</strong>`},</p>
        <p>📢 Here’s what’s new this month…</p>
        <ul>
          <li>Feature A launched</li>
          <li>Event B invites</li>
          <li>Volunteer spotlights</li>
        </ul>
      </>
    }
  />
);

export default NewsletterPreview;