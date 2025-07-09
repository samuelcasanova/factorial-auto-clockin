import * as OTPAuth from 'otpauth'

export async function getOTP (): Promise<string> {
  const totp = new OTPAuth.TOTP({
    issuer: 'ACME',
    label: 'AzureDiamond',
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    // Replace with your security key copied from step 12
    secret: process.env.GOOGLE_OTP_SECRET ?? '' // 2FA Secret Key
  })

  const token = totp.generate()
  return token
}
