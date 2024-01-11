"use client";
import React from "react";
import { useWindowSize } from "@uidotdev/usehooks";

import Confetti from "react-confetti";

const Confetticomp = () => {
  const { width, height } = useWindowSize();
  return (
    <div className="z-0">
      <Confetti
        width={width ? width : 0}
        height={height ? height : 0}
        colors={["#05012D", "#0B0490", "#9E5CFA", "#8605D6"]}
        numberOfPieces={500}
        recycle={false}
      />
    </div>
  );
};
export default Confetticomp;
