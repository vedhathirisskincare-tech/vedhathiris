'use server'

import { createClient } from '@/utils/supabase/server'

export async function submitEnquiry(formData: FormData) {
  const name = formData.get('name')?.toString() || ''
  const email = formData.get('email')?.toString() || ''
  const phone = formData.get('phone')?.toString() || ''
  const message = formData.get('message')?.toString() || ''

  if (!name || !email || !message) {
    return { success: false, error: 'Name, email, and message are required.' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('enquiries')
    .insert([{ name, email, phone, message }])

  if (error) {
    console.error('Submit enquiry error:', error.message)
    return { success: false, error: error.message }
  }

  // Send email via Resend API using fetch
  const resendApiKey = process.env.RESEND
  if (resendApiKey) {
    try {
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`
        },
        body: JSON.stringify({
          from: "Vedhathiri's Skin Care <onboarding@resend.dev>",
          to: "vedhathirisskincare@gmail.com",
          reply_to: email.trim(),
          subject: `New Contact Enquiry from ${name}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #c2a4fc; border-radius: 12px; background-color: #ffffff;">
              <h2 style="color: #3c094c; border-bottom: 2px solid #e0dafa; padding-bottom: 10px; font-family: Georgia, serif; margin-top: 0;">New Contact Enquiry Received</h2>
              <p style="color: #333333; font-size: 15px; line-height: 1.6;">You have received a new contact enquiry from the website form.</p>
              
              <div style="margin: 20px 0; padding: 15px; background-color: #fbf9ff; border-left: 4px solid #3c094c; border-radius: 8px;">
                <h4 style="margin-top: 0; color: #3c094c; font-family: Georgia, serif; font-size: 16px;">Enquiry Details:</h4>
                <p style="margin: 6px 0; font-size: 14px; color: #333333;"><strong>Name:</strong> ${name}</p>
                <p style="margin: 6px 0; font-size: 14px; color: #333333;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #7c3aed; text-decoration: none;">${email}</a></p>
                <p style="margin: 6px 0; font-size: 14px; color: #333333;"><strong>Phone:</strong> ${phone || 'N/A'}</p>
                <p style="margin: 15px 0 6px 0; font-weight: bold; font-size: 14px; color: #3c094c;">Customer Message:</p>
                <p style="white-space: pre-wrap; margin: 0; line-height: 1.5; font-size: 14px; color: #555555; background: #ffffff; padding: 10px; border-radius: 6px; border: 1px solid #e0dafa;">${message}</p>
              </div>
              
              <p style="font-size: 13px; color: #777777; margin-top: 30px; border-top: 1px solid #eeeeee; padding-top: 15px; text-align: center;">
                You can reply directly to this email to contact <strong>${name}</strong> at <strong>${email}</strong>.
              </p>
            </div>
          `
        })
      })

      if (!emailResponse.ok) {
        const errText = await emailResponse.text()
        console.error('Resend API call failed:', errText)
      }
    } catch (emailError: any) {
      console.error('Error sending enquiry email via Resend:', emailError.message)
    }
  }

  return { success: true }
}
