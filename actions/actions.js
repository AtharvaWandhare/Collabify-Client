import axios from 'axios';
import Cookies from 'js-cookie';


export async function createDocument(title = 'Untitled Document', content) {
    const token = Cookies.get('AuthToken');
    if (!title || title.trim() === '') {
        title = 'Untitled Document';
    }
    if (!content || content.trim() === '') {
        content = JSON.stringify({ ops: [{ insert: '\n' }] });
    }

    try {
        const response = await axios.post('https://localhost:8000/api/v1/document',
            {
                title,
                content,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                withCredentials: true,
            }
        );

        if (response.status === 201) {
            return { ...response.data, status: response.status };
        }
    } catch (error) {
        console.error('(By me)Error creating document:', error);
        throw error;
    }
}