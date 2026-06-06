const querySelector=(s)=>document.querySelector(s);
const createDiv=()=>document.createElement("div");
const gb=querySelector(".board-module_board");
const setAttribute=(e,...a)=>e.setAttribute(...a);
const setClass=(e,c)=>setAttribute(e,"class",c);
const appendChild=(e,c)=>e.appendChild(c);

/**
 * for each tile, create the structure
 * <div class="tile">
 *      <div class="tile-inner">
 *              <div class="tile-front" />
 *              <div class="tile-back" />
 *      </div>
 *  </div>
 */
for(let i = 0; i < 30; i++){
        const tile = createDiv();
        setClass(tile, "tile");
        setAttribute(tile, "style",`--i:${i%5}`);
        const tileInner = createDiv();
        setClass(tileInner,"tile-inner");
        const tileFront = createDiv();
        setClass(tileFront,"tile-front");
        const tileBack = createDiv();
        setClass(tileBack,"tile-back");
        appendChild(tileInner,tileFront);
        appendChild(tileInner,tileBack);
        appendChild(tile,tileInner);
        appendChild(gb,tile);
}

const keyboardDiv=querySelector(".keyboard");
const keyboardRows=["QWERTYUIOP","ASDFGHJKL","-ZXCVBNM="].map(s=>s.split(""));
for(const keyboardRow of keyboardRows) {
        const rowDiv=createDiv();
        setAttribute(rowDiv,"class","keyboard-row");
        for(const keyboardLetter of keyboardRow) {
                const keyDiv=createDiv();
                setAttribute(keyDiv,"class","key");
                if(['=','-'].includes(keyboardLetter)){
                        setAttribute(keyDiv,"style","min-width:65px;font-size:1.1rem");
                        keyDiv.textContent=keyboardLetter==='='?"ENTER":"←";
                }
                else keyDiv.textContent=keyboardLetter;
                setAttribute(keyDiv,"onclick",`sl("${keyboardLetter}")`);
                appendChild(rowDiv,keyDiv);
        }
        appendChild(keyboardDiv,rowDiv);
}

const ans = "CHILI";
const te=Array(...querySelector(".board-module_board").childNodes);
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
                                setAttribute(tb,"style",`background-color:#${color}`);
                                tile.classList.add("flip");
                        }
                        cf+=5;
                }
                return;
        }
        c=c.toUpperCase();
        if(!keyboardRows.flat().includes(c)||cn>=cf+5)return;
        te[cn++].querySelector(".tile-front").textContent=c;
}
document.addEventListener("keyup",(e)=>sl(e.key));
