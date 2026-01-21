import {
  FaCheckCircle,
  FaExclamationCircle,
  FaClock,
  FaCloudUploadAlt,
  FaFileAlt,
} from "react-icons/fa";
import "../css/documentChecklist.css";

const documents = [
  { name: "Statement of Purpose", required: true, status: "done" },
  { name: "Transcripts", required: true, status: "done" },
  { name: "Recommendation Letters", required: true, status: "pending" },
  { name: "English Proficiency Test", required: true, status: "pending" },
  { name: "Passport Copy", required: true, status: "done" },
  { name: "Financial Documents", required: true, status: "progress" },
];

const StatusIcon = ({ status }) => {
  if (status === "done") return <FaCheckCircle className="icon done" />;
  if (status === "progress") return <FaClock className="icon progress" />;
  return <FaExclamationCircle className="icon pending" />;
};

export default function DocumentChecklist() {
  return (
    <div className="doc-wrapper">
      <div className="doc-header">
        <FaFileAlt />
        <h3>Document Checklist</h3>
      </div>

      <div className="doc-list">
        {documents.map((doc, i) => (
          <div className="doc-item" key={i}>
            <div className="doc-left">
              <StatusIcon status={doc.status} />
              <div>
                <p className="doc-name">{doc.name}</p>
                {doc.required && <span className="required">Required</span>}
              </div>
            </div>

            <FaCloudUploadAlt className="upload-icon" />
          </div>
        ))}
      </div>

      <button className="upload-btn-main">
        <FaCloudUploadAlt /> Upload Documents
      </button>
    </div>
  );
}
