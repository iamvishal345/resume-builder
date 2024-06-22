import React, { Suspense, useEffect } from "react";
import { Grid, Page } from "@geist-ui/core";
import { Outlet, useNavigate } from "react-router-dom";
import ErrorBoundary from "@routes/ErrorBoundary";

const EditorPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const resumeData = localStorage.getItem("resume-data");
    if (!resumeData) {
      navigate("./personal-details");
    }
  }, []);
  return (
    <ErrorBoundary>
      <Page>
        <Page.Header>Header</Page.Header>
        <Page.Content>
          <Grid.Container gap={2} justify="center">
            <Grid md={12}>
              <Suspense fallback={<div>Loading.. in page.</div>}>
                <Outlet />
              </Suspense>
            </Grid>
            <Grid md={12}>Preview</Grid>
          </Grid.Container>
        </Page.Content>
      </Page>
    </ErrorBoundary>
  );
};

export default EditorPage;

export const EditorPageError = () => {
  return <div>Something went wrong</div>;
};
