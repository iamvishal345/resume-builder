import { useEffect, useState } from "react";
import { HStack, VStack } from "@astryxdesign/core/Layout";
import { Button } from "@astryxdesign/core/Button";
import { Text } from "@astryxdesign/core/Text";
import { Card } from "@astryxdesign/core/Card";
import { Shield } from "lucide-react";
import { useI18n } from "@features/i18n/useI18n";

const KEY = "cavren-ownership-tip-dismissed";

const OwnershipTip = ({ onOpenPrivacy }) => {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* private mode */
    }
    setVisible(false);
  };

  return (
    <Card padding={3} width="100%" role="status" aria-live="polite">
      <HStack gap={3} align="start" width="100%" wrap>
        <Shield size={18} color="var(--color-accent)" aria-hidden="true" />
        <VStack gap={2} style={{ flex: 1, minWidth: "12rem" }}>
          <Text type="inherit" size="sm" weight="semibold" color="primary">
            {t("ownership.tipTitle")}
          </Text>
          <Text type="inherit" size="sm" color="secondary">
            {t("ownership.tipBody")}
          </Text>
          <HStack gap={2} wrap>
            <Button
              size="sm"
              variant="secondary"
              label={t("ownership.tipOpen")}
              onClick={() => {
                onOpenPrivacy?.();
                dismiss();
              }}
            />
            <Button
              size="sm"
              variant="ghost"
              label={t("ownership.tipDismiss")}
              onClick={dismiss}
            />
          </HStack>
        </VStack>
      </HStack>
    </Card>
  );
};

export default OwnershipTip;
