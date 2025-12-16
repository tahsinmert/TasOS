'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface Note {
  id: string;
  title: string;
  content: string;
  lastEdited: string;
}

const STORAGE_KEY = 'tasos-notes';

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // localStorage'dan notları yükle
  useEffect(() => {
    const savedNotes = localStorage.getItem(STORAGE_KEY);
    if (savedNotes) {
      try {
        const parsedNotes = JSON.parse(savedNotes);
        setNotes(parsedNotes);
        if (parsedNotes.length > 0) {
          setSelectedNoteId(parsedNotes[0].id);
          setContent(parsedNotes[0].content);
        }
      } catch (error) {
        console.error('Notlar yüklenirken hata:', error);
      }
    }
  }, []);

  // Notları localStorage'a kaydet
  const saveNotes = (updatedNotes: Note[]) => {
    setNotes(updatedNotes);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotes));
  };

  // Yeni not oluştur
  const createNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Yeni Not',
      content: '',
      lastEdited: new Date().toISOString(),
    };
    const updatedNotes = [newNote, ...notes];
    saveNotes(updatedNotes);
    setSelectedNoteId(newNote.id);
    setContent('');
    // Textarea'ya focus ver
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };

  // Not seç
  const selectNote = (noteId: string) => {
    const note = notes.find((n) => n.id === noteId);
    if (note) {
      setSelectedNoteId(noteId);
      setContent(note.content);
    }
  };

  // Not içeriğini güncelle
  const updateNoteContent = (newContent: string) => {
    setContent(newContent);
    
    if (selectedNoteId) {
      const updatedNotes = notes.map((note) => {
        if (note.id === selectedNoteId) {
          // İlk satırı başlık olarak kullan, yoksa "Yeni Not"
          const lines = newContent.split('\n');
          const title = lines[0].trim() || 'Yeni Not';
          
          return {
            ...note,
            title: title.length > 50 ? title.substring(0, 50) + '...' : title,
            content: newContent,
            lastEdited: new Date().toISOString(),
          };
        }
        return note;
      });
      saveNotes(updatedNotes);
    }
  };

  // Not sil
  const deleteNote = (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedNotes = notes.filter((note) => note.id !== noteId);
    saveNotes(updatedNotes);
    
    if (selectedNoteId === noteId) {
      if (updatedNotes.length > 0) {
        setSelectedNoteId(updatedNotes[0].id);
        setContent(updatedNotes[0].content);
      } else {
        setSelectedNoteId(null);
        setContent('');
      }
    }
  };

  const selectedNote = notes.find((n) => n.id === selectedNoteId);

  return (
    <div className="h-full flex bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <div className="w-64 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-800/50 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200/50 dark:border-gray-800/50">
          <button
            onClick={createNewNote}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            Yeni Not
          </button>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto">
          {notes.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
              Henüz not yok
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {notes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => selectNote(note.id)}
                  className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedNoteId === note.id
                      ? 'bg-blue-100 dark:bg-blue-900/30'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {note.title}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {format(new Date(note.lastEdited), 'dd MMM yyyy, HH:mm')}
                      </div>
                    </div>
                    <button
                      onClick={(e) => deleteNote(note.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-all"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-gray-900 dark:to-gray-950">
        {selectedNote ? (
          <>
            {/* Header with last edited date */}
            <div className="p-4 border-b border-gray-200/30 dark:border-gray-800/30">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Son düzenleme: {format(new Date(selectedNote.lastEdited), 'dd MMMM yyyy, HH:mm')}
              </div>
            </div>

            {/* Text Area */}
            <div className="flex-1 p-6 overflow-y-auto">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => updateNoteContent(e.target.value)}
                placeholder="Notunuzu buraya yazın..."
                className="w-full h-full bg-transparent border-none outline-none resize-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-base leading-relaxed font-serif"
                style={{
                  fontFamily: 'Georgia, serif',
                }}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-400 dark:text-gray-500">
              <p className="text-lg mb-2">Not seçin veya yeni not oluşturun</p>
              <button
                onClick={createNewNote}
                className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                Yeni Not Oluştur
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

