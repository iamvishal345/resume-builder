import React, { useState } from "react";
import { Card, Spacer, Button, Grid, Text } from "@geist-ui/core";
import { useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import { ArrowRight } from "@geist-ui/icons";
import "react-quill/dist/quill.snow.css";
import { useStore } from "@store";

function Summary() {
  const resumeSummary = useStore((state) => state.resumeSummary);
  const setResumeSummary = useStore((state) => state.setResumeSummary);
  const navigate = useNavigate();
  return (
    <div className="w-100">
      <Grid style={{ display: "flex" }} px={0} justify="flex-end">
        <Button
          auto
          type="success-light"
          iconRight={<ArrowRight />}
          onClick={() => navigate("../additional-sections")}
        >
          Next
        </Button>
      </Grid>
      <Card>
        <Text my={0} p font={1.5}>
          Write About Yourself
        </Text>
        <Text my={0} p type="secondary">
          Summarize your work experience, education and skills here.
        </Text>
        <Spacer />

        <ReactQuill
          theme="snow"
          value={resumeSummary}
          placeholder="A good summary for a resume starts with a positive character trait and includes your job title, key skills, and the highlights of your career in just 2–5 sentences tailored to a specific position"
          modules={{
            toolbar: [
              [{ header: [1, 2, 3, 4, false] }],
              ["bold", "italic", "underline", "strike"],
              [
                { list: "ordered" },
                { list: "bullet" },
                { indent: "-1" },
                { indent: "+1" },
              ],
              ["clean"],
            ],
          }}
          onChange={setResumeSummary}
        />
      </Card>
    </div>
  );
}

export default Summary;
