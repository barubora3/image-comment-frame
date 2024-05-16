"use client";

import { useCallback, useEffect, useState } from "react";

const Signin = () => {
  const [isClient, setIsClient] = useState(false);
  const [uuid, setUuid] = useState("");

  useEffect(() => {
    // Identify or create the script element
    let script = document.getElementById(
      "siwn-script"
    ) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement("script");
      script.id = "siwn-script";
      document.body.appendChild(script);
    }

    // Set attributes and source of the script
    script.src = "https://neynarxyz.github.io/siwn/raw/1.2.0/index.js";
    script.async = true;
    script.defer = true;

    document.body.appendChild(script);

    return () => {
      // Remove the script from the body
      if (script) {
        document.body.removeChild(script);
      }

      // Remove the button if it exists
      let button = document.getElementById("siwn-button");
      if (button && button.parentElement) {
        button.parentElement.removeChild(button);
      }
    };
  }, []);

  const client_id = process.env.NEXT_PUBLIC_NEYNAR_CLIENT_ID;
  const neynar_login_url =
    process.env.NEXT_PUBLIC_NEYNAR_LOGIN_URL || "https://app.neynar.com/login";

  if (!client_id) {
    throw new Error("NEXT_PUBLIC_NEYNAR_CLIENT_ID is not defined in .env");
  }

  useEffect(() => {
    window.onSignInSuccess = (data) => {
      //   alert(`sign success\ncopy your uuid\n${data.signer_uuid}`);
      setUuid(data.signer_uuid);
      //   setUser({
      //     signerUuid: data.signer_uuid,
      //     fid: data.fid,
      //   });
      //   setSignerUuid(data.signer_uuid);
      //   setFid(data.fid);
    };

    return () => {
      delete window.onSignInSuccess; // Clean up the global callback
    };
  }, []);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <main className="flex-grow flex flex-col items-center justify-center">
      <div className="mx-5 flex flex-col items-center justify-center">
        {/* Approve Button */}
        <div
          className="neynar_signin mt-6"
          data-client_id={client_id}
          data-neynar_login_url={neynar_login_url}
          data-success-callback="onSignInSuccess"
        ></div>

        {uuid && (
          <div className="text-white">
            <div>Your UUID</div>
            <p>{uuid}</p>
          </div>
        )}
      </div>
    </main>
  );
};

export default Signin;
