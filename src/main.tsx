import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import Onirux from './tsx/Onirux';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Onirux />
  </StrictMode>,
);