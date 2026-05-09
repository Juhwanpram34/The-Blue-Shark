// Export utilities for The Blue Shark
// Supports PDF and CSV export of chat conversations and collaboration results

export function exportToCSV(data, filename) {
  let csvContent = '';

  if (data.type === 'chat') {
    // Single agent chat export
    csvContent = 'Timestamp,Role,Agent,Message\n';
    const now = new Date().toISOString();
    data.messages.forEach((msg) => {
      const role = msg.role === 'user' ? 'User' : 'Blue Shark AI';
      const content = msg.content.replace(/"/g, '""').replace(/\n/g, ' ');
      csvContent += `"${now}","${role}","${data.agentName}","${content}"\n`;
    });
  } else if (data.type === 'collab') {
    // Multi-agent collaboration export
    csvContent = 'Agent,Role,Content\n';
    
    // Executive Summary
    if (data.executiveSummary) {
      const summary = data.executiveSummary.replace(/"/g, '""').replace(/\n/g, ' ');
      csvContent += `"Executive Summary","Blue Shark AI","${summary}"\n`;
    }

    // Individual agent results
    data.agentResults.forEach((result) => {
      const content = result.content.replace(/"/g, '""').replace(/\n/g, ' ');
      csvContent += `"${result.agentName}","Blue Shark AI","${content}"\n`;
    });
  }

  downloadFile(csvContent, filename + '.csv', 'text/csv;charset=utf-8;');
}

export function exportToPDF(data, filename) {
  // Dynamic import to avoid SSR issues
  import('jspdf').then(({ jsPDF }) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    // Colors
    const blue = [0, 212, 255];
    const dark = [10, 22, 40];
    const white = [224, 232, 240];
    const gray = [160, 170, 185];

    // Header background
    doc.setFillColor(dark[0], dark[1], dark[2]);
    doc.rect(0, 0, pageWidth, 45, 'F');

    // Header gradient line
    doc.setFillColor(blue[0], blue[1], blue[2]);
    doc.rect(0, 45, pageWidth, 1.5, 'F');

    // Logo text
    doc.setTextColor(blue[0], blue[1], blue[2]);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('The Blue Shark', margin, 22);

    // Subtitle
    doc.setTextColor(gray[0], gray[1], gray[2]);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('AI MULTI-AGENT PLATFORM', margin, 30);

    // Date
    const now = new Date();
    const dateStr = now.toLocaleDateString('id-ID', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
    doc.setFontSize(8);
    doc.text(dateStr, pageWidth - margin, 22, { align: 'right' });

    // Export type
    doc.setTextColor(blue[0], blue[1], blue[2]);
    doc.setFontSize(8);
    const typeLabel = data.type === 'collab' ? 'MULTI-AGENT COLLABORATION REPORT' : 'SINGLE AGENT REPORT';
    doc.text(typeLabel, pageWidth - margin, 30, { align: 'right' });

    y = 55;

    // Helper: add text with word wrap and page break
    function addText(text, x, fontSize, color, fontStyle, maxWidth) {
      doc.setFontSize(fontSize);
      doc.setTextColor(color[0], color[1], color[2]);
      doc.setFont('helvetica', fontStyle || 'normal');
      
      const lines = doc.splitTextToSize(text, maxWidth || contentWidth);
      const lineHeight = fontSize * 0.5;

      lines.forEach((line) => {
        if (y + lineHeight > pageHeight - 20) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, x, y);
        y += lineHeight;
      });
    }

    // Helper: add section divider
    function addDivider() {
      if (y + 10 > pageHeight - 20) {
        doc.addPage();
        y = margin;
      }
      doc.setDrawColor(30, 50, 80);
      doc.setLineWidth(0.3);
      doc.line(margin, y, pageWidth - margin, y);
      y += 8;
    }

    if (data.type === 'chat') {
      // Single agent chat export
      // Agent info
      addText(`Agent: ${data.agentName}`, margin, 12, blue, 'bold');
      y += 4;
      addText(`Query: ${data.query || data.messages.find(m => m.role === 'user')?.content || '-'}`, margin, 9, gray, 'normal');
      y += 6;
      addDivider();

      // Messages
      data.messages.forEach((msg) => {
        const isUser = msg.role === 'user';
        const label = isUser ? '👤 USER' : `🦈 ${data.agentName.toUpperCase()}`;
        const labelColor = isUser ? [100, 255, 218] : blue;
        
        addText(label, margin, 8, labelColor, 'bold');
        y += 1;

        // Clean markdown from content
        const cleanContent = msg.content
          .replace(/\*\*(.+?)\*\*/g, '$1')
          .replace(/^[\s]*[-•]\s/gm, '  • ');

        addText(cleanContent, margin, 9, isUser ? white : [200, 210, 220], 'normal');
        y += 6;
      });

    } else if (data.type === 'collab') {
      // Multi-agent collaboration export
      // Query
      addText('PERTANYAAN', margin, 10, blue, 'bold');
      y += 2;
      addText(data.query || '-', margin, 10, white, 'normal');
      y += 4;

      // Agents used
      const agentNames = data.agentsUsed?.map(a => `${a.icon} ${a.name}`).join('  |  ') || '-';
      addText('Agen yang digunakan: ' + agentNames, margin, 8, gray, 'normal');
      y += 6;
      addDivider();

      // Executive Summary
      if (data.executiveSummary) {
        addText('🦈 EXECUTIVE SUMMARY', margin, 11, blue, 'bold');
        y += 3;

        const cleanSummary = data.executiveSummary
          .replace(/\*\*(.+?)\*\*/g, '$1')
          .replace(/^[\s]*[-•]\s/gm, '  • ');

        addText(cleanSummary, margin, 9, [200, 210, 220], 'normal');
        y += 6;
        addDivider();
      }

      // Individual agent results
      if (data.agentResults) {
        data.agentResults.forEach((result) => {
          const agentColor = hexToRgb(result.agentColor) || blue;
          
          addText(`${result.agentIcon} ${result.agentName.toUpperCase()}`, margin, 10, agentColor, 'bold');
          y += 3;

          const cleanContent = result.content
            .replace(/\*\*(.+?)\*\*/g, '$1')
            .replace(/^[\s]*[-•]\s/gm, '  • ');

          addText(cleanContent, margin, 9, [200, 210, 220], 'normal');
          y += 6;
          addDivider();
        });
      }
    }

    // Footer on last page
    doc.setFontSize(7);
    doc.setTextColor(100, 110, 130);
    doc.text(
      '© 2026 The Blue Shark — AI Multi-Agent Platform — Predator Edition',
      pageWidth / 2, pageHeight - 10, { align: 'center' }
    );

    // Save
    doc.save(filename + '.pdf');
  });
}

function hexToRgb(hex) {
  if (!hex) return null;
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16),
  ] : null;
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
