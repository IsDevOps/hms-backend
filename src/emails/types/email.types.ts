export type SendGridData = {
  to: string[];
  subject: string;
  template: string;
};

export type EmailMessageBody = {
    recipients: string[]
    subject: string
    template: string
};
