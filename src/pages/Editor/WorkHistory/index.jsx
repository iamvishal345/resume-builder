import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Card,
  Grid,
  Input,
  Spacer,
  Text,
  Toggle,
} from "@geist-ui/core";
import { ArrowRight, Move, Plus, Trash } from "@geist-ui/icons";
import { useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { DraggableCollapse, Collapse } from "@components/DraggableCollapse";
import { useStore } from "@store";

const workHistoryFormStructure = [
  {
    name: "positionTitle",
    label: "Position Title",
    placeholder: "Job Title that best describes the work you did.",
    gridProps: { xs: 24 },
  },
  {
    name: "companyName",
    label: "Company Name",
    placeholder: "Company/Person/Family Business",
    gridProps: { xs: 12 },
  },
  {
    name: "location",
    label: "Job Location",
    placeholder: "e.g. Gurgaon, India",
    gridProps: { xs: 12 },
  },
  {
    name: "startDate",
    label: "Start Date",
    type: "date",
    placeholder: "",
    gridProps: { xs: 12 },
  },
  {
    name: "endDate",
    label: "End Date",
    type: "date",
    placeholder: "",
    gridProps: { xs: 12 },
  },
];

const SingleWorkHistoryForm = ({ formData, setFieldValue }) => {
  return (
    <Grid.Container gap={1.5}>
      {workHistoryFormStructure.map((field) => (
        <Grid key={field.name} {...field.gridProps}>
          <Input
            scale={1.25}
            id={field.name}
            name={field.name}
            width="100%"
            placeholder={field.placeholder}
            htmlType={field.type || "text"}
            value={formData[field.name] || ""}
            disabled={formData[`disabled${field.name}`]}
            onChange={setFieldValue}
          >
            <Text small>{field.label}</Text>
          </Input>
        </Grid>
      ))}
      <Grid xs={12}>&shy;</Grid>
      <Grid xs={12} alignItems="baseline">
        <Toggle
          id="disabledendDate"
          onChange={(e) =>
            setFieldValue({
              ...e,
              target: { value: e.target.checked, name: "disabledendDate" },
            })
          }
        />
        <Text pl={0.75} small type="secondary">
          I currently work here
        </Text>
      </Grid>
      <Grid xs={24}>
        <ReactQuill
          theme="snow"
          value={formData.workSummary}
          placeholder="Type your achievements and responsibilities here. For e.g. Contributed to the development of innovative software solutions, leveraging expertise in Javascript, at..."
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
          onChange={(value) =>
            setFieldValue({ target: { value, name: "workSummary" } })
          }
        />
      </Grid>
    </Grid.Container>
  );
};

const getWorkHistoryObj = () => ({
  key: crypto.randomUUID(),
  positionTitle: "",
  companyName: "",
  location: "",
  startDate: "",
  endDate: "",
  workSummary: "",
});

const WorkHistory = () => {
  const workHistoryRef = useRef(null);
  const [cardVisible, setCardVisible] = useState();
  const workHistory = useStore((state) => state.workHistory);
  const setWorkHistory = useStore((state) => state.setWorkHistory);
  const navigate = useNavigate();

  useEffect(() => {
    if (workHistory.length) return;
    const workHistoryObj = getWorkHistoryObj();
    setWorkHistory([workHistoryObj]);
    setCardVisible(workHistoryObj.key);
  }, []);

  useEffect(() => {
    workHistoryRef.current = workHistory;
    if (workHistory.length) {
      setCardVisible(workHistory[workHistory.length - 1].key);
    }
  }, [workHistory]);
  const setFieldValue = (e, key) => {
    setWorkHistory(
      workHistory.map((form) => {
        if (form.key === key) {
          form[e.target.name] = e.target.value;
        }
        return form;
      })
    );
  };

  const handleAddMoreExperience = () => {
    const cardObj = getWorkHistoryObj();
    setWorkHistory([...workHistory, cardObj]);
  };
  const handleRemoveWorkHistory = (formKey) => {
    setWorkHistory(workHistory.filter((form) => form.key !== formKey));
  };
  const handleItemsPosition = (oldIndex, newIndex) => {
    const updatedWorkHistory = [...workHistoryRef.current];
    updatedWorkHistory.splice(
      newIndex,
      0,
      updatedWorkHistory.splice(oldIndex, 1)[0]
    );
    setWorkHistory(updatedWorkHistory);
  };
  return (
    <div>
      <Grid style={{ display: "flex" }} px={0} justify="flex-end">
        <Button
          auto
          type="success-light"
          iconRight={<ArrowRight />}
          onClick={() => navigate("../education")}
        >
          Next
        </Button>
      </Grid>
      <Card>
        <Text my={0} p font={1.5}>
          Professional Experience
        </Text>
        <Text my={0} p type="secondary">
          Start with your most recent experience and work backward.
        </Text>
        <Spacer />
        <DraggableCollapse onDrag={handleItemsPosition}>
          {workHistory.map((formObj) => (
            <Collapse
              visible={formObj.key === cardVisible}
              clickHandler={() =>
                setCardVisible(formObj.key === cardVisible ? "" : formObj.key)
              }
              mb={1}
              key={formObj.key}
              title={
                <Grid.Container alignItems="center" gap={1.5}>
                  <Grid xs={2.5}>
                    <Button
                      className="drag-button"
                      icon={<Move />}
                      auto
                      px={0.75}
                    />
                  </Grid>
                  <Grid xs={18}>
                    <Text b small>
                      {formObj.positionTitle}
                      {formObj.positionTitle && formObj.companyName ? `, ` : ""}
                      {formObj.companyName}
                    </Text>
                  </Grid>
                  <Grid xs={2.5}>
                    <Button
                      icon={<Trash />}
                      px={0.75}
                      auto
                      onClick={() => handleRemoveWorkHistory(formObj.key)}
                    />
                  </Grid>
                </Grid.Container>
              }
              subtitle={
                <Grid.Container alignItems="center" gap={1.5}>
                  <Grid xs={2.4}>&shy;</Grid>
                  <Grid>
                    <Text small>
                      {formObj.location}
                      {formObj.startDate || formObj.endDate ? ` | ` : ""}
                      {formObj.startDate}
                      {formObj.startDate && formObj.endDate ? ` to ` : ""}
                      {formObj.disabledendDate ? "Present" : formObj.endDate}
                    </Text>
                  </Grid>
                </Grid.Container>
              }
            >
              <SingleWorkHistoryForm
                formData={formObj}
                setFieldValue={(e) => setFieldValue(e, formObj.key)}
              />
            </Collapse>
          ))}
        </DraggableCollapse>
        <Spacer />
        <Button icon={<Plus />} auto onClick={handleAddMoreExperience}>
          Add More Experience
        </Button>
      </Card>
    </div>
  );
};

export default WorkHistory;
