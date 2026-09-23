import { useEffect, useMemo, useState } from "react";
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
import { formatDiffLines, diffVersions } from "@features/resumes/versionDiff";
import { useStore, resumeDataOf } from "@store";

const DiffVsCurrent = ({ lines }) => {
  if (!lines.length) {
    return (
      <Text type="inherit" size="sm" color="secondary">
        Matches current
      </Text>
    );
  }
  return (
    <VStack gap={0} width="100%">
      <Text type="inherit" size="sm" color="secondary">
        vs current
      </Text>
      <ul className="ver-diff-list">
        {lines.map((line) => (
          <li key={line}>
            <Text type="inherit" size="sm" color="secondary">
              {line}
            </Text>
          </li>
        ))}
      </ul>
    </VStack>
  );
};

const VersionsPanel = ({ open, onOpenChange, resumeId }) => {
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);

  // Snapshot current editor state only when the list changes (dialog is modal).
  const diffsById = useMemo(() => {
    const current = resumeDataOf(useStore.getState());
    const map = {};
    for (const v of items) {
      map[v.id] = formatDiffLines(diffVersions(v.data || {}, current));
    }
    return map;
  }, [items]);

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
      await saveVersion(resumeId, resumeDataOf(useStore.getState()));
      await reload();
    } finally {
      setBusy(false);
    }
  };

  const restore = async (id) => {
    if (
      !window.confirm(
        "Restore this snapshot? Current editor content will be replaced.",
      )
    ) {
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
                <VStack key={v.id} gap={1} width="100%">
                  <HStack
                    justify="between"
                    align="start"
                    width="100%"
                    gap={2}
                  >
                    <VStack gap={0}>
                      <Text
                        type="inherit"
                        size="sm"
                        weight="semibold"
                        color="primary"
                      >
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
                  <DiffVsCurrent lines={diffsById[v.id] || []} />
                </VStack>
              ))
            )}
          </VStack>
        </div>
      </VStack>
    </Dialog>
  );
};

export default VersionsPanel;
