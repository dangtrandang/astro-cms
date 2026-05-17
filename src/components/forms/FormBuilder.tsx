import { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import DynamicForm from './DynamicForm';
import { submitForm } from '@/lib/directus/forms';
import type { FormField } from '@/types/directus-schema';
import { cn } from '@/lib/utils';
import { buildZodSchema } from '@/lib/zodSchemaBuilder';
import { z } from 'zod';

interface FormBuilderProps {
  className?: string;
  form: {
    id: string;
    on_success?: 'redirect' | 'message' | null;
    sort?: number | null;
    submit_label?: string;
    success_message?: string | null;
    title?: string | null;
    success_redirect_url?: string | null;
    is_active?: boolean | null;
    fields: FormField[];
  };
  submitVariant?: string;
  submitClassName?: string;
}

const FormBuilder = ({ form, className, submitVariant, submitClassName }: FormBuilderProps) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!form.is_active) return null;

  type FormValues = z.infer<ReturnType<typeof buildZodSchema>>;

  const handleSubmit = async (data: FormValues) => {
    setError(null);

    try {
      const fieldsWithNames = form.fields.map((field) => ({
        id: field.id,
        name: field.name || '',
        type: field.type || '',
      }));

      await submitForm(form.id, fieldsWithNames, data);

      if (form.on_success === 'redirect' && form.success_redirect_url) {
        window.location.href = form.success_redirect_url;
      } else {
        setIsSubmitted(true);
      }
    } catch {
      setError('Failed to submit the form. Please try again later.');
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-6 text-center">
        <CheckCircle className="size-12 text-green-500" />
        <p className="text-gray-600">{form.success_message || 'Your form has been submitted successfully.'}</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6 bg-white p-8 rounded-xl shadow-[0_10px_30px_rgba(133,14,53,0.08)] [&_input]:bg-[#f6f6f6] [&_textarea]:bg-[#f6f6f6] [&_input]:border-[#f5dcda] [&_textarea]:border-[#f5dcda] [&_input]:focus-visible:ring-white [&_textarea]:focus-visible:ring-white [&_input]:rounded-[1.75rem] [&_textarea]:rounded-[1.75rem] [&_textarea]:min-h-[200px]', className)}>
      {form.title && <h3 className="text-xl font-['Playfair_Display'] text-[#850E35] mb-4">{form.title}</h3>}

      {error && (
        <div className="p-4 text-red-500 bg-red-100 rounded-md">
          <strong>Error:</strong> {error}
        </div>
      )}

      <DynamicForm
        fields={form.fields}
        onSubmit={handleSubmit}
        submitLabel={form.submit_label || 'Submit'}
        id={form.id}
        submitVariant={submitVariant}
        submitClassName={submitClassName}
      />
    </div>
  );
};

export default FormBuilder;
