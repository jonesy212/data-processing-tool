// Generic Review Step Component
const ReviewStep: React.FC<{
  title: string;
  content: JSX.Element;
  onSubmit: () => void;
}> = ({ title, content, onSubmit }) => {
  return (
    <div>
      <h2>{title}</h2>
      {content}
      <button onClick={onSubmit}>Submit</button>
    </div>
  );
};

export default ReviewStep;
