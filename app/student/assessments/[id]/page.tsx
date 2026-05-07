// app/student/assessments/[id]/page.tsx
"use client";

const BASE = process.env.NEXT_PUBLIC_API_BASE!;

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, ArrowLeft, ExternalLink, UploadCloud } from 'lucide-react';

interface MCQQuestion { q: string; options: string[]; }
interface Assessment { id: string; title: string; type: string; dueDate: string; questions: string; }

export default function TakeAssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [mode, setMode] = useState<'mcq' | 'file_upload'>('mcq');
  const [paperUrl, setPaperUrl] = useState<string | null>(null);
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [answerFile, setAnswerFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${BASE}/student/assessments/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        setAssessment(data);
        try {
          const parsed = JSON.parse(data.questions || '');
          if (parsed?.paperUrl) { setMode('file_upload'); setPaperUrl(parsed.paperUrl); }
          else if (Array.isArray(parsed)) { setMode('mcq'); setQuestions(parsed); }
        } catch { setQuestions([]); }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleSubmitMCQ = async () => {
    if (Object.keys(answers).length < questions.length) { setError('Please answer all questions before submitting.'); return; }
    setError(''); setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE}/student/assessments/${id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();
      if (res.ok) setIsSubmitted(true);
      else setError(data.error || 'Submission failed. Try again.');
    } catch { setError('Network error. Try again.'); } finally { setIsSubmitting(false); }
  };

  const handleSubmitFile = async () => {
    if (!answerFile) { setError('Please select your answer file.'); return; }
    setError(''); setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const form = new FormData();
      form.append('file', answerFile);
      const res = await fetch(`${BASE}/student/assessments/${id}/submit-file`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form,
      });
      const data = await res.json();
      if (res.ok) setIsSubmitted(true);
      else setError(data.error || 'Submission failed. Try again.');
    } catch { setError('Network error. Try again.'); } finally { setIsSubmitting(false); }
  };

  if (isLoading) return (
    <div className="flex justify-center items-center py-32 text-gray-500">
      <Loader2 className="animate-spin mr-2" size={24} /> Loading assessment...
    </div>
  );

  if (isSubmitted) return (
    <div className="max-w-2xl mx-auto text-center py-24 space-y-4 animate-in zoom-in duration-300">
      <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle2 size={48} className="text-green-400" />
      </div>
      <h2 className="text-2xl font-bold text-white">Submitted!</h2>
      <p className="text-gray-400">
        Your {mode === 'mcq' ? 'answers' : 'answer file'} have been recorded. Results will appear in Grades once marked.
      </p>
      <button onClick={() => router.push('/student/assessments')} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-colors">
        Back to Assessments
      </button>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <button onClick={() => router.push('/student/assessments')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
        <ArrowLeft size={20} /> Back
      </button>

      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-1 rounded-md uppercase">{assessment?.type}</span>
          <span className={`text-xs px-2 py-1 rounded-md border font-medium ${mode === 'mcq' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
            {mode === 'mcq' ? 'Multiple Choice' : 'File Upload'}
          </span>
        </div>
        <h2 className="text-3xl font-bold text-white">{assessment?.title}</h2>
        <p className="text-gray-400 mt-1">
          {mode === 'mcq'
            ? `${questions.length} question${questions.length !== 1 ? 's' : ''} — answer all before submitting.`
            : 'Download the question paper, complete it, then upload your answer.'}
        </p>
      </div>

      {/* MCQ */}
      {mode === 'mcq' && (
        questions.length === 0 ? (
          <div className="bg-[#111111] border border-gray-800 rounded-xl p-12 text-center text-gray-500">
            No questions have been added yet.
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((q, i) => (
              <div key={i} className="bg-[#111111] border border-gray-800 rounded-xl p-6">
                <p className="text-white font-medium mb-4">
                  <span className="text-blue-400 font-bold mr-2">Q{i + 1}.</span>{q.q}
                </p>
                <div className="space-y-3">
                  {q.options.map((opt, j) => (
                    <label key={j} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      answers[String(i)] === opt ? 'border-blue-500 bg-blue-500/10 text-blue-300' : 'border-gray-800 hover:border-gray-600 text-gray-300'
                    }`}>
                      <input type="radio" name={`q${i}`} value={opt} checked={answers[String(i)] === opt}
                        onChange={() => setAnswers(prev => ({ ...prev, [String(i)]: opt }))} className="accent-blue-500" />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
            ))}
            {error && <p className="text-red-400 text-sm font-medium bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">{error}</p>}
            <button onClick={handleSubmitMCQ} disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900/50 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-lg">
              {isSubmitting ? <Loader2 className="animate-spin" size={22} /> : 'Submit Answers'}
            </button>
          </div>
        )
      )}

      {/* File Upload */}
      {mode === 'file_upload' && (
        <div className="space-y-6">
          {paperUrl ? (
            <div className="bg-[#111111] border border-orange-500/20 rounded-xl p-6 space-y-3">
              <p className="text-sm font-medium text-orange-400 uppercase tracking-wider">Step 1 — Download Question Paper</p>
              <a href={paperUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-white bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 px-5 py-3 rounded-lg font-medium transition-colors w-fit">
                <ExternalLink size={18} /> Open / Download Question Paper
              </a>
            </div>
          ) : (
            <div className="bg-[#111111] border border-gray-800 rounded-xl p-8 text-center text-gray-500">
              The question paper hasn't been uploaded yet. Check back later.
            </div>
          )}

          <div className="bg-[#111111] border border-gray-800 rounded-xl p-6 space-y-4">
            <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Step 2 — Upload Your Answer</p>
            <input type="file"
              className="w-full text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-500/10 file:text-blue-400 file:text-sm"
              onChange={e => setAnswerFile(e.target.files?.[0] || null)} />
          </div>

          {error && <p className="text-red-400 text-sm font-medium bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">{error}</p>}

          <button onClick={handleSubmitFile} disabled={isSubmitting || !answerFile || !paperUrl}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900/50 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-lg">
            {isSubmitting ? <Loader2 className="animate-spin" size={22} /> : <><UploadCloud size={20} /> Submit Answer File</>}
          </button>
        </div>
      )}
    </div>
  );
}
