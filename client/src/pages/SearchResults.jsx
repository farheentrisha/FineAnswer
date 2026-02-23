import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { searchPrograms } from "../services/programApi";
import Navbar3 from "../components/navbar3";
import "./SearchResults.css";

const INTAKES = ["Sept", "Jan", "Feb", "May"];
const COUNTRY = "Ireland";

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Read initial values from URL
  const [programInput, setProgramInput] = useState(
    searchParams.get("program") || ""
  );
  const [selectedIntake, setSelectedIntake] = useState(
    searchParams.get("intake") || ""
  );

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  // Run search whenever URL query params change
  useEffect(() => {
    const program = searchParams.get("program") || "";
    const country = searchParams.get("country") || "";
    const intake = searchParams.get("intake") || "";

    if (!program && !country && !intake) {
      setResults([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setError(null);
    setSearched(true);

    searchPrograms({ program, country, intake })
      .then((data) => {
        setResults(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error(err);
        setError("Something went wrong. Please try again.");
        setResults([]);
      })
      .finally(() => setLoading(false));
  }, [searchParams]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (programInput.trim()) params.set("program", programInput.trim());
    params.set("country", COUNTRY);
    if (selectedIntake) params.set("intake", selectedIntake);
    setSearchParams(params);
  };

  return (
    <div className="sr-page">
      <Navbar3 />

      {/* Refined search bar at the top */}
      <div className="sr-search-section">
        <div className="sr-search-bar">
          <div className="sr-field">
            <label className="sr-field-label">Program</label>
            <input
              type="text"
              className="sr-field-input"
              placeholder="Search Program"
              value={programInput}
              onChange={(e) => setProgramInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>

          <div className="sr-divider" />

          <div className="sr-field">
            <label className="sr-field-label">Country</label>
            <span className="sr-field-fixed">{COUNTRY}</span>
          </div>

          <div className="sr-divider" />

          <div className="sr-field">
            <label className="sr-field-label">Intake</label>
            <select
              className="sr-field-select"
              value={selectedIntake}
              onChange={(e) => setSelectedIntake(e.target.value)}
            >
              <option value="">Select Intake</option>
              {INTAKES.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>

          <button className="sr-search-btn" onClick={handleSearch}>
            Search
          </button>
        </div>
      </div>

      {/* Results area */}
      <div className="sr-content">
        {loading && (
          <div className="sr-loading">
            <div className="sr-spinner" />
            <p>Searching programs…</p>
          </div>
        )}

        {!loading && error && (
          <div className="sr-error">{error}</div>
        )}

        {!loading && !error && searched && results.length === 0 && (
          <div className="sr-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <h3>No programs found matching your search.</h3>
            <p>Try different keywords or change the intake filter.</p>
          </div>
        )}

        {!loading && !error && results.length > 0 && (
          <>
            <p className="sr-count">
              {results.length} program{results.length !== 1 ? "s" : ""} found
            </p>
            <div className="sr-grid">
              {results.map((prog, idx) => (
                <div className="sr-card" key={idx}>
                  <div className="sr-card-header">
                    <h3 className="sr-card-program">{prog.programName}</h3>
                    {prog.level && (
                      <span className="sr-card-level">{prog.level}</span>
                    )}
                  </div>

                  <div className="sr-card-meta">
                    <div className="sr-meta-item">
                      <span className="sr-meta-icon">🏫</span>
                      <div>
                        <div className="sr-meta-label">University</div>
                        <div className="sr-meta-value">{prog.university || "—"}</div>
                      </div>
                    </div>

                    {prog.campus && (
                      <div className="sr-meta-item">
                        <span className="sr-meta-icon">📍</span>
                        <div>
                          <div className="sr-meta-label">Campus</div>
                          <div className="sr-meta-value">{prog.campus}</div>
                        </div>
                      </div>
                    )}

                    {prog.duration && (
                      <div className="sr-meta-item">
                        <span className="sr-meta-icon">⏱</span>
                        <div>
                          <div className="sr-meta-label">Duration</div>
                          <div className="sr-meta-value">{prog.duration}</div>
                        </div>
                      </div>
                    )}

                    {prog.tuitionFees && (
                      <div className="sr-meta-item">
                        <span className="sr-meta-icon">💰</span>
                        <div>
                          <div className="sr-meta-label">Tuition Fees</div>
                          <div className="sr-meta-value">{prog.tuitionFees}</div>
                        </div>
                      </div>
                    )}

                    {prog.availableIntakes && (
                      <div className="sr-meta-item">
                        <span className="sr-meta-icon">📅</span>
                        <div>
                          <div className="sr-meta-label">Available Intakes</div>
                          <div className="sr-meta-value">{prog.availableIntakes}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {prog.referenceLink && (
                    <a
                      href={prog.referenceLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="sr-card-btn"
                    >
                      View Program →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
