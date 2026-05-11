"use client";

import { useEffect, useRef, useState } from "react";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Send, Loader2, User } from "lucide-react";
import { toast } from "sonner";
import { usePolicyChat } from "@/hooks/useData";
import type { ChatMessage } from "@/lib/api/types";

interface ExplainDrawerProps {
	draftId: string;
	open: boolean;
	onClose: () => void;
}

function renderMessageContent(content: string) {
	// Simple inline rendering: split on **bold** markers and bullet "•" lines.
	const lines = content.split("\n");
	return lines.map((line, i) => {
		if (!line.trim()) return <div key={i} className="h-2" />;
		const segments: React.ReactNode[] = [];
		const re = /\*\*(.+?)\*\*/g;
		let last = 0;
		let m: RegExpExecArray | null;
		let idx = 0;
		while ((m = re.exec(line)) !== null) {
			if (m.index > last) segments.push(line.slice(last, m.index));
			segments.push(
				<strong key={`b${i}-${idx++}`} className="font-semibold text-foreground">
					{m[1]}
				</strong>,
			);
			last = m.index + m[0].length;
		}
		if (last < line.length) segments.push(line.slice(last));
		return (
			<p key={i} className="leading-relaxed">
				{segments}
			</p>
		);
	});
}

function MessageBubble({ msg, streaming }: { msg: ChatMessage; streaming?: boolean }) {
	const isUser = msg.role === "user";
	return (
		<div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
			<div
				className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
					isUser ? "bg-primary text-primary-foreground" : "bg-blue-500/10 text-blue-500"
				}`}
			>
				{isUser ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
			</div>
			<div
				className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm space-y-1 ${
					isUser
						? "bg-primary text-primary-foreground rounded-tr-sm"
						: "bg-muted/60 text-foreground rounded-tl-sm"
				}`}
			>
				{msg.content ? (
					renderMessageContent(msg.content)
				) : streaming ? (
					<div className="flex items-center gap-2 text-muted-foreground">
						<Loader2 className="w-3.5 h-3.5 animate-spin" />
						<span className="text-xs">AI is thinking…</span>
					</div>
				) : null}
			</div>
		</div>
	);
}

export function ExplainDrawer({ draftId, open, onClose }: ExplainDrawerProps) {
	const { messages, loading, isStreaming, error, sendMessage, cancel } = usePolicyChat(
		open ? draftId : null,
	);
	const [input, setInput] = useState("");
	const scrollRef = useRef<HTMLDivElement>(null);
	const lastErrorRef = useRef<string | null>(null);

	useEffect(() => {
		if (!scrollRef.current) return;
		scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
	}, [messages]);

	useEffect(() => {
		if (error && error !== lastErrorRef.current) {
			lastErrorRef.current = error;
			toast.error("Chat error", { description: error });
		}
	}, [error]);

	useEffect(() => {
		if (!open) cancel();
	}, [open, cancel]);

	const onSubmit = () => {
		const text = input.trim();
		if (!text || isStreaming) return;
		setInput("");
		void sendMessage(text);
	};

	const lastMessage = messages[messages.length - 1];
	const showStreamingPlaceholder =
		isStreaming && lastMessage?.role === "assistant" && !lastMessage.content;

	return (
		<Sheet open={open} onOpenChange={(v) => !v && onClose()}>
			<SheetContent className="w-full sm:max-w-xl flex flex-col p-0 gap-0">
				<SheetHeader className="px-6 pt-6 pb-4 border-b shrink-0">
					<SheetTitle className="flex items-center gap-2">
						<Sparkles className="w-5 h-5 text-blue-500" />
						AI Policy Assistant
					</SheetTitle>
					<SheetDescription>
						Ask follow-up questions about this draft. Powered by your local LLM.
					</SheetDescription>
				</SheetHeader>

				<ScrollArea className="flex-1 min-h-0 px-6">
					<div ref={scrollRef} className="py-6 space-y-5">
						{loading ? (
							<div className="space-y-3">
								<Skeleton className="h-4 w-32" />
								<Skeleton className="h-16 w-full rounded-2xl" />
								<Skeleton className="h-4 w-40" />
								<Skeleton className="h-12 w-3/4 rounded-2xl" />
							</div>
						) : messages.length === 0 ? (
							<div className="text-center text-sm text-muted-foreground py-12">
								<Sparkles className="w-8 h-8 mx-auto mb-3 opacity-40" />
								<p>Ask anything about this policy draft.</p>
								<p className="text-xs mt-1">
									For example: <em>“Why DENY and not ALLOW?”</em>
								</p>
							</div>
						) : (
							messages.map((m, i) => (
								<MessageBubble
									key={i}
									msg={m}
									streaming={i === messages.length - 1 && showStreamingPlaceholder}
								/>
							))
						)}
					</div>
				</ScrollArea>

				<div className="border-t bg-background px-6 py-4 shrink-0">
					<div className="flex items-end gap-2">
						<Textarea
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault();
									onSubmit();
								}
							}}
							placeholder="Ask about this draft… (Enter to send, Shift+Enter for newline)"
							disabled={isStreaming || loading}
							rows={2}
							className="resize-none min-h-[60px] max-h-[140px] rounded-xl"
						/>
						<Button
							size="icon"
							onClick={isStreaming ? cancel : onSubmit}
							disabled={!isStreaming && (!input.trim() || loading)}
							className="rounded-xl h-[60px] w-[60px] shrink-0"
							variant={isStreaming ? "outline" : "default"}
							title={isStreaming ? "Stop generation" : "Send"}
						>
							{isStreaming ? (
								<Loader2 className="w-4 h-4 animate-spin" />
							) : (
								<Send className="w-4 h-4" />
							)}
						</Button>
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}
