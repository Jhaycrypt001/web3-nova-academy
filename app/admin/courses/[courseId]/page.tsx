// app/admin/courses/[courseId]/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, BookOpen, FileText, CheckSquare, 
  Clock, FileVideo, Loader2, UploadCloud, Trash2, ExternalLink, Calendar, Plus
} from 'lucide-react';

interface Course { id: string; name: string; cohortId: string; }
interface Material { id: string; title: string; type: string; url: string; courseId: string; createdAt: string; }
interface Assignment { id: string; title: string; description: string; dueDate: string; courseId: string; }
interface Session { id: string; topic: string; date: string; courseId: string; }
interface Assessment { id: string; title: string; description: string; timeLimit: number; courseId: string; }

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.courseId as string;

  const [courseName, setCourseName] = useState<string>("Loading Course...");
  const [activeTab, setActiveTab] = useState<'materials' | 'assignments' | 'assessments' | 'attendance'>('materials');
  const [isLoading, setIsLoading] = useState(true);

  // --- States ---
  const [materials, setMaterials] = useState<Material[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);

  // Materials Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadData, setUploadData] = useState({ title: '', type: 'pdf' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Assignments State
  const [isAddingAssignment, setIsAddingAssignment] = useState(false);
  const [assignmentData, setAssignmentData] = useState({ title: '', description: '', dueDate: '' });

  // Attendance State
  const [isAddingSession, setIsAddingSession] = useState(false);
  const [sessionData, setSessionData] = useState({ topic: '', date: '' });

  // Assessments State
  const [isAddingAssessment, setIsAddingAssessment] = useState(false);
  const [assessmentData, setAssessmentData] = useState({ title: '', description: '', timeLimit: 30 });

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        // 1. Fetch course details
        const res = await fetch('https://cohort-portal-cmhj.onrender.com/admin/courses', { headers });
        const courses = await res.json();
        if (Array.isArray(courses)) {
          const currentCourse = courses.find((c: any) => c.id === courseId);
          if (currentCourse) setCourseName(currentCourse.name);
        }

        // 2. Fetch Materials
        const matRes = await fetch('https://cohort-portal-cmhj.onrender.com/admin/materials', { headers }).catch(() => null);
        if (matRes && matRes.ok) {
          const matData = await matRes.json();
          if (Array.isArray(matData)) setMaterials(matData.filter(m => m.courseId === courseId));
        }

        // 3. Fetch Assignments 
        const assRes = await fetch('https://cohort-portal-cmhj.onrender.com/admin/assignments', { headers }).catch(() => null);
        if (assRes && assRes.ok) {
          const assData = await assRes.json();
          if (Array.isArray(assData)) setAssignments(assData.filter(a => a.courseId === courseId));
        }

        // 4. Fetch Attendance Sessions
        const sessRes = await fetch('https://cohort-portal-cmhj.onrender.com/admin/sessions', { headers }).catch(() => null);
        if (sessRes && sessRes.ok) {
          const sessData = await sessRes.json();
          if (Array.isArray(sessData)) setSessions(sessData.filter(s => s.courseId === courseId));
        }

        // 5. Fetch Assessments
        const testRes = await fetch('https://cohort-portal-cmhj.onrender.com/admin/assessments', { headers }).catch(() => null);
        if (testRes && testRes.ok) {
          const testData = await testRes.json();
          if (Array.isArray(testData)) setAssessments(testData.filter(t => t.courseId === courseId));
        }

      } catch (error) {
        console.error("Failed to load course details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId) fetchCourseData();
  }, [courseId]);

  // --- Handlers ---

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return alert("Please select a file to upload.");
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('title', uploadData.title);
      formData.append('type', uploadData.type);
      formData.append('courseId', courseId);
      formData.append('file', selectedFile);

      const response = await fetch('https://cohort-portal-cmhj.onrender.com/admin/materials', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload material');
      const newMaterial = await response.json();
      setMaterials([newMaterial, ...materials]);
      setIsUploading(false);
      setUploadData({ title: '', type: 'pdf' });
      setSelectedFile(null);
    } catch (error: any) { alert(error.message); } finally { setIsSubmitting(false); }
  };

  const handleDeleteMaterial = async (materialId: string) => {
    if (!confirm("Delete this material?")) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`https://cohort-portal-cmhj.onrender.com/admin/materials/${materialId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setMaterials(materials.filter(m => m.id !== materialId));
    } catch (error: any) { alert(error.message); }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://cohort-portal-cmhj.onrender.com/admin/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...assignmentData, courseId }),
      });
      if (!response.ok) throw new Error("Failed to create assignment");
      const newAss = await response.json();
      setAssignments([newAss, ...assignments]);
      setIsAddingAssignment(false);
      setAssignmentData({ title: '', description: '', dueDate: '' });
    } catch (error: any) { alert(error.message); } finally { setIsSubmitting(false); }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://cohort-portal-cmhj.onrender.com/admin/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...sessionData, courseId }),
      });
      if (!response.ok) throw new Error("Failed to create session");
      const newSess = await response.json();
      setSessions([newSess, ...sessions]);
      setIsAddingSession(false);
      setSessionData({ topic: '', date: '' });
    } catch (error: any) { alert(error.message); } finally { setIsSubmitting(false); }
  };

  const handleCreateAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://cohort-portal-cmhj.onrender.com/admin/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...assessmentData, courseId }),
      });
      if (!response.ok) throw new Error("Failed to create assessment");
      const newTest = await response.json();
      setAssessments([newTest, ...assessments]);
      setIsAddingAssessment(false);
      setAssessmentData({ title: '', description: '', timeLimit: 30 });
    } catch (error: any) { alert(error.message); } finally { setIsSubmitting(false); }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <button onClick={() => window.history.back()} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors w-fit mb-4">
          <ArrowLeft size={20} /><span>Back to Cohort</span>
        </button>
        <h2 className="text-3xl font-bold text-white">{courseName}</h2>
        <p className="text-gray-400">Manage curriculum, grades, and attendance for this subject.</p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-800 overflow-x-auto hide-scrollbar">
        {[
          { id: 'materials', label: 'Materials', icon: BookOpen },
          { id: 'assignments', label: 'Assignments', icon: CheckSquare },
          { id: 'assessments', label: 'Assessments', icon: FileText },
          { id: 'attendance', label: 'Attendance', icon: Clock }
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === tab.id ? 'border-purple-500 text-purple-400 bg-purple-500/5' : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <tab.icon size={18} />{tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content Areas */}
      <div className="bg-[#111111] border border-gray-800 rounded-xl min-h-[500px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-gray-500">
            <Loader2 className="animate-spin mb-4" size={32} />
            <p>Loading course data...</p>
          </div>
        ) : (
          <>
            {/* MATERIALS TAB */}
            {activeTab === 'materials' && (
              <div className="p-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-white">Course Materials</h3>
                  <button onClick={() => setIsUploading(!isUploading)} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2">
                    <UploadCloud size={18} /><span>{isUploading ? 'Cancel Upload' : 'Upload File'}</span>
                  </button>
                </div>

                {isUploading && (
                  <form onSubmit={handleFileUpload} className="mb-8 bg-[#0A0A0A] p-6 rounded-xl border border-gray-800 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1 uppercase">Material Title</label>
                        <input type="text" required className="w-full bg-[#111111] border border-gray-800 rounded-lg px-4 py-2 text-white outline-none" value={uploadData.title} onChange={(e) => setUploadData({...uploadData, title: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1 uppercase">Format Type</label>
                        <select className="w-full bg-[#111111] border border-gray-800 rounded-lg px-4 py-2 text-white outline-none" value={uploadData.type} onChange={(e) => setUploadData({...uploadData, type: e.target.value})}>
                          <option value="pdf">PDF Document</option>
                          <option value="slide">Presentation Slide</option>
                          <option value="video">Video Lecture</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1 uppercase">Select File</label>
                      <input type="file" required className="w-full text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-500/10 file:text-purple-400" onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)} />
                    </div>
                    <button type="submit" disabled={isSubmitting} className="bg-purple-600 text-white px-6 py-2 rounded-lg flex items-center gap-2">{isSubmitting ? <Loader2 className="animate-spin" size={18} /> : "Submit Material"}</button>
                  </form>
                )}

                {materials.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {materials.map((mat) => (
                      <div key={mat.id} className="bg-[#0A0A0A] border border-gray-800 p-4 rounded-xl flex items-start justify-between group">
                        <div className="flex gap-3 items-start">
                          <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                            {mat.type === 'video' ? <FileVideo size={20} /> : <FileText size={20} />}
                          </div>
                          <div>
                            <h4 className="text-white font-medium line-clamp-1">{mat.title}</h4>
                            <p className="text-xs text-gray-500 uppercase mt-1">{mat.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <a href={mat.url} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"><ExternalLink size={18} /></a>
                          <button onClick={() => handleDeleteMaterial(mat.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg"><Trash2 size={18} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (!isUploading && <div className="text-center py-12 text-gray-500">No materials uploaded yet.</div>)}
              </div>
            )}

            {/* ASSIGNMENTS TAB */}
            {activeTab === 'assignments' && (
              <div className="p-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-white">Course Assignments</h3>
                  <button onClick={() => setIsAddingAssignment(!isAddingAssignment)} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2">
                    <Plus size={18} /><span>{isAddingAssignment ? 'Cancel' : 'New Assignment'}</span>
                  </button>
                </div>

                {isAddingAssignment && (
                  <form onSubmit={handleCreateAssignment} className="mb-8 bg-[#0A0A0A] p-6 rounded-xl border border-gray-800 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1 uppercase">Assignment Title</label>
                        <input type="text" required placeholder="e.g. Build a Smart Contract" className="w-full bg-[#111111] border border-gray-800 rounded-lg px-4 py-2 text-white outline-none" value={assignmentData.title} onChange={(e) => setAssignmentData({...assignmentData, title: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1 uppercase">Due Date</label>
                        <input type="date" required className="w-full bg-[#111111] border border-gray-800 rounded-lg px-4 py-2 text-white outline-none [color-scheme:dark]" value={assignmentData.dueDate} onChange={(e) => setAssignmentData({...assignmentData, dueDate: e.target.value})} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1 uppercase">Instructions</label>
                      <textarea required rows={3} placeholder="Describe the task..." className="w-full bg-[#111111] border border-gray-800 rounded-lg px-4 py-2 text-white outline-none" value={assignmentData.description} onChange={(e) => setAssignmentData({...assignmentData, description: e.target.value})} />
                    </div>
                    <button type="submit" disabled={isSubmitting} className="bg-purple-600 text-white px-6 py-2 rounded-lg flex items-center gap-2">{isSubmitting ? <Loader2 className="animate-spin" size={18} /> : "Publish Assignment"}</button>
                  </form>
                )}

                {assignments.length > 0 ? (
                  <div className="space-y-4">
                    {assignments.map(ass => (
                      <div key={ass.id} className="bg-[#0A0A0A] border border-gray-800 p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 group">
                        <div>
                          <h4 className="text-white font-bold text-lg">{ass.title}</h4>
                          <p className="text-gray-400 text-sm mt-1 line-clamp-1">{ass.description}</p>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          <div className="text-right">
                            <p className="text-xs text-gray-500 uppercase">Due Date</p>
                            <p className="text-purple-400 font-medium">{new Date(ass.dueDate).toLocaleDateString()}</p>
                          </div>
                          <button className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors border border-gray-700">View Submissions</button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (!isAddingAssignment && <div className="text-center py-12 text-gray-500 flex flex-col items-center"><CheckSquare size={48} className="mb-4 text-gray-700" /><p>No assignments created yet.</p></div>)}
              </div>
            )}

            {/* ATTENDANCE TAB */}
            {activeTab === 'attendance' && (
              <div className="p-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                 <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-white">Class Sessions</h3>
                  <button onClick={() => setIsAddingSession(!isAddingSession)} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2">
                    <Plus size={18} /><span>{isAddingSession ? 'Cancel' : 'New Session'}</span>
                  </button>
                </div>

                {isAddingSession && (
                  <form onSubmit={handleCreateSession} className="mb-8 bg-[#0A0A0A] p-6 rounded-xl border border-gray-800 space-y-4 flex flex-col md:flex-row items-end gap-4">
                    <div className="flex-1 w-full">
                      <label className="block text-xs font-medium text-gray-400 mb-1 uppercase">Topic / Session Name</label>
                      <input type="text" required placeholder="e.g. Week 1 Introduction" className="w-full bg-[#111111] border border-gray-800 rounded-lg px-4 py-2 text-white outline-none" value={sessionData.topic} onChange={(e) => setSessionData({...sessionData, topic: e.target.value})} />
                    </div>
                    <div className="flex-1 w-full">
                      <label className="block text-xs font-medium text-gray-400 mb-1 uppercase">Date</label>
                      <input type="date" required className="w-full bg-[#111111] border border-gray-800 rounded-lg px-4 py-2 text-white outline-none [color-scheme:dark]" value={sessionData.date} onChange={(e) => setSessionData({...sessionData, date: e.target.value})} />
                    </div>
                    <button type="submit" disabled={isSubmitting} className="bg-purple-600 text-white px-6 py-2 rounded-lg h-[42px] flex items-center justify-center min-w-[120px]">{isSubmitting ? <Loader2 className="animate-spin" size={18} /> : "Start Session"}</button>
                  </form>
                )}

                {sessions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sessions.map(sess => (
                      <div key={sess.id} className="bg-[#0A0A0A] border border-gray-800 p-5 rounded-xl hover:border-purple-500/50 transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-purple-500/10 text-purple-400 rounded-lg flex items-center justify-center">
                            <Calendar size={20} />
                          </div>
                          <div>
                            <h4 className="text-white font-bold">{sess.topic}</h4>
                            <p className="text-sm text-gray-400">{new Date(sess.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <button className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors border border-gray-700">
                          Mark Attendance
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (!isAddingSession && <div className="text-center py-12 text-gray-500 flex flex-col items-center"><Clock size={48} className="mb-4 text-gray-700" /><p>No class sessions recorded yet.</p></div>)}
              </div>
            )}

            {/* ASSESSMENTS TAB */}
            {activeTab === 'assessments' && (
              <div className="p-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-white">Course Assessments</h3>
                  <button onClick={() => setIsAddingAssessment(!isAddingAssessment)} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2">
                    <Plus size={18} /><span>{isAddingAssessment ? 'Cancel' : 'New Assessment'}</span>
                  </button>
                </div>

                {isAddingAssessment && (
                  <form onSubmit={handleCreateAssessment} className="mb-8 bg-[#0A0A0A] p-6 rounded-xl border border-gray-800 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1 uppercase">Assessment Title</label>
                        <input type="text" required placeholder="e.g. Midterm Quiz" className="w-full bg-[#111111] border border-gray-800 rounded-lg px-4 py-2 text-white outline-none" value={assessmentData.title} onChange={(e) => setAssessmentData({...assessmentData, title: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1 uppercase">Time Limit (Minutes)</label>
                        <input type="number" min="1" required className="w-full bg-[#111111] border border-gray-800 rounded-lg px-4 py-2 text-white outline-none" value={assessmentData.timeLimit} onChange={(e) => setAssessmentData({...assessmentData, timeLimit: parseInt(e.target.value) || 0})} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1 uppercase">Description / Instructions</label>
                      <textarea required rows={3} placeholder="Provide instructions for this test..." className="w-full bg-[#111111] border border-gray-800 rounded-lg px-4 py-2 text-white outline-none" value={assessmentData.description} onChange={(e) => setAssessmentData({...assessmentData, description: e.target.value})} />
                    </div>
                    <button type="submit" disabled={isSubmitting} className="bg-purple-600 text-white px-6 py-2 rounded-lg flex items-center gap-2">{isSubmitting ? <Loader2 className="animate-spin" size={18} /> : "Create Assessment Shell"}</button>
                  </form>
                )}

                {assessments.length > 0 ? (
                  <div className="space-y-4">
                    {assessments.map(assessment => (
                      <div key={assessment.id} className="bg-[#0A0A0A] border border-gray-800 p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-purple-500/50 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-purple-500/10 text-purple-400 rounded-lg flex items-center justify-center shrink-0">
                            <FileText size={24} />
                          </div>
                          <div>
                            <h4 className="text-white font-bold text-lg">{assessment.title}</h4>
                            <p className="text-gray-400 text-sm mt-1 line-clamp-1">{assessment.description}</p>
                            <p className="text-xs text-gray-400 mt-2 font-medium bg-[#111111] border border-gray-800 w-fit px-2 py-1 rounded-md flex items-center gap-1">
                              <Clock size={12} /> {assessment.timeLimit} Minutes
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <button className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors border border-gray-700">Add Questions</button>
                          <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">Results</button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (!isAddingAssessment && <div className="text-center py-12 text-gray-500 flex flex-col items-center"><FileText size={48} className="mb-4 text-gray-700" /><p>No assessments created yet.</p></div>)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}