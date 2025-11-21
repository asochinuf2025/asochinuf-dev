import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Configurar transporte de email
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const enviarCorreoRecuperacion = async (email, nombre, token) => {
  const enlaceRecuperacion = `${process.env.FRONTEND_URL}/restablecer-contrasena?token=${token}`;
  const logoUrl = 'https://res.cloudinary.com/dc8qanjnd/image/upload/v1763733056/logo-letras_q5rp7d.png';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; }
          .header { background: linear-gradient(135deg, #8c5cff 0%, #6a3dcf 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
          .logo { max-width: 200px; height: auto; margin-bottom: 20px; }
          .content { background: white; padding: 30px; }
          .button { display: inline-block; background: linear-gradient(135deg, #8c5cff 0%, #6a3dcf 100%); color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; margin: 20px 0; }
          .footer { background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${logoUrl}" alt="ASOCHINUF" class="logo" />
            <h1>Recuperar Contraseña</h1>
            <p>ASOCHINUF - Sistema de Nutrición</p>
          </div>
          <div class="content">
            <p>Hola <strong>${nombre}</strong>,</p>
            <p>Recibimos una solicitud para recuperar tu contraseña. Si no fuiste tú, ignora este correo.</p>
            <p>Para recuperar tu contraseña, haz clic en el botón de abajo:</p>
            <center>
              <a href="${enlaceRecuperacion}" class="button">Recuperar Contraseña</a>
            </center>
            <p>O copia y pega este enlace en tu navegador:</p>
            <p><small>${enlaceRecuperacion}</small></p>
            <p><strong>Este enlace expira en 1 hora.</strong></p>
            <p>Si tienes problemas, contacta con nosotros en soporte@asochinuf.com</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 ASOCHINUF. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Recupera tu contraseña - ASOCHINUF',
      html: htmlContent,
    });
    return true;
  } catch (error) {
    console.error('Error enviando email de recuperación:', error);
    return false;
  }
};

export const enviarBienvenida = async (email, nombre) => {
  const logoUrl = 'https://res.cloudinary.com/dc8qanjnd/image/upload/v1763733056/logo-letras_q5rp7d.png';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; }
          .header { background: linear-gradient(135deg, #8c5cff 0%, #6a3dcf 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
          .logo { max-width: 200px; height: auto; margin-bottom: 20px; }
          .content { background: white; padding: 30px; }
          .button { display: inline-block; background: linear-gradient(135deg, #8c5cff 0%, #6a3dcf 100%); color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; margin: 20px 0; }
          .footer { background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${logoUrl}" alt="ASOCHINUF" class="logo" />
            <h1>¡Bienvenido a ASOCHINUF!</h1>
            <p>Sistema de Nutrición y Seguimiento</p>
          </div>
          <div class="content">
            <p>Hola <strong>${nombre}</strong>,</p>
            <p>Nos alegra mucho que te hayas registrado en ASOCHINUF. Tu cuenta ha sido creada exitosamente.</p>
            <p>Ahora puedes:</p>
            <ul>
              <li>Acceder a los cursos de nutrición disponibles</li>
              <li>Ver tus datos antropológicos</li>
              <li>Comunicarte con tu nutricionista</li>
              <li>Subir y seguimiento de medidas</li>
            </ul>
            <center>
              <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Ir a Mi Dashboard</a>
            </center>
            <p>Si tienes preguntas, no dudes en contactarnos en soporte@asochinuf.com</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 ASOCHINUF. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: '¡Bienvenido a ASOCHINUF!',
      html: htmlContent,
    });
    return true;
  } catch (error) {
    console.error('Error enviando email de bienvenida:', error);
    return false;
  }
};

export const enviarVerificacionEmail = async (email, nombre, token) => {
  const enlaceVerificacion = `${process.env.FRONTEND_URL}/verificar-email?token=${token}`;
  const logoUrl = 'https://res.cloudinary.com/dc8qanjnd/image/upload/v1763733056/logo-letras_q5rp7d.png';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; }
          .header { background: linear-gradient(135deg, #8c5cff 0%, #6a3dcf 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
          .logo { max-width: 200px; height: auto; margin-bottom: 20px; }
          .content { background: white; padding: 30px; }
          .button { display: inline-block; background: linear-gradient(135deg, #8c5cff 0%, #6a3dcf 100%); color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; margin: 20px 0; }
          .footer { background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${logoUrl}" alt="ASOCHINUF" class="logo" />
            <h1>Verifica tu Email</h1>
            <p>ASOCHINUF - Sistema de Nutrición</p>
          </div>
          <div class="content">
            <p>Hola <strong>${nombre}</strong>,</p>
            <p>Gracias por registrarte en ASOCHINUF. Para completar tu registro, necesitamos que verifiques que este es tu email.</p>
            <p>Haz clic en el botón de abajo para verificar tu dirección de correo:</p>
            <center>
              <a href="${enlaceVerificacion}" class="button">Verificar Mi Email</a>
            </center>
            <p>O copia y pega este enlace en tu navegador:</p>
            <p><small>${enlaceVerificacion}</small></p>
            <p><strong>Este enlace expira en 24 horas.</strong></p>
            <p>Si no creaste esta cuenta, ignora este correo.</p>
            <p>Si tienes problemas, contacta con nosotros en soporte@asochinuf.com</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 ASOCHINUF. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Verifica tu Email - ASOCHINUF',
      html: htmlContent,
    });
    return true;
  } catch (error) {
    console.error('Error enviando email de verificación:', error);
    return false;
  }
};
