const d=document;
const dq=(s)=>d.querySelector(s);
const cd=()=>d.createElement("div");
const gb=dq(".board-module_board");
const sa=(e,...a)=>e.setAttribute(...a);
const sc=(e,c)=>sa(e,"class",c);
const ac=(e,c)=>e.appendChild(c);
for(let i=0;i<30;i++){
        const t=cd();
        sc(t,"tile");
        sa(t,"style",`--i:${i%5}`);
        const ti=cd();
        sc(ti,"tile-inner");
        const tf=cd();
        sc(tf,"tile-front");
        const tb=cd();
        sc(tb,"tile-back");
        ac(ti,tf);
        ac(ti,tb);
        ac(t,ti);
        ac(gb,t);
}

const kb=dq(".keyboard");
const krs=["QWERTYUIOP","ASDFGHJKL","-ZXCVBNM="].map(s=>s.split(""));
for(const kr of krs) {
        const r=cd();
        sa(r,"class","keyboard-row");
        for(const kl of kr) {
                const k=cd();
                sa(k,"class","key");
                if(['=','-'].includes(kl)){
                        sa(k,"style","min-width:65px;font-size:1.1rem");
                        k.textContent=kl==='='?"ENTER":"←";
                }
                else k.textContent=kl;
                sa(k,"onclick",`sl("${kl}")`);
                ac(r,k);
        }
        ac(kb,r);
}

const ans = "CHILI";
const te=Array(...dq(".board-module_board").childNodes);
let cn=0;
let cf=0;
const sl=(c)=>{
        if(["Backspace",'-'].includes(c)){
                if(cn>cf) te[--cn].querySelector(".tile-front").textContent="";
                return;
        }
        if(["Enter",'='].includes(c)){
                if(cn==cf+5&&cn<=30){
                        const cnts=ans.split("").reduce((acc,c)=>{acc[c]=(acc[c]|0)+1;return acc},{});
                        for(let i=0;i<5;i++){
                                const tile=te[cf+i];
                                const c=tile.querySelector(".tile-front").textContent;
                                let color="787c7e";
                                if(c===ans.charAt(i)) color="6aaa64";
                                else if(cnts[c]-->0) color="c9b458";
                                const tb=tile.querySelector(".tile-back");
                                tb.textContent=c;
                                sa(tb,"style",`background-color:#${color}`);
                                tile.classList.add("flip");
                        }
                        cf+=5;
                }
                return;
        }
        c=c.toUpperCase();
        if(!krs.flat().includes(c)||cn>=cf+5)return;
        te[cn++].querySelector(".tile-front").textContent=c;
}
d.addEventListener("keyup",(e)=>sl(e.key));
