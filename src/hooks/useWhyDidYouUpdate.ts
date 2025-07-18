// Arquivo: src/hooks/useWhyDidYouUpdate.ts
import { useEffect, useRef } from 'react';

export function useWhyDidYouUpdate(name: string, props: any) {
  const previousProps = useRef<any>();

  useEffect(() => {
    if (previousProps.current) {
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      const changesObj: any = {};
      allKeys.forEach(key => {
        if (previousProps.current[key] !== props[key]) {
          changesObj[key] = {
            from: previousProps.current[key],
            to: props[key],
          };
        }
      });

      if (Object.keys(changesObj).length) {
        console.log('[Why-Did-You-Update]', name, changesObj);
      }
    }
    previousProps.current = props;
  });
}
