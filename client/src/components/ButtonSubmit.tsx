const ButtonSubmit = ({
    text,
    onClick,
    disabled = false,
}: {
    text: string;
    onClick?: () => void;
    disabled?: boolean;
}) => {
    return (
        <button
            type="submit"
            className="btn btn-primary"
            onClick={onClick}
            disabled={disabled}
        >
            {text}
        </button>
    );
}

export default ButtonSubmit;