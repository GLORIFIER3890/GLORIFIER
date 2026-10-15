import React, { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
  onRetry?: () => void;
};

type State = {
  failed: boolean;
};

/**
 * Isolates a failed lazy-loaded panel so navigation, the header, and evidence
 * notice remain usable. It does not imply the failed module or its services work.
 */
export class ModuleErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, _info: ErrorInfo) {
    console.error('GLORIFIER module failed to load or render:', error);
  }

  render() {
    if (this.state.failed) {
      return (
        <section role="alert" className="rounded-xl border border-amber-500/30 bg-slate-900 p-6 text-sm text-slate-200">
          <h2 className="font-semibold text-amber-200">This module is unavailable</h2>
          <p className="mt-2 text-slate-300">
            The panel failed to load or render. This does not confirm backend or service status.
          </p>
          <button
            type="button"
            className="mt-4 rounded-lg border border-slate-700 px-3 py-2 hover:bg-slate-800"
            onClick={() => {
              this.setState({ failed: false });
              this.props.onRetry?.();
            }}
          >
            Try this panel again
          </button>
        </section>
      );
    }
    return this.props.children;
  }
}
