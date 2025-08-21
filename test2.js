const deployButton = document.getElementById('deployButton');
const statusDiv = document.getElementById('status');
import axios from 'https://cdn.jsdelivr.net/npm/axios@1.6.8/+esm';

deployButton.addEventListener('click', async () => {
    statusDiv.textContent = 'Sending request to server...';
    try {
        // This 'fetch' call sends a request to your backend API endpoint
        // const response = await fetch('http://localhost:5001/api/projects/deploy2', {
        //     method: 'POST',
            // headers: {
            //     'Content-Type': 'application/json',
            // },
            // // You could send project data in the body
            // body: JSON.stringify({ projectName: 'My Awesome Project' }),
        // });

        // const result = await response.json();

        // if (!response.ok) {
        //     throw new Error(result.message || 'An error occurred.');
        // }

        // statusDiv.textContent = `Success! Contract deployed at: ${result.address}`;
        // console.log('Server response:', result);
        await axios.post('http://localhost:5001/api/projects/deploy2');

    } catch (error) {
        statusDiv.textContent = `Failed: ${error.message}`;
        console.error('Failed to trigger deployment:', error);
    }
});