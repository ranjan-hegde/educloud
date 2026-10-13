import { Component } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

// Catches rendering errors in whatever page is currently loaded (inside the
// dashboard's <main>) so a bug in ONE section never blanks the whole app —
// the sidebar/navbar stay usable and the person can navigate elsewhere.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error("[ErrorBoundary] caught an error:", error, info);
  }

  componentDidUpdate(prevProps) {
    // Auto-recover when the person navigates to a different page.
    if (this.state.hasError && prevProps.locationKey !== this.props.locationKey) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="card p-10 text-center max-w-lg mx-auto mt-10">
          <div className="rounded-full bg-rose-50 p-3.5 text-rose-500 w-fit mx-auto mb-4">
            <AlertTriangle size={22} />
          </div>
          <p className="font-semibold text-navy-900">This section couldn't be loaded</p>
          <p className="text-sm text-navy-400 mt-1.5">
            Something went wrong while rendering this page. Try again, or use the sidebar to open a different section.
          </p>
          <button className="btn-primary mt-5 mx-auto" onClick={() => this.setState({ hasError: false })}>
            <RotateCcw size={15} /> Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
