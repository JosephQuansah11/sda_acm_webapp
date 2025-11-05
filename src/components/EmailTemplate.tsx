import React from 'react';
import { CardTitle, Container, Toast, ToastBody, ToastHeader } from 'react-bootstrap';

export interface EmailTemplateProps {
    /** Subject of the newsletter */
    subject: string;
    /** Short preview text, e.g. for inbox preview */
    previewText?: string;
    /** Main body – you can use plain text or JSX for richer formatting */
    body: React.ReactNode;
    /** Optional footer (e.g. unsubscribe link) */
    footer?: React.ReactNode;
}

export default function EmailTemplate ({
    subject,
    previewText,
    body,
    footer,
}: EmailTemplateProps) {
    return (
        <Container>
        <Toast>
          <ToastHeader>
            <CardTitle>{subject}</CardTitle>
          </ToastHeader>
          <ToastBody>
            {previewText && <div dangerouslySetInnerHTML={{ __html: previewText }} />}
            <div className="content">{body}</div>
            {footer && <div className="footer">{footer}</div>}
          </ToastBody>
        </Toast>
        <style>
          {`
            body {
              font-family: Arial, Helvetica, sans-serif;
              background: #f4f4f4;
              color: #333;
              padding: 0;
              margin: 0;
            }
            .wrapper {
              max-width: 600px;
              background: #fff;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 20px;
            }
            .content {
              margin-bottom: 20px;
            }
            .footer {
              font-size: 12px;
              color: #777;
              margin-top: 20px;
            }
          `}
        </style>
      </Container>
    );
};
