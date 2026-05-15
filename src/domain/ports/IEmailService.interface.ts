export interface IEmailSevice {
  sendMail: (data: SendEmail) => Promise<string>;
  mapAccountConfirmationTemplate: (
    data: AccountConfirmationTemplateData,
  ) => string;
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
