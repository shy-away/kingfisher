// =================================================================================
// The function `Chessground()` below is adapted from the project 'react-chess/chessground'.
//
// Original source: https://github.com/react-chess/chessground/blob/main/src/index.tsx
// Author: richardxhong
// =================================================================================

import React, { useEffect, useRef, useState } from "react";
import { Chessground as ChessgroundApi } from "@lichess-org/chessground";

import { Api } from "@lichess-org/chessground/api";
import { Config } from "@lichess-org/chessground/config";

import "@lichess-org/chessground/assets/chessground.base.css";
import "@lichess-org/chessground/assets/chessground.brown.css";
import "@lichess-org/chessground/assets/chessground.cburnett.css";

interface Props {
  width?: number;
  height?: number;
  contained?: boolean;
  config?: Config;
}

export default function Chessground({
  width = 900,
  height = 900,
  config = {},
  contained = false,
}: Props) {
  const [api, setApi] = useState<Api | null>(null);

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref && ref.current && !api) {
      const chessgroundApi = ChessgroundApi(ref.current, {
        animation: { enabled: true, duration: 200 },
        ...config,
      });
      setApi(chessgroundApi);
    } else if (ref && ref.current && api) {
      api.set(config);
    }
  }, [ref]);

  useEffect(() => {
    api?.set(config);
  }, [api, config]);

  return (
    <div
      style={{
        height: contained ? "100%" : height,
        width: contained ? "100%" : width,
      }}
    >
      <div
        ref={ref}
        style={{ height: "100%", width: "100%", display: "table" }}
      />
    </div>
  );
}
