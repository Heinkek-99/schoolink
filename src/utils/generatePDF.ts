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
  };
}

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
  const pageWidth = doc.internal.pageSize.getWidth();

  // Border
  doc.setDrawColor(30, 58, 95);
  doc.setLineWidth(0.8);
  doc.rect(10, 10, pageWidth - 20, 277);
  doc.setLineWidth(0.3);
  doc.rect(12, 12, pageWidth - 24, 273);

  // Header - School name
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(etab.nomEtablissement || 'SchoolFlow', pageWidth / 2, 28, { align: 'center' });

  // Address line
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const addressParts = [etab.adresse, etab.ville].filter(Boolean).join(', ');
  if (addressParts) {
    doc.text(addressParts, pageWidth / 2, 35, { align: 'center' });
  }
  const contactParts = [etab.telephone ? `Tél: ${etab.telephone}` : '', etab.email ? `Email: ${etab.email}` : ''].filter(Boolean).join(' | ');
  if (contactParts) {
    doc.text(contactParts, pageWidth / 2, 40, { align: 'center' });
  }

  // Line separator
  doc.setDrawColor(30, 58, 95);
  doc.setLineWidth(0.5);
  doc.line(20, 44, pageWidth - 20, 44);

  // Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('REÇU DE PAIEMENT SCOLAIRE', pageWidth / 2, 54, { align: 'center' });

  // Receipt number and date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const receiptNum = data.numeroRecu || String(Math.floor(Math.random() * 9999)).padStart(4, '0');
  doc.text(`N° de reçu : ${receiptNum}`, 20, 64);
  doc.text(`Date : ${data.date}`, pageWidth - 20, 64, { align: 'right' });

  // Separator line
  doc.setLineWidth(0.2);
  doc.line(20, 68, pageWidth - 20, 68);

  // Student info section
  let y = 76;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Reçu de :', 20, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Nom et prénom de l'élève : `, 20, y);
  doc.setFont('helvetica', 'bold');
  doc.text(data.eleveNom || data.familleNom, 72, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.text(`Classe / Niveau : `, 20, y);
  doc.setFont('helvetica', 'bold');
  doc.text(data.eleveClasse || '-', 56, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.text(`Famille : `, 20, y);
  doc.setFont('helvetica', 'bold');
  doc.text(data.familleNom, 42, y);
  y += 12;

  // Amount section
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(245, 245, 250);
  doc.roundedRect(18, y - 4, pageWidth - 36, 20, 2, 2, 'FD');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 95);
  const amountStr = new Intl.NumberFormat('fr-FR').format(data.montant);
  doc.text(`Montant reçu : ${amountStr} FCFA`, 24, y + 4);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.text(`(${numberToWordsFr(data.montant)} francs CFA)`, 24, y + 11);
  doc.setTextColor(0, 0, 0);
  y += 24;

  // Payment mode with checkboxes
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Mode de paiement :', 20, y);
  y += 7;

  const modes = ['Espèces', 'Chèque', 'Virement', 'Mobile Money', 'Carte de crédit'];
  let xPos = 25;
  modes.forEach((m) => {
    // Checkbox
    doc.setDrawColor(100, 100, 100);
    doc.rect(xPos, y - 3.5, 3.5, 3.5);
    if (m === data.mode) {
      doc.setFont('helvetica', 'bold');
      doc.text('✓', xPos + 0.5, y - 0.2);
      doc.setFont('helvetica', 'normal');
    }
    doc.setFontSize(8);
    doc.text(m, xPos + 5, y);
    xPos += m.length * 2.5 + 12;
  });

  if (data.reference) {
    y += 7;
    doc.setFontSize(10);
    doc.text(`Référence : ${data.reference}`, 20, y);
  }
  y += 10;

  // Ventilation details
  if (data.ventilations.length > 0) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Détail de la ventilation :', 20, y);
    y += 6;

    // Table header
    doc.setFillColor(30, 58, 95);
    doc.setTextColor(255, 255, 255);
    doc.rect(20, y - 4, pageWidth - 40, 7, 'F');
    doc.setFontSize(9);
    doc.text('Élève', 24, y);
    doc.text('Montant', pageWidth - 40, y, { align: 'right' });
    doc.setTextColor(0, 0, 0);
    y += 6;

    doc.setFont('helvetica', 'normal');
    data.ventilations.forEach((v) => {
      doc.text(v.eleveNom, 24, y);
      doc.text(`${new Intl.NumberFormat('fr-FR').format(v.montant)} FCFA`, pageWidth - 40, y, { align: 'right' });
      y += 6;
    });

    // Total row
    doc.setLineWidth(0.3);
    doc.line(20, y - 2, pageWidth - 20, y - 2);
    doc.setFont('helvetica', 'bold');
    doc.text('Total', 24, y + 2);
    doc.text(`${new Intl.NumberFormat('fr-FR').format(data.montant)} FCFA`, pageWidth - 40, y + 2, { align: 'right' });
    y += 10;
  }

  // Objet du paiement
  if (data.objet) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Objet du paiement : ${data.objet}`, 20, y);
    y += 8;
  }

  // Observation
  if (data.observation) {
    doc.setFont('helvetica', 'italic');
    doc.text(`Observation(s) : ${data.observation}`, 20, y);
    y += 8;
  }

  // Signature section at bottom
  const sigY = Math.max(y + 20, 230);
  doc.setLineWidth(0.2);
  doc.line(20, sigY - 10, pageWidth - 20, sigY - 10);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Signature et cachet de l\'établissement', pageWidth / 2, sigY, { align: 'center' });

  // Signature line
  doc.setDrawColor(150, 150, 150);
  doc.setLineDashPattern([2, 2], 0);
  doc.line(pageWidth / 2 - 30, sigY + 20, pageWidth / 2 + 30, sigY + 20);
  doc.setLineDashPattern([], 0);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text('[Signature]', pageWidth / 2 - 25, sigY + 25);
  doc.text('[Cachet]', pageWidth / 2 + 10, sigY + 25);

  // Footer
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(120, 120, 120);
  doc.text('Ce reçu est un document officiel de l\'établissement. Veuillez le conserver précieusement.', pageWidth / 2, 280, { align: 'center' });
  doc.setTextColor(0, 0, 0);

  doc.save(`recu-${data.familleNom}-${data.date}.pdf`);
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
  const doc = new jsPDF({ format: [85.6, 54], unit: 'mm', orientation: 'landscape' });
  const etab = getEtablissement();
  const w = 85.6;
  const h = 54;

  doc.setDrawColor(0, 100, 0);
  doc.setLineWidth(0.5);
  doc.rect(1, 1, w - 2, h - 2);
  doc.setLineWidth(0.2);
  doc.rect(2, 2, w - 4, h - 4);

  doc.setFillColor(0, 128, 0);
  doc.rect(2, 2, w - 4, 8, 'F');
  doc.setFillColor(206, 17, 38);
  doc.rect(2, 10, w - 4, 1.5, 'F');
  doc.setFillColor(252, 209, 22);
  doc.rect(2, 11.5, w - 4, 1.5, 'F');

  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('REPUBLIC OF CAMEROON', w / 2, 5.5, { align: 'center' });
  doc.setFontSize(4.5);
  doc.setFont('helvetica', 'italic');
  doc.text('RÉPUBLIQUE DU CAMEROUN', w / 2, 8, { align: 'center' });
  doc.setTextColor(0, 0, 0);

  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 100, 0);
  doc.text((etab.nomEtablissement || 'SCHOOLFLOW').toUpperCase(), w / 2, 16.5, { align: 'center' });
  doc.setTextColor(0, 0, 0);

  doc.setFontSize(3.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(206, 17, 38);
  doc.text('CARTE IDENTITÉ SCOLAIRE', 4.5, 48, { angle: 90 });
  doc.setTextColor(0, 0, 0);

  const startY = 20;
  const labelX = 8;
  const valueX = 28;
  const lineH = 4.5;

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

  doc.setFontSize(3);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(150, 150, 150);
  doc.text('[Cachet]', photoX + photoW / 2, photoY + photoH + 4, { align: 'center' });
  doc.setTextColor(0, 0, 0);

  doc.setFontSize(3);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(206, 17, 38);
  doc.text('NB : Cette carte est strictement personnelle et devra être présentée à toute réquisition', w / 2, h - 3, { align: 'center' });
  doc.setTextColor(0, 0, 0);

  if (etab.telephone || etab.ville) {
    doc.setFontSize(3);
    doc.setFont('helvetica', 'normal');
    const contact = [etab.ville, etab.telephone ? `Tél: ${etab.telephone}` : ''].filter(Boolean).join(' - ');
    doc.text(contact, w - 4, h - 6, { align: 'right' });
  }

  doc.save(`carte-${data.matricule}.pdf`);
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

  // Border
  doc.setDrawColor(30, 58, 95);
  doc.setLineWidth(0.8);
  doc.rect(10, 10, pw - 20, 277);

  // Header
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

  // Title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('BULLETIN FINANCIER', pw / 2, 50, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Année scolaire : ${data.anneeScolaire}`, pw / 2, 56, { align: 'center' });

  // Student info
  let y = 66;
  doc.setFontSize(10);
  const info = [
    [`Nom et prénom :`, `${data.prenom} ${data.nom}`],
    [`Matricule :`, data.matricule],
    [`Classe :`, data.classe],
    [`Famille :`, data.famille],
  ];
  info.forEach(([label, value]) => {
    doc.setFont('helvetica', 'normal');
    doc.text(label, 20, y);
    doc.setFont('helvetica', 'bold');
    doc.text(value, 60, y);
    y += 7;
  });

  y += 5;

  // Table header
  doc.setFillColor(30, 58, 95);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  const colX = [20, 75, 105, 135, 165];
  doc.rect(20, y - 5, pw - 40, 8, 'F');
  doc.text('Frais', colX[0] + 3, y);
  doc.text('Montant', colX[1] + 3, y);
  doc.text('Payé', colX[2] + 3, y);
  doc.text('Solde', colX[3] + 3, y);
  doc.text('Échéance', colX[4] + 3, y);
  doc.setTextColor(0, 0, 0);
  y += 6;

  // Table rows
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

  // Totals
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

  // Taux de recouvrement
  const taux = data.totalDu > 0 ? Math.round((data.totalPaye / data.totalDu) * 100) : 0;
  y += 30;
  doc.setFillColor(245, 245, 250);
  doc.roundedRect(20, y - 4, pw - 40, 12, 2, 2, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Taux de recouvrement : ${taux}%`, pw / 2, y + 3, { align: 'center' });

  // Signature
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

  // Footer
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

  // Decorative border
  doc.setDrawColor(0, 100, 0);
  doc.setLineWidth(1.2);
  doc.rect(8, 8, pw - 16, 281);
  doc.setDrawColor(206, 17, 38);
  doc.setLineWidth(0.4);
  doc.rect(10, 10, pw - 20, 277);
  doc.setDrawColor(252, 209, 22);
  doc.setLineWidth(0.3);
  doc.rect(12, 12, pw - 24, 273);

  // Header
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 100, 0);
  doc.text('RÉPUBLIQUE DU CAMEROUN', pw / 2, 25, { align: 'center' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 100, 100);
  doc.text('Paix - Travail - Patrie', pw / 2, 30, { align: 'center' });
  doc.setTextColor(0, 0, 0);

  // Separator
  doc.setDrawColor(0, 100, 0);
  doc.setLineWidth(0.5);
  doc.line(50, 34, pw - 50, 34);

  // School name
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

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 95);
  doc.text('CERTIFICAT DE SCOLARITÉ', pw / 2, 75, { align: 'center' });
  doc.setTextColor(0, 0, 0);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.text(`Année scolaire ${data.anneeScolaire}`, pw / 2, 82, { align: 'center' });

  // Body
  let y = 100;
  const isMale = data.sexe === '1' || data.sexe === 'M' || data.sexe === 'Masculin';
  const pronoun = isMale ? 'M.' : 'Mlle';
  const article = isMale ? '' : 'e';

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');

  const directorTitle = etab.directeur ? `${etab.directeur}, ` : 'Le Directeur / La Directrice de l\'établissement ';
  doc.text(`Je soussigné${isMale ? '' : 'e'}, ${directorTitle}`, pw / 2, y, { align: 'center' });
  y += 8;
  doc.text(`${(etab.nomEtablissement || 'SchoolFlow').toUpperCase()},`, pw / 2, y, { align: 'center' });
  y += 12;
  doc.text('atteste que :', pw / 2, y, { align: 'center' });
  y += 15;

  // Student info box
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

  // Date and signature
  y += 25;
  doc.setFontSize(10);
  doc.text(`Fait à ${etab.ville || '...........'}, le ${new Date().toLocaleDateString('fr-FR')}`, pw - 30, y, { align: 'right' });

  y += 12;
  doc.setFont('helvetica', 'bold');
  doc.text('Le Directeur / La Directrice', pw - 30, y, { align: 'right' });

  // Signature placeholder
  doc.setDrawColor(150, 150, 150);
  doc.setLineDashPattern([2, 2], 0);
  doc.line(pw - 60, y + 18, pw - 20, y + 18);
  doc.setLineDashPattern([], 0);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(150, 150, 150);
  doc.text('[Signature et cachet]', pw - 40, y + 23, { align: 'center' });
  doc.setTextColor(0, 0, 0);

  // Footer
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(120, 120, 120);
  doc.text('NB : Ce certificat n\'est valable que pour l\'année scolaire mentionnée ci-dessus.', pw / 2, 280, { align: 'center' });
  doc.setTextColor(0, 0, 0);

  doc.save(`certificat-scolarite-${data.matricule}.pdf`);
}
