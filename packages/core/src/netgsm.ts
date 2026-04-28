import axios from 'axios';

export async function sendSms(to: string, message: string) {
  const usercode = process.env.NETGSM_USERCODE;
  const password = process.env.NETGSM_PASSWORD;
  const msgheader = process.env.NETGSM_HEADER;

  if (!usercode || !password || !msgheader) {
    console.warn('NetGSM credentials are missing.');
    return { success: false, error: 'Missing credentials' };
  }

  try {
    const response = await axios.get('https://api.netgsm.com.tr/sms/send/get', {
      params: {
        usercode,
        password,
        gsmno: to,
        message,
        msgheader,
        dil: 'TR'
      }
    });

    const result = response.data.toString();
    if (result.startsWith('00')) {
      return { success: true, data: result };
    } else {
      return { success: false, error: result };
    }
  } catch (error: any) {
    console.error('NetGSM Error:', error.message);
    return { success: false, error: error.message };
  }
}
