'use client';
import { useState, useCallback } from 'react';

interface UseAIOptions {
  onSuccess?: (data: string) => void;
  onError?: (error: string) => void;
}

export function useAI(options?: UseAIOptions) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzePlan = useCallback(async (planData: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planData }),
      });
      const data = await res.json();
      const text = data.analysis || data.fallback;
      setResult(text);
      options?.onSuccess?.(text);
      return text;
    } catch (e) {
      const msg = 'Failed to analyze plan';
      setError(msg);
      options?.onError?.(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, [options]);

  const analyzeChat = useCallback(async (type: 'document' | 'message', content: string, clientContext: string, mode?: 'plan-chat') => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, content, clientContext, mode }),
      });
      const data = await res.json();
      setResult(data.response);
      options?.onSuccess?.(data.response);
      return data.response;
    } catch (e) {
      const msg = 'Failed to process message';
      setError(msg);
      options?.onError?.(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, [options]);

  const generatePrep = useCallback(async (clientData: string, meetingType: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/meeting-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientData, meetingType }),
      });
      const data = await res.json();
      // data.prep is now a structured object, not a string
      const prep = typeof data.prep === 'string' ? data.prep : JSON.stringify(data.prep);
      setResult(prep);
      options?.onSuccess?.(prep);
      return data.prep; // Return the raw structured object
    } catch (e) {
      const msg = 'Failed to generate meeting prep';
      setError(msg);
      options?.onError?.(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, [options]);

  const summarizeMeeting = useCallback(async (notes: string, actionItems: string, clientContext: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'message',
          content: `Please write a professional post-meeting summary. Format it clearly with sections: Meeting Summary, Key Decisions, Action Items, and Follow-up Schedule. Use the advisor's notes and action items below.\n\nMeeting Notes:\n${notes}\n\nAction Items captured:\n${actionItems}`,
          clientContext,
        }),
      });
      const data = await res.json();
      setResult(data.response);
      options?.onSuccess?.(data.response);
      return data.response;
    } catch (e) {
      const msg = 'Failed to summarize meeting';
      setError(msg);
      options?.onError?.(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, [options]);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setLoading(false);
  }, []);

  return { loading, result, error, analyzePlan, analyzeChat, generatePrep, summarizeMeeting, reset };
}
