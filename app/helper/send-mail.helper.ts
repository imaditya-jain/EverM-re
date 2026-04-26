import transporter from "../config/nodemailer.config";

const sendMailHelper = async (type: string, data: any) => {
  const { email, name } = data;

  let body: string = "";
  let subject: string = "";

  switch (type) {
    case "VERIFY_USER": {
      const { verificationLink } = data;

      body = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Email Verification</title>
</head>
<body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f4f4f4;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4; padding:20px 0;">
    <tr>
      <td align="center">

        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:10px; padding:30px;">
          
          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom:20px;">
              <h2 style="margin:0; color:#333;">Verify Your Email</h2>
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td style="color:#555; font-size:16px; line-height:1.5;">
              <p>Hi ${name},</p>
              <p>Thanks for signing up! Please confirm your email address by clicking the button below.</p>
            </td>
          </tr>

          <!-- Button -->
          <tr>
            <td align="center" style="padding:30px 0;">
              <a 
                href="${verificationLink}" 
                style="
                  background-color:#4CAF50;
                  color:#ffffff;
                  padding:14px 28px;
                  text-decoration:none;
                  border-radius:6px;
                  font-size:16px;
                  display:inline-block;
                "
              >
                Verify Email
              </a>
            </td>
          </tr>

          <!-- Fallback -->
          <tr>
            <td style="color:#555; font-size:14px; line-height:1.5;">
              <p>If the button above doesn’t work, copy and paste this link into your browser:</p>
              <p style="word-break:break-all; color:#4CAF50;">
                ${verificationLink}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:30px; color:#999; font-size:12px; text-align:center;">
              <p>If you did not create an account, you can safely ignore this email.</p>
              <p>© ${new Date().getFullYear()} Your Company. All rights reserved.</p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;

      subject = "You're Almost In! Verify Your Email";
      break;
    }

    default:
      throw new Error("Invalid mail type");
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject,
    html: body,
  });
};

export default sendMailHelper;