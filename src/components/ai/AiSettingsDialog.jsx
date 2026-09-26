import { useState, useEffect } from "react";
import { Dialog, DialogHeader } from "@astryxdesign/core/Dialog";
import { Button } from "@astryxdesign/core/Button";
import { HStack, VStack } from "@astryxdesign/core/Layout";
import { Text } from "@astryxdesign/core/Text";
import { TextInput } from "@astryxdesign/core/TextInput";
import { Selector } from "@astryxdesign/core/Selector";
import { getAiConfig, setAiConfig, clearAiConfig, isChromeAI, aiGenerate } from "@features/ai/provider";
import { useI18n } from "@features/i18n/useI18n";

const AiSettingsDialog = ({ isOpen, onOpenChange }) => {
  const { t } = useI18n();
  const chromeAI = isChromeAI();
  const [provider, setProvider] = useState("openai");
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [model, setModel] = useState("");
  const [testing, setTesting] = useState(false);
  const [testStatus, setTestStatus] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const existing = getAiConfig() || {};
      setProvider(existing.provider || (chromeAI ? "chrome" : "openai"));
      setApiKey(existing.apiKey || "");
      setBaseUrl(existing.baseUrl || "");
      setModel(existing.model || "");
      setTestStatus(null);
    }
  }, [isOpen, chromeAI]);

  const save = () => {
    setAiConfig({ provider, apiKey, baseUrl, model });
    onOpenChange(false);
  };

  const handleClear = () => {
    clearAiConfig();
    setApiKey("");
    setBaseUrl("");
    setModel("");
    setProvider(chromeAI ? "chrome" : "openai");
    setTestStatus(null);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestStatus(null);
    try {
      // Temporarily set config to test
      setAiConfig({ provider, apiKey, baseUrl, model });
      await aiGenerate({
        system: "You are a connection tester. Reply with 'OK'.",
        user: "Test connection.",
      });
      setTestStatus({
        type: "success",
        message: t("errors.connectionSuccessful"),
      });
    } catch (e) {
      setTestStatus({
        type: "error",
        message: e?.message || t("errors.connectionFailed"),
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange} width={480} padding={2}>
      <DialogHeader
        title={t("ai.settingsTitle") || "AI settings"}
        subtitle={
          t("ai.subtitle") ||
          "API keys are stored in your browser and sent directly to your provider — never to Cavren servers."
        }
        onOpenChange={onOpenChange}
      />
      <form onSubmit={(e) => e.preventDefault()} style={{ width: "100%" }}>
        <VStack gap={3} width="100%" padding={2}>
          <Selector
            label={t("ai.provider") || "Provider"}
            value={provider}
            options={[
              {
                value: "chrome",
                label: t("ai.providerChrome") || "Chrome built-in AI (Prompt API / Nano)",
                disabled: !chromeAI,
              },
              { value: "openai", label: t("ai.providerOpenAi") || "OpenAI-compatible API" },
            ]}
            onChange={setProvider}
          />
          {!chromeAI ? (
            <Text type="inherit" size="sm" color="secondary">
              {t("ai.chromeAiNote") || "Chrome built-in AI needs Chrome 127+ or Chrome 151+ with Prompt API enabled."}
            </Text>
          ) : null}
          {provider === "openai" ? (
            <>
              <TextInput
                id="ai-key"
                label={t("ai.apiKey") || "API key"}
                type="password"
                autoComplete="off"
                width="100%"
                placeholder="sk-…"
                value={apiKey}
                onChange={setApiKey}
              />
              <HStack gap={2} width="100%">
                <TextInput
                  id="ai-base"
                  label={t("ai.baseUrl") || "Base URL"}
                  width="100%"
                  placeholder="https://api.openai.com/v1"
                  value={baseUrl}
                  onChange={setBaseUrl}
                />
                <TextInput
                  id="ai-model"
                  label={t("ai.model") || "Model"}
                  width="100%"
                  placeholder="gpt-4o-mini"
                  value={model}
                  onChange={setModel}
                />
              </HStack>
            </>
          ) : null}

          {testStatus ? (
            <Text
              type="inherit"
              size="sm"
              color={testStatus.type === "success" ? "primary" : "accent"}
              role="alert"
            >
              {testStatus.message}
            </Text>
          ) : null}

          <HStack justify="between" align="center" width="100%" gap={2}>
            <HStack gap={2}>
              {apiKey || getAiConfig()?.apiKey ? (
                <Button
                  variant="ghost"
                  size="sm"
                  label={t("ai.clearKey") || "Clear key"}
                  onClick={handleClear}
                />
              ) : null}
              {provider === "openai" && apiKey ? (
                <Button
                  variant="secondary"
                  size="sm"
                  label={testing ? (t("ai.testing") || "Testing…") : (t("ai.testConnection") || "Test connection")}
                  isDisabled={testing}
                  onClick={handleTestConnection}
                />
              ) : null}
            </HStack>
            <HStack gap={2}>
              <Button
                variant="ghost"
                size="sm"
                label={t("common.cancel") || "Cancel"}
                onClick={() => onOpenChange(false)}
              />
              <Button
                variant="primary"
                size="sm"
                label={t("common.save") || "Save"}
                isDisabled={provider === "openai" && !apiKey}
                onClick={save}
              />
            </HStack>
          </HStack>
        </VStack>
      </form>
    </Dialog>
  );
};

export default AiSettingsDialog;
