import { registerAs } from '@nestjs/config';
import { MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

export default registerAs('mailer', (): MailerOptions => {
  return {
    transport: {
      host: process.env.MAILER_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.MAILER_PORT || '587', 10),
      secure: process.env.MAILER_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.MAILER_USER,
        pass: process.env.MAILER_PASSWORD,
      },
    },
    defaults: {
      from: `"Pet Care" <${process.env.MAILER_FROM || process.env.MAILER_USER}>`,
    },
    template: {
      dir: join(__dirname, '..', 'auth', 'templates'),
      adapter: new HandlebarsAdapter(),
      options: {
        strict: true,
      },
    },
  };
});

