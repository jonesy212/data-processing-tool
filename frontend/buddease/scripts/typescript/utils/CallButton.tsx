// CallButton.tsx

interface CallButtonProps {
  onClick: () => void;
  label: string;
}

const CallButton: React.FC<CallButtonProps> = ({ onClick, label }) => {
  return (
    <button onClick={onClick}>
      {label}
    </button>
  );
};

export default CallButton;
