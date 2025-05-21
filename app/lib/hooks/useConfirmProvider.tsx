// src/lib/hooks/useConfirmProvider.tsx
"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useConfirm } from "./useConfirm"; // Import the useConfirm hook

interface ConfirmContextType {
  confirm: (options?: {
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
  }) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

/**
 * Provides the confirmation dialog functionality to its children.
 * Renders the ConfirmDialog component.
 */
export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const { ConfirmDialog, confirm } = useConfirm();

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <ConfirmDialog /> {/* Render the actual dialog component here */}
    </ConfirmContext.Provider>
  );
}

/**
 * Custom hook to consume the confirmation dialog context.
 * @returns The `confirm` function to trigger the dialog.
 * @throws An error if used outside of a `ConfirmDialogProvider`.
 */
export function useConfirmDialog() {
  const context = useContext(ConfirmContext);
  if (context === undefined) {
    throw new Error(
      "useConfirmDialog must be used within a ConfirmDialogProvider"
    );
  }
  return context.confirm;
}
