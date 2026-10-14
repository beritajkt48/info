/* ===== KONFIGURASI (edit di sini) ===== */
const WA_NUMBER = "6285711128781";           // 085711128781
const IMG = { banner:"assets/img/banner.png", produk:"assets/img/produk.png", qris:"assets/img/QRIS.png" };
const PRODUCTS = Array.from({length:8},(_,i)=>({
  id:i+1, name:"Contoh Produk "+(i+1), category:["Streaming","Game","Software","Edukasi"][i%4], img:IMG.produk,
  desc:"Deskripsi contoh produk digital. Pengiriman instan setelah pembayaran dikonfirmasi. Ganti teks ini sesuai produk Anda.",
  variants:[{name:"Contoh Varian 1",price:10000,stock:25},{name:"Contoh Varian 2",price:10000,stock:10},{name:"Contoh Varian 3",price:10000,stock:3},{name:"Contoh Varian 4",price:10000,stock:0}]
}));
/* ===== HELPER ===== */
const $=s=>document.querySelector(s), app=$("#app");
const rp=n=>"Rp"+Number(n).toLocaleString("id-ID");
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let cart=[]; try{cart=JSON.parse(localStorage.getItem("cart"))||[]}catch(e){}
const save=()=>{try{localStorage.setItem("cart",JSON.stringify(cart))}catch(e){} $("#badge").textContent=cart.reduce((a,c)=>a+c.qty,0)};
const toast=m=>{const t=$("#toast");t.textContent=m;t.classList.add("show");clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove("show"),2000)};
const detail=c=>{const p=PRODUCTS.find(x=>x.id===c.pid),v=p.variants[c.vi];return{p,v,sub:v.price*c.qty}};
const total=()=>cart.reduce((a,c)=>a+detail(c).sub,0);
/* ===== HALAMAN ===== */
function cardHTML(p){const min=Math.min(...p.variants.map(v=>v.price));
  return `<a class="card" href="#/produk/${p.id}"><img src="${p.img}" alt="${esc(p.name)}" loading="lazy"><div class="card-b"><span class="tag">${p.category}</span><h3>${esc(p.name)}</h3><span class="price">Mulai ${rp(min)}</span></div></a>`}
function home(){
  app.innerHTML=`<div class="banner"><img src="${IMG.banner}" alt="Banner"></div>
  <div class="perks"><div class="perk"><b>⚡ Proses Cepat</b>Dikirim setelah konfirmasi</div><div class="perk"><b>🔒 Aman</b>Bayar via QRIS</div><div class="perk"><b>💬 Support WA</b>Respon ramah & cepat</div></div>
  <div class="sec-h" id="produk"><h2>Semua Produk</h2><form class="search" id="sf"><input id="q" placeholder="Cari nama produk..." autocomplete="off"><button>Cari</button></form></div>
  <div class="grid" id="grid"></div>`;
  const draw=()=>{const q=$("#q").value.trim().toLowerCase(),l=PRODUCTS.filter(p=>p.name.toLowerCase().includes(q));
    $("#grid").innerHTML=l.length?l.map(cardHTML).join(""):`<div class="empty">😕 Produk "${esc(q)}" tidak ditemukan.</div>`};
  draw();$("#q").oninput=draw;$("#sf").onsubmit=e=>{e.preventDefault();draw()};
}
function product(id){
  const p=PRODUCTS.find(x=>x.id==id); if(!p)return home();
  let vi=Math.max(0,p.variants.findIndex(v=>v.stock>0)),qty=1;
  const draw=()=>{const v=p.variants[vi];
    app.innerHTML=`<div class="crumb"><a href="#/">Beranda</a> / ${esc(p.name)}</div>
    <div class="pd"><div class="pd-img"><img src="${p.img}" alt="${esc(p.name)}"></div><div>
      <span class="tag">${p.category}</span><h1>${esc(p.name)}</h1><div class="big">${rp(v.price)}</div><p>${esc(p.desc)}</p>
      <div class="lbl">Pilih Varian</div><div class="vars">${p.variants.map((x,i)=>`<button class="var ${i==vi?"on":""} ${x.stock?"":"off"}" data-i="${i}" ${x.stock?"":"disabled"}><b>${esc(x.name)}</b><small>${rp(x.price)} • ${x.stock?"Stok "+x.stock:"Habis"}</small></button>`).join("")}</div>
      <div class="lbl">Jumlah</div><div class="qty"><button id="mn">−</button><span>${qty}</span><button id="pl">+</button></div>
      <div class="actions"><button class="btn out" id="add" ${v.stock?"":"disabled"}>+ Keranjang</button><button class="btn" id="buy" ${v.stock?"":"disabled"}>Beli Sekarang</button></div>
    </div></div>`;
    document.querySelectorAll(".var").forEach(b=>b.onclick=()=>{vi=+b.dataset.i;qty=1;draw()});
    $("#mn").onclick=()=>{if(qty>1){qty--;draw()}};$("#pl").onclick=()=>{if(qty<v.stock)qty++;else toast("Maksimal sesuai stok");draw()};
    const add=()=>{const ex=cart.find(c=>c.pid==p.id&&c.vi==vi);const n=(ex?ex.qty:0)+qty;
      if(n>v.stock){toast("Melebihi stok tersedia");return false}
      ex?ex.qty=n:cart.push({pid:p.id,vi,qty});save();return true};
    $("#add").onclick=()=>{if(add())toast("✅ Masuk keranjang")};
    $("#buy").onclick=()=>{if(add())location.hash="#/keranjang"};
  };draw();
}
function cartPage(){
  if(!cart.length){app.innerHTML=`<div class="empty" style="padding:80px 0"><h2 style="display:inline-block">Keranjang kosong</h2><p style="margin:14px 0">Yuk pilih produk favoritmu.</p><a class="btn" href="#/">Belanja Sekarang</a></div>`;return}
  app.innerHTML=`<div class="crumb"><a href="#/">Beranda</a> / Keranjang</div><div class="lay"><div class="box"><h3>Keranjang Belanja</h3>
  ${cart.map((c,i)=>{const{p,v,sub}=detail(c);return `<div class="item"><img src="${p.img}" alt=""><div class="inf"><b>${esc(p.name)}</b><small>${esc(v.name)} • ${rp(v.price)}</small>
  <div class="qty" style="margin-top:6px"><button data-m="${i}">−</button><span>${c.qty}</span><button data-p="${i}">+</button></div></div><div style="text-align:right"><b>${rp(sub)}</b><br><button class="rm" data-r="${i}">Hapus</button></div></div>`}).join("")}</div>
  <div class="box"><h3>Ringkasan</h3><div class="row"><span>Total item</span><span>${cart.reduce((a,c)=>a+c.qty,0)}</span></div><div class="row tot"><span>Total</span><span>${rp(total())}</span></div>
  <a class="btn full" href="#/checkout" style="margin-top:14px">Lanjutkan Pembayaran →</a></div></div>`;
  document.querySelectorAll("[data-m]").forEach(b=>b.onclick=()=>{const c=cart[b.dataset.m];if(c.qty>1)c.qty--;save();cartPage()});
  document.querySelectorAll("[data-p]").forEach(b=>b.onclick=()=>{const c=cart[b.dataset.p];if(c.qty<detail(c).v.stock)c.qty++;else toast("Maksimal sesuai stok");save();cartPage()});
  document.querySelectorAll("[data-r]").forEach(b=>b.onclick=()=>{cart.splice(b.dataset.r,1);save();cartPage()});
}
function orderText(name){
  const L=cart.map((c,i)=>{const{p,v,sub}=detail(c);return `${i+1}. ${p.name} - ${v.name} x${c.qty} = ${rp(sub)}`});
  return `*ORDERAN BARU*\n\nNama: ${name}\nTanggal: ${new Date().toLocaleString("id-ID")}\n\n*Pesanan:*\n${L.join("\n")}\n\n*Total: ${rp(total())}*\nPembayaran: QRIS\n\nSaya sudah melakukan pembayaran, berikut bukti transfernya. Mohon diproses, terima kasih 🙏`}
function checkout(){
  if(!cart.length){location.hash="#/keranjang";return}
  app.innerHTML=`<div class="crumb"><a href="#/">Beranda</a> / <a href="#/keranjang">Keranjang</a> / Pembayaran</div><div class="lay"><div>
  <div class="box" style="margin-bottom:18px"><h3>1. Data Pemesan</h3><input class="fld" id="nm" placeholder="Nama kamu"></div>
  <div class="box"><h3>2. Metode Pembayaran</h3><div class="pay"><span class="chip">QRIS</span><p style="margin-top:8px">Scan QR di bawah dengan e-wallet / m-banking</p>
  <img src="${IMG.qris}" alt="QRIS"><div style="font-size:1.4rem;font-weight:700;color:var(--p)">${rp(total())}</div></div>
  <h3 style="margin:20px 0 6px">3. Konfirmasi Pembayaran</h3><ol class="steps"><li>Scan & bayar sesuai total.</li><li>Screenshot bukti pembayaran.</li><li>Klik tombol di bawah, kirim pesan beserta bukti.</li></ol>
  <button class="btn wa full" id="wa">💬 Konfirmasi via WhatsApp</button></div></div>
  <div class="box"><h3>Pesanan Kamu</h3>${cart.map(c=>{const{p,v,sub}=detail(c);return `<div class="row"><span>${esc(p.name)}<br><small>${esc(v.name)} x${c.qty}</small></span><b>${rp(sub)}</b></div>`}).join("")}<div class="row tot"><span>Total</span><span>${rp(total())}</span></div></div></div>`;
  $("#wa").onclick=()=>{const n=$("#nm").value.trim();if(!n){toast("Isi nama dulu ya");$("#nm").focus();return}
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(orderText(n))}`,"_blank")};
}
/* ===== ROUTER ===== */
function route(){
  const [,pg,id]=(location.hash||"#/").split("/");
  ({"produk":()=>product(id),"keranjang":cartPage,"checkout":checkout}[pg]||home)();
  window.scrollTo(0,0);
}
document.querySelector("[data-go]").onclick=e=>{e.preventDefault();const go=()=>document.getElementById("produk")?.scrollIntoView({behavior:"smooth"});
  if(location.hash&&location.hash!=="#/"){location.hash="#/";setTimeout(go,80)}else go()};
$("#yr").textContent=new Date().getFullYear();
addEventListener("hashchange",route);save();route();
