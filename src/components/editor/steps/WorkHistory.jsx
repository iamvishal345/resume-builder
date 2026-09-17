import React, { useEffect, useRef, useState } from "react";
import { Button } from "@astryxdesign/core/Button";
import { Grid, GridSpan } from "@astryxdesign/core/Grid";
import { HStack, VStack } from "@astryxdesign/core/Layout";
import { Switch } from "@astryxdesign/core/Switch";
import { TextInput } from "@astryxdesign/core/TextInput";
import { DateInput } from "@astryxdesign/core/DateInput";
import { Plus } from "lucide-react";
import { DraggableCollapse, Collapse } from "@components/DraggableCollapse";
import { StepCard } from "./StepLayout";
import { useStore } from "@store";
import RichTextEditor from "../../ui/RichTextEditor";

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
    <Grid columns={2} gap={3}>
      {workHistoryFormStructure.map((field) => (
        <GridSpan
          key={field.name}
          columns={field.gridProps.xs === 24 ? "full" : 1}
        >
          {field.type === "date" ? (
            <DateInput
              label={field.label}
              width="100%"
              placeholder={field.placeholder}
              isDisabled={!!formData[`disabled${field.name}`]}
              value={formData[field.name] || ""}
              onChange={(value) =>
                setFieldValue({
                  target: { name: field.name, value: value || "" },
                })
              }
            />
          ) : (
            <TextInput
              id={field.name}
              htmlName={field.name}
              width="100%"
              label={field.label}
              placeholder={field.placeholder}
              isDisabled={!!formData[`disabled${field.name}`]}
              value={formData[field.name] || ""}
              onChange={(value) =>
                setFieldValue({ target: { name: field.name, value } })
              }
            />
          )}
        </GridSpan>
      ))}
      <GridSpan columns="full">
        <HStack justify="end" align="center" width="100%">
          <Switch
            label="I currently work here"
            value={!!formData.disabledendDate}
            onChange={(checked) =>
              setFieldValue({
                target: { name: "disabledendDate", value: checked },
              })
            }
          />
        </HStack>
      </GridSpan>
      <GridSpan columns="full">
        <RichTextEditor
          value={formData.workSummary || ""}
          minHeight={200}
          placeholder="Type your achievements and responsibilities here. For e.g. Contributed to the development of innovative software solutions, leveraging expertise in Javascript, at..."
          onChange={(value) =>
            setFieldValue({ target: { name: "workSummary", value } })
          }
          extraContext={`Position: ${formData.positionTitle || ""}\nCompany: ${formData.companyName || ""}\nLocation: ${formData.location || ""}`}
        />
      </GridSpan>
    </Grid>
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

const WorkHistory = ({ onNext }) => {
  const workHistoryRef = useRef(null);
  const [cardVisible, setCardVisible] = useState();
  const workHistory = useStore((state) => state.workHistory);
  const setWorkHistory = useStore((state) => state.setWorkHistory);

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
  const setFieldValue = (data, key) => {
    setWorkHistory(
      workHistory.map((form) => {
        if (form.key === key) {
          form[data.target.name] = data.target.value;
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
    <StepCard
      title="Professional Experience"
      description="Start with your most recent experience and work backward."
      onNext={onNext}
    >
      <DraggableCollapse onDrag={handleItemsPosition}>
        {workHistory.map((formObj) => (
          <Collapse
            visible={formObj.key === cardVisible}
            clickHandler={() =>
              setCardVisible(formObj.key === cardVisible ? "" : formObj.key)
            }
            onDelete={() => handleRemoveWorkHistory(formObj.key)}
            key={formObj.key}
            title={
              <>
                {formObj.positionTitle}
                {formObj.positionTitle && formObj.companyName ? `, ` : ""}
                {formObj.companyName}
              </>
            }
            subtitle={
              <>
                {formObj.location}
                {formObj.startDate || formObj.endDate ? ` | ` : ""}
                {formObj.startDate}
                {formObj.startDate && formObj.endDate ? ` to ` : ""}
                {formObj.disabledendDate ? "Present" : formObj.endDate}
              </>
            }
          >
            <SingleWorkHistoryForm
              formData={formObj}
              setFieldValue={(data) => setFieldValue(data, formObj.key)}
            />
          </Collapse>
        ))}
      </DraggableCollapse>
      <HStack>
        <Button
          variant="secondary"
          icon={<Plus size={16} />}
          label="Add More Experience"
          onClick={handleAddMoreExperience}
        />
      </HStack>
    </StepCard>
  );
};

export default WorkHistory;