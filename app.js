const KEY="gymtrack_v2";
const foods=[
["Pechuga de pollo","100 g",165,31,0,3.6,0],["Arroz blanco cocido","100 g",130,2.7,28,.3,.4],["Huevo entero","1 pieza",72,6.3,.4,4.8,0],
["Avena","100 g",389,16.9,66.3,6.9,10.6],["Plátano","1 pieza",105,1.3,27,.4,3.1],["Atún en agua","100 g",116,25.5,0,.8,0],
["Aguacate","100 g",160,2,8.5,14.7,6.7],["Tortilla de maíz","1 pieza",52,1.4,10.7,.7,1.4],["Frijoles cocidos","100 g",127,8.7,22.8,.5,7.4],
["Yogur griego natural","100 g",59,10.3,3.6,.4,0],["Leche descremada","250 ml",90,8.5,12.5,0,0],["Pan integral","2 rebanadas",140,6,24,2,4],
["Proteína whey","1 scoop",120,24,3,2,0],["Salmón","100 g",208,20,0,13,0],["Carne de res magra","100 g",217,26,0,12,0]
].map((x,i)=>({id:"b"+i,name:x[0],serving:x[1],cal:x[2],pro:x[3],carb:x[4],fat:x[5],fiber:x[6]}));
const defaultExercises=[["Press de banca","Pecho"],["Sentadilla","Pierna"],["Peso muerto","Espalda"],["Remo con barra","Espalda"],["Press militar","Hombro"],["Curl de bíceps","Bíceps"],["Extensión de tríceps","Tríceps"]].map((x,i)=>({id:"e"+i,name:x[0],muscle:x[1]}));
let data=JSON.parse(localStorage.getItem(KEY)||"null")||{goals:{cal:2500,pro:180,carb:280,fat:70},foods:[],logs:{},exercises:defaultExercises,workouts:[],endpoint:""};
let workout=[];
const today=()=>new Date().toISOString().slice(0,10);
const save=()=>localStorage.setItem(KEY,JSON.stringify(data));
const day=()=>data.logs[today()]||{items:[]};
function toast(t){const x=document.getElementById("toast");x.textContent=t;x.classList.add("show");setTimeout(()=>x.classList.remove("show"),1800)}
function allFoods(){return foods.concat(data.foods)}
function totals(){return day().items.reduce((a,x)=>{for(const k of ["cal","pro","carb","fat"])a[k]+=+x[k]||0;return a},{cal:0,pro:0,carb:0,fat:0})}
function pct(v,g){return Math.min(100,Math.round(v/(g||1)*100))}
document.querySelectorAll(".nav").forEach(n=>n.onclick=()=>showScreen(n.dataset.screen));
function showScreen(id){document.querySelectorAll(".screen").forEach(x=>x.classList.remove("active"));document.getElementById(id).classList.add("active");document.querySelectorAll(".nav").forEach(x=>x.classList.toggle("active",x.dataset.screen===id));if(id==="training")renderTraining();if(id==="progress")renderProgress();if(id==="settings")renderSettings()}
function renderDashboard(){
 const t=totals(), deg=Math.min(360,t.cal/data.goals.cal*360);calValue.textContent=Math.round(t.cal);calGoal.textContent=data.goals.cal;calRemain.textContent=t.cal>=data.goals.cal?"Objetivo alcanzado":`Te quedan ${Math.max(0,Math.round(data.goals.cal-t.cal))} kcal`;
 calRing.style.background=`conic-gradient(#35ee83 ${deg}deg,#35ee8320 ${deg}deg)`;
 const defs=[["Proteína","pro","g"],["Carbohidratos","carb","g"],["Grasas","fat","g"]];
 macroGrid.innerHTML=defs.map(([n,k,u])=>`<div class="macro"><span class="name">${n}</span><b>${t[k].toFixed(1)} <small class="muted">/ ${data.goals[k]}${u}</small></b><div class="track"><i style="width:${pct(t[k],data.goals[k])}%"></i></div></div>`).join("");
 const d=new Date();dateTitle.textContent=d.toLocaleDateString("es-MX",{weekday:"long",day:"numeric",month:"long"});dateSub.textContent="Tu resumen nutricional de hoy";
 renderMeals();
}
function renderMeals(){const meals=["Desayuno","Colación","Comida","Pre-entreno","Post-entreno","Cena"];mealList.innerHTML=meals.map(m=>{const items=day().items.filter(x=>x.meal===m);if(!items.length)return "";return `<div class="meal-card"><div class="meal-title"><b>${m}</b><span class="muted small">${Math.round(items.reduce((a,x)=>a+x.cal,0))} kcal</span></div>${items.map(x=>`<div class="food-row"><div><strong>${x.name}</strong><small>${x.serving} · P ${x.pro.toFixed(1)}g · C ${x.carb.toFixed(1)}g · G ${x.fat.toFixed(1)}g</small></div><button class="delete" onclick="removeFood('${x.uid}')">×</button></div>`).join("")}</div>`}).join("")||`<div class="glass-card muted">Todavía no has agregado alimentos.</div>`}
function removeFood(uid){const d=day();d.items=d.items.filter(x=>String(x.uid)!==String(uid));data.logs[today()]=d;save();renderDashboard()}
function unitFactor(unit,qty){return ({g:qty/100,ml:qty/100,portion:qty,piece:qty,cup:qty,tbsp:qty/16,tsp:qty/48})[unit]||1}
function unitName(u){return ({g:"g",ml:"ml",portion:"porción",piece:"pieza",cup:"taza",tbsp:"cda",tsp:"cdta"})[u]||u}
function matchFood(q){q=q.toLowerCase();return allFoods().find(f=>f.name.toLowerCase().split(" ").some(w=>w.length>2&&q.includes(w)))}
function estimateLocal(q,qty,unit){
 let f=matchFood(q);
 const patterns=[
  {r:/\b(\d+)\s*tacos?\b/i,base:"Tortilla de maíz",mult:m=>m*3},
  {r:/\b(\d+)\s*huevos?\b/i,base:"Huevo entero",mult:m=>m},
  {r:/\b(\d+)\s*(?:scoop|medidas?)\b/i,base:"Proteína whey",mult:m=>m}
 ];
 for(const p of patterns){const m=q.match(p.r);if(m){f=allFoods().find(x=>x.name===p.base);qty=p.mult(+m[1]);unit="portion";break}}
 if(!f)return null;const k=unitFactor(unit,qty);return {...f,id:"ai"+Date.now(),serving:`${qty} ${unitName(unit)}`,cal:f.cal*k,pro:f.pro*k,carb:f.carb*k,fat:f.fat*k,fiber:f.fiber*k};
}
async function analyzeFood(){
 const q=aiQuery.value.trim();if(!q)return toast("Escribe qué comiste");
 aiOutput.innerHTML='<div class="ai-result">✦ Analizando…</div>';
 let result=null,source="estimación local";
 if(data.endpoint){
  try{const r=await fetch(data.endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query:q,quantity:+aiQty.value||1,unit:aiUnit.value})});if(!r.ok)throw Error();result=await r.json();source="IA real"}catch(e){console.warn(e)}
 }
 if(!result)result=estimateLocal(q,+aiQty.value||1,aiUnit.value);
 if(!result){aiOutput.innerHTML='<div class="ai-result"><b>No pude identificar el platillo.</b><p class="muted small">Conecta tu backend de IA en Ajustes para analizar platillos libres como “chilaquiles con pollo y crema”.</p></div>';return}
 result={...result,id:"ai"+Date.now()};
 aiOutput.innerHTML=`<div class="ai-result"><div class="row"><div><b>✦ ${result.name}</b><div class="muted small">${result.serving} · ${source}</div></div><button class="pill green" onclick='openQuantityModal(${JSON.stringify(result)})'>Agregar</button></div><div class="result-stats"><div class="stat"><b>${Math.round(result.cal)}</b><span>kcal</span></div><div class="stat"><b>${result.pro.toFixed(1)}g</b><span>proteína</span></div><div class="stat"><b>${result.carb.toFixed(1)}g</b><span>carbohidratos</span></div><div class="stat"><b>${result.fat.toFixed(1)}g</b><span>grasas</span></div></div></div>`;
}
let pendingFood=null;
function openQuantityModal(food){
  pendingFood={...food};
  const defaultQty=food.serving?parseFloat(food.serving):1;
  const inferredUnit=(food.serving||"").includes("g")?"g":(food.serving||"").includes("ml")?"ml":"portion";
  quantityModal.classList.add("show");
  renderQuantityModal(defaultQty||1,inferredUnit);
}
function closeQuantityModal(){quantityModal.classList.remove("show");pendingFood=null}
function quantityValues(){
  const qty=Math.max(.01,parseFloat(qtyInput.value)||1);
  const unit=qtyUnit.value;
  const baseServing=pendingFood?.serving||"100 g";
  let baseQty=1, baseUnit="portion";
  const m=String(baseServing).match(/([\d.]+)\s*(g|ml|pieza|porción|portion|taza|cda|cdta)/i);
  if(m){baseQty=parseFloat(m[1]);baseUnit=m[2].toLowerCase()}
  const baseFactor=({g:1,ml:1,pieza:1,"porción":1,portion:1,taza:1,cda:1,cdta:1})[baseUnit]||1;
  const requestedFactor=({g:qty/100,ml:qty/100,piece:qty,portion:qty,cup:qty,tbsp:qty/16,tsp:qty/48})[unit]||qty;
  let factor=requestedFactor;
  // Food database values are normally per 100 g/ml or per one portion/piece.
  if(baseUnit==="g"||baseUnit==="ml") factor=requestedFactor;
  else factor=requestedFactor/baseFactor;
  return {qty,unit,cal:(pendingFood.cal||0)*factor,pro:(pendingFood.pro||0)*factor,carb:(pendingFood.carb||0)*factor,fat:(pendingFood.fat||0)*factor,fiber:(pendingFood.fiber||0)*factor};
}
function renderQuantityModal(qty=1,unit="portion"){
  quantityContent.innerHTML=`
    <span class="eyebrow">CANTIDAD CONSUMIDA</span>
    <h2 style="margin:5px 0">¿Cuánto comiste?</h2>
    <div class="qty-product"><div class="qty-icon">🥗</div><div><b>${pendingFood.name}</b><div class="muted small">Ajusta la cantidad para calcular los macros exactos de esta entrada.</div></div></div>
    <div class="qty-fields">
      <label>Cantidad<input id="qtyInput" type="number" min=".01" step=".1" value="${qty}"></label>
      <label>Unidad<select id="qtyUnit">
        <option value="g" ${unit==="g"?"selected":""}>Gramos (g)</option>
        <option value="ml" ${unit==="ml"?"selected":""}>Mililitros (ml)</option>
        <option value="portion" ${unit==="portion"?"selected":""}>Porción</option>
        <option value="piece" ${unit==="piece"?"selected":""}>Pieza</option>
        <option value="cup" ${unit==="cup"?"selected":""}>Taza</option>
        <option value="tbsp" ${unit==="tbsp"?"selected":""}>Cucharada</option>
        <option value="tsp" ${unit==="tsp"?"selected":""}>Cucharadita</option>
      </select></label>
    </div>
    <div id="liveMacroBox"></div>
    <label class="small muted">Agregar a
      <select id="qtyMeal" class="full-input" style="margin-top:5px">
        ${["Desayuno","Colación","Comida","Pre-entreno","Post-entreno","Cena"].map(m=>`<option ${m===aiMeal.value?"selected":""}>${m}</option>`).join("")}
      </select>
    </label>
    <button class="confirm-add" onclick="confirmQuantity()">✓ CONFIRMAR Y AGREGAR</button>`;
  qtyInput.addEventListener("input",updateLiveMacros);
  qtyUnit.addEventListener("change",updateLiveMacros);
  updateLiveMacros();
}
function updateLiveMacros(){
  if(!pendingFood||!document.getElementById("qtyInput"))return;
  const v=quantityValues();
  liveMacroBox.innerHTML=`<div class="live-macros">
    <div class="live-macro"><b>${Math.round(v.cal)}</b><span>kcal</span></div>
    <div class="live-macro"><b>${v.pro.toFixed(1)} g</b><span>proteína</span></div>
    <div class="live-macro"><b>${v.carb.toFixed(1)} g</b><span>carbohidratos</span></div>
    <div class="live-macro"><b>${v.fat.toFixed(1)} g</b><span>grasas</span></div>
  </div>`;
}
function confirmQuantity(){
  if(!pendingFood)return;
  const v=quantityValues();
  const d=day();
  d.items.push({...pendingFood,uid:Date.now(),meal:qtyMeal.value,serving:`${v.qty} ${unitName(v.unit)}`,cal:v.cal,pro:v.pro,carb:v.carb,fat:v.fat,fiber:(pendingFood.fiber||0)*(v.cal/(pendingFood.cal||1))});
  data.logs[today()]=d;save();closeQuantityModal();renderDashboard();toast("Cantidad agregada a "+qtyMeal.value);
}
function openModal(){modal.classList.add("show")}function closeModal(){modal.classList.remove("show")}
function openFoodModal(){openModal();modalContent.innerHTML=`<h2>Crear alimento</h2><div class="form-grid">${["Nombre","Porción","Calorías","Proteína","Carbohidratos","Grasas"].map((x,i)=>`<label>${x}<input id="m${i}" type="${i>1?"number":"text"}"></label>`).join("")}</div><button class="wide green-btn" onclick="saveCustomFood()">GUARDAR</button>`}
function saveCustomFood(){const f={id:"c"+Date.now(),name:m0.value,serving:m1.value||"1 porción",cal:+m2.value||0,pro:+m3.value||0,carb:+m4.value||0,fat:+m5.value||0,fiber:0};if(!f.name)return toast("Falta el nombre");data.foods.push(f);save();closeModal();openQuantityModal(f)}
function openExerciseModal(){openModal();modalContent.innerHTML=`<h2>Nuevo ejercicio</h2><div class="form-grid"><label>Ejercicio<input id="en" placeholder="Ej. Prensa de pierna"></label><label>Músculo<input id="em" placeholder="Pierna"></label></div><button class="wide green-btn" onclick="saveExercise()">GUARDAR</button>`}
function saveExercise(){if(!en.value)return toast("Falta el nombre");data.exercises.push({id:"e"+Date.now(),name:en.value,muscle:em.value||"General"});save();closeModal();renderTraining()}
function renderTraining(){exerciseSelect.innerHTML=data.exercises.map(e=>`<option value="${e.id}">${e.name} · ${e.muscle}</option>`).join("");exerciseLibrary.innerHTML=data.exercises.map(e=>`<div class="exercise-item"><span><b>${e.name}</b><small class="muted"> · ${e.muscle}</small></span><span class="muted small">${bestFor(e.id)}</span></div>`).join("");renderWorkout()}
function addExercise(){const e=data.exercises.find(x=>x.id===exerciseSelect.value);if(!e)return;workout.push({id:e.id,name:e.name,muscle:e.muscle,weight:+exWeight.value||0,reps:+exReps.value||0,sets:1});renderWorkout()}
function renderWorkout(){workoutRows.innerHTML=workout.length?workout.map((x,i)=>`<div class="work-row"><div><b>${x.name}</b><small class="muted">${x.muscle}</small></div><input type="number" value="${x.weight}" placeholder="kg" onchange="workout[${i}].weight=+this.value"><input type="number" value="${x.reps}" placeholder="reps" onchange="workout[${i}].reps=+this.value"><button class="delete" onclick="workout.splice(${i},1);renderWorkout()">×</button></div>`).join(""):`<p class="muted small">Agrega ejercicios a tu sesión.</p>`}
function volume(x){return x.weight*x.reps*x.sets}
function previous(id){for(let i=data.workouts.length-1;i>=0;i--){const x=data.workouts[i].exercises.find(y=>y.id===id);if(x)return x}return null}
function compare(x){const p=previous(x.id);if(!p)return["up","PRIMERA VEZ"];const a=volume(x),b=volume(p);if(a>b)return["up","MEJORASTE"];if(a<b)return["down","BAJASTE"];return["same","TE MANTUVISTE"]}
function finishWorkout(){if(!workout.length)return toast("Agrega ejercicios");const w={id:Date.now(),date:today(),name:workoutName.value||"Entrenamiento",duration:+workoutDuration.value||0,exercises:workout.map(x=>({...x}))};data.workouts.push(w);save();sessionResult.innerHTML=`<div class="glass-card"><span class="eyebrow">RESULTADO</span><h2>Sesión completada ✓</h2>${w.exercises.map(x=>{const c=compare(x);return `<div class="row" style="padding:9px 0;border-top:1px solid #ffffff0b"><span>${x.name}<small class="muted">${x.weight} kg · ${x.reps} reps</small></span><span class="status ${c[0]}">${c[1]}</span></div>`}).join("")}</div>`;workout=[];renderTraining();toast("Entrenamiento guardado")}
function bestFor(id){let a=data.workouts.flatMap(w=>w.exercises.filter(x=>x.id===id));if(!a.length)return"Sin registros";const b=a.reduce((m,x)=>Math.max(m,volume(x)),0);return b+" kg·reps"}
function renderProgress(){const total=data.workouts.length,improved=data.workouts.reduce((n,w)=>n+w.exercises.filter(x=>compare(x)[0]==="up"&&previous(x.id)).length,0),last=data.workouts.at(-1);progressSummary.innerHTML=`<div class="summary"><span class="muted small">SESIONES</span><b>${total}</b></div><div class="summary"><span class="muted small">MEJORAS</span><b>${improved}</b></div><div class="summary"><span class="muted small">ÚLTIMA</span><b>${last?new Date(last.date+"T12:00").toLocaleDateString("es-MX",{day:"2-digit",month:"short"}):"—"}</b></div>`;historyList.innerHTML=[...data.workouts].reverse().map(w=>`<div class="history"><div class="row"><b>${w.name}</b><span class="muted small">${new Date(w.date+"T12:00").toLocaleDateString("es-MX")}</span></div>${w.exercises.map(x=>{const c=compare(x);return `<div class="row" style="margin-top:9px"><span class="small">${x.name} · ${x.weight}kg × ${x.reps}</span><span class="status ${c[0]}">${c[1]}</span></div>`}).join("")}</div>`).join("")||`<div class="glass-card muted">Aún no tienes historial.</div>`}
function renderSettings(){goalForm.innerHTML=[["cal","Calorías"],["pro","Proteína (g)"],["carb","Carbohidratos (g)"],["fat","Grasas (g)"]].map(x=>`<label>${x[1]}<input id="g_${x[0]}" type="number" value="${data.goals[x[0]]}"></label>`).join("");aiEndpoint.value=data.endpoint||"";endpointStatus.textContent=data.endpoint?"Backend configurado":"Modo local activo"}
function saveGoals(){for(const k of["cal","pro","carb","fat"])data.goals[k]=+document.getElementById("g_"+k).value||0;save();renderDashboard();toast("Objetivos guardados")}
function saveEndpoint(){data.endpoint=aiEndpoint.value.trim();save();endpointStatus.textContent=data.endpoint?"Backend configurado":"Modo local activo";toast("Conexión guardada")}
function resetDay(){if(confirm("¿Borrar los alimentos de hoy?")){delete data.logs[today()];save();renderDashboard();toast("Día reiniciado")}}
function exportData(){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:"application/json"}));a.download="gymtrack-respaldo.json";a.click()}
function clearAll(){if(confirm("¿Borrar todos los datos?")){localStorage.removeItem(KEY);location.reload()}}
function openSettings(){showScreen("settings")}
renderDashboard();renderTraining();renderProgress();renderSettings();
