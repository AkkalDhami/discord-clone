"use client";

import { useQueryState } from "nuqs";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  IconAdjustments,
  IconSortAscending,
  IconSortDescending
} from "@tabler/icons-react";

const SORT_OPTIONS = [
  {
    value: "default",
    label: "Sort by Default",
    icon: IconAdjustments
  },
  {
    value: "newest",
    label: "Newest Friend First",
    icon: IconSortAscending
  },
  {
    value: "oldest",
    label: "Oldest Friend First",
    icon: IconSortDescending
  }
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export function SortFriend({ className }: { className?: string }) {
  const [sort, setSort] = useQueryState("sort", {
    defaultValue: "default",
    shallow: false
  });

  const selected = SORT_OPTIONS.find(o => o.value === sort);
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Select
        value={sort}
        aria-label="Sort friends"
        onValueChange={value => {
          setSort(value as SortValue);
        }}>
        <SelectTrigger>
          <SelectValue>{selected?.label ?? "Sort friends"}</SelectValue>
        </SelectTrigger>

        <SelectContent className={"min-w-50"}>
          <SelectGroup>
            {SORT_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                <option.icon className="mr-2 inline h-4 w-4" />
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
