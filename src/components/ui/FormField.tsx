import * as React from 'react';

export const INPUT_FOCUS_CLASSES = 'focus:border-rose-clay/50';
export const INPUT_BASE_CLASSES = `w-full rounded-xl border border-rose-clay/45 bg-cream px-4 py-2.5 ${INPUT_FOCUS_CLASSES} outline-none transition`;

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label: string;
	error?: string;
}

export default function FormField({ label, error, id, className, ...inputProps }: FormFieldProps) {
	const fieldId = id || inputProps.name;
	return (
		<div>
			<label htmlFor={fieldId} className="block text-sm font-medium text-charcoal mb-1">
				{label}
			</label>
			<input
				id={fieldId}
				className={`${INPUT_BASE_CLASSES} ${className || ''}`}
				{...inputProps}
			/>
			{error && <p className="mt-1 text-xs text-charcoal/65">{error}</p>}
		</div>
	);
}
