import React from "react";
class ErrorBoundary extends React.Component {
  constructor() {
    super();
    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    console.log(error);
    console.log(info);
  }
  render() {
    return this.state.hasError ? (
      <div className="errorImageOverlay">
        <div className="errorImageContainer"></div>
        <h2 className="errorImageText">Uh Oh! Seems this Page is Broken</h2>
        <p className="errorImageSubText">
          Please Check Your Internet Connection or <a href="/">Click here</a>
        </p>
      </div>
    ) : (
      this.props.children
    );
  }
}

export default ErrorBoundary;
