"use client";
import React from "react";
import FingerPrintJS from "@fingerprintjs/fingerprintjs";

interface FingerPrint {
  visitorId: string;
}
const fpPromise = FingerPrintJS.load();

export const getDeviceFingerprint = () => {
  const [fingerprint, setFingerPrint] = React.useState<FingerPrint | null>(
    null,
  );

  const getFingerPrint = async () => {
    const fp = await fpPromise;
    const result = await fp.get();
    return result;
  };

  React.useEffect(() => {
    getFingerPrint().then((data) => {
      setFingerPrint(data);
    });
  }, []);

  return fingerprint;
};
