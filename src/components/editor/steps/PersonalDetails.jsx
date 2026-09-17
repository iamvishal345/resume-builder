import React, { useState } from "react";
import { Button } from "@astryxdesign/core/Button";
import { Grid, GridSpan } from "@astryxdesign/core/Grid";
import { IconButton } from "@astryxdesign/core/IconButton";
import { HStack } from "@astryxdesign/core/Layout";
import { Text } from "@astryxdesign/core/Text";
import { TextInput } from "@astryxdesign/core/TextInput";
import { Plus, Sparkles, Trash2 } from "lucide-react";
import { StepCard } from "./StepLayout";
import StartFromTitleDialog from "./StartFromTitleDialog";
import { useStore } from "@store";

const formStructure = [
  {
    name: "firstName",
    label: "First Name",
    placeholder: "e.g. Vishal",
    gridProps: { xs: 12 },
  },
  {
    name: "lastName",
    label: "Last Name",
    placeholder: "e.g. Sharma",
    gridProps: { xs: 12 },
  },
  {
    name: "designation",
    label: "Job Title",
    placeholder: "e.g. Software Engineer",
    gridProps: { xs: 24 },
  },
  {
    name: "email",
    type: "email",
    label: "Email",
    placeholder: "e.g. vishal.sharma@email.com",
    gridProps: { xs: 12 },
  },

  {
    name: "contactNumber",
    type: "tel",
    label: "Phone Number",
    placeholder: "e.g. +91 9876543210",
    gridProps: { xs: 12 },
  },
  {
    name: "address",
    label: "Address",
    placeholder: "e.g. 494, Sector 12",
    gridProps: { xs: 24 },
  },
  {
    name: "city",
    label: "City",
    placeholder: "e.g. Gurgaon",
    gridProps: { xs: 12 },
  },
  {
    name: "state",
    label: "State",
    placeholder: "e.g. Haryana",
    gridProps: { xs: 12 },
  },
  {
    name: "country",
    label: "Country",
    placeholder: "e.g. India",
    gridProps: { xs: 12 },
  },
  {
    name: "pinCode",
    label: "Pin Code",
    placeholder: "e.g. 122001",
    gridProps: { xs: 12 },
  },
];

function PersonalDetails({ onNext }) {
  const personalDetails = useStore((state) => state.personalDetails);
  const socialLinks = useStore((state) => state.socialLinks);
  const setPersonalDetails = useStore((state) => state.setPersonalDetails);
  const setSocialLinks = useStore((state) => state.setSocialLinks);
  const removeSocialLinks = useStore((state) => state.removeSocialLinks);
  const [aiDraftOpen, setAiDraftOpen] = useState(false);

  const handleAddSocialLink = () => {
    const socialLinkObj = {
      descriptionKey: crypto.randomUUID(),
      descriptionValue: "",
      valueKey: crypto.randomUUID(),
      value: "",
    };
    setSocialLinks([...socialLinks, socialLinkObj]);
  };
  const handleRemoveSocialLink = (linkToRemove) => {
    removeSocialLinks(linkToRemove);
  };

  const handleSocialLinksValueChange = (value, field, link) => {
    setSocialLinks(
      socialLinks.map((item) => {
        if (item.descriptionKey === link.descriptionKey) {
          if (field === "description") {
            item.descriptionValue = value;
          } else {
            item.value = value;
          }
        }
        return item;
      })
    );
  };

  return (
    <StepCard
      title="Personal Details"
      description={
        <>
          Get started with the basics:{" "}
          <b>We suggest including an email and phone number.</b>
        </>
      }
      onNext={onNext}
    >
      <HStack gap={2} align="center" wrap>
        <Button
          variant="secondary"
          icon={<Sparkles size={15} />}
          label="Start from a job title"
          onClick={() => setAiDraftOpen(true)}
        />
        <Text type="inherit" size="sm" color="secondary">
          New here? Let AI draft a believable starting point.
        </Text>
      </HStack>
      <Grid columns={2} gap={4}>
        {formStructure.map((field) => (
          <GridSpan
            key={field.name}
            columns={field.gridProps.xs === 24 ? "full" : 1}
          >
            <TextInput
              id={field.name}
              htmlName={field.name}
              width="100%"
              label={field.label}
              placeholder={field.placeholder}
              type={field.type === "email" ? "email" : "text"}
              value={personalDetails[field.name] || ""}
              onChange={(value) => setPersonalDetails(field.name, value)}
            />
          </GridSpan>
        ))}
      </Grid>
      <HStack>
        <Button
          variant="secondary"
          icon={<Plus size={16} />}
          label="Add Social Links"
          onClick={handleAddSocialLink}
        />
      </HStack>
      <Grid columns={12} gap={3}>
        {socialLinks.map((link) => (
          <React.Fragment key={link.descriptionKey}>
            <GridSpan columns={5}>
              <TextInput
                id={link.descriptionKey}
                htmlName={link.descriptionKey}
                width="100%"
                label="Description"
                isLabelHidden
                placeholder="Description"
                value={link.descriptionValue || ""}
                onChange={(value) =>
                  handleSocialLinksValueChange(value, "description", link)
                }
              />
            </GridSpan>
            <GridSpan columns={5}>
              <TextInput
                id={link.valueKey}
                htmlName={link.valueKey}
                width="100%"
                label="Value"
                isLabelHidden
                placeholder="Link/Text"
                value={link.value || ""}
                onChange={(value) =>
                  handleSocialLinksValueChange(value, "value", link)
                }
              />
            </GridSpan>
            <GridSpan columns={2}>
              <HStack align="center" justify="center" width="100%">
                <IconButton
                  label="Remove social link"
                  tooltip="Remove social link"
                  variant="ghost"
                  icon={<Trash2 size={16} />}
                  onClick={() => handleRemoveSocialLink(link)}
                />
              </HStack>
            </GridSpan>
          </React.Fragment>
        ))}
      </Grid>
      <StartFromTitleDialog isOpen={aiDraftOpen} onOpenChange={setAiDraftOpen} />
    </StepCard>
  );
}

export default PersonalDetails;