import * as React from 'react';

export const INPUT_FOCUS_CLASSES = 'focus:ring-2 focus:ring-[#C6DCE4]/30 focus:border-[#C6DCE4]';
export const INPUT_BASE_CLASSES = `w-full px-4 py-2.5 border border-[#e8d5d5] rounded-xl bg-white ${INPUT_FOCUS_CLASSES} outline-none transition`;

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label: string;
	error?: string;
}

export default function FormField({ label, error, id, className, ...inputProps }: FormFieldProps) {
	const fieldId = id || inputProps.name;
	return (
		<div>
			<label htmlFor={fieldId} className="block text-sm font-medium text-[#1f2a1d] mb-1">
				{label}
			</label>
			<input
				id={fieldId}
				className={`${INPUT_BASE_CLASSES} ${className || ''}`}
				{...inputProps}
			/>
			{error && <p className="text-xs text-[#850E35] mt-1">{error}</p>}
		</div>
	);
}
