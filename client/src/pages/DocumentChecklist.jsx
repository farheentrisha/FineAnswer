import { useState } from "react";
import { FaCheckCircle, FaExclamationCircle, FaUpload } from "react-icons/fa";
import "../css/documentChecklist.css";

const initialDocuments = [
  { id: 1, name: "Statement of Purpose", required: true, uploaded: false },
  { id: 2, name: "Transcripts", required: true, uploaded: false },
  { id: 3, name: "Recommendation Letters", required: true, uploaded: false },
  { id: 4, name: "English Proficiency Test", required: true, uploaded: false },
  { id: 5, name: "Passport Copy", required: true, uploaded: false },
  { id: 6, name: "Financial Documents", required: true, uploaded: false },
];

export default function DocumentChecklist() {
  const [documents, setDocuments] = useState(initialDocuments);

  const handleUpload = (id) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === id ? { ...doc, uploaded: true } : doc
      )
    );
  };

  return (
    <div className="document-card">
      <h3>Document Checklist</h3>

      {documents.map((doc) => (
        <div key={doc.id} className="document-row">
          <div className="doc-info">
            <span className="doc-name">{doc.name}</span>
            {doc.required && <span className="required-tag">Required</span>}
          </div>

          <div className="doc-actions">
            {doc.uploaded ? (
              <FaCheckCircle className="icon success" />
            ) : (
              <FaExclamationCircle className="icon warning" />
            )}

            <button
              className="upload-btn"
              onClick={() => handleUpload(doc.id)}
            >
              <FaUpload /> Upload
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
