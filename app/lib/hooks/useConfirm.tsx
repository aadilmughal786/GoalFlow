// src/lib/hooks/useConfirm.ts
"use client";

import { useState, useCallback } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConfirmDialogOptions {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
}

/**
 * A custom hook to display a confirmation dialog using Shadcn UI's AlertDialog.
 * @returns A tuple containing:
 * - `ConfirmDialog`: The React component to render the dialog.
 * - `confirm`: An async function to trigger the dialog, returning true if confirmed, false otherwise.
 */
export function useConfirm() {
  const [resolvePromise, setResolvePromise] = useState<
    ((value: boolean) => void) | null
  >(null);
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmDialogOptions>({});

  /**
   * Function to open the confirmation dialog and return a promise that resolves with the user's choice.
   * @param opts Options for the dialog (title, message, button texts).
   * @returns A promise that resolves to `true` if confirmed, `false` if canceled.
   */
  const confirm = useCallback(
    (opts: ConfirmDialogOptions = {}): Promise<boolean> => {
      return new Promise((resolve) => {
        setOptions(opts);
        setIsOpen(true);
        setResolvePromise(() => resolve);
      });
    },
    []
  );

  /**
   * Handles the confirmation action.
   */
  const handleConfirm = useCallback(() => {
    if (resolvePromise) {
      resolvePromise(true);
    }
    setIsOpen(false);
  }, [resolvePromise]);

  /**
   * Handles the cancellation action.
   */
  const handleCancel = useCallback(() => {
    if (resolvePromise) {
      resolvePromise(false);
    }
    setIsOpen(false);
  }, [resolvePromise]);

  /**
   * The AlertDialog component to be rendered in your application's root or a common layout.
   */
  const ConfirmDialog = () => (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {options.title || "Are you absolutely sure?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {options.message || "This action cannot be undone."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>
            {options.cancelText || "Cancel"}
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>
            {options.confirmText || "Continue"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return { ConfirmDialog, confirm };
}
