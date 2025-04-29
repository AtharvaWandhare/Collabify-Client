'use client';
import { useState, useEffect, use } from 'react';

export default function DocumentEditor({ params: paramsPromise }) {
    const params = use(paramsPromise);
    const id = params.id;
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    // useEffect(() => {
    //     if (!id) return;
    //     fetch(`/api/v1/documents/${id}`, {
    //         headers: {
    //             Authorization: `Bearer ${localStorage.getItem('token')}`
    //         }
    //     })
    //         .then(res => res.json())
    //         .then(data => {
    //             setTitle(data?.data?.title || '');
    //             setContent(data?.data?.content || '');
    //         });
    // }, [id]);

    // const saveDocument = async () => {
    //     await fetch(`/api/v1/documents/${id}`, {
    //         method: 'PUT',
    //         headers: {
    //             'Content-Type': 'application/json',
    //             Authorization: `Bearer ${localStorage.getItem('token')}`
    //         },
    //         body: JSON.stringify({ title, content })
    //     });
    //     alert('Saved!');
    // };

    return (
        <div className="p-4">
            <input
                className="text-xl font-bold w-full border-b mb-4"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Document Title"
            />
            <textarea
                className="w-full h-[70vh] p-2 border"
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Start writing..."
            />
            <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
                Save
            </button>
        </div>
    );
}