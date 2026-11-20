const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// ENVIAR CÓDIGO DE RECUPERACIÓN
exports.enviarCorreo = async (correo, codigo) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: correo,
    subject: "Código de recuperación - AgendaTech",

    html: `
      <div style="
        font-family: Arial, sans-serif;
        background-color: #F7F5FC;
        padding: 35px 20px;
      ">
        <div style="
          max-width: 480px;
          margin: auto;
          background-color: #FFFFFF;
          border-radius: 20px;
          padding: 35px 30px;
          text-align: center;
        ">

          <h2 style="
            color: #292832;
            margin-bottom: 12px;
          ">
            Recuperar contraseña
          </h2>

          <p style="
            color: #666575;
            font-size: 14px;
            line-height: 22px;
          ">
            Recibimos una solicitud para recuperar tu contraseña
            de AgendaTech.
          </p>

          <p style="
            color: #666575;
            font-size: 14px;
            margin-top: 25px;
          ">
            Introduce el siguiente código en la aplicación:
          </p>

          <div style="
            background-color: #F0ECFC;
            border-radius: 14px;
            padding: 20px;
            margin: 25px 0;
          ">
            <span style="
              color: #6038E8;
              font-size: 36px;
              font-weight: bold;
              letter-spacing: 10px;
            ">
              ${codigo}
            </span>
          </div>

          <p style="
            color: #666575;
            font-size: 13px;
          ">
            Este código tiene una validez de 10 minutos.
          </p>

          <p style="
            color: #999999;
            font-size: 12px;
            margin-top: 30px;
            line-height: 20px;
          ">
            Si no solicitaste recuperar tu contraseña,
            puedes ignorar este correo.
          </p>

          <hr style="
            border: none;
            border-top: 1px solid #EEEEEE;
            margin: 25px 0;
          " />

          <p style="
            color: #6038E8;
            font-size: 13px;
            font-weight: bold;
          ">
            AgendaTech
          </p>

          <p style="
            color: #AAAAAA;
            font-size: 11px;
          ">
            Aprende. Organiza. Planea.
          </p>

        </div>
      </div>
    `,
  });
};
