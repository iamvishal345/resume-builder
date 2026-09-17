import { useState } from "react";
import { Dialog, DialogHeader } from "@astryxdesign/core/Dialog";
import { Button } from "@astryxdesign/core/Button";
import { HStack, VStack } from "@astryxdesign/core/Layout";
import { Text } from "@astryxdesign/core/Text";
import { TextInput } from "@astryxdesign/core/TextInput";
import { Selector } from "@astryxdesign/core/Selector";
import { getAiConfig, setAiConfig, isChromeAI } from "@features/ai/provider";

const AiSettingsDialog = ({ isOpen, onOpenChange }) => {
  const existing = getAiConfig() || {};
  const chromeAI = isChromeAI();
  const [provider, setProvider] = useState(
    existing.provider || (chromeAI ? "chrome" : "openai"),
  );
  const [apiKey, setApiKey] = useState(existing.apiKey || "");
  const [baseUrl, setBaseUrl] = useState(existing.baseUrl || "");
  const [model, setModel] = useState(existing.model || "");

  const save = () => {
    setAiConfig({ provider, apiKey, baseUrl, model });
    onOpenChange(false);
  };

  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange} width={460} padding={2}>
      <DialogHeader
        title="AI settings"
        subtitle="Keys are stored only in this browser and never leave your device."
        onOpenChange={onOpenChange}
      />
      <VStack gap={3} width="100%" padding={2}>
        <Selector
          label="Provider"
          value={provider}
          options={[
            {
              value: "chrome",
              label: "Chrome built-in AI (Nano)",
              disabled: !chromeAI,
            },
            { value: "openai", label: "OpenAI-compatible API" },
          ]}
          onChange={setProvider}
        />
        {!chromeAI ? (
          <Text type="inherit" size="sm" color="secondary">
            Chrome built-in AI needs Chrome 127+ with{" "}
            <Text type="inherit" size="sm" color="primary" as="span">
              chrome://flags/#prompt-api-for-gemini-nano
            </Text>{" "}
            enabled (or the on-device AI onboarding).
          </Text>
        ) : null}
        {provider === "openai" ? (
          <>
            <TextInput
              id="ai-key"
              label="API key"
              type="password"
              width="100%"
              placeholder="sk-…"
              value={apiKey}
              onChange={setApiKey}
            />
            <HStack gap={2} width="100%">
              <TextInput
                id="ai-base"
                label="Base URL"
                width="100%"
                placeholder="https://api.openai.com/v1"
                value={baseUrl}
                onChange={setBaseUrl}
              />
              <TextInput
                id="ai-model"
                label="Model"
                width="100%"
                placeholder="gpt-4o-mini"
                value={model}
                onChange={setModel}
              />
            </HStack>
          </>
        ) : null}
        <HStack justify="end" gap={2} width="100%">
          <Button
            variant="ghost"
            label="Cancel"
            onClick={() => onOpenChange(false)}
          />
          <Button
            variant="primary"
            label="Save"
            isDisabled={provider === "openai" && !apiKey}
            onClick={save}
          />
        </HStack>
      </VStack>
    </Dialog>
  );
};

export default AiSettingsDialog;
