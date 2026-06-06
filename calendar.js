'use strict';


const CLE = 'taskify_taches';

function charger() {
  try { return JSON.parse(localStorage.getItem(CLE) || '{}'); }
  catch { return {}; }
}
function sauver() { localStorage.setItem(CLE, JSON.stringify(donnees)); }


let donnees     = charger();
let dateChoisie = null;

const auj    = new Date();
let annee    = auj.getFullYear();
let mois     = auj.getMonth();

const MOIS_NOMS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const JOURS_NOMS = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];


const elMoisLabel    = document.getElementById('moisLabel');
const elCalGrille    = document.getElementById('calGrille');
const elEtatVide     = document.getElementById('etatVide');
const elPanel        = document.getElementById('panel');
const elPanelTitre   = document.getElementById('panelTitre');
const elPanelSurtitre= document.getElementById('panelSurtitre');
const elStats        = document.getElementById('stats');
const elBarreFond    = document.getElementById('barreFond');
const elBarreRemplie = document.getElementById('barreRemplie');
const elListe        = document.getElementById('liste');
const elInput        = document.getElementById('inputTache');
const elBtnAjouter   = document.getElementById('btnAjouter');


function pad(n) { return String(n).padStart(2, '0'); }
function dateStr(d) { return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }


function rendreCal() {
  elMoisLabel.textContent = `${MOIS_NOMS[mois]} ${annee}`;

  const entetes = Array.from(elCalGrille.querySelectorAll('.cal-entete'));
  elCalGrille.innerHTML = '';
  entetes.forEach(e => elCalGrille.appendChild(e));

  const aujStr     = dateStr(auj);
  let   premierDow = new Date(annee, mois, 1).getDay();
  premierDow = premierDow === 0 ? 6 : premierDow - 1;
  const nbJours    = new Date(annee, mois + 1, 0).getDate();

  for (let i = 0; i < premierDow; i++) {
    const v = document.createElement('div');
    v.className = 'cal-jour vide';
    elCalGrille.appendChild(v);
  }

  for (let j = 1; j <= nbJours; j++) {
    const ds     = `${annee}-${pad(mois+1)}-${pad(j)}`;
    const taches = donnees[ds] || [];

    const cel = document.createElement('div');
    cel.className = 'cal-jour';
    if (ds === aujStr)      cel.classList.add('aujourd-hui');
    if (ds === dateChoisie) cel.classList.add('selectionne');

    cel.appendChild(document.createTextNode(j));

    if (taches.length > 0) {
      const pt = document.createElement('div');
      pt.className = 'cal-point';
      cel.appendChild(pt);
    }

    cel.addEventListener('click', () => selectionnerJour(ds));
    elCalGrille.appendChild(cel);
  }
}


function selectionnerJour(ds) {
  dateChoisie = ds;
  rendreCal();

  const [a, m2, j] = ds.split('-');
  const obj = new Date(+a, +m2 - 1, +j);

  elPanelSurtitre.textContent = JOURS_NOMS[obj.getDay()];
  elPanelTitre.textContent    = `${parseInt(j)} ${MOIS_NOMS[+m2-1]} ${a}`;

  elEtatVide.style.display = 'none';
  elPanel.classList.add('visible');

  rendreListe(ds);
}


function rendreListe(ds) {
  const taches   = donnees[ds] || [];
  const nbFaites = taches.filter(t => t.faite).length;
  const nbTotal  = taches.length;

  // Stats
  elStats.innerHTML = `
    <span class="stats-nb">${nbFaites}/${nbTotal}</span>
    <span class="stats-label">Faites</span>
  `;

  // Barre de progression
  if (nbTotal > 0) {
    elBarreFond.style.display = 'block';
    elBarreRemplie.style.width = Math.round((nbFaites / nbTotal) * 100) + '%';
  } else {
    elBarreFond.style.display = 'none';
  }

  elListe.innerHTML = '';

  if (nbTotal === 0) {
    elListe.innerHTML = '<li class="liste-vide">Aucune tâche — ajoutes-en une ci-dessus.</li>';
    return;
  }

  taches.forEach((tache, i) => {
    const li = document.createElement('li');
    li.className = 'tache' + (tache.faite ? ' faite' : '');

    const check = document.createElement('div');
    check.className = 'checkbox' + (tache.faite ? ' coche' : '');
    check.textContent = '✓';
    check.addEventListener('click', () => { donnees[ds][i].faite = !donnees[ds][i].faite; sauver(); rendreListe(ds); rendreCal(); });

    const nom = document.createElement('span');
    nom.className = 'tache-nom' + (tache.faite ? ' barre' : '');
    nom.textContent = tache.nom;

    const suppr = document.createElement('button');
    suppr.className = 'btn-suppr';
    suppr.textContent = '✕';
    suppr.addEventListener('click', () => { donnees[ds].splice(i, 1); if (!donnees[ds].length) delete donnees[ds]; sauver(); rendreListe(ds); rendreCal(); });

    li.append(check, nom, suppr);
    elListe.appendChild(li);
  });
}


function ajouter() {
  if (!dateChoisie) return;
  const val = elInput.value.trim();
  if (!val) return;
  if (!donnees[dateChoisie]) donnees[dateChoisie] = [];
  donnees[dateChoisie].push({ nom: val, faite: false });
  sauver();
  elInput.value = '';
  elInput.focus();
  rendreListe(dateChoisie);
  rendreCal();
}


elBtnAjouter.addEventListener('click', ajouter);
elInput.addEventListener('keydown', e => { if (e.key === 'Enter') ajouter(); });
document.getElementById('btnPrev').addEventListener('click', () => { mois--; if (mois < 0) { mois = 11; annee--; } rendreCal(); });
document.getElementById('btnNext').addEventListener('click', () => { mois++; if (mois > 11) { mois = 0; annee++; } rendreCal(); });


rendreCal();
selectionnerJour(dateStr(auj));
