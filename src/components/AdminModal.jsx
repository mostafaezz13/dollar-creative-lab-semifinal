import React, { useState, useRef, useEffect, useCallback } from 'react';
import useDialog from '../hooks/useDialog.js';
import useReveal from '../hooks/useReveal.js';
import useExitTransition from '../hooks/useExitTransition.js';
import useReducedMotion from '../hooks/useReducedMotion.js';

export default function AdminModal({ projects, onSave, onClose, error }) {
  const dialogRef = useRef(null);
  const [closing,setClosing]=useState(false);
  const requestClose=useCallback(()=>setClosing(true),[]);
  const reduced=useReducedMotion();
  useDialog(dialogRef, requestClose);
  const transition=useExitTransition(dialogRef,'.admin-content');
  useEffect(()=>{
    if(!closing)return;
    const timer=setTimeout(onClose,reduced?1:240);
    return()=>clearTimeout(timer);
  },[closing,onClose,reduced]);
  const [projectList, setProjectList] = useState([...projects]);
  const [editingProject, setEditingProject] = useState(null);
  useReveal(dialogRef,'.admin-heading, .admin-actions, .admin-notice, .admin-content form > *, .admin-project-list > *',editingProject?.id);

  const handleEdit = (p) => {
    transition(()=>setEditingProject({ ...p, videoUrl: p.videoUrl || p.previewVisual || '' }));
  };

  const handleCreateNew = () => {
    const newProj = {
      id: Date.now(),
      client: "New Client",
      title: "New Project Title",
      category: "EDITING",
      role: "EDITING",
      year: new Date().getFullYear().toString(),
      videoUrl: '',
      poster: '',
      previewVisual: '',
      credits: "",
      hasCredit: false
    };
    transition(()=>setEditingProject(newProj));
  };

  const handleSaveForm = (e) => {
    e.preventDefault();
    let updated;
    const exists = projectList.some((p) => p.id === editingProject.id);
    if (exists) {
      updated = projectList.map((p) => (p.id === editingProject.id ? { ...editingProject, hasCredit: Boolean(editingProject.credits) } : p));
    } else {
      updated = [editingProject, ...projectList];
    }
    transition(()=>{setProjectList(updated);setEditingProject(null);});
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      const updated = projectList.filter((p) => p.id !== id);
      setProjectList(updated);
    }
  };

  const handleSaveAll = () => {
    if (onSave(projectList)) requestClose();
  };

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Local project manager"
      tabIndex={-1}
      onClick={requestClose}
      inert={closing ? '' : undefined}
      className={`admin-dialog${closing ? ' is-closing' : ''} fixed inset-0 z-[2500] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="admin-window relative w-full max-w-[1100px] max-h-[90vh] bg-zinc-950 border border-white/20 rounded-[8px] overflow-hidden flex flex-col text-white"
      >
        {/* Header */}
        <div className="admin-heading flex flex-wrap gap-4 justify-between items-center p-6 border-b border-white/10 bg-black">
          <div>
            <span className="font-mono text-[9px] tracking-[3px] uppercase text-white/50 block">DOLLAR LAB</span>
            <h2 className="font-serif text-[22px] tracking-[1px] uppercase">LOCAL PROJECT MANAGER</h2>
          </div>
          <div className="admin-actions flex items-center gap-3">
            <button
              type="button"
              onClick={handleCreateNew}
              className="font-mono text-[10px] font-bold tracking-[2px] uppercase py-2 px-4 bg-white text-black hover:bg-white/90 rounded"
            >
              + ADD PROJECT
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={Boolean(editingProject)}
              className="font-mono text-[10px] font-bold tracking-[2px] uppercase py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded"
            >
              SAVE &amp; APPLY
            </button>
            <button
              type="button"
              onClick={requestClose}
              aria-label="Close project manager"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
            >
              ✕
            </button>
          </div>
        </div>

        <p className="admin-notice px-6 py-3 text-xs text-white/60">Changes are saved in this browser only. They are not published to the live website.</p>
        {error && <p role="alert" className="px-6 text-sm text-red-300">{error}</p>}
        {/* Content Body */}
        <div className="admin-content flex-1 overflow-y-auto p-6">
          {editingProject ? (
            /* Edit Form */
            <form onSubmit={handleSaveForm} className="space-y-4 max-w-[700px] mx-auto py-4">
              <h3 className="font-serif text-[18px] uppercase border-b border-white/10 pb-2 mb-4">
                {projectList.some((p) => p.id === editingProject.id) ? 'Edit Project' : 'New Project'}
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[9px] tracking-[2px] uppercase text-white/60 mb-1">
                    Client Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProject.client}
                    onChange={(e) => setEditingProject({ ...editingProject, client: e.target.value })}
                    className="w-full bg-black border border-white/20 px-3 py-2 text-sm text-white font-mono rounded"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[9px] tracking-[2px] uppercase text-white/60 mb-1">
                    Project Title
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProject.title}
                    onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                    className="w-full bg-black border border-white/20 px-3 py-2 text-sm text-white font-mono rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-mono text-[9px] tracking-[2px] uppercase text-white/60 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProject.category}
                    onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value })}
                    className="w-full bg-black border border-white/20 px-3 py-2 text-sm text-white font-mono rounded"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[9px] tracking-[2px] uppercase text-white/60 mb-1">
                    Role
                  </label>
                  <input
                    type="text"
                    value={editingProject.role || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, role: e.target.value })}
                    className="w-full bg-black border border-white/20 px-3 py-2 text-sm text-white font-mono rounded"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[9px] tracking-[2px] uppercase text-white/60 mb-1">
                    Year
                  </label>
                  <input
                    type="text"
                    value={editingProject.year}
                    onChange={(e) => setEditingProject({ ...editingProject, year: e.target.value })}
                    className="w-full bg-black border border-white/20 px-3 py-2 text-sm text-white font-mono rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[9px] tracking-[2px] uppercase text-white/60 mb-1">
                  Video URL (Vimeo share link or MP4)
                </label>
                <input
                  type="url"
                  required
                  value={editingProject.videoUrl || ''}
                  onChange={(e) =>
                    setEditingProject({
                      ...editingProject,
                      videoUrl: e.target.value,
                      previewVisual: e.target.value
                    })
                  }
                  className="w-full bg-black border border-white/20 px-3 py-2 text-sm text-white font-mono rounded"
                />
              </div>

              <div>
                <label className="block font-mono text-[9px] tracking-[2px] uppercase text-white/60 mb-1">
                  Poster Image URL or /path
                </label>
                <input
                  type="text"
                  inputMode="url"
                  value={editingProject.poster || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, poster: e.target.value })}
                  className="w-full bg-black border border-white/20 px-3 py-2 text-sm text-white font-mono rounded"
                />
              </div>

              <div>
                <label className="block font-mono text-[9px] tracking-[2px] uppercase text-white/60 mb-1">
                  Credits (HTML)
                </label>
                <textarea
                  rows={4}
                  value={editingProject.credits || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, credits: e.target.value })}
                  className="w-full bg-black border border-white/20 px-3 py-2 text-sm text-white font-mono rounded"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => transition(()=>setEditingProject(null))}
                  className="px-4 py-2 font-mono text-[10px] tracking-[2px] uppercase text-white/70 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-white text-black font-mono text-[10px] font-bold tracking-[2px] uppercase hover:bg-white/90 rounded"
                >
                  Update Project
                </button>
              </div>
            </form>
          ) : (
            /* Table of Projects */
            <div className="admin-project-list space-y-2">
              {projectList.map((p, idx) => (
                <div
                  key={p.id || idx}
                  className="flex items-center justify-between p-3.5 bg-black/60 border border-white/10 rounded hover:border-white/20"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-xs opacity-40 w-6">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <div className="font-serif text-sm tracking-wide text-white font-medium">
                        {p.client} — {p.title}
                      </div>
                      <div className="font-mono text-[10px] text-white/40 uppercase">
                        {p.category} · {p.year}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(p)}
                      className="font-mono text-[9px] tracking-[2px] uppercase px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded"
                    >
                      EDIT
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id)}
                      className="font-mono text-[9px] tracking-[2px] uppercase px-3 py-1 bg-red-950/60 hover:bg-red-900 text-red-200 border border-red-800/40 rounded"
                    >
                      DELETE
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
