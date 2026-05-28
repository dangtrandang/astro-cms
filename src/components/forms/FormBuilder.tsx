import { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import DynamicForm from './DynamicForm';
import { submitForm } from '@/lib/directus/forms';
import type { FormField } from '@/types/directus-schema';
import { cn } from '@/lib/utils';
import { buildZodSchema } from '@/lib/zodSchemaBuilder';
import { z } from 'zod';
import { useRecaptcha } from '@/hooks/useRecaptcha';

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
  const recaptcha = useRecaptcha();

  if (!form.is_active) return null;

  type FormValues = z.infer<ReturnType<typeof buildZodSchema>>;

  const handleSubmit = async (data: FormValues) => {
    setError(null);

    try {
      // Step 1: Obtain a reCAPTCHA v3 token
      const recaptchaToken = await recaptcha.execute();

      const fieldsWithNames = form.fields.map((field) => ({
        id: field.id,
        name: field.name || '',
        type: field.type || '',
      }));

      // Step 2: Submit with token for server-side verification
      await submitForm(form.id, fieldsWithNames, data, recaptchaToken);

      if (form.on_success === 'redirect' && form.success_redirect_url) {
        window.location.href = form.success_redirect_url;
      } else {
        setIsSubmitted(true);
      }
    } catch (err: any) {
      const message = err?.message || '';
      // Distinguish reCAPTCHA errors from network/Directus errors
      if (
        message === 'RECAPTCHA_NOT_CONFIGURED' ||
        message.includes('reCAPTCHA')
      ) {
        setError('Không thể xác minh bảo mật. Vui lòng thử lại sau.');
      } else if (message.includes('Directus')) {
        setError('Gửi biểu mẫu thất bại. Vui lòng thử lại sau.');
      } else {
        setError('Đã xảy ra lỗi. Vui lòng thử lại sau.');
      }
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-6 text-center">
        <CheckCircle className="size-12 text-green-500" />
        <p className="text-gray-600">{form.success_message || 'Biểu mẫu của bạn đã được gửi thành công.'}</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6 bg-white p-8 rounded-xl shadow-[0_10px_30px_rgba(133,14,53,0.08)] [&_input]:bg-[#f6f6f6] [&_textarea]:bg-[#f6f6f6] [&_input]:border-[#f5dcda] [&_textarea]:border-[#f5dcda] [&_input]:focus-visible:ring-[#C6DCE4]/30 [&_textarea]:focus-visible:ring-[#C6DCE4]/30 [&_input]:rounded-[1.75rem] [&_textarea]:rounded-[1.75rem] [&_textarea]:min-h-[200px]', className)}>
      {form.title && <h3 className="text-xl font-['Playfair_Display'] text-[#850E35] mb-4">{form.title}</h3>}

      {recaptcha.isLoading && (
        <div className="flex items-center justify-center gap-2 py-2 text-sm text-gray-400">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Đang xác minh bảo mật...
        </div>
      )}

      {error && (
        <div className="p-4 text-red-500 bg-red-100 rounded-md">
          <strong>Lỗi:</strong> {error}
        </div>
      )}

      <DynamicForm
        fields={form.fields}
        onSubmit={handleSubmit}
        submitLabel={form.submit_label || 'Gửi'}
        id={form.id}
        submitVariant={submitVariant}
        submitClassName={submitClassName}
      />
    </div>
  );
};

export default FormBuilder;
