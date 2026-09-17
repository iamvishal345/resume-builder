import React from "react";
import { Button } from "@astryxdesign/core/Button";
import { HStack } from "@astryxdesign/core/Layout";
import { Text } from "@astryxdesign/core/Text";
import { IconButton } from "@astryxdesign/core/IconButton";
import { LogIn, LogOut, Cloud } from "lucide-react";
import { isSupabaseConfigured, signInWithGoogle, signOut } from "@lib/supabase";
import { useSupabaseSync } from "@hooks/useSupabaseSync";

const AuthBar = () => {
  const { user, syncing } = useSupabaseSync();

  if (!isSupabaseConfigured()) return null;

  if (!user) {
    return (
      <Button
        variant="ghost"
        size="sm"
        icon={<LogIn size={14} />}
        label="Sign in to sync"
        onClick={() => signInWithGoogle()}
      />
    );
  }

  return (
    <HStack gap={2} align="center">
      {syncing ? (
        <Text type="inherit" size="sm" color="secondary">
          Syncing…
        </Text>
      ) : (
        <Cloud size={14} color="var(--color-success)" />
      )}
      <Text type="inherit" size="sm" color="secondary">
        {(user.email || "").split("@")[0]}
      </Text>
      <IconButton
        label="Sign out"
        tooltip="Sign out"
        variant="ghost"
        icon={<LogOut size={14} />}
        onClick={() => signOut()}
      />
    </HStack>
  );
};

export default AuthBar;