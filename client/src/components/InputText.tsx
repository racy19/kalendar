interface InputTextProps {
    label?: string;
    id: string;
    type?: string;
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
    disabled?: boolean;
}

const InputText = ({ label, id, type = "text", placeholder = "", value, onChange, required = false }: InputTextProps) => {
    return (
        <div className="mb-3">
            {label && (
                <label htmlFor={id} className="form-label">
                    {label}
                    {required ? "*" : ""}:
                </label>
            )}
            <input
                id={id}
                name={id}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required={required}
                className="form-control"
            />
        </div>

    );
};

export default InputText;