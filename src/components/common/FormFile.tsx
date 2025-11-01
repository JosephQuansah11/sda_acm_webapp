import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';

function FormFile() {
  const [uploadStatus, setUploadStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = async (event: Event) => {
    setIsLoading(true);
    setUploadStatus('');

    // 1. Get the file from the input
    const file = event.currentTarget as HTMLInputElement;
    if (!file) {
      setUploadStatus('Please select a file first.');
      setIsLoading(false);
      return;
    }

    // 2. Create a FormData object
    const formData = new FormData();
    // The 'file' key must match the name used in your backend middleware (e.g., multer)
    formData.append('file', file as unknown as File);

    try {
      // 3. Send the file to the backend
      // Replace with your actual backend endpoint
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData, // No 'Content-Type' header needed; fetch sets it automatically for FormData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Success:', result);
      setUploadStatus(`Success! ${result.message}. Processed ${result.data.length} records.`);

    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadStatus(`Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Form.Group controlId="formFileLg" className="mb-3">
        <Form.Label>Select and upload your church member list file</Form.Label>
        <Form.Control
          type="file"
          size="lg"
          accept=".xlsx"
          onChange={handleFileUpload as any}
          disabled={isLoading}
        />
      </Form.Group>

      {isLoading && <p>Uploading and processing...</p>}
      {uploadStatus && <Alert variant={uploadStatus.startsWith('Error') ? 'danger' : 'success'}>{uploadStatus}</Alert>}
    </>
  );
}

export default FormFile;