import {json,allowed,sameOrigin} from '../_shared.js';

function toBase64(bytes){
  let binary='';
  const chunkSize=8192;
  for(let i=0;i<bytes.length;i+=chunkSize){
    binary+=String.fromCharCode(...bytes.subarray(i,i+chunkSize));
  }
  return btoa(binary);
}

export async function onRequestPost({request,env}){
  if(!sameOrigin(request)||!await allowed(request,env))return json({error:'Нет доступа'},403);
  if(!env.SITE_KV)return json({error:'Не подключено хранилище SITE_KV'},503);
  if(Number(request.headers.get('content-length')||0)>6_000_000)return json({error:'Максимальный размер файла 5 МБ'},413);
  let form;
  try{form=await request.formData()}catch{return json({error:'Неверный файл'},400)}
  const file=form.get('file');
  if(!(file instanceof File)||file.size>5_000_000||file.size<1)return json({error:'Выберите изображение до 5 МБ'},400);
  if(!['image/png','image/jpeg','image/webp','image/gif','image/x-icon','image/vnd.microsoft.icon'].includes(file.type))return json({error:'Допустимы JPG, PNG, WebP, GIF и ICO'},400);
  const b=new Uint8Array(await file.arrayBuffer());
  const jpeg=b[0]===255&&b[1]===216&&b[2]===255;
  const png=b[0]===137&&b[1]===80&&b[2]===78&&b[3]===71;
  const webp=String.fromCharCode(...b.slice(0,4))==='RIFF'&&String.fromCharCode(...b.slice(8,12))==='WEBP';
  const gif=String.fromCharCode(...b.slice(0,3))==='GIF';
  const ico=b[0]===0&&b[1]===0&&b[2]===1&&b[3]===0;
  if(!(jpeg||png||webp||gif||ico))return json({error:'Содержимое файла не похоже на изображение'},400);
  const type=jpeg?'image/jpeg':png?'image/png':webp?'image/webp':gif?'image/gif':'image/x-icon';
  const id=crypto.randomUUID();
  // KV reliably accepts strings. Explicit Base64 prevents binary-to-"undefined" corruption.
  await env.SITE_KV.put(`img:${id}`,toBase64(b),{metadata:{type,encoding:'base64'}});
  // Verify stored value before claiming success; caches at the same edge can be eventually consistent.
  return json({url:`/media/${id}`});
}
