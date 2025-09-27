'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  mood: string;
  tags: string[];
  createdAt: Date;
}

const moodOptions = [
  { value: 'happy', label: 'Happy', emoji: '😊', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'sad', label: 'Sad', emoji: '😢', color: 'bg-blue-100 text-blue-800' },
  { value: 'anxious', label: 'Anxious', emoji: '😰', color: 'bg-red-100 text-red-800' },
  { value: 'calm', label: 'Calm', emoji: '😌', color: 'bg-green-100 text-green-800' },
  { value: 'excited', label: 'Excited', emoji: '🤩', color: 'bg-purple-100 text-purple-800' },
  { value: 'tired', label: 'Tired', emoji: '😴', color: 'bg-gray-100 text-gray-800' },
  { value: 'grateful', label: 'Grateful', emoji: '🙏', color: 'bg-pink-100 text-pink-800' },
  { value: 'confused', label: 'Confused', emoji: '😕', color: 'bg-orange-100 text-orange-800' }
];

const promptSuggestions = [
  "What are three things I'm grateful for today?",
  "What was the highlight of my day?",
  "What challenge did I face today and how did I handle it?",
  "How am I feeling right now and why?",
  "What did I learn about myself today?",
  "What would I like to improve tomorrow?",
  "What made me smile today?",
  "What am I looking forward to?"
];

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState<Partial<JournalEntry>>({
    title: '',
    content: '',
    mood: '',
    tags: []
  });
  const [isWriting, setIsWriting] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [showPrompts, setShowPrompts] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [viewMode, setViewMode] = useState<'write' | 'read' | 'calendar'>('write');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [currentEntry.content]);

  // Load entries from localStorage
  useEffect(() => {
    const savedEntries = localStorage.getItem('journalEntries');
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }
  }, []);

  // Save entries to localStorage
  useEffect(() => {
    localStorage.setItem('journalEntries', JSON.stringify(entries));
  }, [entries]);

  const handleSaveEntry = () => {
    if (!currentEntry.title || !currentEntry.content) {
      alert('Please fill in both title and content');
      return;
    }

    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      title: currentEntry.title,
      content: currentEntry.content,
      mood: currentEntry.mood || 'happy',
      tags: currentEntry.tags || [],
      createdAt: new Date()
    };

    setEntries(prev => [newEntry, ...prev]);
    setCurrentEntry({ title: '', content: '', mood: '', tags: [] });
    setIsWriting(false);
  };

  const handlePromptSelect = (prompt: string) => {
    setCurrentEntry(prev => ({
      ...prev,
      content: prev.content + (prev.content ? '\n\n' : '') + prompt + '\n'
    }));
    setShowPrompts(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const addTag = () => {
    if (newTag.trim() && !currentEntry.tags?.includes(newTag.trim())) {
      setCurrentEntry(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setCurrentEntry(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const startWriting = () => {
    setIsWriting(true);
    setTimeout(() => {
      if (titleRef.current) {
        titleRef.current.focus();
      }
    }, 100);
  };

  const getMoodEmoji = (mood: string) => {
    return moodOptions.find(option => option.value === mood)?.emoji || '😊';
  };

  const getMoodColor = (mood: string) => {
    return moodOptions.find(option => option.value === mood)?.color || 'bg-gray-100 text-gray-800';
  };

  // Calendar functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getEntriesForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return entries.filter(entry => entry.date === dateString);
  };

  const hasEntryForDate = (date: Date) => {
    return getEntriesForDate(date).length > 0;
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const selectDate = (date: Date) => {
    setSelectedDate(date);
    setShowCalendar(false);
  };

  const getEntriesForSelectedDate = () => {
    return getEntriesForDate(selectedDate);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100" style={{fontFamily: 'Manrope, "Noto Sans", sans-serif'}}>
      {/* Background animations */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-200 rounded-full animate-pulse" style={{animationDuration: '6s'}}></div>
        <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-pink-200 rounded-full animate-bounce" style={{animationDuration: '4s', animationDelay: '2s'}}></div>
        <div className="absolute bottom-1/4 left-1/3 w-32 h-32 bg-indigo-200 rounded-full animate-ping" style={{animationDuration: '3s', animationDelay: '1s'}}></div>
      </div>

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 relative z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 text-black hover:text-gray-800">
              <span className="material-symbols-outlined">arrow_back_ios_new</span>
              <span>Back to Dashboard</span>
            </Link>
            <h1 className="text-2xl font-bold text-black">Daily Journal</h1>
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('write')}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  viewMode === 'write' ? 'bg-purple-500 text-white' : 'bg-gray-200 text-black'
                }`}
              >
                Write
              </button>
              <button
                onClick={() => setViewMode('read')}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  viewMode === 'read' ? 'bg-purple-500 text-white' : 'bg-gray-200 text-black'
                }`}
              >
                Read
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  viewMode === 'calendar' ? 'bg-purple-500 text-white' : 'bg-gray-200 text-black'
                }`}
              >
                Calendar
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        {viewMode === 'write' ? (
          /* Writing Mode */
          <div className="space-y-6">
            {!isWriting ? (
              /* Start Writing */
              <div className="text-center">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto">
                  <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <span className="material-symbols-outlined text-purple-500 text-4xl">edit_note</span>
                  </div>
                  <h2 className="text-2xl font-bold text-black mb-4">Start Your Daily Reflection</h2>
                  <p className="text-black mb-6">Take a moment to reflect on your day and express your thoughts</p>
                  <button
                    onClick={startWriting}
                    className="bg-purple-500 text-white px-8 py-3 rounded-lg hover:bg-purple-600 transition-all duration-300 transform hover:scale-105"
                  >
                    Begin Writing
                  </button>
                </div>
              </div>
            ) : (
              /* Writing Interface */
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-black mb-4">Today's Entry</h2>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-black">
                      {new Date().toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                    <div className="flex-1"></div>
                    <button
                      onClick={() => setShowPrompts(!showPrompts)}
                      className="bg-gray-100 text-black px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    >
                      💡 Prompts
                    </button>
                  </div>
                </div>

                {/* Prompts */}
                {showPrompts && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-sm font-semibold text-black mb-3">Writing Prompts</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {promptSuggestions.map((prompt, index) => (
                        <button
                          key={index}
                          onClick={() => handlePromptSelect(prompt)}
                          className="text-left p-2 text-sm text-black hover:bg-white hover:shadow-sm rounded transition-colors"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Title Input */}
                <div className="mb-4">
                  <input
                    ref={titleRef}
                    type="text"
                    placeholder="Give your entry a title..."
                    value={currentEntry.title || ''}
                    onChange={(e) => setCurrentEntry(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full text-xl font-semibold border-none outline-none bg-transparent placeholder-gray-400 text-black"
                  />
                </div>

                {/* Mood Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-black mb-2">How are you feeling?</label>
                  <div className="flex flex-wrap gap-2">
                    {moodOptions.map((mood) => (
                      <button
                        key={mood.value}
                        onClick={() => setCurrentEntry(prev => ({ ...prev, mood: mood.value }))}
                        className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                          currentEntry.mood === mood.value
                            ? mood.color + ' ring-2 ring-purple-300'
                            : 'bg-gray-100 text-black hover:bg-gray-200'
                        }`}
                      >
                        {mood.emoji} {mood.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content Textarea */}
                <div className="mb-4">
                  <textarea
                    ref={textareaRef}
                    placeholder="Write about your day, thoughts, feelings, or anything that's on your mind..."
                    value={currentEntry.content || ''}
                    onChange={(e) => setCurrentEntry(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full min-h-[300px] p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent text-black"
                    style={{ minHeight: '300px' }}
                  />
                </div>

                {/* Tags */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-black mb-2">Tags (optional)</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {currentEntry.tags?.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center space-x-2"
                      >
                        <span>#{tag}</span>
                        <button
                          onClick={() => removeTag(tag)}
                          className="text-purple-600 hover:text-purple-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Add a tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 text-black"
                    />
                    <button
                      onClick={addTag}
                      className="bg-gray-200 text-black px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between">
                  <button
                    onClick={() => setIsWriting(false)}
                    className="bg-gray-200 text-black px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEntry}
                    className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    Save Entry
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : viewMode === 'read' ? (
          /* Reading Mode */
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-black mb-4">Your Journal Entries</h2>
              <p className="text-black">Reflect on your thoughts and experiences</p>
            </div>

            {entries.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-gray-400 text-4xl">book</span>
                </div>
                <h3 className="text-xl font-semibold text-black mb-2">No entries yet</h3>
                <p className="text-black mb-6">Start writing to see your journal entries here</p>
                <button
                  onClick={() => setViewMode('write')}
                  className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Start Writing
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {entries.map((entry) => (
                  <div key={entry.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-black mb-2">{entry.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-black">
                          <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${getMoodColor(entry.mood)}`}>
                            {getMoodEmoji(entry.mood)} {moodOptions.find(m => m.value === entry.mood)?.label}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="prose max-w-none">
                      <p className="text-black whitespace-pre-wrap">{entry.content}</p>
                    </div>
                    
                    {entry.tags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {entry.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Calendar Mode */
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-black mb-4">Journal Calendar</h2>
              <p className="text-black">Browse your journal entries by date</p>
            </div>

            {/* Calendar */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined text-black">chevron_left</span>
                </button>
                <h3 className="text-xl font-semibold text-black">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined text-black">chevron_right</span>
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-black">
                    {day}
                  </div>
                ))}
                {getDaysInMonth(currentMonth).map((date, index) => (
                  <button
                    key={index}
                    onClick={() => date && selectDate(date)}
                    className={`p-2 text-center text-sm rounded-lg transition-colors ${
                      date
                        ? hasEntryForDate(date)
                          ? 'bg-purple-500 text-white hover:bg-purple-600'
                          : 'text-black hover:bg-gray-100'
                        : ''
                    } ${
                      date && date.toDateString() === selectedDate.toDateString()
                        ? 'ring-2 ring-purple-300'
                        : ''
                    }`}
                  >
                    {date ? date.getDate() : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Date Entries */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-black mb-4">
                Entries for {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
              
              {getEntriesForSelectedDate().length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-gray-400 text-2xl">event_note</span>
                  </div>
                  <p className="text-black">No entries for this date</p>
                  <button
                    onClick={() => setViewMode('write')}
                    className="mt-4 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    Write Entry
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {getEntriesForSelectedDate().map((entry) => (
                    <div key={entry.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-lg font-semibold text-black">{entry.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs ${getMoodColor(entry.mood)}`}>
                          {getMoodEmoji(entry.mood)} {moodOptions.find(m => m.value === entry.mood)?.label}
                        </span>
                      </div>
                      <p className="text-black whitespace-pre-wrap text-sm mb-3">{entry.content}</p>
                      {entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {entry.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
