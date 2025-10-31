interface ThreeDotsIconProps {
    size?: number;
    color?: string;
    onClick?: () => void;
    className?: string;
}

const ThreeDotsIcon: React.FC<ThreeDotsIconProps> = ({color = "#000", size = 26, onClick, className}) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color} onClick={onClick} className={className} >
            <circle cx="5" cy="12" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="19" cy="12" r="2" />
        </svg>
    );
};

export default ThreeDotsIcon;