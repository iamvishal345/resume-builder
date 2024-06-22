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

const educationFormStructure = [
  {
    name: "schoolName",
    label: "School Name",
    placeholder: "eg. Indian Institute of Technology",
    gridProps: { xs: 12 },
  },
  {
    name: "location",
    label: "School Location",
    placeholder: "e.g. Delhi, India",
    gridProps: { xs: 12 },
  },
  {
    name: "degree",
    label: "Degree",
    placeholder: "e.g. B.Tech.",
    gridProps: { xs: 12 },
  },
  {
    name: "fieldOfStudy",
    label: "Field Of Study",
    placeholder: "e.g. Computer Science Engineering",
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

const SingleEducationForm = ({ formData, setFieldValue }) => {
  return (
    <Grid.Container gap={1.5}>
      {educationFormStructure.map((field) => (
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
          I currently study here
        </Text>
      </Grid>
      <Grid xs={24}>
        <ReactQuill
          theme="snow"
          value={formData.educationSummary}
          placeholder="Type coursework you did towards your degree."
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
            setFieldValue({ target: { value, name: "educationSummary" } })
          }
        />
      </Grid>
    </Grid.Container>
  );
};

const getEductionObj = () => ({
  key: crypto.randomUUID(),
  schoolName: "",
  location: "",
  degree: "",
  fieldOfStudy: "",
  startDate: "",
  endDate: "",
  educationSummary: "",
});

const EducationDetails = () => {
  const educationRef = useRef(null);
  const [cardVisible, setCardVisible] = useState();
  const education = useStore((state) => state.education);
  const setEducation = useStore((state) => state.setEducation);

  useEffect(() => {
    if (education.length) return;
    const educationObj = getEductionObj();
    setEducation([educationObj]);
    setCardVisible(educationObj.key);
  }, []);

  useEffect(() => {
    educationRef.current = education;
    if (education.length) {
      setCardVisible(education[education.length - 1].key);
    }
  }, [education]);

  const navigate = useNavigate();

  const setFieldValue = (e, key) => {
    setEducation(
      education.map((form) => {
        if (form.key === key) {
          form[e.target.name] = e.target.value;
        }
        return form;
      })
    );
  };

  const handleAddMoreEducation = () => {
    const cardObj = getEductionObj();
    setEducation([...education, cardObj]);
  };
  const handleRemoveMoreEducation = (formKey) => {
    setEducation(education.filter((form) => form.key !== formKey));
  };
  const handleItemsPosition = (oldIndex, newIndex) => {
    const updatedEducation = [...educationRef.current];
    updatedEducation.splice(
      newIndex,
      0,
      updatedEducation.splice(oldIndex, 1)[0]
    );
    setEducation(updatedEducation);
  };
  return (
    <div>
      <Grid style={{ display: "flex" }} px={0} justify="flex-end">
        <Button
          auto
          type="success-light"
          iconRight={<ArrowRight />}
          onClick={() => navigate("../skills")}
        >
          Next
        </Button>
      </Grid>
      <Card>
        <Text my={0} p font={1.5}>
          Education
        </Text>
        <Text my={0} p type="secondary">
          Add your most relevant education, including programs you're currently
          enrolled in.
        </Text>
        <Spacer />
        <DraggableCollapse onDrag={handleItemsPosition}>
          {education.map((formObj) => (
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
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    />
                  </Grid>
                  <Grid xs={18}>
                    <Text b small>
                      {formObj.schoolName}
                      {formObj.schoolName && formObj.location ? `, ` : ""}
                      {formObj.location}
                    </Text>
                  </Grid>
                  <Grid xs={2.5}>
                    <Button
                      icon={<Trash />}
                      px={0.75}
                      auto
                      onClick={() => handleRemoveMoreEducation(formObj.key)}
                    />
                  </Grid>
                </Grid.Container>
              }
              subtitle={
                <Grid.Container alignItems="center" gap={1.5}>
                  <Grid xs={2.4}>&shy;</Grid>
                  <Grid>
                    <Text small>
                      {formObj.degree}
                      {formObj.degree && formObj.fieldOfStudy ? ` : ` : ""}
                      {formObj.fieldOfStudy}
                      {formObj.startDate || formObj.endDate ? ` | ` : ""}
                      {formObj.startDate}
                      {formObj.startDate && formObj.endDate ? ` to ` : ""}
                      {formObj.disabledendDate ? "Present" : formObj.endDate}
                    </Text>
                  </Grid>
                </Grid.Container>
              }
            >
              <SingleEducationForm
                formData={formObj}
                setFieldValue={(e) => setFieldValue(e, formObj.key)}
              />
            </Collapse>
          ))}
        </DraggableCollapse>
        <Spacer />
        <Button icon={<Plus />} auto onClick={handleAddMoreEducation}>
          Add More Education
        </Button>
      </Card>
    </div>
  );
};

export default EducationDetails;
