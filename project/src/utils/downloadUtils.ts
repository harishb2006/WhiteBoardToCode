import { CanvasElement } from '../types';

export const downloadSVG = (elements: CanvasElement[], canvasWidth: number, canvasHeight: number) => {
  // Create SVG content
  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvasWidth}" height="${canvasHeight}" viewBox="0 0 ${canvasWidth} ${canvasHeight}">`;
  
  // Add grid background (optional)
  svgContent += '<defs><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">';
  svgContent += '<path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" stroke-width="1"/>';
  svgContent += '</pattern></defs>';
  svgContent += `<rect width="100%" height="100%" fill="white"/>`;
  svgContent += `<rect width="100%" height="100%" fill="url(#grid)"/>`;
  
  // Convert each element to SVG
  elements.forEach(element => {
    const strokeColor = element.color || '#374151';
    const strokeWidth = element.strokeWidth || 2;
    const fillColor = element.fillColor || 'transparent';
    
    switch (element.type) {
      case 'path':
        if (element.data.points && element.data.points.length > 1) {
          const pathData = element.data.points
            .map((point: { x: number; y: number }, index: number) => 
              `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
            )
            .join(' ');
          svgContent += `<path d="${pathData}" stroke="${strokeColor}" stroke-width="${strokeWidth}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
        }
        break;
      case 'rectangle':
        svgContent += `<rect x="${element.position.x}" y="${element.position.y}" width="${element.dimensions?.width || 100}" height="${element.dimensions?.height || 100}" stroke="${strokeColor}" stroke-width="${strokeWidth}" fill="${fillColor}"/>`;
        break;
      case 'circle':
        svgContent += `<circle cx="${element.position.x}" cy="${element.position.y}" r="${element.dimensions?.width || 50}" stroke="${strokeColor}" stroke-width="${strokeWidth}" fill="${fillColor}"/>`;
        break;
      case 'text':
        svgContent += `<text x="${element.position.x}" y="${element.position.y}" font-family="Inter, system-ui, sans-serif" font-size="16" fill="${strokeColor}">${element.data.text || 'Text'}</text>`;
        break;
    }
  });
  
  svgContent += '</svg>';
  
  // Create and trigger download
  const blob = new Blob([svgContent], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `whiteboard-${new Date().toISOString().split('T')[0]}.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const downloadImage = (canvas: HTMLCanvasElement, format: 'png' | 'jpg' = 'png') => {
  // Create a temporary canvas with white background
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  
  if (!tempCtx) return;
  
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  
  // Fill with white background
  tempCtx.fillStyle = 'white';
  tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
  
  // Draw the original canvas content
  tempCtx.drawImage(canvas, 0, 0);
  
  // Convert to blob and download
  tempCanvas.toBlob((blob) => {
    if (!blob) return;
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `whiteboard-${new Date().toISOString().split('T')[0]}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, `image/${format}`, 0.9);
};

export const downloadPDF = async (canvas: HTMLCanvasElement) => {
  // Note: This requires jsPDF library to be installed
  // For now, we'll convert to image and let user save as PDF manually
  // You can implement proper PDF generation by installing jsPDF
  try {
    const { jsPDF } = await import('jspdf');
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });
    
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`whiteboard-${new Date().toISOString().split('T')[0]}.pdf`);
  } catch {
    console.warn('PDF export requires jsPDF library. Falling back to PNG download.');
    downloadImage(canvas, 'png');
  }
};

export const downloadNotes = (notes: string, filename?: string) => {
  const blob = new Blob([notes], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `ai-learning-notes-${new Date().toISOString().split('T')[0]}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
