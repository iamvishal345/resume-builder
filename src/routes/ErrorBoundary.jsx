import React from "react";
import { Button } from "@astryxdesign/core/Button";
import { VStack } from "@astryxdesign/core/Layout";
import { Text } from "@astryxdesign/core/Text";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    if (typeof console !== "undefined" && console.error) {
      console.error(error);
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <VStack gap={3} align="center" padding={6} width="100%">
        <Text type="inherit" size="2xl" weight="semibold" color="primary">
          Something went wrong
        </Text>
        <Text type="inherit" size="md" color="secondary">
          Reload the page or go back to your resumes. Your drafts are saved in
          this browser.
        </Text>
        <Button
          variant="primary"
          label="My resumes"
          onClick={() => {
            window.location.href = "/resumes";
          }}
        />
      </VStack>
    );
  }
}

export default ErrorBoundary;
