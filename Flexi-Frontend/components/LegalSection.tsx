// components/LegalSection.tsx
type LegalSectionProps = {
    title: string;
    content: string[];
  };
  
  const LegalSection = ({ title, content }: LegalSectionProps) => (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">{title}</h2>
      {content.map((paragraph, i) => (
        <p key={i} className="text-gray-700 leading-relaxed mb-2">{paragraph}</p>
      ))}
    </div>
  );
  
  export default LegalSection;
  