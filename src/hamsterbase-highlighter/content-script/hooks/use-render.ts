import { useState } from "react";

export const useRender = () => {
  const [_state, setState] = useState(0);
  return () => setState((state) => state + 1);
};
