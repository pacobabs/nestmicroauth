import { MailerOptionsFactory, MailerOptions } from '@nest-modules/mailer';
import * as nodemailer from 'nodemailer';

export class MailerConfigService implements MailerOptionsFactory {
  createMailerOptions(): MailerOptions {
    const { transporter: transport } = nodemailer.createTransport({
      host: process.env.MAILER_DSN,
      port: Number(process.env.MAILER_PORT),
      auth: {
        user: process.env.MAILER_USER,
        pass: process.env.MAILER_PASSWORD,
      },
    });
    return {
      transport,
      defaults: {
        from: process.env.MAILER_FROM,
      },
    };
  }
}
