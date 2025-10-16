import { RichTextEditor } from './RichTextEditor';

interface ExplanatoryNoteProps {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export function ExplanatoryNote({ 
  label, 
  checked, 
  onCheckedChange, 
  value, 
  onValueChange, 
  placeholder = "Enter explanatory note..." 
}: ExplanatoryNoteProps) {
  return (
    <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <div className="flex items-center space-x-3 mb-3">
        <input
          type="checkbox"
          id={`explanatory-${label.toLowerCase().replace(/\s+/g, '-')}`}
          checked={checked}
          onChange={(e) => onCheckedChange(e.target.checked)}
          className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors"
        />
        <label 
          htmlFor={`explanatory-${label.toLowerCase().replace(/\s+/g, '-')}`}
          className="text-sm font-medium text-gray-900 cursor-pointer"
        >
          Add Explanatory Note for {label}
        </label>
      </div>
      
      {checked && (
        <div className="mt-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Explanatory Note
          </label>
          <RichTextEditor
            value={value}
            onChange={onValueChange}
            placeholder={placeholder}
            className="w-full"
          />
        </div>
      )}
    </div>
  );
}
