
// ===== AI NUTRITION LAYER =====
// GitHub Pages is static: no private API key is embedded here.
// Set window.GYMTRACK_AI_ENDPOINT to your secure backend endpoint if available.
// Expected POST JSON: { "query": "...", "quantity": 100, "unit": "g" }
// Expected response JSON: {name, serving, cal, pro, carb, fat, fiber, confidence}
window.GYMTRACK_AI_ENDPOINT = window.GYMTRACK_AI_ENDPOINT || "";

function unitLabel(u){
  return ({g:"g",ml:"ml",portion:"porción",piece:"pieza",cup:"taza",tbsp:"cda",tsp:"cdta",serving:"ración"})[u]||u;
}
function normalizeAiFood(x){
  return {id:"ai"+Date.now(),name:x.name||"Alimento analizado",serving:x.serving||"1 porción",
    cal:+x.cal||0,pro:+x.pro||0,carb:+x.carb||0,fat:+x.fat||0,fiber:+x.fiber||0};
}
function heuristicFood(q){
  const s=q.toLowerCase();
  const dict=[
    {keys:["pechuga","pollo"],name:"Pechuga de pollo",cal:165,pro:31,carb:0,fat:3.6,fiber:0},
    {keys:["arroz"],name:"Arroz blanco cocido",cal:130,pro:2.7,carb:28,fat:.3,fiber:.4},
    {keys:["huevo"],name:"Huevo entero",cal:72,pro:6.3,carb:.4,fat:4.8,fiber:0},
    {keys:["avena"],name:"Avena",cal:389,pro:16.9,carb:66.3,fat:6.9,fiber:10.6},
    {keys:["platano","plátano"],name:"Plátano",cal:105,pro:1.3,carb:27,fat:.4,fiber:3.1},
    {keys:["atún","atun"],name:"Atún en agua",cal:116,pro:25.5,carb:0,fat:.8,fiber:0},
    {keys:["aguacate"],name:"Aguacate",cal:160,pro:2,carb:8.5,fat:14.7,fiber:6.7},
    {keys:["tortilla"],name:"Tortilla de maíz",cal:52,pro:1.4,carb:10.7,fat:.7,fiber:1.4}
  ];
  return dict.find(f=>f.keys.some(k=>s.includes(k)));
}
function scaleFood(f, qty, unit){
  const factors={g:qty/100,ml:qty/100,portion:qty,piece:qty,cup:qty,tbsp:qty/16,tsp:qty/48,serving:qty};
  const k=factors[unit]||1;
  return {...f,id:"ai"+Date.now(),serving:`${qty} ${unitLabel(unit)}`,cal:f.cal*k,pro:f.pro*k,carb:f.carb*k,fat:f.fat*k,fiber:f.fiber*k};
}
async function askFoodAI(){
  const q=document.getElementById("foodSearch").value.trim();
  if(!q)return toast("Escribe un alimento o platillo");
  const unit=document.getElementById("foodUnit").value;
  const qty=+document.getElementById("foodQty").value||1;
  const box=document.getElementById("aiResult");
  box.innerHTML='<div class="ai-result"><span class="muted">✦ Analizando macros...</span></div>';
  let food=null, source="estimación local";
  if(window.GYMTRACK_AI_ENDPOINT){
    try{
      const r=await fetch(window.GYMTRACK_AI_ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query:q,quantity:qty,unit})});
      if(!r.ok)throw new Error("AI endpoint");
      food=normalizeAiFood(await r.json()); source="IA";
    }catch(e){console.warn(e)}
  }
  if(!food){
    const h=heuristicFood(q);
    if(h) food=scaleFood(h,qty,unit);
    else {
      const found=allFoods().find(f=>f.name.toLowerCase().includes(q.toLowerCase()));
      if(found) food=scaleFood(found,qty,unit);
    }
  }
  if(!food){
    box.innerHTML='<div class="ai-result"><strong>No pude identificarlo con suficiente precisión.</strong><p class="muted small">Puedes crear el alimento manualmente o conectar un endpoint de IA para analizar platillos.</p></div>';
    return;
  }
  box.innerHTML=`<div class="ai-result">
    <div class="row"><div><strong>✦ ${food.name}</strong><div class="small muted">${food.serving} · ${source}</div></div><button class="primary" onclick='addAnalyzedFood(${JSON.stringify(food)})'>Agregar</button></div>
    <div class="ai-result-grid">
      <div class="ai-stat"><b>${food.cal.toFixed(0)}</b><span>kcal</span></div>
      <div class="ai-stat"><b>${food.pro.toFixed(1)} g</b><span>proteína</span></div>
      <div class="ai-stat"><b>${food.carb.toFixed(1)} g</b><span>carbohidratos</span></div>
      <div class="ai-stat"><b>${food.fat.toFixed(1)} g</b><span>grasas</span></div>
      <div class="ai-stat"><b>${food.fiber.toFixed(1)} g</b><span>fibra</span></div>
    </div>
  </div>`;
}
function addAnalyzedFood(f){
  let meal=prompt("¿En qué comida? Desayuno, Comida, Cena, Colación, Pre-entreno o Post-entreno","Comida")||"Comida";
  let d=getDay();d.items.push({...f,uid:Date.now(),meal});data.logs[todayKey()]=d;save();renderNutrition();toast("Platillo agregado");
}

const KEY="gymtrack_v1";
const baseFoods=[
["Pechuga de pollo","100 g",165,31,0,3.6,0],["Huevo entero","1 pieza",72,6.3,.4,4.8,0],
["Arroz blanco cocido","100 g",130,2.7,28,.3,.4],["Avena","100 g",389,16.9,66.3,6.9,10.6],
["Plátano","1 pieza",105,1.3,27,.4,3.1],["Atún en agua","100 g",116,25.5,0,.8,0],
["Carne de res magra","100 g",217,26,0,12,0],["Salmón","100 g",208,20,0,13,0],
["Tortilla de maíz","1 pieza",52,1.4,10.7,.7,1.4],["Frijoles cocidos","100 g",127,8.7,22.8,.5,7.4],
["Yogur griego natural","100 g",59,10.3,3.6,.4,0],["Leche descremada","250 ml",90,8.5,12.5,0,0],
["Manzana","1 pieza",95,.5,25,.3,4.4],["Aguacate","100 g",160,2,8.5,14.7,6.7],
["Pan integral","2 rebanadas",140,6,24,2,4],["Proteína whey","1 scoop",120,24,3,2,0]
].map((x,i)=>({id:"b"+i,name:x[0],serving:x[1],cal:x[2],pro:x[3],carb:x[4],fat:x[5],fiber:x[6]}));

let data=JSON.parse(localStorage.getItem(KEY)||"null")||{goals:{cal:2500,pro:180,carb:280,fat:70,fiber:30},foods:[],logs:{},exercises:[{id:"e1",name:"Press de banca",muscle:"Pecho"},{id:"e2",name:"Sentadilla",muscle:"Pierna"},{id:"e3",name:"Peso muerto",muscle:"Espalda"},{id:"e4",name:"Remo con barra",muscle:"Espalda"},{id:"e5",name:"Press militar",muscle:"Hombro"},{id:"e6",name:"Curl de bíceps",muscle:"Bíceps"},{id:"e7",name:"Extensión de tríceps",muscle:"Tríceps"}],workouts:[]};
let currentWorkout=[];
const todayKey=()=>new Date().toISOString().slice(0,10);
function save(){localStorage.setItem(KEY,JSON.stringify(data))}
function toast(t){let x=document.getElementById("toast");x.textContent=t;x.classList.add("show");setTimeout(()=>x.classList.remove("show"),1800)}
document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));b.classList.add("active");document.querySelectorAll(".view").forEach(x=>x.classList.remove("active"));document.getElementById(b.dataset.tab).classList.add("active");if(b.dataset.tab==="history")renderHistory();if(b.dataset.tab==="training")renderExerciseSelect();if(b.dataset.tab==="settings")renderGoals()});
document.getElementById("today").textContent=new Date().toLocaleDateString("es-MX",{weekday:"long",day:"numeric",month:"long"});
document.getElementById("workoutDate").value=todayKey();

function allFoods(){return [...baseFoods,...data.foods]}
function getDay(){return data.logs[todayKey()]||{items:[]}}
function totals(){return getDay().items.reduce((a,x)=>{a.cal+=x.cal;a.pro+=x.pro;a.carb+=x.carb;a.fat+=x.fat;a.fiber+=x.fiber;return a},{cal:0,pro:0,carb:0,fat:0,fiber:0})}
function pct(v,g){return Math.min(100,Math.round((v/(g||1))*100))}
function macroCards(){let t=totals(), items=[["Calorías","cal","kcal",""],["Proteína","pro","g","green"],["Carbohidratos","carb","g","orange"],["Grasas","fat","g","blue"]];document.getElementById("macroCards").innerHTML=items.map(([n,k,u,c])=>`<div class="card"><h3>${n}</h3><div class="metric">${t[k].toFixed(k==="cal"?0:1)} <span class="small muted">/ ${data.goals[k]} ${u}</span></div><div class="progress"><div class="bar ${c}" style="width:${pct(t[k],data.goals[k])}%"></div></div><span class="small muted">${pct(t[k],data.goals[k])}% completado</span></div>`).join("")}
function searchFoods(){let q=document.getElementById("foodSearch").value.toLowerCase().trim(), arr=allFoods().filter(f=>!q||f.name.toLowerCase().includes(q)).slice(0,12);document.getElementById("foodResults").innerHTML=arr.length?arr.map(f=>`<div class="foodresult"><div><strong>${f.name}</strong><div class="tags"><span class="tag">${f.serving}</span><span class="tag">${f.cal} kcal</span><span class="tag">${f.pro}g P</span><span class="tag">${f.carb}g C</span><span class="tag">${f.fat}g G</span></div></div><button class="primary" onclick='addFood(${JSON.stringify(f.id)})'>Agregar</button></div>`).join(""):`<div class="empty">No encontré ese alimento. Puedes crearlo con tus propios valores.</div>`}
function addFood(id){let f=allFoods().find(x=>x.id===id);if(!f)return;let meal=prompt("¿En qué comida? Escribe: Desayuno, Comida, Cena, Colación, Pre-entreno o Post-entreno","Comida")||"Comida";let d=getDay();d.items.push({...f,uid:Date.now(),meal});data.logs[todayKey()]=d;save();renderNutrition();toast(`${f.name} agregado`)}
function removeFood(uid){let d=getDay();d.items=d.items.filter(x=>x.uid!==uid);data.logs[todayKey()]=d;save();renderNutrition()}
function renderNutrition(){macroCards();searchFoods();let meals=["Desayuno","Colación","Comida","Pre-entreno","Post-entreno","Cena"],d=getDay();document.getElementById("meals").innerHTML=meals.map(m=>{let items=d.items.filter(x=>x.meal===m);return `<div class="meal"><h3><span>${m}</span><span class="muted small">${items.reduce((a,x)=>a+x.cal,0).toFixed(0)} kcal</span></h3><div class="mealbox">${items.length?items.map(x=>`<div class="foodline"><div><strong>${x.name}</strong><div class="macroline">${x.serving} · ${x.cal} kcal · P ${x.pro}g · C ${x.carb}g · G ${x.fat}g</div></div><button class="mini" onclick="removeFood(${x.uid})">🗑️</button></div>`).join(""):`<div class="empty">Sin alimentos registrados</div>`}</div></div>`}).join("")}
function openFoodModal(){document.getElementById("foodModal").classList.add("show")}
function saveFood(){let f={id:"c"+Date.now(),name:fName.value.trim(),serving:fServing.value||"1 porción",cal:+fCal.value||0,pro:+fPro.value||0,carb:+fCarb.value||0,fat:+fFat.value||0,fiber:+fFiber.value||0};if(!f.name)return toast("Escribe un nombre");data.foods.push(f);save();closeModal("foodModal");renderNutrition();toast("Alimento guardado")}
function openExerciseModal(){document.getElementById("exerciseModal").classList.add("show")}
function saveExercise(){let n=eName.value.trim();if(!n)return toast("Escribe el ejercicio");data.exercises.push({id:"e"+Date.now(),name:n,muscle:eMuscle.value||"General"});save();closeModal("exerciseModal");renderExerciseSelect();toast("Ejercicio agregado")}
function closeModal(id){document.getElementById(id).classList.remove("show")}
function renderExerciseSelect(){exerciseSelect.innerHTML=data.exercises.map(e=>`<option value="${e.id}">${e.name} · ${e.muscle}</option>`).join("")}
function addExerciseToWorkout(){let e=data.exercises.find(x=>x.id===exerciseSelect.value);if(!e)return;currentWorkout.push({id:e.id,name:e.name,muscle:e.muscle,sets:+sets.value||1,reps:+reps.value||1,weight:+weight.value||0});renderWorkoutRows()}
function renderWorkoutRows(){workoutExercises.innerHTML=currentWorkout.length?currentWorkout.map((x,i)=>`<div class="exercise-row"><div><strong>${x.name}</strong><div class="small muted">${x.muscle}</div></div><input type="number" min="1" value="${x.sets}" onchange="currentWorkout[${i}].sets=+this.value"><input type="number" min="1" value="${x.reps}" onchange="currentWorkout[${i}].reps=+this.value"><input class="weight" type="number" min="0" step=".5" value="${x.weight}" onchange="currentWorkout[${i}].weight=+this.value"><button class="mini" onclick="currentWorkout.splice(${i},1);renderWorkoutRows()">✕</button></div>`).join(""):`<div class="empty">Agrega los ejercicios que hiciste hoy.</div>`}
function exerciseVolume(x){return x.sets*x.reps*(x.weight||1)}
function previousExercise(id){for(let i=data.workouts.length-1;i>=0;i--){let x=data.workouts[i].exercises.find(e=>e.id===id);if(x)return x}return null}
function compare(x){let p=previousExercise(x.id);if(!p)return {cls:"neutral",txt:"Primera vez"};let a=exerciseVolume(x),b=exerciseVolume(p);if(a>b*1.001)return{cls:"improved",txt:"↑ Mejoraste"};if(a<b*.999)return{cls:"declined",txt:"↓ Bajaste"};return{cls:"same",txt:"→ Te mantuviste"}}
function finishWorkout(){if(!currentWorkout.length)return toast("Agrega al menos un ejercicio");let w={id:Date.now(),date:workoutDate.value||todayKey(),name:workoutName.value||"Entrenamiento",duration:+workoutDuration.value||0,notes:workoutNotes.value||"",exercises:currentWorkout.map(x=>({...x}))};data.workouts.push(w);save();let results=w.exercises.map(x=>{let c=compare(x);return `<div class="row" style="padding:10px 0;border-bottom:1px solid var(--line)"><span><strong>${x.name}</strong><div class="small muted">${x.sets} series × ${x.reps} reps${x.weight?` × ${x.weight} kg`:""}</div></span><span class="status ${c.cls}">${c.txt}</span></div>`}).join("");lastComparison.innerHTML=`<div class="card"><h3>📊 Resultado de la sesión</h3>${results}</div>`;currentWorkout=[];renderWorkoutRows();toast("Entrenamiento guardado")}
function renderHistory(){if(!data.workouts.length){historyList.innerHTML='<div class="empty">Todavía no hay entrenamientos terminados.</div>';return}historyList.innerHTML=[...data.workouts].reverse().map(w=>`<div class="card section"><div class="row"><div><h3>${w.name}</h3><span class="muted small">${new Date(w.date+"T12:00").toLocaleDateString("es-MX")} · ${w.duration||0} min</span></div><span class="tag">${w.exercises.length} ejercicios</span></div>${w.exercises.map(x=>{let c=compare(x);return `<div class="row" style="padding:8px 0;border-top:1px solid var(--line)"><span>${x.name}<br><span class="small muted">${x.sets} × ${x.reps}${x.weight?" · "+x.weight+" kg":""}</span></span><span class="status ${c.cls}">${c.txt}</span></div>`}).join("")}</div>`).join("")}
function renderGoals(){let names=[["cal","Calorías","kcal"],["pro","Proteína","g"],["carb","Carbohidratos","g"],["fat","Grasas","g"],["fiber","Fibra","g"]];goalForm.innerHTML=names.map(x=>`<div class="field"><label>${x[1]} (${x[2]})</label><input id="goal_${x[0]}" type="number" value="${data.goals[x[0]]}"></div>`).join("")}
function saveGoals(){["cal","pro","carb","fat","fiber"].forEach(k=>data.goals[k]=+document.getElementById("goal_"+k).value||0);save();renderNutrition();toast("Objetivos actualizados")}
function resetDay(){if(confirm("¿Reiniciar todos los alimentos de hoy?")){delete data.logs[todayKey()];save();renderNutrition();toast("Día reiniciado")}}
function clearAll(){if(confirm("Esto borrará objetivos, alimentos personalizados y entrenamientos. ¿Continuar?")){localStorage.removeItem(KEY);location.reload()}}
function exportData(){let blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="gymtrack-respaldo.json";a.click();URL.revokeObjectURL(a.href)}
function openSettings(){document.querySelector('[data-tab="settings"]').click()}
renderNutrition();renderExerciseSelect();renderWorkoutRows();renderGoals();
