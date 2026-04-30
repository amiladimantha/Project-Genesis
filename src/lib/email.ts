import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function sendPaymentAlert(
  email: string,
  subscriptionName: string,
  amount: number,
  currency: string,
  nextPaymentDate: string,
  daysUntilPayment: number,
) {
  if (!resend) {
    return {
      success: false,
      error: 'Resend API key not configured. Please set RESEND_API_KEY in environment variables.',
    }
  }

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)

  const dateObj = new Date(nextPaymentDate)
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  try {
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'FinTrack <onboarding@resend.dev>',
      to: email,
      subject: `Upcoming Payment: ${subscriptionName} (${daysUntilPayment} days away)`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; border-radius: 8px 8px 0 0; text-align: center; }
              .content { background: #f9fafb; padding: 40px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; }
              .payment-info { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #667eea; }
              .payment-detail { display: flex; justify-content: space-between; margin: 10px 0; }
              .label { color: #666; font-weight: 500; }
              .value { font-weight: bold; color: #333; }
              .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 20px 0; font-weight: 600; }
              .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #666; text-align: center; }
              .alert { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0; }
              .alert-text { color: #92400e; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0; font-size: 28px;">💳 Payment Reminder</h1>
                <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">From FinTrack</p>
              </div>
              <div class="content">
                <p>Hi there! 👋</p>
                <p>We wanted to remind you about an upcoming subscription payment.</p>
                
                <div class="payment-info">
                  <div class="payment-detail">
                    <span class="label">Service:</span>
                    <span class="value">${subscriptionName}</span>
                  </div>
                  <div class="payment-detail">
                    <span class="label">Amount:</span>
                    <span class="value">${formattedAmount}</span>
                  </div>
                  <div class="payment-detail">
                    <span class="label">Due Date:</span>
                    <span class="value">${formattedDate}</span>
                  </div>
                  <div class="payment-detail">
                    <span class="label">Days Until Payment:</span>
                    <span class="value" style="color: ${daysUntilPayment <= 1 ? '#ef4444' : daysUntilPayment <= 3 ? '#f59e0b' : '#10b981'};">${daysUntilPayment} ${daysUntilPayment === 1 ? 'day' : 'days'}</span>
                  </div>
                </div>

                ${daysUntilPayment === 1 ? '<div class="alert"><p class="alert-text">⚠️ This payment is due tomorrow! Make sure you have sufficient funds.</p></div>' : ''}

                <p>Log in to FinTrack to manage your subscriptions or check your full spending dashboard.</p>
                
                <center>
                  <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard" class="cta-button">View Dashboard</a>
                </center>

                <div class="footer">
                  <p>You received this email because you have payment alerts enabled in FinTrack.</p>
                  <p>You can manage your notification preferences in your account settings.</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
    })

    if (result.error) {
      console.error('Email send error:', result.error)
      return { success: false, error: result.error }
    }

    return { success: true, data: result.data }
  } catch (error) {
    console.error('Failed to send email:', error)
    return { success: false, error }
  }
}
