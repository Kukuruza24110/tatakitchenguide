/* Каталог из Cloudflare KV; при первом запуске используется встроенный каталог. */
(async function(){
let data=window.SITE_DATA;
try{const r=await fetch('/api/catalog',{cache:'no-store'});if(r.ok){const v=await r.json();if(v.catalog)data=v.catalog;}}catch(e){console.warn('Каталог: резервные данные',e)}
if(!data)return;
window.SITE_DATA=data;
if(data.favicon){let f=document.querySelector('link[rel="icon"]');if(!f){f=document.createElement('link');f.rel='icon';document.head.append(f)}f.href=data.favicon.startsWith('/')?data.favicon:'/images/'+data.favicon;}
const succ=document.getElementById('orderSuccessView');if(succ){const h=succ.querySelector('h3'),p=succ.querySelector('p');if(h)h.textContent=data.success?.title||'Заявка принята';if(p)p.textContent=data.success?.message||'Спасибо за заявку!';}
const path=location.pathname;const detail=path.startsWith('/guides/');const slug=path.endsWith('/guide.html')?new URLSearchParams(location.search).get('id'):document.body.dataset.guide;
const url=(file,prefix)=>!file?'':file.startsWith('/')?file:prefix+file;
const img=(target,file,prefix,title)=>{if(!target)return;target.replaceChildren();if(!file){target.textContent='Фото скоро появится';return;}const i=document.createElement('img');i.alt=title;i.loading='lazy';i.src=url(file,prefix);i.style.cssText='width:100%;height:100%;object-fit:cover;display:block';i.onerror=()=>{i.remove();target.textContent='Фото скоро появится';};target.append(i);target.classList.remove('photo-placeholder','no-image');target.style.display='block';};
if(detail){const g=data.guides?.[slug];if(!g){const main=document.querySelector('main');if(main)main.innerHTML='<div class="wrap" style="padding:80px 20px"><h1>Гайд не найден</h1><a href="/#products">Вернуться ко всем гайдам</a></div>';return;}
document.body.dataset.guide=slug;document.title=g.title+' — Тата Анастасия';
const set=(s,v)=>{const x=document.querySelector(s);if(x)x.textContent=v||'';};
set('.detail-hero .eyebrow',g.kind);set('.detail-hero h1',g.title);set('.detail-hero .detail-intro',g.description);set('.detail-purchase p',g.title);document.querySelectorAll('.detail-price').forEach(x=>x.textContent=g.price);const list=document.querySelector('.detail-list');if(list){list.replaceChildren();(g.contents||[]).forEach(x=>{const li=document.createElement('li');li.textContent=x;list.append(li)})}document.querySelectorAll('.detail-photo').forEach((x,i)=>img(x,(g.images||[])[i],'../images/',g.title));
}else{
const grid=document.querySelector('.card-grid');if(!grid)return;grid.replaceChildren();Object.entries(data.guides||{}).forEach(([slug,g],idx)=>{const article=document.createElement('article');article.className='recipe-card';const number=document.createElement('span');number.className='recipe-card-num';number.textContent='№ '+String(idx+1).padStart(2,'0');article.append(number);
const link=document.createElement('a');link.className='recipe-card-media photo-placeholder';link.href='/guides/guide.html?id='+encodeURIComponent(slug);link.setAttribute('aria-label','Подробнее: '+g.title);img(link,g.images?.[0],'images/',g.title);article.append(link);
const body=document.createElement('div');body.className='recipe-card-body';const kind=document.createElement('span');kind.className='recipe-card-kind';kind.textContent=g.kind;const h=document.createElement('h3');h.textContent=g.title;const p=document.createElement('p');p.textContent=g.description;const footer=document.createElement('div');footer.className='recipe-card-footer';const price=document.createElement('span');price.className='price';price.textContent=g.price;const more=document.createElement('a');more.className='btn btn-small btn-primary';more.href=link.href;more.textContent='Подробнее';footer.append(price,more);body.append(kind,h,p,footer);article.append(body);grid.append(article);});
}
})();
