import { useServerStatus } from "./hooks/useServerStatus";
import { useJobs } from "./hooks/useJobs";
import { useSetup } from "./hooks/useSetup";
import { ServerControl } from "./components/ServerControl";
import { InferenceForm } from "./components/InferenceForm";
import { JobList } from "./components/JobList";
import { SetupScreen } from "./components/SetupScreen";
import { startInference, cancelJob } from "./lib/tauriApi";
import "./App.css";

function App() {
  const { status: setupStatus, progress, error: setupError, startSetup, retry } = useSetup();
  const { status, error, start, stop } = useServerStatus();
  const { jobs } = useJobs();

  const handleInference = async (inputText: string) => {
    try {
      await startInference(inputText);
    } catch (e) {
      console.error("Failed to start inference:", e);
    }
  };

  const handleCancel = async (jobId: string) => {
    try {
      await cancelJob(jobId);
    } catch (e) {
      console.error("Failed to cancel job:", e);
    }
  };

  if (setupStatus !== "COMPLETE" && setupStatus !== "CHECKING") {
    return (
      <SetupScreen
        status={setupStatus}
        progress={progress}
        error={setupError}
        onStart={startSetup}
        onRetry={retry}
      />
    );
  }

  if (setupStatus === "CHECKING") {
    return (
      <div className="app">
        <div className="setup-status">
          <span className="setup-spinner" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <h1>AI Inference App</h1>
      <ServerControl status={status} error={error} onStart={start} onStop={stop} />
      <InferenceForm disabled={status !== "RUNNING"} onSubmit={handleInference} />
      <JobList jobs={jobs} onCancel={handleCancel} />
    </div>
  );
}

export default App;
