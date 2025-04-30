'use client';
import { use, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import hljs from 'highlight.js';
import 'quill/dist/quill.snow.css';
import 'highlight.js/styles/github.css';

export default function DocumentEditor({ params: paramsPromise }) {
    const params = use(paramsPromise);
    const { id } = params.id;

    const editorRef = useRef(null);
    const quillInstance = useRef(null);

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

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

                quillInstance.current.setContents(
                    quillInstance.current.clipboard.convert(content)
                );

                quillInstance.current.on('text-change', () => {
                    const html = editorRef.current.querySelector('.ql-editor')?.innerHTML;
                    setContent(html);
                });
            }
        };

        initQuill();
    }, [content]);


    // useEffect(() => {
    //   if (!id) return;

    //   fetch(`/api/v1/documents/${id}`, {
    //     headers: {
    //       Authorization: `Bearer ${localStorage.getItem('token')}`
    //     }
    //   })
    //     .then(res => res.json())
    //     .then(data => {
    //       setTitle(data?.data?.title || '');
    //       setContent(data?.data?.content || '');
    //       if (quillInstance.current) {
    //         quillInstance.current.setContents(
    //           quillInstance.current.clipboard.convert(data?.data?.content || '')
    //         );
    //       }
    //     });
    // }, [id]);

    const saveDocument = async () => {
        //   await fetch(`/api/v1/documents/${id}`, {
        //     method: 'PUT',
        //     headers: {
        //       'Content-Type': 'application/json',
        //       Authorization: `Bearer ${localStorage.getItem('token')}`
        //     },
        //     body: JSON.stringify({ title, content })
        //   });
        console.log('Document saved:', { title, content });
        alert('Document Saved!');
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <input
                type="text"
                placeholder="Document Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-3xl font-semibold border-b-2 border-gray-300 mb-6 outline-none"
            />

            <div id={id} ref={editorRef} className="bg-white min-h-[400px] scroll-auto text-black" />

            <button
                onClick={saveDocument}
                className="mt-6 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
                Save
            </button>
        </div>
    );
}
