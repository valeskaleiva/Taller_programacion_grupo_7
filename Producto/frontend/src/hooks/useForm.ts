import { useState } from 'react';

// Type definition for form input values
interface FormValues {
    [key: string]: any;
}

interface UseFormProps {
    initialValues: FormValues;
    validate: (values: FormValues) => Partial<FormValues>;
}

const useForm = ({ initialValues, validate }: UseFormProps) => {
    const [values, setValues] = useState<FormValues>(initialValues);
    const [errors, setErrors] = useState<Partial<FormValues>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setValues({ ...values, [name]: value });
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>, callback: () => void) => {
        e.preventDefault();
        setErrors(validate(values));
        setIsSubmitting(true);

        if (Object.keys(errors).length === 0) {
            callback();
        }
        setIsSubmitting(false);
    };

    return { values, errors, isSubmitting, handleChange, handleSubmit };
};

export default useForm;
