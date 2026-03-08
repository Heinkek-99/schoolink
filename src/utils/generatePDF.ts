import jsPDF from 'jspdf';
import { numberToWordsFr } from './numberToWords';

// Helper to get etablissement info from localStorage
function getEtablissement() {
  try {
    const saved = localStorage.getItem('etablissement');
    if (saved) return JSON.parse(saved);
  } catch {}
  return {
    nomEtablissement: 'SchoolFlow',
    adresse: '',
    ville: '',
    telephone: '',
    email: '',
    directeur: '',
    anneeScolaire: '',
    devise: 'La quête de l\'excellence',
  };
}

// ==========================================
// REÇU DE PAIEMENT — 3 per page (compact)
// ==========================================
export function generateReceiptPDF(data: {
  numeroRecu?: string;
  familleNom: string;
  eleveNom: string;
  eleveClasse: string;
  date: string;
  montant: number;
  mode: string;
  reference?: string;
  objet?: string;
  observation?: string;
  ventilations: { eleveNom: string; montant: number }[];
}) {
  const doc = new jsPDF();
  const etab = getEtablissement();
  const pw = doc.internal.pageSize.getWidth();
  const receiptNum = data.numeroRecu || String(Math.floor(Math.random() * 9999)).padStart(4, '0');

  // Draw 3 identical receipts per page
  const receiptHeight = 85;
  const startYs = [8, 100, 192];

  for (const startY of startYs) {
    // Outer border
    doc.setDrawColor(30, 80, 150);
    doc.setLineWidth(0.6);
    doc.rect(12, startY, pw - 24, receiptHeight);
    // Inner border
    doc.setLineWidth(0.2);
    doc.rect(14, startY + 2, pw - 28, receiptHeight - 4);

    const cx = pw / 2;
    let y = startY + 12;

    // Title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 80, 150);
    doc.text('Reçu de paiement', cx, y, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    y += 8;

    // N° de reçu line
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`N° de reçu : `, 20, y);
    doc.setFont('helvetica', 'bold');
    doc.text(receiptNum, 42, y);
    doc.text(data.date, pw - 20, y, { align: 'right' });
    y += 7;

    // "Je soussigné ... de l'établissement ..."
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const line1 = `Je soussigné ${etab.directeur || '...........................'} , de l'établissement ${etab.nomEtablissement || '...........................'}`;
    doc.text(line1, 20, y);
    y += 6;

    // "reconnais avoir reçu la somme de ... au titre de ..."
    const amountStr = new Intl.NumberFormat('fr-FR').format(data.montant);
    const line2 = `reconnais avoir reçu la somme de ${amountStr} FCFA (${numberToWordsFr(data.montant)} francs), au titre de ${data.objet || '...........................'}`;
    const splitLine2 = doc.splitTextToSize(line2, pw - 44);
    doc.text(splitLine2, 20, y);
    y += splitLine2.length * 4.5;

    // "payé par (moyen de paiement : ...) de Monsieur / Madame ..."
    const line3 = `payé par (moyen de paiement : ${data.mode || 'CB, chèque, virement ou espèces'}) de Monsieur / Madame ${data.familleNom}`;
    const splitLine3 = doc.splitTextToSize(line3, pw - 44);
    doc.text(splitLine3, 20, y);
    y += splitLine3.length * 4.5;

    // Eleve + Classe
    doc.text(`Élève : ${data.eleveNom}    —    Classe : ${data.eleveClasse}`, 20, y);
    y += 6;

    if (data.observation) {
      doc.setFont('helvetica', 'italic');
      doc.text(`Obs: ${data.observation}`, 20, y);
      y += 5;
    }

    // "Fait pour servir et valoir ce que de droit."
    y = startY + receiptHeight - 18;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text('Fait pour servir et valoir ce que de droit.', cx, y, { align: 'center' });

    // Signature line
    y += 7;
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(`${etab.ville || '...............'}, le ${data.date}`, cx, y, { align: 'center' });
  }

  // Dashed cut lines between receipts
  doc.setDrawColor(180, 180, 180);
  doc.setLineDashPattern([3, 3], 0);
  doc.setLineWidth(0.3);
  doc.line(5, 96, pw - 5, 96);
  doc.line(5, 188, pw - 5, 188);
  doc.setLineDashPattern([], 0);

  doc.save(`recu-${data.familleNom}-${data.date}.pdf`);
}

// ==========================================
// CARTE D'IDENTITÉ SCOLAIRE — exact template
// ==========================================
function drawStudentCard(doc: jsPDF, data: {
  nom: string;
  prenom: string;
  matricule: string;
  classe: string;
  anneeScolaire: string;
  dateNaissance?: string;
  lieuNaissance?: string;
  sexe?: string;
  photoUrl?: string;
}, offsetX: number, offsetY: number) {
  const etab = getEtablissement();
  // Card dimensions in mm (credit card ~85.6 x 54, but we use a slightly bigger layout for A4 printing)
  const cw = 90;
  const ch = 58;

  // White background + border
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.3);
  doc.rect(offsetX, offsetY, cw, ch, 'FD');

  // Top left: Cameroon flag colors (vertical stripes at left edge)
  // Green band top-left
  doc.setFillColor(0, 128, 0);
  doc.rect(offsetX, offsetY, 3, ch / 3, 'F');
  // Red band
  doc.setFillColor(206, 17, 38);
  doc.rect(offsetX, offsetY + ch / 3, 3, ch / 3, 'F');
  // Yellow band
  doc.setFillColor(252, 209, 22);
  doc.rect(offsetX, offsetY + (2 * ch / 3), 3, ch / 3, 'F');

  const x = offsetX + 5;
  let y = offsetY + 6;

  // "REPUBLIC OF CAMEROON" header
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('REPUBLIC OF CAMEROON', offsetX + cw / 2, y, { align: 'center' });
  y += 3.5;
  doc.setFontSize(5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(206, 17, 38);
  doc.text('RÉPUBLIQUE DU CAMEROUN', offsetX + cw / 2, y, { align: 'center' });
  y += 4;

  // "MINISTRY OF SECONDARY EDUCATION"
  doc.setFontSize(5.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('MINISTRY OF SECONDARY EDUCATION', offsetX + cw / 2, y, { align: 'center' });
  y += 3;
  doc.setFontSize(4.5);
  doc.setFont('helvetica', 'normal');
  doc.text('MINISTRE DES ENSEIGNEMENTS SECONDAIRES', offsetX + cw / 2, y, { align: 'center' });
  y += 5;

  // School name (right-aligned area, bold green)
  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 100, 0);
  const schoolName = (etab.nomEtablissement || 'SCHOOLFLOW').toUpperCase();
  doc.text(schoolName, offsetX + cw - 8, y, { align: 'right' });
  y += 3;

  // Devise
  doc.setFontSize(4);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(0, 100, 0);
  doc.text(etab.devise || '', offsetX + cw - 8, y, { align: 'right' });
  doc.setTextColor(0, 0, 0);
  y += 4;

  // Left side: student fields
  const labelX = x + 2;
  const valueX = x + 22;
  const lineH = 5;

  const fields = [
    { label: 'Nom / Name', value: data.nom.toUpperCase() },
    { label: 'Prenom /\nSurname', value: data.prenom },
    { label: 'Né(e) le /\nborn on', value: data.dateNaissance || '-' },
    { label: 'A / At', value: data.lieuNaissance || '-' },
    { label: 'Classe / Class', value: data.classe },
    { label: 'Matricule', value: data.matricule },
    { label: 'Validité', value: data.anneeScolaire },
  ];

  fields.forEach((f, i) => {
    const fy = y + i * lineH;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(4);
    doc.text(f.label, labelX, fy);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.text(f.value, valueX, fy);
  });

  // Right side: photo placeholder
  const photoX = offsetX + cw - 26;
  const photoY = y + 2;
  const photoW = 18;
  const photoH = 22;

  doc.setDrawColor(150, 150, 150);
  doc.setLineWidth(0.3);
  doc.rect(photoX, photoY, photoW, photoH);
  doc.setFontSize(5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(180, 180, 180);
  doc.text('PHOTO', photoX + photoW / 2, photoY + photoH / 2, { align: 'center' });
  doc.setTextColor(0, 0, 0);

  // Cachet + contact info under photo
  doc.setFontSize(3);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(150, 150, 150);
  doc.text('[Cachet]', photoX + photoW / 2, photoY + photoH + 4, { align: 'center' });
  doc.setTextColor(0, 0, 0);

  if (etab.telephone || etab.ville) {
    doc.setFontSize(3.5);
    doc.setFont('helvetica', 'normal');
    if (etab.ville) doc.text(`BP: ${etab.adresse || ''} ${etab.ville}`, photoX + photoW / 2, photoY + photoH + 8, { align: 'center' });
    if (etab.telephone) doc.text(`Tel: ${etab.telephone}`, photoX + photoW / 2, photoY + photoH + 11, { align: 'center' });
  }

  // Vertical text left edge: "CARTE IDENTITE SCOLAIRE" + "SCHOOL IDENTITY CARD"
  doc.setFontSize(3.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(206, 17, 38);
  doc.text('CARTE IDENTITE SCOLAIRE', offsetX + 5, offsetY + ch - 2, { angle: 90 });
  doc.setTextColor(0, 100, 0);
  doc.text('SCHOOL IDENTITY CARD', offsetX + 3, offsetY + ch - 2, { angle: 90 });
  doc.setTextColor(0, 0, 0);

  // Bottom NB line
  doc.setFontSize(3.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(206, 17, 38);
  doc.text('NB : Cette carte est strictement personnelle et devra être présentée à toute réquisition', offsetX + cw / 2, offsetY + ch - 2, { align: 'center' });
  doc.setTextColor(0, 0, 0);
}

export function generateStudentCardPDF(data: {
  nom: string;
  prenom: string;
  matricule: string;
  classe: string;
  anneeScolaire: string;
  dateNaissance?: string;
  lieuNaissance?: string;
  sexe?: string;
  photoUrl?: string;
}) {
  // Single card on A4 page
  const doc = new jsPDF({ format: 'a4', unit: 'mm', orientation: 'portrait' });
  drawStudentCard(doc, data, 10, 10);
  doc.save(`carte-${data.matricule}.pdf`);
}

// ==========================================
// BATCH PRINT ALL STUDENT CARDS (multiple per page)
// ==========================================
export function generateAllStudentCardsPDF(students: {
  nom: string;
  prenom: string;
  matricule: string;
  classe: string;
  anneeScolaire: string;
  dateNaissance?: string;
  lieuNaissance?: string;
  sexe?: string;
  photoUrl?: string;
}[]) {
  const doc = new jsPDF({ format: 'a4', unit: 'mm', orientation: 'portrait' });
  const cardW = 92;
  const cardH = 60;
  const marginX = 10;
  const marginY = 10;
  const gapX = 4;
  const gapY = 4;
  const cols = 2;
  const rows = 4; // 8 cards per page

  students.forEach((student, i) => {
    const pageIndex = Math.floor(i / (cols * rows));
    const posOnPage = i % (cols * rows);
    const col = posOnPage % cols;
    const row = Math.floor(posOnPage / cols);

    if (i > 0 && posOnPage === 0) {
      doc.addPage();
    }

    const x = marginX + col * (cardW + gapX);
    const y = marginY + row * (cardH + gapY);
    drawStudentCard(doc, student, x, y);
  });

  doc.save(`cartes-eleves-batch.pdf`);
}

// ==========================================
// BULLETIN FINANCIER PDF
// ==========================================
export function generateBulletinFinancierPDF(data: {
  nom: string;
  prenom: string;
  matricule: string;
  classe: string;
  anneeScolaire: string;
  famille: string;
  totalDu: number;
  totalPaye: number;
  solde: number;
  frais: { libelle: string; montant: number; montantPaye: number; echeance?: string; periode?: string }[];
}) {
  const doc = new jsPDF();
  const etab = getEtablissement();
  const pw = doc.internal.pageSize.getWidth();

  doc.setDrawColor(30, 58, 95);
  doc.setLineWidth(0.8);
  doc.rect(10, 10, pw - 20, 277);

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(etab.nomEtablissement || 'SchoolFlow', pw / 2, 25, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const addr = [etab.adresse, etab.ville].filter(Boolean).join(', ');
  if (addr) doc.text(addr, pw / 2, 31, { align: 'center' });
  const contact = [etab.telephone ? `Tél: ${etab.telephone}` : '', etab.email ? `Email: ${etab.email}` : ''].filter(Boolean).join(' | ');
  if (contact) doc.text(contact, pw / 2, 36, { align: 'center' });

  doc.setDrawColor(30, 58, 95);
  doc.setLineWidth(0.5);
  doc.line(20, 40, pw - 20, 40);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('BULLETIN FINANCIER', pw / 2, 50, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Année scolaire : ${data.anneeScolaire}`, pw / 2, 56, { align: 'center' });

  let y = 66;
  doc.setFontSize(10);
  const info = [
    ['Nom et prénom :', `${data.prenom} ${data.nom}`],
    ['Matricule :', data.matricule],
    ['Classe :', data.classe],
    ['Famille :', data.famille],
  ];
  info.forEach(([label, value]) => {
    doc.setFont('helvetica', 'normal');
    doc.text(label, 20, y);
    doc.setFont('helvetica', 'bold');
    doc.text(value, 60, y);
    y += 7;
  });

  y += 5;
  const colX = [20, 75, 105, 135, 165];
  doc.setFillColor(30, 58, 95);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.rect(20, y - 5, pw - 40, 8, 'F');
  doc.text('Frais', colX[0] + 3, y);
  doc.text('Montant', colX[1] + 3, y);
  doc.text('Payé', colX[2] + 3, y);
  doc.text('Solde', colX[3] + 3, y);
  doc.text('Échéance', colX[4] + 3, y);
  doc.setTextColor(0, 0, 0);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const fmt = (n: number) => new Intl.NumberFormat('fr-FR').format(n);

  data.frais.forEach((f) => {
    const solde = f.montant - f.montantPaye;
    doc.text(f.libelle, colX[0] + 3, y);
    doc.text(`${fmt(f.montant)}`, colX[1] + 3, y);
    doc.text(`${fmt(f.montantPaye)}`, colX[2] + 3, y);
    doc.text(`${fmt(solde)}`, colX[3] + 3, y);
    doc.text(f.echeance ? new Date(f.echeance).toLocaleDateString('fr-FR') : '-', colX[4] + 3, y);
    doc.setDrawColor(220, 220, 220);
    doc.line(20, y + 2, pw - 20, y + 2);
    y += 7;
  });

  y += 3;
  doc.setLineWidth(0.5);
  doc.setDrawColor(30, 58, 95);
  doc.line(20, y - 2, pw - 20, y - 2);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Total dû :', 20, y + 5);
  doc.text(`${fmt(data.totalDu)} FCFA`, pw - 25, y + 5, { align: 'right' });

  doc.setTextColor(0, 128, 0);
  doc.text('Total payé :', 20, y + 12);
  doc.text(`${fmt(data.totalPaye)} FCFA`, pw - 25, y + 12, { align: 'right' });

  const soldeColor = data.solde > 0 ? [206, 17, 38] : [0, 128, 0];
  doc.setTextColor(soldeColor[0], soldeColor[1], soldeColor[2]);
  doc.setFontSize(11);
  doc.text('Solde restant :', 20, y + 20);
  doc.text(`${fmt(data.solde)} FCFA`, pw - 25, y + 20, { align: 'right' });
  doc.setTextColor(0, 0, 0);

  const taux = data.totalDu > 0 ? Math.round((data.totalPaye / data.totalDu) * 100) : 0;
  y += 30;
  doc.setFillColor(245, 245, 250);
  doc.roundedRect(20, y - 4, pw - 40, 12, 2, 2, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Taux de recouvrement : ${taux}%`, pw / 2, y + 3, { align: 'center' });

  const sigY = Math.max(y + 25, 240);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Fait à ${etab.ville || '...........'}, le ${new Date().toLocaleDateString('fr-FR')}`, pw / 2, sigY, { align: 'center' });
  doc.setFontSize(9);
  doc.text('Le Directeur / La Directrice', pw / 2, sigY + 8, { align: 'center' });
  doc.setDrawColor(150, 150, 150);
  doc.setLineDashPattern([2, 2], 0);
  doc.line(pw / 2 - 25, sigY + 22, pw / 2 + 25, sigY + 22);
  doc.setLineDashPattern([], 0);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.text('[Signature et cachet]', pw / 2, sigY + 26, { align: 'center' });

  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  doc.text('Document généré automatiquement — Bulletin financier officiel', pw / 2, 282, { align: 'center' });
  doc.setTextColor(0, 0, 0);

  doc.save(`bulletin-financier-${data.matricule}.pdf`);
}

// ==========================================
// CERTIFICAT DE SCOLARITÉ PDF
// ==========================================
export function generateCertificatScolaritePDF(data: {
  nom: string;
  prenom: string;
  matricule: string;
  classe: string;
  anneeScolaire: string;
  dateNaissance?: string;
  lieuNaissance?: string;
  sexe?: string;
}) {
  const doc = new jsPDF();
  const etab = getEtablissement();
  const pw = doc.internal.pageSize.getWidth();

  doc.setDrawColor(0, 100, 0);
  doc.setLineWidth(1.2);
  doc.rect(8, 8, pw - 16, 281);
  doc.setDrawColor(206, 17, 38);
  doc.setLineWidth(0.4);
  doc.rect(10, 10, pw - 20, 277);
  doc.setDrawColor(252, 209, 22);
  doc.setLineWidth(0.3);
  doc.rect(12, 12, pw - 24, 273);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 100, 0);
  doc.text('RÉPUBLIQUE DU CAMEROUN', pw / 2, 25, { align: 'center' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 100, 100);
  doc.text('Paix - Travail - Patrie', pw / 2, 30, { align: 'center' });
  doc.setTextColor(0, 0, 0);

  doc.setDrawColor(0, 100, 0);
  doc.setLineWidth(0.5);
  doc.line(50, 34, pw - 50, 34);

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 100, 0);
  doc.text((etab.nomEtablissement || 'SCHOOLFLOW').toUpperCase(), pw / 2, 44, { align: 'center' });
  doc.setTextColor(0, 0, 0);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const addr = [etab.adresse, etab.ville].filter(Boolean).join(', ');
  if (addr) doc.text(addr, pw / 2, 50, { align: 'center' });
  const contactLine = [etab.telephone ? `Tél: ${etab.telephone}` : '', etab.email || ''].filter(Boolean).join(' — ');
  if (contactLine) doc.text(contactLine, pw / 2, 55, { align: 'center' });

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 95);
  doc.text('CERTIFICAT DE SCOLARITÉ', pw / 2, 75, { align: 'center' });
  doc.setTextColor(0, 0, 0);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.text(`Année scolaire ${data.anneeScolaire}`, pw / 2, 82, { align: 'center' });

  let y = 100;
  const isMale = data.sexe === '1' || data.sexe === 'M' || data.sexe === 'Masculin';
  const article = isMale ? '' : 'e';
  const pronoun = isMale ? 'M.' : 'Mlle';

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  const directorTitle = etab.directeur ? `${etab.directeur}, ` : 'Le Directeur / La Directrice de l\'établissement ';
  doc.text(`Je soussigné${isMale ? '' : 'e'}, ${directorTitle}`, pw / 2, y, { align: 'center' });
  y += 8;
  doc.text(`${(etab.nomEtablissement || 'SchoolFlow').toUpperCase()},`, pw / 2, y, { align: 'center' });
  y += 12;
  doc.text('atteste que :', pw / 2, y, { align: 'center' });
  y += 15;

  doc.setFillColor(245, 248, 255);
  doc.setDrawColor(30, 58, 95);
  doc.setLineWidth(0.3);
  doc.roundedRect(30, y - 6, pw - 60, 50, 3, 3, 'FD');

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`${pronoun} ${data.prenom} ${data.nom.toUpperCase()}`, pw / 2, y + 5, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  if (data.dateNaissance) {
    doc.text(`Né${article} le ${new Date(data.dateNaissance).toLocaleDateString('fr-FR')}${data.lieuNaissance ? ` à ${data.lieuNaissance}` : ''}`, pw / 2, y + 14, { align: 'center' });
  }
  doc.text(`Matricule : ${data.matricule}`, pw / 2, y + 23, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`est régulièrement inscrit${article} en classe de ${data.classe}`, pw / 2, y + 34, { align: 'center' });

  y += 60;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`pour l'année scolaire ${data.anneeScolaire}.`, pw / 2, y, { align: 'center' });
  y += 12;
  doc.text('En foi de quoi, le présent certificat lui est délivré pour servir et valoir ce que de droit.', pw / 2, y, { align: 'center' });

  y += 25;
  doc.setFontSize(10);
  doc.text(`Fait à ${etab.ville || '...........'}, le ${new Date().toLocaleDateString('fr-FR')}`, pw - 30, y, { align: 'right' });
  y += 12;
  doc.setFont('helvetica', 'bold');
  doc.text('Le Directeur / La Directrice', pw - 30, y, { align: 'right' });

  doc.setDrawColor(150, 150, 150);
  doc.setLineDashPattern([2, 2], 0);
  doc.line(pw - 60, y + 18, pw - 20, y + 18);
  doc.setLineDashPattern([], 0);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(150, 150, 150);
  doc.text('[Signature et cachet]', pw - 40, y + 23, { align: 'center' });
  doc.setTextColor(0, 0, 0);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(120, 120, 120);
  doc.text('NB : Ce certificat n\'est valable que pour l\'année scolaire mentionnée ci-dessus.', pw / 2, 280, { align: 'center' });
  doc.setTextColor(0, 0, 0);

  doc.save(`certificat-scolarite-${data.matricule}.pdf`);
}
