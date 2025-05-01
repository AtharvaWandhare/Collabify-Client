'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useUser } from "@/context/context";
import ProtectedRoute from "@/context/ProtectedRoute";
import Cookies from "js-cookie";
import { createDocument } from "@/actions/actions";
import classes from './page.module.css';
import { MdDeleteOutline, MdOutlineAddCircleOutline } from "react-icons/md";

/*
This Page shows all the documents created by the user and a button to create a new document which redirects to the create document page.
It also shows a list of all the documents created by the user and a button to edit or delete each document.
*/
function DocumentPage() {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user } = useUser();
    const router = useRouter();
    const redirect = (path) => {
        router.push(path);
    }

    useEffect(() => {
        const fetchDocuments = async () => {

            setLoading(true);
            const token = Cookies.get('AuthToken');
            await axios.get('https://localhost:8000/api/v1/document',
                { headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }, withCredentials: true })
                .then((response) => {
                    // console.log('Data\n', response);
                    if (response.status === 200 && response.data.data.length > 0) {
                        setDocuments(response.data.data);
                    } else {
                        console.log('No documents found');
                    }
                }).catch((error) => {
                    console.log('Error fetching documents:', error);
                }).finally(() => {
                    setLoading(false);
                });
        };

        fetchDocuments();
    }, []);

    async function create() {
        setLoading(true);
        try {
            const response = await createDocument(); // Already uses empty Delta format

            if (response.status === 201) {
                router.push(`/document/${response.document._id}`);
            } else {
                alert('Error creating document: ' + response.message);
            }
        } catch (err) {
            alert('Something went wrong while creating document.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function deleteDocument(id) {
        setLoading(true);
        const token = Cookies.get('AuthToken');
        try {
            const response = await axios.delete(`https://localhost:8000/api/v1/document/${id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                withCredentials: true,
            });

            if (response.status === 200) {
                setDocuments(documents.filter(doc => doc._id !== id));
            } else {
                alert('Error deleting document: ' + response.message);
            }
        } catch (err) {
            alert('Something went wrong while deleting document.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const downloadAsPDF = (doc) => {
        console.log('Download as PDF:', doc);
        const content = doc.content;
        console.log('Content:', content);
        html2pdf()
            .from(content)
            .set({ filename: `${doc.title || 'document'}.pdf` })
            .save();
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="max-w-3xl mx-auto my-4 p-6 bg-gray-100 rounded-lg shadow-md">
            <h1 className="text-2xl font-semibold text-gray-800 mb-6">
                Your Documents - {user.username}
            </h1>

            <button
                onClick={create}
                className="mb-6 px-4 py-2 bg-blue-600 text-white rounded cursor-pointer flex items-center gap-x-1 justify-center hover:bg-blue-700 transition"
            >
                <MdOutlineAddCircleOutline />
                New
            </button>

            {documents.length > 0 ? <>
                <ul className={classes.list + " space-y-4"}>
                    {documents.map((doc) => (
                        <li
                            key={doc._id}
                            onClick={() =>
                                redirect(`/document/${doc._id}`)
                            }
                            className={classes.documentListItem + " bg-white cursor-pointer p-4 rounded shadow flex flex-col"}
                        >
                            <div className={'flex flex-col md:flex-row md:items-center justify-between'}>
                                <h2 className="text-lg font-medium text-gray-900">{doc.title}</h2>
                                <p className="text-gray-600 mt-2 md:mt-0 md:ml-4">{new Date(doc.createdAt).toLocaleDateString()}</p>
                                <p className="text-gray-600 mt-2 md:mt-0 md:ml-4">{new Date(doc.createdAt).toLocaleTimeString()}</p>

                                <div className="mt-3 md:mt-0 flex space-x-3">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation(); // Stop event from bubbling up to parent
                                            deleteDocument(doc._id);
                                        }}
                                        className="px-3 py-1.5 cursor-pointer bg-red-600 text-white rounded hover:bg-red-700 transition"
                                    >
                                        {/* Delete */}
                                        <MdDeleteOutline />
                                    </button>
                                </div>
                            </div>

                        </li>
                    ))}
                </ul>
            </> : <><p className="text-black">No Documents Found</p></>}
        </div>
    );


}

export default function WrappedDocumentPage() {
    return (
        <ProtectedRoute>
            <DocumentPage />
        </ProtectedRoute>
    )
}