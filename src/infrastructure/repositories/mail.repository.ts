import {
  AccountConfirmationTemplateData,
  IEmailSevice,
  PasswordResetTemplateData,
  SendEmail,
} from '@domain/ports/IEmailService.interface';
import { Injectable } from '@nestjs/common';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createTransport, type Transporter } from 'nodemailer';

@Injectable()
export class MailRepository implements IEmailSevice {
  private transporter: Transporter;
  private readonly accountConfirmationTemplate: string;
  private readonly passwordResetTemplate: string;

  private resolveTemplatePath(fileName: string): string {
    const candidates = [
      join(__dirname, '../templates/email', fileName),
      join(process.cwd(), 'dist/src/infrastructure/templates/email', fileName),
      join(process.cwd(), 'dist/infrastructure/templates/email', fileName),
      join(process.cwd(), 'src/infrastructure/templates/email', fileName),
    ];

    const templatePath = candidates.find((path) => existsSync(path));

    if (!templatePath) {
      throw new Error(
        `Email template not found. Checked: ${candidates.join(', ')}`,
      );
    }

    return templatePath;
  }

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    this.transporter = createTransport({
      host: process.env.SMTP_HOST || 'smtp.example.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: (process.env.SMTP_SECURE || 'false') === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    this.accountConfirmationTemplate = readFileSync(
      this.resolveTemplatePath('account-confirmation.html'),
      'utf8',
    );

    this.passwordResetTemplate = readFileSync(
      this.resolveTemplatePath('password-reset.html'),
      'utf8',
    );
  }

  async sendMail(data: SendEmail): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const result = await this.transporter.sendMail({
      from: process.env.SMTP_USER,
      to: data.to,
      subject: data.subject,
      html: data.html,
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return result.messageId;
  }

  mapAccountConfirmationTemplate(
    data: AccountConfirmationTemplateData,
  ): string {
    const appName = data.appName || 'JobHub';

    return this.accountConfirmationTemplate
      .replaceAll('{{APP_NAME}}', appName)
      .replaceAll('{{USER_NAME}}', data.name)
      .replaceAll('{{CONFIRMATION_URL}}', data.confirmationUrl);
  }

  mapPasswordResetTemplate(data: PasswordResetTemplateData): string {
    const appName = data.appName || 'JobHub';

    return this.passwordResetTemplate
      .replaceAll('{{APP_NAME}}', appName)
      .replaceAll('{{USER_NAME}}', data.name)
      .replaceAll('{{RESET_CODE}}', data.code);
  }
}
