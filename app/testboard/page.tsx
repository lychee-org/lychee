'use client';

import { useEffect, useRef, useState } from 'react';
import { Chessground } from 'chessground';
import { Api } from 'chessground/api';

export default function Testboard() {
  const ref = useRef(null);
  const [api, setApi] = useState<Api>();

  useEffect(() => {
    if (ref?.current && !api) {
      const chessgroundApi = Chessground(ref.current, {});
      setApi(chessgroundApi);
    }
  }, [ref]);

  return (
    <div>
      <div className='brown neo'>
        <div ref={ref} />
      </div>
    </div>
  );
}
