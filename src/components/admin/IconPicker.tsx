import { useState } from "react";
import {
  type LucideIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { iconOptions } from "@/lib/icons";



interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
  name?: string;
}

export const IconPicker = ({ value, onChange, name }: IconPickerProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredIcons = iconOptions.filter(icon =>
    icon.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedIcon = iconOptions.find(icon => icon.name === value);
  const SelectedIconComponent = selectedIcon?.icon;

  return (
    <div>
      <input type="hidden" name={name} value={value} />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start gap-2 h-10"
            type="button"
          >
            {SelectedIconComponent ? (
              <>
                <SelectedIconComponent className="h-5 w-5 text-primary" />
                <span>{value}</span>
              </>
            ) : (
              <span className="text-muted-foreground">Select an icon...</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0 bg-background border shadow-lg z-50" align="start">
          <div className="p-2 border-b">
            <Input
              placeholder="Search icons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8"
            />
          </div>
          <ScrollArea className="h-64">
            <div className="grid grid-cols-6 gap-1 p-2">
              {filteredIcons.map(({ name: iconName, icon: IconComponent }) => (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => {
                    onChange(iconName);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={cn(
                    "flex flex-col items-center justify-center p-2 rounded-md hover:bg-muted transition-colors",
                    value === iconName && "bg-primary/10 ring-1 ring-primary"
                  )}
                  title={iconName}
                >
                  <IconComponent className="h-5 w-5" />
                </button>
              ))}
            </div>
            {filteredIcons.length === 0 && (
              <p className="text-center text-muted-foreground py-4 text-sm">
                No icons found
              </p>
            )}
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default IconPicker;
