import React, { useMemo, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { UserForm } from "../../models/user/User";
import { AddUserContent } from "../../hooks/users/useUserContent";
import { FormBaseEntity } from "../../models/FormBaseEntity";

interface AddFormProps<T extends FormBaseEntity> {
    items: T;
    onSubmit?: (data: T) => void;
    buttonName?: string;
}


export function AddForm<T extends FormBaseEntity>({ items, onSubmit, buttonName }: AddFormProps<T>) {
    const [validated, setValidated] = useState(false);

    // Generic function to build form data object from FormData
    const buildFormObject = (formData: FormData, template: T): T => {
        const result = {} as T;

        const processObject = (obj: any, target: any, prefix = '') => {
            Object.keys(obj).forEach(key => {
                const fullKey = prefix ? `${prefix}.${key}` : key;
                const value = obj[key];

                if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                    // Handle nested objects
                    target[key] = {};
                    processObject(value, target[key], fullKey);
                } else {
                    // Handle primitive values - try nested key first, then flat key
                    const formValue = formData.get(fullKey) || formData.get(key);
                    target[key] = formValue as string;
                }
            });
        };

        processObject(template, result);
        return result;
    };



    // Generate form fields recursively
    const generateFormFields = (obj: any, prefix = ''): React.ReactElement[] => {
        const fields: React.ReactElement[] = [];

        Object.keys(obj).forEach(key => {
            const fullKey = prefix ? `${prefix}.${key}` : key;
            const value = obj[key];

            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                fields.push(
                    <h6 key={`header-${fullKey}`} className="mt-3 mb-2 text-capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                    </h6>
                );
                fields.push(...generateFormFields(value, fullKey));
            } else {
                fields.push(
                    <Form.Group controlId={`formBasic${fullKey}`} key={fullKey} className="mb-3">
                        <Form.Label className="text-capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                        </Form.Label>
                        <Form.Control
                            required
                            type="text"
                            name={fullKey}
                            defaultValue={value}
                            placeholder={`Enter ${key.replace(/([A-Z])/g, ' $1').trim().toLowerCase()}`}
                        />
                    </Form.Group>
                );
            }
        });

        return fields;
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
        }

        setValidated(true);

        // Build the form object generically based on the template
        const formObject = buildFormObject(formData, items);

         // console.log('Generated form object:', formObject);

        if (form.checkValidity()) {
            // Generic submission - call the provided onSubmit handler
            if (onSubmit) {
                console.log('Form object:', formObject);
                onSubmit(formObject);
            } else {
                // Fallback for UserForm if no onSubmit provided
                if ('name' in formObject && 'email' in formObject) {
                    AddUserContent(formObject as unknown as UserForm);
                }
            }
        }
    };

    return (
        <div className="ms-2">
            <Form action="" noValidate validated={validated} method="post" onSubmit={handleSubmit} style={{ width: '100%' }}>
                {generateFormFields(items)}
                <Button type="submit" style={{ width: '100%' }} className="mt-3">{buttonName}</Button>
            </Form>
        </div>
    )
}
