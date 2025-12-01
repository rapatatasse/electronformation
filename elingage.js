const HAUTEUR_FIXE = 1; // Hauteur fixe en mètres

function afficherAlerteAngle(angle, elementAlerte) {
    if (angle !== null && angle > 120) {
        elementAlerte.style.display = 'block';
    } else {
        elementAlerte.style.display = 'none';
    }
}

// Calcule l'ordonnée à partir de l'angle (avec hauteur fixe = 1m)
function calculerOrdonneeDepuisAngle(angleDeg) {
    if (isNaN(angleDeg) || angleDeg <= 0 || angleDeg >= 180) return null;
    const angleRad = (angleDeg * Math.PI) / 180;
    return HAUTEUR_FIXE * Math.tan(angleRad / 2);
}

// Calcule l'angle à partir de l'ordonnée (avec hauteur fixe = 1m)
function calculerAngleDepuisOrdonnee(ordonnee) {
    if (isNaN(ordonnee) || ordonnee <= 0) return null;
    const angleRad = 2 * Math.atan(ordonnee / HAUTEUR_FIXE);
    return (angleRad * 180) / Math.PI;
}

// Met à jour l'ordonnée quand l'angle change
function mettreAJourOrdonneeDepuisAngle() {
    const alpha2Input = document.getElementById('alpha2');
    const ordonneesInput = document.getElementById('ordonnees');
    const angle = parseFloat(alpha2Input.value);
    const ordonnee = calculerOrdonneeDepuisAngle(angle);
    if (ordonnee !== null) {
        ordonneesInput.value = ordonnee.toFixed(3);
    }
    calculerTous();
}

// Met à jour l'angle quand l'ordonnée change
function mettreAJourAngleDepuisOrdonnee() {
    const alpha2Input = document.getElementById('alpha2');
    const ordonneesInput = document.getElementById('ordonnees');
    const ordonnee = parseFloat(ordonneesInput.value);
    const angle = calculerAngleDepuisOrdonnee(ordonnee);
    if (angle !== null) {
        alpha2Input.value = angle.toFixed(1);
    }
    calculerTous();
}

function calculerF(P, alphaDeg) {
    if (alphaDeg === 0) {
        return P; // 1 brin : pas d'effet d'angle
    }

    if (isNaN(alphaDeg) || alphaDeg <= 0 || alphaDeg >= 180) {
        return null;
    }

    const alphaRad = (alphaDeg * Math.PI) / 180;
    const K = 1 / (2 * Math.cos(alphaRad / 2));
    const F = (P * K) / 2;

    return { F, K };
}

function formatResultat1Brin(P) {
    return `F = P = <strong>${P.toFixed(2)} t</strong>`;
}

function formatResultatMultiBrins(P, alphaDeg, result) {
    if (!result) {
        return 'Angle invalide (doit être entre 0 et 180°).';
    }
    const { F, K } = result;
    return `F = P × K / 2<br>
P = ${P.toFixed(2)} t<br>
α = ${alphaDeg.toFixed(1)}° → K = 1 / (2 × cos(α / 2)) = ${K.toFixed(3)}<br>
⇒ F = ${P.toFixed(2)} × ${K.toFixed(3)} / 2 = <strong>${F.toFixed(2)} t</strong>`;
}

function calculerTous() {
    const chargeInput = document.getElementById('chargeInput');
    const alpha2Input = document.getElementById('alpha2');
    const alpha34Input = document.getElementById('alpha34');
    const resultat1Div = document.getElementById('resultat1');
    const resultat2Div = document.getElementById('resultat2');
    const resultat34Div = document.getElementById('resultat34');
    const resultat1TonneDiv = document.getElementById('resultat1Tonne');
    const resultat2TonneDiv = document.getElementById('resultat2Tonne');
    const resultat34TonneDiv = document.getElementById('resultat34Tonne');
    const alerteAngleDiv = document.getElementById('alerteAngle');

    const P = parseFloat(chargeInput.value);

    if (isNaN(P) || P <= 0) {
        resultat1Div.innerHTML = 'Veuillez saisir une charge P valide (en tonnes).';
        resultat2Div.innerHTML = 'Veuillez saisir une charge P valide (en tonnes).';
        resultat34Div.innerHTML = 'Veuillez saisir une charge P valide (en tonnes).';
        if (resultat1TonneDiv) resultat1TonneDiv.textContent = '';
        if (resultat2TonneDiv) resultat2TonneDiv.textContent = '';
        if (resultat34TonneDiv) resultat34TonneDiv.textContent = '';
        alerteAngleDiv.style.display = 'none';
        return;
    }

    const alpha2 = parseFloat(alpha2Input.value);
   

    afficherAlerteAngle(isNaN(alpha2) ? null : alpha2, alerteAngleDiv);

    // 1 brin : F = P
    resultat1Div.innerHTML = formatResultat1Brin(P);
    if (resultat1TonneDiv) {
        resultat1TonneDiv.textContent = `${P.toFixed(2)} t`;
    }

    // 2 brins
    const res2 = calculerF(P, alpha2);
    resultat2Div.innerHTML = formatResultatMultiBrins(P, alpha2, res2);
    if (resultat2TonneDiv) {
        if (res2 && res2.F !== undefined) {
            resultat2TonneDiv.textContent = `${res2.F.toFixed(2)} t`;
        } else {
            resultat2TonneDiv.textContent = '';
        }
    }

    // 3-4 brins
    const res34 = calculerF(P, alpha2);
    resultat34Div.innerHTML = formatResultatMultiBrins(P, alpha2, res34);
    if (resultat34TonneDiv) {
        if (res34 && res34.F !== undefined) {
            resultat34TonneDiv.textContent = `${res34.F.toFixed(2)} t`;
        } else {
            resultat34TonneDiv.textContent = '';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const chargeInput = document.getElementById('chargeInput');
    const alpha2Input = document.getElementById('alpha2');
    const ordonneesInput = document.getElementById('ordonnees');

    if (!chargeInput || !alpha2Input || !ordonneesInput) return;

    // Initialiser l'ordonnée à partir de l'angle initial
    mettreAJourOrdonneeDepuisAngle();

    // Quand l'angle change, mettre à jour l'ordonnée
    alpha2Input.addEventListener('input', mettreAJourOrdonneeDepuisAngle);

    // Quand l'ordonnée change, mettre à jour l'angle
    ordonneesInput.addEventListener('input', mettreAJourAngleDepuisOrdonnee);

    // Quand la charge change, recalculer
    chargeInput.addEventListener('input', calculerTous);
});
