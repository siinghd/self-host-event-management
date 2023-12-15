/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable class-methods-use-this */
import sgMail from '@sendgrid/mail';
import nodemailer from 'nodemailer';
import { SendGridEmailOptions, NodeMailerEmailOptions } from './emailOptions';

export class EmailService {
  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);
  }

  async sendEmailViaSendGrid(options: SendGridEmailOptions): Promise<boolean> {
    const msg: any = {
      to: options.to,
      from: {
        email: options.fromEmail || (process.env.SENDGRID_FROM_EMAIL as string),
        name: options.fromName,
      },
      subject: options.subject,
      text: options.text,
      html: options.html,
      templateId: options.templateId,
      dynamicTemplateData: options.dynamicTemplateData,
    };

    try {
      await sgMail.send(msg);
      // console.log('Email sent via SendGrid:', response[0].statusCode);
      return true; // Email was sent successfully
    } catch (error) {
      // console.error('Error sending email via SendGrid:', error);
      return false; // Email was not sent
    }
  }

  async sendEmailViaNodeMailer(
    options: NodeMailerEmailOptions
  ): Promise<boolean> {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const message = {
      from: options.from || (process.env.SEND_FROM_EMAIL as string),
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    try {
      await transporter.sendMail(message);
      // console.log('Email sent via NodeMailer:', info.response);
      return true; // Email was sent successfully
    } catch (error) {
      // console.error('Error sending email via NodeMailer:', error);
      return false; // Email was not sent
    }
  }
}
