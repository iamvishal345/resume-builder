import { useEffect, useState } from "react";
import { VStack, HStack } from "@astryxdesign/core/Layout";
import { Button } from "@astryxdesign/core/Button";
import { Text } from "@astryxdesign/core/Text";
import { Dialog, DialogHeader } from "@astryxdesign/core/Dialog";
import { History, RotateCcw, Trash2 } from "lucide-react";
import {
  listVersions,
  saveVersion,
  deleteVersion,
  getVersion,
} from "@features/resumes/versions";
import { useStore, resumeDataOf } from "@store";

const VersionsPanel = ({ open, onOpenChange, resumeId }) => {
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);

  const reload = async () => {
    if (!resumeId) return;
    setItems(await listVersions(resumeId));
  };

  useEffect(() => {
    if (open) reload();
  }, [open, resumeId]);

  const snapshot = async () => {
    if (!resumeId) return;
    setBusy(true);
    try {
      const data = resumeDataOf(useStore.getState());
      await saveVersion(resumeId, data);
      await reload();
    } finally {
      setBusy(false);
    }
  };

  const restore = async (id) => {
    if (!window.confirm("Restore this snapshot? Current editor content will be replaced.")) {
      return;
    }
    setBusy(true);
    try {
      const ver = await getVersion(id);
      if (ver?.data) {
        useStore.getState().applyResumeData(ver.data);
      }
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    await deleteVersion(id);
    await reload();
  };

  return (
    <Dialog
      isOpen={open}
      onOpenChange={onOpenChange}
      width={480}
      maxHeight="80dvh"
      padding={2}
    >
      <DialogHeader
        title="Versions"
        subtitle="Local snapshots stored in this browser. Max 20 per resume."
        onOpenChange={onOpenChange}
      />
      <VStack gap={3} width="100%" padding={2}>
        <Button
          size="sm"
          variant="primary"
          icon={<History size={14} />}
          label={busy ? "Working…" : "Save snapshot now"}
          disabled={busy || !resumeId}
          onClick={snapshot}
        />
        <div className="r-gallery-scroll">
          <VStack gap={2} width="100%">
            {items.length === 0 ? (
              <Text type="inherit" size="sm" color="secondary">
                No snapshots yet. Save one before a big tailor or import.
              </Text>
            ) : (
              items.map((v) => (
                <HStack
                  key={v.id}
                  justify="between"
                  align="center"
                  width="100%"
                  gap={2}
                >
                  <VStack gap={0}>
                    <Text type="inherit" size="sm" weight="semibold" color="primary">
                      {v.name}
                    </Text>
                    <Text type="inherit" size="sm" color="secondary">
                      {v.summary}
                    </Text>
                  </VStack>
                  <HStack gap={1}>
                    <Button
                      size="sm"
                      variant="secondary"
                      icon={<RotateCcw size={14} />}
                      label="Restore"
                      disabled={busy}
                      onClick={() => restore(v.id)}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={<Trash2 size={14} />}
                      label="Delete"
                      onClick={() => remove(v.id)}
                    />
                  </HStack>
                </HStack>
              ))
            )}
          </VStack>
        </div>
      </VStack>
    </Dialog>
  );
};

export default VersionsPanel;
