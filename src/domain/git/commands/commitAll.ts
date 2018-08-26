import * as git from "isomorphic-git"
import { getStagingStatus } from "../queries/getStagingStatus"

export async function commitAll(
  root: string,
  message: string,
  author: { name: string; email: string }
): Promise<string> {
  const staging = await getStagingStatus(root)
  for (const filepath of Object.keys(staging)) {
    const status: any = staging[filepath]
    switch (status) {
      case "added":
      case "modified":
      case "*added":
      case "*modified": {
        await git.add({ dir: root, filepath })
        break
      }
      case "deleted":
      case "absent":
      case "*absent":
      case "*deleted": {
        await git.remove({ dir: root, filepath })
        break
      }
    }
  }

  return git.commit({
    dir: root,
    message,
    author
  })
}
