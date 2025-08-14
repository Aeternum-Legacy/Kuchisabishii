import nodemailer from 'nodemailer'
import { EmailTemplate } from './templates'

export interface EmailConfig {
  from: string
  host: string
  port: number
  user: string
  password: string
}

class EmailService {
  private transporter: nodemailer.Transporter
  private config: EmailConfig

  constructor() {
    this.config = {
      from: process.env.EMAIL_FROM || 'people@kuchisabishii.io',
      host: process.env.SMTP_HOST || 'smtp.mail.me.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      user: process.env.SMTP_USER || 'people@kuchisabishii.io',
      password: process.env.SMTP_PASSWORD || 'meha-dyvx-rvuk-hrys'
    }

    this.transporter = nodemailer.createTransport({
      host: this.config.host,
      port: this.config.port,
      secure: false, // Use TLS
      auth: {
        user: this.config.user,
        pass: this.config.password
      },
      tls: {
        rejectUnauthorized: false
      }
    })
  }

  async sendEmail(to: string, template: EmailTemplate): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"Kuchisabishii Team" <${this.config.from}>`,
        to,
        subject: template.subject,
        text: template.text,
        html: template.html
      }

      const info = await this.transporter.sendMail(mailOptions)
      console.log('Email sent successfully:', info.messageId)
      return true
    } catch (error) {
      console.error('Failed to send email:', error)
      return false
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify()
      console.log('SMTP connection verified successfully')
      return true
    } catch (error) {
      console.error('SMTP connection failed:', error)
      return false
    }
  }
}

export const emailService = new EmailService()