import crypto from "crypto";
import fs from "fs";
import os from "os";

export class HardwareFingerprintService {
  gerarFingerprint(): string {
    const hostname = os.hostname();

    let machineId = "";

    try {
      machineId = fs
        .readFileSync("/etc/machine-id", "utf8")
        .trim();
    } catch {
      machineId = "machine-id-indisponivel";
    }

    const interfaces = os.networkInterfaces();

    const macs = Object.values(interfaces)
      .flat()
      .filter(
        (i) =>
          i &&
          !i.internal &&
          i.mac &&
          i.mac !== "00:00:00:00:00:00"
      )
      .map((i) => i!.mac)
      .sort()
      .join("|");

    const raw = [
      hostname,
      machineId,
      macs,
      os.platform(),
      os.arch(),
    ].join("|");

    return crypto
      .createHash("sha256")
      .update(raw)
      .digest("hex");
  }
}
