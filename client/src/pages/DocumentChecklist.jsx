import { useEffect, useState } from "react";
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaClock,
  FaCloudUploadAlt,
  FaFileAlt,
  FaSpinner,
} from "react-icons/fa";
import { API_BASE_URL } from "../config/api";
import { uploadDocumentToCloudinary } from "../utils/cloudinary";
import "../css/documentChecklist.css";

const documentFields = [
  { key: "passportCopy", label: "Latest Passport bio data page copy", required: true },
  { key: "cv", label: "CV (updated/latest)", required: true },
  { key: "sop", label: "SOP (university and relevant subject oriented)", required: true },
  { key: "englishProficiency", label: "English proficiency test result copy", required: true },
  { key: "sscCertificate", label: "SSC Certificate", required: true },
  { key: "hscCertificate", label: "HSC Certificate", required: true },
  { key: "bachelorsCertificate", label: "Bachelor's Certificate", required: true },
  { key: "mastersCertificate", label: "Master's Certificate (if applicable)", required: false },
  { key: "sscTranscript", label: "SSC Transcript", required: true },
  { key: "hscTranscript", label: "HSC Transcript", required: true },
  { key: "bachelorsTranscript", label: "Bachelor's Transcript", required: true },
  { key: "mastersTranscript", label: "Master's Transcript (if applicable)", required: false },
  { key: "workExperience", label: "Work experience certificates", required: true },
  { key: "lors", label: "LOR's (Letters of Recommendation)", required: true },
];

export default function DocumentChecklist() {
  const [documents, setDocuments] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState({});
  const [loadingPdf, setLoadingPdf] = useState(null);
  const [error, setError] = useState(null);

  const openPdf = async (url, action, key) => {
    if (!url) return;
    const proxyUrl = `${API_BASE_URL}/documents/proxy?url=${encodeURIComponent(url)}&download=${action === "download" ? "1" : "0"}`;
    setLoadingPdf(key);
    try {
      const res = await fetch(proxyUrl);
      if (!res.ok) throw new Error("Proxy failed");
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      if (action === "download") {
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = "document.pdf";
        a.click();
      } else {
        window.open(blobUrl, "_blank", "noopener,noreferrer");
      }
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
    } catch (_err) {
      // Fallback: open Cloudinary URL directly
      if (action === "download") {
        const a = document.createElement("a");
        a.href = url;
        a.download = "document.pdf";
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.click();
      } else {
        window.open(url, "_blank", "noopener,noreferrer");
      }
    } finally {
      setLoadingPdf(null);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/documents`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success && data.data) {
        setDocuments(data.data);
      }
      setError(null);
    } catch (_err) {
      setError("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (key, file) => {
    if (!file) return;
    
    // Validate file type (PDF only)
    if (file.type !== "application/pdf") {
      alert("Please upload PDF files only");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }

    setUploading((prev) => ({ ...prev, [key]: true }));

    try {
      // Upload to Cloudinary
      const url = await uploadDocumentToCloudinary(file);

      // Save/update in backend
      const token = localStorage.getItem("token");
      const method = documents._id ? "PUT" : "POST";
      const res = await fetch(`${API_BASE_URL}/documents`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ [key]: url }),
      });

      const data = await res.json();
      if (data.success) {
        setDocuments(data.data);
        alert("Document uploaded successfully!");
      } else {
        alert(data.message || "Failed to save document");
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to upload document");
    } finally {
      setUploading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const getDocStatus = (key) => {
    if (uploading[key]) return "progress";
    if (documents[key]) return "done";
    return "pending";
  };

  const StatusIcon = ({ status }) => {
    if (status === "done") return <FaCheckCircle className="icon done" />;
    if (status === "progress") return <FaClock className="icon progress" />;
    return <FaExclamationCircle className="icon pending" />;
  };

  if (loading) {
    return (
      <div className="doc-wrapper">
        <div className="doc-loading">
          <FaSpinner className="spinner" />
          <p>Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="doc-wrapper">
      <div className="doc-header">
        <FaFileAlt />
        <h3>Document Checklist</h3>
      </div>

      {error && <div className="doc-error">{error}</div>}

      {documents.validationStatus && (
        <div className={`doc-feedback doc-feedback-${documents.validationStatus}`}>
          <strong>Admin status:</strong>{" "}
          {documents.validationStatus === "approved"
            ? "All documents are valid."
            : documents.validationStatus === "rejected"
            ? "Some documents need attention."
            : "Pending review."}
          {documents.feedback && (
            <p className="doc-feedback-text">{documents.feedback}</p>
          )}
        </div>
      )}

      <div className="doc-list">
        {documentFields.map((field) => {
          const status = getDocStatus(field.key);
          return (
            <div className="doc-item" key={field.key}>
              <div className="doc-left">
                <StatusIcon status={status} />
                <div>
                  <p className="doc-name">{field.label}</p>
                  {field.required && <span className="required">Required</span>}
                </div>
              </div>

              <div className="doc-actions">
                {documents[field.key] && (
                  <>
                    <button
                      type="button"
                      className="view-link doc-view-btn"
                      onClick={() => openPdf(documents[field.key], "view", field.key)}
                      disabled={loadingPdf === field.key}
                    >
                      {loadingPdf === field.key ? (
                        <FaSpinner className="spinner" />
                      ) : (
                        "View"
                      )}
                    </button>
                    <button
                      type="button"
                      className="doc-download-btn"
                      onClick={() => openPdf(documents[field.key], "download", field.key)}
                      disabled={loadingPdf === field.key}
                    >
                      Download
                    </button>
                  </>
                )}
                <label className="upload-label">
                  {uploading[field.key] ? (
                    <FaSpinner className="spinner" />
                  ) : (
                    <FaCloudUploadAlt className="upload-icon" />
                  )}
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => handleFileUpload(field.key, e.target.files[0])}
                    disabled={uploading[field.key]}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
