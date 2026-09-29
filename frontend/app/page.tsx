"use client";

import React, { useState } from "react";
import { Upload, Send, CheckCircle2, AlertCircle, Clock, ShieldCheck, Database, FileText } from "lucide-react";

interface ChatResponseData {
  question: string;
  answer: string;
  score: number;
  critique: string;
  iterations: number;
  trace: string[];
  sources: string[];
  latency_seconds: number;
}

export default function Home() {
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [question, setQuestion] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<ChatResponseData | null>(null);

  // Dynamic backend URL for Local + Production deployment
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const files = Array.from(e.target.files);
    setFileNames(files.map((f) => f.name));
    setIsUploading(true);
    setUploadStatus(`Ingesting ${files.length} document(s)...`);

    const formData = new FormData();
    // Supporting single or multiple documents
    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      // Ingest endpoint
      const endpoint = files.length > 1 
        ? `${API_BASE}/api/documents/upload-multiple` 
        : `${API_BASE}/api/documents/upload`;

      const uploadData = new FormData();
      if (files.length === 1) {
        uploadData.append("file", files[0]);
      } else {
        files.forEach((f) => uploadData.append("files", f));
      }

      const res = await fetch(endpoint, {
        method: "POST",
        body: uploadData,
      });

      const data = await res.json();
      if (res.ok) {
        setUploadStatus(`Successfully ingested ${files.length} file(s) into ChromaDB.`);
      } else {
        setUploadStatus(`Error: ${data.detail || "Upload failed"}`);
      }
    } catch {
      setUploadStatus("Error: Could not connect to backend server.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRunQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      if (res.ok) {
        setResponse(data);
      } else {
        alert(`Server error: ${data.detail || "Query failed"}`);
      }
    } catch {
      alert("Failed to communicate with backend server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col font-sans">
      {/* Enterprise Header */}
      <header className="border-b border-slate-800 bg-[#0d131f]/80 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
            R
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide">ReflectAI</h1>
            <p className="text-xs text-slate-400">Enterprise Agentic RAG with Self-Reflection</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className="flex items-center text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse" />
            Agent Active
          </span>
          <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-full border border-slate-700">
            Self-Correction: ON
          </span>
        </div>
      </header>

      {/* Main 3-Column Grid */}
      <div className="flex-1 grid grid-cols-12 gap-6 p-6">
        {/* Left Column: Document Ingestion */}
        <div className="col-span-3 bg-[#111827]/70 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-400" /> Knowledge Base
            </h2>
            <label className="border-2 border-dashed border-slate-700 hover:border-indigo-500/50 transition-all rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-900/50">
              <Upload className="w-8 h-8 text-indigo-400 mb-2" />
              <span className="text-xs font-medium text-slate-300 text-center">
                {fileNames.length > 0 ? `${fileNames.length} file(s) selected` : "Upload Handbook / Policy PDFs"}
              </span>
              <span className="text-[10px] text-slate-500 mt-1">Multi-file PDF upload supported</span>
              <input
                type="file"
                accept=".pdf"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {fileNames.length > 0 && (
              <div className="mt-3 space-y-1">
                {fileNames.map((fn, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-300 bg-slate-900/70 p-1.5 rounded border border-slate-800">
                    <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="truncate">{fn}</span>
                  </div>
                ))}
              </div>
            )}

            {uploadStatus && (
              <div className="mt-4 p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
                {uploadStatus}
              </div>
            )}
          </div>
          <div className="text-[11px] text-slate-500 border-t border-slate-800/80 pt-3">
            Persistent Vector DB: ChromaDB | FastEmbed
          </div>
        </div>

        {/* Center Column: Query Response & Verified Context */}
        <div className="col-span-6 flex flex-col space-y-4">
          <div className="flex-1 bg-[#111827]/70 border border-slate-800 rounded-xl p-5 flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Generated Response
              </h2>
              {response && (
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" /> {response.latency_seconds}s
                  </span>
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Grounded
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1">
              {response ? (
                <div className="space-y-4">
                  <div className="text-sm leading-relaxed text-slate-200 bg-slate-950/80 p-4 rounded-lg border border-slate-800/80">
                    {response.answer}
                  </div>

                  {response.sources && response.sources.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Retrieved Context Excerpts
                      </h3>
                      <div className="space-y-2">
                        {response.sources.map((src, i) => (
                          <div key={i} className="text-xs bg-slate-900/60 p-2.5 rounded border border-slate-800 text-slate-400 leading-relaxed">
                            {src}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 py-16">
                  <AlertCircle className="w-8 h-8 mb-2 stroke-1" />
                  <p className="text-sm">Ask a question to trigger the self-reflective agent loop.</p>
                </div>
              )}
            </div>
          </div>

          {/* User Prompt Input */}
          <form onSubmit={handleRunQuery} className="flex gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question from your ingested documents..."
              className="flex-1 bg-[#111827]/70 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <button
              type="submit"
              disabled={isLoading || isUploading}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-5 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
            >
              <Send className="w-4 h-4" /> {isLoading ? "Analyzing..." : "Run"}
            </button>
          </form>
        </div>

        {/* Right Column: LLM-as-a-Judge Evaluation & Workflow Trace */}
        <div className="col-span-3 bg-[#111827]/70 border border-slate-800 rounded-xl p-5 flex flex-col">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Evaluation & Trace
          </h2>

          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-slate-400">Judge Score</span>
              <span className="text-xs text-indigo-400 font-medium">
                {response ? `${response.iterations} iteration(s)` : "Idle"}
              </span>
            </div>
            <div className="text-2xl font-bold text-white">
              {response ? `${response.score}/10` : "--/10"}
            </div>
            {response?.critique && (
              <p className="text-[11px] text-slate-400 mt-2 border-t border-slate-800/80 pt-2">
                {response.critique}
              </p>
            )}
          </div>

          <div className="flex-1 flex flex-col">
            <h3 className="text-xs font-medium text-slate-400 mb-2">Workflow Trace</h3>
            <div className="flex-1 bg-slate-950/60 p-3 rounded-lg border border-slate-800/60 overflow-y-auto space-y-2 text-xs font-mono">
              {response && response.trace.length > 0 ? (
                response.trace.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    <span>{step}</span>
                  </div>
                ))
              ) : (
                <span className="text-slate-600 text-xs">No execution trace recorded.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}