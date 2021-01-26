/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable prefer-const */

import fetch from 'node-fetch';
import {parseData} from "../shared/utils";
// @ts-ignore
// @ts-ignore

interface User {
    user: string;
    commits: number;
    additions: number;
    deletions: number;
}

class GetUsersLinuxService {
    private usersLocal: any;

    public async execute(graphVariables: object): Promise<any[]> {
        const graphQLQuery = `
query ($repoName: String!, $repoOwner: String!, $committerCursor: String) {
  repository(name: $repoName, owner: $repoOwner) {
    name
    defaultBranchRef {
      id
    }
    object(expression: "master") {
      ... on Commit {
        history(first: 100, after: $committerCursor, since: "2020-01-01T00:00:00Z", until: "2021-01-01T00:00:00Z") {
          pageInfo {
            endCursor
            hasNextPage
          }
          totalCount
          edges {
            cursor
            node {
              additions
              deletions
              committedDate
              author {
                user {
                  name
                  login
                }
              }
            }
          }
        }
      }
    }
  }
}
`;
        const results = await fetch('https://api.github.com/graphql', {
            method: 'POST',
            body: JSON.stringify({
                query: graphQLQuery,
                variables: graphVariables
            }),
            headers: {
                Authorization: `Bearer ${process.env.GITHUB_API_ACCESS_TOKEN || '45e83e91a57c07ec57bd554f4927c0d045435fae'}`,
            },
        }).then(res => res.text());
        return JSON.parse(results).data.repository.object.history;
    }

    public async getTotalCount(graphVariables: object): Promise<any> {
        let response: any = await this.execute(graphVariables)
        return await response.totalCount
    }

    public async parseData(graphVariables: object): Promise<any> {
        let response: any = await this.execute(graphVariables)
        const users: any = await parseData(response.edges);
        let usersLists: any = []
        users.data.forEach((userData: any) => {
            let node = userData.node;
            usersLists.push({
                cursor: userData.cursor,
                ...node.author.user,
                "additions": node.additions,
                "deletions": node.deletions,
                "committedDate": node.committedDate,
            })
        });
        return await usersLists;
    }
}

export default GetUsersLinuxService;
