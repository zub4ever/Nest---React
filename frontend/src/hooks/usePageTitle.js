import { useEffect } from 'react';

const usePageTitle = (title) => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title ? `${title} - De olho no pirarucu 📰` : 'De olho no pirarucu 📰';
    
    // Cleanup: restaura o título anterior quando o componente for desmontado
    return () => {
      document.title = previousTitle;
    };
  }, [title]);
};

export default usePageTitle;