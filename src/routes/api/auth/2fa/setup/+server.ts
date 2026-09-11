import { json } from "@sveltejs/kit";
import { encodeBase32UpperCaseNoPadding } from "@oslojs/encoding";
import { createTOTPKeyURI } from "@oslojs/otp";
import QRCode from "qrcode";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.isAdmin) return json({ error: "Unauthorized" }, { status: 401 });

  const secretBytes = new Uint8Array(20);
  crypto.getRandomValues(secretBytes);
  const secret = encodeBase32UpperCaseNoPadding(secretBytes);

  const uri = createTOTPKeyURI("TheView", "Admin", secretBytes, 30, 6);
  const qrcode = await QRCode.toDataURL(uri);

  return json({ secret, qrcode });
};
