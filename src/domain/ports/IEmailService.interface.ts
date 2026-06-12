export interface IEmailSevice {
  sendMail: (data: SendEmail) => Promise<string>;
  mapAccountConfirmationTemplate: (
    data: AccountConfirmationTemplateData,
  ) => string;
  mapPasswordResetTemplate: (data: PasswordResetTemplateData) => string;
}

export type SendEmail = {
  html: string;
  to: string;
  subject: string;
};

export type AccountConfirmationTemplateData = {
  name: string;
  confirmationUrl: string;
  appName?: string;
};

export type PasswordResetTemplateData = {
  name: string;
  code: string;
  appName?: string;
};
