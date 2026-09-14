'use client';
import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '@/lib/utils';
export function Slider({ className, ...props }: React.ComponentProps<typeof SliderPrimitive.Root>) {
  return <SliderPrimitive.Root role="group" className={cn('slider-root', className)} {...props}>
    <SliderPrimitive.Track className="slider-track"><SliderPrimitive.Range className="slider-range" /></SliderPrimitive.Track>
    <SliderPrimitive.Thumb aria-label={props['aria-label']} aria-labelledby={props['aria-labelledby']} className="slider-thumb" />
  </SliderPrimitive.Root>;
}
