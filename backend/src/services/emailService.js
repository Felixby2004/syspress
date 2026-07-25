import { google } from 'googleapis';
import dotenv from 'dotenv';
dotenv.config();

// Configurar OAuth2
const OAuth2 = google.auth.OAuth2;
const oauth2Client = new OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  'https://developers.google.com/oauthplayground'
);
oauth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN,
});

// ===== ENVÍO DE CORREO USANDO LA API DE GMAIL =====
const sendEmailViaGmailAPI = async (toEmail, subject, htmlContent) => {
  try {
    // Obtener Access Token
    const accessToken = await oauth2Client.getAccessToken();

    // Crear mensaje en formato Base64 URL-safe
    const emailLines = [
      `To: ${toEmail}`,
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: ${subject}`,
      '',
      htmlContent,
    ];
    const emailString = emailLines.join('\n');
    const base64Encoded = Buffer.from(emailString)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    // Enviar usando la API de Gmail
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: base64Encoded,
      },
    });

    console.log('✅ Correo enviado vía API Gmail:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Error al enviar correo:', error);
    return false;
  }
};

// ===== ENVÍO DE CÓDIGO DE VERIFICACIÓN (REGISTRO) =====
export const sendVerificationEmail = async (toEmail, code) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; padding: 20px;">
      <h2 style="color: #1F3A93; text-align: center;">Verifica tu correo</h2>
      <p style="font-size: 16px; color: #333;">¡Hola!</p>
      <p style="font-size: 14px; color: #666;">Usa el siguiente código para completar tu verificación:</p>
      <div style="background-color: #f0f0f0; border-left: 4px solid #FFD700; padding: 20px; margin: 20px 0; text-align: center;">
        <p style="font-size: 32px; font-weight: bold; color: #1F3A93; letter-spacing: 5px; margin: 0;">${code}</p>
      </div>
      <p style="font-size: 12px; color: #999; text-align: center;">Este código expirará en 10 minutos.</p>
      <p style="font-size: 12px; color: #999; text-align: center;">Saludos,<br/>El equipo de SysPress</p>
    </div>
  `;

  return await sendEmailViaGmailAPI(toEmail, '🔐 Código de verificación - SysPress', html);
};

// ===== ENVÍO DE CÓDIGO PARA RECUPERACIÓN =====
export const sendResetPasswordEmail = async (toEmail, code) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; padding: 20px;">
      <h2 style="color: #1F3A93; text-align: center;">Recuperación de contraseña</h2>
      <p style="font-size: 16px; color: #333;">Hola,</p>
      <p style="font-size: 14px; color: #666;">Usa el siguiente código para restablecer tu contraseña:</p>
      <div style="background-color: #f0f0f0; border-left: 4px solid #FFD700; padding: 20px; margin: 20px 0; text-align: center;">
        <p style="font-size: 32px; font-weight: bold; color: #1F3A93; letter-spacing: 5px; margin: 0;">${code}</p>
      </div>
      <p style="font-size: 12px; color: #999; text-align: center;">Este código expirará en 10 minutos.</p>
    </div>
  `;

  return await sendEmailViaGmailAPI(toEmail, '🔐 Recuperación de contraseña - SysPress', html);
};