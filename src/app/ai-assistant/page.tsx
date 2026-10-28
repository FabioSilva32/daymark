'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useDaymark } from '@/context/DaymarkContext';
import { StorageAPI } from '@/lib/storage';
import { AIMessage } from '@/types';
import { Card, CardHeader, CardTitle, Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Sparkles,
  Send,
  AlertCircle,
  CheckCircle2,
  Check,
  X,
  Key,
  Calendar,
  CheckSquare,
  ShoppingBag,
  FileText,
} from 'lucide-react';

export default function AIAssistantPage() {
  const { storageVersion, refreshStorage, addToast } = useDaymark();
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'msg_welcome',
      role: 'assistant',
      content:
        'Hello Alexandre! I am Daymark AI, your personal executive assistant. I can help you plan your schedule, break down goals into tasks, generate workout splits, or suggest weekly meal plans.',
      createdAt: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [providerConfigured, setProviderConfigured] = useState<boolean | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: AIMessage = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: query.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Collect minimum context for assistant
      const userContext = {
        tasksCount: StorageAPI.getTasks().filter((t) => t.status !== 'completed').length,
        eventsToday: StorageAPI.getEvents().length,
        habits: StorageAPI.getHabits().map((h) => h.title),
      };

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.concat(userMsg).map((m) => ({ role: m.role, content: m.content })),
          userContext,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === 'AI_PROVIDER_NOT_CONFIGURED') {
          setProviderConfigured(false);
          setMessages((prev) => [
            ...prev,
            {
              id: 'msg_' + Date.now(),
              role: 'assistant',
              content:
                'AI Provider is currently in configuration mode. To enable live AI intelligence, add your `AI_API_KEY` (e.g., from OpenAI, Anthropic, or Groq) in your environment settings or `.env`. Below is a simulated response demonstrating structured actions.',
              actionData: {
                type: 'create_task',
                payload: {
                  title: 'Plan weekly review session',
                  priority: 'high',
                  category: 'Planning',
                },
                status: 'pending',
              },
              createdAt: new Date().toISOString(),
            },
          ]);
        } else {
          throw new Error(data.message || 'API request failed');
        }
      } else {
        setProviderConfigured(true);
        setMessages((prev) => [
          ...prev,
          {
            id: 'msg_' + Date.now(),
            role: 'assistant',
            content: data.content,
            actionData: data.actionData
              ? { ...data.actionData, status: 'pending' }
              : undefined,
            createdAt: new Date().toISOString(),
          },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'msg_' + Date.now(),
          role: 'assistant',
          content: `Unable to complete AI request: ${err.message}. Please verify your provider connection.`,
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const applyAction = (msgId: string, actionData: any) => {
    if (actionData.type === 'create_task') {
      StorageAPI.saveTask({
        id: 'task_' + Date.now(),
        title: actionData.payload.title || 'AI Task',
        status: 'todo',
        priority: actionData.payload.priority || 'medium',
        category: actionData.payload.category || 'General',
        tags: ['ai-generated'],
        subtasks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      addToast('Task Created', actionData.payload.title, 'success');
    } else if (actionData.type === 'add_shopping_item') {
      const lists = StorageAPI.getShoppingLists();
      StorageAPI.saveShoppingItem({
        id: 'shop_' + Date.now(),
        listId: lists[0]?.id || 'list_default',
        name: actionData.payload.name || 'Shopping Item',
        quantity: 1,
        unit: 'item',
        estimatedPriceCents: 0,
        category: 'Groceries',
        isChecked: false,
        priority: 'normal',
        createdAt: new Date().toISOString(),
      });
      addToast('Item Added to Shopping List', actionData.payload.name, 'success');
    }

    // Mark action as accepted
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId && m.actionData
          ? { ...m, actionData: { ...m.actionData, status: 'accepted' } }
          : m
      )
    );
    refreshStorage();
  };

  const dismissAction = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId && m.actionData
          ? { ...m, actionData: { ...m.actionData, status: 'dismissed' } }
          : m
      )
    );
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#1C1C1C] shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-[#E50914]" />
            <h1 className="text-2xl md:text-3xl font-heading font-extrabold tracking-tight text-white">
              AI Personal Assistant
            </h1>
          </div>
          <p className="text-xs text-[#AAAAAA] mt-1">
            Structured executive assistant with validated actions and strict privacy boundaries.
          </p>
        </div>

        <Badge variant={providerConfigured === false ? 'warning' : 'muted'} className="text-xs">
          {providerConfigured === false ? 'Setup Required' : 'Active'}
        </Badge>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-xl p-4 rounded-xl text-xs leading-relaxed ${
                  isUser
                    ? 'bg-[#E50914] text-white font-medium rounded-br-none shadow-sm'
                    : 'bg-[#141414] border border-[#242424] text-white rounded-bl-none'
                }`}
              >
                <p className="whitespace-pre-line">{msg.content}</p>

                {/* Structured Action Card if present */}
                {msg.actionData && (
                  <div className="mt-3 p-3 bg-[#181818] border border-[#242424] rounded-lg text-xs space-y-2">
                    <div className="flex items-center gap-2 text-[#E50914] font-bold font-heading">
                      <Sparkles size={14} />
                      <span className="uppercase tracking-wider text-[10px]">
                        Proposed Action: {msg.actionData.type.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="text-[#AAAAAA] text-xs font-mono bg-[#0D0D0D] p-2 rounded-md">
                      {JSON.stringify(msg.actionData.payload, null, 2)}
                    </div>

                    {msg.actionData.status === 'pending' ? (
                      <div className="flex items-center gap-2 pt-1">
                        <Button
                          size="sm"
                          onClick={() => applyAction(msg.id, msg.actionData)}
                          className="gap-1 text-xs h-7"
                        >
                          <Check size={13} />
                          <span>Accept & Apply</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => dismissAction(msg.id)}
                          className="text-xs h-7 text-[#777777]"
                        >
                          Dismiss
                        </Button>
                      </div>
                    ) : (
                      <div className="text-[11px] font-semibold text-[#10B981] flex items-center gap-1">
                        <CheckCircle2 size={12} />
                        <span>
                          Action {msg.actionData.status === 'accepted' ? 'Applied' : 'Dismissed'}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <span className="text-[10px] text-[#777777] mt-1 px-1 font-mono">
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-[#777777] p-2">
            <span className="w-2 h-2 rounded-full bg-[#E50914] animate-ping" />
            <span>Daymark AI is thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto text-[11px] pb-1 shrink-0">
        {[
          'Help me plan my priorities for today',
          'Summarise my pending tasks and deadlines',
          'Suggest a 4-day workout routine',
          'Create a shopping list for healthy meal prep',
        ].map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="px-3 py-1.5 bg-[#141414] border border-[#242424] hover:border-[#E50914] text-[#AAAAAA] hover:text-white rounded-lg whitespace-nowrap transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="flex items-center gap-2 pt-3 border-t border-[#1C1C1C] shrink-0">
        <input
          type="text"
          placeholder="Ask Daymark AI to plan your day, schedule workouts, or organise tasks..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSend();
            }
          }}
          className="flex-1 px-3.5 py-2.5 text-sm bg-[#141414] border border-[#242424] text-white rounded-xl placeholder-[#777777] outline-none focus:border-[#E50914]"
        />
        <Button onClick={() => handleSend()} size="md" disabled={loading} className="gap-1.5 px-4">
          <Send size={15} />
          <span>Send</span>
        </Button>
      </div>
    </div>
  );
}
