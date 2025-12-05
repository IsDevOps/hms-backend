import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sgMail, { MailDataRequired } from '@sendgrid/mail';
import { SendGridData } from './types/email.types';
import * as SendGrid from '@sendgrid/mail';

@Injectable()
export class SendGridService {
  private readonly logger = new Logger(SendGridService.name);
  private readonly senderEmail: string;

  constructor(private readonly configService: ConfigService) {
 
    const sendGridApiKey = this.configService.get<string>('SENDGRID_API_KEY');
    if (!sendGridApiKey) {
      throw new InternalServerErrorException(
        'SENDGRID_API_KEY is not set in environment variables',
      );
    }
    sgMail.setApiKey(sendGridApiKey);


    const senderEmail = this.configService.get<string>('SENDGRID_SENDER_EMAIL');

    if (!senderEmail) {
      throw new InternalServerErrorException(
        'SENDGRID_SENDER_EMAIL is not set in environment variables',
      );
    }
    this.senderEmail = senderEmail;
  }

  async sendEmail({
    to,
    subject,
    template,
  }: SendGridData): Promise<void> {
    try {
      const msg: MailDataRequired = {
        to,
        from: this.senderEmail,
        subject,
        html: template,
      };

      const response = await sgMail.send(msg);
      this.logger.log(`Email sent to ${to}. with response: ${response}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}. error: ${error.message}`);
    }
  }
}
