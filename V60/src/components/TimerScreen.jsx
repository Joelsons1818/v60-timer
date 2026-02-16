import React, { useState, useEffect, useRef } from 'react';

export function TimerScreen({ recipe, onReset }) {
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    // Prep Timer State
    const [prepTimeLeft, setPrepTimeLeft] = useState(3);
    const [isPrepping, setIsPrepping] = useState(true);

    // Audio Context Ref (Persistent)
    const audioCtxRef = useRef(null);
    const lastPlayedRef = useRef(-1);
    const startTimeRef = useRef(null); // Reference for precise timing

    // Initialize or Resume Audio Context
    const ensureAudioContext = () => {
        if (!audioCtxRef.current) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                audioCtxRef.current = new AudioContext();
            }
        }
        if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
        }
    };

    // Play Silent Buffer (iOS Unlock)
    const playSilentBuffer = () => {
        try {
            if (!audioCtxRef.current) ensureAudioContext();
            const ctx = audioCtxRef.current;
            if (!ctx) return;

            // Create a short empty buffer and play it to unlock iOS audio
            const buffer = ctx.createBuffer(1, 1, 22050);
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(ctx.destination);
            source.start(0);
        } catch (e) {
            console.error("Silent buffer failed", e);
        }
    };

    // Sound Function using Persistent Context
    const playTone = (freq = 800, type = 'sine') => {
        try {
            if (!audioCtxRef.current) ensureAudioContext();
            const ctx = audioCtxRef.current;
            if (!ctx) return;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime);

            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 0.1);
        } catch (e) {
            console.error("Audio play failed", e);
        }
    };

    // Prep Timer Effect
    useEffect(() => {
        let prepInterval = null;
        if (isPrepping) {
            prepInterval = setInterval(() => {
                setPrepTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(prepInterval);
                        setIsPrepping(false);
                        setIsRunning(true);
                        startTimeRef.current = Date.now(); // Set start time for main timer
                        playTone(1500, 'triangle'); // Start sound
                        return 0;
                    }
                    playTone(800, 'sine'); // Countdown sound
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(prepInterval);
    }, [isPrepping]);

    // Main Timer Effect (Date.now() delta logic)
    useEffect(() => {
        let interval = null;
        if (isRunning && !isFinished && !isPrepping) {
            // If resuming, adjust start time based on already elapsed time
            if (!startTimeRef.current) {
                startTimeRef.current = Date.now() - (elapsedTime * 1000);
            }

            interval = setInterval(() => {
                const now = Date.now();
                const diff = Math.floor((now - startTimeRef.current) / 1000);

                if (diff >= recipe.totalTime) {
                    setElapsedTime(recipe.totalTime);
                    setIsFinished(true);
                    setIsRunning(false);
                    playTone(1500, 'triangle'); // Finish sound
                } else {
                    setElapsedTime(diff);
                }
            }, 200); // Check more frequently than 1s to catch up quickly
        } else {
            // When not running (paused), clear the ref so it resets on resume
            startTimeRef.current = null;
        }
        return () => clearInterval(interval);
    }, [isRunning, isFinished, isPrepping, recipe.totalTime]);

    // Derived State for Current Step
    const currentStepIndex = recipe.steps.findIndex((step, index) => {
        const stepStart = recipe.steps.slice(0, index).reduce((acc, s) => acc + s.duration, 0);
        const stepEnd = stepStart + step.duration;
        return elapsedTime >= stepStart && elapsedTime < stepEnd;
    });

    const stepStart = currentStepIndex !== -1
        ? recipe.steps.slice(0, currentStepIndex).reduce((acc, s) => acc + s.duration, 0)
        : 0;

    const currentStep = currentStepIndex !== -1
        ? recipe.steps[currentStepIndex]
        : (elapsedTime >= recipe.totalTime ? null : recipe.steps[0]);

    const stepDuration = currentStep ? currentStep.duration : 0;
    const timeInStep = elapsedTime - stepStart;
    const remainingInStep = Math.max(0, stepDuration - timeInStep);
    const nextStep = recipe.steps[currentStepIndex + 1];

    // Sound Effect Logic for Steps (Persistent Check)
    useEffect(() => {
        if (isRunning && !isPrepping && currentStep) {
            // Check if we are in the "alert zone" (last 3 seconds)
            const isAlertZone = remainingInStep <= 3 && remainingInStep > 0;

            // If we entered a new second that hasn't played yet
            if (isAlertZone && lastPlayedRef.current !== remainingInStep) {
                playTone(remainingInStep === 1 ? 1200 : 800);
                lastPlayedRef.current = remainingInStep;
            }

            // Reset ref if we moved to a new step (remainingInStep jumps back up)
            if (remainingInStep > 3) {
                lastPlayedRef.current = -1;
            }
        }
    }, [remainingInStep, isRunning, isPrepping, currentStep]);


    const formatTime = (totalSeconds) => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const toggleTimer = () => {
        if (isPrepping) return;

        // Unlock Audio Context (Crucial for iOS)
        ensureAudioContext();
        playSilentBuffer(); // Play silence to wake up the audio engine

        setIsRunning(!isRunning);
    };

    // Initial Audio Setup on Mount
    useEffect(() => {
        ensureAudioContext();
        return () => {
            if (audioCtxRef.current) {
                audioCtxRef.current.close();
                audioCtxRef.current = null;
            }
        }
    }, []);

    if (isPrepping) {
        return (
            <div className="timer-container center-content prep-mode" onClick={() => { ensureAudioContext(); playSilentBuffer(); }}>
                <div className="prep-display">
                    <h2>Get Ready</h2>
                    <div className="prep-count">{prepTimeLeft}</div>
                    <p className="hint">(Tap anywhere to unlock audio)</p>
                </div>
            </div>
        )
    }

    return (
        <div className="timer-container center-content">
            <div className="timer-header">
                <span className="timer-badge">
                    {isFinished ? "Done" : (isRunning ? "Brewing" : "Paused")}
                </span>
                <span className="total-time-small">
                    Total: {formatTime(elapsedTime)} / {formatTime(recipe.totalTime)}
                </span>
            </div>

            <div className="main-timer">
                {isFinished ? formatTime(recipe.totalTime) : formatTime(remainingInStep)}
            </div>

            <div className="instruction-box">
                {isFinished ? (
                    <div className="finished-message">
                        <h3>Enjoy your coffee!</h3>
                        <p>Total Brew Time: {formatTime(elapsedTime)}</p>
                        <button className="btn-primary" onClick={onReset} style={{ marginTop: '1rem' }}>
                            New Recipe
                        </button>
                    </div>
                ) : (
                    <>
                        <h2 className="step-instruction">
                            {currentStep ? currentStep.instruction : "Ready"}
                        </h2>

                        <div className="water-stats">
                            <div className="stat">
                                <span className="label">Step Pour</span>
                                <span className="value">+{currentStep?.amount || 0}ml</span>
                            </div>
                            <div className="stat divider"></div>
                            <div className="stat">
                                <span className="label">Target</span>
                                <span className="value">{currentStep?.totalAccumulated || 0}ml</span>
                            </div>
                        </div>

                        <div className={`next-step-preview ${remainingInStep <= 5 && nextStep ? 'visible' : ''}`}>
                            {nextStep && (
                                <p>
                                    Next: <strong>{nextStep.amount}ml</strong> ({nextStep.instruction})
                                </p>
                            )}
                        </div>
                    </>
                )}
            </div>

            <div className="progress-bar-container">
                {recipe.steps.map((step, idx) => {
                    let status = 'pending';
                    if (idx < currentStepIndex) status = 'completed';
                    else if (idx === currentStepIndex) status = 'active';

                    return (
                        <div
                            key={idx}
                            className={`progress-segment ${status}`}
                            style={{ flex: step.duration }}
                        ></div>
                    );
                })}
            </div>

            <div className="action-buttons">
                {!isFinished && (
                    <button className={`btn-primary ${isRunning ? 'pause' : 'start'}`} onClick={toggleTimer}>
                        {isRunning ? 'Pause' : 'Start'}
                    </button>
                )}
                <button className="btn-secondary" onClick={onReset}>
                    {isFinished ? 'Reset' : 'Stop'}
                </button>
            </div>

            {/* Recipe Footer Summary */}
            <div className="recipe-footer">
                <span>{recipe.coffeeGrams}g Coffee</span>
                <span className="divider">|</span>
                <span>{recipe.totalWater}ml Water</span>
                <span className="divider">|</span>
                <span>1:15 Ratio</span>
                <span className="divider">|</span>
                <span>{recipe.strengthPoursCount} Pours (Phase 2)</span>
            </div>
        </div>
    );
}
