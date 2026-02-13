import { useState, useCallback, useRef, useEffect } from 'react';
import { GeneratedContent } from '../types';

interface AppState {
  prompt: string;
  content: GeneratedContent | null;
}

export const useUndoRedoState = (initialPrompt: string) => {
    // The source of truth for the UI
    const [prompt, setPromptInternal] = useState(initialPrompt);
    const [content, setContentInternal] = useState<GeneratedContent | null>(null);

    // The history stack
    const [history, setHistory] = useState<AppState[]>([{ prompt: initialPrompt, content: null }]);
    const [index, setIndex] = useState(0);

    // Sync Ref to access current state in timeout
    const stateRef = useRef({ prompt, content });
    stateRef.current = { prompt, content };

    // Helper to add to history
    const addToHistory = useCallback((newPrompt: string, newContent: GeneratedContent | null) => {
        setHistory(prev => {
            const upToCurrent = prev.slice(0, index + 1);
            return [...upToCurrent, { prompt: newPrompt, content: newContent }];
        });
        setIndex(prev => prev + 1);
    }, [index]);

    const undo = useCallback(() => {
        if (index > 0) {
            const newIndex = index - 1;
            const state = history[newIndex];
            setIndex(newIndex);
            setPromptInternal(state.prompt);
            setContentInternal(state.content);
        }
    }, [index, history]);

    const redo = useCallback(() => {
        if (index < history.length - 1) {
            const newIndex = index + 1;
            const state = history[newIndex];
            setIndex(newIndex);
            setPromptInternal(state.prompt);
            setContentInternal(state.content);
        }
    }, [index, history]);

    // Debounce Timer Ref
    const debouncedCommit = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Set Prompt (Debounced Commit)
    const setPrompt = useCallback((newPrompt: string) => {
        setPromptInternal(newPrompt);
        
        if (debouncedCommit.current) clearTimeout(debouncedCommit.current);
        
        debouncedCommit.current = setTimeout(() => {
             // Only add if changed from current history tip
             // We use stateRef to get the LATEST content when prompt settles
            addToHistory(newPrompt, stateRef.current.content);
        }, 1000);
    }, [addToHistory]);

    // Set Content (Immediate Commit - for Generation results)
    const setContent = useCallback((newContent: GeneratedContent | null) => {
        setContentInternal(newContent);
        // Clear any pending debounces to avoid overwriting this commit
        if (debouncedCommit.current) clearTimeout(debouncedCommit.current);
        addToHistory(stateRef.current.prompt, newContent);
    }, [addToHistory]);

    // Update Content (Debounced Commit - for Code Editing)
    const updateContent = useCallback((newContent: GeneratedContent) => {
        setContentInternal(newContent);
        
        if (debouncedCommit.current) clearTimeout(debouncedCommit.current);
        
        debouncedCommit.current = setTimeout(() => {
            addToHistory(stateRef.current.prompt, newContent);
        }, 2000); // 2s debounce for code editing to group typing
    }, [addToHistory]);

    return {
        prompt,
        setPrompt,
        content,
        setContent,
        updateContent,
        undo,
        redo,
        canUndo: index > 0,
        canRedo: index < history.length - 1
    };
}
