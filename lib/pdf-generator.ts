import jsPDF from 'jspdf';

// Function to generate a PDF for an invoice
export function generateInvoicePDF(invoiceData: any) {
  const doc = new jsPDF();
  
  // Add company logo/header
  doc.setFontSize(20);
  doc.text('INVOICE', 105, 20, { align: 'center' });
  
  // Add invoice details
  doc.setFontSize(10);
  doc.text(`Invoice #: ${invoiceData.invoiceNumber || 'N/A'}`, 20, 40);
  doc.text(`Date: ${formatDate(invoiceData.date) || 'N/A'}`, 20, 45);
  doc.text(`Due Date: ${formatDate(invoiceData.dueDate) || 'N/A'}`, 20, 50);
  
  // Add sender info
  doc.setFontSize(12);
  doc.text('From:', 20, 65);
  doc.setFontSize(10);
  doc.text(invoiceData.yourInfo.name || 'N/A', 20, 70);
  doc.text(invoiceData.yourInfo.address || 'N/A', 20, 75);
  doc.text(invoiceData.yourInfo.email || 'N/A', 20, 80);
  doc.text(invoiceData.yourInfo.phone || 'N/A', 20, 85);
  
  // Add recipient info
  doc.setFontSize(12);
  doc.text('To:', 120, 65);
  doc.setFontSize(10);
  doc.text(invoiceData.clientInfo.name || 'N/A', 120, 70);
  doc.text(invoiceData.clientInfo.address || 'N/A', 120, 75);
  doc.text(invoiceData.clientInfo.email || 'N/A', 120, 80);
  doc.text(invoiceData.clientInfo.phone || 'N/A', 120, 85);
  
  // Add items table
  doc.setFontSize(12);
  doc.text('Items', 20, 100);
  
  // Table headers
  doc.setFontSize(10);
  doc.text('Description', 20, 110);
  doc.text('Quantity', 100, 110);
  doc.text('Price', 130, 110);
  doc.text('Total', 160, 110);
  
  // Draw line under headers
  doc.line(20, 112, 190, 112);
  
  // Table content
  let yPos = 120;
  let subtotal = 0;
  
  invoiceData.items.forEach((item: any, index: number) => {
    const itemTotal = item.quantity * item.price;
    subtotal += itemTotal;
    
    doc.text(item.description || 'N/A', 20, yPos);
    doc.text(item.quantity.toString(), 100, yPos);
    doc.text(`€${item.price.toFixed(2)}`, 130, yPos);
    doc.text(`€${itemTotal.toFixed(2)}`, 160, yPos);
    
    yPos += 10;
  });
  
  // Draw line above totals
  doc.line(20, yPos, 190, yPos);
  yPos += 10;
  
  // Add totals
  doc.text('Subtotal:', 130, yPos);
  doc.text(`€${subtotal.toFixed(2)}`, 160, yPos);
  yPos += 10;
  
  doc.text('Total:', 130, yPos);
  doc.text(`€${subtotal.toFixed(2)}`, 160, yPos);
  
  // Add notes
  if (invoiceData.notes) {
    yPos += 20;
    doc.setFontSize(12);
    doc.text('Notes:', 20, yPos);
    yPos += 10;
    doc.setFontSize(10);
    doc.text(invoiceData.notes, 20, yPos, { maxWidth: 170 });
  }
  
  return doc;
}

// Function to generate a PDF for a quote
export function generateQuotePDF(quoteData: any) {
  const doc = new jsPDF();
  
  // Add company logo/header
  doc.setFontSize(20);
  doc.text('QUOTE', 105, 20, { align: 'center' });
  
  // Add quote details
  doc.setFontSize(10);
  doc.text(`Quote #: ${quoteData.quoteNumber || 'N/A'}`, 20, 40);
  doc.text(`Date: ${formatDate(quoteData.date) || 'N/A'}`, 20, 45);
  doc.text(`Valid Until: ${formatDate(quoteData.validUntil) || 'N/A'}`, 20, 50);
  
  // Add sender info
  doc.setFontSize(12);
  doc.text('From:', 20, 65);
  doc.setFontSize(10);
  doc.text(quoteData.yourInfo.name || 'N/A', 20, 70);
  doc.text(quoteData.yourInfo.address || 'N/A', 20, 75);
  doc.text(quoteData.yourInfo.email || 'N/A', 20, 80);
  doc.text(quoteData.yourInfo.phone || 'N/A', 20, 85);
  
  // Add recipient info
  doc.setFontSize(12);
  doc.text('To:', 120, 65);
  doc.setFontSize(10);
  doc.text(quoteData.clientInfo.name || 'N/A', 120, 70);
  doc.text(quoteData.clientInfo.address || 'N/A', 120, 75);
  doc.text(quoteData.clientInfo.email || 'N/A', 120, 80);
  doc.text(quoteData.clientInfo.phone || 'N/A', 120, 85);
  
  // Add items table
  doc.setFontSize(12);
  doc.text('Items', 20, 100);
  
  // Table headers
  doc.setFontSize(10);
  doc.text('Description', 20, 110);
  doc.text('Quantity', 100, 110);
  doc.text('Price', 130, 110);
  doc.text('Total', 160, 110);
  
  // Draw line under headers
  doc.line(20, 112, 190, 112);
  
  // Table content
  let yPos = 120;
  let subtotal = 0;
  
  quoteData.items.forEach((item: any, index: number) => {
    const itemTotal = item.quantity * item.price;
    subtotal += itemTotal;
    
    doc.text(item.description || 'N/A', 20, yPos);
    doc.text(item.quantity.toString(), 100, yPos);
    doc.text(`€${item.price.toFixed(2)}`, 130, yPos);
    doc.text(`€${itemTotal.toFixed(2)}`, 160, yPos);
    
    yPos += 10;
  });
  
  // Draw line above totals
  doc.line(20, yPos, 190, yPos);
  yPos += 10;
  
  // Add totals
  doc.text('Subtotal:', 130, yPos);
  doc.text(`€${subtotal.toFixed(2)}`, 160, yPos);
  yPos += 10;
  
  doc.text('Total:', 130, yPos);
  doc.text(`€${subtotal.toFixed(2)}`, 160, yPos);
  
  // Add notes and terms
  if (quoteData.notes || quoteData.terms) {
    yPos += 20;
    
    if (quoteData.notes) {
      doc.setFontSize(12);
      doc.text('Notes:', 20, yPos);
      yPos += 10;
      doc.setFontSize(10);
      doc.text(quoteData.notes, 20, yPos, { maxWidth: 170 });
      yPos += 20;
    }
    
    if (quoteData.terms) {
      doc.setFontSize(12);
      doc.text('Terms & Conditions:', 20, yPos);
      yPos += 10;
      doc.setFontSize(10);
      doc.text(quoteData.terms, 20, yPos, { maxWidth: 170 });
    }
  }
  
  return doc;
}

// Function to generate a PDF for a CV
export function generateCVPDF(cvData: any) {
  const doc = new jsPDF();
  
  // Add name and title
  doc.setFontSize(20);
  doc.text(cvData.personal.name || 'Your Name', 105, 20, { align: 'center' });
  
  if (cvData.personal.title) {
    doc.setFontSize(14);
    doc.text(cvData.personal.title, 105, 30, { align: 'center' });
  }
  
  // Add contact info
  doc.setFontSize(10);
  let contactText = '';
  if (cvData.personal.email) contactText += cvData.personal.email;
  if (cvData.personal.phone) contactText += (contactText ? ' • ' : '') + cvData.personal.phone;
  if (cvData.personal.address) contactText += (contactText ? ' • ' : '') + cvData.personal.address;
  
  if (contactText) {
    doc.text(contactText, 105, 40, { align: 'center' });
  }
  
  if (cvData.personal.website) {
    doc.text(cvData.personal.website, 105, 45, { align: 'center' });
  }
  
  let yPos = 55;
  
  // Add summary if available
  if (cvData.personal.summary) {
    doc.setFontSize(12);
    doc.text('SUMMARY', 20, yPos);
    doc.line(20, yPos + 2, 190, yPos + 2);
    yPos += 10;
    
    doc.setFontSize(10);
    const summaryLines = doc.splitTextToSize(cvData.personal.summary, 170);
    doc.text(summaryLines, 20, yPos);
    yPos += (summaryLines.length * 5) + 10;
  }
  
  // Add experience
  if (cvData.experience.some((exp: any) => exp.company || exp.position)) {
    doc.setFontSize(12);
    doc.text('EXPERIENCE', 20, yPos);
    doc.line(20, yPos + 2, 190, yPos + 2);
    yPos += 10;
    
    cvData.experience.forEach((exp: any) => {
      if (exp.company || exp.position) {
        doc.setFontSize(11);
        doc.text(exp.position || 'Position', 20, yPos);
        
        // Date range on the right
        const dateText = `${formatMonthYear(exp.startDate) || 'Start'} - ${exp.current ? 'Present' : formatMonthYear(exp.endDate) || 'End'}`;
        doc.text(dateText, 190, yPos, { align: 'right' });
        yPos += 5;
        
        doc.setFontSize(10);
        doc.text(exp.company || 'Company', 20, yPos);
        yPos += 7;
        
        if (exp.description) {
          const descLines = doc.splitTextToSize(exp.description, 170);
          doc.text(descLines, 20, yPos);
          yPos += (descLines.length * 5) + 5;
        }
        
        yPos += 5;
      }
    });
  }
  
  // Add education
  if (cvData.education.some((edu: any) => edu.institution || edu.degree)) {
    doc.setFontSize(12);
    doc.text('EDUCATION', 20, yPos);
    doc.line(20, yPos + 2, 190, yPos + 2);
    yPos += 10;
    
    cvData.education.forEach((edu: any) => {
      if (edu.institution || edu.degree) {
        doc.setFontSize(11);
        const degreeText = `${edu.degree || 'Degree'}${edu.field ? ' in ' + edu.field : ''}`;
        doc.text(degreeText, 20, yPos);
        
        // Date range on the right
        const dateText = `${formatMonthYear(edu.startDate) || 'Start'} - ${formatMonthYear(edu.endDate) || 'End'}`;
        doc.text(dateText, 190, yPos, { align: 'right' });
        yPos += 5;
        
        doc.setFontSize(10);
        doc.text(edu.institution || 'Institution', 20, yPos);
        yPos += 7;
        
        if (edu.description) {
          const descLines = doc.splitTextToSize(edu.description, 170);
          doc.text(descLines, 20, yPos);
          yPos += (descLines.length * 5) + 5;
        }
        
        yPos += 5;
      }
    });
  }
  
  // Add skills
  if (cvData.skills.some((skill: string) => skill)) {
    doc.setFontSize(12);
    doc.text('SKILLS', 20, yPos);
    doc.line(20, yPos + 2, 190, yPos + 2);
    yPos += 10;
    
    doc.setFontSize(10);
    const skillsText = cvData.skills.filter((s: string) => s).join(', ');
    const skillsLines = doc.splitTextToSize(skillsText, 170);
    doc.text(skillsLines, 20, yPos);
    yPos += (skillsLines.length * 5) + 10;
  }
  
  // Add languages
  if (cvData.languages.some((lang: string) => lang)) {
    doc.setFontSize(12);
    doc.text('LANGUAGES', 20, yPos);
    doc.line(20, yPos + 2, 190, yPos + 2);
    yPos += 10;
    
    doc.setFontSize(10);
    const langsText = cvData.languages.filter((l: string) => l).join(', ');
    doc.text(langsText, 20, yPos);
  }
  
  return doc;
}

// Function to generate a PDF for a cover letter
export function generateCoverLetterPDF(letterData: any) {
  const doc = new jsPDF();
  
  // Add date
  doc.setFontSize(10);
  if (letterData.date) {
    const formattedDate = formatDate(letterData.date);
    doc.text(formattedDate, 190, 20, { align: 'right' });
  }
  
  let yPos = 40;
  
  // Add sender info
  doc.setFontSize(10);
  if (letterData.yourInfo.name) doc.text(letterData.yourInfo.name, 20, yPos);
  yPos += 5;
  if (letterData.yourInfo.address) doc.text(letterData.yourInfo.address, 20, yPos);
  yPos += 5;
  if (letterData.yourInfo.email) doc.text(letterData.yourInfo.email, 20, yPos);
  yPos += 5;
  if (letterData.yourInfo.phone) doc.text(letterData.yourInfo.phone, 20, yPos);
  
  yPos += 15;
  
  // Add recipient info
  if (letterData.recipientInfo.name) doc.text(letterData.recipientInfo.name, 20, yPos);
  yPos += 5;
  if (letterData.recipientInfo.title) doc.text(letterData.recipientInfo.title, 20, yPos);
  yPos += 5;
  if (letterData.recipientInfo.company) doc.text(letterData.recipientInfo.company, 20, yPos);
  yPos += 5;
  if (letterData.recipientInfo.address) doc.text(letterData.recipientInfo.address, 20, yPos);
  
  yPos += 15;
  
  // Add greeting
  const greeting = `${letterData.content.greeting || 'Dear'} ${letterData.recipientInfo.name || '[Recipient Name]'},`;
  doc.text(greeting, 20, yPos);
  
  yPos += 10;
  
  // Add introduction
  if (letterData.content.introduction) {
    const introLines = doc.splitTextToSize(letterData.content.introduction, 170);
    doc.text(introLines, 20, yPos);
    yPos += (introLines.length * 5) + 5;
  }
  
  // Add body
  if (letterData.content.body) {
    const bodyLines = doc.splitTextToSize(letterData.content.body, 170);
    doc.text(bodyLines, 20, yPos);
    yPos += (bodyLines.length * 5) + 5;
  }
  
  // Add conclusion
  if (letterData.content.conclusion) {
    const conclusionLines = doc.splitTextToSize(letterData.content.conclusion, 170);
    doc.text(conclusionLines, 20, yPos);
    yPos += (conclusionLines.length * 5) + 10;
  }
  
  // Add closing
  doc.text(letterData.content.closing || 'Sincerely,', 20, yPos);
  yPos += 15;
  
  // Add signature
  doc.text(letterData.yourInfo.name || '[Your Name]', 20, yPos);
  
  return doc;
}

// Helper function to format dates
function formatDate(dateString: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatMonthYear(dateString: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
}