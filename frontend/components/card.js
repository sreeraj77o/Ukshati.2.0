export const Card = ({ className, children }) => (
    <div className={`rounded-lg border border-gray-700 ${className}`}>
      {children}
    </div>
  );
  
  export const CardHeader = ({ className, children }) => (
    <div className={`p-4 border-b border-gray-700 ${className}`}>
      {children}
    </div>
  );
  
  export const CardTitle = ({ className, children }) => (
    <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
  );
  
  export const CardContent = ({ className, children }) => (
    <div className={`p-4 ${className}`}>{children}</div>
  );
  
  export const CardFooter = ({ className, children }) => (
    <div className={`p-4 border-t border-gray-700 ${className}`}>
      {children}
    </div>
  );