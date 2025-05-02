'use client';

import { useEffect, useRef, useState } from 'react';
import 'quill/dist/quill.snow.css';
import 'highlight.js/styles/github.css';
import { useUser } from '@/context/context';
import { useParams } from 'next/navigation';
import Cookies from 'js-cookie';
import axios from 'axios';
import html2pdf from 'html2pdf.js';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { QuillDeltaToHtmlConverter } from 'quill-delta-to-html';
import { MdDownload } from 'react-icons/md';

export default function DocumentEditor() {
    const { id } = useParams();
    const { user } = useUser();
    const token = Cookies.get('AuthToken');

    const editorRef = useRef(null);
    const quillInstance = useRef(null);

    const [title, setTitle] = useState('');
    const [content, setContent] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);


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

    useEffect(() => {
        const initQuill = async () => {
            if (editorRef.current && !quillInstance.current) {
                const Quill = (await import('quill')).default;
                const hljs = (await import('highlight.js')).default;

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
                            [{ align: [] }]
                        ]
                    }
                });

                if (content) {
                    quillInstance.current.setContents(content);
                }

                quillInstance.current.on('text-change', () => {
                    const delta = quillInstance.current.getContents();
                    setContent(delta);
                    saveDocument();
                });
            }
        };

        if (isLoaded) initQuill();
    }, [isLoaded, content]);

    // YOO, function that saves the document every 5 - 10 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            if (quillInstance.current) {
                const delta = quillInstance.current.getContents();
                setContent(delta);
                saveDocument();
            }
        }, 1000 * 60);

        return () => clearInterval(interval);
    }, [quillInstance]);

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
                alert('Document saved successfully!');
            } else {
                alert('Failed to save document.');
            }
        } catch (error) {
            console.error('Error saving document:', error);
            alert('An error occurred while saving.');
        }
    };

    const downloadAsPDF = () => {
        const content = editorRef.current.querySelector('.ql-editor');
        // console.log('Content:', content);

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
            alert('An error occurred while downloading.');
        }
    }


    if (!isLoaded) return <div className="p-6 text-gray-600">Loading document...</div>;

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <input
                type="text"
                placeholder="Document Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-3xl font-semibold border-b-2 border-gray-300 mb-6 outline-none"
            />

            <div ref={editorRef} className="bg-white min-h-[400px] text-black"></div>

            <button
                onClick={saveDocument}
                className="mt-6 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
                Save
            </button>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    downloadAsPDF();
                }}
                className="mt-4 ml-4 bg-red-600 text-white cursor-pointer px-6 py-2 rounded hover:bg-red-700"
            >
                <MdDownload className="inline-block mr-2" />
                PDF
            </button>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    downloadDOCX();
                }}
                className="mt-4 ml-4 bg-green-600 text-white cursor-pointer px-6 py-2 rounded hover:bg-green-700"
            >
                <MdDownload className="inline-block mr-2" />
                Docx
            </button>

        </div>
    );
}
