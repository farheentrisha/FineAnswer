import { FaCheck, FaClock, FaExclamation } from "react-icons/fa";
import "./ProgressTracker.css";

const steps = [
  "Eligibility",
  "Shortlisting",
  "Documents",
  "Application",
  "Offer",
  "Visa",
];

export default function ProgressTracker({ currentStep = 2 }) {
  return (
    <div className="tracker-wrapper">
      <div className="tracker-header">
        📈 Application Progress Tracker
      </div>

      <div className="tracker-body">
        {steps.map((step, index) => {
          const status =
            index < currentStep
              ? "done"
              : index === currentStep
              ? "active"
              : "pending";

          return (
            <div key={index} className={`tracker-step ${status}`}>
              <div className="circle">
                {status === "done" && <FaCheck />}
                {status === "active" && <FaClock />}
                {status === "pending" && <FaExclamation />}
              </div>

              {index !== steps.length - 1 && (
                <div className="connector" />
              )}

              <span>{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
