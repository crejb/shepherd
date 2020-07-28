/* eslint-disable class-methods-use-this */
import _ from 'lodash';
import path from 'path';

import { IMigrationContext } from '../migration-context';
import { IEnvironmentVariables, IRepo } from './base';
import GitAdapter from './git';


class RepoListAdapter extends GitAdapter {

  constructor(migrationContext: IMigrationContext) {
    super(migrationContext);
    this.migrationContext = migrationContext;
  }

  public async getCandidateRepos(): Promise<IRepo[]> {
    // repos passed in from config is the actual list of repo urls
    const { repos }  = this.migrationContext.migration.spec.adapter;
    const repoUrls: string[] = repos;

    return _.uniq(repoUrls).map((r: string) => this.parseRepo(r));
  }

  public parseRepo(repo: string): IRepo {
    const parts: string[] = repo.split('/');
    if (!parts.length) {
      throw new Error(`Could not parse repo "${repo}"`);
    }
    return { url: repo, name: parts[parts.length - 1] };
  }

  public async mapRepoAfterCheckout(repo: Readonly<IRepo>): Promise<IRepo> {
    return repo;
  }

  public reposEqual(repo1: IRepo, repo2: IRepo): boolean {
    return repo1.url.toLowerCase() === repo2.url.toLowerCase();
  }

  public stringifyRepo({ url }: IRepo): string {
    return url;
  }

  public async resetRepoBeforeApply(repo: IRepo) {
    const defaultBranch = "master";
    // First, get any changes from the remote
    // --prune will ensure that any remote branch deletes are reflected here
    await this.git(repo).fetch(['origin', '--prune']);

    // Reset to the default branch
    await this.git(repo).reset(['--hard', `origin/${defaultBranch}`]);
  }

  public async pushRepo(repo: IRepo, force: boolean): Promise<void> {
    // First, get any changes from the remote
    // --prune will ensure that any remote branch deletes are reflected here
    await this.git(repo).fetch(['origin', '--prune']);
    await super.pushRepo(repo, force);
  }

  public async createPullRequest(repo: IRepo, message: string): Promise<void> {
    const { url } = repo;
    
    throw new Error(`PR not implemented yet! repo: ${url}, message: ${ message }`);
  }

  public async getPullRequestStatus(repo: IRepo): Promise<string[]> {
    const { url } = repo;
    
    throw new Error(`getPullRequestStatus not implemented yet! repo: ${url}`);
  }

  public getRepoDir(repo: IRepo): string {
    return path.join(this.migrationContext.migration.workingDirectory, 'repos', repo.name);
  }

  public getDataDir(repo: IRepo): string {
    return path.join(this.migrationContext.migration.workingDirectory, 'data', repo.name);
  }

  public getBaseBranch(repo: IRepo): string {
    return repo.defaultBranch;
  }

  public async getEnvironmentVariables(repo: IRepo): Promise<IEnvironmentVariables> {
    const superEnvVars = await super.getEnvironmentVariables(repo);

    return {
      ...superEnvVars,
      SHEPHERD_REPOLIST_REPO_NAME: repo.url
    };
  }

  protected getRepositoryUrl(repo: IRepo): string {
    return repo.url;
  }
}

export default RepoListAdapter;
