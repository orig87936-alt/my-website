"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "./utils";
import { buttonVariants } from "./button";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-1.5", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-1.5",
        month: "flex flex-col gap-2",
        caption: "flex justify-center pt-0.5 relative items-center w-full",
        caption_label: "text-xs font-medium flex-1 text-center",
        caption_dropdowns: "hidden", // 隐藏下拉菜单
        nav: "flex items-center justify-between w-full absolute left-0 right-0 px-2",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "size-8 bg-white/5 p-0 hover:bg-white/10 text-white border-white/20",
        ),
        nav_button_previous: "",
        nav_button_next: "",
        table: "w-full border-collapse",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-7 font-normal text-[0.65rem]",
        row: "flex w-full mt-1",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-range-end)]:rounded-r-md",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md",
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "size-7 p-0 font-normal aria-selected:opacity-100 text-[10px]",
        ),
        day_range_start:
          "day-range-start aria-selected:bg-primary aria-selected:text-primary-foreground",
        day_range_end:
          "day-range-end aria-selected:bg-primary aria-selected:text-primary-foreground",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ArrowLeft className={cn("size-3.5", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ArrowRight className={cn("size-3.5", className)} {...props} />
        ),
      }}
      {...props}
    />
  );
}

export { Calendar };
