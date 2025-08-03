const ButtonSubmit = ({
    text,
    onClick,
    className = "",
    disabled = false,
}: {
    text: string;
    onClick?: () => void;
    className?: string;
    disabled?: boolean;
}) => {
    return (
        <button
            type="submit"
            className={"btn btn-primary" + (className ? ` ${className}` : "")}
            onClick={onClick}
            disabled={disabled}
        >
            {text}
        </button>
    );
}

export default ButtonSubmit;