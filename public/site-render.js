document.addEventListener("DOMContentLoaded", () => {
/* Данные из site-data.js. Отображение не затрагивает отправку заказов. */
(function(){
  const config=window.SITE_DATA;
  if(!config) return;
  const setText=(root,selector,value)=>{const el=root.querySelector(selector);if(el && value!==undefined)el.textContent=value;};
  const success=document.querySelector('#orderSuccessView');
  if(success){setText(success,'h3',config.success.title);setText(success,'p',config.success.message);}
  const slug=document.body.dataset.guide;
  const image=(holder,file,prefix,alt)=>{
    if(!holder || !file)return;
    const img=holder.querySelector('img') || document.createElement('img');
    img.alt=alt; img.loading='lazy'; img.src=prefix+file;
    img.style.width='100%';img.style.height='100%';img.style.objectFit='cover';
    img.addEventListener('load',()=>{holder.classList.remove('no-image'); if(holder.classList.contains('photo-placeholder')){holder.classList.remove('photo-placeholder');holder.style.display='block';} });
    img.addEventListener('error',()=>{if(holder.classList.contains('detail-photo'))holder.classList.add('no-image');else img.remove();});
    if(!img.parentNode)holder.prepend(img);
    const small=holder.querySelector('small');if(small)small.textContent='images/'+file;
  };
  if(slug){
    const guide=config.guides[slug]; if(!guide)return;
    document.title=guide.title+' — Тата Анастасия';
    setText(document,'.detail-hero .eyebrow',guide.kind);
    setText(document,'.detail-hero h1',guide.title);
    setText(document,'.detail-hero .detail-intro',guide.description);
    document.querySelectorAll('.detail-price').forEach(el=>el.textContent=guide.price);
    setText(document,'.detail-purchase p',guide.title);
    const list=document.querySelector('.detail-list');
    if(list){list.replaceChildren();guide.contents.forEach(item=>{const li=document.createElement('li');li.textContent=item;list.append(li);});}
    document.querySelectorAll('.detail-photo').forEach((holder,i)=>image(holder,guide.images[i],'../images/',guide.title+' — фото '+(i+1)));
    // Значение поля формы задаётся в существующем обработчике openModal.
    // Синхронизируем его с текущим названием гайда без изменения логики формы.
    document.querySelectorAll('.buy-guide').forEach(btn=>btn.addEventListener('click',()=>{
      const field=document.getElementById('orderGuide');if(field)field.value=guide.title;
    }));
  }else{
    document.querySelectorAll('.recipe-card').forEach((card,i)=>{
      const slug=Object.keys(config.guides)[i],guide=config.guides[slug];if(!guide)return;
      setText(card,'.recipe-card-kind',guide.kind);setText(card,'h3',guide.title);
      setText(card,'.recipe-card-body > p',guide.description);setText(card,'.price',guide.price);
      const anchor=card.querySelector('.recipe-card-media');
      if(anchor){anchor.setAttribute('aria-label','Подробнее: '+guide.title);image(anchor,guide.images[0],'images/',guide.title);}
    });
  }
})();

});
