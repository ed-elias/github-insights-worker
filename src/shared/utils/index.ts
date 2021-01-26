/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
interface INode {
    edges:Array<| {
        cursor: string | null;
        node: {
            author: {
                user: {
                    login: string;
                    name: string;
                } | null;
            } | null;
            committedDate: any;
            cursor: string
            additions: number;
            deletions: number;
        } | null
    } | undefined>;
}

export const parseData = async (
    edges: ReadonlyArray<{
        readonly cursor: string | null;
        readonly node: {
            readonly author: {
                readonly user: {
                    readonly login: string;
                    readonly name: string;
                } | null;
            } | null;
            readonly committedDate: any;
            readonly cursor: string
            readonly additions: number;
            readonly deletions: number;
        }| null
    }| null>,
) => {
    const { edges: parsedDNode }: INode = { edges: []};
    edges.forEach(el => {
        if (el) {
            parsedDNode.push(el);
        }
    });
    return { data: edges};
};
