export const Table = ({ className, children }) => (
    <table className={`w-full ${className}`}>{children}</table>
  );
  
  export const TableHeader = ({ children }) => <thead>{children}</thead>;
  export const TableBody = ({ children }) => <tbody>{children}</tbody>;
  export const TableRow = ({ className, children }) => (
    <tr className={`border-b border-gray-700 ${className}`}>{children}</tr>
  );
  export const TableHead = ({ className, children }) => (
    <th className={`text-left p-3 text-sm font-medium text-gray-400 ${className}`}>
      {children}
    </th>
  );
  export const TableCell = ({ className, children }) => (
    <td className={`p-3 ${className}`}>{children}</td>
  );