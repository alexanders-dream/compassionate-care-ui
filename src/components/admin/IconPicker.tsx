import { useState } from "react";
import {
  FileText, BookOpen, Video, Heart, Home, Stethoscope, Activity, 
  AlertCircle, Award, Bandage, Brain, Briefcase, Calendar, Check, 
  ClipboardList, Clock, Droplet, Eye, FileCheck, Folder, 
  GraduationCap, Hand, HeartPulse, HelpCircle, Hospital, Leaf, 
  LifeBuoy, MapPin, MessageCircle, Phone, Pill, Plus, Shield, 
  Star, Thermometer, User, Users, Wrench, Zap, Accessibility,
  Baby, Bath, Bed, Bone, CircleCheck, Cross, Fingerprint, Flame,
  Footprints, Gauge, Glasses, Globe, Hammer, Headphones, 
  HeartHandshake, Info, Lightbulb, Link, Lock, Mail, Megaphone,
  Microscope, Moon, Palette, Paperclip, PenTool, Percent, PersonStanding,
  Podcast, Puzzle, Radio, Ribbon, Rocket, Scale, Search, Settings,
  Share, ShieldCheck, Sparkles, Syringe, Target, Truck, Umbrella,
  Verified, Wallet, Waves, Wifi, Wind, type LucideIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface IconOption {
  name: string;
  icon: LucideIcon;
}

const iconOptions: IconOption[] = [
  { name: "FileText", icon: FileText },
  { name: "BookOpen", icon: BookOpen },
  { name: "Video", icon: Video },
  { name: "Heart", icon: Heart },
  { name: "Home", icon: Home },
  { name: "Stethoscope", icon: Stethoscope },
  { name: "Activity", icon: Activity },
  { name: "AlertCircle", icon: AlertCircle },
  { name: "Award", icon: Award },
  { name: "Bandage", icon: Bandage },
  { name: "Brain", icon: Brain },
  { name: "Briefcase", icon: Briefcase },
  { name: "Calendar", icon: Calendar },
  { name: "Check", icon: Check },
  { name: "ClipboardList", icon: ClipboardList },
  { name: "Clock", icon: Clock },
  { name: "Droplet", icon: Droplet },
  { name: "Eye", icon: Eye },
  { name: "FileCheck", icon: FileCheck },
  { name: "Folder", icon: Folder },
  { name: "GraduationCap", icon: GraduationCap },
  { name: "Hand", icon: Hand },
  { name: "HeartPulse", icon: HeartPulse },
  { name: "HelpCircle", icon: HelpCircle },
  { name: "Hospital", icon: Hospital },
  { name: "Leaf", icon: Leaf },
  { name: "LifeBuoy", icon: LifeBuoy },
  { name: "MapPin", icon: MapPin },
  { name: "MessageCircle", icon: MessageCircle },
  { name: "Phone", icon: Phone },
  { name: "Pill", icon: Pill },
  { name: "Plus", icon: Plus },
  { name: "Shield", icon: Shield },
  { name: "Star", icon: Star },
  { name: "Thermometer", icon: Thermometer },
  { name: "User", icon: User },
  { name: "Users", icon: Users },
  { name: "Wrench", icon: Wrench },
  { name: "Zap", icon: Zap },
  { name: "Accessibility", icon: Accessibility },
  { name: "Baby", icon: Baby },
  { name: "Bath", icon: Bath },
  { name: "Bed", icon: Bed },
  { name: "Bone", icon: Bone },
  { name: "CircleCheck", icon: CircleCheck },
  { name: "Cross", icon: Cross },
  { name: "Fingerprint", icon: Fingerprint },
  { name: "Flame", icon: Flame },
  { name: "Footprints", icon: Footprints },
  { name: "Gauge", icon: Gauge },
  { name: "Glasses", icon: Glasses },
  { name: "Globe", icon: Globe },
  { name: "Hammer", icon: Hammer },
  { name: "Headphones", icon: Headphones },
  { name: "HeartHandshake", icon: HeartHandshake },
  { name: "Info", icon: Info },
  { name: "Lightbulb", icon: Lightbulb },
  { name: "Link", icon: Link },
  { name: "Lock", icon: Lock },
  { name: "Mail", icon: Mail },
  { name: "Megaphone", icon: Megaphone },
  { name: "Microscope", icon: Microscope },
  { name: "Moon", icon: Moon },
  { name: "Palette", icon: Palette },
  { name: "Paperclip", icon: Paperclip },
  { name: "PenTool", icon: PenTool },
  { name: "Percent", icon: Percent },
  { name: "PersonStanding", icon: PersonStanding },
  { name: "Podcast", icon: Podcast },
  { name: "Puzzle", icon: Puzzle },
  { name: "Radio", icon: Radio },
  { name: "Ribbon", icon: Ribbon },
  { name: "Rocket", icon: Rocket },
  { name: "Scale", icon: Scale },
  { name: "Search", icon: Search },
  { name: "Settings", icon: Settings },
  { name: "Share", icon: Share },
  { name: "ShieldCheck", icon: ShieldCheck },
  { name: "Sparkles", icon: Sparkles },
  { name: "Syringe", icon: Syringe },
  { name: "Target", icon: Target },
  { name: "Truck", icon: Truck },
  { name: "Umbrella", icon: Umbrella },
  { name: "Verified", icon: Verified },
  { name: "Wallet", icon: Wallet },
  { name: "Waves", icon: Waves },
  { name: "Wifi", icon: Wifi },
  { name: "Wind", icon: Wind },
];

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
