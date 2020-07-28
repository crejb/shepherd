import { IMigrationContext } from '../migration-context';
import IRepoAdapter from './base';
import GithubAdapter from './github';
import BitbucketAdapter from './bitbucket'
import RepoListAdapter from './repo-list';

export function adapterForName(name: string, context: IMigrationContext): IRepoAdapter {
  switch (name) {
    case 'github':
      return new GithubAdapter(context);
    case 'bitbucket':
      return new BitbucketAdapter(context);
    case 'repoList':
        return new RepoListAdapter(context);
    default:
      throw new Error(`Unknown adapter: ${name}`);
  }
}
