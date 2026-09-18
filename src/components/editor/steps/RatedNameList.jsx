import { useCallback } from "react";
import { Button } from "@astryxdesign/core/Button";
import { IconButton } from "@astryxdesign/core/IconButton";
import { HStack, VStack } from "@astryxdesign/core/Layout";
import { Switch } from "@astryxdesign/core/Switch";
import { Text } from "@astryxdesign/core/Text";
import { TextInput } from "@astryxdesign/core/TextInput";
import { Rating } from "@components/Rating";
import { Circle, GripVertical, Plus, Trash2 } from "lucide-react";
import { DraggableList } from "@components/DraggableCollapse";
import "./skills.css";

const Row = ({
  item,
  nameLabel,
  namePlaceholder,
  showLevel,
  onChange,
  onRemove,
}) => (
  <div className={`skill-row${showLevel ? "" : " skill-row-no-level"}`}>
    <IconButton
      label="Drag"
      tooltip="Drag to reorder"
      variant="ghost"
      size="sm"
      className="drag-button"
      icon={<GripVertical size={15} />}
    />
    <TextInput
      id={item.key}
      htmlName="name"
      width="100%"
      label={nameLabel}
      isLabelHidden
      value={item.name || ""}
      placeholder={namePlaceholder}
      onChange={(value) => onChange("name", value)}
    />
    {showLevel ? (
      <div className="skill-row-rating">
        <Rating
          value={item.level}
          onValueChange={(value) => onChange("level", value)}
          type="success"
          icon={Circle}
        />
      </div>
    ) : null}
    <IconButton
      label={`Remove ${nameLabel.toLowerCase()}`}
      tooltip={`Remove ${nameLabel.toLowerCase()}`}
      variant="ghost"
      size="sm"
      icon={<Trash2 size={16} />}
      onClick={onRemove}
    />
  </div>
);

/**
 * Flat draggable name (+ optional level) list — shared by Skills, Languages, Interests.
 */
export const RatedNameList = ({
  items = [],
  onItemsChange,
  createItem,
  nameLabel = "Name",
  namePlaceholder = "",
  addLabel = "Add",
  showLevel = true,
  levelConfigurable = false,
  onShowLevelChange,
}) => {
  const setField = (key, name, value) => {
    onItemsChange(
      items.map((item) => (item.key === key ? { ...item, [name]: value } : item)),
    );
  };

  const handleReorder = useCallback(
    (oldIndex, newIndex) => {
      const next = [...items];
      const [moved] = next.splice(oldIndex, 1);
      next.splice(newIndex, 0, moved);
      onItemsChange(next);
    },
    [items, onItemsChange],
  );

  return (
    <VStack gap={3} width="100%">
      {levelConfigurable ? (
        <HStack justify="end" width="100%">
          <Switch
            label="Show level"
            value={!!showLevel}
            onChange={(checked) => onShowLevelChange?.(!!checked)}
          />
        </HStack>
      ) : null}
      <div className={`skill-list${showLevel ? "" : " skill-list-no-level"}`}>
        <div className="skill-list-head" aria-hidden="true">
          <span className="skill-list-head-drag" />
          <Text type="inherit" size="sm" weight="medium" color="secondary">
            {nameLabel}
          </Text>
          {showLevel ? (
            <span className="skill-list-head-level">
              <Text type="inherit" size="sm" weight="medium" color="secondary">
                Level
              </Text>
            </span>
          ) : null}
          <span className="skill-list-head-action" />
        </div>
        <DraggableList onDrag={handleReorder} gap={0}>
          {items.map((item) => (
            <Row
              key={item.key}
              item={item}
              nameLabel={nameLabel}
              namePlaceholder={namePlaceholder}
              showLevel={showLevel}
              onChange={(name, value) => setField(item.key, name, value)}
              onRemove={() =>
                onItemsChange(items.filter((row) => row.key !== item.key))
              }
            />
          ))}
        </DraggableList>
      </div>
      <HStack>
        <Button
          variant="secondary"
          size="sm"
          icon={<Plus size={16} />}
          label={addLabel}
          onClick={() => onItemsChange([...items, createItem()])}
        />
      </HStack>
    </VStack>
  );
};

export default RatedNameList;
