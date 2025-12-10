import nodemailer from 'nodemailer'

interface SendMailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  cc?: string | string[]
  bcc?: string | string[]
}

interface MailConfig {
  service?: string
  host?: string
  port?: number
  secure?: boolean
  auth: {
    user: string
    pass: string
  }
}

export async function sendMail(options: SendMailOptions) {
  try {
    const config: MailConfig = {
      service: process.env.MAIL_SERVICE || 'gmail',
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT ? parseInt(process.env.MAIL_PORT) : 587,
      secure: process.env.MAIL_SECURE === 'true',
      auth: {
        user: process.env.MAIL_USER!,
        pass: process.env.MAIL_PASS!,
      },
    }

    // إذا كان host موجود، استخدم host بدلاً من service
    if (config.host) {
      delete config.service
    }

    const transporter = nodemailer.createTransport(config)

    const mailOptions = {
      from: `"${process.env.MAIL_FROM_NAME || 'احجزلي'}" <${process.env.MAIL_FROM || process.env.MAIL_USER}>`,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      cc: options.cc,
      bcc: options.bcc,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('Email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error sending email:', error)
    throw new Error('Failed to send email')
  }
}

// دوال مساعدة للقوالب الشائعة
export function createBookingConfirmationEmail(booking: any, user: any) {
  return `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">تأكيد الحجز #${booking.id.slice(0, 8)}</h2>
      <p>مرحباً ${user.name}،</p>
      <p>تم تأكيد حجزك بنجاح!</p>
      
      <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>تفاصيل الحجز:</h3>
        <p><strong>الملعب:</strong> ${booking.field?.name || 'N/A'}</p>
        <p><strong>التاريخ:</strong> ${new Date(booking.date).toLocaleDateString('ar-EG')}</p>
        <p><strong>الوقت:</strong> ${booking.slotLabel}</p>
        <p><strong>المبلغ:</strong> ${booking.amount} جنيه</p>
        <p><strong>الحالة:</strong> ${booking.status === 'CONFIRMED' ? 'مؤكد' : 'قيد الانتظار'}</p>
      </div>
      
      <p>يمكنك عرض جميع حجوزاتك من خلال <a href="${process.env.NEXT_PUBLIC_BASE_URL}/my-bookings">صفحة حجوزاتي</a>.</p>
      
      <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
        مع تحيات فريق احجزلي<br>
        للاستفسارات: ${process.env.SUPPORT_EMAIL || 'info@ahgzly.com'}
      </p>
    </div>
  `
}

export function createPasswordResetEmail(token: string, email: string) {
  const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}&email=${email}`
  
  return `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">إعادة تعيين كلمة المرور</h2>
      <p>لقد طلبت إعادة تعيين كلمة المرور لحسابك.</p>
      <p>انقر على الرابط أدناه لإعادة تعيين كلمة المرور:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" 
           style="background: #4F46E5; color: white; padding: 12px 30px; 
                  text-decoration: none; border-radius: 6px; display: inline-block;">
          إعادة تعيين كلمة المرور
        </a>
      </div>
      
      <p>إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد.</p>
      <p style="color: #9CA3AF; font-size: 12px;">
        رابط الصلاحية: 1 ساعة
      </p>
    </div>
  `
}

export function createWelcomeEmail(userName: string) {
  return `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">أهلاً بك في احجزلي! 🎉</h2>
      <p>مرحباً ${userName}،</p>
      <p>شكراً لتسجيلك في منصة احجزلي. نحن سعداء بانضمامك!</p>
      
      <div style="background: #F0F9FF; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>ابدأ رحلتك معنا:</h3>
        <ul style="padding-right: 20px;">
          <li>تصفح الملاعب المتاحة</li>
          <li>احجز ملاعب كرة القدم أو البادل</li>
          <li>تابع حجوزاتك من لوحة التحكم</li>
          <li>استمتع بعروض خاصة للأعضاء</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/fields" 
           style="background: #4F46E5; color: white; padding: 12px 30px; 
                  text-decoration: none; border-radius: 6px; display: inline-block;">
          ابدأ الحجز الآن
        </a>
      </div>
      
      <p>لأي استفسارات، لا تتردد في التواصل مع فريق الدعم.</p>
      
      <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
        مع تحيات فريق احجزلي<br>
        ${process.env.NEXT_PUBLIC_BASE_URL}
      </p>
    </div>
  `
}
