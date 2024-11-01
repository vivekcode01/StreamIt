import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";

/**
 * Manager for temporary directories on file system.
 */
export class WorkerDir {
  private dirs_ = new Set<string>();

  /**
   * Create a new temporary directory.
   * @returns
   */
  async createTempDir() {
    const dir = await fs.mkdtemp(
      path.join(os.tmpdir(), `superstreamer-${crypto.randomUUID()}`),
    );
    this.dirs_.add(dir);
    return dir;
  }

  /**
   * Delete all directories, recursively, files included.
   */
  async deleteAll() {
    const promises = Array.from(this.dirs_).map(async (dir) => {
      await fs.rm(dir, { recursive: true });
    });
    await Promise.all(promises);
  }
}
