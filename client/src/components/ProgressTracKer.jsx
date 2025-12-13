const steps = [
  "Eligibility",
  "Shortlisting",
  "Documents",
  "Application",
  "Offer",
  "Visa",
];

export default function ProgressTracker() {
  return (
    <div className="progress-card">
      <h4>Application Progress Tracker</h4>

      <div className="progress-steps">
        {steps.map((step, index) => (
          <div key={index} className={`step ${index < 2 ? "done" : index === 2 ? "active" : ""}`}>
            <div className="circle" />
            <span>{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
