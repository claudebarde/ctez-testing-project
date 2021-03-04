import { exec } from "child_process";

export const sh = async (
  cmd: string
): Promise<{ stdout: string; stderr: string }> => {
  return new Promise(function (resolve, reject) {
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
};
