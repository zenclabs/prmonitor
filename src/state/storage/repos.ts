import { storage } from "./helper";

/**
 * Storage of the repos accessible by the user.
 */
export const repoListStorage = storage<RepoListStorage>("repos");

export interface RepoListStorage {
  timestamp: number;
  list: RepoSummary[];
}

export interface RepoSummary {
  owner: string;
  name: string;
}