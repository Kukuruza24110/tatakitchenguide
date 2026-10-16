import {json} from './_shared.js';
export async function onRequestGet({env}){if(!env.SITE_KV)return json({catalog:null});const catalog=await env.SITE_KV.get('catalog','json');return json({catalog:catalog||null});}
