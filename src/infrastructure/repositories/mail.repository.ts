import {
  AccountConfirmationTemplateData,
  IEmailTemplateService,
  PasswordResetTemplateData,
} from '@domain/ports/IEmailService.interface';
import { Injectable } from '@nestjs/common';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

@Injectable()
export class MailRepository implements IEmailTemplateService {
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
    this.accountConfirmationTemplate = readFileSync(
      this.resolveTemplatePath('account-confirmation.html'),
      'utf8',
    );

    this.passwordResetTemplate = readFileSync(
      this.resolveTemplatePath('password-reset.html'),
      'utf8',
    );
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
