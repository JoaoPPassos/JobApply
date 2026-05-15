import { IEmailSevice, SendEmail } from '@domain/ports/IEmailService.interface';

export class SendMailUseCase {
  constructor(private emailService: IEmailSevice) {}

  execute(data: SendEmail) {
    return this.emailService.sendMail(data);
  }
}
