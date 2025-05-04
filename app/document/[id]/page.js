'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useUser } from '@/context/context';
import { useParams } from 'next/navigation';
import Cookies from 'js-cookie';
import axios from 'axios';
import html2pdf from 'html2pdf.js';
import { MdDownload, MdEdit } from 'react-icons/md';
import { CiSaveUp2 } from "react-icons/ci";
import 'quill/dist/quill.snow.css';
import 'highlight.js/styles/github.css';
import styles from './page.module.css';

export default function DocumentEditor() {
    const { id } = useParams();
    const { user } = useUser();
    const token = Cookies.get('AuthToken');

    const editorRef = useRef(null);
    const quillInstance = useRef(null);

    const [document, setDocument] = useState(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState(null);
    const [toast, setToast] = useState(null);
    const [autoSaveToast, setAutoSaveToast] = useState(null);
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);

    const saveIcon = <CiSaveUp2 />

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    useEffect(() => {
        const fetchDocument = async () => {
            try {
                const response = await axios.get(`https://localhost:8000/api/v1/document/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    withCredentials: true,
                });

                if (response.status === 200) {
                    const data = response.data.data;
                    setDocument(data);
                    setTitle(data.title);
                    const parsedContent = JSON.parse(data.content || '{"ops":[{"insert":"\\n"}]}');
                    setContent(parsedContent);
                    setIsLoaded(true);
                } else {
                    console.error('(By me)Failed to fetch document:', response.data.message);
                }
            } catch (error) {
                console.error('Error fetching document:', error);
            }
        };

        fetchDocument();
    }, [id, token]);

    const debouncedSave = useCallback(
        debounce(async (content, title) => {
            try {
                const response = await axios.put(
                    `https://localhost:8000/api/v1/document/${id}`,
                    {
                        title,
                        content: JSON.stringify(content)
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                        },
                        withCredentials: true,
                    }
                );

                if (response.status === 200) {
                    setAutoSaveToast(saveIcon);
                    setTimeout(() => {
                        setAutoSaveToast(null);
                    }, 2000);
                    console.log('Document auto-saved successfully!');
                }
            } catch (error) {
                console.error('Error auto-saving document:', error);
            }
        }, 2000),
        [id, token]
    );

    useEffect(() => {
        const initQuill = async () => {
            if (editorRef.current && !quillInstance.current) {
                const Quill = (await import('quill')).default;
                const hljs = (await import('highlight.js')).default;

                // Register page break blot
                const BlockEmbed = Quill.import('blots/block/embed');
                class PageBreak extends BlockEmbed {
                    static create() {
                        const node = super.create();
                        node.classList.add('page-break');
                        return node;
                    }
                }
                PageBreak.blotName = 'pageBreak';
                PageBreak.tagName = 'hr';
                Quill.register(PageBreak);

                quillInstance.current = new Quill(editorRef.current, {
                    theme: 'snow',
                    placeholder: 'Start typing your document...',
                    modules: {
                        syntax: { hljs },
                        toolbar: [
                            [{ header: [1, 2, 3, false] }],
                            ['bold', 'italic', 'underline', 'strike'],
                            [{ list: 'ordered' }, { list: 'bullet' }],
                            ['link', 'image'],
                            ['clean'],
                            ['code-block'],
                            [{ color: [] }, { background: [] }],
                            [{ align: [] }],
                            ['pageBreak'] // Add page break button
                        ],
                        keyboard: {
                            bindings: {
                                'shift+enter': {
                                    handler: function () {
                                        const range = this.quill.getSelection();
                                        if (range) {
                                            this.quill.insertText(range.index, '\n');
                                        }
                                    }
                                }
                            }
                        }
                    }
                });

                // Add page break handler
                const toolbar = quillInstance.current.getModule('toolbar');
                toolbar.addHandler('pageBreak', () => {
                    const range = quillInstance.current.getSelection(true);
                    quillInstance.current.insertEmbed(range.index, 'pageBreak', true, 'user');
                    quillInstance.current.setSelection(range.index + 1, 0);
                });

                if (content) {
                    quillInstance.current.setContents(content);
                }

                quillInstance.current.on('text-change', () => {
                    const delta = quillInstance.current.getContents();
                    setContent(delta);
                    debouncedSave(delta, title);
                });
            }
        };

        if (isLoaded) initQuill();
    }, [isLoaded, content]);

    const saveDocument = async () => {
        if (!title.trim()) {
            setTitle('Untitled Document');
        }

        try {
            const response = await axios.put(
                `https://localhost:8000/api/v1/document/${id}`,
                {
                    title,
                    content: JSON.stringify(content)
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    withCredentials: true,
                }
            );

            if (response.status === 200) {
                setToast('Document saved successfully!');
                setTimeout(() => {
                    setToast(null);
                }, 3000);
            } else {
                setToast('Failed to save document.');
                setTimeout(() => {
                    setToast(null);
                }, 3000);
            }
        } catch (error) {
            console.error('Error saving document:', error);
            setToast('An error occurred while saving.');
            setTimeout(() => {
                setToast(null);
            }, 3000);
        }
    };

    const downloadAsPDF = () => {
        const content = editorRef.current.querySelector('.ql-editor');

        html2pdf()
            .from(content)
            .set({
                filename: `${title}.pdf`,
                margin: 1,
                jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, logging: true, useCORS: true },
            })
            .save();
    };

    const downloadDOCX = async () => {
        console.log('Starting download as DOCX...');
        try {
            const response = await axios.get(`https://localhost:8000/api/v1/document/${id}/download`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                },
                responseType: 'blob',
            });
            console.log('Response after download:', response);

            const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${title}.docx`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error('Error downloading document:', error);
            setToast('An error occurred while downloading.');
            setTimeout(() => {
                setToast(null);
            }, 3000);
        }
    }

    if (!isLoaded) return <div className="p-6 text-gray-600">Loading document...</div>;

    return (
        <div className='flex gap-4 justify-center items-start h-screen'>
            <div className='border w-[400px] h-full'>
                <div className='flex items-center justify-between p-4 border-b'>
                    <h2 className='text-xl font-semibold'>Document Info</h2>
                    <button onClick={saveDocument} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        {saveIcon}
                    </button>
                </div>
                <div className='p-4'>
                    <p><strong>Title:</strong> {title}</p>
                    <p><strong>Author:</strong> {user.username}</p>
                    <p><strong>Created At:</strong> {new Date(document.createdAt).toLocaleDateString()}</p>
                </div>
                <div className='p-4 border-t'>
                    <h3 className='text-lg font-semibold'>Document History</h3>
                    <ul className='list-disc pl-5'>
                        <li>Version 1.0 - Initial creation</li>
                        <li>Version 1.1 - Minor edits</li>
                        <li>Version 1.2 - Added images</li>
                    </ul>
                </div>
            </div>

            <div className={styles.editorWrapper}>
                <input
                    type="text"
                    placeholder="Document Title"
                    value={title}
                    onChange={(e) => {
                        setTitle(e.target.value)
                        if (e.target.value.trim()) {
                            debouncedSave(content, e.target.value);
                        } else {
                            setAutoSaveToast(null);
                        }
                    }}
                    className="w-[7.7in] text-3xl font-semibold border-b-2 border-gray-300 mb-6 outline-none"
                />

                <div className={styles.container}>
                    <div
                        ref={editorRef}
                        className={styles.editor}
                    ></div>
                </div>

                <div className="flex gap-4 mt-6">
                    <button
                        onClick={downloadAsPDF}
                        className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
                    >
                        <MdDownload className="inline-block mr-2" />
                        PDF
                    </button>
                    <button
                        onClick={downloadDOCX}
                        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                    >
                        <MdDownload className="inline-block mr-2" />
                        DOCX
                    </button>
                </div>

                {toast && (
                    <div className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded shadow-lg">
                        {toast}
                    </div>
                )}

                {error && (
                    <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded shadow-lg">
                        {error}
                    </div>
                )}

                {autoSaveToast && (
                    <div className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded shadow-lg flex items-center justify-center gap-2">
                        {autoSaveToast} saving...
                    </div>
                )}

            </div>
        </div >
    );
}
