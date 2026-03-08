import jsPDF from 'jspdf';
import { numberToWordsFr } from './numberToWords';

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
// REÇU DE PAIEMENT — format A6 (105mm x 148mm)
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
  soldeDu?: number;
  montantDuCompte?: number;
  ventilations: { eleveNom: string; montant: number }[];
}) {
  // A6 landscape: 148mm x 105mm
  const doc = new jsPDF({ format: [148, 105], unit: 'mm', orientation: 'landscape' });
  const etab = getEtablissement();
  const pw = 148;
  const ph = 105;
  const receiptNum = data.numeroRecu || String(Math.floor(Math.random() * 9999)).padStart(4, '0');
  const amountStr = new Intl.NumberFormat('fr-FR').format(data.montant);

  // Get current user info
  let userName = '';
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      userName = user.nom ? `${user.prenom || ''} ${user.nom}`.trim() : (user.email || '');
    }
  } catch {}

  // Outer border
  doc.setDrawColor(60, 40, 120);
  doc.setLineWidth(0.6);
  doc.rect(4, 4, pw - 8, ph - 8);

  let y = 12;

  // ─── Header: REÇU ... Date ... N° ───
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bolditalic');
  doc.setTextColor(60, 40, 120);
  doc.text('REÇU', 8, y);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text('Date', 50, y);
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.2);
  doc.line(58, y + 0.5, 88, y + 0.5);
  doc.setFont('helvetica', 'bold');
  doc.text(data.date, 60, y);

  doc.setFont('helvetica', 'normal');
  doc.text('N°.', 95, y);
  doc.line(100, y + 0.5, pw - 8, y + 0.5);
  doc.setFont('helvetica', 'bold');
  doc.text(receiptNum, 102, y);

  y += 9;

  // ─── Reçu de : [Nom Famille]    Montant [box] ───
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('Reçu de :', 8, y);
  doc.setFont('helvetica', 'normal');
  doc.text(data.familleNom, 24, y);
  doc.line(24, y + 0.5, 85, y + 0.5);

  // Montant box
  doc.setFont('helvetica', 'bold');
  doc.text('Montant', 95, y);
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.4);
  doc.rect(110, y - 4, 32, 6);
  doc.setFontSize(8);
  doc.text(`${amountStr} FCFA`, 112, y - 0.5);

  y += 7;

  // ─── Montant en lettres ───
  doc.setFontSize(6);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 100, 100);
  doc.text('Montant', 8, y);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  const wordsStr = numberToWordsFr(data.montant) + ' francs CFA';
  doc.text(wordsStr.charAt(0).toUpperCase() + wordsStr.slice(1), 22, y);
  doc.setLineWidth(0.15);
  doc.line(22, y + 0.5, pw - 8, y + 0.5);

  y += 7;

  // ─── Pour le paiement de [objet] ───
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('Pour le paiement de', 8, y);
  doc.setFont('helvetica', 'normal');
  doc.text(data.objet || '...........................', 40, y);
  doc.line(40, y + 0.5, pw - 8, y + 0.5);

  y += 7;

  // ─── Ventilation par élève ───
  if (data.ventilations.length > 0) {
    doc.setFontSize(6);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(80, 80, 80);
    doc.text('Détail par élève :', 10, y);
    doc.setTextColor(0, 0, 0);
    y += 4;
    doc.setFont('helvetica', 'normal');
    data.ventilations.forEach((v) => {
      doc.text(`• ${v.eleveNom}`, 14, y);
      doc.text(`${new Intl.NumberFormat('fr-FR').format(v.montant)} FCFA`, 75, y);
      y += 3.5;
    });
    y += 1;
  }

  // ─── de [date] à [date]        Payé par [ ] Espèces ... ───
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.text('de', 10, y);
  doc.line(16, y + 0.5, 33, y + 0.5);
  doc.text('à', 35, y);
  doc.line(39, y + 0.5, 56, y + 0.5);

  // Payment mode checkboxes (right side)
  const modes = [
    { label: 'Espèces', key: 'Espèces' },
    { label: 'Chèque No.', key: 'Chèque' },
    { label: 'Virement', key: 'Virement' },
    { label: 'Mobile Money', key: 'Mobile Money' },
  ];
  let modeY = y - 1;
  doc.setFontSize(6);
  doc.text('Payé par', 75, modeY + 1);
  modeY += 1;
  modes.forEach((m) => {
    doc.text('[', 90, modeY);
    if (data.mode === m.key) {
      doc.setFont('helvetica', 'bold');
      doc.text('X', 91.5, modeY);
      doc.setFont('helvetica', 'normal');
    }
    doc.text(`] ${m.label}`, 93, modeY);
    if (m.key === 'Chèque' && data.reference) {
      doc.text(data.reference, 113, modeY);
    }
    modeY += 3.5;
  });

  y = Math.max(y + 6, modeY + 1);

  // ─── Reçu par: user name ───
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Reçu par', 8, y);
  doc.setFont('helvetica', 'normal');
  doc.text(userName || 'x', 22, y);
  doc.line(22, y + 0.5, 60, y + 0.5);
  y += 4;

  // Nom, Addresse, Tel, Email
  doc.setFontSize(6);
  doc.setFont('helvetica', 'italic');
  doc.text('Nom', 10, y);
  doc.setFont('helvetica', 'normal');
  doc.text(userName || etab.directeur || etab.nomEtablissement || '', 20, y);
  y += 3.5;
  doc.setFont('helvetica', 'italic');
  doc.text('Addresse', 10, y);
  doc.setFont('helvetica', 'normal');
  doc.text([etab.adresse, etab.ville].filter(Boolean).join(', ') || '', 24, y);
  y += 5;
  doc.setFont('helvetica', 'italic');
  doc.text('Tel', 22, y);
  doc.setFont('helvetica', 'normal');
  doc.text(etab.telephone || '', 30, y);

  // ─── Right side box: Montant du compte / Ce paiement / Solde dû ───
  const boxX = 110;
  const boxY = y - 12;
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);

  // Table with 3 rows
  const rowH = 7;
  doc.rect(boxX, boxY, 82, rowH * 3);
  doc.line(boxX, boxY + rowH, boxX + 82, boxY + rowH);
  doc.line(boxX, boxY + rowH * 2, boxX + 82, boxY + rowH * 2);
  doc.line(boxX + 42, boxY, boxX + 42, boxY + rowH * 3);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Montant du compte', boxX + 3, boxY + 5);
  doc.text('Ce paiement', boxX + 3, boxY + rowH + 5);
  doc.text('Solde dû', boxX + 3, boxY + rowH * 2 + 5);

  doc.setFont('helvetica', 'bold');
  const fmt = (n: number) => new Intl.NumberFormat('fr-FR').format(n) + ' FCFA';
  doc.text(data.montantDuCompte !== undefined ? fmt(data.montantDuCompte) : '-', boxX + 44, boxY + 5);
  doc.text(fmt(data.montant), boxX + 44, boxY + rowH + 5);
  doc.text(data.soldeDu !== undefined ? fmt(data.soldeDu) : '-', boxX + 44, boxY + rowH * 2 + 5);

  if (data.observation) {
    y += 8;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text(`Obs: ${data.observation}`, 18, y);
  }

  doc.save(`recu-${data.familleNom}-${data.date}.pdf`);
}

// ==========================================
// CARTE D'IDENTITÉ SCOLAIRE — format carte crédit
// ==========================================
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
  // Credit card size: 85.6mm x 54mm
  const doc = new jsPDF({ format: [85.6, 54], unit: 'mm', orientation: 'landscape' });
  const etab = getEtablissement();
  const w = 85.6;
  const h = 54;

  // White background + border
  doc.setDrawColor(0, 100, 0);
  doc.setLineWidth(0.5);
  doc.rect(1, 1, w - 2, h - 2);
  doc.setLineWidth(0.2);
  doc.rect(2, 2, w - 4, h - 4);

  // Top band - green
  doc.setFillColor(0, 128, 0);
  doc.rect(2, 2, w - 4, 8, 'F');

  // Red stripe
  doc.setFillColor(206, 17, 38);
  doc.rect(2, 10, w - 4, 1.5, 'F');

  // Yellow stripe
  doc.setFillColor(252, 209, 22);
  doc.rect(2, 11.5, w - 4, 1.5, 'F');

  // School name in green band
  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('REPUBLIC OF CAMEROON', w / 2, 5.5, { align: 'center' });
  doc.setFontSize(4.5);
  doc.setFont('helvetica', 'italic');
  doc.text('RÉPUBLIQUE DU CAMEROUN', w / 2, 8, { align: 'center' });
  doc.setTextColor(0, 0, 0);

  // School name
  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 100, 0);
  const schoolName = (etab.nomEtablissement || 'SCHOOLFLOW').toUpperCase();
  doc.text(schoolName, w / 2, 16.5, { align: 'center' });
  doc.setTextColor(0, 0, 0);

  // "CARTE IDENTITE SCOLAIRE" vertical on left
  doc.setFontSize(3.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(206, 17, 38);
  doc.text('CARTE IDENTITÉ SCOLAIRE', 4.5, 48, { angle: 90 });
  doc.setTextColor(0, 0, 0);

  // Student info - left side
  const startY = 20;
  const labelX = 8;
  const valueX = 28;
  const lineH = 4.5;

  doc.setFontSize(4.5);
  doc.setFont('helvetica', 'normal');

  const fields = [
    { label: 'Nom / Name', value: data.nom.toUpperCase() },
    { label: 'Prénom / Surname', value: data.prenom },
    { label: 'Né(e) le / Born on', value: data.dateNaissance || '-' },
    { label: 'A / At', value: data.lieuNaissance || '-' },
    { label: 'Classe / Class', value: data.classe },
    { label: 'Matricule', value: data.matricule },
    { label: 'Validité', value: data.anneeScolaire },
  ];

  fields.forEach((f, i) => {
    const y = startY + i * lineH;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(4);
    doc.text(f.label, labelX, y);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5);
    doc.text(f.value, valueX, y);
  });

  // Photo placeholder - right side
  const photoX = w - 25;
  const photoY = 20;
  const photoW = 18;
  const photoH = 22;

  doc.setDrawColor(150, 150, 150);
  doc.setLineWidth(0.3);
  doc.rect(photoX, photoY, photoW, photoH);

  doc.setFontSize(4);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(150, 150, 150);
  doc.text('PHOTO', photoX + photoW / 2, photoY + photoH / 2, { align: 'center' });
  doc.setTextColor(0, 0, 0);

  // Stamp area
  doc.setFontSize(3);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(150, 150, 150);
  doc.text('[Cachet]', photoX + photoW / 2, photoY + photoH + 4, { align: 'center' });
  doc.setTextColor(0, 0, 0);

  // Bottom note
  doc.setFontSize(3);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(206, 17, 38);
  doc.text('NB : Cette carte est strictement personnelle et devra être présentée à toute réquisition', w / 2, h - 3, { align: 'center' });
  doc.setTextColor(0, 0, 0);

  // Contact info bottom right
  if (etab.telephone || etab.ville) {
    doc.setFontSize(3);
    doc.setFont('helvetica', 'normal');
    const contact = [etab.ville, etab.telephone ? `Tél: ${etab.telephone}` : ''].filter(Boolean).join(' - ');
    doc.text(contact, w - 4, h - 6, { align: 'right' });
  }

  doc.save(`carte-${data.matricule}.pdf`);
}

// ==========================================
// BATCH PRINT ALL STUDENT CARDS (multiple per page on A4)
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
}[]) {
  // A4 page, place cards in a grid
  const doc = new jsPDF({ format: 'a4', unit: 'mm', orientation: 'portrait' });
  const cardW = 85.6;
  const cardH = 54;
  const marginX = 12;
  const marginY = 10;
  const gapX = 6;
  const gapY = 5;
  const cols = 2;
  const rows = 4;
  const etab = getEtablissement();

  students.forEach((student, i) => {
    const posOnPage = i % (cols * rows);
    if (i > 0 && posOnPage === 0) doc.addPage();

    const col = posOnPage % cols;
    const row = Math.floor(posOnPage / cols);
    const x = marginX + col * (cardW + gapX);
    const y = marginY + row * (cardH + gapY);

    // Draw mini card at position
    drawMiniCard(doc, student, etab, x, y, cardW, cardH);
  });

  doc.save(`cartes-eleves-batch.pdf`);
}

function drawMiniCard(
  doc: jsPDF,
  data: { nom: string; prenom: string; matricule: string; classe: string; anneeScolaire: string; dateNaissance?: string; lieuNaissance?: string },
  etab: any,
  ox: number,
  oy: number,
  cw: number,
  ch: number,
) {
  // Border
  doc.setDrawColor(0, 100, 0);
  doc.setLineWidth(0.4);
  doc.rect(ox, oy, cw, ch);

  // Green band
  doc.setFillColor(0, 128, 0);
  doc.rect(ox, oy, cw, 7, 'F');
  doc.setFillColor(206, 17, 38);
  doc.rect(ox, oy + 7, cw, 1.2, 'F');
  doc.setFillColor(252, 209, 22);
  doc.rect(ox, oy + 8.2, cw, 1.2, 'F');

  doc.setFontSize(5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('REPUBLIC OF CAMEROON', ox + cw / 2, oy + 4.5, { align: 'center' });
  doc.setTextColor(0, 0, 0);

  doc.setFontSize(5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 100, 0);
  doc.text((etab.nomEtablissement || 'SCHOOLFLOW').toUpperCase(), ox + cw / 2, oy + 13, { align: 'center' });
  doc.setTextColor(0, 0, 0);

  // Fields
  const fields = [
    { label: 'Nom', value: data.nom.toUpperCase() },
    { label: 'Prénom', value: data.prenom },
    { label: 'Né(e) le', value: data.dateNaissance || '-' },
    { label: 'Lieu', value: data.lieuNaissance || '-' },
    { label: 'Classe', value: data.classe },
    { label: 'Matricule', value: data.matricule },
    { label: 'Validité', value: data.anneeScolaire },
  ];

  let fy = oy + 18;
  fields.forEach((f) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(3.5);
    doc.text(f.label, ox + 5, fy);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(4.5);
    doc.text(f.value, ox + 22, fy);
    fy += 3.8;
  });

  // Photo box
  const pX = ox + cw - 22;
  const pY = oy + 17;
  doc.setDrawColor(150, 150, 150);
  doc.setLineWidth(0.2);
  doc.rect(pX, pY, 16, 20);
  doc.setFontSize(3.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(180, 180, 180);
  doc.text('PHOTO', pX + 8, pY + 10, { align: 'center' });
  doc.setTextColor(0, 0, 0);

  // NB
  doc.setFontSize(2.8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(206, 17, 38);
  doc.text('NB : Cette carte est strictement personnelle', ox + cw / 2, oy + ch - 2, { align: 'center' });
  doc.setTextColor(0, 0, 0);
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
  const addrC = [etab.adresse, etab.ville].filter(Boolean).join(', ');
  if (addrC) doc.text(addrC, pw / 2, 50, { align: 'center' });
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
