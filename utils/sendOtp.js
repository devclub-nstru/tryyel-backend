let client = null;

if (
  process.env.TWILIO_SID &&
  process.env.TWILIO_AUTH &&
  process.env.TWILIO_PHONE
) {
  client = require("twilio")(process.env.TWILIO_SID, process.env.TWILIO_AUTH);
}

async function sendOtp(mobile, otp) {
  if (client) {
    await client.messages.create({
      body: `Your Tryyel OTP is ${otp}`,
      to: mobile,
      from: process.env.TWILIO_PHONE,
    });
  } else {
    console.log(`👀 DEV OTP for ${mobile}: ${otp}`);
  }
}

module.exports = sendOtp;
