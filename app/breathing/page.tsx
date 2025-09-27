'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

interface BreathingExercise {
  id: string;
  name: string;
  description: string;
  inhaleTime: number;
  holdTime: number;
  exhaleTime: number;
  cycles: number;
  color: string;
}

const breathingExercises: BreathingExercise[] = [
  {
    id: '4-4-4',
    name: '4-4-4 Breathing',
    description: 'Equal breathing for balance and calm',
    inhaleTime: 4,
    holdTime: 4,
    exhaleTime: 4,
    cycles: 4,
    color: 'bg-blue-500'
  },
  {
    id: '4-7-8',
    name: '4-7-8 Breathing',
    description: 'Calming technique for stress relief',
    inhaleTime: 4,
    holdTime: 7,
    exhaleTime: 8,
    cycles: 4,
    color: 'bg-green-500'
  },
  {
    id: 'box',
    name: 'Box Breathing',
    description: 'Military technique for focus and calm',
    inhaleTime: 4,
    holdTime: 4,
    exhaleTime: 4,
    cycles: 6,
    color: 'bg-purple-500'
  },
  {
    id: 'triangle',
    name: 'Triangle Breathing',
    description: 'Simple 3-step breathing exercise',
    inhaleTime: 3,
    holdTime: 0,
    exhaleTime: 3,
    cycles: 5,
    color: 'bg-orange-500'
  }
];

type BreathingPhase = 'inhale' | 'hold' | 'exhale' | 'rest';

export default function BreathingPage() {
  const [selectedExercise, setSelectedExercise] = useState<BreathingExercise | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<BreathingPhase>('rest');
  const [currentCycle, setCurrentCycle] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<HTMLDivElement>(null);

  // Calculate total time for current phase
  const getPhaseTime = (phase: BreathingPhase, exercise: BreathingExercise): number => {
    switch (phase) {
      case 'inhale': return exercise.inhaleTime;
      case 'hold': return exercise.holdTime;
      case 'exhale': return exercise.exhaleTime;
      case 'rest': return 1;
      default: return 0;
    }
  };

  // Get phase instruction text
  const getPhaseText = (phase: BreathingPhase): string => {
    switch (phase) {
      case 'inhale': return 'Breathe In';
      case 'hold': return 'Hold';
      case 'exhale': return 'Breathe Out';
      case 'rest': return 'Rest';
      default: return '';
    }
  };

  // Get phase color
  const getPhaseColor = (phase: BreathingPhase): string => {
    switch (phase) {
      case 'inhale': return 'bg-green-400';
      case 'hold': return 'bg-yellow-400';
      case 'exhale': return 'bg-blue-400';
      case 'rest': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  // Start breathing exercise
  const startExercise = (exercise: BreathingExercise) => {
    console.log('Starting exercise:', exercise.name);
    setSelectedExercise(exercise);
    setIsActive(true);
    setCurrentCycle(0);
    setCurrentPhase('inhale');
    setTimeRemaining(exercise.inhaleTime);
    setProgress(0);
    setIsCompleted(false);
  };

  // Stop breathing exercise
  const stopExercise = () => {
    setIsActive(false);
    setCurrentPhase('rest');
    setTimeRemaining(0);
    setProgress(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Reset exercise
  const resetExercise = () => {
    stopExercise();
    setSelectedExercise(null);
    setCurrentCycle(0);
    setIsCompleted(false);
  };

  // Handle timer tick
  useEffect(() => {
    if (!isActive || !selectedExercise) return;

    if (timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            const phases: BreathingPhase[] = ['inhale', 'hold', 'exhale'];
            const currentIndex = phases.indexOf(currentPhase);
            
            if (currentIndex < phases.length - 1) {
              const nextPhase = phases[currentIndex + 1];
              setCurrentPhase(nextPhase);
              setTimeRemaining(getPhaseTime(nextPhase, selectedExercise));
            } else {
              if (currentCycle < selectedExercise.cycles - 1) {
                setCurrentCycle(prev => prev + 1);
                setCurrentPhase('inhale');
                setTimeRemaining(selectedExercise.inhaleTime);
              } else {
                setIsCompleted(true);
                setIsActive(false);
                setCurrentPhase('rest');
                setTimeRemaining(0);
                if (intervalRef.current) {
                  clearInterval(intervalRef.current);
                  intervalRef.current = null;
                }
              }
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, timeRemaining, currentPhase, currentCycle, selectedExercise]);

  // Calculate progress percentage
  useEffect(() => {
    if (!selectedExercise || !isActive) return;

    const totalPhaseTime = getPhaseTime(currentPhase, selectedExercise);
    const progressPercent = ((totalPhaseTime - timeRemaining) / totalPhaseTime) * 100;
    setProgress(Math.max(0, Math.min(100, progressPercent)));
  }, [timeRemaining, currentPhase, selectedExercise, isActive]);

  // Enhanced animation effect for breathing circle
  useEffect(() => {
    if (!animationRef.current) return;

    const circle = animationRef.current;
    let scale = 1;
    let opacity = 1;

    switch (currentPhase) {
      case 'inhale':
        scale = 1.3;
        opacity = 1;
        break;
      case 'hold':
        scale = 1.2;
        opacity = 0.9;
        break;
      case 'exhale':
        scale = 0.7;
        opacity = 0.8;
        break;
      case 'rest':
        scale = 1;
        opacity = 0.7;
        break;
    }

    circle.style.transition = 'all 1s cubic-bezier(0.4, 0, 0.2, 1)';
    circle.style.transform = `scale(${scale})`;
    circle.style.opacity = opacity.toString();
  }, [currentPhase]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 relative overflow-hidden" style={{fontFamily: 'Manrope, "Noto Sans", sans-serif'}}>
      {/* Background breathing animation */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-200 rounded-full animate-pulse" style={{animationDuration: '4s'}}></div>
        <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-indigo-200 rounded-full animate-pulse" style={{animationDuration: '6s', animationDelay: '2s'}}></div>
        <div className="absolute bottom-1/4 left-1/3 w-32 h-32 bg-purple-200 rounded-full animate-pulse" style={{animationDuration: '5s', animationDelay: '1s'}}></div>
      </div>

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 relative z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-800">
              <span className="material-symbols-outlined">arrow_back_ios_new</span>
              <span>Back to Dashboard</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">Breathing Exercises</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        {!selectedExercise ? (
          /* Exercise Selection */
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Choose Your Breathing Exercise</h2>
              <p className="text-gray-600 text-lg">Select a breathing technique to help you relax and find your center</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {breathingExercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-blue-200 hover:scale-105"
                  onClick={() => {
                    console.log('Card clicked for:', exercise.name);
                    startExercise(exercise);
                  }}
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className={`w-12 h-12 rounded-full ${exercise.color} flex items-center justify-center animate-pulse`}>
                      <span className="material-symbols-outlined text-white text-xl">air</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">{exercise.name}</h3>
                      <p className="text-gray-600">{exercise.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>Inhale: {exercise.inhaleTime}s</span>
                    <span>Hold: {exercise.holdTime}s</span>
                    <span>Exhale: {exercise.exhaleTime}s</span>
                    <span>Cycles: {exercise.cycles}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      Total time: {((exercise.inhaleTime + exercise.holdTime + exercise.exhaleTime) * exercise.cycles + exercise.cycles).toFixed(0)}s
                    </span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Button clicked for:', exercise.name);
                        startExercise(exercise);
                      }}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all duration-300 transform hover:scale-105"
                    >
                      Start Exercise
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Active Exercise */
          <div className="text-center">
            {isCompleted ? (
              /* Exercise Completed */
              <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                  <span className="material-symbols-outlined text-green-500 text-4xl">check_circle</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Exercise Complete!</h2>
                <p className="text-gray-600 mb-6">Great job! You've completed the {selectedExercise.name} exercise.</p>
                <div className="space-y-3">
                  <button
                    onClick={resetExercise}
                    className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-all duration-300 transform hover:scale-105"
                  >
                    Try Another Exercise
                  </button>
                  <button
                    onClick={() => startExercise(selectedExercise)}
                    className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-all duration-300 transform hover:scale-105"
                  >
                    Repeat Exercise
                  </button>
                </div>
              </div>
            ) : (
              /* Active Exercise */
              <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedExercise.name}</h2>
                  <p className="text-gray-600">Cycle {currentCycle + 1} of {selectedExercise.cycles}</p>
                </div>

                {/* Breathing Circle Animation */}
                <div className="relative mb-8">
                  <div className="w-48 h-48 mx-auto relative">
                    {/* Outer breathing rings */}
                    <div className="absolute inset-0 rounded-full border-4 border-gray-200 animate-pulse"></div>
                    <div className="absolute inset-2 rounded-full border-2 border-gray-300 animate-pulse" style={{animationDelay: '0.5s'}}></div>
                    
                    {/* Main breathing circle */}
                    <div
                      ref={animationRef}
                      className={`w-full h-full rounded-full ${getPhaseColor(currentPhase)} transition-all duration-1000 ease-in-out flex items-center justify-center relative overflow-hidden`}
                      style={{
                        transform: 'scale(1)',
                        opacity: 1,
                        boxShadow: currentPhase === 'inhale' 
                          ? '0 0 30px rgba(59, 130, 246, 0.5)' 
                          : currentPhase === 'exhale' 
                          ? '0 0 20px rgba(59, 130, 246, 0.3)'
                          : '0 0 10px rgba(59, 130, 246, 0.2)'
                      }}
                    >
                      {/* Inner breathing pattern */}
                      <div className="absolute inset-4 rounded-full bg-white bg-opacity-20 animate-pulse"></div>
                      
                      {/* Content */}
                      <div className="text-white text-center relative z-10">
                        <div className="text-4xl font-bold mb-2 animate-pulse">{timeRemaining}</div>
                        <div className="text-lg font-medium">{getPhaseText(currentPhase)}</div>
                        {currentPhase === 'inhale' && (
                          <div className="text-sm mt-2 opacity-80">Slowly fill your lungs</div>
                        )}
                        {currentPhase === 'hold' && (
                          <div className="text-sm mt-2 opacity-80">Hold your breath</div>
                        )}
                        {currentPhase === 'exhale' && (
                          <div className="text-sm mt-2 opacity-80">Gently release</div>
                        )}
                      </div>
                    </div>
                    
                    {/* Progress Ring */}
                    <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                      <circle
                        cx="100"
                        cy="100"
                        r="90"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-gray-200"
                      />
                      <circle
                        cx="100"
                        cy="100"
                        r="90"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 90}`}
                        strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
                        className={`transition-all duration-1000 ${
                          currentPhase === 'inhale' ? 'text-green-500' :
                          currentPhase === 'hold' ? 'text-yellow-500' :
                          currentPhase === 'exhale' ? 'text-blue-500' :
                          'text-gray-500'
                        }`}
                        strokeLinecap="round"
                      />
                    </svg>

                    {/* Floating particles animation */}
                    {isActive && (
                      <>
                        <div className="absolute top-4 left-4 w-2 h-2 bg-white bg-opacity-60 rounded-full animate-bounce" style={{animationDelay: '0s', animationDuration: '2s'}}></div>
                        <div className="absolute top-8 right-6 w-1 h-1 bg-white bg-opacity-40 rounded-full animate-bounce" style={{animationDelay: '0.5s', animationDuration: '1.5s'}}></div>
                        <div className="absolute bottom-6 left-6 w-1.5 h-1.5 bg-white bg-opacity-50 rounded-full animate-bounce" style={{animationDelay: '1s', animationDuration: '2.5s'}}></div>
                        <div className="absolute bottom-4 right-4 w-1 h-1 bg-white bg-opacity-30 rounded-full animate-bounce" style={{animationDelay: '1.5s', animationDuration: '1.8s'}}></div>
                      </>
                    )}
                  </div>
                </div>

                {/* Breathing Guide */}
                <div className="mb-6">
                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      <span>Inhale</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                      <span>Hold</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                      <span>Exhale</span>
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="space-y-4">
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={stopExercise}
                      className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-all duration-300 transform hover:scale-105"
                    >
                      Stop
                    </button>
                    <button
                      onClick={resetExercise}
                      className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-all duration-300 transform hover:scale-105"
                    >
                      Reset
                    </button>
                  </div>
                  
                  <div className="text-sm text-gray-500 text-center">
                    <p className="mb-2">Follow the circle's breathing pattern</p>
                    <p className="text-xs">Inhale when it expands, exhale when it contracts</p>
                    <div className="mt-3 flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}