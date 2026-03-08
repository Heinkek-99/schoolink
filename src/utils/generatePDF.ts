import jsPDF from 'jspdf';

export function generateReceiptPDF(data: {
  familleNom: string;
  date: string;
  montant: number;
  mode: string;
  reference?: string;
  ventilations: { eleveNom: string; montant: number }[];
}) {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text('SchoolFlow', 105, 20, { align: 'center' });
  
  doc.setFontSize(14);
  doc.text('Reçu de Paiement', 105, 32, { align: 'center' });
  
  doc.setFontSize(10);
  doc.text(`Date: ${data.date}`, 20, 50);
  doc.text(`Famille: ${data.familleNom}`, 20, 58);
  doc.text(`Mode: ${data.mode}`, 20, 66);
  if (data.reference) doc.text(`Référence: ${data.reference}`, 20, 74);
  
  let y = 90;
  doc.setFontSize(11);
  doc.text('Ventilation:', 20, y);
  y += 8;
  
  data.ventilations.forEach((v) => {
    doc.setFontSize(10);
    doc.text(`${v.eleveNom}: ${new Intl.NumberFormat('fr-FR').format(v.montant)} FCFA`, 25, y);
    y += 7;
  });
  
  y += 10;
  doc.setFontSize(12);
  doc.text(`Total: ${new Intl.NumberFormat('fr-FR').format(data.montant)} FCFA`, 20, y);
  
  doc.save(`recu-${data.familleNom}-${data.date}.pdf`);
}

export function generateStudentCardPDF(data: {
  nom: string;
  prenom: string;
  matricule: string;
  classe: string;
  anneeScolaire: string;
}) {
  const doc = new jsPDF({ format: [85.6, 54], unit: 'mm' });
  
  doc.setFontSize(10);
  doc.text('SchoolFlow', 42.8, 8, { align: 'center' });
  
  doc.setFontSize(7);
  doc.text("Carte d'élève", 42.8, 13, { align: 'center' });
  
  doc.setFontSize(9);
  doc.text(`${data.prenom} ${data.nom}`, 42.8, 25, { align: 'center' });
  
  doc.setFontSize(7);
  doc.text(`Matricule: ${data.matricule}`, 42.8, 32, { align: 'center' });
  doc.text(`Classe: ${data.classe}`, 42.8, 37, { align: 'center' });
  doc.text(`Année: ${data.anneeScolaire}`, 42.8, 42, { align: 'center' });
  
  doc.save(`carte-${data.matricule}.pdf`);
}
