const docs = [
  "Statement of Purpose",
  "Transcripts",
  "Recommendation Letters",
  "English Proficiency Test",
  "Passport Copy",
  "Financial Documents",
];

export default function DocumentChecklist() {
  return (
    <div className="document-card">
      <h3>Document Checklist</h3>

      {docs.map((doc, i) => (
        <div key={i} className="doc-item">
          <span>{doc}</span>
          <span className="required">Required</span>
        </div>
      ))}
    </div>
  );
}
