import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Generate a styled PDF report from the report preview element
 */
export const generateReportPDF = async (element, options = {}) => {
    const {
        periodLabel = '',
        summary = {},
        fileName = 'relatorio-financeiro.pdf'
    } = options;

    // Capture the element as canvas
    const canvas = await html2canvas(element, {
        backgroundColor: '#0f172a', // slate-900
        scale: 2, // Higher quality
        useCORS: true,
        logging: false,
        windowWidth: 400, // Mobile-like width for consistency
    });

    // Calculate dimensions
    const imgWidth = 190; // A4 width minus margins
    const pageHeight = 277; // A4 height minus margins
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const heightLeft = imgHeight;

    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');

    // Add dark background to the entire page
    pdf.setFillColor(15, 23, 42); // slate-900
    pdf.rect(0, 0, 210, 297, 'F');

    // Add header
    pdf.setFillColor(30, 41, 59); // slate-800
    pdf.roundedRect(10, 10, 190, 25, 3, 3, 'F');

    // Header text
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Relatório Financeiro', 20, 23);

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(148, 163, 184); // slate-400
    pdf.text(periodLabel, 20, 30);

    // Date generated
    const now = new Date();
    pdf.setFontSize(8);
    pdf.text(`Gerado em: ${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR')}`, 140, 30);

    // Add summary bar
    const summaryY = 42;
    pdf.setFillColor(30, 41, 59);
    pdf.roundedRect(10, summaryY, 190, 20, 3, 3, 'F');

    // Summary items
    const summaryItems = [
        { label: 'Entradas', value: formatCurrencyPDF(summary.income || 0), color: [52, 211, 153] }, // emerald
        { label: 'Saídas', value: formatCurrencyPDF(summary.expense || 0), color: [251, 113, 133] }, // rose
        { label: 'Saldo', value: formatCurrencyPDF(summary.balance || 0), color: summary.balance >= 0 ? [96, 165, 250] : [251, 113, 133] }
    ];

    let xPos = 20;
    summaryItems.forEach((item, index) => {
        pdf.setFontSize(8);
        pdf.setTextColor(148, 163, 184);
        pdf.text(item.label, xPos, summaryY + 8);

        pdf.setFontSize(12);
        pdf.setTextColor(...item.color);
        pdf.setFont('helvetica', 'bold');
        pdf.text(item.value, xPos, summaryY + 15);
        pdf.setFont('helvetica', 'normal');

        xPos += 65;
    });

    // Add the captured content
    const imgData = canvas.toDataURL('image/png');
    const contentY = 68;

    // If content fits on one page
    if (imgHeight <= pageHeight - contentY) {
        pdf.addImage(imgData, 'PNG', 10, contentY, imgWidth, imgHeight);
    } else {
        // Multi-page handling
        let position = contentY - pageHeight;
        let remainingHeight = imgHeight;
        let firstPage = true;

        while (remainingHeight > 0) {
            if (!firstPage) {
                pdf.addPage();
                // Add dark background to new page
                pdf.setFillColor(15, 23, 42);
                pdf.rect(0, 0, 210, 297, 'F');
            }

            const yOffset = firstPage ? 0 : position + pageHeight;
            const pageContentHeight = firstPage ? pageHeight - contentY : pageHeight;

            pdf.addImage(imgData, 'PNG', 10, firstPage ? contentY : 10, imgWidth, imgHeight, undefined, undefined, 0);

            remainingHeight -= pageContentHeight;
            position += pageContentHeight;
            firstPage = false;
        }
    }

    // Add footer to last page
    pdf.setFontSize(8);
    pdf.setTextColor(100, 116, 139); // slate-500
    pdf.text('App Finanças • Relatório gerado automaticamente', 105, 290, { align: 'center' });

    // Save the PDF
    pdf.save(fileName);
};

/**
 * Format currency for PDF (without API calls)
 */
function formatCurrencyPDF(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}
