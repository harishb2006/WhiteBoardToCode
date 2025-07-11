import React, { useState } from 'react';
import { BookOpen, MessageCircle, Play, Square, FileText, Brain } from 'lucide-react';
import { mentorService } from '../utils/mentorService';
import { MentorSession } from '../types';
import AITeachingAssistant from './AITeachingAssistant';

interface MentorPanelProps {
  onSessionStart: (topic: string) => void;
  onSessionEnd: () => void;
  onAddInteraction: (type: 'question' | 'explanation' | 'note', content: string) => void;
  onAddElement: (instruction: string) => void;
  currentSession: MentorSession | null;
}

const MentorPanel: React.FC<MentorPanelProps> = ({
  onSessionStart,
  onSessionEnd,
  onAddInteraction,
  onAddElement,
  currentSession
}) => {
  const [topic, setTopic] = useState('');
  const [interactionType, setInteractionType] = useState<'question' | 'explanation' | 'note'>('note');
  const [interactionContent, setInteractionContent] = useState('');
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);
  const [showAITeacher, setShowAITeacher] = useState(false);

  const handleStartSession = () => {
    if (topic.trim()) {
      onSessionStart(topic.trim());
      setTopic('');
    }
  };

  const handleStartAITeaching = () => {
    if (topic.trim()) {
      onSessionStart(topic.trim());
      setShowAITeacher(true);
      setTopic('');
    }
  };

  const handleTeachingComplete = () => {
    setShowAITeacher(false);
  };

  const handleAddElementFromAI = (instruction: string) => {
    onAddElement(instruction);
  };

  const handleAddInteraction = () => {
    if (interactionContent.trim()) {
      onAddInteraction(interactionType, interactionContent.trim());
      setInteractionContent('');
    }
  };

  const handleDownloadNotes = async () => {
    setIsGeneratingNotes(true);
    try {
      const notes = await mentorService.generateAINotes();
      
      // Create and download the notes file
      const blob = new Blob([notes], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ai-learning-notes-${new Date().toISOString().split('T')[0]}.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating notes:', error);
      alert('Error generating notes. Please try again.');
    } finally {
      setIsGeneratingNotes(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
        <BookOpen className="w-5 h-5" />
        AI Mentor Mode
      </div>

      {!currentSession ? (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What would you like to learn today?
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., JavaScript functions, React components, algorithms..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleStartSession()}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleStartSession}
              disabled={!topic.trim()}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              Self Learning
            </button>
            <button
              onClick={handleStartAITeaching}
              disabled={!topic.trim()}
              className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Brain className="w-4 h-4" />
              AI Teacher
            </button>
          </div>
        </div>
      ) : showAITeacher ? (
        <AITeachingAssistant
          topic={currentSession.topic}
          onTeachingComplete={handleTeachingComplete}
          onAddElement={handleAddElementFromAI}
        />
      ) : (
        <div className="space-y-4">
          <div className="bg-blue-50 p-3 rounded-md">
            <div className="text-sm font-medium text-blue-800">Active Session</div>
            <div className="text-sm text-blue-600">{currentSession.topic}</div>
            <div className="text-xs text-blue-500">
              Started: {new Date(currentSession.startTime).toLocaleTimeString()}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Learning Note
              </label>
              <select
                value={interactionType}
                onChange={(e) => setInteractionType(e.target.value as 'question' | 'explanation' | 'note')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="note">📝 Note</option>
                <option value="question">❓ Question</option>
                <option value="explanation">💡 Explanation</option>
              </select>
              <textarea
                value={interactionContent}
                onChange={(e) => setInteractionContent(e.target.value)}
                placeholder="Write your note, question, or explanation..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
              <button
                onClick={handleAddInteraction}
                disabled={!interactionContent.trim()}
                className="w-full mt-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Add to Session
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onSessionEnd}
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center justify-center gap-2"
            >
              <Square className="w-4 h-4" />
              End Session
            </button>
            <button
              onClick={handleDownloadNotes}
              disabled={isGeneratingNotes}
              className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isGeneratingNotes ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  AI Notes
                </>
              )}
            </button>
          </div>

          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
        <strong>💡 Tip:</strong> Choose "AI Teacher" for guided lessons or "Self Learning" for free exploration. 
        Your session will be analyzed to generate personalized study notes.
      </div>
        </div>
      )}
    </div>
  );
};

export default MentorPanel;
