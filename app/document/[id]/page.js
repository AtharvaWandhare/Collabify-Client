'use client';

import { useEffect, useRef, useState } from 'react';
import 'quill/dist/quill.snow.css';
import 'highlight.js/styles/github.css';
import { useParams } from 'next/navigation';
import Cookies from 'js-cookie';
import axios from 'axios';
import html2pdf from 'html2pdf.js';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph } from 'docx';
import HtmlToDocx from 'html-to-docx';
import { MdDownload } from 'react-icons/md';

export default function DocumentEditor() {
    const { id } = useParams();
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
                });
            }
        };

        if (isLoaded) initQuill();
    }, [isLoaded, content]);

    const saveDocument = async () => {
        if (!title.trim()) {
            alert('Title cannot be empty!');
            return;
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
        console.log('Content:', content);
        // const deltaObj = JSON.parse(content);

        // const converter = new QuillDeltaToHtmlConverter(content.ops, {});
        // const html = converter.convert();
        html2pdf()
            .from(content)
            .set({ filename: `${title}.pdf` })
            .save();
    };

    const downloadAsDocx = async () => {
        const editorElement = editorRef.current?.querySelector('.ql-editor');
        if (!editorElement) return;

        const html = editorElement.innerHTML;

        const blob = await HtmlToDocx(html, {
            header: false,
            footer: false,
            orientation: 'portrait',
            title: title || 'Document',
        });

        saveAs(blob, `${title || 'document'}.docx`);
    };

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
                    downloadAsDocx();
                }}
                className="mt-4 ml-4 bg-red-600 text-white cursor-pointer px-6 py-2 rounded hover:bg-red-700"
            >
                <MdDownload className="inline-block mr-2" />
                Docx
            </button>
        </div>
    );
}
