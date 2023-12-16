import sgMail from '@sendgrid/mail';
import * as nodemailer from 'nodemailer';
import { SendGridEmailOptions, NodeMailerEmailOptions } from './emailOptions';
import { customLogger } from '../../utils/methods';

interface SendGridMessage {
  to: string;
  from: {
    email: string;
    name?: string;
  };
  subject: string;
  text: string;
  html: string;
  templateId?: string;
  dynamicTemplateData?: Record<string, unknown>;
}
export class EmailService {
  constructor() {
    const apiKey = process.env.SENDGRID_API_KEY || 'n';
    if (!apiKey) {
      throw new Error('SENDGRID_API_KEY is not set');
    }
    sgMail.setApiKey(apiKey);
  }

  async sendEmailViaSendGrid(options: SendGridEmailOptions): Promise<boolean> {
    const msg: SendGridMessage = {
      to: options.to,
      from: {
        email:
          options.fromEmail ||
          process.env.SENDGRID_FROM_EMAIL ||
          'default@example.com',
        name: options.fromName,
      },
      subject: options.subject,
      text: options.text || '',
      html: options.html || '',
      templateId: options.templateId,
      dynamicTemplateData: options.dynamicTemplateData,
    };

    try {
      await sgMail.send(msg);
      return true;
    } catch (error) {
      customLogger('error', 'Error sending email via SendGrid:', error);
      return false;
    }
  }

  async sendEmailViaNodeMailer(
    options: NodeMailerEmailOptions
  ): Promise<boolean> {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.example.com',
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER || 'user@example.com',
        pass: process.env.SMTP_PASS || 'password',
      },
    });

    const message = {
      from:
        options.from || process.env.SEND_FROM_EMAIL || 'default@example.com',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    try {
      await transporter.sendMail(message);
      return true;
    } catch (error) {
      customLogger('error', 'Error sending email via NodeMailer:', error);
      return false;
    }
  }
}
