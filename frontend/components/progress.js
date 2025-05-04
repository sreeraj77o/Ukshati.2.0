export const Progress = ({ value, className }) => (
    <div className={`h-2 bg-gray-700 rounded-full overflow-hidden ${className}`}>
      <div 
        className="h-full bg-blue-500 transition-all duration-300" 
        style={{ width: `${value}%` }}
      />
    </div>
  );