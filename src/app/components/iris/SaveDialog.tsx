import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Shield, Save, Loader2 } from 'lucide-react';

interface SaveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (authorName: string) => void;
  saving: boolean;
}

export function SaveDialog({ isOpen, onClose, onConfirm, saving }: SaveDialogProps) {
  const [name, setName] = useState('');
  const [anonymous, setAnonymous] = useState(false);

  const handleSubmit = () => {
    const authorName = anonymous ? 'Anonymous' : name.trim() || 'Anonymous';
    onConfirm(authorName);
  };

  const handleClose = () => {
    if (!saving) {
      setName('');
      setAnonymous(false);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(6px)' }}
            onClick={handleClose}
          />

          {/* Dialog */}
          <motion.div
            className="relative z-10 flex flex-col"
            style={{
              width: '400px',
              background: '#fff',
              border: '1px solid #e5e5e5',
              borderRadius: '12px',
              boxShadow: '0 16px 64px rgba(0,0,0,0.1)',
            }}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 pt-6 pb-4"
            >
              <h3
                className="tracking-[0.12em] uppercase"
                style={{ fontFamily: "'ETBembo', serif", fontSize: '14px', color: '#1a1a1a' }}
              >
                Save to Gallery
              </h3>
              <button
                onClick={handleClose}
                disabled={saving}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <X className="w-3.5 h-3.5" style={{ color: '#777' }} />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 pb-2 flex flex-col gap-5">
              {/* Privacy disclaimer */}
              <div
                className="flex gap-3 p-3.5 rounded-lg"
                style={{ background: '#fafafa', border: '1px solid #f0f0f0' }}
              >
                <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#888' }} />
                <p
                  className="text-xs leading-[1.6]"
                  style={{ fontFamily: "'ETBembo', serif", color: '#666' }}
                >
                  Your color wheel, source image thumbnail, and curated palette will be 
                  shared publicly in the gallery. The full-resolution image is never stored.
                </p>
              </div>

              {/* Name field */}
              <div className="flex flex-col gap-2">
                <label
                  className="text-[10px] tracking-[0.15em] uppercase"
                  style={{ fontFamily: "'ETBembo', serif", color: '#777' }}
                >
                  Your name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (e.target.value.trim()) setAnonymous(false);
                  }}
                  disabled={anonymous || saving}
                  placeholder="Enter your name..."
                  className="w-full px-3.5 py-2.5 rounded-lg outline-none transition-all disabled:opacity-40"
                  style={{
                    fontFamily: "'ETBembo', serif",
                    fontSize: '13px',
                    color: '#333',
                    border: '1px solid #e5e5e5',
                    background: anonymous ? '#fafafa' : '#F4F4E8',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#bbb';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e5e5';
                  }}
                />

                {/* Anonymous toggle */}
                <label
                  className="flex items-center gap-2.5 cursor-pointer select-none mt-0.5"
                  style={{ fontFamily: "'ETBembo', serif" }}
                  onClick={() => setAnonymous((prev) => !prev)}
                >
                  <div
                    className="flex items-center justify-center rounded transition-all"
                    style={{
                      width: '16px',
                      height: '16px',
                      border: anonymous ? '1px solid #333' : '1px solid #ccc',
                      background: anonymous ? '#333' : '#F4F4E8',
                      borderRadius: '4px',
                    }}
                  >
                    {anonymous && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5L4.2 7.2L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span
                    className="text-xs"
                    style={{ color: '#777' }}
                  >
                    Save anonymously
                  </span>
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-5 flex justify-end gap-3">
              <button
                onClick={handleClose}
                disabled={saving}
                className="px-4 py-2 rounded-full cursor-pointer transition-all hover:bg-black/[0.06] disabled:opacity-50"
                style={{
                  fontFamily: "'ETBembo', serif",
                  fontSize: '11px',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase' as const,
                  color: '#777',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving || (!anonymous && !name.trim())}
                className="flex items-center gap-2 px-5 py-2 rounded-full cursor-pointer transition-all hover:opacity-80 disabled:opacity-40"
                style={{
                  fontFamily: "'ETBembo', serif",
                  fontSize: '11px',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase' as const,
                  color: '#fff',
                  background: saving ? '#666' : '#222',
                  border: 'none',
                }}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    Share
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}