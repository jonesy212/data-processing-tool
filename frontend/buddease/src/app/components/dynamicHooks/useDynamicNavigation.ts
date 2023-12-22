import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const useDynamicNavigation = (condition: () => boolean, path: string) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (condition()) {
      navigate(path);
    }
  }, [condition, navigate, path]);
};

export default useDynamicNavigation;
