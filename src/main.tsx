import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import Onirux from './tsx/conexion';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Onirux />
  </StrictMode>,
);