import { CanvasElement, MentorSession, MentorInteraction } from '../types';

interface TeachingStep {
  id: string;
  instruction: string;
  elements: CanvasElement[];
  explanation: string;
  concepts: string[];
}

class MentorService {
  private currentSession: MentorSession | null = null;
  private interactions: MentorInteraction[] = [];
  private teachingSteps: TeachingStep[] = [];
  private apiKey: string = '';

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  }

  startSession(topic: string): MentorSession {
    this.currentSession = {
      id: Date.now().toString(),
      topic,
      startTime: Date.now(),
      elements: [],
      interactions: []
    };
    this.interactions = [];
    this.teachingSteps = [];
    return this.currentSession;
  }

  async generateTeachingPlan(topic: string): Promise<TeachingStep[]> {
    if (!this.apiKey) {
      // Fallback teaching plan without API
      return this.getDefaultTeachingPlan(topic);
    }

    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(this.apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `Create a visual teaching plan for the topic: "${topic}". 
      
      Provide a structured teaching plan with 3-5 steps that can be drawn on a whiteboard. Each step should include:
      1. A clear instruction for what to draw/write
      2. An explanation of the concept
      3. Key concepts being taught
      
      Format your response as JSON with this structure:
      {
        "steps": [
          {
            "instruction": "Draw/write instruction",
            "explanation": "Concept explanation", 
            "concepts": ["concept1", "concept2"]
          }
        ]
      }
      
      Make it suitable for visual learning on a whiteboard.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const parsedResponse = JSON.parse(text);
      return parsedResponse.steps.map((step: { instruction: string; explanation: string; concepts: string[] }, index: number) => ({
        id: `step-${index}`,
        instruction: step.instruction,
        elements: [],
        explanation: step.explanation,
        concepts: step.concepts
      }));
    } catch (error) {
      console.error('Error generating teaching plan:', error);
      return this.getDefaultTeachingPlan(topic);
    }
  }

  private getDefaultTeachingPlan(topic: string): TeachingStep[] {
    // Default teaching plans for common topics
    const plans: Record<string, TeachingStep[]> = {
      'javascript functions': [
        {
          id: 'step-1',
          instruction: 'Write "function" keyword and basic syntax',
          elements: [],
          explanation: 'Functions are reusable blocks of code that perform specific tasks',
          concepts: ['function declaration', 'syntax', 'reusability']
        },
        {
          id: 'step-2', 
          instruction: 'Draw a box diagram showing input → function → output',
          elements: [],
          explanation: 'Functions take inputs (parameters) and return outputs (return values)',
          concepts: ['parameters', 'return values', 'input/output']
        },
        {
          id: 'step-3',
          instruction: 'Write an example function with parameters',
          elements: [],
          explanation: 'Parameters allow functions to work with different data each time they are called',
          concepts: ['parameters', 'arguments', 'function calls']
        }
      ],
      'react components': [
        {
          id: 'step-1',
          instruction: 'Write "function Component() { return <div>Hello</div> }"',
          elements: [],
          explanation: 'React components are JavaScript functions that return JSX elements',
          concepts: ['functional components', 'JSX', 'return statement']
        },
        {
          id: 'step-2',
          instruction: 'Draw component hierarchy tree',
          elements: [],
          explanation: 'Components can be nested inside other components to build complex UIs',
          concepts: ['component hierarchy', 'nesting', 'composition']
        }
      ]
    };

    const lowerTopic = topic.toLowerCase();
    return plans[lowerTopic] || [
      {
        id: 'step-1',
        instruction: `Write the main concept: "${topic}"`,
        elements: [],
        explanation: `Let's explore the fundamentals of ${topic}`,
        concepts: [topic]
      },
      {
        id: 'step-2',
        instruction: 'Draw key components or relationships',
        elements: [],
        explanation: 'Visual representation helps understand complex concepts',
        concepts: ['visual learning', 'concept mapping']
      }
    ];
  }

  endSession(): MentorSession | null {
    if (this.currentSession) {
      this.currentSession.endTime = Date.now();
      this.currentSession.interactions = [...this.interactions];
    }
    return this.currentSession;
  }

  addInteraction(interaction: Omit<MentorInteraction, 'id' | 'timestamp'>): void {
    const newInteraction: MentorInteraction = {
      ...interaction,
      id: Date.now().toString(),
      timestamp: Date.now()
    };
    this.interactions.push(newInteraction);
  }

  updateElements(elements: CanvasElement[]): void {
    if (this.currentSession) {
      this.currentSession.elements = elements.map(el => ({
        ...el,
        timestamp: el.timestamp || Date.now()
      }));
    }
  }

  async generateAINotes(): Promise<string> {
    if (!this.currentSession) {
      throw new Error('No active session');
    }

    if (!this.apiKey) {
      return this.generateBasicNotes();
    }

    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(this.apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      const session = this.currentSession;
      const duration = session.endTime ? session.endTime - session.startTime : Date.now() - session.startTime;
      
      // Analyze the whiteboard content
      const elementAnalysis = this.analyzeWhiteboardContent();
      const interactionSummary = this.analyzeInteractions(this.interactions);

      const prompt = `Analyze this learning session and create comprehensive AI-generated study notes.

      Session Details:
      - Topic: ${session.topic}
      - Duration: ${Math.round(duration / 1000 / 60)} minutes
      - Date: ${new Date(session.startTime).toLocaleDateString()}

      Whiteboard Content Analysis:
      - Visual elements created: ${session.elements.length}
      - Drawings/paths: ${elementAnalysis.paths}
      - Geometric shapes: ${elementAnalysis.rectangles + elementAnalysis.circles}
      - Text notes: ${elementAnalysis.texts}
      - Text content: ${elementAnalysis.textContent.join(', ')}

      Learning Interactions:
      - Questions: ${interactionSummary.questions}
      - Explanations: ${interactionSummary.explanations}
      - Notes: ${interactionSummary.notes}
      - Interaction content: ${this.interactions.map(i => i.content).join('; ')}

      Please create detailed study notes that include:
      1. Session summary
      2. Key concepts covered (extracted from text and interactions)
      3. Visual learning insights from the drawings
      4. Detailed explanations of each concept
      5. Practice exercises related to the topic
      6. Additional resources for further learning
      7. Review checklist

      Format as markdown with clear headings and bullet points. Make it comprehensive and educational.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();

    } catch (error) {
      console.error('Error generating AI notes:', error);
      return this.generateBasicNotes();
    }
  }

  private analyzeWhiteboardContent() {
    const elements = this.currentSession?.elements || [];
    const analysis = { paths: 0, rectangles: 0, circles: 0, texts: 0, textContent: [] as string[] };
    
    elements.forEach(element => {
      switch (element.type) {
        case 'path':
          analysis.paths++;
          break;
        case 'rectangle':
          analysis.rectangles++;
          break;
        case 'circle':
          analysis.circles++;
          break;
        case 'text':
          analysis.texts++;
          if (element.data.text) {
            analysis.textContent.push(element.data.text);
          }
          break;
      }
    });
    
    return analysis;
  }

  private generateBasicNotes(): string {
    const session = this.currentSession!;
    const duration = session.endTime ? session.endTime - session.startTime : Date.now() - session.startTime;
    
    let notes = `# AI Learning Notes\n\n`;
    notes += `**Topic:** ${session.topic}\n`;
    notes += `**Session Duration:** ${Math.round(duration / 1000 / 60)} minutes\n`;
    notes += `**Date:** ${new Date(session.startTime).toLocaleDateString()}\n\n`;

    notes += `## Session Summary\n\n`;
    
    // Analyze elements
    const elementStats = this.analyzeElements(session.elements);
    notes += `### Visual Elements Created\n`;
    notes += `- Drawings/Paths: ${elementStats.paths}\n`;
    notes += `- Rectangles: ${elementStats.rectangles}\n`;
    notes += `- Circles: ${elementStats.circles}\n`;
    notes += `- Text Notes: ${elementStats.texts}\n\n`;

    // Extract text content
    const textElements = session.elements.filter(el => el.type === 'text' && el.data.text);
    if (textElements.length > 0) {
      notes += `### Key Concepts Noted\n`;
      textElements.forEach(el => {
        notes += `- ${el.data.text}\n`;
      });
      notes += '\n';
    }

    // Analyze interactions
    const interactionStats = this.analyzeInteractions(this.interactions);
    notes += `### Learning Activities\n`;
    notes += `- Questions Asked: ${interactionStats.questions}\n`;
    notes += `- Explanations Given: ${interactionStats.explanations}\n`;
    notes += `- Notes Taken: ${interactionStats.notes}\n`;
    notes += `- Drawing Activities: ${interactionStats.drawings}\n\n`;

    // Add interaction content
    if (this.interactions.length > 0) {
      notes += `### Session Interactions\n`;
      this.interactions.forEach((interaction, index) => {
        const time = new Date(interaction.timestamp).toLocaleTimeString();
        notes += `${index + 1}. [${time}] ${interaction.type.toUpperCase()}: ${interaction.content}\n`;
      });
      notes += '\n';
    }

    // Generate learning insights
    notes += `## Key Learning Points\n\n`;
    notes += this.generateLearningInsights(session);

    // Add concept explanations
    notes += `\n## Concept Explanations\n\n`;
    notes += this.generateConceptExplanations(session);

    // Add practice suggestions
    notes += `\n## Suggested Practice\n\n`;
    notes += this.generatePracticeSuggestions(session);

    // Add review checklist
    notes += `\n## Review Checklist\n\n`;
    notes += `- [ ] Review all text notes from the session\n`;
    notes += `- [ ] Practice drawing the concepts from memory\n`;
    notes += `- [ ] Research additional resources on ${session.topic}\n`;
    notes += `- [ ] Apply learned concepts in practical exercises\n`;
    notes += `- [ ] Teach someone else what you learned\n\n`;

    notes += `---\n*Generated by AI Mentor on ${new Date().toLocaleDateString()}*`;

    return notes;
  }

  private analyzeElements(elements: CanvasElement[]) {
    return elements.reduce((acc, element) => {
      switch (element.type) {
        case 'path':
          acc.paths++;
          break;
        case 'rectangle':
          acc.rectangles++;
          break;
        case 'circle':
          acc.circles++;
          break;
        case 'text':
          acc.texts++;
          break;
      }
      return acc;
    }, { paths: 0, rectangles: 0, circles: 0, texts: 0 });
  }

  private analyzeInteractions(interactions: MentorInteraction[]) {
    return interactions.reduce((acc, interaction) => {
      switch (interaction.type) {
        case 'question':
          acc.questions++;
          break;
        case 'explanation':
          acc.explanations++;
          break;
        case 'note':
          acc.notes++;
          break;
        case 'drawing':
          acc.drawings++;
          break;
      }
      return acc;
    }, { questions: 0, explanations: 0, notes: 0, drawings: 0 });
  }

  private generateLearningInsights(session: MentorSession): string {
    let insights = '';
    
    if (session.elements.length > 0) {
      insights += `- You created ${session.elements.length} visual elements during this session\n`;
      
      const textElements = session.elements.filter(el => el.type === 'text');
      if (textElements.length > 0) {
        insights += `- Key concepts noted: ${textElements.map(el => el.data.text).join(', ')}\n`;
      }
      
      const drawingElements = session.elements.filter(el => el.type === 'path');
      if (drawingElements.length > 0) {
        insights += `- You practiced visual representation through ${drawingElements.length} drawings\n`;
      }
    }

    if (this.interactions.length > 0) {
      insights += `- You had ${this.interactions.length} learning interactions during this session\n`;
    }

    return insights || '- This was an exploratory session focused on visual learning\n';
  }

  private generateConceptExplanations(session: MentorSession): string {
    let explanations = '';
    
    // Extract concepts from text elements and interactions
    const concepts = new Set<string>();
    
    session.elements
      .filter(el => el.type === 'text' && el.data.text)
      .forEach(el => concepts.add(el.data.text!));
    
    this.interactions
      .filter(interaction => interaction.type === 'explanation')
      .forEach(interaction => concepts.add(interaction.content));

    if (concepts.size === 0) {
      return 'No specific concepts were identified in this session. Consider adding text notes to capture key ideas.\n';
    }

    Array.from(concepts).forEach(concept => {
      explanations += `### ${concept}\n`;
      explanations += this.generateConceptExplanation(concept);
      explanations += '\n';
    });

    return explanations;
  }

  private generateConceptExplanation(concept: string): string {
    // In a real implementation, this would use AI to generate explanations
    // For now, we'll provide generic educational content
    const commonConcepts: Record<string, string> = {
      'algorithm': 'A step-by-step procedure for solving a problem or completing a task. Algorithms are fundamental to computer science and programming.',
      'function': 'A reusable block of code that performs a specific task. Functions help organize code and avoid repetition.',
      'variable': 'A named storage location that holds data which can be modified during program execution.',
      'loop': 'A programming construct that repeats a block of code until a specified condition is met.',
      'array': 'A data structure that stores multiple values in a single variable, accessed by index numbers.',
      'object': 'A data structure that groups related data and functions together, fundamental to object-oriented programming.'
    };

    const lowerConcept = concept.toLowerCase();
    return commonConcepts[lowerConcept] || 
           `This concept was explored during your learning session. Consider researching more about "${concept}" to deepen your understanding.\n`;
  }

  private generatePracticeSuggestions(session: MentorSession): string {
    let suggestions = '';
    
    const elementCount = session.elements.length;
    const interactionCount = this.interactions.length;
    
    if (elementCount < 5) {
      suggestions += '- Try creating more visual diagrams to better understand concepts\n';
    }
    
    if (interactionCount < 3) {
      suggestions += '- Ask more questions during your learning sessions\n';
    }
    
    suggestions += '- Review these notes regularly to reinforce learning\n';
    suggestions += '- Practice drawing concepts from memory\n';
    suggestions += '- Create mind maps for complex topics\n';
    suggestions += '- Teach someone else what you learned\n';
    
    return suggestions;
  }

  addTeachingStep(step: TeachingStep): void {
    this.teachingSteps.push(step);
  }

  getTeachingSteps(): TeachingStep[] {
    return this.teachingSteps;
  }

  getCurrentTeachingStep(): TeachingStep | null {
    return this.teachingSteps.length > 0 ? this.teachingSteps[this.teachingSteps.length - 1] : null;
  }

  getCurrentSession(): MentorSession | null {
    return this.currentSession;
  }

  isSessionActive(): boolean {
    return this.currentSession !== null && !this.currentSession.endTime;
  }
}

export const mentorService = new MentorService();
