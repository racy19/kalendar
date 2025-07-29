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
        <>
            {label && <label htmlFor={id}>{label}{required ? "* " : ""}: </label>}
            <input
                id={id}
                name={id}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required={required}
            />
        </>
    );
};

export default InputText;