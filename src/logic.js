import wordList from '../differenceList.txt?inline'

const base64 = wordList.split(',')[1]
const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0))

// Decompress gzip → VLC bytes → word Set
const vlcBytes = new Uint8Array(await new Response(
        new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))
).arrayBuffer());
const validWords = new Set();
for (let i = 0, num = 0; i < vlcBytes.length;) {
        let n = 0;
        do { n = (n << 7) + (vlcBytes[i] & 0x7f); } while (vlcBytes[i++] & 0x80);
        num += n;
        let word = '', m = num;
        for (let j = 0; j < 5; j++) { word = String.fromCharCode((m % 26) + 97) + word; m = Math.floor(m / 26); }
        validWords.add(word);
}

let toastTimer;
function showToast(msg) {
        const el = document.getElementById('toast');
        el.textContent = msg;
        el.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => el.classList.remove('show'), 1500);
}

const createDiv=()=>document.createElement("div");
for(let i = 0; i < 30; i++){
        const tile = createDiv();
        tile.setAttribute("class",  "tile");
        tile.setAttribute("style",`--i:${i%5}`);
        const tileInner = createDiv();
        tileInner.setAttribute("class", "tile-inner");
        const tileFront = createDiv();
        tileFront.setAttribute("class", "tile-front");
        const tileBack = createDiv();
        tileBack.setAttribute("class", "tile-back");
        tileInner.appendChild(tileFront);
        tileInner.appendChild(tileBack);
        tile.appendChild(tileInner);
        document.querySelector(".board-module_board").appendChild(tile);
}

const keyboardDiv=document.querySelector(".keyboard");
const keyboardRows=["QWERTYUIOP","ASDFGHJKL","-ZXCVBNM="].map(s=>s.split(""));
const keyElements={};
for(const keyboardRow of keyboardRows) {
        const rowDiv=createDiv();
        rowDiv.setAttribute("class", "keyboard-row");
        for(const keyboardLetter of keyboardRow) {
                const keyDiv=createDiv();
                keyDiv.setAttribute("class", "key");
                if(['=','-'].includes(keyboardLetter)){
                        keyDiv.classList.add("key-wide");
                        keyDiv.textContent=keyboardLetter==='='?"ENTER":"←";
                }
                else { keyDiv.textContent=keyboardLetter; keyElements[keyboardLetter]=keyDiv; }
                keyDiv.setAttribute("onclick", `sl("${keyboardLetter}")`);
                rowDiv.appendChild(keyDiv);
        }
        keyboardDiv.appendChild(rowDiv);
}
const keyPriority={absent:1,present:2,correct:3};
const keyState={};

const answerList = await fetch("./public/answers.json").then(res => res.json());
function dateToString(date) {
        const day = date.getDate().toString().padStart(2,"0");
        const month = (date.getMonth() + 1).toString().padStart(2,"0");
        const year = date.getFullYear();
        return `${year}-${month}-${day}`;
}

let dateOffset = 0;
const btnToday = document.getElementById("date-today");
const btnTomorrow = document.getElementById("date-tomorrow");

function getAnswerEntry() {
        const d = new Date();
        d.setDate(d.getDate() + dateOffset);
        return answerList[dateToString(d)];
}
function getAnswer() { return getAnswerEntry()?.solution?.toUpperCase(); }

btnToday.addEventListener("click", () => {
        dateOffset = 0;
        btnToday.classList.add("active");
        btnTomorrow.classList.remove("active");
});
btnTomorrow.addEventListener("click", () => {
        dateOffset = 1;
        btnTomorrow.classList.add("active");
        btnToday.classList.remove("active");
});

const tileElements=Array(...document.querySelector(".board-module_board").childNodes);
let charNumber=0;
let rowEnd=0;
let gameOver=false;
const guessResults=[];

const EMOJI={correct:'🟩',present:'🟨',absent:'⬛'};

function showResultModal(won) {
        const entry = getAnswerEntry();
        const puzzleNum = entry?.days_since_launch ?? '';
        const dateLabel = new Date((entry?.print_date ?? dateToString(new Date())) + 'T12:00:00')
                .toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'});
        const score = won ? `${guessResults.length}/6` : 'X/6';

        document.getElementById('result-title').textContent = won ? 'Congratulations! 🎉' : 'Game Over';
        document.getElementById('result-meta').textContent = `I-House Wordle #${puzzleNum}  ·  ${dateLabel}`;
        document.getElementById('result-score').textContent = won
                ? `Solved in ${score}`
                : `The answer was ${getAnswer()}`;
        document.getElementById('result-grid').textContent =
                guessResults.map(row => row.map(s => EMOJI[s]).join('')).join('\n');
        document.getElementById('result-modal').classList.add('show');
}

document.getElementById('modal-close').addEventListener('click', () =>
        document.getElementById('result-modal').classList.remove('show'));
document.getElementById('result-modal').addEventListener('click', e => {
        if(e.target===e.currentTarget) e.currentTarget.classList.remove('show');
});

document.getElementById('share-btn').addEventListener('click', () => {
        const entry = getAnswerEntry();
        const puzzleNum = entry?.days_since_launch ?? '';
        const won = guessResults.length < 6 || guessResults.at(-1).every(s=>s==='correct');
        const score = won ? `${guessResults.length}/6` : 'X/6';
        const grid = guessResults.map(row => row.map(s=>EMOJI[s]).join('')).join('\n');
        const text = `I-House Wordle #${puzzleNum} ${score}\n\n${grid}`;
        navigator.clipboard.writeText(text).then(() => {
                const btn = document.getElementById('share-btn');
                btn.textContent = 'Copied!';
                setTimeout(() => btn.textContent = 'Share', 2000);
        });
});

const selectLetter = (c) => {
        if(gameOver) return;
        if(["Backspace",'-'].includes(c)){
                if(charNumber>rowEnd) tileElements[--charNumber].querySelector(".tile-front").textContent="";
                return;
        }
        if(["Enter",'='].includes(c)){
                if(charNumber==rowEnd+5&&charNumber<=30){
                        const guess=Array.from({length:5},(_,i)=>tileElements[rowEnd+i].querySelector(".tile-front").textContent.toLowerCase()).join('');
                        if(!validWords.has(guess)){ showToast("Not in word list"); return; }
                        const ans=getAnswer();
                        const cnts=ans.split("").reduce((acc,c)=>{acc[c]=(acc[c]|0)+1;return acc},{});
                        const letters=Array.from({length:5},(_,i)=>tileElements[rowEnd+i].querySelector(".tile-front").textContent);
                        const states=Array(5).fill("absent");
                        // pass 1: greens
                        for(let i=0;i<5;i++) if(letters[i]===ans.charAt(i)){ states[i]="correct"; cnts[letters[i]]--; }
                        // pass 2: yellows
                        for(let i=0;i<5;i++) if(states[i]!=="correct"&&cnts[letters[i]]>0){ states[i]="present"; cnts[letters[i]]--; }
                        const rowResults=[];
                        for(let i=0;i<5;i++){
                                const c=letters[i], state=states[i];
                                const color=state==="correct"?"6aaa64":state==="present"?"c9b458":"787c7e";
                                rowResults.push({c,state});
                                const tb=tileElements[rowEnd+i].querySelector(".tile-back");
                                tb.textContent=c;
                                tb.setAttribute("style",`background-color:#${color}`);
                                tileElements[rowEnd+i].classList.add("flip");
                        }
                        setTimeout(()=>{
                                for(const {c,state} of rowResults){
                                        if((keyPriority[state]||0)>(keyPriority[keyState[c]]||0)){
                                                keyState[c]=state;
                                                if(keyElements[c]) keyElements[c].dataset.state=state;
                                        }
                                }
                        }, 1800);
                        guessResults.push(rowResults.map(r=>r.state));
                        rowEnd+=5;
                        const won = rowResults.every(r=>r.state==='correct');
                        if(won || rowEnd>=30){
                                gameOver=true;
                                setTimeout(()=>showResultModal(won), 2200);
                        }
                }
                return;
        }
        c=c.toUpperCase();
        if(!keyboardRows.flat().includes(c)||charNumber>=rowEnd+5)return;
        if(charNumber===0){
                btnToday.disabled=true;
                btnTomorrow.disabled=true;
        }
        tileElements[charNumber++].querySelector(".tile-front").textContent=c;
}
document.addEventListener("keyup",(e)=>selectLetter(e.key));
window.sl = selectLetter;
