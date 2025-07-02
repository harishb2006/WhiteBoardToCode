// File: src/utils/aiIntegration.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { CanvasElement } from '../types';

export interface DrawingData {
  elements: CanvasElement[];
  canvas: {
    width: number;
    height: number;
  };
}

export interface GeneratedComponent {
  code: string;
  preview: string;
  filename: string;
}

export class AICodeGenerator {
  private genAI: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generateComponent(drawingData: DrawingData): Promise<GeneratedComponent> {
    try {
      const prompt = this.createPrompt(drawingData);
      const response = await this.callGeminiAPI(prompt);
      const code = this.extractCodeFromMarkdown(response);
      
      return {
        code,
        preview: this.generatePreviewFromCode(code),
        filename: this.generateFilename(drawingData)
      };
    } catch (error) {
      console.error('Error generating component:', error);
      throw new Error('Failed to generate component. Please check your API key and try again.');
    }
  }

  private createPrompt(drawingData: DrawingData): string {
    const elementsDescription = this.analyzeElements(drawingData.elements);
    const layoutDescription = this.analyzeLayout(drawingData.elements, drawingData.canvas);
    
    return `
You are an expert React developer that converts whiteboard drawings into functional React components. 

WHITEBOARD ANALYSIS:
- Canvas dimensions: ${drawingData.canvas.width}x${drawingData.canvas.height}px
- Total elements: ${drawingData.elements.length}
- Element types: ${elementsDescription.types}
- Layout pattern: ${layoutDescription}

ELEMENTS DETAILS:
${elementsDescription.details}

REQUIREMENTS:
1. Create a React TypeScript functional component
2. Use Tailwind CSS for styling
3. Make the component responsive and modern
4. Include proper TypeScript interfaces for props
5. Add hover effects and interactions where appropriate
6. If there are buttons, add onClick handlers
7. If there are forms, add proper form handling
8. Use semantic HTML elements
9. Follow React best practices

COMPONENT GUIDELINES:
- If drawing contains rectangles → create cards, buttons, or containers
- If drawing contains circles → create avatars, icons, or decorative elements  
- If drawing contains text → use as headings, labels, or content
- If drawing shows a layout → create the corresponding UI layout
- If drawing shows navigation → create nav components
- If drawing shows forms → create form components

Please generate a complete, production-ready React component. Return ONLY the code inside triple backticks with tsx language specification.
    `;
  }

  private async callGeminiAPI(prompt: string): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  private extractCodeFromMarkdown(text: string): string {
    const match = text.match(/```(?:tsx|jsx|typescript)?\n([\s\S]*?)```/);
    return match ? match[1].trim() : text;
  }

  private analyzeElements(elements: CanvasElement[]): { types: string; details: string } {
    const typeCount = elements.reduce((acc, el) => {
      acc[el.type] = (acc[el.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const types = Object.entries(typeCount)
      .map(([type, count]) => `${count} ${type}${count > 1 ? 's' : ''}`)
      .join(', ');

    const details = elements.map((el, index) => {
      let description = `${index + 1}. ${el.type.toUpperCase()}`;
      
      if (el.position) {
        description += ` at position (${Math.round(el.position.x)}, ${Math.round(el.position.y)})`;
      }
      
      if (el.dimensions) {
        description += ` with size ${Math.round(el.dimensions.width)}x${Math.round(el.dimensions.height)}`;
      }
      
      if (el.data?.text) {
        description += ` containing text: "${el.data.text}"`;
      }
      
      return description;
    }).join('\n');

    return { types, details };
  }

  private analyzeLayout(elements: CanvasElement[], canvas: { width: number; height: number }): string {
    if (elements.length === 0) return "Empty canvas";
    
    const hasText = elements.some(el => el.type === 'text');
    const hasShapes = elements.some(el => el.type === 'rectangle' || el.type === 'circle');
    const hasLines = elements.some(el => el.type === 'path');

    // Analyze positioning patterns
    const topElements = elements.filter(el => el.position.y < canvas.height * 0.3);
    const centerElements = elements.filter(el => 
      el.position.y >= canvas.height * 0.3 && el.position.y <= canvas.height * 0.7
    );
    const bottomElements = elements.filter(el => el.position.y > canvas.height * 0.7);

    let layout = "";
    if (topElements.length > 0) layout += "Header section, ";
    if (centerElements.length > 0) layout += "Main content area, ";
    if (bottomElements.length > 0) layout += "Footer section, ";

    if (hasText && hasShapes) {
      layout += "Mixed content with text and UI elements";
    } else if (hasText) {
      layout += "Text-focused design";
    } else if (hasShapes) {
      layout += "UI component layout";
    } else if (hasLines) {
      layout += "Freeform drawing";
    }

    return layout || "Simple layout";
  }

  private generatePreviewFromCode(code: string): string {
    // Extract component name and basic structure for preview
    const componentMatch = code.match(/const\s+(\w+):/);
    const componentName = componentMatch ? componentMatch[1] : 'GeneratedComponent';
    
    return `Preview of ${componentName} - A React component generated from your whiteboard drawing`;
  }

  private generateFilename(drawingData: DrawingData): string {
    const hasText = drawingData.elements.some(el => el.type === 'text' && el.data?.text);
    
    if (hasText) {
      const textElement = drawingData.elements.find(el => el.type === 'text' && el.data?.text);
      const text = textElement?.data?.text || '';
      const cleanText = text.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20);
      if (cleanText) {
        return `${cleanText}Component.tsx`;
      }
    }

    const elementTypes = [...new Set(drawingData.elements.map(el => el.type))];
    if (elementTypes.length === 1) {
      return `${elementTypes[0].charAt(0).toUpperCase()}${elementTypes[0].slice(1)}Component.tsx`;
    }

    return `GeneratedComponent.tsx`;
  }
}
