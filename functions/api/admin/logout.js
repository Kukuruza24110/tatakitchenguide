import {json,sameOrigin} from '../_shared.js';
export async function onRequestPost({request}){if(!sameOrigin(request))return json({error:'Недопустимый источник'},403);const response=json({ok:true});response.headers.set('Set-Cookie','tata_admin=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0');return response;}
