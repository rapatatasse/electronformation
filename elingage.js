function afficherAlerteAngle(angle2, angle34, elementAlerte) {
    if ((angle2 !== null && angle2 > 120) || (angle34 !== null && angle34 > 120)) {
        elementAlerte.style.display = 'block';
    } else {
        elementAlerte.style.display = 'none';
    }
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
    const alpha34 = parseFloat(alpha34Input.value);

    afficherAlerteAngle(isNaN(alpha2) ? null : alpha2, isNaN(alpha34) ? null : alpha34, alerteAngleDiv);

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
    const res34 = calculerF(P, alpha34);
    resultat34Div.innerHTML = formatResultatMultiBrins(P, alpha34, res34);
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
    const alpha34Input = document.getElementById('alpha34');

    if (!chargeInput || !alpha2Input || !alpha34Input) return;

    const recalculSiChargeValide = () => {
        const P = parseFloat(chargeInput.value);
        if (!isNaN(P) && P > 0) {
            calculerTous();
        }
    };

    alpha2Input.addEventListener('input', recalculSiChargeValide);
    alpha34Input.addEventListener('input', recalculSiChargeValide);
    chargeInput.addEventListener('input', recalculSiChargeValide);
});
