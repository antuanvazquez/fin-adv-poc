'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Send,
  Paperclip,
  FileText,
  Sparkles,
  Check,
  RefreshCw,
  Loader2,
  Bot,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { getHousehold } from '@/lib/mock-data';
import { timeAgo, cn } from '@/lib/utils';
import { useAI } from '@/hooks/useAI';
import type { Message } from '@/lib/types';

export default function CommsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const household = getHousehold(id);

  const [messages, setMessages] = useState<Message[]>(
    household?.communications ?? [],
  );
  const [selectedMsgId, setSelectedMsgId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const threadEndRef = useRef<HTMLDivElement>(null);

  const ai = useAI({
    onSuccess: () => {},
    onError: (err) => showToast(err),
  });

  const selectedMessage = messages.find((m) => m.id === selectedMsgId);
  const hasAttachmentMessage = messages.find(
    (m) => m.attachments && m.attachments.length > 0,
  );

  useEffect(() => {
    if (hasAttachmentMessage && !selectedMsgId) {
      setSelectedMsgId(hasAttachmentMessage.id);
    }
  }, [hasAttachmentMessage, selectedMsgId]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    const msg: Message = {
      id: `msg-new-${Date.now()}`,
      senderId: 'adv-1',
      senderName: 'Alanna Shepherd',
      senderType: 'advisor',
      content: newMessage,
      timestamp: new Date().toISOString(),
      status: 'sent',
    };
    setMessages((prev) => [...prev, msg]);
    setNewMessage('');
  };

  const handleApprove = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId ? { ...m, status: 'approved' as const } : m,
      ),
    );
    showToast('Message approved and sent successfully');
  };

  const handleDraftResponse = async () => {
    if (!selectedMessage || !household) return;
    const plan = household.financialPlan;
    const clientContext = `Household: ${household.name}. Status: ${household.status}. Clients: ${household.clients.map(c => `${c.firstName} ${c.lastName} (age ${new Date().getFullYear() - new Date(c.dateOfBirth).getFullYear()}, ${c.occupation}, retires at ${c.retirementAge}, ${c.riskTolerance} risk tolerance)`).join('; ')}. Health Score: ${plan.healthScore}/100. Net Worth: $${plan.netWorth.netWorth.toLocaleString()}. Cash Reserve: $${plan.cashReserve.currentReserve.toLocaleString()} (goal: $${plan.cashReserve.goal.toLocaleString()}). Retirement: ${plan.retirementAssets.percentFunded}% funded ($${plan.retirementAssets.totalEarmarked.toLocaleString()} of $${plan.retirementAssets.retirementGoal.toLocaleString()}). Estate: ${plan.estatePlanning.documents.filter(d => d.completed).length}/${plan.estatePlanning.documents.length} documents complete. Active signals: ${household.signals.filter(s => s.status === 'active').map(s => s.title).join(', ') || 'None'}.`;
    const response = await ai.analyzeChat(
      'message',
      selectedMessage.content,
      clientContext,
    );
    if (response) {
      const draft: Message = {
        id: `msg-draft-${Date.now()}`,
        senderId: 'ai',
        senderName: 'AI Assistant',
        senderType: 'ai-draft',
        content: response,
        timestamp: new Date().toISOString(),
        status: 'pending-approval',
      };
      setMessages((prev) => [...prev, draft]);
    }
  };

  const handleRegenerate = async () => {
    if (!selectedMessage || !household) return;
    const plan = household.financialPlan;
    const clientContext = `Household: ${household.name}. Net Worth: $${plan.netWorth.netWorth.toLocaleString()}. Health Score: ${plan.healthScore}/100. Retirement: ${plan.retirementAssets.percentFunded}% funded. Please write a DIFFERENT response — vary the tone, structure, or angle from the previous draft.`;
    await ai.analyzeChat('message', selectedMessage.content, clientContext);
  };

  if (!household) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="text-center p-10">
          <p className="text-[#8B8FA3] text-lg">Household not found</p>
          <Link href="/clients" className="text-[#C9A962] mt-4 inline-block">
            Back to Clients
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-sm font-medium backdrop-blur-xl"
          >
            <CheckCircle2 className="w-4 h-4" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-[1600px] mx-auto"
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            href={`/clients/${id}`}
            className="flex items-center gap-2 text-[#8B8FA3] hover:text-[#F0F0F5] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </Link>
          <div className="h-5 w-px bg-[#1E2A45]" />
          <div>
            <h1 className="text-2xl font-bold text-[#F0F0F5]">
              Communication Hub{' '}
              <span className="text-[#C9A962]">— {household.name}</span>
            </h1>
            <p className="text-sm text-[#8B8FA3] mt-0.5">
              {messages.length} messages in thread
            </p>
          </div>
        </div>

        {/* Two-panel layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
          {/* Left panel — Message Thread */}
          <div className="lg:col-span-2 flex flex-col rounded-2xl border border-[#1E2A45] bg-[#131A2E]/80 backdrop-blur-xl overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg, i) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  index={i}
                  isSelected={selectedMsgId === msg.id}
                  onSelect={() => setSelectedMsgId(msg.id)}
                  onApprove={() => handleApprove(msg.id)}
                />
              ))}
              <div ref={threadEndRef} />
            </div>

            {/* Input bar */}
            <div className="border-t border-[#1E2A45] p-4">
              <div className="flex gap-3">
                <Textarea
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  rows={2}
                  className="flex-1"
                />
                <Button
                  onClick={handleSend}
                  disabled={!newMessage.trim()}
                  className="self-end"
                >
                  <Send className="w-4 h-4" />
                  Send
                </Button>
              </div>
            </div>
          </div>

          {/* Right panel — AI Assistant */}
          <div className="flex flex-col gap-4 overflow-y-auto">
            <AiPanel
              selectedMessage={selectedMessage ?? null}
              aiLoading={ai.loading}
              aiResult={ai.result}
              onDraftResponse={handleDraftResponse}
              onRegenerate={handleRegenerate}
              onApprove={() => {
                if (selectedMessage?.aiDraftResponse) {
                  const draft: Message = {
                    id: `msg-approved-${Date.now()}`,
                    senderId: 'adv-1',
                    senderName: 'Alanna Shepherd',
                    senderType: 'advisor',
                    content: selectedMessage.aiDraftResponse,
                    timestamp: new Date().toISOString(),
                    status: 'sent',
                  };
                  setMessages((prev) => [...prev, draft]);
                  showToast('AI response approved and sent');
                }
              }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function MessageBubble({
  message,
  index,
  isSelected,
  onSelect,
  onApprove,
}: {
  message: Message;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onApprove: () => void;
}) {
  const isClient = message.senderType === 'client';
  const isAiDraft = message.senderType === 'ai-draft';
  const isAdvisor = message.senderType === 'advisor';
  const hasAttachments =
    message.attachments && message.attachments.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={cn(
        'flex',
        isClient ? 'justify-start' : 'justify-end',
      )}
    >
      <div
        onClick={hasAttachments ? onSelect : undefined}
        className={cn(
          'max-w-[80%] rounded-2xl p-4 relative group',
          isClient && 'bg-[#0A0F1C] border border-[#1E2A45]',
          isAdvisor &&
            'bg-[#1E2A45] border border-[#2A3A5C]',
          isAiDraft &&
            'bg-[#1E2A45]/50 border-2 border-dashed border-[#C9A962]/40',
          hasAttachments && 'cursor-pointer',
          isSelected &&
            hasAttachments &&
            'ring-1 ring-[#C9A962]/30',
        )}
      >
        {/* Sender info */}
        <div className="flex items-center gap-2 mb-2">
          <span
            className={cn(
              'text-xs font-medium',
              isClient ? 'text-blue-400' : 'text-[#C9A962]',
            )}
          >
            {message.senderName}
          </span>
          {isAiDraft && (
            <Badge variant="gold" className="text-[10px]">
              <Bot className="w-3 h-3" />
              AI Draft
            </Badge>
          )}
          {message.status === 'approved' && (
            <Badge variant="success" className="text-[10px]">
              <Check className="w-3 h-3" />
              Approved
            </Badge>
          )}
        </div>

        {/* Content */}
        <p className="text-sm text-[#F0F0F5] whitespace-pre-wrap leading-relaxed">
          {message.content}
        </p>

        {/* Attachments */}
        {hasAttachments && (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.attachments!.map((att, i) => (
              <div
                key={i}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0A0F1C]/50 border border-[#1E2A45] text-xs text-[#8B8FA3] hover:border-[#C9A962]/30 transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-[#C9A962]" />
                {att.name}
              </div>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <p className="text-[10px] text-[#4A5068] mt-2">
          {timeAgo(message.timestamp)}
        </p>

        {/* AI Draft actions */}
        {isAiDraft && message.status === 'pending-approval' && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-[#1E2A45]">
            <Button size="sm" onClick={onApprove}>
              <Check className="w-3 h-3" />
              Approve
            </Button>
            <Button size="sm" variant="secondary">
              Edit
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function AiPanel({
  selectedMessage,
  aiLoading,
  aiResult,
  onDraftResponse,
  onRegenerate,
  onApprove,
}: {
  selectedMessage: Message | null;
  aiLoading: boolean;
  aiResult: string | null;
  onDraftResponse: () => void;
  onRegenerate: () => void;
  onApprove: () => void;
}) {
  const hasAnalysis =
    selectedMessage?.aiAnalysis || selectedMessage?.aiDraftResponse;
  const hasAttachments =
    selectedMessage?.attachments && selectedMessage.attachments.length > 0;

  if (aiLoading) {
    return (
      <Card className="flex-1 flex flex-col items-center justify-center gap-4 min-h-[400px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="w-8 h-8 text-[#C9A962]" />
        </motion.div>
        <div className="text-center">
          <p className="text-sm font-medium text-[#F0F0F5]">
            AI is processing...
          </p>
          <p className="text-xs text-[#8B8FA3] mt-1">
            Analyzing context and drafting response
          </p>
        </div>
      </Card>
    );
  }

  if (!selectedMessage || (!hasAnalysis && !hasAttachments)) {
    return (
      <Card className="flex-1 flex flex-col items-center justify-center gap-4 min-h-[400px] text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#C9A962]/10 flex items-center justify-center">
          <Sparkles className="w-7 h-7 text-[#C9A962]" />
        </div>
        <div>
          <p className="text-sm font-medium text-[#F0F0F5]">AI Assistant</p>
          <p className="text-xs text-[#8B8FA3] mt-1 max-w-[240px] mx-auto leading-relaxed">
            Select a message with an attachment to see AI analysis, or select
            any client message and click "Draft Response"
          </p>
        </div>
        {selectedMessage && selectedMessage.senderType === 'client' && (
          <Button size="sm" onClick={onDraftResponse} className="mt-2">
            <Sparkles className="w-3.5 h-3.5" />
            Draft Response
          </Button>
        )}
      </Card>
    );
  }

  return (
    <>
      {/* Document Analysis */}
      {hasAttachments && selectedMessage.aiAnalysis && (
        <Card className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <FileText className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#F0F0F5]">
                Document Analysis
              </h3>
              <p className="text-[10px] text-[#8B8FA3]">
                {selectedMessage.attachments![0].name}
              </p>
            </div>
          </div>
          <p className="text-sm text-[#8B8FA3] leading-relaxed">
            {selectedMessage.aiAnalysis}
          </p>
        </Card>
      )}

      {/* AI-generated result from hook */}
      {aiResult && !selectedMessage.aiDraftResponse && (
        <Card className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#C9A962]/10 flex items-center justify-center">
              <Bot className="w-4 h-4 text-[#C9A962]" />
            </div>
            <h3 className="text-sm font-semibold text-[#F0F0F5]">
              AI Response
            </h3>
          </div>
          <p className="text-sm text-[#8B8FA3] leading-relaxed whitespace-pre-wrap">
            {aiResult}
          </p>
        </Card>
      )}

      {/* Suggested Response */}
      {selectedMessage.aiDraftResponse && (
        <Card className="space-y-4 border-[#C9A962]/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#C9A962]/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#C9A962]" />
            </div>
            <h3 className="text-sm font-semibold text-[#F0F0F5]">
              Suggested Response
            </h3>
          </div>
          <div className="rounded-xl bg-[#0A0F1C] border border-[#1E2A45] p-4">
            <p className="text-sm text-[#F0F0F5] whitespace-pre-wrap leading-relaxed">
              {selectedMessage.aiDraftResponse}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={onApprove} className="flex-1">
              <Check className="w-4 h-4" />
              Approve & Send
            </Button>
            <Button
              variant="secondary"
              onClick={onRegenerate}
              disabled={aiLoading}
            >
              <RefreshCw className="w-4 h-4" />
              Regenerate
            </Button>
          </div>
        </Card>
      )}

      {/* Draft Response button for client messages without existing drafts */}
      {selectedMessage.senderType === 'client' &&
        !selectedMessage.aiDraftResponse && (
          <Card className="flex flex-col items-center gap-3 py-6">
            <p className="text-xs text-[#8B8FA3]">
              Generate an AI-drafted response to this message
            </p>
            <Button onClick={onDraftResponse}>
              <Sparkles className="w-4 h-4" />
              Draft Response
            </Button>
          </Card>
        )}
    </>
  );
}
