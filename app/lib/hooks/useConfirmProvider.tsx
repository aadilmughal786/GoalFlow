// src/lib/hooks/useConfirmProvider.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
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
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react"; // Import Loader2 icon

interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  confirmVariant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  cancelVariant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  isConfirming?: boolean; // For external loading state if needed
  countdownSeconds?: number; // New: Optional countdown timer
}

interface ConfirmContextType {
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmDialogOptions | null>(null);
  const resolveRef = useRef<(value: boolean) => void>();
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);

  const confirm = useCallback(
    (opts: ConfirmDialogOptions): Promise<boolean> => {
      return new Promise((resolve) => {
        setOptions(opts);
        setIsOpen(true);
        setRemainingSeconds(opts.countdownSeconds || 0); // Initialize countdown
        resolveRef.current = resolve;
      });
    },
    []
  );

  // Countdown effect
  useEffect(() => {
    if (isOpen && options?.countdownSeconds && remainingSeconds > 0) {
      const timer = setInterval(() => {
        setRemainingSeconds((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isOpen, options, remainingSeconds]);

  const handleConfirm = () => {
    setIsOpen(false);
    if (resolveRef.current) {
      resolveRef.current(true);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (resolveRef.current) {
      resolveRef.current(false);
    }
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {options?.title || "Confirm Action"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {options?.message || "Are you sure you want to proceed?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={handleCancel}
              variant={options?.cancelVariant || "outline"}
              disabled={options?.isConfirming} // Disable cancel if confirming is in progress
            >
              {options?.cancelText || "Cancel"}
            </AlertDialogCancel>
            <Button
              onClick={handleConfirm}
              variant={options?.confirmVariant || options?.variant || "default"}
              disabled={options?.isConfirming || remainingSeconds > 0} // Disable if confirming or countdown active
              className="cursor-pointer"
            >
              {options?.isConfirming ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {options?.confirmText || "Confirm"}
              {options?.countdownSeconds &&
                remainingSeconds > 0 &&
                ` (${remainingSeconds}s)`}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContext.Provider>
  );
};

export const useConfirmDialog = () => {
  const context = useContext(ConfirmContext);
  if (context === undefined) {
    throw new Error("useConfirmDialog must be used within a ConfirmProvider");
  }
  return context.confirm;
};
