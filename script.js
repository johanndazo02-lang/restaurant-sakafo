// =========================================================
// RÉGLAGES
// =========================================================

// Adresse Formspree qui reçoit les réservations.
// Pour un vrai client : créer un formulaire Formspree à SON adresse email
// et remplacer l'identifiant ci-dessous.
const FORMSPREE_URL = "https://formspree.io/f/myeebpyv";

// Horaires d'ouverture, par jour de la semaine.
// 0 = dimanche, 1 = lundi … 6 = samedi (c'est l'ordre de JavaScript).
// null = fermé. Les heures sont en heures « décimales » : 22 = 22h00.
const HORAIRES = {
  0: { ouverture: 11, fermeture: 16 },   // dimanche
  1: null,                               // lundi : fermé
  2: { ouverture: 11, fermeture: 22 },
  3: { ouverture: 11, fermeture: 22 },
  4: { ouverture: 11, fermeture: 22 },
  5: { ouverture: 11, fermeture: 23 },
  6: { ouverture: 11, fermeture: 23 },   // samedi
};

const NOMS_JOURS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];

// =========================================================
// OUTILS
// =========================================================

// L'heure de Madagascar (UTC+3), quel que soit le pays du visiteur.
// Un touriste en France doit voir si le restaurant est ouvert À TANA.
function maintenantMadagascar() {
  const ici = new Date();
  // getTimezoneOffset() = décalage du visiteur avec UTC, en minutes
  // (+180 minutes = les 3 heures de Madagascar)
  const minutesUTC = ici.getTime() + ici.getTimezoneOffset() * 60000;
  return new Date(minutesUTC + 180 * 60000);
}

// 22 → "22h00", 11.5 → "11h30"
function formaterHeure(heureDecimale) {
  const h = Math.floor(heureDecimale);
  const m = Math.round((heureDecimale - h) * 60);
  return h + "h" + String(m).padStart(2, "0");
}

// 22000 → "22 000 Ar"
function formaterPrix(prix) {
  return prix.toLocaleString("fr-FR") + " Ar";
}

// Date → "2026-11-06" (le format des champs <input type="date">)
function dateVersTexte(date) {
  const a = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const j = String(date.getDate()).padStart(2, "0");
  return a + "-" + m + "-" + j;
}

// =========================================================
// MENU BURGER
// =========================================================
const burger = document.querySelector(".burger");
const nav = document.querySelector(".nav");

function fermerMenu() {
  nav.classList.remove("ouvert");
  burger.classList.remove("ouvert");
  burger.setAttribute("aria-expanded", "false");
}

burger.addEventListener("click", () => {
  nav.classList.toggle("ouvert");
  burger.classList.toggle("ouvert");
  burger.setAttribute("aria-expanded", nav.classList.contains("ouvert"));
});

document.querySelectorAll(".nav a").forEach((lien) => {
  lien.addEventListener("click", fermerMenu);
});

// =========================================================
// EN-TÊTE QUI CHANGE AU DÉFILEMENT
// =========================================================
const header = document.querySelector(".header");

function majHeader() {
  // window.scrollY = de combien de pixels la page a défilé
  header.classList.toggle("defile", window.scrollY > 30);
}

window.addEventListener("scroll", majHeader, { passive: true });
majHeader();

// =========================================================
// BADGE « OUVERT MAINTENANT / FERMÉ » + JOUR DU TABLEAU
// =========================================================
const statut = document.querySelector("#statut-ouverture");

function majStatutOuverture() {
  const maintenant = maintenantMadagascar();
  const jour = maintenant.getDay();
  const heure = maintenant.getHours() + maintenant.getMinutes() / 60;
  const horaire = HORAIRES[jour];

  // Ouvert si on est entre l'heure d'ouverture et l'heure de fermeture
  if (horaire && heure >= horaire.ouverture && heure < horaire.fermeture) {
    statut.textContent = "Ouvert maintenant · jusqu'à " + formaterHeure(horaire.fermeture);
    statut.classList.add("ouvert");
    return;
  }

  statut.classList.remove("ouvert");

  // Fermé : on cherche la prochaine ouverture (aujourd'hui plus tard, ou un des jours suivants)
  if (horaire && heure < horaire.ouverture) {
    statut.textContent = "Fermé · ouvre aujourd'hui à " + formaterHeure(horaire.ouverture);
    return;
  }

  for (let decalage = 1; decalage <= 7; decalage++) {
    const jourSuivant = (jour + decalage) % 7;     // % 7 : après samedi (6), on revient à dimanche (0)
    const prochain = HORAIRES[jourSuivant];
    if (prochain) {
      const quand = decalage === 1 ? "demain" : NOMS_JOURS[jourSuivant];
      statut.textContent = "Fermé · ouvre " + quand + " à " + formaterHeure(prochain.ouverture);
      return;
    }
  }
}

majStatutOuverture();
setInterval(majStatutOuverture, 60000);   // on revérifie chaque minute

// Met en valeur la ligne du jour dans le tableau des horaires
const ligneDuJour = document.querySelector('#horaires tr[data-jour="' + maintenantMadagascar().getDay() + '"]');
if (ligneDuJour) {
  ligneDuJour.classList.add("aujourdhui");
}

// =========================================================
// LA CARTE : les plats sont des DONNÉES, le HTML est généré
// =========================================================
// Pour ajouter un plat, il suffit d'ajouter un objet dans ce tableau :
// le JS crée la carte tout seul.
const PLATS = [
  // Entrées
  { nom: "Sambos (4 pièces)", description: "Petits beignets triangulaires farcis à la viande de zébu épicée.", prix: 6000, categorie: "entrees", icone: "🥟" },
  { nom: "Nems malgaches (4 pièces)", description: "Nems croustillants au porc et aux légumes, sauce pimentée.", prix: 7000, categorie: "entrees", icone: "🥢" },
  { nom: "Soupe chinoise", description: "Bouillon parfumé, nouilles, légumes et émincé de porc.", prix: 9000, categorie: "entrees", icone: "🍜" },
  { nom: "Lasary voatabia", description: "Salade de tomates, oignons et piment frais, relevée au citron.", prix: 4000, categorie: "entrees", icone: "🥗", badge: "Végétarien" },

  // Plats
  { nom: "Romazava", description: "Le plat national : bouillon de zébu aux brèdes mafana et aux herbes.", prix: 22000, categorie: "plats", icone: "🍲", badge: "Spécialité" },
  { nom: "Ravitoto sy henakisoa", description: "Feuilles de manioc pilées, mijotées longuement avec du porc.", prix: 20000, categorie: "plats", icone: "🥬", badge: "Spécialité" },
  { nom: "Akoho sy voanio", description: "Poulet mijoté au lait de coco, gingembre et tomates.", prix: 24000, categorie: "plats", icone: "🥥" },
  { nom: "Henan'omby ritra", description: "Zébu mijoté jusqu'à ce que la sauce soit réduite et fondante.", prix: 25000, categorie: "plats", icone: "🥩" },
  { nom: "Trondro gasy", description: "Poisson d'eau douce frit, sauce tomate maison.", prix: 21000, categorie: "plats", icone: "🐟" },
  { nom: "Vary amin'anana", description: "Riz cuit avec des brèdes et des légumes, plat doux et réconfortant.", prix: 12000, categorie: "plats", icone: "🍚", badge: "Végétarien" },

  // Desserts
  { nom: "Mofo akondro", description: "Beignets de banane dorés, saupoudrés de sucre.", prix: 5000, categorie: "desserts", icone: "🍌" },
  { nom: "Koba", description: "Gâteau de farine de riz, cacahuètes et banane, cuit dans une feuille.", prix: 6000, categorie: "desserts", icone: "🥜" },
  { nom: "Mofo gasy (4 pièces)", description: "Petites galettes de riz moelleuses, légèrement sucrées.", prix: 4000, categorie: "desserts", icone: "🫓" },
  { nom: "Bonbons coco", description: "Douceurs à la noix de coco caramélisée.", prix: 3000, categorie: "desserts", icone: "🍬" },

  // Boissons
  { nom: "Ranon'apango", description: "L'eau de riz grillé, servie chaude, comme dans chaque famille malgache.", prix: 2000, categorie: "boissons", icone: "🍵" },
  { nom: "Jus de fruits frais", description: "Litchi, corossol ou mangue, selon la saison.", prix: 6000, categorie: "boissons", icone: "🧃" },
  { nom: "Café gasy", description: "Café de Madagascar, servi noir et sucré.", prix: 3000, categorie: "boissons", icone: "☕" },
  { nom: "Thé à la citronnelle", description: "Infusion de citronnelle fraîche, chaude ou glacée.", prix: 3000, categorie: "boissons", icone: "🌿" },
];

const listePlats = document.querySelector("#liste-plats");
const boutonsFiltre = document.querySelectorAll(".filtre");

// Crée le HTML d'UNE carte à partir d'UN objet plat
function creerCartePlat(plat) {
  const carte = document.createElement("article");
  carte.classList.add("plat");

  // Le badge n'existe que pour certains plats : sinon, chaîne vide
  const badge = plat.badge ? '<span class="plat-badge">' + plat.badge + "</span>" : "";

  carte.innerHTML = `
    <div class="plat-icone" aria-hidden="true">${plat.icone}</div>
    <div class="plat-texte">
      <div class="plat-entete">
        <h3>${plat.nom}</h3>
        <span class="plat-prix">${formaterPrix(plat.prix)}</span>
      </div>
      <p class="plat-description">${plat.description}</p>
      ${badge}
    </div>
  `;
  return carte;
}

// Affiche les plats d'une catégorie (ou tous)
function afficherPlats(categorie) {
  listePlats.innerHTML = "";   // on vide la liste

  // filter() garde seulement les plats qui répondent "true"
  const platsAffiches = PLATS.filter((plat) => categorie === "tout" || plat.categorie === categorie);

  platsAffiches.forEach((plat) => {
    listePlats.appendChild(creerCartePlat(plat));
  });
}

// Clic sur un bouton de filtre
boutonsFiltre.forEach((bouton) => {
  bouton.addEventListener("click", () => {
    // dataset.categorie = la valeur de l'attribut data-categorie du bouton
    const categorie = bouton.dataset.categorie;

    boutonsFiltre.forEach((b) => b.classList.remove("actif"));
    bouton.classList.add("actif");

    afficherPlats(categorie);
  });
});

afficherPlats("tout");

// =========================================================
// CARROUSEL D'AVIS CLIENTS
// =========================================================
// Avis d'exemple : le restaurant est fictif (site de démonstration).
const AVIS = [
  { texte: "Le meilleur romazava de Tana ! On se croirait chez sa grand-mère.", auteur: "Hery R.", note: 5 },
  { texte: "Accueil chaleureux et plats généreux. Le ravitoto est une merveille.", auteur: "Claire M., de passage à Antananarivo", note: 5 },
  { texte: "Parfait pour découvrir la cuisine malgache. Les prix sont très raisonnables.", auteur: "Thomas L.", note: 4 },
  { texte: "On y vient en famille chaque dimanche. Les mofo akondro sont addictifs !", auteur: "Fanja A.", note: 5 },
];

const zoneAvis = document.querySelector("#avis-actuel");
const zonePoints = document.querySelector("#points-avis");
let indexAvis = 0;          // l'avis affiché en ce moment
let minuteur = null;        // le « chronomètre » du défilement automatique

// Crée un petit point par avis (pour savoir où on en est et y aller directement)
AVIS.forEach((avis, index) => {
  const point = document.createElement("button");
  point.classList.add("point");
  point.setAttribute("aria-label", "Afficher l'avis " + (index + 1));
  point.addEventListener("click", () => {
    afficherAvis(index);
    relancerMinuteur();
  });
  zonePoints.appendChild(point);
});

const points = zonePoints.querySelectorAll(".point");

function afficherAvis(index) {
  // Le « modulo » fait boucler : après le dernier avis, on revient au premier
  indexAvis = (index + AVIS.length) % AVIS.length;
  const avis = AVIS[indexAvis];

  // "★".repeat(5) → "★★★★★"
  zoneAvis.innerHTML = `
    <p class="avis-etoiles" aria-label="${avis.note} étoiles sur 5">${"★".repeat(avis.note)}${"☆".repeat(5 - avis.note)}</p>
    <p class="avis-texte">« ${avis.texte} »</p>
    <p class="avis-auteur">— ${avis.auteur}</p>
  `;

  // Relance l'animation d'apparition à chaque changement
  zoneAvis.style.animation = "none";
  zoneAvis.offsetHeight;    // force le navigateur à « prendre en compte » le changement
  zoneAvis.style.animation = "";

  points.forEach((point, i) => point.classList.toggle("actif", i === indexAvis));
}

function demarrerMinuteur() {
  // setInterval répète une action toutes les X millisecondes (6000 = 6 secondes)
  minuteur = setInterval(() => afficherAvis(indexAvis + 1), 6000);
}

function arreterMinuteur() {
  clearInterval(minuteur);
}

function relancerMinuteur() {
  arreterMinuteur();
  demarrerMinuteur();
}

document.querySelector(".carrousel-fleche.precedent").addEventListener("click", () => {
  afficherAvis(indexAvis - 1);
  relancerMinuteur();
});

document.querySelector(".carrousel-fleche.suivant").addEventListener("click", () => {
  afficherAvis(indexAvis + 1);
  relancerMinuteur();
});

// Pause quand la souris est sur le carrousel (le temps de lire)
const carrousel = document.querySelector(".carrousel");
carrousel.addEventListener("mouseenter", arreterMinuteur);
carrousel.addEventListener("mouseleave", demarrerMinuteur);

afficherAvis(0);
demarrerMinuteur();

// =========================================================
// FORMULAIRE DE RÉSERVATION
// =========================================================
const formulaire = document.querySelector("#reservation");
const champNom = document.querySelector("#nom");
const champTelephone = document.querySelector("#telephone");
const champDate = document.querySelector("#date");
const champHeure = document.querySelector("#heure");
const champPersonnes = document.querySelector("#personnes");
const messageFormulaire = document.querySelector(".formulaire-message");

// On ne peut pas choisir une date passée dans le calendrier
champDate.min = dateVersTexte(maintenantMadagascar());

function afficherErreur(champ, texte) {
  document.querySelector("#erreur-" + champ.id).textContent = texte;
  champ.classList.toggle("champ-invalide", texte !== "");
}

function verifierReservation() {
  let valide = true;
  const aujourdhui = dateVersTexte(maintenantMadagascar());

  // --- Nom ---
  if (champNom.value.trim().length < 2) {
    afficherErreur(champNom, "Indiquez votre nom.");
    valide = false;
  } else {
    afficherErreur(champNom, "");
  }

  // --- Téléphone malgache : 03X XX XXX XX ou +261 3X XX XXX XX ---
  const telephone = champTelephone.value.replace(/[\s.-]/g, "");   // on enlève espaces, points, tirets
  if (!/^(\+261|0)3[2-9]\d{7}$/.test(telephone)) {
    afficherErreur(champTelephone, "Numéro invalide (exemple : 034 12 345 67).");
    valide = false;
  } else {
    afficherErreur(champTelephone, "");
  }

  // --- Date : remplie, pas dans le passé, pas un jour de fermeture ---
  const date = champDate.value;     // ex. "2026-11-14"
  let horaireDuJour = null;
  if (!date) {
    afficherErreur(champDate, "Choisissez une date.");
    valide = false;
  } else if (date < aujourdhui) {
    // Les dates au format AAAA-MM-JJ se comparent comme du texte
    afficherErreur(champDate, "Cette date est déjà passée.");
    valide = false;
  } else {
    // "T12:00" évite les surprises de fuseau horaire en lisant la date
    const jour = new Date(date + "T12:00").getDay();
    horaireDuJour = HORAIRES[jour];
    if (!horaireDuJour) {
      afficherErreur(champDate, "Nous sommes fermés le " + NOMS_JOURS[jour] + ".");
      valide = false;
    } else {
      afficherErreur(champDate, "");
    }
  }

  // --- Heure : pendant les horaires, au plus tard 1 h avant la fermeture ---
  if (!champHeure.value) {
    afficherErreur(champHeure, "Choisissez une heure.");
    valide = false;
  } else if (horaireDuJour) {
    const [h, m] = champHeure.value.split(":").map(Number);   // "19:30" → [19, 30]
    const heure = h + m / 60;
    const derniereHeure = horaireDuJour.fermeture - 1;
    if (heure < horaireDuJour.ouverture || heure > derniereHeure) {
      afficherErreur(champHeure, "Entre " + formaterHeure(horaireDuJour.ouverture) + " et " + formaterHeure(derniereHeure) + " ce jour-là.");
      valide = false;
    } else if (date === aujourdhui && heure <= maintenantMadagascar().getHours() + maintenantMadagascar().getMinutes() / 60) {
      afficherErreur(champHeure, "Cette heure est déjà passée.");
      valide = false;
    } else {
      afficherErreur(champHeure, "");
    }
  } else {
    afficherErreur(champHeure, "");
  }

  // --- Nombre de personnes : entre 1 et 20 ---
  const personnes = Number(champPersonnes.value);
  if (!Number.isInteger(personnes) || personnes < 1 || personnes > 20) {
    afficherErreur(champPersonnes, "Entre 1 et 20 personnes (au-delà, appelez-nous).");
    valide = false;
  } else {
    afficherErreur(champPersonnes, "");
  }

  return valide;
}

formulaire.addEventListener("submit", async (event) => {
  event.preventDefault();
  messageFormulaire.textContent = "";
  messageFormulaire.classList.remove("echec");

  if (!verifierReservation()) {
    return;
  }

  const bouton = formulaire.querySelector('button[type="submit"]');
  bouton.disabled = true;
  bouton.textContent = "Envoi en cours…";

  try {
    const reponse = await fetch(FORMSPREE_URL, {
      method: "POST",
      body: new FormData(formulaire),
      headers: { Accept: "application/json" },
    });

    if (reponse.ok) {
      messageFormulaire.textContent = "✓ Merci ! Votre demande est envoyée. Nous vous appelons pour confirmer la table.";
      formulaire.reset();
    } else {
      messageFormulaire.textContent = "Désolé, l'envoi a échoué. Réessayez ou réservez sur WhatsApp.";
      messageFormulaire.classList.add("echec");
    }
  } catch (erreur) {
    messageFormulaire.textContent = "Impossible d'envoyer : vérifiez votre connexion Internet.";
    messageFormulaire.classList.add("echec");
  }

  bouton.disabled = false;
  bouton.textContent = "Envoyer la réservation";
});

// =========================================================
// ANNÉE DU PIED DE PAGE (toujours à jour)
// =========================================================
document.querySelector("#annee").textContent = new Date().getFullYear();
