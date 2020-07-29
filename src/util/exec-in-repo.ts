import { ChildProcessPromise, spawn } from 'child-process-promise';
import { ChildProcess } from 'child_process';
import stringArgv from 'string-argv';
import { IRepo } from '../adapters/base';
import { IMigrationContext } from '../migration-context';


interface IExecRepoResult {
  promise: ChildProcessPromise;
  childProcess: ChildProcess;
}

export default async (
  context: IMigrationContext,
  repo: IRepo,
  command: string,
): Promise<IExecRepoResult> => {
  const repoDir = context.adapter.getRepoDir(repo);
  const dataDir = context.adapter.getDataDir(repo);
  const baseBranch = context.adapter.getBaseBranch(repo);
  const migrationDir = context.migration.migrationDirectory;
  const adapterEnvironmentVars = await context.adapter.getEnvironmentVariables(repo);

  const execOptions = {
    cwd: repoDir,
    env: {
      ...process.env,
      SHEPHERD_REPO_DIR: repoDir,
      SHEPHERD_DATA_DIR: dataDir,
      SHEPHERD_MIGRATION_DIR: migrationDir,
      SHEPHERD_BASE_BRANCH: baseBranch,
      ...adapterEnvironmentVars,
    },
    shell: true,
    capture: [ 'stdout', 'stderr' ],
  };
  const commandArgs = stringArgv(command);
  const promise = spawn(commandArgs[0], commandArgs.slice(1), execOptions) as ChildProcessPromise;
  return {
    promise,
    childProcess: promise.childProcess,
  };
};
