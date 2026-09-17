'use client';
import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
export const Dialog=DialogPrimitive.Root;
export const DialogTrigger=DialogPrimitive.Trigger;
export const DialogClose=DialogPrimitive.Close;
export const DialogTitle=DialogPrimitive.Title;
export const DialogDescription=DialogPrimitive.Description;
type DialogContentProps = React.ComponentProps<typeof DialogPrimitive.Content> & {
  overlayClassName?: string;
  overlayRef?: React.Ref<React.ComponentRef<typeof DialogPrimitive.Overlay>>;
};
export function DialogContent({className,children,overlayClassName,overlayRef,...props}:DialogContentProps){return <DialogPrimitive.Portal><DialogPrimitive.Overlay ref={overlayRef} className={cn('dialog-overlay',overlayClassName)}/><DialogPrimitive.Content className={cn('dialog-content',className)} {...props}>{children}<DialogPrimitive.Close className="dialog-close" aria-label="Close dialog"><X size={22}/></DialogPrimitive.Close></DialogPrimitive.Content></DialogPrimitive.Portal>}
