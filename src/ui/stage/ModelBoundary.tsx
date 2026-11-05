import { Component, type ReactNode } from 'react';

/** If a model cannot be fetched or read, whatever stands in for it is shown and the scene goes on. */
export class ModelBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { /* nothing to report: the cartoon figure stands in */ }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}
