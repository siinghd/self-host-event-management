export interface SendGridEmailOptions {
  to: string;
  fromName: string;
  fromEmail?: string;
  subject: string;
  text?: string;
  html?: string;
  templateId?: string;
  dynamicTemplateData?: Record<string, unknown>;
}

export interface NodeMailerEmailOptions {
  to: string | string[];
  from?: string;
  subject: string;
  text?: string;
  html?: string;
}
