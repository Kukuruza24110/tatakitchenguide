function fromBase64(base64){
  const binary=atob(base64);
  const bytes=new Uint8Array(binary.length);
  for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
  return bytes;
}

export async function onRequestGet({params,env}){
  const id=String(params.id||'');
  if(!/^[a-f0-9-]{36}$/.test(id)||!env.SITE_KV)return new Response('Not found',{status:404});
  const result=await env.SITE_KV.getWithMetadata(`img:${id}`,'text');
  if(!result.value)return new Response('Not found',{status:404});
  if(result.metadata?.encoding!=='base64'){
    // Legacy binary uploads may have been corrupted; do not send them as valid images.
    return new Response('Old image needs to be uploaded again',{status:422,headers:{'content-type':'text/plain; charset=utf-8','cache-control':'no-store'}});
  }
  let bytes;
  try{bytes=fromBase64(result.value)}catch{
    return new Response('Invalid image data',{status:422,headers:{'cache-control':'no-store'}});
  }
  const type=result.metadata?.type;
  const jpeg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
  const png=bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71;
  const webp=String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP';
  const gif=String.fromCharCode(...bytes.slice(0,3))==='GIF';
  const ico=bytes[0]===0&&bytes[1]===0&&bytes[2]===1&&bytes[3]===0;
  if(bytes.length<12||!(jpeg||png||webp||gif||ico))return new Response('Invalid image data',{status:422,headers:{'cache-control':'no-store'}});
  return new Response(bytes,{headers:{
    'content-type':type||'application/octet-stream',
    'content-length':String(bytes.byteLength),
    'cache-control':'no-store',
    'x-content-type-options':'nosniff'
  }});
}
