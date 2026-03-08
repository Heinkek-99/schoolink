import jsPDF from 'jspdf';
import { numberToWordsFr } from './numberToWords';

// jsPDF's built-in fonts can't render non-breaking spaces (\u00A0) from Intl.NumberFormat
// Replace them with regular spaces
function fmtNum(n: number): string {
  return new Intl.NumberFormat('fr-FR').format(Math.round(n)).replace(/[\u00A0\u202F\u2009]/g, ' ');
}

function getLogo(): string | null {
  try { return localStorage.getItem('etablissement_logo'); } catch { return null; }
}

function drawCameroonFlag(doc: jsPDF, x: number, y: number, w: number, h: number) {
  const sw = w / 3;
  doc.setFillColor(0, 128, 0);
  doc.rect(x, y, sw, h, 'F');
  doc.setFillColor(206, 17, 38);
  doc.rect(x + sw, y, sw, h, 'F');
  doc.setFillColor(252, 209, 22);
  doc.rect(x + sw * 2, y, sw, h, 'F');
  // Star
  const cx = x + w / 2, cy = y + h / 2, r = Math.min(w, h) * 0.18;
  doc.setFillColor(252, 209, 22);
  drawStar(doc, cx, cy, r);
}

function drawStar(doc: jsPDF, cx: number, cy: number, r: number) {
  const pts: [number, number][] = [];
  for (let i = 0; i < 5; i++) {
    const a1 = (i * 72 - 90) * Math.PI / 180;
    pts.push([cx + r * Math.cos(a1), cy + r * Math.sin(a1)]);
    const a2 = ((i * 72) + 36 - 90) * Math.PI / 180;
    pts.push([cx + r * 0.4 * Math.cos(a2), cy + r * 0.4 * Math.sin(a2)]);
  }
  // Draw as filled polygon
  const lines: number[][] = pts.map(p => [p[0], p[1]]);
  if (lines.length > 0) {
    doc.setFillColor(252, 209, 22);
    // Use triangle fan approach
    doc.triangle(lines[0][0], lines[0][1], lines[4][0], lines[4][1], lines[6][0], lines[6][1], 'F');
    doc.triangle(lines[0][0], lines[0][1], lines[6][0], lines[6][1], lines[8][0], lines[8][1], 'F');
    doc.triangle(lines[2][0], lines[2][1], lines[4][0], lines[4][1], lines[8][0], lines[8][1], 'F');
  }
}

function drawPdfHeader(doc: jsPDF, pw: number, etab: any, title: string, subtitle?: string) {
  const logo = getLogo();
  let y = 20;
  
  // Flag top-left corner
  drawCameroonFlag(doc, 15, 12, 18, 12);
  
  // Logo top-right
  if (logo) {
    try { doc.addImage(logo, 'PNG', pw - 33, 12, 18, 18); } catch {}
  }
  
  // Header text centered
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 100, 0);
  doc.text('RÉPUBLIQUE DU CAMEROUN', pw / 2, y, { align: 'center' });
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 100, 100);
  doc.text('Paix - Travail - Patrie', pw / 2, y + 4, { align: 'center' });
  doc.setTextColor(0, 0, 0);
  
  doc.setDrawColor(0, 100, 0);
  doc.setLineWidth(0.5);
  doc.line(40, y + 7, pw - 40, y + 7);
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 100, 0);
  doc.text((etab.nomEtablissement || 'SCHOOLFLOW').toUpperCase(), pw / 2, y + 14, { align: 'center' });
  doc.setTextColor(0, 0, 0);
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const addr = [etab.adresse, etab.ville].filter(Boolean).join(', ');
  if (addr) doc.text(addr, pw / 2, y + 19, { align: 'center' });
  const contact = [etab.telephone ? `Tel: ${etab.telephone}` : '', etab.email || ''].filter(Boolean).join(' | ');
  if (contact) doc.text(contact, pw / 2, y + 23, { align: 'center' });
  
  if (etab.devise) {
    doc.setFontSize(7);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text(`"${etab.devise}"`, pw / 2, y + 27, { align: 'center' });
    doc.setTextColor(0, 0, 0);
  }
  
  // Title
  const titleY = y + 35;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 95);
  doc.text(title, pw / 2, titleY, { align: 'center' });
  doc.setTextColor(0, 0, 0);
  
  if (subtitle) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitle, pw / 2, titleY + 6, { align: 'center' });
  }
  
  return titleY + (subtitle ? 12 : 6);
}

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
// REÇU DE PAIEMENT — format A6 (148mm x 105mm)
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
  const doc = new jsPDF({ format: [148, 105], unit: 'mm', orientation: 'landscape' });
  const etab = getEtablissement();
  const pw = 148;
  const receiptNum = data.numeroRecu || String(Math.floor(Math.random() * 9999)).padStart(4, '0');

  // Safe number formatter for jsPDF
  const amt = (n: number | undefined | null) => {
    if (n === undefined || n === null || isNaN(n)) return '0';
    return fmtNum(Math.round(n));
  };

  // Get current user info
  let userName = '';
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      userName = user.nom ? `${user.prenom || ''} ${user.nom}`.trim() : (user.email || '');
    }
  } catch {}

  // Get logo from localStorage
  let logoBase64: string | null = null;
  try {
    logoBase64 = localStorage.getItem('etablissement_logo');
  } catch {}

  // Outer border
  doc.setDrawColor(60, 40, 120);
  doc.setLineWidth(0.6);
  doc.rect(3, 3, pw - 6, 99);

  let y = 10;

  // ─── Header: Logo + School name + Receipt info ───
  const headerLeftX = 8;
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'PNG', headerLeftX, 5, 12, 12);
    } catch {}
  }

  const nameX = logoBase64 ? 22 : 8;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60, 40, 120);
  doc.text((etab.nomEtablissement || 'SchoolFlow').toUpperCase(), nameX, y);
  doc.setFontSize(5.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  const addrLine = [etab.adresse, etab.ville].filter(Boolean).join(', ');
  if (addrLine) doc.text(addrLine, nameX, y + 3.5);
  const contactLine = [etab.telephone, etab.email].filter(Boolean).join(' | ');
  if (contactLine) doc.text(contactLine, nameX, y + 6.5);
  doc.setTextColor(0, 0, 0);

  // Right side: REÇU + N° + Date
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bolditalic');
  doc.setTextColor(60, 40, 120);
  doc.text('REÇU', pw - 8, y, { align: 'right' });
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`N° ${receiptNum}`, pw - 8, y + 4, { align: 'right' });
  doc.text(`Date: ${data.date}`, pw - 8, y + 7.5, { align: 'right' });

  y = 21;
  doc.setDrawColor(60, 40, 120);
  doc.setLineWidth(0.3);
  doc.line(5, y, pw - 5, y);
  y += 5;

  // ─── Reçu de (famille) ───
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('Reçu de :', 8, y);
  doc.setFont('helvetica', 'normal');
  doc.text(data.familleNom, 24, y);

  // ─── Élève + Classe ───
  doc.setFont('helvetica', 'bold');
  doc.text('Élève :', 80, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`${data.eleveNom} (${data.eleveClasse})`, 93, y);
  y += 5;

  // ─── Objet: Pour paiement Scolarité - Trimestre X ───
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('Objet :', 8, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`Pour paiement ${data.objet || 'Scolarité'}`, 22, y);
  y += 5;

  // ─── Montant en chiffres ───
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('Montant :', 8, y);
  doc.setFontSize(8);
  doc.text(`${amt(data.montant)} FCFA`, 24, y);

  // ─── Mode de paiement ───
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('Mode :', 80, y);
  doc.setFont('helvetica', 'normal');
  doc.text(data.mode || '-', 92, y);
  if (data.reference) {
    doc.text(`(Réf: ${data.reference})`, 110, y);
  }
  y += 4;

  // ─── Montant en lettres ───
  doc.setFontSize(5.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(80, 80, 80);
  const wordsStr = numberToWordsFr(data.montant) + ' francs CFA';
  doc.text('Soit : ' + wordsStr.charAt(0).toUpperCase() + wordsStr.slice(1), 8, y);
  doc.setTextColor(0, 0, 0);
  y += 5;

  // ─── Ventilation par élève ───
  if (data.ventilations.length > 1) {
    doc.setFontSize(6);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(80, 80, 80);
    doc.text('Ventilation :', 8, y);
    doc.setTextColor(0, 0, 0);
    y += 3;
    doc.setFont('helvetica', 'normal');
    data.ventilations.forEach((v) => {
      doc.text(`  • ${v.eleveNom}`, 10, y);
      doc.text(`${amt(v.montant)} FCFA`, 65, y);
      y += 3;
    });
    y += 1;
  }

  // ─── Financial Summary Box ───
  const boxX = 80;
  const boxW = 62;
  const boxY = y - 1;
  const rowH = 4.5;
  const rows = [
    { label: 'Montant au compte', value: data.montantDuCompte },
    { label: 'Paiement', value: data.montant },
    { label: 'Solde actuel', value: data.soldeDu },
    { label: 'Date de paiement', value: null, text: data.date },
    { label: 'Paiement restant', value: data.soldeDu !== undefined ? data.soldeDu : undefined },
  ];

  doc.setDrawColor(60, 40, 120);
  doc.setLineWidth(0.3);
  doc.rect(boxX, boxY, boxW, rowH * rows.length);
  rows.forEach((_, i) => {
    if (i > 0) doc.line(boxX, boxY + rowH * i, boxX + boxW, boxY + rowH * i);
  });
  doc.line(boxX + 30, boxY, boxX + 30, boxY + rowH * rows.length);

  doc.setFontSize(5.5);
  rows.forEach((r, i) => {
    const ry = boxY + rowH * i + 3.2;
    doc.setFont('helvetica', 'normal');
    doc.text(r.label, boxX + 2, ry);
    doc.setFont('helvetica', 'bold');
    if (r.text) {
      doc.text(r.text, boxX + 32, ry);
    } else if (r.value !== undefined && r.value !== null) {
      doc.text(`${amt(r.value)} FCFA`, boxX + 32, ry);
    } else {
      doc.text('-', boxX + 32, ry);
    }
  });

  // ─── Left side: Reçu par ───
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Reçu par :', 8, boxY + 3);
  doc.setFont('helvetica', 'normal');
  doc.text(userName || '-', 24, boxY + 3);

  // Contact under "Reçu par"
  doc.setFontSize(5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 100, 100);
  if (etab.telephone) doc.text(`Tél: ${etab.telephone}`, 8, boxY + 7);
  if (etab.email) doc.text(etab.email, 8, boxY + 10);
  doc.setTextColor(0, 0, 0);

  // ─── Footer ───
  const footY = 98;
  doc.setFontSize(4.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(120, 120, 120);
  doc.text('Ce reçu fait foi de paiement — Conservez-le précieusement', pw / 2, footY, { align: 'center' });
  doc.setTextColor(0, 0, 0);

  doc.save(`recu-${data.familleNom.replace(/\s/g, '_')}-${data.date}.pdf`);
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
  const fmt = (n: number) => fmtNum(n);

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
