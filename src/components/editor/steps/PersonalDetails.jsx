import { useState } from "react";
import { Button } from "@astryxdesign/core/Button";
import { Grid, GridSpan } from "@astryxdesign/core/Grid";
import { IconButton } from "@astryxdesign/core/IconButton";
import { HStack, VStack } from "@astryxdesign/core/Layout";
import { Text } from "@astryxdesign/core/Text";
import { TextInput } from "@astryxdesign/core/TextInput";
import { Plus, Sparkles, Trash2 } from "lucide-react";
import { StepCard } from "./StepLayout";
import StartFromTitleDialog from "./StartFromTitleDialog";
import { useStore } from "@store";
import { useI18n } from "@features/i18n/useI18n";

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

function PersonalDetails({ onNext, onPrev, nextLabel }) {
  const { t } = useI18n();
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
        if (item.descriptionKey !== link.descriptionKey) return item;
        if (field === "description") {
          return { ...item, descriptionValue: value };
        }
        return { ...item, value };
      }),
    );
  };

  return (
    <StepCard
      title={t("steps.details") || "Personal Details"}
      description={
        <>
          {t("details.intro") || "Get started with the basics:"}{" "}
          <b>{t("details.contactTip") || "We suggest including an email and phone number."}</b>
        </>
      }
      onNext={onNext}
      onPrev={onPrev}
      nextLabel={nextLabel}
    >
      <HStack gap={2} align="center" wrap="wrap">
        {personalDetails.photoDataUrl ? (
          <img
            src={personalDetails.photoDataUrl}
            alt=""
            width={48}
            height={48}
            style={{
              borderRadius: "50%",
              objectFit: "cover",
              border: "1px solid var(--color-border)",
            }}
          />
        ) : null}
        <Button
          variant="secondary"
          size="sm"
          label={personalDetails.photoDataUrl ? t("editor.changePhoto") : t("editor.addPhoto")}
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/jpeg,image/png,image/webp";
            input.onchange = () => {
              const file = input.files?.[0];
              if (!file || file.size > 800_000) {
                window.alert(t("editor.photoSizeAlert"));
                return;
              }
              const reader = new FileReader();
              reader.onload = () =>
                setPersonalDetails("photoDataUrl", String(reader.result));
              reader.readAsDataURL(file);
            };
            input.click();
          }}
        />
        {personalDetails.photoDataUrl ? (
          <Button
            variant="ghost"
            size="sm"
            label={t("editor.removePhoto")}
            onClick={() => setPersonalDetails("photoDataUrl", "")}
          />
        ) : null}
        <Text type="inherit" size="sm" color="secondary">
          {t("editor.photoHint")}
        </Text>
      </HStack>
      <HStack gap={2} align="center" wrap="wrap">
        <Button
          variant="secondary"
          icon={<Sparkles size={15} />}
          label={t("titleDraft.title")}
          onClick={() => setAiDraftOpen(true)}
        />
        <Text type="inherit" size="sm" color="secondary">
          {t("titleDraft.bannerHint")}
        </Text>
      </HStack>
      <Grid columns={{ minWidth: 240, max: 2 }} gap={4} width="100%">
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
            {field.name === "email" &&
            personalDetails.email &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalDetails.email.trim()) ? (
              <Text type="inherit" size="xs" color="accent" role="alert" style={{ marginTop: "4px" }}>
                Please enter a valid email address (e.g. name@example.com).
              </Text>
            ) : null}
          </GridSpan>
        ))}
      </Grid>
      <HStack wrap="wrap">
        <Button
          variant="secondary"
          icon={<Plus size={16} />}
          label={t("editor.addSocialLinks")}
          onClick={handleAddSocialLink}
        />
      </HStack>
      <VStack gap={3} width="100%">
        {socialLinks.map((link) => (
          <Grid
            key={link.descriptionKey}
            columns={{ minWidth: 160, max: 3 }}
            gap={3}
            width="100%"
          >
            <GridSpan columns={1}>
              <TextInput
                id={link.descriptionKey}
                htmlName={link.descriptionKey}
                width="100%"
                label={t("personal.customFieldLabel") || "Description"}
                isLabelHidden
                placeholder={t("personal.customFieldLabel") || "Description"}
                value={link.descriptionValue || ""}
                onChange={(value) =>
                  handleSocialLinksValueChange(value, "description", link)
                }
              />
            </GridSpan>
            <GridSpan columns={1}>
              <TextInput
                id={link.valueKey}
                htmlName={link.valueKey}
                width="100%"
                label={t("personal.customFieldValue") || "Value"}
                isLabelHidden
                placeholder={t("personal.customFieldValuePlaceholder") || "Link/Text"}
                value={link.value || ""}
                onChange={(value) =>
                  handleSocialLinksValueChange(value, "value", link)
                }
              />
            </GridSpan>
            <GridSpan columns={1}>
              <HStack align="center" justify="start" width="100%">
                <IconButton
                  label={t("personal.removeSocialLink") || "Remove social link"}
                  tooltip={t("personal.removeSocialLink") || "Remove social link"}
                  variant="ghost"
                  icon={<Trash2 size={16} />}
                  onClick={() => handleRemoveSocialLink(link)}
                />
              </HStack>
            </GridSpan>
          </Grid>
        ))}
      </VStack>
      <StartFromTitleDialog isOpen={aiDraftOpen} onOpenChange={setAiDraftOpen} />
    </StepCard>
  );
}

export default PersonalDetails;