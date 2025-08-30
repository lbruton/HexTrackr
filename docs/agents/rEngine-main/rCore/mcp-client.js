import fetch from 'node-fetch';

export async function addMemory(title, description, type) {
    const url = 'http://localhost:3036/add';
    const memory = {
        title,
        description,
        type,
        timestamp: new Date().toISOString()
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(memory)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
        }

        const result = await response.json();
        console.log('Memory added successfully:', result);
    } catch (error) {
        console.error('Failed to add memory:', error);
        throw error; // Re-throw the error to be caught by the caller
    }
}
