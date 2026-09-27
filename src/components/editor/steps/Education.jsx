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
import { useI18n } from "@features/i18n/useI18n";
import RichTextEditor from "../../ui/RichTextEditor";

const educationFormStructure = (t) => [
  {
    name: "schoolName",
    label: t("education.schoolName") || "School Name",
    placeholder: "eg. Indian Institute of Technology",
    gridProps: { xs: 12 },
  },
  {
    name: "location",
    label: t("education.schoolLocation") || "School Location",
    placeholder: "e.g. Delhi, India",
    gridProps: { xs: 12 },
  },
  {
    name: "degree",
    label: t("education.degree") || "Degree",
    placeholder: "e.g. B.Tech.",
    gridProps: { xs: 12 },
  },
  {
    name: "fieldOfStudy",
    label: t("education.fieldOfStudy") || "Field Of Study",
    placeholder: "e.g. Computer Science Engineering",
    gridProps: { xs: 12 },
  },
  {
    name: "startDate",
    label: t("education.startDate") || "Start Date",
    type: "date",
    placeholder: "",
    gridProps: { xs: 12 },
  },
  {
    name: "endDate",
    label: t("education.endDate") || "End Date",
    type: "date",
    placeholder: "",
    gridProps: { xs: 12 },
  },
];

const SingleEducationForm = ({ formData, setFieldValue }) => {
  const { t } = useI18n();
  const isChronologyError =
    formData.startDate &&
    formData.endDate &&
    !formData.disabledendDate &&
    formData.endDate < formData.startDate;

  return (
    <Grid columns={{ minWidth: 240, max: 2 }} gap={3} width="100%">
      {educationFormStructure(t).map((field) => (
        <React.Fragment key={field.name}>
          {field.type === "date" ? (
            <GridSpan columns={field.gridProps.xs === 24 ? "full" : 1}>
              <VStack gap={1} width="100%">
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
                {field.name === "endDate" && isChronologyError ? (
                  <Text type="inherit" size="xs" color="accent" role="alert">
                    End date cannot be before start date.
                  </Text>
                ) : null}
              </VStack>
            </GridSpan>
          ) : (
            <GridSpan columns={field.gridProps.xs === 24 ? "full" : 1}>
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
            </GridSpan>
          )}
        </React.Fragment>
      ))}
      <GridSpan columns="full">
        <HStack justify="end" align="center" width="100%">
          <Switch
            label={
              t("education.currentlyStudyHere") || "I currently study here"
            }
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
          value={formData.educationSummary || ""}
          minHeight={160}
          placeholder={
            t("education.descriptionPlaceholder") ||
            "Type coursework you did towards your degree."
          }
          onChange={(value) =>
            setFieldValue({ target: { name: "educationSummary", value } })
          }
        />
      </GridSpan>
    </Grid>
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

const EducationDetails = ({ onNext, onPrev, nextLabel }) => {
  const { t } = useI18n();
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

  const setFieldValue = (data, key) => {
    setEducation(
      education.map((form) =>
        form.key === key
          ? { ...form, [data.target.name]: data.target.value }
          : form,
      ),
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
      updatedEducation.splice(oldIndex, 1)[0],
    );
    setEducation(updatedEducation);
  };
  return (
    <StepCard
      title={t("steps.education") || "Education"}
      description={
        t("education.description") ||
        "Add your most relevant education, including programs you're currently enrolled in."
      }
      onNext={onNext}
      onPrev={onPrev}
      nextLabel={nextLabel}
    >
      <DraggableCollapse onDrag={handleItemsPosition}>
        {education.map((formObj) => (
          <Collapse
            visible={formObj.key === cardVisible}
            clickHandler={() =>
              setCardVisible(formObj.key === cardVisible ? "" : formObj.key)
            }
            onDelete={() => handleRemoveMoreEducation(formObj.key)}
            key={formObj.key}
            title={
              <>
                {formObj.schoolName}
                {formObj.schoolName && formObj.location ? `, ` : ""}
                {formObj.location}
              </>
            }
            subtitle={
              <>
                {formObj.degree}
                {formObj.degree && formObj.fieldOfStudy ? ` : ` : ""}
                {formObj.fieldOfStudy}
                {formObj.startDate || formObj.endDate ? ` | ` : ""}
                {formObj.startDate}
                {formObj.startDate && formObj.endDate ? ` to ` : ""}
                {formObj.disabledendDate ? "Present" : formObj.endDate}
              </>
            }
          >
            <SingleEducationForm
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
          label={t("education.addMore") || "Add More Education"}
          onClick={handleAddMoreEducation}
        />
      </HStack>
    </StepCard>
  );
};

export default EducationDetails;
