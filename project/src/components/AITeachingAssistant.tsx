import React, { useState, useEffect, useCallback } from 'react';
import { Brain, Play, SkipForward, BookOpen, Lightbulb } from 'lucide-react';
import { mentorService } from '../utils/mentorService';
import { CanvasElement } from '../types';

interface TeachingStep {
  id: string;
  instruction: string;
  elements: CanvasElement[];
  explanation: string;
  concepts: string[];
}

interface AITeachingAssistantProps {
  topic: string;
  onTeachingComplete: () => void;
  onAddElement: (instruction: string) => void;
}

const AITeachingAssistant: React.FC<AITeachingAssistantProps> = ({
  topic,
  onTeachingComplete,
  onAddElement
}) => {
  const [teachingSteps, setTeachingSteps] = useState<TeachingStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTeaching, setIsTeaching] = useState(false);

  const generateTeachingPlan = useCallback(async () => {
    setIsGenerating(true);
    try {
      const steps = await mentorService.generateTeachingPlan(topic);
      setTeachingSteps(steps);
    } catch (error) {
      console.error('Error generating teaching plan:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [topic]);

  useEffect(() => {
    generateTeachingPlan();
  }, [generateTeachingPlan]);

  const startTeaching = () => {
    setIsTeaching(true);
    setCurrentStepIndex(0);
  };

  const nextStep = () => {
    if (currentStepIndex < teachingSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // Teaching complete
      setIsTeaching(false);
      onTeachingComplete();
    }
  };

  const previousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const executeCurrentStep = () => {
    const currentStep = teachingSteps[currentStepIndex];
    if (currentStep) {
      onAddElement(currentStep.instruction);
      // Add this as an interaction
      mentorService.addInteraction({
        type: 'explanation',
        content: `Step ${currentStepIndex + 1}: ${currentStep.explanation}`
      });
    }
  };

  const currentStep = teachingSteps[currentStepIndex];

  if (isGenerating) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
          <Brain className="w-5 h-5" />
          AI Teaching Assistant
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Generating teaching plan for "{topic}"...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
        <Brain className="w-5 h-5" />
        AI Teaching Assistant
      </div>

      {!isTeaching ? (
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Teaching Plan Ready</h3>
            <p className="text-sm text-blue-600 mb-3">
              I've prepared a {teachingSteps.length}-step visual lesson for "{topic}".
            </p>
            <div className="space-y-2">
              {teachingSteps.map((step, index) => (
                <div key={step.id} className="flex items-start gap-2 text-sm">
                  <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">{step.instruction}</span>
                </div>
              ))}
            </div>
          </div>
          
          <button
            onClick={startTeaching}
            className="w-full bg-green-600 text-white px-4 py-3 rounded-md hover:bg-green-700 flex items-center justify-center gap-2 font-medium"
          >
            <Play className="w-4 h-4" />
            Start AI Teaching
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-green-800">
                Step {currentStepIndex + 1} of {teachingSteps.length}
              </h3>
              <div className="bg-green-200 text-green-800 px-2 py-1 rounded text-xs">
                Teaching in Progress
              </div>
            </div>
            
            {currentStep && (
              <div className="space-y-3">
                <div className="bg-white p-3 rounded border-l-4 border-blue-500">
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-gray-800">Instruction:</span>
                  </div>
                  <p className="text-gray-700">{currentStep.instruction}</p>
                </div>
                
                <div className="bg-white p-3 rounded border-l-4 border-purple-500">
                  <div className="flex items-center gap-2 mb-1">
                    <Lightbulb className="w-4 h-4 text-purple-600" />
                    <span className="font-medium text-gray-800">Explanation:</span>
                  </div>
                  <p className="text-gray-700">{currentStep.explanation}</p>
                </div>

                {currentStep.concepts.length > 0 && (
                  <div className="bg-white p-3 rounded border-l-4 border-orange-500">
                    <span className="font-medium text-gray-800">Key Concepts:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {currentStep.concepts.map((concept, index) => (
                        <span
                          key={index}
                          className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs"
                        >
                          {concept}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={previousStep}
              disabled={currentStepIndex === 0}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <button
              onClick={executeCurrentStep}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Execute Step
            </button>
            
            <button
              onClick={nextStep}
              className="px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-1"
            >
              {currentStepIndex === teachingSteps.length - 1 ? 'Complete' : 'Next'}
              <SkipForward className="w-3 h-3" />
            </button>
          </div>

          <div className="bg-gray-50 p-3 rounded text-center">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStepIndex + 1) / teachingSteps.length) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Progress: {currentStepIndex + 1} / {teachingSteps.length} steps
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AITeachingAssistant;
