import { useState } from "react";
import {
    Card
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
    Plus, Pencil, Trash2
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { FormFieldConfig, FormFieldOption } from "@/data/formConfig";
import { useToast } from "@/hooks/use-toast";
import { useSiteData } from "@/contexts/SiteDataContext";

const FormsTab = () => {
    const { formConfigs, setFormConfigs } = useSiteData();
    const { toast } = useToast();

    const [selectedFormId, setSelectedFormId] = useState<string>(formConfigs[0]?.id || "");
    const [editingField, setEditingField] = useState<FormFieldConfig | null>(null);
    const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false);
    const [newOptionLabel, setNewOptionLabel] = useState("");
    const [newOptionValue, setNewOptionValue] = useState("");

    const selectedForm = formConfigs.find(f => f.id === selectedFormId);

    const handleToggleFieldEnabled = (fieldId: string) => {
        setFormConfigs(formConfigs.map(form => {
            if (form.id === selectedFormId) {
                return {
                    ...form,
                    fields: form.fields.map(field =>
                        field.id === fieldId ? { ...field, enabled: !field.enabled } : field
                    )
                };
            }
            return form;
        }));
    };

    const handleToggleFieldRequired = (fieldId: string) => {
        setFormConfigs(formConfigs.map(form => {
            if (form.id === selectedFormId) {
                return {
                    ...form,
                    fields: form.fields.map(field =>
                        field.id === fieldId ? { ...field, required: !field.required } : field
                    )
                };
            }
            return form;
        }));
    };

    const handleUpdateField = (fieldId: string, updates: Partial<FormFieldConfig>) => {
        setFormConfigs(formConfigs.map(form => {
            if (form.id === selectedFormId) {
                return {
                    ...form,
                    fields: form.fields.map(field =>
                        field.id === fieldId ? { ...field, ...updates } : field
                    )
                };
            }
            return form;
        }));
    };

    const handleSaveFieldEdit = () => {
        if (!editingField) return;
        handleUpdateField(editingField.id, editingField);
        setIsFieldDialogOpen(false);
        setEditingField(null);
        toast({ title: "Field updated successfully" });
    };

    const handleAddFieldOption = () => {
        if (!editingField || !newOptionLabel || !newOptionValue) return;
        const newOption: FormFieldOption = { label: newOptionLabel, value: newOptionValue };
        setEditingField({
            ...editingField,
            options: [...(editingField.options || []), newOption]
        });
        setNewOptionLabel("");
        setNewOptionValue("");
    };

    const handleRemoveFieldOption = (index: number) => {
        if (!editingField) return;
        setEditingField({
            ...editingField,
            options: editingField.options?.filter((_, i) => i !== index)
        });
    };

    const handleDeleteField = (fieldId: string) => {
        setFormConfigs(formConfigs.map(form => {
            if (form.id === selectedFormId) {
                return {
                    ...form,
                    fields: form.fields.filter(field => field.id !== fieldId)
                };
            }
            return form;
        }));
        toast({ title: "Field removed" });
    };

    const handleAddNewField = () => {
        if (!selectedForm) return;
        const newField: FormFieldConfig = {
            id: `new-${Date.now()}`,
            key: `newField${Date.now()}`,
            label: "New Field",
            type: "text",
            placeholder: "",
            required: false,
            enabled: true,
            order: selectedForm.fields.length + 1
        };
        setFormConfigs(formConfigs.map(form => {
            if (form.id === selectedFormId) {
                return { ...form, fields: [...form.fields, newField] };
            }
            return form;
        }));
        setEditingField(newField);
        setIsFieldDialogOpen(true);
    };

    const handleSaveFormConfig = () => {
        toast({ title: "Form configuration saved", description: "Changes will apply to the live forms" });
    };

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                <h2 className="text-lg md:text-xl font-semibold">Form Configuration</h2>
                <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                    <Select value={selectedFormId} onValueChange={setSelectedFormId}>
                        <SelectTrigger className="w-full sm:w-56">
                            <SelectValue placeholder="Select a form" />
                        </SelectTrigger>
                        <SelectContent>
                            {formConfigs.map(form => (
                                <SelectItem key={form.id} value={form.id}>{form.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                        <Button onClick={handleAddNewField} size="sm" className="flex-1 sm:flex-none">
                            <Plus className="h-4 w-4 mr-1" /> Add
                        </Button>
                        <Button variant="secondary" size="sm" onClick={handleSaveFormConfig} className="flex-1 sm:flex-none">
                            Save
                        </Button>
                    </div>
                </div>
            </div>

            {selectedForm && (
                <>
                    <p className="text-sm text-muted-foreground">
                        Configure fields for "{selectedForm.name}". Toggle fields on/off or edit their properties.
                    </p>

                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-3">
                        {selectedForm.fields.sort((a, b) => a.order - b.order).map(field => (
                            <Card key={field.id} className={`p-4 ${!field.enabled ? "opacity-50" : ""}`}>
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="font-medium">{field.label}</p>
                                        <p className="text-xs text-muted-foreground">{field.key}</p>
                                    </div>
                                    <Badge variant="outline">{field.type}</Badge>
                                </div>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={field.required}
                                                onCheckedChange={() => handleToggleFieldRequired(field.id)}
                                                disabled={!field.enabled}
                                            />
                                            <span className="text-xs">Required</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={field.enabled}
                                                onCheckedChange={() => handleToggleFieldEnabled(field.id)}
                                            />
                                            <span className="text-xs">Enabled</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => {
                                            setEditingField({ ...field });
                                            setIsFieldDialogOpen(true);
                                        }}
                                    >
                                        <Pencil className="h-3 w-3 mr-1" /> Edit
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteField(field.id)}
                                    >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Label</TableHead>
                                    <TableHead>Key</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead className="text-center">Required</TableHead>
                                    <TableHead className="text-center">Enabled</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {selectedForm.fields.sort((a, b) => a.order - b.order).map(field => (
                                    <TableRow key={field.id} className={!field.enabled ? "opacity-50" : ""}>
                                        <TableCell className="font-medium">{field.label}</TableCell>
                                        <TableCell className="text-muted-foreground text-sm">{field.key}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{field.type}</Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Switch
                                                checked={field.required}
                                                onCheckedChange={() => handleToggleFieldRequired(field.id)}
                                                disabled={!field.enabled}
                                            />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Switch
                                                checked={field.enabled}
                                                onCheckedChange={() => handleToggleFieldEnabled(field.id)}
                                            />
                                        </TableCell>
                                        <TableCell className="text-right space-x-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setEditingField({ ...field });
                                                    setIsFieldDialogOpen(true);
                                                }}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteField(field.id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <Dialog open={isFieldDialogOpen} onOpenChange={setIsFieldDialogOpen}>
                        <DialogContent className="max-w-lg">
                            <DialogHeader>
                                <DialogTitle>Edit Field: {editingField?.label}</DialogTitle>
                            </DialogHeader>
                            {editingField && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="fieldLabel">Label</Label>
                                            <Input
                                                id="fieldLabel"
                                                value={editingField.label}
                                                onChange={(e) => setEditingField({ ...editingField, label: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="fieldKey">Field Key</Label>
                                            <Input
                                                id="fieldKey"
                                                value={editingField.key}
                                                onChange={(e) => setEditingField({ ...editingField, key: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="fieldType">Type</Label>
                                            <Select
                                                value={editingField.type}
                                                onValueChange={(value) => setEditingField({ ...editingField, type: value as FormFieldConfig["type"] })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="text">Text</SelectItem>
                                                    <SelectItem value="email">Email</SelectItem>
                                                    <SelectItem value="tel">Phone</SelectItem>
                                                    <SelectItem value="date">Date</SelectItem>
                                                    <SelectItem value="select">Select/Dropdown</SelectItem>
                                                    <SelectItem value="textarea">Text Area</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label htmlFor="fieldPlaceholder">Placeholder</Label>
                                            <Input
                                                id="fieldPlaceholder"
                                                value={editingField.placeholder || ""}
                                                onChange={(e) => setEditingField({ ...editingField, placeholder: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="fieldHelpText">Help Text (optional)</Label>
                                        <Input
                                            id="fieldHelpText"
                                            value={editingField.helpText || ""}
                                            onChange={(e) => setEditingField({ ...editingField, helpText: e.target.value })}
                                            placeholder="Additional context for this field"
                                        />
                                    </div>

                                    <div className="flex gap-6">
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                id="fieldRequired"
                                                checked={editingField.required}
                                                onCheckedChange={(checked) => setEditingField({ ...editingField, required: checked })}
                                            />
                                            <Label htmlFor="fieldRequired">Required</Label>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                id="fieldEnabled"
                                                checked={editingField.enabled}
                                                onCheckedChange={(checked) => setEditingField({ ...editingField, enabled: checked })}
                                            />
                                            <Label htmlFor="fieldEnabled">Enabled</Label>
                                        </div>
                                    </div>

                                    {editingField.type === "select" && (
                                        <div className="space-y-3">
                                            <Label>Options</Label>
                                            <div className="border rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
                                                {editingField.options?.map((option, index) => (
                                                    <div key={index} className="flex items-center justify-between bg-muted/50 px-3 py-2 rounded">
                                                        <div>
                                                            <span className="font-medium">{option.label}</span>
                                                            <span className="text-xs text-muted-foreground ml-2">({option.value})</span>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleRemoveFieldOption(index)}
                                                        >
                                                            <Trash2 className="h-3 w-3 text-destructive" />
                                                        </Button>
                                                    </div>
                                                ))}
                                                {(!editingField.options || editingField.options.length === 0) && (
                                                    <p className="text-sm text-muted-foreground text-center py-2">No options defined</p>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <Input
                                                    placeholder="Label"
                                                    value={newOptionLabel}
                                                    onChange={(e) => setNewOptionLabel(e.target.value)}
                                                    className="flex-1"
                                                />
                                                <Input
                                                    placeholder="Value"
                                                    value={newOptionValue}
                                                    onChange={(e) => setNewOptionValue(e.target.value)}
                                                    className="flex-1"
                                                />
                                                <Button onClick={handleAddFieldOption} size="sm" type="button">
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex justify-end gap-2 pt-2">
                                        <Button variant="outline" onClick={() => setIsFieldDialogOpen(false)}>Cancel</Button>
                                        <Button onClick={handleSaveFieldEdit}>Save Changes</Button>
                                    </div>
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>
                </>
            )}
        </div>
    );
};

export default FormsTab;
