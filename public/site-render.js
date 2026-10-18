/* Каталог из Cloudflare KV; при первом запуске используется встроенный каталог. */
(async function(){
const fallbackHome=window.SITE_DATA?.home;
let data=window.SITE_DATA;
try{const r=await fetch('/api/catalog',{cache:'no-store'});if(r.ok){const v=await r.json();if(v.catalog)data=v.catalog;}}catch(e){console.warn('Каталог: резервные данные',e)}
if(!data)return;
window.SITE_DATA=data;
if(data.favicon){let f=document.querySelector('link[rel="icon"]');if(!f){f=document.createElement('link');f.rel='icon';document.head.append(f)}f.href=data.favicon.startsWith('/')?data.favicon:'/images/'+data.favicon;}
const succ=document.getElementById('orderSuccessView');if(succ){const h=succ.querySelector('h3'),p=succ.querySelector('p');if(h)h.textContent=data.success?.title||'Заявка принята';if(p)p.textContent=data.success?.message||'Спасибо за заявку!';}
const path=location.pathname;
const detail=/^\/guides\//.test(path);
const legacySlugs={'cream-cheese.html':'cream-cheese','macarons.html':'macarons','cakes.html':'cakes','fillings.html':'fillings'};
const fileName=path.split('/').pop();
const slug=detail?(legacySlugs[fileName]||new URLSearchParams(location.search).get('id')||document.body.dataset.guide):null;
const url=(file,prefix)=>!file?'':file.startsWith('/')?file:prefix+file;
const img=(target,file,prefix,title)=>{if(!target)return;target.replaceChildren();if(!file){target.textContent='Фото скоро появится';return;}const i=document.createElement('img');i.alt=title;i.loading='lazy';i.src=url(file,prefix);i.style.cssText='width:100%;height:100%;object-fit:cover;display:block';i.onerror=()=>{i.remove();target.textContent='Фото скоро появится';};target.append(i);target.classList.remove('photo-placeholder','no-image');target.style.display='block';};
if(detail){const g=data.guides?.[slug];if(!g){const main=document.querySelector('main');if(main)main.innerHTML='<div class="wrap" style="padding:80px 20px"><h1>Гайд не найден</h1><a href="/#products">Вернуться ко всем гайдам</a></div>';document.body.classList.add('guide-ready');return;}
document.body.dataset.guide=slug;document.title=g.title+' — Тата Анастасия';
const set=(s,v)=>{const x=document.querySelector(s);if(x)x.textContent=v||'';};
set('.detail-hero .eyebrow',g.kind);set('.detail-hero h1',g.title);set('.detail-hero .detail-intro',g.description);set('.detail-purchase p',g.title);document.querySelectorAll('.detail-price').forEach(x=>x.textContent=g.price);const list=document.querySelector('.detail-list');if(list){list.replaceChildren();(g.contents||[]).forEach(x=>{const li=document.createElement('li');li.textContent=x;list.append(li)})}document.querySelectorAll('.detail-photo').forEach((x,i)=>img(x,(g.images||[])[i],'../images/',g.title));document.body.classList.add('guide-ready');
}else{
const grid=document.querySelector('.card-grid');if(!grid)return;grid.replaceChildren();Object.entries(data.guides||{}).forEach(([slug,g],idx)=>{const article=document.createElement('article');article.className='recipe-card';const number=document.createElement('span');number.className='recipe-card-num';number.textContent='№ '+String(idx+1).padStart(2,'0');article.append(number);
const link=document.createElement('a');link.className='recipe-card-media photo-placeholder';link.href=legacySlugs[slug+'.html']?'/guides/'+encodeURIComponent(slug)+'.html':'/guides/guide.html?id='+encodeURIComponent(slug);link.setAttribute('aria-label','Подробнее: '+g.title);img(link,g.images?.[0],'images/',g.title);article.append(link);
const body=document.createElement('div');body.className='recipe-card-body';const kind=document.createElement('span');kind.className='recipe-card-kind';kind.textContent=g.kind;const h=document.createElement('h3');h.textContent=g.title;const p=document.createElement('p');p.textContent=g.description;const footer=document.createElement('div');footer.className='recipe-card-footer';const price=document.createElement('span');price.className='price';price.textContent=g.price;const more=document.createElement('a');more.className='btn btn-small btn-primary';more.href=link.href;more.textContent='Подробнее';footer.append(price,more);body.append(kind,h,p,footer);article.append(body);grid.append(article);});
}

const home=data.home||fallbackHome;
if(home){
const text=(sel,val)=>{const e=document.querySelector(sel);if(e&&val!==undefined)e.textContent=val;};
text('.brand-text',home.brand);if(home.browserTitle&&!detail)document.title=home.browserTitle;
const meta=document.querySelector('meta[name="description"]');if(meta&&home.metaDescription)meta.content=home.metaDescription;
if(!detail){
text('.hero .eyebrow',home.heroEyebrow);text('.hero h1',home.heroTitle);text('.hero-lede',home.heroText);text('.hero-card-tag span:last-child',home.heroTag);
text('.about .display-lg',home.aboutHeading);text('.about-text',home.aboutText);
text('.products .display-lg',home.catalogHeading);text('.products .section-lede',home.catalogText);
text('.reviews .display-lg',home.reviewsHeading);text('.works .display-lg',home.worksHeading);
text('.choose-guide .eyebrow',home.contactEyebrow);text('.choose-guide .display-lg',home.contactHeading);text('.choose-guide .section-lede',home.contactText);text('.choose-guide .btn',home.contactButton);
text('.footer-inner span:first-child',home.footerText||home.brand);
const placePhoto=(selector,src)=>{const box=document.querySelector(selector);if(box&&src)img(box,src,'images/','Фото Таты Анастасии');};
placePhoto('.hero-card .photo-placeholder',home.heroPhoto);placePhoto('.about-media .photo-placeholder',home.aboutPhoto);
const stats=document.querySelector('.stats-grid');if(stats&&Array.isArray(home.stats)){stats.replaceChildren();home.stats.forEach(v=>{const node=document.createElement('div');node.className='stat';const a=document.createElement('span');a.className='stat-num';a.textContent=v.number;const b=document.createElement('span');b.className='stat-label';b.textContent=v.label;node.append(a,b);stats.append(node)});const note=document.querySelector('.stats .stats-note');if(note)note.remove();}
const milestones=document.querySelector('.milestones');if(milestones&&Array.isArray(home.milestones)){milestones.replaceChildren();home.milestones.forEach((v,i)=>{const li=document.createElement('li'),num=document.createElement('span'),body=document.createElement('div'),h=document.createElement('h3'),p=document.createElement('p');num.className='milestone-num';num.textContent=i+1;h.textContent=v.title;p.textContent=v.text;body.append(h,p);li.append(num,body);milestones.append(li)});}
const reviews=document.querySelector('.reviews-grid');if(reviews&&Array.isArray(home.reviews)){reviews.replaceChildren();home.reviews.forEach(v=>{const card=document.createElement('blockquote'),p=document.createElement('p'),f=document.createElement('footer');card.className='review-card';p.textContent='«'+v.text+'»';f.textContent='— '+v.author;card.append(p,f);reviews.append(card)});const note=document.querySelector('.reviews .stats-note');if(note)note.remove();}
const works=document.querySelector('.works-grid');if(works&&Array.isArray(home.works)){works.replaceChildren();home.works.forEach(src=>{const d=document.createElement('div');d.className='works-item photo-placeholder';img(d,src,'images/','Пример работы');works.append(d)});if(!home.works.length){works.textContent='Фотографии работ скоро появятся';}}
const contactSection=document.querySelector('.choose-guide-inner');if(contactSection){contactSection.querySelectorAll('.dynamic-contact').forEach(x=>x.remove());(home.contacts||[]).forEach(v=>{const a=document.createElement('a');a.className='btn btn-ghost dynamic-contact';a.href=v.url;a.textContent=v.label;a.rel='noopener noreferrer';a.target='_blank';contactSection.append(a)});}
}}
})();
