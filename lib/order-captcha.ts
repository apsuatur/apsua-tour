type CaptchaEnv={YANDEX_SMARTCAPTCHA_SITE_KEY?:string;YANDEX_SMARTCAPTCHA_SERVER_KEY?:string};

export const orderCaptchaEnabled=(env:CaptchaEnv)=>!!(env.YANDEX_SMARTCAPTCHA_SITE_KEY&&env.YANDEX_SMARTCAPTCHA_SERVER_KEY);

export function orderCaptchaChallenge(env:CaptchaEnv){
 return {error:'Подтвердите отправку заявки',code:'CAPTCHA_REQUIRED',captcha:{provider:'yandex',siteKey:env.YANDEX_SMARTCAPTCHA_SITE_KEY}};
}

export async function verifyOrderCaptcha(request:Request,env:CaptchaEnv,ip:string){
 if(!orderCaptchaEnabled(env))return false;
 const token=(request.headers.get('x-apsua-captcha-token')||'').trim();
 if(token.length<20||token.length>10000)return false;
 const form=new URLSearchParams({secret:env.YANDEX_SMARTCAPTCHA_SERVER_KEY!,token});
 if(ip&&ip!=='unknown')form.set('ip',ip);
 try{
  const response=await fetch('https://smartcaptcha.cloud.yandex.ru/validate',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:form,signal:AbortSignal.timeout(3000)});
  // Yandex recommends treating transport/HTTP failures as a pass so their outage cannot stop bookings.
  if(!response.ok)return true;
  const result=await response.json<any>();
  return result?.status==='ok';
 }catch{return true}
}
