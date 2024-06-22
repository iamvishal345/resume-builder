import React from "react";
import { Button, Card, Grid, Input, Spacer, Text } from "@geist-ui/core";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Plus, Trash } from "@geist-ui/icons";
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

function PersonalDetails() {
  const personalDetails = useStore((state) => state.personalDetails);
  const socialLinks = useStore((state) => state.socialLinks);
  const setPersonalDetails = useStore((state) => state.setPersonalDetails);
  const setSocialLinks = useStore((state) => state.setSocialLinks);
  const removeSocialLinks = useStore((state) => state.removeSocialLinks);
  const navigate = useNavigate();

  const setFieldValue = (e) => {
    setPersonalDetails(e.target.name, e.target.value);
  };

  const handleAddSocialLink = (e) => {
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

  const handleSocialLinksValueChange = (e, field) => {
    setSocialLinks(
      socialLinks.map((link) => {
        if (field === "description" && e.target.name === link.descriptionKey) {
          link.descriptionValue = e.target.value;
        } else if ((field === "value", e.target.name === link.valueKey)) {
          link.value = e.target.value;
        }
        return link;
      })
    );
  };

  return (
    <div>
      <Grid style={{ display: "flex" }} px={0} justify="flex-end">
        <Button
          auto
          type="success-light"
          iconRight={<ArrowRight />}
          onClick={() => navigate("../work-history")}
        >
          Next
        </Button>
      </Grid>
      <Card>
        <Text my={0} p font={1.5}>
          Personal Details
        </Text>
        <Text my={0} p type="secondary">
          Get started with the basics:{" "}
          <b>We suggest including an email and phone number.</b>
        </Text>
        <Spacer />
        <form>
          <Grid.Container gap={1.5}>
            {formStructure.map((field) => (
              <Grid key={field.name} {...field.gridProps}>
                <Input
                  scale={1.25}
                  id={field.name}
                  name={field.name}
                  width="100%"
                  placeholder={field.placeholder}
                  htmlType={field.type || "text"}
                  value={personalDetails[field.name] || ""}
                  onChange={setFieldValue}
                >
                  <Text small>{field.label}</Text>
                </Input>
              </Grid>
            ))}
            <Grid xs={24}>
              <Button
                htmlType="button"
                icon={<Plus />}
                auto
                onClick={handleAddSocialLink}
              >
                Add Social Links
              </Button>
            </Grid>
            {socialLinks.map((link) => (
              <React.Fragment key={link.descriptionKey}>
                <Grid xs={10}>
                  <Input
                    scale={1.25}
                    id={link.descriptionKey}
                    name={link.descriptionKey}
                    placeholder="Description"
                    width="100%"
                    value={link.descriptionValue || ""}
                    onChange={(e) =>
                      handleSocialLinksValueChange(e, "description")
                    }
                  />
                </Grid>
                <Grid xs={10}>
                  <Input
                    scale={1.25}
                    id={link.valueKey}
                    name={link.valueKey}
                    placeholder="Link/Text"
                    width="100%"
                    value={link.value || ""}
                    onChange={(e) => handleSocialLinksValueChange(e, "value")}
                  />
                </Grid>
                <Grid xs={4}>
                  <Button
                    icon={<Trash />}
                    width="100%"
                    type="abort"
                    onClick={() => handleRemoveSocialLink(link)}
                  />
                </Grid>
              </React.Fragment>
            ))}
          </Grid.Container>
        </form>
      </Card>
    </div>
  );
}

export default PersonalDetails;
